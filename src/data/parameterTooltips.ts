export interface ParameterTooltip {
  title: string;
  unit: string;
  description: string;
  idealRange: string;
}

export class TooltipData {
  static PARAMETERS: Record<string, ParameterTooltip> = {
    nitrogen: {
      title: "Nitrogen (N)",
      unit: "ppm / mg/kg",
      description: "Essential macronutrient driving vegetative leaf growth, protein synthesis, and chlorophyll formation.",
      idealRange: "50 - 120 ppm"
    },
    phosphorus: {
      title: "Phosphorus (P)",
      unit: "ppm / mg/kg",
      description: "Crucial for early root development, seed initiation, energy transfer (ATP), and flower blooming.",
      idealRange: "30 - 80 ppm"
    },
    potassium: {
      title: "Potassium (K)",
      unit: "ppm / mg/kg",
      description: "Regulates stomatal water loss, enhances disease resistance, stalk strength, and fruit quality.",
      idealRange: "40 - 100 ppm"
    },
    temperature: {
      title: "Mean Temperature",
      unit: "°C",
      description: "Ambient heat level influencing enzymatic activity, seed germination rate, and evapotranspiration.",
      idealRange: "18 - 32 °C"
    },
    humidity: {
      title: "Relative Humidity",
      unit: "%",
      description: "Atmospheric moisture level regulating plant transpiration pressure and fungal disease proliferation risk.",
      idealRange: "50 - 75 %"
    },
    ph: {
      title: "Soil Acidity (pH)",
      unit: "pH scale",
      description: "Measures hydrogen ion concentration controlling key nutrient bioavailability in root zone soil solution.",
      idealRange: "6.0 - 7.2"
    },
    rainfall: {
      title: "Seasonal Rainfall",
      unit: "mm / season",
      description: "Total natural precipitation providing primary moisture for cell turgor pressure and nutrient transport.",
      idealRange: "100 - 300 mm"
    },
    soil_moisture: {
      title: "Soil Volumetric Moisture",
      unit: "% water content",
      description: "Percentage of water by volume retained in root zone pore spaces accessible to root hairs.",
      idealRange: "20 - 45 %"
    },
    soil_type: {
      title: "Soil Texture Category",
      unit: "Classification",
      description: "Physical proportion of Sand, Silt, and Clay governing drainage velocity and cation exchange capacity.",
      idealRange: "Loam / Clay Loam"
    },
    sunlight_exposure: {
      title: "Daily Solar Irradiance",
      unit: "hours / day",
      description: "Direct sunlight duration driving photosynthetic light reactions and carbohydrate production.",
      idealRange: "6 - 10 hours"
    },
    wind_speed: {
      title: "Mean Wind Velocity",
      unit: "km/h",
      description: "Airflow speed affecting crop lodging risk, microclimate humidity removal, and mechanical stress.",
      idealRange: "5 - 18 km/h"
    },
    co2_concentration: {
      title: "Carbon Dioxide Level",
      unit: "ppm",
      description: "Atmospheric CO2 concentration serving as primary carbon substrate for photosynthetic biomass buildup.",
      idealRange: "400 - 650 ppm"
    },
    organic_matter: {
      title: "Soil Organic Matter",
      unit: "% weight",
      description: "Decomposed plant/animal residue enhancing soil structure, water holding capacity, and soil microbiome activity.",
      idealRange: "2.5 - 5.0 %"
    },
    irrigation_frequency: {
      title: "Irrigation Cycle",
      unit: "days between watering",
      description: "Interval between supplemental watering applications to maintain root zone moisture tension.",
      idealRange: "3 - 7 days"
    },
    crop_density: {
      title: "Plant Density",
      unit: "plants / m²",
      description: "Spatial population density affecting canopy sunlight interception and inter-plant nutrient competition.",
      idealRange: "15 - 45 plants/m²"
    },
    pest_pressure: {
      title: "Biotic Pest Index",
      unit: "Index (0-100)",
      description: "Prevalence level of destructive insects, nematodes, or pathogens threatening crop biomass loss.",
      idealRange: "< 25 (Low Risk)"
    },
    fertilizer_usage: {
      title: "Basal Fertilizer Dosage",
      unit: "kg / hectare",
      description: "Total chemical or organic fertilizer amendments applied to supplement indigenous soil nutrients.",
      idealRange: "50 - 200 kg/ha"
    },
    growth_stage: {
      title: "Phenological Stage",
      unit: "Scale (0-10)",
      description: "Crop maturity benchmark from seed germination (0) to vegetative (5) and reproductive harvest maturity (10).",
      idealRange: "Stage 3 - 7"
    },
    urban_area_proximity: {
      title: "Urban Buffer Distance",
      unit: "km",
      description: "Distance to urban centers determining logistics access, fresh market demand, and air quality exposure.",
      idealRange: "10 - 50 km"
    },
    water_source_type: {
      title: "Water Supply Source",
      unit: "Source Type",
      description: "Primary irrigation delivery system (Borewell, Canal, Rainfed) governing water salinity and reliability.",
      idealRange: "Canal / Borewell"
    },
    frost_risk: {
      title: "Frost Hazard Probability",
      unit: "Risk Index (0-100)",
      description: "Probability of freezing temperatures causing ice crystal formation inside plant intercellular spaces.",
      idealRange: "< 15 (Low Hazard)"
    },
    water_usage_efficiency: {
      title: "Water Productivity Ratio",
      unit: "kg yield / m³ water",
      description: "Volume of crop yield produced per cubic meter of irrigation water applied.",
      idealRange: "1.2 - 2.8 kg/m³"
    }
  };
}
