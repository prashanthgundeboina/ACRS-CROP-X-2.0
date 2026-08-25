import { CameraConnectionState, CameraDevice, MobileBridgeSession, CameraStreamConfig, PairingSessionState } from '../types/cameraTypes';
import { cameraDeviceService } from './cameraDeviceService';
import { phoneWebRTCProvider } from './providers/PhoneWebRTCProvider';
import { laptopWebRTCReceiver } from './webrtc/LaptopWebRTCReceiver';
import { simulatorCameraProvider } from './providers/SimulatorCameraProvider';

type StateListener = (state: CameraConnectionState, error?: string) => void;
type DeviceListener = (devices: CameraDevice[]) => void;
type SessionListener = (session: MobileBridgeSession | null) => void;
type StreamListener = (stream: MediaStream | null) => void;

class CameraConnectionService {
  private currentState: CameraConnectionState = 'DISCONNECTED';
  private errorMessage: string | null = null;
  private stateListeners: Set<StateListener> = new Set();
  private deviceListeners: Set<DeviceListener> = new Set();
  private sessionListeners: Set<SessionListener> = new Set();
  private streamListeners: Set<StreamListener> = new Set();
  private registeredDevices: CameraDevice[] = [];
  private activeBridgeSession: MobileBridgeSession | null = null;
  private activeStream: MediaStream | null = null;
  private currentActiveDeviceId: string = 'phone-cam-local';

  constructor() {
    this.initDefaultDevices();
    this.initReceiverSubscriptions();
  }

  private initDefaultDevices() {
    this.registeredDevices = [
      {
        id: 'phone-cam-local',
        label: 'Integrated / Laptop Camera',
        kind: 'integrated',
        facingMode: 'environment',
        isConnected: false,
        resolution: { width: 1280, height: 720 },
        fps: 30,
        batteryLevel: 92,
      },
      {
        id: 'remote-phone-bridge',
        label: 'Connect Phone via QR (WebRTC Scout)',
        kind: 'mobile',
        facingMode: 'environment',
        isConnected: false,
        resolution: { width: 1920, height: 1080 },
        fps: 30,
        batteryLevel: 88,
      },
      {
        id: 'usb-cam-field',
        label: 'USB Agritech Field Cam',
        kind: 'usb',
        isConnected: false,
        resolution: { width: 1280, height: 720 },
        fps: 30,
      },
      {
        id: 'thermal-ir-flir',
        label: 'MLX90640 / FLIR Thermal IR Bridge',
        kind: 'thermal',
        isConnected: false,
        resolution: { width: 32, height: 24 },
        fps: 8,
      },
      {
        id: 'simulated-camera-device',
        label: 'Agronomic Test Simulator',
        kind: 'simulated',
        isConnected: false,
        resolution: { width: 1280, height: 720 },
        fps: 30,
        isSimulated: true,
      },
    ];
  }

  private initReceiverSubscriptions() {
    laptopWebRTCReceiver.subscribeState((pState, stats, err) => {
      if (this.activeBridgeSession) {
        this.activeBridgeSession.state = pState;
        if (err) this.activeBridgeSession.error = err;
        this.notifySession();
      }

      if (pState === 'STREAMING') {
        this.registeredDevices = this.registeredDevices.map((d) =>
          d.id === 'remote-phone-bridge'
            ? {
                ...d,
                isConnected: true,
                label: this.activeBridgeSession?.deviceModel || 'Paired Mobile Field Scout',
                lastActive: new Date().toISOString(),
                stats,
                latencyMs: stats?.roundTripTimeMs || 24,
                fps: stats?.framesDecodedPerSec || 30,
                ipAddress: this.activeBridgeSession?.phoneIp || 'LAN WiFi Connected',
              }
            : d
        );
        this.notifyDevices();
        this.setState('STREAMING');
      } else if (pState === 'CONNECTED') {
        this.setState('CONNECTED');
      } else if (pState === 'WEBRTC_NEGOTIATING' || pState === 'PHONE_READY') {
        this.setState('CONNECTING');
      } else if (pState === 'WAITING_FOR_CAMERA_PERMISSION') {
        this.setState('WAITING_FOR_PERMISSION');
      } else if (pState === 'ERROR') {
        this.setState('ERROR', err);
      } else if (pState === 'DISCONNECTED' || pState === 'CANCELLED' || pState === 'EXPIRED') {
        if (this.currentActiveDeviceId === 'remote-phone-bridge') {
          this.registeredDevices = this.registeredDevices.map((d) =>
            d.id === 'remote-phone-bridge' ? { ...d, isConnected: false } : d
          );
          this.notifyDevices();
          this.setState('DISCONNECTED');
        }
      }
    });

    laptopWebRTCReceiver.subscribeStream((stream) => {
      if (stream) {
        this.activeStream = stream;
        this.currentActiveDeviceId = 'remote-phone-bridge';
        this.notifyStream(stream);
      }
    });
  }

  public getState(): CameraConnectionState {
    return this.currentState;
  }

  public getErrorMessage(): string | null {
    return this.errorMessage;
  }

  public getDevices(): CameraDevice[] {
    return [...this.registeredDevices];
  }

  public getActiveBridgeSession(): MobileBridgeSession | null {
    return this.activeBridgeSession;
  }

  public getActiveStream(): MediaStream | null {
    return this.activeStream;
  }

  public subscribeState(listener: StateListener): () => void {
    this.stateListeners.add(listener);
    listener(this.currentState, this.errorMessage || undefined);
    return () => this.stateListeners.delete(listener);
  }

  public subscribeDevices(listener: DeviceListener): () => void {
    this.deviceListeners.add(listener);
    listener(this.getDevices());
    return () => this.deviceListeners.delete(listener);
  }

  public subscribeSession(listener: SessionListener): () => void {
    this.sessionListeners.add(listener);
    listener(this.activeBridgeSession);
    return () => this.sessionListeners.delete(listener);
  }

  public subscribeStream(listener: StreamListener): () => void {
    this.streamListeners.add(listener);
    if (this.activeStream) {
      listener(this.activeStream);
    }
    return () => this.streamListeners.delete(listener);
  }

  private setState(newState: CameraConnectionState, error?: string): void {
    this.currentState = newState;
    this.errorMessage = error || null;
    this.stateListeners.forEach((fn) => fn(newState, error));
  }

  private notifyDevices(): void {
    const devs = this.getDevices();
    this.deviceListeners.forEach((fn) => fn(devs));
  }

  private notifySession(): void {
    this.sessionListeners.forEach((fn) => fn(this.activeBridgeSession));
  }

  private notifyStream(stream: MediaStream | null): void {
    this.activeStream = stream;
    this.streamListeners.forEach((fn) => fn(stream));
  }

  /**
   * Request user permission and connect camera stream
   */
  public async connectCamera(config?: { deviceId?: string; facingMode?: 'environment' | 'user' }): Promise<MediaStream> {
    this.setState('WAITING_FOR_PERMISSION');

    try {
      this.setState('CONNECTING');
      const stream = await cameraDeviceService.startStream({
        deviceId: config?.deviceId,
        facingMode: config?.facingMode || 'environment',
        idealWidth: 1280,
        idealHeight: 720,
        frameRate: 30,
      });

      this.activeStream = stream;
      this.currentActiveDeviceId = 'phone-cam-local';

      this.registeredDevices = this.registeredDevices.map((dev) =>
        dev.id === 'phone-cam-local' ? { ...dev, isConnected: true, lastActive: new Date().toISOString() } : dev
      );
      this.notifyDevices();
      this.notifyStream(stream);

      this.setState('STREAMING');
      return stream;
    } catch (err: any) {
      this.setState('ERROR', err.message || 'Camera connection failed.');
      throw err;
    }
  }

  /**
   * Disconnect active camera stream
   */
  public disconnectCamera(): void {
    if (this.currentActiveDeviceId === 'remote-phone-bridge') {
      phoneWebRTCProvider.disconnect();
    } else if (this.currentActiveDeviceId === 'simulated-camera-device') {
      simulatorCameraProvider.disconnect();
    } else {
      cameraDeviceService.stopStream();
    }

    this.activeStream = null;
    this.registeredDevices = this.registeredDevices.map((dev) => ({ ...dev, isConnected: false }));
    this.notifyDevices();
    this.notifyStream(null);
    this.setState('DISCONNECTED');
  }

  /**
   * Create Mobile WebRTC/LAN Bridge session for connecting a smartphone
   */
  public async createMobileBridgeSession(overrideHost?: string): Promise<MobileBridgeSession> {
    const session = await phoneWebRTCProvider.createSession(overrideHost);
    this.activeBridgeSession = session;
    this.notifySession();
    return session;
  }

  /**
   * Connect to simulated camera stream for instant testing
   */
  public async connectSimulator(): Promise<MediaStream> {
    this.setState('CONNECTING');
    const stream = await simulatorCameraProvider.connect();
    this.activeStream = stream;
    this.currentActiveDeviceId = 'simulated-camera-device';

    this.registeredDevices = this.registeredDevices.map((dev) =>
      dev.id === 'simulated-camera-device' ? { ...dev, isConnected: true, lastActive: new Date().toISOString() } : dev
    );
    this.notifyDevices();
    this.notifyStream(stream);
    this.setState('STREAMING');
    return stream;
  }

  /**
   * Simulate smartphone pairing for testing or local WiFi scout bridge
   */
  public simulatePhonePairing(deviceModel = 'Samsung Galaxy S24 Ultra (Field Scout)'): void {
    if (!this.activeBridgeSession) {
      const sessionId = `cx-sim-${Math.random().toString(36).substring(2, 8)}`;
      const token = Math.random().toString(36).substring(2, 16);
      this.activeBridgeSession = {
        sessionId,
        token,
        connectionPin: '482910',
        pin: '482910',
        qrCodeUrl: `http://localhost:3000/camera/pair/${sessionId}?token=${token}`,
        state: 'STREAMING',
        createdAt: Date.now(),
        expiresAt: Date.now() + 300000,
        deviceModel,
        phoneIp: '192.168.1.142 (WiFi)',
        signalStrength: 'excellent',
        verifiedFrameCount: 142,
      };
    } else {
      this.activeBridgeSession.deviceModel = deviceModel;
      this.activeBridgeSession.state = 'STREAMING';
      this.activeBridgeSession.connectedAt = new Date().toISOString();
      this.activeBridgeSession.signalStrength = 'excellent';
      this.activeBridgeSession.verifiedFrameCount = 142;
    }

    this.notifySession();

    // Start synthetic stream so viewport displays instantly
    this.connectSimulator().catch(() => {});

    // Update registered device
    const existing = this.registeredDevices.find((d) => d.id === 'remote-phone-bridge');
    if (existing) {
      existing.isConnected = true;
      existing.label = deviceModel;
      existing.lastActive = new Date().toISOString();
      existing.latencyMs = 18;
      existing.fps = 30;
      existing.ipAddress = '192.168.1.142 (Local WiFi)';
    } else {
      this.registeredDevices.unshift({
        id: 'remote-phone-bridge',
        label: deviceModel,
        kind: 'mobile',
        facingMode: 'environment',
        isConnected: true,
        resolution: { width: 1920, height: 1080 },
        fps: 30,
        batteryLevel: 94,
        latencyMs: 18,
        ipAddress: '192.168.1.142 (Local WiFi)',
      });
    }

    this.notifyDevices();
    this.setState('STREAMING');
  }

  /**
   * Set analyzing state during AI inference
   */
  public setAnalyzing(isAnalyzing: boolean): void {
    if (isAnalyzing) {
      if (this.currentState === 'STREAMING' || this.currentState === 'CONNECTED') {
        this.setState('ANALYZING');
      }
    } else {
      if (this.currentState === 'ANALYZING') {
        this.setState('STREAMING');
      }
    }
  }
}

export const cameraConnectionService = new CameraConnectionService();
