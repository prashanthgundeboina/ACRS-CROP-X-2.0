import { 
  AgentRecommendation, 
  FarmAgentStatus 
} from '../../../types/autonomous/farmAutonomousTypes';
import { AgentContext } from './irrigationAgent';
import { marketDecisionService } from '../../operations/marketDecisionService';

export const marketAgent = {
  id: 'market' as const,
  name: 'Market & Mandi Price Agent',
  role: 'Tracks transparent APMC Mandi spot prices, wholesale arrival volumes, and sell vs hold arbitrage windows.',
  icon: 'TrendingUp',

  evaluate(ctx: AgentContext): {
    status: FarmAgentStatus;
    recommendation: AgentRecommendation;
  } {
    const benchmark = marketDecisionService.getMarketBenchmark(ctx.cropName || 'Tomato');
    const scenarios = marketDecisionService.evaluateScenarios({ cropName: ctx.cropName || 'Tomato' });
    const recommendedScenario = scenarios.find(s => s.recommended) || scenarios[0];

    let severity: AgentRecommendation['severity'] = 'LOW';
    let headline = `Spot Market Price: ₹${(benchmark.current * 100).toFixed(0)}/Q (${benchmark.trend === 'up' ? '+Rising Trend' : benchmark.trend === 'down' ? '-Falling Trend' : 'Stable'})`;
    let what = benchmark.trend === 'up'
      ? `Mandi prices are on an upward trajectory (+6.2% delta). Recommend ${recommendedScenario.label} strategy.`
      : `Mandi prices are steady around ₹${(benchmark.current * 100).toFixed(0)}/Q at ${benchmark.mandi}.`;
    let why = `APMC market analysis indicates ${recommendedScenario.reason}`;
    let actionText = 'View Mandi Breakdown';
    let when = 'Evaluate market daily before dispatching produce';
    let whatToAvoid = 'Never rely on unverified intermediary hearsay for price discovery.';
    let confidence = 88;

    if (benchmark.trend === 'down') {
      severity = 'MEDIUM';
      headline = `Wholesale Price Softening Detected (₹${(benchmark.current * 100).toFixed(0)}/Q)`;
      what = `Consider direct-to-retailer off-take or grading produce into Grade-A lots to capture premium pricing above baseline mandi floor.`;
      why = `Increased arrivals in neighboring districts are exerting downward pressure on grade-B/C batches.`;
      actionText = 'Explore Direct Buyers';
      when = 'Prior to next harvest lot';
      whatToAvoid = 'Avoid dumping ungraded produce in saturated morning wholesale auctions.';
      confidence = 86;
    }

    const recommendation: AgentRecommendation = {
      id: `rec-market-${Date.now()}`,
      agentId: 'market',
      agentName: 'Market & Mandi Price Agent',
      domain: 'Market Arbitrage & Selling Strategy',
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
        currentMandiPricePerQ: benchmark.current * 100,
        priceTrendDirection: benchmark.trend,
        mandiLocation: benchmark.mandi,
        recommendedStrategy: recommendedScenario.label
      },
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const status: FarmAgentStatus = {
      agentId: 'market',
      name: 'Market Agent',
      role: 'Mandi Pricing & Commercial Strategy',
      icon: 'TrendingUp',
      status: severity === 'MEDIUM' ? 'warning' : 'active',
      lastEvaluated: 'Just now',
      confidenceScore: confidence,
      activeAlertCount: severity === 'MEDIUM' ? 1 : 0,
      currentRecommendation: recommendation,
      contributingTelemetry: recommendation.contributingTelemetry,
      conflictsDetected: []
    };

    return { status, recommendation };
  }
};
