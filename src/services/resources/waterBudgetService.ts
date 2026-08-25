import { WaterBudgetSummary } from '../../types/resources/farmResourceTypes';

export interface WaterBudgetInputParams {
  farmAreaAcres: number;
  cropName: string;
  growthStageName?: string;
  soilMoisturePercent: number;
  temperatureC?: number;
  humidityPercent?: number;
  rainfallMm?: number;
  waterSourceType?: 'borewell' | 'canal' | 'farm_pond' | 'rainwater_tank';
  sourceCapacityLiters?: number;
  waterUsedTodayLiters?: number;
}

// Crop Kc Coefficients across growth stages
const CROP_KC_MAP: Record<string, { initial: number; mid: number; end: number }> = {
  Tomato: { initial: 0.6, mid: 1.15, end: 0.8 },
  Rice: { initial: 1.05, mid: 1.20, end: 0.90 },
  Maize: { initial: 0.4, mid: 1.15, end: 0.7 },
  Wheat: { initial: 0.35, mid: 1.15, end: 0.45 },
  Cotton: { initial: 0.45, mid: 1.20, end: 0.65 },
  Sugarcane: { initial: 0.4, mid: 1.25, end: 0.75 },
  Default: { initial: 0.5, mid: 1.1, end: 0.7 }
};

export class WaterBudgetService {
  public calculateWaterBudget(params: WaterBudgetInputParams): WaterBudgetSummary {
    const areaAcres = params.farmAreaAcres || 3.5;
    const areaSquareMeters = areaAcres * 4046.86;
    const crop = params.cropName || 'Tomato';
    const moisture = params.soilMoisturePercent ?? 28;
    const temp = params.temperatureC ?? 28;
    const humidity = params.humidityPercent ?? 55;
    const rainfallMm = params.rainfallMm ?? 0;

    // Source Capacity (Defaults to 150,000 L borewell/storage recharge)
    const totalSourceCapacityLiters = params.sourceCapacityLiters || 150000;
    const waterUsedTodayLiters = params.waterUsedTodayLiters || (moisture < 25 ? 5200 : 3100);

    // 1. Reference Evapotranspiration (ET0) estimation via Hargreaves/Simplified Penman
    // Higher temp + lower humidity = higher ET0
    const baseEt0 = 3.5 + (temp - 25) * 0.15 + (100 - humidity) * 0.02;
    const evapotranspirationEt0Mm = Math.max(2.0, Math.min(8.5, parseFloat(baseEt0.toFixed(2))));

    // 2. Crop Coefficient (Kc) based on stage
    const kcProfile = CROP_KC_MAP[crop] || CROP_KC_MAP.Default;
    let cropKcFactor = kcProfile.mid;
    if (params.growthStageName?.toLowerCase().includes('germination') || params.growthStageName?.toLowerCase().includes('seedling')) {
      cropKcFactor = kcProfile.initial;
    } else if (params.growthStageName?.toLowerCase().includes('matur') || params.growthStageName?.toLowerCase().includes('harvest')) {
      cropKcFactor = kcProfile.end;
    }

    // 3. Crop Evapotranspiration (ETc in mm)
    const cropStageEtcMm = parseFloat((evapotranspirationEt0Mm * cropKcFactor).toFixed(2));

    // 4. Daily volumetric requirement in Liters
    // 1 mm water over 1 sq meter = 1 Liter
    const grossDailyLiters = cropStageEtcMm * areaSquareMeters;

    // 5. Rainfall contribution offset
    // 75% effective rainfall factor
    const effectiveRainMm = rainfallMm * 0.75;
    const rainOffsetLiters = Math.round(effectiveRainMm * areaSquareMeters);

    // Net Daily Requirement
    const netDailyRequirementLiters = Math.max(0, Math.round(grossDailyLiters - rainOffsetLiters));
    const weeklyRequirementLiters = netDailyRequirementLiters * 7;

    // Remaining source capacity
    const waterRemainingSourceLiters = Math.max(0, totalSourceCapacityLiters - (waterUsedTodayLiters * 4)); // estimated active usage
    const waterDeficitLiters = Math.max(0, netDailyRequirementLiters - (waterRemainingSourceLiters / 10));

    // Days of available water left
    const effectiveDailyBurn = netDailyRequirementLiters > 0 ? netDailyRequirementLiters : 1000;
    const daysOfAvailableWater = Math.max(0, Math.floor(waterRemainingSourceLiters / effectiveDailyBurn));

    const isDeficitCritical = daysOfAvailableWater < 7 || (moisture < 20 && waterRemainingSourceLiters < netDailyRequirementLiters * 2);

    let farmerFriendlyMessage = `💧 Your farm may need approximately ${netDailyRequirementLiters.toLocaleString()} L of water today.`;
    if (rainOffsetLiters > 1000) {
      farmerFriendlyMessage = `🌧️ Natural rainfall saved ~${rainOffsetLiters.toLocaleString()} L today. Adjusted irrigation requirement is ${netDailyRequirementLiters.toLocaleString()} L.`;
    } else if (isDeficitCritical) {
      farmerFriendlyMessage = `⚠️ Water reserve warning: only ${daysOfAvailableWater} days of water remaining at current transpiration rates.`;
    }

    return {
      dailyRequirementLiters: netDailyRequirementLiters,
      weeklyRequirementLiters,
      waterUsedTodayLiters,
      waterRemainingSourceLiters,
      totalSourceCapacityLiters,
      waterDeficitLiters,
      daysOfAvailableWater,
      isDeficitCritical,
      cropStageEtcMm,
      rainOffsetLiters,
      evapotranspirationEt0Mm,
      cropKcFactor,
      farmerFriendlyMessage
    };
  }
}

export const waterBudgetService = new WaterBudgetService();
