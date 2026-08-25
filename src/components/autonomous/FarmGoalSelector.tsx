import React from 'react';
import { motion } from 'motion/react';
import { 
  Scale, 
  Droplets, 
  TrendingUp, 
  PiggyBank, 
  Sparkles, 
  ShieldAlert, 
  Calendar,
  Check
} from 'lucide-react';
import { FarmGoalId } from '../../types/autonomous/farmAutonomousTypes';
import { FARM_GOALS, farmGoalService } from '../../services/autonomous/farmGoalService';

interface FarmGoalSelectorProps {
  activeGoal: FarmGoalId;
  onGoalChange: (goal: FarmGoalId) => void;
}

export const FarmGoalSelector: React.FC<FarmGoalSelectorProps> = ({
  activeGoal,
  onGoalChange
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Droplets': return <Droplets className="w-4 h-4" />;
      case 'TrendingUp': return <TrendingUp className="w-4 h-4" />;
      case 'PiggyBank': return <PiggyBank className="w-4 h-4" />;
      case 'Sparkles': return <Sparkles className="w-4 h-4" />;
      case 'ShieldAlert': return <ShieldAlert className="w-4 h-4" />;
      case 'Calendar': return <Calendar className="w-4 h-4" />;
      default: return <Scale className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <Scale className="w-4 h-4" />
            </span>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              Active Farming Objective & Priority Focus
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Goals tune supervisor prioritization weights without overriding baseline agronomic safety boundaries.
          </p>
        </div>

        <div className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/60 rounded-full text-xs font-semibold text-emerald-700 dark:text-emerald-300">
          Target: {activeGoal}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-2.5">
        {FARM_GOALS.map((goal) => {
          const isSelected = activeGoal === goal.id;
          return (
            <button
              key={goal.id}
              onClick={() => {
                farmGoalService.setGoal(goal.id);
                onGoalChange(goal.id);
              }}
              className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between ${
                isSelected
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 dark:border-emerald-500 shadow-sm ring-2 ring-emerald-500/20'
                  : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
                  {getIcon(goal.icon)}
                </div>
                {isSelected && (
                  <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                    <Check className="w-2.5 h-2.5" />
                  </span>
                )}
              </div>

              <div className="mt-2">
                <h4 className={`text-xs font-bold ${isSelected ? 'text-emerald-900 dark:text-emerald-200' : 'text-slate-800 dark:text-slate-200'}`}>
                  {goal.id}
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5 leading-tight">
                  {goal.description}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
