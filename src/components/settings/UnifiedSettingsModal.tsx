import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Settings,
  Globe,
  Mic,
  Camera,
  Bell,
  Sun,
  Moon,
  Volume2,
  VolumeX,
  PhoneCall,
  Sliders,
  Shield,
  Radio,
  Sparkles,
  Server,
  Lock,
  Cpu,
  Check,
  CheckCircle2,
  X,
  Save,
  Loader2,
  LogOut,
  AlertTriangle,
  Type
} from 'lucide-react';
import { UserRole, FarmerSettings, AdviserSettings, AdminSettings } from '../../types';
import {
  fetchUserSettings,
  saveUserSettings,
  DEFAULT_FARMER_SETTINGS,
  DEFAULT_ADVISER_SETTINGS,
  DEFAULT_ADMIN_SETTINGS,
  logoutAllUserSessions
} from '../../services/profileSettingsService';

interface UnifiedSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRole: UserRole;
  phoneNumber?: string;
  initialSection?: string;
  onOpenChangePassword?: () => void;
  onLogoutAllSessions?: () => void;
  onLanguageChange?: (lang: string) => void;
}

export const UnifiedSettingsModal: React.FC<UnifiedSettingsModalProps> = ({
  isOpen,
  onClose,
  currentRole,
  phoneNumber = '9876543210',
  initialSection,
  onOpenChangePassword,
  onLogoutAllSessions,
  onLanguageChange,
}) => {
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<string>(initialSection || 'general');

  // Role Settings States
  const [farmerSettings, setFarmerSettings] = useState<FarmerSettings>(DEFAULT_FARMER_SETTINGS);
  const [adviserSettings, setAdviserSettings] = useState<AdviserSettings>(DEFAULT_ADVISER_SETTINGS);
  const [adminSettings, setAdminSettings] = useState<AdminSettings>(DEFAULT_ADMIN_SETTINGS);

  useEffect(() => {
    if (initialSection) {
      setActiveTab(initialSection);
    }
  }, [initialSection]);

  useEffect(() => {
    if (isOpen && phoneNumber) {
      fetchUserSettings(phoneNumber).then((saved) => {
        if (saved) {
          if (currentRole === 'farmer') setFarmerSettings({ ...DEFAULT_FARMER_SETTINGS, ...saved });
          if (currentRole === 'farmer_adviser') setAdviserSettings({ ...DEFAULT_ADVISER_SETTINGS, ...saved });
          if (currentRole === 'admin') setAdminSettings({ ...DEFAULT_ADMIN_SETTINGS, ...saved });
        }
      });
    }
  }, [isOpen, phoneNumber, currentRole]);

  if (!isOpen) return null;

  const handleSaveSettings = async () => {
    setLoading(true);
    setSaveSuccess(false);

    const payload = currentRole === 'admin'
      ? adminSettings
      : currentRole === 'farmer_adviser'
      ? adviserSettings
      : farmerSettings;

    try {
      await saveUserSettings(phoneNumber, payload);
      setSaveSuccess(true);
      if (currentRole === 'farmer' && onLanguageChange) {
        onLanguageChange(farmerSettings.language);
      }
      setTimeout(() => {
        setSaveSuccess(false);
        onClose();
      }, 1200);
    } catch (err) {
      console.error('Settings save error:', err);
    } finally {
      setLoading(false);
    }
  };

  const LANGUAGES_LIST = [
    { code: 'en', name: 'English', native: 'English', flag: '🇬🇧' },
    { code: 'hi', name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
    { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ', flag: '🇮🇳' },
    { code: 'bn', name: 'Bengali', native: 'বাংলা', flag: '🇮🇳' },
    { code: 'te', name: 'Telugu', native: 'తెలుగు', flag: '🇮🇳' },
    { code: 'ta', name: 'Tamil', native: 'தமிழ்', flag: '🇮🇳' },
    { code: 'mr', name: 'Marathi', native: 'मराठी', flag: '🇮🇳' },
    { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી', flag: '🇮🇳' },
    { code: 'es', name: 'Spanish', native: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'French', native: 'Français', flag: '🇫🇷' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl border my-8 ${
          currentRole === 'admin'
            ? 'bg-slate-900 border-slate-800 text-slate-100'
            : 'bg-white dark:bg-slate-900 border-emerald-200 dark:border-slate-800 text-slate-900 dark:text-slate-100'
        }`}
      >
        {/* Top Header */}
        <div className={`p-6 relative text-white ${
          currentRole === 'admin'
            ? 'bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900'
            : currentRole === 'farmer_adviser'
            ? 'bg-gradient-to-r from-[#1b2e1b] via-[#33691e] to-[#1b2e1b]'
            : 'bg-gradient-to-r from-[#1b2e1b] via-[#2e7d32] to-[#1b2e1b]'
        }`}>
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-white/80 hover:text-white bg-black/30 p-2 rounded-full border border-white/20 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3.5">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white shadow-lg ${
              currentRole === 'admin' ? 'bg-rose-600' : currentRole === 'farmer_adviser' ? 'bg-amber-600' : 'bg-emerald-600'
            }`}>
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-bold font-serif text-white flex items-center gap-2">
                {currentRole === 'farmer' && '⚙️ Farmer Settings'}
                {currentRole === 'farmer_adviser' && '⚙️ Adviser Workspace Settings'}
                {currentRole === 'admin' && '🛡️ Platform & Governance Settings'}
              </h3>
              <p className="text-xs text-emerald-200/90 dark:text-slate-300">
                {currentRole === 'farmer' && 'Choose your preferred language, voice responses, camera, and alert notifications.'}
                {currentRole === 'farmer_adviser' && 'Configure incoming call sounds, video quality, notification triage, and workspace display.'}
                {currentRole === 'admin' && 'Enterprise API configurations, security thresholds, service status, and governance policies.'}
              </p>
            </div>
          </div>
        </div>

        {/* Success Alert */}
        {saveSuccess && (
          <div className="mx-6 mt-4 p-3.5 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-400 text-emerald-800 dark:text-emerald-300 rounded-2xl flex items-center gap-2 font-bold text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Your settings have been saved successfully.</span>
          </div>
        )}

        {/* ============================================================ */}
        {/* 1. FARMER SETTINGS (SIMPLE, LARGE CARDS, ZERO JARGON) */}
        {/* ============================================================ */}
        {currentRole === 'farmer' && (
          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
            {/* Section: Language */}
            <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center gap-2.5">
                <Globe className="w-5 h-5 text-emerald-600" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Language / भाषा</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Choose the language you want CroperX to speak and write in.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
                {LANGUAGES_LIST.map((lang) => {
                  const isSelected = farmerSettings.language === lang.code;
                  return (
                    <button
                      key={lang.code}
                      type="button"
                      onClick={() => setFarmerSettings({ ...farmerSettings, language: lang.code, voiceLanguage: lang.code })}
                      className={`p-3 rounded-2xl text-left border transition-all flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:border-emerald-400'
                      }`}
                    >
                      <div>
                        <span className="text-base mr-2">{lang.flag}</span>
                        <span className="text-xs font-bold">{lang.native}</span>
                        <span className="block text-[10px] opacity-80">{lang.name}</span>
                      </div>
                      {isSelected && <Check className="w-4 h-4" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section: Voice Assistant */}
            <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center gap-2.5">
                <Mic className="w-5 h-5 text-emerald-600" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Voice Assistant</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Hear voice explanations for your farm queries.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <label className="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer">
                  <span className="text-xs font-bold">Spoken Voice Advice</span>
                  <input
                    type="checkbox"
                    checked={farmerSettings.voiceGuidance}
                    onChange={(e) => setFarmerSettings({ ...farmerSettings, voiceGuidance: e.target.checked })}
                    className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer">
                  <span className="text-xs font-bold">Read Crop Results Out Loud</span>
                  <input
                    type="checkbox"
                    checked={farmerSettings.voiceResponses}
                    onChange={(e) => setFarmerSettings({ ...farmerSettings, voiceResponses: e.target.checked })}
                    className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
                  />
                </label>
              </div>
            </div>

            {/* Section: Camera & Microphone */}
            <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center gap-2.5">
                <Camera className="w-5 h-5 text-emerald-600" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Camera & Scanner</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Settings for scanning crops and video calls with your adviser.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Default Camera</label>
                  <select
                    value={farmerSettings.preferredCamera}
                    onChange={(e) => setFarmerSettings({ ...farmerSettings, preferredCamera: e.target.value as any })}
                    className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold outline-none"
                  >
                    <option value="environment">Back Camera (Field / Crop Scan)</option>
                    <option value="user">Front Camera (Selfie / Direct Call)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Camera Permissions</label>
                  <div className="p-3 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-xs font-bold flex items-center justify-between">
                    <span>Camera & Mic Enabled</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Section: Alerts */}
            <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center gap-2.5">
                <Bell className="w-5 h-5 text-emerald-600" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Farm Alerts</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Choose what urgent notifications you want to receive.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer">
                  <span className="text-xs font-bold">⛈️ Weather & Rain Alerts</span>
                  <input
                    type="checkbox"
                    checked={farmerSettings.alertsWeather}
                    onChange={(e) => setFarmerSettings({ ...farmerSettings, alertsWeather: e.target.checked })}
                    className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer">
                  <span className="text-xs font-bold">🐛 Pest & Crop Alerts</span>
                  <input
                    type="checkbox"
                    checked={farmerSettings.alertsCrop}
                    onChange={(e) => setFarmerSettings({ ...farmerSettings, alertsCrop: e.target.checked })}
                    className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer">
                  <span className="text-xs font-bold">💧 Water & Irrigation Reminders</span>
                  <input
                    type="checkbox"
                    checked={farmerSettings.alertsWater}
                    onChange={(e) => setFarmerSettings({ ...farmerSettings, alertsWater: e.target.checked })}
                    className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer">
                  <span className="text-xs font-bold">🧑‍🌾 Adviser Messages</span>
                  <input
                    type="checkbox"
                    checked={farmerSettings.alertsAdviser}
                    onChange={(e) => setFarmerSettings({ ...farmerSettings, alertsAdviser: e.target.checked })}
                    className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
                  />
                </label>
              </div>
            </div>

            {/* Section: Display */}
            <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center gap-2.5">
                <Sun className="w-5 h-5 text-emerald-600" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Display & Readability</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Customize how your screen looks.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
                  <span className="text-xs font-bold block">Theme Mode</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setFarmerSettings({ ...farmerSettings, displayTheme: 'light' })}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 ${
                        farmerSettings.displayTheme === 'light' ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-700'
                      }`}
                    >
                      <Sun className="w-3.5 h-3.5" /> Light
                    </button>
                    <button
                      type="button"
                      onClick={() => setFarmerSettings({ ...farmerSettings, displayTheme: 'dark' })}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 ${
                        farmerSettings.displayTheme === 'dark' ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-700'
                      }`}
                    >
                      <Moon className="w-3.5 h-3.5" /> Dark
                    </button>
                  </div>
                </div>

                <label className="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer">
                  <div>
                    <span className="text-xs font-bold block">Large Text Size</span>
                    <span className="text-[10px] text-slate-500">Makes buttons and text easier to read outdoors</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={farmerSettings.largeText}
                    onChange={(e) => setFarmerSettings({ ...farmerSettings, largeText: e.target.checked })}
                    className="w-5 h-5 accent-emerald-600 rounded cursor-pointer"
                  />
                </label>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* 2. ADVISER WORKSPACE SETTINGS */}
        {/* ============================================================ */}
        {currentRole === 'farmer_adviser' && (
          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto text-xs">
            {/* Live Calls & Video */}
            <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center gap-2.5">
                <PhoneCall className="w-5 h-5 text-amber-600" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Live Farmer Calls & Audio</h4>
                  <p className="text-slate-500 dark:text-slate-400">Configure WebRTC call triage, sound ringers, and camera resolution.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer font-bold">
                  <span>Incoming Call Sound Notification</span>
                  <input
                    type="checkbox"
                    checked={adviserSettings.callSound}
                    onChange={(e) => setAdviserSettings({ ...adviserSettings, callSound: e.target.checked })}
                    className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer font-bold">
                  <span>Auto-Accept Calls (when available)</span>
                  <input
                    type="checkbox"
                    checked={adviserSettings.autoAccept}
                    onChange={(e) => setAdviserSettings({ ...adviserSettings, autoAccept: e.target.checked })}
                    className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
                  />
                </label>

                <div className="space-y-1">
                  <label className="font-bold">Camera Quality</label>
                  <select
                    value={adviserSettings.cameraPreference}
                    onChange={(e) => setAdviserSettings({ ...adviserSettings, cameraPreference: e.target.value as any })}
                    className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold outline-none"
                  >
                    <option value="hd">High Definition (1080p WebRTC)</option>
                    <option value="standard">Standard (720p)</option>
                    <option value="bandwidth_saver">Bandwidth Saver (480p low latency)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold">Microphone Processing</label>
                  <select
                    value={adviserSettings.micPreference}
                    onChange={(e) => setAdviserSettings({ ...adviserSettings, micPreference: e.target.value as any })}
                    className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold outline-none"
                  >
                    <option value="noise_cancelling">AI Noise Suppression & Field Wind Filter</option>
                    <option value="default">Standard Studio Audio</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center gap-2.5">
                <Bell className="w-5 h-5 text-amber-600" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Notification Triage</h4>
                  <p className="text-slate-500 dark:text-slate-400">Select notifications to appear in your agronomist dispatch feed.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer font-bold">
                  <span>New Incoming Farmer Call</span>
                  <input
                    type="checkbox"
                    checked={adviserSettings.notifNewCall}
                    onChange={(e) => setAdviserSettings({ ...adviserSettings, notifNewCall: e.target.checked })}
                    className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer font-bold">
                  <span>Urgent Crop Disease Alert</span>
                  <input
                    type="checkbox"
                    checked={adviserSettings.notifUrgentCrop}
                    onChange={(e) => setAdviserSettings({ ...adviserSettings, notifUrgentCrop: e.target.checked })}
                    className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer font-bold">
                  <span>New Assigned Support Case</span>
                  <input
                    type="checkbox"
                    checked={adviserSettings.notifNewCase}
                    onChange={(e) => setAdviserSettings({ ...adviserSettings, notifNewCase: e.target.checked })}
                    className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 cursor-pointer font-bold">
                  <span>IoT Sensor Threshold Alarm</span>
                  <input
                    type="checkbox"
                    checked={adviserSettings.notifIotAlert}
                    onChange={(e) => setAdviserSettings({ ...adviserSettings, notifIotAlert: e.target.checked })}
                    className="w-4 h-4 accent-amber-600 rounded cursor-pointer"
                  />
                </label>
              </div>
            </div>

            {/* Workspace & Security */}
            <div className="p-5 rounded-3xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="flex items-center gap-2.5">
                <Sliders className="w-5 h-5 text-amber-600" />
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Workspace View & Security</h4>
                  <p className="text-slate-500 dark:text-slate-400">Default agronomist starting view and session security.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold">Default Landing Workspace</label>
                  <select
                    value={adviserSettings.defaultDashboard}
                    onChange={(e) => setAdviserSettings({ ...adviserSettings, defaultDashboard: e.target.value as any })}
                    className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold outline-none"
                  >
                    <option value="overview">Executive Agronomist Overview</option>
                    <option value="queue">Live Incoming Call Queue</option>
                    <option value="twin">Digital Twin & Soil Simulation</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold">Notification Density</label>
                  <select
                    value={adviserSettings.notificationDensity}
                    onChange={(e) => setAdviserSettings({ ...adviserSettings, notificationDensity: e.target.value as any })}
                    className="w-full p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold outline-none"
                  >
                    <option value="all">Show All Farm Alerts</option>
                    <option value="high_priority">High & Critical Priority Only</option>
                    <option value="critical_only">Critical Alarms Only</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-3">
                {onOpenChangePassword && (
                  <button
                    type="button"
                    onClick={onOpenChangePassword}
                    className="px-4 py-2 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold flex items-center gap-1.5"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Change Password</span>
                  </button>
                )}
                {onLogoutAllSessions && (
                  <button
                    type="button"
                    onClick={onLogoutAllSessions}
                    className="px-4 py-2 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 font-bold flex items-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Logout All Sessions</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* 3. ADMINISTRATOR PLATFORM SETTINGS */}
        {/* ============================================================ */}
        {currentRole === 'admin' && (
          <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto text-xs">
            {/* Platform & Governance */}
            <div className="p-5 rounded-3xl bg-slate-800/80 border border-slate-700 space-y-4">
              <div className="flex items-center gap-2.5">
                <Server className="w-5 h-5 text-rose-400" />
                <div>
                  <h4 className="text-sm font-bold text-white">Platform Configuration</h4>
                  <p className="text-slate-400">Core enterprise agricultural platform parameters.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Platform Name</label>
                  <input
                    type="text"
                    value={adminSettings.platformName}
                    onChange={(e) => setAdminSettings({ ...adminSettings, platformName: e.target.value })}
                    className="w-full p-3 rounded-2xl border border-slate-700 bg-slate-900 font-bold text-white outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Session Duration (Hours)</label>
                  <input
                    type="number"
                    min="1"
                    max="168"
                    value={adminSettings.sessionDurationHours}
                    onChange={(e) => setAdminSettings({ ...adminSettings, sessionDurationHours: parseInt(e.target.value) || 24 })}
                    className="w-full p-3 rounded-2xl border border-slate-700 bg-slate-900 font-bold text-white outline-none"
                  />
                </div>

                <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900 border border-slate-700 cursor-pointer font-bold sm:col-span-2">
                  <div>
                    <span className="text-white block">Platform Maintenance Mode</span>
                    <span className="text-[10px] text-slate-400 font-normal">Restricts non-admin access while system migrations run</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={adminSettings.maintenanceMode}
                    onChange={(e) => setAdminSettings({ ...adminSettings, maintenanceMode: e.target.checked })}
                    className="w-4 h-4 accent-rose-600 rounded cursor-pointer"
                  />
                </label>
              </div>
            </div>

            {/* Service & Integration Status */}
            <div className="p-5 rounded-3xl bg-slate-800/80 border border-slate-700 space-y-4">
              <div className="flex items-center gap-2.5">
                <Cpu className="w-5 h-5 text-rose-400" />
                <div>
                  <h4 className="text-sm font-bold text-white">Live Integrations Health</h4>
                  <p className="text-slate-400">Verified backend microservice communication status.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {[
                  { label: 'Weather Radar API', status: adminSettings.weatherApiStatus },
                  { label: 'Satellite NDVI Feed', status: adminSettings.satelliteServiceStatus },
                  { label: 'Gemini 3.7 AI Model', status: adminSettings.aiServiceStatus },
                  { label: 'IoT Gateway MQTT Broker', status: adminSettings.iotServiceStatus },
                  { label: 'WebRTC Video Tunnels', status: adminSettings.webrtcServiceStatus },
                ].map((s, idx) => (
                  <div key={idx} className="p-3 rounded-2xl bg-slate-900 border border-slate-700 flex items-center justify-between">
                    <span className="font-bold text-slate-300">{s.label}</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 text-[10px] font-mono font-bold border border-emerald-800">
                      OPERATIONAL
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Audit & Security Policies */}
            <div className="p-5 rounded-3xl bg-slate-800/80 border border-slate-700 space-y-4">
              <div className="flex items-center gap-2.5">
                <Shield className="w-5 h-5 text-rose-400" />
                <div>
                  <h4 className="text-sm font-bold text-white">Security & Audit Policies</h4>
                  <p className="text-slate-400">Log retention and tamper-evident event recording.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-300">Audit Log Retention (Days)</label>
                  <input
                    type="number"
                    min="30"
                    max="365"
                    value={adminSettings.auditRetentionDays}
                    onChange={(e) => setAdminSettings({ ...adminSettings, auditRetentionDays: parseInt(e.target.value) || 90 })}
                    className="w-full p-3 rounded-2xl border border-slate-700 bg-slate-900 font-bold text-white outline-none"
                  />
                </div>

                <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900 border border-slate-700 cursor-pointer font-bold">
                  <div>
                    <span className="text-white block">Security Event Logging</span>
                    <span className="text-[10px] text-slate-400 font-normal">Records failed logins & privilege elevations</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={adminSettings.securityEventLogging}
                    onChange={(e) => setAdminSettings({ ...adminSettings, securityEventLogging: e.target.checked })}
                    className="w-4 h-4 accent-rose-600 rounded cursor-pointer"
                  />
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={handleSaveSettings}
            className={`px-6 py-2.5 rounded-xl font-bold text-xs text-white shadow-md transition-all flex items-center gap-2 cursor-pointer ${
              currentRole === 'admin' ? 'bg-rose-600 hover:bg-rose-700' : currentRole === 'farmer_adviser' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            <span>Save Settings</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
