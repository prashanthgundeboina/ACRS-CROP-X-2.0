import { FarmCarbonPractices, CarbonCreditEstimate, CarbonAuditRecord, CarbonBuyerOffer } from '../types/carbonTypes';
import { SoilData } from '../types';

export const DEFAULT_CARBON_PRACTICES: FarmCarbonPractices = {
  tillageType: 'no_till',
  coverCropping: true,
  coverCropType: 'mixed_clover',
  organicAmendmentsTonsPerHa: 4.5,
  precisionNitrogenReductionPct: 22,
  solarPumpingUsed: true,
  agroforestryBorderTrees: 450,
  farmAreaHa: 12.5
};

export const CARBON_BUYERS: CarbonBuyerOffer[] = [
  {
    id: 'buy-1',
    buyerName: 'Global Tech Climate Pledge Fund',
    buyerSector: 'Technology & Cloud',
    bidPricePerTonUsd: 38.50,
    volumeRequestedTons: 250,
    settlementTerms: 'Instant T+1 USDC / Wire Settlement',
    badge: 'Tier 1 Prime'
  },
  {
    id: 'buy-2',
    buyerName: 'AeroGreen Aviation Offset Consortium',
    buyerSector: 'Aviation / Transport',
    bidPricePerTonUsd: 34.00,
    volumeRequestedTons: 500,
    settlementTerms: 'Quarterly Verified Tranche',
    badge: 'High Volume'
  },
  {
    id: 'buy-3',
    buyerName: 'Nordic Clean Agri-Capital',
    buyerSector: 'Regenerative Ag Investment',
    bidPricePerTonUsd: 41.20,
    volumeRequestedTons: 100,
    settlementTerms: 'Forward Contract + 5yr Guarantee',
    badge: 'Premium Eco-Yield'
  }
];

export const HISTORICAL_AUDIT_LOG: CarbonAuditRecord[] = [
  {
    id: 'AUD-2025-01',
    year: 2025,
    verificationStandard: 'Verra VM0042 (Soil Carbon)',
    creditsIssued: 48.2,
    verificationHash: '0x8f7d9a13b4c6e927f8a1104e6c3d52ba',
    auditorName: 'SGS Agri-Environmental Assurance',
    status: 'Verified & Issued',
    date: '2025-11-14'
  },
  {
    id: 'AUD-2024-02',
    year: 2024,
    verificationStandard: 'Gold Standard Agriculture',
    creditsIssued: 39.5,
    verificationHash: '0x3c2a19f4d7e8b091a56214ec8f99e31d',
    auditorName: 'DNV GL Climate Services',
    status: 'Verified & Issued',
    date: '2024-10-28'
  }
];

export function calculateCarbonCredits(
  practices: FarmCarbonPractices,
  soilData: SoilData
): CarbonCreditEstimate {
  const area = practices.farmAreaHa || 10;
  
  // 1. Soil Organic Carbon buildup rate based on tillage and organic matter
  let tillageFactor = 0.4; // tons CO2e / ha
  if (practices.tillageType === 'reduced') tillageFactor = 1.1;
  if (practices.tillageType === 'no_till') tillageFactor = 1.95;

  const socSequestration = area * tillageFactor * (1 + (soilData.organic_matter || 3.0) * 0.1);

  // 2. Cover cropping biomass carbon
  let coverFactor = 0;
  if (practices.coverCropping) {
    if (practices.coverCropType === 'legumes') coverFactor = 1.4;
    else if (practices.coverCropType === 'ryegrass') coverFactor = 1.2;
    else coverFactor = 1.65; // mixed clover / multispecies
  }
  const coverCropSequestration = area * coverFactor;

  // 3. Reduced tillage equipment diesel fuel avoidance
  const reducedTillageFuelAvoidance = area * (practices.tillageType === 'no_till' ? 0.35 : practices.tillageType === 'reduced' ? 0.18 : 0);

  // 4. Precision Nitrogen N2O (Nitrous Oxide has 273x GWP of CO2) avoidance
  const nAvoidanceKg = (soilData.fertilizer_usage || 150) * (practices.precisionNitrogenReductionPct / 100);
  const n2oAvoidanceCo2e = area * (nAvoidanceKg * 0.015 * 273) / 1000; // direct N2O emission factor ~1.5%

  // 5. Solar pumping vs diesel generator offset
  const solarOffset = practices.solarPumpingUsed ? area * 0.85 : 0;

  // 6. Agroforestry border tree carbon sequestration (approx 22kg CO2/tree/year)
  const agroforestryOffset = (practices.agroforestryBorderTrees * 0.022);

  const totalSequestration = parseFloat((socSequestration + coverCropSequestration + agroforestryOffset).toFixed(2));
  const grossEmissionsAvoided = parseFloat((reducedTillageFuelAvoidance + n2oAvoidanceCo2e + solarOffset).toFixed(2));
  
  // Verra buffer deduction (typically 15% non-permanence risk buffer)
  const permanenceBufferPct = 15;
  const grossTotal = totalSequestration + grossEmissionsAvoided;
  const netCredits = parseFloat((grossTotal * (1 - permanenceBufferPct / 100)).toFixed(2));

  const marketPrice = 36.50; // USD per ton
  const projectedRevenue = Math.round(netCredits * marketPrice);

  return {
    totalSequestrationTonsCo2e: totalSequestration,
    grossEmissionsAvoidedTonsCo2e: grossEmissionsAvoided,
    netAnnualCarbonCredits: netCredits,
    currentMarketPricePerTonUsd: marketPrice,
    projectedAnnualRevenueUsd: projectedRevenue,
    sequestrationBreakdown: {
      soilOrganicCarbon: parseFloat(socSequestration.toFixed(2)),
      coverCropBiomass: parseFloat(coverCropSequestration.toFixed(2)),
      reducedTillageImpact: parseFloat(reducedTillageFuelAvoidance.toFixed(2)),
      nitrogenN2oAvoidance: parseFloat(n2oAvoidanceCo2e.toFixed(2)),
      solarEnergyOffset: parseFloat(solarOffset.toFixed(2)),
      agroforestrySequestration: parseFloat(agroforestryOffset.toFixed(2))
    },
    verraProtocolComplianceScore: 94,
    additionalityScorePct: 91,
    permanenceRiskBufferPct: permanenceBufferPct
  };
}
