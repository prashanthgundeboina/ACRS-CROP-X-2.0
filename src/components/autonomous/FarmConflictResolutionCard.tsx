import React from 'react';
import { motion } from 'motion/react';
import { 
  GitMerge, 
  ShieldCheck, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Scale, 
  Sparkles 
} from 'lucide-react';
import { ConflictResolution } from '../../types/autonomous/farmAutonomousTypes';

interface FarmConflictResolutionCardProps {
  conflicts: ConflictResolution[];
  onAcceptResolution?: (resolution: ConflictResolution) => void;
}

export const FarmConflictResolutionCard: React.FC<FarmConflictResolutionCardProps> = ({
  conflicts,
  onAcceptResolution
}) => {
  if (!conflicts || conflicts.length === 0) return null;

  return (
    <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-indigo-500/30 shadow-xl space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            <GitMerge className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Deterministic Arbitration
              </span>
              <span className="text-xs text-indigo-200/60">{conflicts.length} Conflict(s) Resolved</span>
            </div>
            <h3 className="text-xl font-bold tracking-tight text-white mt-0.5">
              Farm AI Supervisor Conflict Arbitration
            </h3>
          </div>
        </div>

        <div className="px-3 py-1 bg-black/40 rounded-full text-xs font-semibold text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
          <Scale className="w-3.5 h-3.5" />
          <span>Hierarchy-Enforced</span>
        </div>
      </div>

      <div className="space-y-4">
        {conflicts.map((conf) => (
          <div
            key={conf.id}
            className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 space-y-4"
          >
            {/* Competing Agents Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {conf.competingAgents.map((agent) => {
                const isWinner = agent.agentId === conf.winningAgent;

                return (
                  <div
                    key={agent.agentId}
                    className={`p-4 rounded-xl border flex flex-col justify-between space-y-2 ${
                      isWinner
                        ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-100 ring-1 ring-emerald-500/30'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 opacity-75'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                        {isWinner ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Winning Rule: {agent.agentName}</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-slate-400">Competing Signal: {agent.agentName}</span>
                          </>
                        )}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/40 border border-white/10">
                        Priority Rank #{agent.priorityRank}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed">{agent.advice}</p>
                  </div>
                );
              })}
            </div>

            {/* Arbitration Rationale */}
            <div className="bg-black/30 p-4 rounded-xl border border-white/5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> Supervisor Resolution Rationale
                </span>
                <span className="text-[11px] text-slate-400">
                  {conf.priorityHierarchyApplied}
                </span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                {conf.deterministicReason}
              </p>
            </div>

            {/* Final Supervised Action */}
            <div className="bg-emerald-950/30 p-4 rounded-xl border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  Final Coordinated Directive
                </span>
                <h4 className="text-sm font-bold text-white">
                  {conf.finalSupervisedRecommendation.headline}
                </h4>
                <p className="text-xs text-emerald-200/80">
                  {conf.finalSupervisedRecommendation.what}
                </p>
              </div>

              {onAcceptResolution && (
                <button
                  onClick={() => onAcceptResolution(conf)}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold transition-colors shadow-md flex items-center gap-1.5 whitespace-nowrap"
                >
                  <span>Accept Directive</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
