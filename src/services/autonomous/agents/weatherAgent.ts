import { 
  AgentRecommendation, 
  FarmAgentStatus 
} from '../../../types/autonomous/farmAutonomousTypes';
import { AgentContext } from './irrigationAgent';

export const weatherAgent = {
  id: 'weather' as const,
  name: 'Weather & Microclimate Agent',
  role: 'Analyzes live atmospheric telemetry, 7-day precipitation forecasts, convective wind gusts, and thermal inversion hazards.',
  icon: 'CloudSun',

  evaluate(ctx: AgentContext): {
    status: FarmAgentStatus;
    recommendation: AgentRecommendation;
  } {
    const temp = ctx.weatherTemp ?? ctx.soilData.temperature ?? 29;
    const rainForecastMm = ctx.weatherRainfallForecastMm ?? (ctx.soilData.rainfall > 50 ? 14 : 0);
    const rainProb = ctx.weatherRainProb ?? (rainForecastMm > 5 ? 75 : 20);
    const windSpeedKmh = ctx.soilData.wind_speed ?? 14;

    let severity: AgentRecommendation['severity'] = 'LOW';
    let headline = 'Weather Window Favorable for Farm Tasks';
    let what = `Clear atmospheric conditions. Temperature: ${temp}°C, Wind: ${windSpeedKmh} km/h, Rain Chance: ${rainProb}%.`;
    let why = `Thermal and wind parameters sit within safe operational thresholds for foliar spraying and standard farm operations.`;
    let actionText = 'View 7-Day Forecast';
    let when = 'Valid for next 24 hours';
    let whatToAvoid = 'No immediate weather hazards detected.';
    let confidence = 96;

    if (rainForecastMm > 10 || rainProb > 70) {
      severity = 'HIGH';
      headline = `Heavy Precipitation Window Approaching (${rainForecastMm.toFixed(1)} mm)`;
      what = `Expected rainfall event within 12-24 hours. Postpone open broadcasting, pesticide spraying, and irrigation.`;
      why = `High rain probability will cause spray wash-off, soil saturation, and chemical runoff loss into drainage ditches.`;
      actionText = 'Postpone Spray & Irrigation';
      when = 'Effective immediately for next 18 hours';
      whatToAvoid = 'Do not apply foliar sprays or broadcast nitrogen fertilizers before downpour.';
      confidence = 94;
    } else if (temp > 38) {
      severity = 'HIGH';
      headline = `High Heat Threat (${temp}°C) — Elevated Evapotranspiration`;
      what = `Deploy micro-misting or early morning pulse irrigation to cool canopy root zones.`;
      why = `Ambient heat exceeding 38°C drives rapid vapor pressure deficit (VPD) spike and blossom drop in flowering crops.`;
      actionText = 'Review Heat Mitigation';
      when = 'Prior to 11:00 AM';
      whatToAvoid = 'Avoid field operations during peak solar exposure (12:00 PM - 3:30 PM).';
      confidence = 92;
    }

    const recommendation: AgentRecommendation = {
      id: `rec-weather-${Date.now()}`,
      agentId: 'weather',
      agentName: 'Weather & Microclimate Agent',
      domain: 'Atmospheric & Climate Hazards',
      severity,
      headline,
      what,
      why,
      actionText,
      when,
      whatToAvoid,
      confidence,
      requiredPermission: 'none',
      contributingTelemetry: {
        temperatureC: temp,
        rainfallForecastMm: rainForecastMm,
        rainProbabilityPercent: rainProb,
        windSpeedKmh: windSpeedKmh,
        humidityPercent: ctx.soilData.humidity ?? 58
      },
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const status: FarmAgentStatus = {
      agentId: 'weather',
      name: 'Weather Agent',
      role: 'Microclimate & Forecast Guardian',
      icon: 'CloudSun',
      status: severity === 'HIGH' ? 'warning' : 'active',
      lastEvaluated: 'Just now',
      confidenceScore: confidence,
      activeAlertCount: severity === 'HIGH' ? 1 : 0,
      currentRecommendation: recommendation,
      contributingTelemetry: recommendation.contributingTelemetry,
      conflictsDetected: []
    };

    return { status, recommendation };
  }
};
