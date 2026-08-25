import React from 'react';
import { motion } from 'motion/react';
import { 
  Droplets, 
  CloudRain, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  RefreshCw, 
  Sparkles, 
  ChevronRight, 
  Info,
  Calendar,
  Layers,
  Thermometer,
  Wind,
  Gauge,
  Bot
} from 'lucide-react';
import { IrrigationRecommendationDetails, SoilData } from '../../types';

interface IrrigationRecommendationCardProps {
  recommendation: IrrigationRecommendationDetails;
  selectedZoneName?: string;
  cropName?: string;
  currentMoisture: number;
  rainfallForecastMm?: number;
  rainProbability?: number;
  temperature?: number;
  isExpertMode?: boolean;
  onViewPlan?: () => void;
  onRefreshData?: () => void;
  onAskCroperX?: (question: string) => void;
  onOpenDetailsModal?: () => void;
}

export const IrrigationRecommendationCard: React.FC<IrrigationRecommendationCardProps> = ({
  recommendation,
  selectedZoneName = 'Main Field',
  cropName = 'Rice',
  currentMoisture,
  rainfallForecastMm = 0,
  rainProbability = 20,
  temperature = 28,
  isExpertMode = false,
  onViewPlan,
  onRefreshData,
  onAskCroperX,
  onOpenDetailsModal
}) => {
  const {
    statusCode,
    statusLabel,
    severity,
    badgeColor,
    what,
    why,
    action,
    when,
    avoid,
    evapotranspirationMmDay,
    cropCoefficientKc,
    cropWaterNeedMmDay,
    netIrrigationDeficitMm,
    grossIrrigationRequiredMm,
    estimatedTotalVolumeM3,
    estimatedTotalLiters,
    estimatedPumpHours,
    confidenceScore,
    dataFreshness,
    assumptionsUsed,
    missingInputs
  } = recommendation;

  // Status visual themes
  const themeMap = {
    WATER_NOW: {
      bg: 'bg-gradient-to-br from-red-950 via-red-900 to-amber-950 text-white',
      border: 'border-red-500/40',
      badgeBg: 'bg-red-500 text-white',
      ringColor: 'ring-red-400/30',
      icon: Droplets,
      accentText: 'text-red-300'
    },
    WATER_SOON: {
      bg: 'bg-gradient-to-br from-amber-950 via-amber-900 to-emerald-950 text-white',
      border: 'border-amber-500/40',
      badgeBg: 'bg-amber-500 text-slate-900 font-bold',
      ringColor: 'ring-amber-400/30',
      icon: Droplets,
      accentText: 'text-amber-300'
    },
    WAIT: {
      bg: 'bg-gradient-to-br from-slate-900 via-blue-950 to-emerald-950 text-white',
      border: 'border-blue-500/40',
      badgeBg: 'bg-blue-500 text-white',
      ringColor: 'ring-blue-400/30',
      icon: CloudRain,
      accentText: 'text-blue-300'
    },
    MONITOR: {
      bg: 'bg-gradient-to-br from-[#122814] via-[#1b3a1d] to-[#0f2412] text-white',
      border: 'border-emerald-500/40',
      badgeBg: 'bg-[#4CAF50] text-white',
      ringColor: 'ring-emerald-400/30',
      icon: CheckCircle2,
      accentText: 'text-emerald-300'
    },
    DATA_UNAVAILABLE: {
      bg: 'bg-gradient-to-br from-slate-900 via-gray-900 to-slate-950 text-white',
      border: 'border-gray-500/40',
      badgeBg: 'bg-gray-500 text-white',
      ringColor: 'ring-gray-400/30',
      icon: AlertTriangle,
      accentText: 'text-gray-300'
    }
  };

  const theme = themeMap[statusCode] || themeMap.MONITOR;
  const StatusIcon = theme.icon;

  return (
    <div className={`relative rounded-[2.5rem] border ${theme.border} ${theme.bg} p-6 sm:p-8 shadow-2xl overflow-hidden transition-all duration-300`}>
      {/* Background Subtle Wave Accents */}
      <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Info Bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-inner">
            <StatusIcon className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-widest text-white/70">
                {selectedZoneName}
              </span>
              <span className="text-[11px] bg-white/15 px-2 py-0.5 rounded-full font-bold text-white/90">
                {cropName}
              </span>
            </div>
            <h3 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white mt-0.5">
              {statusLabel}
            </h3>
          </div>
        </div>

        {/* Telemetry Chips */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="bg-black/30 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
            <Gauge className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-white/70">Moisture:</span>
            <span className="font-mono font-black text-white">{currentMoisture}%</span>
          </div>

          <div className="bg-black/30 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
            <CloudRain className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-white/70">Rain:</span>
            <span className="font-mono font-black text-white">{rainfallForecastMm}mm ({rainProbability}%)</span>
          </div>

          <div className="bg-black/30 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
            <Thermometer className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-mono font-black text-white">{temperature}°C</span>
          </div>
        </div>
      </div>

      {/* Structured Farmer Explanation (WHAT, WHY, WHAT TO DO, WHEN, WHAT TO AVOID) */}
      <div className="relative z-10 grid md:grid-cols-12 gap-6">
        {/* Left Column: What & Why (Core Plain Language) */}
        <div className="md:col-span-7 space-y-4">
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 space-y-1.5">
            <div className="text-[11px] font-black uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5" /> What Is Happening?
            </div>
            <p className="text-base font-semibold text-white leading-snug">
              {what}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-black/20 backdrop-blur-md border border-white/10 space-y-1.5">
            <div className="text-[11px] font-black uppercase tracking-wider text-white/70">
              Why? (Agronomic Rationale)
            </div>
            <p className="text-sm text-white/90 leading-relaxed font-sans">
              {why}
            </p>
          </div>

          {/* Action Directives */}
          <div className="grid sm:grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                Recommended Action
              </div>
              <p className="text-xs text-white/90 font-medium">
                {action}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                Optimal Window
              </div>
              <p className="text-xs text-white/90 font-medium">
                {when}
              </p>
            </div>
          </div>

          {avoid && (
            <div className="p-3 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-300 mt-0.5" />
              <div>
                <span className="font-bold">What to avoid: </span>
                <span>{avoid}</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Deterministic Water Volume & Expert Telemetry */}
        <div className="md:col-span-5 flex flex-col justify-between space-y-4">
          <div className="p-5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-white/80">
                Calculated Requirement
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono">
                {confidenceScore}% Confidence
              </span>
            </div>

            {grossIrrigationRequiredMm !== undefined && grossIrrigationRequiredMm > 0 ? (
              <div className="space-y-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-xs text-white/70">Application Depth:</span>
                  <span className="text-2xl font-black font-mono text-emerald-300">
                    {grossIrrigationRequiredMm} <span className="text-xs font-sans text-white/70">mm</span>
                  </span>
                </div>

                {estimatedTotalVolumeM3 !== undefined && (
                  <div className="flex items-baseline justify-between border-t border-white/10 pt-2">
                    <span className="text-xs text-white/70">Estimated Volume:</span>
                    <span className="text-lg font-black font-mono text-white">
                      {estimatedTotalVolumeM3.toLocaleString()} <span className="text-xs font-sans text-white/70">m³</span>
                    </span>
                  </div>
                )}

                {estimatedTotalLiters !== undefined && (
                  <div className="flex items-baseline justify-between border-t border-white/10 pt-2">
                    <span className="text-xs text-white/70">Total Liters:</span>
                    <span className="text-base font-bold font-mono text-white/90">
                      ~{(estimatedTotalLiters / 1000).toFixed(0)}k <span className="text-xs font-sans text-white/70">Liters</span>
                    </span>
                  </div>
                )}

                {estimatedPumpHours !== undefined && (
                  <div className="flex items-baseline justify-between border-t border-white/10 pt-2">
                    <span className="text-xs text-white/70">Est. Pump Runtime:</span>
                    <span className="text-sm font-bold font-mono text-amber-300">
                      ~{estimatedPumpHours} <span className="text-xs font-sans text-white/70">hours (5HP)</span>
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-4 space-y-1">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <div className="text-sm font-bold text-white">No Water Deficit</div>
                <p className="text-xs text-white/70">
                  Soil hydration is balanced with current weather patterns.
                </p>
              </div>
            )}

            {/* Expert Mode Telemetry Footnote */}
            {isExpertMode && (
              <div className="pt-3 border-t border-white/10 text-[11px] text-white/70 space-y-1 font-mono">
                <div>ET₀ Reference: <span className="text-white font-bold">{evapotranspirationMmDay || 4.2} mm/day</span></div>
                <div>Crop Kc ({cropName}): <span className="text-white font-bold">{cropCoefficientKc || 1.15}</span></div>
                <div>Crop Need (ETc): <span className="text-white font-bold">{cropWaterNeedMmDay || 4.8} mm/day</span></div>
              </div>
            )}
          </div>

          {/* Data Freshness & Stale Alert */}
          {dataFreshness?.isStale && (
            <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-200 text-xs flex items-center gap-2">
              <Clock className="w-4 h-4 flex-shrink-0 text-amber-400" />
              <span>{dataFreshness.staleReason}</span>
            </div>
          )}

          {/* Primary Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={onViewPlan}
              className="px-4 py-3 bg-white hover:bg-emerald-50 text-[#1b2e1b] font-bold text-xs rounded-2xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-[#2e7d32]" />
              <span>View Plan</span>
            </button>

            <button
              onClick={() => onAskCroperX && onAskCroperX('Should I water my field?')}
              className="px-4 py-3 bg-emerald-600/40 hover:bg-emerald-600/60 border border-emerald-400/40 text-white font-bold text-xs rounded-2xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Bot className="w-4 h-4 text-emerald-300" />
              <span>Ask CroperX</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
