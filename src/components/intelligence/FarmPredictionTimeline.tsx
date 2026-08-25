import React from 'react';
import { motion } from 'motion/react';
import { 
  Clock, 
  Droplets, 
  Thermometer, 
  CloudRain, 
  ShieldCheck, 
  AlertCircle,
  TrendingDown,
  Calendar
} from 'lucide-react';
import { PredictiveTimelinePoint } from '../../types/intelligence/farmIntelligenceTypes';

interface FarmPredictionTimelineProps {
  timeline: PredictiveTimelinePoint[];
  depletionRatePerHour: number;
}

export const FarmPredictionTimeline: React.FC<FarmPredictionTimelineProps> = ({
  timeline,
  depletionRatePerHour
}) => {
  const getRiskColor = (status: string) => {
    switch (status) {
      case 'CRITICAL':
        return {
          bg: 'bg-rose-50 border-rose-300 text-rose-800',
          dot: 'bg-rose-500',
          badge: 'bg-rose-100 text-rose-800'
        };
      case 'HIGH':
        return {
          bg: 'bg-amber-50 border-amber-300 text-amber-900',
          dot: 'bg-amber-500',
          badge: 'bg-amber-100 text-amber-900'
        };
      case 'MODERATE':
        return {
          bg: 'bg-yellow-50 border-yellow-200 text-yellow-800',
          dot: 'bg-yellow-500',
          badge: 'bg-yellow-100 text-yellow-800'
        };
      case 'LOW':
      default:
        return {
          bg: 'bg-emerald-50/70 border-[#c8e6c9] text-emerald-900',
          dot: 'bg-[#2e7d32]',
          badge: 'bg-[#e8f5e9] text-[#2e7d32]'
        };
    }
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#c8e6c9] shadow-sm space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-[#e8f5e9] flex items-center justify-center text-[#2e7d32]">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-lg text-[#1b2e1b]">
              72-Hour Predictive Farm Horizon
            </h3>
            <p className="text-xs text-gray-500">
              Estimated trajectory based on crop Kc, ET0 rate (~{depletionRatePerHour}%/hr), and radar forecast
            </p>
          </div>
        </div>

        <span className="text-[11px] font-mono font-bold px-3 py-1 rounded-full bg-[#f1f8e9] text-[#2e7d32] border border-[#c8e6c9]">
          Forecast Window: 5 Time-Steps
        </span>
      </div>

      {/* Responsive Horizontal / Stacked Timeline */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 pt-2">
        {timeline.map((point, idx) => {
          const colors = getRiskColor(point.riskStatus);

          return (
            <motion.div
              key={point.timeLabel}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              className={`rounded-2xl border p-4 flex flex-col justify-between space-y-3 relative ${colors.bg}`}
            >
              {/* Header Time Marker */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${colors.dot}`} />
                  <span className="text-xs font-mono font-black uppercase tracking-wider text-gray-900">
                    {point.timeLabel}
                  </span>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${colors.badge}`}>
                  {point.riskStatus}
                </span>
              </div>

              {/* Moisture & Temp Forecast Metrics */}
              <div className="space-y-1 py-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 flex items-center gap-1">
                    <Droplets className="w-3.5 h-3.5 text-blue-500" />
                    Moisture
                  </span>
                  <span className="font-bold font-mono text-gray-900">
                    {point.estimatedMoisture}%
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 flex items-center gap-1">
                    <Thermometer className="w-3.5 h-3.5 text-orange-500" />
                    Temp
                  </span>
                  <span className="font-bold font-mono text-gray-900">
                    {point.estimatedTemp}°C
                  </span>
                </div>

                {point.rainExpectedMm > 0 && (
                  <div className="flex items-center justify-between text-xs text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-md mt-1">
                    <span className="flex items-center gap-1">
                      <CloudRain className="w-3.5 h-3.5" />
                      Rain
                    </span>
                    <span className="font-bold font-mono">+{point.rainExpectedMm}mm</span>
                  </div>
                )}
              </div>

              {/* Status Note & Recommended Action */}
              <div className="pt-2 border-t border-black/5 text-[11px] space-y-1">
                <p className="font-bold text-gray-900 line-clamp-1">
                  {point.headline}
                </p>
                <p className="text-gray-600 line-clamp-2">
                  👉 {point.recommendedFocus}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
