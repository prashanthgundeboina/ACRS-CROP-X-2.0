import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Droplets, 
  Sprout, 
  TestTube, 
  CloudSun, 
  Bug, 
  TrendingUp, 
  Coins, 
  Calendar, 
  Radio, 
  ChevronRight, 
  Brain, 
  ShieldCheck, 
  AlertTriangle 
} from 'lucide-react';
import { FarmAgentId, FarmAgentStatus, AgentRecommendation } from '../../types/autonomous/farmAutonomousTypes';
import { AgentReasoningModal } from './AgentReasoningModal';

interface FarmAgentStatusGridProps {
  agentStatuses: Record<FarmAgentId, FarmAgentStatus>;
  onExecuteRecommendation?: (rec: AgentRecommendation) => void;
}

export const FarmAgentStatusGrid: React.FC<FarmAgentStatusGridProps> = ({
  agentStatuses,
  onExecuteRecommendation
}) => {
  const [selectedAgent, setSelectedAgent] = useState<FarmAgentStatus | null>(null);

  const getAgentIcon = (agentId: FarmAgentId) => {
    switch (agentId) {
      case 'irrigation': return <Droplets className="w-5 h-5" />;
      case 'crop_health': return <Sprout className="w-5 h-5" />;
      case 'soil': return <TestTube className="w-5 h-5" />;
      case 'weather': return <CloudSun className="w-5 h-5" />;
      case 'pest_disease': return <Bug className="w-5 h-5" />;
      case 'market': return <TrendingUp className="w-5 h-5" />;
      case 'finance': return <Coins className="w-5 h-5" />;
      case 'harvest': return <Calendar className="w-5 h-5" />;
      case 'iot_health': return <Radio className="w-5 h-5" />;
      default: return <Brain className="w-5 h-5" />;
    }
  };

  const getStatusColor = (status: FarmAgentStatus['status']) => {
    switch (status) {
      case 'alert': return 'border-red-500/50 bg-red-500/5 dark:bg-red-950/20';
      case 'warning': return 'border-amber-500/50 bg-amber-500/5 dark:bg-amber-950/20';
      default: return 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
              <Brain className="w-4 h-4" />
            </span>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              9 Specialized Multi-Agent Agronomy Hive
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time autonomous micro-agents evaluating farm telemetry, agronomic models, and market signals.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>9/9 Active & Coordinated</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(Object.values(agentStatuses) as FarmAgentStatus[]).map((agent) => {
          const isWarning = agent.status === 'warning' || agent.status === 'alert';

          return (
            <motion.div
              key={agent.agentId}
              whileHover={{ y: -2 }}
              onClick={() => setSelectedAgent(agent)}
              className={`rounded-2xl p-5 border shadow-sm cursor-pointer transition-all flex flex-col justify-between space-y-4 hover:shadow-md hover:border-emerald-500/50 ${getStatusColor(agent.status)}`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${isWarning ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200'}`}>
                      {getAgentIcon(agent.agentId)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                        {agent.name}
                      </h4>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">
                        {agent.role.split('.')[0]}
                      </span>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    agent.confidenceScore >= 90
                      ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                  }`}>
                    {agent.confidenceScore}%
                  </span>
                </div>

                {/* Current recommendation headline */}
                {agent.currentRecommendation && (
                  <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800/60 space-y-1">
                    <div className="flex items-center gap-1.5">
                      {isWarning ? (
                        <AlertTriangle className="w-3 h-3 text-amber-500" />
                      ) : (
                        <ShieldCheck className="w-3 h-3 text-emerald-500" />
                      )}
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                        {agent.currentRecommendation.domain}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-2 leading-relaxed">
                      {agent.currentRecommendation.headline}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/60 text-xs">
                <span className="text-[11px] text-slate-400">
                  Last evaluated: {agent.lastEvaluated}
                </span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 hover:underline">
                  <span>View Rationale</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Deep-Dive Reasoning Modal */}
      <AgentReasoningModal
        isOpen={Boolean(selectedAgent)}
        onClose={() => setSelectedAgent(null)}
        agentStatus={selectedAgent}
        onExecuteAction={onExecuteRecommendation}
      />
    </div>
  );
};
