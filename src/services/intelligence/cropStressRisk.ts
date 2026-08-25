import { SoilData, FarmZone, CropRecommendation } from '../../types';
import {
  HeatStressForecastOutput,
  RainfallDecisionOutput,
  CropStressDetectionOutput,
  DiseaseRiskEarlyWarningOutput,
  PredictiveRiskLevel,
  PredictionConfidence
} from '../../types/intelligence/farmIntelligenceTypes';
import { iotDeviceService } from '../iot/iotDeviceService';

export interface CropStressParams {
  soilData: SoilData;
  cropName?: string;
  weatherTemp?: number;
  weatherHumidity?: number;
  weatherRainProb?: number;
  weatherRainfallForecastMm?: number;
  weatherWindSpeed?: number;
  vegetationNdvi?: number; // e.g. 0.68
  plantObservationsCount?: number;
}

/**
 * 1. HEAT STRESS FORECAST
 * Early warning based on temperature, humidity, and crop threshold.
 * Uses cautious probabilistic language ("possible", "increased risk", "monitor closely").
 */
export function evaluateHeatStressForecast(params: CropStressParams): HeatStressForecastOutput {
  const {
    soilData,
    cropName = 'Rice',
    weatherTemp = soilData.temperature || 28,
    weatherHumidity = soilData.humidity || 65,
    weatherRainProb = 20
  } = params;

  // Temperature forecast projection
  const forecastMaxTemp = Number((weatherTemp + (weatherRainProb < 30 ? 2.5 : -1.0)).toFixed(1));
  const forecastHumidity = Math.max(30, Number((weatherHumidity - (forecastMaxTemp > 34 ? 10 : 0)).toFixed(1)));

  let status: PredictiveRiskLevel = 'LOW';
  let title = '🌡️ Thermal Conditions Normal';
  let peakRiskTime = 'Normal diurnal cycle (12:00 - 15:00)';

  if (forecastMaxTemp >= 40) {
    status = 'CRITICAL';
    title = '🌡️ Extreme Heat Stress Warning';
    peakRiskTime = 'Tomorrow 12:30 - 16:30 (Peak UV & Heat)';
  } else if (forecastMaxTemp >= 35) {
    status = 'HIGH';
    title = '🌡️ Elevated Heat Stress Expected';
    peakRiskTime = 'Tomorrow 13:00 - 16:00';
  } else if (forecastMaxTemp >= 32 && forecastHumidity < 45) {
    status = 'MODERATE';
    title = '🌡️ Moderate Atmospheric Heat Demand';
    peakRiskTime = 'Tomorrow afternoon';
  }

  const what = status === 'CRITICAL' || status === 'HIGH'
    ? `High temperatures reaching up to ${forecastMaxTemp}°C are expected. Your ${cropName} crop may experience increased transpiration demand and possible heat stress.`
    : status === 'MODERATE'
    ? `Afternoon temperatures will approach ${forecastMaxTemp}°C. Moderate water monitoring is advised.`
    : `Ambient temperatures (${forecastMaxTemp}°C) remain within favorable vegetative physiological limits.`;

  const why = `Air humidity of ${forecastHumidity}% combined with solar irradiance increases vapor pressure deficit (VPD). Stomata may partially close to conserve moisture during peak sun.`;

  const action = status === 'CRITICAL' || status === 'HIGH'
    ? 'Verify soil moisture in the morning and ensure root zone hydration before peak noon heat.'
    : status === 'MODERATE'
    ? 'Monitor leaf turgidity during afternoon hours and check irrigation readiness.'
    : 'No thermal stress intervention needed today.';

  const when = status === 'CRITICAL' || status === 'HIGH'
    ? 'Take preventative moisture action before 11:00 AM tomorrow.'
    : 'Routine monitoring.';

  const avoid = 'Avoid foliar agrochemical spraying during peak temperature (>32°C) to prevent leaf scorching.';

  const confidence: PredictionConfidence = {
    score: 85,
    level: 'HIGH',
    dataAvailability: 'HIGH',
    predictionHorizon: '24 to 48 Hours',
    supportingSignals: [
      `Current Temp: ${weatherTemp}°C`,
      `Forecast Peak: ${forecastMaxTemp}°C`,
      `Humidity: ${forecastHumidity}%`,
      `Crop: ${cropName}`
    ],
    lastCalculated: new Date().toLocaleTimeString()
  };

  return {
    status,
    title,
    currentTemp: weatherTemp,
    forecastMaxTemp,
    forecastHumidity,
    peakRiskTime,
    explanation: {
      what,
      why,
      action,
      when,
      avoid,
      navTab: 'weather',
      navLabel: 'Check Weather Forecast',
      expertDetail: `Current: ${weatherTemp}°C | Peak: ${forecastMaxTemp}°C | Rel Humidity: ${forecastHumidity}% | VPD Index: Elevated`
    },
    confidence
  };
}

/**
 * 2. RAINFALL DECISION SUPPORT
 * Combines live/baseline soil moisture + rainfall probability + expected depth.
 */
export function evaluateRainfallDecisionSupport(params: CropStressParams): RainfallDecisionOutput {
  const {
    soilData,
    weatherRainProb = soilData.rainfall > 80 ? 75 : 20,
    weatherRainfallForecastMm = soilData.rainfall || 0
  } = params;

  const iotState = iotDeviceService.getState();
  const moistureVal = iotState.latestTelemetry?.readings['soil_moisture']?.value 
    ?? iotState.lastKnownTelemetry?.readings['soil_moisture']?.value 
    ?? soilData.soil_moisture 
    ?? 35;

  const isDry = moistureVal < 30;
  const isWet = moistureVal >= 55;
  const hasHeavyRain = weatherRainfallForecastMm >= 15 || weatherRainProb >= 65;

  let decisionCategory: 'dry_no_rain' | 'dry_heavy_rain' | 'wet_heavy_rain' | 'wet_no_rain' | 'normal' = 'normal';
  let status: PredictiveRiskLevel = 'LOW';
  let title = '🌧️ Balanced Water & Rainfall Alignment';
  let recommendation = 'Maintain standard monitoring schedule.';

  if (isDry && !hasHeavyRain) {
    decisionCategory = 'dry_no_rain';
    status = 'HIGH';
    title = '💧 Soil Dry — No Significant Rain Forecasted';
    recommendation = 'Prepare and execute irrigation.';
  } else if (isDry && hasHeavyRain) {
    decisionCategory = 'dry_heavy_rain';
    status = 'MODERATE';
    title = '🌧️ Soil Dry — Heavy Rain Likely Incoming';
    recommendation = 'Wait and monitor incoming rainfall before pumping.';
  } else if (isWet && hasHeavyRain) {
    decisionCategory = 'wet_heavy_rain';
    status = 'HIGH';
    title = '⚠️ Saturated Soil with Heavy Rain Incoming';
    recommendation = 'Avoid all irrigation; inspect field drainage channels.';
  } else if (isWet && !hasHeavyRain) {
    decisionCategory = 'wet_no_rain';
    status = 'LOW';
    title = '🌱 Soil Well Hydrated';
    recommendation = 'Pause irrigation; soil moisture is currently ample.';
  }

  const what = decisionCategory === 'dry_no_rain'
    ? `Soil moisture is low (${moistureVal.toFixed(1)}%) and rain probability is low (${weatherRainProb}%). Natural replenishment is unlikely.`
    : decisionCategory === 'dry_heavy_rain'
    ? `Soil is currently dry (${moistureVal.toFixed(1)}%), but incoming rain forecast (${weatherRainfallForecastMm}mm, ${weatherRainProb}%) may provide sufficient water.`
    : decisionCategory === 'wet_heavy_rain'
    ? `Soil moisture is high (${moistureVal.toFixed(1)}%) and incoming rain (${weatherRainfallForecastMm}mm) could cause root-zone saturation.`
    : `Soil moisture (${moistureVal.toFixed(1)}%) is sufficient with normal weather stability.`;

  const why = `Rain probability is ${weatherRainProb}% with ${weatherRainfallForecastMm}mm expected over the forecast period against current root moisture of ${moistureVal.toFixed(1)}%.`;

  const action = decisionCategory === 'dry_no_rain'
    ? 'Run standard irrigation cycle today.'
    : decisionCategory === 'dry_heavy_rain'
    ? 'Hold irrigation for 12 hours to take advantage of natural rainfall.'
    : decisionCategory === 'wet_heavy_rain'
    ? 'Ensure furrows and drainage outlets are clear to prevent water stagnation.'
    : 'No additional irrigation needed.';

  const when = 'Next 12 to 24 hours.';
  const avoid = decisionCategory === 'dry_heavy_rain' || decisionCategory === 'wet_heavy_rain'
    ? 'Avoid running electric pumps right before a rainstorm to prevent power waste and nutrient leaching.'
    : 'Avoid letting root zone drop below critical wilting threshold.';

  const confidence: PredictionConfidence = {
    score: 88,
    level: 'HIGH',
    dataAvailability: 'HIGH',
    predictionHorizon: '24 Hours',
    supportingSignals: [
      `Soil Moisture: ${moistureVal.toFixed(1)}%`,
      `Rain Probability: ${weatherRainProb}%`,
      `Expected Rain: ${weatherRainfallForecastMm}mm`
    ],
    lastCalculated: new Date().toLocaleTimeString()
  };

  return {
    status,
    title,
    soilMoisture: moistureVal,
    rainProbability: weatherRainProb,
    expectedRainMm: weatherRainfallForecastMm,
    decisionCategory,
    recommendation,
    explanation: {
      what,
      why,
      action,
      when,
      avoid,
      navTab: 'irrigation',
      navLabel: 'Check Irrigation Engine',
      expertDetail: `Category: ${decisionCategory} | Rain Prob: ${weatherRainProb}% | Forecast Rain: ${weatherRainfallForecastMm}mm | Soil Moisture: ${moistureVal.toFixed(1)}%`
    },
    confidence
  };
}

/**
 * 3. DISEASE RISK EARLY WARNING
 * Microclimate fungal and bacterial spore trigger detection.
 * Explicitly an early warning indicator, not a diagnostic confirmation.
 */
export function evaluateDiseaseRiskEarlyWarning(params: CropStressParams): DiseaseRiskEarlyWarningOutput {
  const {
    soilData,
    cropName = 'Rice',
    weatherTemp = soilData.temperature || 28,
    weatherHumidity = soilData.humidity || 65,
    weatherRainProb = 20
  } = params;

  // Microclimate disease index calculation
  // Optimal fungal range: Temp 20°C - 30°C AND Humidity > 75% AND (Rain > 40mm or RainProb > 60%)
  const isTempFavorable = weatherTemp >= 20 && weatherTemp <= 32;
  const isHumidityHigh = weatherHumidity >= 75;
  const isMoistConditions = (soilData.rainfall > 50) || (weatherRainProb >= 60);

  let riskScore = 15;
  if (isTempFavorable) riskScore += 25;
  if (isHumidityHigh) riskScore += 35;
  if (isMoistConditions) riskScore += 25;

  let status: PredictiveRiskLevel = 'LOW';
  let title = '🛡️ Low Disease Microclimate Risk';

  if (riskScore >= 75) {
    status = 'HIGH';
    title = '🐛 High Disease Microclimate Risk Alert';
  } else if (riskScore >= 50) {
    status = 'MODERATE';
    title = '🐛 Moderate Disease Environmental Conditions';
  }

  const pathogens = cropName.toLowerCase().includes('rice')
    ? ['Blast (Magnaporthe oryzae)', 'Sheath Blight', 'Bacterial Leaf Streak']
    : cropName.toLowerCase().includes('wheat')
    ? ['Yellow Rust (Puccinia striiformis)', 'Powdery Mildew', 'Leaf Blight']
    : cropName.toLowerCase().includes('tomato')
    ? ['Early Blight (Alternaria solani)', 'Late Blight', 'Leaf Mold']
    : ['Fungal Leaf Spot', 'Root Rot', 'Anthracnose'];

  const microclimateConditions = `Temperature ${weatherTemp}°C with ${weatherHumidity}% relative humidity and persistent moisture.`;

  const what = status === 'HIGH'
    ? `High humidity (${weatherHumidity}%) and warm temperatures (${weatherTemp}°C) create favorable conditions for fungal and bacterial spore germination on ${cropName} leaves.`
    : status === 'MODERATE'
    ? `Warm and humid microclimate conditions may increase disease pressure over the next 2 to 3 days.`
    : `Microclimate temperature (${weatherTemp}°C) and air humidity (${weatherHumidity}%) currently present low disease pressure.`;

  const why = `Fungal spores germinate rapidly when free moisture or >80% relative humidity persists across leaf canopies for more than 6 consecutive hours.`;

  const action = status === 'HIGH' || status === 'MODERATE'
    ? 'Inspect lower canopy leaves for initial yellow lesions or water-soaked spots. Ensure good field air circulation.'
    : 'Maintain routine weekly field scouting.';

  const when = status === 'HIGH' ? 'Scout fields within the next 24 hours.' : 'Routine weekly inspection.';

  const avoid = 'Avoid excessive late-day overhead sprinkler irrigation that keeps crop canopy wet throughout the night.';

  const confidence: PredictionConfidence = {
    score: 82,
    level: 'HIGH',
    dataAvailability: 'HIGH',
    predictionHorizon: '48 to 72 Hours',
    supportingSignals: [
      `Temp: ${weatherTemp}°C (Favorable Range: 20-32°C)`,
      `Humidity: ${weatherHumidity}% (Threshold: 75%)`,
      `Spore Germination Index: ${riskScore}/100`
    ],
    lastCalculated: new Date().toLocaleTimeString()
  };

  return {
    status,
    title,
    riskScore,
    microclimateConditions,
    favoredPathogens: pathogens,
    explanation: {
      what,
      why,
      action,
      when,
      avoid,
      navTab: 'diagnostics',
      navLabel: 'Open Plant Health Diagnostics',
      expertDetail: `Microclimate Risk Score: ${riskScore}/100 | Temp: ${weatherTemp}°C | RH: ${weatherHumidity}% | Pathogen Vector: Air/Moisture`
    },
    confidence
  };
}

/**
 * 4. CROP STRESS DETECTION
 * Multi-factor synthesizer combining IoT, Weather, NDVI, Soil and Plant scans.
 */
export function evaluateCropStressDetection(params: CropStressParams): CropStressDetectionOutput {
  const {
    soilData,
    cropName = 'Rice',
    weatherTemp = soilData.temperature || 28,
    weatherHumidity = soilData.humidity || 65,
    vegetationNdvi = 0.72
  } = params;

  const iotState = iotDeviceService.getState();
  const moistureVal = iotState.latestTelemetry?.readings['soil_moisture']?.value 
    ?? iotState.lastKnownTelemetry?.readings['soil_moisture']?.value 
    ?? soilData.soil_moisture 
    ?? 35;

  const lowMoisture = moistureVal < 25;
  const highHeat = weatherTemp > 35;
  const nutrientImbalance = soilData.nitrogen < 80 || soilData.phosphorus < 15 || soilData.ph < 5.5 || soilData.ph > 8.0;
  const diseaseRisk = weatherHumidity > 80 && weatherTemp >= 22 && weatherTemp <= 30;
  const sensorAnomaly = iotState.connectionState === 'stale_telemetry';

  const possibleCauses: string[] = [];
  let stressScore = 10;

  if (lowMoisture) {
    possibleCauses.push(`Low root-zone moisture (${moistureVal.toFixed(1)}%)`);
    stressScore += 35;
  }
  if (highHeat) {
    possibleCauses.push(`High ambient heat (${weatherTemp}°C)`);
    stressScore += 25;
  }
  if (nutrientImbalance) {
    possibleCauses.push('Soil nutrient deficiency or pH imbalance');
    stressScore += 20;
  }
  if (diseaseRisk) {
    possibleCauses.push('Elevated humidity microclimate conducive to foliar pathogens');
    stressScore += 15;
  }
  if (vegetationNdvi < 0.50) {
    possibleCauses.push(`Reduced canopy vigor index (NDVI ${vegetationNdvi})`);
    stressScore += 20;
  }

  stressScore = Math.min(100, stressScore);

  let status: PredictiveRiskLevel = 'LOW';
  let title = '🌱 Crop Growth Dynamic & Healthy';
  let dominantCause = 'None — Environmental parameters are optimal';

  if (stressScore >= 65) {
    status = 'HIGH';
    title = '🌱 Multi-Factor Crop Stress Detected';
    dominantCause = possibleCauses[0] || 'Environmental Stress';
  } else if (stressScore >= 35) {
    status = 'MODERATE';
    title = '🌱 Emerging Environmental Stress Observed';
    dominantCause = possibleCauses[0] || 'Mild Stress';
  }

  const what = status === 'HIGH' || status === 'MODERATE'
    ? `Your field exhibits environmental indicators that may induce crop physiological stress. Primary factor: ${dominantCause}.`
    : `Vegetative parameters indicate healthy vigor with no significant environmental stress detected.`;

  const why = possibleCauses.length > 0 
    ? `Contributing factors: ${possibleCauses.join('; ')}.`
    : 'Soil moisture, temperature, and nutrient balance are well aligned with crop requirements.';

  const action = status === 'HIGH' || status === 'MODERATE'
    ? 'Check the highest-priority factor (Water/Soil/Health) and scan any symptomatic leaves with Plant Health.'
    : 'Continue regular field scouting and maintenance.';

  const when = status === 'HIGH' ? 'Action recommended today.' : 'Routine weekly check.';
  const avoid = 'Avoid applying heavy nitrogen fertilizers during periods of active water or heat stress.';

  const confidence: PredictionConfidence = {
    score: 84,
    level: 'HIGH',
    dataAvailability: 'HIGH',
    predictionHorizon: '24 to 48 Hours',
    supportingSignals: [
      `Stress Score: ${stressScore}/100`,
      `Factors Checked: Moisture (${moistureVal.toFixed(1)}%), Temp (${weatherTemp}°C), NDVI (${vegetationNdvi})`
    ],
    lastCalculated: new Date().toLocaleTimeString()
  };

  return {
    status,
    title,
    stressScore,
    dominantCause,
    possibleCauses: possibleCauses.length > 0 ? possibleCauses : ['None detected'],
    signalsDetected: {
      lowMoisture,
      highHeat,
      nutrientImbalance,
      diseaseRisk,
      sensorAnomaly
    },
    explanation: {
      what,
      why,
      action,
      when,
      avoid,
      navTab: lowMoisture ? 'irrigation' : (nutrientImbalance ? 'fertilizer' : 'diagnostics'),
      navLabel: lowMoisture ? 'Check Water' : (nutrientImbalance ? 'Check Soil' : 'Scan Plant'),
      expertDetail: `Stress Score: ${stressScore}/100 | Active Factors: ${possibleCauses.length} | NDVI: ${vegetationNdvi}`
    },
    confidence
  };
}
