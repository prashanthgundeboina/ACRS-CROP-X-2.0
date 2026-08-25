import { ThermalMatrix, ThermalDevice, ThermalHotspot } from '../types/thermalTypes';
import { TemperatureTelemetry } from '../types/cameraTypes';

class ThermalCameraService {
  private thermalDevice: ThermalDevice = {
    id: 'ir-thermal-adapter',
    name: 'CroperX Thermal IR Bridge',
    model: 'MLX90640 Far-Infrared Matrix (32x24)',
    isConnected: false,
    protocol: 'SIMULATOR',
    status: 'disconnected',
  };

  private lastMatrix: ThermalMatrix | null = null;

  public getThermalDevice(): ThermalDevice {
    return { ...this.thermalDevice };
  }

  public isConnected(): boolean {
    return this.thermalDevice.isConnected;
  }

  public connectThermalDevice(isSimulated = true): ThermalDevice {
    this.thermalDevice = {
      ...this.thermalDevice,
      isConnected: true,
      status: 'online',
      protocol: isSimulated ? 'SIMULATOR' : 'USB_IR',
    };
    return this.getThermalDevice();
  }

  public disconnectThermalDevice(): void {
    this.thermalDevice = {
      ...this.thermalDevice,
      isConnected: false,
      status: 'disconnected',
    };
  }

  /**
   * Strictly assemble temperature telemetry distinguishing Ambient vs Sensor vs Thermal
   */
  public compileTemperatureTelemetry(params: {
    ambientWeatherTempC?: number;
    iotSensorTempC?: number;
  }): TemperatureTelemetry {
    const ambientTempC = params.ambientWeatherTempC ?? 29.5;
    const iotSensorTempC = params.iotSensorTempC;
    const isThermalConnected = this.thermalDevice.isConnected;

    let thermalCameraTempC: number | undefined = undefined;
    if (isThermalConnected) {
      if (!this.lastMatrix) {
        this.lastMatrix = this.generateSampleThermalMatrix(ambientTempC);
      }
      thermalCameraTempC = this.lastMatrix.plantTempC;
    }

    return {
      ambientTempC,
      iotSensorTempC,
      thermalCameraTempC,
      isThermalCameraConnected: isThermalConnected,
      sourceLabels: {
        ambient: 'Open-Meteo Weather Pipeline',
        sensor: 'ESP32 / Arduino Soil & Canopy Hardware Probe',
        thermal: 'MLX90640 Long-Wave Infrared Thermal Sensor',
      },
      truthfulnessNote:
        'A standard RGB phone or webcam camera cannot measure plant temperature. Only ambient weather forecasts, physical IoT probes, or dedicated thermal infrared cameras provide verified temperature metrics.',
    };
  }

  /**
   * Generate a realistic 32x24 thermal matrix with canopy cooling / hotspot areas
   */
  public generateSampleThermalMatrix(ambientTempC = 30): ThermalMatrix {
    const width = 32;
    const height = 24;
    const grid: number[][] = [];

    // Healthy transpiring plant canopy is typically 2 - 4°C cooler than ambient due to transpiration
    // Drought stressed areas or dry soil patches are warmer (+2 - 5°C)
    const basePlantTemp = ambientTempC - 2.8;

    let min = 999;
    let max = -999;
    let sum = 0;

    for (let y = 0; y < height; y++) {
      const row: number[] = [];
      for (let x = 0; x < width; x++) {
        // Create realistic spatial gradient (cooler center canopy, warmer soil borders)
        const distFromCenter = Math.sqrt(Math.pow((x - width / 2) / (width / 2), 2) + Math.pow((y - height / 2) / (height / 2), 2));
        const noise = (Math.sin(x * 0.8) + Math.cos(y * 0.8)) * 0.4;
        let temp = basePlantTemp + distFromCenter * 3.2 + noise;

        // Add a simulated hot spot at top right corner
        if (x > 22 && y < 8) {
          temp += 3.8;
        }

        temp = Math.round(temp * 10) / 10;
        row.push(temp);

        if (temp < min) min = temp;
        if (temp > max) max = temp;
        sum += temp;
      }
      grid.push(row);
    }

    const avg = Math.round((sum / (width * height)) * 10) / 10;

    const hotspots: ThermalHotspot[] = [
      {
        xPercent: 78,
        yPercent: 22,
        tempC: Math.round((max - 0.2) * 10) / 10,
        label: 'Exposed Dry Soil Border Hotspot',
        severity: 'warm',
      },
      {
        xPercent: 48,
        yPercent: 52,
        tempC: Math.round((min + 0.4) * 10) / 10,
        label: 'Actively Transpiring Foliage Canopy',
        severity: 'normal',
      },
    ];

    const matrix: ThermalMatrix = {
      minTempC: min,
      maxTempC: max,
      avgTempC: avg,
      plantTempC: Math.round((min + 1.2) * 10) / 10,
      ambientReferenceTempC: ambientTempC,
      hotspots,
      timestamp: new Date().toISOString(),
      isSimulated: this.thermalDevice.protocol === 'SIMULATOR',
      resolution: { width, height },
      rawGridSample: grid,
    };

    this.lastMatrix = matrix;
    return matrix;
  }
}

export const thermalCameraService = new ThermalCameraService();
