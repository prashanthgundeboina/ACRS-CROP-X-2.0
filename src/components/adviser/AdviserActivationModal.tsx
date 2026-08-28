import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Key, ShieldCheck, CheckCircle2, Lock, AlertCircle, Eye, EyeOff,
  RefreshCw, Check, ArrowRight, BookOpen
} from 'lucide-react';
import { UserAccount } from '../../types';

interface AdviserActivationModalProps {
  initialToken?: string;
  onClose: () => void;
  onSuccess: (user: UserAccount, token: string) => void;
}

export const AdviserActivationModal: React.FC<AdviserActivationModalProps> = ({
  initialToken = '',
  onClose,
  onSuccess
}) => {
  const [token, setToken] = useState(initialToken);
  const [tokenVerified, setTokenVerified] = useState(false);
  const [tokenData, setTokenData] = useState<{
    mobile: string;
    fullName: string;
    specialization: string;
    expiresAt: string;
  } | null>(null);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (initialToken && initialToken.trim().length > 8) {
      verifyToken(initialToken.trim());
    }
  }, [initialToken]);

  const verifyToken = async (tokenToVerify: string) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/adviser/activation/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tokenToVerify.trim() })
      });

      const data = await res.json();
      if (res.ok && data.valid) {
        setTokenVerified(true);
        setTokenData({
          mobile: data.mobile,
          fullName: data.fullName,
          specialization: data.specialization,
          expiresAt: data.expiresAt
        });
      } else {
        setTokenVerified(false);
        setErrorMessage(data.error || 'Invalid or expired activation token.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Error connecting to verification server.');
    } finally {
      setLoading(false);
    }
  };

  const handleManualVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) {
      setErrorMessage('Please enter the activation token provided by administration.');
      return;
    }
    verifyToken(token.trim());
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/adviser/activation/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: token.trim(),
          password,
          confirmPassword
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMessage('Password established! Redirecting to the 12-Module Learning Gateway...');
        setTimeout(() => {
          onSuccess(data.user, data.token);
        }, 1500);
      } else {
        setErrorMessage(data.error || 'Failed to set password.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Network error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5"
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-md">
              <Key className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Adviser Account Activation
              </h3>
              <p className="text-xs text-slate-400">
                Single-Use Token & Password Setup
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-xs transition-all"
          >
            ✕
          </button>
        </div>

        {/* Error / Success Notifications */}
        {errorMessage && (
          <div className="p-3 rounded-2xl bg-rose-950/50 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 rounded-2xl bg-emerald-950/50 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Step A: Token Input (If not verified) */}
        {!tokenVerified ? (
          <form onSubmit={handleManualVerify} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
                Single-Use Activation Token *
              </label>
              <textarea
                required
                rows={3}
                placeholder="Paste the activation token issued by administration..."
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:border-emerald-500"
              />
              <p className="text-[11px] text-slate-500">
                Tokens are issued by CroperX Administration after your 50-question assessment is approved.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-md transition-all cursor-pointer"
              >
                {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Key className="w-3.5 h-3.5" />}
                <span>{loading ? 'Verifying Token...' : 'Verify Token'}</span>
              </button>
            </div>
          </form>
        ) : (
          /* Step B: Password Setup (When Token is Verified) */
          <form onSubmit={handleSetPassword} className="space-y-4">
            {/* Candidate Identity Preview */}
            {tokenData && (
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-emerald-500/30 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Adviser Name:</span>
                  <span className="font-bold text-white">{tokenData.fullName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Mobile:</span>
                  <span className="font-mono text-emerald-400">{tokenData.mobile}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Specialization:</span>
                  <span className="text-slate-300">{tokenData.specialization}</span>
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Create Secure Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 pr-10 focus:outline-none focus:border-emerald-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                Confirm Password *
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="p-3 rounded-2xl bg-blue-950/30 border border-blue-500/20 text-[11px] text-blue-300 flex items-start gap-2">
              <BookOpen className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <span>
                After creating your password, you will immediately unlock the <strong>12-Module Adviser Learning Gateway</strong>.
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-lg shadow-emerald-950/50 transition-all cursor-pointer"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
                <span>{loading ? 'Activating Account...' : 'Set Password & Launch Learning Gateway'}</span>
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};
