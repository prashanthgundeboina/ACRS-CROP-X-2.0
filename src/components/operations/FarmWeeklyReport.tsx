import React from 'react';
import { motion } from 'motion/react';
import { 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Droplets, 
  FlaskConical, 
  TrendingUp, 
  Download, 
  MessageSquare,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { FarmWeeklySummary } from '../../types/operations/farmOperationsTypes';

interface FarmWeeklyReportProps {
  cropName: string;
  isExpertMode?: boolean;
  onOpenAskCroperX?: (question: string) => void;
  onSelectTab: (tabId: string) => void;
}

export const FarmWeeklyReport: React.FC<FarmWeeklyReportProps> = ({
  cropName,
  isExpertMode = false,
  onOpenAskCroperX,
  onSelectTab
}) => {
  const summary: FarmWeeklySummary = {
    weekLabel: 'Week of Aug 10 – Aug 17',
    overallHealthStatus: 'Optimal',
    headline: `Farm Operates Smoothly with Robust ${cropName} Canopy Growth`,
    narrative: `Your farm was mostly healthy this week. Soil moisture remained in the optimal zone (28-34%) with 2 scheduled precision irrigation cycles. One foliar nutrient application was logged successfully. Pest scouting identified clear canopies with zero blight pressure. Market prices for ${cropName} trended upwards by ~5.2% in the regional mandi.`,
    completedTasksCount: 6,
    pendingTasksCount: 2,
    skippedTasksCount: 0,
    waterAppliedLiters: 12400,
    fertilizerApplicationsCount: 1,
    pestRiskAlertsCount: 0,
    weatherEventsCount: 1,
    sensorAlertsResolved: 2,
    marketPriceTrend: 'rising',
    keyTakeaway: 'Maintain current moisture balance and prepare for the upcoming flower cluster initiation next week.'
  };

  const handleExport = () => {
    window.print();
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 border border-[#c8e6c9] shadow-sm space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#e8f5e9] flex items-center justify-center text-[#2e7d32] shrink-0 border border-[#c8e6c9]">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase bg-[#e8f5e9] text-[#2e7d32] border border-[#c8e6c9]">
                My Farm This Week
              </span>
              <span className="text-xs text-gray-500 font-mono">
                {summary.weekLabel}
              </span>
            </div>
            <h2 className="font-serif font-bold text-xl sm:text-2xl text-[#1b2e1b] mt-0.5">
              Weekly Operations Summary & Review
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onOpenAskCroperX && (
            <button
              type="button"
              onClick={() => onOpenAskCroperX("What happened in my farm this week? Give me a quick recap.")}
              className="px-3 py-1.5 rounded-xl border border-[#c8e6c9] bg-[#f1f8e9] text-[#2e7d32] hover:bg-[#e8f5e9] text-xs font-bold transition-colors min-h-[40px] flex items-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Ask AI Recap</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleExport}
            className="px-3.5 py-2 rounded-xl bg-[#2e7d32] text-white hover:bg-[#1b5e20] text-xs font-bold transition-colors min-h-[40px] flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Export Report (PDF)</span>
          </button>
        </div>
      </div>

      {/* Narrative Summary Box */}
      <div className="p-5 rounded-2xl bg-[#fafdfa] border border-[#c8e6c9] space-y-3">
        <div className="flex items-center gap-2 text-[#2e7d32]">
          <ShieldCheck className="w-5 h-5" />
          <h3 className="font-bold text-base text-gray-900">
            {summary.headline}
          </h3>
        </div>
        <p className="text-xs text-gray-700 leading-relaxed font-medium">
          {summary.narrative}
        </p>
        <div className="pt-2 border-t border-gray-200 text-xs text-[#2e7d32] font-semibold flex items-center gap-1.5">
          <Sparkles className="w-4 h-4" />
          <span>Strategic Takeaway: {summary.keyTakeaway}</span>
        </div>
      </div>

      {/* Metric Counters Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 space-y-1">
          <span className="text-gray-500 font-medium block">Completed Tasks</span>
          <strong className="text-xl font-mono text-emerald-700 font-bold block">
            {summary.completedTasksCount} / {summary.completedTasksCount + summary.pendingTasksCount}
          </strong>
          <span className="text-[10px] text-gray-400">Operations executed</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 space-y-1">
          <span className="text-gray-500 font-medium block">Water Delivered</span>
          <strong className="text-xl font-mono text-blue-700 font-bold block">
            {summary.waterAppliedLiters.toLocaleString()} L
          </strong>
          <span className="text-[10px] text-gray-400">Via precision drip</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 space-y-1">
          <span className="text-gray-500 font-medium block">Nutrient Doses</span>
          <strong className="text-xl font-mono text-purple-700 font-bold block">
            {summary.fertilizerApplicationsCount} Logged
          </strong>
          <span className="text-[10px] text-gray-400">Top-dress / foliar</span>
        </div>

        <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 space-y-1">
          <span className="text-gray-500 font-medium block">Market Movement</span>
          <strong className="text-xl font-mono text-teal-700 font-bold block capitalize flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            {summary.marketPriceTrend}
          </strong>
          <span className="text-[10px] text-gray-400">+5.2% wholesale gain</span>
        </div>
      </div>
    </div>
  );
};
