import React from 'react';
import { motion } from 'motion/react';
import {
  MapPin,
  Sprout,
  Thermometer,
  CloudRain,
  PhoneCall,
  Activity,
  Sparkles,
  Search,
  Globe,
  Sun,
} from 'lucide-react';
import { UserAccount, FarmerProfile } from '../../types';
import { StatusBadge } from '../ui/StatusBadge';
import { FarmerButton } from '../ui/FarmerButton';

interface FarmerHeroBannerProps {
  currentUser: UserAccount | null;
  farmerProfile: FarmerProfile | null;
  weatherTemp?: number;
  weatherCondition?: string;
  weatherRainProb?: number;
  farmHealthScore?: number;
  onOpenCallModal: () => void;
  onOpenSearch: () => void;
  onSelectTab: (tab: any) => void;
}

export const FarmerHeroBanner: React.FC<FarmerHeroBannerProps> = ({
  currentUser,
  farmerProfile,
  weatherTemp = 28,
  weatherCondition = 'Partly Cloudy',
  weatherRainProb = 15,
  farmHealthScore = 92,
  onOpenCallModal,
  onOpenSearch,
  onSelectTab,
}) => {
  const farmerName = currentUser?.fullName || farmerProfile?.fullName || 'Farmer';
  const farmName = farmerProfile?.farmName || 'North Green Acres';
  const locationName = farmerProfile?.village || currentUser?.village || 'Nagpur, MH';
  const farmSize = farmerProfile?.totalLandAcres || 12;
  const mainCrop = farmerProfile?.primaryCrops?.[0] || 'Rice / Maize';

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1b2e1b] via-[#2e7d32] to-[#112211] text-white p-5 sm:p-8 shadow-xl border border-[#4CAF50]/40 my-4"
    >
      {/* Background Decorative Graphic Elements */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -ml-16 -mb-16 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Floating Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-white/10 relative z-10">
        <div className="flex items-center gap-2 text-xs font-mono text-emerald-200">
          <MapPin className="w-4 h-4 text-emerald-400" />
          <span className="font-bold">{farmName}</span>
          <span>•</span>
          <span>{locationName}</span>
        </div>

        <div className="flex items-center gap-2">
          <StatusBadge
            label={`Farm Health: ${farmHealthScore}%`}
            variant="success"
            size="sm"
            pulse
          />

          <button
            onClick={onOpenSearch}
            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl backdrop-blur-md transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Smart Search</span>
          </button>
        </div>
      </div>

      {/* Main Greeting & Hero Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center pt-6 relative z-10">
        <div className="lg:col-span-7 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-xs font-mono font-bold text-amber-300 backdrop-blur-md border border-amber-300/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Good Morning, {farmerName} 👋</span>
          </div>

          <h1 className="font-serif font-extrabold text-2xl sm:text-4xl text-white tracking-tight leading-tight">
            Your Farm. Your AI Assistant.
          </h1>

          <p className="text-xs sm:text-sm text-emerald-100/90 max-w-xl font-sans leading-relaxed">
            Real-time soil telemetry, live weather early warnings, and Google Gemini 2.5
            precision guidance tailored for <strong className="text-white">{mainCrop}</strong> on{' '}
            <strong className="text-white">{farmSize} Acres</strong>.
          </p>

          {/* Farm Quick Stats Pill Bar */}
          <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-mono">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-black/30 rounded-xl border border-white/10 backdrop-blur-md">
              <Sprout className="w-3.5 h-3.5 text-emerald-400" />
              <span>Crop: {mainCrop}</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-black/30 rounded-xl border border-white/10 backdrop-blur-md">
              <Thermometer className="w-3.5 h-3.5 text-amber-400" />
              <span>{weatherTemp}°C • {weatherCondition}</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-black/30 rounded-xl border border-white/10 backdrop-blur-md">
              <CloudRain className="w-3.5 h-3.5 text-sky-400" />
              <span>Rain Prob: {weatherRainProb}%</span>
            </div>
          </div>
        </div>

        {/* Right Prominent Voice Call Interactive Widget */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-5 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl space-y-3 text-center">
          <div className="relative">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2.5 }}
              className="absolute inset-0 bg-amber-400/30 rounded-full blur-md"
            />
            <button
              onClick={onOpenCallModal}
              className="relative p-5 bg-gradient-to-br from-amber-400 via-emerald-500 to-teal-600 text-white rounded-full shadow-xl hover:scale-105 transition-all cursor-pointer border-2 border-white/50"
            >
              <PhoneCall className="w-8 h-8 animate-bounce" />
            </button>
          </div>

          <div className="space-y-0.5">
            <h3 className="font-serif font-extrabold text-lg text-white">
              🎙️ ASK CROPERX
            </h3>
            <p className="text-xs text-amber-200 font-bold">"Tap and Speak with AI Agronomist"</p>
          </div>

          <p className="text-[11px] text-emerald-100/80 font-sans">
            Ask in English, Hindi, Telugu, Tamil, Kannada, Marathi & more.
          </p>

          <FarmerButton
            onClick={onOpenCallModal}
            variant="voice"
            size="sm"
            fullWidth
          >
            Start Voice Conversation
          </FarmerButton>
        </div>
      </div>
    </motion.div>
  );
};
