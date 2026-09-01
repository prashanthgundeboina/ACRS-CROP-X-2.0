import React from 'react';
import { ShieldX, Clock, Calendar, AlertTriangle, PhoneCall, RefreshCw } from 'lucide-react';

interface AdviserExamLockoutViewProps {
  remainingDays?: number;
  nextEligibleAt?: string;
  reason?: string;
  onRefreshCheck?: () => void;
}

export const AdviserExamLockoutView: React.FC<AdviserExamLockoutViewProps> = ({
  remainingDays = 30,
  nextEligibleAt,
  reason = 'Repeated proctoring security violation recorded during examination.',
  onRefreshCheck,
}) => {
  const eligibleDateFormatted = nextEligibleAt
    ? new Date(nextEligibleAt).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : `${remainingDays} days remaining`;

  return (
    <div id="adviser-exam-lockout-card" className="max-w-2xl mx-auto bg-white dark:bg-stone-900 border border-rose-200 dark:border-rose-900/60 rounded-3xl p-6 md:p-10 shadow-lg text-center">
      <div className="w-20 h-20 mx-auto rounded-3xl bg-rose-100 dark:bg-rose-950/80 border-2 border-rose-500 text-rose-600 flex items-center justify-center mb-6 shadow-inner">
        <ShieldX className="w-10 h-10 animate-pulse" />
      </div>

      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 uppercase tracking-wider mb-3">
        <AlertTriangle className="w-3.5 h-3.5" /> Reattempt Eligibility Locked
      </span>

      <h2 className="text-2xl font-black text-stone-900 dark:text-stone-100 mb-2">
        Adviser Assessment Locked Out
      </h2>
      <p className="text-sm text-stone-600 dark:text-stone-400 max-w-md mx-auto mb-6">
        Your assessment access is currently locked in accordance with the CroperX Agronomist Proctoring Policy.
      </p>

      <div className="p-5 bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 rounded-2xl text-left my-6 space-y-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
            Recorded Termination Reason
          </span>
          <p className="text-sm font-semibold text-stone-800 dark:text-stone-200 mt-0.5">
            {reason}
          </p>
        </div>

        <div className="pt-3 border-t border-rose-200/60 dark:border-rose-900/40 flex items-center justify-between">
          <div className="flex items-center gap-2 text-stone-700 dark:text-stone-300">
            <Calendar className="w-4 h-4 text-rose-600" />
            <span className="text-xs font-medium">Next Eligible Attempt:</span>
          </div>
          <span className="text-xs font-bold text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-900/60 px-3 py-1 rounded-lg">
            {eligibleDateFormatted}
          </span>
        </div>
      </div>

      <div className="p-4 bg-stone-50 dark:bg-stone-800/40 rounded-2xl border border-stone-200 dark:border-stone-800 text-xs text-stone-500 dark:text-stone-400 space-y-2">
        <div className="flex items-center justify-center gap-2 font-semibold text-stone-700 dark:text-stone-300">
          <PhoneCall className="w-4 h-4 text-emerald-600" /> Need Administrative Review or Appeal?
        </div>
        <p>
          If you believe this violation was caused by an inadvertent hardware glitch, contact CroperX Agronomy Accreditation Administration at <strong className="text-stone-800 dark:text-stone-200">accreditation@croperx.org</strong>. Administrators can review your proctoring logs and grant a manual reattempt override.
        </p>
      </div>

      {onRefreshCheck && (
        <div className="mt-6 flex justify-center">
          <button
            id="btn-check-lockout-refresh"
            type="button"
            onClick={onRefreshCheck}
            className="flex items-center gap-2 px-5 py-2.5 bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-semibold text-sm rounded-xl transition cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Check Current Unlock Status</span>
          </button>
        </div>
      )}
    </div>
  );
};
