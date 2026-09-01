import React, { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle2, Clock, Award, Eye, FileText, Monitor, CheckSquare, Square } from 'lucide-react';

interface AdviserExamInstructionsProps {
  onContinue: () => void;
  language: string;
}

export const AdviserExamInstructions: React.FC<AdviserExamInstructionsProps> = ({ onContinue, language }) => {
  const [acknowledged, setAcknowledged] = useState(false);

  return (
    <div id="adviser-exam-instructions-card" className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 md:p-8 shadow-sm">
      <div className="flex items-center gap-3 pb-5 border-b border-stone-200 dark:border-stone-800">
        <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
          <Shield className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">Step 1: Accreditation Exam Rules & Guidelines</h2>
          <p className="text-sm text-stone-500 dark:text-stone-400">CroperX Agronomist Assessment Standards & Integrity Protocol</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
        <div className="p-4 bg-stone-50 dark:bg-stone-800/50 rounded-xl border border-stone-200 dark:border-stone-700/60">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold mb-1">
            <Award className="w-4 h-4" /> Passing Score
          </div>
          <p className="text-2xl font-black text-stone-900 dark:text-stone-100">25 / 50</p>
          <p className="text-xs text-stone-500 mt-1">Minimum 50% score required to qualify</p>
        </div>

        <div className="p-4 bg-stone-50 dark:bg-stone-800/50 rounded-xl border border-stone-200 dark:border-stone-700/60">
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold mb-1">
            <Clock className="w-4 h-4" /> Exam Duration
          </div>
          <p className="text-2xl font-black text-stone-900 dark:text-stone-100">60 Mins</p>
          <p className="text-xs text-stone-500 mt-1">Timed automatically from start</p>
        </div>

        <div className="p-4 bg-stone-50 dark:bg-stone-800/50 rounded-xl border border-stone-200 dark:border-stone-700/60">
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-semibold mb-1">
            <Eye className="w-4 h-4" /> Proctoring Rule
          </div>
          <p className="text-2xl font-black text-stone-900 dark:text-stone-100">1 Warning</p>
          <p className="text-xs text-stone-500 mt-1">2nd security violation terminates exam</p>
        </div>
      </div>

      <div className="space-y-3 mb-6">
        <h3 className="font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-2 text-sm uppercase tracking-wider text-stone-500">
          <FileText className="w-4 h-4" /> Mandatory Proctored Guidelines
        </h3>

        <div className="space-y-2 text-sm text-stone-700 dark:text-stone-300">
          <div className="flex items-start gap-3 p-3 bg-stone-50 dark:bg-stone-800/40 rounded-lg">
            <Monitor className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-stone-900 dark:text-stone-100">Dedicated Full-Screen Environment:</strong> The exam must be taken in dedicated full-screen mode. Exiting fullscreen or minimizing the window triggers a security violation.
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-stone-50 dark:bg-stone-800/40 rounded-lg">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-stone-900 dark:text-stone-100">No Tab Switching & Clipboard Locking:</strong> Switching browser tabs, attempting text copy/cut/paste, or right-clicking is disabled and recorded in the immutable audit log.
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-stone-50 dark:bg-stone-800/40 rounded-lg">
            <Eye className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-stone-900 dark:text-stone-100">Continuous Camera & Microphone Presence:</strong> Your face must stay clearly visible within the camera boundary throughout the session. Multiple faces or absence triggers an automatic alert.
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 rounded-lg text-rose-900 dark:text-rose-200">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-rose-950 dark:text-rose-100">Strict 1-Warning Termination Policy:</strong> If a second security violation is logged, your session is immediately terminated with a 30-day (1-month) lockout penalty before reattempt eligibility.
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          id="btn-adviser-rules-ack"
          type="button"
          onClick={() => setAcknowledged(!acknowledged)}
          className="flex items-center gap-2 text-sm font-medium text-stone-800 dark:text-stone-200 hover:text-emerald-600 cursor-pointer"
        >
          {acknowledged ? (
            <CheckSquare className="w-5 h-5 text-emerald-600" />
          ) : (
            <Square className="w-5 h-5 text-stone-400" />
          )}
          <span>I have read, understood, and accept all proctored examination rules.</span>
        </button>

        <button
          id="btn-adviser-continue-instructions"
          type="button"
          disabled={!acknowledged}
          onClick={onContinue}
          className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-300 dark:disabled:bg-stone-800 text-white font-semibold rounded-xl transition shadow-sm disabled:cursor-not-allowed cursor-pointer"
        >
          Continue to Voice Guidance
        </button>
      </div>
    </div>
  );
};
