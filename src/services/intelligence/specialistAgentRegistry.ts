import { SpecialistAgentMetadata, AgentCategory } from '../../types/intelligenceTypes';

/**
 * 50+ Agricultural Specialist Agent Registry
 * Structured according to Phase 41 specifications.
 */

export const SPECIALIST_AGENT_REGISTRY: SpecialistAgentMetadata[] = [
  // ------------------------------------------------------------
  // 1. CROP AGENTS (10)
  // ------------------------------------------------------------
  {
    id: 'agent_crop_recommendation',
    name: 'CropRecommendationAgent',
    category: 'crop',
    description: 'Calculates primary and alternative crop suitability indices against agronomic databases.',
    version: '2.5.0',
    preferredModel: 'groq-fast',
    status: 'idle'
  },
  {
    id: 'agent_crop_disease',
    name: 'CropDiseaseAgent',
    category: 'crop',
    description: 'Diagnoses fungal, bacterial, viral phytopathologies and computes outbreak probabilities.',
    version: '2.4.2',
    preferredModel: 'gemini-3.7-flash',
    status: 'idle'
  },
  {
    id: 'agent_crop_pest',
    name: 'CropPestAgent',
    category: 'crop',
    description: 'Identifies insect vectors, economic threshold levels (ETL), and biological IPM controls.',
    version: '2.1.0',
    preferredModel: 'gemini-3.7-flash',
    status: 'idle'
  },
  {
    id: 'agent_crop_lifecycle',
    name: 'CropLifecycleAgent',
    category: 'crop',
    description: 'Tracks phenological growth stages (BBCH scale), thermal accumulation (GDD), and harvest windows.',
    version: '2.3.1',
    preferredModel: 'deterministic-engine',
    status: 'idle'
  },
  {
    id: 'agent_crop_stress',
    name: 'CropStressAgent',
    category: 'crop',
    description: 'Evaluates abiotic thermal, salinity, water deficit and chlorosis stress factors.',
    version: '2.0.4',
    preferredModel: 'deepseek-reasoner',
    status: 'idle'
  },
  {
    id: 'agent_crop_yield',
    name: 'CropYieldAgent',
    category: 'crop',
    description: 'Simulates biomass accumulation and yields per hectare based on historical and sensor inputs.',
    version: '2.2.0',
    preferredModel: 'deepseek-reasoner',
    status: 'idle'
  },
  {
    id: 'agent_crop_harvest',
    name: 'CropHarvestAgent',
    category: 'crop',
    description: 'Calculates optimal moisture harvest thresholds and post-harvest drying timelines.',
    version: '1.9.0',
    preferredModel: 'deterministic-engine',
    status: 'idle'
  },
  {
    id: 'agent_crop_rotation',
    name: 'CropRotationAgent',
    category: 'crop',
    description: 'Formulates multi-season rotation schedules to break pest cycles and restore nitrogen.',
    version: '2.1.5',
    preferredModel: 'deepseek-reasoner',
    status: 'idle'
  },
  {
    id: 'agent_crop_compatibility',
    name: 'CropCompatibilityAgent',
    category: 'crop',
    description: 'Validates intercropping, companion planting synergies, and allelopathic inhibitions.',
    version: '1.8.2',
    preferredModel: 'groq-fast',
    status: 'idle'
  },
  {
    id: 'agent_crop_growth',
    name: 'CropGrowthAgent',
    category: 'crop',
    description: 'Monitors canopy coverage, leaf area index (LAI), and vegetative vigor curves.',
    version: '2.0.1',
    preferredModel: 'deterministic-engine',
    status: 'idle'
  },

  // ------------------------------------------------------------
  // 2. SOIL AGENTS (8)
  // ------------------------------------------------------------
  {
    id: 'agent_soil_health',
    name: 'SoilHealthAgent',
    category: 'soil',
    description: 'Synthesizes biological micro-flora vitality, bulk density, and organic carbon health index.',
    version: '2.3.0',
    preferredModel: 'groq-fast',
    status: 'idle'
  },
  {
    id: 'agent_soil_moisture',
    name: 'SoilMoistureAgent',
    category: 'soil',
    description: 'Monitors capacitive root-zone volumetric water content (VWC) and wilting points.',
    version: '3.0.0',
    preferredModel: 'deterministic-engine',
    status: 'idle'
  },
  {
    id: 'agent_soil_npk',
    name: 'SoilNPKAgent',
    category: 'soil',
    description: 'Calculates Nitrogen, Phosphorus, and Potassium bioavailability and deficiency ratios.',
    version: '2.5.0',
    preferredModel: 'deterministic-engine',
    status: 'idle'
  },
  {
    id: 'agent_soil_ph',
    name: 'SoilPHAgent',
    category: 'soil',
    description: 'Evaluates acidity/alkalinity buffering capacity and recommends gypsum/lime remediation.',
    version: '2.1.0',
    preferredModel: 'deterministic-engine',
    status: 'idle'
  },
  {
    id: 'agent_soil_ec',
    name: 'SoilECAgent',
    category: 'soil',
    description: 'Analyzes electrical conductivity, total dissolved solids (TDS), and root osmotic stress.',
    version: '2.0.0',
    preferredModel: 'deterministic-engine',
    status: 'idle'
  },
  {
    id: 'agent_soil_carbon',
    name: 'SoilCarbonAgent',
    category: 'soil',
    description: 'Measures soil organic carbon (SOC) sequestration rates and carbon credit verification.',
    version: '1.9.5',
    preferredModel: 'deepseek-reasoner',
    status: 'idle'
  },
  {
    id: 'agent_soil_texture',
    name: 'SoilTextureAgent',
    category: 'soil',
    description: 'Classifies USDA soil texture fractions (sand, silt, clay) and porosity characteristics.',
    version: '1.8.0',
    preferredModel: 'deterministic-engine',
    status: 'idle'
  },
  {
    id: 'agent_soil_water_holding',
    name: 'SoilWaterHoldingAgent',
    category: 'soil',
    description: 'Computes field capacity (FC) and plant available water (PAW) dynamics.',
    version: '2.1.0',
    preferredModel: 'deterministic-engine',
    status: 'idle'
  },

  // ------------------------------------------------------------
  // 3. WATER & IRRIGATION AGENTS (6)
  // ------------------------------------------------------------
  {
    id: 'agent_irrigation',
    name: 'IrrigationAgent',
    category: 'water',
    description: 'Generates precision drip/sprinkler run times and pulse irrigation schedules.',
    version: '3.1.0',
    preferredModel: 'deterministic-engine',
    status: 'idle'
  },
  {
    id: 'agent_et0',
    name: 'ET0Agent',
    category: 'water',
    description: 'Calculates reference evapotranspiration using FAO-56 Penman-Monteith equation.',
    version: '2.8.0',
    preferredModel: 'deterministic-engine',
    status: 'idle'
  },
  {
    id: 'agent_water_demand',
    name: 'WaterDemandAgent',
    category: 'water',
    description: 'Projects 7-day crop evapotranspiration (ETc = Kc × ET0) water requirement curves.',
    version: '2.4.0',
    preferredModel: 'groq-fast',
    status: 'idle'
  },
  {
    id: 'agent_water_resource',
    name: 'WaterResourceAgent',
    category: 'water',
    description: 'Tracks aquifer recharge levels, canal water schedules, and rainwater harvest storage.',
    version: '2.0.0',
    preferredModel: 'deterministic-engine',
    status: 'idle'
  },
  {
    id: 'agent_pump_efficiency',
    name: 'PumpEfficiencyAgent',
    category: 'water',
    description: 'Optimizes solar and electrical pump head pressure and kWh power consumption.',
    version: '1.9.0',
    preferredModel: 'deterministic-engine',
    status: 'idle'
  },
  {
    id: 'agent_flood_risk',
    name: 'FloodRiskAgent',
    category: 'water',
    description: 'Assesses topography elevation, drainage velocity, and root-zone waterlogging risks.',
    version: '2.1.2',
    preferredModel: 'deepseek-reasoner',
    status: 'idle'
  },

  // ------------------------------------------------------------
  // 4. WEATHER & CLIMATE AGENTS (6)
  // ------------------------------------------------------------
  {
    id: 'agent_weather',
    name: 'WeatherAgent',
    category: 'weather',
    description: 'Aggregates hyperlocal temperature, relative humidity, barometric pressure, and solar irradiance.',
    version: '3.0.0',
    preferredModel: 'groq-fast',
    status: 'idle'
  },
  {
    id: 'agent_rainfall',
    name: 'RainfallAgent',
    category: 'weather',
    description: 'Forecasts precipitation intensity, rainfall probability, and effective soil infiltration.',
    version: '2.6.0',
    preferredModel: 'groq-fast',
    status: 'idle'
  },
  {
    id: 'agent_heat_stress',
    name: 'HeatStressAgent',
    category: 'weather',
    description: 'Predicts thermal pollen sterility, sunscald risks, and evaporative cooling requirements.',
    version: '2.2.0',
    preferredModel: 'deepseek-reasoner',
    status: 'idle'
  },
  {
    id: 'agent_drought',
    name: 'DroughtAgent',
    category: 'weather',
    description: 'Computes Palmer Drought Severity Index (PDSI) and moisture deficit warnings.',
    version: '2.0.1',
    preferredModel: 'deepseek-reasoner',
    status: 'idle'
  },
  {
    id: 'agent_humidity',
    name: 'HumidityAgent',
    category: 'weather',
    description: 'Tracks vapor pressure deficit (VPD) and leaf wetness duration (LWD) for disease triggers.',
    version: '2.3.0',
    preferredModel: 'deterministic-engine',
    status: 'idle'
  },
  {
    id: 'agent_wind',
    name: 'WindAgent',
    category: 'weather',
    description: 'Evaluates wind shear, spraying drift risk windows, and physical lodging dangers.',
    version: '1.9.0',
    preferredModel: 'deterministic-engine',
    status: 'idle'
  },

  // ------------------------------------------------------------
  // 5. COMPUTER VISION & FIELD SENSING AGENTS (7)
  // ------------------------------------------------------------
  {
    id: 'agent_crop_vision',
    name: 'CropVisionAgent',
    category: 'vision',
    description: 'Performs multi-scale crop canopy segmentation and leaf health visual inspection.',
    version: '3.2.0',
    preferredModel: 'gemini-3.7-flash',
    status: 'idle'
  },
  {
    id: 'agent_disease_vision',
    name: 'DiseaseVisionAgent',
    category: 'vision',
    description: 'Identifies foliar lesions, chlorotic halos, pustules, and fungal hyphae from photos.',
    version: '3.5.0',
    preferredModel: 'gemini-3.7-flash',
    status: 'idle'
  },
  {
    id: 'agent_soil_vision',
    name: 'SoilVisionAgent',
    category: 'vision',
    description: 'Analyzes surface soil color, crusting, aggregate structure, and surface moisture levels.',
    version: '2.1.0',
    preferredModel: 'gemini-3.7-flash',
    status: 'idle'
  },
  {
    id: 'agent_thermal_vision',
    name: 'ThermalVisionAgent',
    category: 'vision',
    description: 'Interprets FLIR long-wave infrared false-color maps for stomatal closure and transpiration cooling.',
    version: '2.4.0',
    preferredModel: 'gemini-3.7-flash',
    status: 'idle'
  },
  {
    id: 'agent_ndvi',
    name: 'NDVIAgent',
    category: 'vision',
    description: 'Computes Normalized Difference Vegetation Index (NIR - Red / NIR + Red) biomass density.',
    version: '2.7.0',
    preferredModel: 'deterministic-engine',
    status: 'idle'
  },
  {
    id: 'agent_drone_vision',
    name: 'DroneVisionAgent',
    category: 'vision',
    description: 'Stitches orthomosaic field maps and flags spatial variability across farm management zones.',
    version: '2.3.0',
    preferredModel: 'gemini-3.7-flash',
    status: 'idle'
  },
  {
    id: 'agent_field_scene',
    name: 'FieldSceneAgent',
    category: 'vision',
    description: 'Classifies agricultural field scene context (greenhouse, open field, nursery, boundary).',
    version: '2.0.0',
    preferredModel: 'gemini-3.7-flash',
    status: 'idle'
  },

  // ------------------------------------------------------------
  // 6. ECONOMICS & MARKET AGENTS (6)
  // ------------------------------------------------------------
  {
    id: 'agent_farm_economics',
    name: 'FarmEconomicsAgent',
    category: 'economics',
    description: 'Models seed, fertilizer, labor, machinery operating costs and net revenue projections.',
    version: '2.5.0',
    preferredModel: 'deepseek-reasoner',
    status: 'idle'
  },
  {
    id: 'agent_mandi',
    name: 'MandiAgent',
    category: 'economics',
    description: 'Fetches real-time APMC Mandi commodity arrival volumes and modal spot rates.',
    version: '2.8.0',
    preferredModel: 'groq-fast',
    status: 'idle'
  },
  {
    id: 'agent_market_price',
    name: 'MarketPriceAgent',
    category: 'economics',
    description: 'Predicts 30-day commodity price trends and seasonal arbitrage opportunities.',
    version: '2.6.0',
    preferredModel: 'groq-fast',
    status: 'idle'
  },
  {
    id: 'agent_yield_economics',
    name: 'YieldEconomicsAgent',
    category: 'economics',
    description: 'Calculates marginal return on investment per kilogram of fertilizer applied.',
    version: '2.1.0',
    preferredModel: 'deterministic-engine',
    status: 'idle'
  },
  {
    id: 'agent_storage',
    name: 'StorageAgent',
    category: 'economics',
    description: 'Advises on cold storage vs warehouse holding times to maximize price gains.',
    version: '1.9.0',
    preferredModel: 'deepseek-reasoner',
    status: 'idle'
  },
  {
    id: 'agent_logistics',
    name: 'LogisticsAgent',
    category: 'economics',
    description: 'Calculates farm-to-mandi freight transit costs and optimal transport windows.',
    version: '1.8.0',
    preferredModel: 'groq-fast',
    status: 'idle'
  },

  // ------------------------------------------------------------
  // 7. OPERATIONS & MANAGEMENT AGENTS (6)
  // ------------------------------------------------------------
  {
    id: 'agent_farm_calendar',
    name: 'FarmCalendarAgent',
    category: 'operations',
    description: 'Generates day-by-day agronomic task timelines from sowing to harvest.',
    version: '2.4.0',
    preferredModel: 'groq-fast',
    status: 'idle'
  },
  {
    id: 'agent_fertilizer',
    name: 'FertilizerAgent',
    category: 'operations',
    description: 'Formulates split-dose fertigation recipes balancing Urea, DAP, MOP, and micronutrients.',
    version: '2.7.0',
    preferredModel: 'deterministic-engine',
    status: 'idle'
  },
  {
    id: 'agent_pesticide_timing',
    name: 'PesticideTimingAgent',
    category: 'operations',
    description: 'Calculates optimal spray windows based on zero-rain and low-wind forecast hours.',
    version: '2.2.0',
    preferredModel: 'groq-fast',
    status: 'idle'
  },
  {
    id: 'agent_harvest_logistics',
    name: 'HarvestLogisticsAgent',
    category: 'operations',
    description: 'Schedules combine harvesters, labor crews, and gunny bag packaging requirements.',
    version: '1.9.0',
    preferredModel: 'groq-fast',
    status: 'idle'
  },
  {
    id: 'agent_consultation',
    name: 'ConsultationAgent',
    category: 'operations',
    description: 'Synthesizes farmer telemetry into executive agronomic briefs for human advisers.',
    version: '3.0.0',
    preferredModel: 'gemini-3.7-flash',
    status: 'idle'
  },
  {
    id: 'agent_emergency',
    name: 'EmergencyAgent',
    category: 'operations',
    description: 'Triages critical crop failures, pest swarms, and flash waterlogging for immediate adviser routing.',
    version: '3.1.0',
    preferredModel: 'groq-fast',
    status: 'idle'
  },

  // ------------------------------------------------------------
  // 8. INTELLIGENCE, CONSENSUS & SUPERVISION AGENTS (8)
  // ------------------------------------------------------------
  {
    id: 'agent_adviser_matching',
    name: 'AdviserMatchingAgent',
    category: 'intelligence',
    description: 'Scores and matches online certified agronomists by crop specialty, distance, and workload.',
    version: '3.0.0',
    preferredModel: 'deterministic-engine',
    status: 'idle'
  },
  {
    id: 'agent_farm_memory',
    name: 'FarmMemoryAgent',
    category: 'intelligence',
    description: 'Retrieves multi-season crop history, past soil tests, and previous consultation outcomes.',
    version: '2.5.0',
    preferredModel: 'deterministic-engine',
    status: 'idle'
  },
  {
    id: 'agent_digital_twin',
    name: 'DigitalTwinAgent',
    category: 'intelligence',
    description: 'Maintains 3D virtual representations of field zones, root depth, and canopy volume.',
    version: '2.8.0',
    preferredModel: 'deterministic-engine',
    status: 'idle'
  },
  {
    id: 'agent_decision_verification',
    name: 'DecisionVerificationAgent',
    category: 'intelligence',
    description: 'Verifies agronomic recommendations against ICAR safety bounds and environmental limits.',
    version: '3.1.0',
    preferredModel: 'deepseek-reasoner',
    status: 'idle'
  },
  {
    id: 'agent_ai_consensus',
    name: 'AIConsensusAgent',
    category: 'intelligence',
    description: 'Cross-examines outputs across Gemini, Groq, DeepSeek and flags agronomic discrepancies.',
    version: '3.3.0',
    preferredModel: 'deepseek-reasoner',
    status: 'idle'
  },
  {
    id: 'agent_translation',
    name: 'TranslationAgent',
    category: 'intelligence',
    description: 'Translates agronomic advice across 11 vernacular Indian languages with agricultural terminology.',
    version: '2.9.0',
    preferredModel: 'gemini-3.7-flash',
    status: 'idle'
  },
  {
    id: 'agent_voice',
    name: 'VoiceAgent',
    category: 'intelligence',
    description: 'Drives natural speech dialogue, intent classification, and spoken agronomic explanations.',
    version: '3.2.0',
    preferredModel: 'groq-fast',
    status: 'idle'
  },
  {
    id: 'agent_risk',
    name: 'RiskAgent',
    category: 'intelligence',
    description: 'Aggregates combined biological, meteorological, and economic risk exposure scores.',
    version: '2.6.0',
    preferredModel: 'deepseek-reasoner',
    status: 'idle'
  }
];

export function getSpecialistAgents(): SpecialistAgentMetadata[] {
  return SPECIALIST_AGENT_REGISTRY;
}

export function getAgentsByCategory(category: AgentCategory): SpecialistAgentMetadata[] {
  return SPECIALIST_AGENT_REGISTRY.filter((a) => a.category === category);
}
