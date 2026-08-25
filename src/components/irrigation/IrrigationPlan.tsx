import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Sun, 
  CloudSun, 
  Moon, 
  Droplets, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Sparkles,
  Info,
  Calendar,
  Layers,
  FileDown,
  Check
} from 'lucide-react';
import { FarmIrrigationPlan, ZoneIrrigationEvaluation } from '../../types';

interface IrrigationPlanProps {
  plan: FarmIrrigationPlan;
  onExecuteAction?: (actionName: string) => void;
  onSelectZone?: (zoneId: string) => void;
}

export const IrrigationPlan: React.FC<IrrigationPlanProps> = ({
  plan,
  onExecuteAction,
  onSelectZone
}) => {
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('croperx_irrigation_plan_completed');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const toggleItem = (key: string) => {
    setCompletedItems(prev => {
      const next = { ...prev, [key]: !prev[key] };
      try {
        localStorage.setItem('croperx_irrigation_plan_completed', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const timelineCards = [
    {
      key: 'morning',
      title: 'Morning Window (6:00 AM - 9:00 AM)',
      icon: CloudSun,
      data: plan.timeline.morning,
      tempText: 'Cooler surface temps & low wind drift'
    },
    {
      key: 'afternoon',
      title: 'Afternoon Window (12:00 PM - 4:00 PM)',
      icon: Sun,
      data: plan.timeline.afternoon,
      tempText: 'High solar radiation & rapid evaporation'
    },
    {
      key: 'evening',
      title: 'Evening Window (6:00 PM - 9:00 PM)',
      icon: Moon,
      data: plan.timeline.evening,
      tempText: 'Optimal overnight soil infiltration'
    }
  ];

  return (
    <div className="bg-white rounded-[2.5rem] border border-[#c8e6c9] p-6 sm:p-8 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#c8e6c9]/60 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#e8f5e9] text-[#2e7d32]">
              <Calendar className="w-5 h-5" />
            </span>
            <h3 className="font-serif text-2xl font-bold text-[#1b2e1b]">
              Today’s Precision Irrigation Plan
            </h3>
          </div>
          <p className="text-xs text-[#667e66]">
            Deterministic diurnal schedule tailored to minimize evaporation and maximize infiltration.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-[#667e66] bg-[#f8fcf8] px-3.5 py-2 rounded-2xl border border-[#c8e6c9]">
          <Clock className="w-4 h-4 text-[#4CAF50]" />
          <span>Plan generated at {plan.createdAt}</span>
        </div>
      </div>

      {/* Weather Outlook Insight */}
      <div className="p-4 rounded-2xl bg-[#f1f8f1] border border-[#c8e6c9] flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-[#2e7d32] flex-shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <div className="text-xs font-bold text-[#1b2e1b]">Diurnal Atmospheric Summary</div>
          <p className="text-xs text-[#2e7d32] leading-relaxed">
            {plan.weatherOutlookSummary}
          </p>
        </div>
      </div>

      {/* Timeline Schedule Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        {timelineCards.map(({ key, title, icon: Icon, data, tempText }) => {
          const isDone = !!completedItems[key];
          const isRecommended = data.recommended;

          return (
            <div
              key={key}
              className={`relative rounded-3xl p-5 border transition-all duration-200 flex flex-col justify-between space-y-4 ${
                isRecommended
                  ? 'bg-[#fcfdfc] border-[#4CAF50] shadow-md ring-2 ring-[#4CAF50]/20'
                  : 'bg-[#fafbfa] border-gray-200 text-gray-700'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-xl ${isRecommended ? 'bg-[#e8f5e9] text-[#2e7d32]' : 'bg-gray-100 text-gray-500'}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-600">
                      {key.toUpperCase()}
                    </span>
                  </div>

                  {isRecommended ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#2e7d32] text-white">
                      Recommended
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-500">
                      Standby
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-[#1b2e1b]">
                    {data.action}
                  </h4>
                  <p className="text-xs text-[#667e66] leading-relaxed">
                    {data.note}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[10px] text-gray-500 font-medium">
                  {tempText}
                </span>

                <button
                  onClick={() => toggleItem(key)}
                  className={`p-2 rounded-xl border transition-all cursor-pointer flex items-center gap-1 text-xs font-bold ${
                    isDone 
                      ? 'bg-[#2e7d32] border-[#2e7d32] text-white' 
                      : 'bg-white border-gray-200 text-gray-600 hover:border-[#4CAF50]'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isDone ? 'Completed' : 'Mark Done'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Assumptions & Mathematical Transparency */}
      {plan.summaryRecommendation.assumptionsUsed && plan.summaryRecommendation.assumptionsUsed.length > 0 && (
        <div className="p-4 rounded-2xl bg-white border border-[#c8e6c9]/80 space-y-2">
          <div className="text-[11px] font-mono font-bold uppercase tracking-widest text-[#667e66] flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-[#4CAF50]" />
            Calculation Assumptions & FAO-56 Methodology
          </div>
          <ul className="text-xs text-gray-600 space-y-1 pl-4 list-disc font-sans">
            {plan.summaryRecommendation.assumptionsUsed.map((asmp, idx) => (
              <li key={idx}>{asmp}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
