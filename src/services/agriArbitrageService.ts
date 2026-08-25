import { MandiMarketQuote, CommodityPriceForecastPoint, ForwardContractHedgingOption } from '../types/arbitrageTypes';

export function calculateMandiArbitrage(
  cropName: string,
  quantityQtl: number = 100, // 10 metric tons = 100 quintals
  dieselRatePerKm: number = 0.45
): MandiMarketQuote[] {
  const baseQuotes = [
    {
      id: 'mandi-local',
      name: 'Central District APMC Mandi',
      location: 'District Center (Zone 1)',
      state: 'Local Region',
      distanceKm: 18,
      transitHours: 0.8,
      basePrice: 2850,
      dailyArrivalTons: 420,
      trend: 'stable' as const,
      delta: 0.4,
      apmcFeePct: 1.5,
      handling: 25,
      coldChainLossPct: 0.3
    },
    {
      id: 'mandi-state-hub',
      name: 'Metro Wholesale Terminal Market',
      location: 'State Capital Hub',
      state: 'Metro Zone',
      distanceKm: 85,
      transitHours: 2.5,
      basePrice: 3280,
      dailyArrivalTons: 1850,
      trend: 'up' as const,
      delta: 4.8,
      apmcFeePct: 2.0,
      handling: 35,
      coldChainLossPct: 0.8
    },
    {
      id: 'mandi-port',
      name: 'Coastal Sea Export Terminal',
      location: 'International Port Gate',
      state: 'Export Corridor',
      distanceKm: 195,
      transitHours: 5.2,
      basePrice: 3620,
      dailyArrivalTons: 3200,
      trend: 'up' as const,
      delta: 6.2,
      apmcFeePct: 0.8,
      handling: 45,
      coldChainLossPct: 1.5
    },
    {
      id: 'mandi-processing-cluster',
      name: 'Agri-Food Processing Mega Park',
      location: 'Industrial Corridor B',
      state: 'Agro-Zone',
      distanceKm: 60,
      transitHours: 1.8,
      basePrice: 3190,
      dailyArrivalTons: 890,
      trend: 'up' as const,
      delta: 2.6,
      apmcFeePct: 1.0,
      handling: 30,
      coldChainLossPct: 0.5
    },
    {
      id: 'mandi-border',
      name: 'Inter-State Border Commercial Yard',
      location: 'Northern Border Cross',
      state: 'Adjacent Province',
      distanceKm: 140,
      transitHours: 4.0,
      basePrice: 3340,
      dailyArrivalTons: 1100,
      trend: 'down' as const,
      delta: -1.8,
      apmcFeePct: 2.5,
      handling: 40,
      coldChainLossPct: 1.2
    }
  ];

  // Adjust base price by crop
  let cropMultiplier = 1.0;
  const c = (cropName || '').toLowerCase();
  if (c.includes('rice') || c.includes('paddy')) cropMultiplier = 1.0;
  else if (c.includes('wheat')) cropMultiplier = 0.82;
  else if (c.includes('maize') || c.includes('corn')) cropMultiplier = 0.76;
  else if (c.includes('coffee')) cropMultiplier = 6.4;
  else if (c.includes('cotton')) cropMultiplier = 2.3;
  else if (c.includes('tomato')) cropMultiplier = 0.95;
  else if (c.includes('chickpea') || c.includes('gram')) cropMultiplier = 1.85;

  const results: MandiMarketQuote[] = baseQuotes.map(item => {
    const wholesalePrice = Math.round(item.basePrice * cropMultiplier);
    
    // Freight calculation: base diesel + vehicle hire per qtl
    const freight = Math.round((item.distanceKm * dieselRatePerKm * 10) / Math.max(1, (quantityQtl / 10))) + Math.round(item.distanceKm * 0.4);
    
    // Deductions
    const apmcFee = wholesalePrice * (item.apmcFeePct / 100);
    const lossCost = wholesalePrice * (item.coldChainLossPct / 100);
    const totalDeductions = freight + apmcFee + lossCost + item.handling;
    
    const netRealized = Math.round(wholesalePrice - totalDeductions);
    const netTotal = Math.round(netRealized * quantityQtl);

    return {
      id: item.id,
      name: item.name,
      location: item.location,
      state: item.state,
      distanceKm: item.distanceKm,
      crop: cropName || 'Grain/Produce',
      wholesalePricePerQtl: wholesalePrice,
      dailyArrivalTons: item.dailyArrivalTons,
      priceTrend24h: item.trend,
      priceDeltaPct: item.delta,
      freightCostPerQtl: freight,
      coldChainLossPct: item.coldChainLossPct,
      apmcMandiFeePct: item.apmcFeePct,
      handlingChargePerQtl: item.handling,
      netRealizedPricePerQtl: netRealized,
      netRevenueTotal: netTotal,
      isBestArbitrage: false,
      transitHours: item.transitHours
    };
  });

  // Find max net realized price and flag
  let maxNet = -Infinity;
  let bestIdx = 0;
  results.forEach((r, idx) => {
    if (r.netRealizedPricePerQtl > maxNet) {
      maxNet = r.netRealizedPricePerQtl;
      bestIdx = idx;
    }
  });
  if (results[bestIdx]) {
    results[bestIdx].isBestArbitrage = true;
  }

  return results.sort((a, b) => b.netRealizedPricePerQtl - a.netRealizedPricePerQtl);
}

export function generate30DayPriceForecast(currentBasePrice: number): CommodityPriceForecastPoint[] {
  const points: CommodityPriceForecastPoint[] = [];
  const today = new Date();
  
  const drivers = [
    'Seasonal Post-Harvest Supply Flush',
    'National Buffer Stock Procurement Start',
    'Port Export Vessel Arrival Schedule',
    'Inter-State Freight Rate Revision',
    'Festival Consumption Demand Spike',
    'Global CBOT Futures Correlation'
  ];

  let current = currentBasePrice;
  for (let i = 0; i <= 30; i += 3) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    // Simulate slight upward trend with seasonality
    const change = Math.sin(i / 5) * (currentBasePrice * 0.04) + (i * 0.003 * currentBasePrice);
    const proj = Math.round(current + change);
    const spread = Math.round(proj * 0.05);

    points.push({
      date: dateStr,
      projectedPrice: proj,
      lowerConfidence: proj - spread,
      upperConfidence: proj + spread,
      keyDriver: drivers[Math.floor(i / 6) % drivers.length]
    });
  }

  return points;
}

export const HEDGING_OPTIONS: ForwardContractHedgingOption[] = [
  {
    id: 'hdc-1',
    buyerName: 'ITC Agri-Business Direct Procurement',
    contractType: 'Fixed Floor Price',
    lockInPricePerQtl: 3450,
    premiumPerQtl: 120,
    durationMonths: 3,
    paymentEscrowBank: 'State Bank of India Escrow',
    status: 'Open for Enrollment'
  },
  {
    id: 'hdc-2',
    buyerName: 'National Commodity & Derivatives Exchange (NCDEX)',
    contractType: 'Minimum Price Guarantee (MPG)',
    lockInPricePerQtl: 3380,
    premiumPerQtl: 80,
    durationMonths: 6,
    paymentEscrowBank: 'HDFC Escrow Vault',
    status: 'Guaranteed MSP'
  },
  {
    id: 'hdc-3',
    buyerName: 'WDRA Certified Silo Warehouse Receipt (e-NWR)',
    contractType: 'e-NWR Warehouse Pledge Loan',
    lockInPricePerQtl: 3600,
    premiumPerQtl: 250,
    durationMonths: 4,
    paymentEscrowBank: 'NABARD Rural Credit Facility (7% APR)',
    status: 'Filling Fast'
  }
];
