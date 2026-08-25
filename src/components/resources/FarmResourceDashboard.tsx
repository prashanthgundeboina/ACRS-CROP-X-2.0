import React, { useState } from 'react';
import { 
  Coins, 
  Droplets, 
  Zap, 
  Activity, 
  Sprout, 
  ShieldAlert, 
  Brain, 
  Award, 
  Sliders, 
  Mic, 
  Download, 
  Layers,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { FarmEconomicsCard } from './FarmEconomicsCard';
import { WaterBudgetCard } from './WaterBudgetCard';
import { PumpElectricityCard } from './PumpElectricityCard';
import { IrrigationVerificationCard } from './IrrigationVerificationCard';
import { YieldForecastCard } from './YieldForecastCard';
import { FarmRiskRadarCard } from './FarmRiskRadarCard';
import { DecisionHistoryAndLearningCard } from './DecisionHistoryAndLearningCard';
import { ResourceEfficiencyScoreCard } from './ResourceEfficiencyScoreCard';
import { SoilData, FarmZone, CropRecommendation } from '../../types';

interface FarmResourceDashboardProps {
  soilData: SoilData;
  cropName?: string;
  recommendations?: CropRecommendation[];
  farmZones?: FarmZone[];
  weatherTemp?: number;
  weatherHumidity?: number;
  weatherRainProb?: number;
  weatherRainfallForecastMm?: number;
  isExpertMode?: boolean;
  onToggleExpertMode?: () => void;
  onSelectTab?: (tab: string) => void;
  onOpenCallModal?: () => void;
  onOpenAskCroperX?: (question: string) => void;
}

export const FarmResourceDashboard: React.FC<FarmResourceDashboardProps> = ({
  soilData,
  cropName = 'Tomato',
  recommendations = [],
  farmZones = [],
  weatherTemp = 28,
  weatherHumidity = 55,
  weatherRainProb = 20,
  weatherRainfallForecastMm = 0,
  isExpertMode = false,
  onToggleExpertMode,
  onSelectTab,
  onOpenCallModal,
  onOpenAskCroperX
}) => {
  const [activeSection, setActiveSection] = useState<
    'all' | 'economics' | 'water' | 'pump' | 'verification' | 'yield' | 'risk' | 'learning' | 'efficiency'
  >('all');

  const farmAreaAcres = 3.5;

  const quickVoicePrompts = [
    "How much money have I spent?",
    "How much water does my farm need today?",
    "How much profit can I expect?",
    "What is my biggest farm risk right now?",
    "How much crop yield can I expect?",
    "Is my drip irrigation working properly?"
  ];

  return (
    <div id="farm-resource-dashboard" className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Top Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0d2818] via-[#133822] to-[#0c1f14] border border-[#2E4A38]/60 p-6 md:p-8 shadow-2xl">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 text-xs font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase tracking-wider flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5" />
                <span>Phase 9 — Farm Resource, Cost & Risk Intelligence</span>
              </span>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                {cropName} Field
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-slate-100 tracking-tight">
              Farm Money, Hydrology & Risk Command
            </h1>

            <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
              Track operational spending against harvest revenue, budget daily water demands, monitor motor power consumption, verify irrigation penetration, and evaluate 6-pillar farm risk.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Simple / Expert Toggle */}
            {onToggleExpertMode && (
              <button
                onClick={onToggleExpertMode}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  isExpertMode
                    ? 'bg-emerald-600 border-emerald-400 text-white shadow-lg shadow-emerald-900/40'
                    : 'bg-[#18291F] border-[#2E4A38] text-slate-300 hover:text-white'
                }`}
              >
                <Sliders className="w-4 h-4" />
                <span>{isExpertMode ? 'Expert Mode (Active)' : 'Simple Farmer Mode'}</span>
              </button>
            )}

            {/* Voice AI Assistant Call */}
            {onOpenCallModal && (
              <button
                onClick={onOpenCallModal}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-lg shadow-emerald-950/50 transition-all cursor-pointer"
              >
                <Mic className="w-4 h-4" />
                <span>Voice AI Agronomist</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Voice Questions Pills */}
        <div className="relative z-10 mt-6 pt-4 border-t border-[#2E4A38]/40">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Instant Voice & AI Agro-Economic Questions</span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {quickVoicePrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => onOpenAskCroperX && onOpenAskCroperX(prompt)}
                className="px-3 py-1.5 rounded-full bg-[#18291F]/90 hover:bg-[#223d2e] border border-[#2E4A38] text-slate-300 hover:text-emerald-300 text-xs whitespace-nowrap transition-all cursor-pointer shrink-0"
              >
                "{prompt}"
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Section Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto p-1.5 bg-[#111C15]/80 border border-[#2E4A38]/50 rounded-2xl backdrop-blur-md no-scrollbar">
        <button
          onClick={() => setActiveSection('all')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeSection === 'all'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#18291F]'
          }`}
        >
          All Modules (8)
        </button>

        <button
          onClick={() => setActiveSection('economics')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeSection === 'economics'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#18291F]'
          }`}
        >
          <Coins className="w-3.5 h-3.5 text-emerald-400" />
          <span>💰 Farm Money</span>
        </button>

        <button
          onClick={() => setActiveSection('water')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeSection === 'water'
              ? 'bg-blue-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#18291F]'
          }`}
        >
          <Droplets className="w-3.5 h-3.5 text-blue-400" />
          <span>💧 Water Budget</span>
        </button>

        <button
          onClick={() => setActiveSection('pump')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeSection === 'pump'
              ? 'bg-amber-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#18291F]'
          }`}
        >
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>⚡ Pump & Power</span>
        </button>

        <button
          onClick={() => setActiveSection('verification')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeSection === 'verification'
              ? 'bg-teal-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#18291F]'
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-teal-400" />
          <span>🔄 Verification</span>
        </button>

        <button
          onClick={() => setActiveSection('yield')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeSection === 'yield'
              ? 'bg-lime-600 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#18291F]'
          }`}
        >
          <Sprout className="w-3.5 h-3.5 text-lime-400" />
          <span>🌾 Yield Forecast</span>
        </button>

        <button
          onClick={() => setActiveSection('risk')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeSection === 'risk'
              ? 'bg-red-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#18291F]'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
          <span>⚠️ Risk Radar</span>
        </button>

        <button
          onClick={() => setActiveSection('learning')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeSection === 'learning'
              ? 'bg-violet-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#18291F]'
          }`}
        >
          <Brain className="w-3.5 h-3.5 text-violet-400" />
          <span>🧠 Farm Memory</span>
        </button>

        <button
          onClick={() => setActiveSection('efficiency')}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
            activeSection === 'efficiency'
              ? 'bg-emerald-600 text-white shadow-md'
              : 'text-slate-400 hover:text-slate-200 hover:bg-[#18291F]'
          }`}
        >
          <Award className="w-3.5 h-3.5 text-emerald-400" />
          <span>🏆 Efficiency</span>
        </button>
      </div>

      {/* Main Grid of Phase 9 Intelligence Cards */}
      <div className="space-y-6">
        {/* 1. Farm Economics & Cost Tracker */}
        {(activeSection === 'all' || activeSection === 'economics') && (
          <FarmEconomicsCard
            cropName={cropName}
            farmAreaAcres={farmAreaAcres}
            isExpertMode={isExpertMode}
            onOpenAskCroperX={onOpenAskCroperX}
          />
        )}

        {/* 2. Water Resource Budget */}
        {(activeSection === 'all' || activeSection === 'water') && (
          <WaterBudgetCard
            farmAreaAcres={farmAreaAcres}
            cropName={cropName}
            soilMoisturePercent={soilData.soil_moisture ?? 28}
            temperatureC={weatherTemp}
            humidityPercent={weatherHumidity}
            rainfallMm={weatherRainfallForecastMm}
            isExpertMode={isExpertMode}
            onOpenAskCroperX={onOpenAskCroperX}
            onSelectTab={onSelectTab}
          />
        )}

        {/* 3. Pump & Electricity Intelligence */}
        {(activeSection === 'all' || activeSection === 'pump') && (
          <PumpElectricityCard
            pumpHorsePower={5}
            activePumps={1}
            isExpertMode={isExpertMode}
          />
        )}

        {/* 4. Irrigation Verification */}
        {(activeSection === 'all' || activeSection === 'verification') && (
          <IrrigationVerificationCard
            onSelectTab={onSelectTab}
          />
        )}

        {/* 5. Yield Forecast Range */}
        {(activeSection === 'all' || activeSection === 'yield') && (
          <YieldForecastCard
            cropName={cropName}
            farmAreaAcres={farmAreaAcres}
            soilData={soilData}
            isExpertMode={isExpertMode}
            onOpenAskCroperX={onOpenAskCroperX}
          />
        )}

        {/* 6. Farm Risk Radar */}
        {(activeSection === 'all' || activeSection === 'risk') && (
          <FarmRiskRadarCard
            soilData={soilData}
            cropName={cropName}
            temperatureC={weatherTemp}
            humidityPercent={weatherHumidity}
            rainfallMm={weatherRainfallForecastMm}
            farmZones={farmZones}
            isExpertMode={isExpertMode}
            onSelectTab={onSelectTab}
          />
        )}

        {/* 7. Decision History & Farm Learning Engine */}
        {(activeSection === 'all' || activeSection === 'learning') && (
          <DecisionHistoryAndLearningCard
            onOpenAskCroperX={onOpenAskCroperX}
          />
        )}

        {/* 8. Resource Efficiency Score */}
        {(activeSection === 'all' || activeSection === 'efficiency') && (
          <ResourceEfficiencyScoreCard
            onSelectTab={onSelectTab}
          />
        )}
      </div>
    </div>
  );
};
