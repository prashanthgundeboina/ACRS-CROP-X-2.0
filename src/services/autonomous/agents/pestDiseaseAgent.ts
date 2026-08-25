import { 
  AgentRecommendation, 
  FarmAgentStatus 
} from '../../../types/autonomous/farmAutonomousTypes';
import { AgentContext } from './irrigationAgent';

export const pestDiseaseAgent = {
  id: 'pest_disease' as const,
  name: 'Pest & Pathogen Scouting Agent',
  role: 'Calculates environmental fungal spore germination index and regional insect vector pressure without false disease diagnosis claims.',
  icon: 'Bug',

  evaluate(ctx: AgentContext): {
    status: FarmAgentStatus;
    recommendation: AgentRecommendation;
  } {
    const humidity = ctx.weatherHumidity ?? ctx.soilData.humidity ?? 60;
    const temp = ctx.weatherTemp ?? ctx.soilData.temperature ?? 28;
    const pestPressure = ctx.soilData.pest_pressure ?? 1;

    // Environmental favorable condition for fungal germination: sustained humidity > 75% + temp 22-30°C
    const isFungalRiskElevated = humidity > 75 && temp >= 22 && temp <= 32;

    let severity: AgentRecommendation['severity'] = 'LOW';
    let headline = 'Low Environmental Disease Pressure';
    let what = `Environmental pathogen indices are within safe baseline bounds. Continue routine weekly scouting.`;
    let why = `Moderate canopy relative humidity (${humidity}%) prevents sustained leaf-wetness spore germination.`;
    let actionText = 'Log Field Scout';
    let when = 'Routine schedule (Every 3-4 days)';
    let whatToAvoid = 'Avoid unnecessary chemical prophylactic sprays when pest threshold is zero.';
    let confidence = 91;

    if (isFungalRiskElevated || pestPressure > 2) {
      severity = 'HIGH';
      headline = 'Microclimate Risk for Foliar Spot / Blight Inoculation';
      what = `Conduct close physical inspection of lower leaf undersides for early chlorotic lesions or sucking pests. Scan suspicious leaves with CroperX Plant Doctor.`;
      why = `High overnight relative humidity (${humidity}%) at ${temp}°C creates optimal leaf wetness duration for fungal spore germination. Note: Physical scouting required before diagnosis confirmation.`;
      actionText = 'Open Plant Doctor AI';
      when = 'Within 24 hours (Morning scouting recommended)';
      whatToAvoid = 'Never assume confirmed disease without visual leaf scan verification; do not broadcast broad-spectrum chemicals blindly.';
      confidence = 89;
    }

    const recommendation: AgentRecommendation = {
      id: `rec-pest-${Date.now()}`,
      agentId: 'pest_disease',
      agentName: 'Pest & Pathogen Scouting Agent',
      domain: 'Pathogen & Insect Pressure',
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
        canopyHumidityPercent: humidity,
        canopyTemperatureC: temp,
        leafWetnessRiskScore: isFungalRiskElevated ? 68 : 25,
        regionalPestPressureLevel: pestPressure > 2 ? 'Elevated' : 'Low'
      },
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const status: FarmAgentStatus = {
      agentId: 'pest_disease',
      name: 'Pest & Disease Agent',
      role: 'Microclimate Pathogen Surveillance',
      icon: 'Bug',
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
