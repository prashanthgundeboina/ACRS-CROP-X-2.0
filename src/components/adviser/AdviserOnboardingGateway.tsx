import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  UserCheck, 
  FileText, 
  Award, 
  BookOpen, 
  CheckCircle2, 
  Clock, 
  Lock, 
  Unlock, 
  AlertCircle, 
  Sparkles, 
  ArrowRight, 
  RefreshCw, 
  KeyRound, 
  Send, 
  Phone, 
  GraduationCap, 
  Briefcase, 
  Layers, 
  Check, 
  Loader2,
  XCircle,
  HelpCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { AdviserAssessmentView } from './AdviserAssessmentView';
import { AdviserLearningGateway } from './AdviserLearningGateway';

interface AdviserOnboardingGatewayProps {
  initialMobile?: string;
  onEnterWorkstation: (user: any) => void;
  onClose?: () => void;
}

export const AdviserOnboardingGateway: React.FC<AdviserOnboardingGatewayProps> = ({
  initialMobile = '',
  onEnterWorkstation,
  onClose
}) => {
  const [mobileNumber, setMobileNumber] = useState<string>(initialMobile);
  const [fullName, setFullName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [specialization, setSpecialization] = useState<string>('Plant Pathology & Crop Health');
  const [yearsOfExperience, setYearsOfExperience] = useState<number>(4);
  const [qualification, setQualification] = useState<string>('B.Sc Agriculture');
  const [institution, setInstitution] = useState<string>('Punjab Agricultural University');
  const [primaryCrops, setPrimaryCrops] = useState<string[]>(['Wheat', 'Rice', 'Cotton']);
  const [languages, setLanguages] = useState<string[]>(['English', 'Hindi', 'Punjabi']);
  const [region, setRegion] = useState<string>('Northern Zone');
  const [district, setDistrict] = useState<string>('Ludhiana');
  const [state, setState] = useState<string>('Punjab');

  // Application / Workflow State
  const [loading, setLoading] = useState<boolean>(false);
  const [appStatus, setAppStatus] = useState<string>('CHECKING');
  const [applicationData, setApplicationData] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Flow Sub-Views
  const [currentStep, setCurrentStep] = useState<
    'FORM' | 'ASSESSMENT' | 'ASSESSMENT_RESULT' | 'STATUS_VIEW' | 'ACTIVATION' | 'LEARNING'
  >('FORM');

  // Password Setup States
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [activationToken, setActivationToken] = useState<string>('');

  // Assessment results
  const [assessmentResult, setAssessmentResult] = useState<any>(null);

  // Check application status on mount or mobile change
  const checkStatus = async (phoneToCheck: string) => {
    if (!phoneToCheck || phoneToCheck.trim().length < 6) {
      setAppStatus('NEW');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/adviser/application/status?mobileNumber=${encodeURIComponent(phoneToCheck.trim())}`);
      const data = await res.json();

      if (data.success && data.application) {
        setApplicationData(data.application);
        setAppStatus(data.application.status);
        setFullName(data.application.fullName || fullName);
        setSpecialization(data.application.specialization || specialization);

        // Determine step based on status
        if (data.application.status === 'ASSESSMENT_REQUIRED') {
          setCurrentStep('ASSESSMENT');
        } else if (data.application.status === 'PENDING_ADMIN_REVIEW' || data.application.status === 'NOT_ELIGIBLE' || data.application.status === 'REJECTED') {
          setCurrentStep('STATUS_VIEW');
        } else if (data.application.status === 'APPROVED' && !data.application.passwordSetupCompleted) {
          setCurrentStep('ACTIVATION');
        } else if (data.application.passwordSetupCompleted && !data.application.courseCompleted) {
          setCurrentStep('LEARNING');
        } else if (data.application.status === 'ACTIVE' || (data.application.passwordSetupCompleted && data.application.courseCompleted)) {
          setCurrentStep('STATUS_VIEW');
        }
      } else {
        setAppStatus('NEW');
        setCurrentStep('FORM');
      }
    } catch (err) {
      console.warn('Status check error:', err);
      setAppStatus('NEW');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialMobile) {
      checkStatus(initialMobile);
    } else {
      setAppStatus('NEW');
    }
  }, [initialMobile]);

  // Handle Initial Application Form Submit
  const handleRegisterForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileNumber || !fullName) {
      setErrorMessage('Please provide your full name and registered mobile number.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/adviser/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobileNumber,
          fullName,
          email,
          specialization,
          yearsOfExperience,
          qualification,
          institution,
          primaryCrops,
          languages,
          region,
          district,
          state
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit application.');
      }

      setApplicationData(data.application);
      setAppStatus('ASSESSMENT_REQUIRED');
      setCurrentStep('ASSESSMENT');
    } catch (err: any) {
      setErrorMessage(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  // Handle Assessment Completion
  const handleAssessmentComplete = (result: any) => {
    setAssessmentResult(result);
    setAppStatus(result.status);
    setCurrentStep('ASSESSMENT_RESULT');
    // Refresh status data
    checkStatus(mobileNumber);
  };

  // Handle Password Activation Submission
  const handleActivatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/adviser/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mobileNumber,
          token: activationToken,
          newPassword
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Password setup failed.');
      }

      setApplicationData(data.application);
      setAppStatus('LEARNING_REQUIRED');
      setCurrentStep('LEARNING');
    } catch (err: any) {
      setErrorMessage(err.message || 'Activation failed.');
    } finally {
      setLoading(false);
    }
  };

  // Final Course Completion
  const handleCourseComplete = () => {
    // Grant access into workstation
    onEnterWorkstation({
      phoneNumber: mobileNumber,
      fullName: applicationData?.fullName || fullName,
      role: 'farmer_adviser',
      specialization: applicationData?.specialization || specialization,
      phoneVerified: true
    });
  };

  // Render Sub-view based on currentStep
  if (currentStep === 'ASSESSMENT') {
    return (
      <div className="min-h-screen bg-slate-950 p-4 sm:p-6 flex items-center justify-center">
        <AdviserAssessmentView
          mobileNumber={mobileNumber}
          applicantName={fullName || applicationData?.fullName}
          onComplete={handleAssessmentComplete}
          onCancel={() => setCurrentStep('FORM')}
        />
      </div>
    );
  }

  if (currentStep === 'LEARNING') {
    return (
      <AdviserLearningGateway
        mobileNumber={mobileNumber}
        adviserName={fullName || applicationData?.fullName}
        onCourseComplete={handleCourseComplete}
        onExit={() => setCurrentStep('STATUS_VIEW')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-900/90 backdrop-blur-md text-slate-100 flex items-center justify-center p-4 sm:p-6 z-50">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-slate-900 dark:text-slate-100">
        
        {/* Top Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-indigo-900 px-6 sm:px-8 py-6 text-white relative">
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-200 text-xs font-semibold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              CroperX Agronomist Verification
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-xs text-white"
              >
                ✕
              </button>
            )}
          </div>
          <h2 className="text-2xl font-bold tracking-tight mt-2">
            Adviser Onboarding & Competency Gateway
          </h2>
          <p className="text-emerald-100/80 text-xs sm:text-sm mt-0.5">
            Rigorous 4-stage credential verification, agronomic testing, admin auditing & platform mastery.
          </p>
        </div>

        {/* Dynamic Body Content */}
        <div className="p-6 sm:p-8 space-y-6">

          {/* Error Alert */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 flex items-center gap-3 text-xs sm:text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STEP 1: Registration Form */}
          {currentStep === 'FORM' && (
            <form onSubmit={handleRegisterForm} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="e.g. Dr. Anand Sharma"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    value={mobileNumber}
                    onChange={e => setMobileNumber(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-emerald-500 outline-none font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Specialization
                  </label>
                  <select
                    value={specialization}
                    onChange={e => setSpecialization(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="Plant Pathology & Crop Health">Plant Pathology & Crop Health</option>
                    <option value="Soil Fertility & Nutrient Management">Soil Fertility & Nutrient Management</option>
                    <option value="Entomology & Integrated Pest Management">Entomology & IPM</option>
                    <option value="Precision Agronomy & Irrigation">Precision Agronomy & Irrigation</option>
                    <option value="Horticulture & Cash Crops">Horticulture & Cash Crops</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Experience (Years)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="45"
                    value={yearsOfExperience}
                    onChange={e => setYearsOfExperience(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Highest Qualification
                  </label>
                  <input
                    type="text"
                    value={qualification}
                    onChange={e => setQualification(e.target.value)}
                    placeholder="e.g. M.Sc Agronomy"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Institution / University
                  </label>
                  <input
                    type="text"
                    value={institution}
                    onChange={e => setInstitution(e.target.value)}
                    placeholder="e.g. Agricultural University"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    District & State
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={district}
                      onChange={e => setDistrict(e.target.value)}
                      placeholder="District"
                      className="w-1/2 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                    <input
                      type="text"
                      value={state}
                      onChange={e => setState(e.target.value)}
                      placeholder="State"
                      className="w-1/2 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Languages Spoken
                  </label>
                  <input
                    type="text"
                    value={languages.join(', ')}
                    onChange={e => setLanguages(e.target.value.split(',').map(s => s.trim()))}
                    placeholder="e.g. English, Hindi, Punjabi"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              {/* Requirement Checklist */}
              <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 space-y-2 text-xs text-slate-700 dark:text-slate-300">
                <div className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  What happens after submitting this application:
                </div>
                <div className="space-y-1 pl-5 list-disc text-slate-600 dark:text-slate-400">
                  <div>1. Complete the 50-Question Agronomic Competency Assessment (50% passing threshold).</div>
                  <div>2. Application and test scores are submitted to the CroperX Admin Review Board.</div>
                  <div>3. Upon approval, receive a secure password setup link and complete the 12-Module Learning Gateway.</div>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting Application...</span>
                    </>
                  ) : (
                    <>
                      <span>Proceed to 50-Q Assessment</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* ASSESSMENT RESULT / STATUS VIEW */}
          {(currentStep === 'ASSESSMENT_RESULT' || currentStep === 'STATUS_VIEW') && (
            <div className="space-y-6 text-center py-4">
              
              {/* Status Header Icon */}
              <div className="w-16 h-16 mx-auto rounded-3xl flex items-center justify-center text-3xl shadow-xl bg-slate-100 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700">
                {appStatus === 'PENDING_ADMIN_REVIEW' && '⏳'}
                {appStatus === 'NOT_ELIGIBLE' && '❌'}
                {appStatus === 'REJECTED' && '🚫'}
                {appStatus === 'APPROVED' && '✅'}
                {appStatus === 'LEARNING_REQUIRED' && '📚'}
                {appStatus === 'ACTIVE' && '🌾'}
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                  {appStatus === 'PENDING_ADMIN_REVIEW' && 'Assessment Completed & Under Review'}
                  {appStatus === 'NOT_ELIGIBLE' && 'Score Threshold Not Met'}
                  {appStatus === 'REJECTED' && 'Application Not Approved'}
                  {appStatus === 'APPROVED' && 'Application Approved!'}
                  {appStatus === 'LEARNING_REQUIRED' && 'Learning Gateway In Progress'}
                  {appStatus === 'ACTIVE' && 'Adviser Verification Complete'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-md mx-auto">
                  {appStatus === 'PENDING_ADMIN_REVIEW' && 'Your 50-question assessment has been evaluated server-side and submitted to the Admin Board for qualification review.'}
                  {appStatus === 'NOT_ELIGIBLE' && 'Your score was below the mandatory 25/50 requirement. You may review the syllabus and retake the test.'}
                  {appStatus === 'REJECTED' && (applicationData?.rejectionReason || 'The administration did not approve this application.')}
                  {appStatus === 'APPROVED' && 'Your qualifications and assessment have been verified. Please set up your password to proceed to the Learning Gateway.'}
                  {appStatus === 'LEARNING_REQUIRED' && 'Please complete all 12 modules and the final mastery test to activate your Live Workstation.'}
                  {appStatus === 'ACTIVE' && 'You are fully activated and certified to advise farmers across the CroperX network.'}
                </p>
              </div>

              {/* Assessment Score pill if available */}
              {(applicationData?.assessmentScore !== undefined || assessmentResult?.score !== undefined) && (
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 max-w-sm mx-auto flex items-center justify-around border border-slate-200 dark:border-slate-700">
                  <div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase">Score</div>
                    <div className="text-lg font-bold font-mono text-emerald-600">
                      {assessmentResult?.score ?? applicationData?.assessmentScore} / 50
                    </div>
                  </div>
                  <div className="w-px h-8 bg-slate-300 dark:bg-slate-700" />
                  <div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase">Percentage</div>
                    <div className="text-lg font-bold font-mono text-emerald-600">
                      {assessmentResult?.percentage ?? applicationData?.assessmentPercentage}%
                    </div>
                  </div>
                  <div className="w-px h-8 bg-slate-300 dark:bg-slate-700" />
                  <div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase">Result</div>
                    <div className={`text-xs font-bold ${
                      (assessmentResult?.score ?? applicationData?.assessmentScore) >= 25 ? 'text-emerald-600' : 'text-red-500'
                    }`}>
                      {(assessmentResult?.score ?? applicationData?.assessmentScore) >= 25 ? 'Eligible' : 'Ineligible'}
                    </div>
                  </div>
                </div>
              )}

              {/* Context Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                {appStatus === 'APPROVED' && (
                  <button
                    onClick={() => setCurrentStep('ACTIVATION')}
                    className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>Set Up Secure Password</span>
                  </button>
                )}

                {appStatus === 'LEARNING_REQUIRED' && (
                  <button
                    onClick={() => setCurrentStep('LEARNING')}
                    className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4" />
                    <span>Resume Learning Gateway</span>
                  </button>
                )}

                {appStatus === 'ACTIVE' && (
                  <button
                    onClick={handleCourseComplete}
                    className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-sm rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Unlock className="w-4 h-4" />
                    <span>Enter Adviser Workstation</span>
                  </button>
                )}

                {appStatus === 'NOT_ELIGIBLE' && (
                  <button
                    onClick={() => setCurrentStep('ASSESSMENT')}
                    className="w-full sm:w-auto px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Retake 50-Q Assessment</span>
                  </button>
                )}

                <button
                  onClick={() => checkStatus(mobileNumber)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Refresh Status</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: Password Setup / Activation Form */}
          {currentStep === 'ACTIVATION' && (
            <form onSubmit={handleActivatePassword} className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>Your application has been approved by the Administrator! Please set a strong, confidential password for your account.</span>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    New Password * (minimum 6 characters)
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Confirm Password *
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Configuring Account...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      <span>Set Password & Open Learning Gateway</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
