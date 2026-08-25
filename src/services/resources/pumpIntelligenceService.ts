import { 
  PumpIntelligenceSummary, 
  PumpAnomalyAlert 
} from '../../types/resources/farmResourceTypes';

export interface PumpTelemetryInput {
  pumpHorsePower?: number;
  activePumps?: number;
  todayRuntimeMinutes?: number;
  weeklyRuntimeMinutes?: number;
  electricityRatePerKwh?: number;
  isSoilMoistureLow?: boolean;
}

export class PumpIntelligenceService {
  public calculatePumpIntelligence(params: PumpTelemetryInput = {}): PumpIntelligenceSummary {
    const pumpHp = params.pumpHorsePower || 5; // standard 5 HP agricultural borewell pump
    const activePumps = params.activePumps || 1;
    const todayRuntimeMinutes = params.todayRuntimeMinutes ?? 105; // 1 hr 45 min
    const weeklyRuntimeMinutes = params.weeklyRuntimeMinutes ?? 640; // ~10.6 hrs
    const electricityRatePerKwh = params.electricityRatePerKwh || 4.2; // agricultural subsidised tariff in INR

    // Motor Electrical Conversion: 1 HP = 0.746 kW. Motor efficiency ~85%
    const pumpKw = (pumpHp * 0.746) / 0.85; // ~4.39 kW for 5 HP motor
    const todayHours = todayRuntimeMinutes / 60;
    const weeklyHours = weeklyRuntimeMinutes / 60;

    const todayElectricityKwh = parseFloat((pumpKw * todayHours * activePumps).toFixed(2));
    const weeklyElectricityKwh = parseFloat((pumpKw * weeklyHours * activePumps).toFixed(2));

    const todayElectricityCostInr = Math.round(todayElectricityKwh * electricityRatePerKwh);

    // Pump Flow Rate: Standard 5 HP pump delivers ~350 Liters/min (21,000 L/hr)
    const flowRateLpm = pumpHp * 70; // 350 LPM
    const todayWaterDeliveredLiters = Math.round(todayRuntimeMinutes * flowRateLpm);

    // Anomaly Detection
    const anomalyAlerts: PumpAnomalyAlert[] = [];

    if (todayRuntimeMinutes > 150) {
      anomalyAlerts.push({
        id: 'alert_long_run',
        type: 'long_runtime',
        title: '⚠️ Unusually Long Pump Runtime Detected',
        description: `Pump has operated for ${todayRuntimeMinutes} minutes today, which is 35% above the recommended single-session threshold.`,
        severity: 'medium',
        suggestedCheck: 'Check field emitters for line blowouts or verify automated valve timer cutoff.'
      });
    }

    if (weeklyRuntimeMinutes > 800) {
      anomalyAlerts.push({
        id: 'alert_freq_cycles',
        type: 'frequent_cycles',
        title: '⚡ High Cumulative Energy Consumption',
        description: `Weekly motor usage reached ${weeklyElectricityKwh} kWh (~₹${Math.round(weeklyElectricityKwh * electricityRatePerKwh)}).`,
        severity: 'low',
        suggestedCheck: 'Consider shifting to late evening or night off-peak tariff hours if available.'
      });
    }

    let efficiencyRating: PumpIntelligenceSummary['efficiencyRating'] = 'optimal';
    if (anomalyAlerts.some(a => a.severity === 'high')) {
      efficiencyRating = 'review_required';
    } else if (anomalyAlerts.length > 0) {
      efficiencyRating = 'moderate';
    }

    return {
      pumpHorsePower: pumpHp,
      activePumps,
      todayRuntimeMinutes,
      weeklyRuntimeMinutes,
      todayWaterDeliveredLiters,
      todayElectricityKwh,
      weeklyElectricityKwh,
      todayElectricityCostInr,
      electricityRatePerKwh,
      anomalyAlerts,
      efficiencyRating
    };
  }
}

export const pumpIntelligenceService = new PumpIntelligenceService();
