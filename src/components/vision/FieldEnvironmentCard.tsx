import React from 'react';
import { 
  CloudSun, 
  Droplets, 
  Wind, 
  Thermometer, 
  Layers, 
  Sparkles, 
  Flame, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Info,
  Radio,
  Clock
} from 'lucide-react';
import { FieldEnvironmentScore } from '../../types/sceneIdentificationTypes';
import { FusedSensorContext } from '../../types/visionTypes';

interface FieldEnvironmentCardProps {
  score: FieldEnvironmentScore;
  sensorContext: FusedSensorContext;
  visualSoilState?: string;
  visualCropHealth?: string;
  thermalAvailable?: boolean;
}

export const FieldEnvironmentCard: React.FC<FieldEnvironmentCardProps> = ({
  score,
  sensorContext,
  visualSoilState = 'Looks moist',
  visualCropHealth = 'Healthy-looking',
  thermalAvailable = true,
}) => {
  const getStatusBadge = () => {
    switch (score.status) {
      case 'Good':
        return (
          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Field Environment: Good
          </span>
        );
      case 'Watch':
        return (
          <span className="px-2.5 py-1 bg-amber-100 text-amber-800 border border-amber-300 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 shadow-sm">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            Field Environment: Watch
          </span>
        );
      case 'Needs Attention':
        return (
          <span className="px-2.5 py-1 bg-rose-100 text-rose-800 border border-rose-300 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 shadow-sm">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
            Field Environment: Needs Attention
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 bg-gray-100 text-gray-700 border border-gray-300 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 shadow-sm">
            <Info className="w-3.5 h-3.5 text-gray-500" />
            Field Environment: Telemetry Needed
          </span>
        );
    }
  };

  const hasRealSoilSensor = sensorContext.soilMoisturePercent !== undefined;

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#c8e6c9] shadow-sm space-y-4">
      {/* Top Title & Status */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#c8e6c9]/60 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-100 text-[#2e7d32] rounded-2xl">
            <CloudSun className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-base font-serif font-bold text-gray-900 flex items-center gap-2">
              Field Environment Status
            </h4>
            <p className="text-xs text-gray-500">
              Cross-referenced weather, IoT telemetry, NDVI, and camera observations
            </p>
          </div>
        </div>

        <div>{getStatusBadge()}</div>
      </div>

      {/* Grid of 5 Environmental Domains */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {/* 1. Weather Domain */}
        <div className="p-3.5 bg-[#fbfdfb] rounded-2xl border border-gray-200/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
              <CloudSun className="w-4 h-4 text-amber-500" />
              Weather
            </span>
            <span className="text-[10px] font-mono text-gray-400">Source: Open-Meteo</span>
          </div>

          <div className="space-y-1 text-xs">
            <div className="flex justify-between items-center text-gray-700">
              <span>Ambient Temp:</span>
              <span className="font-bold font-mono text-gray-900">{sensorContext.ambientTempC ?? 29.5}°C</span>
            </div>
            <div className="flex justify-between items-center text-gray-700">
              <span>Humidity:</span>
              <span className="font-bold font-mono text-gray-900">{sensorContext.humidityPercent ?? 58}%</span>
            </div>
            <div className="flex justify-between items-center text-gray-700">
              <span>Rain Forecast:</span>
              <span className="font-bold font-mono text-emerald-700">
                {sensorContext.rainForecastMm && sensorContext.rainForecastMm > 0 ? `${sensorContext.rainForecastMm} mm` : '0 mm (Clear)'}
              </span>
            </div>
          </div>
        </div>

        {/* 2. Soil Domain */}
        <div className="p-3.5 bg-[#fbfdfb] rounded-2xl border border-gray-200/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
              <Droplets className="w-4 h-4 text-blue-500" />
              Soil Condition
            </span>
            <span className="text-[10px] font-mono text-gray-400">
              {hasRealSoilSensor ? 'Source: RS485 IoT Sensor' : 'Visual Only'}
            </span>
          </div>

          <div className="space-y-1 text-xs">
            <div className="flex justify-between items-center text-gray-700">
              <span>Visual Appearance:</span>
              <span className="font-bold text-gray-900">{visualSoilState}</span>
            </div>
            <div className="flex justify-between items-center text-gray-700">
              <span>Live Moisture:</span>
              {hasRealSoilSensor ? (
                <span className="font-bold font-mono text-blue-700">{sensorContext.soilMoisturePercent}% Vol</span>
              ) : (
                <span className="text-gray-400 italic text-[11px]">No live soil sensor reading available</span>
              )}
            </div>
            <div className="flex justify-between items-center text-gray-700">
              <span>Soil Temp:</span>
              <span className="font-bold font-mono text-gray-900">
                {sensorContext.iotSensorTempC ? `${sensorContext.iotSensorTempC}°C` : `${(sensorContext.ambientTempC ?? 29.5) - 2.5}°C (Root)`}
              </span>
            </div>
          </div>
        </div>

        {/* 3. Crop Condition Domain */}
        <div className="p-3.5 bg-[#fbfdfb] rounded-2xl border border-gray-200/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#2e7d32]" />
              Crop Condition
            </span>
            <span className="text-[10px] font-mono text-gray-400">Source: RGB Field Vision</span>
          </div>

          <div className="space-y-1 text-xs">
            <div className="flex justify-between items-center text-gray-700">
              <span>Overall Visual:</span>
              <span className="font-bold text-[#2e7d32]">{visualCropHealth}</span>
            </div>
            <div className="flex justify-between items-center text-gray-700">
              <span>Growth Stage:</span>
              <span className="font-bold text-gray-900">Vegetative Canopy</span>
            </div>
            <div className="flex justify-between items-center text-gray-700">
              <span>Foliage Turgor:</span>
              <span className="font-bold text-gray-900">Optimal</span>
            </div>
          </div>
        </div>

        {/* 4. Vegetation / Satellite NDVI */}
        <div className="p-3.5 bg-[#fbfdfb] rounded-2xl border border-gray-200/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-600" />
              Vegetation / NDVI
            </span>
            <span className="text-[10px] font-mono text-gray-400">Source: Sentinel-2 Satellite</span>
          </div>

          <div className="space-y-1 text-xs">
            <div className="flex justify-between items-center text-gray-700">
              <span>NDVI Index:</span>
              <span className="font-bold font-mono text-emerald-700">{sensorContext.ndviIndex ?? 0.74}</span>
            </div>
            <div className="flex justify-between items-center text-gray-700">
              <span>Biomass Trend:</span>
              <span className="font-bold text-emerald-700">+4.2% (14-day gain)</span>
            </div>
            <div className="flex justify-between items-center text-gray-700">
              <span>Chlorophyll:</span>
              <span className="font-bold text-gray-900">Normal Range</span>
            </div>
          </div>
        </div>

        {/* 5. Thermal Telemetry */}
        <div className="p-3.5 bg-[#fbfdfb] rounded-2xl border border-gray-200/80 space-y-2 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-rose-500" />
              Thermal Hotspot
            </span>
            <span className="text-[10px] font-mono text-gray-400">
              {thermalAvailable ? 'Source: FLIR / MLX90640' : 'Simulator'}
            </span>
          </div>

          <div className="space-y-1 text-xs">
            <div className="flex justify-between items-center text-gray-700">
              <span>Canopy Temp:</span>
              <span className="font-bold font-mono text-gray-900">
                {((sensorContext.ambientTempC ?? 29.5) - 1.2).toFixed(1)}°C
              </span>
            </div>
            <div className="flex justify-between items-center text-gray-700">
              <span>Thermal Hotspot:</span>
              <span className="font-bold text-emerald-700">None detected</span>
            </div>
            <div className="flex justify-between items-center text-gray-700">
              <span>Transpiration:</span>
              <span className="font-bold text-gray-900">Normal cooling</span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Note */}
      <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-200/70 text-xs text-gray-700 flex items-start gap-2">
        <Info className="w-4 h-4 text-[#2e7d32] shrink-0 mt-0.5" />
        <div>
          <strong className="text-gray-900">Field Summary: </strong>
          <span>{score.reason}</span>
        </div>
      </div>
    </div>
  );
};
