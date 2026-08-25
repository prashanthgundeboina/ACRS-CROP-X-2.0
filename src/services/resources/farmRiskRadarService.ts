import { 
  FarmRiskRadarItem, 
  FarmRiskRadarMatrix, 
  RiskRadarPillar 
} from '../../types/resources/farmResourceTypes';
import { SoilData, FarmZone } from '../../types';

export class FarmRiskRadarService {
  public evaluateFarmRiskRadar(params: {
    soilData?: SoilData;
    cropName?: string;
    temperatureC?: number;
    humidityPercent?: number;
    rainfallMm?: number;
    windSpeedKmh?: number;
    farmZones?: FarmZone[];
  }): FarmRiskRadarMatrix {
    const soil = params.soilData;
    const temp = params.temperatureC ?? 29;
    const humidity = params.humidityPercent ?? 58;
    const rain = params.rainfallMm ?? 0;
    const wind = params.windSpeedKmh ?? 14;

    const items: FarmRiskRadarItem[] = [];

    // 1. Water Pillar
    const moisture = soil?.soil_moisture ?? 28;
    let waterScore = 20;
    let waterSeverity: FarmRiskRadarItem['severity'] = 'low';
    let waterHazard = 'Moisture levels stable';
    let waterAction = 'Maintain normal precision drip schedule';
    let waterTime = '48–72 hours';

    if (moisture < 20) {
      waterScore = 75;
      waterSeverity = 'high';
      waterHazard = 'Rapid Topsoil Drying / Moisture Stress';
      waterAction = 'Initiate scheduled drip cycle in Zone A to restore field capacity';
      waterTime = 'Immediate (Today)';
    } else if (moisture < 25) {
      waterScore = 45;
      waterSeverity = 'moderate';
      waterHazard = 'Approaching Lower Moisture Threshold';
      waterAction = 'Schedule irrigation cycle within next 24 hours';
      waterTime = '24 hours';
    }

    items.push({
      pillar: 'water',
      name: 'Water Availability & Soil Hydration',
      score100: waterScore,
      severity: waterSeverity,
      primaryHazard: waterHazard,
      affectedZoneOrCrop: 'Main Field (Zone A)',
      timeToImpact: waterTime,
      mitigationAction: waterAction,
      probabilityPercent: waterScore > 50 ? 80 : 30
    });

    // 2. Weather Pillar
    let weatherScore = 15;
    let weatherSeverity: FarmRiskRadarItem['severity'] = 'low';
    let weatherHazard = 'Favorable Ambient Microclimate';
    let weatherAction = 'Standard field operations';
    let weatherTime = '3–5 days';

    if (temp >= 36) {
      weatherScore = 65;
      weatherSeverity = 'high';
      weatherHazard = 'Thermal Heatwave Stress';
      weatherAction = 'Apply light evening canopy misting or maintain soil moisture to buffer root heat';
      weatherTime = 'Today 12:00 PM – 4:00 PM';
    } else if (rain >= 30) {
      weatherScore = 70;
      weatherSeverity = 'high';
      weatherHazard = 'Heavy Rainfall / Waterlogging Risk';
      weatherAction = 'Clear drainage furrows and pause all fertigation';
      weatherTime = 'Next 24 hours';
    } else if (wind >= 30) {
      weatherScore = 50;
      weatherSeverity = 'moderate';
      weatherHazard = 'High Wind Lodging Risk';
      weatherAction = 'Inspect trellises and stake tall plants';
      weatherTime = 'Evening';
    }

    items.push({
      pillar: 'weather',
      name: 'Atmospheric & Thermal Hazards',
      score100: weatherScore,
      severity: weatherSeverity,
      primaryHazard: weatherHazard,
      affectedZoneOrCrop: 'All Open Farm Beds',
      timeToImpact: weatherTime,
      mitigationAction: weatherAction,
      probabilityPercent: weatherScore > 40 ? 70 : 20
    });

    // 3. Crop Health Pillar
    let cropScore = 25;
    let cropSeverity: FarmRiskRadarItem['severity'] = 'low';
    let cropHazard = 'Vigorous Vegetative Canopy';
    let cropAction = 'Routine weekly scouting';
    let cropTime = '7 days';

    if (humidity > 78 && temp > 24) {
      cropScore = 60;
      cropSeverity = 'moderate';
      cropHazard = 'Foliar Fungal Disease Microclimate';
      cropAction = 'Inspect lower leaves for early blight and ensure inter-row ventilation';
      cropTime = '48 hours';
    }

    items.push({
      pillar: 'crop',
      name: 'Crop Pathology & Pest Pressure',
      score100: cropScore,
      severity: cropSeverity,
      primaryHazard: cropHazard,
      affectedZoneOrCrop: params.cropName || 'Tomato Beds',
      timeToImpact: cropTime,
      mitigationAction: cropAction,
      probabilityPercent: cropScore > 50 ? 65 : 25
    });

    // 4. Soil Pillar
    let soilScore = 20;
    let soilSeverity: FarmRiskRadarItem['severity'] = 'low';
    let soilHazard = 'NPK & pH in Agronomic Balance';
    let soilAction = 'No immediate intervention';
    let soilTime = '14 days';

    if (soil && (soil.ph < 5.8 || soil.ph > 8.0)) {
      soilScore = 55;
      soilSeverity = 'moderate';
      soilHazard = 'Soil pH Imbalance / Nutrient Lockup';
      soilAction = soil.ph < 5.8 ? 'Apply agricultural lime' : 'Apply gypsum/organic compost';
      soilTime = 'Next soil preparation cycle';
    }

    items.push({
      pillar: 'soil',
      name: 'Soil Chemistry & Nutrient Balance',
      score100: soilScore,
      severity: soilSeverity,
      primaryHazard: soilHazard,
      affectedZoneOrCrop: 'Zone B & C Soil Bed',
      timeToImpact: soilTime,
      mitigationAction: soilAction,
      probabilityPercent: soilScore > 40 ? 60 : 15
    });

    // 5. Market Pillar
    items.push({
      pillar: 'market',
      name: 'Mandi Price Volatility & Demand',
      score100: 30,
      severity: 'low',
      primaryHazard: 'Normal seasonal wholesale price fluctuation',
      affectedZoneOrCrop: params.cropName || 'Wholesale Produce',
      timeToImpact: 'At harvest window',
      mitigationAction: 'Monitor Market ROI assistant target rate alerts',
      probabilityPercent: 35
    });

    // 6. Operations Pillar
    items.push({
      pillar: 'operations',
      name: 'Labor, Logistics & Equipment Readiness',
      score100: 25,
      severity: 'low',
      primaryHazard: 'Minor harvest labor tightness during peak season',
      affectedZoneOrCrop: 'Harvest Crews',
      timeToImpact: 'Upcoming harvest week',
      mitigationAction: 'Pre-book transport trolley 3 days in advance',
      probabilityPercent: 30
    });

    // Calculate Overall Weighted Score
    const maxItem = items.reduce((prev, curr) => curr.score100 > prev.score100 ? curr : prev, items[0]);
    const avgScore = Math.round(items.reduce((sum, item) => sum + item.score100, 0) / items.length);

    const prioritizedActionPlan = items
      .filter(i => i.score100 >= 40)
      .sort((a, b) => b.score100 - a.score100)
      .map(i => `[${i.pillar.toUpperCase()}] ${i.mitigationAction}`);

    if (prioritizedActionPlan.length === 0) {
      prioritizedActionPlan.push('All 6 farm risk pillars are operating in the optimal green zone.');
    }

    return {
      overallRiskScore: avgScore,
      highestRiskPillar: maxItem.pillar,
      items,
      prioritizedActionPlan
    };
  }
}

export const farmRiskRadarService = new FarmRiskRadarService();
