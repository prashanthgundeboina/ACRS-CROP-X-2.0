export interface ThermalHotspot {
  xPercent: number; // 0 - 100
  yPercent: number; // 0 - 100
  tempC: number;
  label: string;
  severity: 'normal' | 'warm' | 'hotspot_warning';
}

export interface ThermalMatrix {
  minTempC: number;
  maxTempC: number;
  avgTempC: number;
  plantTempC: number;
  ambientReferenceTempC: number;
  hotspots: ThermalHotspot[];
  timestamp: string;
  isSimulated: boolean;
  resolution: { width: number; height: number }; // e.g. 32x24 (MLX90640) or 80x60 (FLIR Lepton)
  rawGridSample?: number[][]; // 2D array of temp values
}

export interface ThermalDevice {
  id: string;
  name: string;
  model: string;
  isConnected: boolean;
  protocol: 'USB_IR' | 'WIFI_THERMAL' | 'BLE_THERMAL' | 'SIMULATOR';
  status: 'online' | 'standby' | 'disconnected';
  lastReading?: ThermalMatrix;
}
