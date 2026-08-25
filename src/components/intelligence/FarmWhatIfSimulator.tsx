import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  Sparkles, 
  CloudRain, 
  Thermometer, 
  Droplets, 
  Sliders, 
  RotateCcw, 
  HelpCircle,
  AlertTriangle,
  CheckCircle2,
  Cpu
} from 'lucide-react';
import { 
  FarmWhatIfScenario, 
  WhatIfSimulationResult 
} from '../../types/intelligence/farmIntelligenceTypes';
import { farmPredictionService } from '../../services/intelligence/farmPredictionService';

interface FarmWhatIfSimulatorProps {
  currentMoisture: number;
  currentTemp: number;
}

export const FarmWhatIfSimulator: React.FC<FarmWhatIfSimulatorProps> = ({
  currentMoisture,
  currentTemp
}) => {
  const [rainfall, setRainfall] = useState<'none' | 'light' | 'heavy'>('none');
  const [temperature, setTemperature] = useState<'normal' | 'hot' | 'extreme'>('normal');
  const [moisture, setMoisture] = useState<'current' | 'lower' | 'higher'>('current');
  const [irrigation, setIrrigation] = useState<'none' | 'normal' | 'extra'>('none');

  const simulation: WhatIfSimulationResult = useMemo(() => {
    return farmPredictionService.runWhatIfSimulation(
      currentMoisture,
      currentTemp,
      { rainfall, temperature, moisture, irrigation }
    );
  }, [currentMoisture, currentTemp, rainfall, temperature, moisture, irrigation]);

  const handleReset = () => {
    setRainfall('none');
    setTemperature('normal');
    setMoisture('current');
    setIrrigation('none');
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'CRITICAL':
        return {
          bg: 'bg-rose-100 text-rose-800 border-rose-300',
          label: '🔴 Critical Risk'
        };
      case 'HIGH':
        return {
          bg: 'bg-amber-100 text-amber-900 border-amber-300',
          label: '🔴 High Risk'
        };
      case 'MODERATE':
        return {
          bg: 'bg-yellow-100 text-yellow-900 border-yellow-200',
          label: '🟡 Moderate Risk'
        };
      case 'LOW':
      default:
        return {
          bg: 'bg-emerald-100 text-emerald-900 border-[#c8e6c9]',
          label: '🟢 Low Risk'
        };
    }
  };

  const badge = getRiskBadge(simulation.expectedRisk);

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#c8e6c9] shadow-sm space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-700">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-serif font-bold text-lg text-[#1b2e1b]">
                Farm What-If Simulator
              </h3>
              <span className="text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-900 border border-indigo-200">
                Sandbox Mode
              </span>
            </div>
            <p className="text-xs text-gray-500">
              Simulate hypothetical weather and moisture scenarios without altering live farm data
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="text-xs font-semibold text-gray-600 hover:text-gray-900 flex items-center gap-1 py-1 px-2.5 rounded-xl hover:bg-gray-100 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Scenario</span>
        </button>
      </div>

      {/* Scenario Sliders / Selector Matrix */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Rainfall Selector */}
        <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
          <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
            <CloudRain className="w-4 h-4 text-blue-500" />
            Rainfall Scenario
          </span>
          <div className="grid grid-cols-3 gap-1">
            {(['none', 'light', 'heavy'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRainfall(r)}
                className={`py-1.5 text-xs font-semibold rounded-xl capitalize transition-all ${
                  rainfall === r
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {r === 'none' ? 'No Rain' : r}
              </button>
            ))}
          </div>
        </div>

        {/* Temperature Selector */}
        <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
          <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
            <Thermometer className="w-4 h-4 text-orange-500" />
            Temperature
          </span>
          <div className="grid grid-cols-3 gap-1">
            {(['normal', 'hot', 'extreme'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTemperature(t)}
                className={`py-1.5 text-xs font-semibold rounded-xl capitalize transition-all ${
                  temperature === t
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Soil Moisture Selector */}
        <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
          <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
            <Droplets className="w-4 h-4 text-emerald-600" />
            Initial Moisture
          </span>
          <div className="grid grid-cols-3 gap-1">
            {(['lower', 'current', 'higher'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMoisture(m)}
                className={`py-1.5 text-xs font-semibold rounded-xl capitalize transition-all ${
                  moisture === m
                    ? 'bg-[#2e7d32] text-white shadow-xs'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Irrigation Adjustment */}
        <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
          <span className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-indigo-600" />
            Irrigation Action
          </span>
          <div className="grid grid-cols-3 gap-1">
            {(['none', 'normal', 'extra'] as const).map((i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIrrigation(i)}
                className={`py-1.5 text-xs font-semibold rounded-xl capitalize transition-all ${
                  irrigation === i
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {i}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Simulation Outcome Card */}
      <motion.div
        key={`${rainfall}-${temperature}-${moisture}-${irrigation}`}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-5 rounded-2xl bg-indigo-50/50 border border-indigo-200/80 space-y-3"
      >
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase text-indigo-900">
              Simulated Forecast Result:
            </span>
            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${badge.bg}`}>
              {badge.label}
            </span>
          </div>

          <div className="text-xs font-mono font-bold text-indigo-900 bg-white px-3 py-1 rounded-xl border border-indigo-200">
            Simulated Moisture: {simulation.expectedMoisture}%
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-[10px] font-black uppercase text-indigo-900 block">Expected Condition:</span>
            <p className="text-gray-800 font-medium mt-0.5">
              {simulation.expectedFieldCondition}
            </p>
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-indigo-900 block">Suggested Action:</span>
            <p className="text-gray-900 font-bold mt-0.5">
              {simulation.suggestedAction}
            </p>
          </div>
        </div>

        <div className="pt-2 border-t border-indigo-100 text-xs text-gray-600">
          <span className="font-semibold text-gray-800">Why: </span>
          {simulation.whyExplanation}
        </div>

        <div className="pt-2 border-t border-indigo-100/60 flex items-center justify-between text-[10px] text-gray-500 font-mono">
          <span>⚠️ Strictly hypothetical sandbox calculation</span>
          <span>Zero changes applied to live hardware/field telemetry</span>
        </div>
      </motion.div>
    </div>
  );
};
