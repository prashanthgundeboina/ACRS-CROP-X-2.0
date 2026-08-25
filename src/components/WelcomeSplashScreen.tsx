import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sprout, Sparkles, LogIn, UserPlus, ArrowRight, ShieldCheck, Cpu, Globe, Zap, Radio, CheckCircle2 } from 'lucide-react';

interface WelcomeSplashScreenProps {
  onStartAuth: (mode: 'login' | 'register') => void;
  onEnterAsGuest: () => void;
}

export const WelcomeSplashScreen: React.FC<WelcomeSplashScreenProps> = ({
  onStartAuth,
  onEnterAsGuest
}) => {
  const [activeFeatureIndex, setActiveFeatureIndex] = useState<number>(0);

  const features = [
    {
      title: "Multi-Algorithmic AI Swarm",
      desc: "Powered by Gemini 2.5 Flash, Google Earth Engine NDVI & ChatGPT Agronomic Physics models.",
      icon: Cpu,
      color: "from-emerald-500 to-green-700",
      tag: "Gemini + Google Info + AI Algorithms"
    },
    {
      title: "24/7 Continuous Sensor Telemetry",
      desc: "Real-time field probe mesh sync with exponential backoff & 30-day soil trend forecasting.",
      icon: Radio,
      color: "from-sky-500 to-blue-700",
      tag: "24/7 Real-Time Live Stream"
    },
    {
      title: "Predictive Yield & Pathogen Map",
      desc: "6-month biomass growth modeling, regional pest risk GIS overlays, & automated yield push alerts.",
      icon: Zap,
      color: "from-amber-500 to-orange-700",
      tag: "Precision Precision Engine"
    }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-[#0f1f0f] text-white flex flex-col justify-between p-6 md:p-12 overflow-y-auto font-sans">
      {/* Background Animated Gradient Mesh */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#2e7d32]/30 via-[#1b2e1b]/60 to-[#0a140a] pointer-events-none" />

      {/* Top Header */}
      <div className="relative z-10 flex items-center justify-between max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="bg-[#4CAF50] p-2.5 rounded-2xl text-white shadow-lg animate-pulse">
            <Sprout className="w-7 h-7" />
          </div>
          <div>
            <h1 className="font-serif text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>CROP RECOMMENDATION</span>
              <span className="text-[#81c784] font-sans font-black text-xs bg-[#2e7d32]/60 px-2.5 py-0.5 rounded-full border border-[#4CAF50]/40">
                SYSTEM PRO
              </span>
            </h1>
            <p className="text-[11px] text-[#a5d6a7] font-mono">Next-Gen Autonomous Agricultural Intelligence</p>
          </div>
        </div>

        <button
          onClick={onEnterAsGuest}
          className="text-xs font-bold text-[#a5d6a7] hover:text-white transition-colors bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl backdrop-blur-md border border-white/10"
        >
          Skip to Dashboard →
        </button>
      </div>

      {/* Central Hero Stage */}
      <div className="relative z-10 max-w-4xl mx-auto w-full my-auto py-8 space-y-8 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#2e7d32]/50 border border-[#4CAF50]/50 text-xs font-mono font-bold text-[#a5d6a7]">
            <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
            <span>Welcome to Next-Gen Precision Agriculture</span>
          </div>

          <h2 className="font-serif text-4xl sm:text-6xl font-bold leading-tight text-white max-w-3xl mx-auto">
            AI-Powered Crop & Yield <span className="text-[#81c784] italic">Intelligence System</span>
          </h2>

          <p className="text-gray-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Continuously analyzing 22 multivariate soil parameters, 24/7 IoT sensor telemetry, and regional satellite imagery to maximize farm profitability.
          </p>
        </motion.div>

        {/* Feature Carousel Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
          {features.map((feat, i) => {
            const Icon = feat.icon;
            return (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                onClick={() => setActiveFeatureIndex(i)}
                className={`p-6 rounded-3xl cursor-pointer border transition-all duration-300 relative overflow-hidden ${
                  activeFeatureIndex === i
                    ? 'bg-[#1b2e1b] border-[#4CAF50] ring-2 ring-[#4CAF50]/50 shadow-2xl scale-105'
                    : 'bg-black/30 border-white/10 hover:border-white/20 hover:bg-black/50'
                }`}
              >
                <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${feat.color} flex items-center justify-center text-white mb-4 shadow-md`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#81c784] block mb-1">
                  {feat.tag}
                </span>
                <h3 className="font-serif text-lg font-bold text-white mb-2">{feat.title}</h3>
                <p className="text-xs text-gray-300 leading-relaxed">{feat.desc}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Action Buttons: Login / Register Prompt */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button
            onClick={() => onStartAuth('register')}
            className="w-full sm:w-auto px-8 py-4 bg-[#4CAF50] hover:bg-[#2e7d32] text-white font-bold text-sm rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 group"
          >
            <UserPlus className="w-5 h-5" />
            <span>Create New Farmer Account</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => onStartAuth('login')}
            className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold text-sm rounded-2xl border border-white/20 transition-all flex items-center justify-center gap-2"
          >
            <LogIn className="w-5 h-5 text-[#81c784]" />
            <span>Sign In to Existing Account</span>
          </button>
        </motion.div>
      </div>

      {/* Footer Info */}
      <div className="relative z-10 max-w-6xl mx-auto w-full pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-400 gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#81c784]" />
          <span>24/7 Verified Autonomous Multi-Source Algorithmic Pipeline</span>
        </div>
        <div className="font-mono text-gray-400">
          Gemini 2.5 • Google Info • Agronomic AI Engine v4.2
        </div>
      </div>
    </div>
  );
};
