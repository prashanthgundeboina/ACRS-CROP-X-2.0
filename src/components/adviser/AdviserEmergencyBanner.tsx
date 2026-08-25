import React, { useState, useEffect } from 'react';
import { Siren, PhoneCall, CheckCircle2, MapPin, Volume2, VolumeX, AlertTriangle, ChevronRight, X, ShieldAlert } from 'lucide-react';
import { presenceService } from '../../services/presenceService';
import { EmergencyIncident } from '../../types';

interface AdviserEmergencyBannerProps {
  adviserId: string;
  adviserName: string;
  adviserLat?: number;
  adviserLon?: number;
  onInitiateCallWithFarmer?: (incident: EmergencyIncident) => void;
}

export const AdviserEmergencyBanner: React.FC<AdviserEmergencyBannerProps> = ({
  adviserId,
  adviserName,
  adviserLat = 30.9100,
  adviserLon = 75.8450,
  onInitiateCallWithFarmer
}) => {
  const [activeEmergencies, setActiveEmergencies] = useState<EmergencyIncident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<EmergencyIncident | null>(null);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [isResolving, setIsResolving] = useState<boolean>(false);
  const [resolutionNotes, setResolutionNotes] = useState<string>('');

  useEffect(() => {
    // Initial fetch
    presenceService.fetchActiveEmergencies().then((list) => {
      setActiveEmergencies(list.filter(i => i.status !== 'Resolved'));
    });

    const unsub = presenceService.onEmergencyChange((list) => {
      const pending = list.filter(i => i.status !== 'Resolved');
      setActiveEmergencies(pending);
      if (pending.length > 0 && !isAudioMuted) {
        presenceService.playEmergencySiren(2);
      }
    });

    return () => {
      unsub();
    };
  }, [isAudioMuted]);

  if (activeEmergencies.length === 0) return null;

  const currentIncident = activeEmergencies[0];

  // Calculate distance
  const distanceKm = presenceService.calculateDistanceKm(
    adviserLat,
    adviserLon,
    currentIncident.latitude,
    currentIncident.longitude
  );
  const distanceDisplay = distanceKm < 1
    ? `${Math.round(distanceKm * 1000)}m away`
    : `${distanceKm.toFixed(1)} km away`;

  const handleAcknowledge = async () => {
    await presenceService.acknowledgeEmergency(currentIncident.id, adviserId, adviserName);
    if (onInitiateCallWithFarmer) {
      onInitiateCallWithFarmer(currentIncident);
    }
  };

  const handleResolve = async () => {
    await presenceService.resolveEmergency(currentIncident.id, adviserName, resolutionNotes || 'Emergency triaged and resolved.');
    setIsResolving(false);
    setResolutionNotes('');
  };

  return (
    <div className="w-full bg-gradient-to-r from-red-950 via-slate-900 to-red-950 border-2 border-red-500/80 rounded-2xl p-4 shadow-2xl shadow-red-950/60 animate-in slide-in-from-top-2 duration-200 mb-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        
        {/* Left: Emergency Alert Details */}
        <div className="flex items-start gap-3.5">
          <div className="p-3 rounded-xl bg-red-600/30 border border-red-500/60 text-red-400 animate-pulse shrink-0">
            <Siren className="w-6 h-6" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-500 text-white uppercase tracking-wider animate-bounce">
                CRITICAL SOS ALERT
              </span>
              <span className="text-xs font-mono text-red-300">
                #{currentIncident.id.slice(-6)}
              </span>
              <span className="text-xs font-bold text-white">
                {currentIncident.farmerName} ({currentIncident.farmName})
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-sky-500/20 text-sky-300 border border-sky-500/30 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-sky-400" />
                {distanceDisplay}
              </span>
            </div>

            <p className="text-sm font-semibold text-red-100 mt-1 leading-snug">
              {currentIncident.description}
            </p>

            <div className="flex items-center gap-4 text-xs text-slate-300 mt-1.5 flex-wrap">
              <span>🌾 <strong>Crop:</strong> {currentIncident.crop}</span>
              <span>💧 <strong>Moisture:</strong> {currentIncident.soilMoisture}</span>
              <span>🌤️ <strong>Weather:</strong> {currentIncident.weather}</span>
              <span>⏱️ <strong>Triggered:</strong> {new Date(currentIncident.triggeredAt).toLocaleTimeString()}</span>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={() => setIsAudioMuted(!isAudioMuted)}
            className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-xl border border-slate-700 transition"
            title={isAudioMuted ? 'Unmute Emergency Alarm' : 'Mute Emergency Alarm'}
          >
            {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-red-400 animate-pulse" />}
          </button>

          {currentIncident.status === 'Acknowledged' ? (
            <div className="flex items-center gap-2">
              <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Acknowledged by {currentIncident.assignedAdviserName || 'You'}
              </span>

              <button
                type="button"
                onClick={() => setIsResolving(true)}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-600 transition"
              >
                Mark Resolved
              </button>
            </div>
          ) : (
            <button
              id="btn-adviser-accept-emergency"
              type="button"
              onClick={handleAcknowledge}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-black rounded-xl uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-red-950/80 transition hover:scale-105"
            >
              <PhoneCall className="w-4 h-4 animate-bounce" />
              Acknowledge & Connect Call
            </button>
          )}
        </div>

      </div>

      {/* Resolution Notes Modal */}
      {isResolving && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              Resolve Emergency Incident #{currentIncident.id.slice(-6)}
            </h4>
            <p className="text-xs text-slate-300">
              Provide summary prescription or corrective action taken for the farmer audit record.
            </p>
            <textarea
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="E.g. Prescribed immediate neem oil spray at 3ml/L and reduced irrigation volume by 40%..."
              rows={3}
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <div className="flex gap-2.5 justify-end">
              <button
                type="button"
                onClick={() => setIsResolving(false)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResolve}
                className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition"
              >
                Confirm Resolution
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
