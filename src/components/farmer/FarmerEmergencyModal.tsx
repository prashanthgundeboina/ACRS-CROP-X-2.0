import React, { useState, useEffect } from 'react';
import { AlertTriangle, Siren, MapPin, Radio, ShieldAlert, X, CheckCircle2, PhoneCall, RefreshCw } from 'lucide-react';
import { presenceService } from '../../services/presenceService';
import { EmergencyIncident } from '../../types';

interface FarmerEmergencyModalProps {
  farmerId: string;
  farmerName: string;
  farmerPhone: string;
  farmerAvatar?: string;
  farmName: string;
  farmZone: string;
  crop: string;
  soilMoisture: string;
  weather: string;
  isOpen: boolean;
  onClose: () => void;
  onEmergencyTriggered: (incident: EmergencyIncident) => void;
}

const EMERGENCY_PRESETS = [
  { id: 'pest', label: 'Severe Pest Infestation', desc: 'Sudden swarm / locust / stem borer attack threatening entire crop area.' },
  { id: 'disease', label: 'Rapid Crop Blight / Wilting', desc: 'Widespread leaf necrosis / yellowing / fungal collapse across field.' },
  { id: 'irrigation', label: 'Irrigation & Pump Grid Failure', desc: 'Critical water shortage under extreme heat / solar pump breakdown.' },
  { id: 'weather', label: 'Hail / Frost / Storm Damage', desc: 'Emergency field triage needed after extreme localized weather event.' },
  { id: 'chemical', label: 'Fertilizer / Herbicide Burn', desc: 'Immediate chemical neutralization guidance required.' },
];

export const FarmerEmergencyModal: React.FC<FarmerEmergencyModalProps> = ({
  farmerId,
  farmerName,
  farmerPhone,
  farmerAvatar,
  farmName,
  farmZone,
  crop,
  soilMoisture,
  weather,
  isOpen,
  onClose,
  onEmergencyTriggered
}) => {
  const [selectedReason, setSelectedReason] = useState<string>(EMERGENCY_PRESETS[0].label);
  const [customNotes, setCustomNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [incident, setIncident] = useState<EmergencyIncident | null>(null);
  const [gpsLocation, setGpsLocation] = useState<{ latitude: number; longitude: number; accuracyMeters: number } | null>(null);
  const [isLocating, setIsLocating] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setIncident(null);
      setIsSubmitting(false);
      // Fetch fresh location
      setIsLocating(true);
      presenceService.getCurrentLocation()
        .then((loc) => setGpsLocation(loc))
        .catch(() => setGpsLocation({ latitude: 30.9010, longitude: 75.8573, accuracyMeters: 15 }))
        .finally(() => setIsLocating(false));
    }
  }, [isOpen]);

  const handleTriggerEmergency = async () => {
    setIsSubmitting(true);
    const description = `${selectedReason}${customNotes ? ` — ${customNotes}` : ''}`;

    const res = await presenceService.triggerEmergency({
      farmerId,
      farmerName,
      farmerPhone,
      farmerAvatar,
      farmName,
      farmZone,
      crop,
      soilMoisture,
      weather,
      description,
      latitude: gpsLocation?.latitude || 30.9010,
      longitude: gpsLocation?.longitude || 75.8573,
      accuracyMeters: gpsLocation?.accuracyMeters || 15
    });

    setIsSubmitting(false);
    if (res.success && res.incident) {
      setIncident(res.incident);
      onEmergencyTriggered(res.incident);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border-2 border-red-500/80 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl shadow-red-950/50">
        
        {/* Urgent Header */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-red-950 via-slate-900 to-red-950 border-b border-red-500/40">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-600/30 text-red-400 border border-red-500/50 animate-pulse">
              <Siren className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-black text-white uppercase tracking-wider">Agronomic Emergency Network</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-500 text-white uppercase animate-ping">SOS</span>
              </div>
              <p className="text-xs text-red-200/90 font-medium">Broadcasts high-priority alert to nearest available agronomists</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          {!incident ? (
            <>
              {/* Telemetry Snapshot Preview */}
              <div className="grid grid-cols-2 gap-2.5 p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] block font-semibold uppercase">Target Crop & Field</span>
                  <span className="font-bold text-white truncate block">{crop} ({farmName})</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block font-semibold uppercase">Zone & Moisture</span>
                  <span className="font-bold text-emerald-400 truncate block">{farmZone} • {soilMoisture}</span>
                </div>
                <div className="col-span-2 flex items-center justify-between pt-1 border-t border-slate-800/80 text-[11px]">
                  <span className="text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-red-400" />
                    GPS Telemetry:
                  </span>
                  <span className="font-mono text-slate-200">
                    {isLocating ? (
                      <span className="text-slate-400 flex items-center gap-1">
                        <RefreshCw className="w-3 h-3 animate-spin" /> Acquiring High-Accuracy Fix...
                      </span>
                    ) : gpsLocation ? (
                      `${gpsLocation.latitude.toFixed(4)}°N, ${gpsLocation.longitude.toFixed(4)}°E (±${gpsLocation.accuracyMeters}m)`
                    ) : (
                      'Location Ready'
                    )}
                  </span>
                </div>
              </div>

              {/* Problem Classification */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">
                  Select Emergency Type:
                </label>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {EMERGENCY_PRESETS.map((preset) => {
                    const isSelected = selectedReason === preset.label;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setSelectedReason(preset.label)}
                        className={`w-full text-left p-2.5 rounded-xl border transition flex items-start gap-2.5 ${
                          isSelected
                            ? 'bg-red-500/15 border-red-500/80 text-white'
                            : 'bg-slate-800/60 border-slate-700/60 hover:bg-slate-800 text-slate-300'
                        }`}
                      >
                        <div className={`w-4 h-4 mt-0.5 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected ? 'border-red-400 bg-red-500' : 'border-slate-500'
                        }`}>
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <div>
                          <p className="text-xs font-bold">{preset.label}</p>
                          <p className="text-[11px] text-slate-400 leading-tight mt-0.5">{preset.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom field notes */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Additional Details / Observations (Optional):
                </label>
                <textarea
                  value={customNotes}
                  onChange={(e) => setCustomNotes(e.target.value)}
                  placeholder="E.g. Spread accelerated over last 4 hours, started at south boundary..."
                  rows={2}
                  className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleTriggerEmergency}
                  disabled={isSubmitting}
                  className="flex-[2] py-2.5 text-xs font-black text-white bg-red-600 hover:bg-red-500 disabled:opacity-50 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-red-950 transition uppercase tracking-wider"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Broadcasting Emergency...
                    </>
                  ) : (
                    <>
                      <Siren className="w-4 h-4 animate-bounce" />
                      Broadcast SOS to Advisers
                    </>
                  )}
                </button>
              </div>
            </>
          ) : (
            /* Emergency Triggered Live Monitor */
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-red-500/20 text-red-400 border-2 border-red-500 flex items-center justify-center animate-pulse">
                <Radio className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-black text-white text-base uppercase">Emergency Incident Active</h4>
                <p className="text-xs text-red-300 mt-1 font-mono">Incident ID: #{incident.id}</p>
                <p className="text-xs text-slate-300 mt-2">
                  Emergency broadcast dispatched to certified agricultural advisers within your agronomic zone. An agronomist will initiate a high-priority video consultation shortly.
                </p>
              </div>

              <div className="p-3 bg-slate-950 border border-red-500/30 rounded-xl text-xs space-y-1 text-left">
                <div className="flex justify-between">
                  <span className="text-slate-400">Status:</span>
                  <span className="font-bold text-red-400 uppercase tracking-wide">{incident.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Severity:</span>
                  <span className="font-bold text-amber-400">{incident.severity} Priority</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Problem:</span>
                  <span className="font-bold text-white truncate max-w-[200px]">{incident.description}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition"
              >
                Keep Active & Return to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
