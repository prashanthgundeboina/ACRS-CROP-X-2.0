import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  UserCheck, ShieldCheck, CheckCircle2, AlertCircle, Clock,
  ArrowRight, ArrowLeft, RefreshCw, Send, Check, Sparkles, BookOpen,
  Award, HelpCircle, FileCheck, Layers, ChevronRight, XCircle
} from 'lucide-react';
import { AdviserAssessmentQuestion } from '../../types';

interface AdviserVerificationGatewayProps {
  onClose: () => void;
  onSuccessRegistered?: (mobile: string) => void;
  onOpenActivation?: (token?: string) => void;
}

type GatewayStep = 'FORM' | 'OTP' | 'ASSESSMENT' | 'RESULT' | 'STATUS_TRACKER';

export const AdviserVerificationGateway: React.FC<AdviserVerificationGatewayProps> = ({
  onClose,
  onSuccessRegistered,
  onOpenActivation
}) => {
  const [step, setStep] = useState<GatewayStep>('FORM');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('+91 ');
  const [email, setEmail] = useState('');
  const [specialization, setSpecialization] = useState('Agronomy & Crop Nutrition');
  const [experienceYears, setExperienceYears] = useState(3);
  const [qualification, setQualification] = useState('B.Sc. Agriculture');
  const [primaryCrops, setPrimaryCrops] = useState<string[]>(['Wheat', 'Rice', 'Cotton']);
  const [languages, setLanguages] = useState<string[]>(['English', 'Hindi']);
  const [region, setRegion] = useState('Indo-Gangetic Agro Zone (Punjab/Haryana/UP)');
  const [institution, setInstitution] = useState('');
  const [certificationInfo, setCertificationInfo] = useState('');

  // OTP State
  const [otpCode, setOtpCode] = useState('');
  const [otpSentMsg, setOtpSentMsg] = useState('');
  const [resendTimer, setResendTimer] = useState(60);

  // Assessment State
  const [questions, setQuestions] = useState<AdviserAssessmentQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [currentCategoryFilter, setCurrentCategoryFilter] = useState<string>('all');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [assessmentResult, setAssessmentResult] = useState<{
    score: number;
    percentage: number;
    passed: boolean;
    passingScore: number;
    categoryScores: Record<string, number>;
    status: string;
    message: string;
  } | null>(null);

  // Status Tracker State
  const [trackedStatus, setTrackedStatus] = useState<any>(null);

  // Countdown timer for OTP resend
  useEffect(() => {
    let interval: any = null;
    if (step === 'OTP' && resendTimer > 0) {
      interval = setInterval(() => setResendTimer(prev => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

  // Load questions when moving to ASSESSMENT step
  const loadAssessmentQuestions = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/adviser/assessment/questions');
      if (res.ok) {
        const data = await res.json();
        setQuestions(data.questions || []);
      } else {
        throw new Error('Failed to load assessment questions');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Could not load questions. Please check connection.');
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Submit Registration Form
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanMobile = mobile.trim();
    if (!fullName.trim() || !cleanMobile) {
      setErrorMessage('Please enter your full name and mobile number.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/adviser/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          mobile: cleanMobile,
          email: email.trim() || undefined,
          specialization,
          experienceYears,
          qualification,
          primaryCrops,
          languages,
          region,
          institution: institution.trim() || undefined,
          certificationInfo: certificationInfo.trim() || undefined
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setOtpSentMsg(data.message || 'OTP verification code sent to your mobile.');
        setStep('OTP');
        setResendTimer(60);
      } else {
        setErrorMessage(data.error || 'Registration failed. Please check inputs.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error during registration.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!otpCode.trim()) {
      setErrorMessage('Please enter the 6-digit verification code.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/adviser/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile: mobile.trim(),
          code: otpCode.trim()
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        await loadAssessmentQuestions();
        setStep('ASSESSMENT');
      } else {
        setErrorMessage(data.error || 'Invalid verification code.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error verifying OTP.');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setLoading(true);
    try {
      const res = await fetch('/api/adviser/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: fullName.trim(),
          mobile: mobile.trim(),
          specialization,
          experienceYears,
          qualification,
          primaryCrops,
          languages,
          region
        })
      });
      const data = await res.json();
      if (res.ok) {
        setOtpSentMsg('A new verification code has been dispatched.');
        setResendTimer(60);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Option selection in Assessment
  const handleSelectOption = (questionId: number, optionIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  // Submit 50-Question Assessment
  const handleSubmitAssessment = async () => {
    setErrorMessage(null);
    const totalAnswered = Object.keys(answers).length;
    if (totalAnswered < questions.length) {
      const confirmIncomplete = window.confirm(
        `You have answered ${totalAnswered} of ${questions.length} questions. Unanswered questions will be scored as incorrect. Do you want to submit anyway?`
      );
      if (!confirmIncomplete) return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/adviser/assessment/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobile: mobile.trim(),
          answers
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setAssessmentResult(data.result);
        setStep('RESULT');
      } else {
        setErrorMessage(data.error || 'Failed to evaluate assessment submission.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error submitting assessment.');
    } finally {
      setLoading(false);
    }
  };

  // Status Check Handler
  const handleCheckStatus = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch(`/api/adviser/application/status?mobile=${encodeURIComponent(mobile.trim())}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setTrackedStatus(data.application);
        setStep('STATUS_TRACKER');
      } else {
        setErrorMessage(data.error || 'No active application found for this phone number.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error querying application status.');
    } finally {
      setLoading(false);
    }
  };

  const answeredCount = Object.keys(answers).length;
  const filteredQuestions = currentCategoryFilter === 'all'
    ? questions
    : questions.filter(q => q.category === currentCategoryFilter);

  const categories = [
    { id: 'all', label: 'All 50 Questions' },
    { id: 'agriculture', label: 'General Agriculture' },
    { id: 'soil', label: 'Soil Health & Chemistry' },
    { id: 'crop_health', label: 'Crop Health & Pathology' },
    { id: 'climate', label: 'Climate & Irrigation' },
    { id: 'agronomy', label: 'Agronomy & Nutrition' },
    { id: 'croperx', label: 'CroperX Advisory System' }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="bg-slate-950/80 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-md shadow-emerald-950/50">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  CroperX Agronomist Verification Gateway
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold border border-emerald-500/30">
                  PHASE 43
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Official Agricultural Adviser Certification, Screening & Verification Pipeline
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm transition-all"
          >
            ✕
          </button>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3.5 rounded-2xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button onClick={() => setErrorMessage(null)} className="text-rose-400 hover:text-white text-xs">
              ✕
            </button>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* STEP 1: REGISTRATION FORM */}
          {step === 'FORM' && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div className="text-center space-y-1">
                <h3 className="text-lg font-bold text-white">Join as a Certified Agronomist Adviser</h3>
                <p className="text-xs text-slate-400">
                  Provide your professional credentials. You will verify your mobile number and take a 50-question agronomy assessment.
                </p>
              </div>

              <form onSubmit={handleSubmitForm} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                      Full Legal Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. Rajesh Verma"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                      Mobile Number (E.164 with Country Code) *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="+91 98765 43210"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                      Email Address (Optional)
                    </label>
                    <input
                      type="email"
                      placeholder="adviser@agriextension.org"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                      Highest Qualification *
                    </label>
                    <select
                      value={qualification}
                      onChange={(e) => setQualification(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="B.Sc. Agriculture">B.Sc. Agriculture / Horticulture</option>
                      <option value="M.Sc. Agronomy">M.Sc. Agronomy / Soil Science / Entomology</option>
                      <option value="Ph.D. Plant Pathology">Ph.D. Plant Pathology / Agricultural Science</option>
                      <option value="Diploma in Agriculture">Diploma in Agricultural Extension</option>
                      <option value="Certified Crop Adviser (CCA)">Certified Crop Adviser (CCA)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                      Primary Specialization *
                    </label>
                    <select
                      value={specialization}
                      onChange={(e) => setSpecialization(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Agronomy & Crop Nutrition">Agronomy & Crop Nutrition</option>
                      <option value="Plant Pathology & Pest Management">Plant Pathology & Pest Management</option>
                      <option value="Soil Health & Irrigation Physics">Soil Health & Irrigation Physics</option>
                      <option value="Organic & Regenerative Farming">Organic & Regenerative Farming</option>
                      <option value="Horticulture & Greenhouse Systems">Horticulture & Greenhouse Systems</option>
                      <option value="Precision IoT & Farm Telemetry">Precision IoT & Farm Telemetry</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                      Years of Field Experience *
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={45}
                      value={experienceYears}
                      onChange={(e) => setExperienceYears(parseInt(e.target.value) || 1)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                    Target Agro-Climatic Region *
                  </label>
                  <input
                    type="text"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    placeholder="e.g. Indo-Gangetic Plains, Deccan Plateau, Western Ghats"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                  <button
                    type="button"
                    onClick={handleCheckStatus}
                    className="text-xs text-emerald-400 hover:underline font-semibold"
                  >
                    Already applied? Check Status
                  </button>

                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-lg shadow-emerald-950/50 transition-all cursor-pointer"
                  >
                    {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    <span>{loading ? 'Submitting...' : 'Proceed to Mobile Verification'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 2: OTP VERIFICATION */}
          {step === 'OTP' && (
            <div className="space-y-6 max-w-md mx-auto text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-md">
                <Send className="w-6 h-6" />
              </div>

              <div className="space-y-1">
                <h3 className="text-lg font-bold text-white">Enter Verification Code</h3>
                <p className="text-xs text-slate-400">
                  We sent a 6-digit SMS code to <span className="font-mono text-white font-bold">{mobile}</span>
                </p>
                {otpSentMsg && (
                  <p className="text-[11px] text-emerald-400 font-semibold">{otpSentMsg}</p>
                )}
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <input
                    type="text"
                    maxLength={6}
                    required
                    placeholder="• • • • • •"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    className="w-48 mx-auto px-4 py-3 rounded-2xl bg-slate-950 border-2 border-slate-800 text-center text-xl font-mono tracking-widest text-emerald-400 font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex items-center justify-center gap-4 text-xs">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendTimer > 0 || loading}
                    className={`font-semibold ${
                      resendTimer > 0 ? 'text-slate-500' : 'text-emerald-400 hover:underline'
                    }`}
                  >
                    {resendTimer > 0 ? `Resend code in ${resendTimer}s` : 'Resend SMS Code'}
                  </button>
                </div>

                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep('FORM')}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-md transition-all cursor-pointer"
                  >
                    {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                    <span>{loading ? 'Verifying...' : 'Verify & Start Assessment'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 3: 50-QUESTION AGRONOMIC ASSESSMENT */}
          {step === 'ASSESSMENT' && (
            <div className="space-y-5">
              {/* Assessment Progress Header */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white">Agronomy Competency Screening</h3>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold">
                      Passing: 25/50 (50%)
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Candidate: <span className="font-semibold text-white">{fullName}</span> • {specialization}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-xs font-bold text-emerald-400 font-mono">
                      {answeredCount} of {questions.length} answered
                    </span>
                    <div className="w-36 h-2 rounded-full bg-slate-800 mt-1 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 transition-all duration-300"
                        style={{ width: `${(answeredCount / Math.max(1, questions.length)) * 100}%` }}
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleSubmitAssessment}
                    disabled={loading}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-950/40 transition-all"
                  >
                    {loading ? 'Evaluating...' : 'Submit Answers'}
                  </button>
                </div>
              </div>

              {/* Category Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setCurrentCategoryFilter(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                      currentCategoryFilter === cat.id
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-800/80 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Questions Pager / List */}
              <div className="space-y-4">
                {filteredQuestions.map((q) => {
                  const selectedOpt = answers[q.id];
                  const isAnswered = selectedOpt !== undefined;

                  return (
                    <div
                      key={q.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        isAnswered
                          ? 'bg-slate-950/80 border-emerald-500/40 shadow-sm'
                          : 'bg-slate-950/50 border-slate-800/80'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-2.5">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-slate-800 text-slate-300 flex items-center justify-center text-xs font-mono font-bold">
                            {q.id}
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-800 text-slate-400">
                            {q.categoryLabel}
                          </span>
                        </div>
                        {isAnswered && (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                            <Check className="w-3 h-3" /> Answered
                          </span>
                        )}
                      </div>

                      <p className="text-xs font-semibold text-white mb-3">
                        {q.question}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options.map((opt, idx) => {
                          const isSelected = selectedOpt === idx;
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleSelectOption(q.id, idx)}
                              className={`p-2.5 rounded-xl text-left text-xs transition-all flex items-start gap-2.5 ${
                                isSelected
                                  ? 'bg-emerald-600/20 border-2 border-emerald-500 text-emerald-200 font-semibold shadow-md'
                                  : 'bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300'
                              }`}
                            >
                              <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${
                                isSelected ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                              }`}>
                                {String.fromCharCode(65 + idx)}
                              </span>
                              <span className="leading-snug">{opt}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Submit Bar */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Ready to finalize? Server-side scoring will evaluate your agronomic accuracy.
                </span>
                <button
                  onClick={handleSubmitAssessment}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-lg shadow-emerald-950/50 transition-all cursor-pointer"
                >
                  {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <FileCheck className="w-4 h-4" />}
                  <span>{loading ? 'Grading Assessment...' : 'Submit Assessment'}</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: ASSESSMENT RESULT */}
          {step === 'RESULT' && assessmentResult && (
            <div className="space-y-6 max-w-xl mx-auto text-center">
              <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mx-auto shadow-xl ${
                assessmentResult.passed
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-emerald-950/50'
                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
              }`}>
                {assessmentResult.passed ? <Award className="w-8 h-8" /> : <XCircle className="w-8 h-8" />}
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-black text-white">
                  {assessmentResult.passed ? 'Competency Assessment Passed!' : 'Assessment Score Below Threshold'}
                </h3>
                <p className="text-xs text-slate-400">
                  {assessmentResult.message}
                </p>
              </div>

              {/* Score Display Card */}
              <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex items-center justify-around">
                  <div>
                    <span className="text-xs text-slate-400 block mb-1">Your Score</span>
                    <span className="text-3xl font-black font-mono text-white">
                      {assessmentResult.score} / 50
                    </span>
                  </div>

                  <div className="w-px h-10 bg-slate-800" />

                  <div>
                    <span className="text-xs text-slate-400 block mb-1">Percentage</span>
                    <span className={`text-3xl font-black font-mono ${
                      assessmentResult.passed ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      {assessmentResult.percentage}%
                    </span>
                  </div>

                  <div className="w-px h-10 bg-slate-800" />

                  <div>
                    <span className="text-xs text-slate-400 block mb-1">Threshold</span>
                    <span className="text-3xl font-black font-mono text-slate-400">
                      50% (25)
                    </span>
                  </div>
                </div>

                {/* Domain Breakdown */}
                {assessmentResult.categoryScores && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-left">
                    {Object.entries(assessmentResult.categoryScores).map(([cat, pts]) => (
                      <div key={cat} className="p-2 rounded-xl bg-slate-900/60 border border-slate-800">
                        <span className="text-[10px] text-slate-400 capitalize block">{cat.replace('_', ' ')}</span>
                        <span className="text-xs font-black text-emerald-300">{pts} pts</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Next Step Instructions */}
              {assessmentResult.passed ? (
                <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-left text-xs space-y-2">
                  <div className="flex items-center gap-2 text-emerald-300 font-bold">
                    <Clock className="w-4 h-4" /> Next Steps: Administrative Review
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    Your profile and test score of {assessmentResult.percentage}% have been forwarded to the CroperX Operations Team.
                    Once approved, an Administrator will issue a <strong>Single-Use Activation Token</strong> allowing you to set your password and access the <strong>12-Module Agronomist Learning Gateway</strong>.
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-left text-xs space-y-2">
                  <p className="text-slate-300 leading-relaxed">
                    A minimum score of 50% (25/50) is required to qualify as an active agricultural adviser on the CroperX platform.
                    You may review the agronomy syllabus and submit another application in the future.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-center gap-3 pt-2">
                {onOpenActivation && (
                  <button
                    onClick={() => onOpenActivation()}
                    className="px-4 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 text-xs font-bold transition-all"
                  >
                    I have an Activation Token
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition-all"
                >
                  Done
                </button>
              </div>
            </div>
          )}

          {/* STEP 5: STATUS TRACKER */}
          {step === 'STATUS_TRACKER' && trackedStatus && (
            <div className="space-y-6 max-w-lg mx-auto">
              <div className="text-center space-y-1">
                <h3 className="text-lg font-bold text-white">Application Status</h3>
                <p className="text-xs text-slate-400 font-mono">{trackedStatus.mobile}</p>
              </div>

              <div className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">Applicant:</span>
                  <span className="text-xs font-bold text-white">{trackedStatus.fullName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">Specialization:</span>
                  <span className="text-xs text-slate-300">{trackedStatus.specialization}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">Assessment Score:</span>
                  <span className="text-xs font-bold font-mono text-emerald-400">
                    {trackedStatus.assessmentScore ?? 'N/A'} / 50 ({trackedStatus.assessmentPercentage ?? 0}%)
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">Current Status:</span>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                    {trackedStatus.status}
                  </span>
                </div>
              </div>

              {trackedStatus.status === 'APPROVED' && onOpenActivation && (
                <div className="p-4 rounded-2xl bg-blue-950/50 border border-blue-500/40 text-center space-y-3">
                  <p className="text-xs text-blue-200">
                    Your application has been approved! Use your activation token to set up your password and proceed to the Learning Gateway.
                  </p>
                  <button
                    onClick={() => onOpenActivation()}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white transition-all"
                  >
                    Enter Activation Token
                  </button>
                </div>
              )}

              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setStep('FORM')}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300"
                >
                  Back
                </button>
                <button
                  onClick={onClose}
                  className="px-6 py-2 rounded-xl bg-emerald-600 text-xs font-bold text-white"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
