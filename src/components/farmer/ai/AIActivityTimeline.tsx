import React from 'react';
import {
  Clock,
  Sparkles,
  Bot,
  AlertTriangle,
  CheckCircle2,
  Database,
  ArrowUpRight
} from 'lucide-react';
import { AIAgentInteraction } from '../../../types';

interface AIActivityTimelineProps {
  interactions: AIAgentInteraction[];
  memoriesCount: number;
}

export const AIActivityTimeline: React.FC<AIActivityTimelineProps> = ({
  interactions,
  memoriesCount
}) => {
  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 space-y-4 shadow-xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-400" />
          <h3 className="text-sm font-bold text-white">AI Advisory Activity Log</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <Database className="w-3.5 h-3.5 text-teal-400" />
            <strong className="text-white">{memoriesCount}</strong> facts retained
          </span>
        </div>
      </div>

      {interactions.length === 0 ? (
        <div className="text-center py-8 text-slate-500 text-xs">
          <Bot className="w-8 h-8 mx-auto mb-2 opacity-40 text-emerald-400" />
          <p>No prior AI consultations recorded for this profile.</p>
          <p className="text-[11px] text-slate-600 mt-0.5">
            Use the chat box above to initiate an automated field diagnosis.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {interactions.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-emerald-500/30 transition-all text-xs space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 font-bold text-[10px] border border-emerald-500/20">
                    {item.intent}
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {new Date(item.createdAt).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-emerald-400 font-bold">
                    {item.confidence}% Match
                  </span>
                  {item.escalated && (
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                      Escalated
                    </span>
                  )}
                </div>
              </div>

              <div>
                <p className="text-slate-300 font-medium line-clamp-1">
                  &ldquo;{item.inputSummary}&rdquo;
                </p>
                <p className="text-slate-400 text-[11px] mt-1 line-clamp-2">
                  {item.outputSummary}
                </p>
              </div>

              {item.recommendedActions && item.recommendedActions.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {item.recommendedActions.map((act, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700/50"
                    >
                      {act}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
