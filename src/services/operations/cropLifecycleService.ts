import { 
  CropGrowthStageId, 
  CropGrowthStageInfo, 
  CropLifecycleState 
} from '../../types/operations/farmOperationsTypes';

const CROP_STAGES_DATABASE: Record<string, { totalDays: number; stages: { stageId: CropGrowthStageId; durationDays: number; label: string; emoji: string; waterNeed: 'low' | 'moderate' | 'high' | 'critical'; nutrient: string; desc: string; action: string; avoid: string; risks: string[] }[] }> = {
  Rice: {
    totalDays: 120,
    stages: [
      { stageId: 'planting', durationDays: 10, label: '🌱 Nursery / Sowing', emoji: '🌱', waterNeed: 'moderate', nutrient: 'Basal DAP / FYM', desc: 'Seedbed preparation and seedling emergence.', action: 'Maintain shallow standing water 2-3 cm in nursery bed.', avoid: 'Avoid soil cracking or deep water inundation.', risks: ['Damping off', 'Bird damage'] },
      { stageId: 'germination', durationDays: 15, label: '🌿 Seedling & Transplanting', emoji: '🌿', waterNeed: 'high', nutrient: 'Zinc Sulfate + Urea', desc: 'Root establishment and early tillering in main puddle field.', action: 'Transplant 2-3 seedlings per hill at 2-3 cm depth.', avoid: 'Avoid delayed transplanting (>25 days old seedlings).', risks: ['Transplant shock', 'Stem borer'] },
      { stageId: 'vegetative', durationDays: 35, label: '🌱 Active Tillering', emoji: '🌱', waterNeed: 'high', nutrient: 'Top-dress Nitrogen (Urea Split 1)', desc: 'Rapid tiller formation and biomass accumulation.', action: 'Maintain 3-5 cm standing water layer.', avoid: 'Avoid dry spell during peak tillering.', risks: ['Leaf blast', 'Brown plant hopper'] },
      { stageId: 'flowering', durationDays: 25, label: '🌼 Panicle Initiation & Flowering', emoji: '🌼', waterNeed: 'critical', nutrient: 'Muriate of Potash (K2O)', desc: 'Panicle emergence, pollen viability, and spikelet fertilization.', action: 'Crucial irrigation window. Never let soil dry out.', avoid: 'Never spray heavy systemic chemicals during active morning pollination.', risks: ['False smut', 'Bacterial leaf blight', 'Heat sterility'] },
      { stageId: 'fruiting', durationDays: 20, label: '🌾 Grain Filling (Milky / Dough)', emoji: '🌾', waterNeed: 'high', nutrient: 'Foliar Potassium Silicate (optional)', desc: 'Carbohydrate starch deposition inside grains.', action: 'Alternate wetting and drying with shallow moisture.', avoid: 'Avoid waterlogging just before drainage.', risks: ['Rice bug', 'Grain discoloration'] },
      { stageId: 'maturity', durationDays: 15, label: '🌾 Ripening & Golden Canopy', emoji: '🌾', waterNeed: 'low', nutrient: 'None needed', desc: 'Grain hardening and straw turning 80-85% golden yellow.', action: 'Drain field 7-10 days prior to harvest for firm ground.', avoid: 'Do not irrigate after 85% panicle yellowing.', risks: ['Lodging', 'Rat damage', 'Shattering'] }
    ]
  },
  Tomato: {
    totalDays: 105,
    stages: [
      { stageId: 'planting', durationDays: 8, label: '🌱 Nursery Sowing', emoji: '🌱', waterNeed: 'moderate', nutrient: 'Trichoderma enriched compost', desc: 'Tray seeding and germination in protected shed.', action: 'Keep seedling trays moist with fine misting.', avoid: 'Avoid direct scorch sun on emergent sprout.', risks: ['Seed rot', 'Pythium damping off'] },
      { stageId: 'germination', durationDays: 14, label: '🌿 Transplanting & Rooting', emoji: '🌿', waterNeed: 'moderate', nutrient: 'Basal 19:19:19 NPK + Boron', desc: 'Bed planting on raised mulch beds.', action: 'Drench roots with bio-fungicide during transplanting.', avoid: 'Avoid planting in hot midday sun.', risks: ['Transplant wilting', 'Cutworms'] },
      { stageId: 'vegetative', durationDays: 28, label: '🌱 Vegetative Bushing & Staking', emoji: '🌱', waterNeed: 'high', nutrient: 'Calcium Nitrate + Magnesium', desc: 'Foliage canopy growth, branching, and trellising.', action: 'Stake plants firmly and prune bottom suckers 15cm from soil.', avoid: 'Avoid overhead sprinkler wetting on dense canopy.', risks: ['Early blight', 'Whiteflies', 'Leaf curl virus'] },
      { stageId: 'flowering', durationDays: 20, label: '🌼 Flower Clusters & Setting', emoji: '🌼', waterNeed: 'high', nutrient: 'Boron + Potassium 13:0:45', desc: 'Abundant yellow flower trusses and fruit set.', action: 'Maintain stable drip moisture to prevent flower drop.', avoid: 'Avoid sudden moisture fluctuations causing blossom end rot.', risks: ['Blossom end rot', 'Thrips', 'Fruit borer'] },
      { stageId: 'fruiting', durationDays: 25, label: '🍅 Fruit Enlargement & Breaker', emoji: '🍅', waterNeed: 'high', nutrient: 'SOP (0:0:50) Potassium', desc: 'Green fruits expanding to breaker/pink blush stage.', action: 'Harvest at breaker stage for distant transport or red for local.', avoid: 'Avoid over-irrigation causing fruit cracking/splitting.', risks: ['Fruit cracking', 'Late blight', 'Sunscald'] },
      { stageId: 'maturity', durationDays: 10, label: '🍅 Continuous Picking', emoji: '🍅', waterNeed: 'moderate', nutrient: 'Micro-nutrients maintenance', desc: 'Regular flush harvesting every 3-4 days.', action: 'Pick early morning with calyx attached.', avoid: 'Do not pile picked crates in open hot sun.', risks: ['Post-harvest rots', 'Market price drops'] }
    ]
  },
  Wheat: {
    totalDays: 125,
    stages: [
      { stageId: 'planting', durationDays: 10, label: '🌱 Sowing & Crown Root', emoji: '🌱', waterNeed: 'moderate', nutrient: 'Basal DAP + Zinc', desc: 'Seed germination and crown root initiation (CRI).', action: 'Ensure first CRI irrigation at 21 days after sowing.', avoid: 'Do not miss CRI irrigation stage.', risks: ['Poor germination', 'Termites'] },
      { stageId: 'germination', durationDays: 20, label: '🌿 Crown Root & Early Tillers', emoji: '🌿', waterNeed: 'high', nutrient: 'First Urea top-dress', desc: 'Crown root anchoring and vigorous tillering.', action: 'Weed management and light inter-cultivation.', avoid: 'Avoid water ponding for more than 24 hours.', risks: ['Phalaris minor weeds', 'Aphids'] },
      { stageId: 'vegetative', durationDays: 35, label: '🌱 Jointing & Stem Elongation', emoji: '🌱', waterNeed: 'high', nutrient: 'Second Urea top-dress', desc: 'Node development, rapid upward shoot growth.', action: 'Apply second irrigation at jointing stage.', avoid: 'Avoid late nitrogen application after boot stage.', risks: ['Yellow rust', 'Brown rust'] },
      { stageId: 'flowering', durationDays: 25, label: '🌼 Booting & Earhead Heading', emoji: '🌼', waterNeed: 'critical', nutrient: 'Potassium foliar 0:0:50', desc: 'Earheads emerge from boot leaf, anthesis begins.', action: 'Critical watering window. Protect against heat winds.', avoid: 'Avoid dry soil moisture during heading.', risks: ['Karnal bunt', 'Terminal heat stress', 'Aphids'] },
      { stageId: 'fruiting', durationDays: 20, label: '🌾 Milking & Dough Stage', emoji: '🌾', waterNeed: 'moderate', nutrient: 'None', desc: 'Grain formation and starch accumulation.', action: 'Light irrigation on non-windy days to avoid lodging.', avoid: 'Never irrigate on high wind forecast days (>20 km/h).', risks: ['Crop lodging', 'Early maturity from heat wave'] },
      { stageId: 'maturity', durationDays: 15, label: '🌾 Hardening & Harvest', emoji: '🌾', waterNeed: 'low', nutrient: 'None', desc: 'Grain moisture drops below 14%, golden straw.', action: 'Harvest when grains resist thumbnail indentation.', avoid: 'Do not delay harvest if pre-monsoon storm threatens.', risks: ['Hail damage', 'Grain shattering'] }
    ]
  },
  Maize: {
    totalDays: 110,
    stages: [
      { stageId: 'planting', durationDays: 8, label: '🌱 Sowing & Emergence', emoji: '🌱', waterNeed: 'moderate', nutrient: 'Basal NPK 10:26:26', desc: 'Seedling emergence and initial radicle anchoring.', action: 'Ensure optimal seedbed soil moisture.', avoid: 'Avoid waterlogging.', risks: ['Fall armyworm', 'Bird damage'] },
      { stageId: 'vegetative', durationDays: 35, label: '🌱 Knee-High & Grand Growth', emoji: '🌱', waterNeed: 'high', nutrient: 'Urea top-dress + Zinc', desc: 'Rapid stem elongation and leaf whorl development.', action: 'Scout whorls weekly for Fall Armyworm larvae.', avoid: 'Avoid soil crusting.', risks: ['Fall Armyworm', 'Stem borer'] },
      { stageId: 'flowering', durationDays: 25, label: '🌼 Tasseling & Silking', emoji: '🌼', waterNeed: 'critical', nutrient: 'Potassium', desc: 'Pollen shedding from tassels and silk emergence on ears.', action: 'Most critical water stage. Ensure zero moisture stress.', avoid: 'Never allow moisture stress during silking.', risks: ['Poor pollination', 'Ear rot'] },
      { stageId: 'fruiting', durationDays: 27, label: '🌽 Grain Filling & Cob Blister', emoji: '🌽', waterNeed: 'high', nutrient: 'Foliar micronutrients', desc: 'Kernels fill with starch and develop dent.', action: 'Maintain regular irrigation until black layer forms.', avoid: 'Avoid sudden drying.', risks: ['Cob rot', 'Bird damage'] },
      { stageId: 'maturity', durationDays: 15, label: '🌽 Husk Drying & Harvest', emoji: '🌽', waterNeed: 'low', nutrient: 'None', desc: 'Black abscission layer at kernel base, dried husks.', action: 'Harvest when cob moisture is 18-20%.', avoid: 'Avoid prolonged field exposure.', risks: ['Storage weevils', 'Aflatoxin'] }
    ]
  },
  Cotton: {
    totalDays: 150,
    stages: [
      { stageId: 'planting', durationDays: 12, label: '🌱 Sowing & Emergence', emoji: '🌱', waterNeed: 'moderate', nutrient: 'Basal DAP + Potash', desc: 'Seed emergence and taproot development.', action: 'Plant on ridges for drainage.', avoid: 'Avoid waterlogging.', risks: ['Root rot', 'Cutworms'] },
      { stageId: 'vegetative', durationDays: 45, label: '🌱 Square Formation & Branching', emoji: '🌱', waterNeed: 'moderate', nutrient: 'Urea split + Magnesium', desc: 'Monopodial and sympodial vegetative branching.', action: 'Pheromone traps for pink bollworm monitoring.', avoid: 'Excess nitrogen causing vegetative runaway.', risks: ['Whitefly', 'Jassids', 'Pink bollworm'] },
      { stageId: 'flowering', durationDays: 35, label: '🌼 Peak Flowering & Boll Setting', emoji: '🌼', waterNeed: 'critical', nutrient: 'Boron + Potassium nitrate 13:0:45', desc: 'White to pink flowers and green boll growth.', action: 'Ensure steady drip irrigation and square retention.', avoid: 'Water stress causing massive flower drop.', risks: ['Pink bollworm', 'Square drop'] },
      { stageId: 'fruiting', durationDays: 40, label: '⚪ Boll Development & Opening', emoji: '⚪', waterNeed: 'moderate', nutrient: 'None', desc: 'Bolls mature and burst into fluffy white lint.', action: 'Pick cleanly in dry sunny afternoon hours.', avoid: 'Picking wet cotton or contaminated trash.', risks: ['Boll rot', 'Lint staining'] },
      { stageId: 'maturity', durationDays: 18, label: '⚪ Final Pickings & Stalk Removal', emoji: '⚪', waterNeed: 'low', nutrient: 'None', desc: 'Complete pickings and shred stalks to break pest cycle.', action: 'Shred cotton stalks promptly after harvest.', avoid: 'Leaving ratoons supporting over-wintering pests.', risks: ['Pink bollworm carryover'] }
    ]
  },
  Default: {
    totalDays: 110,
    stages: [
      { stageId: 'planting', durationDays: 10, label: '🌱 Planting / Sowing', emoji: '🌱', waterNeed: 'moderate', nutrient: 'Basal balanced NPK', desc: 'Initial seed placement and germination.', action: 'Ensure moist, well-aerated seedbed.', avoid: 'Avoid water pooling and extreme compaction.', risks: ['Damping off', 'Poor emergence'] },
      { stageId: 'germination', durationDays: 15, label: '🌿 Seedling & Emergence', emoji: '🌿', waterNeed: 'moderate', nutrient: 'Starter fertilizer', desc: 'First true leaves and early root anchoring.', action: 'Check seedling vigor and weed competition.', avoid: 'Avoid harsh herbicide wash.', risks: ['Insect cutworms', 'Soil crust'] },
      { stageId: 'vegetative', durationDays: 35, label: '🌱 Vegetative Growth', emoji: '🌱', waterNeed: 'high', nutrient: 'Nitrogen split application', desc: 'Stem growth, canopy branching, and root depth.', action: 'Maintain active irrigation and weed-free zone.', avoid: 'Avoid prolonged water deficit.', risks: ['Foliar leaf spots', 'Sucking pests'] },
      { stageId: 'flowering', durationDays: 25, label: '🌼 Flowering & Bloom', emoji: '🌼', waterNeed: 'critical', nutrient: 'Potassium + Phosphorus', desc: 'Floral organ initiation and pollination.', action: 'Ensure consistent soil moisture for flower retention.', avoid: 'Avoid harsh pesticide sprays during peak bloom.', risks: ['Flower drop', 'Heat stress'] },
      { stageId: 'fruiting', durationDays: 15, label: '🍅 Pod / Fruit Development', emoji: '🍅', waterNeed: 'high', nutrient: 'Potassium foliar boost', desc: 'Fruit enlargement and seed filling.', action: 'Balanced watering to prevent fruit drop or cracking.', avoid: 'Avoid rapid dry-wet oscillations.', risks: ['Fruit rot', 'Insect boring'] },
      { stageId: 'maturity', durationDays: 10, label: '🌾 Maturity & Harvest Window', emoji: '🌾', waterNeed: 'low', nutrient: 'None', desc: 'Crop ripening and readiness for picking/cutting.', action: 'Prepare harvest equipment, labor, and storage.', avoid: 'Do not harvest under wet rain conditions.', risks: ['Grain mold', 'Lodging'] }
    ]
  }
};

const STORAGE_KEY_STAGE_OVERRIDE = 'croperx_farmer_crop_stage_override';
const STORAGE_KEY_PLANTING_DATE = 'croperx_farmer_planting_date';

export const cropLifecycleService = {
  getStagesForCrop(cropName: string) {
    const matched = CROP_STAGES_DATABASE[cropName] || CROP_STAGES_DATABASE.Default;
    return matched.stages;
  },

  getSavedPlantingDate(defaultFallback?: string): string {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PLANTING_DATE);
      if (saved) return saved;
    } catch {
      // ignore
    }
    if (defaultFallback) return defaultFallback;
    // Default to 45 days ago for demonstration
    const d = new Date();
    d.setDate(d.getDate() - 45);
    return d.toISOString().split('T')[0];
  },

  setPlantingDate(dateIso: string) {
    try {
      localStorage.setItem(STORAGE_KEY_PLANTING_DATE, dateIso);
    } catch {
      // ignore
    }
  },

  getSavedStageOverride(cropName: string): CropGrowthStageId | null {
    try {
      const raw = localStorage.getItem(`${STORAGE_KEY_STAGE_OVERRIDE}_${cropName}`);
      if (raw) return raw as CropGrowthStageId;
    } catch {
      // ignore
    }
    return null;
  },

  setStageOverride(cropName: string, stageId: CropGrowthStageId | null) {
    try {
      if (stageId) {
        localStorage.setItem(`${STORAGE_KEY_STAGE_OVERRIDE}_${cropName}`, stageId);
      } else {
        localStorage.removeItem(`${STORAGE_KEY_STAGE_OVERRIDE}_${cropName}`);
      }
    } catch {
      // ignore
    }
  },

  evaluateLifecycle(cropName: string, customPlantingDate?: string): CropLifecycleState {
    const plantingDate = customPlantingDate || this.getSavedPlantingDate();
    const config = CROP_STAGES_DATABASE[cropName] || CROP_STAGES_DATABASE.Default;
    const stages = config.stages;

    // Calculate elapsed days
    const planted = new Date(plantingDate);
    const now = new Date();
    const diffTime = Math.max(0, now.getTime() - planted.getTime());
    const daysSincePlanting = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    const manualOverride = this.getSavedStageOverride(cropName);

    // Calculate stage chronologically
    let accumulatedDays = 0;
    let computedStageIndex = 0;
    for (let i = 0; i < stages.length; i++) {
      accumulatedDays += stages[i].durationDays;
      if (daysSincePlanting < accumulatedDays) {
        computedStageIndex = i;
        break;
      }
      if (i === stages.length - 1) {
        computedStageIndex = stages.length - 1;
      }
    }

    let activeStageIndex = computedStageIndex;
    let isManual = false;

    if (manualOverride) {
      const foundIdx = stages.findIndex(s => s.stageId === manualOverride);
      if (foundIdx !== -1) {
        activeStageIndex = foundIdx;
        isManual = true;
      }
    }

    const currentStage = stages[activeStageIndex];
    const nextStage = stages[activeStageIndex + 1] || null;

    // Calculate next stage estimate
    let daysUntilNext = 7;
    let nextStageDate = '';
    if (nextStage) {
      // Days remaining in this stage
      let daysBeforeThisStage = 0;
      for (let i = 0; i < activeStageIndex; i++) {
        daysBeforeThisStage += stages[i].durationDays;
      }
      const daysSpentInThisStage = Math.max(0, daysSincePlanting - daysBeforeThisStage);
      daysUntilNext = Math.max(1, currentStage.durationDays - daysSpentInThisStage);
      const nextDate = new Date();
      nextDate.setDate(nextDate.getDate() + daysUntilNext);
      nextStageDate = nextDate.toISOString().split('T')[0];
    }

    // Calculate harvest window
    const totalDays = config.totalDays;
    const daysRemainingToHarvest = Math.max(0, totalDays - daysSincePlanting);
    const harvestStart = new Date(planted);
    harvestStart.setDate(harvestStart.getDate() + totalDays - 5);
    const harvestEnd = new Date(planted);
    harvestEnd.setDate(harvestEnd.getDate() + totalDays + 10);

    const progressPercent = Math.min(100, Math.round((daysSincePlanting / totalDays) * 100));

    const upcomingTasks: string[] = [
      currentStage.action,
      nextStage ? `Prepare for ${nextStage.label} (${nextStage.nutrient})` : 'Prepare harvest logistics & crates'
    ];

    return {
      cropName,
      plantingDate,
      daysSincePlanting,
      currentStageId: currentStage.stageId,
      currentStageName: currentStage.label,
      isManuallySetStage: isManual,
      estimatedNextStageDate: nextStageDate,
      estimatedNextStageName: nextStage ? nextStage.label : 'Final Harvest Window',
      daysUntilNextStage: daysUntilNext,
      estimatedHarvestStartDate: harvestStart.toISOString().split('T')[0],
      estimatedHarvestEndDate: harvestEnd.toISOString().split('T')[0],
      daysUntilHarvest: daysRemainingToHarvest,
      stageProgressPercent: progressPercent,
      totalLifecycleDays: totalDays,
      healthHeadline: `Crop is in ${currentStage.label} stage (${daysSincePlanting} days post-sowing).`,
      importantUpcomingTasks: upcomingTasks
    };
  }
};
