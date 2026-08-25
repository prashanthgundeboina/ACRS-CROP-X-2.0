import React from 'react';
import { 
  CloudSun, 
  Radio, 
  Thermometer, 
  ShieldAlert, 
  CheckCircle2, 
  Info,
  Flame,
  AlertCircle
} from 'lucide-react';
import { TemperatureTelemetry } from '../../types/cameraTypes';

interface TemperatureTruthCardProps {
  telemetry: TemperatureTelemetry;
  onOpenThermalView?: () => void;
}

export const TemperatureTruthCard: React.FC<TemperatureTruthCardProps> = ({
  telemetry,
  onOpenThermalView,
}) => {
  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#c8e6c9] shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#c8e6c9]/60 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-amber-50 text-amber-700 rounded-xl">
            <Thermometer className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold text-amber-700 uppercase tracking-wider">
              Temperature Ground Truth Architecture
            </span>
            <h4 className="text-base font-bold text-gray-900">
              Verified Temperature Sources
            </h4>
          </div>
        </div>

        <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full text-[11px] font-mono font-semibold">
          3-Channel Truth Model
        </span>
      </div>

      {/* Mandatory Truthfulness Disclaimer Banner */}
      <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-2xl flex items-start gap-2.5">
        <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-900 leading-relaxed font-medium">
          <strong>Mandatory Temperature Notice:</strong> {telemetry.truthfulnessNote}
        </p>
      </div>

      {/* 3 Channel Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Channel 1: Ambient Weather Temperature */}
        <div className="bg-blue-50/60 rounded-2xl p-3.5 border border-blue-200/70 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-blue-700 uppercase">
              1. Ambient Weather
            </span>
            <CloudSun className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-gray-900">
              {telemetry.ambientTempC.toFixed(1)}°C
            </span>
            <span className="text-[11px] text-gray-500 font-medium">Air Temp</span>
          </div>
          <p className="text-[11px] text-blue-900/80 leading-tight">
            <strong>Source:</strong> {telemetry.sourceLabels.ambient}
          </p>
        </div>

        {/* Channel 2: IoT Sensor Hardware Probe */}
        <div className="bg-emerald-50/60 rounded-2xl p-3.5 border border-emerald-200/70 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-emerald-700 uppercase">
              2. IoT Sensor Probe
            </span>
            <Radio className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-gray-900">
              {telemetry.iotSensorTempC !== undefined ? `${telemetry.iotSensorTempC.toFixed(1)}°C` : 'Standby'}
            </span>
            <span className="text-[11px] text-gray-500 font-medium">Root/Soil Probe</span>
          </div>
          <p className="text-[11px] text-emerald-900/80 leading-tight">
            <strong>Source:</strong> {telemetry.sourceLabels.sensor}
          </p>
        </div>

        {/* Channel 3: Thermal Infrared Camera */}
        <div className={`rounded-2xl p-3.5 border space-y-2 transition-all ${
          telemetry.isThermalCameraConnected
            ? 'bg-purple-50/70 border-purple-200'
            : 'bg-gray-50/80 border-gray-200 opacity-90'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-bold text-purple-700 uppercase">
              3. Thermal IR Camera
            </span>
            <Flame className={`w-4 h-4 ${telemetry.isThermalCameraConnected ? 'text-purple-600' : 'text-gray-400'}`} />
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-gray-900">
              {telemetry.thermalCameraTempC !== undefined
                ? `${telemetry.thermalCameraTempC.toFixed(1)}°C`
                : 'Not Attached'}
            </span>
            <span className="text-[11px] text-gray-500 font-medium">Canopy Thermal</span>
          </div>
          <div className="flex items-center justify-between pt-1">
            <p className="text-[10px] text-purple-950 leading-tight">
              {telemetry.isThermalCameraConnected ? 'MLX90640 Active' : 'IR Adapter Standby'}
            </p>
            {onOpenThermalView && (
              <button
                onClick={onOpenThermalView}
                className="text-[10px] font-bold text-purple-700 hover:underline cursor-pointer"
              >
                View Thermal &rarr;
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
