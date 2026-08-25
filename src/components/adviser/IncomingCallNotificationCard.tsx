import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  PhoneCall,
  PhoneOff,
  Video,
  MapPin,
  Droplets,
  CloudSun,
  ShieldCheck,
  AlertTriangle,
  Siren,
  Sparkles,
  Volume2,
  VolumeX,
  Compass,
  Clock
} from 'lucide-react';
import { FarmerAdviserCallSession } from '../../types';
import { LivePresencePulseBadge } from '../common/LivePresencePulseBadge';

interface IncomingCallNotificationCardProps {
  call: FarmerAdviserCallSession;
  adviserLatitude?: number;
  adviserLongitude?: number;
  onAccept: (call: FarmerAdviserCallSession) => void;
  onDecline: (callId: string) => void;
}

export const IncomingCallNotificationCard: React.FC<IncomingCallNotificationCardProps> = ({
  call,
  adviserLatitude = 30.9010,
  adviserLongitude = 75.8573,
  onAccept,
  onDecline,
}) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isDeclining, setIsDeclining] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const ringIntervalRef = useRef<any>(null);

  const isEmergency = call.croperxObservation?.includes('EMERGENCY') || (call as any).priority === 'Emergency';

  // Compute estimated Haversine distance if farmer coordinates exist, or estimate regional distance
  const farmerLat = (call as any).latitude ?? 30.9010;
  const farmerLon = (call as any).longitude ?? 75.8573;

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const distanceKm = calculateDistance(adviserLatitude, adviserLongitude, farmerLat, farmerLon);
  const distanceText = distanceKm < 1 ? `${Math.round(distanceKm * 1000)}m away` : `${distanceKm.toFixed(1)} km away`;

  // Synthesize phone ringing tone
  useEffect(() => {
    if (isMuted) return;

    const playChirp = () => {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) return;
        if (!audioCtxRef.current) {
          audioCtxRef.current = new AudioCtx();
        }
        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') {
          ctx.resume();
        }

        const now = ctx.currentTime;
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        // Dual Tone Multi-Frequency (US ring cadence or agro alert)
        osc1.frequency.setValueAtTime(isEmergency ? 880 : 440, now);
        osc2.frequency.setValueAtTime(isEmergency ? 960 : 480, now);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 1.2);
        osc2.stop(now + 1.2);
      } catch (err) {
        // audio policy fallback
      }
    };

    playChirp();
    ringIntervalRef.current = setInterval(playChirp, 3000);

    return () => {
      if (ringIntervalRef.current) {
        clearInterval(ringIntervalRef.current);
        ringIntervalRef.current = null;
      }
      if (audioCtxRef.current) {
        const ctx = audioCtxRef.current;
        audioCtxRef.current = null;
        try {
          if (ctx.state !== 'closed') {
            ctx.close().catch(() => {});
          }
        } catch (e) {
          // ignore
        }
      }
    };
  }, [isMuted, isEmergency]);

  const handleAcceptClick = async () => {
    setIsAccepting(true);
    if (ringIntervalRef.current) {
      clearInterval(ringIntervalRef.current);
      ringIntervalRef.current = null;
    }
    if (audioCtxRef.current) {
      const ctx = audioCtxRef.current;
      audioCtxRef.current = null;
      try {
        if (ctx.state !== 'closed') {
          ctx.close().catch(() => {});
        }
      } catch (e) {}
    }
    try {
      await onAccept(call);
    } finally {
      setIsAccepting(false);
    }
  };

  const handleDeclineClick = async () => {
    setIsDeclining(true);
    if (ringIntervalRef.current) {
      clearInterval(ringIntervalRef.current);
      ringIntervalRef.current = null;
    }
    if (audioCtxRef.current) {
      const ctx = audioCtxRef.current;
      audioCtxRef.current = null;
      try {
        if (ctx.state !== 'closed') {
          ctx.close().catch(() => {});
        }
      } catch (e) {}
    }
    try {
      await onDecline(call.callId);
    } finally {
      setIsDeclining(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92, y: -20 }}
      className={`relative overflow-hidden rounded-3xl border-2 shadow-2xl p-5 sm:p-6 transition-all ${
        isEmergency
          ? 'bg-gradient-to-br from-rose-950/95 via-red-900/90 to-slate-950 border-rose-500 shadow-rose-500/30'
          : 'bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 border-indigo-500/60 shadow-indigo-500/20'
      } text-white`}
    >
      {/* Top Animated Hazard/Glow Bar */}
      <div
        className={`absolute top-0 left-0 right-0 h-1.5 ${
          isEmergency
            ? 'bg-gradient-to-r from-rose-500 via-amber-400 to-rose-600 animate-pulse'
            : 'bg-gradient-to-r from-indigo-500 via-emerald-400 to-blue-500 animate-pulse'
        }`}
      />

      {/* Header Row */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          {isEmergency ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-black uppercase tracking-wider animate-pulse">
              <Siren className="w-3.5 h-3.5 text-rose-400 animate-spin" />
              Agronomic Emergency SOS
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-xs font-bold uppercase tracking-wider">
              <PhoneCall className="w-3.5 h-3.5 text-indigo-400 animate-bounce" />
              Incoming Video Consultation
            </span>
          )}

          <LivePresencePulseBadge status={isEmergency ? 'emergency' : 'online'} size="sm" showLabel labelText="Caller Live" />
        </div>

        {/* Audio Mute Button */}
        <button
          onClick={() => setIsMuted(!isMuted)}
          title={isMuted ? 'Unmute Ringtone' : 'Mute Ringtone'}
          className="p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-xs flex items-center gap-1"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
        </button>
      </div>

      {/* Main Farmer Profile Card Content */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
        {/* Farmer Avatar & Core Info */}
        <div className="md:col-span-5 flex items-center gap-4">
          <div className="relative shrink-0">
            <img
              src={
                call.farmerAvatar ||
                'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'
              }
              alt={call.farmerName}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-white/20 shadow-lg"
            />
            <div className="absolute -bottom-1 -right-1 p-1 bg-slate-900 rounded-full">
              <LivePresencePulseBadge status={isEmergency ? 'emergency' : 'online'} size="md" />
            </div>
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="text-lg sm:text-xl font-black text-white truncate">{call.farmerName}</h3>
              <span title="Verified Farmer Account">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 font-medium truncate">{call.farmName}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-semibold bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-500/30">
                <Compass className="w-3 h-3" />
                {distanceText}
              </span>
              <span className="text-[11px] text-slate-400 truncate">{call.farmZone}</span>
            </div>
          </div>
        </div>

        {/* Telemetry Snapshot Pill Grid */}
        <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-950/50 p-3 rounded-2xl border border-white/10">
          <div className="p-2 rounded-xl bg-slate-900/80 border border-white/5">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Cultivated Crop</span>
            <span className="text-xs font-bold text-emerald-300 truncate block mt-0.5">{call.crop}</span>
          </div>

          <div className="p-2 rounded-xl bg-slate-900/80 border border-white/5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-400">Soil Moisture</span>
              <Droplets className="w-3 h-3 text-cyan-400" />
            </div>
            <span className="text-xs font-bold text-cyan-300 truncate block mt-0.5">{call.soilMoisture}</span>
          </div>

          <div className="p-2 rounded-xl bg-slate-900/80 border border-white/5 col-span-2 sm:col-span-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-bold text-slate-400">Weather</span>
              <CloudSun className="w-3 h-3 text-amber-400" />
            </div>
            <span className="text-xs font-bold text-amber-300 truncate block mt-0.5">{call.weather}</span>
          </div>

          {/* Diagnostic Note */}
          <div className="col-span-2 sm:col-span-3 p-2 rounded-xl bg-blue-950/40 border border-blue-500/20 text-xs text-blue-200">
            <span className="font-semibold text-blue-300 mr-1">AI Observation:</span>
            {call.croperxObservation || 'Farmer requested real-time crop canopy visual inspection.'}
          </div>
        </div>
      </div>

      {/* Action Buttons: Accept & Reject with WebRTC Signaling */}
      <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-end gap-3">
        <button
          onClick={handleDeclineClick}
          disabled={isDeclining || isAccepting}
          className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-rose-950/80 text-slate-300 hover:text-rose-200 border border-slate-700 hover:border-rose-600 transition-all text-sm font-semibold flex items-center gap-2 active:scale-95 disabled:opacity-50"
        >
          <PhoneOff className="w-4 h-4 text-rose-400" />
          {isDeclining ? 'Declining...' : 'Decline / Busy'}
        </button>

        <button
          onClick={handleAcceptClick}
          disabled={isAccepting || isDeclining}
          className={`px-7 py-2.5 rounded-xl font-bold text-sm text-white shadow-xl transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50 ${
            isEmergency
              ? 'bg-gradient-to-r from-rose-600 via-red-500 to-rose-700 hover:from-rose-500 hover:to-red-600 border border-rose-400 animate-pulse shadow-rose-500/50'
              : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 border border-emerald-400 shadow-emerald-500/40'
          }`}
        >
          <Video className="w-5 h-5 animate-bounce" />
          {isAccepting ? 'Connecting WebRTC...' : isEmergency ? 'Accept Emergency SOS' : 'Accept & Start Video'}
        </button>
      </div>
    </motion.div>
  );
};
