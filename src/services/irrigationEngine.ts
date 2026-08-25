import { 
  SoilData, 
  FarmZone, 
  CropRecommendation, 
  IrrigationRecommendationDetails, 
  IrrigationStatusCode, 
  ZoneIrrigationEvaluation, 
  FarmIrrigationPlan 
} from '../types';

/**
 * Standard Crop Coefficients (Kc) across growth stages (FAO-56 standard tables)
 */
export const CROP_KC_TABLE: Record<string, { initial: number; mid: number; end: number; rootDepthCm: number; optimalMoistureMin: number; optimalMoistureMax: number }> = {
  rice: { initial: 1.05, mid: 1.20, end: 0.90, rootDepthCm: 40, optimalMoistureMin: 50, optimalMoistureMax: 85 },
  wheat: { initial: 0.35, mid: 1.15, end: 0.40, rootDepthCm: 60, optimalMoistureMin: 40, optimalMoistureMax: 65 },
  maize: { initial: 0.40, mid: 1.20, end: 0.55, rootDepthCm: 70, optimalMoistureMin: 45, optimalMoistureMax: 70 },
  cotton: { initial: 0.45, mid: 1.15, end: 0.70, rootDepthCm: 80, optimalMoistureMin: 40, optimalMoistureMax: 65 },
  sugarcane: { initial: 0.40, mid: 1.25, end: 0.75, rootDepthCm: 90, optimalMoistureMin: 55, optimalMoistureMax: 80 },
  tomato: { initial: 0.60, mid: 1.15, end: 0.80, rootDepthCm: 50, optimalMoistureMin: 45, optimalMoistureMax: 70 },
  soybean: { initial: 0.40, mid: 1.15, end: 0.50, rootDepthCm: 60, optimalMoistureMin: 40, optimalMoistureMax: 65 },
  chickpea: { initial: 0.35, mid: 1.00, end: 0.35, rootDepthCm: 50, optimalMoistureMin: 35, optimalMoistureMax: 60 },
  mustard: { initial: 0.35, mid: 1.05, end: 0.35, rootDepthCm: 50, optimalMoistureMin: 35, optimalMoistureMax: 60 },
  jute: { initial: 0.50, mid: 1.10, end: 0.65, rootDepthCm: 45, optimalMoistureMin: 45, optimalMoistureMax: 75 },
  coffee: { initial: 0.90, mid: 0.95, end: 0.95, rootDepthCm: 90, optimalMoistureMin: 50, optimalMoistureMax: 75 },
};

/**
 * Soil Type Physical Hydrology Constants
 */
export const SOIL_HYDROLOGY: Record<number, { name: string; fieldCapacity: number; wiltingPoint: number; bulkDensity: number }> = {
  1: { name: 'Silty', fieldCapacity: 32, wiltingPoint: 14, bulkDensity: 1.35 },
  2: { name: 'Loamy', fieldCapacity: 28, wiltingPoint: 12, bulkDensity: 1.40 },
  3: { name: 'Clay', fieldCapacity: 38, wiltingPoint: 20, bulkDensity: 1.25 },
  4: { name: 'Sandy', fieldCapacity: 16, wiltingPoint: 6, bulkDensity: 1.55 }
};

/**
 * Irrigation Method Application Efficiency
 */
export const IRRIGATION_METHOD_EFFICIENCY: Record<string, number> = {
  'drip': 0.90,
  'sprinkler': 0.75,
  'surface': 0.60,
  'flood': 0.55,
  'furrow': 0.60,
  'default': 0.75
};

export interface IrrigationEngineInput {
  soilData?: SoilData | null;
  cropName?: string;
  growthStageCode?: number; // 1 = initial, 2 = developing/flowering, 3 = maturity
  weatherTemp?: number;
  weatherHumidity?: number;
  weatherWindSpeed?: number;
  weatherRainProb?: number;
  weatherRainfallForecastMm?: number;
  areaHa?: number; // Field area in hectares if known
  zoneName?: string;
  irrigationMethod?: string;
  weatherTimestamp?: string;
  soilTimestamp?: string;
  isOffline?: boolean;
}

/**
 * Deterministic Evapotranspiration (ET0) Estimation (FAO-56 Hargreaves / Penman-Monteith proxy)
 * Returns reference crop evapotranspiration in mm/day
 */
export function calculateReferenceET0(temp: number, humidity: number, windSpeedKmH: number = 10): number {
  // Bounded realistic atmospheric inputs
  const T = Math.max(0, Math.min(50, temp));
  const RH = Math.max(10, Math.min(100, humidity));
  const Wind = Math.max(0, Math.min(80, windSpeedKmH));

  // Temperature factor
  const tFactor = (T + 17.8) * 0.0135;
  
  // Vapor Pressure Deficit proxy from relative humidity
  const vpdFactor = Math.max(0.15, 1 - (RH / 100));

  // Wind speed advection multiplier
  const windFactor = 1 + (Wind * 0.035);

  // Baseline ET0 in mm/day (clamped to realistic agricultural range 1.5 - 9.5 mm/day)
  const et0 = tFactor * vpdFactor * windFactor * 4.2;
  return parseFloat(Math.max(1.2, Math.min(9.8, et0)).toFixed(2));
}

/**
 * Crop Coefficient Lookup based on Crop Name and Growth Stage
 */
export function getCropCoefficient(cropName: string = 'wheat', growthStageCode: number = 2): { kc: number; cropKey: string; rootDepthCm: number } {
  const normCrop = cropName.toLowerCase().trim();
  const matchedKey = Object.keys(CROP_KC_TABLE).find(k => normCrop.includes(k)) || 'wheat';
  const cropInfo = CROP_KC_TABLE[matchedKey];

  let kc = cropInfo.mid;
  if (growthStageCode === 1) kc = cropInfo.initial;
  else if (growthStageCode === 3) kc = cropInfo.end;

  return { kc, cropKey: matchedKey, rootDepthCm: cropInfo.rootDepthCm };
}

/**
 * Precision Irrigation Decision Engine
 * Evaluates multi-variable telemetry and outputs a grounded, explainable recommendation.
 */
export function evaluateIrrigationDecision(input: IrrigationEngineInput): IrrigationRecommendationDetails {
  const assumptions: string[] = [];
  const missingInputs: string[] = [];

  const {
    soilData,
    cropName = 'Rice',
    growthStageCode = soilData?.growth_stage ?? 2,
    weatherTemp = soilData?.temperature ?? 28,
    weatherHumidity = soilData?.humidity ?? 55,
    weatherWindSpeed = soilData?.wind_speed ?? 12,
    weatherRainProb = soilData?.rainfall && soilData.rainfall > 80 ? 65 : 20,
    weatherRainfallForecastMm = soilData?.rainfall ?? 0,
    areaHa,
    zoneName = 'Main Field',
    irrigationMethod = 'drip',
    weatherTimestamp,
    soilTimestamp,
    isOffline = false
  } = input;

  // 1. DATA FRESHNESS & MISSING TELEMETRY VALIDATION
  const now = Date.now();
  let weatherAgeHours = 0;
  let soilAgeHours = 0;

  if (weatherTimestamp) {
    const wTime = new Date(weatherTimestamp).getTime();
    if (!isNaN(wTime)) weatherAgeHours = Math.max(0, (now - wTime) / (1000 * 60 * 60));
  }
  if (soilTimestamp) {
    const sTime = new Date(soilTimestamp).getTime();
    if (!isNaN(sTime)) soilAgeHours = Math.max(0, (now - sTime) / (1000 * 60 * 60));
  }

  const isStale = weatherAgeHours > 12 || soilAgeHours > 12;
  const staleReason = isStale 
    ? `Data was recorded ${Math.round(Math.max(weatherAgeHours, soilAgeHours))} hours ago. Refresh readings for real-time accuracy.` 
    : undefined;

  // Critical Missing Signal Check
  const rawMoisture = soilData ? (soilData.soil_moisture ?? (soilData as any).moisture) : undefined;

  if (rawMoisture === undefined || rawMoisture === null || isNaN(rawMoisture)) {
    missingInputs.push("Soil moisture percentage");
    return {
      statusCode: 'DATA_UNAVAILABLE',
      statusLabel: '⚠️ More Information Needed',
      severity: 'NEUTRAL',
      badgeColor: 'gray',
      what: "Soil moisture data is currently unavailable.",
      why: "We need your current soil moisture reading to calculate whether your crop needs water.",
      action: "Connect a soil sensor or enter your estimated moisture in the farm parameters.",
      when: "Before operating irrigation",
      avoid: "Do not run heavy irrigation without checking moisture to avoid water waste.",
      confidenceScore: 30,
      dataFreshness: {
        weatherTimestamp,
        weatherAgeHours,
        soilTimestamp,
        soilAgeHours,
        isStale,
        staleReason
      },
      assumptionsUsed: [],
      missingInputs,
      recommendedWindow: 'NONE'
    };
  }

  const moisture = Number(rawMoisture);

  if (!areaHa || areaHa <= 0) {
    missingInputs.push("Exact field area size (total water volume cannot be calculated)");
  }

  // 2. AGRONOMIC & DETERMINISTIC CALCULATIONS
  const { kc, cropKey, rootDepthCm } = getCropCoefficient(cropName, growthStageCode);
  const et0 = calculateReferenceET0(weatherTemp, weatherHumidity, weatherWindSpeed);
  const etc = parseFloat((et0 * kc).toFixed(2)); // Crop water requirement mm/day
  assumptions.push(`Calculated reference evapotranspiration ET₀: ${et0} mm/day (T: ${weatherTemp}°C, RH: ${weatherHumidity}%, Wind: ${weatherWindSpeed} km/h)`);
  assumptions.push(`Crop coefficient Kc: ${kc} for ${cropName} (Stage ${growthStageCode === 1 ? 'Initial' : growthStageCode === 3 ? 'Maturity' : 'Vegetative/Mid'})`);

  const soilTypeKey = soilData?.soil_type || 2;
  const soilHydro = SOIL_HYDROLOGY[soilTypeKey] || SOIL_HYDROLOGY[2];
  assumptions.push(`Soil physics model: ${soilHydro.name} (Field Capacity: ${soilHydro.fieldCapacity}%, Wilting Point: ${soilHydro.wiltingPoint}%)`);

  // Net Deficit Calculation
  // Optimal target moisture is typically around 50-60% of available water capacity
  const targetMoisture = Math.min(70, soilHydro.fieldCapacity * 1.5);
  const moistureDeficitPct = Math.max(0, targetMoisture - moisture);
  
  // Depth deficit in mm: (Deficit% / 100) * root depth in mm * soil density factor
  const rootDepthMm = rootDepthCm * 10;
  const rawDeficitMm = (moistureDeficitPct / 100) * rootDepthMm * 0.18;
  const netDeficitMm = parseFloat(Math.max(0, rawDeficitMm).toFixed(1));

  // Application Efficiency
  const effMethod = (irrigationMethod || 'drip').toLowerCase();
  const appEfficiency = IRRIGATION_METHOD_EFFICIENCY[effMethod] || IRRIGATION_METHOD_EFFICIENCY['default'];
  const grossReqMm = netDeficitMm > 0 ? parseFloat((netDeficitMm / appEfficiency).toFixed(1)) : 0;
  assumptions.push(`Application efficiency: ${Math.round(appEfficiency * 100)}% for ${irrigationMethod} system`);

  // Total Volume Calculations (strictly when area is known)
  let estimatedWaterLitersPerM2: number | undefined = grossReqMm; // 1 mm depth over 1 m² = 1 Liter
  let estimatedTotalVolumeM3: number | undefined;
  let estimatedTotalLiters: number | undefined;
  let estimatedPumpHours: number | undefined;

  if (areaHa && areaHa > 0) {
    // 1 ha = 10,000 m². 1 mm over 1 ha = 10 m³ = 10,000 Liters
    estimatedTotalVolumeM3 = Math.round(grossReqMm * 10 * areaHa);
    estimatedTotalLiters = estimatedTotalVolumeM3 * 1000;

    // Pump assumption: Standard 5HP agricultural pump (~25,000 Liters/hour flow rate)
    const pumpFlowLph = 25000;
    estimatedPumpHours = parseFloat((estimatedTotalLiters / pumpFlowLph).toFixed(1));
    assumptions.push(`Pump estimate assumes a standard 5HP borewell/submersible pump discharge rate of 25,000 L/hr`);
  }

  // 3. MULTI-SIGNAL DECISION TREE
  // Signals: moisture, weatherRainProb, weatherRainfallForecastMm, weatherTemp, weatherHumidity
  let statusCode: IrrigationStatusCode = 'MONITOR';
  let statusLabel = '👀 Monitor';
  let severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'NEUTRAL' = 'LOW';
  let badgeColor: 'danger' | 'warning' | 'info' | 'success' | 'gray' = 'info';
  let what = '';
  let why = '';
  let action = '';
  let when = '';
  let avoid = '';
  let recommendedWindow: 'MORNING' | 'AFTERNOON' | 'EVENING' | 'NONE' = 'NONE';
  let baseConfidence = 90;

  if (isStale) baseConfidence -= 20;
  if (isOffline) baseConfidence -= 10;
  if (missingInputs.length > 0) baseConfidence -= 5;

  const isRainExpected = weatherRainProb >= 55 || weatherRainfallForecastMm >= 8;
  const isExtremeRainExpected = weatherRainProb >= 75 || weatherRainfallForecastMm >= 25;
  const isSeverelyDry = moisture < 28;
  const isModeratelyDry = moisture >= 28 && moisture < 38;
  const isOptimalMoisture = moisture >= 38 && moisture <= 70;
  const isOverMoist = moisture > 70;

  // RULE 1: SOIL SATURATED OR HIGH RAIN (WAIT)
  if (isOverMoist) {
    statusCode = 'WAIT';
    statusLabel = '⏳ Wait';
    severity = 'MEDIUM';
    badgeColor = 'info';
    what = `Soil moisture is high (${moisture}%). No watering is needed.`;
    why = `The root zone currently has ample moisture reserves. Additional water risks root hypoxia and nutrient leaching.`;
    action = `Keep field drainage gates clear and monitor soil aeration.`;
    when = `Recheck in 48 hours.`;
    avoid = `Avoid operating irrigation pumps until moisture drops below 50%.`;
    recommendedWindow = 'NONE';
  }
  // RULE 2: DRY SOIL BUT SIGNIFICANT RAINFALL IMMINENT (WAIT / DELAY)
  else if (isRainExpected && !isSeverelyDry) {
    statusCode = 'WAIT';
    statusLabel = '⏳ Wait';
    severity = 'MEDIUM';
    badgeColor = 'info';
    what = `Rain is forecasted (${weatherRainProb}% probability). Hold off on watering.`;
    why = `Natural rainfall of ~${weatherRainfallForecastMm || '5-15'}mm is expected, which will replenish soil moisture naturally.`;
    action = `Pause irrigation pumps and wait for the rain event to conclude.`;
    when = `Next 24 to 48 hours. Check soil after the shower.`;
    avoid = `Avoid irrigating immediately before heavy rain to prevent runoff and ponding.`;
    recommendedWindow = 'NONE';
  }
  // RULE 3: SEVERELY DRY SOIL WITH IMMINENT HEAVY RAIN (SPECIAL CAUTION WAIT)
  else if (isSeverelyDry && isExtremeRainExpected) {
    statusCode = 'WAIT';
    statusLabel = '⏳ Wait for Rain';
    severity = 'MEDIUM';
    badgeColor = 'warning';
    what = `Soil is dry (${moisture}%), but heavy rain is arriving shortly.`;
    why = `Significant rainfall (${weatherRainfallForecastMm}mm expected) will deliver necessary water naturally within hours.`;
    action = `Inspect drainage channels to ensure incoming rain does not erode dry topsoil.`;
    when = `Observe during the rain event today.`;
    avoid = `Do not start irrigation pumps now.`;
    recommendedWindow = 'NONE';
  }
  // RULE 4: SEVERELY DRY SOIL WITH NO RAIN (WATER NOW - URGENT)
  else if (isSeverelyDry) {
    statusCode = 'WATER_NOW';
    statusLabel = '💧 Water Now';
    severity = 'CRITICAL';
    badgeColor = 'danger';
    what = `Immediate irrigation recommended for ${zoneName}.`;
    why = `Soil moisture has dropped to ${moisture}%, below the critical 28% root-stress threshold, with minimal rain forecasted.`;
    action = areaHa 
      ? `Apply approximately ${grossReqMm} mm depth (~${estimatedTotalVolumeM3?.toLocaleString()} m³ / ~${estimatedTotalLiters?.toLocaleString()} Liters) via ${irrigationMethod}.`
      : `Apply approximately ${grossReqMm} mm depth (~${grossReqMm} Liters per m²) via ${irrigationMethod}.`;
    when = weatherTemp > 32 ? `Today evening (after 6:00 PM) to minimize evaporation losses.` : `Today morning or evening.`;
    avoid = `Avoid midday watering under high sun to prevent heat shock and high evaporation.`;
    recommendedWindow = weatherTemp > 30 ? 'EVENING' : 'MORNING';
  }
  // RULE 5: MODERATELY DRY SOIL WITH NO RAIN (WATER SOON)
  else if (isModeratelyDry) {
    statusCode = 'WATER_SOON';
    statusLabel = '💧 Water Soon';
    severity = 'HIGH';
    badgeColor = 'warning';
    what = `Plan an irrigation cycle for ${zoneName} in the next 24-36 hours.`;
    why = `Soil moisture is at ${moisture}%, nearing the lower boundary for ${cropName}. Evapotranspiration is consuming ~${etc} mm/day.`;
    action = areaHa
      ? `Schedule irrigation of ~${grossReqMm} mm (~${estimatedTotalLiters?.toLocaleString()} Liters) within the next 2 days.`
      : `Schedule irrigation of ~${grossReqMm} mm (~${grossReqMm} L/m²) within the next 2 days.`;
    when = `Tomorrow morning or evening during low-wind hours.`;
    avoid = `Avoid delaying past 48 hours if no rainfall materializes.`;
    recommendedWindow = 'MORNING';
  }
  // RULE 6: HEALTHY / OPTIMAL MOISTURE WITH NO RAIN (MONITOR)
  else {
    statusCode = 'MONITOR';
    statusLabel = '👀 Monitor';
    severity = 'LOW';
    badgeColor = 'success';
    what = `Soil moisture is healthy (${moisture}%). Continue monitoring.`;
    why = `Root zone hydration is optimal for ${cropName}. Crop is drawing ~${etc} mm/day steadily.`;
    action = `Maintain existing field practices and observe daily probe readings.`;
    when = `Recheck moisture readings tomorrow evening.`;
    avoid = `Avoid premature irrigation which leaches nitrogen below root depth.`;
    recommendedWindow = 'NONE';
  }

  return {
    statusCode,
    statusLabel,
    severity,
    badgeColor,
    what,
    why,
    action,
    when,
    avoid,
    evapotranspirationMmDay: et0,
    cropCoefficientKc: kc,
    cropWaterNeedMmDay: etc,
    netIrrigationDeficitMm: netDeficitMm,
    grossIrrigationRequiredMm: grossReqMm,
    estimatedWaterLitersPerM2,
    estimatedTotalVolumeM3,
    estimatedTotalLiters,
    estimatedPumpHours,
    confidenceScore: Math.max(40, Math.min(99, baseConfidence)),
    dataFreshness: {
      weatherTimestamp,
      weatherAgeHours: parseFloat(weatherAgeHours.toFixed(1)),
      soilTimestamp,
      soilAgeHours: parseFloat(soilAgeHours.toFixed(1)),
      isStale,
      staleReason
    },
    assumptionsUsed: assumptions,
    missingInputs,
    recommendedWindow
  };
}

/**
 * Multi-Zone Irrigation Assessment
 * Evaluates every zone on the farm independently and ranks them by water stress.
 */
export function evaluateAllZones(
  zones: FarmZone[] = [],
  baselineSoil: SoilData,
  weatherTemp: number = 28,
  weatherRainProb: number = 20,
  weatherRainfallForecastMm: number = 0
): { evaluations: ZoneIrrigationEvaluation[]; criticalZone?: ZoneIrrigationEvaluation } {
  if (zones.length === 0) {
    // Generate default zone evaluation from baseline
    const singleEval = evaluateIrrigationDecision({
      soilData: baselineSoil,
      cropName: 'Rice',
      areaHa: 2.5,
      zoneName: 'Main Field',
      weatherTemp,
      weatherRainProb,
      weatherRainfallForecastMm
    });

    const evalObj: ZoneIrrigationEvaluation = {
      zoneId: 'default_zone',
      zoneName: 'Main Field',
      crop: 'Rice',
      areaHa: 2.5,
      currentMoisture: baselineSoil.soil_moisture ?? 32,
      status: singleEval.statusCode === 'WATER_NOW' ? 'critical' : singleEval.statusCode === 'WATER_SOON' ? 'warning' : 'healthy',
      statusLabel: singleEval.statusCode === 'WATER_NOW' ? '🔴 Needs Water' : singleEval.statusCode === 'WATER_SOON' ? '🟡 Getting Dry' : '🟢 Moisture OK',
      recommendation: singleEval,
      lastUpdated: 'Just now'
    };

    return {
      evaluations: [evalObj],
      criticalZone: evalObj.status === 'critical' ? evalObj : undefined
    };
  }

  const evaluations: ZoneIrrigationEvaluation[] = zones.map(zone => {
    // Synthesize soilData per zone
    const zoneSoil: SoilData = {
      ...baselineSoil,
      nitrogen: zone.nitrogen || baselineSoil.nitrogen,
      ph: zone.ph || baselineSoil.ph,
      soil_moisture: zone.moisture || baselineSoil.soil_moisture || 30
    };

    const rec = evaluateIrrigationDecision({
      soilData: zoneSoil,
      cropName: zone.assignedCrop || 'Wheat',
      areaHa: zone.areaHa || 1.0,
      zoneName: zone.name,
      weatherTemp,
      weatherRainProb,
      weatherRainfallForecastMm
    });

    let status: 'healthy' | 'warning' | 'critical' | 'unknown' = 'healthy';
    let statusLabel = '🟢 Moisture OK';

    if (rec.statusCode === 'WATER_NOW') {
      status = 'critical';
      statusLabel = '🔴 Needs Attention';
    } else if (rec.statusCode === 'WATER_SOON') {
      status = 'warning';
      statusLabel = '🟡 Getting Dry';
    } else if (rec.statusCode === 'DATA_UNAVAILABLE') {
      status = 'unknown';
      statusLabel = '⚪ No Data';
    }

    return {
      zoneId: zone.id,
      zoneName: zone.name,
      crop: zone.assignedCrop || 'Crop',
      areaHa: zone.areaHa || 1.0,
      currentMoisture: zone.moisture || 30,
      status,
      statusLabel,
      recommendation: rec,
      lastUpdated: 'Live telemetry'
    };
  });

  // Find most critical zone (highest deficit or lowest moisture)
  const sorted = [...evaluations].sort((a, b) => {
    const scoreMap = { critical: 3, warning: 2, unknown: 1, healthy: 0 };
    return scoreMap[b.status] - scoreMap[a.status] || a.currentMoisture - b.currentMoisture;
  });

  const criticalZone = sorted[0]?.status === 'critical' || sorted[0]?.status === 'warning' ? sorted[0] : undefined;

  return {
    evaluations,
    criticalZone
  };
}

/**
 * Builds a structured daily Irrigation Plan
 */
export function generateDailyIrrigationPlan(
  farmName: string,
  summaryRec: IrrigationRecommendationDetails,
  zoneEvaluations: ZoneIrrigationEvaluation[],
  weatherTemp: number,
  weatherRainProb: number
): FarmIrrigationPlan {
  const isHot = weatherTemp > 32;
  const isRainSoon = weatherRainProb >= 50;

  const morningAction = summaryRec.statusCode === 'WATER_NOW' && !isHot
    ? `Operate irrigation pumps for priority zones.`
    : `Check soil moisture telemetry and physical field condition.`;

  const afternoonAction = `No irrigation recommended. Evaporation rates are high (${summaryRec.evapotranspirationMmDay || 4.5} mm/day peak).`;

  const eveningAction = summaryRec.statusCode === 'WATER_NOW' || summaryRec.statusCode === 'WATER_SOON'
    ? isHot ? `Ideal watering window: operate drip/sprinkler systems between 6:00 PM and 9:00 PM.` : `Recheck weather radar and prepare tomorrow's schedule.`
    : isRainSoon ? `Monitor incoming rainfall radar and verify field drainage.` : `Standard evening moisture verification.`;

  return {
    id: `plan_${Date.now()}`,
    createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    farmName,
    summaryRecommendation: summaryRec,
    zoneEvaluations,
    timeline: {
      morning: {
        action: morningAction,
        recommended: summaryRec.recommendedWindow === 'MORNING',
        note: `Morning cooler hours minimize wind-drift and transpiration loss.`
      },
      afternoon: {
        action: afternoonAction,
        recommended: false,
        note: `Midday peak solar radiation creates high evaporation losses.`
      },
      evening: {
        action: eveningAction,
        recommended: summaryRec.recommendedWindow === 'EVENING' || (summaryRec.statusCode === 'WATER_NOW' && isHot),
        note: `Evening application allows deep infiltration into the root zone overnight.`
      }
    },
    weatherOutlookSummary: isRainSoon 
      ? `Rain expected soon (${weatherRainProb}% probability). Natural irrigation will assist.`
      : `Dry weather pattern (${weatherTemp}°C). Evapotranspiration is steady at ~${summaryRec.cropWaterNeedMmDay || 4.0} mm/day.`,
    criticalZoneId: zoneEvaluations.find(z => z.status === 'critical')?.zoneId
  };
}
