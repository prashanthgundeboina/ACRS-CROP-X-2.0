import React from 'react';
import { 
  Sprout, 
  Sparkles, 
  Layers, 
  CheckCircle2, 
  AlertCircle, 
  MinusCircle,
  HelpCircle,
  TrendingUp
} from 'lucide-react';
import { yieldForecastService } from '../../services/resources/yieldForecastService';
import { SoilData } from '../../types';

interface YieldForecastCardProps {
  cropName?: string;
  farmAreaAcres?: number;
  soilData?: SoilData;
  pestPressureLevel?: 'low' | 'moderate' | 'high';
  waterAdequacyScore?: number;
  isExpertMode?: boolean;
  onOpenAskCroperX?: (question: string) => void;
}

export const YieldForecastCard: React.FC<YieldForecastCardProps> = ({
  cropName = 'Tomato',
  farmAreaAcres = 3.5,
  soilData,
  pestPressureLevel = 'low',
  waterAdequacyScore = 85,
  isExpertMode = false,
  onOpenAskCroperX
}) => {
  const forecast = yieldForecastService.estimateYieldRange({
    cropName,
    farmAreaAcres,
    soilData,
    pestPressureLevel,
    waterAdequacyScore
  });

  return (
    <div id="yield-forecast-card" className="bg-[#111C15]/90 border border-[#2E4A38]/50 rounded-2xl p-5 md:p-6 backdrop-blur-md shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#2E4A38]/40">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-lime-500/10 border border-lime-500/30 text-lime-400">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg md:text-xl font-bold text-slate-100">Harvest Yield Forecast</h2>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-lime-500/20 text-lime-300 border border-lime-500/30">
                Range-Based Estimate
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Biomass and production range calibrated using multi-factor environmental telemetry
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-xl text-xs font-semibold border ${
            forecast.confidence === 'High'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
          }`}>
            Confidence: {forecast.confidence}
          </span>
        </div>
      </div>

      {/* Main Yield Range Headline Banner */}
      <div className="mt-5 p-4 rounded-xl bg-lime-950/30 border border-lime-800/40 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold text-lime-400 uppercase tracking-wider">
            Expected Production for {cropName}
          </div>
          <div className="text-2xl md:text-3xl font-extrabold text-slate-100 mt-1">
            {forecast.lowerRange} – {forecast.upperRange} <span className="text-sm font-normal text-slate-300">{forecast.unit}</span>
          </div>
          <div className="text-xs text-lime-200 mt-1">
            Total Farm Yield: ~<strong>{forecast.totalProductionMin.toLocaleString()} to {forecast.totalProductionMax.toLocaleString()} quintals</strong> across {farmAreaAcres} acres
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-[#18291F] border border-[#2E4A38] text-center min-w-[110px]">
            <div className="text-[11px] text-slate-400">Median Output</div>
            <div className="text-base font-bold text-lime-400 mt-0.5">{forecast.totalProductionAvg.toLocaleString()} Q</div>
          </div>
          {onOpenAskCroperX && (
            <button
              onClick={() => onOpenAskCroperX(`How can I maximize my ${cropName} yield range from ${forecast.lowerRange} to ${forecast.upperRange} quintals?`)}
              className="px-3 py-2 rounded-xl bg-lime-600 hover:bg-lime-500 text-slate-950 text-xs font-bold transition-all cursor-pointer"
            >
              Ask AI to Maximize
            </button>
          )}
        </div>
      </div>

      {/* Transparent Influencing Factors Breakdown */}
      <div className="mt-5">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Environmental Drivers & Yield Influencers
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {forecast.influencingFactors.map(factor => (
            <div 
              key={factor.factor}
              className="p-3 rounded-xl bg-[#18291F]/40 border border-[#2E4A38]/30 flex items-start gap-3 text-xs"
            >
              {factor.impact === 'positive' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              ) : factor.impact === 'negative' ? (
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              ) : (
                <MinusCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">{factor.factor}</span>
                  <span className={`font-semibold text-[11px] ${
                    factor.impact === 'positive' ? 'text-emerald-400' : factor.impact === 'negative' ? 'text-red-400' : 'text-amber-400'
                  }`}>
                    {factor.impact === 'positive' ? '+Favorable' : factor.impact === 'negative' ? '-Risk Factor' : 'Neutral'}
                  </span>
                </div>
                <p className="text-slate-400 leading-relaxed">{factor.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Confidence Footnote */}
      <div className="mt-4 p-3 rounded-xl bg-[#18291F]/50 border border-[#2E4A38]/30 flex items-center gap-2 text-xs text-slate-400">
        <HelpCircle className="w-4 h-4 text-slate-500 shrink-0" />
        <span>{forecast.confidenceReason}</span>
      </div>
    </div>
  );
};
