import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Brain, 
  Sparkles, 
  ShieldCheck, 
  RotateCw, 
  GitCompare, 
  FileText, 
  Scale, 
  Lock, 
  AlertTriangle,
  Play,
  HelpCircle,
  Clock,
  Compass,
  Sun,
  Moon
} from 'lucide-react';
import { SectionHeader } from '../ui/SectionHeader';
import { AppTabId } from '../HeaderIconMenuBar';
import { SoilData, FarmZone, CropRecommendation, FarmerProfile } from '../../types';
import { FarmEmergencyBanner } from './FarmEmergencyBanner';
import { FarmGoalSelector } from './FarmGoalSelector';
import { FarmDailyBriefingCard } from './FarmDailyBriefingCard';
import { AgentOrchestratorPanel, CommandTheme } from './AgentOrchestratorPanel';
import { FarmAgentStatusGrid } from './FarmAgentStatusGrid';
import { FarmConflictResolutionCard } from './FarmConflictResolutionCard';
import { FarmScenarioComparison } from './FarmScenarioComparison';
import { ClosedLoopVerificationCard } from './ClosedLoopVerificationCard';
import { FarmAuditLogViewer } from './FarmAuditLogViewer';
import { ActionPermissionModal } from './ActionPermissionModal';
import { farmSupervisorService } from '../../services/autonomous/farmSupervisorService';
import { farmGoalService } from '../../services/autonomous/farmGoalService';
import { farmActionPermissionService } from '../../services/autonomous/farmActionPermissionService';
import { farmAuditLogService } from '../../services/autonomous/farmAuditLogService';
import { FarmGoalId, AgentRecommendation } from '../../types/autonomous/farmAutonomousTypes';

interface FarmAICommandCenterProps {
  soilData: SoilData;
  cropName: string;
  recommendations?: CropRecommendation[];
  farmZones?: FarmZone[];
  weatherTemp?: number;
  weatherHumidity?: number;
  weatherRainProb?: number;
  weatherRainfallForecastMm?: number;
  isExpertMode?: boolean;
  onToggleExpertMode?: () => void;
  onSelectTab: (tab: AppTabId) => void;
  onOpenCallModal?: () => void;
  onOpenAskCroperX?: (question: string) => void;
  farmerProfile?: FarmerProfile | null;
}

export const FarmAICommandCenter: React.FC<FarmAICommandCenterProps> = ({
  soilData,
  cropName,
  recommendations,
  farmZones,
  weatherTemp,
  weatherHumidity,
  weatherRainProb,
  weatherRainfallForecastMm,
  isExpertMode = false,
  onToggleExpertMode,
  onSelectTab,
  onOpenCallModal,
  onOpenAskCroperX,
  farmerProfile
}) => {
  const [activeGoal, setActiveGoal] = useState<FarmGoalId>(farmGoalService.getActiveGoal());
  const [themeMode, setThemeMode] = useState<CommandTheme>('cinematic-dark');
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Evaluate supervisor state
  const supervisorState = farmSupervisorService.evaluateFarm({
    soilData,
    cropName: cropName || recommendations?.[0]?.crop || 'Tomato',
    farmZones,
    weatherTemp,
    weatherHumidity,
    weatherRainProb,
    weatherRainfallForecastMm
  });

  const closedLoopRecords = farmActionPermissionService.getClosedLoopRecords();
  const auditLogs = farmAuditLogService.getLogs();
  const pendingRequests = farmActionPermissionService.getPendingRequests();
  const currentMode = farmActionPermissionService.getMode();

  const handleGoalChange = (goal: FarmGoalId) => {
    setActiveGoal(goal);
    setRefreshTrigger(prev => prev + 1);
  };

  const handleExecuteRecommendation = (rec: AgentRecommendation) => {
    if (rec.requiredPermission === 'supervised') {
      farmActionPermissionService.createActionRequest({
        actionType: rec.agentId === 'irrigation' ? 'start_pump' : 'schedule_spray',
        title: rec.headline,
        description: rec.what,
        targetZoneOrEquipment: 'Zone A (North Block)',
        riskLevel: rec.severity === 'CRITICAL' ? 'HIGH' : rec.severity === 'HIGH' ? 'MEDIUM' : 'LOW',
        initiatedByAgent: rec.agentId
      });
      setIsPermissionModalOpen(true);
    } else {
      onSelectTab(rec.agentId === 'irrigation' ? 'irrigation' : rec.agentId === 'weather' ? 'weather' : 'operations');
    }
  };

  return (
    <div className={`space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 ${
      themeMode === 'cinematic-dark' ? 'theme-cinematic-dark' : 'theme-farm-light'
    }`}>
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
              <Brain className="w-7 h-7 animate-pulse" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Farm AI Supervisor & Command Center
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Phase 10 Multi-Agent
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
                Event-driven agricultural brain coordinating 9 specialized agronomy agents with explainable deterministic decisions.
              </p>
            </div>
          </div>
        </div>

        {/* Quick action buttons & Theme Toggle */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Theme Toggle Button */}
          <button
            onClick={() => setThemeMode(prev => prev === 'cinematic-dark' ? 'farm-light' : 'cinematic-dark')}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 border shadow-sm ${
              themeMode === 'cinematic-dark'
                ? 'bg-slate-900 text-amber-300 border-slate-700 hover:bg-slate-800'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
            title={`Switch to ${themeMode === 'cinematic-dark' ? 'Professional Farm Light' : '3D Cinematic Dark'} theme`}
          >
            {themeMode === 'cinematic-dark' ? (
              <>
                <Moon className="w-4 h-4 text-cyan-400" />
                <span>3D Cinematic Dark</span>
              </>
            ) : (
              <>
                <Sun className="w-4 h-4 text-amber-500" />
                <span>Professional Farm Light</span>
              </>
            )}
          </button>

          <button
            onClick={() => setIsPermissionModalOpen(true)}
            className="px-4 py-2.5 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 shadow-sm"
          >
            <Lock className="w-4 h-4" />
            <span>Permissions ({currentMode})</span>
            {pendingRequests.filter(r => r.executionStatus === 'pending').length > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px]">
                {pendingRequests.filter(r => r.executionStatus === 'pending').length}
              </span>
            )}
          </button>

          {onOpenAskCroperX && (
            <button
              onClick={() => onOpenAskCroperX('Explain what my farm supervisor is recommending today')}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors shadow-sm flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Ask Farm Brain</span>
            </button>
          )}
        </div>
      </div>

      {/* 1. Emergency Banner (If active) */}
      <FarmEmergencyBanner
        alert={supervisorState.emergencyAlert}
        onTakeAction={() => onSelectTab('irrigation')}
      />

      {/* 2. Active Farming Goal Selector */}
      <FarmGoalSelector
        activeGoal={activeGoal}
        onGoalChange={handleGoalChange}
      />

      {/* 3. Daily Autonomous Farm Briefing ("Good Morning — Your Farm Today") */}
      <FarmDailyBriefingCard
        briefing={supervisorState.dailyBriefing}
        onSelectTab={onSelectTab}
        onOpenAskCroperX={onOpenAskCroperX}
      />

      {/* 4. Conflict Resolution & Arbitration Card (If conflicts detected) */}
      <FarmConflictResolutionCard
        conflicts={supervisorState.conflicts}
        onAcceptResolution={() => setRefreshTrigger(prev => prev + 1)}
      />

      {/* 5. 3D Spatial Multi-Agent Orchestrator Panel */}
      <AgentOrchestratorPanel
        agentStatuses={supervisorState.agentStatuses}
        conflicts={supervisorState.conflicts}
        onExecuteRecommendation={handleExecuteRecommendation}
        activeGoal={activeGoal}
        themeMode={themeMode}
      />

      {/* 6. 9 Specialized Multi-Agent Status Grid */}
      <FarmAgentStatusGrid
        agentStatuses={supervisorState.agentStatuses}
        onExecuteRecommendation={handleExecuteRecommendation}
      />

      {/* 6. Agronomic "What-If" Decision Simulator */}
      <FarmScenarioComparison
        soilData={soilData}
        cropName={cropName || recommendations?.[0]?.crop || 'Tomato'}
      />

      {/* 7. Closed-Loop IoT Verification Pipeline */}
      <ClosedLoopVerificationCard
        records={closedLoopRecords}
      />

      {/* 8. Autonomous Decision Audit Log */}
      <FarmAuditLogViewer
        logs={auditLogs}
      />

      {/* Action Permission Modal */}
      <ActionPermissionModal
        isOpen={isPermissionModalOpen}
        onClose={() => setIsPermissionModalOpen(false)}
        onRequestUpdated={() => setRefreshTrigger(prev => prev + 1)}
      />
    </div>
  );
};
