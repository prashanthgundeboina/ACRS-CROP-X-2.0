import { SoilData, FarmZone, CropRecommendation } from '../../types';
import { 
  PredictiveWaterRiskOutput, 
  PredictiveRiskLevel, 
  PredictionConfidence 
} from '../../types/intelligence/farmIntelligenceTypes';
import { 
  evaluateIrrigationDecision, 
  SOIL_HYDROLOGY, 
  CROP_KC_TABLE 
} from '../irrigationEngine';
import { iotDeviceService } from '../iot/iotDeviceService';

export interface WaterRiskEvaluationParams {
  soilData: SoilData;
  cropName?: string;
  weatherTemp?: number;
  weatherHumidity?: number;
  weatherWindSpeed?: number;
  weatherRainProb?: number;
  weatherRainfallForecastMm?: number;
  areaHa?: number;
  farmZones?: FarmZone[];
}

export function evaluatePredictiveWaterRisk(params: WaterRiskEvaluationParams): PredictiveWaterRiskOutput {
  const {
    soilData,
    cropName = 'Rice',
    weatherTemp = soilData.temperature || 28,
    weatherHumidity = soilData.humidity || 65,
    weatherWindSpeed = soilData.wind_speed || 12,
    weatherRainProb = soilData.rainfall > 80 ? 70 : 20,
    weatherRainfallForecastMm = soilData.rainfall || 0,
    areaHa = 1.5,
    farmZones = []
  } = params;

  // 1. Fetch current live moisture or baseline
  const iotState = iotDeviceService.getState();
  const liveReading = iotState.latestTelemetry?.readings['soil_moisture']?.value;
  const lastKnown = iotState.lastKnownTelemetry?.readings['soil_moisture']?.value;
  const currentMoisture = (liveReading !== undefined) 
    ? liveReading 
    : (lastKnown !== undefined ? lastKnown : (soilData.soil_moisture || 35));

  // 2. Soil hydrology constants
  const soilTypeKey = (soilData.soil_type >= 1 && soilData.soil_type <= 4) ? soilData.soil_type : 2;
  const hydro = SOIL_HYDROLOGY[soilTypeKey] || SOIL_HYDROLOGY[2];
  const fieldCapacity = hydro.fieldCapacity;
  const wiltingPoint = hydro.wiltingPoint;

  // 3. Reuse existing FAO-56 irrigation calculation
  const irrigationEval = evaluateIrrigationDecision({
    soilData: { ...soilData, soil_moisture: currentMoisture },
    cropName,
    weatherTemp,
    weatherHumidity,
    weatherWindSpeed,
    weatherRainProb,
    weatherRainfallForecastMm,
    areaHa,
    zoneName: farmZones[0]?.name || 'Main Field'
  });

  // 4. Calculate Hourly Evapotranspiration (ET0) & Depletion rate
  const et0Daily = irrigationEval.evapotranspirationMmDay || 4.2; // mm/day
  const cropLower = cropName.toLowerCase();
  const kcData = CROP_KC_TABLE[cropLower] || CROP_KC_TABLE['wheat'] || { initial: 0.5, mid: 1.1, end: 0.6, rootDepthCm: 50 };
  const kc = irrigationEval.cropCoefficientKc || kcData.mid;
  const etcDaily = et0Daily * kc; // mm/day crop water use

  // Depletion rate in % moisture loss per daylight hour (assuming 12 active hours)
  // Conversion: 1mm evapotranspiration from a 50cm root zone in loamy soil = approx ~0.20% volumetric moisture loss
  const rootDepth = kcData.rootDepthCm || 50;
  const moistureLossPerMm = 100 / (rootDepth * 10); // % per mm in root column
  const depletionRatePerHour = Math.max(0.1, Number(((etcDaily / 14) * moistureLossPerMm).toFixed(2))); // %/hr

  // 5. Calculate Time to Critical Wilting Deficit
  const availableMoistureAboveWilting = Math.max(0, currentMoisture - wiltingPoint);
  let hoursToWiltingDeficit: number | null = null;
  if (depletionRatePerHour > 0) {
    hoursToWiltingDeficit = Math.round(availableMoistureAboveWilting / depletionRatePerHour);
  }

  // 6. Evaluate Predictive Risk Level
  let status: PredictiveRiskLevel = 'LOW';
  let title = '💧 Water Status Optimal';
  let historicalTrend: 'dropping_fast' | 'dropping_steady' | 'stable' | 'increasing' = 'dropping_steady';
  let rainImpact = 'No significant rain expected to replenish soil.';

  if (weatherRainfallForecastMm >= 20 || weatherRainProb >= 70) {
    rainImpact = `Expected rainfall (${weatherRainfallForecastMm}mm, ${weatherRainProb}% probability) may replenish root zone.`;
  }

  if (currentMoisture <= wiltingPoint + 4) {
    status = 'CRITICAL';
    title = '💧 Critical Water Deficit Imminent';
    historicalTrend = 'dropping_fast';
  } else if (currentMoisture < 28 || (hoursToWiltingDeficit !== null && hoursToWiltingDeficit <= 18 && weatherRainProb < 40)) {
    status = 'HIGH';
    title = '💧 Field May Become Critically Dry';
    historicalTrend = 'dropping_fast';
  } else if (currentMoisture < 38 || (hoursToWiltingDeficit !== null && hoursToWiltingDeficit <= 36)) {
    status = 'MODERATE';
    title = '💧 Moisture Declining Steadily';
    historicalTrend = 'dropping_steady';
  } else {
    status = 'LOW';
    title = '💧 Soil Moisture Well Balanced';
    historicalTrend = currentMoisture > fieldCapacity ? 'increasing' : 'stable';
  }

  // 7. Formulate 5-Part Farmer Explanation
  const what = status === 'CRITICAL' 
    ? `Root zone moisture is at ${currentMoisture.toFixed(1)}%, dangerously close to the crop wilting point (${wiltingPoint}%).`
    : status === 'HIGH'
    ? `Current moisture is ${currentMoisture.toFixed(1)}% and is falling steadily at ~${depletionRatePerHour}%/hr. ${rainImpact}`
    : status === 'MODERATE'
    ? `Moisture is ${currentMoisture.toFixed(1)}% (Target: ${fieldCapacity}%). Under current temperature (${weatherTemp}°C), soil is gradually drying.`
    : `Soil moisture (${currentMoisture.toFixed(1)}%) is sufficient for ${cropName} vegetative growth.`;

  const why = `Evapotranspiration rate is ${etcDaily.toFixed(1)} mm/day due to ${weatherTemp}°C temperatures and ${weatherHumidity}% humidity. Root zone depth is ${rootDepth}cm.`;

  const action = status === 'CRITICAL' || status === 'HIGH'
    ? (weatherRainProb >= 65 && weatherRainfallForecastMm >= 15 
        ? 'Hold full irrigation and monitor incoming rain over next 4 hours.' 
        : `Check irrigation pump. Recommended supply: ${irrigationEval.netIrrigationDeficitMm || 18}mm depth.`)
    : status === 'MODERATE'
    ? 'Plan your next irrigation run for late afternoon or early morning.'
    : 'Maintain routine moisture monitoring. No additional water required today.';

  const when = status === 'CRITICAL'
    ? 'Within the next 2 to 4 hours.'
    : status === 'HIGH'
    ? 'Before sunset or early tomorrow morning.'
    : status === 'MODERATE'
    ? 'Next 24 to 36 hours.'
    : 'Routine check in 48 hours.';

  const avoid = status === 'CRITICAL' || status === 'HIGH'
    ? 'Avoid midday watering during peak heat (>34°C) to prevent severe evaporation losses.'
    : 'Avoid over-saturating fields if heavy rainfall is forecasted.';

  const confidence: PredictionConfidence = {
    score: iotState.connectionState === 'receiving_data' ? 92 : (lastKnown ? 75 : 60),
    level: iotState.connectionState === 'receiving_data' ? 'HIGH' : (lastKnown ? 'MODERATE' : 'LOW'),
    dataAvailability: iotState.connectionState === 'receiving_data' ? 'HIGH' : (lastKnown ? 'MODERATE' : 'LOW'),
    predictionHorizon: '24 to 72 Hours',
    supportingSignals: [
      `Soil Moisture: ${currentMoisture.toFixed(1)}%`,
      `Depletion: ~${depletionRatePerHour}%/hr`,
      `Crop Kc: ${kc}`,
      `ET0: ${et0Daily.toFixed(1)} mm/day`,
      `Rain Prob: ${weatherRainProb}%`
    ],
    lastCalculated: new Date().toLocaleTimeString()
  };

  return {
    status,
    title,
    currentMoisture,
    depletionRatePerHour,
    hoursToWiltingDeficit,
    wiltingPoint,
    fieldCapacity,
    explanation: {
      what,
      why,
      action,
      when,
      avoid,
      navTab: 'irrigation',
      navLabel: 'Open Precision Irrigation AI',
      expertDetail: `ETc: ${etcDaily.toFixed(1)} mm/day | Depletion: ${depletionRatePerHour}%/hr | Wilting Point: ${wiltingPoint}% | Wilting in: ~${hoursToWiltingDeficit ?? 'N/A'} hrs`
    },
    historicalTrend,
    rainForecastImpact: rainImpact,
    confidence
  };
}
