export interface FarmCarbonPractices {
  tillageType: 'conventional' | 'reduced' | 'no_till';
  coverCropping: boolean;
  coverCropType: 'legumes' | 'ryegrass' | 'mixed_clover' | 'none';
  organicAmendmentsTonsPerHa: number; // e.g. Biochar, manure, compost
  precisionNitrogenReductionPct: number; // 0 - 40% reduction
  solarPumpingUsed: boolean;
  agroforestryBorderTrees: number; // number of trees planted
  farmAreaHa: number;
}

export interface CarbonCreditEstimate {
  totalSequestrationTonsCo2e: number;
  grossEmissionsAvoidedTonsCo2e: number;
  netAnnualCarbonCredits: number; // tCO2e
  currentMarketPricePerTonUsd: number;
  projectedAnnualRevenueUsd: number;
  sequestrationBreakdown: {
    soilOrganicCarbon: number; // tCO2e
    coverCropBiomass: number; // tCO2e
    reducedTillageImpact: number; // tCO2e
    nitrogenN2oAvoidance: number; // tCO2e
    solarEnergyOffset: number; // tCO2e
    agroforestrySequestration: number; // tCO2e
  };
  verraProtocolComplianceScore: number; // 0-100%
  additionalityScorePct: number;
  permanenceRiskBufferPct: number;
}

export interface CarbonAuditRecord {
  id: string;
  year: number;
  verificationStandard: string; // 'Verra VM0042' | 'Gold Standard' | 'Climate Action Reserve'
  creditsIssued: number;
  verificationHash: string;
  auditorName: string;
  status: 'Verified & Issued' | 'Pending Remote Sensing Audit' | 'Under MRV Review';
  date: string;
}

export interface CarbonBuyerOffer {
  id: string;
  buyerName: string;
  buyerSector: string;
  bidPricePerTonUsd: number;
  volumeRequestedTons: number;
  settlementTerms: string;
  badge: string;
}
