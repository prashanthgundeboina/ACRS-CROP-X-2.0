import { DeviceHandshakeResponse, SensorType } from '../../types/iot/iotTypes';
import { SENSOR_DEFINITIONS } from './telemetryValidator';

export const CROPERX_HELLO_CMD = "CROPERX_HELLO\n";
export const CROPERX_HELLO_JSON = JSON.stringify({ command: "CROPERX_HELLO", client: "CroperX-Web", version: "2.0" }) + "\n";

export interface HandshakeValidationResult {
  isValid: boolean;
  handshake: DeviceHandshakeResponse | null;
  error?: string;
}

/**
 * Validates a parsed JSON payload or string response from a connected USB device during handshake.
 */
export function validateHandshakeResponse(rawResponse: unknown): HandshakeValidationResult {
  if (!rawResponse || typeof rawResponse !== 'object') {
    return { isValid: false, handshake: null, error: 'Malformed handshake response: not an object' };
  }

  const obj = rawResponse as Record<string, any>;

  // Check required device fields
  const deviceType = typeof obj.device_type === 'string' ? obj.device_type.trim() : (typeof obj.deviceType === 'string' ? obj.deviceType : 'ESP32');
  const deviceId = typeof obj.device_id === 'string' ? obj.device_id.trim() : (typeof obj.deviceId === 'string' ? obj.deviceId : '');
  const firmware = typeof obj.firmware === 'string' ? obj.firmware.trim() : (typeof obj.version === 'string' ? obj.version : '1.0.0');
  const protocolVersion = String(obj.protocol_version || obj.protocolVersion || '1').trim();

  if (!deviceId) {
    return { isValid: false, handshake: null, error: 'Handshake missing required "device_id"' };
  }

  // Validate sensors array
  const rawSensors: any[] = Array.isArray(obj.sensors) ? obj.sensors : ['soil_moisture', 'temperature', 'humidity'];
  const validSensors: SensorType[] = [];

  for (const s of rawSensors) {
    const sStr = String(s).toLowerCase().replace(/-/g, '_').trim() as SensorType;
    // Map common aliases
    let mapped: SensorType | null = null;
    if (sStr in SENSOR_DEFINITIONS) {
      mapped = sStr;
    } else if (sStr === 'moisture' as any) {
      mapped = 'soil_moisture';
    } else if (sStr === 'temp' as any) {
      mapped = 'temperature';
    } else if (sStr === 'hum' as any) {
      mapped = 'humidity';
    }

    if (mapped && !validSensors.includes(mapped)) {
      validSensors.push(mapped);
    }
  }

  if (validSensors.length === 0) {
    return { isValid: false, handshake: null, error: 'Device reported 0 valid recognized agricultural sensors' };
  }

  const handshake: DeviceHandshakeResponse = {
    device_type: deviceType,
    device_id: deviceId,
    firmware,
    protocol_version: protocolVersion,
    sensors: validSensors,
    baud_rate: typeof obj.baud_rate === 'number' ? obj.baud_rate : 115200,
    chip_model: typeof obj.chip_model === 'string' ? obj.chip_model : undefined,
    mac_address: typeof obj.mac_address === 'string' ? obj.mac_address : undefined
  };

  return {
    isValid: true,
    handshake
  };
}
