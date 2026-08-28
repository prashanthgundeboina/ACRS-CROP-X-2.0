import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User, Phone, Lock, Eye, EyeOff, CheckCircle2, AlertCircle,
  Loader2, X, ShieldCheck, ArrowRight, ArrowLeft, KeyRound,
  Sparkles, Check, ChevronRight, HelpCircle, MapPin, Building2,
  Briefcase, Wheat, Award
} from 'lucide-react';
import { UserAccount, UserRole } from '../../types';
import {
  loginUser,
  loginUserWithOtp,
  registerUser,
  resetUserPassword,
  requestAuthOtp,
  verifyAuthOtp,
  validatePhoneNumber
} from '../../services/authService';
import { AdviserOnboardingGateway } from '../adviser/AdviserOnboardingGateway';

interface UnifiedAuthGatewayModalProps {
  isOpen: boolean;
  initialMode?: 'login' | 'register';
  initialRole?: UserRole;
  onClose: () => void;
  onAuthSuccess: (user: UserAccount, targetRole: UserRole) => void;
}

export const UnifiedAuthGatewayModal: React.FC<UnifiedAuthGatewayModalProps> = ({
  isOpen,
  initialMode = 'login',
  initialRole = 'farmer',
  onClose,
  onAuthSuccess
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'reset'>(initialMode);
  
  // Login State
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [isOtpLogin, setIsOtpLogin] = useState(false);
  const [loginOtp, setLoginOtp] = useState('');
  const [loginOtpSent, setLoginOtpSent] = useState(false);

  // Register State (4 Structured Steps)
  // Step 1: Basic Identity (Full Name & Mobile)
  // Step 2: Mobile SMS Verification (OTP)
  // Step 3: Create Secure Password
  // Step 4: Select Role & Profile Details
  const [regStep, setRegStep] = useState<1 | 2 | 3 | 4>(1);
  const [fullName, setFullName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regOtp, setRegOtp] = useState('');
  const [regOtpSent, setRegOtpSent] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'farmer' | 'farmer_adviser' | 'customer'>(
    initialRole === 'farmer_adviser' ? 'farmer_adviser' : initialRole === 'customer' ? 'customer' : 'farmer'
  );
  
  // Farmer Specific Profile State
  const [farmDistrict, setFarmDistrict] = useState('');
  const [farmState, setFarmState] = useState('Punjab');
  const [farmSize, setFarmSize] = useState('5');
  const [primaryCrop, setPrimaryCrop] = useState('Rice');

  // Adviser Specific Registration State
  const [adviserSpecialization, setAdviserSpecialization] = useState('Plant Pathology & Crop Health');
  const [adviserOrganization, setAdviserOrganization] = useState('Regional Agricultural Extension');
  const [adviserLicense, setAdviserLicense] = useState('');
  const [adviserHours, setAdviserHours] = useState('08:00 AM - 06:00 PM IST');

  // Customer Specific Profile State
  const [customerType, setCustomerType] = useState('Commercial Farm Buyer');
  const [customerOrg, setCustomerOrg] = useState('Agro Commodities Trade');

  // Reset Password State
  const [resetPhone, setResetPhone] = useState('');
  const [resetOtp, setResetOtp] = useState('');
  const [resetOtpSent, setResetOtpSent] = useState(false);
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetStep, setResetStep] = useState<1 | 2>(1);

  // Adviser Onboarding Gateway Modal State (Phase 43)
  const [showAdviserOnboarding, setShowAdviserOnboarding] = useState(false);

  // Status & Feedback
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Password strength helper
  const evaluatePasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: 'None', color: 'bg-slate-700' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass) || /[A-Z]/.test(pass)) score += 1;

    switch (score) {
      case 1: return { score, label: 'Weak (min 6 chars)', color: 'bg-red-500' };
      case 2: return { score, label: 'Fair', color: 'bg-amber-500' };
      case 3: return { score, label: 'Good & Secure', color: 'bg-blue-500' };
      case 4: return { score, label: 'Strong Protection', color: 'bg-emerald-500' };
      default: return { score: 0, label: 'Too Short', color: 'bg-slate-700' };
    }
  };

  // Handle Request Login OTP
  const handleSendLoginOtp = async () => {
    const phoneCheck = validatePhoneNumber(loginPhone);
    if (!phoneCheck.valid) {
      setError(phoneCheck.error || "Please enter a valid 10-digit mobile number first.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await requestAuthOtp(phoneCheck.normalized, 'login');
      setLoginOtpSent(true);
      setSuccessMsg(res.message || "Verification code sent to your mobile number.");
    } catch (err: any) {
      setError(err.message || "Failed to send verification SMS.");
    } finally {
      setLoading(false);
    }
  };

  // Handle Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const phoneCheck = validatePhoneNumber(loginPhone);
    if (!phoneCheck.valid) {
      setError(phoneCheck.error || "Please enter a valid 10-digit mobile number.");
      return;
    }
    if (!isOtpLogin && !loginPassword) {
      setError("Please enter your password.");
      return;
    }
    if (isOtpLogin && (!loginOtp || loginOtp.trim().length < 4)) {
      setError("Please enter the 6-digit verification code.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      if (isOtpLogin) {
        const res = await loginUserWithOtp(phoneCheck.normalized, loginOtp.trim());
        const resolvedRole: UserRole = res.user.role || 'farmer';
        onAuthSuccess(res.user, resolvedRole);
        onClose();
      } else {
        const res = await loginUser(phoneCheck.normalized, loginPassword);
        const resolvedRole: UserRole = res.user.role || 'farmer';
        onAuthSuccess(res.user, resolvedRole);
        onClose();
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Validate Name & Phone -> Request OTP
  const handleRegisterStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!fullName.trim()) {
      setError("Please provide your full name.");
      return;
    }
    const phoneCheck = validatePhoneNumber(regPhone);
    if (!phoneCheck.valid) {
      setError(phoneCheck.error || "Please provide a valid 10-digit mobile number.");
      return;
    }

    try {
      setLoading(true);
      const otpRes = await requestAuthOtp(phoneCheck.normalized, 'registration');
      setSuccessMsg(otpRes.message || "Verification code sent to your mobile number.");
      setRegOtpSent(true);
      setRegStep(2);
    } catch (err: any) {
      setError(err.message || "Failed to send verification OTP.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP -> Go to Step 3 (Password creation)
  const handleRegisterStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regOtp || regOtp.length < 4) {
      setError("Please enter the 6-digit verification code received on your mobile.");
      return;
    }
    setError(null);
    try {
      setLoading(true);
      await verifyAuthOtp(regPhone, regOtp);
      setRegStep(3);
    } catch (err: any) {
      setError(err.message || "Invalid or expired verification code.");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Create Secure Password -> Go to Step 4 (Role & Profile)
  const handleRegisterStep3 = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (regPassword.length < 6) {
      setError("Password must be at least 6 characters in length.");
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setError("Passwords do not match. Please re-check.");
      return;
    }
    setRegStep(4);
  };

  // Step 4: Final Submit -> Create Account in Supabase / DB
  const handleRegisterFinalSubmit = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await registerUser({
        phoneNumber: regPhone,
        password: regPassword,
        farmerName: fullName,
        fullName: fullName,
        role: selectedRole,
        district: farmDistrict || undefined,
        state: farmState || undefined,
        farmAreaSize: Number(farmSize) || undefined,
        preferredCropCycle: primaryCrop ? `${primaryCrop} Cycle` : undefined,
        specialization: selectedRole === 'farmer_adviser' ? adviserSpecialization : undefined,
        organization: selectedRole === 'farmer_adviser' ? adviserOrganization : selectedRole === 'customer' ? customerOrg : undefined,
        licenseNumber: selectedRole === 'farmer_adviser' ? adviserLicense : undefined,
        consultationHours: selectedRole === 'farmer_adviser' ? adviserHours : undefined,
        customerType: selectedRole === 'customer' ? customerType : undefined,
      });

      setSuccessMsg("Account successfully verified and provisioned! Entering your workspace...");
      setTimeout(() => {
        onAuthSuccess(res.user, selectedRole);
        onClose();
      }, 700);
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 12 }}
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden text-slate-100 my-8"
      >
        {/* Header */}
        <div className="relative p-6 pb-4 border-b border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-bold text-slate-950 text-sm shadow-xs">
              🌱
            </div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">CroperX Gateway</span>
          </div>

          <h2 className="text-xl font-black text-white">
            {mode === 'login' && (isOtpLogin ? 'Mobile Verification Login' : 'Welcome Back')}
            {mode === 'register' && 'Create Your CroperX Account'}
            {mode === 'reset' && 'Reset Secure Password'}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {mode === 'login' && 'Sign in to access your agricultural intelligence workspace.'}
            {mode === 'register' && `Step ${regStep} of 4 — ${regStep === 1 ? 'Personal Identity' : regStep === 2 ? 'Mobile Verification' : regStep === 3 ? 'Security Credential' : 'Role & Farm Profile'}`}
            {mode === 'reset' && 'Verify your mobile number to restore password access.'}
          </p>

          {/* Mode Switcher Tabs */}
          {mode !== 'reset' && (
            <div className="flex items-center gap-2 mt-4 p-1 bg-slate-950/80 rounded-2xl border border-slate-800">
              <button
                type="button"
                onClick={() => { setMode('login'); setError(null); }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  mode === 'login'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setMode('register'); setError(null); }}
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                  mode === 'register'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Register
              </button>
            </div>
          )}
        </div>

        {/* Feedback Alerts */}
        {error && (
          <div className="mx-6 mt-4 p-3 bg-red-950/70 border border-red-800/80 rounded-2xl text-xs text-red-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="mx-6 mt-4 p-3 bg-emerald-950/70 border border-emerald-800/80 rounded-2xl text-xs text-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* BODY CONTENT */}
        <div className="p-6 pt-4 space-y-4">
          {/* ============================================================ */}
          {/* MODE: LOGIN */}
          {/* ============================================================ */}
          {mode === 'login' && (
            <div className="space-y-4">
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Mobile Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="tel"
                      placeholder="+91 98765 43210 or 00110099"
                      value={loginPhone}
                      onChange={(e) => setLoginPhone(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>
                </div>

                {!isOtpLogin ? (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-slate-300">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => { setMode('reset'); setError(null); }}
                        className="text-[11px] text-emerald-400 hover:underline"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type={showLoginPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-200"
                      >
                        {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-slate-300">
                        6-Digit SMS Verification Code
                      </label>
                      <button
                        type="button"
                        onClick={handleSendLoginOtp}
                        disabled={loading || !loginPhone.trim()}
                        className="text-[11px] text-emerald-400 hover:text-emerald-300 font-bold transition-colors disabled:opacity-50"
                      >
                        {loginOtpSent ? 'Resend SMS Code' : 'Send SMS Code'}
                      </button>
                    </div>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="Enter 6-digit code"
                        value={loginOtp}
                        onChange={(e) => setLoginOtp(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white font-mono tracking-widest text-center placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => { setIsOtpLogin(!isOtpLogin); setError(null); }}
                    className="text-emerald-400 hover:text-emerald-300 font-semibold"
                  >
                    {isOtpLogin ? '← Use Password Instead' : '⚡ Login with Mobile OTP'}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying Authoritative Credentials...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to CroperX</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>

              {/* Adviser Verification & Onboarding Direct Trigger */}
              <div className="pt-2 border-t border-slate-800 text-center">
                <button
                  type="button"
                  onClick={() => setShowAdviserOnboarding(true)}
                  className="inline-flex items-center gap-1.5 text-xs text-teal-400 hover:text-teal-300 font-semibold transition-colors"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Farm Adviser Applicant? Complete Assessment & Verification</span>
                </button>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* MODE: REGISTER (4-STEP REAL FLOW) */}
          {/* ============================================================ */}
          {mode === 'register' && (
            <div className="space-y-4">
              {/* Step indicator breadcrumb */}
              <div className="flex items-center justify-between gap-1.5 px-1">
                {[1, 2, 3, 4].map((s) => (
                  <div key={s} className="flex-1 flex items-center gap-1">
                    <div
                      className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center transition-all ${
                        regStep === s
                          ? 'bg-emerald-500 text-slate-950 font-black scale-110'
                          : regStep > s
                          ? 'bg-emerald-800 text-emerald-200'
                          : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      {regStep > s ? '✓' : s}
                    </div>
                    <div className={`h-1 flex-1 rounded-full ${regStep >= s ? 'bg-emerald-500' : 'bg-slate-800'}`} />
                  </div>
                ))}
              </div>

              {/* STEP 1: Basic Identity */}
              {regStep === 1 && (
                <div className="space-y-4">
                  <form onSubmit={handleRegisterStep1} className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Full Name
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                        <input
                          type="text"
                          placeholder="Ramesh Kumar"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Mobile Number (For SMS Verification)
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                        <input
                          type="tel"
                          placeholder="+91 98765 43210"
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full mt-2 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Sending Verification SMS...</span>
                        </>
                      ) : (
                        <>
                          <span>Send Mobile Verification OTP</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}

              {/* STEP 2: Verify Mobile (OTP) */}
              {regStep === 2 && (
                <form onSubmit={handleRegisterStep2} className="space-y-4">
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2">
                    <div className="w-10 h-10 rounded-full bg-emerald-950/80 text-emerald-400 flex items-center justify-center mx-auto">
                      <Phone className="w-5 h-5" />
                    </div>
                    <p className="text-xs text-slate-300">
                      We dispatched a 6-digit verification code to <span className="font-bold text-white">{regPhone}</span>
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      6-Digit OTP Code
                    </label>
                    <div className="relative">
                      <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="Enter 6-digit code"
                        value={regOtp}
                        onChange={(e) => setRegOtp(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-sm text-white font-mono tracking-widest text-center focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setRegStep(1)}
                      className="py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1.5"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back</span>
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Verifying OTP...</span>
                        </>
                      ) : (
                        <>
                          <span>Verify & Create Password</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 3: Create Secure Password */}
              {regStep === 3 && (
                <form onSubmit={handleRegisterStep3} className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Create Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        placeholder="Min 6 characters"
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-200"
                      >
                        {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {regPassword && (
                      <div className="mt-1.5 flex items-center justify-between text-[10px]">
                        <span className="text-slate-400">Strength: {evaluatePasswordStrength(regPassword).label}</span>
                        <div className="w-20 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div className={`h-full ${evaluatePasswordStrength(regPassword).color} transition-all`} style={{ width: `${(evaluatePasswordStrength(regPassword).score / 4) * 100}%` }} />
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        placeholder="Re-enter password"
                        value={regConfirmPassword}
                        onChange={(e) => setRegConfirmPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setRegStep(2)}
                      className="py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1.5"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back</span>
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40"
                    >
                      <span>Proceed to Profile Setup</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 4: Choose Role & Profile Details */}
              {regStep === 4 && (
                <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                  <div className="text-xs font-semibold text-slate-300">
                    Select Your Agricultural Role:
                  </div>

                  {/* Role Option 1: Farmer */}
                  <div
                    onClick={() => setSelectedRole('farmer')}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      selectedRole === 'farmer'
                        ? 'bg-emerald-950/40 border-emerald-500 ring-1 ring-emerald-500/50'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-2xl p-1 bg-emerald-900/40 rounded-xl">👨‍🌾</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-white">Farmer</h4>
                          {selectedRole === 'farmer' && (
                            <span className="w-4 h-4 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center text-[10px] font-black">✓</span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Moisture tracking, weather advisories, voice AI diagnostics & direct adviser consultations.
                        </p>
                      </div>
                    </div>

                    {selectedRole === 'farmer' && (
                      <div className="mt-3 pt-3 border-t border-emerald-800/40 space-y-2 text-left" onClick={(e) => e.stopPropagation()}>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] uppercase font-bold text-emerald-300 mb-1">
                              District / Region
                            </label>
                            <input
                              type="text"
                              value={farmDistrict}
                              onChange={(e) => setFarmDistrict(e.target.value)}
                              placeholder="e.g. Ludhiana"
                              className="w-full px-2.5 py-1.5 bg-slate-900/90 border border-emerald-700/60 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase font-bold text-emerald-300 mb-1">
                              Primary Crop
                            </label>
                            <input
                              type="text"
                              value={primaryCrop}
                              onChange={(e) => setPrimaryCrop(e.target.value)}
                              placeholder="e.g. Rice / Wheat"
                              className="w-full px-2.5 py-1.5 bg-slate-900/90 border border-emerald-700/60 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Role Option 2: Farm Adviser */}
                  <div
                    onClick={() => setSelectedRole('farmer_adviser')}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      selectedRole === 'farmer_adviser'
                        ? 'bg-teal-950/40 border-teal-500 ring-1 ring-teal-500/50'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-2xl p-1 bg-teal-900/40 rounded-xl">🧑‍🌾</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-white">Farm Adviser</h4>
                          {selectedRole === 'farmer_adviser' && (
                            <span className="w-4 h-4 rounded-full bg-teal-500 text-slate-950 flex items-center justify-center text-[10px] font-black">✓</span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Crop pathology, tele-consultations, prescription dispatch & farmer triage.
                        </p>
                      </div>
                    </div>

                    {selectedRole === 'farmer_adviser' && (
                      <div className="mt-3 pt-3 border-t border-teal-800/40 space-y-2 text-left" onClick={(e) => e.stopPropagation()}>
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-teal-300 mb-1">
                            Agronomy Specialization
                          </label>
                          <input
                            type="text"
                            value={adviserSpecialization}
                            onChange={(e) => setAdviserSpecialization(e.target.value)}
                            placeholder="e.g. Plant Pathology & Crop Protection"
                            className="w-full px-3 py-1.5 bg-slate-900/90 border border-teal-700/60 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] uppercase font-bold text-teal-300 mb-1">
                              Organization / Bureau
                            </label>
                            <input
                              type="text"
                              value={adviserOrganization}
                              onChange={(e) => setAdviserOrganization(e.target.value)}
                              placeholder="e.g. Extension Service"
                              className="w-full px-2.5 py-1.5 bg-slate-900/90 border border-teal-700/60 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] uppercase font-bold text-teal-300 mb-1">
                              License # (Optional)
                            </label>
                            <input
                              type="text"
                              value={adviserLicense}
                              onChange={(e) => setAdviserLicense(e.target.value)}
                              placeholder="AGR-2026-X"
                              className="w-full px-2.5 py-1.5 bg-slate-900/90 border border-teal-700/60 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-400"
                            />
                          </div>
                        </div>

                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={() => setShowAdviserOnboarding(true)}
                            className="w-full py-2.5 px-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
                          >
                            <ShieldCheck className="w-4 h-4" />
                            <span>Start 50-Q Assessment & Onboarding Pipeline</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Role Option 3: Customer / Commodity Buyer */}
                  <div
                    onClick={() => setSelectedRole('customer')}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      selectedRole === 'customer'
                        ? 'bg-amber-950/40 border-amber-500 ring-1 ring-amber-500/50'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-2xl p-1 bg-amber-900/40 rounded-xl">🏢</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-white">Crop Buyer / Customer</h4>
                          {selectedRole === 'customer' && (
                            <span className="w-4 h-4 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-[10px] font-black">✓</span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Commercial agricultural procurement, contract farming orders & commodity hub tracking.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setRegStep(3)}
                      className="py-3 px-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1.5"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back</span>
                    </button>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={handleRegisterFinalSubmit}
                      className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50 disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Provisioning Account...</span>
                        </>
                      ) : (
                        <>
                          <span>Complete Registration</span>
                          <CheckCircle2 className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ============================================================ */}
          {/* MODE: RESET PASSWORD */}
          {/* ============================================================ */}
          {mode === 'reset' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Mobile Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={resetPhone}
                    onChange={(e) => setResetPhone(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  New Secure Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type={showResetPassword ? 'text' : 'password'}
                    placeholder="Min 6 characters"
                    value={resetNewPassword}
                    onChange={(e) => setResetNewPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowResetPassword(!showResetPassword)}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-slate-200"
                  >
                    {showResetPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="button"
                disabled={loading}
                onClick={async () => {
                  const phoneCheck = validatePhoneNumber(resetPhone);
                  if (!phoneCheck.valid) {
                    setError(phoneCheck.error || "Please provide a valid 10-digit mobile number.");
                    return;
                  }
                  if (!resetNewPassword || resetNewPassword.length < 6) {
                    setError("Please provide a new password (min 6 characters).");
                    return;
                  }
                  setLoading(true);
                  setError(null);
                  try {
                    await resetUserPassword(phoneCheck.normalized, resetNewPassword);
                    setSuccessMsg("Password updated! Please login with your new credentials.");
                    setTimeout(() => { setMode('login'); setSuccessMsg(null); }, 1400);
                  } catch (err: any) {
                    setError(err.message || "Failed to reset password.");
                  } finally {
                    setLoading(false);
                  }
                }}
                className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Update Password</span>}
              </button>

              <button
                type="button"
                onClick={() => { setMode('login'); setError(null); }}
                className="w-full text-center text-xs text-slate-400 hover:text-white"
              >
                ← Back to Sign In
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Adviser Verification & Onboarding Gateway (Phase 43) */}
      <AnimatePresence>
        {showAdviserOnboarding && (
          <AdviserOnboardingGateway
            initialMobile={loginPhone || regPhone}
            onClose={() => setShowAdviserOnboarding(false)}
            onEnterWorkstation={(user) => {
              setShowAdviserOnboarding(false);
              onAuthSuccess(user, 'farmer_adviser');
              onClose();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};
