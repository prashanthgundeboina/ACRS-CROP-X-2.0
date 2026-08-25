import { 
  FarmAgentId, 
  FarmAgentStatus, 
  AgentRecommendation, 
  ConflictResolution 
} from '../../types/autonomous/farmAutonomousTypes';
import { AgentContext, irrigationAgent } from './agents/irrigationAgent';
import { cropHealthAgent } from './agents/cropHealthAgent';
import { soilAgent } from './agents/soilAgent';
import { weatherAgent } from './agents/weatherAgent';
import { pestDiseaseAgent } from './agents/pestDiseaseAgent';
import { marketAgent } from './agents/marketAgent';
import { financeAgent } from './agents/financeAgent';
import { harvestAgent } from './agents/harvestAgent';
import { iotHealthAgent } from './agents/iotHealthAgent';

class AgentOrchestratorService {
  public evaluateAllAgents(ctx: AgentContext & { isUsbConnected?: boolean; isSimulatorActive?: boolean; isOffline?: boolean }): {
    agentStatuses: Record<FarmAgentId, FarmAgentStatus>;
    recommendations: AgentRecommendation[];
    conflicts: ConflictResolution[];
  } {
    // 1. Evaluate all 9 specialized agents
    const irrig = irrigationAgent.evaluate(ctx);
    const crop = cropHealthAgent.evaluate(ctx);
    const soil = soilAgent.evaluate(ctx);
    const weather = weatherAgent.evaluate(ctx);
    const pest = pestDiseaseAgent.evaluate(ctx);
    const market = marketAgent.evaluate(ctx);
    const finance = financeAgent.evaluate(ctx);
    const harvest = harvestAgent.evaluate(ctx);
    const iot = iotHealthAgent.evaluate(ctx);

    const agentStatuses: Record<FarmAgentId, FarmAgentStatus> = {
      irrigation: irrig.status,
      crop_health: crop.status,
      soil: soil.status,
      weather: weather.status,
      pest_disease: pest.status,
      market: market.status,
      finance: finance.status,
      harvest: harvest.status,
      iot_health: iot.status
    };

    const allRecommendations: AgentRecommendation[] = [
      irrig.recommendation,
      crop.recommendation,
      soil.recommendation,
      weather.recommendation,
      pest.recommendation,
      market.recommendation,
      finance.recommendation,
      harvest.recommendation,
      iot.recommendation
    ];

    // 2. Conflict Detection & Deterministic Resolution
    const conflicts: ConflictResolution[] = [];

    // Conflict Rule 1: Irrigation wants watering, but Weather warns significant rainfall imminent
    const isDrySoil = (ctx.soilData.soil_moisture ?? 28) < 35;
    const isHeavyRainForecast = (ctx.weatherRainfallForecastMm ?? (ctx.soilData.rainfall > 50 ? 12 : 0)) > 6 || (ctx.weatherRainProb ?? 0) > 65;

    if (isDrySoil && isHeavyRainForecast) {
      const conflictRes: ConflictResolution = {
        id: `conf-irrig-weather-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        conflictDetected: true,
        competingAgents: [
          {
            agentId: 'irrigation',
            agentName: 'Irrigation Agent',
            advice: 'Irrigation recommended due to dry root zone (moisture < 35%).',
            priorityRank: 3 // Resource protection
          },
          {
            agentId: 'weather',
            agentName: 'Weather Agent',
            advice: 'Heavy rainfall event forecasted (>6mm / >65% rain probability).',
            priorityRank: 2 // Environmental / crop safety
          }
        ],
        winningAgent: 'weather',
        losingAgent: 'irrigation',
        deterministicReason: 'Weather precipitation overrides soil moisture trigger to prevent waterlogging, soil compaction, and electrical energy waste.',
        finalSupervisedRecommendation: {
          id: `rec-sup-rain-hold-${Date.now()}`,
          agentId: 'weather',
          agentName: 'Farm AI Supervisor (Weather Arbitration)',
          domain: 'Water & Weather Coordination',
          severity: 'MEDIUM',
          headline: 'HOLD Irrigation — Significant Rain Incoming',
          what: `Postpone pump operation. Soil is dry (${ctx.soilData.soil_moisture}%), but forecasted rainfall (~${(ctx.weatherRainfallForecastMm ?? 10).toFixed(0)} mm) will naturally replenish moisture.`,
          why: `Precipitation will adequately recharge root zone without pump electricity expenditure. Irrigating now risks saturation and root hypoxia.`,
          actionText: 'Pause Irrigation Schedule',
          when: 'Hold for next 12-18 hours; re-evaluate after storm window',
          whatToAvoid: 'Do not start irrigation pumps within 6 hours of high-confidence storm forecasts.',
          confidence: 93,
          requiredPermission: 'none',
          contributingTelemetry: {
            soilMoisture: ctx.soilData.soil_moisture,
            rainfallForecastMm: ctx.weatherRainfallForecastMm ?? 10,
            rainProbability: ctx.weatherRainProb ?? 70
          },
          conflictWith: ['irrigation'],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
        priorityHierarchyApplied: 'Rule #2 (Crop & Environmental Safety) > Rule #3 (Resource Optimization)'
      };
      conflicts.push(conflictRes);
    }

    // Conflict Rule 2: Soil wants nitrogen application, but Weather warns rain
    if ((ctx.soilData.nitrogen ?? 80) < 65 && isHeavyRainForecast) {
      const conflictRes: ConflictResolution = {
        id: `conf-soil-weather-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        conflictDetected: true,
        competingAgents: [
          {
            agentId: 'soil',
            agentName: 'Soil Agent',
            advice: 'Nitrogen level is low; broadcast urea or soluble 19-19-19.',
            priorityRank: 5 // Financial/nutritional impact
          },
          {
            agentId: 'weather',
            agentName: 'Weather Agent',
            advice: 'Precipitation will wash away surface fertilizers into drainage.',
            priorityRank: 2 // Environmental risk & financial loss
          }
        ],
        winningAgent: 'weather',
        losingAgent: 'soil',
        deterministicReason: 'Fertilizer application during imminent heavy rain results in >35% chemical leaching and environmental runoff waste.',
        finalSupervisedRecommendation: {
          id: `rec-sup-fert-hold-${Date.now()}`,
          agentId: 'weather',
          agentName: 'Farm AI Supervisor (Nutrient Preservation)',
          domain: 'Fertilizer Timing & Weather Arbitration',
          severity: 'MEDIUM',
          headline: 'DELAY Fertilizer Application — Prevent Rain Leaching',
          what: `Hold scheduled nitrogen fertigation. Soil N is low, but applying fertilizer before rain will wash nutrients off the root zone.`,
          why: `Heavy rainfall causes surface runoff and deep percolation beyond the rhizosphere, wasting 35-40% of applied fertilizer.`,
          actionText: 'Reschedule Fertigation',
          when: '24-48 hours after rain cessation once soil drain occurs',
          whatToAvoid: 'Do not broadcast dry urea or foliar spray onto wet rain-soaked canopy.',
          confidence: 95,
          requiredPermission: 'none',
          contributingTelemetry: {
            nitrogenPpm: ctx.soilData.nitrogen,
            rainForecastMm: ctx.weatherRainfallForecastMm ?? 10
          },
          conflictWith: ['soil'],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        },
        priorityHierarchyApplied: 'Rule #4 (Environmental & Input Protection) > Rule #5 (Fertilizer Schedule)'
      };
      conflicts.push(conflictRes);
    }

    return { agentStatuses, recommendations: allRecommendations, conflicts };
  }
}

export const agentOrchestratorService = new AgentOrchestratorService();
