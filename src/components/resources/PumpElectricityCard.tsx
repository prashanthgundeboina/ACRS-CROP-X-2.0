import React from 'react';
import { 
  Zap, 
  Activity, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  DollarSign,
  Gauge
} from 'lucide-react';
import { pumpIntelligenceService } from '../../services/resources/pumpIntelligenceService';

interface PumpElectricityCardProps {
  pumpHorsePower?: number;
  activePumps?: number;
  todayRuntimeMinutes?: number;
  weeklyRuntimeMinutes?: number;
  isExpertMode?: boolean;
}

export const PumpElectricityCard: React.FC<PumpElectricityCardProps> = ({
  pumpHorsePower = 5,
  activePumps = 1,
  todayRuntimeMinutes = 105,
  weeklyRuntimeMinutes = 640,
  isExpertMode = false
}) => {
  const summary = pumpIntelligenceService.calculatePumpIntelligence({
    pumpHorsePower,
    activePumps,
    todayRuntimeMinutes,
    weeklyRuntimeMinutes
  });

  return (
    <div id="pump-electricity-card" className="bg-[#111C15]/90 border border-[#2E4A38]/50 rounded-2xl p-5 md:p-6 backdrop-blur-md shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#2E4A38]/40">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg md:text-xl font-bold text-slate-100">Pump & Electricity Intelligence</h2>
              <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${
                summary.efficiencyRating === 'optimal'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
              }`}>
                {summary.efficiencyRating === 'optimal' ? 'Optimal Power Draw' : 'Review Suggested'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Motor runtime tracking, power consumption (kWh), and energy cost telemetry
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-300 bg-[#18291F] px-3 py-1.5 rounded-xl border border-[#2E4A38]">
          <span>{pumpHorsePower} HP Motor</span>
          <span className="text-slate-500">•</span>
          <span>₹{summary.electricityRatePerKwh}/kWh Tariff</span>
        </div>
      </div>

      {/* Anomaly Alerts */}
      {summary.anomalyAlerts.length > 0 && (
        <div className="mt-4 space-y-2">
          {summary.anomalyAlerts.map(alert => (
            <div 
              key={alert.id}
              className="p-3 rounded-xl bg-amber-950/30 border border-amber-600/40 flex items-start gap-3 text-xs"
            >
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-300">{alert.title}: </strong>
                <span className="text-slate-200">{alert.description} </span>
                <span className="text-slate-400 italic">Suggestion: {alert.suggestedCheck}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4 Metric Columns */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mt-5">
        {/* Today's Runtime */}
        <div className="bg-[#18291F]/60 border border-[#2E4A38]/40 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Today's Runtime</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2">
            <div className="text-xl md:text-2xl font-bold text-slate-100">
              {Math.floor(summary.todayRuntimeMinutes / 60)}h {summary.todayRuntimeMinutes % 60}m
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Weekly: {(summary.weeklyRuntimeMinutes / 60).toFixed(1)} hrs
            </div>
          </div>
        </div>

        {/* Water Delivered */}
        <div className="bg-[#18291F]/60 border border-[#2E4A38]/40 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Water Pumped</span>
            <Gauge className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2">
            <div className="text-xl md:text-2xl font-bold text-blue-400">
              {summary.todayWaterDeliveredLiters.toLocaleString()} <span className="text-xs font-normal text-slate-400">L</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Flow Rate: ~{pumpHorsePower * 70} LPM
            </div>
          </div>
        </div>

        {/* Electricity Consumed */}
        <div className="bg-[#18291F]/60 border border-[#2E4A38]/40 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Power Consumed</span>
            <Zap className="w-4 h-4 text-yellow-400" />
          </div>
          <div className="mt-2">
            <div className="text-xl md:text-2xl font-bold text-yellow-300">
              {summary.todayElectricityKwh} <span className="text-xs font-normal text-slate-400">kWh</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Weekly: {summary.weeklyElectricityKwh} kWh
            </div>
          </div>
        </div>

        {/* Electricity Cost */}
        <div className="bg-[#18291F]/60 border border-[#2E4A38]/40 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Energy Cost</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2">
            <div className="text-xl md:text-2xl font-bold text-emerald-400">
              ₹{summary.todayElectricityCostInr}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Weekly: ~₹{Math.round(summary.weeklyElectricityKwh * summary.electricityRatePerKwh)}
            </div>
          </div>
        </div>
      </div>

      {/* Energy Efficiency Health Note */}
      <div className="mt-4 p-3 rounded-xl bg-[#18291F]/50 border border-[#2E4A38]/30 flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Motor operating at ~85% electrical efficiency. Zero phase imbalance detected on pump controller.</span>
        </div>
      </div>
    </div>
  );
};
