import React from 'react';
import { motion } from 'motion/react';
import {
  Droplets,
  Thermometer,
  CloudRain,
  TestTube,
  Zap,
  Sprout,
  Leaf,
  Shield,
  Sun,
  Activity,
  Wind,
  Clock,
  ArrowUpRight,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { SensorValue, SensorHealthStatus } from '../../types/iot/iotTypes';

interface IoTSensorCardProps {
  sensor: SensorValue;
  isLive: boolean;
  isExpertMode: boolean;
  onApplyToSoilData?: (key: string, value: number) => void;
}

export const IoTSensorCard: React.FC<IoTSensorCardProps> = ({
  sensor,
  isLive,
  isExpertMode,
  onApplyToSoilData
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Droplets':
        return <Droplets className="w-5 h-5 text-blue-600" />;
      case 'Thermometer':
        return <Thermometer className="w-5 h-5 text-amber-600" />;
      case 'CloudRain':
        return <CloudRain className="w-5 h-5 text-cyan-600" />;
      case 'TestTube':
        return <TestTube className="w-5 h-5 text-emerald-600" />;
      case 'Zap':
        return <Zap className="w-5 h-5 text-yellow-600" />;
      case 'Sprout':
        return <Sprout className="w-5 h-5 text-emerald-700" />;
      case 'Leaf':
        return <Leaf className="w-5 h-5 text-lime-600" />;
      case 'Shield':
        return <Shield className="w-5 h-5 text-purple-600" />;
      case 'Sun':
        return <Sun className="w-5 h-5 text-amber-500" />;
      case 'Wind':
        return <Wind className="w-5 h-5 text-slate-600" />;
      case 'Activity':
      default:
        return <Activity className="w-5 h-5 text-[#2e7d32]" />;
    }
  };

  const getStatusBadge = (status: SensorHealthStatus) => {
    switch (status) {
      case 'critical':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'warning':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'optimal':
      default:
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    }
  };

  // Calculate percentage within full scale minValid to maxValid
  const rangeSpan = sensor.maxValid - sensor.minValid;
  const currentPct = rangeSpan > 0 ? Math.min(100, Math.max(0, ((sensor.value - sensor.minValid) / rangeSpan) * 100)) : 50;
  const optimalMinPct = rangeSpan > 0 ? Math.min(100, Math.max(0, ((sensor.optimalMin - sensor.minValid) / rangeSpan) * 100)) : 30;
  const optimalMaxPct = rangeSpan > 0 ? Math.min(100, Math.max(0, ((sensor.optimalMax - sensor.minValid) / rangeSpan) * 100)) : 70;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl border border-[#c8e6c9] shadow-sm hover:shadow-md transition-all p-5 sm:p-6 space-y-4 flex flex-col justify-between"
    >
      {/* Header with Icon & Freshness Badge */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-[#f8fcf8] border border-[#c8e6c9] shadow-xs">
              {getIcon(sensor.iconName)}
            </div>
            <div>
              <h4 className="text-sm font-bold text-gray-900 leading-tight">
                {sensor.name}
              </h4>
              <span className="text-[10px] text-gray-400 font-mono">
                Probe: {sensor.type}
              </span>
            </div>
          </div>

          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              isLive
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 animate-pulse'
                : 'bg-gray-100 text-gray-600 border-gray-200'
            }`}
          >
            {isLive ? '🟢 Live' : '🟡 Last Known'}
          </span>
        </div>

        {/* Big Numeric Metric Readout */}
        <div className="space-y-1 pt-1">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-black font-mono text-gray-900 tracking-tight">
              {sensor.value}
            </span>
            <span className="text-sm font-bold text-gray-500 font-mono">
              {sensor.unit}
            </span>
          </div>

          {/* Qualitative Status Pill */}
          <div>
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusBadge(sensor.status)}`}>
              {sensor.statusLabel}
            </span>
          </div>
        </div>

        {/* Range Visual Bar with Optimal Band */}
        <div className="space-y-1 pt-2">
          <div className="flex items-center justify-between text-[10px] text-gray-400 font-mono">
            <span>{sensor.minValid} {sensor.unit}</span>
            <span className="text-[#2e7d32] font-semibold">
              Ideal: {sensor.optimalMin} – {sensor.optimalMax} {sensor.unit}
            </span>
            <span>{sensor.maxValid} {sensor.unit}</span>
          </div>

          <div className="w-full h-2.5 bg-gray-100 rounded-full relative overflow-hidden">
            {/* Ideal Band Target Area */}
            <div
              className="absolute top-0 bottom-0 bg-emerald-100 rounded-full"
              style={{
                left: `${optimalMinPct}%`,
                width: `${optimalMaxPct - optimalMinPct}%`
              }}
            />
            {/* Current Value Marker Fill */}
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                sensor.status === 'optimal'
                  ? 'bg-[#2e7d32]'
                  : sensor.status === 'warning'
                  ? 'bg-amber-500'
                  : 'bg-rose-500'
              }`}
              style={{ width: `${currentPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Footer / Context info */}
      <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-mono">
          <Clock className="w-3 h-3" />
          <span>{new Date(sensor.lastUpdated).toLocaleTimeString()}</span>
        </div>

        {onApplyToSoilData && (
          <button
            type="button"
            onClick={() => onApplyToSoilData(sensor.type, sensor.value)}
            className="text-[11px] font-bold text-[#2e7d32] hover:text-[#1b5e20] flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-emerald-50 transition-colors"
            title="Sync this sensor reading into farm soil parameters"
          >
            <span>Sync to Farm</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </motion.div>
  );
};
