import { 
  IrrigationVerificationEvent, 
  IrrigationVerificationStatus 
} from '../../types/resources/farmResourceTypes';

const STORAGE_VERIFICATION_KEY = 'croperx_irrigation_verifications_v1';

const DEFAULT_VERIFICATION_EVENTS: IrrigationVerificationEvent[] = [
  {
    id: 'verif_001',
    zoneId: 'z1',
    zoneName: 'North Field A',
    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    startTime: '06:15 AM',
    durationMinutes: 45,
    estimatedWaterLiters: 15750,
    preMoisturePercent: 24,
    postMoisturePercent: 46,
    moistureDeltaPercent: 22,
    status: 'Effective',
    responseHeadline: '✅ Robust Root-Zone Moisture Recovery (+22%)',
    recommendation: 'Soil reached target field capacity. Next irrigation cycle not needed for 48 hours.',
    telemetryEvidence: 'Moisture rose from 24% to 46% within 60 minutes of drip run.'
  },
  {
    id: 'verif_002',
    zoneId: 'z2',
    zoneName: 'South Greenhouse B',
    date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
    startTime: '07:00 AM',
    durationMinutes: 30,
    estimatedWaterLiters: 8400,
    preMoisturePercent: 32,
    postMoisturePercent: 39,
    moistureDeltaPercent: 7,
    status: 'Partially effective',
    responseHeadline: '🟡 Moderate Infiltration (+7%)',
    recommendation: 'Topsoil absorbed moisture, but deeper sub-probe response was sluggish.',
    telemetryEvidence: 'Sandy loam drain rate was faster than lateral spread.'
  },
  {
    id: 'verif_003',
    zoneId: 'z3',
    zoneName: 'East Terraces C',
    date: new Date(Date.now() - 4 * 86400000).toISOString().split('T')[0],
    startTime: '05:45 PM',
    durationMinutes: 35,
    estimatedWaterLiters: 11200,
    preMoisturePercent: 21,
    postMoisturePercent: 23,
    moistureDeltaPercent: 2,
    status: 'No significant response',
    responseHeadline: '⚠️ Low Infiltration / Possible Sensor or Valve Issue (+2%)',
    recommendation: 'Check manual valve position, drip lateral filters, or ensure probe contact with soil.',
    telemetryEvidence: '35 min pump cycle produced only 2% sensor change at root depth.'
  }
];

export class IrrigationVerificationService {
  private getStoredEvents(): IrrigationVerificationEvent[] {
    try {
      const stored = localStorage.getItem(STORAGE_VERIFICATION_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to load irrigation verification events:', e);
    }
    return DEFAULT_VERIFICATION_EVENTS;
  }

  public getEvents(): IrrigationVerificationEvent[] {
    return this.getStoredEvents();
  }

  public verifyIrrigationSession(params: {
    zoneId: string;
    zoneName: string;
    durationMinutes: number;
    estimatedWaterLiters: number;
    preMoisturePercent: number;
    postMoisturePercent: number;
  }): IrrigationVerificationEvent {
    const delta = params.postMoisturePercent - params.preMoisturePercent;
    let status: IrrigationVerificationStatus = 'Effective';
    let responseHeadline = '✅ Robust Root-Zone Moisture Recovery';
    let recommendation = 'Target moisture level achieved. Emitter line verified.';
    let telemetryEvidence = `Moisture increased by +${delta}% (from ${params.preMoisturePercent}% to ${params.postMoisturePercent}%).`;

    if (delta >= 12) {
      status = 'Effective';
      responseHeadline = `✅ Highly Effective Drip Cycle (+${delta}%)`;
      recommendation = 'Soil reached optimal field capacity. Skip next scheduled cycle if rain occurs.';
    } else if (delta >= 5 && delta < 12) {
      status = 'Partially effective';
      responseHeadline = `🟡 Partial Moisture Absorption (+${delta}%)`;
      recommendation = 'Moisture penetrated topsoil. Consider pulsing irrigation in two shorter sessions to avoid runoff.';
    } else if (delta >= 0 && delta < 5) {
      status = 'No significant response';
      responseHeadline = `⚠️ Low Sensor Response (+${delta}%)`;
      recommendation = 'Recommend physical inspection: check for clogged drip drippers, line leaks, or loose sensor probe contact.';
    } else {
      status = 'Insufficient data';
      responseHeadline = '❓ Sensor Reading Anomaly';
      recommendation = 'Verify probe calibration and battery voltage.';
    }

    const event: IrrigationVerificationEvent = {
      id: `verif_${Date.now()}`,
      zoneId: params.zoneId,
      zoneName: params.zoneName,
      date: new Date().toISOString().split('T')[0],
      startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      durationMinutes: params.durationMinutes,
      estimatedWaterLiters: params.estimatedWaterLiters,
      preMoisturePercent: params.preMoisturePercent,
      postMoisturePercent: params.postMoisturePercent,
      moistureDeltaPercent: delta,
      status,
      responseHeadline,
      recommendation,
      telemetryEvidence
    };

    const events = [event, ...this.getStoredEvents()];
    try {
      localStorage.setItem(STORAGE_VERIFICATION_KEY, JSON.stringify(events));
    } catch (e) {
      console.warn('Failed to save irrigation verification:', e);
    }
    return event;
  }
}

export const irrigationVerificationService = new IrrigationVerificationService();
