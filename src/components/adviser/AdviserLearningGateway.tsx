import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  BookOpen, Award, CheckCircle2, AlertCircle, ChevronRight, ChevronLeft,
  Check, Lock, Play, Sparkles, HelpCircle, FileCheck, ShieldCheck,
  RefreshCw, Layers, ArrowRight, UserCheck, PhoneCall, Radio, Eye,
  Lightbulb, CheckCircle
} from 'lucide-react';
import { UserAccount } from '../../types';
import { ADVISER_LEARNING_MODULES, AdviserCourseModule } from '../../data/adviserLearningModules';

export interface AdviserMasteryQuestion {
  id: number;
  moduleRef?: string;
  moduleTitle?: string;
  question: string;
  options: string[];
}

interface AdviserLearningGatewayProps {
  currentUser?: UserAccount | null;
  mobileNumber?: string;
  adviserName?: string;
  initialTab?: string;
  onCourseCompleted?: (user: UserAccount) => void;
  onCourseComplete?: () => void;
  onLogout?: () => void;
  onExit?: () => void;
  onClose?: () => void;
}

export const AdviserLearningGateway: React.FC<AdviserLearningGatewayProps> = ({
  currentUser,
  mobileNumber,
  adviserName,
  initialTab,
  onCourseCompleted,
  onCourseComplete,
  onLogout,
  onExit,
  onClose
}) => {
  const [modules, setModules] = useState<AdviserCourseModule[]>(ADVISER_LEARNING_MODULES);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [completedModules, setCompletedModules] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingProgress, setSavingProgress] = useState(false);

  const effectiveMobile = currentUser?.phoneNumber || mobileNumber || '';
  const effectiveName = currentUser?.farmerName || currentUser?.fullName || adviserName || 'Agronomist';
  const handleExit = onLogout || onExit || onClose || (() => {});

  // Checkpoint Quiz Selection State for each module
  const [checkpointAnswers, setCheckpointAnswers] = useState<Record<string | number, number>>({});
  const [checkpointSubmitted, setCheckpointSubmitted] = useState<Record<string | number, boolean>>({});

  // Final Mastery Assessment State
  const [inMasteryMode, setInMasteryMode] = useState(false);
  const [masteryQuestions, setMasteryQuestions] = useState<AdviserMasteryQuestion[]>([]);
  const [masteryAnswers, setMasteryAnswers] = useState<Record<number, number>>({});
  const [masterySubmitting, setMasterySubmitting] = useState(false);
  const [masteryResult, setMasteryResult] = useState<{
    score: number;
    passed: boolean;
    percentage: number;
    passingScore: number;
    message: string;
  } | null>(null);

  // Load modules and progress on mount
  useEffect(() => {
    loadCourseData();
  }, [currentUser, effectiveMobile]);

  const loadCourseData = async () => {
    try {
      // 1. Fetch Modules
      const modRes = await fetch('/api/adviser/course/modules');
      if (modRes.ok) {
        const modData = await modRes.json();
        if (modData.modules && Array.isArray(modData.modules) && modData.modules.length > 0) {
          setModules(modData.modules);
        }
      }

      // 2. Fetch User Course Progress
      const mobile = effectiveMobile;
      if (mobile) {
        const progRes = await fetch(`/api/adviser/course/progress?mobile=${encodeURIComponent(mobile)}&mobileNumber=${encodeURIComponent(mobile)}`);
        if (progRes.ok) {
          const progData = await progRes.json();
          if (progData.progress) {
            const comp = progData.progress.completedModules || [];
            // Normalize completed modules to numbers
            const compNums = comp.map((c: any) => typeof c === 'number' ? c : parseInt(String(c).replace(/\D/g, ''), 10) || 1);
            setCompletedModules(compNums);
            const curr = progData.progress.currentModule || 1;
            setCurrentModuleIndex(Math.max(0, Math.min(curr - 1, (modules.length || 12) - 1)));

            if (progData.progress.masteryTestPassed) {
              setMasteryResult({
                score: progData.progress.masteryScore || 12,
                passed: true,
                percentage: Math.round(((progData.progress.masteryScore || 12) / 12) * 100),
                passingScore: 10,
                message: 'Mastery certification completed. Adviser Workstation unlocked.'
              });
            }
          }
        }
      }
    } catch (err) {
      console.error('Error loading course data:', err);
    }
  };

  const handleMarkModuleComplete = async (moduleOrder: number) => {
    if (!completedModules.includes(moduleOrder)) {
      const nextCompleted = Array.from(new Set([...completedModules, moduleOrder]));
      setCompletedModules(nextCompleted);

      // Persist to server
      const mobile = effectiveMobile;
      if (mobile) {
        setSavingProgress(true);
        try {
          await fetch('/api/adviser/course/progress', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              mobile,
              mobileNumber: mobile,
              completedModules: nextCompleted,
              currentModule: Math.min(moduleOrder + 1, modules.length || 12),
              moduleId: moduleOrder,
              completed: true
            })
          });
        } catch (e) {
          console.error('Failed to save progress:', e);
        } finally {
          setSavingProgress(false);
        }
      }
    }

    if (currentModuleIndex < modules.length - 1) {
      setCurrentModuleIndex(prev => prev + 1);
    }
  };

  const handleCheckpointSubmit = (key: string | number) => {
    if (checkpointAnswers[key] !== undefined) {
      setCheckpointSubmitted(prev => ({ ...prev, [key]: true }));
    }
  };

  const loadMasteryQuestions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/adviser/mastery/questions');
      if (res.ok) {
        const data = await res.json();
        if (data.questions && Array.isArray(data.questions)) {
          setMasteryQuestions(data.questions);
          setInMasteryMode(true);
          return;
        }
      }
    } catch (err) {
      console.error('Failed to load mastery questions:', err);
    } finally {
      setLoading(false);
    }
    setInMasteryMode(true);
  };

  const handleMasterySelect = (questionId: number, optionIdx: number) => {
    setMasteryAnswers(prev => ({
      ...prev,
      [questionId]: optionIdx
    }));
  };

  const handleMasterySubmit = async () => {
    const totalQuestions = masteryQuestions.length > 0 ? masteryQuestions.length : 12;
    const totalAnswered = Object.keys(masteryAnswers).length;
    if (totalAnswered < totalQuestions) {
      const confirmIncomplete = window.confirm(
        `You have answered ${totalAnswered} of ${totalQuestions} questions. Unanswered questions will count as incorrect. Proceed with submission?`
      );
      if (!confirmIncomplete) return;
    }

    setMasterySubmitting(true);
    try {
      const res = await fetch('/api/adviser/mastery/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile: effectiveMobile,
          phoneNumber: effectiveMobile,
          answers: masteryAnswers
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setMasteryResult(data.result);
        if (data.result.passed) {
          if (currentUser) {
            const updatedUser: UserAccount = {
              ...currentUser,
              accountStatus: 'active',
              learningCompleted: true,
              isVerified: true
            };
            onCourseCompleted?.(updatedUser);
          }
          onCourseComplete?.();
        }
      } else {
        alert(data.error || 'Failed to submit mastery test');
      }
    } catch (err: any) {
      alert(err.message || 'Network error submitting mastery test');
    } finally {
      setMasterySubmitting(false);
    }
  };

  const effectiveModulesList = modules && modules.length > 0 ? modules : ADVISER_LEARNING_MODULES;
  const currentModule = effectiveModulesList[currentModuleIndex] || effectiveModulesList[0] || ADVISER_LEARNING_MODULES[0];
  const allModulesCompleted = effectiveModulesList.length > 0 && completedModules.length >= effectiveModulesList.length;
  const progressPercentage = Math.round((completedModules.length / Math.max(1, effectiveModulesList.length)) * 100);
  const quizKey = currentModule.order || currentModule.id;
  const quiz = currentModule.quickKnowledgeCheck;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-5 h-5 animate-spin text-emerald-500" />
          <span className="text-sm font-semibold">Loading CroperX Adviser Learning Gateway...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-950/40">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-tight">
                CroperX Adviser Learning Gateway
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold border border-emerald-500/30">
                12-MODULE COURSE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Adviser: <span className="font-semibold text-white">{effectiveName}</span> {effectiveMobile ? `(${effectiveMobile})` : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Progress Pill */}
          <div className="hidden sm:flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs">
            <span className="font-bold text-emerald-400 font-mono">{progressPercentage}% Complete</span>
            <div className="w-20 h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          <button
            onClick={handleExit}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-all cursor-pointer"
          >
            {onClose ? 'Close' : 'Sign Out'}
          </button>
        </div>
      </header>

      {/* Main Content Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Sidebar: 12 Module Navigation */}
        <aside className="w-full lg:w-80 bg-slate-900/60 border-r border-slate-800 p-4 overflow-y-auto space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider">
            <span>Course Curriculum</span>
            <span>{completedModules.length} / {effectiveModulesList.length}</span>
          </div>

          <div className="space-y-1.5">
            {(effectiveModulesList || []).map((m, idx) => {
              const isCurrent = currentModuleIndex === idx && !inMasteryMode;
              const isCompleted = completedModules.includes(m.order) || completedModules.includes(idx + 1);

              return (
                <button
                  key={m.id || idx}
                  onClick={() => {
                    setInMasteryMode(false);
                    setCurrentModuleIndex(idx);
                  }}
                  className={`w-full text-left p-3 rounded-2xl text-xs transition-all flex items-start gap-2.5 cursor-pointer ${
                    isCurrent
                      ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-950/40 font-bold'
                      : isCompleted
                      ? 'bg-slate-900/80 text-emerald-300 hover:bg-slate-800 border border-emerald-500/20'
                      : 'bg-slate-900/40 text-slate-400 hover:bg-slate-850 border border-slate-800'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-mono font-bold shrink-0 mt-0.5 ${
                    isCompleted ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {isCompleted ? <Check className="w-3 h-3 stroke-[3]" /> : (m.order || idx + 1)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="truncate text-xs leading-snug">{m.title}</div>
                    <div className={`text-[10px] mt-0.5 ${isCurrent ? 'text-emerald-100' : 'text-slate-500'}`}>
                      {m.readingTimeMinutes ? `${m.readingTimeMinutes} mins` : '5 mins'}
                    </div>
                  </div>
                </button>
              );
            })}

            {/* Final Mastery Exam Button in Sidebar */}
            <div className="pt-3 border-t border-slate-800">
              <button
                onClick={() => {
                  if (allModulesCompleted) {
                    loadMasteryQuestions();
                  } else {
                    alert('Please complete all 12 modules before attempting the Final Mastery Assessment.');
                  }
                }}
                disabled={!allModulesCompleted}
                className={`w-full p-3 rounded-2xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                  inMasteryMode
                    ? 'bg-purple-600 text-white shadow-lg'
                    : allModulesCompleted
                    ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 animate-pulse'
                    : 'bg-slate-900/30 text-slate-600 border border-slate-850 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4" />
                  <span>Final Mastery Exam</span>
                </div>
                {allModulesCompleted ? (
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Lock className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>
        </aside>

        {/* Right Content View */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-950">
          {!inMasteryMode ? (
            /* MODULE VIEW */
            currentModule ? (
              <div className="max-w-3xl mx-auto space-y-6">
                {/* Module Header Card */}
                <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-mono font-bold">
                      Module {currentModule.order || currentModuleIndex + 1} of {effectiveModulesList.length} • {currentModule.readingTimeMinutes || 5} mins
                    </span>
                    {(completedModules.includes(currentModule.order) || completedModules.includes(currentModuleIndex + 1)) && (
                      <span className="flex items-center gap-1 text-xs font-bold text-emerald-400">
                        <CheckCircle2 className="w-4 h-4" /> Completed
                      </span>
                    )}
                  </div>

                  <h2 className="text-xl font-bold text-white tracking-tight">
                    {currentModule.title}
                  </h2>
                  {currentModule.subtitle && (
                    <p className="text-xs font-semibold text-emerald-400">
                      {currentModule.subtitle}
                    </p>
                  )}
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {currentModule.overview}
                  </p>
                </div>

                {/* Key Topics */}
                {currentModule.keyTopics && currentModule.keyTopics.length > 0 && (
                  <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                      <BookOpen className="w-4 h-4" /> Core Agronomic Principles & Topics
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(currentModule.keyTopics || []).map((topic, tIdx) => (
                        <div key={tIdx} className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 text-xs text-slate-300 flex items-start gap-2.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                          <span className="leading-relaxed font-medium">{topic}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Detailed Sections */}
                {(currentModule.sections || []).map((section, sIdx) => (
                  <div key={sIdx} className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4" /> {section.heading}
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {section.body}
                    </p>

                    {section.bulletPoints && section.bulletPoints.length > 0 && (
                      <div className="space-y-1.5 pt-2">
                        {(section.bulletPoints || []).map((point, pIdx) => (
                          <div key={pIdx} className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/60 text-xs text-slate-300 flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0 mt-1.5" />
                            <span className="leading-relaxed">{point}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {section.adviserTip && (
                      <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-200 flex items-start gap-2.5 mt-3">
                        <Lightbulb className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold text-emerald-300 block mb-0.5">Adviser Pro-Tip:</span>
                          <p className="text-slate-300 text-[11px] leading-relaxed">{section.adviserTip}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Checkpoint Quiz */}
                {quiz && (
                  <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-2">
                        <HelpCircle className="w-4 h-4" /> Module Checkpoint Comprehension Quiz
                      </h3>
                    </div>

                    <p className="text-xs font-semibold text-white">
                      {quiz.question}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(quiz.options || []).map((opt, oIdx) => {
                        const isSelected = checkpointAnswers[quizKey] === oIdx;
                        const isSubmitted = checkpointSubmitted[quizKey];
                        const isCorrect = oIdx === quiz.correctIndex;

                        return (
                          <button
                            key={oIdx}
                            disabled={isSubmitted}
                            onClick={() => setCheckpointAnswers(prev => ({ ...prev, [quizKey]: oIdx }))}
                            className={`p-3 rounded-2xl text-left text-xs transition-all flex items-start gap-2.5 cursor-pointer ${
                              isSubmitted && isCorrect
                                ? 'bg-emerald-600/30 border-2 border-emerald-500 text-emerald-200'
                                : isSubmitted && isSelected && !isCorrect
                                ? 'bg-rose-600/30 border-2 border-rose-500 text-rose-200'
                                : isSelected
                                ? 'bg-purple-600/20 border-2 border-purple-500 text-purple-200 font-semibold'
                                : 'bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300'
                            }`}
                          >
                            <span className="w-4 h-4 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center text-[10px] shrink-0 mt-0.5 font-bold">
                              {String.fromCharCode(65 + oIdx)}
                            </span>
                            <span className="leading-snug">{opt}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Explanation after submit */}
                    {checkpointSubmitted[quizKey] && (
                      <div className="p-3.5 rounded-2xl bg-slate-950 border border-purple-500/30 text-xs text-purple-200 space-y-1">
                        <span className="font-bold block">💡 Explanation:</span>
                        <p className="text-slate-300 text-[11px] leading-relaxed">
                          {quiz.explanation}
                        </p>
                      </div>
                    )}

                    {!checkpointSubmitted[quizKey] && checkpointAnswers[quizKey] !== undefined && (
                      <button
                        onClick={() => handleCheckpointSubmit(quizKey)}
                        className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all cursor-pointer"
                      >
                        Check Answer
                      </button>
                    )}
                  </div>
                )}

                {/* Bottom Navigation / Complete Module Action */}
                <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => setCurrentModuleIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentModuleIndex === 0}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" /> Previous
                  </button>

                  <button
                    onClick={() => handleMarkModuleComplete(currentModule.order || currentModuleIndex + 1)}
                    disabled={savingProgress}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-lg shadow-emerald-950/50 transition-all cursor-pointer"
                  >
                    {savingProgress ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                    <span>
                      {completedModules.includes(currentModule.order) || completedModules.includes(currentModuleIndex + 1)
                        ? 'Next Module'
                        : 'Mark Complete & Continue'}
                    </span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : null
          ) : (
            /* FINAL MASTERY ASSESSMENT VIEW */
            <div className="max-w-3xl mx-auto space-y-6">
              {/* Mastery Header */}
              <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/60 via-slate-900 to-slate-900 border border-purple-500/40 shadow-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 text-[11px] font-mono font-bold border border-purple-500/40">
                    FINAL MASTERY EXAM (12 QUESTIONS)
                  </span>
                  <span className="text-xs text-purple-300 font-bold">
                    Passing Threshold: 10 / 12 (83%)
                  </span>
                </div>
                <h2 className="text-xl font-black text-white tracking-tight">
                  CroperX Agronomist Final Mastery Certification
                </h2>
                <p className="text-xs text-slate-300">
                  Prove your operational understanding of the CroperX field advisory suite, real-time telemetry diagnostics, WebRTC video annotations, and emergency escalation workflows.
                </p>
              </div>

              {/* Result Banner if already submitted */}
              {masteryResult && (
                <div className={`p-6 rounded-3xl border shadow-xl text-center space-y-4 ${
                  masteryResult.passed
                    ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
                    : 'bg-rose-950/60 border-rose-500/50 text-rose-200'
                }`}>
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto ${
                    masteryResult.passed ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-white'
                  }`}>
                    {masteryResult.passed ? <Award className="w-8 h-8" /> : <AlertCircle className="w-8 h-8" />}
                  </div>

                  <div>
                    <h3 className="text-xl font-black text-white">
                      {masteryResult.passed ? 'Certified CroperX Agronomist!' : 'Mastery Score Below 83%'}
                    </h3>
                    <p className="text-xs text-slate-300 mt-1">
                      {masteryResult.message}
                    </p>
                  </div>

                  <div className="flex justify-center items-center gap-6 font-mono">
                    <div>
                      <span className="text-xs text-slate-400 block">Score</span>
                      <span className="text-2xl font-black text-white">{masteryResult.score} / 12</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-400 block">Percentage</span>
                      <span className="text-2xl font-black text-white">{masteryResult.percentage}%</span>
                    </div>
                  </div>

                  {masteryResult.passed && (
                    <button
                      onClick={() => {
                        if (currentUser) {
                          onCourseCompleted?.({
                            ...currentUser,
                            accountStatus: 'active',
                            learningCompleted: true,
                            isVerified: true
                          });
                        }
                        onCourseComplete?.();
                      }}
                      className="px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black shadow-lg shadow-emerald-950/50 transition-all cursor-pointer"
                    >
                      🚀 Launch Live Adviser Workstation Dashboard
                    </button>
                  )}
                </div>
              )}

              {/* Mastery Questions List */}
              {(!masteryResult || !masteryResult.passed) && (
                <div className="space-y-4">
                  {(masteryQuestions || []).map((mq) => {
                    const selected = masteryAnswers[mq.id];
                    return (
                      <div key={mq.id} className="p-5 rounded-3xl bg-slate-900 border border-slate-800 space-y-3">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center text-xs font-mono font-bold">
                            Q{mq.id}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                            {mq.moduleTitle || mq.moduleRef || `Module ${mq.id}`}
                          </span>
                        </div>

                        <p className="text-xs font-semibold text-white">
                          {mq.question}
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {(mq.options || []).map((opt, oIdx) => {
                            const isSelected = selected === oIdx;
                            return (
                              <button
                                key={oIdx}
                                onClick={() => handleMasterySelect(mq.id, oIdx)}
                                className={`p-3 rounded-2xl text-left text-xs transition-all flex items-start gap-2.5 cursor-pointer ${
                                  isSelected
                                    ? 'bg-purple-600/20 border-2 border-purple-500 text-purple-200 font-semibold shadow-md'
                                    : 'bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-300'
                                }`}
                              >
                                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${
                                  isSelected ? 'bg-purple-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                                }`}>
                                  {String.fromCharCode(65 + oIdx)}
                                </span>
                                <span className="leading-snug">{opt}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}

                  <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      {Object.keys(masteryAnswers).length} of {masteryQuestions.length || 12} questions answered
                    </span>
                    <button
                      onClick={handleMasterySubmit}
                      disabled={masterySubmitting}
                      className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-xs font-bold text-white shadow-lg transition-all cursor-pointer"
                    >
                      {masterySubmitting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Award className="w-4 h-4" />}
                      <span>{masterySubmitting ? 'Grading...' : 'Submit Mastery Exam'}</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

