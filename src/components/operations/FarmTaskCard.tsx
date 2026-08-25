import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  CheckCircle2, 
  Clock, 
  SkipForward, 
  HelpCircle, 
  MessageSquare, 
  AlertTriangle, 
  ExternalLink,
  ChevronDown,
  ChevronUp,
  MapPin
} from 'lucide-react';
import { FarmTask, FarmTaskStatus } from '../../types/operations/farmOperationsTypes';
import { farmCalendarService } from '../../services/operations/farmCalendarService';

interface FarmTaskCardProps {
  task: FarmTask;
  isExpertMode?: boolean;
  onUpdateStatus: (taskId: string, status: FarmTaskStatus) => void;
  onSnooze: (taskId: string, days: number) => void;
  onOpenAskCroperX?: (question: string) => void;
  onSelectTab?: (tabId: string) => void;
}

export const FarmTaskCard: React.FC<FarmTaskCardProps> = ({
  task,
  isExpertMode = false,
  onUpdateStatus,
  onSnooze,
  onOpenAskCroperX,
  onSelectTab
}) => {
  const [showDetails, setShowDetails] = useState(false);
  const icon = farmCalendarService.getCategoryIcon(task.category);
  const color = farmCalendarService.getCategoryColor(task.category);

  const isCompleted = task.status === 'Completed';
  const isSkipped = task.status === 'Skipped';
  const isSnoozed = task.status === 'Snoozed';

  const priorityBadge = () => {
    switch (task.priority) {
      case 'Critical':
        return <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-300">CRITICAL</span>;
      case 'High':
        return <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">HIGH</span>;
      case 'Medium':
        return <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">MEDIUM</span>;
      default:
        return <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">ROUTINE</span>;
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl p-4 sm:p-5 border transition-all ${
        isCompleted
          ? 'bg-emerald-50/40 border-emerald-200 opacity-80'
          : isSkipped
            ? 'bg-gray-50/60 border-gray-200 opacity-60'
            : isSnoozed
              ? 'bg-amber-50/30 border-amber-200'
              : 'bg-white border-gray-200 shadow-sm hover:border-[#2e7d32]/40'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        {/* Title and Badge */}
        <div className="flex items-start gap-3 min-w-0">
          <div className={`w-10 h-10 rounded-xl ${color.bg} ${color.text} flex items-center justify-center text-lg shrink-0 border ${color.border}`}>
            {icon}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {priorityBadge()}
              {task.zone && (
                <span className="text-[11px] text-gray-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-gray-400" />
                  {task.zone}
                </span>
              )}
              {task.due_time && (
                <span className="text-[11px] text-gray-500 font-mono">
                  {task.due_time}
                </span>
              )}
            </div>

            <h3 className={`font-bold text-sm sm:text-base mt-1 text-gray-900 leading-snug ${isCompleted ? 'line-through text-gray-500' : ''}`}>
              {task.title}
            </h3>

            {/* Weather Conflict Warning */}
            {task.weatherWarning && !isCompleted && (
              <div className="mt-2 p-2.5 rounded-xl bg-amber-50 border border-amber-300 flex items-start gap-2 text-xs text-amber-900 font-medium">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{task.weatherWarning}</span>
              </div>
            )}
          </div>
        </div>

        {/* Quick Check Action */}
        <button
          type="button"
          onClick={() => onUpdateStatus(task.task_id, isCompleted ? 'Pending' : 'Completed')}
          title={isCompleted ? 'Mark Pending' : 'Mark Complete'}
          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
            isCompleted
              ? 'bg-emerald-600 text-white hover:bg-emerald-700'
              : 'bg-gray-100 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 border border-gray-200'
          }`}
        >
          <CheckCircle2 className="w-5 h-5" />
        </button>
      </div>

      {/* Expandable Agronomic Justification (WHAT, WHY, WHAT TO AVOID) */}
      <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setShowDetails(!showDetails)}
          className="text-xs font-semibold text-emerald-800 hover:underline flex items-center gap-1"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>{showDetails ? 'Hide Explanation' : 'Why this task?'}</span>
          {showDetails ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          {!isCompleted && !isSkipped && (
            <>
              <button
                type="button"
                onClick={() => onSnooze(task.task_id, 1)}
                className="px-2.5 py-1 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 flex items-center gap-1 border border-gray-200"
              >
                <Clock className="w-3 h-3 text-gray-500" />
                <span>Snooze (+1d)</span>
              </button>

              <button
                type="button"
                onClick={() => onUpdateStatus(task.task_id, 'Skipped')}
                className="px-2 py-1 rounded-lg text-xs font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800 flex items-center gap-1"
              >
                <SkipForward className="w-3 h-3 text-gray-400" />
                <span>Skip</span>
              </button>
            </>
          )}

          {onOpenAskCroperX && (
            <button
              type="button"
              onClick={() => onOpenAskCroperX(`Tell me why this task is needed: "${task.title}"`)}
              className="px-2.5 py-1 rounded-lg text-xs font-bold text-[#2e7d32] hover:bg-[#e8f5e9] flex items-center gap-1 border border-[#c8e6c9]"
            >
              <MessageSquare className="w-3 h-3 text-[#2e7d32]" />
              <span>Ask AI</span>
            </button>
          )}

          {task.navTab && onSelectTab && (
            <button
              type="button"
              onClick={() => onSelectTab(task.navTab!)}
              className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#2e7d32] text-white hover:bg-[#1b5e20] flex items-center gap-1"
            >
              <span>{task.navLabel || 'Open Tool'}</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {showDetails && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-3 p-3.5 rounded-xl bg-gray-50 border border-gray-200 text-xs space-y-2"
        >
          <div>
            <span className="font-bold text-gray-800 block">Agronomic Purpose (WHY):</span>
            <p className="text-gray-600 mt-0.5">{task.reason}</p>
          </div>
          {task.whatToAvoid && (
            <div>
              <span className="font-bold text-rose-700 block">What to avoid:</span>
              <p className="text-rose-900 mt-0.5">{task.whatToAvoid}</p>
            </div>
          )}
          {isExpertMode && (
            <div className="pt-2 border-t border-gray-200 text-[11px] text-gray-400 font-mono">
              Task ID: {task.task_id} • Origin: {task.created_from} • Due: {task.due_date}
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};
