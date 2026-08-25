import { SensorType, SensorValue, SensorHealthStatus } from '../../types/iot/iotTypes';

export interface SensorThresholdConfig {
  type: SensorType;
  name: string;
  unit: string;
  iconName: string;
  minValid: number;
  maxValid: number;
  optimalMin: number;
  optimalMax: number;
  precision: number;
  evaluateStatus: (val: number) => { status: SensorHealthStatus; label: string };
}

export const SENSOR_DEFINITIONS: Record<SensorType, SensorThresholdConfig> = {
  soil_moisture: {
    type: 'soil_moisture',
    name: 'Soil Moisture',
    unit: '%',
    iconName: 'Droplets',
    minValid: 0,
    maxValid: 100,
    optimalMin: 25,
    optimalMax: 55,
    precision: 1,
    evaluateStatus: (val: number) => {
      if (val < 15) return { status: 'critical', label: '🔴 Critically Dry' };
      if (val < 25) return { status: 'warning', label: '🟡 Getting Dry' };
      if (val <= 55) return { status: 'optimal', label: '🟢 Optimal Moisture' };
      if (val <= 75) return { status: 'warning', label: '🟡 Saturated Soil' };
      return { status: 'critical', label: '🔴 Waterlogged Risk' };
    }
  },
  temperature: {
    type: 'temperature',
    name: 'Ambient Temperature',
    unit: '°C',
    iconName: 'Thermometer',
    minValid: -20,
    maxValid: 65,
    optimalMin: 18,
    optimalMax: 32,
    precision: 1,
    evaluateStatus: (val: number) => {
      if (val < 5) return { status: 'critical', label: '🔴 Frost Risk' };
      if (val < 15) return { status: 'warning', label: '🟡 Low Temperature' };
      if (val <= 32) return { status: 'optimal', label: '🟢 Ideal Growing Temp' };
      if (val <= 38) return { status: 'warning', label: '🟡 Heat Stress Alert' };
      return { status: 'critical', label: '🔴 Extreme Heat Danger' };
    }
  },
  humidity: {
    type: 'humidity',
    name: 'Air Humidity',
    unit: '%',
    iconName: 'CloudRain',
    minValid: 0,
    maxValid: 100,
    optimalMin: 45,
    optimalMax: 75,
    precision: 1,
    evaluateStatus: (val: number) => {
      if (val < 30) return { status: 'warning', label: '🟡 Arid Air' };
      if (val <= 75) return { status: 'optimal', label: '🟢 Healthy Range' };
      if (val <= 88) return { status: 'warning', label: '🟡 High (Fungal Watch)' };
      return { status: 'critical', label: '🔴 Saturated (Disease Threat)' };
    }
  },
  ph: {
    type: 'ph',
    name: 'Soil pH',
    unit: 'pH',
    iconName: 'TestTube',
    minValid: 0,
    maxValid: 14,
    optimalMin: 6.0,
    optimalMax: 7.2,
    precision: 2,
    evaluateStatus: (val: number) => {
      if (val < 5.5) return { status: 'critical', label: '🔴 Acidic Soil' };
      if (val < 6.0) return { status: 'warning', label: '🟡 Slightly Acidic' };
      if (val <= 7.2) return { status: 'optimal', label: '🟢 Optimal pH' };
      if (val <= 8.0) return { status: 'warning', label: '🟡 Slightly Alkaline' };
      return { status: 'critical', label: '🔴 Alkaline Soil' };
    }
  },
  ec: {
    type: 'ec',
    name: 'Electrical Conductivity',
    unit: 'dS/m',
    iconName: 'Zap',
    minValid: 0,
    maxValid: 15,
    optimalMin: 0.8,
    optimalMax: 2.5,
    precision: 2,
    evaluateStatus: (val: number) => {
      if (val < 0.5) return { status: 'warning', label: '🟡 Low Nutrient Salinity' };
      if (val <= 2.5) return { status: 'optimal', label: '🟢 Optimal EC' };
      if (val <= 4.0) return { status: 'warning', label: '🟡 High Salinity' };
      return { status: 'critical', label: '🔴 Severe Salinity' };
    }
  },
  nitrogen: {
    type: 'nitrogen',
    name: 'Nitrogen (N)',
    unit: 'mg/kg',
    iconName: 'Sprout',
    minValid: 0,
    maxValid: 500,
    optimalMin: 100,
    optimalMax: 220,
    precision: 0,
    evaluateStatus: (val: number) => {
      if (val < 70) return { status: 'critical', label: '🔴 Severe N Deficiency' };
      if (val < 100) return { status: 'warning', label: '🟡 Low Nitrogen' };
      if (val <= 220) return { status: 'optimal', label: '🟢 Optimal Nitrogen' };
      return { status: 'warning', label: '🟡 Excessive Nitrogen' };
    }
  },
  phosphorus: {
    type: 'phosphorus',
    name: 'Phosphorus (P)',
    unit: 'mg/kg',
    iconName: 'Leaf',
    minValid: 0,
    maxValid: 300,
    optimalMin: 20,
    optimalMax: 60,
    precision: 0,
    evaluateStatus: (val: number) => {
      if (val < 15) return { status: 'critical', label: '🔴 P Deficiency' };
      if (val < 20) return { status: 'warning', label: '🟡 Low Phosphorus' };
      if (val <= 60) return { status: 'optimal', label: '🟢 Optimal Phosphorus' };
      return { status: 'warning', label: '🟡 High Phosphorus' };
    }
  },
  potassium: {
    type: 'potassium',
    name: 'Potassium (K)',
    unit: 'mg/kg',
    iconName: 'Shield',
    minValid: 0,
    maxValid: 600,
    optimalMin: 120,
    optimalMax: 280,
    precision: 0,
    evaluateStatus: (val: number) => {
      if (val < 80) return { status: 'critical', label: '🔴 K Deficiency' };
      if (val < 120) return { status: 'warning', label: '🟡 Low Potassium' };
      if (val <= 280) return { status: 'optimal', label: '🟢 Optimal Potassium' };
      return { status: 'warning', label: '🟡 High Potassium' };
    }
  },
  light: {
    type: 'light',
    name: 'Solar Radiation',
    unit: 'lux',
    iconName: 'Sun',
    minValid: 0,
    maxValid: 150000,
    optimalMin: 20000,
    optimalMax: 80000,
    precision: 0,
    evaluateStatus: (val: number) => {
      if (val < 5000) return { status: 'warning', label: '🟡 Low Light / Shade' };
      if (val <= 80000) return { status: 'optimal', label: '🟢 Good Photosynthesis' };
      return { status: 'warning', label: '🟡 High Irradiance' };
    }
  },
  rain: {
    type: 'rain',
    name: 'Rain Gauge',
    unit: 'mm',
    iconName: 'CloudRain',
    minValid: 0,
    maxValid: 500,
    optimalMin: 0,
    optimalMax: 50,
    precision: 1,
    evaluateStatus: (val: number) => {
      if (val === 0) return { status: 'optimal', label: '🟢 No Active Rain' };
      if (val <= 25) return { status: 'optimal', label: '🟢 Moderate Rain' };
      return { status: 'critical', label: '🔴 Heavy Rainfall' };
    }
  },
  leaf_wetness: {
    type: 'leaf_wetness',
    name: 'Leaf Wetness',
    unit: '%',
    iconName: 'Activity',
    minValid: 0,
    maxValid: 100,
    optimalMin: 0,
    optimalMax: 30,
    precision: 0,
    evaluateStatus: (val: number) => {
      if (val < 20) return { status: 'optimal', label: '🟢 Dry Foliage' };
      if (val <= 50) return { status: 'warning', label: '🟡 Dew / Moist Leaves' };
      return { status: 'critical', label: '🔴 Prolonged Wetness' };
    }
  },
  wind_speed: {
    type: 'wind_speed',
    name: 'Anemometer (Wind)',
    unit: 'km/h',
    iconName: 'Wind',
    minValid: 0,
    maxValid: 200,
    optimalMin: 0,
    optimalMax: 25,
    precision: 1,
    evaluateStatus: (val: number) => {
      if (val <= 20) return { status: 'optimal', label: '🟢 Light Breeze' };
      if (val <= 40) return { status: 'warning', label: '🟡 Moderate Wind' };
      return { status: 'critical', label: '🔴 High Wind / Lodging Risk' };
    }
  }
};

/**
 * Validates a single sensor value against range bounds.
 * Returns null if invalid or impossible, or a clean SensorValue object.
 */
export function validateSensorReading(
  type: SensorType,
  rawVal: unknown,
  timestampStr?: string
): SensorValue | null {
  const config = SENSOR_DEFINITIONS[type];
  if (!config) return null;

  if (typeof rawVal !== 'number' || isNaN(rawVal) || !isFinite(rawVal)) {
    return null;
  }

  // Bound check
  if (rawVal < config.minValid || rawVal > config.maxValid) {
    return null;
  }

  const rounded = Number(rawVal.toFixed(config.precision));
  const { status, label } = config.evaluateStatus(rounded);

  return {
    type,
    name: config.name,
    value: rounded,
    unit: config.unit,
    status,
    statusLabel: label,
    minValid: config.minValid,
    maxValid: config.maxValid,
    optimalMin: config.optimalMin,
    optimalMax: config.optimalMax,
    precision: config.precision,
    iconName: config.iconName,
    lastUpdated: timestampStr || new Date().toISOString()
  };
}
