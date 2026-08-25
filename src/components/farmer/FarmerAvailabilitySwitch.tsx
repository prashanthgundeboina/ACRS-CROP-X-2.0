import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  MapPin,
  Radio,
  ShieldCheck,
  Compass,
  AlertCircle,
  Navigation,
  Loader2,
  CheckCircle2,
  XCircle,
  Wifi,
  WifiOff,
  Crosshair
} from 'lucide-react';
import { presenceService } from '../../services/presenceService';
import { gpsTrackingService, GpsCoordinates } from '../../services/gpsTrackingService';
import { LivePresencePulseBadge } from '../common/LivePresencePulseBadge';
import { UserRole } from '../../types';

interface FarmerAvailabilitySwitchProps {
  userId: string;
  phoneNumber: string;
  farmerName: string;
  farmName?: string;
  farmZone?: string;
  crop?: string;
  district?: string;
  stateName?: string;
  onStatusChange?: (isOnline: boolean, coords?: GpsCoordinates) => void;
  className?: string;
}

export const FarmerAvailabilitySwitch: React.FC<FarmerAvailabilitySwitchProps> = ({
  userId,
  phoneNumber,
  farmerName,
  farmName = 'Family Farm',
  farmZone = 'North Field Zone A',
  crop = 'Wheat / Rice',
  district = 'Ludhiana',
  stateName = 'Punjab',
  onStatusChange,
  className = '',
}) => {
  const [isOnline, setIsOnline] = useState(presenceService.isUserOnline());
  const [isLoading, setIsLoading] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [currentCoords, setCurrentCoords] = useState<GpsCoordinates | null>(gpsTrackingService.getLastCoordinates());
  const [lastHeartbeatTime, setLastHeartbeatTime] = useState<number>(Date.now());

  // Listen to live GPS location updates
  useEffect(() => {
    const unsub = gpsTrackingService.addListener((coords) => {
      setCurrentCoords(coords);
      setLastHeartbeatTime(Date.now());
    });
    return unsub;
  }, []);

  const handleToggle = async () => {
    if (isLoading) return;

    if (isOnline) {
      // Toggle to Offline
      setIsLoading(true);
      try {
        await presenceService.goOffline();
        setIsOnline(false);
        onStatusChange?.(false);
      } catch (err) {
        console.error('Failed to go offline:', err);
      } finally {
        setIsLoading(false);
      }
    } else {
      // Toggle to Online: Check Geolocation Permission first
      setIsLoading(true);
      setPermissionError(null);

      const permState = await gpsTrackingService.checkPermission();
      if (permState === 'denied') {
        setShowPermissionModal(true);
        setPermissionError('Location access is currently blocked in your browser settings. Please enable location permissions for high-precision field tracking.');
        setIsLoading(false);
        return;
      }

      if (permState === 'prompt') {
        setShowPermissionModal(true);
        setIsLoading(false);
        return;
      }

      // If granted or directly proceeding
      await activatePresenceAndGps();
    }
  };

  const activatePresenceAndGps = async () => {
    setIsLoading(true);
    setPermissionError(null);
    try {
      // 1. Acquire location fix
      let coords: GpsCoordinates | null = null;
      try {
        coords = await gpsTrackingService.getSingleLocationFix();
        setCurrentCoords(coords);
      } catch (geoErr: any) {
        console.warn('Geolocation acquisition prompt failed or timed out:', geoErr);
        // Fallback default coordinates if user allows online presence without instant GPS lock
        coords = {
          latitude: 30.9010,
          longitude: 75.8573,
          accuracyMeters: 25,
          timestamp: Date.now()
        };
      }

      // 2. Go online in presence service
      const res = await presenceService.goOnline({
        userId,
        phoneNumber,
        name: farmerName,
        role: 'farmer' as UserRole,
        farmName,
        farmZone,
        crop,
        district,
        stateName
      });

      if (res.success) {
        setIsOnline(true);
        setShowPermissionModal(false);
        onStatusChange?.(true, coords || undefined);
      }
    } catch (err: any) {
      setPermissionError(err.message || 'Failed to activate presence.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div
        className={`relative overflow-hidden rounded-2xl border transition-all duration-300 ${
          isOnline
            ? 'bg-emerald-950/40 border-emerald-500/40 shadow-lg shadow-emerald-900/20'
            : 'bg-slate-900/60 border-slate-700/60'
        } p-3.5 sm:p-4 text-white ${className}`}
      >
        <div className="flex items-center justify-between gap-3">
          {/* Status Details */}
          <div className="flex items-center gap-3 min-w-0">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
                isOnline
                  ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-400'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              {isOnline ? <Wifi className="w-5 h-5 animate-pulse" /> : <WifiOff className="w-5 h-5" />}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold tracking-wider uppercase text-slate-300">
                  Adviser Availability
                </span>
                <LivePresencePulseBadge
                  status={isOnline ? 'online' : 'offline'}
                  size="xs"
                  showLabel
                  labelText={isOnline ? 'Live & Connected' : 'Offline / Standby'}
                />
              </div>

              {isOnline && currentCoords ? (
                <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-emerald-400 font-medium">
                  <Crosshair className="w-3 h-3 animate-spin text-emerald-400 shrink-0" />
                  <span className="truncate">
                    GPS Locked: {currentCoords.latitude.toFixed(4)}°, {currentCoords.longitude.toFixed(4)}° (±{currentCoords.accuracyMeters}m)
                  </span>
                </div>
              ) : (
                <p className="text-[11px] text-slate-400 truncate mt-0.5">
                  Toggle on to broadcast live field presence to agronomy network
                </p>
              )}
            </div>
          </div>

          {/* Interactive Toggle Switch */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleToggle}
              disabled={isLoading}
              className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 ${
                isOnline ? 'bg-emerald-500 shadow-lg shadow-emerald-500/40' : 'bg-slate-700'
              } disabled:opacity-50`}
              aria-label="Toggle presence availability and GPS"
            >
              <span className="sr-only">Toggle presence availability</span>
              <span
                className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out flex items-center justify-center ${
                  isOnline ? 'translate-x-7 text-emerald-600' : 'translate-x-0 text-slate-500'
                }`}
              >
                {isLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-700" />
                ) : isOnline ? (
                  <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
                ) : (
                  <Radio className="w-3 h-3 text-slate-400" />
                )}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Geolocation Permission Request Modal */}
      <AnimatePresence>
        {showPermissionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-slate-900 border-2 border-emerald-500/40 rounded-3xl p-6 sm:p-7 max-w-md w-full text-white shadow-2xl relative"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-400 mb-4">
                <Navigation className="w-6 h-6 animate-bounce" />
              </div>

              <h3 className="text-xl font-bold text-white mb-2">Enable Field GPS Precision</h3>
              <p className="text-sm text-slate-300 leading-relaxed mb-4">
                CroperX uses high-precision GPS coordinates while your availability is turned on to:
              </p>

              <div className="space-y-2.5 mb-6 text-xs text-slate-200 bg-slate-950/60 p-3.5 rounded-2xl border border-white/5">
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Connect you with the nearest certified agricultural advisers in {district}.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Dispatch immediate agronomic emergency aid directly to your field parcel.</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>GPS watcher automatically stops whenever you toggle Availability off.</span>
                </div>
              </div>

              {permissionError && (
                <div className="p-3 mb-4 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{permissionError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowPermissionModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={activatePresenceAndGps}
                  disabled={isLoading}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Acquiring GPS...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 text-emerald-200" />
                      <span>Allow GPS & Go Online</span>
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
