import { PairingSessionState } from '../../types/cameraTypes';
import { webRTCPairingService, STUN_SERVERS } from './webRTCPairingService';

export type BroadcasterStateListener = (state: PairingSessionState, error?: string) => void;

export class PhoneWebRTCBroadcaster {
  private peerConnection: RTCPeerConnection | null = null;
  private localStream: MediaStream | null = null;
  private sessionId: string | null = null;
  private token: string | null = null;
  private pollingTimer: any = null;
  private heartbeatTimer: any = null;
  private batteryTimer: any = null;
  private iceCandidateSince = 0;
  private stateListeners: Set<BroadcasterStateListener> = new Set();
  private currentState: PairingSessionState = 'MOBILE_OPENED';
  private facingMode: 'environment' | 'user' = 'environment';
  private isTorchOn = false;

  public subscribeState(listener: BroadcasterStateListener): () => void {
    this.stateListeners.add(listener);
    listener(this.currentState);
    return () => this.stateListeners.delete(listener);
  }

  private notifyState(state: PairingSessionState, error?: string) {
    this.currentState = state;
    this.stateListeners.forEach((fn) => fn(state, error));
    if (this.sessionId) {
      webRTCPairingService.updateSessionState(this.sessionId, state, {
        error,
        isTorchOn: this.isTorchOn
      });
    }
  }

  /**
   * Connect to an existing session from the phone browser
   */
  public async initSession(sessionId: string, token?: string): Promise<boolean> {
    this.sessionId = sessionId;
    this.token = token || null;

    try {
      const status = await webRTCPairingService.getSessionStatus(sessionId, token);
      if (status.state === 'EXPIRED') {
        this.notifyState('EXPIRED', 'This pairing QR code has expired. Please generate a new one on your laptop.');
        return false;
      }

      this.notifyState('MOBILE_OPENED');
      await webRTCPairingService.updateSessionState(sessionId, 'MOBILE_AUTHENTICATED', {
        deviceModel: this.detectDeviceModel(),
      });
      this.notifyState('MOBILE_AUTHENTICATED');

      // Start reporting battery level if supported
      this.startBatteryReporting();

      return true;
    } catch (e: any) {
      this.notifyState('FAILED', e.message || 'Could not verify pairing session.');
      return false;
    }
  }

  /**
   * Start camera stream upon explicit user interaction ("Start Camera" button click)
   */
  public async startBroadcasting(facingMode: 'environment' | 'user' = 'environment'): Promise<MediaStream> {
    if (!this.sessionId) {
      throw new Error('Session ID not initialized.');
    }

    this.facingMode = facingMode;
    this.notifyState('CAMERA_PERMISSION_REQUESTED');

    try {
      // 1. Request user camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 },
        },
      });

      this.localStream = stream;
      this.notifyState('CAMERA_GRANTED');

      // 2. Initialize WebRTC Peer Connection
      if (this.peerConnection) {
        try {
          this.peerConnection.close();
        } catch {}
      }

      const pc = new RTCPeerConnection(STUN_SERVERS);
      this.peerConnection = pc;

      // Add tracks
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });

      // Handle local ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate && this.sessionId) {
          webRTCPairingService.sendIceCandidate(this.sessionId, event.candidate.toJSON(), 'phone');
        }
      };

      pc.onconnectionstatechange = () => {
        const cState = pc.connectionState;
        if (cState === 'connected') {
          this.notifyState('STREAM_VERIFIED');
        } else if (cState === 'disconnected' || cState === 'failed') {
          this.notifyState('DISCONNECTED', 'Connection with laptop lost.');
        }
      };

      pc.oniceconnectionstatechange = () => {
        if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
          this.notifyState('ICE_CONNECTED');
        }
      };

      // 3. Create SDP Offer
      this.notifyState('SIGNALING_CONNECTED');
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      this.notifyState('OFFER_CREATED');

      // 4. Send offer to server
      const deviceModel = this.detectDeviceModel();
      await webRTCPairingService.sendOffer(this.sessionId, offer.sdp || '', deviceModel);

      // 5. Start polling for SDP Answer from laptop
      this.startAnswerPolling();

      // 6. Start heartbeat
      this.startHeartbeat();

      return stream;
    } catch (err: any) {
      const msg = err.name === 'NotAllowedError'
        ? 'Camera permission was denied. Allow camera access in your browser settings.'
        : err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError'
        ? 'This browser does not support the required camera features or no camera was found.'
        : err.message || 'Failed to start phone camera.';
      this.notifyState('FAILED', msg);
      throw new Error(msg);
    }
  }

  /**
   * Poll for laptop SDP Answer and ICE candidates
   */
  private startAnswerPolling(): void {
    if (this.pollingTimer) clearInterval(this.pollingTimer);

    let answerReceived = false;

    this.pollingTimer = setInterval(async () => {
      if (!this.sessionId || !this.peerConnection) return;

      try {
        // Poll for answer if not set
        if (!answerReceived) {
          const answerData = await webRTCPairingService.getAnswer(this.sessionId);
          if (answerData.hasAnswer && answerData.sdp) {
            answerReceived = true;
            await this.peerConnection.setRemoteDescription(
              new RTCSessionDescription({ type: 'answer', sdp: answerData.sdp })
            );
            this.notifyState('ANSWER_RECEIVED');
          }
        }

        // Poll for laptop ICE candidates
        const ice = await webRTCPairingService.getIceCandidates(this.sessionId, 'phone', this.iceCandidateSince);
        if (ice.candidates && ice.candidates.length > 0) {
          for (const cand of ice.candidates) {
            try {
              await this.peerConnection.addIceCandidate(new RTCIceCandidate(cand));
            } catch (e) {
              console.warn('Broadcaster ICE candidate add error:', e);
            }
          }
          this.iceCandidateSince = ice.latestTimestamp;
        }
      } catch (e) {
        console.warn('Broadcaster polling error:', e);
      }
    }, 1000);
  }

  private startHeartbeat(): void {
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    this.heartbeatTimer = setInterval(async () => {
      if (this.sessionId) {
        await webRTCPairingService.sendHeartbeat(this.sessionId, 'phone');
      }
    }, 3000);
  }

  private startBatteryReporting(): void {
    if (this.batteryTimer) clearInterval(this.batteryTimer);

    const reportBattery = async () => {
      if (!this.sessionId) return;
      try {
        if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
          const battery: any = await (navigator as any).getBattery();
          if (battery && typeof battery.level === 'number') {
            const pct = Math.round(battery.level * 100);
            await webRTCPairingService.sendBatteryLevel(this.sessionId, pct);
          }
        }
      } catch {
        // battery API not available or blocked
      }
    };

    reportBattery();
    this.batteryTimer = setInterval(reportBattery, 15000);
  }

  /**
   * Switch between front and back camera
   */
  public async switchCamera(): Promise<MediaStream> {
    const nextMode = this.facingMode === 'environment' ? 'user' : 'environment';
    this.stopCamera();
    return this.startBroadcasting(nextMode);
  }

  /**
   * Toggle Torch / Flashlight if supported
   */
  public async toggleTorch(): Promise<boolean> {
    if (!this.localStream) return false;
    const track = this.localStream.getVideoTracks()[0];
    if (!track) return false;

    try {
      const capabilities: any = track.getCapabilities ? track.getCapabilities() : {};
      if (capabilities.torch) {
        this.isTorchOn = !this.isTorchOn;
        await (track as any).applyConstraints({
          advanced: [{ torch: this.isTorchOn }],
        });
        if (this.sessionId) {
          webRTCPairingService.updateSessionState(this.sessionId, this.currentState, { isTorchOn: this.isTorchOn });
        }
        return this.isTorchOn;
      }
    } catch {
      // torch not supported on this device/browser
    }
    return false;
  }

  private stopCamera(): void {
    if (this.localStream) {
      this.localStream.getTracks().forEach((t) => t.stop());
      this.localStream = null;
    }
  }

  /**
   * Disconnect and release all resources
   */
  public disconnect(): void {
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer);
      this.pollingTimer = null;
    }
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
    if (this.batteryTimer) {
      clearInterval(this.batteryTimer);
      this.batteryTimer = null;
    }
    this.stopCamera();
    if (this.peerConnection) {
      try {
        this.peerConnection.close();
      } catch {}
      this.peerConnection = null;
    }
    if (this.sessionId) {
      webRTCPairingService.updateSessionState(this.sessionId, 'DISCONNECTED');
    }
    this.notifyState('DISCONNECTED');
  }

  public getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  public getFacingMode(): 'environment' | 'user' {
    return this.facingMode;
  }

  private detectDeviceModel(): string {
    if (typeof navigator === 'undefined') return 'Mobile Phone';
    const ua = navigator.userAgent;
    if (/iPhone/i.test(ua)) return 'Apple iPhone (Field Scout)';
    if (/iPad/i.test(ua)) return 'Apple iPad (Field Scout)';
    if (/Samsung/i.test(ua)) return 'Samsung Galaxy (Field Scout)';
    if (/Pixel/i.test(ua)) return 'Google Pixel (Field Scout)';
    if (/Android/i.test(ua)) return 'Android Scout Phone';
    return 'Mobile Field Scout';
  }
}

export const phoneWebRTCBroadcaster = new PhoneWebRTCBroadcaster();

