import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  GitCompare, 
  Droplets, 
  Activity, 
  Coins, 
  TrendingUp, 
  ShieldAlert, 
  Sparkles, 
  CheckCircle2, 
  Info,
  ChevronRight
} from 'lucide-react';
import { WhatIfScenario } from '../../types/autonomous/farmAutonomousTypes';
import { farmScenarioEngine } from '../../services/autonomous/farmScenarioEngine';
import { SoilData } from '../../types';

interface FarmScenarioComparisonProps {
  soilData: SoilData;
  cropName: string;
}

export const FarmScenarioComparison: React.FC<FarmScenarioComparisonProps> = ({
  soilData,
  cropName
}) => {
  const scenarios = farmScenarioEngine.getPrebuiltScenarios(soilData, cropName);
  const [activeScenarioId, setActiveScenarioId] = useState<string>(scenarios[0]?.id || '');

  const activeScenario = scenarios.find(s => s.id === activeScenarioId) || scenarios[0];

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800/60">
              <GitCompare className="w-5 h-5" />
            </span>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Agronomic "What-If" Decision Simulator
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Simulate operational outcomes before taking physical action on the farm.
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 bg-purple-50 dark:bg-purple-950/50 rounded-full text-xs font-semibold text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Predictive agronomy model</span>
        </div>
      </div>

      {/* Scenario Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {scenarios.map((sc, idx) => {
          const isSelected = sc.id === activeScenario.id;
          return (
            <button
              key={sc.id}
              onClick={() => setActiveScenarioId(sc.id)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border flex items-center gap-2 ${
                isSelected
                  ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>{sc.title.split(':')[0]}</span>
              {isSelected && <span className="w-2 h-2 rounded-full bg-white animate-pulse" />}
            </button>
          );
        })}
      </div>

      {/* Scenario Title */}
      <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/60">
        <h4 className="font-bold text-slate-900 dark:text-white text-base">
          {activeScenario.title}
        </h4>
      </div>

      {/* Side-by-Side Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Choice A */}
        <div className={`p-6 rounded-2xl border space-y-4 relative ${
          activeScenario.recommendedChoice === 'A'
            ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-500/50 ring-2 ring-emerald-500/20'
            : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'
        }`}>
          {activeScenario.recommendedChoice === 'A' && (
            <div className="absolute -top-3 right-4 px-3 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm">
              <CheckCircle2 className="w-3 h-3" /> Recommended Option
            </div>
          )}

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Choice 1</span>
            <h5 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
              {activeScenario.decisionA.label}
            </h5>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
              {activeScenario.decisionA.description}
            </p>
          </div>

          <div className="space-y-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-sky-500" /> Water Requirement:
              </span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {activeScenario.decisionA.waterRequirementLiters > 0 ? `${activeScenario.decisionA.waterRequirementLiters.toLocaleString()} L` : '0 L (Conserved)'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-amber-500" /> Crop Stress Index:
              </span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {activeScenario.decisionA.expectedCropStress}/100
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-indigo-500" /> Estimated Cost:
              </span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                ₹{activeScenario.decisionA.estimatedCostInr.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-500" /> Risk Score:
              </span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {activeScenario.decisionA.riskScore}/100
              </span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-200/40 dark:border-slate-700/40">
              <span className="text-slate-600 dark:text-slate-300 font-semibold flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> Projected Revenue:
              </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                ₹{activeScenario.decisionA.potentialRevenueInr.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Choice B */}
        <div className={`p-6 rounded-2xl border space-y-4 relative ${
          activeScenario.recommendedChoice === 'B'
            ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-500/50 ring-2 ring-emerald-500/20'
            : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700'
        }`}>
          {activeScenario.recommendedChoice === 'B' && (
            <div className="absolute -top-3 right-4 px-3 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-sm">
              <CheckCircle2 className="w-3 h-3" /> Recommended Option
            </div>
          )}

          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Choice 2</span>
            <h5 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
              {activeScenario.decisionB.label}
            </h5>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
              {activeScenario.decisionB.description}
            </p>
          </div>

          <div className="space-y-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-sky-500" /> Water Requirement:
              </span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {activeScenario.decisionB.waterRequirementLiters > 0 ? `${activeScenario.decisionB.waterRequirementLiters.toLocaleString()} L` : '0 L (Conserved)'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-amber-500" /> Crop Stress Index:
              </span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {activeScenario.decisionB.expectedCropStress}/100
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-indigo-500" /> Estimated Cost:
              </span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                ₹{activeScenario.decisionB.estimatedCostInr.toLocaleString()}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-500" /> Risk Score:
              </span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                {activeScenario.decisionB.riskScore}/100
              </span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-200/40 dark:border-slate-700/40">
              <span className="text-slate-600 dark:text-slate-300 font-semibold flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> Projected Revenue:
              </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                ₹{activeScenario.decisionB.potentialRevenueInr.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Agronomic Rationale Box */}
      <div className="bg-purple-50/50 dark:bg-purple-950/20 p-5 rounded-2xl border border-purple-200 dark:border-purple-800/50 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-900 dark:text-purple-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Simulation Analysis & Agronomic Verdict
          </span>
          <span className="text-xs font-bold text-purple-700 dark:text-purple-300">
            {activeScenario.confidencePercent}% Confidence
          </span>
        </div>
        <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
          {activeScenario.agronomicRationale}
        </p>
      </div>
    </div>
  );
};
