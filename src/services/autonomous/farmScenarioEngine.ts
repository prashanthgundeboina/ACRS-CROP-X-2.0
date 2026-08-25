import { WhatIfScenario } from '../../types/autonomous/farmAutonomousTypes';
import { SoilData } from '../../types';

class FarmScenarioEngine {
  public getPrebuiltScenarios(soilData?: SoilData, cropName: string = 'Tomato'): WhatIfScenario[] {
    const moisture = soilData?.soil_moisture ?? 28;
    const rainForecastMm = (soilData?.rainfall ?? 40) > 60 ? 15 : 2;

    return [
      {
        id: 'scenario-irrigation-rain',
        title: '💧 Scenario A: Irrigate Today vs Wait for Forecasted Rain',
        decisionA: {
          label: 'Irrigate Now (45 Min Drip)',
          description: 'Deliver 12,500 Liters immediately via automated drip lines to elevate root moisture.',
          waterRequirementLiters: 12500,
          expectedCropStress: 12,
          estimatedCostInr: 185, // Electricity & pump wear
          expectedYieldImpactQuintals: +0.4,
          riskScore: 28,
          potentialRevenueInr: 48000
        },
        decisionB: {
          label: 'Wait for Rain Window (14-18 Hours)',
          description: `Hold pump. Leverage incoming ${rainForecastMm > 5 ? `${rainForecastMm}mm` : '8mm'} convective rainfall event.`,
          waterRequirementLiters: 0,
          expectedCropStress: 22,
          estimatedCostInr: 0,
          expectedYieldImpactQuintals: +0.3,
          riskScore: 18,
          potentialRevenueInr: 47600
        },
        recommendedChoice: rainForecastMm > 6 ? 'B' : 'A',
        agronomicRationale: rainForecastMm > 6
          ? 'Incoming precipitation (>6mm) will sufficiently replenish root zone field capacity while saving 12,500 L water and pump electricity.'
          : 'Rain probability is low and diffuse; soil moisture (28%) requires controlled drip replenishment to avoid vegetative slowdown.',
        confidencePercent: 92
      },
      {
        id: 'scenario-fertilizer-timing',
        title: '🧪 Scenario B: Apply Urea Fertigation Today vs Delay 3 Days',
        decisionA: {
          label: 'Fertigate Today (19-19-19 Split)',
          description: 'Inject 25 kg soluble NPK via Venturi injector during active morning root uptake.',
          waterRequirementLiters: 4200,
          expectedCropStress: 8,
          estimatedCostInr: 1650,
          expectedYieldImpactQuintals: +0.9,
          riskScore: 35, // leaching risk if heavy rain
          potentialRevenueInr: 52000
        },
        decisionB: {
          label: 'Delay Fertigation Post-Rain Window',
          description: 'Wait until soil infiltration stabilizes to prevent nitrogen leaching into ditch runoff.',
          waterRequirementLiters: 0,
          expectedCropStress: 14,
          estimatedCostInr: 0,
          expectedYieldImpactQuintals: +0.8,
          riskScore: 12,
          potentialRevenueInr: 51200
        },
        recommendedChoice: 'B',
        agronomicRationale: 'Applying soluble nitrogen right before forecasted storm events results in 30-40% nutrient leaching loss. Delaying until soil stabilizes preserves 100% fertilizer investment.',
        confidencePercent: 94
      },
      {
        id: 'scenario-harvest-timing',
        title: `🌾 Scenario C: Harvest ${cropName} at Turning vs Wait for Peak Brix`,
        decisionA: {
          label: 'Harvest Early at Breaker Stage',
          description: 'Pick firm fruit with 30% color change for long-distance transport and 7-day shelf life.',
          waterRequirementLiters: 0,
          expectedCropStress: 5,
          estimatedCostInr: 2800, // labor
          expectedYieldImpactQuintals: 38.0,
          riskScore: 15,
          potentialRevenueInr: 72200
        },
        decisionB: {
          label: 'Wait 4 Days for Vine Ripening',
          description: 'Pick fully colored fruit for local premium fresh-market table consumption with higher Brix.',
          waterRequirementLiters: 1500,
          expectedCropStress: 18,
          estimatedCostInr: 3000,
          expectedYieldImpactQuintals: 41.5,
          riskScore: 32, // rain split / pest risk
          potentialRevenueInr: 83000
        },
        recommendedChoice: 'A',
        agronomicRationale: 'Firm fruit harvested at turning stage minimizes transit bruising loss by ~22% and avoids rain skin cracking risk.',
        confidencePercent: 88
      },
      {
        id: 'scenario-market-arbitrage',
        title: '💰 Scenario D: Sell Mandi Spot Auction vs Staggered 5-Day Direct Off-Take',
        decisionA: {
          label: 'Sell Entire Lot at Mandi Today',
          description: 'Immediate cash liquidation at current spot price (₹1,950/Quintal) via APMC commission agent.',
          waterRequirementLiters: 0,
          expectedCropStress: 0,
          estimatedCostInr: 1200, // transport & APMC cess
          expectedYieldImpactQuintals: 0,
          riskScore: 10,
          potentialRevenueInr: 76000
        },
        decisionB: {
          label: 'Sort Grade-A for Local Retailers & Grade-B for Mandi',
          description: 'Grade produce into premium packs (₹2,400/Q) and baseline batches over 3 days.',
          waterRequirementLiters: 0,
          expectedCropStress: 0,
          estimatedCostInr: 1800, // extra sorting labor
          expectedYieldImpactQuintals: 0,
          riskScore: 24,
          potentialRevenueInr: 88400
        },
        recommendedChoice: 'B',
        agronomicRationale: 'Dual-tier grading captures a 23% price premium on top 60% produce volume with negligible storage decay risk.',
        confidencePercent: 90
      }
    ];
  }
}

export const farmScenarioEngine = new FarmScenarioEngine();
