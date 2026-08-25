import { ICameraProvider, CameraConnectionState, CameraDeviceKind, CameraStreamConfig, WebRTCConnectionStats, MobileBridgeSession } from '../../types/cameraTypes';
import { laptopWebRTCReceiver } from '../webrtc/LaptopWebRTCReceiver';
import { webRTCPairingService } from '../webrtc/webRTCPairingService';
import { cameraDeviceService } from '../cameraDeviceService';

export class PhoneWebRTCProvider implements ICameraProvider {
  public id = 'remote-phone-bridge';
  public label = 'Paired Mobile Field Scout';
  public kind: CameraDeviceKind = 'mobile';
  private state: CameraConnectionState = 'DISCONNECTED';
  private activeSession: MobileBridgeSession | null = null;

  constructor() {
    laptopWebRTCReceiver.subscribeState((pState, stats, error) => {
      if (pState === 'STREAMING') {
        this.state = 'STREAMING';
      } else if (pState === 'CONNECTED') {
        this.state = 'CONNECTED';
      } else if (pState === 'WEBRTC_NEGOTIATING' || pState === 'PHONE_READY') {
        this.state = 'CONNECTING';
      } else if (pState === 'WAITING_FOR_CAMERA_PERMISSION') {
        this.state = 'WAITING_FOR_PERMISSION';
      } else if (pState === 'ERROR') {
        this.state = 'ERROR';
      } else if (pState === 'DISCONNECTED' || pState === 'CANCELLED' || pState === 'EXPIRED') {
        this.state = 'DISCONNECTED';
      }
    });
  }

  public async createSession(overrideHost?: string): Promise<MobileBridgeSession> {
    const session = await webRTCPairingService.createSession(overrideHost);
    this.activeSession = session;
    laptopWebRTCReceiver.startListening(session);
    return session;
  }

  public async connect(_config?: Partial<CameraStreamConfig>): Promise<MediaStream> {
    if (!this.activeSession) {
      await this.createSession();
    }
    const stream = laptopWebRTCReceiver.getRemoteStream();
    if (stream) {
      this.state = 'STREAMING';
      return stream;
    }
    this.state = 'CONNECTING';
    throw new Error('Waiting for phone to scan QR code and start camera.');
  }

  public disconnect(): void {
    laptopWebRTCReceiver.stopListening();
    this.activeSession = null;
    this.state = 'DISCONNECTED';
  }

  public captureFrame(videoEl?: HTMLVideoElement): { dataUrl: string; imageData: ImageData; width: number; height: number } | null {
    if (videoEl) {
      return cameraDeviceService.captureFrame(videoEl);
    }
    return null;
  }

  public getStatus(): CameraConnectionState {
    return this.state;
  }

  public getStream(): MediaStream | null {
    return laptopWebRTCReceiver.getRemoteStream();
  }

  public getStats(): WebRTCConnectionStats | null {
    return laptopWebRTCReceiver.getStats();
  }

  public getActiveSession(): MobileBridgeSession | null {
    return this.activeSession;
  }
}

export const phoneWebRTCProvider = new PhoneWebRTCProvider();
