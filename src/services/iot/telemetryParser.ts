import { ValidatedTelemetry, SensorType, SensorValue } from '../../types/iot/iotTypes';
import { validateSensorReading, SENSOR_DEFINITIONS } from './telemetryValidator';

export interface TelemetryParseResult {
  success: boolean;
  telemetry: ValidatedTelemetry | null;
  error?: string;
  rawLine: string;
}

/**
 * Parses a single raw string line received from the USB serial device.
 */
export function parseTelemetryLine(rawLine: string, fallbackDeviceId = 'ESP32-FARM'): TelemetryParseResult {
  const trimmed = rawLine.trim();
  if (!trimmed) {
    return { success: false, telemetry: null, error: 'Empty line', rawLine };
  }

  // Quick sanity check - must start with { and end with } to be JSON
  if (!trimmed.startsWith('{') || !trimmed.endsWith('}')) {
    return { success: false, telemetry: null, error: 'Non-JSON serial output (e.g. boot log or plain text)', rawLine: trimmed };
  }

  let parsed: any;
  try {
    parsed = JSON.parse(trimmed);
  } catch (e: any) {
    return { success: false, telemetry: null, error: `Invalid JSON syntax: ${e.message || 'parse error'}`, rawLine: trimmed };
  }

  if (typeof parsed !== 'object' || parsed === null) {
    return { success: false, telemetry: null, error: 'JSON payload is not an object', rawLine: trimmed };
  }

  const deviceId = typeof parsed.device_id === 'string' && parsed.device_id.trim()
    ? parsed.device_id.trim()
    : (typeof parsed.deviceId === 'string' ? parsed.deviceId.trim() : fallbackDeviceId);

  const timestamp = typeof parsed.timestamp === 'string' && parsed.timestamp.trim()
    ? parsed.timestamp.trim()
    : new Date().toISOString();

  const validatedReadings: Partial<Record<SensorType, SensorValue>> = {};
  let activeCount = 0;

  // Pattern 1: Nested `sensors: { soil_moisture: { value: 31.4, unit: '%' } }` or `sensors: { soil_moisture: 31.4 }`
  if (parsed.sensors && typeof parsed.sensors === 'object') {
    for (const [key, valObj] of Object.entries(parsed.sensors)) {
      const sensorKey = normalizeSensorKey(key);
      if (!sensorKey) continue;

      let rawVal: any;
      if (typeof valObj === 'number') {
        rawVal = valObj;
      } else if (valObj && typeof valObj === 'object' && 'value' in (valObj as any)) {
        rawVal = (valObj as any).value;
      }

      if (typeof rawVal === 'number') {
        const validated = validateSensorReading(sensorKey, rawVal, timestamp);
        if (validated) {
          validatedReadings[sensorKey] = validated;
          activeCount++;
        }
      }
    }
  }

  // Pattern 2: Flat JSON format `{ soil_moisture: 31.4, temperature: 29.4, humidity: 72.1 }` or `{ moisture: 31.4, temp: 29.4 }`
  for (const [key, val] of Object.entries(parsed)) {
    if (key === 'sensors' || key === 'device_id' || key === 'deviceId' || key === 'timestamp') continue;

    const sensorKey = normalizeSensorKey(key);
    if (!sensorKey) continue;
    if (validatedReadings[sensorKey]) continue; // Already extracted from nested

    if (typeof val === 'number') {
      const validated = validateSensorReading(sensorKey, val, timestamp);
      if (validated) {
        validatedReadings[sensorKey] = validated;
        activeCount++;
      }
    }
  }

  if (activeCount === 0) {
    return {
      success: false,
      telemetry: null,
      error: 'No valid recognized agricultural sensor readings in payload',
      rawLine: trimmed
    };
  }

  const telemetry: ValidatedTelemetry = {
    deviceId,
    timestamp,
    readings: validatedReadings as Record<SensorType, SensorValue>,
    activeSensorsCount: activeCount,
    rawJson: trimmed,
    isSimulated: false
  };

  return {
    success: true,
    telemetry,
    rawLine: trimmed
  };
}

function normalizeSensorKey(rawKey: string): SensorType | null {
  const lower = rawKey.toLowerCase().replace(/[-_]/g, '');
  if (lower === 'soilmoisture' || lower === 'moisture' || lower === 'soilhumidity' || lower === 'sm') {
    return 'soil_moisture';
  }
  if (lower === 'temperature' || lower === 'temp' || lower === 'soiltemp' || lower === 'airtemp' || lower === 't') {
    return 'temperature';
  }
  if (lower === 'humidity' || lower === 'hum' || lower === 'airhumidity' || lower === 'rh' || lower === 'h') {
    return 'humidity';
  }
  if (lower === 'ph' || lower === 'soilph') {
    return 'ph';
  }
  if (lower === 'ec' || lower === 'conductivity' || lower === 'soilec') {
    return 'ec';
  }
  if (lower === 'nitrogen' || lower === 'n' || lower === 'soiln') {
    return 'nitrogen';
  }
  if (lower === 'phosphorus' || lower === 'p' || lower === 'soilp') {
    return 'phosphorus';
  }
  if (lower === 'potassium' || lower === 'k' || lower === 'soilk') {
    return 'potassium';
  }
  if (lower === 'light' || lower === 'lux' || lower === 'solarradiation' || lower === 'irradiance') {
    return 'light';
  }
  if (lower === 'rain' || lower === 'raingauge' || lower === 'rainfall') {
    return 'rain';
  }
  if (lower === 'leafwetness' || lower === 'leaf') {
    return 'leaf_wetness';
  }
  if (lower === 'windspeed' || lower === 'wind' || lower === 'anemometer') {
    return 'wind_speed';
  }
  return null;
}
