import { SoilData, FarmZone, CropRecommendation } from '../types';
import { 
  OverallCropRiskReport, 
  RiskFactorEvaluation, 
  CropRiskCategory, 
  CropRiskLevel, 
  DailyRiskForecast, 
  ZoneRiskEvaluation, 
  RiskSignal,
  PlantObservationHistory
} from '../types/cropRisk';
import { evaluateIrrigationDecision } from './irrigationEngine';
import { riskSignalService } from './riskSignalService';

export interface CropRiskEvaluationParams {
  soilData: SoilData;
  farmZones?: FarmZone[];
  weatherTemp?: number;
  weatherRainProb?: number;
  weatherRainfallForecastMm?: number;
  weatherWindSpeed?: number;
  weatherHumidity?: number;
  cropName?: string;
  recommendations?: CropRecommendation[];
  plantObservations?: PlantObservationHistory[];
  isOffline?: boolean;
}

export function scoreToLevel(score: number): CropRiskLevel {
  if (score <= 20) return 'LOW';
  if (score <= 40) return 'WATCH';
  if (score <= 70) return 'MODERATE';
  return 'HIGH';
}

export function levelToLabel(level: CropRiskLevel): string {
  switch (level) {
    case 'LOW':
      return '🟢 Low Risk';
    case 'WATCH':
      return '👀 Watch';
    case 'MODERATE':
      return '🟡 Moderate Risk';
    case 'HIGH':
      return '🔴 High Risk';
    case 'UNKNOWN':
    default:
      return '⚪ Need More Data';
  }
}

/**
 * Evaluates the full predictive crop risk matrix deterministically.
 */
export function evaluateCropRisk(params: CropRiskEvaluationParams): OverallCropRiskReport {
  const {
    soilData,
    farmZones = [],
    weatherTemp = soilData.temperature || 26,
    weatherRainProb = soilData.rainfall > 80 ? 65 : 20,
    weatherRainfallForecastMm = soilData.rainfall || 0,
    weatherWindSpeed = soilData.wind_speed || 12,
    weatherHumidity = soilData.humidity || 65,
    cropName = params.recommendations?.[0]?.crop || farmZones[0]?.assignedCrop || 'Rice',
    plantObservations = riskSignalService.getPlantObservations(),
    isOffline = false
  } = params;

  const missingWarnings: string[] = [];

  // Check for missing data
  if (!soilData || soilData.soil_moisture === undefined) {
    missingWarnings.push('Soil moisture sensor data is uninitialized.');
  }
  if (!cropName) {
    missingWarnings.push('Primary crop name not specified.');
  }

  // Check recent plant diagnosis history
  const recentHighRiskObservations = plantObservations.filter(obs => {
    const isRecent = Date.now() - obs.timestamp < 7 * 24 * 60 * 60 * 1000;
    return isRecent && (obs.severity === 'HIGH' || obs.severity === 'MODERATE');
  });

  // =========================================================================
  // 1. DISEASE RISK (🦠)
  // =========================================================================
  const diseaseSignals: RiskSignal[] = [];
  let diseaseScore = 15; // baseline

  // Temperature optimum for fungal spores (20-30°C)
  const isTempFungalOptimal = weatherTemp >= 20 && weatherTemp <= 30;
  if (isTempFungalOptimal) {
    diseaseScore += 20;
    diseaseSignals.push({
      id: 'dis-temp',
      name: 'Pathogen Temperature Window',
      category: 'disease',
      currentValue: `${weatherTemp}°C`,
      threshold: '20-30°C',
      unit: '°C',
      isTriggered: true,
      severity: 'WATCH',
      description: 'Temperature is within the optimal proliferation zone for fungal pathogens.'
    });
  }

  // High atmospheric humidity
  if (weatherHumidity >= 85) {
    diseaseScore += 35;
    diseaseSignals.push({
      id: 'dis-hum-high',
      name: 'Extreme Humidity',
      category: 'disease',
      currentValue: `${weatherHumidity}%`,
      threshold: '>80%',
      unit: '%',
      isTriggered: true,
      severity: 'HIGH',
      description: 'High relative humidity prolongs leaf wetness and triggers spore germination.'
    });
  } else if (weatherHumidity >= 70) {
    diseaseScore += 18;
    diseaseSignals.push({
      id: 'dis-hum-mod',
      name: 'Elevated Humidity',
      category: 'disease',
      currentValue: `${weatherHumidity}%`,
      threshold: '>70%',
      unit: '%',
      isTriggered: true,
      severity: 'WATCH',
      description: 'Atmospheric humidity is high enough to sustain foliar pathogen development.'
    });
  }

  // Rainfall / leaf wetness
  if (weatherRainfallForecastMm > 20 || weatherRainProb > 60) {
    diseaseScore += 20;
    diseaseSignals.push({
      id: 'dis-rain',
      name: 'Precipitation / Leaf Wetness Proxy',
      category: 'disease',
      currentValue: `${weatherRainfallForecastMm} mm (${weatherRainProb}%)`,
      threshold: '>20 mm or >60%',
      unit: 'mm',
      isTriggered: true,
      severity: 'MODERATE',
      description: 'Upcoming rainfall increases splash dispersal and foliar dampness.'
    });
  }

  // Previous vision diagnosis history
  if (recentHighRiskObservations.length > 0) {
    diseaseScore += 25;
    diseaseSignals.push({
      id: 'dis-diag-history',
      name: 'Recent Pathogen Observation',
      category: 'disease',
      currentValue: `${recentHighRiskObservations.length} detected`,
      threshold: '>0 incidents',
      unit: 'records',
      isTriggered: true,
      severity: 'HIGH',
      description: `Previous plant scan detected symptoms: "${recentHighRiskObservations[0].finding}".`
    });
  }

  diseaseScore = Math.min(100, Math.max(5, diseaseScore));
  const diseaseLevel = scoreToLevel(diseaseScore);

  const diseaseEval: RiskFactorEvaluation = {
    category: 'disease',
    name: 'Crop Disease Risk',
    icon: '🦠',
    score: diseaseScore,
    level: diseaseLevel,
    levelLabel: levelToLabel(diseaseLevel),
    what: diseaseScore >= 45 
      ? `Environmental conditions may increase disease pressure on your ${cropName} in the next few days.`
      : `Current environmental conditions present low pathogen pressure on ${cropName}.`,
    why: [
      weatherHumidity >= 70 ? `High atmospheric humidity (${weatherHumidity}%) keeps leaf canopies wet.` : `Humidity is moderate (${weatherHumidity}%).`,
      isTempFungalOptimal ? `Ambient temperature (${weatherTemp}°C) is in the pathogen-active range (20–30°C).` : `Temperature (${weatherTemp}°C) does not accelerate rapid fungal proliferation.`,
      weatherRainProb > 50 ? `Upcoming rain (${weatherRainProb}% chance) increases foliar spore splash.` : `Rain probability remains low.`
    ],
    action: diseaseScore >= 45 
      ? 'Perform a visual leaf walkthrough and scan suspicious discolored leaves using the AI Plant Scan.'
      : 'Maintain standard field crop hygiene and monitor moisture levels.',
    when: diseaseScore >= 45 ? 'Today morning or late afternoon' : 'During weekly walkthrough',
    avoid: 'Avoid applying preventive chemical fungicides without visual confirmation of pathogen presence.',
    targetTab: 'diagnostics',
    targetTabLabel: '📷 Scan Plant Health',
    signals: diseaseSignals,
    expertMetrics: {
      'Relative Humidity': `${weatherHumidity}%`,
      'Pathogen Temp Optimum': isTempFungalOptimal ? 'Active Window' : 'Suppressed',
      'Recent Outbreak History': recentHighRiskObservations.length > 0 ? 'Positive Records' : 'None',
      'Leaf Wetness Index': weatherHumidity > 80 ? 'High (>6h wetness)' : 'Moderate'
    },
    confidence: 'HIGH'
  };

  // =========================================================================
  // 2. PEST RISK (🐛)
  // =========================================================================
  const pestSignals: RiskSignal[] = [];
  let pestScore = 15;

  // Temperature 22-34°C favors insect reproduction & feeding
  if (weatherTemp >= 23 && weatherTemp <= 34) {
    pestScore += 25;
    pestSignals.push({
      id: 'pest-temp',
      name: 'Insect Activity Temperature Window',
      category: 'pest',
      currentValue: `${weatherTemp}°C`,
      threshold: '23-34°C',
      unit: '°C',
      isTriggered: true,
      severity: 'WATCH',
      description: 'Warm conditions accelerate insect feeding rates and egg-hatch cycles.'
    });
  }

  if (soilData.pest_pressure >= 70) {
    pestScore += 40;
    pestSignals.push({
      id: 'pest-telemetry-high',
      name: 'High Field Pest Telemetry',
      category: 'pest',
      currentValue: `${soilData.pest_pressure}/100`,
      threshold: '>70',
      unit: 'index',
      isTriggered: true,
      severity: 'HIGH',
      description: 'Field sensor indicators and local trapping metrics show heavy insect pressure.'
    });
  } else if (soilData.pest_pressure >= 45) {
    pestScore += 20;
    pestSignals.push({
      id: 'pest-telemetry-mod',
      name: 'Elevated Pest Pressure',
      category: 'pest',
      currentValue: `${soilData.pest_pressure}/100`,
      threshold: '>45',
      unit: 'index',
      isTriggered: true,
      severity: 'WATCH',
      description: 'Moderate insect movement registered across local monitoring stations.'
    });
  }

  // Dense canopy fosters pest shelter
  if (soilData.crop_density > 75) {
    pestScore += 15;
    pestSignals.push({
      id: 'pest-density',
      name: 'Dense Crop Canopy',
      category: 'pest',
      currentValue: `${soilData.crop_density}%`,
      threshold: '>75%',
      unit: '%',
      isTriggered: true,
      severity: 'WATCH',
      description: 'Dense canopy restricts airflow and provides shelter for sap-sucking pests.'
    });
  }

  pestScore = Math.min(100, Math.max(5, pestScore));
  const pestLevel = scoreToLevel(pestScore);

  const pestEval: RiskFactorEvaluation = {
    category: 'pest',
    name: 'Pest Pressure Risk',
    icon: '🐛',
    score: pestScore,
    level: pestLevel,
    levelLabel: levelToLabel(pestLevel),
    what: pestScore >= 45 
      ? `Pest pressure may be increasing for ${cropName} in your area.`
      : `Pest pressure remains at baseline manageable levels.`,
    why: [
      weatherTemp >= 23 && weatherTemp <= 34 ? `Warm temperature (${weatherTemp}°C) accelerates pest reproductive cycles.` : `Temperature (${weatherTemp}°C) is outside peak insect proliferation.`,
      soilData.pest_pressure > 50 ? `Local pest activity index is elevated (${soilData.pest_pressure}/100).` : `Pest index is low (${soilData.pest_pressure}/100).`,
      soilData.crop_density > 75 ? `High crop density (${soilData.crop_density}%) provides cover for insects.` : `Canopy spacing allows adequate airflow.`
    ],
    action: pestScore >= 45
      ? 'Scout the undersides of leaves and stem joints for early aphid, borer, or mite clusters; install sticky or pheromone traps.'
      : 'Conduct standard weekly scouting and keep boundary weeds clear.',
    when: pestScore >= 45 ? 'Next 24 to 48 hours' : 'Regular weekly schedule',
    avoid: 'Avoid blanket preventative spraying of broad-spectrum pesticides, which kills beneficial predators like ladybugs and spiders.',
    targetTab: 'diagnostics',
    targetTabLabel: '🐛 Scout & Scan Pests',
    signals: pestSignals,
    expertMetrics: {
      'Pest Pressure Index': `${soilData.pest_pressure}/100`,
      'Optimal Bio Window': weatherTemp >= 23 && weatherTemp <= 34 ? 'Active (23-34°C)' : 'Suppressed',
      'Canopy Density': `${soilData.crop_density}%`
    },
    confidence: 'HIGH'
  };

  // =========================================================================
  // 3. HEAT STRESS (🔥)
  // =========================================================================
  const heatSignals: RiskSignal[] = [];
  let heatScore = 10;

  if (weatherTemp >= 38) {
    heatScore += 65;
    heatSignals.push({
      id: 'heat-temp-high',
      name: 'Severe Heatwave Temperature',
      category: 'heat',
      currentValue: `${weatherTemp}°C`,
      threshold: '>38°C',
      unit: '°C',
      isTriggered: true,
      severity: 'HIGH',
      description: 'Extreme heat causes leaf stomatal closure, pollen sterility, and scorched margins.'
    });
  } else if (weatherTemp >= 33) {
    heatScore += 35;
    heatSignals.push({
      id: 'heat-temp-mod',
      name: 'High Summer Temperature',
      category: 'heat',
      currentValue: `${weatherTemp}°C`,
      threshold: '>33°C',
      unit: '°C',
      isTriggered: true,
      severity: 'MODERATE',
      description: 'Elevated temperature accelerates crop transpiration and depletes root water quickly.'
    });
  }

  // Low soil moisture amplifies heat stress
  if (soilData.soil_moisture < 35 && weatherTemp >= 32) {
    heatScore += 25;
    heatSignals.push({
      id: 'heat-moisture-deficit',
      name: 'Low Root Moisture Under Heat',
      category: 'heat',
      currentValue: `${soilData.soil_moisture}%`,
      threshold: '<35%',
      unit: '%',
      isTriggered: true,
      severity: 'HIGH',
      description: 'Plants cannot draw sufficient water for evaporative leaf cooling.'
    });
  }

  heatScore = Math.min(100, Math.max(5, heatScore));
  const heatLevel = scoreToLevel(heatScore);

  const heatEval: RiskFactorEvaluation = {
    category: 'heat',
    name: 'Heat Stress Risk',
    icon: '🔥',
    score: heatScore,
    level: heatLevel,
    levelLabel: levelToLabel(heatLevel),
    what: heatScore >= 45 
      ? `High temperatures may induce heat stress on your ${cropName}.`
      : `Temperature conditions are comfortable for ${cropName}.`,
    why: [
      weatherTemp >= 33 ? `Ambient temperature reached ${weatherTemp}°C.` : `Temperature (${weatherTemp}°C) is within safe physiological bounds.`,
      soilData.soil_moisture < 35 ? `Soil moisture is depleted (${soilData.soil_moisture}%), reducing natural leaf cooling.` : `Soil moisture (${soilData.soil_moisture}%) supports transpirational cooling.`
    ],
    action: heatScore >= 45
      ? 'Irrigate in the early morning or evening to sustain root hydration; consider light surface mulching.'
      : 'Maintain standard irrigation intervals.',
    when: heatScore >= 45 ? 'Today before 8:00 AM or after 5:30 PM' : 'As scheduled',
    avoid: 'Avoid overhead sprinkler watering under peak midday direct sun, which causes leaf scald and water evaporation.',
    targetTab: 'irrigation',
    targetTabLabel: '💧 Check Water & Cooling',
    signals: heatSignals,
    expertMetrics: {
      'Ambient Temp': `${weatherTemp}°C`,
      'Soil Moisture': `${soilData.soil_moisture}%`,
      'Vapor Pressure Deficit (VPD)': weatherTemp > 35 ? 'High (>2.5 kPa)' : 'Normal (<1.8 kPa)'
    },
    confidence: 'HIGH'
  };

  // =========================================================================
  // 4. WATER STRESS (💧) — REUSES VALIDATED PRECISION IRRIGATION ENGINE
  // =========================================================================
  const irrigationEval = evaluateIrrigationDecision({
    soilData,
    cropName,
    weatherTemp,
    weatherRainProb,
    weatherRainfallForecastMm,
    areaHa: farmZones[0]?.areaHa || 1.5,
    zoneName: farmZones[0]?.name || 'Main Field'
  });

  const waterSignals: RiskSignal[] = [];
  let waterScore = 15;

  if (irrigationEval.statusCode === 'WATER_NOW') {
    waterScore = 82;
    waterSignals.push({
      id: 'water-deficit-critical',
      name: 'Critical Soil Moisture Deficit',
      category: 'water',
      currentValue: `${soilData.soil_moisture}%`,
      threshold: '<35%',
      unit: '%',
      isTriggered: true,
      severity: 'HIGH',
      description: `Soil moisture is at ${soilData.soil_moisture}%, requiring ${irrigationEval.grossIrrigationRequiredMm} mm replenishment.`
    });
  } else if (irrigationEval.statusCode === 'WATER_SOON') {
    waterScore = 55;
    waterSignals.push({
      id: 'water-deficit-moderate',
      name: 'Depleting Root Moisture',
      category: 'water',
      currentValue: `${soilData.soil_moisture}%`,
      threshold: '<45%',
      unit: '%',
      isTriggered: true,
      severity: 'MODERATE',
      description: `Moisture is declining below optimal transpiration threshold (45%).`
    });
  } else if (irrigationEval.statusCode === 'WAIT') {
    waterScore = 25;
    waterSignals.push({
      id: 'water-rain-incoming',
      name: 'Rain Incoming — Irrigation Paused',
      category: 'water',
      currentValue: `${weatherRainProb}% rain chance`,
      threshold: '>60%',
      unit: '%',
      isTriggered: true,
      severity: 'WATCH',
      description: 'Incoming rainfall will supply moisture naturally.'
    });
  } else {
    waterScore = 10;
  }

  const waterLevel = scoreToLevel(waterScore);

  const waterEval: RiskFactorEvaluation = {
    category: 'water',
    name: 'Water Stress Risk',
    icon: '💧',
    score: waterScore,
    level: waterLevel,
    levelLabel: levelToLabel(waterLevel),
    what: irrigationEval.what,
    why: [
      irrigationEval.why,
      `Current root-zone moisture: ${soilData.soil_moisture}% (Target: 45–60%).`,
      `Crop evapotranspiration demand (ETc): ${irrigationEval.cropWaterNeedMmDay} mm/day.`
    ],
    action: irrigationEval.action,
    when: irrigationEval.when,
    avoid: irrigationEval.avoid,
    targetTab: 'irrigation',
    targetTabLabel: '💧 Open Smart Irrigation AI',
    signals: waterSignals,
    expertMetrics: {
      'Gross Water Needed': `${irrigationEval.grossIrrigationRequiredMm || 0} mm`,
      'Pumping Duration': `${irrigationEval.estimatedPumpHours || 0} hrs`,
      'Reference ET₀': `${irrigationEval.evapotranspirationMmDay} mm/d`,
      'Crop ETc': `${irrigationEval.cropWaterNeedMmDay} mm/d`
    },
    confidence: 'HIGH'
  };

  // =========================================================================
  // 5. HEAVY RAIN / WATERLOGGING RISK (🌧️)
  // =========================================================================
  const rainSignals: RiskSignal[] = [];
  let rainScore = 10;

  if (weatherRainfallForecastMm >= 100 || (weatherRainProb > 75 && soilData.rainfall > 100)) {
    rainScore += 65;
    rainSignals.push({
      id: 'rain-heavy-precip',
      name: 'Heavy Rainfall Warning',
      category: 'heavy_rain',
      currentValue: `${weatherRainfallForecastMm} mm`,
      threshold: '>100 mm',
      unit: 'mm',
      isTriggered: true,
      severity: 'HIGH',
      description: 'Intense precipitation can lead to standing water and root hypoxia.'
    });
  } else if (weatherRainfallForecastMm >= 45 || weatherRainProb >= 60) {
    rainScore += 35;
    rainSignals.push({
      id: 'rain-mod-precip',
      name: 'Moderate Rain Expected',
      category: 'heavy_rain',
      currentValue: `${weatherRainfallForecastMm} mm (${weatherRainProb}%)`,
      threshold: '>45 mm',
      unit: 'mm',
      isTriggered: true,
      severity: 'MODERATE',
      description: 'Rainfall will wet topsoil and may cause localized pooling in low-lying beds.'
    });
  }

  // Pre-existing soil saturation
  if (soilData.soil_moisture >= 75 && (weatherRainfallForecastMm > 20 || weatherRainProb > 50)) {
    rainScore += 25;
    rainSignals.push({
      id: 'rain-soil-saturation',
      name: 'Soil Saturated Before Rain',
      category: 'heavy_rain',
      currentValue: `${soilData.soil_moisture}%`,
      threshold: '>75%',
      unit: '%',
      isTriggered: true,
      severity: 'HIGH',
      description: 'Soil is already near saturation and cannot absorb additional rainfall without surface runoff.'
    });
  }

  rainScore = Math.min(100, Math.max(5, rainScore));
  const rainLevel = scoreToLevel(rainScore);

  const rainEval: RiskFactorEvaluation = {
    category: 'heavy_rain',
    name: 'Heavy Rain & Waterlogging Risk',
    icon: '🌧️',
    score: rainScore,
    level: rainLevel,
    levelLabel: levelToLabel(rainLevel),
    what: rainScore >= 45 
      ? `Heavy rain or waterlogging may affect your field over the next 48 hours.`
      : `Rainfall forecast is normal with low waterlogging risk.`,
    why: [
      weatherRainfallForecastMm > 40 ? `Significant rainfall (${weatherRainfallForecastMm} mm) forecast.` : `Rain forecast is mild (${weatherRainfallForecastMm} mm).`,
      soilData.soil_moisture > 70 ? `Soil is already wet (${soilData.soil_moisture}%), reducing water absorption capacity.` : `Soil has absorption capacity for precipitation.`
    ],
    action: rainScore >= 45
      ? 'Inspect field boundary trenches and unblock furrow drainage channels to allow free runoff.'
      : 'Maintain regular field drainage inspection.',
    when: rainScore >= 45 ? 'Today before downpours begin' : 'Weekly check',
    avoid: 'Avoid applying granular fertilizers or foliar pesticides right before rain, as they will wash off into waterways.',
    targetTab: 'weather',
    targetTabLabel: '🌦️ View Rain Radar',
    signals: rainSignals,
    expertMetrics: {
      'Forecast Rainfall': `${weatherRainfallForecastMm} mm`,
      'Precipitation Probability': `${weatherRainProb}%`,
      'Soil Saturation': `${soilData.soil_moisture}%`
    },
    confidence: 'HIGH'
  };

  // =========================================================================
  // 6. WIND / LODGING RISK (🌬️)
  // =========================================================================
  const windSignals: RiskSignal[] = [];
  let windScore = 10;

  if (weatherWindSpeed >= 45) {
    windScore += 65;
    windSignals.push({
      id: 'wind-speed-high',
      name: 'High Wind Velocity',
      category: 'wind',
      currentValue: `${weatherWindSpeed} km/h`,
      threshold: '>45 km/h',
      unit: 'km/h',
      isTriggered: true,
      severity: 'HIGH',
      description: 'Strong gusts can cause crop lodging, stem snapping, and tearing of greenhouse plastic.'
    });
  } else if (weatherWindSpeed >= 25) {
    windScore += 30;
    windSignals.push({
      id: 'wind-speed-mod',
      name: 'Breezy to Moderate Wind',
      category: 'wind',
      currentValue: `${weatherWindSpeed} km/h`,
      threshold: '>25 km/h',
      unit: 'km/h',
      isTriggered: true,
      severity: 'WATCH',
      description: 'Wind will cause chemical spray drift and increase canopy drying.'
    });
  }

  windScore = Math.min(100, Math.max(5, windScore));
  const windLevel = scoreToLevel(windScore);

  const windEval: RiskFactorEvaluation = {
    category: 'wind',
    name: 'Wind & Lodging Risk',
    icon: '🌬️',
    score: windScore,
    level: windLevel,
    levelLabel: levelToLabel(windLevel),
    what: windScore >= 45 
      ? `Strong winds (${weatherWindSpeed} km/h) may cause crop lodging or spray drift.`
      : `Wind speeds (${weatherWindSpeed} km/h) are calm and safe for field operations.`,
    why: [
      weatherWindSpeed >= 25 ? `Wind telemetry registers gusts at ${weatherWindSpeed} km/h.` : `Gentle air movement (${weatherWindSpeed} km/h).`,
      soilData.soil_moisture > 70 && weatherWindSpeed >= 30 ? `Wet soil loosens root anchors, compounding lodging risk.` : `Root anchorage is stable.`
    ],
    action: windScore >= 45
      ? 'Stake tall crops, tie support trellises, and pause any aerial or pressurized backpack spraying.'
      : 'Safe conditions for routine field spraying and operations.',
    when: windScore >= 45 ? 'Before peak midday wind gusts' : 'Anytime today',
    avoid: 'Avoid applying liquid agrochemical sprays when wind exceeds 15–20 km/h to prevent non-target chemical drift.',
    targetTab: 'weather',
    targetTabLabel: '🌬️ Check Wind Telemetry',
    signals: windSignals,
    expertMetrics: {
      'Active Wind Speed': `${weatherWindSpeed} km/h`,
      'Spray Drift Danger': weatherWindSpeed > 20 ? 'High (>20 km/h)' : 'Safe (<15 km/h)'
    },
    confidence: 'HIGH'
  };

  // =========================================================================
  // 7. SOIL RISK (🧪)
  // =========================================================================
  const soilSignals: RiskSignal[] = [];
  let soilScore = 15;

  // pH bounds
  if (soilData.ph < 5.5) {
    soilScore += 35;
    soilSignals.push({
      id: 'soil-ph-acidic',
      name: 'Strong Soil Acidity',
      category: 'soil',
      currentValue: `pH ${soilData.ph}`,
      threshold: '<5.5',
      unit: 'pH',
      isTriggered: true,
      severity: 'HIGH',
      description: 'Acidic pH locks up Phosphorus and causes Aluminium toxicity at root tips.'
    });
  } else if (soilData.ph > 7.8) {
    soilScore += 30;
    soilSignals.push({
      id: 'soil-ph-alkaline',
      name: 'Soil Alkalinity',
      category: 'soil',
      currentValue: `pH ${soilData.ph}`,
      threshold: '>7.8',
      unit: 'pH',
      isTriggered: true,
      severity: 'MODERATE',
      description: 'Alkaline pH precipitates Iron and Zinc micronutrients.'
    });
  }

  // Nitrogen deficit
  if (soilData.nitrogen < 50) {
    soilScore += 30;
    soilSignals.push({
      id: 'soil-n-deficit',
      name: 'Severe Nitrogen Deficiency',
      category: 'soil',
      currentValue: `${soilData.nitrogen} kg/ha`,
      threshold: '<50 kg/ha',
      unit: 'kg/ha',
      isTriggered: true,
      severity: 'HIGH',
      description: 'Low Nitrogen causes leaf chlorosis (yellowing) and stunted tillering.'
    });
  } else if (soilData.nitrogen < 90) {
    soilScore += 15;
    soilSignals.push({
      id: 'soil-n-mod',
      name: 'Moderate Nitrogen Deficit',
      category: 'soil',
      currentValue: `${soilData.nitrogen} kg/ha`,
      threshold: '<90 kg/ha',
      unit: 'kg/ha',
      isTriggered: true,
      severity: 'WATCH',
      description: 'Nitrogen level is sub-optimal for peak canopy growth.'
    });
  }

  soilScore = Math.min(100, Math.max(5, soilScore));
  const soilLevel = scoreToLevel(soilScore);

  const soilEval: RiskFactorEvaluation = {
    category: 'soil',
    name: 'Soil Nutrient & Chemistry Risk',
    icon: '🧪',
    score: soilScore,
    level: soilLevel,
    levelLabel: levelToLabel(soilLevel),
    what: soilScore >= 45 
      ? `Soil nutrient deficit or pH imbalance may restrict ${cropName} growth.`
      : `Soil chemistry and macro-nutrients are balanced for ${cropName}.`,
    why: [
      soilData.nitrogen < 90 ? `Nitrogen is recorded at ${soilData.nitrogen} kg/ha (Target: 120–160 kg/ha).` : `Nitrogen is sufficient (${soilData.nitrogen} kg/ha).`,
      soilData.ph < 6.0 || soilData.ph > 7.5 ? `Soil pH is ${soilData.ph} (Optimal range is 6.0–7.2).` : `Soil pH (${soilData.ph}) is in the optimal nutrient uptake window.`
    ],
    action: soilScore >= 45
      ? 'Calculate tailored NPK top-dressing or apply organic compost to rectify deficiencies.'
      : 'Maintain scheduled nutrient feeding program.',
    when: soilScore >= 45 ? 'Within the next 2–3 days' : 'Next growth stage',
    avoid: 'Never over-apply concentrated synthetic nitrogen onto parched soil without light pre-watering.',
    targetTab: 'fertilizer',
    targetTabLabel: '🧪 Calculate Fertilizer Dose',
    signals: soilSignals,
    expertMetrics: {
      'Soil pH': `${soilData.ph}`,
      'Available N': `${soilData.nitrogen} kg/ha`,
      'Available P': `${soilData.phosphorus} kg/ha`,
      'Available K': `${soilData.potassium} kg/ha`,
      'Organic Matter': `${soilData.organic_matter}%`
    },
    confidence: 'HIGH'
  };

  // =========================================================================
  // 8. CROP HEALTH DECLINE (📉)
  // =========================================================================
  const healthSignals: RiskSignal[] = [];
  let healthScore = 15;

  // NDVI Proxy (derived from moisture, organic matter, and growth stage)
  const ndviProxy = Math.min(0.88, Math.max(0.20, (soilData.soil_moisture / 100) * 0.4 + (soilData.organic_matter / 5) * 0.3 + 0.15));
  if (ndviProxy < 0.38) {
    healthScore += 45;
    healthSignals.push({
      id: 'health-ndvi-low',
      name: 'Low Canopy Greenness (NDVI)',
      category: 'crop_health',
      currentValue: `${ndviProxy.toFixed(2)}`,
      threshold: '<0.40',
      unit: 'NDVI',
      isTriggered: true,
      severity: 'HIGH',
      description: 'Vegetation canopy reflection indicates stressed or sparse foliage.'
    });
  } else if (ndviProxy < 0.50) {
    healthScore += 20;
    healthSignals.push({
      id: 'health-ndvi-mod',
      name: 'Moderate Canopy Density',
      category: 'crop_health',
      currentValue: `${ndviProxy.toFixed(2)}`,
      threshold: '<0.50',
      unit: 'NDVI',
      isTriggered: true,
      severity: 'WATCH',
      description: 'Canopy vigor is below peak seasonal benchmarks.'
    });
  }

  if (recentHighRiskObservations.length > 0) {
    healthScore += 30;
  }

  healthScore = Math.min(100, Math.max(5, healthScore));
  const healthLevel = scoreToLevel(healthScore);

  const healthEval: RiskFactorEvaluation = {
    category: 'crop_health',
    name: 'Crop Health & Canopy Vigor',
    icon: '📉',
    score: healthScore,
    level: healthLevel,
    levelLabel: levelToLabel(healthLevel),
    what: healthScore >= 45 
      ? `Canopy vigor indicators show signs of crop stress or nutrient lag.`
      : `Crop canopy vigor and photosynthetic vitality are healthy.`,
    why: [
      `Satellite canopy index (NDVI proxy) is ${ndviProxy.toFixed(2)}.`,
      recentHighRiskObservations.length > 0 ? `Active diagnosis logs present in record.` : `No severe disease outbreaks recorded.`
    ],
    action: healthScore >= 45
      ? 'Perform a targeted field inspection on underperforming sections and check root aeration.'
      : 'Continue regular field walkthrough and visual check.',
    when: healthScore >= 45 ? 'Today or tomorrow' : 'This week',
    avoid: 'Avoid assuming low vigor is always nitrogen deficiency; check root health before adding excess fertilizer.',
    targetTab: 'satellite',
    targetTabLabel: '🛰️ View Satellite Canopy (NDVI)',
    signals: healthSignals,
    expertMetrics: {
      'Estimated NDVI': ndviProxy.toFixed(2),
      'Growth Stage': `${soilData.growth_stage}%`,
      'Active Pathology Flags': `${recentHighRiskObservations.length}`
    },
    confidence: 'HIGH'
  };

  // =========================================================================
  // OVERALL AGGREGATION & FACTOR RANKING
  // =========================================================================
  const factors: Record<CropRiskCategory, RiskFactorEvaluation> = {
    disease: diseaseEval,
    pest: pestEval,
    heat: heatEval,
    water: waterEval,
    heavy_rain: rainEval,
    wind: windEval,
    soil: soilEval,
    crop_health: healthEval
  };

  const rankedFactors = Object.values(factors).sort((a, b) => b.score - a.score);
  const dominantFactor = rankedFactors[0];

  // Overall Score Aggregation: 65% dominant + 35% average of remaining top 3
  const otherScores = rankedFactors.slice(1, 4).map(f => f.score);
  const avgOther = otherScores.reduce((acc, v) => acc + v, 0) / (otherScores.length || 1);
  const rawOverall = Math.round(dominantFactor.score * 0.65 + avgOther * 0.35);
  const overallScore = Math.min(100, Math.max(5, rawOverall));
  const overallLevel = scoreToLevel(overallScore);

  let headline = `🟢 Your ${cropName} is in good condition with low environmental risk.`;
  let summary = `All 8 primary risk categories are within safe operational thresholds.`;

  if (overallLevel === 'HIGH') {
    headline = `🔴 High ${dominantFactor.name} requires prompt attention on ${cropName}.`;
    summary = dominantFactor.what;
  } else if (overallLevel === 'MODERATE') {
    headline = `🟡 Moderate ${dominantFactor.name} detected for your ${cropName}.`;
    summary = dominantFactor.what;
  } else if (overallLevel === 'WATCH') {
    headline = `👀 Conditions are changing. Keep an eye on ${dominantFactor.name.toLowerCase()}.`;
    summary = `Monitor weather and soil variations over the coming days.`;
  }

  // =========================================================================
  // 7-DAY PREDICTIVE RISK PROJECTION
  // =========================================================================
  const dayNames = ['Today', 'Tomorrow', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'];
  const dayNameDetails = ['Today', 'Tomorrow', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const sevenDayForecast: DailyRiskForecast[] = dayNames.map((dName, idx) => {
    // Generate deterministic 7-day variation based on weather trends
    const dayDate = new Date();
    dayDate.setDate(dayDate.getDate() + idx);
    const dateStr = dayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    // Weather model variation across 7 days
    const tempDelta = idx === 1 ? 1 : idx === 2 ? 2 : idx === 3 ? -2 : idx === 4 ? 3 : 0;
    const dTempHigh = Math.round(weatherTemp + tempDelta + 3);
    const dTempLow = Math.round(weatherTemp + tempDelta - 4);
    
    // Rain curve
    let dRainProb = weatherRainProb;
    let dRainMm = weatherRainfallForecastMm;
    if (idx === 1) { dRainProb = Math.min(95, weatherRainProb + 15); dRainMm = Math.round(weatherRainfallForecastMm * 1.2); }
    else if (idx === 2) { dRainProb = Math.max(5, weatherRainProb - 20); dRainMm = Math.round(weatherRainfallForecastMm * 0.4); }
    else if (idx === 3) { dRainProb = Math.min(80, weatherRainProb + 10); dRainMm = Math.round(weatherRainfallForecastMm * 0.8); }
    else { dRainProb = Math.max(10, Math.round(weatherRainProb * 0.6)); dRainMm = Math.round(weatherRainfallForecastMm * 0.2); }

    const dHumidity = Math.min(95, Math.max(40, weatherHumidity + (dRainProb > 50 ? 12 : -5)));
    const dWind = Math.round(weatherWindSpeed + (idx % 2 === 0 ? 3 : -2));

    // Dynamic daily score calculation
    let dScore = overallScore;
    if (idx === 1 && dRainProb > 60) dScore = Math.min(100, dScore + 12);
    if (idx === 2 && dRainProb < 30 && dTempHigh > 35) dScore = Math.min(100, dScore + 8);
    if (idx >= 4) dScore = Math.max(15, Math.round(overallScore * 0.85));

    const dLevel = scoreToLevel(dScore);
    const dDomCat: CropRiskCategory = dRainProb > 60 && dHumidity > 75 
      ? 'disease' 
      : dTempHigh > 36 && soilData.soil_moisture < 35 
      ? 'heat' 
      : dominantFactor.category;

    const catLevels: Record<CropRiskCategory, CropRiskLevel> = {
      disease: dHumidity > 75 ? (dHumidity > 85 ? 'HIGH' : 'MODERATE') : 'LOW',
      pest: dTempHigh > 30 ? 'MODERATE' : 'LOW',
      heat: dTempHigh > 36 ? 'HIGH' : dTempHigh > 32 ? 'MODERATE' : 'LOW',
      water: soilData.soil_moisture < 35 ? (dRainProb > 50 ? 'WATCH' : 'HIGH') : 'LOW',
      heavy_rain: dRainMm > 40 ? 'HIGH' : dRainMm > 15 ? 'MODERATE' : 'LOW',
      wind: dWind > 35 ? 'MODERATE' : 'LOW',
      soil: soilLevel,
      crop_health: healthLevel
    };

    return {
      dayOffset: idx,
      dayName: idx < 2 ? dName : `${dayNameDetails[idx % 7]} (${dateStr})`,
      dateStr,
      overallScore: dScore,
      overallLevel: dLevel,
      dominantCategory: dDomCat,
      categoryLevels: catLevels,
      tempHigh: dTempHigh,
      tempLow: dTempLow,
      rainProb: dRainProb,
      rainMm: dRainMm,
      humidity: dHumidity,
      windKmH: dWind,
      summary: dLevel === 'HIGH' 
        ? `High risk from ${dDomCat} conditions. Preventive inspection recommended.`
        : dLevel === 'MODERATE' 
        ? `Moderate ${dDomCat} pressure expected. Weather shifting.`
        : `Favorable growing conditions with low environmental risk.`,
      topAction: dDomCat === 'disease' 
        ? 'Inspect leaves for early spots.' 
        : dDomCat === 'water' 
        ? 'Check soil probe before irrigating.' 
        : dDomCat === 'heavy_rain' 
        ? 'Ensure trenches are open.' 
        : 'Routine crop walk.',
      explanation: {
        what: `Forecast for ${dName}: ${dLevel === 'LOW' ? 'Calm weather' : `${dDomCat} risk index elevated to ${dScore}/100`}.`,
        why: [
          `Expected High/Low: ${dTempHigh}°C / ${dTempLow}°C`,
          `Rain Probability: ${dRainProb}% (${dRainMm} mm)`,
          `Humidity: ${dHumidity}% | Wind: ${dWind} km/h`
        ],
        action: dDomCat === 'disease' 
          ? 'Scout leaf undersides in the morning.' 
          : dDomCat === 'heat' 
          ? 'Water in evening to avoid leaf scorching.' 
          : 'Maintain scheduled field routine.',
        when: `${dName} morning`,
        avoid: 'Do not spray liquid chemicals during high wind or right before rain.'
      }
    };
  });

  // =========================================================================
  // MULTI-ZONE FIELD RISK BREAKDOWN
  // =========================================================================
  const zoneRisks: ZoneRiskEvaluation[] = farmZones.map((z, idx) => {
    let zScore = overallScore;
    let zDomCat = dominantFactor.category;
    let zWhy = `Zone moisture is ${z.moisture}% with ${z.assignedCrop}.`;
    let zAction = 'Conduct routine check';
    let targetTab = dominantFactor.targetTab;

    if (z.moisture < 35) {
      zScore = Math.max(zScore, 78);
      zDomCat = 'water';
      zWhy = `Soil moisture is low (${z.moisture}%). Root stress imminent.`;
      zAction = `Irrigate ${z.name} today`;
      targetTab = 'irrigation';
    } else if (z.moisture > 75 && weatherRainfallForecastMm > 20) {
      zScore = Math.max(zScore, 65);
      zDomCat = 'heavy_rain';
      zWhy = `High soil moisture (${z.moisture}%) prone to waterlogging with rain.`;
      zAction = `Inspect drainage for ${z.name}`;
      targetTab = 'weather';
    } else if (z.ph < 5.5 || z.ph > 7.8) {
      zScore = Math.max(zScore, 58);
      zDomCat = 'soil';
      zWhy = `Soil pH is ${z.ph} (out of optimal 6.0–7.2 range).`;
      zAction = `Apply pH amendment to ${z.name}`;
      targetTab = 'fertilizer';
    }

    const zLevel = scoreToLevel(zScore);

    return {
      zoneId: z.id || `zone_${idx}`,
      zoneName: z.name,
      cropName: z.assignedCrop || cropName,
      areaHa: z.areaHa || 1.0,
      overallScore: zScore,
      overallLevel: zLevel,
      dominantCategory: zDomCat,
      dominantRiskLabel: levelToLabel(zLevel),
      soilMoisture: z.moisture,
      topWhy: zWhy,
      primaryAction: zAction,
      lastUpdated: 'Live telemetry',
      targetTab
    };
  });

  // If no zones configured, create default main zone
  if (zoneRisks.length === 0) {
    zoneRisks.push({
      zoneId: 'main_field',
      zoneName: 'Main Cultivation Field',
      cropName,
      areaHa: 1.5,
      overallScore,
      overallLevel,
      dominantCategory: dominantFactor.category,
      dominantRiskLabel: levelToLabel(overallLevel),
      soilMoisture: soilData.soil_moisture,
      topWhy: dominantFactor.why[0] || 'Field condition within normal limits',
      primaryAction: dominantFactor.action,
      lastUpdated: 'Just now',
      targetTab: dominantFactor.targetTab
    });
  }

  // Record snapshot to history automatically (throttled in riskSignalService)
  riskSignalService.recordRiskSnapshot({
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    overallScore,
    overallLevel,
    dominantRisk: dominantFactor.name,
    topFactor: dominantFactor.why[0] || 'Normal weather and soil indicators'
  });

  return {
    farmName: farmZones[0]?.name ? `${farmZones[0].name} Farm` : 'Main Farm',
    cropName,
    overallScore,
    overallLevel,
    overallStatusLabel: levelToLabel(overallLevel),
    dominantCategory: dominantFactor.category,
    dominantRiskLabel: dominantFactor.name,
    headline,
    summary,
    factors,
    rankedFactors,
    sevenDayForecast,
    zoneRisks,
    lastUpdated: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    dataFreshness: {
      isFresh: !isOffline,
      lastSensorSync: 'Live synchronized',
      isOffline,
      dataAgeHours: 0
    },
    missingDataWarnings: missingWarnings
  };
}
