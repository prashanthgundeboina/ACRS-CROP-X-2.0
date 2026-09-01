import { AgentContext, AIIntentCategory, FarmerAIAgent } from './types';
import { MemoryService } from './memoryService';

export class RetrievalService {
  /**
   * Classifies user input into one of the specialized intent categories.
   */
  static classifyIntent(query: string): AIIntentCategory {
    const q = query.toLowerCase();
    if (q.includes('pest') || q.includes('insect') || q.includes('bug') || q.includes('worm') || q.includes('caterpillar') || q.includes('spray')) {
      return 'PEST';
    }
    if (q.includes('disease') || q.includes('yellow') || q.includes('spot') || q.includes('fungus') || q.includes('leaf') || q.includes('rot') || q.includes('blast') || q.includes('rust')) {
      return 'CROP_HEALTH';
    }
    if (q.includes('soil') || q.includes('nitrogen') || q.includes('ph') || q.includes('fertilizer') || q.includes('npk') || q.includes('urea') || q.includes('dap') || q.includes('potash')) {
      return 'SOIL';
    }
    if (q.includes('water') || q.includes('irrigation') || q.includes('drip') || q.includes('moisture') || q.includes('dry') || q.includes('rain')) {
      return 'IRRIGATION';
    }
    if (q.includes('weather') || q.includes('forecast') || q.includes('temperature') || q.includes('humidity') || q.includes('storm') || q.includes('cyclone') || q.includes('frost')) {
      return 'WEATHER';
    }
    if (q.includes('price') || q.includes('cost') || q.includes('profit') || q.includes('yield') || q.includes('mandi') || q.includes('budget') || q.includes('market')) {
      return 'FARM_ECONOMICS';
    }
    if (q.includes('buy') || q.includes('store') || q.includes('product') || q.includes('seed') || q.includes('order') || q.includes('delivery')) {
      return 'AGRI_STORE';
    }
    return 'GENERAL_ADVISORY';
  }

  /**
   * Retrieves strictly isolated farmer context and structured memory.
   */
  static buildContext(
    farmer: {
      id: string;
      name: string;
      phone?: string;
      location?: string;
      primaryCrop?: string;
      farmSizeAcres?: number;
      language?: string;
    },
    agent: FarmerAIAgent,
    recentInteractions: any[] = []
  ): AgentContext {
    // 1. Fetch farmer's isolated memories
    const allMemories = MemoryService.getMemoriesByFarmer(farmer.id);

    // Limit memory records to the most recent 15 relevant items to avoid context blowout
    const boundedMemories = allMemories.slice(-15);

    // 2. Extract soil & weather snapshots if stored in memory
    const soilMemory = allMemories.find((m) => m.memoryKey === 'soil_ph' || m.memoryKey === 'soil_condition');
    const weatherMemory = allMemories.find((m) => m.memoryKey === 'weather_risk');

    const soilHealth = {
      ph: soilMemory?.memoryValue?.ph || 6.8,
      nitrogen: soilMemory?.memoryValue?.nitrogen || 'Medium (280 kg/ha)',
      phosphorus: soilMemory?.memoryValue?.phosphorus || 'Optimal (35 kg/ha)',
      potassium: soilMemory?.memoryValue?.potassium || 'High (310 kg/ha)'
    };

    return {
      farmer,
      agent,
      memories: boundedMemories,
      recentInteractions: recentInteractions.slice(0, 5),
      weatherRisk: weatherMemory?.memoryValue || 'Moderate humidity, isolated light showers expected',
      soilHealth
    };
  }
}
