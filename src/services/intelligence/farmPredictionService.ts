import { SoilData, FarmZone, CropRecommendation } from '../../types';
import {
  OverallFarmIntelligence,
  DigitalTwinZone,
  PredictiveTimelinePoint,
  FarmWhatIfScenario,
  WhatIfSimulationResult,
  IrrigationVerificationResult,
  PredictionConfidence,
  PredictiveRiskLevel
} from '../../types/intelligence/farmIntelligenceTypes';
import { iotDeviceService } from '../iot/iotDeviceService';
import { detectSensorAnomalies, recordTelemetryForAnomalyTracking } from './sensorAnomalyDetection';
import { evaluatePredictiveWaterRisk } from './predictiveWaterRisk';
import {
  evaluateHeatStressForecast,
  evaluateRainfallDecisionSupport,
  evaluateDiseaseRiskEarlyWarning,
  evaluateCropStressDetection
} from './cropStressRisk';

const IRRIGATION_VERIFICATION_KEY = 'croperx_irrigation_verification_record';

export interface EvaluateFarmIntelligenceParams {
  soilData: SoilData;
  farmZones?: FarmZone[];
  weatherTemp?: number;
  weatherHumidity?: number;
  weatherWindSpeed?: number;
  weatherRainProb?: number;
  weatherRainfallForecastMm?: number;
  cropName?: string;
  recommendations?: CropRecommendation[];
  vegetationNdvi?: number;
}

export class FarmPredictionService {
  /**
   * Evaluates the complete Smart Farm Digital Twin & Predictive Intelligence Layer.
   */
  public evaluateIntelligence(params: EvaluateFarmIntelligenceParams): OverallFarmIntelligence {
    const {
      soilData,
      farmZones = [],
      weatherTemp = soilData.temperature || 28,
      weatherHumidity = soilData.humidity || 65,
      weatherWindSpeed = soilData.wind_speed || 12,
      weatherRainProb = soilData.rainfall > 80 ? 70 : 20,
      weatherRainfallForecastMm = soilData.rainfall || 0,
      cropName = 'Rice',
      vegetationNdvi = 0.72
    } = params;

    // 1. Run and feed Telemetry into Anomaly Tracker
    const iotState = iotDeviceService.getState();
    if (iotState.latestTelemetry) {
      recordTelemetryForAnomalyTracking(iotState.latestTelemetry);
    }
    const sensorAnomaly = detectSensorAnomalies();

    // 2. Predictive Water Risk
    const waterRisk = evaluatePredictiveWaterRisk({
      soilData,
      cropName,
      weatherTemp,
      weatherHumidity,
      weatherWindSpeed,
      weatherRainProb,
      weatherRainfallForecastMm,
      farmZones
    });

    // 3. Heat Stress Forecast
    const heatRisk = evaluateHeatStressForecast({
      soilData,
      cropName,
      weatherTemp,
      weatherHumidity,
      weatherRainProb,
      weatherRainfallForecastMm
    });

    // 4. Rainfall Decision Support
    const rainfallDecision = evaluateRainfallDecisionSupport({
      soilData,
      cropName,
      weatherTemp,
      weatherHumidity,
      weatherRainProb,
      weatherRainfallForecastMm
    });

    // 5. Disease Risk Early Warning
    const diseaseRisk = evaluateDiseaseRiskEarlyWarning({
      soilData,
      cropName,
      weatherTemp,
      weatherHumidity,
      weatherRainProb
    });

    // 6. Multi-factor Crop Stress
    const cropStress = evaluateCropStressDetection({
      soilData,
      cropName,
      weatherTemp,
      weatherHumidity,
      vegetationNdvi
    });

    // 7. Digital Twin Zones Builder
    const digitalTwinZones = this.buildDigitalTwinZones(
      farmZones,
      soilData,
      cropName,
      waterRisk.currentMoisture,
      weatherTemp,
      weatherHumidity,
      weatherRainProb,
      vegetationNdvi
    );

    // 8. Predictive Timeline Forward Projection (NOW, 6h, 12h, 24h, 3d)
    const timeline = this.buildPredictiveTimeline(
      waterRisk.currentMoisture,
      waterRisk.depletionRatePerHour,
      weatherTemp,
      weatherRainfallForecastMm,
      weatherRainProb,
      waterRisk.wiltingPoint
    );

    // 9. Irrigation Verification Check
    const irrigationVerification = this.getIrrigationVerification(waterRisk.currentMoisture);

    // 10. Overall Confidence & Data Sufficiency Notice
    const hasLiveSensors = iotState.connectionState === 'receiving_data';
    const hasCachedSensors = !!iotState.lastKnownTelemetry;
    
    let confidenceScore = 65;
    if (hasLiveSensors) confidenceScore += 25;
    else if (hasCachedSensors) confidenceScore += 10;
    if (farmZones.length > 0) confidenceScore += 10;

    confidenceScore = Math.min(96, confidenceScore);
    const overallConfidenceLevel = confidenceScore >= 80 ? 'HIGH' : (confidenceScore >= 60 ? 'MODERATE' : 'LOW');

    const dataSufficiencyNotice = !hasLiveSensors && !hasCachedSensors
      ? 'Note: Real-time predictions are using agronomic field baselines. Connecting an ESP32 sensor adds physical live calibration.'
      : null;

    return {
      timestamp: new Date().toLocaleTimeString(),
      digitalTwinZones,
      waterRisk,
      heatRisk,
      rainfallDecision,
      cropStress,
      diseaseRisk,
      sensorAnomaly,
      irrigationVerification,
      timeline,
      overallPredictionConfidence: {
        score: confidenceScore,
        level: overallConfidenceLevel,
        dataAvailability: hasLiveSensors ? 'HIGH' : (hasCachedSensors ? 'MODERATE' : 'LOW'),
        predictionHorizon: '72 Hours Forward',
        supportingSignals: [
          `Soil Moisture: ${waterRisk.currentMoisture.toFixed(1)}%`,
          `Sensor State: ${iotState.connectionState}`,
          `ET0 Model: Active`,
          `Weather Radar: Connected`,
          `Zones: ${digitalTwinZones.length} Tracked`
        ],
        lastCalculated: new Date().toLocaleTimeString()
      },
      dataSufficiencyNotice
    };
  }

  /**
   * Build Digital Twin Zone Models
   */
  private buildDigitalTwinZones(
    farmZones: FarmZone[],
    soilData: SoilData,
    primaryCrop: string,
    currentMoisture: number,
    weatherTemp: number,
    weatherHumidity: number,
    weatherRainProb: number,
    ndviBase: number
  ): DigitalTwinZone[] {
    const iotState = iotDeviceService.getState();
    const sensorStatus = iotState.connectionState === 'receiving_data'
      ? 'Live Connected'
      : (iotState.lastKnownTelemetry ? 'Cached Telemetry' : 'Virtual Model');

    if (farmZones.length > 0) {
      return farmZones.map((z, idx) => {
        const zoneMoisture = z.moisture || (currentMoisture + (idx === 0 ? 0 : (idx % 2 === 1 ? -4.5 : 3.2)));
        const clampedMoisture = Math.max(10, Math.min(85, zoneMoisture));
        const moistureStatus = clampedMoisture < 22 
          ? 'critical_dry' 
          : clampedMoisture < 32 
          ? 'dry' 
          : clampedMoisture > 65 
          ? 'saturated' 
          : 'optimal';

        const riskStatus: PredictiveRiskLevel = moistureStatus === 'critical_dry'
          ? 'CRITICAL'
          : (moistureStatus === 'dry' ? 'HIGH' : 'LOW');

        return {
          id: z.id,
          name: z.name || `Zone ${idx + 1}`,
          areaHa: z.areaHa || 1.0,
          assignedCrop: z.assignedCrop || primaryCrop,
          growthStage: 'Mid Vegetative',
          growthStageProgress: 55 + (idx * 5) % 30,
          soilType: z.soilType || 'Alluvial Loam',
          soilCondition: {
            nitrogen: z.nitrogen || soilData.nitrogen,
            phosphorus: soilData.phosphorus,
            potassium: soilData.potassium,
            ph: z.ph || soilData.ph,
            ec: 1.2,
            organicMatter: soilData.organic_matter || 2.4
          },
          moisture: Number(clampedMoisture.toFixed(1)),
          moistureStatus,
          weatherContext: {
            temp: weatherTemp,
            humidity: weatherHumidity,
            rainProb: weatherRainProb
          },
          vegetationHealth: clampedMoisture < 25 ? 'Emerging Stress' : 'Vibrant Canopy',
          vegetationNdvi: Number(Math.max(0.3, ndviBase - (clampedMoisture < 25 ? 0.15 : 0)).toFixed(2)),
          irrigationStatus: clampedMoisture < 30 ? 'Irrigation Recommended' : 'Optimal',
          sensorStatus,
          riskStatus,
          riskSummary: clampedMoisture < 30 ? 'Moisture deficit observed. Irrigation advised.' : 'Healthy canopy and balanced root zone.'
        };
      });
    }

    // Default 3 Zone Digital Twin Representation
    const defaultZones: DigitalTwinZone[] = [
      {
        id: 'zone-north',
        name: 'North Field (Main Acreage)',
        areaHa: 2.2,
        assignedCrop: primaryCrop,
        growthStage: 'Active Tillering',
        growthStageProgress: 45,
        soilType: 'Alluvial Loam',
        soilCondition: {
          nitrogen: soilData.nitrogen,
          phosphorus: soilData.phosphorus,
          potassium: soilData.potassium,
          ph: soilData.ph,
          ec: 1.2,
          organicMatter: 2.5
        },
        moisture: Number(currentMoisture.toFixed(1)),
        moistureStatus: currentMoisture < 25 ? 'dry' : 'optimal',
        weatherContext: { temp: weatherTemp, humidity: weatherHumidity, rainProb: weatherRainProb },
        vegetationHealth: currentMoisture < 25 ? 'Emerging Stress' : 'Vibrant Canopy',
        vegetationNdvi: Number(ndviBase.toFixed(2)),
        irrigationStatus: currentMoisture < 30 ? 'Irrigation Recommended' : 'Optimal',
        sensorStatus,
        riskStatus: currentMoisture < 25 ? 'HIGH' : 'LOW',
        riskSummary: currentMoisture < 25 ? 'Root moisture drying quickly.' : 'All biological indicators optimal.'
      },
      {
        id: 'zone-south',
        name: 'South Parcel (Terrace)',
        areaHa: 1.5,
        assignedCrop: primaryCrop,
        growthStage: 'Vegetative Canopy',
        growthStageProgress: 52,
        soilType: 'Loamy Clay',
        soilCondition: {
          nitrogen: Math.max(70, soilData.nitrogen - 15),
          phosphorus: soilData.phosphorus,
          potassium: soilData.potassium,
          ph: 6.8,
          ec: 1.4,
          organicMatter: 2.8
        },
        moisture: Number(Math.max(15, currentMoisture - 5.2).toFixed(1)),
        moistureStatus: (currentMoisture - 5.2) < 22 ? 'critical_dry' : ((currentMoisture - 5.2) < 30 ? 'dry' : 'optimal'),
        weatherContext: { temp: weatherTemp + 1, humidity: weatherHumidity - 3, rainProb: weatherRainProb },
        vegetationHealth: (currentMoisture - 5.2) < 25 ? 'Emerging Stress' : 'Moderate Vigor',
        vegetationNdvi: Number((ndviBase - 0.08).toFixed(2)),
        irrigationStatus: (currentMoisture - 5.2) < 30 ? 'Irrigation Recommended' : 'Optimal',
        sensorStatus,
        riskStatus: (currentMoisture - 5.2) < 22 ? 'CRITICAL' : ((currentMoisture - 5.2) < 30 ? 'HIGH' : 'LOW'),
        riskSummary: (currentMoisture - 5.2) < 25 ? 'Terrace slope increases drainage rate.' : 'Good crop stand.'
      },
      {
        id: 'zone-east',
        name: 'East Drip Row (Intensive)',
        areaHa: 0.8,
        assignedCrop: primaryCrop,
        growthStage: 'Flowering & Grain Fill',
        growthStageProgress: 68,
        soilType: 'Sandy Loam',
        soilCondition: {
          nitrogen: soilData.nitrogen + 20,
          phosphorus: soilData.phosphorus + 5,
          potassium: soilData.potassium + 10,
          ph: 6.5,
          ec: 1.1,
          organicMatter: 3.1
        },
        moisture: Number(Math.min(65, currentMoisture + 4.8).toFixed(1)),
        moistureStatus: 'optimal',
        weatherContext: { temp: weatherTemp, humidity: weatherHumidity, rainProb: weatherRainProb },
        vegetationHealth: 'Vibrant Canopy',
        vegetationNdvi: Number(Math.min(0.88, ndviBase + 0.05).toFixed(2)),
        irrigationStatus: 'Optimal',
        sensorStatus,
        riskStatus: 'LOW',
        riskSummary: 'Drip lines maintaining uniform root saturation.'
      }
    ];

    return defaultZones;
  }

  /**
   * Forward Predictive Timeline Projections (NOW, 6h, 12h, 24h, 3d)
   */
  private buildPredictiveTimeline(
    currentMoisture: number,
    depletionRatePerHour: number,
    temp: number,
    rainMm: number,
    rainProb: number,
    wiltingPoint: number
  ): PredictiveTimelinePoint[] {
    const rate = Math.max(0.2, depletionRatePerHour);

    // 1. NOW
    const ptNow: PredictiveTimelinePoint = {
      timeLabel: 'NOW',
      timestampStr: 'Current Live/Baseline',
      estimatedMoisture: Number(currentMoisture.toFixed(1)),
      estimatedTemp: temp,
      rainExpectedMm: 0,
      riskStatus: currentMoisture < 25 ? 'HIGH' : 'LOW',
      riskCategory: currentMoisture < 25 ? 'Water' : 'Optimal',
      headline: `Moisture ${currentMoisture.toFixed(1)}%`,
      recommendedFocus: 'Normal field baseline'
    };

    // 2. 6 HOURS
    const m6 = Math.max(10, Number((currentMoisture - rate * 6).toFixed(1)));
    const pt6h: PredictiveTimelinePoint = {
      timeLabel: '6 HOURS',
      timestampStr: '+6 Hours (Afternoon)',
      estimatedMoisture: m6,
      estimatedTemp: temp + 2,
      rainExpectedMm: 0,
      riskStatus: m6 <= wiltingPoint + 2 ? 'CRITICAL' : (m6 < 28 ? 'HIGH' : 'LOW'),
      riskCategory: m6 < 28 ? 'Water' : 'Optimal',
      headline: m6 < 28 ? 'Drying Trend Underway' : 'Normal Moisture Decline',
      recommendedFocus: m6 < 28 ? 'Prepare irrigation pump' : 'Maintain routine monitoring'
    };

    // 3. 12 HOURS
    const m12 = Math.max(8, Number((currentMoisture - rate * 12).toFixed(1)));
    const pt12h: PredictiveTimelinePoint = {
      timeLabel: '12 HOURS',
      timestampStr: '+12 Hours (Sunset)',
      estimatedMoisture: m12,
      estimatedTemp: temp - 3,
      rainExpectedMm: 0,
      riskStatus: m12 <= wiltingPoint ? 'CRITICAL' : (m12 < 26 ? 'HIGH' : (m12 < 34 ? 'MODERATE' : 'LOW')),
      riskCategory: m12 < 26 ? 'Water' : 'Optimal',
      headline: m12 < 26 ? 'Significant Water Deficit' : 'Moisture Stabilizing for Night',
      recommendedFocus: m12 < 26 ? 'Night irrigation cycle advised' : 'Rest period'
    };

    // 4. 24 HOURS
    const rainRecharge24 = (rainProb >= 60 && rainMm >= 10) ? Math.min(25, rainMm * 0.8) : 0;
    const m24 = Math.max(8, Number((currentMoisture - rate * 16 + rainRecharge24).toFixed(1)));
    const pt24h: PredictiveTimelinePoint = {
      timeLabel: '24 HOURS',
      timestampStr: 'Tomorrow',
      estimatedMoisture: m24,
      estimatedTemp: temp + 1,
      rainExpectedMm: rainRecharge24 > 0 ? rainMm : 0,
      riskStatus: m24 <= wiltingPoint ? 'CRITICAL' : (m24 < 25 ? 'HIGH' : 'LOW'),
      riskCategory: rainRecharge24 > 0 ? 'Rain' : (m24 < 25 ? 'Water' : 'Optimal'),
      headline: rainRecharge24 > 0 ? 'Rain Recharge Likely' : (m24 < 25 ? 'Root Zone Dry' : 'Steady Canopy Vigor'),
      recommendedFocus: rainRecharge24 > 0 ? 'Monitor rain gauge' : (m24 < 25 ? 'Irrigate root zone' : 'Normal routine')
    };

    // 5. 3 DAYS
    const rainRecharge3d = rainMm > 20 ? 15 : 0;
    const m3d = Math.max(12, Math.min(65, Number((m24 - rate * 20 + rainRecharge3d).toFixed(1))));
    const pt3d: PredictiveTimelinePoint = {
      timeLabel: '3 DAYS',
      timestampStr: '3-Day Outlook',
      estimatedMoisture: m3d,
      estimatedTemp: temp,
      rainExpectedMm: rainMm,
      riskStatus: m3d < 25 ? 'HIGH' : 'LOW',
      riskCategory: m3d < 25 ? 'Water' : 'Optimal',
      headline: m3d < 25 ? 'Cumulative Water Deficit' : 'Sustainable Crop Hydration',
      recommendedFocus: m3d < 25 ? 'Full field irrigation scheduling' : 'Pest and nutrient scouting'
    };

    return [ptNow, pt6h, pt12h, pt24h, pt3d];
  }

  /**
   * Log an irrigation event and check verification response
   */
  public logIrrigationEvent(beforeMoisture: number, afterMoisture: number) {
    if (typeof window === 'undefined') return;
    const record = {
      timestamp: new Date().toISOString(),
      beforeMoisture,
      afterMoisture,
      delta: Number((afterMoisture - beforeMoisture).toFixed(1))
    };
    try {
      localStorage.setItem(IRRIGATION_VERIFICATION_KEY, JSON.stringify(record));
    } catch {}
  }

  /**
   * Retrieve irrigation verification status
   */
  public getIrrigationVerification(currentMoisture: number): IrrigationVerificationResult {
    let record: any = null;
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(IRRIGATION_VERIFICATION_KEY);
        if (stored) record = JSON.parse(stored);
      } catch {}
    }

    if (!record) {
      return {
        hasRecord: false,
        status: 'insufficient_data',
        title: '💧 Irrigation Response Tracking Ready',
        beforeMoisture: null,
        afterMoisture: null,
        deltaMoisture: null,
        timestamp: null,
        observationMessage: 'No completed irrigation runs recorded yet. When you run an irrigation cycle, CroperX will compare sensor moisture before and after to verify water penetration.',
        suggestedAction: 'Log or complete an irrigation run to activate verification diagnostics.',
        isConfirmedDiagnosis: false
      };
    }

    const delta = record.delta ?? (record.afterMoisture - record.beforeMoisture);
    let status: 'effective' | 'low_change' | 'no_change_or_drop' = 'effective';
    let title = '✅ Soil Moisture Increased After Irrigation';
    let observationMessage = `Soil moisture rose by +${delta.toFixed(1)}% (from ${record.beforeMoisture}% to ${record.afterMoisture}%). Water penetrated the root zone effectively.`;
    let suggestedAction = 'Irrigation appears effective. No hardware adjustment needed.';

    if (delta <= 0) {
      status = 'no_change_or_drop';
      title = '⚠️ No Moisture Increase Detected After Irrigation';
      observationMessage = `Sensor recorded a delta of ${delta.toFixed(1)}% (from ${record.beforeMoisture}% to ${record.afterMoisture}%).`;
      suggestedAction = 'Check pump pressure, examine drip emitters for clogs, or verify that the sensor probe is planted in the active wetting zone.';
    } else if (delta < 5.0) {
      status = 'low_change';
      title = '🟡 Low Soil Moisture Response Observed';
      observationMessage = `Moisture increased slightly by only +${delta.toFixed(1)}%. Expected a deeper infiltration pulse.`;
      suggestedAction = 'Check irrigation flow duration, emitter spacing, or inspect for surface runoff on hardpan soils.';
    }

    return {
      hasRecord: true,
      status,
      title,
      beforeMoisture: record.beforeMoisture,
      afterMoisture: record.afterMoisture,
      deltaMoisture: delta,
      timestamp: new Date(record.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
      observationMessage,
      suggestedAction,
      isConfirmedDiagnosis: false
    };
  }

  /**
   * "Farm What-If" Simulator (Non-destructive sandbox)
   */
  public runWhatIfSimulation(
    baselineMoisture: number,
    baselineTemp: number,
    scenario: FarmWhatIfScenario
  ): WhatIfSimulationResult {
    let simMoisture = baselineMoisture;
    let simTemp = baselineTemp;

    // Apply moisture scenario
    if (scenario.moisture === 'lower') simMoisture = Math.max(12, simMoisture - 12);
    else if (scenario.moisture === 'higher') simMoisture = Math.min(75, simMoisture + 15);

    // Apply temperature scenario
    if (scenario.temperature === 'hot') simTemp += 5;
    else if (scenario.temperature === 'extreme') simTemp += 9;

    // Apply rainfall scenario
    let rainBonus = 0;
    if (scenario.rainfall === 'light') rainBonus = 8;
    else if (scenario.rainfall === 'heavy') rainBonus = 24;
    simMoisture += rainBonus;

    // Apply irrigation scenario
    let irrigBonus = 0;
    if (scenario.irrigation === 'normal') irrigBonus = 14;
    else if (scenario.irrigation === 'extra') irrigBonus = 25;
    simMoisture += irrigBonus;

    // Evaporative loss under higher temp
    if (simTemp > 34) simMoisture -= (simTemp - 34) * 0.8;
    simMoisture = Math.max(10, Math.min(88, Number(simMoisture.toFixed(1))));

    // Determine Simulated Risk
    let expectedRisk: PredictiveRiskLevel = 'LOW';
    let expectedFieldCondition = 'Balanced soil hydration with manageable transpiration demand.';
    let suggestedAction = 'Maintain standard farm schedule.';
    let whyExplanation = 'Simulated parameters stay within safe biological ranges for crop health.';

    if (simMoisture < 20) {
      expectedRisk = 'CRITICAL';
      expectedFieldCondition = 'Severe root-zone moisture deficit with severe wilting danger.';
      suggestedAction = 'Execute emergency irrigation run before solar noon.';
      whyExplanation = `Simulated moisture (${simMoisture}%) drops below critical wilting threshold under ${simTemp}°C heat.`;
    } else if (simMoisture < 28 || simTemp >= 38) {
      expectedRisk = 'HIGH';
      expectedFieldCondition = simTemp >= 38 ? 'High atmospheric heat stress demand.' : 'Approaching moisture stress boundary.';
      suggestedAction = 'Increase irrigation frequency and monitor canopy turgor.';
      whyExplanation = `Higher temperature (${simTemp}°C) accelerates evapotranspiration.`;
    } else if (simMoisture > 72) {
      expectedRisk = 'HIGH';
      expectedFieldCondition = 'Near-saturated soil with waterlogging risk.';
      suggestedAction = 'Halt all irrigation and ensure field drainage channels are open.';
      whyExplanation = `Simulated heavy rain and extra watering exceed soil field capacity (${simMoisture}%).`;
    } else if (simMoisture < 35) {
      expectedRisk = 'MODERATE';
      expectedFieldCondition = 'Sub-optimal soil moisture requiring attention.';
      suggestedAction = 'Schedule irrigation within 24 hours.';
      whyExplanation = 'Moisture levels allow normal growth but safety buffer is narrowing.';
    }

    return {
      scenario,
      expectedRisk,
      expectedMoisture: simMoisture,
      expectedFieldCondition,
      suggestedAction,
      whyExplanation,
      isSimulated: true
    };
  }
}

export const farmPredictionService = new FarmPredictionService();
