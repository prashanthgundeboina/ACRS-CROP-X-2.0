import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Activity, 
  Droplets, 
  Sprout, 
  CloudRain, 
  Bug, 
  ShieldCheck, 
  AlertTriangle,
  Info,
  Sparkles
} from 'lucide-react';
import { SimpleExpertToggle } from '../ui/SimpleExpertToggle';

export interface HealthScoreBreakdown {
  totalScore: number; // 0-100
  statusText: string; // "Your farm is looking good." | "Your farm needs some attention." | "Your farm needs immediate attention."
  statusVariant: 'good' | 'warning' | 'critical';
  categories: {
    soil: { score: number; maxScore: number; status: string; detail: string; expertData?: string };
    water: { score: number; maxScore: number; status: string; detail: string; expertData?: string };
    cropHealth: { score: number; maxScore: number; status: string; detail: string; expertData?: string };
    weather: { score: number; maxScore: number; status: string; detail: string; expertData?: string };
    pestRisk: { score: number; maxScore: number; status: string; detail: string; expertData?: string };
  };
}

interface FarmHealthScoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  breakdown: HealthScoreBreakdown;
  isExpertMode: boolean;
  onToggleExpertMode: (expert: boolean) => void;
}

export const FarmHealthScoreModal: React.FC<FarmHealthScoreModalProps> = ({
  isOpen,
  onClose,
  breakdown,
  isExpertMode,
  onToggleExpertMode,
}) => {
  if (!isOpen) return null;

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-500 bg-emerald-50 border-emerald-200';
    if (score >= 55) return 'text-amber-500 bg-amber-50 border-amber-200';
    return 'text-rose-500 bg-rose-50 border-rose-200';
  };

  const getBarColor = (score: number, max: number) => {
    const ratio = score / max;
    if (ratio >= 0.8) return 'bg-emerald-500';
    if (ratio >= 0.55) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  const categoryItems = [
    {
      key: 'cropHealth',
      title: 'Crop Health',
      icon: Sprout,
      data: breakdown.categories.cropHealth,
    },
    {
      key: 'soil',
      title: 'Soil Nutrient Balance',
      icon: Activity,
      data: breakdown.categories.soil,
    },
    {
      key: 'water',
      title: 'Water & Soil Moisture',
      icon: Droplets,
      data: breakdown.categories.water,
    },
    {
      key: 'weather',
      title: 'Weather Safety',
      icon: CloudRain,
      data: breakdown.categories.weather,
    },
    {
      key: 'pestRisk',
      title: 'Pest & Disease Risk',
      icon: Bug,
      data: breakdown.categories.pestRisk,
    },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-3xl border border-[#c8e6c9] shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-6 bg-gradient-to-br from-[#1b2e1b] to-[#2e7d32] text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20">
                <Activity className="w-6 h-6 text-emerald-300" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-emerald-200 text-[10px] font-mono font-bold uppercase tracking-wider mb-1">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>Farm Health Diagnostics</span>
                </div>
                <h2 className="text-xl font-bold font-serif">Farm Health Index Breakdown</h2>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full text-white/80 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar">
            {/* Overall Score Banner */}
            <div className={`p-5 rounded-2xl border flex items-center justify-between gap-4 ${getScoreColor(breakdown.totalScore)}`}>
              <div className="space-y-1">
                <div className="text-xs font-mono font-bold uppercase tracking-wider text-gray-600">
                  Overall Score Rating
                </div>
                <div className="text-xl font-bold font-serif text-gray-900">
                  {breakdown.statusText}
                </div>
                <p className="text-xs text-gray-500 font-sans">
                  Calculated automatically from real-time field sensors, soil tests, and weather telemetry.
                </p>
              </div>

              <div className="text-center shrink-0">
                <div className="text-4xl font-extrabold font-mono tracking-tight">
                  {breakdown.totalScore}
                  <span className="text-sm text-gray-400 font-normal">/100</span>
                </div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mt-0.5">
                  Health Index
                </div>
              </div>
            </div>

            {/* Mode Selector */}
            <div className="flex items-center justify-between bg-gray-50 p-3 rounded-2xl border border-gray-100">
              <span className="text-xs font-medium text-gray-600 flex items-center gap-1.5">
                <Info className="w-4 h-4 text-[#2e7d32]" />
                <span>Toggle Detail Level:</span>
              </span>
              <SimpleExpertToggle
                isExpertMode={isExpertMode}
                onToggle={onToggleExpertMode}
              />
            </div>

            {/* Category Breakdown Bars */}
            <div className="space-y-4">
              <h3 className="text-xs font-mono font-bold text-gray-500 uppercase tracking-wider">
                Factor Analysis Breakdown
              </h3>

              <div className="space-y-3">
                {categoryItems.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <div
                      key={cat.key}
                      className="p-4 bg-gray-50/80 hover:bg-emerald-50/30 rounded-2xl border border-gray-100 transition-all space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 bg-white rounded-xl shadow-xs text-[#2e7d32] border border-emerald-100">
                            <Icon className="w-4 h-4" />
                          </div>
                          <div>
                            <span className="text-sm font-bold text-gray-800 font-serif">
                              {cat.title}
                            </span>
                            <span className="ml-2 text-xs text-gray-500">
                              ({cat.data.status})
                            </span>
                          </div>
                        </div>

                        <div className="font-mono text-sm font-bold text-gray-900">
                          {cat.data.score} <span className="text-xs text-gray-400 font-normal">/ {cat.data.maxScore}</span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${getBarColor(cat.data.score, cat.data.maxScore)}`}
                          style={{ width: `${(cat.data.score / cat.data.maxScore) * 100}%` }}
                        />
                      </div>

                      <p className="text-xs text-gray-600 font-sans">
                        {cat.data.detail}
                      </p>

                      {isExpertMode && cat.data.expertData && (
                        <div className="pt-2 border-t border-gray-200/60 font-mono text-[11px] text-emerald-800 bg-emerald-50/80 p-2 rounded-lg">
                          📊 <strong>Technical Telemetry:</strong> {cat.data.expertData}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Disclaimer */}
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/60 text-[11px] text-amber-900 flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Note:</strong> Score is based strictly on available farm data and live sensor feeds. Unmeasured metrics are omitted without artificial assumptions.
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end shrink-0">
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-[#1b2e1b] hover:bg-[#2e7d32] text-white font-bold text-xs rounded-xl transition-all shadow-md"
            >
              Close Breakdown
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
