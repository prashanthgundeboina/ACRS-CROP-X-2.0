import React from 'react';
import { 
  Coins, 
  Droplets, 
  Zap, 
  Sprout, 
  ShieldAlert, 
  ArrowRight,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { farmEconomicsService } from '../../services/resources/farmEconomicsService';
import { waterBudgetService } from '../../services/resources/waterBudgetService';
import { pumpIntelligenceService } from '../../services/resources/pumpIntelligenceService';
import { yieldForecastService } from '../../services/resources/yieldForecastService';
import { farmRiskRadarService } from '../../services/resources/farmRiskRadarService';
import { SoilData, FarmZone } from '../../types';

interface FarmResourceSummaryWidgetProps {
  soilData?: SoilData;
  cropName?: string;
  farmAreaAcres?: number;
  farmZones?: FarmZone[];
  weatherTemp?: number;
  weatherHumidity?: number;
  weatherRainfallForecastMm?: number;
  onNavigateToResources: (subSection?: string) => void;
}

export const FarmResourceSummaryWidget: React.FC<FarmResourceSummaryWidgetProps> = ({
  soilData,
  cropName = 'Tomato',
  farmAreaAcres = 3.5,
  farmZones = [],
  weatherTemp = 28,
  weatherHumidity = 55,
  weatherRainfallForecastMm = 0,
  onNavigateToResources
}) => {
  const economics = farmEconomicsService.calculateEconomics({ cropName, farmAreaAcres });
  const water = waterBudgetService.calculateWaterBudget({
    farmAreaAcres,
    cropName,
    soilMoisturePercent: soilData?.soil_moisture ?? 28,
    temperatureC: weatherTemp,
    humidityPercent: weatherHumidity,
    rainfallMm: weatherRainfallForecastMm
  });
  const pump = pumpIntelligenceService.calculatePumpIntelligence({});
  const yieldEst = yieldForecastService.estimateYieldRange({ cropName, farmAreaAcres, soilData });
  const risk = farmRiskRadarService.evaluateFarmRiskRadar({
    soilData,
    cropName,
    temperatureC: weatherTemp,
    humidityPercent: weatherHumidity,
    rainfallMm: weatherRainfallForecastMm,
    farmZones
  });

  return (
    <div className="bg-[#111C15]/90 border border-[#2E4A38]/50 rounded-2xl p-4 md:p-5 backdrop-blur-md shadow-xl">
      <div className="flex items-center justify-between pb-3 border-b border-[#2E4A38]/40">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Coins className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <span>Farm Resources & Money</span>
              <span className="text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30">
                Phase 9
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Live operational capital, hydrology reserves, power consumption & threat index
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigateToResources()}
          className="flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-semibold group cursor-pointer"
        >
          <span>Open Full Resource Center</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* 5 Quick KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mt-4">
        {/* 1. Money Card */}
        <div 
          onClick={() => onNavigateToResources('economics')}
          className="p-3 rounded-xl bg-[#18291F]/60 border border-[#2E4A38]/40 hover:border-emerald-500/50 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium text-slate-300">💰 Money</span>
            <Coins className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2">
            <div className="text-lg font-bold text-emerald-300">
              ₹{economics.expectedProfit.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              +{economics.roiPercentage}% ROI (Spent: ₹{economics.totalActualCost.toLocaleString()})
            </div>
          </div>
        </div>

        {/* 2. Water Card */}
        <div 
          onClick={() => onNavigateToResources('water')}
          className="p-3 rounded-xl bg-[#18291F]/60 border border-[#2E4A38]/40 hover:border-blue-500/50 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium text-slate-300">💧 Water</span>
            <Droplets className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2">
            <div className="text-lg font-bold text-blue-300">
              {water.dailyRequirementLiters.toLocaleString()} L
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {water.daysOfAvailableWater} days reserve left
            </div>
          </div>
        </div>

        {/* 3. Electricity Card */}
        <div 
          onClick={() => onNavigateToResources('pump')}
          className="p-3 rounded-xl bg-[#18291F]/60 border border-[#2E4A38]/40 hover:border-amber-500/50 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium text-slate-300">⚡ Electricity</span>
            <Zap className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2">
            <div className="text-lg font-bold text-yellow-300">
              {pump.todayElectricityKwh} kWh
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              ₹{pump.todayElectricityCostInr} today ({Math.floor(pump.todayRuntimeMinutes / 60)}h {pump.todayRuntimeMinutes % 60}m)
            </div>
          </div>
        </div>

        {/* 4. Yield Card */}
        <div 
          onClick={() => onNavigateToResources('yield')}
          className="p-3 rounded-xl bg-[#18291F]/60 border border-[#2E4A38]/40 hover:border-lime-500/50 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium text-slate-300">🌾 Yield</span>
            <Sprout className="w-4 h-4 text-lime-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2">
            <div className="text-lg font-bold text-lime-300">
              {yieldEst.lowerRange}–{yieldEst.upperRange} Q/ac
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              ~{yieldEst.totalProductionAvg} Q total ({yieldEst.confidence})
            </div>
          </div>
        </div>

        {/* 5. Risk Card */}
        <div 
          onClick={() => onNavigateToResources('risk')}
          className="p-3 rounded-xl bg-[#18291F]/60 border border-[#2E4A38]/40 hover:border-red-500/50 transition-all cursor-pointer group flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="font-medium text-slate-300">⚠️ Risk</span>
            <ShieldAlert className="w-4 h-4 text-red-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="mt-2">
            <div className={`text-lg font-bold ${risk.overallRiskScore > 45 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {risk.overallRiskScore}/100
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5 capitalize">
              Top: {risk.highestRiskPillar} threat
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
