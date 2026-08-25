import {
  IoTConnectionState,
  SerialPortMetadata,
  ValidatedTelemetry,
  DeviceHandshakeResponse
} from '../../types/iot/iotTypes';
import { parseTelemetryLine } from './telemetryParser';
import { CROPERX_HELLO_CMD, validateHandshakeResponse } from './deviceHandshake';

export type SerialEventCallback = (
  state: IoTConnectionState,
  data?: {
    telemetry?: ValidatedTelemetry;
    handshake?: DeviceHandshakeResponse;
    portMeta?: SerialPortMetadata;
    error?: string;
    rawLog?: { text: string; direction: 'in' | 'out'; isError?: boolean };
  }
) => void;

class SerialConnectionService {
  private port: any | null = null;
  private reader: ReadableStreamDefaultReader<string> | null = null;
  private writer: WritableStreamDefaultWriter<string> | null = null;
  private readableStreamClosed: Promise<void> | null = null;
  private isReading = false;
  private buffer = '';
  private baudRate = 115200;
  private state: IoTConnectionState = 'idle';
  private callback: SerialEventCallback | null = null;
  private handshakeTimer: any = null;
  private handshakeReceived = false;
  private lastHandshake: DeviceHandshakeResponse | null = null;

  constructor() {
    if (typeof window !== 'undefined' && 'serial' in navigator) {
      try {
        (navigator as any).serial.addEventListener('disconnect', (event: any) => {
          if (this.port && event.port === this.port) {
            this.handlePhysicalDisconnect('Physical USB cable removed by user');
          }
        });
      } catch (e) {
        console.warn('Web Serial disconnect listener error:', e);
      }
    }
  }

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'serial' in navigator;
  }

  public setEventCallback(cb: SerialEventCallback) {
    this.callback = cb;
  }

  public getState(): IoTConnectionState {
    return this.state;
  }

  private emit(
    state: IoTConnectionState,
    data?: {
      telemetry?: ValidatedTelemetry;
      handshake?: DeviceHandshakeResponse;
      portMeta?: SerialPortMetadata;
      error?: string;
      rawLog?: { text: string; direction: 'in' | 'out'; isError?: boolean };
    }
  ) {
    this.state = state;
    if (this.callback) {
      this.callback(state, data);
    }
  }

  /**
   * Requests user to choose a USB serial device via browser prompt and connects.
   */
  public async requestAndConnect(baudRate = 115200): Promise<boolean> {
    if (!this.isSupported()) {
      this.emit('connection_error', {
        error: 'Web Serial API is not supported in this browser. Please use Chrome, Edge, or a Chromium-based browser on desktop/laptop.'
      });
      return false;
    }

    try {
      this.emit('detecting');
      // Prompt user to select USB port
      const selectedPort = await (navigator as any).serial.requestPort();
      if (!selectedPort) {
        this.emit('idle');
        return false;
      }

      this.port = selectedPort;
      this.baudRate = baudRate;

      return await this.openPortAndStart(selectedPort);
    } catch (err: any) {
      if (err.name === 'NotFoundError') {
        // User cancelled port picker dialog
        this.emit('idle');
        return false;
      }
      this.emit('connection_error', {
        error: `Failed to select USB Serial port: ${err.message || String(err)}`
      });
      return false;
    }
  }

  private async openPortAndStart(port: any): Promise<boolean> {
    try {
      this.emit('connecting');

      await port.open({
        baudRate: this.baudRate,
        dataBits: 8,
        stopBits: 1,
        parity: 'none',
        flowControl: 'none'
      });

      // Extract port info if provided by browser
      const info = port.getInfo ? port.getInfo() : {};
      const portMeta: SerialPortMetadata = {
        usbVendorId: info.usbVendorId,
        usbProductId: info.usbProductId,
        friendlyName: info.usbVendorId ? `USB Serial Device (0x${info.usbVendorId.toString(16)})` : 'ESP32 / USB Serial',
        baudRate: this.baudRate
      };

      this.emit('handshaking', {
        portMeta,
        rawLog: { text: `[SYSTEM] USB Serial Port opened at ${this.baudRate} baud`, direction: 'in' }
      });

      // Setup TextEncoder / TextDecoder streams
      const textDecoder = new (window as any).TextDecoderStream();
      this.readableStreamClosed = port.readable.pipeTo(textDecoder.writable);
      this.reader = textDecoder.readable.getReader();

      const textEncoder = new (window as any).TextEncoderStream();
      textEncoder.readable.pipeTo(port.writable);
      this.writer = textEncoder.writable.getWriter();

      this.handshakeReceived = false;
      this.isReading = true;

      // Start continuous reader loop in background
      this.startReadingLoop(portMeta);

      // Perform handshake
      await this.sendHandshakeRequest();

      return true;
    } catch (err: any) {
      await this.closePortSilently();
      this.emit('connection_error', {
        error: `Port open failed: ${err.message || 'Access denied or port already in use by another program.'}`
      });
      return false;
    }
  }

  private async sendHandshakeRequest() {
    if (!this.writer) return;

    try {
      this.emit('handshaking', {
        rawLog: { text: `> ${CROPERX_HELLO_CMD.trim()}`, direction: 'out' }
      });

      await this.writer.write(CROPERX_HELLO_CMD);

      // Handshake timeout of 5 seconds
      if (this.handshakeTimer) clearTimeout(this.handshakeTimer);
      this.handshakeTimer = setTimeout(() => {
        if (!this.handshakeReceived && this.state === 'handshaking') {
          // If device outputs raw telemetry without explicit CROPERX_HELLO reply, check if we received valid telemetry
          this.emit('handshaking', {
            rawLog: { text: '[SYSTEM] Handshake timeout: awaiting telemetry or standard JSON packet stream...', direction: 'in' }
          });
        }
      }, 5000);
    } catch (e: any) {
      console.warn('Failed to send handshake command:', e);
    }
  }

  private async startReadingLoop(portMeta: SerialPortMetadata) {
    this.buffer = '';

    try {
      while (this.isReading && this.reader) {
        const { value, done } = await this.reader.read();
        if (done) {
          // Stream ended
          break;
        }

        if (value) {
          this.buffer += value;
          this.processBuffer(portMeta);
        }
      }
    } catch (error: any) {
      if (this.isReading) {
        this.handlePhysicalDisconnect(`Serial stream error: ${error.message || 'Device disconnected'}`);
      }
    } finally {
      if (this.isReading) {
        this.handlePhysicalDisconnect('Serial connection closed');
      }
    }
  }

  private processBuffer(portMeta: SerialPortMetadata) {
    const lines = this.buffer.split(/\r?\n/);
    // Keep last incomplete chunk in buffer
    this.buffer = lines.pop() || '';

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;

      // Check if this line is a handshake response
      if (!this.handshakeReceived && (line.includes('device_id') || line.includes('ESP32') || line.includes('protocol_version'))) {
        try {
          const jsonCandidate = JSON.parse(line);
          const hsResult = validateHandshakeResponse(jsonCandidate);
          if (hsResult.isValid && hsResult.handshake) {
            this.handshakeReceived = true;
            this.lastHandshake = hsResult.handshake;
            if (this.handshakeTimer) clearTimeout(this.handshakeTimer);

            this.emit('connected', {
              handshake: hsResult.handshake,
              portMeta,
              rawLog: { text: line, direction: 'in' }
            });
            continue;
          }
        } catch {
          // Not a JSON handshake, proceed to telemetry parsing
        }
      }

      // Try telemetry parse
      const parseResult = parseTelemetryLine(line, this.lastHandshake?.device_id || 'ESP32-FARM-001');

      if (parseResult.success && parseResult.telemetry) {
        // If we haven't officially completed handshake but are receiving valid telemetry, auto-promote to connected
        if (!this.handshakeReceived) {
          this.handshakeReceived = true;
          const inferredSensors = Object.keys(parseResult.telemetry.readings) as any[];
          this.lastHandshake = {
            device_type: 'ESP32 (Auto-Detected)',
            device_id: parseResult.telemetry.deviceId,
            firmware: '1.0.0',
            protocol_version: '1',
            sensors: inferredSensors,
            baud_rate: this.baudRate
          };
          this.emit('connected', {
            handshake: this.lastHandshake,
            portMeta
          });
        }

        this.emit('receiving_data', {
          telemetry: parseResult.telemetry,
          handshake: this.lastHandshake || undefined,
          portMeta,
          rawLog: { text: line, direction: 'in' }
        });
      } else {
        // Raw line that wasn't valid telemetry
        this.emit(this.state, {
          rawLog: { text: line, direction: 'in', isError: !line.startsWith('#') && !line.startsWith('//') }
        });
      }
    }
  }

  public async sendCommand(cmd: string): Promise<boolean> {
    if (!this.writer) return false;
    try {
      const payload = cmd.endsWith('\n') ? cmd : cmd + '\n';
      this.emit(this.state, {
        rawLog: { text: `> ${payload.trim()}`, direction: 'out' }
      });
      await this.writer.write(payload);
      return true;
    } catch (e: any) {
      this.emit(this.state, {
        rawLog: { text: `Command failed: ${e.message}`, direction: 'out', isError: true }
      });
      return false;
    }
  }

  public async disconnect(): Promise<void> {
    this.isReading = false;
    if (this.handshakeTimer) clearTimeout(this.handshakeTimer);
    await this.closePortSilently();
    this.emit('disconnected', {
      rawLog: { text: '[SYSTEM] USB Serial device disconnected by user', direction: 'in' }
    });
  }

  private handlePhysicalDisconnect(reason: string) {
    this.isReading = false;
    if (this.handshakeTimer) clearTimeout(this.handshakeTimer);
    this.closePortSilently();
    this.emit('disconnected', {
      error: reason,
      rawLog: { text: `[SYSTEM] Disconnected: ${reason}`, direction: 'in', isError: true }
    });
  }

  private async closePortSilently() {
    try {
      if (this.reader) {
        await this.reader.cancel().catch(() => {});
        this.reader.releaseLock();
        this.reader = null;
      }
      if (this.writer) {
        await this.writer.close().catch(() => {});
        this.writer.releaseLock();
        this.writer = null;
      }
      if (this.readableStreamClosed) {
        await this.readableStreamClosed.catch(() => {});
        this.readableStreamClosed = null;
      }
      if (this.port) {
        await this.port.close().catch(() => {});
        this.port = null;
      }
    } catch (e) {
      console.warn('Error during serial port cleanup:', e);
    }
  }
}

export const serialConnectionService = new SerialConnectionService();
