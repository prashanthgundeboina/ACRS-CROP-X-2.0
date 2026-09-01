import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  Send,
  Award,
  Clock,
  Check,
  X,
  FileText,
  ShieldCheck,
  Layers,
  Sprout,
  Activity,
  ChevronRight,
  Loader2,
  RefreshCw,
  Camera,
  Mic,
  Maximize,
  AlertTriangle,
  Lock
} from 'lucide-react';
import { ADVISER_ASSESSMENT_PUBLIC_QUESTIONS, AssessmentQuestionPublic } from '../../data/adviserAssessmentData';
import { AdviserExamInstructions } from './exam/AdviserExamInstructions';
import { AdviserExamVoiceInstructions } from './exam/AdviserExamVoiceInstructions';
import { AdviserExamPermissionGate } from './exam/AdviserExamPermissionGate';
import { AdviserSecurityWarningModal } from './exam/AdviserSecurityWarningModal';
import { AdviserExamLockoutView } from './exam/AdviserExamLockoutView';

interface AdviserAssessmentViewProps {
  mobileNumber: string;
  applicantName?: string;
  onComplete: (result: {
    score: number;
    total: number;
    percentage: number;
    isEligible: boolean;
    status: string;
    message: string;
    categoryBreakdown?: Record<string, { correct: number; total: number }>;
  }) => void;
  onCancel?: () => void;
}

export type AssessmentStep = 'ELIGIBILITY_CHECK' | 'INSTRUCTIONS' | 'VOICE_GUIDANCE' | 'DEVICE_CHECK' | 'EXAM_ACTIVE' | 'LOCKED_OUT';

export const AdviserAssessmentView: React.FC<AdviserAssessmentViewProps> = ({
  mobileNumber,
  applicantName = 'Adviser Applicant',
  onComplete,
  onCancel
}) => {
  const [currentStep, setCurrentStep] = useState<AssessmentStep>('ELIGIBILITY_CHECK');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [lockoutData, setLockoutData] = useState<{ remainingDays?: number; nextEligibleAt?: string; reason?: string } | null>(null);

  const [questions, setQuestions] = useState<AssessmentQuestionPublic[]>(ADVISER_ASSESSMENT_PUBLIC_QUESTIONS);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState<boolean>(false);

  // Proctoring & Timer State
  const [mediaStream, setMediaStream] = useState<MediaStream | null>(null);
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(60 * 60); // 60 minutes
  const [warningModalOpen, setWarningModalOpen] = useState(false);
  const [warningMessage, setWarningMessage] = useState('');
  const [violationType, setViolationType] = useState('');
  const [remainingWarnings, setRemainingWarnings] = useState(1);
  const [warningCount, setWarningCount] = useState(0);

  const miniVideoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 1. Initial Eligibility Check
  const checkEligibility = async () => {
    try {
      const res = await fetch(`/api/adviser/assessment/eligibility?mobile=${encodeURIComponent(mobileNumber)}`);
      const data = await res.json();
      if (data.success && !data.isEligible) {
        setLockoutData({
          remainingDays: data.remainingDays,
          nextEligibleAt: data.nextEligibleAt,
          reason: data.lastTerminationReason
        });
        setCurrentStep('LOCKED_OUT');
      } else {
        setCurrentStep('INSTRUCTIONS');
      }
    } catch (e) {
      setCurrentStep('INSTRUCTIONS');
    }
  };

  useEffect(() => {
    checkEligibility();
  }, [mobileNumber]);

  // Fetch questions from API
  useEffect(() => {
    fetch('/api/adviser/assessment/questions')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.questions) && data.questions.length > 0) {
          setQuestions(data.questions);
        }
      })
      .catch(err => {
        console.warn('Using default assessment question catalog:', err);
      });
  }, []);

  // Timer Effect when EXAM_ACTIVE
  useEffect(() => {
    if (currentStep !== 'EXAM_ACTIVE') return;

    const timer = setInterval(() => {
      setTimeLeftSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitAssessment();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentStep]);

  // Sync Mini Video Preview Stream
  useEffect(() => {
    if (currentStep === 'EXAM_ACTIVE' && mediaStream && miniVideoRef.current) {
      miniVideoRef.current.srcObject = mediaStream;
      miniVideoRef.current.play().catch(() => {});
    }
  }, [currentStep, mediaStream]);

  // 2. Server-Authoritative Security Event Processor
  const reportSecurityViolation = async (eventType: string, metadata?: any) => {
    if (currentStep !== 'EXAM_ACTIVE') return;

    try {
      const res = await fetch('/api/adviser/assessment/security-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile: mobileNumber,
          sessionId,
          eventType,
          metadata: {
            ...metadata,
            activeQuestion: currentQuestionIndex + 1,
            timeRemaining: timeLeftSeconds
          }
        })
      });

      const data = await res.json();
      if (data.action === 'EXAM_TERMINATED') {
        setLockoutData({
          remainingDays: 30,
          nextEligibleAt: data.nextEligibleAt,
          reason: data.warningMessage || 'Repeated security violations detected during proctored exam.'
        });
        setCurrentStep('LOCKED_OUT');
        setWarningModalOpen(false);
      } else if (data.action === 'WARNING_ISSUED') {
        setViolationType(eventType);
        setWarningMessage(data.warningMessage || 'Security Violation Recorded');
        setRemainingWarnings(data.remainingWarnings ?? 0);
        setWarningCount(prev => prev + 1);
        setWarningModalOpen(true);
      }
    } catch (e) {
      console.warn('Security event dispatch error:', e);
    }
  };

  // 3. Proctoring Event Listeners (Tab Switch, Fullscreen Exit, Clipboard, Context Menu)
  useEffect(() => {
    if (currentStep !== 'EXAM_ACTIVE') return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        reportSecurityViolation('TAB_SWITCH_DETECTED', { action: 'Candidate switched tabs or minimized window' });
      }
    };

    const handleBlur = () => {
      reportSecurityViolation('WINDOW_BLUR', { action: 'Window focus lost to external application' });
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        reportSecurityViolation('FULLSCREEN_EXIT', { action: 'Candidate exited full-screen mode' });
      }
    };

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      reportSecurityViolation('CLIPBOARD_COPY_ATTEMPT', { action: 'Text copy attempt blocked' });
    };

    const handleCut = (e: ClipboardEvent) => {
      e.preventDefault();
      reportSecurityViolation('CLIPBOARD_CUT_ATTEMPT', { action: 'Text cut attempt blocked' });
    };

    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      reportSecurityViolation('CLIPBOARD_PASTE_ATTEMPT', { action: 'Text paste attempt blocked' });
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      reportSecurityViolation('CONTEXT_MENU_OPEN', { action: 'Right-click context menu blocked' });
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('cut', handleCut);
    document.addEventListener('paste', handlePaste);
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('cut', handleCut);
      document.removeEventListener('paste', handlePaste);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [currentStep, sessionId]);

  // 4. Start Exam with Fullscreen Mode
  const handleStartExamSession = async () => {
    try {
      // Enter Fullscreen
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen().catch(() => {});
      }

      // Initialize session on server
      const res = await fetch('/api/adviser/assessment/start-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile: mobileNumber,
          applicantName
        })
      });
      const data = await res.json();
      if (data.session) {
        setSessionId(data.session.id);
      }
      setCurrentStep('EXAM_ACTIVE');
    } catch (err: any) {
      console.warn('Failed to start session on server, continuing locally:', err);
      setCurrentStep('EXAM_ACTIVE');
    }
  };

  const categories = [
    'All',
    'Crop Knowledge & Lifecycle',
    'Soil Health & Nutrition',
    'Pest & Disease Diagnostics',
    'Climate & Weather Risk',
    'Agronomy & Farm Operations',
    'CroperX Platform & Farmer Care'
  ];

  const filteredQuestions = selectedCategory === 'All'
    ? questions
    : questions.filter(q => q.category === selectedCategory);

  const activeQuestion = filteredQuestions[currentQuestionIndex] || questions[0];
  const answeredCount = Object.keys(answers).length;
  const totalQuestions = questions.length;
  const progressPercent = Math.round((answeredCount / totalQuestions) * 100);

  const handleSelectOption = (questionId: number, optionIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < filteredQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmitAssessment = async () => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch('/api/adviser/assessment/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobileNumber,
          answers
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit assessment.');
      }

      // Exit fullscreen if active
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }

      onComplete({
        score: data.score,
        total: data.total,
        percentage: data.percentage,
        isEligible: data.isEligible,
        status: data.status,
        message: data.message,
        categoryBreakdown: data.categoryBreakdown
      });
    } catch (err: any) {
      setSubmitError(err.message || 'An error occurred during submission.');
    } finally {
      setIsSubmitting(false);
      setShowConfirmSubmit(false);
    }
  };

  // Render Lockout Screen if locked out
  if (currentStep === 'LOCKED_OUT') {
    return (
      <AdviserExamLockoutView
        remainingDays={lockoutData?.remainingDays || 30}
        nextEligibleAt={lockoutData?.nextEligibleAt}
        reason={lockoutData?.reason}
        onRefreshCheck={checkEligibility}
      />
    );
  }

  // Render Step 1: Rules & Instructions
  if (currentStep === 'INSTRUCTIONS') {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-6">
        <AdviserExamInstructions
          language={selectedLanguage}
          onContinue={() => setCurrentStep('VOICE_GUIDANCE')}
        />
      </div>
    );
  }

  // Render Step 2: Multilingual Voice Audio Instructions
  if (currentStep === 'VOICE_GUIDANCE') {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-6">
        <AdviserExamVoiceInstructions
          applicantName={applicantName}
          selectedLanguage={selectedLanguage}
          onLanguageChange={setSelectedLanguage}
          onContinue={() => setCurrentStep('DEVICE_CHECK')}
        />
      </div>
    );
  }

  // Render Step 3: Permission Gate & Media Verification
  if (currentStep === 'DEVICE_CHECK') {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-6">
        <AdviserExamPermissionGate
          onMediaReady={(stream) => setMediaStream(stream)}
          onContinue={handleStartExamSession}
        />
      </div>
    );
  }

  // Render Active Assessment Screen (Step 4)
  return (
    <div ref={containerRef} className="w-full max-w-5xl mx-auto select-none bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl shadow-xl overflow-hidden relative">
      {/* Top Banner Header with Real-Time Proctoring HUD */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-900 to-stone-900 px-6 py-5 text-white relative">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-semibold uppercase tracking-wider mb-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              Proctored Agronomist Assessment
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">50-Question Competency Certification</h2>
            <p className="text-emerald-100/80 text-xs mt-0.5">
              Candidate: <span className="font-semibold text-white">{applicantName}</span> ({mobileNumber})
            </p>
          </div>

          {/* Real-time Telemetry Widgets */}
          <div className="flex items-center gap-3">
            {/* Live Camera PIP Preview */}
            <div className="relative w-16 h-12 rounded-xl bg-black/60 border border-white/20 overflow-hidden shrink-0 flex items-center justify-center">
              <video
                ref={miniVideoRef}
                muted
                playsInline
                autoPlay
                className="w-full h-full object-cover mirror -scale-x-100"
              />
              <div className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
            </div>

            {/* Countdown Timer */}
            <div className="px-3.5 py-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-300" />
              <div>
                <div className="text-[10px] uppercase font-semibold text-emerald-200">Time Left</div>
                <div className={`text-base font-black font-mono leading-none ${timeLeftSeconds < 300 ? 'text-rose-400 animate-pulse' : 'text-white'}`}>
                  {formatTimer(timeLeftSeconds)}
                </div>
              </div>
            </div>

            {/* Warning Pill */}
            <div className={`px-3 py-2 rounded-2xl border text-xs font-bold flex items-center gap-1.5 ${
              warningCount > 0
                ? 'bg-rose-950/80 border-rose-500 text-rose-200'
                : 'bg-black/40 border-white/10 text-emerald-300'
            }`}>
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{warningCount}/1 Warn</span>
            </div>

            {/* Answered Progress Pill */}
            <div className="px-3 py-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-2xl flex items-center gap-3 shrink-0">
              <div>
                <div className="text-[10px] uppercase font-semibold text-emerald-200">Answered</div>
                <div className="text-base font-black font-mono leading-none">
                  {answeredCount}<span className="text-xs font-normal text-emerald-300">/50</span>
                </div>
              </div>
              <div className="w-9 h-9 rounded-full border-2 border-emerald-400/40 flex items-center justify-center font-bold text-xs text-emerald-300 bg-emerald-950/40">
                {progressPercent}%
              </div>
            </div>
          </div>
        </div>

        {/* Linear Progress Bar */}
        <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden mt-4">
          <motion.div
            className="bg-emerald-400 h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="px-6 py-3 bg-stone-50 dark:bg-stone-800/60 border-b border-stone-200 dark:border-stone-800 flex items-center gap-2 overflow-x-auto scrollbar-none">
        <span className="text-xs font-semibold text-stone-500 shrink-0 flex items-center gap-1">
          <Layers className="w-3.5 h-3.5" /> Domain:
        </span>
        {categories.map(cat => {
          const isSelected = selectedCategory === cat;
          const categoryCount = cat === 'All'
            ? questions.length
            : questions.filter(q => q.category === cat).length;
          const answeredInCat = cat === 'All'
            ? answeredCount
            : questions.filter(q => q.category === cat && answers[q.id] !== undefined).length;

          return (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setCurrentQuestionIndex(0);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer ${
                isSelected
                  ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                  : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100 border border-stone-200 dark:border-stone-700'
              }`}
            >
              <span>{cat}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-emerald-700 text-white' : 'bg-stone-100 dark:bg-stone-700 text-stone-600'}`}>
                {answeredInCat}/{categoryCount}
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Question Content Area */}
      <div className="p-6 sm:p-8">
        {activeQuestion && (
          <div className="space-y-6">
            {/* Question Header & Meta */}
            <div className="flex items-center justify-between gap-4">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold border border-emerald-200 dark:border-emerald-800">
                <Sprout className="w-3.5 h-3.5 text-emerald-600" />
                {activeQuestion.category}
              </span>

              <span className="text-xs font-mono text-stone-500 dark:text-stone-400">
                Question {activeQuestion.id} of {totalQuestions} (Item {currentQuestionIndex + 1}/{filteredQuestions.length} in domain)
              </span>
            </div>

            {/* Question Text */}
            <h3 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-white leading-relaxed">
              {activeQuestion.id}. {activeQuestion.question}
            </h3>

            {/* Multiple Choice Options */}
            <div className="space-y-3 pt-2">
              {activeQuestion.options.map((optionText, optIdx) => {
                const isSelected = answers[activeQuestion.id] === optIdx;

                return (
                  <button
                    key={optIdx}
                    type="button"
                    onClick={() => handleSelectOption(activeQuestion.id, optIdx)}
                    className={`w-full text-left p-4 sm:p-4.5 rounded-2xl border-2 transition-all flex items-start gap-3 cursor-pointer ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-950 dark:text-emerald-100 shadow-sm'
                        : 'border-stone-200 dark:border-stone-700 hover:border-emerald-300 bg-stone-50/50 dark:bg-stone-800/40 text-stone-800 dark:text-stone-200'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 transition-colors ${
                        isSelected
                          ? 'bg-emerald-600 text-white'
                          : 'border border-stone-300 dark:border-stone-600 text-stone-500 bg-white dark:bg-stone-700'
                      }`}
                    >
                      {String.fromCharCode(65 + optIdx)}
                    </div>
                    <span className="text-sm sm:text-base leading-snug flex-1 font-medium">
                      {optionText}
                    </span>
                    {isSelected && (
                      <Check className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Error Alert */}
        {submitError && (
          <div className="mt-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 flex items-center gap-3 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
            <span>{submitError}</span>
          </div>
        )}

        {/* Navigation & Submission Action Bar */}
        <div className="mt-8 pt-6 border-t border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentQuestionIndex === 0}
              className="px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-xs font-semibold hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Previous
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={currentQuestionIndex === filteredQuestions.length - 1}
              className="px-4 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-xs font-semibold hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer"
            >
              Next
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={() => setShowConfirmSubmit(true)}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Submit Assessment ({answeredCount}/{totalQuestions})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmSubmit && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-md bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-2xl space-y-5 text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>

              <div>
                <h4 className="text-xl font-bold text-stone-900 dark:text-white">
                  Submit Assessment Answers?
                </h4>
                <p className="text-stone-600 dark:text-stone-400 text-xs mt-1.5">
                  You have answered <span className="font-bold text-emerald-600">{answeredCount}</span> out of <span className="font-bold">{totalQuestions}</span> questions.
                  {answeredCount < totalQuestions && (
                    <span className="block text-amber-600 dark:text-amber-400 font-semibold mt-1">
                      ⚠️ Note: Unanswered questions will be scored as incorrect.
                    </span>
                  )}
                </p>
              </div>

              <div className="p-3 bg-stone-50 dark:bg-stone-800 rounded-2xl text-left text-xs space-y-1.5 text-stone-600 dark:text-stone-300">
                <div className="flex justify-between">
                  <span>Minimum Passing Score:</span>
                  <span className="font-bold text-stone-900 dark:text-white">25 / 50 (50%)</span>
                </div>
                <div className="flex justify-between">
                  <span>Scoring Engine:</span>
                  <span className="font-semibold text-emerald-600">Authoritative Server-Side</span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfirmSubmit(false)}
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl border border-stone-300 dark:border-stone-700 text-stone-700 dark:text-stone-300 text-xs font-bold hover:bg-stone-100 cursor-pointer"
                >
                  Review Answers
                </button>
                <button
                  type="button"
                  onClick={handleSubmitAssessment}
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Scoring...</span>
                    </>
                  ) : (
                    <span>Confirm & Submit</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Proctoring Warning Modal */}
      <AdviserSecurityWarningModal
        isOpen={warningModalOpen}
        violationType={violationType}
        warningMessage={warningMessage}
        remainingWarnings={remainingWarnings}
        onAcknowledge={() => {
          setWarningModalOpen(false);
          // Re-enter Fullscreen
          if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
          }
        }}
      />
    </div>
  );
};
