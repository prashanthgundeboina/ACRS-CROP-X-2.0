import { CropVisionObservation } from './visionTypes';

export interface FieldWalkSession {
  id: string;
  startedAt: string;
  endedAt?: string;
  zoneId: string;
  zoneName: string;
  cropName: string;
  totalPlantsScanned: number;
  healthyCount: number;
  stressCount: number;
  pestDiseaseCount: number;
  observations: CropVisionObservation[];
  summaryNote: string;
  status: 'in_progress' | 'completed';
}

export interface BeforeAfterComparison {
  id: string;
  cropName: string;
  zoneId: string;
  zoneName: string;
  beforeObservation: CropVisionObservation;
  afterObservation: CropVisionObservation;
  daysApart: number;
  comparisonConclusion: 'Visual Improvement' | 'Visual Deterioration' | 'Stable / No Significant Change';
  visualNotes: string;
  canopyChangePercent: number; // e.g. +12%
  disclaimer: string;
}
