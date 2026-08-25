import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Play, 
  X, 
  CheckCircle2, 
  XCircle, 
  Settings2, 
  Clock, 
  AlertTriangle,
  Lock,
  Sparkles
} from 'lucide-react';
import { ActionPermissionMode, ActionPermissionRequest } from '../../types/autonomous/farmAutonomousTypes';
import { farmActionPermissionService } from '../../services/autonomous/farmActionPermissionService';

interface ActionPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRequestUpdated?: () => void;
}

export const ActionPermissionModal: React.FC<ActionPermissionModalProps> = ({
  isOpen,
  onClose,
  onRequestUpdated
}) => {
  const [currentMode, setCurrentMode] = useState<ActionPermissionMode>(farmActionPermissionService.getMode());
  const [pendingRequests, setPendingRequests] = useState<ActionPermissionRequest[]>(farmActionPermissionService.getPendingRequests());
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleModeChange = (mode: ActionPermissionMode) => {
    farmActionPermissionService.setMode(mode);
    setCurrentMode(mode);
    setPendingRequests(farmActionPermissionService.getPendingRequests());
  };

  const handleApprove = (reqId: string) => {
    farmActionPermissionService.approveAction(reqId);
    setPendingRequests(farmActionPermissionService.getPendingRequests());
    setActionSuccessMessage('Action approved and dispatched to field hardware.');
    setTimeout(() => {
      setActionSuccessMessage(null);
      if (onRequestUpdated) onRequestUpdated();
    }, 2000);
  };

  const handleReject = (reqId: string) => {
    farmActionPermissionService.rejectAction(reqId);
    setPendingRequests(farmActionPermissionService.getPendingRequests());
    if (onRequestUpdated) onRequestUpdated();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md z-10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  Autonomous Action & Authorization Controls
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Manage external pump, fertigation, and hardware trigger permissions.
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Mode Selector */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Farm Autonomy Security Mode
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Advisory */}
                <button
                  onClick={() => handleModeChange('advisory')}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    currentMode === 'advisory'
                      ? 'bg-slate-100 dark:bg-slate-800 border-slate-400 ring-2 ring-slate-400/20'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-xs text-slate-900 dark:text-white">
                    <Lock className="w-4 h-4 text-slate-500" />
                    <span>Advisory Mode</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    CroperX generates suggestions only. Zero external execution.
                  </p>
                </button>

                {/* Supervised (Default) */}
                <button
                  onClick={() => handleModeChange('supervised')}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    currentMode === 'supervised'
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/20'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-xs text-emerald-800 dark:text-emerald-300">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Supervised (Safe)</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Explicit farmer confirmation required before physical actions.
                  </p>
                </button>

                {/* Safe Automation */}
                <button
                  onClick={() => handleModeChange('safe_automation')}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    currentMode === 'safe_automation'
                      ? 'bg-indigo-50 dark:bg-indigo-950/40 border-indigo-500 ring-2 ring-indigo-500/20'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-xs text-indigo-800 dark:text-indigo-300">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span>Safe Automation</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Deterministic low-risk actions execute automatically.
                  </p>
                </button>
              </div>
            </div>

            {/* Success Toast */}
            {actionSuccessMessage && (
              <div className="p-3 bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 animate-bounce">
                <CheckCircle2 className="w-4 h-4" />
                <span>{actionSuccessMessage}</span>
              </div>
            )}

            {/* Pending Action Authorizations */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Pending Farmer Authorization Requests ({pendingRequests.filter(r => r.executionStatus === 'pending').length})
              </span>

              {pendingRequests.filter(r => r.executionStatus === 'pending').length === 0 ? (
                <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    All clear — No pending authorization requests.
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    The farm supervisor is operating in active surveillance mode.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingRequests.filter(r => r.executionStatus === 'pending').map((req) => (
                    <div
                      key={req.id}
                      className="p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/70 dark:bg-slate-800/60 space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                              {req.riskLevel} Risk
                            </span>
                            <span className="text-[11px] text-slate-400">Initiated by: {req.initiatedByAgent} agent</span>
                          </div>
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm mt-1">
                            {req.title}
                          </h4>
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                            {req.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                        <span className="text-[11px] text-slate-400">
                          Target: <strong className="text-slate-600 dark:text-slate-300">{req.targetZoneOrEquipment}</strong>
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleReject(req.id)}
                            className="px-3 py-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-rose-100 dark:hover:bg-rose-950/50 text-slate-700 dark:text-slate-300 hover:text-rose-600 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Decline</span>
                          </button>
                          <button
                            onClick={() => handleApprove(req.id)}
                            className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5"
                          >
                            <Play className="w-3.5 h-3.5 fill-current" />
                            <span>Authorize Action</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end bg-slate-50/50 dark:bg-slate-900/50">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-800 dark:text-white rounded-xl text-xs font-bold transition-colors"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
