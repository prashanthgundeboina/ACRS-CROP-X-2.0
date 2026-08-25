import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  Clock, 
  AlertOctagon, 
  Sliders, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles 
} from 'lucide-react';
import { RiskFactorEvaluation, CropRiskLevel } from '../../types/cropRisk';

interface RiskDetailsModalProps {
  factor: RiskFactorEvaluation | null;
  isOpen: boolean;
  onClose: () => void;
  isExpertMode: boolean;
  onSelectTab: (tab: string) => void;
}

export const RiskDetailsModal: React.FC<RiskDetailsModalProps> = ({
  factor,
  isOpen,
  onClose,
  isExpertMode,
  onSelectTab
}) => {
  if (!isOpen || !factor) return null;

  const getLevelBadge = (level: CropRiskLevel) => {
    switch (level) {
      case 'HIGH':
        return {
          pill: 'bg-rose-50 text-rose-800 border-rose-200',
          dot: 'bg-rose-500',
          border: 'border-rose-300',
          btn: 'bg-rose-600 hover:bg-rose-700 text-white'
        };
      case 'MODERATE':
        return {
          pill: 'bg-amber-50 text-amber-800 border-amber-200',
          dot: 'bg-amber-500',
          border: 'border-amber-200',
          btn: 'bg-amber-600 hover:bg-amber-700 text-white'
        };
      case 'WATCH':
        return {
          pill: 'bg-blue-50 text-blue-800 border-blue-200',
          dot: 'bg-blue-500',
          border: 'border-blue-200',
          btn: 'bg-blue-600 hover:bg-blue-700 text-white'
        };
      case 'LOW':
      default:
        return {
          pill: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          dot: 'bg-emerald-500',
          border: 'border-[#c8e6c9]',
          btn: 'bg-[#2e7d32] hover:bg-[#1b5e20] text-white'
        };
    }
  };

  const badgeStyle = getLevelBadge(factor.level);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-3xl border border-[#c8e6c9] shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-6 border-b border-[#c8e6c9] flex items-center justify-between bg-[#f8fcf8]">
            <div className="flex items-center gap-3">
              <div className="text-3xl p-2 rounded-2xl bg-white border border-[#c8e6c9] shadow-sm">
                {factor.icon}
              </div>
              <div>
                <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#1b2e1b]">
                  {factor.name}
                </h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${badgeStyle.pill}`}>
                    <span className={`w-2 h-2 rounded-full ${badgeStyle.dot}`} />
                    {factor.levelLabel}
                  </span>
                  <span className="text-xs text-gray-500 font-mono">
                    Score: {factor.score}/100
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-2xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="p-6 overflow-y-auto space-y-5">
            {/* 1. What is happening */}
            <div className="p-4 rounded-2xl bg-[#f8fcf8] border border-[#c8e6c9] space-y-1.5">
              <span className="text-[10px] uppercase font-black tracking-wider text-[#2e7d32] flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" /> What is happening?
              </span>
              <p className="text-sm font-semibold text-gray-900 leading-snug">
                {factor.what}
              </p>
            </div>

            {/* 2. Why signals */}
            <div className="space-y-2">
              <span className="text-xs uppercase font-black tracking-wider text-gray-600 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#2e7d32]" /> Contributing Environmental Signals
              </span>
              <div className="space-y-2">
                {factor.signals.map((sig) => (
                  <div
                    key={sig.id}
                    className="p-3 rounded-2xl bg-white border border-gray-200 flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-0.5">
                      <span className="font-bold text-gray-800 block">{sig.name}</span>
                      <span className="text-gray-600">{sig.description}</span>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <span className="font-mono font-bold text-gray-900 block">{sig.currentValue}</span>
                      <span className="text-[10px] text-gray-400 font-mono">Limit: {sig.threshold}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Action & Timing */}
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs uppercase font-black tracking-wider text-[#1b5e20] flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Recommended Preventive Action
                </span>
                <span className="text-xs font-bold text-emerald-800 bg-white/90 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {factor.when}
                </span>
              </div>
              <p className="text-sm font-bold text-[#1b5e20] leading-snug">
                {factor.action}
              </p>
            </div>

            {/* 4. What to avoid */}
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 space-y-1">
              <span className="text-xs uppercase font-black tracking-wider text-rose-700 flex items-center gap-1.5">
                <AlertOctagon className="w-4 h-4 text-rose-600" /> Critical Caution (What to Avoid)
              </span>
              <p className="text-xs text-rose-900 leading-relaxed font-semibold">
                {factor.avoid}
              </p>
            </div>

            {/* 5. Expert Telemetry Table */}
            {factor.expertMetrics && (
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <span className="text-xs uppercase font-black tracking-wider text-gray-600 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-[#2e7d32]" /> Live Farm Telemetry Matrix
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-2 gap-2 text-xs">
                  {Object.entries(factor.expertMetrics).map(([k, v]) => (
                    <div key={k} className="p-3 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-between">
                      <span className="text-gray-500 font-medium">{k}</span>
                      <span className="font-mono font-bold text-gray-900">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 sm:p-6 border-t border-[#c8e6c9] bg-[#f8fcf8] flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl text-xs font-bold text-gray-600 hover:bg-gray-200/60 transition-colors"
            >
              Close
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onSelectTab(factor.targetTab);
              }}
              className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-md flex items-center gap-2 min-h-[44px] ${badgeStyle.btn}`}
            >
              <span>{factor.targetTabLabel}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
