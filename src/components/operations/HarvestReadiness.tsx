import React from 'react';
import { motion } from 'motion/react';
import { 
  Tractor, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Sun, 
  ChevronRight, 
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { CropLifecycleState } from '../../types/operations/farmOperationsTypes';
import { harvestIntelligenceService } from '../../services/operations/harvestIntelligenceService';

interface HarvestReadinessProps {
  lifecycle: CropLifecycleState;
  isExpertMode?: boolean;
  onOpenPlanner: () => void;
  onSelectTab: (tabId: string) => void;
}

export const HarvestReadiness: React.FC<HarvestReadinessProps> = ({
  lifecycle,
  isExpertMode = false,
  onOpenPlanner,
  onSelectTab
}) => {
  const harvestInfo = harvestIntelligenceService.evaluateHarvestStatus(lifecycle);

  const getStatusBadge = () => {
    switch (harvestInfo.status) {
      case 'Harvest Window':
        return {
          bg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          dot: 'bg-emerald-600',
          label: '🌾 Harvest Window Active'
        };
      case 'Approaching':
        return {
          bg: 'bg-amber-100 text-amber-900 border-amber-300',
          dot: 'bg-amber-600',
          label: '⏳ Approaching Harvest Window'
        };
      case 'Past Expected Window':
        return {
          bg: 'bg-rose-100 text-rose-900 border-rose-300',
          dot: 'bg-rose-600',
          label: '⚠️ Past Window — Check Quality'
        };
      default:
        return {
          bg: 'bg-blue-100 text-blue-900 border-blue-200',
          dot: 'bg-blue-600',
          label: '🌱 Maturation In Progress'
        };
    }
  };

  const badge = getStatusBadge();

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 border border-[#c8e6c9] shadow-sm space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-700 shrink-0 border border-orange-200">
            <Tractor className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase border flex items-center gap-1.5 ${badge.bg}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                {badge.label}
              </span>
              <span className="text-xs text-gray-500">
                Target: {lifecycle.estimatedHarvestStartDate}
              </span>
            </div>
            <h2 className="font-serif font-bold text-xl sm:text-2xl text-[#1b2e1b] mt-0.5">
              Harvest Readiness & Timing Intelligence
            </h2>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenPlanner}
          className="px-4 py-2 rounded-xl bg-orange-600 text-white hover:bg-orange-700 text-xs font-bold transition-colors min-h-[40px] flex items-center gap-1.5 shadow-sm"
        >
          <Calendar className="w-4 h-4" />
          <span>Open Harvest Planner</span>
        </button>
      </div>

      {/* Readiness Status Card (WHAT, WHY, WHEN, WHAT TO AVOID) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#fffaf5] border border-orange-200 space-y-4">
        <div className="flex items-start justify-between flex-wrap gap-2">
          <div>
            <h3 className="font-bold text-base text-gray-900">
              {harvestInfo.title}
            </h3>
            <p className="text-xs text-gray-700 mt-1 leading-relaxed max-w-2xl">
              {harvestInfo.message}
            </p>
          </div>
          <div className="text-right font-mono text-xs text-gray-600 bg-white p-2.5 rounded-xl border border-orange-100 shrink-0">
            <span className="text-gray-400 block text-[10px] uppercase">Estimated Ripeness</span>
            <strong className="text-base text-orange-700 font-bold">{harvestInfo.ripenessPercentage}%</strong>
          </div>
        </div>

        {/* Ripeness Progress Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-gray-500 font-medium">
            <span>Maturation Phase</span>
            <span>~{harvestInfo.daysRemaining} days to estimated peak harvest</span>
          </div>
          <div className="h-2.5 w-full bg-orange-100/60 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${harvestInfo.ripenessPercentage}%` }}
              transition={{ duration: 0.8 }}
              className="h-full bg-gradient-to-r from-amber-500 to-orange-600 rounded-full"
            />
          </div>
        </div>

        {/* 5-Rule Practical Advice */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
          <div className="p-3 rounded-xl bg-white border border-orange-100 space-y-1">
            <span className="text-[10px] font-black uppercase text-emerald-800 block">
              ✅ Recommended Action:
            </span>
            <p className="text-gray-800 font-medium leading-normal">
              {harvestInfo.action}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-white border border-orange-100 space-y-1">
            <span className="text-[10px] font-black uppercase text-rose-800 block">
              🛑 What to Avoid:
            </span>
            <p className="text-gray-800 font-medium leading-normal">
              {harvestInfo.avoid}
            </p>
          </div>
        </div>

        {/* Recommended Weather Conditions */}
        <div className="p-2.5 rounded-xl bg-white border border-orange-100 flex items-center justify-between flex-wrap gap-2 text-xs text-gray-700">
          <div className="flex items-center gap-2">
            <Sun className="w-4 h-4 text-amber-500" />
            <span>Optimal Harvesting Window: <strong>{harvestInfo.recommendedPickingWeather}</strong></span>
          </div>
          <span className="text-[11px] text-gray-400 font-mono">
            Window: {lifecycle.estimatedHarvestStartDate} to {lifecycle.estimatedHarvestEndDate}
          </span>
        </div>
      </div>
    </div>
  );
};
