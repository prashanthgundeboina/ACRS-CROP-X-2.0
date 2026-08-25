import React, { useState } from 'react';
import { motion } from 'motion/react';
import { LogOut, AlertTriangle, ShieldAlert, CheckCircle2, Loader2, X, RefreshCw } from 'lucide-react';
import { UserRole } from '../../types';

interface SecureLogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmLogout: (allSessions?: boolean) => void;
  role: UserRole;
  userName?: string;
}

export const SecureLogoutModal: React.FC<SecureLogoutModalProps> = ({
  isOpen,
  onClose,
  onConfirmLogout,
  role,
  userName = 'User',
}) => {
  const [logoutAll, setLogoutAll] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  if (!isOpen) return null;

  const handleLogout = () => {
    setLoggingOut(true);
    setTimeout(() => {
      onConfirmLogout(logoutAll);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl text-slate-900 dark:text-slate-100"
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-rose-950 via-slate-900 to-rose-950 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-white/80 hover:text-white bg-black/30 p-2 rounded-full border border-white/20 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <LogOut className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold">
                {role === 'farmer' && 'Logout from CroperX?'}
                {role === 'farmer_adviser' && 'End Adviser Session?'}
                {role === 'admin' && 'Terminate Administrator Session?'}
              </h3>
              <p className="text-xs text-slate-400">
                {role === 'farmer' && 'Your farm data remains securely saved'}
                {role === 'farmer_adviser' && 'Agronomist workstation sign-out'}
                {role === 'admin' && 'Secure token revocation'}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed">
            {role === 'farmer' && (
              <>
                Are you sure you want to log out, <span className="font-bold text-slate-900 dark:text-white">{userName}</span>? You can log in again anytime using your mobile number and password.
              </>
            )}
            {role === 'farmer_adviser' && (
              <>
                Are you sure you want to end your workstation session, <span className="font-bold text-slate-900 dark:text-white">{userName}</span>? Please make sure all active farmer prescriptions and notes are saved.
              </>
            )}
            {role === 'admin' && (
              <>
                You are about to sign out of the CroperX Administrative Control Center.
              </>
            )}
          </p>

          {/* Admin Multi-Session Checkbox */}
          {role === 'admin' && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 space-y-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={logoutAll}
                  onChange={(e) => setLogoutAll(e.target.checked)}
                  className="w-4 h-4 mt-0.5 accent-rose-600 rounded cursor-pointer"
                />
                <div>
                  <span className="text-xs font-bold text-rose-950 dark:text-rose-200 block">
                    Invalidate All Active Sessions
                  </span>
                  <span className="text-[11px] text-rose-800 dark:text-rose-300 leading-tight block mt-0.5">
                    Revokes all administrative auth tokens and logs out from all other open browsers or devices.
                  </span>
                </div>
              </label>
            </div>
          )}

          {/* Footer Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loggingOut}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={loggingOut}
              onClick={handleLogout}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer"
            >
              {loggingOut ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <LogOut className="w-3.5 h-3.5" />}
              <span>{logoutAll ? 'Logout All Sessions' : 'Confirm Logout'}</span>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
