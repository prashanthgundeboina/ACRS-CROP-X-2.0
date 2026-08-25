import { 
  AgentRecommendation, 
  FarmAgentStatus 
} from '../../../types/autonomous/farmAutonomousTypes';
import { AgentContext } from './irrigationAgent';
import { evaluateCropRisk } from '../../cropRiskEngine';

export const cropHealthAgent = {
  id: 'crop_health' as const,
  name: 'Crop Health & Digital Twin Agent',
  role: 'Monitors vegetative vigor, digital twin growth progression, chlorophyll index, and physiological canopy stress.',
  icon: 'Sprout',

  evaluate(ctx: AgentContext): {
    status: FarmAgentStatus;
    recommendation: AgentRecommendation;
  } {
    const riskEval = evaluateCropRisk({
      soilData: ctx.soilData,
      farmZones: ctx.farmZones,
      cropName: ctx.cropName,
      weatherTemp: ctx.weatherTemp,
      weatherRainProb: ctx.weatherRainProb,
      weatherRainfallForecastMm: ctx.weatherRainfallForecastMm,
      weatherHumidity: ctx.weatherHumidity
    });
    const temp = ctx.weatherTemp ?? ctx.soilData.temperature ?? 28;
    const moisture = ctx.soilData.soil_moisture ?? 28;
    const latestObs = ctx.recentVisionObservations && ctx.recentVisionObservations.length > 0
      ? ctx.recentVisionObservations[0]
      : null;

    let severity: AgentRecommendation['severity'] = 'LOW';
    let headline = 'Canopy Vigor & Growth Steady';
    let what = `Vegetative canopy is in healthy vegetative growth with optimal leaf area expansion.`;
    let why = `Thermal comfort index is balanced (${temp}°C) and soil moisture supports transpiration without wilting stress.`;
    let actionText = 'Log Health Check';
    let when = 'Perform routine field walk this evening';
    let whatToAvoid = 'Avoid physical tractor compaction near root halos.';
    let confidence = 93;

    if (latestObs && latestObs.detection.detectedStresses.length > 0) {
      severity = 'HIGH';
      const stressType = latestObs.detection.detectedStresses[0].type;
      headline = `Vision Camera Flag: ${stressType.replace(/_/g, ' ').toUpperCase()}`;
      what = latestObs.advice.whatISee;
      why = `Optical camera scout detected ${stressType} in ${latestObs.zoneName} (${latestObs.detection.canopyCoveragePercent}% canopy coverage). Corroborated with ${moisture}% soil moisture.`;
      actionText = latestObs.advice.actionBadge;
      when = latestObs.advice.whenToAct;
      whatToAvoid = latestObs.advice.whatNotToDo;
      confidence = latestObs.advice.confidenceScore;
    } else if (riskEval.overallLevel === 'HIGH' || moisture < 22 || temp > 38) {
      severity = 'HIGH';
      headline = 'Physiological Heat & Moisture Stress Detected';
      what = `Inspect lower foliage for turgidity loss or early leaf curling in exposed canopy zones.`;
      why = `Combination of ambient temperature (${temp}°C) and soil water depletion causes stomatal closure and vegetative slowdown.`;
      actionText = 'Conduct Visual Scout';
      when = 'Within 4 hours before solar noon';
      whatToAvoid = 'Do not apply heavy systemic chemicals during active wilting stress.';
      confidence = 90;
    }

    const recommendation: AgentRecommendation = {
      id: `rec-crop-${Date.now()}`,
      agentId: 'crop_health',
      agentName: 'Crop Health & Digital Twin Agent',
      domain: 'Canopy Health & Growth Stage',
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
        cropStressScore: riskEval.overallScore,
        canopyTemperatureC: temp,
        growthStage: 'Mid-Vegetative Flowering',
        chlorophyllIndexNdvi: 0.74
      },
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const status: FarmAgentStatus = {
      agentId: 'crop_health',
      name: 'Crop Health Agent',
      role: 'Biomass & Stress Monitoring',
      icon: 'Sprout',
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
