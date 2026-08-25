import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User,
  Settings,
  HelpCircle,
  LogOut,
  Bell,
  Shield,
  ScrollText,
  Lock,
  ChevronDown,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Check
} from 'lucide-react';
import { UserAccount, UserRole } from '../../types';

interface GlobalAccountMenuProps {
  currentUser: UserAccount | null;
  currentRole: UserRole;
  onOpenProfile: () => void;
  onOpenSettings: (section?: string) => void;
  onOpenNotifications?: () => void;
  onOpenHelp?: () => void;
  onOpenSecurity?: () => void;
  onOpenAuditLogs?: () => void;
  onLogout: () => void;
  isCompact?: boolean;
}

export const GlobalAccountMenu: React.FC<GlobalAccountMenuProps> = ({
  currentUser,
  currentRole,
  onOpenProfile,
  onOpenSettings,
  onOpenNotifications,
  onOpenHelp,
  onOpenSecurity,
  onOpenAuditLogs,
  onLogout,
  isCompact = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getRoleLabel = () => {
    switch (currentRole) {
      case 'farmer':
        return 'Farmer';
      case 'farmer_adviser':
        return 'Adviser';
      case 'admin':
        return 'Administrator';
      default:
        return 'User';
    }
  };

  const getRoleBadgeStyle = () => {
    switch (currentRole) {
      case 'farmer':
        return 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
      case 'farmer_adviser':
        return 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800';
      case 'admin':
        return 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const displayName = currentUser?.farmerName || currentUser?.fullName || (currentRole === 'admin' ? 'Admin' : currentRole === 'farmer_adviser' ? 'Senior Adviser' : 'Farmer');
  const avatarImage = currentUser?.profileImage || (
    currentRole === 'admin'
      ? 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80'
      : currentRole === 'farmer_adviser'
      ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'
      : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
  );

  return (
    <div className="relative" ref={menuRef}>
      {/* Account Menu Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2.5 p-1 sm:px-3 sm:py-1.5 rounded-2xl border transition-all cursor-pointer select-none ${
          currentRole === 'admin'
            ? 'bg-slate-800/90 hover:bg-slate-700 border-slate-700 text-slate-100'
            : 'bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
        } ${isOpen ? 'ring-2 ring-emerald-500/40 border-emerald-500' : ''}`}
        aria-haspopup="true"
        aria-expanded={isOpen}
        title="Account Menu"
      >
        <div className="relative">
          <img
            src={avatarImage}
            alt={displayName}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full object-cover border-2 border-emerald-500"
          />
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
        </div>

        {!isCompact && (
          <div className="hidden sm:flex flex-col items-start text-left leading-tight pr-1">
            <span className="text-xs font-bold truncate max-w-[130px]">
              {displayName}
            </span>
            <span className="text-[10px] text-slate-600 dark:text-slate-400 font-medium">
              {getRoleLabel()}
            </span>
          </div>
        )}

        <ChevronDown className={`w-3.5 h-3.5 text-slate-600 dark:text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Account Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 mt-2 w-64 sm:w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl z-50 overflow-hidden text-slate-900 dark:text-slate-100"
          >
            {/* Header: User details */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <img
                  src={avatarImage}
                  alt={displayName}
                  className="w-11 h-11 rounded-full object-cover border-2 border-emerald-500 shadow-sm"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {displayName}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-mono truncate">
                    {currentUser?.phoneNumber ? `+91 ${currentUser.phoneNumber}` : 'Verified Account'}
                  </p>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${getRoleBadgeStyle()}`}>
                    {getRoleLabel()}
                  </span>
                </div>
              </div>
            </div>

            {/* Role-Specific Menu Items */}
            <div className="p-2 space-y-1 text-xs font-semibold">
              {/* Farmer Menu Items */}
              {currentRole === 'farmer' && (
                <>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      onOpenProfile();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-200"
                  >
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <span className="font-bold block">👤 My Profile</span>
                      <span className="text-[10px] text-slate-600 dark:text-slate-400 font-normal">Farm details, crop & adviser</span>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setIsOpen(false);
                      onOpenSettings();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-200"
                  >
                    <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
                      <Settings className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <span className="font-bold block">⚙️ Settings</span>
                      <span className="text-[10px] text-slate-600 dark:text-slate-400 font-normal">Language, voice, alerts & display</span>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setIsOpen(false);
                      if (onOpenHelp) onOpenHelp();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-200"
                  >
                    <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center justify-center">
                      <HelpCircle className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <span className="font-bold block">❓ Help</span>
                      <span className="text-[10px] text-slate-600 dark:text-slate-400 font-normal">Farmer guide & support</span>
                    </div>
                  </button>
                </>
              )}

              {/* Adviser Menu Items */}
              {currentRole === 'farmer_adviser' && (
                <>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      onOpenProfile();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-200"
                  >
                    <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <span className="font-bold block">👤 My Adviser Profile</span>
                      <span className="text-[10px] text-slate-600 dark:text-slate-400 font-normal">Specialization, credentials & bio</span>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setIsOpen(false);
                      onOpenSettings();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-200"
                  >
                    <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
                      <Settings className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <span className="font-bold block">⚙️ Workspace Settings</span>
                      <span className="text-[10px] text-slate-600 dark:text-slate-400 font-normal">Calls, live video & density</span>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setIsOpen(false);
                      if (onOpenNotifications) {
                        onOpenNotifications();
                      } else {
                        onOpenSettings('notifications');
                      }
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-200"
                  >
                    <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <span className="font-bold block">🔔 Notifications</span>
                      <span className="text-[10px] text-slate-600 dark:text-slate-400 font-normal">Alert rules & live triage</span>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setIsOpen(false);
                      if (onOpenHelp) onOpenHelp();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-700 dark:text-slate-200"
                  >
                    <div className="w-8 h-8 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center justify-center">
                      <HelpCircle className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <span className="font-bold block">❓ Help & SOPs</span>
                      <span className="text-[10px] text-slate-600 dark:text-slate-400 font-normal">Agronomy manuals & support</span>
                    </div>
                  </button>
                </>
              )}

              {/* Admin Menu Items */}
              {currentRole === 'admin' && (
                <>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      onOpenProfile();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-slate-800 transition-colors text-slate-200"
                  >
                    <div className="w-8 h-8 rounded-xl bg-rose-950/60 text-rose-400 flex items-center justify-center">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <span className="font-bold block">👤 Administrator Profile</span>
                      <span className="text-[10px] text-slate-400 font-normal">Admin credentials & privileges</span>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setIsOpen(false);
                      onOpenSettings();
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-slate-800 transition-colors text-slate-200"
                  >
                    <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center">
                      <Settings className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <span className="font-bold block">⚙️ Platform Settings</span>
                      <span className="text-[10px] text-slate-400 font-normal">Integrations & operational controls</span>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setIsOpen(false);
                      if (onOpenSecurity) {
                        onOpenSecurity();
                      } else {
                        onOpenSettings('security');
                      }
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-slate-800 transition-colors text-slate-200"
                  >
                    <div className="w-8 h-8 rounded-xl bg-amber-950/60 text-amber-400 flex items-center justify-center">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <span className="font-bold block">🔐 Security</span>
                      <span className="text-[10px] text-slate-400 font-normal">Authentication & password policy</span>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setIsOpen(false);
                      if (onOpenAuditLogs) {
                        onOpenAuditLogs();
                      } else {
                        onOpenSettings('audit');
                      }
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-slate-800 transition-colors text-slate-200"
                  >
                    <div className="w-8 h-8 rounded-xl bg-emerald-950/60 text-emerald-400 flex items-center justify-center">
                      <ScrollText className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <span className="font-bold block">📋 Audit Logs</span>
                      <span className="text-[10px] text-slate-400 font-normal">System events & governance trail</span>
                    </div>
                  </button>
                </>
              )}
            </div>

            {/* Logout Action Bar */}
            <div className="p-2 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40">
              <button
                onClick={() => {
                  setIsOpen(false);
                  onLogout();
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-2xl bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 font-bold transition-all border border-rose-200 dark:border-rose-800/50 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
