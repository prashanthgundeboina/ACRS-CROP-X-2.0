import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar, 
  CloudRain, 
  Thermometer, 
  Wind, 
  Droplets, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  ChevronRight, 
  Clock, 
  AlertOctagon, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { DailyRiskForecast, CropRiskLevel } from '../../types/cropRisk';

interface SevenDayRiskForecastProps {
  forecasts: DailyRiskForecast[];
  isExpertMode: boolean;
  onSelectTab: (tab: string) => void;
}

export const SevenDayRiskForecast: React.FC<SevenDayRiskForecastProps> = ({
  forecasts,
  isExpertMode,
  onSelectTab
}) => {
  const [selectedDayOffset, setSelectedDayOffset] = useState<number>(0);

  const selectedForecast = forecasts.find(f => f.dayOffset === selectedDayOffset) || forecasts[0];

  const getLevelColor = (level: CropRiskLevel) => {
    switch (level) {
      case 'HIGH':
        return {
          pill: 'bg-rose-50 text-rose-700 border-rose-200',
          dot: 'bg-rose-500',
          cardBorder: 'border-rose-300 ring-1 ring-rose-300/50',
          bannerBg: 'bg-rose-50 border-rose-200 text-rose-900'
        };
      case 'MODERATE':
        return {
          pill: 'bg-amber-50 text-amber-700 border-amber-200',
          dot: 'bg-amber-500',
          cardBorder: 'border-amber-300 ring-1 ring-amber-300/50',
          bannerBg: 'bg-amber-50 border-amber-200 text-amber-900'
        };
      case 'WATCH':
        return {
          pill: 'bg-blue-50 text-blue-700 border-blue-200',
          dot: 'bg-blue-500',
          cardBorder: 'border-blue-300',
          bannerBg: 'bg-blue-50 border-blue-200 text-blue-900'
        };
      case 'LOW':
      default:
        return {
          pill: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-500',
          cardBorder: 'border-emerald-200',
          bannerBg: 'bg-emerald-50 border-emerald-200 text-emerald-900'
        };
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'disease': return '🦠';
      case 'pest': return '🐛';
      case 'heat': return '🔥';
      case 'water': return '💧';
      case 'heavy_rain': return '🌧️';
      case 'wind': return '🌬️';
      case 'soil': return '🧪';
      case 'crop_health': return '📉';
      default: return '🌱';
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-[#c8e6c9] shadow-sm p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#2e7d32] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              7-Day Horizon
            </span>
            <span className="text-xs text-gray-500">• Tap any day to inspect forecast</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#1b2e1b] mt-1 flex items-center gap-2">
            📅 7-Day Predictive Crop Risk Outlook
          </h3>
        </div>
      </div>

      {/* 7-Day Horizontal Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {forecasts.map((forecast) => {
          const isSelected = forecast.dayOffset === selectedDayOffset;
          const colors = getLevelColor(forecast.overallLevel);

          return (
            <button
              key={forecast.dayOffset}
              type="button"
              onClick={() => setSelectedDayOffset(forecast.dayOffset)}
              className={`p-3.5 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between relative overflow-hidden min-h-[140px] ${
                isSelected
                  ? `bg-[#f8fcf8] border-[#2e7d32] shadow-md ring-2 ring-[#2e7d32]/30`
                  : `bg-white hover:bg-gray-50/80 border-gray-200`
              }`}
            >
              {isSelected && (
                <div className="absolute top-0 right-0 left-0 h-1 bg-[#2e7d32]" />
              )}

              {/* Day Name & Date */}
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-gray-900 truncate">
                  {forecast.dayName}
                </div>
                <div className="text-[10px] text-gray-500 font-mono">
                  {forecast.dateStr}
                </div>
              </div>

              {/* Risk Level Badge */}
              <div className="my-2">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${colors.pill}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                  {forecast.overallLevel}
                </span>
              </div>

              {/* Weather Summary & Dominant Risk Icon */}
              <div className="space-y-1 pt-1 border-t border-gray-100 text-[10px] text-gray-600">
                <div className="flex items-center justify-between font-mono font-bold text-gray-800">
                  <span>{forecast.tempHigh}°/{forecast.tempLow}°</span>
                  <span className="text-sm">{getCategoryIcon(forecast.dominantCategory)}</span>
                </div>
                <div className="flex items-center gap-1 text-blue-600 font-medium">
                  <CloudRain className="w-3 h-3" />
                  <span>{forecast.rainProb}% ({forecast.rainMm}mm)</span>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Interactive Day Deep-Dive Drawer */}
      <AnimatePresence mode="wait">
        {selectedForecast && (
          <motion.div
            key={selectedForecast.dayOffset}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-5 sm:p-6 rounded-3xl bg-[#f8fcf8] border border-[#c8e6c9] space-y-5"
          >
            {/* Top Bar for Selected Day */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#c8e6c9]/60 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white border border-[#c8e6c9] flex items-center justify-center text-xl shadow-sm">
                  {getCategoryIcon(selectedForecast.dominantCategory)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-serif font-bold text-base sm:text-lg text-[#1b2e1b]">
                      Outlook for {selectedForecast.dayName}
                    </h4>
                    <span className="text-xs text-gray-500 font-mono">({selectedForecast.dateStr})</span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Primary Driver: <span className="font-bold capitalize">{selectedForecast.dominantCategory.replace('_', ' ')} Risk</span>
                  </p>
                </div>
              </div>

              {/* Weather Chips */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white border border-gray-200 text-xs font-semibold text-gray-700 shadow-sm">
                  <Thermometer className="w-3.5 h-3.5 text-rose-500" />
                  {selectedForecast.tempHigh}°C / {selectedForecast.tempLow}°C
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white border border-gray-200 text-xs font-semibold text-blue-700 shadow-sm">
                  <CloudRain className="w-3.5 h-3.5 text-blue-500" />
                  {selectedForecast.rainProb}% Rain ({selectedForecast.rainMm} mm)
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white border border-gray-200 text-xs font-semibold text-indigo-700 shadow-sm">
                  <Droplets className="w-3.5 h-3.5 text-indigo-500" />
                  {selectedForecast.humidity}% Humidity
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white border border-gray-200 text-xs font-semibold text-slate-700 shadow-sm">
                  <Wind className="w-3.5 h-3.5 text-slate-500" />
                  {selectedForecast.windKmH} km/h Wind
                </span>
              </div>
            </div>

            {/* What, Why, Action, Avoid Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Column: What & Why */}
              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-white border border-[#c8e6c9]/80 space-y-1">
                  <span className="text-[10px] uppercase font-black tracking-wider text-[#2e7d32] flex items-center gap-1">
                    <Info className="w-3 h-3" /> Projected Condition
                  </span>
                  <p className="text-xs sm:text-sm font-semibold text-gray-800 leading-snug">
                    {selectedForecast.explanation.what}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white border border-[#c8e6c9]/80 space-y-1">
                  <span className="text-[10px] uppercase font-black tracking-wider text-gray-500 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#2e7d32]" /> Contributing Weather Factors
                  </span>
                  <ul className="space-y-1 text-xs text-gray-600">
                    {selectedForecast.explanation.why.map((r, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <span className="text-[#2e7d32] font-bold">•</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Right Column: Action & Avoid */}
              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-black tracking-wider text-[#1b5e20] flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Planned Action for {selectedForecast.dayName}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-800 bg-white/80 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {selectedForecast.explanation.when}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-bold text-[#1b5e20] leading-snug">
                    {selectedForecast.explanation.action}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-1">
                  <span className="text-[10px] uppercase font-black tracking-wider text-rose-700 flex items-center gap-1">
                    <AlertOctagon className="w-3.5 h-3.5 text-rose-600" /> What to Avoid
                  </span>
                  <p className="text-xs text-rose-900 leading-relaxed font-medium">
                    {selectedForecast.explanation.avoid}
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Category Status Breakdown */}
            <div className="pt-2 border-t border-[#c8e6c9]/60 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  Category Statuses:
                </span>
                {Object.entries(selectedForecast.categoryLevels).map(([cat, lvl]) => (
                  <span
                    key={cat}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${
                      lvl === 'HIGH' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                      lvl === 'MODERATE' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                      lvl === 'WATCH' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                      'bg-gray-50 text-gray-600 border-gray-200'
                    }`}
                  >
                    {getCategoryIcon(cat)} {cat.replace('_', ' ')}
                  </span>
                ))}
              </div>

              <button
                type="button"
                onClick={() => onSelectTab(selectedForecast.dominantCategory === 'water' ? 'irrigation' : selectedForecast.dominantCategory === 'disease' ? 'diagnostics' : 'weather')}
                className="px-4 py-2 rounded-xl bg-[#2e7d32] hover:bg-[#1b5e20] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 min-h-[44px]"
              >
                <span>Navigate to Mitigation Tool</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
