import React from 'react';
import {
  Activity,
  AlertTriangle,
  CloudRain,
  Droplets,
  Layers,
  Sparkles,
  TrendingUp,
  ShieldCheck
} from 'lucide-react';
import { AIInsightSummary } from '../../../types';

interface AIInsightsProps {
  insights: AIInsightSummary | null;
  loading: boolean;
  farmerCrop?: string;
  farmLocation?: string;
}

export const AIInsights: React.FC<AIInsightsProps> = ({
  insights,
  loading,
  farmerCrop = 'Paddy',
  farmLocation = 'Rural Farm'
}) => {
  if (loading || !insights) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-slate-800/60 rounded-2xl border border-slate-700/50" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 4 Quick Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Farm Health Score */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-emerald-950/30 border border-emerald-500/20 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Crop Health Index</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{insights.farmHealthScore}</span>
            <span className="text-xs font-bold text-emerald-400">/ 100</span>
            <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
              Optimal
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {farmerCrop} vigor in {farmLocation}
          </p>
        </div>

        {/* Card 2: Soil Condition */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-teal-950/30 border border-teal-500/20 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Soil pH & Nitrogen</span>
            <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-xl font-black text-teal-300">pH 6.8</span>
            <span className="text-[11px] text-slate-300">Neutral</span>
          </div>
          <p className="text-[11px] text-teal-400/90 mt-1">
            N: 280 kg/ha • P: 35 • K: 310
          </p>
        </div>

        {/* Card 3: Irrigation Model */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-blue-950/30 border border-blue-500/20 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Water AWD Protocol</span>
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
              <Droplets className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-lg font-black text-blue-300">AWD Schedule</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 truncate">
            {insights.irrigationRecommendation?.waterSchedule || 'Maintain 5cm threshold'}
          </p>
        </div>

        {/* Card 4: Weather & Risk Radar */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-amber-950/30 border border-amber-500/20 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Weather Advisory</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <CloudRain className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-sm font-bold text-amber-200 truncate">
              {insights.weatherAlert?.title || 'Stable Forecast'}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1 truncate">
            {insights.weatherAlert?.advisory || 'Safe for scheduled field activities'}
          </p>
        </div>
      </div>

      {/* Top Risks & Action Banner */}
      {insights.topRisks && insights.topRisks.length > 0 && (
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Active Agronomic Risk Alert
                </h4>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold">
                  {insights.topRisks[0].title}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {insights.topRisks[0].advice}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" /> AI Protected
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
