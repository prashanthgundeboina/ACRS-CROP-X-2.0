import { SoilData } from "../types";

export function generateDynamicTips(data: SoilData): string[] {
  const tips: string[] = [];

  // Nitrogen checks
  if (data.nitrogen < 30) {
    tips.push("Nitrogen levels are significantly low. Consider supplementing with Urea or blood meal to boost leaf growth.");
  } else if (data.nitrogen > 150) {
    tips.push("Excessive nitrogen detected. Avoid further fertilization to prevent lush but weak structural growth and potential groundwater leaching.");
  }

  // pH checks
  if (data.ph < 5.5) {
    tips.push("Soil is highly acidic. Apply agricultural lime (calcium carbonate) to neutralize the soil and improve nutrient availability.");
  } else if (data.ph > 7.5) {
    tips.push("Alkaline conditions detected. Incorporating elemental sulfur or organic mulch like pine needles can help lower the pH.");
  }

  // Rainfall / Moisture
  if (data.rainfall < 80) {
    tips.push("Current rainfall trends are below threshold. Implement a precise Drip Irrigation system to maintain root zone moisture efficiency.");
  }

  // Pest Pressure
  if (data.pest_pressure > 60) {
    tips.push("High pest pressure alert. Conduct a thorough field scouting and consider integrated pest management (IPM) using neem oil or beneficial insects.");
  }

  // Frost Risk
  if (data.frost_risk > 70) {
    tips.push("Critical frost risk detected. Prepare row covers or deploy overhead irrigation during night peaks to create a protective thermal layer.");
  }

  // Water Efficiency
  if (data.water_usage_efficiency < 0.5) {
    tips.push("Low water usage efficiency. Consider mulching row crops to reduce evaporation and checking for subsurface leaks.");
  }

  // Default tip
  if (tips.length === 0) {
    tips.push("Soil and environmental conditions appear balanced. Continue your current sustainable farming rotation.");
  }

  return tips;
}
