import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Brain, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Clock, 
  XCircle, 
  Activity, 
  Layers, 
  HelpCircle,
  type LucideIcon
} from 'lucide-react';
import { FarmAgentStatus, AgentRecommendation } from '../../types/autonomous/farmAutonomousTypes';

interface AgentReasoningModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentStatus: FarmAgentStatus | null;
  onExecuteAction?: (recommendation: AgentRecommendation) => void;
}

export const AgentReasoningModal: React.FC<AgentReasoningModalProps> = ({
  isOpen,
  onClose,
  agentStatus,
  onExecuteAction
}) => {
  if (!isOpen || !agentStatus) return null;

  const rec = agentStatus.currentRecommendation;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md z-10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                <Brain className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Agent Intelligence Deep-Dive
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {agentStatus.confidenceScore}% Confidence
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-0.5">
                  {agentStatus.name}
                </h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Agent Role */}
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200/70 dark:border-slate-700/60">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                Specialized Agronomic Role
              </span>
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                {agentStatus.role}
              </p>
            </div>

            {/* 6-Part Structured Explainability Framework */}
            {rec ? (
              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-emerald-500" /> Explainable Decision Framework
                </h4>

                {/* 1. WHAT */}
                <div className="bg-emerald-50/60 dark:bg-emerald-950/30 rounded-2xl p-4 border border-emerald-200/80 dark:border-emerald-800/40 space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 1. What is the Recommendation?
                  </span>
                  <p className="text-sm text-slate-800 dark:text-slate-200 font-semibold leading-relaxed">
                    {rec.headline}
                  </p>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                    {rec.what}
                  </p>
                </div>

                {/* 2. WHY */}
                <div className="bg-sky-50/60 dark:bg-sky-950/30 rounded-2xl p-4 border border-sky-200/80 dark:border-sky-800/40 space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-sky-800 dark:text-sky-300 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5" /> 2. Why? (Telemetry & Agronomic Rationale)
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    {rec.why}
                  </p>
                </div>

                {/* 3. ACTION */}
                <div className="bg-indigo-50/60 dark:bg-indigo-950/30 rounded-2xl p-4 border border-indigo-200/80 dark:border-indigo-800/40 space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-800 dark:text-indigo-300 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5" /> 3. Primary Action
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    Recommended Execution: <strong className="text-indigo-900 dark:text-indigo-200">{rec.actionText}</strong> (Authorization Level: {rec.requiredPermission})
                  </p>
                </div>

                {/* 4. WHEN */}
                <div className="bg-amber-50/60 dark:bg-amber-950/30 rounded-2xl p-4 border border-amber-200/80 dark:border-amber-800/40 space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" /> 4. When to Execute?
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    {rec.when}
                  </p>
                </div>

                {/* 5. WHAT TO AVOID */}
                <div className="bg-rose-50/60 dark:bg-rose-950/30 rounded-2xl p-4 border border-rose-200/80 dark:border-rose-800/40 space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                    <XCircle className="w-3.5 h-3.5" /> 5. What to Avoid?
                  </span>
                  <p className="text-xs text-rose-950 dark:text-rose-200 leading-relaxed font-medium">
                    {rec.whatToAvoid}
                  </p>
                </div>

                {/* 6. CONFIDENCE & TELEMETRY */}
                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5" /> 6. Decision Confidence & Contributing Telemetry
                    </span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      {rec.confidence}% Deterministic Score
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {Object.entries(rec.contributingTelemetry).map(([key, val]) => (
                      <div key={key} className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800 flex flex-col">
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </span>
                        <span className="font-bold text-slate-900 dark:text-white mt-0.5">
                          {typeof val === 'number' ? val.toLocaleString() : String(val)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500">No active recommendation available.</p>
            )}
          </div>

          {/* Footer actions */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3 bg-slate-50/50 dark:bg-slate-900/50">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Close
            </button>
            {rec && onExecuteAction && (
              <button
                onClick={() => {
                  onExecuteAction(rec);
                  onClose();
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
              >
                {rec.actionText}
              </button>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
