import { AgentContext, AgentResponse } from '../types';

export class CropIntelligenceAgent {
  static handle(query: string, context: AgentContext): AgentResponse {
    const crop = context.farmer.primaryCrop || 'Crop';
    const isPest = query.toLowerCase().includes('pest') || query.toLowerCase().includes('insect') || query.toLowerCase().includes('spray');
    
    if (isPest) {
      return {
        intent: 'PEST',
        response: `Based on your ${crop} field profile in ${context.farmer.location || 'your region'}, our bio-protection model recommends an integrated pest management (IPM) approach. For early vegetative to tillering stages, check leaf folds for stem borer or leaf folder caterpillars. Consider spraying neem-based bio-pesticide (Azadirachtin 10,000 ppm @ 2 ml/L) or placing pheromone traps (4-5 per acre).`,
        confidence: 94.5,
        riskLevel: 'LOW',
        recommendedActions: [
          'Install 4-5 pheromone delta traps across the field perimeter',
          'Apply neem bio-formulation spray in the late afternoon (after 4 PM)',
          'Maintain 2-inch shallow standing water to inhibit larval migration'
        ],
        recommendedProducts: [
          { id: 'PROD-002', name: 'Neem-Shield Bio-Pesticide (1L)', price: 450, reason: 'Safe, organic broad-spectrum protection against chewing pests' },
          { id: 'PROD-005', name: 'Pheromone Trap Delta Kit (Set of 5)', price: 320, reason: 'Continuous eco-friendly pest monitoring and population suppression' }
        ],
        escalated: false,
        memoryUpdates: [
          { type: 'actions', key: 'last_pest_advice', value: 'IPM Neem Bio-pesticide recommended', confidence: 0.95 },
          { type: 'crops', key: 'pest_monitoring_active', value: true, confidence: 0.9 }
        ]
      };
    }

    return {
      intent: 'CROP_HEALTH',
      response: `Your ${crop} crop health evaluation indicates steady vegetative vigor. Given the current seasonal moisture levels, ensure adequate canopy ventilation. If you observe any brown spots or yellow leaf tipping, it could indicate minor zinc deficiency or early fungal blast. Foliar spray of zinc EDTA @ 1g/L combined with organic bio-stimulant will strengthen cellular resistance.`,
      confidence: 96.0,
      riskLevel: 'LOW',
      recommendedActions: [
        'Perform field scouting along diagonal transects every 3 days',
        'Apply Zinc EDTA (12%) foliar nourishment in morning dew clearance',
        'Avoid excess urea application during cloudy weather spells'
      ],
      recommendedProducts: [
        { id: 'PROD-004', name: 'Bio-Chelated Zinc Booster (500g)', price: 290, reason: 'Corrects leaf yellowing and accelerates chlorophyll synthesis' }
      ],
      escalated: false,
      memoryUpdates: [
        { type: 'crops', key: 'canopy_health_status', value: 'Steady Vegetative Vigor', confidence: 0.95 }
      ]
    };
  }
}
