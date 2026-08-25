import React from 'react';
import { motion } from 'motion/react';
import { UserAccount, FarmerProfile, SoilData } from '../types';
import { MapPin, Calendar, Sprout, Sun, Droplets, Thermometer, ShieldCheck, Sparkles } from 'lucide-react';

interface PersonalizedWelcomeBannerProps {
  currentUser: UserAccount | null;
  farmerProfile: FarmerProfile;
  soilData: SoilData;
  onOpenProfile: () => void;
}

export const PersonalizedWelcomeBanner: React.FC<PersonalizedWelcomeBannerProps> = ({
  currentUser,
  farmerProfile,
  soilData,
  onOpenProfile
}) => {
  const displayName = currentUser?.farmerName || farmerProfile?.farmerName || 'Valued Farmer';
  const location = farmerProfile?.farmLocation || 'Green Valley Farm';
  const size = farmerProfile?.farmAreaSize || 5;

  const currentHour = new Date().getHours();
  const greetingTime = currentHour < 12 ? 'Good Morning' : currentHour < 18 ? 'Good Afternoon' : 'Good Evening';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-r from-[#1b2e1b] via-[#142614] to-[#0f1f0f] text-white p-6 sm:p-8 rounded-[2.5rem] border-2 border-[#4CAF50]/40 shadow-xl relative overflow-hidden space-y-4"
    >
      {/* Background Decorative Pattern */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-[#4CAF50]/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-[#4CAF50]/20 border border-[#4CAF50]/50 text-xs font-mono font-bold text-[#81c784] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              {greetingTime}, {displayName}!
            </span>
            <span className="text-xs font-mono text-gray-400">
              {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>Welcome back, Farmer {displayName}!</span>
            <span className="text-2xl">🌾</span>
          </h2>

          <p className="text-xs sm:text-sm text-[#a5d6a7] flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1 font-bold">
              <MapPin className="w-4 h-4 text-[#4CAF50]" />
              {location}
            </span>
            <span>•</span>
            <span>{size} Acres Active Plot</span>
            <span>•</span>
            <span className="text-amber-300 font-mono">Soil Type: {farmerProfile.soilTypeZone || 'Loamy Alluvial'}</span>
          </p>
        </div>

        {/* Live Weather Micro-Gauges */}
        <div className="flex items-center gap-3 bg-black/40 p-3.5 rounded-3xl border border-white/10 shrink-0">
          <div className="text-center px-2 border-r border-white/10">
            <div className="text-[10px] text-gray-400 font-bold uppercase flex items-center justify-center gap-1">
              <Thermometer className="w-3 h-3 text-amber-400" /> Temp
            </div>
            <div className="text-base font-black font-mono text-white mt-0.5">{soilData.temperature || 28}°C</div>
          </div>

          <div className="text-center px-2 border-r border-white/10">
            <div className="text-[10px] text-gray-400 font-bold uppercase flex items-center justify-center gap-1">
              <Droplets className="w-3 h-3 text-sky-400" /> Moisture
            </div>
            <div className="text-base font-black font-mono text-white mt-0.5">{soilData.soil_moisture || soilData.moisture || 32}%</div>
          </div>

          <div className="text-center px-2">
            <button
              onClick={onOpenProfile}
              className="px-3 py-2 bg-[#4CAF50] hover:bg-[#2e7d32] text-white font-bold text-xs rounded-2xl transition-all shadow-md flex items-center gap-1"
            >
              <span>Manage Profile</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
