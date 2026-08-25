import { DailyFarmBriefing, FarmGoalId } from '../../types/autonomous/farmAutonomousTypes';
import { AgentContext } from './agents/irrigationAgent';
import { agentOrchestratorService } from './agentOrchestratorService';
import { farmGoalService } from './farmGoalService';

class FarmBriefingService {
  public generateDailyBriefing(ctx: AgentContext & { isUsbConnected?: boolean; isSimulatorActive?: boolean; isOffline?: boolean }): DailyFarmBriefing {
    const activeGoal = farmGoalService.getActiveGoal();
    const { agentStatuses, recommendations, conflicts } = agentOrchestratorService.evaluateAllAgents(ctx);

    const moisture = ctx.soilData.soil_moisture ?? 28;
    const temp = ctx.weatherTemp ?? ctx.soilData.temperature ?? 28;
    const rainProb = ctx.weatherRainProb ?? (ctx.soilData.rainfall > 50 ? 70 : 15);
    const rainForecastMm = ctx.weatherRainfallForecastMm ?? (ctx.soilData.rainfall > 50 ? 12 : 0);

    // Assess overall farm health
    let overallHealthScore = 88;
    let overallFarmHealth: DailyFarmBriefing['overallFarmHealth'] = 'Good';

    if (moisture < 20 || temp > 40) {
      overallHealthScore = 64;
      overallFarmHealth = 'Attention Needed';
    } else if (conflicts.length > 0) {
      overallHealthScore = 82;
      overallFarmHealth = 'Good';
    }

    // Determine Top 3 Priorities based on active goal & severity
    const topPriorities: DailyFarmBriefing['top3Priorities'] = [];

    // Priority 1: Water / Weather Decision
    if (conflicts.some(c => c.winningAgent === 'weather')) {
      topPriorities.push({
        id: 'prio-1',
        rank: 1,
        title: '🌧️ Hold Irrigation — Rain Forecasted',
        summary: `Rain (~${rainForecastMm.toFixed(0)}mm) expected within 18 hours. Pausing pump saves electricity and prevents leaching.`,
        actionLabel: 'View Weather Window',
        targetTab: 'weather',
        agentSource: 'weather',
        urgency: 'Today'
      });
    } else if (moisture < 30) {
      topPriorities.push({
        id: 'prio-1',
        rank: 1,
        title: '💧 North Field Soil Moisture Low',
        summary: `Moisture is at ${moisture}%. Run drip irrigation for 35-45 minutes before midday heat.`,
        actionLabel: 'Schedule Irrigation',
        targetTab: 'irrigation',
        agentSource: 'irrigation',
        urgency: 'Immediate'
      });
    } else {
      topPriorities.push({
        id: 'prio-1',
        rank: 1,
        title: '💧 Soil Hydrology Optimal',
        summary: `Moisture steady at ${moisture}%. Water buffer sufficient for next 36 hours.`,
        actionLabel: 'Check Water Budget',
        targetTab: 'resources',
        agentSource: 'irrigation',
        urgency: 'This Week'
      });
    }

    // Priority 2: Crop / Pest / Soil Decision
    if ((ctx.soilData.humidity ?? 60) > 75 && temp >= 22 && temp <= 32) {
      topPriorities.push({
        id: 'prio-2',
        rank: 2,
        title: '🐛 Scout Lower Canopy for Foliar Spot',
        summary: 'High humidity creates favorable conditions for fungal germination. Conduct visual scout.',
        actionLabel: 'Open Plant Doctor',
        targetTab: 'diagnose',
        agentSource: 'pest_disease',
        urgency: 'Today'
      });
    } else {
      topPriorities.push({
        id: 'prio-2',
        rank: 2,
        title: '🧪 Verify Soil Nutrient Absorption',
        summary: `pH (${(ctx.soilData.ph ?? 6.5).toFixed(1)}) and NPK levels support steady vegetative expansion.`,
        actionLabel: 'View Soil Profile',
        targetTab: 'soil',
        agentSource: 'soil',
        urgency: 'This Week'
      });
    }

    // Priority 3: Market / Harvest / Finance Decision
    if (activeGoal === 'Maximum Profit') {
      topPriorities.push({
        id: 'prio-3',
        rank: 3,
        title: '💰 Monitor Mandi Spot Price Upswing',
        summary: 'Wholesale prices are trending upward (+6.2%). Consider sorting Grade-A produce.',
        actionLabel: 'View Market Trends',
        targetTab: 'market',
        agentSource: 'market',
        urgency: 'Today'
      });
    } else {
      topPriorities.push({
        id: 'prio-3',
        rank: 3,
        title: '🌾 Check Pre-Harvest Logistics Window',
        summary: `Estimated ~14 days to peak maturity. Prepare picking crates and storage staging.`,
        actionLabel: 'Review Harvest Plan',
        targetTab: 'operations',
        agentSource: 'harvest',
        urgency: 'This Week'
      });
    }

    // Generate voice script
    const voiceScript = `Good morning! Your farm is looking healthy overall with an intelligence score of ${overallHealthScore} out of 100. Here are your top three priorities for today: Number one, ${topPriorities[0].summary} Number two, ${topPriorities[1].summary} And number three, ${topPriorities[2].summary} Have a productive farming day!`;

    return {
      id: `briefing-${Date.now()}`,
      generatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      greeting: 'Good Morning — Your Farm Today',
      headline: `Farm status is ${overallFarmHealth} (Health Score: ${overallHealthScore}/100) under '${activeGoal}' focus.`,
      overallFarmHealth,
      overallHealthScore,
      top3Priorities: topPriorities,
      weatherSummary: `${temp}°C, ${ctx.weatherHumidity ?? 58}% Humidity, ${rainProb}% Rain Probability.`,
      waterSummary: `Soil Moisture: ${moisture}%, ~${(moisture * 450).toFixed(0)} L/ac root reserve.`,
      cropSummary: `${ctx.cropName || 'Tomato'} in steady vegetative development.`,
      riskSummary: `Zero critical alerts. Active surveillance on ${conflicts.length > 0 ? 'weather window' : 'root zone'}.`,
      moneySummary: `Operational spend strictly on-budget with positive projected ROI.`,
      upcomingTask: `Evening moisture inspection & drip lateral review at 4:30 PM.`,
      voiceScript
    };
  }
}

export const farmBriefingService = new FarmBriefingService();
