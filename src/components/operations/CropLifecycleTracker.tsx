import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sprout, 
  Calendar, 
  Clock, 
  ChevronRight, 
  Edit3, 
  Check, 
  X, 
  Droplets, 
  FlaskConical, 
  Scan, 
  CloudSun, 
  AlertCircle,
  HelpCircle,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { CropLifecycleState, CropGrowthStageId } from '../../types/operations/farmOperationsTypes';
import { cropLifecycleService } from '../../services/operations/cropLifecycleService';

interface CropLifecycleTrackerProps {
  lifecycle: CropLifecycleState;
  isExpertMode?: boolean;
  onUpdatePlantingDate: (newDate: string) => void;
  onUpdateStageOverride: (stageId: CropGrowthStageId | null) => void;
  onSelectTab: (tabId: string) => void;
}

export const CropLifecycleTracker: React.FC<CropLifecycleTrackerProps> = ({
  lifecycle,
  isExpertMode = false,
  onUpdatePlantingDate,
  onUpdateStageOverride,
  onSelectTab
}) => {
  const [isEditingStage, setIsEditingStage] = useState(false);
  const [isEditingPlantingDate, setIsEditingPlantingDate] = useState(false);
  const [tempDate, setTempDate] = useState(lifecycle.plantingDate);

  const stages = cropLifecycleService.getStagesForCrop(lifecycle.cropName);

  const handleSaveDate = () => {
    onUpdatePlantingDate(tempDate);
    setIsEditingPlantingDate(false);
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 border border-[#c8e6c9] shadow-sm space-y-6">
      {/* Header Banner */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#e8f5e9] flex items-center justify-center text-[#2e7d32] shrink-0">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase bg-[#e8f5e9] text-[#2e7d32] border border-[#c8e6c9]">
                My Crop Journey
              </span>
              {lifecycle.isManuallySetStage && (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-amber-100 text-amber-900 border border-amber-300">
                  Farmer Adjusted Stage
                </span>
              )}
            </div>
            <h2 className="font-serif font-bold text-xl sm:text-2xl text-[#1b2e1b] mt-0.5">
              {lifecycle.cropName} Lifecycle: {lifecycle.currentStageName}
            </h2>
            <p className="text-xs text-gray-500">
              {lifecycle.daysSincePlanting} days since sowing • Expected harvest in ~{lifecycle.daysUntilHarvest} days
            </p>
          </div>
        </div>

        {/* Quick Date & Stage Modifiers */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsEditingPlantingDate(!isEditingPlantingDate)}
            className="text-xs font-semibold text-gray-700 hover:text-[#2e7d32] py-1.5 px-3 rounded-xl border border-gray-200 hover:border-[#2e7d32] bg-gray-50 flex items-center gap-1.5 transition-colors min-h-[40px]"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Sowing Date: {lifecycle.plantingDate}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsEditingStage(!isEditingStage)}
            className="text-xs font-bold text-[#2e7d32] hover:bg-[#e8f5e9] py-1.5 px-3 rounded-xl border border-[#c8e6c9] bg-[#f1f8e9] flex items-center gap-1.5 transition-colors min-h-[40px]"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>{isEditingStage ? 'Close Stage Selector' : 'Change Stage'}</span>
          </button>
        </div>
      </div>

      {/* Date Edit Popover */}
      {isEditingPlantingDate && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="p-4 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-between flex-wrap gap-3"
        >
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-700">Set Actual Sowing Date:</span>
            <input
              type="date"
              value={tempDate}
              onChange={(e) => setTempDate(e.target.value)}
              className="text-xs p-2 rounded-xl border border-gray-300 font-mono bg-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSaveDate}
              className="px-3 py-1.5 rounded-xl bg-[#2e7d32] text-white text-xs font-bold hover:bg-[#1b5e20] flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Update Timeline</span>
            </button>
            <button
              type="button"
              onClick={() => setIsEditingPlantingDate(false)}
              className="px-3 py-1.5 rounded-xl bg-gray-200 text-gray-700 text-xs font-semibold"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      )}

      {/* Manual Stage Selector (Prevents model hallucination & respects farmer ground observation) */}
      <AnimatePresence>
        {isEditingStage && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 sm:p-5 rounded-2xl bg-[#fafdfa] border border-[#c8e6c9] space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-800">
                Select Your Crop's Exact Visual Growth Stage:
              </span>
              {lifecycle.isManuallySetStage && (
                <button
                  type="button"
                  onClick={() => {
                    onUpdateStageOverride(null);
                    setIsEditingStage(false);
                  }}
                  className="text-xs text-rose-600 hover:underline font-semibold"
                >
                  Reset to Auto Calculation
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {stages.map((stage) => {
                const isSelected = lifecycle.currentStageId === stage.stageId;
                return (
                  <button
                    key={stage.stageId}
                    type="button"
                    onClick={() => {
                      onUpdateStageOverride(stage.stageId);
                      setIsEditingStage(false);
                    }}
                    className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-2 ${
                      isSelected
                        ? 'bg-[#2e7d32] text-white border-[#2e7d32] shadow-sm'
                        : 'bg-white text-gray-800 border-gray-200 hover:border-[#2e7d32]'
                    }`}
                  >
                    <span className="text-xl">{stage.emoji}</span>
                    <div>
                      <span className="text-xs font-bold block leading-tight">
                        {stage.label.replace(/^🌱 |^🌿 |^🌼 |^🍅 |^🌾 |^🌽 |^⚪ /, '')}
                      </span>
                      <span className={`text-[10px] block mt-0.5 ${isSelected ? 'text-emerald-100' : 'text-gray-500'}`}>
                        ~{stage.durationDays} days
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lifecycle Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span className="font-medium">Lifecycle Journey Progress</span>
          <span className="font-mono font-bold text-[#2e7d32]">{lifecycle.stageProgressPercent}% Complete</span>
        </div>
        <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden p-0.5 border border-gray-200">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${lifecycle.stageProgressPercent}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-[#2e7d32] to-emerald-400 rounded-full"
          />
        </div>
      </div>

      {/* Stage Stepper Visualizer */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
        {stages.map((stage, idx) => {
          const isCurrent = lifecycle.currentStageId === stage.stageId;
          const isPassed = !isCurrent && stages.findIndex(s => s.stageId === lifecycle.currentStageId) > idx;

          return (
            <div
              key={stage.stageId}
              className={`p-3 rounded-2xl border transition-all flex flex-col justify-between space-y-1.5 ${
                isCurrent
                  ? 'bg-emerald-50 border-[#2e7d32] text-[#1b2e1b] ring-2 ring-[#2e7d32]/20'
                  : isPassed
                    ? 'bg-gray-50/70 border-gray-200 text-gray-700'
                    : 'bg-white border-gray-200 text-gray-400 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-base">{stage.emoji}</span>
                {isPassed && <Check className="w-3.5 h-3.5 text-emerald-600 font-bold" />}
                {isCurrent && (
                  <span className="text-[9px] font-bold font-mono px-1.5 py-0.5 rounded-sm bg-[#2e7d32] text-white">
                    NOW
                  </span>
                )}
              </div>
              <div>
                <span className="text-xs font-bold block line-clamp-1">
                  {stage.label.replace(/^🌱 |^🌿 |^🌼 |^🍅 |^🌾 |^🌽 |^⚪ /, '')}
                </span>
                <span className="text-[10px] text-gray-500 block">
                  {stage.durationDays}d span
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 5-Rule Practical Guidance Box: WHAT, WHY, WHEN, WHAT TO AVOID */}
      {(() => {
        const currentStageInfo = stages.find(s => s.stageId === lifecycle.currentStageId) || stages[0];

        return (
          <div className="p-4 sm:p-5 rounded-2xl bg-[#fafdfa] border border-[#c8e6c9] space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="font-serif font-bold text-sm text-[#1b2e1b] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#2e7d32]" />
                Stage Agronomic Advisory ({currentStageInfo.label})
              </span>
              <span className="text-xs font-mono text-gray-600 bg-white px-2.5 py-0.5 rounded-lg border border-gray-200">
                Water Demand: <strong className="capitalize text-emerald-800">{currentStageInfo.waterNeed}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white border border-gray-100 space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 block">
                  ✅ Recommended Priority Action:
                </span>
                <p className="text-gray-900 font-medium">
                  {currentStageInfo.action}
                </p>
                <span className="text-[11px] text-gray-500 block mt-1">
                  Key Nutrient: <strong>{currentStageInfo.nutrient}</strong>
                </span>
              </div>

              <div className="p-3 rounded-xl bg-white border border-gray-100 space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-800 block">
                  🛑 What to Avoid:
                </span>
                <p className="text-gray-800 font-medium">
                  {currentStageInfo.avoid}
                </p>
                <div className="flex items-center gap-1 flex-wrap pt-1">
                  <span className="text-[10px] text-gray-500">Risks to watch:</span>
                  {currentStageInfo.risks.map(r => (
                    <span key={r} className="text-[10px] bg-rose-50 text-rose-700 px-1.5 py-0.2 rounded border border-rose-200">
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Farmer Quick Action Hub */}
      <div className="pt-2 border-t border-gray-100 flex items-center gap-2 flex-wrap">
        <span className="text-xs font-bold text-gray-600 mr-1">Quick Tools:</span>
        <button
          type="button"
          onClick={() => onSelectTab('risk')}
          className="px-3 py-1.5 rounded-xl bg-[#e8f5e9] text-[#2e7d32] hover:bg-[#c8e6c9] font-bold text-xs flex items-center gap-1.5 transition-colors"
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>View Crop Health</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('irrigation')}
          className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs flex items-center gap-1.5 transition-colors"
        >
          <Droplets className="w-3.5 h-3.5" />
          <span>Check Water</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('fertilizer')}
          className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 font-bold text-xs flex items-center gap-1.5 transition-colors"
        >
          <FlaskConical className="w-3.5 h-3.5" />
          <span>Check Fertilizer</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('diagnosis')}
          className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-bold text-xs flex items-center gap-1.5 transition-colors"
        >
          <Scan className="w-3.5 h-3.5" />
          <span>Scan Plant</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectTab('weather')}
          className="px-3 py-1.5 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 font-bold text-xs flex items-center gap-1.5 transition-colors"
        >
          <CloudSun className="w-3.5 h-3.5" />
          <span>View Weather</span>
        </button>
      </div>
    </div>
  );
};
