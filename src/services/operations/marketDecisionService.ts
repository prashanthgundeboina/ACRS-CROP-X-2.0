import { MarketDecisionScenario } from '../../types/operations/farmOperationsTypes';

const STORAGE_KEY_MARKET_TARGET_PRICE = 'croperx_market_target_price';
const STORAGE_KEY_MARKET_ALERTS_ENABLED = 'croperx_market_alerts_enabled';

const CROP_PRICE_BENCHMARKS: Record<string, { current: number; trend: 'up' | 'stable' | 'down'; mandi: string; storageCostPerMonthKg: number }> = {
  Rice: { current: 28.5, trend: 'up', mandi: 'Regional APMC Hub', storageCostPerMonthKg: 0.8 },
  Tomato: { current: 34.0, trend: 'up', mandi: 'Metro Veg Mandi', storageCostPerMonthKg: 2.2 },
  Wheat: { current: 24.0, trend: 'stable', mandi: 'Central Grain Yard', storageCostPerMonthKg: 0.6 },
  Maize: { current: 21.5, trend: 'stable', mandi: 'District Agro Depot', storageCostPerMonthKg: 0.5 },
  Cotton: { current: 68.0, trend: 'up', mandi: 'Cotton Ginning Exchange', storageCostPerMonthKg: 1.2 },
  Potato: { current: 18.0, trend: 'down', mandi: 'Cold Storage Mandi', storageCostPerMonthKg: 1.5 },
  Default: { current: 25.0, trend: 'stable', mandi: 'APMC Yard', storageCostPerMonthKg: 1.0 }
};

export const marketDecisionService = {
  getMarketBenchmark(cropName: string) {
    return CROP_PRICE_BENCHMARKS[cropName] || CROP_PRICE_BENCHMARKS.Default;
  },

  getTargetPrice(cropName: string): number {
    try {
      const val = localStorage.getItem(`${STORAGE_KEY_MARKET_TARGET_PRICE}_${cropName}`);
      if (val) return parseFloat(val);
    } catch {
      // ignore
    }
    const benchmark = this.getMarketBenchmark(cropName);
    return Math.round(benchmark.current * 1.15);
  },

  setTargetPrice(cropName: string, price: number) {
    try {
      localStorage.setItem(`${STORAGE_KEY_MARKET_TARGET_PRICE}_${cropName}`, price.toString());
    } catch {
      // ignore
    }
  },

  isAlertsEnabled(): boolean {
    try {
      const val = localStorage.getItem(STORAGE_KEY_MARKET_ALERTS_ENABLED);
      if (val !== null) return val === 'true';
    } catch {
      // ignore
    }
    return true;
  },

  setAlertsEnabled(enabled: boolean) {
    try {
      localStorage.setItem(STORAGE_KEY_MARKET_ALERTS_ENABLED, enabled.toString());
    } catch {
      // ignore
    }
  },

  evaluateScenarios(params: {
    cropName: string;
    estimatedYieldKg?: number;
    customCurrentPrice?: number;
  }): MarketDecisionScenario[] {
    const { cropName, estimatedYieldKg = 3000 } = params;
    const benchmark = this.getMarketBenchmark(cropName);
    const currentPrice = params.customCurrentPrice || benchmark.current;

    const transportCostEstimate = Math.round(estimatedYieldKg * 0.75); // ₹0.75/kg

    // Scenario 1: SELL NOW
    const sellNowGross = estimatedYieldKg * currentPrice;
    const sellNowNet = sellNowGross - transportCostEstimate;

    // Scenario 2: WAIT (10-14 days spot market movement)
    const waitMultiplier = benchmark.trend === 'up' ? 1.08 : benchmark.trend === 'down' ? 0.94 : 1.02;
    const waitProjectedPrice = Math.round(currentPrice * waitMultiplier * 10) / 10;
    const waitGross = estimatedYieldKg * waitProjectedPrice;
    const waitQualityLossPercent = cropName === 'Tomato' ? 0.04 : 0.01;
    const waitEffectiveYield = estimatedYieldKg * (1 - waitQualityLossPercent);
    const waitNet = (waitEffectiveYield * waitProjectedPrice) - transportCostEstimate;

    // Scenario 3: STORE (1-2 months cold storage or warehouse)
    const storeMultiplier = benchmark.trend === 'up' ? 1.22 : 1.10;
    const storeProjectedPrice = Math.round(currentPrice * storeMultiplier * 10) / 10;
    const storageCostTotal = Math.round(estimatedYieldKg * benchmark.storageCostPerMonthKg * 1.5);
    const storeLossPercent = cropName === 'Tomato' ? 0.08 : 0.02;
    const storeEffectiveYield = estimatedYieldKg * (1 - storeLossPercent);
    const storeNet = (storeEffectiveYield * storeProjectedPrice) - transportCostEstimate - storageCostTotal;

    const isSellNowBest = sellNowNet >= waitNet && sellNowNet >= storeNet;
    const isWaitBest = waitNet > sellNowNet && waitNet >= storeNet;
    const isStoreBest = storeNet > sellNowNet && storeNet > waitNet;

    return [
      {
        id: 'sell_now',
        label: 'SELL NOW',
        headline: `Immediate Mandi Sale at ₹${currentPrice.toFixed(1)}/kg`,
        currentMandiPricePerKg: currentPrice,
        projectedPricePerKg: currentPrice,
        estimatedQuantityKg: estimatedYieldKg,
        estimatedGrossRevenue: sellNowGross,
        estimatedStorageCost: 0,
        estimatedTransportCost: transportCostEstimate,
        estimatedNetReturn: Math.round(sellNowNet),
        riskFactor: 'low',
        reason: benchmark.trend === 'down' 
          ? 'Current market prices are soft or trending down; selling immediately locks in profit and avoids post-harvest degradation.'
          : 'Zero storage risk, immediate cash liquidity, and safe return above baseline production cost.',
        recommended: isSellNowBest || benchmark.trend === 'down'
      },
      {
        id: 'wait',
        label: 'WAIT',
        headline: `Hold for 7-14 Days Spot Price Surge (~₹${waitProjectedPrice.toFixed(1)}/kg)`,
        currentMandiPricePerKg: currentPrice,
        projectedPricePerKg: waitProjectedPrice,
        estimatedQuantityKg: estimatedYieldKg,
        estimatedGrossRevenue: Math.round(waitGross),
        estimatedStorageCost: 0,
        estimatedTransportCost: transportCostEstimate,
        estimatedNetReturn: Math.round(waitNet),
        riskFactor: 'moderate',
        reason: benchmark.trend === 'up'
          ? 'Arrival volume at regional mandis is lower this week, which may drive short-term price appreciation.'
          : 'Short-term price fluctuations may offer a marginal window, but monitor weather to prevent in-field deterioration.',
        recommended: isWaitBest && benchmark.trend === 'up'
      },
      {
        id: 'store',
        label: 'STORE',
        headline: `Warehouse / Cold Storage for 30-45 Days (~₹${storeProjectedPrice.toFixed(1)}/kg)`,
        currentMandiPricePerKg: currentPrice,
        projectedPricePerKg: storeProjectedPrice,
        estimatedQuantityKg: estimatedYieldKg,
        estimatedGrossRevenue: Math.round(storeEffectiveYield * storeProjectedPrice),
        estimatedStorageCost: storageCostTotal,
        estimatedTransportCost: transportCostEstimate,
        estimatedNetReturn: Math.round(storeNet),
        riskFactor: cropName === 'Tomato' ? 'high' : 'moderate',
        reason: cropName === 'Tomato'
          ? 'Perishable vegetable storage incurs high electricity/crate costs and physiological weight loss (~8%). Only viable with verified cold-chain partner.'
          : `Storage allows capturing off-season price rally if storage rental (~₹${benchmark.storageCostPerMonthKg}/kg/mo) remains below projected gain.`,
        recommended: isStoreBest && cropName !== 'Tomato'
      }
    ];
  }
};
