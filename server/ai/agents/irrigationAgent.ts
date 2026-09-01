import { AgentContext, AgentResponse } from '../types';

export class IrrigationAgent {
  static handle(query: string, context: AgentContext): AgentResponse {
    const crop = context.farmer.primaryCrop || 'Paddy';
    const acres = context.farmer.farmSizeAcres || 3.0;

    return {
      intent: 'IRRIGATION',
      response: `For your ${acres}-acre ${crop} cultivation, current evapotranspiration rate is estimated at 4.2 mm/day. Alternate Wetting and Drying (AWD) is recommended: allow water to drop 5 cm below soil surface before irrigating again. This saves 25-30% irrigation water without reducing grain yield, while strengthening root anchorage against lodging.`,
      confidence: 93.8,
      riskLevel: 'LOW',
      recommendedActions: [
        'Adopt AWD (Alternate Wetting and Drying) water regime with field water tubes',
        'Irrigate during early morning or twilight hours to reduce evaporation loss',
        'Ensure drainage outlets are clear in case of sudden high-intensity precipitation'
      ],
      recommendedProducts: [
        { id: 'PROD-009', name: 'Field Water Tube / AWD Sensor (Pack of 3)', price: 260, reason: 'Visual soil moisture depth indicator for water saving' }
      ],
      escalated: false,
      memoryUpdates: [
        { type: 'actions', key: 'irrigation_protocol', value: 'Alternate Wetting and Drying (AWD)', confidence: 0.95 }
      ]
    };
  }
}
