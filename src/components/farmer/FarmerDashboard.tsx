import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, Mic, PhoneCall, CloudRain, Sprout, CheckCircle2, AlertTriangle, AlertCircle, HelpCircle, Globe, User, ChevronRight, Sparkles, Sun, Droplets, ArrowRight, ShieldCheck, X, Users, MapPin, MessageCircle, Siren } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { FarmerProfile, UserRole, UserAccount, FarmZone, SoilData, FarmerSimpleCropResult, FarmerLocationState, NearbyAdviser } from '../../types';
import { FarmerCameraView } from './FarmerCameraView';
import { FarmerVoiceAssistant } from './FarmerVoiceAssistant';
import { FarmerAdviserLiveCall } from './FarmerAdviserLiveCall';
import { NearbyAdvisersSection } from './NearbyAdvisersSection';
import { FarmerPresenceBar } from './FarmerPresenceBar';
import { FarmerAvailabilitySwitch } from './FarmerAvailabilitySwitch';
import { FarmerEmergencyButton } from './FarmerEmergencyButton';
import { Farmer3DHeroCard } from './Farmer3DHeroCard';
import { Farmer3DActionGrid } from './Farmer3DActionGrid';
import { InstagramAgriChat } from '../chat/InstagramAgriChat';
import { GlobalAccountMenu } from '../account/GlobalAccountMenu';

interface FarmerDashboardProps {
  farmerProfile: FarmerProfile;
  currentUser: UserAccount | null;
  soilData: SoilData;
  farmZones: FarmZone[];
  onOpenProfile: () => void;
  onOpenSettings?: (section?: string) => void;
  onOpenWeather?: () => void;
  onOpenRoleSelector?: () => void;
  onLogout?: () => void;
}

export const FarmerDashboard: React.FC<FarmerDashboardProps> = ({
  farmerProfile,
  currentUser,
  soilData,
  farmZones,
  onOpenProfile,
  onOpenSettings,
  onOpenWeather,
  onOpenRoleSelector,
  onLogout,
}) => {
  const { language, setLanguage, activeLangObj, supportedLanguages } = useLanguage();

  // Active Modals / Fullscreen Views
  const [showCamera, setShowCamera] = useState(false);
  const [showVoice, setShowVoice] = useState(false);
  const [showAdviserCall, setShowAdviserCall] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showWeatherModal, setShowWeatherModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showLangPicker, setShowLangPicker] = useState(false);

  // Mobile Bottom Navigation active item
  const [mobileNav, setMobileNav] = useState<'home' | 'crop' | 'talk' | 'profile'>('home');

  // Completed daily tasks checklist
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({
    task1: false,
    task2: true,
    task3: false,
  });

  // Farmer Location State for GPS Discovery
  const farmerName = currentUser?.farmerName || farmerProfile.farmerName || 'Ravi';
  const farmLocation = currentUser?.farmLocation || farmerProfile.farmLocation || 'Ludhiana, Punjab';
  const primaryCrop = farmerProfile.preferredCropCycle?.split('→')?.[0]?.trim() || 'Wheat';
  const profilePhoto = currentUser?.profileImage || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80';

  const [activeDashboardTab, setActiveDashboardTab] = useState<'overview' | 'chat' | 'nearby_advisers'>('overview');
  const [showChatModal, setShowChatModal] = useState(false);
  const [farmerLocationState, setFarmerLocationState] = useState<FarmerLocationState>({
    permission: 'unknown',
    latitude: 30.9010,
    longitude: 75.8573,
    accuracyMeters: 15,
    accuracyLevel: 'high',
    locality: 'PAU Agricultural Zone',
    district: farmLocation.includes('Ludhiana') ? 'Ludhiana' : farmLocation.split(',')?.[0]?.trim() || 'Ludhiana',
    state: 'Punjab',
    country: 'India',
    fullAddress: farmLocation || 'PAU Agricultural Zone, Ludhiana, Punjab, India',
    lastUpdated: new Date().toISOString(),
    isManual: false,
  });

  // Overall Farm Status logic (Human, non-technical)
  const isDry = (soilData.soil_moisture || 28) < 25;
  const isHot = (soilData.temperature || 28) > 34;

  const farmStatus: 'good' | 'attention' | 'urgent' = isHot ? 'urgent' : isDry ? 'attention' : 'good';

  const statusConfig = {
    good: {
      icon: '🟢',
      title: language === 'hi' ? 'आपका खेत स्वस्थ और सुरक्षित है' : 'Your farm is looking good.',
      subtitle: language === 'hi' ? 'सभी फसलें सामान्य और अच्छी स्थिति में हैं।' : 'Soil moisture and weather conditions are optimal.',
      badgeColor: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
      bgCard: 'from-emerald-500/15 via-emerald-500/5 to-transparent border-emerald-500/30',
    },
    attention: {
      icon: '🟡',
      title: language === 'hi' ? 'आपके खेत पर थोड़ा ध्यान देने की जरूरत है' : 'Your farm needs some attention.',
      subtitle: language === 'hi' ? 'मिट्टी में नमी कम हो रही है, शाम को सिंचाई की जांच करें।' : 'Soil moisture is getting low. Check watering today.',
      badgeColor: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30',
      bgCard: 'from-amber-500/15 via-amber-500/5 to-transparent border-amber-500/30',
    },
    urgent: {
      icon: '🔴',
      title: language === 'hi' ? 'आज खेत पर तुरंत ध्यान दें' : 'Your farm needs attention today.',
      subtitle: language === 'hi' ? 'उच्च तापमान के कारण फसल को पानी की आवश्यकता है।' : 'High heat detected. Water your crops before peak heat.',
      badgeColor: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/30',
      bgCard: 'from-rose-500/15 via-rose-500/5 to-transparent border-rose-500/30',
    },
  }[farmStatus];

  // Daily Tasks List
  const dailyTasks = [
    {
      id: 'task1',
      title: language === 'hi' ? '💧 शाम 5:00 बजे ड्रिप सिंचाई चलाएं' : '💧 Run drip irrigation at 5:00 PM',
      desc: language === 'hi' ? 'उत्तर खेत में 45 मिनट के लिए' : '45 minutes for North Field',
    },
    {
      id: 'task2',
      title: language === 'hi' ? '🌱 पत्तियों के नीचे कीटों की जांच करें' : '🌱 Inspect lower leaf canopy',
      desc: language === 'hi' ? 'हरी पत्तियों पर पीले धब्बे देखें' : 'Check for yellow spots or curling',
    },
    {
      id: 'task3',
      title: language === 'hi' ? '🌦️ शाम की बारिश से पहले जल निकासी साफ रखें' : '🌦️ Clear drainage furrows before evening',
      desc: language === 'hi' ? 'अतिरिक्त पानी आसानी से निकल सके' : 'Ensure rain runoff flows safely',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white pb-24 lg:pb-12">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-3.5">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          {/* Farmer Profile Avatar + Greeting */}
          <div className="flex items-center gap-3">
            <button
              onClick={onOpenProfile}
              className="relative group focus:outline-none"
              title="Farmer Profile"
            >
              <img
                src={profilePhoto}
                alt={farmerName}
                className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500 shadow-sm"
              />
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
            </button>

            <div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
                {language === 'hi' ? `नमस्ते ${farmerName} 👋` : `Hi ${farmerName} 👋`}
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                📍 {farmLocation}
              </p>
            </div>
          </div>

          {/* Right Controls: Language, Help, Account Menu */}
          <div className="flex items-center gap-2">
            {/* Language Selector Dropdown Button */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => setShowLangPicker(!showLangPicker)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition-all"
              >
                <span>{activeLangObj.flag}</span>
                <span>{activeLangObj.name}</span>
              </button>

              {showLangPicker && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-2 z-50 space-y-1">
                  {supportedLanguages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setLanguage(l.code);
                        setShowLangPicker(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium flex items-center justify-between ${
                        language === l.code
                          ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-300 font-bold'
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <span>{l.flag} {l.nativeName}</span>
                      {language === l.code && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Need Help Button */}
            <button
              onClick={() => setShowHelpModal(true)}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 transition-all"
              title="Need Help?"
            >
              <HelpCircle className="w-5 h-5" />
            </button>

            {/* Global Account Menu for Farmer */}
            <GlobalAccountMenu
              currentUser={currentUser}
              currentRole="farmer"
              onOpenProfile={onOpenProfile}
              onOpenSettings={(sec) => onOpenSettings && onOpenSettings(sec)}
              onOpenHelp={() => setShowHelpModal(true)}
              onLogout={onLogout || (() => {})}
            />
          </div>
        </div>
      </header>

      {/* Main Farmer Content Area */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 pt-4 sm:pt-5 space-y-5 sm:space-y-6">

        {/* Phase 39: Farmer Live Presence, GPS Telemetry & SOS Bar */}
        {currentUser && (
          <FarmerPresenceBar
            currentUser={currentUser}
            cropName={primaryCrop}
            farmZone={farmerLocationState.locality || 'Field Zone A'}
            soilMoisture={`${soilData.soil_moisture || 28}% (Optimal)`}
            weatherCondition={`${soilData.temperature || 31}°C, Clear`}
          />
        )}

        {/* Top Mode Selector Tabs */}
        <div className="flex items-center p-1 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <button
            id="tab-farm-overview"
            onClick={() => setActiveDashboardTab('overview')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 sm:gap-2 ${
              activeDashboardTab === 'overview'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>🌾</span>
            <span>{language === 'hi' ? '3D खेत केंद्र' : '3D Farm Center'}</span>
          </button>

          <button
            id="tab-farm-chat"
            onClick={() => setActiveDashboardTab('chat')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 sm:gap-2 ${
              activeDashboardTab === 'chat'
                ? 'bg-gradient-to-r from-pink-600 via-rose-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <MessageCircle className="w-4 h-4 text-pink-400 inline" />
            <span>{language === 'hi' ? 'सलाहकार चैट' : 'Agri-Chat'}</span>
            <span className="hidden sm:inline-block text-[10px] px-1.5 py-0.5 rounded-full bg-pink-500/20 text-pink-300">
              Live
            </span>
          </button>

          <button
            id="tab-nearby-advisers"
            onClick={() => setActiveDashboardTab('nearby_advisers')}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-1.5 sm:gap-2 ${
              activeDashboardTab === 'nearby_advisers'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>📍</span>
            <span>{language === 'hi' ? 'निकटतम सलाहकार' : 'Nearby Advisers'}</span>
            <span className="hidden sm:inline-block text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
              GPS
            </span>
          </button>
        </div>

        {activeDashboardTab === 'chat' ? (
          /* Instagram Agri-Chat Direct Messaging Tab */
          <InstagramAgriChat
            currentUserId={currentUser?.id || 'usr_demo_croperx'}
            currentUserName={farmerName}
            currentUserRole="farmer"
            currentUserAvatar={profilePhoto}
            onInitiateVideoCall={() => setShowAdviserCall(true)}
          />
        ) : activeDashboardTab === 'nearby_advisers' ? (
          /* Phase 34: Dedicated Nearby Advisers & Consultation Discovery View */
          <NearbyAdvisersSection
            farmerLocation={farmerLocationState}
            farmerName={farmerName}
            farmerPhone={currentUser?.phoneNumber || '+919876543210'}
            onUpdateLocation={(updated) =>
              setFarmerLocationState((prev) => ({ ...prev, ...updated }))
            }
            onStartVideoCall={(adviser) => {
              setShowAdviserCall(true);
            }}
            onStartChat={(adviser) => {
              setActiveDashboardTab('chat');
            }}
          />
        ) : (
          <>
            {/* Top Real-Time Availability Switch & 🚨 Emergency SOS Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-stretch">
              <div className="sm:col-span-8">
                <FarmerAvailabilitySwitch
                  userId={currentUser?.id || 'usr_demo_croperx'}
                  phoneNumber={currentUser?.phoneNumber || '+919876543210'}
                  farmerName={farmerName}
                  farmName={farmerProfile.farmName || 'Green Valley Farm'}
                  farmZone={farmZones[0]?.name || 'North Field A'}
                  crop={primaryCrop}
                  district={farmerLocationState.district || 'Ludhiana'}
                  stateName={farmerLocationState.state || 'Punjab'}
                  className="h-full"
                />
              </div>

              <div className="sm:col-span-4 flex">
                <FarmerEmergencyButton
                  userId={currentUser?.id || 'usr_demo_croperx'}
                  phoneNumber={currentUser?.phoneNumber || '+919876543210'}
                  farmerName={farmerName}
                  farmName={farmerProfile.farmName || 'Green Valley Farm'}
                  farmZone={farmZones[0]?.name || 'North Field A'}
                  crop={primaryCrop}
                  soilMoisture={`${soilData.soil_moisture || 28}%`}
                  weather={`${Math.round(soilData.temperature || 31)}°C, Clear`}
                  className="w-full h-full"
                />
              </div>
            </div>

            {/* Phase 39: 3D Interactive Hero Card with Holographic Field Orb & Realistic Gyro Perspective */}
            <Farmer3DHeroCard
              farmerName={farmerName}
              farmName={farmerProfile.farmName || 'Green Valley Farm'}
              farmZone={farmZones[0]?.name || 'North Field A'}
              crop={primaryCrop}
              soilMoisture={`${soilData.soil_moisture || 28}%`}
              temperature={`${Math.round(soilData.temperature || 31)}°C`}
              ndviScore={0.86}
              isOnline={true}
              onLaunchScanner={() => setShowCamera(true)}
              onLaunchAdviserCall={() => setShowAdviserCall(true)}
            />

            {/* 3D Realistic Quick Action Grid */}
            <Farmer3DActionGrid
              onScanCrop={() => setShowCamera(true)}
              onOpenVoiceAI={() => setShowVoice(true)}
              onOpenAdviserCall={() => setShowAdviserCall(true)}
              onOpenChat={() => setActiveDashboardTab('chat')}
              onTriggerEmergency={() => {
                const btn = document.querySelector('[aria-label="Trigger Agricultural Emergency Alert"]') as HTMLElement;
                btn?.click();
              }}
              onOpenIrrigation={() => setShowWeatherModal(true)}
            />

            {/* Hero Banner & Simple Farm Status Card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`relative p-5 sm:p-6 rounded-3xl border-2 bg-gradient-to-br ${statusConfig.bgCard} shadow-sm overflow-hidden`}
            >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border mb-1 bg-white/70 dark:bg-slate-900/70 shadow-sm">
                <span>{statusConfig.icon}</span>
                <span>{statusConfig.title}</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                🌾 {language === 'hi' ? 'आज आपका खेत' : 'Your Farm Today'}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 font-medium max-w-lg">
                {statusConfig.subtitle}
              </p>
            </div>

            {/* Quick Status Pill */}
            <div className="flex items-center gap-3 bg-white/80 dark:bg-slate-900/80 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 backdrop-blur-sm self-start sm:self-center">
              <div className="text-2xl">🌱</div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  {language === 'hi' ? 'मुख्य फसल' : 'Primary Crop'}
                </span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {primaryCrop}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 5 Essential Primary Farmer Actions (Large Touch Targets >= 48px) */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">
            {language === 'hi' ? 'मुख्य कार्य और साधन' : 'Quick Actions'}
          </h3>

          {/* Large Hero Action 1: SHOW MY CROP (Camera) */}
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowCamera(true)}
            className="w-full text-left p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white shadow-xl shadow-emerald-600/25 border-2 border-emerald-400/40 flex items-center justify-between group cursor-pointer transition-all min-h-[96px]"
          >
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl shadow-inner border border-white/30 group-hover:scale-105 transition-transform">
                📷
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-bold uppercase tracking-wider mb-1">
                  <Sparkles className="w-3 h-3 text-emerald-200" />
                  <span>Instant AI Diagnosis</span>
                </div>
                <h4 className="text-lg sm:text-xl font-bold tracking-tight leading-tight">
                  {language === 'hi' ? '📷 अपनी फसल दिखाएं' : '📷 Show My Crop'}
                </h4>
                <p className="text-xs sm:text-sm text-emerald-100 font-medium mt-0.5">
                  {language === 'hi' ? 'कैमरे से फसल की सेहत और बीमारी की जांच करें' : 'Point camera to check crop health & soil'}
                </p>
              </div>
            </div>

            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white group-hover:bg-white group-hover:text-emerald-700 transition-all">
              <ArrowRight className="w-5 h-5" />
            </div>
          </motion.button>

          {/* Grid of 4 Secondary Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
            {/* Action 2: TALK TO CROPERX (Voice) */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowVoice(true)}
              className="text-left p-5 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 shadow-sm hover:shadow-md transition-all flex items-center justify-between min-h-[80px]"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-2xl">
                  🎙️
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    {language === 'hi' ? 'क्रोपरएक्स से बात करें' : 'Talk to CroperX'}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {language === 'hi' ? 'बोलकर सवाल पूछें' : 'Ask questions by voice'}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </motion.button>

            {/* Action 3: TALK TO ADVISER (Live Video Call) */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAdviserCall(true)}
              className="text-left p-5 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500 shadow-sm hover:shadow-md transition-all flex items-center justify-between min-h-[80px]"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center justify-center text-2xl">
                  👨‍🌾
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    {language === 'hi' ? 'सलाहकार से बात करें' : 'Talk to Adviser'}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {language === 'hi' ? 'खेत का लाइव वीडियो दिखाएं' : 'Show field on live video'}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </motion.button>

            {/* Action 4: TODAY'S WEATHER */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowWeatherModal(true)}
              className="text-left p-5 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 hover:border-amber-500 dark:hover:border-amber-500 shadow-sm hover:shadow-md transition-all flex items-center justify-between min-h-[80px]"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center text-2xl">
                  🌦️
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    {language === 'hi' ? 'आज का मौसम' : "Today's Weather"}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {Math.round(soilData.temperature || 28)}°C • {soilData.rainfall ? 'Rain Expected' : 'No Rain'}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </motion.button>

            {/* Action 5: WHAT SHOULD I DO TODAY? / DAILY TASKS */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowTaskModal(true)}
              className="text-left p-5 rounded-3xl bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 shadow-sm hover:shadow-md transition-all flex items-center justify-between min-h-[80px]"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-2xl">
                  🌱
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    {language === 'hi' ? 'आज के मुख्य कार्य' : 'What Should I Do Today?'}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                    {language === 'hi' ? 'सिंचाई और खेत के काम' : 'Daily farm checklist'}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </motion.button>
          </div>
        </div>

        {/* Essential Daily Task Checklist Preview */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">📋</span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {language === 'hi' ? 'आज की कृषि कार्यसूची' : "Today's Farm Action Plan"}
              </h3>
            </div>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full">
              3 Tasks
            </span>
          </div>

          <div className="space-y-2.5">
            {dailyTasks.map((task) => {
              const isDone = completedTasks[task.id];
              return (
                <div
                  key={task.id}
                  onClick={() =>
                    setCompletedTasks((prev) => ({ ...prev, [task.id]: !prev[task.id] }))
                  }
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${
                    isDone
                      ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-800 opacity-60'
                      : 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-500/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                        isDone
                          ? 'bg-emerald-600 text-white'
                          : 'border-2 border-slate-300 dark:border-slate-600'
                      }`}
                    >
                      {isDone && <CheckCircle2 className="w-4 h-4" />}
                    </div>
                    <div>
                      <h5
                        className={`text-sm font-semibold text-slate-900 dark:text-white ${
                          isDone ? 'line-through text-slate-400' : ''
                        }`}
                      >
                        {task.title}
                      </h5>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {task.desc}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Link Card to Nearby Advisers Discovery */}
        <div className="p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-2xl shrink-0 border border-emerald-500/30">
              📍
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm text-white">
                  Need In-Person Farm Guidance?
                </h4>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                  Certified Clinics
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Find agronomy extension centers and request field visits around {farmerLocationState.district || 'your area'}
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveDashboardTab('nearby_advisers')}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 shrink-0"
          >
            <span>Explore Nearby Advisers</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </>
      )}
    </main>

      {/* Mobile Sticky Bottom Navigation (Max 4 Items) */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 px-6 py-2 z-40 flex items-center justify-between shadow-lg">
        {/* 1. Home */}
        <button
          onClick={() => setMobileNav('home')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
            mobileNav === 'home'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <span className="text-xl">🏠</span>
          <span className="text-[10px] font-semibold">{language === 'hi' ? 'होम' : 'Home'}</span>
        </button>

        {/* 2. My Crop (Camera) */}
        <button
          onClick={() => {
            setMobileNav('crop');
            setShowCamera(true);
          }}
          className="flex flex-col items-center gap-1 py-1 px-3 text-slate-500 dark:text-slate-400"
        >
          <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center text-lg -mt-4 shadow-lg shadow-emerald-600/40">
            📷
          </div>
          <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
            {language === 'hi' ? 'मेरी फसल' : 'My Crop'}
          </span>
        </button>

        {/* 3. Talk (Voice) */}
        <button
          onClick={() => {
            setMobileNav('talk');
            setShowVoice(true);
          }}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
            mobileNav === 'talk'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <span className="text-xl">🎙️</span>
          <span className="text-[10px] font-semibold">{language === 'hi' ? 'बोलें' : 'Talk'}</span>
        </button>

        {/* 4. Profile */}
        <button
          onClick={() => {
            setMobileNav('profile');
            onOpenProfile();
          }}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
            mobileNav === 'profile'
              ? 'text-emerald-600 dark:text-emerald-400 font-bold'
              : 'text-slate-500 dark:text-slate-400'
          }`}
        >
          <span className="text-xl">👤</span>
          <span className="text-[10px] font-semibold">{language === 'hi' ? 'प्रोफ़ाइल' : 'Profile'}</span>
        </button>
      </nav>

      {/* Camera Modal */}
      {showCamera && (
        <FarmerCameraView
          cropName={primaryCrop}
          onClose={() => setShowCamera(false)}
          onConnectAdviser={(cropResult?: FarmerSimpleCropResult) => {
            setShowCamera(false);
            setShowAdviserCall(true);
          }}
        />
      )}

      {/* Voice Assistant Modal */}
      {showVoice && (
        <FarmerVoiceAssistant
          isOpen={showVoice}
          onClose={() => setShowVoice(false)}
          onConnectAdviser={() => {
            setShowVoice(false);
            setShowAdviserCall(true);
          }}
          cropName={primaryCrop}
          soilMoisture={soilData.soil_moisture || 28}
          weatherSummary={`${Math.round(soilData.temperature || 28)}°C, Partly Cloudy`}
        />
      )}

      {/* Live Video Call to Adviser */}
      {showAdviserCall && (
        <FarmerAdviserLiveCall
          isOpen={showAdviserCall}
          onClose={() => setShowAdviserCall(false)}
          farmerName={farmerName}
          farmName={farmerProfile.farmName || 'Green Valley Farm'}
          farmZone={farmZones[0]?.name || 'North Field A'}
          cropName={primaryCrop}
          soilMoisture={soilData.soil_moisture || 28}
          weatherSummary={`${Math.round(soilData.temperature || 28)}°C, Clear Sky`}
        />
      )}

      {/* Simple Weather Detail Modal */}
      {showWeatherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-3xl">🌦️</span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {language === 'hi' ? 'आज का मौसम' : "Today's Weather"}
                </h3>
              </div>
              <button
                onClick={() => setShowWeatherModal(false)}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-500/30 text-center space-y-1">
              <div className="text-4xl font-extrabold text-amber-700 dark:text-amber-300">
                {Math.round(soilData.temperature || 28)}°C
              </div>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Partly Cloudy • Humidity {Math.round(soilData.humidity || 65)}%
              </p>
            </div>

            <div className="space-y-2 text-sm">
              <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">🌧️ Rain Probability</span>
                <span className="font-bold text-slate-900 dark:text-white">10% (Low)</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">💨 Wind Speed</span>
                <span className="font-bold text-slate-900 dark:text-white">{Math.round(soilData.wind_speed || 12)} km/h</span>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between">
                <span className="text-emerald-800 dark:text-emerald-300 font-semibold">💧 Best Watering Time</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-300">5:00 PM - 6:30 PM</span>
              </div>
            </div>

            <button
              onClick={() => setShowWeatherModal(false)}
              className="w-full py-3 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm"
            >
              Close
            </button>
          </motion.div>
        </div>
      )}

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-3xl">❓</span>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {language === 'hi' ? 'मदद चाहिए?' : 'Need Help?'}
                </h3>
              </div>
              <button
                onClick={() => setShowHelpModal(false)}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-300">
              {language === 'hi'
                ? 'क्रोपरएक्स का उपयोग करना बहुत आसान है:'
                : 'CroperX is built to be simple and voice-friendly:'}
            </p>

            <div className="space-y-2.5">
              <button
                onClick={() => {
                  setShowHelpModal(false);
                  setShowCamera(true);
                }}
                className="w-full text-left p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 border border-slate-200 dark:border-slate-700 flex items-center gap-3"
              >
                <span className="text-2xl">📷</span>
                <div>
                  <h5 className="text-sm font-bold">Show My Crop</h5>
                  <p className="text-xs text-slate-500">Scan leaves & get instant health advice</p>
                </div>
              </button>

              <button
                onClick={() => {
                  setShowHelpModal(false);
                  setShowVoice(true);
                }}
                className="w-full text-left p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 border border-slate-200 dark:border-slate-700 flex items-center gap-3"
              >
                <span className="text-2xl">🎙️</span>
                <div>
                  <h5 className="text-sm font-bold">Talk to CroperX</h5>
                  <p className="text-xs text-slate-500">Ask any question in your native language</p>
                </div>
              </button>

              <button
                onClick={() => {
                  setShowHelpModal(false);
                  setShowAdviserCall(true);
                }}
                className="w-full text-left p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 border border-slate-200 dark:border-slate-700 flex items-center gap-3"
              >
                <span className="text-2xl">👨‍🌾</span>
                <div>
                  <h5 className="text-sm font-bold">Show Field to Adviser</h5>
                  <p className="text-xs text-slate-500">Connect with Dr. Anand Sharma via live video</p>
                </div>
              </button>
            </div>

            <button
              onClick={() => setShowHelpModal(false)}
              className="w-full py-3 rounded-2xl bg-emerald-600 text-white font-bold text-sm"
            >
              Got it
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};
