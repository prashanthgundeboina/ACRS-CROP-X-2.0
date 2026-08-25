import {
  IoTDeviceState,
  IoTConnectionState,
  ValidatedTelemetry,
  DeviceHandshakeResponse,
  SerialPortMetadata,
  ConnectionHealthMetrics,
  SensorType,
  SensorValue
} from '../../types/iot/iotTypes';
import { serialConnectionService } from './serialConnectionService';
import { validateSensorReading } from './telemetryValidator';

const CACHE_KEY = 'croperx_iot_last_telemetry';
const STALE_TIMEOUT_MS = 8000; // 8 seconds without packet = stale
const OFFLINE_TIMEOUT_MS = 25000; // 25 seconds without packet = disconnected

type IoTStateListener = (state: IoTDeviceState) => void;

class IoTDeviceService {
  private state: IoTDeviceState;
  private listeners: Set<IoTStateListener> = new Set();
  private staleCheckInterval: any = null;
  private simulatorInterval: any = null;
  private connectionStartTime: number | null = null;
  private lastPacketsCountForPpm = 0;
  private lastPpmCheckTime = Date.now();

  constructor() {
    const cachedTelemetry = this.loadCachedTelemetry();

    this.state = {
      connectionState: 'idle',
      isWebSerialSupported: serialConnectionService.isSupported(),
      handshake: null,
      latestTelemetry: null,
      lastKnownTelemetry: cachedTelemetry,
      healthMetrics: {
        totalPacketsReceived: 0,
        packetsPerMinute: 0,
        lastPacketTimestamp: null,
        corruptedPackets: 0,
        handshakeSuccess: false,
        connectionDurationSeconds: 0,
        reconnectAttempts: 0,
        errorLog: []
      },
      portMetadata: null,
      isSimulatorActive: false,
      errorMessage: null
    };

    // Wire up serial connection service callbacks
    serialConnectionService.setEventCallback((serialState, data) => {
      this.handleSerialEvent(serialState, data);
    });

    // Start background stale-telemetry monitor
    this.startStaleTelemetryMonitor();
  }

  public getState(): IoTDeviceState {
    return { ...this.state };
  }

  public subscribe(listener: IoTStateListener): () => void {
    this.listeners.add(listener);
    // Immediately notify with current state
    listener(this.getState());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const currentState = this.getState();
    this.listeners.forEach((listener) => {
      try {
        listener(currentState);
      } catch (err) {
        console.error('IoT listener callback error:', err);
      }
    });
  }

  private loadCachedTelemetry(): ValidatedTelemetry | null {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem(CACHE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Ignore corrupted cache
    }
    return null;
  }

  private saveCachedTelemetry(telemetry: ValidatedTelemetry) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(telemetry));
    } catch {
      // Storage quota or private mode
    }
  }

  /**
   * Connect to physical ESP32 or Arduino device over USB Serial
   */
  public async connectPhysical(baudRate = 115200): Promise<boolean> {
    if (this.state.isSimulatorActive) {
      this.stopSimulator();
    }

    this.state.connectionState = 'detecting';
    this.state.errorMessage = null;
    this.notify();

    return await serialConnectionService.requestAndConnect(baudRate);
  }

  /**
   * Reconnect sensor
   */
  public async reconnect(): Promise<boolean> {
    this.state.healthMetrics.reconnectAttempts++;
    this.logEvent('Attempting reconnect to USB Serial device...', 'info');

    if (this.state.isSimulatorActive) {
      this.stopSimulator();
      this.startSimulator();
      return true;
    }

    return await this.connectPhysical(this.state.portMetadata?.baudRate || 115200);
  }

  /**
   * Disconnect sensor
   */
  public async disconnect(): Promise<void> {
    if (this.state.isSimulatorActive) {
      this.stopSimulator();
      this.state.connectionState = 'disconnected';
      this.state.latestTelemetry = null;
      this.connectionStartTime = null;
      this.notify();
      return;
    }

    await serialConnectionService.disconnect();
  }

  /**
   * Developer / Test Sensor Simulator (Clearly marked and toggled explicitly)
   */
  public toggleSimulator(enable?: boolean) {
    const shouldEnable = enable !== undefined ? enable : !this.state.isSimulatorActive;

    if (shouldEnable) {
      if (this.state.connectionState === 'connected' || this.state.connectionState === 'receiving_data') {
        serialConnectionService.disconnect();
      }
      this.startSimulator();
    } else {
      this.stopSimulator();
    }
  }

  private startSimulator() {
    this.state.isSimulatorActive = true;
    this.state.connectionState = 'connected';
    this.state.errorMessage = null;
    this.connectionStartTime = Date.now();

    const mockHandshake: DeviceHandshakeResponse = {
      device_type: 'ESP32-WROOM-32 (Developer Simulator)',
      device_id: 'ESP32-DEV-SIM-01',
      firmware: '1.2.0-SIM',
      protocol_version: '1',
      sensors: ['soil_moisture', 'temperature', 'humidity', 'ph', 'ec', 'nitrogen', 'phosphorus', 'potassium'],
      baud_rate: 115200,
      chip_model: 'ESP32-D0WD-V3'
    };

    this.state.handshake = mockHandshake;
    this.state.portMetadata = {
      friendlyName: 'Virtual USB-UART CP2102 (Simulator)',
      baudRate: 115200
    };
    this.state.healthMetrics.handshakeSuccess = true;

    this.logEvent('Developer Sensor Simulator activated for testing.', 'info');
    this.notify();

    // Generate telemetry packet every 2.5 seconds
    let baseMoisture = 32.4;
    let baseTemp = 28.6;
    let baseHumidity = 68.2;
    let basePh = 6.45;
    let baseEc = 1.35;
    let baseN = 142;
    let baseP = 38;
    let baseK = 195;

    if (this.simulatorInterval) clearInterval(this.simulatorInterval);
    this.simulatorInterval = setInterval(() => {
      // Natural gentle fluctuation
      baseMoisture = Math.min(65, Math.max(12, baseMoisture + (Math.random() - 0.5) * 0.8));
      baseTemp = Math.min(42, Math.max(18, baseTemp + (Math.random() - 0.5) * 0.4));
      baseHumidity = Math.min(95, Math.max(40, baseHumidity + (Math.random() - 0.5) * 1.2));
      basePh = Math.min(8.0, Math.max(5.5, basePh + (Math.random() - 0.5) * 0.04));
      baseEc = Math.min(3.0, Math.max(0.6, baseEc + (Math.random() - 0.5) * 0.05));
      baseN = Math.min(220, Math.max(80, Math.round(baseN + (Math.random() - 0.5) * 3)));
      baseP = Math.min(70, Math.max(15, Math.round(baseP + (Math.random() - 0.5) * 2)));
      baseK = Math.min(280, Math.max(100, Math.round(baseK + (Math.random() - 0.5) * 4)));

      const timestamp = new Date().toISOString();
      const readings: Record<SensorType, SensorValue> = {
        soil_moisture: validateSensorReading('soil_moisture', baseMoisture, timestamp)!,
        temperature: validateSensorReading('temperature', baseTemp, timestamp)!,
        humidity: validateSensorReading('humidity', baseHumidity, timestamp)!,
        ph: validateSensorReading('ph', basePh, timestamp)!,
        ec: validateSensorReading('ec', baseEc, timestamp)!,
        nitrogen: validateSensorReading('nitrogen', baseN, timestamp)!,
        phosphorus: validateSensorReading('phosphorus', baseP, timestamp)!,
        potassium: validateSensorReading('potassium', baseK, timestamp)!
      } as Record<SensorType, SensorValue>;

      const simulatedTelemetry: ValidatedTelemetry = {
        deviceId: 'ESP32-DEV-SIM-01',
        timestamp,
        readings,
        activeSensorsCount: 8,
        rawJson: JSON.stringify({ device_id: 'ESP32-DEV-SIM-01', timestamp, sensors: readings }),
        isSimulated: true
      };

      this.processIncomingTelemetry(simulatedTelemetry);
    }, 2500);
  }

  private stopSimulator() {
    this.state.isSimulatorActive = false;
    if (this.simulatorInterval) {
      clearInterval(this.simulatorInterval);
      this.simulatorInterval = null;
    }
  }

  private handleSerialEvent(
    serialState: IoTConnectionState,
    data?: {
      telemetry?: ValidatedTelemetry;
      handshake?: DeviceHandshakeResponse;
      portMeta?: SerialPortMetadata;
      error?: string;
      rawLog?: { text: string; direction: 'in' | 'out'; isError?: boolean };
    }
  ) {
    if (data?.portMeta) {
      this.state.portMetadata = data.portMeta;
    }

    if (data?.handshake) {
      this.state.handshake = data.handshake;
      this.state.healthMetrics.handshakeSuccess = true;
      this.logEvent(`Device handshake verified: ${data.handshake.device_type} (${data.handshake.device_id}) v${data.handshake.firmware}`, 'info');
    }

    if (data?.error) {
      this.state.errorMessage = data.error;
      this.logEvent(data.error, 'error');
    }

    if (data?.rawLog) {
      this.logEvent(data.rawLog.text, data.rawLog.isError ? 'warn' : 'info');
    }

    if (serialState === 'connected' && !this.connectionStartTime) {
      this.connectionStartTime = Date.now();
    }

    if (data?.telemetry) {
      this.processIncomingTelemetry(data.telemetry);
    } else {
      this.state.connectionState = serialState;
      if (serialState === 'disconnected') {
        this.connectionStartTime = null;
        this.state.latestTelemetry = null;
      }
      this.notify();
    }
  }

  private processIncomingTelemetry(telemetry: ValidatedTelemetry) {
    this.state.connectionState = 'receiving_data';
    this.state.latestTelemetry = telemetry;
    this.state.lastKnownTelemetry = telemetry;
    this.saveCachedTelemetry(telemetry);

    // Update health metrics
    this.state.healthMetrics.totalPacketsReceived++;
    this.state.healthMetrics.lastPacketTimestamp = Date.now();

    // Update Packets Per Minute calculation
    const now = Date.now();
    if (now - this.lastPpmCheckTime >= 5000) {
      const elapsedMinutes = (now - this.lastPpmCheckTime) / 60000;
      const packetsDiff = this.state.healthMetrics.totalPacketsReceived - this.lastPacketsCountForPpm;
      this.state.healthMetrics.packetsPerMinute = Math.round(packetsDiff / elapsedMinutes);
      this.lastPacketsCountForPpm = this.state.healthMetrics.totalPacketsReceived;
      this.lastPpmCheckTime = now;
    }

    if (this.connectionStartTime) {
      this.state.healthMetrics.connectionDurationSeconds = Math.round((now - this.connectionStartTime) / 1000);
    }

    this.notify();
  }

  private startStaleTelemetryMonitor() {
    if (this.staleCheckInterval) clearInterval(this.staleCheckInterval);

    this.staleCheckInterval = setInterval(() => {
      const lastTs = this.state.healthMetrics.lastPacketTimestamp;
      if (!lastTs) return;

      const elapsed = Date.now() - lastTs;

      if (this.state.connectionState === 'receiving_data' || this.state.connectionState === 'connected') {
        if (elapsed > OFFLINE_TIMEOUT_MS) {
          this.state.connectionState = 'disconnected';
          this.state.latestTelemetry = null;
          this.logEvent(`Telemetry timeout (> ${Math.round(OFFLINE_TIMEOUT_MS / 1000)}s): Device offline.`, 'warn');
          this.notify();
        } else if (elapsed > STALE_TIMEOUT_MS) {
          this.state.connectionState = 'stale_telemetry';
          this.notify();
        }
      }
    }, 1500);
  }

  private logEvent(message: string, severity: 'info' | 'warn' | 'error') {
    const entry = {
      timestamp: new Date().toLocaleTimeString(),
      message,
      severity
    };
    this.state.healthMetrics.errorLog = [entry, ...this.state.healthMetrics.errorLog.slice(0, 49)];
  }

  public sendSerialCommand(cmd: string) {
    if (this.state.isSimulatorActive) {
      this.logEvent(`[SIMULATOR CMD] > ${cmd}`, 'info');
      this.notify();
      return;
    }
    serialConnectionService.sendCommand(cmd);
  }
}

export const iotDeviceService = new IoTDeviceService();
