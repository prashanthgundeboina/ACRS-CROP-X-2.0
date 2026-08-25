/**
 * Types and interfaces for CroperX 2.0 - Physical IoT Sensor Hub
 * Supports ESP32 & Arduino-compatible USB Serial devices
 */

export type IoTConnectionState =
  | 'idle'
  | 'detecting'
  | 'connecting'
  | 'handshaking'
  | 'connected'
  | 'receiving_data'
  | 'stale_telemetry'
  | 'disconnected'
  | 'connection_error'
  | 'sensor_error';

export type SensorType =
  | 'soil_moisture'
  | 'temperature'
  | 'humidity'
  | 'ph'
  | 'ec'
  | 'nitrogen'
  | 'phosphorus'
  | 'potassium'
  | 'light'
  | 'rain'
  | 'leaf_wetness'
  | 'wind_speed';

export type SensorHealthStatus = 'optimal' | 'warning' | 'critical' | 'calibrating' | 'offline' | 'unknown';

export interface SensorValue {
  type: SensorType;
  name: string;
  value: number;
  unit: string;
  status: SensorHealthStatus;
  statusLabel: string;
  minValid: number;
  maxValid: number;
  optimalMin: number;
  optimalMax: number;
  lastUpdated: string; // ISO string
  iconName: string;
  precision?: number;
}

export interface DeviceHandshakeResponse {
  device_type: string; // e.g. "ESP32", "Arduino Uno", "NodeMCU"
  device_id: string; // e.g. "ESP32-FARM-001"
  firmware: string; // e.g. "1.0.0"
  protocol_version: string; // e.g. "1"
  sensors: SensorType[];
  baud_rate?: number;
  chip_model?: string;
  mac_address?: string;
}

export interface RawTelemetryPacket {
  device_id?: string;
  timestamp?: string;
  sensors?: {
    [key in SensorType]?: {
      value: number;
      unit?: string;
    } | number;
  };
  // Flat format support for simple Arduino sketches
  soil_moisture?: number;
  moisture?: number;
  temperature?: number;
  temp?: number;
  humidity?: number;
  hum?: number;
  ph?: number;
  ec?: number;
  nitrogen?: number;
  n?: number;
  phosphorus?: number;
  p?: number;
  potassium?: number;
  k?: number;
}

export interface ValidatedTelemetry {
  deviceId: string;
  timestamp: string;
  readings: Record<SensorType, SensorValue>;
  activeSensorsCount: number;
  rawJson?: string;
  isSimulated?: boolean;
}

export interface SerialPortMetadata {
  usbVendorId?: number;
  usbProductId?: number;
  friendlyName?: string;
  portName?: string;
  baudRate: number;
}

export interface ConnectionHealthMetrics {
  totalPacketsReceived: number;
  packetsPerMinute: number;
  lastPacketTimestamp: number | null;
  corruptedPackets: number;
  handshakeSuccess: boolean;
  connectionDurationSeconds: number;
  reconnectAttempts: number;
  errorLog: { timestamp: string; message: string; severity: 'info' | 'warn' | 'error' }[];
}

export interface IoTDeviceState {
  connectionState: IoTConnectionState;
  isWebSerialSupported: boolean;
  handshake: DeviceHandshakeResponse | null;
  latestTelemetry: ValidatedTelemetry | null;
  lastKnownTelemetry: ValidatedTelemetry | null;
  healthMetrics: ConnectionHealthMetrics;
  portMetadata: SerialPortMetadata | null;
  isSimulatorActive: boolean;
  errorMessage: string | null;
}
