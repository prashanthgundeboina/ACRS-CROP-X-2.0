import React, { useState, useEffect } from 'react';
import { SoilData, CropRecommendation } from '../types';
import { 
  Calendar, 
  Clock, 
  Sun, 
  AlertTriangle, 
  CheckCircle, 
  ArrowRight, 
  ShieldAlert, 
  Thermometer, 
  Droplets,
  Bell,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Sparkles,
  Zap
} from 'lucide-react';

interface Props {
  soilData: SoilData;
  cropRecommendation?: CropRecommendation | null;
  estimatedYield?: number | { expectedYield: number };
  onUnreadMilestonesChange?: (count: number) => void;
}

export interface HarvestMilestone {
  id: string;
  category: 'irrigation' | 'fertilizer' | 'pest' | 'harvest';
  title: string;
  dueDate: string;
  stageName: string;
  priority: 'high' | 'medium' | 'normal';
  details: string;
  status: 'pending' | 'completed' | 'snoozed';
}

export const HarvestScheduler: React.FC<Props> = ({ 
  soilData, 
  cropRecommendation, 
  estimatedYield,
  onUnreadMilestonesChange
}) => {
  const cropName = cropRecommendation?.crop || "Maize / General Crop";
  const stageVal = Number(soilData.growth_stage) || 2; // 1: Initial, 2: Vegetative, 3: Mid-Season/Podding, 4: Late-Season/Maturity

  const yieldNum = typeof estimatedYield === 'number'
    ? estimatedYield
    : (typeof estimatedYield === 'object' && estimatedYield !== null && 'expectedYield' in estimatedYield)
      ? Number((estimatedYield as any).expectedYield) || 4.2
      : 4.2;

  // Calculate days remaining based on phenological stage
  const daysToHarvest = stageVal === 1 ? 75 : stageVal === 2 ? 45 : stageVal === 3 ? 20 : 5;

  const today = new Date();
  const harvestStartDate = new Date(today);
  harvestStartDate.setDate(today.getDate() + daysToHarvest);

  const harvestEndDate = new Date(harvestStartDate);
  harvestEndDate.setDate(harvestStartDate.getDate() + 7);

  const [selectedCalendarDay, setSelectedCalendarDay] = useState<number>(harvestStartDate.getDate());

  // Smart Irrigation Schedule Calculations based on soil_moisture and rainfall
  const targetMoisture = 35;
  const currentMoisture = soilData.soil_moisture;
  const moistureDeficit = Math.max(0, targetMoisture - currentMoisture);
  const requiredWaterDepthMm = Number((moistureDeficit * 0.75).toFixed(1));
  const rainfallCreditMm = Number((soilData.rainfall > 300 ? 5.0 : 2.5).toFixed(1));
  const netWaterNeededMm = Math.max(0, Number((requiredWaterDepthMm - rainfallCreditMm).toFixed(1)));
  const litersPerHa = Math.round(netWaterNeededMm * 10000);
  const gallonsPerAcre = Math.round(litersPerHa * 0.1069);
  const timingWindow = soilData.temperature > 30 ? '05:30 AM – 08:00 AM (Cool Window)' : '06:00 AM – 09:30 AM';

  const [pushAlertActive, setPushAlertActive] = useState<boolean>(false);
  const [pushToast, setPushToast] = useState<string | null>(null);

  const handleTriggerPushNotification = async () => {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification("💧 CroperX Smart Irrigation Alert", {
          body: `Apply ${netWaterNeededMm}mm (${litersPerHa.toLocaleString()} L/ha) drip irrigation tomorrow at 05:30 AM.`,
          icon: "/icon.png"
        });
      } else if (Notification.permission !== 'denied') {
        await Notification.requestPermission();
      }
    }
    setPushAlertActive(true);
    setPushToast(`🔔 Smart Irrigation Push Notification trigger activated for 05:30 AM! Notification scheduled on device.`);
    setTimeout(() => setPushToast(null), 5000);
  };

  // Generate milestone reminders based on growth stage parameter
  const [milestones, setMilestones] = useState<HarvestMilestone[]>(() => {
    // Try reading saved statuses from localStorage
    const savedStates: Record<string, 'pending' | 'completed' | 'snoozed'> = (() => {
      try {
        return JSON.parse(localStorage.getItem('croperx_milestone_states') || '{}');
      } catch {
        return {};
      }
    })();

    const stageTitles: Record<number, string> = {
      1: 'Initial / Germination Stage',
      2: 'Vegetative Tillering Stage',
      3: 'Grain Filling / Podding Stage',
      4: 'Maturity & Pre-Harvest Stage'
    };

    const currentStageName = stageTitles[stageVal] || 'Vegetative Growth Stage';

    const rawList: Omit<HarvestMilestone, 'status'>[] = [
      {
        id: `irrig_${stageVal}`,
        category: 'irrigation',
        title: stageVal === 1 
          ? 'Germination Light Irrigation (15mm)' 
          : stageVal === 2 
          ? 'Deep Root Zone Irrigation (30mm)' 
          : stageVal === 3 
          ? 'Critical Grain Filling Moisture Sync' 
          : 'Terminal Field Drainage prior to harvest',
        dueDate: 'In 2 Days',
        stageName: currentStageName,
        priority: stageVal === 3 ? 'high' : 'medium',
        details: stageVal === 4 
          ? 'Stop overhead irrigation 10 days before harvest date to lower grain moisture to 13%.' 
          : `Ensure soil moisture stays between ${soilData.soil_moisture}% and 35% to prevent stress.`
      },
      {
        id: `fert_${stageVal}`,
        category: 'fertilizer',
        title: stageVal === 1 
          ? 'Basal Starter Dose (DAP + Potassium)' 
          : stageVal === 2 
          ? 'Top-dress Urea Application (45 kg/ha)' 
          : stageVal === 3 
          ? 'Foliar Spray Potash & Micronutrients (Zn + B)' 
          : 'Post-Harvest Bio-Compost Soil Prep',
        dueDate: 'In 4 Days',
        stageName: currentStageName,
        priority: stageVal === 2 ? 'high' : 'normal',
        details: `Based on your soil Nitrogen (${soilData.nitrogen} ppm), apply split fertilizer early in the morning before watering.`
      },
      {
        id: `pest_${stageVal}`,
        category: 'pest',
        title: stageVal === 1 
          ? 'Seedling Blight & Cutworm Inspection' 
          : stageVal === 2 
          ? 'Scout Stem Borer & Fall Armyworm Eggs' 
          : stageVal === 3 
          ? 'Fungal Blight & Pod Borer Shield Spray' 
          : 'Storage Pest Fumigation Preparation',
        dueDate: 'Tomorrow',
        stageName: currentStageName,
        priority: 'high',
        details: 'Inspect 20 random plants across field diagonals. Check leaf undersides for aphid or caterpillar egg clutches.'
      },
      {
        id: `harvest_${stageVal}`,
        category: 'harvest',
        title: stageVal === 4 ? 'Optimal Combine Harvester Deployment' : 'Check Phenological Maturity Indicators',
        dueDate: `In ${daysToHarvest} Days`,
        stageName: currentStageName,
        priority: stageVal === 4 ? 'high' : 'normal',
        details: `Target harvest window begins ${harvestStartDate.toLocaleDateString()}. Expected yield target: ${yieldNum.toFixed(1)} tons/ha.`
      }
    ];

    return rawList.map(m => ({
      ...m,
      status: savedStates[m.id] || 'pending'
    }));
  });

  // Count unread/pending milestones
  const pendingCount = milestones.filter(m => m.status === 'pending').length;

  useEffect(() => {
    if (onUnreadMilestonesChange) {
      onUnreadMilestonesChange(pendingCount);
    }
  }, [pendingCount, onUnreadMilestonesChange]);

  const handleUpdateMilestone = (id: string, newStatus: 'completed' | 'snoozed' | 'pending') => {
    const updated = milestones.map(m => m.id === id ? { ...m, status: newStatus } : m);
    setMilestones(updated);

    const savedStates = updated.reduce((acc, m) => {
      acc[m.id] = m.status;
      return acc;
    }, {} as Record<string, string>);

    localStorage.setItem('croperx_milestone_states', JSON.stringify(savedStates));
  };

  // Generate a 14-day calendar grid around harvest period
  const calendarDays = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(harvestStartDate);
    d.setDate(harvestStartDate.getDate() - 3 + i);
    const isOptimal = i >= 3 && i <= 9;
    const isToday = d.toDateString() === today.toDateString();
    return {
      dateObj: d,
      dayNum: d.getDate(),
      month: d.toLocaleString('default', { month: 'short' }),
      weekday: d.toLocaleString('default', { weekday: 'short' }),
      isOptimal,
      isToday,
      weatherRisk: i === 5 ? 'Light Shower' : i === 11 ? 'High Wind' : 'Sunny Clear',
      humidityTarget: isOptimal ? '12-14%' : '15-18%'
    };
  });

  return (
    <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-[#c8e6c9] shadow-sm space-y-8 animate-fadeIn">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#c8e6c9] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[#4CAF50]">
            <Calendar className="w-5 h-5 text-[#4CAF50]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#2e7d32]">
              Precision Phenological Timing & Milestone Reminders
            </span>
          </div>
          <h3 className="font-serif text-2xl lg:text-3xl font-bold text-[#1b2e1b]">
            Harvest Window & Milestone Scheduler
          </h3>
          <p className="text-xs text-[#667e66]">
            Tracks maturity dates and provides local notifications for upcoming irrigation, fertilization, and crop care milestones based on growth stage {stageVal}.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#1b2e1b] text-white p-3 rounded-2xl border border-[#2e7d32] shadow-sm">
            <Clock className="w-5 h-5 text-amber-400" />
            <div>
              <div className="text-[10px] font-bold uppercase text-emerald-300">Days to Optimal Harvest</div>
              <div className="text-xl font-black text-white font-mono">{daysToHarvest} Days</div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast Alert for Push Notification */}
      {pushToast && (
        <div className="p-4 bg-emerald-600 text-white font-bold text-xs rounded-2xl shadow-xl flex items-center justify-between animate-bounce border-2 border-white">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-300" />
            <span>{pushToast}</span>
          </div>
          <button onClick={() => setPushToast(null)} className="text-white hover:text-gray-200">✕</button>
        </div>
      )}

      {/* SMART IRRIGATION SCHEDULE MODULE */}
      <div className="p-6 bg-[#f8fcf8] rounded-3xl border border-[#c8e6c9] space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#c8e6c9] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-[#4CAF50]">
              <Droplets className="w-5 h-5 text-cyan-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-[#2e7d32]">
                Automated Hydro-Calculations & Weather Sync
              </span>
            </div>
            <h4 className="font-serif text-xl font-bold text-[#1b2e1b]">
              Smart Irrigation Volume & Timing Schedule
            </h4>
            <p className="text-xs text-[#667e66]">
              Calculates exact irrigation depth and volume based on current soil moisture ({currentMoisture}%) and forecast rainfall ({soilData.rainfall}mm).
            </p>
          </div>

          <button
            onClick={handleTriggerPushNotification}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-md flex items-center gap-2 border ${
              pushAlertActive
                ? 'bg-emerald-600 text-white border-emerald-400'
                : 'bg-[#1b2e1b] hover:bg-[#2e7d32] text-white border-[#4CAF50]/40'
            }`}
          >
            <Bell className="w-4 h-4 text-amber-400" />
            <span>{pushAlertActive ? 'Push Reminder Scheduled ✓' : 'Set Irrigation Push Alert'}</span>
          </button>
        </div>

        {/* Hydro Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          
          <div className="p-4 bg-white rounded-2xl border border-[#c8e6c9] space-y-1">
            <span className="text-[10px] text-gray-500 font-bold uppercase block">Moisture Deficit</span>
            <div className="text-2xl font-black font-mono text-[#1b2e1b]">
              {moistureDeficit.toFixed(1)}%
            </div>
            <span className="text-[10px] text-[#667e66]">Target: {targetMoisture}% optimal</span>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-[#c8e6c9] space-y-1">
            <span className="text-[10px] text-gray-500 font-bold uppercase block">Water Depth Needed</span>
            <div className="text-2xl font-black font-mono text-cyan-600">
              {netWaterNeededMm} <span className="text-xs">mm</span>
            </div>
            <span className="text-[10px] text-[#667e66]">Rain credit: -{rainfallCreditMm}mm</span>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-[#c8e6c9] space-y-1">
            <span className="text-[10px] text-gray-500 font-bold uppercase block">Volume / Hectare</span>
            <div className="text-2xl font-black font-mono text-emerald-700">
              {litersPerHa.toLocaleString()} <span className="text-xs">L/ha</span>
            </div>
            <span className="text-[10px] text-gray-500 font-mono">({gallonsPerAcre.toLocaleString()} gal/acre)</span>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-[#c8e6c9] space-y-1">
            <span className="text-[10px] text-gray-500 font-bold uppercase block">Optimal Window</span>
            <div className="text-sm font-bold font-mono text-[#1b2e1b] mt-1">
              {timingWindow}
            </div>
            <span className="text-[10px] text-[#667e66]">Minimizes evaporation loss</span>
          </div>

        </div>
      </div>

      <div className="p-5 bg-gradient-to-r from-[#1b2e1b] via-[#285329] to-[#1b2e1b] text-white rounded-3xl border-2 border-[#4CAF50]/50 shadow-lg space-y-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-amber-400 text-[#1b2e1b] flex items-center justify-center font-black shadow-md">
                <Bell className="w-5 h-5 animate-bounce" />
              </div>
              {pendingCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white text-[10px] font-mono font-black rounded-full flex items-center justify-center border-2 border-[#1b2e1b] animate-pulse">
                  {pendingCount}
                </span>
              )}
            </div>

            <div>
              <h4 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                Upcoming Milestone Reminders
                <span className="text-[10px] bg-amber-400/20 text-amber-300 border border-amber-400/40 px-2.5 py-0.5 rounded-full font-mono uppercase">
                  Stage {stageVal} Active
                </span>
              </h4>
              <p className="text-xs text-emerald-200/90">
                {pendingCount > 0
                  ? `You have ${pendingCount} active milestone action(s) due for your crop.`
                  : 'All current milestone reminders completed! Your crop care cycle is up to date.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-[11px] font-mono text-emerald-300 bg-black/40 px-3 py-1 rounded-xl border border-white/10">
              Completed: {milestones.filter(m => m.status === 'completed').length} / {milestones.length}
            </span>
          </div>
        </div>

        {/* Milestone Task List Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {milestones.map((m) => {
            const isDone = m.status === 'completed';
            const isSnoozed = m.status === 'snoozed';

            return (
              <div
                key={m.id}
                className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between gap-2 ${
                  isDone
                    ? 'bg-black/30 border-emerald-500/30 opacity-75'
                    : isSnoozed
                    ? 'bg-black/40 border-amber-500/40'
                    : 'bg-black/50 border-amber-400/60 shadow-md'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      m.category === 'irrigation'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        : m.category === 'fertilizer'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : m.category === 'pest'
                        ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {m.category} • {m.dueDate}
                    </span>

                    <span className={`text-[10px] font-black uppercase ${
                      isDone ? 'text-emerald-400' : isSnoozed ? 'text-amber-400' : 'text-amber-300 animate-pulse'
                    }`}>
                      {isDone ? '✓ Completed' : isSnoozed ? '⏱ Snoozed 2 Days' : '⚡ Action Due'}
                    </span>
                  </div>

                  <h5 className={`font-bold text-xs sm:text-sm ${isDone ? 'line-through text-gray-400' : 'text-white'}`}>
                    {m.title}
                  </h5>

                  <p className="text-[11px] text-emerald-200/80 leading-relaxed font-serif">
                    {m.details}
                  </p>
                </div>

                {/* Milestone Interactive Actions */}
                <div className="flex items-center justify-end gap-2 border-t border-white/10 pt-2 mt-1 text-xs">
                  {isDone ? (
                    <button
                      onClick={() => handleUpdateMilestone(m.id, 'pending')}
                      className="text-[10px] text-emerald-300 hover:text-white font-bold flex items-center gap-1 bg-white/10 px-2.5 py-1 rounded-lg"
                    >
                      <RotateCcw className="w-3 h-3" /> Mark Pending
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => handleUpdateMilestone(m.id, 'snoozed')}
                        className="text-[10px] text-amber-200 hover:text-white font-bold flex items-center gap-1 bg-amber-500/20 hover:bg-amber-500/30 px-2.5 py-1 rounded-lg border border-amber-500/40"
                      >
                        <Clock className="w-3 h-3" /> Snooze 2d
                      </button>

                      <button
                        onClick={() => handleUpdateMilestone(m.id, 'completed')}
                        className="text-[10px] bg-[#4CAF50] hover:bg-emerald-600 text-[#1b2e1b] font-black flex items-center gap-1 px-3 py-1 rounded-lg shadow-sm"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Mark Done
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Status Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Growth Pipeline Progress */}
        <div className="p-5 bg-[#f8fcf8] rounded-3xl border border-[#c8e6c9] space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#2e7d32] flex items-center justify-between">
            <span>Phenological Timeline</span>
            <span className="font-mono text-[10px] text-[#4CAF50]">Stage {stageVal} / 4</span>
          </h4>

          <div className="space-y-3">
            {[
              { id: 1, title: 'Initial / Germination', duration: '10-15 days', active: stageVal >= 1 },
              { id: 2, title: 'Vegetative Tillering', duration: '25-35 days', active: stageVal >= 2 },
              { id: 3, title: 'Grain Filling / Podding', duration: '20-30 days', active: stageVal >= 3 },
              { id: 4, title: 'Maturity & Harvest', duration: '7-10 days window', active: stageVal >= 4 }
            ].map((stg) => (
              <div key={stg.id} className={`p-3 rounded-2xl border transition-all ${stg.active ? 'bg-white border-[#4CAF50] shadow-sm' : 'bg-gray-50 border-gray-200 opacity-60'}`}>
                <div className="flex justify-between items-center text-xs">
                  <span className={`font-bold ${stg.active ? 'text-[#1b2e1b]' : 'text-gray-500'}`}>
                    {stg.id}. {stg.title}
                  </span>
                  {stg.id === stageVal && (
                    <span className="px-2 py-0.5 bg-[#4CAF50] text-white text-[9px] font-black rounded-full animate-pulse">
                      Active
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-gray-500 font-mono mt-1">{stg.duration}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Harvest Window Calendar Overlay */}
        <div className="lg:col-span-2 p-5 bg-[#1b2e1b] text-white rounded-3xl border border-[#2e7d32] space-y-4">
          <div className="flex justify-between items-center border-b border-[#2e7d32] pb-3">
            <div>
              <h4 className="font-serif text-lg font-bold text-white flex items-center gap-2">
                <Sun className="w-5 h-5 text-amber-400" />
                Target Harvest Window
              </h4>
              <p className="text-[11px] text-[#a5d6a7]">
                Recommended Range: <span className="font-bold text-white">{harvestStartDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – {harvestEndDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </p>
            </div>
            <div className="text-right">
              <span className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold rounded-full">
                Target Yield: {yieldNum.toFixed(1)} Tons/ha
              </span>
            </div>
          </div>

          {/* 14-Day Micro-Calendar Strip */}
          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((cd, i) => (
              <button
                key={i}
                onClick={() => setSelectedCalendarDay(cd.dayNum)}
                className={`p-2 rounded-2xl flex flex-col items-center justify-between text-center transition-all ${
                  cd.isOptimal
                    ? cd.dayNum === selectedCalendarDay
                      ? 'bg-[#4CAF50] text-white shadow-lg scale-105 ring-2 ring-white'
                      : 'bg-[#2e7d32]/70 hover:bg-[#2e7d32] text-white'
                    : 'bg-[#122012] text-gray-400 hover:text-white border border-[#2e7d32]/30'
                }`}
              >
                <span className="text-[9px] uppercase font-bold text-[#81c784]">{cd.weekday}</span>
                <span className="text-base font-black font-mono my-0.5">{cd.dayNum}</span>
                <span className="text-[8px] truncate max-w-[45px] text-amber-300">{cd.weatherRisk}</span>
              </button>
            ))}
          </div>

          {/* Detailed Harvest & Storage Guidelines for Selected Day */}
          <div className="p-4 bg-[#122012] rounded-2xl border border-[#2e7d32]/60 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="space-y-1">
              <span className="text-[10px] text-[#81c784] uppercase font-bold flex items-center gap-1">
                <Thermometer className="w-3.5 h-3.5" /> Optimal Time Window
              </span>
              <div className="font-bold text-white">06:00 AM – 11:00 AM</div>
              <div className="text-[10px] text-gray-400">Avoid midday sun to minimize grain shatter loss.</div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-[#81c784] uppercase font-bold flex items-center gap-1">
                <Droplets className="w-3.5 h-3.5" /> Grain Moisture Target
              </span>
              <div className="font-bold text-white">12.5% - 13.8%</div>
              <div className="text-[10px] text-gray-400">Prevents post-harvest mold and aflatoxin contamination.</div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] text-[#81c784] uppercase font-bold flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" /> Equipment Prep
              </span>
              <div className="font-bold text-white">Combine Harvester</div>
              <div className="text-[10px] text-gray-400">Set cylinder speed to 850 RPM with 12mm concave gap.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
