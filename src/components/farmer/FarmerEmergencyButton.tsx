import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Siren,
  AlertTriangle,
  Radio,
  PhoneCall,
  ShieldAlert,
  Loader2,
  X,
  CheckCircle2,
  MapPin,
  Clock,
  Video
} from 'lucide-react';
import { gpsTrackingService } from '../../services/gpsTrackingService';
import { presenceService } from '../../services/presenceService';
import { EmergencyIncident } from '../../types';

interface FarmerEmergencyButtonProps {
  userId: string;
  phoneNumber: string;
  farmerName: string;
  farmName?: string;
  farmZone?: string;
  crop?: string;
  soilMoisture?: string;
  weather?: string;
  onEmergencyTriggered?: (incident: EmergencyIncident) => void;
  className?: string;
}

export const FarmerEmergencyButton: React.FC<FarmerEmergencyButtonProps> = ({
  userId,
  phoneNumber,
  farmerName,
  farmName = 'Family Farm Parcel',
  farmZone = 'Primary Zone',
  crop = 'Wheat / Rice',
  soilMoisture = '26%',
  weather = '31°C, Sunny',
  onEmergencyTriggered,
  className = '',
}) => {
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [isTriggering, setIsTriggering] = useState(false);
  const [activeIncident, setActiveIncident] = useState<EmergencyIncident | null>(null);
  const [emergencyNotes, setEmergencyNotes] = useState('');
  const countdownIntervalRef = useRef<any>(null);

  // Clean countdown on close
  useEffect(() => {
    if (!showConfirmModal) {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      setCountdown(3);
    }
  }, [showConfirmModal]);

  const handleOpenModal = () => {
    setShowConfirmModal(true);
    setCountdown(3);

    // Auto-countdown for rapid dispatch
    countdownIntervalRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownIntervalRef.current);
          executeEmergencyTrigger();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleCancelCountdown = () => {
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    setShowConfirmModal(false);
  };

  const executeEmergencyTrigger = async () => {
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    setIsTriggering(true);

    try {
      // 1. Get latest high precision coordinates
      let lat = 30.9010;
      let lon = 75.8573;
      let accuracy = 15;

      try {
        const coords = await gpsTrackingService.getSingleLocationFix();
        lat = coords.latitude;
        lon = coords.longitude;
        accuracy = coords.accuracyMeters;
      } catch (e) {
        const last = gpsTrackingService.getLastCoordinates();
        if (last) {
          lat = last.latitude;
          lon = last.longitude;
          accuracy = last.accuracyMeters;
        }
      }

      // 2. Dispatch to server emergency trigger
      const res = await fetch('/api/emergency/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmerId: userId,
          farmerName,
          farmerPhone: phoneNumber,
          farmName,
          farmZone,
          crop,
          soilMoisture,
          weather,
          description: emergencyNotes || `🚨 Critical agricultural distress reported in ${farmZone}. Immediate agronomist intervention requested.`,
          latitude: lat,
          longitude: lon,
          accuracyMeters: accuracy
        })
      });

      if (!res.ok) {
        throw new Error('Failed to trigger emergency');
      }

      const data = await res.json();
      const incident: EmergencyIncident = data.incident;
      setActiveIncident(incident);
      onEmergencyTriggered?.(incident);
    } catch (err: any) {
      console.error('Emergency trigger failed:', err);
    } finally {
      setIsTriggering(false);
    }
  };

  return (
    <>
      {/* High-Visibility Emergency Trigger Button */}
      <button
        onClick={handleOpenModal}
        className={`relative group overflow-hidden px-5 sm:px-6 py-3.5 sm:py-4 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-600 text-white font-black uppercase tracking-wider text-xs sm:text-sm border-2 border-red-400 shadow-xl shadow-red-600/40 flex items-center justify-center gap-2.5 active:scale-95 transition-all duration-200 emergency-hazard-glow ${className}`}
        aria-label="Trigger Agricultural Emergency Alert"
      >
        <span className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
        <Siren className="w-5 h-5 text-amber-300 animate-spin" />
        <span className="drop-shadow-md">🚨 EMERGENCY SOS</span>
        <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-red-950/80 border border-red-300/40 text-[10px] text-red-200">
          PRIORITY
        </span>
      </button>

      {/* Confirmation & Rapid Dispatch Countdown Modal */}
      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-gradient-to-b from-red-950 via-slate-900 to-slate-950 border-2 border-red-500 rounded-3xl p-6 sm:p-8 max-w-lg w-full text-white shadow-2xl relative overflow-hidden"
            >
              {/* Animated Danger Stripes */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-yellow-400 via-red-500 to-yellow-400 animate-pulse" />

              {!activeIncident ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-red-600/30 border border-red-400/60 flex items-center justify-center text-red-400">
                        <Siren className="w-7 h-7 animate-spin" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-white">Broadcast Emergency SOS</h3>
                        <p className="text-xs text-red-300 font-medium">Bypasses standard consultation queue</p>
                      </div>
                    </div>

                    <button
                      onClick={handleCancelCountdown}
                      className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <p className="text-sm text-slate-200 mb-4 leading-relaxed">
                    This alerts all active agronomists, regional extension officers, and system administrators with your live GPS location and field telemetry.
                  </p>

                  <div className="bg-slate-950/70 p-3.5 rounded-2xl border border-red-500/30 mb-5 space-y-1.5 text-xs text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Farmer:</span>
                      <span className="font-bold text-white">{farmerName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Field Parcel:</span>
                      <span className="font-semibold text-emerald-300">{farmName} ({farmZone})</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Crop Context:</span>
                      <span className="font-semibold text-white">{crop}</span>
                    </div>
                  </div>

                  {/* Optional Notes */}
                  <div className="mb-5">
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                      Distress Reason / Symptom (Optional)
                    </label>
                    <input
                      type="text"
                      value={emergencyNotes}
                      onChange={(e) => setEmergencyNotes(e.target.value)}
                      placeholder="e.g. Sudden severe crop blight, pipe burst, toxic water inflow..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white focus:outline-none focus:border-red-500"
                    />
                  </div>

                  {/* Rapid Dispatch Actions */}
                  <div className="flex items-center justify-between gap-3 pt-2 border-t border-white/10">
                    <button
                      onClick={handleCancelCountdown}
                      className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
                    >
                      Cancel
                    </button>

                    <button
                      onClick={executeEmergencyTrigger}
                      disabled={isTriggering}
                      className="flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-red-600/50 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                    >
                      {isTriggering ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Broadcasting...</span>
                        </>
                      ) : (
                        <>
                          <Siren className="w-5 h-5 animate-pulse" />
                          <span>Dispatch SOS {countdown > 0 && `(${countdown}s)`}</span>
                        </>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                /* Emergency Active Confirmation & Live Dispatch View */
                <div className="text-center py-4">
                  <div className="w-16 h-16 rounded-full bg-red-600/30 border-2 border-red-500 mx-auto flex items-center justify-center text-red-400 mb-4 animate-pulse">
                    <Radio className="w-8 h-8 animate-ping" />
                  </div>

                  <h3 className="text-2xl font-black text-white mb-1">🚨 Emergency SOS Active</h3>
                  <p className="text-sm text-red-300 font-medium mb-5">
                    Incident #{activeIncident.id} dispatched to all online agronomists
                  </p>

                  <div className="bg-slate-950/80 p-4 rounded-2xl border border-red-500/40 text-left text-xs space-y-2 mb-6">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Status:</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 font-bold border border-red-500/40 animate-pulse">
                        Broadcasting to Advisers
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">GPS Coordinates:</span>
                      <span className="text-emerald-400 font-mono">
                        {activeIncident.latitude.toFixed(4)}°, {activeIncident.longitude.toFixed(4)}°
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Severity:</span>
                      <span className="text-red-400 font-bold uppercase">High-Priority Direct Bypass</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setActiveIncident(null);
                      setShowConfirmModal(false);
                    }}
                    className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider transition-all"
                  >
                    Close & Keep Incident Active in Background
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
