import React from 'react';
import { 
  Brain, 
  HelpCircle, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ShieldAlert, 
  Sparkles,
  ArrowRight,
  Send
} from 'lucide-react';
import { CroperXSupervisorUnderstanding } from '../../types/sceneIdentificationTypes';

interface CroperXUnderstandingCardProps {
  understanding: CroperXSupervisorUnderstanding;
  onSendToSupervisor?: () => void;
}

export const CroperXUnderstandingCard: React.FC<CroperXUnderstandingCardProps> = ({
  understanding,
  onSendToSupervisor,
}) => {
  return (
    <div className="bg-gradient-to-br from-[#0d170d] via-[#142614] to-[#0a120a] text-white rounded-3xl p-5 sm:p-6 border border-[#2e7d32]/50 shadow-xl space-y-4">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#2e7d32]/40 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-[#2e7d32]/30 text-[#4CAF50] rounded-2xl border border-[#4CAF50]/30 shadow-inner">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-base font-serif font-bold text-white flex items-center gap-2">
              CroperX Farm AI Supervisor Understanding
            </h4>
            <p className="text-xs text-gray-400">
              Deterministic 5-part field synthesis combining vision, soil sensors, and microclimate
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-emerald-950 text-emerald-300 border border-emerald-500/40 rounded-full text-xs font-mono font-bold">
            Confidence: {understanding.confidence} ({understanding.confidenceScore}%)
          </span>
        </div>
      </div>

      {/* 5 Structured Questions & Answers */}
      <div className="space-y-3">
        {/* 1. What is happening? */}
        <div className="p-3.5 bg-black/40 rounded-2xl border border-emerald-900/60 space-y-1">
          <div className="text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            1. What is happening?
          </div>
          <p className="text-sm font-medium text-gray-100 leading-relaxed">
            {understanding.whatIsHappening}
          </p>
        </div>

        {/* 2. Why? */}
        <div className="p-3.5 bg-black/40 rounded-2xl border border-emerald-900/60 space-y-1">
          <div className="text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5" />
            2. Why is this happening?
          </div>
          <p className="text-sm text-gray-200 leading-relaxed">
            {understanding.why}
          </p>
        </div>

        {/* 3. What should I do? */}
        <div className="p-3.5 bg-[#1b381b]/60 rounded-2xl border border-[#4CAF50]/50 space-y-1 shadow-inner">
          <div className="text-[11px] font-mono font-bold text-[#81C784] uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#4CAF50]" />
            3. What should I do?
          </div>
          <p className="text-sm font-bold text-white leading-relaxed">
            {understanding.whatShouldIDo}
          </p>
        </div>

        {/* 4 & 5 Grid (When & Avoid) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* 4. When? */}
          <div className="p-3.5 bg-black/40 rounded-2xl border border-emerald-900/60 space-y-1">
            <div className="text-[11px] font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              4. When?
            </div>
            <p className="text-xs text-gray-200 font-medium">
              {understanding.when}
            </p>
          </div>

          {/* 5. What should I avoid? */}
          <div className="p-3.5 bg-red-950/40 rounded-2xl border border-red-800/40 space-y-1">
            <div className="text-[11px] font-mono font-bold text-red-300 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" />
              5. What should I avoid?
            </div>
            <p className="text-xs text-red-200">
              {understanding.whatShouldIAvoid}
            </p>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      {onSendToSupervisor && (
        <div className="pt-2 flex justify-end">
          <button
            onClick={onSendToSupervisor}
            className="px-4 py-2.5 bg-gradient-to-r from-[#2e7d32] to-[#4CAF50] hover:brightness-110 text-white font-bold rounded-2xl text-xs flex items-center gap-2 cursor-pointer shadow-lg active:scale-95 transition-all"
          >
            <Send className="w-4 h-4" />
            <span>Forward to Autonomous Farm Supervisor</span>
          </button>
        </div>
      )}
    </div>
  );
};
