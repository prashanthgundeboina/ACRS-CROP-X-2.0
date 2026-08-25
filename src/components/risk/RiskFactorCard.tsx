import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  ChevronDown, 
  ChevronUp, 
  ChevronRight, 
  ArrowRight, 
  ShieldAlert, 
  Clock, 
  AlertOctagon, 
  Sliders, 
  Volume2, 
  VolumeX,
  Sparkles
} from 'lucide-react';
import { RiskFactorEvaluation, CropRiskLevel } from '../../types/cropRisk';

interface RiskFactorCardProps {
  factor: RiskFactorEvaluation;
  isExpertMode: boolean;
  onSelectTab: (tab: string) => void;
  onOpenDetailsModal?: (factor: RiskFactorEvaluation) => void;
  isMuted?: boolean;
  onToggleMute?: () => void;
}

export const RiskFactorCard: React.FC<RiskFactorCardProps> = ({
  factor,
  isExpertMode,
  onSelectTab,
  onOpenDetailsModal,
  isMuted = false,
  onToggleMute
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getLevelBadge = (level: CropRiskLevel) => {
    switch (level) {
      case 'HIGH':
        return {
          bg: 'bg-rose-50 text-rose-800 border-rose-200',
          dot: 'bg-rose-500',
          border: 'border-rose-300 hover:border-rose-400',
          accent: 'text-rose-600',
          btnBg: 'bg-rose-600 hover:bg-rose-700 text-white'
        };
      case 'MODERATE':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
          dot: 'bg-amber-500',
          border: 'border-amber-200 hover:border-amber-300',
          accent: 'text-amber-600',
          btnBg: 'bg-amber-600 hover:bg-amber-700 text-white'
        };
      case 'WATCH':
        return {
          bg: 'bg-blue-50 text-blue-800 border-blue-200',
          dot: 'bg-blue-500',
          border: 'border-blue-200 hover:border-blue-300',
          accent: 'text-blue-600',
          btnBg: 'bg-blue-600 hover:bg-blue-700 text-white'
        };
      case 'LOW':
      default:
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          dot: 'bg-emerald-500',
          border: 'border-[#c8e6c9] hover:border-emerald-300',
          accent: 'text-emerald-600',
          btnBg: 'bg-[#2e7d32] hover:bg-[#1b5e20] text-white'
        };
    }
  };

  const style = getLevelBadge(factor.level);

  return (
    <div
      className={`rounded-3xl border bg-white shadow-sm transition-all duration-200 overflow-hidden flex flex-col justify-between ${
        factor.level === 'HIGH' ? 'ring-2 ring-rose-300/60' : ''
      } ${style.border}`}
    >
      <div className="p-5 sm:p-6 space-y-4">
        {/* Header: Category Icon, Name, Risk Level & Score */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="text-2xl sm:text-3xl p-2.5 rounded-2xl bg-[#f8fcf8] border border-[#c8e6c9]/70 shadow-inner flex items-center justify-center">
              <span>{factor.icon}</span>
            </div>
            <div>
              <h3 className="font-serif font-bold text-base sm:text-lg text-[#1b2e1b] flex items-center gap-2">
                {factor.name}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${style.bg}`}>
                  <span className={`w-2 h-2 rounded-full ${style.dot}`} />
                  {factor.levelLabel}
                </span>
                {isMuted && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-semibold flex items-center gap-1">
                    <VolumeX className="w-3 h-3" /> Muted
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isExpertMode && (
              <div className="text-right">
                <div className="text-[10px] font-bold text-gray-500 uppercase">Score</div>
                <div className="text-lg font-black font-mono text-[#1b2e1b]">
                  {factor.score}<span className="text-[10px] text-gray-400 font-normal">/100</span>
                </div>
              </div>
            )}
            {onToggleMute && (
              <button
                type="button"
                onClick={onToggleMute}
                title={isMuted ? "Unmute alerts for this category" : "Mute alerts for this category"}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-amber-600" /> : <Volume2 className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>

        {/* 1. WHAT IS HAPPENING? */}
        <div className="p-3.5 rounded-2xl bg-[#f8fcf8] border border-[#e0f0e0] space-y-1">
          <span className="text-[10px] uppercase font-black tracking-wider text-[#2e7d32] flex items-center gap-1">
            <Info className="w-3 h-3" /> What is happening?
          </span>
          <p className="text-xs sm:text-sm font-semibold text-gray-800 leading-snug">
            {factor.what}
          </p>
        </div>

        {/* 2. WHY? (Contributing factors) */}
        <div className="space-y-1.5">
          <span className="text-[10px] uppercase font-black tracking-wider text-gray-500 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#2e7d32]" /> Why? (Contributing Signals)
          </span>
          <ul className="space-y-1 text-xs text-gray-600">
            {factor.why.map((reason, idx) => (
              <li key={idx} className="flex items-start gap-1.5 leading-relaxed">
                <span className="text-[#2e7d32] font-bold">•</span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 3. WHAT SHOULD I DO? & WHEN */}
        <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] uppercase font-black tracking-wider text-[#1b5e20] flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Recommended Action
            </span>
            <span className="text-[10px] font-bold text-emerald-800 bg-white/80 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
              <Clock className="w-3 h-3" /> {factor.when}
            </span>
          </div>
          <p className="text-xs sm:text-sm font-bold text-[#1b5e20] leading-snug">
            {factor.action}
          </p>
        </div>

        {/* 4. WHAT TO AVOID */}
        <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-50/60 border border-rose-100 text-xs text-rose-900">
          <AlertOctagon className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-[10px] uppercase tracking-wider text-rose-700 block">
              What to Avoid:
            </span>
            <span className="text-xs text-rose-900 leading-relaxed font-medium">
              {factor.avoid}
            </span>
          </div>
        </div>

        {/* Expert Telemetry Breakdown & Collapsible Details */}
        {isExpertMode && factor.expertMetrics && (
          <div className="pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full flex items-center justify-between text-xs font-bold text-gray-600 hover:text-gray-900 py-1"
            >
              <span className="flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-[#2e7d32]" />
                Sensor & Biological Telemetry ({Object.keys(factor.expertMetrics).length})
              </span>
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 grid grid-cols-2 gap-2 text-xs pt-1"
                >
                  {Object.entries(factor.expertMetrics).map(([key, val]) => (
                    <div key={key} className="p-2.5 rounded-xl bg-[#f8fcf8] border border-gray-200">
                      <span className="text-[10px] text-gray-500 block font-semibold">{key}</span>
                      <span className="font-mono font-bold text-gray-900 text-xs">{val}</span>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Footer Action Button */}
      <div className="p-4 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between gap-3">
        {onOpenDetailsModal && (
          <button
            type="button"
            onClick={() => onOpenDetailsModal(factor)}
            className="text-xs font-bold text-gray-600 hover:text-[#2e7d32] transition-colors flex items-center gap-1"
          >
            <span>Explain Risk</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        )}

        <button
          type="button"
          onClick={() => onSelectTab(factor.targetTab)}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-2 ml-auto min-h-[44px] ${style.btnBg}`}
        >
          <span>{factor.targetTabLabel}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
