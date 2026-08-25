import React, { useState } from 'react';
import { 
  BookOpen, 
  Brain, 
  CheckCircle, 
  XCircle, 
  Sliders, 
  EyeOff, 
  History, 
  Sparkles,
  ChevronRight,
  TrendingUp,
  Plus
} from 'lucide-react';
import { farmDecisionHistoryService } from '../../services/resources/farmDecisionHistoryService';
import { farmLearningService } from '../../services/resources/farmLearningService';
import { FarmDecisionRecord, FarmLearningPattern } from '../../types/resources/farmResourceTypes';

interface DecisionHistoryAndLearningCardProps {
  onOpenAskCroperX?: (question: string) => void;
}

export const DecisionHistoryAndLearningCard: React.FC<DecisionHistoryAndLearningCardProps> = ({
  onOpenAskCroperX
}) => {
  const [activeTab, setActiveTab] = useState<'decisions' | 'learning'>('decisions');
  const [decisions, setDecisions] = useState<FarmDecisionRecord[]>(() => farmDecisionHistoryService.getDecisions());
  const [patterns, setPatterns] = useState<FarmLearningPattern[]>(() => farmLearningService.getLearningPatterns());

  const getActionBadge = (action: FarmDecisionRecord['farmerAction']) => {
    switch (action) {
      case 'Accepted':
        return (
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Accepted</span>
          </span>
        );
      case 'Modified':
        return (
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1">
            <Sliders className="w-3.5 h-3.5" />
            <span>Modified</span>
          </span>
        );
      case 'Rejected':
        return (
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-red-500/20 text-red-300 border border-red-500/30 flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5" />
            <span>Rejected</span>
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-700 text-slate-400 flex items-center gap-1">
            <EyeOff className="w-3.5 h-3.5" />
            <span>Ignored</span>
          </span>
        );
    }
  };

  return (
    <div id="decision-history-learning-card" className="bg-[#111C15]/90 border border-[#2E4A38]/50 rounded-2xl p-5 md:p-6 backdrop-blur-md shadow-xl">
      {/* Header with Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#2E4A38]/40">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-violet-500/10 border border-violet-500/30 text-violet-400">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg md:text-xl font-bold text-slate-100">Decision History & Farm Learning</h2>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-violet-500/20 text-violet-300 border border-violet-500/30">
                Empirical Memory
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Tracking farmer actions against AI recommendations and accumulating field-calibrated heuristics
            </p>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center bg-[#18291F] p-1 rounded-xl border border-[#2E4A38]">
          <button
            onClick={() => setActiveTab('decisions')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'decisions' 
                ? 'bg-violet-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Decision Log ({decisions.length})
          </button>
          <button
            onClick={() => setActiveTab('learning')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'learning' 
                ? 'bg-violet-600 text-white shadow-md' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Learned Insights ({patterns.length})
          </button>
        </div>
      </div>

      {/* Decisions Log View */}
      {activeTab === 'decisions' && (
        <div className="mt-5 space-y-3">
          {decisions.map(dec => (
            <div 
              key={dec.id}
              className="p-4 rounded-xl bg-[#18291F]/50 border border-[#2E4A38]/40 text-xs space-y-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-[#2E4A38]/30">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-100 text-sm">{dec.recommendationTitle}</span>
                  <span className="text-slate-400">• {dec.date} at {dec.timestamp}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400">Confidence: {dec.confidencePercent}%</span>
                  {getActionBadge(dec.farmerAction)}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* 1. What CroperX Recommended */}
                <div className="p-2.5 rounded-lg bg-[#111C15]/70 border border-[#2E4A38]/30">
                  <div className="text-[11px] font-bold text-slate-400 mb-1">CroperX Reason</div>
                  <div className="text-slate-200 leading-relaxed">{dec.recommendationReason}</div>
                </div>

                {/* 2. Farmer Action */}
                <div className="p-2.5 rounded-lg bg-[#111C15]/70 border border-[#2E4A38]/30">
                  <div className="text-[11px] font-bold text-blue-300 mb-1">Farmer Action Executed</div>
                  <div className="text-slate-200 leading-relaxed">{dec.farmerActionDetails || 'Executed as recommended'}</div>
                </div>

                {/* 3. Observed Field Response */}
                <div className="p-2.5 rounded-lg bg-[#111C15]/70 border border-[#2E4A38]/30">
                  <div className="text-[11px] font-bold text-emerald-400 mb-1">Observed Telemetry & Crop Result</div>
                  <div className="text-emerald-300 leading-relaxed font-medium">
                    {dec.observedTelemetryDelta || dec.cropResponse || 'Positive vegetative response recorded'}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Farm Learning Patterns View */}
      {activeTab === 'learning' && (
        <div className="mt-5 space-y-3">
          <div className="p-3 rounded-xl bg-violet-950/30 border border-violet-800/30 text-xs text-slate-300">
            <strong className="text-violet-300">Learning Engine Rule: </strong>
            Observations accumulate empirical knowledge for your specific microclimate and soil without modifying production ML weights.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {patterns.map(pat => (
              <div 
                key={pat.id}
                className="p-4 rounded-xl bg-[#18291F]/50 border border-[#2E4A38]/40 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-[#2E4A38]/30 text-xs">
                    <span className="font-bold text-slate-100">{pat.title}</span>
                    <span className="px-2 py-0.5 rounded bg-violet-500/20 text-violet-300 text-[11px] font-semibold">
                      {pat.confidence} Confidence ({pat.observedFrequency}x)
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">
                    {pat.insightDescription}
                  </p>
                </div>

                <div className="mt-3.5 pt-2.5 border-t border-[#2E4A38]/30 text-xs">
                  <div className="text-slate-400 text-[11px]">Agronomic Implication:</div>
                  <div className="text-emerald-300 font-medium mt-0.5">{pat.agronomicImplication}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
