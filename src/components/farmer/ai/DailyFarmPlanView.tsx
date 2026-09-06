import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Sun,
  Compass,
  Activity,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Clock,
  CloudSun
} from 'lucide-react';
import { DailyFarmPlan } from '../../../types';

interface DailyFarmPlanViewProps {
  farmerId: string;
  farmerName: string;
  cropName?: string;
  location?: string;
}

export const DailyFarmPlanView: React.FC<DailyFarmPlanViewProps> = ({
  farmerId,
  farmerName,
  cropName = 'Standing Crop',
  location = 'Field'
}) => {
  const [plan, setPlan] = useState<DailyFarmPlan | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());

  const loadPlan = async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/ai/farm-plan?farmerId=${encodeURIComponent(farmerId)}&name=${encodeURIComponent(
          farmerName
        )}&crop=${encodeURIComponent(cropName)}&location=${encodeURIComponent(location)}`
      );
      if (res.ok) {
        const data = await res.json();
        setPlan(data.plan);
      }
    } catch (err) {
      console.error('Failed to load daily farm plan:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlan();
  }, [farmerId, cropName]);

  const toggleTask = (task: string) => {
    setCompletedTasks((prev) => {
      const next = new Set(prev);
      if (next.has(task)) next.delete(task);
      else next.add(task);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center animate-pulse">
        <RefreshCw className="w-6 h-6 text-emerald-400 mx-auto animate-spin mb-2" />
        <p className="text-xs text-slate-400">Synthesizing personalized Daily Farm Plan...</p>
      </div>
    );
  }

  if (!plan) return null;

  return (
    <div className="space-y-6">
      {/* Header card with weather outlook */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-emerald-500/30 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-black text-white">Daily Autonomous Farm Plan</h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                {plan.date}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Field intelligence for <strong className="text-white">{plan.farmerName}</strong> &bull; {plan.cropName} in {location}
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center gap-3">
            <CloudSun className="w-6 h-6 text-amber-400 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 block font-semibold">Weather Outlook</span>
              <p className="text-xs font-bold text-amber-200">{plan.weatherOutlook}</p>
            </div>
          </div>
        </div>

        {/* Urgent actions banner */}
        {plan.urgentActions && plan.urgentActions.length > 0 && (
          <div className="mt-4 p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/30 flex items-start gap-3 text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-200 font-bold">{plan.urgentActions[0].title}</strong>
              <p className="text-amber-300/90 mt-0.5">{plan.urgentActions[0].advice}</p>
            </div>
          </div>
        )}
      </div>

      {/* 3 Time-of-Day Blocks: Morning, Afternoon, Evening */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Morning Block */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 shadow-lg">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs border-b border-slate-800 pb-2">
            <Sun className="w-4 h-4" />
            <span>Morning Routine (06:00 - 10:00)</span>
          </div>
          <div className="space-y-2">
            {plan.morningScan.map((task, idx) => {
              const done = completedTasks.has(task);
              return (
                <button
                  key={idx}
                  onClick={() => toggleTask(task)}
                  className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-start gap-2.5 ${
                    done
                      ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300 line-through'
                      : 'bg-slate-950 border-slate-800/80 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <CheckCircle2
                    className={`w-4 h-4 shrink-0 mt-0.5 ${done ? 'text-emerald-400' : 'text-slate-600'}`}
                  />
                  <span className="leading-snug">{task}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Afternoon Block */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 shadow-lg">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs border-b border-slate-800 pb-2">
            <Compass className="w-4 h-4" />
            <span>Afternoon Heat Stress (12:00 - 04:00)</span>
          </div>
          <div className="space-y-2">
            {plan.afternoonScan.map((task, idx) => {
              const done = completedTasks.has(task);
              return (
                <button
                  key={idx}
                  onClick={() => toggleTask(task)}
                  className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-start gap-2.5 ${
                    done
                      ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300 line-through'
                      : 'bg-slate-950 border-slate-800/80 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <CheckCircle2
                    className={`w-4 h-4 shrink-0 mt-0.5 ${done ? 'text-emerald-400' : 'text-slate-600'}`}
                  />
                  <span className="leading-snug">{task}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Evening Block */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 shadow-lg">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs border-b border-slate-800 pb-2">
            <Activity className="w-4 h-4" />
            <span>Evening Summary & Review (05:00 - 08:00)</span>
          </div>
          <div className="space-y-2">
            {plan.eveningScan.map((task, idx) => {
              const done = completedTasks.has(task);
              return (
                <button
                  key={idx}
                  onClick={() => toggleTask(task)}
                  className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-start gap-2.5 ${
                    done
                      ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300 line-through'
                      : 'bg-slate-950 border-slate-800/80 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <CheckCircle2
                    className={`w-4 h-4 shrink-0 mt-0.5 ${done ? 'text-emerald-400' : 'text-slate-600'}`}
                  />
                  <span className="leading-snug">{task}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
