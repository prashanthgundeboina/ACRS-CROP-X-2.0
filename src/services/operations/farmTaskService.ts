import { 
  FarmTask, 
  FarmTaskCategory, 
  FarmTaskPriority, 
  FarmTaskStatus, 
  FertilizerRecord,
  CropHealthTimelineEvent 
} from '../../types/operations/farmOperationsTypes';
import { SoilData, FarmZone, CropRecommendation } from '../../types';

const STORAGE_KEY_TASKS = 'croperx_farm_tasks_v1';
const STORAGE_KEY_FERTILIZER_HISTORY = 'croperx_fertilizer_history_v1';
const STORAGE_KEY_HEALTH_TIMELINE = 'croperx_health_timeline_v1';

export const farmTaskService = {
  getTasks(): FarmTask[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_TASKS);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {
      // ignore
    }
    return this.getDefaultInitialTasks();
  },

  saveTasks(tasks: FarmTask[]) {
    try {
      localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
    } catch {
      // ignore
    }
  },

  updateTaskStatus(taskId: string, status: FarmTaskStatus): FarmTask[] {
    const tasks = this.getTasks();
    const updated = tasks.map(t => {
      if (t.task_id === taskId) {
        return {
          ...t,
          status,
          completed_at: status === 'Completed' ? new Date().toISOString() : t.completed_at
        };
      }
      return t;
    });
    this.saveTasks(updated);
    return updated;
  },

  snoozeTask(taskId: string, daysAhead: number = 1): FarmTask[] {
    const tasks = this.getTasks();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);
    const dateStr = futureDate.toISOString().split('T')[0];

    const updated = tasks.map(t => {
      if (t.task_id === taskId) {
        return {
          ...t,
          status: 'Snoozed' as FarmTaskStatus,
          due_date: dateStr,
          snoozed_until: dateStr
        };
      }
      return t;
    });
    this.saveTasks(updated);
    return updated;
  },

  addTask(task: Omit<FarmTask, 'task_id'>): FarmTask {
    const tasks = this.getTasks();
    const newTask: FarmTask = {
      ...task,
      task_id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`
    };
    const updated = [newTask, ...tasks];
    this.saveTasks(updated);
    return newTask;
  },

  // Generates or syncs automatic farm tasks based on current farm telemetry & weather
  syncLiveEngineTasks(params: {
    soilData: SoilData;
    cropName: string;
    growthStage: string;
    weatherTemp: number;
    weatherRainProb: number;
    weatherRainfallForecastMm: number;
    isSoilDry: boolean;
  }): FarmTask[] {
    const currentTasks = this.getTasks();
    const { soilData, cropName, growthStage, weatherTemp, weatherRainProb, weatherRainfallForecastMm, isSoilDry } = params;

    const todayStr = new Date().toISOString().split('T')[0];
    const rainExpectedSoon = weatherRainProb >= 55 || weatherRainfallForecastMm >= 10;

    const newGeneratedTasks: FarmTask[] = [];

    // 1. Irrigation Task
    if (isSoilDry) {
      const exists = currentTasks.some(t => t.category === 'irrigation' && t.status === 'Pending' && t.due_date === todayStr);
      if (!exists) {
        newGeneratedTasks.push({
          task_id: `gen_irrig_${todayStr}`,
          title: `💧 Morning Precision Irrigation (${cropName})`,
          category: 'irrigation',
          zone: 'All Active Zones',
          priority: 'High',
          due_date: todayStr,
          due_time: '06:30 AM',
          reason: `Soil moisture (${soilData.soil_moisture}%) is below optimal threshold during active ${growthStage}.`,
          whatToAvoid: 'Avoid afternoon watering in peak heat (>32°C) to prevent evaporative loss.',
          status: 'Pending',
          created_from: 'sensor_alert',
          weatherWarning: rainExpectedSoon ? '⚠️ Rain forecast expected: consider reducing runtime by 40%.' : undefined,
          navTab: 'irrigation',
          navLabel: 'Check Smart Irrigation'
        });
      }
    }

    // 2. Fertilizer Task Check with Weather Conflict Guard
    const fertilizerHistory = this.getFertilizerHistory();
    const lastFertilizer = fertilizerHistory[0];
    const daysSinceLastFertilizer = lastFertilizer 
      ? Math.floor((new Date().getTime() - new Date(lastFertilizer.date).getTime()) / (1000 * 60 * 60 * 24))
      : 30;

    if (daysSinceLastFertilizer >= 18 && (growthStage.toLowerCase().includes('vegetative') || growthStage.toLowerCase().includes('tillering') || growthStage.toLowerCase().includes('flowering'))) {
      const fertExists = currentTasks.some(t => t.category === 'fertilizer' && t.status === 'Pending');
      if (!fertExists) {
        newGeneratedTasks.push({
          task_id: `gen_fert_${todayStr}`,
          title: `🧪 Nutrient Split Application (${cropName})`,
          category: 'fertilizer',
          zone: 'Main Field',
          priority: rainExpectedSoon ? 'Medium' : 'High',
          due_date: todayStr,
          due_time: '08:00 AM',
          reason: `Crop is at ${growthStage} stage and NPK requirement is elevated.`,
          whatToAvoid: 'Do not broadcast fertilizer on water-stressed dry soil or right before heavy rainfall.',
          status: 'Pending',
          created_from: 'automatic_ai',
          weatherWarning: rainExpectedSoon ? '🛑 Heavy rain warning: Postpone chemical/urea broadcasting to prevent leaching runoff.' : undefined,
          navTab: 'fertilizer',
          navLabel: 'View Fertilizer Plan'
        });
      }
    }

    // 3. Pest & Disease Routine Scouting
    const scoutExists = currentTasks.some(t => t.category === 'pest_monitoring' && t.status === 'Pending');
    if (!scoutExists) {
      newGeneratedTasks.push({
        task_id: `gen_scout_${todayStr}`,
        title: `🐛 Field Canopy Pest Scouting & Leaf Inspection`,
        category: 'pest_monitoring',
        zone: 'Zone 1 & Perimeter',
        priority: 'Medium',
        due_date: todayStr,
        due_time: '04:00 PM',
        reason: `High relative humidity (${soilData.humidity}%) creates favorable spore germination conditions.`,
        whatToAvoid: 'Avoid scouting during peak dew if crop is prone to bacterial spread.',
        status: 'Pending',
        created_from: 'automatic_ai',
        navTab: 'diagnosis',
        navLabel: 'Scan Plant Leaf'
      });
    }

    if (newGeneratedTasks.length > 0) {
      const merged = [...newGeneratedTasks, ...currentTasks];
      this.saveTasks(merged);
      return merged;
    }

    return currentTasks;
  },

  // Fertilizer History Management
  getFertilizerHistory(): FertilizerRecord[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_FERTILIZER_HISTORY);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    // Default sample history
    const d1 = new Date();
    d1.setDate(d1.getDate() - 14);
    const d2 = new Date();
    d2.setDate(d2.getDate() - 32);

    return [
      {
        id: 'fert_1',
        date: d1.toISOString().split('T')[0],
        fertilizerType: 'Urea (46% N) + Zinc Sulphate',
        amountKg: 25,
        fieldZone: 'Main Field (Zone A)',
        cropStage: '🌱 Vegetative Bushing',
        notes: 'Broadcasted with light evening irrigation. No rain in forecast.',
        weatherSuitability: 'optimal'
      },
      {
        id: 'fert_2',
        date: d2.toISOString().split('T')[0],
        fertilizerType: 'DAP (18:46:0) + MOP',
        amountKg: 40,
        fieldZone: 'Whole Farm',
        cropStage: '🌱 Basal Sowing',
        notes: 'Incorporated into top 5cm soil during final harrowing.',
        weatherSuitability: 'optimal'
      }
    ];
  },

  addFertilizerRecord(record: Omit<FertilizerRecord, 'id'>): FertilizerRecord {
    const history = this.getFertilizerHistory();
    const newRecord: FertilizerRecord = {
      ...record,
      id: `fert_${Date.now()}`
    };
    const updated = [newRecord, ...history];
    try {
      localStorage.setItem(STORAGE_KEY_FERTILIZER_HISTORY, JSON.stringify(updated));
    } catch {
      // ignore
    }

    // Add to health timeline
    this.addHealthTimelineEvent({
      date: record.date,
      type: 'fertilizer',
      title: `Applied ${record.fertilizerType} (${record.amountKg} kg)`,
      description: `Applied in ${record.fieldZone} during ${record.cropStage}. ${record.notes || ''}`
    });

    return newRecord;
  },

  // Health Timeline Events
  getHealthTimeline(): CropHealthTimelineEvent[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY_HEALTH_TIMELINE);
      if (raw) return JSON.parse(raw);
    } catch {
      // ignore
    }
    const d1 = new Date();
    d1.setDate(d1.getDate() - 1);
    const d2 = new Date();
    d2.setDate(d2.getDate() - 4);
    const d3 = new Date();
    d3.setDate(d3.getDate() - 10);

    return [
      {
        id: 'ev_1',
        date: d1.toISOString().split('T')[0],
        type: 'scan',
        title: 'Leaf Scan: Early Blight Check',
        description: 'Plant diagnosis confirmed healthy canopy (94% confidence). No fungal lesions.',
        severity: 'normal'
      },
      {
        id: 'ev_2',
        date: d2.toISOString().split('T')[0],
        type: 'risk_alert',
        title: 'High Humidity Alert (>78%)',
        description: 'Automated weather alert triggered preventative scouting advisory.',
        severity: 'warning'
      },
      {
        id: 'ev_3',
        date: d3.toISOString().split('T')[0],
        type: 'ndvi_change',
        title: 'Satellite NDVI Vigour Peak (0.76)',
        description: 'Vegetation vigour index rose from 0.68 to 0.76 indicating robust vegetative canopy growth.',
        severity: 'normal'
      }
    ];
  },

  addHealthTimelineEvent(event: Omit<CropHealthTimelineEvent, 'id'>): CropHealthTimelineEvent {
    const list = this.getHealthTimeline();
    const newEv: CropHealthTimelineEvent = {
      ...event,
      id: `ev_${Date.now()}`
    };
    const updated = [newEv, ...list];
    try {
      localStorage.setItem(STORAGE_KEY_HEALTH_TIMELINE, JSON.stringify(updated));
    } catch {
      // ignore
    }
    return newEv;
  },

  getDefaultInitialTasks(): FarmTask[] {
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    return [
      {
        task_id: 'task_init_1',
        title: '💧 Early Morning Drip Irrigation',
        category: 'irrigation',
        zone: 'North Field (Zone 1)',
        priority: 'High',
        due_date: today,
        due_time: '06:00 AM',
        reason: 'Soil moisture is at 28% in root zone. Top 5cm drying rapidly.',
        whatToAvoid: 'Avoid over-irrigation causing waterlogging in heavy clay sectors.',
        status: 'Pending',
        created_from: 'sensor_alert',
        navTab: 'irrigation',
        navLabel: 'Smart Irrigation'
      },
      {
        task_id: 'task_init_2',
        title: '🧪 Top-Dress Micronutrient Boron Foliar Spray',
        category: 'fertilizer',
        zone: 'All Flowering Beds',
        priority: 'Medium',
        due_date: today,
        due_time: '08:30 AM',
        reason: 'Flowering initiation requires trace Boron to prevent blossom drop and improve pollen viability.',
        whatToAvoid: 'Do not mix with heavy copper fungicides.',
        status: 'Pending',
        created_from: 'automatic_ai',
        navTab: 'fertilizer',
        navLabel: 'Smart Fertilizer'
      },
      {
        task_id: 'task_init_3',
        title: '🌱 Visual Crop Health Inspection & Trap Check',
        category: 'crop_inspection',
        zone: 'South Field (Zone 2)',
        priority: 'Medium',
        due_date: tomorrowStr,
        due_time: '04:00 PM',
        reason: 'Scout under-leaf surface for early whiteflies or aphids.',
        whatToAvoid: 'Avoid walking in wet fields during bacterial blight risk periods.',
        status: 'Pending',
        created_from: 'automatic_ai',
        navTab: 'diagnosis',
        navLabel: 'Scan Plant'
      },
      {
        task_id: 'task_init_4',
        title: '💰 Check Local Mandi Wholesale Rates',
        category: 'market',
        priority: 'Low',
        due_date: tomorrowStr,
        due_time: '11:00 AM',
        reason: 'Weekly price trends indicate potential uptick in premium grade harvest prices.',
        status: 'Pending',
        created_from: 'automatic_ai',
        navTab: 'market',
        navLabel: 'Market ROI'
      }
    ];
  }
};
