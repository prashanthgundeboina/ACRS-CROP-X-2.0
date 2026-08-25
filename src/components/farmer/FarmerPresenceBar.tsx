import React, { useState, useEffect } from 'react';
import {
  Radio, MapPin, ShieldCheck, Siren, CheckCircle2,
  Power, RefreshCw, AlertTriangle, UserCheck, Eye, EyeOff
} from 'lucide-react';
import { presenceService } from '../../services/presenceService';
import { UserAccount, EmergencyIncident } from '../../types';
import { FarmerEmergencyModal } from './FarmerEmergencyModal';
import { LivenessVerificationModal } from './LivenessVerificationModal';

interface FarmerPresenceBarProps {
  currentUser: UserAccount;
  cropName?: string;
  farmZone?: string;
  soilMoisture?: string;
  weatherCondition?: string;
  onEmergencyTriggered?: (incident: EmergencyIncident) => void;
}

export const FarmerPresenceBar: React.FC<FarmerPresenceBarProps> = ({
  currentUser,
  cropName = 'Wheat (Triticum aestivum)',
  farmZone = 'North Field A',
  soilMoisture = '28% (Optimal)',
  weatherCondition = '31°C, Clear Sky',
  onEmergencyTriggered
}) => {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isSharingLocation, setIsSharingLocation] = useState<boolean>(true);
  const [isLivenessVerified, setIsLivenessVerified] = useState<boolean>(false);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | null>(null);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState<boolean>(false);
  const [isLivenessModalOpen, setIsLivenessModalOpen] = useState<boolean>(false);
  const [activeEmergency, setActiveEmergency] = useState<EmergencyIncident | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    // Auto-init online state on mount
    handleGoOnline();

    const unsubEmergencies = presenceService.onEmergencyChange((incidents) => {
      const myIncident = incidents.find(
        (i) => i.farmerId === currentUser.id && i.status !== 'Resolved'
      );
      setActiveEmergency(myIncident || null);
    });

    return () => {
      unsubEmergencies();
    };
  }, [currentUser.id]);

  const handleGoOnline = async () => {
    setIsLoading(true);
    const res = await presenceService.goOnline({
      userId: currentUser.id,
      phoneNumber: currentUser.phoneNumber,
      name: currentUser.farmerName || currentUser.fullName || 'Farmer',
      role: currentUser.role || 'farmer',
      avatar: currentUser.profileImage,
      farmName: currentUser.farmLocation || 'Family Farm',
      farmZone,
      crop: cropName,
      district: currentUser.district,
      stateName: currentUser.state
    });

    setIsOnline(true);
    if (res.coords?.accuracyMeters) {
      setGpsAccuracy(res.coords.accuracyMeters);
    }
    setIsLoading(false);
  };

  const handleToggleOnline = async () => {
    if (isOnline) {
      await presenceService.goOffline();
      setIsOnline(false);
    } else {
      await handleGoOnline();
    }
  };

  const handleToggleLocation = () => {
    const nextState = !isSharingLocation;
    setIsSharingLocation(nextState);
    presenceService.setLocationSharing(nextState);
  };

  const handleEmergencyTriggered = (inc: EmergencyIncident) => {
    setActiveEmergency(inc);
    if (onEmergencyTriggered) {
      onEmergencyTriggered(inc);
    }
  };

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 shadow-xl backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-3">
        
        {/* Left: Presence Status & Master Toggle */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <button
              id="btn-farmer-presence-toggle"
              type="button"
              onClick={handleToggleOnline}
              disabled={isLoading}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-2 border transition ${
                isOnline
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                  : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
              }`}
            >
              {isLoading ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Power className={`w-3.5 h-3.5 ${isOnline ? 'text-emerald-400' : 'text-slate-500'}`} />
              )}
              {isOnline ? 'Online for Advisers' : 'Offline'}
            </button>

            {isOnline && (
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
            )}
          </div>

          {/* Location Sharing Indicator */}
          {isOnline && (
            <button
              type="button"
              onClick={handleToggleLocation}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border flex items-center gap-1.5 transition ${
                isSharingLocation
                  ? 'bg-sky-500/15 text-sky-300 border-sky-500/30 hover:bg-sky-500/25'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
              title={isSharingLocation ? 'GPS location shared with certified advisers' : 'Location hidden'}
            >
              <MapPin className="w-3 h-3 text-sky-400" />
              {isSharingLocation ? (
                <span>GPS Live {gpsAccuracy ? `(±${gpsAccuracy}m)` : ''}</span>
              ) : (
                <span>GPS Paused</span>
              )}
            </button>
          )}

          {/* Liveness Verification Badge / Launcher */}
          {isOnline && (
            <button
              type="button"
              onClick={() => setIsLivenessModalOpen(true)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold border flex items-center gap-1.5 transition ${
                isLivenessVerified
                  ? 'bg-teal-500/15 text-teal-300 border-teal-500/30'
                  : 'bg-slate-800 text-amber-300 border-amber-500/30 hover:bg-amber-500/10'
              }`}
            >
              {isLivenessVerified ? (
                <>
                  <ShieldCheck className="w-3 h-3 text-teal-400" />
                  <span>Presence Verified</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-3 h-3 text-amber-400" />
                  <span>Verify Liveness</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Right: Emergency Mode Button / Active Emergency Banner */}
        <div className="flex items-center gap-2.5">
          {activeEmergency ? (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-950/80 border border-red-500/50 rounded-xl text-red-300 text-xs font-bold animate-pulse">
              <Siren className="w-4 h-4 text-red-400" />
              <span>🚨 Active SOS Incident #{activeEmergency.id.slice(-6)}</span>
              <button
                type="button"
                onClick={() => setIsEmergencyModalOpen(true)}
                className="underline text-white ml-1 text-[11px]"
              >
                View
              </button>
            </div>
          ) : (
            <button
              id="btn-farmer-emergency-sos"
              type="button"
              onClick={() => setIsEmergencyModalOpen(true)}
              className="px-4 py-1.5 rounded-xl font-black text-xs bg-red-600 hover:bg-red-500 text-white uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-red-950/80 border border-red-400/50 hover:scale-[1.02] active:scale-95 transition"
            >
              <Siren className="w-4 h-4 animate-bounce" />
              <span>🚨 Emergency SOS</span>
            </button>
          )}
        </div>

      </div>

      {/* Modals */}
      <FarmerEmergencyModal
        farmerId={currentUser.id}
        farmerName={currentUser.farmerName || currentUser.fullName || 'Farmer'}
        farmerPhone={currentUser.phoneNumber}
        farmerAvatar={currentUser.profileImage}
        farmName={currentUser.farmLocation || 'Family Farm'}
        farmZone={farmZone}
        crop={cropName}
        soilMoisture={soilMoisture}
        weather={weatherCondition}
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
        onEmergencyTriggered={handleEmergencyTriggered}
      />

      <LivenessVerificationModal
        userId={currentUser.id}
        userName={currentUser.farmerName || currentUser.fullName || 'Farmer'}
        isOpen={isLivenessModalOpen}
        onClose={() => setIsLivenessModalOpen(false)}
        onVerified={() => setIsLivenessVerified(true)}
      />
    </div>
  );
};
