import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  type LucideIcon, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  Info,
  ShieldAlert,
  HelpCircle
} from 'lucide-react';
import { 
  PredictiveRiskLevel, 
  PredictionConfidence, 
  Farmer5PartExplanation 
} from '../../types/intelligence/farmIntelligenceTypes';

interface PredictiveRiskCardProps {
  id: string;
  title: string;
  icon: LucideIcon;
  iconBgColor: string;
  iconColor: string;
  status: PredictiveRiskLevel;
  explanation: Farmer5PartExplanation;
  confidence: PredictionConfidence;
  isExpertMode?: boolean;
  metricBadge?: string;
  onNavigateTab?: (tabId: string) => void;
}

export const PredictiveRiskCard: React.FC<PredictiveRiskCardProps> = ({
  id,
  title,
  icon: Icon,
  iconBgColor,
  iconColor,
  status,
  explanation,
  confidence,
  isExpertMode = false,
  metricBadge,
  onNavigateTab
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const getStatusBadge = () => {
    switch (status) {
      case 'CRITICAL':
        return {
          bg: 'bg-rose-100 text-rose-800 border-rose-200',
          label: '🔴 Critical Risk',
          border: 'border-rose-300'
        };
      case 'HIGH':
        return {
          bg: 'bg-amber-100 text-amber-900 border-amber-300',
          label: '🔴 High Risk',
          border: 'border-amber-300'
        };
      case 'MODERATE':
        return {
          bg: 'bg-yellow-100 text-yellow-900 border-yellow-200',
          label: '🟡 Moderate Risk',
          border: 'border-yellow-200'
        };
      case 'LOW':
      default:
        return {
          bg: 'bg-emerald-100 text-emerald-900 border-emerald-200',
          label: '🟢 Low Risk',
          border: 'border-[#c8e6c9]'
        };
    }
  };

  const badge = getStatusBadge();

  return (
    <div className={`bg-white rounded-3xl border ${badge.border} shadow-sm hover:shadow-md transition-all overflow-hidden p-5 sm:p-6 space-y-4`}>
      {/* Card Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-2xl ${iconBgColor} flex items-center justify-center shadow-xs shrink-0`}>
            <Icon className={`w-6 h-6 ${iconColor}`} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-serif font-bold text-base sm:text-lg text-[#1b2e1b]">
                {title}
              </h4>
              {metricBadge && (
                <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-md bg-gray-100 text-gray-700">
                  {metricBadge}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-600 line-clamp-2 mt-0.5">
              {explanation.what}
            </p>
          </div>
        </div>

        {/* Status Pill */}
        <span className={`text-[11px] font-bold px-3 py-1 rounded-full border shrink-0 ${badge.bg}`}>
          {badge.label}
        </span>
      </div>

      {/* 5-Part Farmer Explanation Grid */}
      <div className="p-4 rounded-2xl bg-[#f8fcf8] border border-[#c8e6c9]/70 space-y-3">
        {/* WHAT MAY HAPPEN */}
        <div className="space-y-0.5">
          <span className="text-[10px] font-black uppercase tracking-wider text-gray-500">
            What may happen?
          </span>
          <p className="text-xs font-semibold text-gray-900">
            {explanation.what}
          </p>
        </div>

        {/* WHY */}
        <div className="space-y-0.5">
          <span className="text-[10px] font-black uppercase tracking-wider text-[#2e7d32]">
            Why?
          </span>
          <p className="text-xs text-gray-700">
            {explanation.why}
          </p>
        </div>

        {/* WHAT SHOULD I DO & WHEN */}
        <div className="pt-2 border-t border-gray-200/80 grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="space-y-0.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800">
              What should I do?
            </span>
            <p className="text-xs font-bold text-gray-900">
              {explanation.action}
            </p>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-gray-500">
              When?
            </span>
            <p className="text-xs font-medium text-gray-700">
              {explanation.when}
            </p>
          </div>
        </div>

        {/* WHAT TO AVOID */}
        {explanation.avoid && (
          <div className="pt-2 border-t border-gray-200/80 space-y-0.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-rose-700">
              What to avoid?
            </span>
            <p className="text-xs text-gray-600">
              {explanation.avoid}
            </p>
          </div>
        )}
      </div>

      {/* Expert Mode Telemetry & Confidence Drawer */}
      <div className="pt-1">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between text-xs text-gray-600 hover:text-gray-900 font-semibold py-1 transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#2e7d32]" />
            <span>{isExpertMode ? 'Telemetry & Confidence Breakdown' : 'Confidence & Data Signals'}</span>
          </span>
          <div className="flex items-center gap-1.5 text-[11px] text-gray-500">
            <span className="font-mono font-bold text-[#2e7d32]">{confidence.score}% Confidence</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </div>
        </button>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden pt-2"
            >
              <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs font-mono space-y-2 text-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Confidence Level:</span>
                  <span className="font-bold text-[#2e7d32]">{confidence.level} ({confidence.score}%)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Data Availability:</span>
                  <span className="font-bold text-gray-800">{confidence.dataAvailability}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Prediction Horizon:</span>
                  <span className="font-bold text-gray-800">{confidence.predictionHorizon}</span>
                </div>

                {explanation.expertDetail && (
                  <div className="pt-2 border-t border-gray-200">
                    <span className="text-[10px] text-gray-500 block uppercase">Technical Telemetry Metrics:</span>
                    <p className="text-[11px] text-emerald-900 font-bold mt-0.5">
                      {explanation.expertDetail}
                    </p>
                  </div>
                )}

                <div className="pt-1.5 border-t border-gray-200">
                  <span className="text-[10px] text-gray-500 block uppercase">Supporting Signals:</span>
                  <ul className="list-disc list-inside text-[11px] text-gray-600 space-y-0.5 mt-1">
                    {confidence.supportingSignals.map((sig, sIdx) => (
                      <li key={sIdx}>{sig}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Action Navigation Button */}
      {explanation.navTab && onNavigateTab && (
        <button
          type="button"
          onClick={() => onNavigateTab(explanation.navTab!)}
          className="w-full py-2.5 px-4 rounded-2xl bg-[#e8f5e9] hover:bg-[#c8e6c9] text-[#2e7d32] font-bold text-xs flex items-center justify-center gap-2 transition-all min-h-[44px]"
        >
          <span>{explanation.navLabel || 'Open Linked Module'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
