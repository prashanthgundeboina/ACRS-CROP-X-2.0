export interface MandiMarketQuote {
  id: string;
  name: string;
  location: string;
  state: string;
  distanceKm: number;
  crop: string;
  wholesalePricePerQtl: number; // in local currency (e.g. ₹ / quintal or $ / metric ton)
  dailyArrivalTons: number;
  priceTrend24h: 'up' | 'down' | 'stable';
  priceDeltaPct: number;
  freightCostPerQtl: number;
  coldChainLossPct: number; // transit deterioration
  apmcMandiFeePct: number;
  handlingChargePerQtl: number;
  netRealizedPricePerQtl: number;
  netRevenueTotal: number;
  isBestArbitrage: boolean;
  transitHours: number;
}

export interface CommodityPriceForecastPoint {
  date: string;
  projectedPrice: number;
  lowerConfidence: number;
  upperConfidence: number;
  keyDriver: string;
}

export interface ForwardContractHedgingOption {
  id: string;
  buyerName: string;
  contractType: 'Fixed Floor Price' | 'Minimum Price Guarantee (MPG)' | 'e-NWR Warehouse Pledge Loan';
  lockInPricePerQtl: number;
  premiumPerQtl: number;
  durationMonths: number;
  paymentEscrowBank: string;
  status: 'Open for Enrollment' | 'Filling Fast' | 'Guaranteed MSP';
}
