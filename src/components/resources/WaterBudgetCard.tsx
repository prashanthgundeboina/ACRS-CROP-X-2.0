import React from 'react';
import { 
  Droplets, 
  CloudRain, 
  AlertTriangle, 
  Layers, 
  Clock, 
  Gauge,
  Sparkles
} from 'lucide-react';
import { waterBudgetService } from '../../services/resources/waterBudgetService';

interface WaterBudgetCardProps {
  farmAreaAcres?: number;
  cropName?: string;
  growthStageName?: string;
  soilMoisturePercent?: number;
  temperatureC?: number;
  humidityPercent?: number;
  rainfallMm?: number;
  isExpertMode?: boolean;
  onOpenAskCroperX?: (question: string) => void;
  onSelectTab?: (tab: string) => void;
}

export const WaterBudgetCard: React.FC<WaterBudgetCardProps> = ({
  farmAreaAcres = 3.5,
  cropName = 'Tomato',
  growthStageName = 'Vegetative',
  soilMoisturePercent = 28,
  temperatureC = 28,
  humidityPercent = 55,
  rainfallMm = 0,
  isExpertMode = false,
  onOpenAskCroperX,
  onSelectTab
}) => {
  const budget = waterBudgetService.calculateWaterBudget({
    farmAreaAcres,
    cropName,
    growthStageName,
    soilMoisturePercent,
    temperatureC,
    humidityPercent,
    rainfallMm
  });

  const percentageUsedOfDaily = Math.min(100, Math.round((budget.waterUsedTodayLiters / (budget.dailyRequirementLiters || 1)) * 100));
  const percentSourceRemaining = Math.round((budget.waterRemainingSourceLiters / budget.totalSourceCapacityLiters) * 100);

  return (
    <div id="water-budget-card" className="bg-[#111C15]/90 border border-[#2E4A38]/50 rounded-2xl p-5 md:p-6 backdrop-blur-md shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#2E4A38]/40">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
            <Droplets className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg md:text-xl font-bold text-slate-100">Water Resource Budget</h2>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Live Transpiration Model
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Crop water demand, available storage buffer, and rainfall offset
            </p>
          </div>
        </div>

        {onSelectTab && (
          <button
            onClick={() => onSelectTab('irrigation')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 border border-blue-500/40 text-blue-200 text-xs font-semibold transition-all cursor-pointer"
          >
            <span>Precision Irrigation AI →</span>
          </button>
        )}
      </div>

      {/* Critical Shortage Warning if active */}
      {budget.isDeficitCritical && (
        <div className="mt-4 p-3.5 rounded-xl bg-red-950/40 border border-red-600/40 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5 animate-bounce" />
          <div className="text-xs">
            <strong className="text-red-300">Critical Water Buffer Alert: </strong>
            <span className="text-slate-200">
              Your farm reserve has only {budget.daysOfAvailableWater} days of water remaining at current transpiration rates. Prioritize high-stress zones and consider deficit irrigation scheduling.
            </span>
          </div>
        </div>
      )}

      {/* Main Headline Card */}
      <div className="mt-4 p-4 rounded-xl bg-blue-950/30 border border-blue-800/40 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-blue-400 animate-pulse" />
          <p className="text-sm md:text-base font-semibold text-blue-100">
            {budget.farmerFriendlyMessage}
          </p>
        </div>
        {budget.rainOffsetLiters > 0 && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs shrink-0">
            <CloudRain className="w-4 h-4" />
            <span>Rain saved {budget.rainOffsetLiters.toLocaleString()} L</span>
          </div>
        )}
      </div>

      {/* 4 Metric Columns */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mt-5">
        {/* Daily Demand */}
        <div className="bg-[#18291F]/60 border border-[#2E4A38]/40 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Daily Water Need</span>
            <Droplets className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2">
            <div className="text-xl md:text-2xl font-bold text-slate-100">
              {budget.dailyRequirementLiters.toLocaleString()} <span className="text-xs font-normal text-slate-400">Liters</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Weekly: ~{(budget.weeklyRequirementLiters / 1000).toFixed(1)}k L
            </div>
          </div>
        </div>

        {/* Water Used Today */}
        <div className="bg-[#18291F]/60 border border-[#2E4A38]/40 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Water Delivered</span>
            <Gauge className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2">
            <div className="text-xl md:text-2xl font-bold text-emerald-400">
              {budget.waterUsedTodayLiters.toLocaleString()} <span className="text-xs font-normal text-slate-400">Liters</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {percentageUsedOfDaily}% of daily quota
            </div>
          </div>
        </div>

        {/* Water Remaining in Source */}
        <div className="bg-[#18291F]/60 border border-[#2E4A38]/40 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Source Reserve</span>
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2">
            <div className="text-xl md:text-2xl font-bold text-cyan-300">
              {(budget.waterRemainingSourceLiters / 1000).toFixed(0)}k <span className="text-xs font-normal text-slate-400">L</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {percentSourceRemaining}% source capacity
            </div>
          </div>
        </div>

        {/* Days of Available Water */}
        <div className="bg-[#18291F]/60 border border-[#2E4A38]/40 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Days of Water Left</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2">
            <div className={`text-xl md:text-2xl font-bold ${budget.daysOfAvailableWater < 10 ? 'text-amber-400' : 'text-slate-100'}`}>
              {budget.daysOfAvailableWater} <span className="text-xs font-normal text-slate-400">Days</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Assuming current ETc rate
            </div>
          </div>
        </div>
      </div>

      {/* Visual Reservoir Capacity Bar */}
      <div className="mt-5 p-3.5 rounded-xl bg-[#18291F]/40 border border-[#2E4A38]/30">
        <div className="flex items-center justify-between text-xs text-slate-300 mb-1.5">
          <span className="font-medium">Farm Water Reserve Capacity</span>
          <span>{budget.waterRemainingSourceLiters.toLocaleString()} L / {budget.totalSourceCapacityLiters.toLocaleString()} L</span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
          <div 
            className={`h-2.5 rounded-full transition-all ${
              percentSourceRemaining < 25 ? 'bg-red-500' : percentSourceRemaining < 50 ? 'bg-amber-500' : 'bg-blue-500'
            }`}
            style={{ width: `${percentSourceRemaining}%` }}
          />
        </div>
      </div>

      {/* Expert ETc Parameters */}
      {isExpertMode && (
        <div className="mt-5 pt-4 border-t border-[#2E4A38]/40">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
            Technical Hydrology Parameters
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
            <div className="p-2 rounded bg-[#18291F]/50 border border-[#2E4A38]/30">
              <span className="text-slate-400">Ref ET0: </span>
              <strong className="text-slate-200">{budget.evapotranspirationEt0Mm} mm/day</strong>
            </div>
            <div className="p-2 rounded bg-[#18291F]/50 border border-[#2E4A38]/30">
              <span className="text-slate-400">Crop Factor (Kc): </span>
              <strong className="text-slate-200">{budget.cropKcFactor}</strong>
            </div>
            <div className="p-2 rounded bg-[#18291F]/50 border border-[#2E4A38]/30">
              <span className="text-slate-400">Crop ETc: </span>
              <strong className="text-slate-200">{budget.cropStageEtcMm} mm/day</strong>
            </div>
            <div className="p-2 rounded bg-[#18291F]/50 border border-[#2E4A38]/30">
              <span className="text-slate-400">Soil Moisture: </span>
              <strong className="text-slate-200">{soilMoisturePercent}%</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
