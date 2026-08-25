import React from 'react';
import { motion } from 'motion/react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Camera, 
  CloudRain, 
  Droplets, 
  Mic, 
  Sparkles, 
  Clock, 
  WifiOff, 
  Info,
  ChevronRight,
  TrendingUp,
  MapPin,
  Sprout
} from 'lucide-react';
import { OverallCropRiskReport, CropRiskLevel } from '../../types/cropRisk';
import { SimpleExpertToggle } from '../ui/SimpleExpertToggle';
import { FarmerButton } from '../ui/FarmerButton';

interface CropRiskHeroProps {
  report: OverallCropRiskReport;
  isExpertMode: boolean;
  onToggleExpertMode: (expert: boolean) => void;
  onSelectTab: (tab: string) => void;
  onOpenVoiceAI: () => void;
  isOffline?: boolean;
}

export const CropRiskHero: React.FC<CropRiskHeroProps> = ({
  report,
  isExpertMode,
  onToggleExpertMode,
  onSelectTab,
  onOpenVoiceAI,
  isOffline = false
}) => {
  const getLevelStyle = (level: CropRiskLevel) => {
    switch (level) {
      case 'HIGH':
        return {
          bg: 'bg-gradient-to-br from-rose-500 via-rose-600 to-red-700',
          badgeBg: 'bg-white/20 text-white border-white/30',
          icon: AlertTriangle,
          textColor: 'text-white',
          accentColor: 'text-rose-200',
          subBg: 'bg-black/20'
        };
      case 'MODERATE':
        return {
          bg: 'bg-gradient-to-br from-amber-500 via-amber-600 to-orange-700',
          badgeBg: 'bg-white/20 text-white border-white/30',
          icon: AlertTriangle,
          textColor: 'text-white',
          accentColor: 'text-amber-100',
          subBg: 'bg-black/20'
        };
      case 'WATCH':
        return {
          bg: 'bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-800',
          badgeBg: 'bg-white/20 text-white border-white/30',
          icon: ShieldAlert,
          textColor: 'text-white',
          accentColor: 'text-blue-100',
          subBg: 'bg-black/20'
        };
      case 'LOW':
      default:
        return {
          bg: 'bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-900',
          badgeBg: 'bg-white/20 text-white border-white/30',
          icon: ShieldCheck,
          textColor: 'text-white',
          accentColor: 'text-emerald-100',
          subBg: 'bg-black/20'
        };
    }
  };

  const style = getLevelStyle(report.overallLevel);
  const StatusIcon = style.icon;

  return (
    <div className="space-y-6">
      {/* Top Controls Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#2e7d32] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Phase 6 • Early Warning AI
            </span>
            {isOffline && (
              <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                <WifiOff className="w-3 h-3" /> Offline Mode (Cached Data)
              </span>
            )}
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#1b2e1b] mt-1 flex items-center gap-2.5">
            🌱 Predictive Crop Risk & Early Warning
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 font-sans">
            Forecasting emerging pest, disease, weather, and water stresses before visible damage occurs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <SimpleExpertToggle
            isExpert={isExpertMode}
            onToggle={onToggleExpertMode}
          />
        </div>
      </div>

      {/* Hero Decision Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className={`rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden ${style.bg}`}
      >
        {/* Ambient background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 space-y-6">
          {/* Top metadata row */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/15 pb-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
                <StatusIcon className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif font-bold text-lg sm:text-xl tracking-tight">
                    {report.farmName}
                  </span>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-md">
                    {report.cropName}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-white/80 mt-0.5">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Updated: {report.lastUpdated}
                  </span>
                  <span>•</span>
                  <span>Dominant: {report.dominantRiskLabel}</span>
                </div>
              </div>
            </div>

            {/* Risk Status Pill & Score */}
            <div className="flex items-center gap-3">
              {isExpertMode && (
                <div className="text-right">
                  <div className="text-[10px] uppercase font-bold text-white/70">Risk Index</div>
                  <div className="text-2xl font-black font-mono tracking-tight leading-none">
                    {report.overallScore}<span className="text-xs text-white/60 font-normal">/100</span>
                  </div>
                </div>
              )}
              <div className={`px-4 py-2 rounded-2xl font-bold text-sm sm:text-base border backdrop-blur-md shadow-sm flex items-center gap-2 ${style.badgeBg}`}>
                <span>{report.overallStatusLabel}</span>
              </div>
            </div>
          </div>

          {/* Core Plain-English Headline & Explanation */}
          <div className="space-y-2">
            <h3 className="font-serif text-xl sm:text-2xl font-bold leading-snug">
              {report.headline}
            </h3>
            <p className="text-sm sm:text-base text-white/90 leading-relaxed max-w-3xl">
              {report.summary}
            </p>
          </div>

          {/* Expert Telemetry Strip (Visible in Expert Mode) */}
          {isExpertMode && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="p-4 rounded-2xl bg-black/25 backdrop-blur-md border border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs"
            >
              <div>
                <span className="text-white/60 uppercase font-semibold text-[10px] block">Primary Risk Factor</span>
                <span className="font-bold text-white text-sm">{report.dominantRiskLabel}</span>
              </div>
              <div>
                <span className="text-white/60 uppercase font-semibold text-[10px] block">Active Stress Signals</span>
                <span className="font-bold text-white text-sm">
                  {report.rankedFactors.filter(f => f.level === 'HIGH' || f.level === 'MODERATE').length} of 8 Categories
                </span>
              </div>
              <div>
                <span className="text-white/60 uppercase font-semibold text-[10px] block">7-Day Peak Risk</span>
                <span className="font-bold text-white text-sm">
                  {report.sevenDayForecast.reduce((max, d) => Math.max(max, d.overallScore), 0)}/100 ({report.sevenDayForecast.find(d => d.overallLevel === 'HIGH')?.dayName || 'Stable'})
                </span>
              </div>
              <div>
                <span className="text-white/60 uppercase font-semibold text-[10px] block">Sensor Telemetry</span>
                <span className="font-bold text-white text-sm">
                  {isOffline ? 'Cached Data' : 'Live Sync Active'}
                </span>
              </div>
            </motion.div>
          )}

          {/* Quick Action Navigation Bar */}
          <div className="pt-2 border-t border-white/15 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-bold text-white/80 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Recommended Prevention Routes:
            </span>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => onSelectTab('diagnostics')}
                className="px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 active:bg-white/30 text-white text-xs font-bold transition-all border border-white/20 flex items-center gap-1.5 shadow-sm min-h-[44px]"
              >
                <Camera className="w-4 h-4" />
                <span>📷 Scan Crop</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectTab('weather')}
                className="px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 active:bg-white/30 text-white text-xs font-bold transition-all border border-white/20 flex items-center gap-1.5 shadow-sm min-h-[44px]"
              >
                <CloudRain className="w-4 h-4" />
                <span>🌦️ View Weather</span>
              </button>

              <button
                type="button"
                onClick={() => onSelectTab('irrigation')}
                className="px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 active:bg-white/30 text-white text-xs font-bold transition-all border border-white/20 flex items-center gap-1.5 shadow-sm min-h-[44px]"
              >
                <Droplets className="w-4 h-4" />
                <span>💧 Check Water</span>
              </button>

              <button
                type="button"
                onClick={onOpenVoiceAI}
                className="px-3.5 py-2 rounded-xl bg-white text-[#1b2e1b] hover:bg-white/90 active:bg-white/80 text-xs font-black transition-all shadow-md flex items-center gap-1.5 min-h-[44px]"
              >
                <Mic className="w-4 h-4 text-emerald-600" />
                <span>🎙️ Ask CroperX</span>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
