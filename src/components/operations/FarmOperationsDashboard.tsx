import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sprout, 
  Calendar, 
  CheckCircle2, 
  FlaskConical, 
  Bug, 
  Tractor, 
  TrendingUp, 
  FileText, 
  Clock, 
  Sliders, 
  HelpCircle, 
  MessageSquare,
  Sparkles,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { SoilData, FarmZone, CropRecommendation } from '../../types';
import { 
  CropLifecycleState, 
  FarmTask, 
  FarmTaskStatus, 
  CropGrowthStageId 
} from '../../types/operations/farmOperationsTypes';
import { cropLifecycleService } from '../../services/operations/cropLifecycleService';
import { farmTaskService } from '../../services/operations/farmTaskService';
import { CropLifecycleTracker } from './CropLifecycleTracker';
import { FarmCalendar } from './FarmCalendar';
import { FertilizerTimingCard } from './FertilizerTimingCard';
import { CropProtectionWatch } from './CropProtectionWatch';
import { HarvestReadiness } from './HarvestReadiness';
import { HarvestPlanner } from './HarvestPlanner';
import { PostHarvestPlanner } from './PostHarvestPlanner';
import { MarketDecisionAssistant } from './MarketDecisionAssistant';
import { FarmWeeklyReport } from './FarmWeeklyReport';

interface FarmOperationsDashboardProps {
  soilData: SoilData;
  cropName: string;
  recommendations?: CropRecommendation[];
  farmZones?: FarmZone[];
  weatherTemp: number;
  weatherHumidity: number;
  weatherRainProb: number;
  weatherRainfallForecastMm: number;
  isExpertMode: boolean;
  onToggleExpertMode: () => void;
  onSelectTab: (tabId: string) => void;
  onOpenCallModal?: () => void;
  onOpenAskCroperX?: (question: string) => void;
}

export const FarmOperationsDashboard: React.FC<FarmOperationsDashboardProps> = ({
  soilData,
  cropName = 'Tomato',
  recommendations,
  farmZones = [],
  weatherTemp,
  weatherHumidity,
  weatherRainProb,
  weatherRainfallForecastMm,
  isExpertMode,
  onToggleExpertMode,
  onSelectTab,
  onOpenCallModal,
  onOpenAskCroperX
}) => {
  const [activeSection, setActiveSection] = useState<'all' | 'lifecycle' | 'calendar' | 'fertilizer' | 'protection' | 'harvest' | 'market' | 'weekly'>('all');
  const [isHarvestPlannerOpen, setIsHarvestPlannerOpen] = useState(false);

  // Crop Lifecycle State
  const [lifecycle, setLifecycle] = useState<CropLifecycleState>(() => 
    cropLifecycleService.evaluateLifecycle(cropName)
  );

  // Farm Tasks State
  const [tasks, setTasks] = useState<FarmTask[]>(() => 
    farmTaskService.getTasks()
  );

  // Sync tasks and lifecycle when crop or telemetry changes
  useEffect(() => {
    const updatedLifecycle = cropLifecycleService.evaluateLifecycle(cropName);
    setLifecycle(updatedLifecycle);

    const syncedTasks = farmTaskService.syncLiveEngineTasks({
      soilData,
      cropName,
      growthStage: updatedLifecycle.currentStageName,
      weatherTemp,
      weatherRainProb,
      weatherRainfallForecastMm,
      isSoilDry: (soilData.soil_moisture ?? 25) < 30
    });
    setTasks(syncedTasks);
  }, [cropName, soilData.soil_moisture, weatherRainProb, weatherTemp]);

  const handleUpdatePlantingDate = (newDate: string) => {
    cropLifecycleService.setPlantingDate(newDate);
    setLifecycle(cropLifecycleService.evaluateLifecycle(cropName, newDate));
  };

  const handleUpdateStageOverride = (stageId: CropGrowthStageId | null) => {
    cropLifecycleService.setStageOverride(cropName, stageId);
    setLifecycle(cropLifecycleService.evaluateLifecycle(cropName));
  };

  const handleUpdateTaskStatus = (taskId: string, status: FarmTaskStatus) => {
    const updated = farmTaskService.updateTaskStatus(taskId, status);
    setTasks(updated);
  };

  const handleSnoozeTask = (taskId: string, days: number) => {
    const updated = farmTaskService.snoozeTask(taskId, days);
    setTasks(updated);
  };

  const handleAddTask = (newTask: Omit<FarmTask, 'task_id'>) => {
    const created = farmTaskService.addTask(newTask);
    setTasks([created, ...tasks]);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner with Navigation & Mode Switcher */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-[#c8e6c9] shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase bg-[#e8f5e9] text-[#2e7d32] border border-[#c8e6c9] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Phase 8 • Farm Operations AI
            </span>
            <span className="text-xs text-gray-500 font-mono">
              Active Crop: <strong>{cropName}</strong>
            </span>
          </div>
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-[#1b2e1b] mt-1">
            🌾 Smart Farm Operations Assistant
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1 max-w-2xl">
            End-to-end lifecycle orchestration: plan sowing, sync tasks with live weather forecasts, log fertilizer doses, scout canopy hazards, coordinate harvest logistics, and maximize mandi net returns.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={onToggleExpertMode}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 border ${
              isExpertMode
                ? 'bg-purple-900 text-purple-100 border-purple-800 shadow-sm'
                : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{isExpertMode ? 'Expert Mode ON' : 'Simple Mode'}</span>
          </button>

          {onOpenAskCroperX && (
            <button
              type="button"
              onClick={() => onOpenAskCroperX("What should I do today in my farm operations?")}
              className="px-3.5 py-2 rounded-2xl bg-[#2e7d32] text-white hover:bg-[#1b5e20] text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Ask Operations AI</span>
            </button>
          )}
        </div>
      </div>

      {/* Sub-Section Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'all', label: 'All Operations', icon: '🌾' },
          { id: 'lifecycle', label: 'My Crop Journey', icon: '🌱' },
          { id: 'calendar', label: 'Farm Calendar', icon: '📅' },
          { id: 'fertilizer', label: 'Fertilizer Timing', icon: '🧪' },
          { id: 'protection', label: 'Protection Watch', icon: '🐛' },
          { id: 'harvest', label: 'Harvest Planning', icon: '🚜' },
          { id: 'market', label: 'Market & Selling', icon: '💰' },
          { id: 'weekly', label: 'Weekly Report', icon: '📊' }
        ].map((sec) => (
          <button
            key={sec.id}
            type="button"
            onClick={() => setActiveSection(sec.id as any)}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap flex items-center gap-2 transition-all ${
              activeSection === sec.id
                ? 'bg-[#2e7d32] text-white shadow-sm'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <span>{sec.icon}</span>
            <span>{sec.label}</span>
          </button>
        ))}
      </div>

      {/* Main Subcomponents */}
      <div className="space-y-8">
        {/* 1. Crop Lifecycle Tracker */}
        {(activeSection === 'all' || activeSection === 'lifecycle') && (
          <CropLifecycleTracker
            lifecycle={lifecycle}
            isExpertMode={isExpertMode}
            onUpdatePlantingDate={handleUpdatePlantingDate}
            onUpdateStageOverride={handleUpdateStageOverride}
            onSelectTab={onSelectTab}
          />
        )}

        {/* 2. Farm Calendar */}
        {(activeSection === 'all' || activeSection === 'calendar') && (
          <FarmCalendar
            tasks={tasks}
            isExpertMode={isExpertMode}
            onUpdateTaskStatus={handleUpdateTaskStatus}
            onSnoozeTask={handleSnoozeTask}
            onAddTask={handleAddTask}
            onOpenAskCroperX={onOpenAskCroperX}
            onSelectTab={onSelectTab}
          />
        )}

        {/* 3. Fertilizer Timing Intelligence & History */}
        {(activeSection === 'all' || activeSection === 'fertilizer') && (
          <FertilizerTimingCard
            cropName={cropName}
            growthStage={lifecycle.currentStageName}
            soilMoisture={soilData.soil_moisture ?? 28}
            soilN={soilData.nitrogen ?? 80}
            soilP={soilData.phosphorus ?? 40}
            soilK={soilData.potassium ?? 40}
            weatherRainProb={weatherRainProb}
            weatherRainfallForecastMm={weatherRainfallForecastMm}
            isExpertMode={isExpertMode}
            onSelectTab={onSelectTab}
          />
        )}

        {/* 4. Crop Protection Watch & Inspection History */}
        {(activeSection === 'all' || activeSection === 'protection') && (
          <CropProtectionWatch
            cropName={cropName}
            growthStage={lifecycle.currentStageName}
            temperature={weatherTemp}
            humidity={weatherHumidity}
            rainfall={weatherRainfallForecastMm}
            isExpertMode={isExpertMode}
            onSelectTab={onSelectTab}
          />
        )}

        {/* 5. Harvest Readiness & Planner */}
        {(activeSection === 'all' || activeSection === 'harvest') && (
          <div className="space-y-6">
            <HarvestReadiness
              lifecycle={lifecycle}
              isExpertMode={isExpertMode}
              onOpenPlanner={() => setIsHarvestPlannerOpen(true)}
              onSelectTab={onSelectTab}
            />

            {isHarvestPlannerOpen && (
              <HarvestPlanner
                cropName={cropName}
                isExpertMode={isExpertMode}
                onClose={() => setIsHarvestPlannerOpen(false)}
              />
            )}

            <PostHarvestPlanner
              cropName={cropName}
              isExpertMode={isExpertMode}
              onSelectTab={onSelectTab}
            />
          </div>
        )}

        {/* 6. Market Decision Assistant */}
        {(activeSection === 'all' || activeSection === 'market') && (
          <MarketDecisionAssistant
            cropName={cropName}
            isExpertMode={isExpertMode}
            onSelectTab={onSelectTab}
          />
        )}

        {/* 7. Weekly Report Summary */}
        {(activeSection === 'all' || activeSection === 'weekly') && (
          <FarmWeeklyReport
            cropName={cropName}
            isExpertMode={isExpertMode}
            onOpenAskCroperX={onOpenAskCroperX}
            onSelectTab={onSelectTab}
          />
        )}
      </div>
    </div>
  );
};
