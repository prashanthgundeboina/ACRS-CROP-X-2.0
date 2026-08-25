import { 
  AgentRecommendation, 
  FarmAgentStatus 
} from '../../../types/autonomous/farmAutonomousTypes';
import { SoilData, FarmZone } from '../../../types';
import { evaluateIrrigationDecision } from '../../irrigationEngine';
import { waterBudgetService } from '../../resources/waterBudgetService';

export interface AgentContext {
  soilData: SoilData;
  cropName: string;
  farmAreaAcres?: number;
  farmZones?: FarmZone[];
  weatherTemp?: number;
  weatherHumidity?: number;
  weatherRainProb?: number;
  weatherRainfallForecastMm?: number;
  isRaining?: boolean;
  recentVisionObservations?: any[];
}

export const irrigationAgent = {
  id: 'irrigation' as const,
  name: 'Irrigation & Hydrology Agent',
  role: 'Analyzes soil moisture, rainfall forecasts, ETc crop water demands, and pump capacity to optimize watering cycles.',
  icon: 'Droplets',

  evaluate(ctx: AgentContext): {
    status: FarmAgentStatus;
    recommendation: AgentRecommendation;
  } {
    const moisture = ctx.soilData.soil_moisture ?? 28;
    const rainForecastMm = ctx.weatherRainfallForecastMm ?? (ctx.soilData.rainfall > 50 ? 12 : 0);
    const temp = ctx.weatherTemp ?? ctx.soilData.temperature ?? 28;
    const humidity = ctx.weatherHumidity ?? ctx.soilData.humidity ?? 55;

    const waterBudget = waterBudgetService.calculateWaterBudget({
      farmAreaAcres: ctx.farmAreaAcres || 3.5,
      cropName: ctx.cropName || 'Tomato',
      soilMoisturePercent: moisture,
      temperatureC: temp,
      humidityPercent: humidity,
      rainfallMm: rainForecastMm
    });

    const isDry = moisture < 35;
    const isCriticallyDry = moisture < 22;
    const isHeavyRainImminent = rainForecastMm > 8 || (ctx.weatherRainProb ?? 0) > 70;

    let headline = 'Maintain Standard Schedule';
    let what = `Soil moisture is stable at ${moisture}%. Keep standard moisture surveillance.`;
    let why = `Root zone moisture (${moisture}%) matches optimal vegetative transpiration range with zero acute deficit.`;
    let actionText = 'Monitor Zone';
    let when = 'Next scheduled evaluation at 4:00 PM';
    let whatToAvoid = 'Avoid overwatering to prevent soil saturation and root hypoxia.';
    let severity: AgentRecommendation['severity'] = 'LOW';
    let confidence = 94;

    if (isHeavyRainImminent) {
      headline = 'Hold Irrigation — Significant Rain Imminent';
      what = `Postpone all pump cycles. Rain forecast indicates ~${rainForecastMm.toFixed(1)} mm precipitation incoming.`;
      why = `Precipitation will naturally replenish soil moisture. Irrigating now will trigger nutrient leaching and runoff.`;
      actionText = 'Pause Scheduled Cycle';
      when = 'Hold for next 12-18 hours until storm window passes';
      whatToAvoid = 'Do not run pump immediately before or during rainfall.';
      severity = 'MEDIUM';
      confidence = 91;
    } else if (isCriticallyDry) {
      headline = 'Critical Irrigation Required — Soil Moisture Deficit';
      what = `Deliver ~${waterBudget.dailyRequirementLiters.toLocaleString()} Liters across active zones (estimated 45 min drip cycle).`;
      why = `Soil moisture has dropped to ${moisture}% (critical threshold <25%). Transpiration stress threatens cell turgidity and yield.`;
      actionText = 'Request Pump Start';
      when = 'Immediate — Execute within 2 hours (Early Morning/Evening window preferred)';
      whatToAvoid = 'Avoid midday flood application during peak heat to minimize evaporative loss.';
      severity = 'CRITICAL';
      confidence = 96;
    } else if (isDry) {
      headline = 'Irrigation Recommended for Root Moisture Replenishment';
      what = `Run drip lateral lines for 35 minutes delivering approximately ${(waterBudget.dailyRequirementLiters * 0.8).toFixed(0)} L.`;
      why = `Moisture is at ${moisture}%, transitioning below optimal field capacity for ${ctx.cropName}.`;
      actionText = 'Schedule Irrigation';
      when = 'Within 6 hours (6:00 AM - 9:00 AM or after 5:00 PM)';
      whatToAvoid = 'Avoid uneven emitter pressure across elevated lateral rows.';
      severity = 'HIGH';
      confidence = 92;
    }

    const recommendation: AgentRecommendation = {
      id: `rec-irrig-${Date.now()}`,
      agentId: 'irrigation',
      agentName: 'Irrigation & Hydrology Agent',
      domain: 'Water & Soil Moisture',
      severity,
      headline,
      what,
      why,
      actionText,
      when,
      whatToAvoid,
      confidence,
      requiredPermission: severity === 'CRITICAL' || severity === 'HIGH' ? 'supervised' : 'none',
      contributingTelemetry: {
        soilMoisturePercent: moisture,
        temperatureC: temp,
        rainfallForecastMm: rainForecastMm,
        dailyWaterRequirementL: waterBudget.dailyRequirementLiters,
        daysReserveRemaining: waterBudget.daysOfAvailableWater
      },
      conflictWith: isHeavyRainImminent ? ['weather'] : [],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const status: FarmAgentStatus = {
      agentId: 'irrigation',
      name: 'Irrigation Agent',
      role: 'Hydrology & Pump Automation',
      icon: 'Droplets',
      status: severity === 'CRITICAL' ? 'alert' : severity === 'HIGH' ? 'warning' : 'active',
      lastEvaluated: 'Just now',
      confidenceScore: confidence,
      activeAlertCount: severity === 'CRITICAL' || severity === 'HIGH' ? 1 : 0,
      currentRecommendation: recommendation,
      contributingTelemetry: recommendation.contributingTelemetry,
      conflictsDetected: isHeavyRainImminent ? ['Rain forecast overrides dry soil signal'] : []
    };

    return { status, recommendation };
  }
};
