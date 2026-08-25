import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertOctagon, AlertTriangle, CheckCircle, Clock, ShieldAlert, XCircle, ArrowRight } from 'lucide-react';
import { FarmEmergencyAlert } from '../../types/autonomous/farmAutonomousTypes';

interface FarmEmergencyBannerProps {
  alert: FarmEmergencyAlert | null;
  onDismiss?: () => void;
  onTakeAction?: () => void;
}

export const FarmEmergencyBanner: React.FC<FarmEmergencyBannerProps> = ({
  alert,
  onDismiss,
  onTakeAction
}) => {
  if (!alert || !alert.isActive) return null;

  const isCritical = alert.severity === 'critical';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.98 }}
        className={`rounded-2xl p-6 border shadow-xl relative overflow-hidden ${
          isCritical
            ? 'bg-gradient-to-r from-red-950/90 via-rose-900/80 to-red-950/90 border-red-500/50 text-white'
            : 'bg-gradient-to-r from-amber-950/90 via-orange-900/80 to-amber-950/90 border-amber-500/50 text-white'
        }`}
      >
        {/* Ambient pulse effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-white/10 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-xl ${isCritical ? 'bg-red-500/20 text-red-300 animate-pulse' : 'bg-amber-500/20 text-amber-300'}`}>
              <AlertOctagon className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-red-500 text-white">
                  {alert.seriousnessLevel}
                </span>
                <span className="text-xs text-red-200/80">Triggered: {alert.timestamp}</span>
              </div>
              <h3 className="text-xl font-bold tracking-tight text-white mt-1">
                {alert.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onTakeAction && (
              <button
                onClick={onTakeAction}
                className="px-4 py-2 bg-white text-red-900 hover:bg-red-50 font-semibold rounded-xl text-sm transition-all shadow-md flex items-center gap-1.5"
              >
                <span>Execute Mitigation</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="p-2 hover:bg-white/10 text-white/70 hover:text-white rounded-lg transition-colors"
                title="Acknowledge Alert"
              >
                <XCircle className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* 6 Mandatory Structured Emergency Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          <div className="bg-black/30 p-3.5 rounded-xl border border-white/5 space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-red-300/80 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" /> 1. What Happened?
            </span>
            <p className="text-white/90 leading-relaxed">{alert.whatHappened}</p>
          </div>

          <div className="bg-black/30 p-3.5 rounded-xl border border-white/5 space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-300/80 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5" /> 2. Which Field is Affected?
            </span>
            <p className="text-white font-medium">{alert.affectedField}</p>
            <p className="text-xs text-white/60">Target: High-vulnerability root zone</p>
          </div>

          <div className="bg-black/30 p-3.5 rounded-xl border border-white/5 space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-300/80 flex items-center gap-1.5">
              <AlertOctagon className="w-3.5 h-3.5" /> 3. How Serious Is It?
            </span>
            <p className="text-white/90 leading-relaxed">{alert.seriousnessLevel}: Immediate crop stress threat.</p>
          </div>

          <div className="bg-black/30 p-3.5 rounded-xl border border-emerald-500/20 space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" /> 4. What Should I Do Now?
            </span>
            <p className="text-emerald-100 font-medium leading-relaxed">{alert.whatToDoNow}</p>
          </div>

          <div className="bg-black/30 p-3.5 rounded-xl border border-red-500/20 space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-red-300 flex items-center gap-1.5">
              <XCircle className="w-3.5 h-3.5" /> 5. What Should I Avoid?
            </span>
            <p className="text-red-100 leading-relaxed">{alert.whatToAvoid}</p>
          </div>

          <div className="bg-black/30 p-3.5 rounded-xl border border-white/5 space-y-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-sky-300/80 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" /> 6. When to Check Again?
            </span>
            <p className="text-sky-100 leading-relaxed">{alert.whenToCheckAgain}</p>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
