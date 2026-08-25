import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Building2,
  Navigation,
  Crosshair,
  ShieldCheck,
  CheckCircle2,
  X,
  Radio,
  Clock,
  Calendar,
  Phone,
  AlertCircle,
  Loader2,
  Save,
  Eye,
  EyeOff,
  Users,
} from 'lucide-react';
import { AdviserConsultationLocation, AdviserLiveLocation, AdviserLocationType, ConsultationMeetingRequest } from '../../types';
import { locationService } from '../../services/locationService';

interface AdviserLocationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  adviserPhone: string;
  adviserName: string;
}

const LOCATION_TYPES: AdviserLocationType[] = [
  'Agricultural Extension Center',
  'Clinic / Advisory Center',
  'Office',
  'Farm Consultation Point',
  'Organization',
  'Custom Meeting Point',
];

export const AdviserLocationSettingsModal: React.FC<AdviserLocationSettingsModalProps> = ({
  isOpen,
  onClose,
  adviserPhone,
  adviserName,
}) => {
  const [activeTab, setActiveTab] = useState<'location' | 'live' | 'meetings'>('location');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Consultation Location Form State
  const [locType, setLocType] = useState<AdviserLocationType>('Agricultural Extension Center');
  const [centerLabel, setCenterLabel] = useState('');
  const [address, setAddress] = useState('');
  const [locality, setLocality] = useState('');
  const [district, setDistrict] = useState('Ludhiana');
  const [stateName, setStateName] = useState('Punjab');
  const [latitude, setLatitude] = useState('30.9010');
  const [longitude, setLongitude] = useState('75.8573');
  const [meetingRadiusKm, setMeetingRadiusKm] = useState(30);
  const [isVerified, setIsVerified] = useState(true);

  // Live Location Settings
  const [liveLocationEnabled, setLiveLocationEnabled] = useState(false);
  const [liveMode, setLiveMode] = useState<'while_available' | 'during_consultation'>('while_available');

  // Consultation Meetings
  const [meetings, setMeetings] = useState<ConsultationMeetingRequest[]>([]);

  useEffect(() => {
    if (isOpen && adviserPhone) {
      loadProfileAndMeetings();
    }
  }, [isOpen, adviserPhone]);

  const loadProfileAndMeetings = async () => {
    setIsLoading(true);
    try {
      const data = await locationService.getAdviserLocationProfile(adviserPhone);
      if (data && data.consultationLocation) {
        const c = data.consultationLocation;
        setLocType(c.type || 'Agricultural Extension Center');
        setCenterLabel(c.label || '');
        setAddress(c.address || '');
        setLocality(c.locality || '');
        setDistrict(c.district || 'Ludhiana');
        setStateName(c.state || 'Punjab');
        setLatitude(String(c.latitude || 30.901));
        setLongitude(String(c.longitude || 75.8573));
        setMeetingRadiusKm(c.meetingRadiusKm || 30);
        setIsVerified(Boolean(c.isVerified));
      } else {
        setCenterLabel('District Agronomy Extension Center');
        setAddress('PAU Gate 2 Road, Ludhiana');
      }

      if (data && data.liveLocation) {
        setLiveLocationEnabled(Boolean(data.liveLocation.enabled));
        setLiveMode((data.liveLocation.mode as any) || 'while_available');
      }

      const meetingList = await locationService.getConsultationMeetings(adviserPhone, 'adviser');
      setMeetings(meetingList);
    } catch (e) {
      console.warn('Failed to load adviser location data:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUseCurrentGps = async () => {
    setIsSaving(true);
    setErrorMsg(null);
    try {
      const gps = await locationService.getBrowserCoordinates();
      const geo = await locationService.reverseGeocode(gps.latitude, gps.longitude);

      setLatitude(String(gps.latitude.toFixed(5)));
      setLongitude(String(gps.longitude.toFixed(5)));
      if (geo.locality) setLocality(geo.locality);
      if (geo.district) setDistrict(geo.district);
      if (geo.state) setStateName(geo.state);
      if (geo.fullAddress && !address) setAddress(geo.fullAddress);

      setSuccessMsg('Coordinates and district auto-filled from device GPS.');
    } catch (err: any) {
      setErrorMsg('Could not fetch browser GPS coordinates.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg(null);
    setErrorMsg(null);

    const latNum = parseFloat(latitude);
    const lonNum = parseFloat(longitude);

    if (isNaN(latNum) || isNaN(lonNum)) {
      setErrorMsg('Please enter valid numeric latitude and longitude coordinates.');
      setIsSaving(false);
      return;
    }

    try {
      const ok = await locationService.updateAdviserLocation(adviserPhone, {
        type: locType,
        label: centerLabel || `${district} Agronomy Advisory Point`,
        address: address || 'Main Agriculture Center',
        locality,
        district,
        state: stateName,
        country: 'India',
        latitude: latNum,
        longitude: lonNum,
        meetingRadiusKm: Number(meetingRadiusKm) || 30,
        isVerified: true,
        visibility: 'public',
      });

      if (ok) {
        setSuccessMsg('Professional consultation location saved successfully!');
      } else {
        setErrorMsg('Failed to update location. Please verify network connection.');
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Error updating location.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleLiveLocation = async (enabled: boolean) => {
    setLiveLocationEnabled(enabled);
    setIsSaving(true);
    try {
      if (enabled) {
        const coords = await locationService.getBrowserCoordinates().catch(() => ({
          latitude: parseFloat(latitude) || 30.901,
          longitude: parseFloat(longitude) || 75.8573,
          accuracyMeters: 15,
        }));

        await locationService.setAdviserLiveLocation({
          phoneNumber: adviserPhone,
          enabled: true,
          mode: liveMode,
          latitude: coords.latitude,
          longitude: coords.longitude,
          accuracy: coords.accuracyMeters,
        });
        setSuccessMsg('Live location sharing activated during advisory hours.');
      } else {
        await locationService.disableAdviserLiveLocation(adviserPhone);
        setSuccessMsg('Live location sharing disabled.');
      }
    } catch (e: any) {
      setErrorMsg('Failed to update live location status.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleMeetingAction = async (meetingId: string, newStatus: any) => {
    try {
      const ok = await locationService.updateMeetingStatus(meetingId, newStatus);
      if (ok) {
        setMeetings(
          meetings.map((m) => (m.id === meetingId ? { ...m, status: newStatus } : m))
        );
        setSuccessMsg(`Meeting status updated to ${newStatus}`);
      }
    } catch (e) {
      setErrorMsg('Failed to update meeting status.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div
        id="adviser-location-settings-modal"
        className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Adviser Consultation Center & Discovery Settings
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Configure your verified office, clinic, travel coverage and in-person meetings
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 border-b border-slate-200 dark:border-slate-800 flex items-center gap-4 bg-white dark:bg-slate-900">
          <button
            onClick={() => setActiveTab('location')}
            className={`py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'location'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Consultation Center</span>
          </button>

          <button
            onClick={() => setActiveTab('live')}
            className={`py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'live'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Radio className="w-4 h-4" />
            <span>Live Sharing (Opt-in)</span>
          </button>

          <button
            onClick={() => setActiveTab('meetings')}
            className={`py-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'meetings'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Meeting Requests ({meetings.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2 text-emerald-800 dark:text-emerald-300 text-xs">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 flex items-center gap-2 text-red-800 dark:text-red-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* TAB 1: CONSULTATION LOCATION */}
          {activeTab === 'location' && (
            <form onSubmit={handleSaveLocation} className="space-y-5">
              <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="font-bold text-xs text-emerald-950 dark:text-emerald-200">
                      Public Agronomy Center Visibility
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80">
                    This location is shown to nearby farmers for in-person clinic visits and radius calculations. Your private home address is never exposed.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleUseCurrentGps}
                  disabled={isSaving}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 shrink-0"
                >
                  <Crosshair className="w-3.5 h-3.5" />
                  <span>Fetch GPS</span>
                </button>
              </div>

              {/* Location Type & Center Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                    Location Center Type
                  </label>
                  <select
                    value={locType}
                    onChange={(e) => setLocType(e.target.value as any)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  >
                    {LOCATION_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                    Advisory Center / Clinic Name
                  </label>
                  <input
                    type="text"
                    value={centerLabel}
                    onChange={(e) => setCenterLabel(e.target.value)}
                    placeholder="e.g. PAU Krishi Vigyan Kendra & Agronomy Clinic"
                    required
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                  Public Office Address / Street
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Ferozepur Road, Near Gate 2, Punjab Agricultural University"
                  required
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Locality, District & State */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                    Locality / Campus
                  </label>
                  <input
                    type="text"
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                    placeholder="e.g. PAU Campus"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                    District
                  </label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="e.g. Ludhiana"
                    required
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                    State
                  </label>
                  <input
                    type="text"
                    value={stateName}
                    onChange={(e) => setStateName(e.target.value)}
                    placeholder="e.g. Punjab"
                    required
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Coordinates & Meeting Radius */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                    Max Travel Radius (km)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="150"
                    value={meetingRadiusKm}
                    onChange={(e) => setMeetingRadiusKm(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm transition-all flex items-center gap-2"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Save Consultation Center</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: LIVE LOCATION OPT-IN */}
          {activeTab === 'live' && (
            <div className="space-y-6">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Radio className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                        Live Field GPS Broadcast (Opt-In Only)
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Allow nearby farmers to see your live position when conducting field visits
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleLiveLocation(!liveLocationEnabled)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      liveLocationEnabled
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {liveLocationEnabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    <span>{liveLocationEnabled ? 'Broadcasting Active' : 'Disabled (Default)'}</span>
                  </button>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-1.5">
                  <div className="font-semibold text-slate-800 dark:text-slate-200">
                    🔒 Strict Privacy Protections:
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                    <li>Live location is strictly disabled by default.</li>
                    <li>Coordinates are only broadcast during active working hours and expire automatically.</li>
                    <li>You can toggle live sharing off at any second with a single tap.</li>
                  </ul>
                </div>
              </div>

              {liveLocationEnabled && (
                <div className="space-y-3">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                    Broadcast Mode
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      onClick={() => setLiveMode('while_available')}
                      className={`p-3 rounded-xl border text-left text-xs transition-all ${
                        liveMode === 'while_available'
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 font-bold text-emerald-900 dark:text-emerald-200'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600'
                      }`}
                    >
                      <div>While Available for Field Calls</div>
                      <div className="text-[10px] text-slate-400 font-normal">
                        Broadcasts during your daily active advisory shift
                      </div>
                    </button>
                    <button
                      onClick={() => setLiveMode('during_consultation')}
                      className={`p-3 rounded-xl border text-left text-xs transition-all ${
                        liveMode === 'during_consultation'
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 font-bold text-emerald-900 dark:text-emerald-200'
                          : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600'
                      }`}
                    >
                      <div>During Confirmed Consultations Only</div>
                      <div className="text-[10px] text-slate-400 font-normal">
                        Only active when en route to a farmer's field
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: INCOMING MEETING REQUESTS */}
          {activeTab === 'meetings' && (
            <div className="space-y-4">
              {meetings.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs space-y-2">
                  <Calendar className="w-8 h-8 mx-auto text-slate-300" />
                  <p>No meeting requests currently received.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {meetings.map((m) => (
                    <div
                      key={m.id}
                      className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs"
                    >
                      <div className="space-y-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-white">
                            {m.farmerName}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              m.status === 'Accepted' || m.status === 'Confirmed'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : m.status === 'Requested'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800'
                            }`}
                          >
                            {m.status}
                          </span>
                        </div>
                        <div className="text-slate-600 dark:text-slate-300">
                          📅 {m.preferredDate} at {m.preferredTime}
                        </div>
                        <div className="text-slate-500 dark:text-slate-400">
                          📍 {m.preferredMeetingPoint}
                        </div>
                        <div className="text-emerald-700 dark:text-emerald-400 font-medium">
                          Topic: {m.reason}
                        </div>
                        {m.notes && (
                          <div className="text-[11px] text-slate-400 italic">
                            "{m.notes}"
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-2 shrink-0">
                        {m.status === 'Requested' && (
                          <>
                            <button
                              onClick={() => handleMeetingAction(m.id, 'Accepted')}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-sm"
                            >
                              Accept Meeting
                            </button>
                            <button
                              onClick={() => handleMeetingAction(m.id, 'Declined')}
                              className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-red-50 hover:text-red-600 font-semibold"
                            >
                              Decline
                            </button>
                          </>
                        )}
                        {m.status === 'Accepted' && (
                          <button
                            onClick={() => handleMeetingAction(m.id, 'Completed')}
                            className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-sm"
                          >
                            Mark Completed
                          </button>
                        )}
                        <a
                          href={`tel:${m.farmerPhone}`}
                          className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-emerald-600"
                          title="Call Farmer"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
