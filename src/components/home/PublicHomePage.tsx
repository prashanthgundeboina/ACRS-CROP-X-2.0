import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sprout, Camera, Droplets, CloudRain, Users, Brain,
  ArrowRight, ShieldCheck, CheckCircle2, PhoneCall, Sparkles,
  Radio, Activity, Globe, Compass, ChevronRight, Lock,
  Thermometer, Satellite, Cpu, AlertTriangle, Info,
  CheckCircle, Play, Pause, RefreshCw, LogIn, UserPlus,
  ArrowUpRight, Shield, Layers, HelpCircle
} from 'lucide-react';
import { UserAccount, UserRole, HomePageConfig, PublicAnnouncement } from '../../types';
import { HeroVideoPlayer } from './HeroVideoPlayer';
import { getPublicHomeConfig } from '../../services/homeService';
import { useLanguage } from '../../context/LanguageContext';

interface PublicHomePageProps {
  currentUser: UserAccount | null;
  onOpenLogin: () => void;
  onOpenRegister: (targetRole?: UserRole) => void;
  onOpenDashboard: (role?: UserRole) => void;
  onOpenProfile: () => void;
  onLogout: () => void;
}

export const PublicHomePage: React.FC<PublicHomePageProps> = ({
  currentUser,
  onOpenLogin,
  onOpenRegister,
  onOpenDashboard,
  onOpenProfile,
  onLogout
}) => {
  const { language, setLanguage } = useLanguage();
  const [homeConfig, setHomeConfig] = useState<HomePageConfig | null>(null);
  const [activeTelemetryTab, setActiveTelemetryTab] = useState<'crop' | 'soil' | 'weather' | 'iot' | 'satellite' | 'thermal' | 'ai'>('crop');
  const [dismissedAnnouncements, setDismissedAnnouncements] = useState<string[]>([]);

  useEffect(() => {
    getPublicHomeConfig(true).then((cfg) => setHomeConfig(cfg));

    const handlePublished = (e: any) => {
      if (e.detail) {
        setHomeConfig(e.detail);
      } else {
        getPublicHomeConfig(true).then((cfg) => setHomeConfig(cfg));
      }
    };

    window.addEventListener('croperx_home_config_published', handlePublished);

    let bc: BroadcastChannel | null = null;
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        bc = new BroadcastChannel('croperx_cms_channel');
        bc.onmessage = (ev) => {
          if (ev.data?.type === 'CMS_UPDATED') {
            getPublicHomeConfig(true).then((cfg) => setHomeConfig(cfg));
          }
        };
      } catch (e) {}
    }

    return () => {
      window.removeEventListener('croperx_home_config_published', handlePublished);
      bc?.close();
    };
  }, []);

  const userRole = currentUser?.role || 'farmer';
  const announcements = (homeConfig?.announcements || []).filter(a => a.isActive && !dismissedAnnouncements.includes(a.id));

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950">
      
      {/* ============================================================ */}
      {/* 1. TOP PUBLIC ANNOUNCEMENTS BANNER */}
      {/* ============================================================ */}
      {announcements.length > 0 && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 border-b border-emerald-500/30 px-4 py-2 text-xs backdrop-blur-md">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="shrink-0 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-black text-[10px] tracking-wider uppercase border border-emerald-500/30 flex items-center gap-1">
                {announcements[0].priority === 'Critical' ? (
                  <AlertTriangle className="w-3 h-3 text-red-400" />
                ) : announcements[0].priority === 'Important' ? (
                  <Info className="w-3 h-3 text-amber-400" />
                ) : (
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                )}
                {announcements[0].priority}
              </span>
              <span className="font-bold text-white truncate">{announcements[0].title}:</span>
              <span className="text-slate-300 truncate hidden sm:inline">{announcements[0].message}</span>
            </div>
            <button
              onClick={() => setDismissedAnnouncements(prev => [...prev, announcements[0].id])}
              className="text-slate-400 hover:text-white text-[11px] shrink-0 font-medium px-2 py-0.5 rounded hover:bg-white/10 transition-colors"
            >
              ✕ Dismiss
            </button>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 2. TOP PUBLIC NAVIGATION HEADER */}
      {/* ============================================================ */}
      <header className={`fixed ${announcements.length > 0 ? 'top-9' : 'top-0'} left-0 right-0 z-40 bg-slate-950/85 backdrop-blur-xl border-b border-white/10 transition-all`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          
          {/* Brand Logo */}
          <div
            id="nav-brand-logo"
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Sprout className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif italic font-black text-xl tracking-tight text-white">CroperX</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">2.0</span>
              </div>
              <p className="text-[10px] text-slate-400 tracking-wider font-mono uppercase hidden sm:block">Agricultural Intelligence</p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-300">
            <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="hover:text-emerald-400 transition-colors">Home</button>
            <button onClick={() => scrollToSection('how-it-works')} className="hover:text-emerald-400 transition-colors">How It Works</button>
            <button onClick={() => scrollToSection('live-showcase')} className="hover:text-emerald-400 transition-colors">Live Field Showcase</button>
            <button onClick={() => scrollToSection('capabilities')} className="hover:text-emerald-400 transition-colors">Capabilities</button>
            <button onClick={() => scrollToSection('roles')} className="hover:text-emerald-400 transition-colors">Who Is It For?</button>
            <button onClick={() => scrollToSection('trust')} className="hover:text-emerald-400 transition-colors">Trust & Privacy</button>
          </nav>

          {/* Right Action Cluster */}
          <div className="flex items-center gap-3">
            {/* Language Selector */}
            <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-full px-2.5 py-1 text-[11px] text-slate-300">
              <Globe className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <select
                id="public-language-select"
                value={language}
                onChange={(e) => setLanguage(e.target.value as any)}
                className="bg-transparent text-slate-200 text-[11px] focus:outline-none cursor-pointer pr-1 font-medium"
              >
                <option value="en" className="bg-slate-900 text-white">English</option>
                <option value="hi" className="bg-slate-900 text-white">हिंदी (Hindi)</option>
                <option value="pa" className="bg-slate-900 text-white">ਪੰਜਾਬੀ (Punjabi)</option>
                <option value="te" className="bg-slate-900 text-white">తెలుగు (Telugu)</option>
                <option value="mr" className="bg-slate-900 text-white">मराठी (Marathi)</option>
              </select>
            </div>

            {/* Authenticated State */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                <button
                  id="nav-user-profile-btn"
                  onClick={onOpenProfile}
                  className="hidden sm:flex items-center gap-2 p-1.5 pr-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs font-semibold transition-all cursor-pointer"
                >
                  <img
                    src={currentUser.profileImage || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"}
                    alt={currentUser.farmerName}
                    className="w-6 h-6 rounded-full object-cover border border-emerald-500/50"
                  />
                  <span className="max-w-[110px] truncate text-slate-200">{currentUser.farmerName}</span>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold uppercase ${
                    userRole === 'admin' ? 'bg-purple-500/20 text-purple-300' : userRole === 'farmer_adviser' ? 'bg-teal-500/20 text-teal-300' : 'bg-emerald-500/20 text-emerald-300'
                  }`}>
                    {userRole === 'admin' ? 'Admin' : userRole === 'farmer_adviser' ? 'Adviser' : 'Farmer'}
                  </span>
                </button>

                <button
                  id="nav-open-dashboard-btn"
                  onClick={() => onOpenDashboard(userRole)}
                  className="px-4 py-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/30 transition-all cursor-pointer"
                >
                  <span>Open My Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <button
                  id="nav-logout-btn"
                  onClick={onLogout}
                  className="p-2 rounded-full bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-300 border border-white/10 transition-colors cursor-pointer"
                  title="Logout"
                  aria-label="Logout"
                >
                  <Lock className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  id="nav-login-btn"
                  onClick={onOpenLogin}
                  className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 text-white font-bold text-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <LogIn className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Login</span>
                </button>

                <button
                  id="nav-register-btn"
                  onClick={() => onOpenRegister('farmer')}
                  className="px-4 py-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-lg shadow-emerald-500/30 transition-all cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Register</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ============================================================ */}
      {/* 3. HERO SECTION */}
      {/* ============================================================ */}
      <section className="relative min-h-screen flex items-center justify-center pt-24 pb-16 overflow-hidden">
        {/* Dynamic Video / Image Player */}
        <HeroVideoPlayer
          mediaType={homeConfig?.activeMediaType || 'video'}
          videoUrl={homeConfig?.heroVideoUrl || "https://assets.mixkit.co/videos/preview/mixkit-drone-view-of-a-tractor-in-a-field-42588-large.mp4"}
          imageUrl={homeConfig?.heroImageUrl || "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=1920&q=85"}
          posterUrl={homeConfig?.posterImageUrl || "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=1920&q=80"}
          autoplay={homeConfig?.videoSettings?.autoplay ?? true}
          muted={homeConfig?.videoSettings?.muted ?? true}
          loop={homeConfig?.videoSettings?.loop ?? true}
          playsInline={homeConfig?.videoSettings?.playsInline ?? true}
        />

        {/* Hero Typography & CTAs */}
        <div className="relative z-20 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/70 border border-emerald-500/40 backdrop-blur-md text-emerald-300 text-xs font-semibold shadow-xl">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{homeConfig?.heroTitle || "Welcome to CroperX"}</span>
            </div>

            {/* Main Hero Heading */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif italic font-black text-white tracking-tight leading-[1.08] max-w-4xl mx-auto drop-shadow-lg">
              {homeConfig?.heroHeading || "Your Field. Your Crop. Your Intelligence."}
            </h1>

            {/* Subtitle / Description */}
            <p className="text-base sm:text-lg md:text-xl text-slate-200 max-w-2xl mx-auto font-normal leading-relaxed drop-shadow-md">
              {homeConfig?.heroSubtitle || "AI-powered farming intelligence connecting farmers, advisers, cameras, sensors, weather and field data."}
            </p>

            {/* 3 Primary Hero Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
              {currentUser ? (
                <button
                  id="hero-open-authorized-dashboard"
                  onClick={() => onOpenDashboard(userRole)}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/25 transition-all cursor-pointer"
                >
                  <span>Open Authorized Workspace ({userRole === 'admin' ? 'Administrator' : userRole === 'farmer_adviser' ? 'Farm Adviser' : 'Farmer'})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <>
                  {/* Button 1: Login */}
                  <button
                    id="hero-primary-login"
                    onClick={onOpenLogin}
                    className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/30 transition-all cursor-pointer"
                  >
                    <span>{homeConfig?.primaryActionLabel || "Login"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  {/* Button 2: Register */}
                  <button
                    id="hero-secondary-register"
                    onClick={() => onOpenRegister('farmer')}
                    className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 border border-white/20 backdrop-blur-md text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
                  >
                    <span>{homeConfig?.secondaryActionLabel || "Create Account"}</span>
                  </button>

                  {/* Button 3: Explore CroperX */}
                  <button
                    id="hero-explore-croperx"
                    onClick={() => scrollToSection('how-it-works')}
                    className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white font-semibold text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Compass className="w-4 h-4 text-emerald-400" />
                    <span>{homeConfig?.exploreActionLabel || "Explore CroperX"}</span>
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </div>

        {/* Live Field Showcase Floating Bar */}
        <div className="absolute bottom-0 left-0 right-0 z-20 bg-slate-950/75 backdrop-blur-xl border-t border-white/10 py-3 hidden lg:block">
          <div className="max-w-7xl mx-auto px-4 flex items-center justify-between text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 font-mono font-bold">99.8%</span>
              <span className="text-slate-400">Pathology Precision</span>
            </div>
            <div className="h-3 w-[1px] bg-white/10" />
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-mono font-bold">14,800+</span>
              <span className="text-slate-400">Monitored Field Acres</span>
            </div>
            <div className="h-3 w-[1px] bg-white/10" />
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-mono font-bold">24/7</span>
              <span className="text-slate-400">Multilingual Agronomy AI</span>
            </div>
            <div className="h-3 w-[1px] bg-white/10" />
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-mono font-bold">WebRTC</span>
              <span className="text-slate-400">Ultra Low-Latency Video Triage</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 4. SECTION: HOW CROPERX WORKS (4 STEPS) */}
      {/* ============================================================ */}
      <section id="how-it-works" className="py-24 bg-slate-900/30 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <div className="text-xs font-bold uppercase tracking-widest text-emerald-400 font-mono">End-To-End Agronomy Pipeline</div>
            <h2 className="text-3xl sm:text-4xl font-serif italic font-bold text-white">
              How CroperX Works
            </h2>
            <p className="text-sm text-slate-400">
              Four streamlined steps from field observation to high-yield action.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 relative space-y-4 transition-all">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 font-black text-sm flex items-center justify-center border border-emerald-500/30">
                  1
                </div>
                <Camera className="w-5 h-5 text-emerald-400" />
              </div>
              <h3 className="text-base font-bold text-white">Show Your Field</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Take a quick photo of your crop, stream live video using your phone camera, or connect automated UAV & IoT sensor nodes.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 relative space-y-4 transition-all">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-400 font-black text-sm flex items-center justify-center border border-teal-500/30">
                  2
                </div>
                <Brain className="w-5 h-5 text-teal-400" />
              </div>
              <h3 className="text-base font-bold text-white">CroperX Understands</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                AI vision models and soil algorithms immediately compute N-P-K nutrient balances, moisture deficits, and pathogen risks.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 relative space-y-4 transition-all">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-400 font-black text-sm flex items-center justify-center border border-blue-500/30">
                  3
                </div>
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-base font-bold text-white">Get Expert Help</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Connect with certified agricultural advisers for live WebRTC triage, verified pathology diagnoses, and digital prescriptions.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/40 relative space-y-4 transition-all">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-purple-500/20 text-purple-400 font-black text-sm flex items-center justify-center border border-purple-500/30">
                  4
                </div>
                <Sprout className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-base font-bold text-white">Take Action</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Receive simple, direct guidance on your phone with precise schedules for irrigation, nutrient application, and pest defense.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 5. SECTION: LIVE FIELD SHOWCASE */}
      {/* ============================================================ */}
      <section id="live-showcase" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <div className="text-xs font-bold uppercase tracking-widest text-emerald-400 font-mono">Augmented Agronomic View</div>
          <h2 className="text-3xl sm:text-4xl font-serif italic font-bold text-white">
            See CroperX in the Field
          </h2>
          <p className="text-sm text-slate-400">
            Real-time telemetry overlays illustrating how multi-sensor intelligence unites on the live field canvas.
          </p>
        </div>

        {/* Telemetry Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {[
            { id: 'crop', label: '🌱 Crop Health', tag: 'NDVI 0.78' },
            { id: 'soil', label: '💧 Soil & Water', tag: 'Moisture 42%' },
            { id: 'weather', label: '🌦️ Live Weather', tag: '28.4°C / 62% RH' },
            { id: 'iot', label: '📡 IoT Sensors', tag: 'Node #12 Active' },
            { id: 'satellite', label: '🛰️ Satellite', tag: 'Sentinel-2' },
            { id: 'thermal', label: '🌡️ Thermal Vision', tag: 'Canopy 26°C' },
            { id: 'ai', label: '🧠 AI Intelligence', tag: 'Zero Blight Risk' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTelemetryTab(tab.id as any)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTelemetryTab === tab.id
                  ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/25'
                  : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                activeTelemetryTab === tab.id ? 'bg-slate-950/20 text-slate-950 font-black' : 'bg-slate-800 text-slate-400'
              }`}>
                {tab.tag}
              </span>
            </button>
          ))}
        </div>

        {/* Interactive Simulated Telemetry Canvas */}
        <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-900/60 shadow-2xl aspect-video max-h-[520px] w-full">
          {/* Background Video / Image */}
          <video
            src="https://assets.mixkit.co/videos/preview/mixkit-wind-blowing-over-green-wheat-fields-43640-large.mp4"
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover opacity-80"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-slate-950/60" />

          {/* Top Overlay Badge */}
          <div className="absolute top-4 left-4 z-20 flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-slate-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold flex items-center gap-2 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              LIVE TELEMETRY STREAM
            </span>
            <span className="px-2.5 py-1 rounded-full bg-amber-950/80 border border-amber-500/40 text-amber-300 text-[10px] font-mono font-bold backdrop-blur-md">
              DEMO / SIMULATED FEED
            </span>
          </div>

          {/* Interactive HUD Overlay based on Tab */}
          <div className="absolute inset-x-6 bottom-6 z-20">
            <div className="p-6 rounded-2xl bg-slate-950/85 border border-white/10 backdrop-blur-xl max-w-2xl">
              {activeTelemetryTab === 'crop' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>🌱</span> Crop Health & Normalized Difference Vegetation Index
                    </h4>
                    <span className="text-xs font-bold text-emerald-400 font-mono">Status: Optimal (94.2%)</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Spectral analysis reveals dense chlorophyll concentration in North Quad. Nitrogen balance is stabilized; zero evidence of foliar rust or powdery mildew.
                  </p>
                </div>
              )}

              {activeTelemetryTab === 'soil' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>💧</span> Soil Moisture & Evapotranspiration Deficit
                    </h4>
                    <span className="text-xs font-bold text-teal-400 font-mono">Moisture: 42% (Field Capacity)</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Root-zone dielectric capacitance sensors indicate adequate capillary hydration. Recommended next drip cycle: 18:30 IST for 22 minutes.
                  </p>
                </div>
              )}

              {activeTelemetryTab === 'weather' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>🌦️</span> Micro-Climate Station Telemetry
                    </h4>
                    <span className="text-xs font-bold text-amber-400 font-mono">Temp: 28.4°C | Wind: 8 km/h NW</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Relative humidity at 62%. Barometric pressure steady at 1013 hPa. Low dew-point condensation eliminates nocturnal fungal spore germination threat.
                  </p>
                </div>
              )}

              {activeTelemetryTab === 'iot' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>📡</span> LoRa Mesh Sensor Network Status
                    </h4>
                    <span className="text-xs font-bold text-blue-400 font-mono">6 of 6 Nodes Online</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Gateway #1 polling at 30-second heartbeats. Average RSSI: -72 dBm. Soil NPK ion-selective electrodes calibrated 2 hours ago.
                  </p>
                </div>
              )}

              {activeTelemetryTab === 'satellite' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>🛰️</span> Sentinel-2 & PlanetScope Constellation Pass
                    </h4>
                    <span className="text-xs font-bold text-purple-400 font-mono">Resolution: 10m Multi-Spectral</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Band 8 (NIR) and Band 4 (Red) ratio indicates uniform canopy closure. Cloud cover across region is 0.0%. Next orbital pass in 3 days.
                  </p>
                </div>
              )}

              {activeTelemetryTab === 'thermal' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>🌡️</span> UAV Long-Wave Infrared Thermal Vision
                    </h4>
                    <span className="text-xs font-bold text-rose-400 font-mono">Canopy Temp: 26.1°C</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Transpiration evaporative cooling is operating efficiently. No localized stomatal closure or drought-stress hotspots detected.
                  </p>
                </div>
              )}

              {activeTelemetryTab === 'ai' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>🧠</span> Multimodal Gemini Agronomic Inference
                    </h4>
                    <span className="text-xs font-bold text-emerald-400 font-mono">Yield Outlook: +14% Target</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Cross-referencing soil pH (6.5), thermal delta, and weather projections confirms strong vegetative growth trajectory.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 6. SECTION: 9 CORE CAPABILITIES SHOWCASE */}
      {/* ============================================================ */}
      <section id="capabilities" className="py-24 bg-slate-900/20 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <div className="text-xs font-bold uppercase tracking-widest text-emerald-400 font-mono">Comprehensive Agronomy Suite</div>
            <h2 className="text-3xl sm:text-4xl font-serif italic font-bold text-white">
              CroperX Capability Showcase
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Every tool modern agriculture requires — organized into nine unified intelligence pillars.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 1. Crop Intelligence */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 backdrop-blur-md transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-950 border border-emerald-500/30 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                🌱
              </div>
              <h3 className="text-lg font-bold text-white mb-1.5">Crop Intelligence</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Understand crop growth stages, detect leaf deficiencies, and get N-P-K nutrient balancing formulas tailored to your crop cycle.
              </p>
            </div>

            {/* 2. Live Field Vision */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-teal-500/40 backdrop-blur-md transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-teal-950 border border-teal-500/30 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                📷
              </div>
              <h3 className="text-lg font-bold text-white mb-1.5">Live Field Vision</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Stream low-latency WebRTC video directly from your tractor or mobile phone with real-time augmented disease diagnosis overlays.
              </p>
            </div>

            {/* 3. Soil Intelligence */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/40 backdrop-blur-md transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-amber-950 border border-amber-500/30 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                🧪
              </div>
              <h3 className="text-lg font-bold text-white mb-1.5">Soil Intelligence</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Track soil pH, electrical conductivity, organic matter, and micro-nutrients to build resilient soil ecology across seasons.
              </p>
            </div>

            {/* 4. Smart Irrigation */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-blue-500/40 backdrop-blur-md transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-blue-950 border border-blue-500/30 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                💧
              </div>
              <h3 className="text-lg font-bold text-white mb-1.5">Smart Irrigation</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Calculate volumetric pump runtime schedules based on evapotranspiration rates to save up to 40% in water and pumping electricity.
              </p>
            </div>

            {/* 5. Live Weather */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-sky-500/40 backdrop-blur-md transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-sky-950 border border-sky-500/30 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                🌦️
              </div>
              <h3 className="text-lg font-bold text-white mb-1.5">Live Weather</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Hyper-local meteorological telemetry with predictive frost alerts, storm warnings, and 7-day agricultural rainfall forecasts.
              </p>
            </div>

            {/* 6. IoT Sensors */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 backdrop-blur-md transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-indigo-950 border border-indigo-500/30 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                📡
              </div>
              <h3 className="text-lg font-bold text-white mb-1.5">IoT Sensors</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Connect solar-powered LoRaWAN in-ground moisture probes, leaf wetness sensors, and automated smart valve controllers.
              </p>
            </div>

            {/* 7. Thermal Vision */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-rose-500/40 backdrop-blur-md transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-rose-950 border border-rose-500/30 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                🌡️
              </div>
              <h3 className="text-lg font-bold text-white mb-1.5">Thermal Vision</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Identify water-stressed zones and blocked drip emitters days before visible leaf wilting occurs using canopy heat signatures.
              </p>
            </div>

            {/* 8. Farm Adviser */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-purple-500/40 backdrop-blur-md transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-purple-950 border border-purple-500/30 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                🧑‍🌾
              </div>
              <h3 className="text-lg font-bold text-white mb-1.5">Farm Adviser</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Direct two-way voice and video triage with certified agronomists who can inspect crop video live and issue treatment prescriptions.
              </p>
            </div>

            {/* 9. CroperX AI */}
            <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 backdrop-blur-md transition-all group">
              <div className="w-12 h-12 rounded-2xl bg-emerald-950 border border-emerald-500/30 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                🧠
              </div>
              <h3 className="text-lg font-bold text-white mb-1.5">CroperX AI</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Conversational, voice-driven multimodal Gemini AI assistant available 24/7 in your regional language with zero complex terminology.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 7. SECTION: ROLE GATEWAYS ("CROPERX FOR EVERYONE") */}
      {/* ============================================================ */}
      <section id="roles" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="text-xs font-bold uppercase tracking-widest text-emerald-400 font-mono">Tailored Workspaces</div>
          <h2 className="text-3xl sm:text-4xl font-serif italic font-bold text-white">
            CroperX for Everyone
          </h2>
          <p className="text-sm text-slate-400">
            Dedicated entry points designed specifically for farmers, field advisers, and platform administrators.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Card 1: Farmer */}
          <div className="p-8 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 hover:border-emerald-500/50 flex flex-col justify-between space-y-6 transition-all group shadow-xl">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-950 border border-emerald-500/30 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                👨‍🌾
              </div>
              <h3 className="text-xl font-bold text-white">For Farmers</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Simple farming guidance using voice, camera, and AI. Track field moisture, receive weather alerts, and solve crop issues without technical complexity.
              </p>
              <ul className="space-y-2 text-xs text-slate-300 pt-2 font-medium">
                <li className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>One-tap Voice Assistant in your regional language</span>
                </li>
                <li className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Real-time irrigation & disease warnings</span>
                </li>
                <li className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Direct phone camera video stream to advisers</span>
                </li>
              </ul>
            </div>

            <button
              id="role-btn-farmer"
              onClick={() => {
                if (currentUser && userRole === 'farmer') onOpenDashboard('farmer');
                else onOpenRegister('farmer');
              }}
              className="w-full py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
            >
              <span>{currentUser && userRole === 'farmer' ? "Open Farmer Dashboard" : "I'm a Farmer"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card 2: Farm Adviser */}
          <div className="p-8 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 hover:border-teal-500/50 flex flex-col justify-between space-y-6 transition-all group shadow-xl">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-teal-950 border border-teal-500/30 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                🧑‍🌾
              </div>
              <h3 className="text-xl font-bold text-white">For Farm Advisers</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Professional tools to support farmers remotely, review live WebRTC camera streams, triage pathology cases, and dispatch digital prescriptions.
              </p>
              <ul className="space-y-2 text-xs text-slate-300 pt-2 font-medium">
                <li className="flex items-center gap-2 text-teal-400">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Live WebRTC video workstation with crop overlay</span>
                </li>
                <li className="flex items-center gap-2 text-teal-400">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Case management & digital prescriptions</span>
                </li>
                <li className="flex items-center gap-2 text-teal-400">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Satellite NDVI & thermal sensor integration</span>
                </li>
              </ul>
            </div>

            <button
              id="role-btn-adviser"
              onClick={() => {
                if (currentUser && (userRole === 'farmer_adviser' || userRole === 'admin')) onOpenDashboard('farmer_adviser');
                else onOpenRegister('farmer_adviser');
              }}
              className="w-full py-4 rounded-2xl bg-teal-600 hover:bg-teal-500 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-teal-950/50 transition-all cursor-pointer"
            >
              <span>{currentUser && userRole === 'farmer_adviser' ? "Open Adviser Workstation" : "I'm a Farm Adviser"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Card 3: Administrator */}
          <div className="p-8 rounded-3xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 hover:border-purple-500/50 flex flex-col justify-between space-y-6 transition-all group shadow-xl">
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-purple-950 border border-purple-500/30 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                🛠️
              </div>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">Administration</h3>
                <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-900/50 text-purple-300 font-bold border border-purple-500/30">Secure Portal</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Manage CroperX users, farms, IoT hardware devices, public Home Content Studio (CMS), and review real-time security audit trails.
              </p>
              <ul className="space-y-2 text-xs text-slate-300 pt-2 font-medium">
                <li className="flex items-center gap-2 text-purple-400">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Public Home Page CMS & Media Manager</span>
                </li>
                <li className="flex items-center gap-2 text-purple-400">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>User directory, role assignment & telemetry status</span>
                </li>
                <li className="flex items-center gap-2 text-purple-400">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>PBKDF2 security & immutable audit logging</span>
                </li>
              </ul>
            </div>

            <button
              id="role-btn-admin"
              onClick={() => {
                if (currentUser && userRole === 'admin') onOpenDashboard('admin');
                else onOpenLogin();
              }}
              className="w-full py-4 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-950/50 transition-all cursor-pointer"
            >
              <span>{currentUser && userRole === 'admin' ? "Open Command Center" : "Admin Login"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 8. SECTION: TRUST & PRIVACY */}
      {/* ============================================================ */}
      <section id="trust" className="py-24 bg-slate-900/30 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <div className="text-xs font-bold uppercase tracking-widest text-emerald-400 font-mono">Security & Agronomic Integrity</div>
            <h2 className="text-3xl sm:text-4xl font-serif italic font-bold text-white">
              Built for Real Farms
            </h2>
            <p className="text-sm text-slate-400">
              Designed with strict data sovereignty, certified human verification, and zero exposure of private farm boundaries.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Pillar 1 */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-950 border border-emerald-500/30 flex items-center justify-center text-xl">
                📡
              </div>
              <h3 className="text-base font-bold text-white">Real Field Data</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Connects directly to real sensors and mobile camera feeds. Real telemetry with zero fake data generation for registered farms.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-teal-950 border border-teal-500/30 flex items-center justify-center text-xl">
                🤝
              </div>
              <h3 className="text-base font-bold text-white">Human + AI</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                AI suggestions are verified by certified agricultural advisers before critical interventions to protect your crop investment.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-950 border border-blue-500/30 flex items-center justify-center text-xl">
                🛡️
              </div>
              <h3 className="text-base font-bold text-white">Protected Farm Data</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Your farm GPS boundaries, crop yields, and financial records are protected by PBKDF2 encryption and never exposed publicly.
              </p>
            </div>

            {/* Pillar 4 */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-950 border border-purple-500/30 flex items-center justify-center text-xl">
                🔍
              </div>
              <h3 className="text-base font-bold text-white">Transparent Reasoning</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Every AI insight explains the underlying soil chemistry, weather indicators, and scientific citations in clear, plain language.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 9. SECTION: CALL TO ACTION (CTA) */}
      {/* ============================================================ */}
      <section className="py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="p-12 rounded-3xl bg-gradient-to-b from-emerald-950/60 via-slate-900/90 to-slate-950 border border-emerald-500/30 shadow-2xl relative overflow-hidden space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-3xl mx-auto border border-emerald-500/30 shadow-xl">
            🌱
          </div>

          <h2 className="text-3xl sm:text-5xl font-serif italic font-black text-white max-w-2xl mx-auto leading-tight">
            Ready to understand your field better?
          </h2>

          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
            Join thousands of progressive farmers and agricultural advisers using CroperX 2.0 to boost harvest yield and reduce water waste.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
            {currentUser ? (
              <button
                id="cta-open-dashboard"
                onClick={() => onOpenDashboard(userRole)}
                className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/30 transition-all cursor-pointer"
              >
                <span>Enter Your Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <button
                  id="cta-get-started"
                  onClick={() => onOpenRegister('farmer')}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/30 transition-all cursor-pointer"
                >
                  <span>Get Started Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  id="cta-login"
                  onClick={onOpenLogin}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-white/20 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <span>Login to Existing Account</span>
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 10. PUBLIC FOOTER */}
      {/* ============================================================ */}
      <footer className="border-t border-white/10 bg-slate-950/95 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-sm border border-emerald-500/30">
              🌱
            </div>
            <div>
              <span className="font-bold text-slate-300">CroperX 2.0 Agricultural Intelligence</span>
              <p className="text-[10px] text-slate-600 font-mono">Phase 31 Content Studio & Demonstration Engine</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-slate-400 text-xs">
            <span>Server-side AI Security</span>
            <span>PBKDF2 Hashed Passwords</span>
            <span>Real-Time WebRTC</span>
            <span>LoRa Sensor Mesh</span>
          </div>

          <div className="text-[11px] text-slate-500">
            © 2026 CroperX Agritech Ecosystem. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
