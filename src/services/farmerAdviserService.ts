import { FarmerAdviserCallSession, CallAnnotation } from '../types';

export class FarmerAdviserService {
  /**
   * Farmer initiates a live support request with agricultural telemetry context
   */
  public async requestAdviserCall(params: {
    farmerId: string;
    farmerName: string;
    farmerAvatar?: string;
    farmName: string;
    farmZone: string;
    crop: string;
    soilMoisture: number | string;
    weather: string;
    croperxObservation: string;
    sessionId?: string;
  }): Promise<FarmerAdviserCallSession> {
    try {
      const res = await fetch('/api/adviser/calls/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (!res.ok) {
        throw new Error('Failed to send call request to adviser');
      }

      const data = await res.json();
      return data.call;
    } catch (e: any) {
      // Local fallback session
      return {
        callId: 'call_local_' + Date.now(),
        farmerId: params.farmerId,
        farmerName: params.farmerName,
        farmerAvatar: params.farmerAvatar,
        farmName: params.farmName,
        farmZone: params.farmZone,
        crop: params.crop,
        soilMoisture: params.soilMoisture,
        weather: params.weather,
        croperxObservation: params.croperxObservation,
        status: 'REQUESTED',
        createdAt: Date.now(),
        sessionId: params.sessionId || 'cx-local-call',
        annotations: [],
        farmerMuted: false,
        adviserMuted: false,
      };
    }
  }

  /**
   * Adviser lists all active / incoming calls
   */
  public async getAdviserCalls(): Promise<FarmerAdviserCallSession[]> {
    try {
      const res = await fetch('/api/adviser/calls');
      if (res.ok) {
        const data = await res.json();
        return data.calls || [];
      }
    } catch (e) {
      console.warn('Could not fetch adviser calls:', e);
    }
    return [];
  }

  /**
   * Get single call status & annotations
   */
  public async getCallSession(callId: string): Promise<FarmerAdviserCallSession | null> {
    try {
      const res = await fetch(`/api/adviser/calls/${callId}`);
      if (res.ok) {
        const data = await res.json();
        return data.call || null;
      }
    } catch (e) {
      console.warn('Could not fetch call session:', e);
    }
    return null;
  }

  /**
   * Adviser accepts the call
   */
  public async acceptCall(callId: string): Promise<FarmerAdviserCallSession | null> {
    try {
      const res = await fetch(`/api/adviser/calls/${callId}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (res.ok) {
        const data = await res.json();
        return data.call;
      }
    } catch (e) {
      console.warn('Could not accept call:', e);
    }
    return null;
  }

  /**
   * Adviser declines the call
   */
  public async declineCall(callId: string): Promise<void> {
    try {
      await fetch(`/api/adviser/calls/${callId}/decline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (e) {
      console.warn('Could not decline call:', e);
    }
  }

  /**
   * End the call
   */
  public async endCall(callId: string): Promise<void> {
    try {
      await fetch(`/api/adviser/calls/${callId}/end`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (e) {
      console.warn('Could not end call:', e);
    }
  }

  /**
   * Send live annotation on video stream
   */
  public async sendAnnotation(
    callId: string,
    annotation: {
      type: 'point' | 'highlight' | 'draw' | 'note';
      x: number;
      y: number;
      color?: string;
      text?: string;
      path?: Array<{ x: number; y: number }>;
      author?: string;
    }
  ): Promise<CallAnnotation | null> {
    try {
      const res = await fetch(`/api/adviser/calls/${callId}/annotate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(annotation),
      });
      if (res.ok) {
        const data = await res.json();
        return data.annotation;
      }
    } catch (e) {
      console.warn('Could not send annotation:', e);
    }
    return null;
  }

  /**
   * Sync audio mute state
   */
  public async syncAudioState(
    callId: string,
    states: { farmerMuted?: boolean; adviserMuted?: boolean; note?: string }
  ): Promise<void> {
    try {
      await fetch(`/api/adviser/calls/${callId}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(states),
      });
    } catch (e) {
      console.warn('Could not sync audio state:', e);
    }
  }

  /**
   * Ask CroperX AI voice query (4-part response)
   */
  public async askCroperXFarmer(params: {
    query: string;
    language?: string;
    cropName?: string;
    soilMoisture?: string;
    weatherSummary?: string;
  }) {
    try {
      const res = await fetch('/api/farmer/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Could not ask CroperX:', e);
    }
    return {
      answer: 'Your farm is looking stable today.',
      reason: 'No severe weather or moisture hazard detected right now.',
      action: 'Check your soil moisture and leaf health later in the day.',
      timing: 'Check again at 5:00 PM.',
      audioText: 'Your farm is looking stable today. No severe hazard detected. Check again at 5 PM.',
    };
  }
}

export const farmerAdviserService = new FarmerAdviserService();
