import React from 'react';
import { motion } from 'motion/react';
import {
  Scan,
  Mic,
  Video,
  Siren,
  MessageCircle,
  Droplets,
  ArrowUpRight,
  Sparkles,
  ShieldAlert,
  Compass,
  Layers
} from 'lucide-react';

interface Farmer3DActionGridProps {
  onScanCrop: () => void;
  onOpenVoiceAI: () => void;
  onOpenAdviserCall: () => void;
  onOpenChat: () => void;
  onTriggerEmergency: () => void;
  onOpenIrrigation: () => void;
}

export const Farmer3DActionGrid: React.FC<Farmer3DActionGridProps> = ({
  onScanCrop,
  onOpenVoiceAI,
  onOpenAdviserCall,
  onOpenChat,
  onTriggerEmergency,
  onOpenIrrigation,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 sm:gap-4 my-6">
      {/* 1. Crop Scanner */}
      <button
        onClick={onScanCrop}
        className="group relative p-4 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/70 border border-emerald-500/30 hover:border-emerald-400 shadow-xl hover:shadow-emerald-500/20 text-left transition-all duration-300 transform hover:-translate-y-1.5 cursor-pointer flex flex-col justify-between h-36"
      >
        <div className="flex items-center justify-between w-full">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
            <Scan className="w-5 h-5" />
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors" />
        </div>
        <div>
          <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
            AI Crop Scanner
          </h4>
          <p className="text-[10px] text-slate-400 mt-0.5">Instant disease diagnosis</p>
        </div>
      </button>

      {/* 2. Voice AI Agronomist */}
      <button
        onClick={onOpenVoiceAI}
        className="group relative p-4 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/70 border border-indigo-500/30 hover:border-indigo-400 shadow-xl hover:shadow-indigo-500/20 text-left transition-all duration-300 transform hover:-translate-y-1.5 cursor-pointer flex flex-col justify-between h-36"
      >
        <div className="flex items-center justify-between w-full">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
            <Mic className="w-5 h-5" />
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
        </div>
        <div>
          <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
            Voice AI Agent
          </h4>
          <p className="text-[10px] text-slate-400 mt-0.5">Multilingual voice advice</p>
        </div>
      </button>

      {/* 3. Live Video Consultation */}
      <button
        onClick={onOpenAdviserCall}
        className="group relative p-4 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-teal-950/70 border border-teal-500/30 hover:border-teal-400 shadow-xl hover:shadow-teal-500/20 text-left transition-all duration-300 transform hover:-translate-y-1.5 cursor-pointer flex flex-col justify-between h-36"
      >
        <div className="flex items-center justify-between w-full">
          <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center text-teal-400 group-hover:scale-110 transition-transform">
            <Video className="w-5 h-5" />
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-teal-400 transition-colors" />
        </div>
        <div>
          <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-teal-300 transition-colors">
            Video Adviser
          </h4>
          <p className="text-[10px] text-slate-400 mt-0.5">Live expert consultation</p>
        </div>
      </button>

      {/* 4. Instagram Agri-Chat */}
      <button
        onClick={onOpenChat}
        className="group relative p-4 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-pink-950/70 border border-pink-500/30 hover:border-pink-400 shadow-xl hover:shadow-pink-500/20 text-left transition-all duration-300 transform hover:-translate-y-1.5 cursor-pointer flex flex-col justify-between h-36"
      >
        <div className="flex items-center justify-between w-full">
          <div className="w-10 h-10 rounded-2xl bg-pink-500/20 border border-pink-400/40 flex items-center justify-center text-pink-400 group-hover:scale-110 transition-transform">
            <MessageCircle className="w-5 h-5" />
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-pink-400 transition-colors" />
        </div>
        <div>
          <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-pink-300 transition-colors">
            Agri Direct Chat
          </h4>
          <p className="text-[10px] text-slate-400 mt-0.5">DMs, voice & telemetry</p>
        </div>
      </button>

      {/* 5. Smart Irrigation */}
      <button
        onClick={onOpenIrrigation}
        className="group relative p-4 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-cyan-950/70 border border-cyan-500/30 hover:border-cyan-400 shadow-xl hover:shadow-cyan-500/20 text-left transition-all duration-300 transform hover:-translate-y-1.5 cursor-pointer flex flex-col justify-between h-36"
      >
        <div className="flex items-center justify-between w-full">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
            <Droplets className="w-5 h-5" />
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
        </div>
        <div>
          <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
            Smart Irrigation
          </h4>
          <p className="text-[10px] text-slate-400 mt-0.5">ET₀ moisture schedules</p>
        </div>
      </button>

      {/* 6. Emergency SOS Trigger */}
      <button
        onClick={onTriggerEmergency}
        className="group relative p-4 rounded-3xl bg-gradient-to-br from-red-950 via-slate-900 to-rose-950 border border-red-500/50 hover:border-red-400 shadow-xl hover:shadow-red-600/30 text-left transition-all duration-300 transform hover:-translate-y-1.5 cursor-pointer flex flex-col justify-between h-36 emergency-hazard-glow"
      >
        <div className="flex items-center justify-between w-full">
          <div className="w-10 h-10 rounded-2xl bg-red-600/30 border border-red-400/60 flex items-center justify-center text-red-400 group-hover:scale-110 transition-transform">
            <Siren className="w-5 h-5 animate-pulse" />
          </div>
          <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-red-500 text-white">
            SOS
          </span>
        </div>
        <div>
          <h4 className="text-xs sm:text-sm font-black text-white group-hover:text-red-300 transition-colors">
            🚨 EMERGENCY
          </h4>
          <p className="text-[10px] text-red-300 mt-0.5">Priority triage dispatch</p>
        </div>
      </button>
    </div>
  );
};
