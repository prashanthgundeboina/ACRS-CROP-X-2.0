import React from 'react';
import { AlertOctagon, ShieldAlert, CheckCircle } from 'lucide-react';

interface AdviserSecurityWarningModalProps {
  isOpen: boolean;
  violationType: string;
  warningMessage: string;
  remainingWarnings: number;
  onAcknowledge: () => void;
}

export const AdviserSecurityWarningModal: React.FC<AdviserSecurityWarningModalProps> = ({
  isOpen,
  violationType,
  warningMessage,
  remainingWarnings,
  onAcknowledge,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        id="adviser-security-warning-modal"
        className="w-full max-w-lg bg-stone-900 border-2 border-rose-500 rounded-2xl p-6 md:p-8 text-white shadow-2xl relative"
      >
        <div className="flex items-center gap-3 text-rose-500 mb-4 pb-4 border-b border-stone-800">
          <div className="w-12 h-12 rounded-xl bg-rose-950/80 border border-rose-600 flex items-center justify-center">
            <AlertOctagon className="w-7 h-7 text-rose-500 animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">PROCTORING SECURITY WARNING</h3>
            <p className="text-xs text-rose-400 font-semibold tracking-wider uppercase">
              Violation Recorded in Immutable Audit Trail
            </p>
          </div>
        </div>

        <div className="space-y-4 my-4">
          <div className="p-4 bg-rose-950/40 border border-rose-900/60 rounded-xl">
            <div className="text-xs font-semibold text-rose-400 uppercase tracking-wider mb-1">
              Detected Violation Event
            </div>
            <p className="text-sm font-medium text-rose-100">{warningMessage || violationType}</p>
          </div>

          <div className="p-4 bg-stone-800/80 rounded-xl border border-stone-700">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">
              <span>Security Warning Policy</span>
              <span className="text-amber-400 font-extrabold">{1 - remainingWarnings} OF 1 WARNINGS USED</span>
            </div>
            <p className="text-xs text-stone-300 leading-relaxed">
              CroperX maintains strict agronomic integrity. Any subsequent violation (exiting fullscreen, tab switching, multiple faces, text copying) will immediately <strong className="text-rose-400">TERMINATE</strong> your assessment and enforce a 30-day lockout period.
            </p>
          </div>
        </div>

        <div className="pt-4 mt-6 border-t border-stone-800 flex justify-end">
          <button
            id="btn-ack-security-warning"
            type="button"
            onClick={onAcknowledge}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition shadow-lg shadow-rose-900/40 cursor-pointer"
          >
            <CheckCircle className="w-5 h-5" />
            <span>I Acknowledge & Return to Full-Screen Exam</span>
          </button>
        </div>
      </div>
    </div>
  );
};
