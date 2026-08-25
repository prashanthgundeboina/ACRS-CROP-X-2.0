import React from 'react';
import { 
  Award, 
  Droplets, 
  DollarSign, 
  Gauge, 
  CheckCircle2, 
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { resourceEfficiencyService } from '../../services/resources/resourceEfficiencyService';

interface ResourceEfficiencyScoreCardProps {
  onSelectTab?: (tab: string) => void;
}

export const ResourceEfficiencyScoreCard: React.FC<ResourceEfficiencyScoreCardProps> = ({
  onSelectTab
}) => {
  const scores = resourceEfficiencyService.calculateEfficiencyScores();

  return (
    <div id="resource-efficiency-card" className="bg-[#111C15]/90 border border-[#2E4A38]/50 rounded-2xl p-5 md:p-6 backdrop-blur-md shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#2E4A38]/40">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg md:text-xl font-bold text-slate-100">Resource Efficiency Score</h2>
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Grade {scores.ratingGrade}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Aggregated benchmark comparing input consumption against crop response
            </p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-2xl md:text-3xl font-extrabold text-emerald-400">
            {scores.overallEfficiencyScore}<span className="text-sm font-normal text-slate-400">/100</span>
          </div>
          <div className="text-[11px] text-slate-400">Overall Farm Rating</div>
        </div>
      </div>

      {/* Main Farmer Advice */}
      <div className="mt-4 p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/40 flex items-center gap-3">
        <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
        <p className="text-xs md:text-sm text-emerald-100 font-medium">
          {scores.overallFarmerMessage}
        </p>
      </div>

      {/* 4 Efficiency Pillars */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 mt-5">
        {/* 1. Water Efficiency */}
        <div className="p-3.5 rounded-xl bg-[#18291F]/50 border border-[#2E4A38]/40 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-200">💧 Water Efficiency</span>
              <Droplets className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-xl font-bold text-blue-300 mt-2">
              {scores.waterEfficiencyScore}%
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
              <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${scores.waterEfficiencyScore}%` }} />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-3 leading-relaxed">
            {scores.waterEfficiencySummary}
          </p>
        </div>

        {/* 2. Cost Efficiency */}
        <div className="p-3.5 rounded-xl bg-[#18291F]/50 border border-[#2E4A38]/40 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-200">💰 Cost Efficiency</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl font-bold text-emerald-300 mt-2">
              {scores.costEfficiencyScore}%
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
              <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${scores.costEfficiencyScore}%` }} />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-3 leading-relaxed">
            {scores.costEfficiencySummary}
          </p>
        </div>

        {/* 3. Irrigation Response */}
        <div className="p-3.5 rounded-xl bg-[#18291F]/50 border border-[#2E4A38]/40 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-200">🔄 Infiltration Response</span>
              <Gauge className="w-4 h-4 text-teal-400" />
            </div>
            <div className="text-xl font-bold text-teal-300 mt-2">
              {scores.irrigationResponseScore}%
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
              <div className="bg-teal-500 h-1.5 rounded-full" style={{ width: `${scores.irrigationResponseScore}%` }} />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-3 leading-relaxed">
            Telemetry confirms strong root absorption in monitored zones.
          </p>
        </div>

        {/* 4. Operational Task Completion */}
        <div className="p-3.5 rounded-xl bg-[#18291F]/50 border border-[#2E4A38]/40 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-semibold text-slate-200">🌱 Task Execution</span>
              <CheckCircle2 className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-xl font-bold text-amber-300 mt-2">
              {scores.operationalTaskScore}%
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
              <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${scores.operationalTaskScore}%` }} />
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mt-3 leading-relaxed">
            Farm schedule adherence on irrigation, fertigation & weeding.
          </p>
        </div>
      </div>
    </div>
  );
};
