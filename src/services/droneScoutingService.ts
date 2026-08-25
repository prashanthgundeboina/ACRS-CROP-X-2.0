import { DroneAnomalyPin, DroneScoutingReport, DroneWaypoint, SpectralBandMode } from '../types/droneTypes';
import { SoilData, FarmZone } from '../types';

export const INITIAL_ANOMALIES: DroneAnomalyPin[] = [
  {
    id: 'anom-1',
    x: 28,
    y: 35,
    zoneId: 'z1',
    zoneName: 'North Field A',
    type: 'nitrogen_deficiency',
    severity: 'medium',
    confidence: 93,
    title: 'Localized Chlorosis & Nitrogen Starvation',
    description: 'Spectral NDRE ratio dropped by 34% compared to surrounding canopy. Chlorophyll synthesis stunted due to leaching.',
    ndviScore: 0.42,
    thermalDeltaC: 1.8,
    recommendedAction: 'Apply targeted foliar spray of 2% Urea solution or calcium nitrate micro-dose in Zone A2.',
    estimatedAreaSqm: 850,
    potentialYieldImpactPct: 6.5
  },
  {
    id: 'anom-2',
    x: 72,
    y: 22,
    zoneId: 'z1',
    zoneName: 'North Field A',
    type: 'weed_infestation',
    severity: 'high',
    confidence: 96,
    title: 'Broadleaf Weed Patch Cluster (Parthenium/Amaranthus)',
    description: 'High reflectance variance in red-edge spectrum indicates competitive weed canopy crowding crop seedlings.',
    ndviScore: 0.78,
    thermalDeltaC: -0.9,
    recommendedAction: 'Deploy spot-targeted biological herbicide or mechanical inter-row cultivation within 48h.',
    estimatedAreaSqm: 1200,
    potentialYieldImpactPct: 11.2
  },
  {
    id: 'anom-3',
    x: 45,
    y: 68,
    zoneId: 'z2',
    zoneName: 'South Greenhouse B',
    type: 'water_stress',
    severity: 'critical',
    confidence: 98,
    title: 'Thermal Canopy Hyper-Elevation (Drip Line Occlusion)',
    description: 'Thermal IR reveals canopy temperature +3.6°C above ambient baseline. Lateral drip line emitter blockage detected.',
    ndviScore: 0.35,
    thermalDeltaC: 3.6,
    recommendedAction: 'Inspect and flush Sub-main valve 3. Elevate zone irrigation duration by 25 minutes.',
    estimatedAreaSqm: 420,
    potentialYieldImpactPct: 15.0
  },
  {
    id: 'anom-4',
    x: 82,
    y: 75,
    zoneId: 'z3',
    zoneName: 'East Terraces C',
    type: 'foliar_disease',
    severity: 'medium',
    confidence: 89,
    title: 'Early Stage Cercospora Leaf Spot Precursor',
    description: 'Circular necrotic lesions flagged by multispectral texture classifier in high-humidity border depression.',
    ndviScore: 0.51,
    thermalDeltaC: 0.8,
    recommendedAction: 'Preventative bio-fungicide spray (Trichoderma viride + copper oxychloride at 2.5g/L).',
    estimatedAreaSqm: 650,
    potentialYieldImpactPct: 7.8
  }
];

export function generateWaypointsForZones(zones: FarmZone[]): DroneWaypoint[] {
  const waypoints: DroneWaypoint[] = [
    { id: 'wp-home', lat: 20.5937, lng: 78.9629, x: 10, y: 15, altitudeM: 0, action: 'capture_rgb', status: 'completed' },
    { id: 'wp-1', lat: 20.5940, lng: 78.9632, x: 25, y: 25, altitudeM: 45, action: 'capture_multispectral', status: 'pending' },
    { id: 'wp-2', lat: 20.5943, lng: 78.9635, x: 50, y: 20, altitudeM: 45, action: 'capture_multispectral', status: 'pending' },
    { id: 'wp-3', lat: 20.5946, lng: 78.9638, x: 75, y: 28, altitudeM: 45, action: 'capture_multispectral', status: 'pending' },
    { id: 'wp-4', lat: 20.5944, lng: 78.9642, x: 85, y: 55, altitudeM: 40, action: 'spot_hover', status: 'pending' },
    { id: 'wp-5', lat: 20.5941, lng: 78.9640, x: 60, y: 65, altitudeM: 40, action: 'thermal_scan', status: 'pending' },
    { id: 'wp-6', lat: 20.5938, lng: 78.9636, x: 35, y: 75, altitudeM: 40, action: 'thermal_scan', status: 'pending' },
    { id: 'wp-7', lat: 20.5936, lng: 78.9633, x: 15, y: 80, altitudeM: 35, action: 'capture_rgb', status: 'pending' },
    { id: 'wp-return', lat: 20.5937, lng: 78.9629, x: 10, y: 15, altitudeM: 0, action: 'capture_rgb', status: 'pending' },
  ];
  return waypoints;
}

export function generateScoutingReport(
  cropName: string,
  soilData: SoilData,
  anomalies: DroneAnomalyPin[]
): DroneScoutingReport {
  const avgNdvi = 0.74;
  const canopyUniformity = 86;

  return {
    id: `DRN-${Date.now().toString().slice(-6)}`,
    timestamp: new Date().toLocaleString(),
    flightDurationMinutes: 14.5,
    areaSurveyedHa: 12.5,
    averageNdvi: avgNdvi,
    canopyUniformityPct: canopyUniformity,
    anomaliesFound: anomalies,
    executiveSummary: `Autonomous UAV multispectral aerial sweep of 12.5 hectares completed with 99.4% RTK GPS lock. Overall crop vigor for ${cropName} is classified as Strong (Mean NDVI ${avgNdvi}), with 4 localized micro-variances flagged for surgical intervention. Rapid remediation of water stress in Zone B and weed patches in Zone A will preserve an estimated 2.8 tons of harvest yield.`,
    prescriptionRecommendations: [
      {
        zone: 'North Field A (Quad 2)',
        action: 'Variable Rate Nitrogen Foliar Spray',
        product: 'Nano-Urea + Amino Acid Biostimulant',
        ratePerHa: '4.0 L / ha (Water carrier: 150L)',
        urgency: 'Within 48h'
      },
      {
        zone: 'North Field A (Quad 4)',
        action: 'Selective Spot Weed Elimination',
        product: 'Targeted Post-Emergent Eco-Herbicide',
        ratePerHa: 'Spot application (1.2 ha)',
        urgency: 'Within 48h'
      },
      {
        zone: 'South Greenhouse B',
        action: 'Drip Lateral Flush & Pressure Balance',
        product: 'Citric Acid Descaling & Filter Backwash',
        ratePerHa: 'Full manifold line flush',
        urgency: 'Immediate'
      },
      {
        zone: 'East Terraces C',
        action: 'Preventative Bio-Fungicide Swath',
        product: 'Bacillus subtilis + Trichoderma viride',
        ratePerHa: '2.5 kg / ha',
        urgency: 'Routine'
      }
    ]
  };
}
