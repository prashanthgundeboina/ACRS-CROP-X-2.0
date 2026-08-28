import React, { useState, useEffect } from 'react';
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
  RefreshCw
} from 'lucide-react';
import { ADVISER_ASSESSMENT_PUBLIC_QUESTIONS, AssessmentQuestionPublic } from '../../data/adviserAssessmentData';

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

export const AdviserAssessmentView: React.FC<AdviserAssessmentViewProps> = ({
  mobileNumber,
  applicantName = 'Adviser Applicant',
  onComplete,
  onCancel
}) => {
  const [questions, setQuestions] = useState<AssessmentQuestionPublic[]>(ADVISER_ASSESSMENT_PUBLIC_QUESTIONS);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState<boolean>(false);

  // Fetch sanitized questions from server on mount
  useEffect(() => {
    fetch('/api/adviser/assessment/questions')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.questions) && data.questions.length > 0) {
          setQuestions(data.questions);
        }
      })
      .catch(err => {
        console.warn('Could not fetch assessment questions from API, using fallback:', err);
      });
  }, []);

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

  return (
    <div className="w-full max-w-4xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-800 to-indigo-900 px-6 py-6 text-white relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-200 text-xs font-semibold uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              CroperX Agronomist Verification
            </div>
            <h2 className="text-2xl font-bold tracking-tight">50-Question Competency Assessment</h2>
            <p className="text-emerald-100/80 text-xs sm:text-sm mt-0.5">
              Candidate: <span className="font-semibold text-white">{applicantName}</span> ({mobileNumber})
            </p>
          </div>

          {/* Real-time Progress Pill */}
          <div className="bg-black/30 backdrop-blur-md border border-white/10 rounded-2xl p-3 flex items-center gap-4 shrink-0">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-emerald-200 font-semibold">Answered</div>
              <div className="text-lg font-bold font-mono">
                {answeredCount} <span className="text-xs font-normal text-emerald-300">/ {totalQuestions}</span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-full border-2 border-emerald-400/40 flex items-center justify-center font-bold text-sm text-emerald-300 bg-emerald-950/40">
              {progressPercent}%
            </div>
          </div>
        </div>

        {/* Linear Progress Bar */}
        <div className="w-full bg-black/40 h-1.5 rounded-full overflow-hidden mt-5">
          <motion.div
            className="bg-emerald-400 h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto scrollbar-none">
        <span className="text-xs font-semibold text-slate-500 shrink-0 flex items-center gap-1">
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
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-emerald-600 text-white shadow-sm font-semibold'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <span>{cat}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-emerald-700 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600'}`}>
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

              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                Question {activeQuestion.id} of {totalQuestions} (Item {currentQuestionIndex + 1}/{filteredQuestions.length} in domain)
              </span>
            </div>

            {/* Question Text */}
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-relaxed">
              {activeQuestion.id}. {activeQuestion.question}
            </h3>

            {/* Multiple Choice Options */}
            <div className="space-y-3 pt-2">
              {activeQuestion.options.map((optionText, optIdx) => {
                const isSelected = answers[activeQuestion.id] === optIdx;

                return (
                  <motion.button
                    key={optIdx}
                    type="button"
                    whileHover={{ scale: 1.005 }}
                    whileTap={{ scale: 0.995 }}
                    onClick={() => handleSelectOption(activeQuestion.id, optIdx)}
                    className={`w-full text-left p-4 sm:p-4.5 rounded-2xl border-2 transition-all flex items-start gap-3 cursor-pointer ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-950 dark:text-emerald-100 shadow-sm'
                        : 'border-slate-200 dark:border-slate-700 hover:border-emerald-300 bg-slate-50/50 dark:bg-slate-800/40 text-slate-800 dark:text-slate-200'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 transition-colors ${
                        isSelected
                          ? 'bg-emerald-600 text-white'
                          : 'border border-slate-300 dark:border-slate-600 text-slate-500 bg-white dark:bg-slate-700'
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
                  </motion.button>
                );
              })}
            </div>
          </div>
        )}

        {/* Error Alert */}
        {submitError && (
          <div className="mt-6 p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 flex items-center gap-3 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
            <span>{submitError}</span>
          </div>
        )}

        {/* Navigation & Submission Action Bar */}
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentQuestionIndex === 0}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Previous
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={currentQuestionIndex === filteredQuestions.length - 1}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              Next
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Exit Assessment
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowConfirmSubmit(true)}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
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
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>

              <div>
                <h4 className="text-xl font-bold text-slate-900 dark:text-white">
                  Submit Assessment Answers?
                </h4>
                <p className="text-slate-600 dark:text-slate-400 text-xs mt-1.5">
                  You have answered <span className="font-bold text-emerald-600">{answeredCount}</span> out of <span className="font-bold">{totalQuestions}</span> questions.
                  {answeredCount < totalQuestions && (
                    <span className="block text-amber-600 dark:text-amber-400 font-semibold mt-1">
                      ⚠️ Note: Unanswered questions will be scored as incorrect.
                    </span>
                  )}
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-left text-xs space-y-1.5 text-slate-600 dark:text-slate-300">
                <div className="flex justify-between">
                  <span>Minimum Passing Score:</span>
                  <span className="font-bold text-slate-900 dark:text-white">25 / 50 (50%)</span>
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
                  className="flex-1 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100"
                >
                  Review Answers
                </button>
                <button
                  type="button"
                  onClick={handleSubmitAssessment}
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md"
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
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
