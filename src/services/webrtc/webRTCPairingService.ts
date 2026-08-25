import { MobileBridgeSession, PairingSessionState, WebRTCConnectionStats } from '../../types/cameraTypes';

const STUN_SERVERS: RTCConfiguration = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
};

export interface NetworkInfo {
  lanIps: string[];
  primaryLanIp: string;
  port: number;
  hostHeader: string;
  protocol: string;
  currentOrigin: string;
}

export class WebRTCPairingService {
  /**
   * Fetch local network and reachable IP addresses from the backend
   */
  public async getNetworkInfo(): Promise<NetworkInfo> {
    try {
      const res = await fetch('/api/camera/network-info');
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Could not fetch server network info:', e);
    }
    const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    return {
      lanIps: [],
      primaryLanIp: typeof window !== 'undefined' ? window.location.hostname : 'localhost',
      port: 3000,
      hostHeader: typeof window !== 'undefined' ? window.location.host : 'localhost:3000',
      protocol: typeof window !== 'undefined' ? window.location.protocol.replace(':', '') : 'http',
      currentOrigin: origin,
    };
  }

  /**
   * Create a new temporary cryptographic pairing session on the server
   */
  public async createSession(overrideHost?: string): Promise<MobileBridgeSession> {
    try {
      const res = await fetch('/api/camera/session/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        throw new Error('Failed to create pairing session on server.');
      }

      const data = await res.json();
      const session: MobileBridgeSession = data.session;

      // If user provided a specific LAN IP (e.g. 192.168.1.50) while testing from localhost
      if (overrideHost && overrideHost.trim().length > 0) {
        const protocol = typeof window !== 'undefined' ? window.location.protocol : 'http:';
        session.qrCodeUrl = `${protocol}//${overrideHost.trim()}/camera/pair/${session.sessionId}?token=${session.token}`;
      } else if (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        // If already on a publicly reachable or preview hostname
        session.qrCodeUrl = `${window.location.origin}/camera/pair/${session.sessionId}?token=${session.token}`;
      }

      return session;
    } catch (err: any) {
      // Fallback local session generation
      const sessionId = `cx-${Math.random().toString(36).substring(2, 9)}`;
      const token = Math.random().toString(36).substring(2, 18);
      const pin = Math.floor(100000 + Math.random() * 900000).toString();
      const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
      return {
        sessionId,
        token,
        pin,
        connectionPin: pin,
        qrCodeUrl: `${origin}/camera/pair/${sessionId}?token=${token}`,
        state: 'CREATED',
        createdAt: Date.now(),
        expiresAt: Date.now() + 5 * 60 * 1000,
        signalStrength: 'disconnected',
      };
    }
  }

  /**
   * Fetch active session status
   */
  public async getSessionStatus(sessionId: string, token?: string): Promise<Partial<MobileBridgeSession>> {
    try {
      const tokenParam = token ? `?token=${encodeURIComponent(token)}` : '';
      const res = await fetch(`/api/camera/session/${sessionId}${tokenParam}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn(`Failed to fetch session status for ${sessionId}:`, e);
    }
    return {};
  }

  /**
   * Update session state on server
   */
  public async updateSessionState(
    sessionId: string,
    state: PairingSessionState,
    extra?: { deviceModel?: string; phoneIp?: string; error?: string; isTorchOn?: boolean; batteryLevel?: number }
  ): Promise<void> {
    try {
      await fetch(`/api/camera/session/${sessionId}/state`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ state, ...extra }),
      });
    } catch (e) {
      console.warn('Failed to update session state:', e);
    }
  }

  /**
   * Submit SDP Offer (from phone broadcaster)
   */
  public async sendOffer(sessionId: string, sdp: string, deviceModel?: string): Promise<void> {
    await fetch(`/api/camera/session/${sessionId}/offer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sdp, sender: 'phone', deviceModel }),
    });
  }

  /**
   * Get SDP Offer (for laptop receiver)
   */
  public async getOffer(sessionId: string): Promise<{ hasOffer: boolean; sdp: string | null; deviceModel?: string }> {
    try {
      const res = await fetch(`/api/camera/session/${sessionId}/offer`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Failed to poll SDP offer:', e);
    }
    return { hasOffer: false, sdp: null };
  }

  /**
   * Submit SDP Answer (from laptop receiver)
   */
  public async sendAnswer(sessionId: string, sdp: string): Promise<void> {
    await fetch(`/api/camera/session/${sessionId}/answer`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sdp, sender: 'laptop' }),
    });
  }

  /**
   * Get SDP Answer (for phone broadcaster)
   */
  public async getAnswer(sessionId: string): Promise<{ hasAnswer: boolean; sdp: string | null }> {
    try {
      const res = await fetch(`/api/camera/session/${sessionId}/answer`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Failed to poll SDP answer:', e);
    }
    return { hasAnswer: false, sdp: null };
  }

  /**
   * Post ICE Candidate
   */
  public async sendIceCandidate(sessionId: string, candidate: RTCIceCandidateInit, sender: 'phone' | 'laptop'): Promise<void> {
    try {
      await fetch(`/api/camera/session/${sessionId}/ice`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidate, sender }),
      });
    } catch (e) {
      console.warn('Failed to send ICE candidate:', e);
    }
  }

  /**
   * Get ICE Candidates for this peer
   */
  public async getIceCandidates(sessionId: string, peer: 'phone' | 'laptop', sinceTimestamp = 0): Promise<{ candidates: RTCIceCandidateInit[]; latestTimestamp: number }> {
    try {
      const res = await fetch(`/api/camera/session/${sessionId}/ice?peer=${peer}&since=${sinceTimestamp}`);
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Failed to fetch ICE candidates:', e);
    }
    return { candidates: [], latestTimestamp: sinceTimestamp };
  }

  /**
   * Notify server of real verified frame receipt on laptop with metrics
   */
  public async notifyFrameReceipt(
    sessionId: string,
    metrics?: { frameCount?: number; width?: number; height?: number; fps?: number; latencyMs?: number }
  ): Promise<void> {
    try {
      await fetch(`/api/camera/session/${sessionId}/frame-receipt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metrics || {}),
      });
    } catch {
      // ignore transient error
    }
  }

  /**
   * Report battery percentage from mobile browser
   */
  public async sendBatteryLevel(sessionId: string, level: number): Promise<void> {
    try {
      await fetch(`/api/camera/session/${sessionId}/battery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level }),
      });
    } catch {
      // ignore transient error
    }
  }

  /**
   * Send heartbeat
   */
  public async sendHeartbeat(sessionId: string, peer: 'phone' | 'laptop'): Promise<void> {
    try {
      await fetch(`/api/camera/session/${sessionId}/heartbeat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ peer }),
      });
    } catch {
      // ignore transient error
    }
  }

  /**
   * Terminate/Cancel session
   */
  public async cancelSession(sessionId: string): Promise<void> {
    try {
      await fetch(`/api/camera/session/${sessionId}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
    } catch {
      // ignore
    }
  }
}

export const webRTCPairingService = new WebRTCPairingService();
export { STUN_SERVERS };
