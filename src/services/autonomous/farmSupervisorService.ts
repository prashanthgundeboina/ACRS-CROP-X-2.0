import { 
  DailyFarmBriefing, 
  FarmEmergencyAlert, 
  FarmAgentStatus, 
  AgentRecommendation, 
  ConflictResolution,
  FarmAgentId
} from '../../types/autonomous/farmAutonomousTypes';
import { AgentContext } from './agents/irrigationAgent';
import { agentOrchestratorService } from './agentOrchestratorService';
import { farmBriefingService } from './farmBriefingService';
import { farmGoalService } from './farmGoalService';
import { farmEventEngine } from './farmEventEngine';
import { farmActionPermissionService } from './farmActionPermissionService';
import { farmAuditLogService } from './farmAuditLogService';

export interface SupervisorState {
  dailyBriefing: DailyFarmBriefing;
  emergencyAlert: FarmEmergencyAlert | null;
  agentStatuses: Record<FarmAgentId, FarmAgentStatus>;
  recommendations: AgentRecommendation[];
  conflicts: ConflictResolution[];
  lastEvaluationTime: string;
}

class FarmSupervisorService {
  private lastEvaluationTime: string = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  public evaluateFarm(ctx: AgentContext & { isUsbConnected?: boolean; isSimulatorActive?: boolean; isOffline?: boolean }): SupervisorState {
    this.lastEvaluationTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // 1. Run multi-agent orchestration
    const { agentStatuses, recommendations, conflicts } = agentOrchestratorService.evaluateAllAgents(ctx);

    // 2. Generate daily briefing
    const dailyBriefing = farmBriefingService.generateDailyBriefing(ctx);

    // 3. Emergency Mode Trigger Checks
    let emergencyAlert: FarmEmergencyAlert | null = null;
    const temp = ctx.weatherTemp ?? ctx.soilData.temperature ?? 28;
    const moisture = ctx.soilData.soil_moisture ?? 28;
    const isHeavyStorm = (ctx.weatherRainfallForecastMm ?? 0) > 35;
    const isExtremeHeat = temp > 42;
    const isExtremeDrought = moisture < 18;

    if (isExtremeHeat) {
      emergencyAlert = {
        id: `emerg-heat-${Date.now()}`,
        title: '🚨 CRITICAL HEAT & TRANSPIRATION EMERGENCY',
        severity: 'critical',
        triggerType: 'Extreme Heat Wave (>42°C)',
        whatHappened: `Ambient field temperature reached ${temp}°C, causing acute vapor pressure deficit and severe wilting risk.`,
        affectedField: 'All Open Canopy Zones',
        seriousnessLevel: 'Critical Emergency',
        whatToDoNow: 'Run short pulse misting / drip cycles for 20 minutes before 10:00 AM to cool root zones.',
        whatToAvoid: 'Do not apply chemical fertilizers or high-salinity foliar sprays during peak heat.',
        whenToCheckAgain: 'Recheck canopy turgidity every 2 hours until sunset.',
        isActive: true,
        timestamp: this.lastEvaluationTime
      };
    } else if (isHeavyStorm) {
      emergencyAlert = {
        id: `emerg-storm-${Date.now()}`,
        title: '🚨 HEAVY STORM & WATERLOGGING ADVISORY',
        severity: 'high',
        triggerType: 'Severe Precipitation (>35mm)',
        whatHappened: `Severe rainfall storm front approaching (~${ctx.weatherRainfallForecastMm} mm). Rapid soil saturation expected.`,
        affectedField: 'Low-Lying Drainage Quadrants',
        seriousnessLevel: 'High Risk',
        whatToDoNow: 'Clear farm drainage furrows and lateral outlets to prevent root zone waterlogging.',
        whatToAvoid: 'Do not run irrigation pumps or leave open fertilizer bags outdoors.',
        whenToCheckAgain: 'Inspect drainage channels after 4 hours.',
        isActive: true,
        timestamp: this.lastEvaluationTime
      };
    } else if (isExtremeDrought) {
      emergencyAlert = {
        id: `emerg-moist-${Date.now()}`,
        title: '🚨 ACUTE SOIL MOISTURE DEFICIT WARNING',
        severity: 'critical',
        triggerType: 'Severe Root Dehydration (<18%)',
        whatHappened: `Root zone moisture has plummeted to ${moisture}%, breaching permanent wilting point thresholds.`,
        affectedField: 'Zone A (North Block)',
        seriousnessLevel: 'Critical Emergency',
        whatToDoNow: 'Initiate emergency drip irrigation cycle immediately (approx. 45-60 minutes).',
        whatToAvoid: 'Avoid delayed watering; stomatal closure will abort reproductive flowers.',
        whenToCheckAgain: 'Verify sensor infiltration curve within 60 minutes after pump start.',
        isActive: true,
        timestamp: this.lastEvaluationTime
      };
    }

    return {
      dailyBriefing,
      emergencyAlert,
      agentStatuses,
      recommendations,
      conflicts,
      lastEvaluationTime: this.lastEvaluationTime
    };
  }
}

export const farmSupervisorService = new FarmSupervisorService();
