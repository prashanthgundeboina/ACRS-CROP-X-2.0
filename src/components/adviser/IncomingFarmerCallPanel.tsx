import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { PhoneCall, PhoneOff, Video, Sparkles, CheckCircle2, User, Droplets, MapPin, AlertTriangle, ArrowRight, Settings, Building2, Calendar } from 'lucide-react';
import { FarmerAdviserCallSession, EmergencyIncident } from '../../types';
import { farmerAdviserService } from '../../services/farmerAdviserService';
import { AdviserLiveCallWorkstation } from './AdviserLiveCallWorkstation';
import { AdviserLocationSettingsModal } from './AdviserLocationSettingsModal';
import { AdviserEmergencyBanner } from './AdviserEmergencyBanner';
import { IncomingCallNotificationCard } from './IncomingCallNotificationCard';

interface IncomingFarmerCallPanelProps {
  adviserId?: string;
  adviserName?: string;
  adviserPhone?: string;
  adviserSpecialty?: string;
  adviserDistrict?: string;
  adviserState?: string;
  onAcceptCall?: (session: FarmerAdviserCallSession) => void;
}

export const IncomingFarmerCallPanel: React.FC<IncomingFarmerCallPanelProps> = ({
  adviserId = 'adv-expert-01',
  adviserName = 'Senior Agronomist',
  adviserPhone = '+919876543210',
  onAcceptCall
}) => {
  const [calls, setCalls] = useState<FarmerAdviserCallSession[]>([]);
  const [activeCallSession, setActiveCallSession] = useState<FarmerAdviserCallSession | null>(null);
  const [showLocationSettings, setShowLocationSettings] = useState(false);

  // Poll for incoming calls
  useEffect(() => {
    const fetchCalls = async () => {
      const allCalls = await farmerAdviserService.getAdviserCalls();
      setCalls(allCalls.filter((c) => c.status === 'REQUESTED' || c.status === 'ACCEPTED'));
    };

    fetchCalls();
    const interval = setInterval(fetchCalls, 2000);
    return () => clearInterval(interval);
  }, []);

  const handleAccept = async (callId: string) => {
    const session = await farmerAdviserService.acceptCall(callId);
    if (session) {
      setActiveCallSession(session);
    }
  };

  const handleDecline = async (callId: string) => {
    await farmerAdviserService.declineCall(callId);
    setCalls((prev) => prev.filter((c) => c.callId !== callId));
  };

  const pendingCalls = calls.filter((c) => c.status === 'REQUESTED');

  const handleEmergencyCall = async (incident: EmergencyIncident) => {
    // Automatically prepare call session for this emergency incident
    const session = await farmerAdviserService.requestAdviserCall({
      farmerId: incident.farmerId,
      farmerName: incident.farmerName,
      farmerAvatar: incident.farmerAvatar,
      farmName: incident.farmName,
      farmZone: incident.farmZone,
      crop: incident.crop,
      soilMoisture: incident.soilMoisture,
      weather: incident.weather,
      croperxObservation: `🚨 EMERGENCY: ${incident.description}`
    });
    if (session) {
      const accepted = await farmerAdviserService.acceptCall(session.callId);
      if (accepted) {
        setActiveCallSession(accepted);
      }
    }
  };

  return (
    <>
      {/* Phase 39: Real-Time Agronomic Emergency Broadcast Banner */}
      <AdviserEmergencyBanner
        adviserId={adviserId}
        adviserName={adviserName}
        onInitiateCallWithFarmer={handleEmergencyCall}
      />

      {/* Active Calls floating notification bar if pending calls exist */}
      <div className="mb-6">
        <div className="bg-gradient-to-r from-blue-900/90 via-indigo-900/90 to-slate-900 border-2 border-blue-500/40 rounded-3xl p-5 shadow-xl text-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/30 border border-blue-400/50 flex items-center justify-center text-2xl shadow-inner">
                📹
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <h4 className="text-base font-bold tracking-tight">
                    Farmer Video Collaboration Center
                  </h4>
                </div>
                <p className="text-xs text-blue-200 mt-0.5">
                  {pendingCalls.length > 0
                    ? `${pendingCalls.length} live farmer call request(s) waiting for agronomist assistance`
                    : 'System standby — Ready to receive incoming farmer video consultations'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap self-start sm:self-center">
              <button
                id="btn-adviser-location-settings"
                onClick={() => setShowLocationSettings(true)}
                className="px-3 py-1.5 rounded-xl bg-blue-800/80 hover:bg-blue-700 text-xs font-semibold text-white border border-blue-400/40 flex items-center gap-1.5 transition-all shadow-sm"
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>Consultation Center & Meetings</span>
              </button>

              {pendingCalls.length > 0 && (
                <span className="px-3 py-1 rounded-full bg-rose-500 text-white font-bold text-xs animate-bounce">
                  {pendingCalls.length} Calling Now
                </span>
              )}
            </div>
          </div>

          {/* Pending Call Cards List */}
          {pendingCalls.length > 0 && (
            <div className="mt-4 pt-4 border-t border-blue-800/80 space-y-4">
              {pendingCalls.map((call) => (
                <IncomingCallNotificationCard
                  key={call.callId}
                  call={call}
                  onAccept={() => handleAccept(call.callId)}
                  onDecline={() => handleDecline(call.callId)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Fullscreen Live Adviser Workstation */}
      {activeCallSession && (
        <AdviserLiveCallWorkstation
          callSession={activeCallSession}
          onClose={() => setActiveCallSession(null)}
        />
      )}

      {/* Adviser Location & Meeting Settings Modal */}
      <AdviserLocationSettingsModal
        isOpen={showLocationSettings}
        onClose={() => setShowLocationSettings(false)}
        adviserPhone={adviserPhone}
        adviserName={adviserName}
      />
    </>
  );
};
