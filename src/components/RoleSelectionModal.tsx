import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserRole } from '../types';
import { Check, Sparkles, Shield, ArrowRight, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface RoleSelectionModalProps {
  isOpen: boolean;
  onClose?: () => void;
  currentRole?: UserRole;
  onSelectRole: (role: UserRole) => void;
  canDismiss?: boolean;
}

export const RoleSelectionModal: React.FC<RoleSelectionModalProps> = ({
  isOpen,
  onClose,
  currentRole,
  onSelectRole,
  canDismiss = false,
}) => {
  const { language } = useLanguage();

  if (!isOpen) return null;

  const rolesList: Array<{
    role: UserRole;
    icon: string;
    title: string;
    titleLocal: string;
    subtitle: string;
    description: string;
    badge: string;
    color: string;
    accentBg: string;
    borderColor: string;
    features: string[];
  }> = [
    {
      role: 'farmer',
      icon: '👨‍🌾',
      title: 'Farmer',
      titleLocal: language === 'hi' ? 'किसान' : 'Farmer',
      subtitle: 'Simple, visual & voice-first farm companion',
      description: 'Check your crop, talk to CroperX and contact your adviser.',
      badge: 'Farmer First',
      color: 'from-emerald-500 to-green-600',
      accentBg: 'bg-emerald-50 dark:bg-emerald-950/30',
      borderColor: 'border-emerald-500/40 hover:border-emerald-500',
      features: [
        '📷 Show My Crop (Instant Visual Diagnosis)',
        '🎙️ Talk to CroperX (Voice-First AI)',
        '👨‍🌾 Live Video Call with Farm Adviser',
        '🌦️ Simple Weather & Daily Tasks',
      ],
    },
    {
      role: 'farmer_adviser',
      icon: '🧑‍🌾',
      title: 'Farm Adviser',
      titleLocal: language === 'hi' ? 'कृषि सलाहकार' : 'Farm Adviser',
      subtitle: 'Expert agronomist & farmer monitoring workstation',
      description: 'Monitor farmers, fields and provide agricultural guidance.',
      badge: 'Expert Suite',
      color: 'from-blue-600 to-indigo-700',
      accentBg: 'bg-blue-50 dark:bg-blue-950/30',
      borderColor: 'border-blue-500/40 hover:border-blue-500',
      features: [
        '📹 Live Farmer Help Queue & 2-Way Video',
        '📍 Live Field AR Annotations & Telemetry',
        '🛰️ UAV Scouting, NPK & NDVI Multispectral',
        '🌱 Carbon Accounting & Market Arbitrage',
      ],
    },
    {
      role: 'admin',
      icon: '🛠️',
      title: 'Admin',
      titleLocal: language === 'hi' ? 'प्रशासक' : 'Admin',
      subtitle: 'Platform management, model telemetry & system control',
      description: 'Manage the CroperX platform and users.',
      badge: 'Platform Control',
      color: 'from-amber-600 to-orange-700',
      accentBg: 'bg-amber-50 dark:bg-amber-950/30',
      borderColor: 'border-amber-500/40 hover:border-amber-500',
      features: [
        '⚙️ System Diagnostics & Sensor Calibration',
        '👥 User & Farm Account Directory',
        '📡 Autonomous Edge & IoT Gateway Sync',
        '📊 Platform Telemetry & Export Tools',
      ],
    },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={canDismiss ? onClose : undefined}
          className="fixed inset-0 bg-black/60 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10 my-8"
        >
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-indigo-800 px-6 py-6 sm:px-8 sm:py-8 text-white relative">
            {canDismiss && onClose && (
              <button
                onClick={onClose}
                className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-xs font-semibold tracking-wide uppercase mb-3">
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
              CroperX 2.0 Identity
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Who are you?</h2>
            <p className="mt-1.5 text-sm sm:text-base text-emerald-100/90 max-w-xl">
              Choose how you want to use CroperX. You can switch your role at any time.
            </p>
          </div>

          {/* Role Cards Grid */}
          <div className="p-6 sm:p-8 space-y-4 sm:space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
              {rolesList.map((item) => {
                const isSelected = currentRole === item.role;

                return (
                  <motion.button
                    key={item.role}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      onSelectRole(item.role);
                      if (onClose) onClose();
                    }}
                    className={`relative text-left flex flex-col justify-between p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 shadow-lg shadow-emerald-500/10'
                        : `${item.borderColor} bg-slate-50/70 dark:bg-slate-800/40 hover:shadow-md`
                    }`}
                  >
                    <div>
                      {/* Top Bar: Icon + Badge */}
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <div className="text-3xl sm:text-4xl p-2 rounded-xl bg-white dark:bg-slate-800 shadow-sm border border-slate-200/60 dark:border-slate-700">
                          {item.icon}
                        </div>
                        <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-200/70 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                          {item.badge}
                        </span>
                      </div>

                      {/* Title & Description */}
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                        {item.title}
                        {isSelected && <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 inline" />}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium leading-relaxed">
                        {item.description}
                      </p>

                      {/* Key Features Bullet List */}
                      <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 space-y-1.5">
                        {item.features.map((feat, fIdx) => (
                          <div
                            key={fIdx}
                            className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug flex items-start gap-1"
                          >
                            <span>•</span>
                            <span>{feat}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Action CTA */}
                    <div className="mt-5 pt-3 flex items-center justify-between text-xs font-semibold">
                      <span className={isSelected ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'}>
                        {isSelected ? 'Currently Selected' : 'Continue as ' + item.title}
                      </span>
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center ${
                          isSelected
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>

            {/* Helper Footer Note */}
            <div className="pt-2 text-center text-xs text-slate-500 dark:text-slate-400">
              💡 <span className="font-semibold">Tip for testers:</span> You can switch back and forth between Farmer and
              Adviser modes at any time using the role badge in the top navigation bar.
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
