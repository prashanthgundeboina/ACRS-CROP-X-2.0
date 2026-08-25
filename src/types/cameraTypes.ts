export type CameraConnectionState = 
  | 'DISCONNECTED'
  | 'DISCOVERING'
  | 'DEVICE_AVAILABLE'
  | 'WAITING_FOR_PERMISSION'
  | 'CONNECTING'
  | 'CONNECTED'
  | 'STREAMING'
  | 'ANALYZING'
  | 'ERROR';

export type CameraDeviceKind = 'mobile' | 'usb' | 'integrated' | 'thermal' | 'simulated';

export type PairingSessionState =
  | 'CREATED'
  | 'QR_GENERATED'
  | 'QR_DISPLAYED'
  | 'PHONE_SCANNED'
  | 'PHONE_OPENED'
  | 'MOBILE_OPENED'
  | 'MOBILE_AUTHENTICATED'
  | 'WAITING_FOR_CAMERA_PERMISSION'
  | 'CAMERA_PERMISSION_REQUESTED'
  | 'CAMERA_GRANTED'
  | 'PHONE_READY'
  | 'SIGNALING_CONNECTED'
  | 'OFFER_CREATED'
  | 'ANSWER_RECEIVED'
  | 'ICE_CONNECTED'
  | 'PEER_CONNECTED'
  | 'MEDIA_TRACK_RECEIVED'
  | 'VIDEO_FRAME_RECEIVED'
  | 'STREAM_VERIFIED'
  | 'WEBRTC_NEGOTIATING'
  | 'CONNECTED'
  | 'STREAMING'
  | 'COMPLETED'
  | 'DISCONNECTED'
  | 'EXPIRED'
  | 'CANCELLED'
  | 'FAILED'
  | 'ERROR';

export interface CameraDevice {
  id: string;
  label: string;
  kind: CameraDeviceKind;
  facingMode?: 'user' | 'environment';
  isConnected: boolean;
  resolution?: { width: number; height: number };
  fps?: number;
  lastActive?: string;
  ipAddress?: string;
  batteryLevel?: number;
  latencyMs?: number;
  stats?: WebRTCConnectionStats;
  isSimulated?: boolean;
}

export interface WebRTCConnectionStats {
  roundTripTimeMs?: number;
  jitterMs?: number;
  framesDecodedPerSec?: number;
  bytesReceived?: number;
  bitrateKbps?: number;
  packetsLost?: number;
  codec?: string;
  resolution?: { width: number; height: number };
}

export interface DistanceQuality {
  isValid: boolean;
  brightnessScore: number; // 0-100 (ideal 40-75)
  blurScore: number;       // 0-100 (higher is sharper)
  contrastScore: number;   // 0-100
  distanceStatus: 'optimal' | 'too_far' | 'too_close' | 'camera_blocked';
  issues: string[];
  farmerGuidance: string[];
}

export interface ImageQualityReport {
  isValid: boolean;
  brightnessScore: number; // 0-100 (ideal 40-75)
  blurScore: number;       // 0-100 (higher is sharper)
  contrastScore: number;   // 0-100
  distanceStatus: 'optimal' | 'too_far' | 'too_close' | 'camera_blocked';
  issues: string[];
  farmerGuidance: string[];
}

export interface TemperatureTelemetry {
  ambientTempC: number;        // From Open-Meteo weather API
  iotSensorTempC?: number;     // From ESP32 / Arduino hardware probe
  thermalCameraTempC?: number; // ONLY from infrared thermal sensor
  isThermalCameraConnected: boolean;
  sourceLabels: {
    ambient: string;
    sensor: string;
    thermal: string;
  };
  truthfulnessNote: string;
}

export interface CameraStreamConfig {
  deviceId?: string;
  facingMode: 'environment' | 'user';
  idealWidth: number;
  idealHeight: number;
  frameRate: number;
}

export interface MobileBridgeSession {
  sessionId: string;
  token: string;
  qrCodeUrl: string;
  connectionPin: string;
  pin?: string;
  state: PairingSessionState;
  createdAt: number;
  expiresAt: number;
  deviceModel?: string;
  phoneIp?: string;
  laptopHost?: string;
  laptopLanIp?: string;
  connectedAt?: string;
  signalStrength: 'excellent' | 'good' | 'fair' | 'disconnected';
  verifiedFrameCount?: number;
  error?: string;
}

export interface WebRTCSignalMessage {
  sessionId: string;
  type: 'offer' | 'answer' | 'ice-candidate' | 'status' | 'heartbeat' | 'frame-ack';
  sender: 'laptop' | 'phone';
  sdp?: string;
  candidate?: RTCIceCandidateInit;
  state?: PairingSessionState;
  deviceModel?: string;
  timestamp: number;
}

export interface ICameraProvider {
  id: string;
  label: string;
  kind: CameraDeviceKind;
  connect(config?: Partial<CameraStreamConfig>): Promise<MediaStream>;
  disconnect(): void;
  captureFrame(videoEl?: HTMLVideoElement): { dataUrl: string; imageData: ImageData; width: number; height: number } | null;
  getStatus(): CameraConnectionState;
  getStream(): MediaStream | null;
  getStats?(): WebRTCConnectionStats | null;
}

