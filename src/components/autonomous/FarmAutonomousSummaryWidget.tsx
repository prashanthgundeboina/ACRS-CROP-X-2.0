import React from 'react';
import { motion } from 'motion/react';
import { 
  Brain, 
  Sparkles, 
  ArrowRight, 
  Scale, 
  CheckCircle2, 
  AlertTriangle,
  Layers,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { AppTabId } from '../HeaderIconMenuBar';
import { farmSupervisorService } from '../../services/autonomous/farmSupervisorService';
import { farmGoalService } from '../../services/autonomous/farmGoalService';
import { SoilData, FarmZone, CropRecommendation } from '../../types';

interface FarmAutonomousSummaryWidgetProps {
  soilData: SoilData;
  cropName: string;
  farmZones?: FarmZone[];
  weatherTemp?: number;
  weatherHumidity?: number;
  weatherRainProb?: number;
  weatherRainfallForecastMm?: number;
  onSelectTab: (tab: AppTabId) => void;
  onOpenAskCroperX?: (question: string) => void;
}

export const FarmAutonomousSummaryWidget: React.FC<FarmAutonomousSummaryWidgetProps> = ({
  soilData,
  cropName,
  farmZones,
  weatherTemp,
  weatherHumidity,
  weatherRainProb,
  weatherRainfallForecastMm,
  onSelectTab,
  onOpenAskCroperX
}) => {
  const supervisorState = farmSupervisorService.evaluateFarm({
    soilData,
    cropName,
    farmZones,
    weatherTemp,
    weatherHumidity,
    weatherRainProb,
    weatherRainfallForecastMm
  });

  const activeGoal = farmGoalService.getActiveGoal();
  const topPrio = supervisorState.dailyBriefing.top3Priorities[0];

  return (
    <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white rounded-3xl p-6 border border-emerald-500/30 shadow-xl relative overflow-hidden space-y-4">
      {/* Background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <Brain className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Autonomous Supervisor
              </span>
              <span className="text-xs text-emerald-200/60 font-medium">Objective: {activeGoal}</span>
            </div>
            <h3 className="text-lg font-bold tracking-tight text-white mt-0.5">
              CroperX Farm Brain & Multi-Agent Hive
            </h3>
          </div>
        </div>

        <button
          onClick={() => onSelectTab('autonomous' as AppTabId)}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 self-stretch sm:self-auto justify-center"
        >
          <span>Open AI Command Center</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Top Priority Directive */}
      {topPrio && (
        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold flex items-center justify-center border border-emerald-500/30">
                #1
              </span>
              <span className="text-xs font-bold text-emerald-300">
                Top Priority Directive for Today
              </span>
            </div>
            <h4 className="text-sm font-bold text-white">
              {topPrio.title}
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed line-clamp-2">
              {topPrio.summary}
            </p>
          </div>

          <button
            onClick={() => onSelectTab(topPrio.targetTab as AppTabId)}
            className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1 self-stretch sm:self-auto justify-center"
          >
            <span>{topPrio.actionLabel}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Mini Agent Hive Strip */}
      <div className="flex items-center justify-between pt-1 text-xs text-slate-300">
        <span className="flex items-center gap-1.5 text-emerald-300 font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          9 Autonomous Agents Evaluating Live Farm State
        </span>
        <button
          onClick={() => onSelectTab('autonomous' as AppTabId)}
          className="text-emerald-400 hover:text-emerald-300 font-bold flex items-center gap-1 text-xs"
        >
          <span>View Reasoning & Scenarios</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
