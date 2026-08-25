import React from 'react';
import { motion } from 'motion/react';
import { 
  CheckCircle2, 
  Activity, 
  ArrowRight, 
  Clock, 
  Radio, 
  ShieldCheck, 
  Droplets,
  RotateCw,
  AlertCircle
} from 'lucide-react';
import { ClosedLoopVerificationRecord } from '../../types/autonomous/farmAutonomousTypes';

interface ClosedLoopVerificationCardProps {
  records: ClosedLoopVerificationRecord[];
}

export const ClosedLoopVerificationCard: React.FC<ClosedLoopVerificationCardProps> = ({
  records
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-teal-800/60">
              <RotateCw className="w-5 h-5" />
            </span>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              IoT Closed-Loop Verification Pipeline
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Every authorized farm action is tracked through real pre- vs post-execution telemetry response.
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1 bg-teal-50 dark:bg-teal-950/50 rounded-full text-xs font-semibold text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Closed-Loop Telemetry Active</span>
        </div>
      </div>

      {/* Visual 5-Stage Verification Step Pipeline */}
      <div className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-700/60">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-3">
          Automated Closed-Loop Workflow
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-1">
            <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 mx-auto flex items-center justify-center font-bold text-[10px]">1</span>
            <p className="font-bold text-slate-800 dark:text-slate-200">1. Sensor</p>
            <p className="text-[10px] text-slate-400">Moisture: 24%</p>
          </div>
          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-1">
            <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 mx-auto flex items-center justify-center font-bold text-[10px]">2</span>
            <p className="font-bold text-slate-800 dark:text-slate-200">2. Decision</p>
            <p className="text-[10px] text-slate-400">Pump Advised</p>
          </div>
          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-1">
            <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 mx-auto flex items-center justify-center font-bold text-[10px]">3</span>
            <p className="font-bold text-slate-800 dark:text-slate-200">3. Approval</p>
            <p className="text-[10px] text-slate-400">Farmer Auth</p>
          </div>
          <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-1">
            <span className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 mx-auto flex items-center justify-center font-bold text-[10px]">4</span>
            <p className="font-bold text-slate-800 dark:text-slate-200">4. Execution</p>
            <p className="text-[10px] text-slate-400">Pump Active</p>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-300 dark:border-emerald-800 space-y-1 col-span-2 sm:col-span-1">
            <span className="w-5 h-5 rounded-full bg-emerald-600 text-white mx-auto flex items-center justify-center font-bold text-[10px]">5</span>
            <p className="font-bold text-emerald-900 dark:text-emerald-300">5. Verified</p>
            <p className="text-[10px] text-emerald-700 dark:text-emerald-400">+20% Rise</p>
          </div>
        </div>
      </div>

      {/* Verification Log Records */}
      <div className="space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Recent Hardware Response Verifications
        </span>

        {records.length === 0 ? (
          <p className="text-sm text-slate-400">No closed-loop verification events recorded yet.</p>
        ) : (
          <div className="space-y-3">
            {records.map((rec) => (
              <div
                key={rec.id}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <h5 className="font-bold text-slate-900 dark:text-white text-sm">
                      {rec.actionName}
                    </h5>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 self-start sm:self-auto">
                    {rec.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block mb-0.5">
                      Pre-Action Baseline ({rec.preActionTelemetry.timestamp})
                    </span>
                    <p className="text-slate-700 dark:text-slate-300 font-medium">
                      Moisture: <strong className="text-slate-900 dark:text-white">{rec.preActionTelemetry.moisturePercent}%</strong> | Temp: {rec.preActionTelemetry.temperatureC}°C
                    </p>
                  </div>

                  <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/20 rounded-xl border border-emerald-200/80 dark:border-emerald-800/40">
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase tracking-wider font-semibold block mb-0.5">
                      Post-Action Telemetry ({rec.postActionTelemetry.timestamp})
                    </span>
                    <p className="text-slate-700 dark:text-slate-300 font-medium">
                      Moisture: <strong className="text-emerald-700 dark:text-emerald-300">{rec.postActionTelemetry.moisturePercent}%</strong> | {rec.observedResponse}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 italic">
                  Note: {rec.notes}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
