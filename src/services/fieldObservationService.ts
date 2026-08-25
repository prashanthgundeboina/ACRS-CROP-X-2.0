import { CropVisionObservation } from '../types/visionTypes';
import { FieldWalkSession, BeforeAfterComparison } from '../types/fieldObservationTypes';

const OBSERVATIONS_STORAGE_KEY = 'croperx_vision_observations_v1';
const FIELD_WALKS_STORAGE_KEY = 'croperx_field_walk_sessions_v1';

class FieldObservationService {
  private observations: CropVisionObservation[] = [];
  private activeWalkSession: FieldWalkSession | null = null;

  constructor() {
    this.loadObservations();
  }

  private loadObservations(): void {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(OBSERVATIONS_STORAGE_KEY);
      if (raw) {
        this.observations = JSON.parse(raw);
      } else {
        this.seedInitialObservations();
      }
    } catch (e) {
      console.warn('Failed to load vision observations:', e);
      this.seedInitialObservations();
    }
  }

  private persistObservations(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(OBSERVATIONS_STORAGE_KEY, JSON.stringify(this.observations));
    } catch (e) {
      console.warn('Failed to save observations:', e);
    }
  }

  private seedInitialObservations(): void {
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;

    const seed: CropVisionObservation[] = [
      {
        id: 'seed-obs-1',
        timestamp: new Date(now - 3 * oneDay).toISOString(),
        dateFormatted: '3 days ago',
        zoneId: 'zone-1',
        zoneName: 'North Field',
        cropName: 'Rice (Paddy)',
        deviceLabel: 'Mobile Phone Scout (Camera 1)',
        deviceKind: 'mobile',
        frameThumbnailUrl: '',
        quality: {
          isValid: true,
          brightnessScore: 72,
          blurScore: 88,
          contrastScore: 80,
          distanceStatus: 'optimal',
          issues: [],
          farmerGuidance: ['Optimal lighting and sharp leaf focus.'],
        },
        detection: {
          cropType: 'Rice (Paddy)',
          cropConfidence: 96,
          growthStage: 'vegetative',
          canopyCoveragePercent: 78,
          plantDensity: 'optimal',
          leafSymptoms: [
            {
              symptom: 'healthy',
              label: 'Vigorous Green Leaf Lamina',
              severity: 'none',
              confidence: 95,
              locationDescription: 'Upper leaf whorls show erect posture and rich chlorophyll green.',
            },
          ],
          detectedStresses: [],
          weedPresence: { detected: false, coveragePercent: 2, riskLevel: 'low' },
          pestPresence: { detected: false, confidence: 97 },
          rawAnalysisTimestamp: new Date(now - 3 * oneDay).toISOString(),
        },
        advice: {
          whatISee: 'North Field canopy is vibrant, dense, and uniformly green.',
          whyItMayBeHappening: 'Adequate irrigation and root zone moisture have maintained strong cellular turgor.',
          whatYouShouldDo: 'Keep following your standard 4-day irrigation interval.',
          when: 'Routine check in 3 days',
          whatToAvoid: 'Avoid excessive nitrogen top-dressing to prevent lodging.',
          confidenceLevel: 'High',
          confidenceScore: 95,
        },
        fusedSensorContext: {
          soilMoisturePercent: 36,
          ambientTempC: 28,
          humidityPercent: 65,
          rainForecastMm: 0,
        },
      },
      {
        id: 'seed-obs-2',
        timestamp: new Date(now - 1 * oneDay).toISOString(),
        dateFormatted: 'Yesterday',
        zoneId: 'zone-2',
        zoneName: 'South Field',
        cropName: 'Cotton',
        deviceLabel: 'Mobile Phone Scout (Camera 1)',
        deviceKind: 'mobile',
        frameThumbnailUrl: '',
        quality: {
          isValid: true,
          brightnessScore: 65,
          blurScore: 78,
          contrastScore: 70,
          distanceStatus: 'optimal',
          issues: [],
          farmerGuidance: ['Clear frame.'],
        },
        detection: {
          cropType: 'Cotton',
          cropConfidence: 92,
          growthStage: 'vegetative',
          canopyCoveragePercent: 62,
          plantDensity: 'optimal',
          leafSymptoms: [
            {
              symptom: 'wilting',
              label: 'Mild Midday Wilting',
              severity: 'mild',
              confidence: 86,
              locationDescription: 'Top tier leaves showing slight downward curling.',
            },
          ],
          detectedStresses: [
            {
              type: 'water_stress',
              label: 'Early Moisture Deficit',
              probability: 82,
              rationale: 'Soil moisture sensor is at 23% in sandy loam section.',
            },
          ],
          weedPresence: { detected: false, coveragePercent: 5, riskLevel: 'low' },
          pestPresence: { detected: false, confidence: 90 },
          rawAnalysisTimestamp: new Date(now - 1 * oneDay).toISOString(),
        },
        advice: {
          whatISee: 'Cotton foliage in South Field shows mild midday rolling.',
          whyItMayBeHappening: 'Soil moisture is dropping near the 22% threshold with high solar radiation.',
          whatYouShouldDo: 'Run drip irrigation for South Field for 2 hours during the cooler evening.',
          when: 'This evening after 5 PM',
          whatToAvoid: 'Avoid flood irrigation to prevent waterlogging.',
          confidenceLevel: 'High',
          confidenceScore: 90,
        },
        fusedSensorContext: {
          soilMoisturePercent: 23,
          ambientTempC: 33,
          humidityPercent: 42,
          rainForecastMm: 0,
        },
      },
      {
        id: 'seed-obs-3',
        timestamp: new Date(now - 6 * oneDay).toISOString(),
        dateFormatted: '6 days ago',
        zoneId: 'zone-3',
        zoneName: 'East Field',
        cropName: 'Maize / Corn',
        deviceLabel: 'Mobile Phone Scout',
        deviceKind: 'mobile',
        frameThumbnailUrl: '',
        quality: {
          isValid: true,
          brightnessScore: 70,
          blurScore: 82,
          contrastScore: 75,
          distanceStatus: 'optimal',
          issues: [],
          farmerGuidance: ['Clear focus.'],
        },
        detection: {
          cropType: 'Maize / Corn',
          cropConfidence: 94,
          growthStage: 'vegetative',
          canopyCoveragePercent: 70,
          plantDensity: 'optimal',
          leafSymptoms: [
            {
              symptom: 'insect_damage',
              label: 'Early Pin-hole Leaf Perforations',
              severity: 'mild',
              confidence: 84,
              locationDescription: 'Whorl leaves with small shot-hole feeding signs.',
            },
          ],
          detectedStresses: [],
          weedPresence: { detected: true, coveragePercent: 6, riskLevel: 'low' },
          pestPresence: {
            detected: true,
            pestType: 'Fall Armyworm Early Whorl Feeding',
            confidence: 82,
          },
          rawAnalysisTimestamp: new Date(now - 6 * oneDay).toISOString(),
        },
        advice: {
          whatISee: 'Small pin-hole feeding marks inside central whorl of young maize leaves in East Field.',
          whyItMayBeHappening: 'Early stage armyworm larvae active during warm humidity.',
          whatYouShouldDo: 'Drop sand-lime mix or Neem kernel extract into whorls of affected plants.',
          when: 'Inspect today before dusk',
          whatToAvoid: 'Do not spray during midday heat.',
          confidenceLevel: 'High',
          confidenceScore: 87,
        },
        fusedSensorContext: {
          soilMoisturePercent: 29,
          ambientTempC: 30,
          humidityPercent: 60,
          rainForecastMm: 0,
        },
      },
    ];

    this.observations = seed;
    this.persistObservations();
  }

  public getObservations(): CropVisionObservation[] {
    return [...this.observations];
  }

  public getObservationsByZone(zoneId: string): CropVisionObservation[] {
    return this.observations.filter((o) => o.zoneId === zoneId);
  }

  public addObservation(obs: CropVisionObservation): void {
    this.observations.unshift(obs);
    this.persistObservations();

    // If a field walk session is active, attach observation to session
    if (this.activeWalkSession && this.activeWalkSession.status === 'in_progress') {
      this.activeWalkSession.observations.push(obs);
      this.activeWalkSession.totalPlantsScanned += 1;
      const isHealthy = obs.detection.leafSymptoms.every((s) => s.symptom === 'healthy');
      const isStress = obs.detection.detectedStresses.length > 0;
      const isPest = obs.detection.pestPresence.detected;

      if (isHealthy) this.activeWalkSession.healthyCount += 1;
      if (isStress) this.activeWalkSession.stressCount += 1;
      if (isPest) this.activeWalkSession.pestDiseaseCount += 1;

      this.saveActiveWalkSession();
    }
  }

  public deleteObservation(id: string): void {
    this.observations = this.observations.filter((o) => o.id !== id);
    this.persistObservations();
  }

  public clearAllObservations(): void {
    this.observations = [];
    this.persistObservations();
  }

  // FIELD WALK SESSIONS
  public startFieldWalk(zoneId: string, zoneName: string, cropName: string): FieldWalkSession {
    const session: FieldWalkSession = {
      id: `walk-${Date.now()}`,
      startedAt: new Date().toISOString(),
      zoneId,
      zoneName,
      cropName,
      totalPlantsScanned: 0,
      healthyCount: 0,
      stressCount: 0,
      pestDiseaseCount: 0,
      observations: [],
      summaryNote: '',
      status: 'in_progress',
    };
    this.activeWalkSession = session;
    this.saveActiveWalkSession();
    return session;
  }

  public getActiveWalkSession(): FieldWalkSession | null {
    if (!this.activeWalkSession && typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(FIELD_WALKS_STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.status === 'in_progress') {
            this.activeWalkSession = parsed;
          }
        }
      } catch (e) {
        // ignore
      }
    }
    return this.activeWalkSession;
  }

  public completeFieldWalk(summaryNote?: string): FieldWalkSession | null {
    if (!this.activeWalkSession) return null;
    this.activeWalkSession.endedAt = new Date().toISOString();
    this.activeWalkSession.status = 'completed';
    if (summaryNote) {
      this.activeWalkSession.summaryNote = summaryNote;
    }
    const completed = { ...this.activeWalkSession };
    this.activeWalkSession = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem(FIELD_WALKS_STORAGE_KEY);
    }
    return completed;
  }

  private saveActiveWalkSession(): void {
    if (typeof window === 'undefined' || !this.activeWalkSession) return;
    try {
      localStorage.setItem(FIELD_WALKS_STORAGE_KEY, JSON.stringify(this.activeWalkSession));
    } catch (e) {
      console.warn('Failed to save walk session:', e);
    }
  }

  // BEFORE / AFTER COMPARISON
  public compareObservations(
    beforeObs: CropVisionObservation,
    afterObs: CropVisionObservation
  ): BeforeAfterComparison {
    const beforeTime = new Date(beforeObs.timestamp).getTime();
    const afterTime = new Date(afterObs.timestamp).getTime();
    const diffDays = Math.max(1, Math.round(Math.abs(afterTime - beforeTime) / (1000 * 60 * 60 * 24)));

    const beforeCoverage = beforeObs.detection.canopyCoveragePercent || 60;
    const afterCoverage = afterObs.detection.canopyCoveragePercent || 60;
    const canopyDiff = afterCoverage - beforeCoverage;

    const beforeHasStress = beforeObs.detection.detectedStresses.length > 0;
    const afterHasStress = afterObs.detection.detectedStresses.length > 0;

    let conclusion: BeforeAfterComparison['comparisonConclusion'] = 'Stable / No Significant Change';
    let notes = '';

    if (beforeHasStress && !afterHasStress) {
      conclusion = 'Visual Improvement';
      notes = `Foliage has recovered turgor and healthy lamina posture compared to ${diffDays} days ago. Canopy expansion shows +${canopyDiff}% growth.`;
    } else if (!beforeHasStress && afterHasStress) {
      conclusion = 'Visual Deterioration';
      notes = `New symptoms detected: ${afterObs.detection.detectedStresses.map((s) => s.label).join(', ')}. Inspect root zone immediately.`;
    } else if (canopyDiff > 5) {
      conclusion = 'Visual Improvement';
      notes = `Vegetative canopy has expanded by +${canopyDiff}% over the ${diffDays}-day interval.`;
    } else {
      conclusion = 'Stable / No Significant Change';
      notes = `Crop posture and vegetative density remain consistent with prior inspection from ${diffDays} days ago.`;
    }

    return {
      id: `comp-${Date.now()}`,
      cropName: afterObs.cropName,
      zoneId: afterObs.zoneId,
      zoneName: afterObs.zoneName,
      beforeObservation: beforeObs,
      afterObservation: afterObs,
      daysApart: diffDays,
      comparisonConclusion: conclusion,
      visualNotes: notes,
      canopyChangePercent: canopyDiff,
      disclaimer:
        'Visual comparison is observational only and assesses optical canopy changes without replacing comprehensive laboratory or destructive tissue assays.',
    };
  }
}

export const fieldObservationService = new FieldObservationService();
