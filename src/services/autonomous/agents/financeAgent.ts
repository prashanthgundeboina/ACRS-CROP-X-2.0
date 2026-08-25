import { 
  AgentRecommendation, 
  FarmAgentStatus 
} from '../../../types/autonomous/farmAutonomousTypes';
import { AgentContext } from './irrigationAgent';
import { farmEconomicsService } from '../../resources/farmEconomicsService';

export const financeAgent = {
  id: 'finance' as const,
  name: 'Farm Finance & ROI Agent',
  role: 'Audits operational expenditures, calculates margin per acre, tracks fertilizer/diesel costs, and protects seasonal profit margins.',
  icon: 'Coins',

  evaluate(ctx: AgentContext): {
    status: FarmAgentStatus;
    recommendation: AgentRecommendation;
  } {
    const economics = farmEconomicsService.calculateEconomics({
      cropName: ctx.cropName || 'Tomato',
      farmAreaAcres: ctx.farmAreaAcres || 3.5
    });

    const budgetBuffer = economics.totalPlannedCost - economics.totalActualCost;

    let severity: AgentRecommendation['severity'] = 'LOW';
    let headline = `Seasonal Profit Projected at ₹${economics.expectedProfit.toLocaleString()} (+${economics.roiPercentage}% ROI)`;
    let what = `Farm operational expenses (₹${economics.totalActualCost.toLocaleString()}) are strictly within your seasonal budget (₹${economics.totalPlannedCost.toLocaleString()}).`;
    let why = `Cost per acre stands at ₹${economics.costPerAcre.toLocaleString()}/ac with a remaining budget buffer of ₹${budgetBuffer.toLocaleString()}.`;
    let actionText = 'View Cost Ledger';
    let when = 'Ongoing expense tracking';
    let whatToAvoid = 'Avoid unbudgeted emergency chemical purchases without consulting alternative generic inputs.';
    let confidence = 95;

    if (budgetBuffer < 0) {
      severity = 'HIGH';
      headline = `Budget Overrun Warning (Over by ₹${Math.abs(budgetBuffer).toLocaleString()})`;
      what = `Operational expenditure has exceeded target allocation primarily in input and manual labor categories.`;
      why = `Total expenditure of ₹${economics.totalActualCost.toLocaleString()} exceeds the planned ceiling of ₹${economics.totalPlannedCost.toLocaleString()}.`;
      actionText = 'Review Input Expenses';
      when = 'Before ordering next chemical or fertilizer lot';
      whatToAvoid = 'Do not purchase premium branded foliar additives where standard NPK suffices.';
      confidence = 96;
    }

    const recommendation: AgentRecommendation = {
      id: `rec-fin-${Date.now()}`,
      agentId: 'finance',
      agentName: 'Farm Finance & ROI Agent',
      domain: 'Farm Economics & Working Capital',
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
        totalSpentInr: economics.totalActualCost,
        budgetBufferInr: budgetBuffer,
        expectedProfitInr: economics.expectedProfit,
        roiPercent: economics.roiPercentage,
        costPerAcreInr: economics.costPerAcre
      },
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const status: FarmAgentStatus = {
      agentId: 'finance',
      name: 'Finance & ROI Agent',
      role: 'Capital & Expenditure Guardian',
      icon: 'Coins',
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
