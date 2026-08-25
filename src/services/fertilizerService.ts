// Fertilizer dosage calculator and target soil standards per crop

export interface CropNutrientTarget {
  crop: string;
  targetN: number;
  targetP: number;
  targetK: number;
  phMin: number;
  phMax: number;
  idealOrganic: number;
}

export const CROP_TARGETS: Record<string, CropNutrientTarget> = {
  Rice: { crop: "Rice", targetN: 90, targetP: 45, targetK: 40, phMin: 5.5, phMax: 7.0, idealOrganic: 3.0 },
  Maize: { crop: "Maize", targetN: 100, targetP: 50, targetK: 45, phMin: 5.8, phMax: 7.2, idealOrganic: 3.2 },
  Wheat: { crop: "Wheat", targetN: 80, targetP: 40, targetK: 40, phMin: 6.0, phMax: 7.5, idealOrganic: 2.8 },
  Jute: { crop: "Jute", targetN: 70, targetP: 35, targetK: 50, phMin: 6.0, phMax: 7.2, idealOrganic: 3.5 },
  Coffee: { crop: "Coffee", targetN: 110, targetP: 60, targetK: 90, phMin: 5.0, phMax: 6.5, idealOrganic: 4.0 },
  Cotton: { crop: "Cotton", targetN: 120, targetP: 60, targetK: 60, phMin: 6.0, phMax: 7.5, idealOrganic: 3.0 },
  Chickpeas: { crop: "Chickpeas", targetN: 30, targetP: 60, targetK: 40, phMin: 6.0, phMax: 7.8, idealOrganic: 2.5 },
  Sugarcane: { crop: "Sugarcane", targetN: 150, targetP: 75, targetK: 100, phMin: 6.0, phMax: 7.5, idealOrganic: 3.8 }
};

export interface FertilizerRecommendation {
  cropName: string;
  nDeficit: number;
  pDeficit: number;
  kDeficit: number;
  ureaKgHa: number;     // 46% N
  dapKgHa: number;      // 18% N, 46% P2O5
  mopKgHa: number;      // 60% K2O
  limeKgHa: number;     // If acidic
  sulfurKgHa: number;   // If alkaline
  estimatedCostUsd: number;
}

export function calculateFertilizerRequirements(
  cropName: string,
  currentN: number,
  currentP: number,
  currentK: number,
  currentPh: number,
  hectares: number = 1
): FertilizerRecommendation {
  const target = CROP_TARGETS[cropName] || CROP_TARGETS["Rice"];

  const nDeficit = Math.max(0, target.targetN - currentN);
  const pDeficit = Math.max(0, target.targetP - currentP);
  const kDeficit = Math.max(0, target.targetK - currentK);

  // DAP supplies P2O5 (46%). 100kg DAP provides 46kg P and 18kg N
  const dapKgHa = Math.round((pDeficit / 0.46) * 10) / 10;
  const nProvidedByDap = dapKgHa * 0.18;

  // Remaining Nitrogen to be provided by Urea (46% N)
  const remainingNDeficit = Math.max(0, nDeficit - nProvidedByDap);
  const ureaKgHa = Math.round((remainingNDeficit / 0.46) * 10) / 10;

  // Muriate of Potash (MOP) supplies 60% K2O
  const mopKgHa = Math.round((kDeficit / 0.60) * 10) / 10;

  // pH amendment
  let limeKgHa = 0;
  let sulfurKgHa = 0;
  if (currentPh < target.phMin) {
    limeKgHa = Math.round((target.phMin - currentPh) * 350);
  } else if (currentPh > target.phMax) {
    sulfurKgHa = Math.round((currentPh - target.phMax) * 150);
  }

  // Estimated costs: Urea ~ $0.4/kg, DAP ~ $0.7/kg, MOP ~ $0.5/kg, Lime ~ $0.15/kg
  const cost = (ureaKgHa * 0.4 + dapKgHa * 0.7 + mopKgHa * 0.5 + limeKgHa * 0.15 + sulfurKgHa * 0.3) * hectares;

  return {
    cropName,
    nDeficit: Math.round(nDeficit),
    pDeficit: Math.round(pDeficit),
    kDeficit: Math.round(kDeficit),
    ureaKgHa: Math.round(ureaKgHa * hectares),
    dapKgHa: Math.round(dapKgHa * hectares),
    mopKgHa: Math.round(mopKgHa * hectares),
    limeKgHa: Math.round(limeKgHa * hectares),
    sulfurKgHa: Math.round(sulfurKgHa * hectares),
    estimatedCostUsd: Math.round(cost)
  };
}
