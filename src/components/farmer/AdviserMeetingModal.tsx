import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Navigation,
  CheckCircle2,
  X,
  Phone,
  ShieldCheck,
  Building2,
  FileText,
  Loader2,
  ExternalLink,
  ChevronRight,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { ConsultationMeetingRequest, FarmerLocationState, NearbyAdviser } from '../../types';
import { locationService } from '../../services/locationService';

interface AdviserMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  adviser: NearbyAdviser | null;
  farmerLocation: FarmerLocationState;
  farmerName: string;
  farmerPhone: string;
  onMeetingRequested?: (meeting: ConsultationMeetingRequest) => void;
}

const COMMON_REASONS = [
  'Severe Leaf Chlorosis & Yellowing',
  'Soil Nutrient & pH Fertilizer Planning',
  'Pest Infestation & Bio-Fungicide Review',
  'Drip Irrigation Calibration & Moisture Stress',
  'Pre-Harvest Crop Vigor & Yield Review',
  'Crop Insurance & Extension Center Support',
];

export const AdviserMeetingModal: React.FC<AdviserMeetingModalProps> = ({
  isOpen,
  onClose,
  adviser,
  farmerLocation,
  farmerName,
  farmerPhone,
  onMeetingRequested,
}) => {
  if (!isOpen || !adviser) return null;

  // Form State
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDateStr = tomorrow.toISOString().split('T')[0];

  const [preferredDate, setPreferredDate] = useState(defaultDateStr);
  const [preferredTime, setPreferredTime] = useState('10:30 AM');
  const [meetingPointChoice, setMeetingPointChoice] = useState<'adviser_office' | 'farmer_field' | 'extension_center'>('adviser_office');
  const [customMeetingPoint, setCustomMeetingPoint] = useState('');
  const [selectedReason, setSelectedReason] = useState(COMMON_REASONS[0]);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMeeting, setSuccessMeeting] = useState<ConsultationMeetingRequest | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const loc = adviser.consultationLocation;
  const navigationUrl = `https://www.google.com/maps/dir/?api=1&destination=${loc.latitude},${loc.longitude}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    let meetingAddress = loc.address;
    let preferredPointLabel = loc.label;

    if (meetingPointChoice === 'farmer_field') {
      preferredPointLabel = `Farmer's Field (${farmerLocation.district})`;
      meetingAddress = farmerLocation.fullAddress || `${farmerLocation.locality}, ${farmerLocation.district}`;
    } else if (meetingPointChoice === 'extension_center') {
      preferredPointLabel = customMeetingPoint || 'Local Krishi Vigyan Kendra';
      meetingAddress = customMeetingPoint || loc.address;
    }

    try {
      const created = await locationService.requestConsultationMeeting({
        farmerId: farmerPhone || 'farmer_guest',
        farmerName: farmerName || 'Farmer',
        farmerPhone: farmerPhone || '+919876543210',
        adviserId: adviser.id,
        adviserName: adviser.name,
        adviserPhone: adviser.phoneNumber,
        preferredDate,
        preferredTime,
        reason: selectedReason,
        farmLocation: farmerLocation.fullAddress || `${farmerLocation.district}, ${farmerLocation.state}`,
        preferredMeetingPoint: `${preferredPointLabel} - ${meetingAddress}`,
        notes: additionalNotes,
        meetingAddress,
        latitude: loc.latitude,
        longitude: loc.longitude,
      });

      if (created) {
        setSuccessMeeting(created);
        if (onMeetingRequested) onMeetingRequested(created);
      } else {
        setErrorMsg('Failed to send meeting request. Please try calling the adviser directly.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while submitting meeting request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div
        id="adviser-meeting-modal"
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Request In-Person Meeting
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Book field consultation or office visit with certified adviser
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

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Adviser Card Summary */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="relative">
                <img
                  src={adviser.profileImage}
                  alt={adviser.name}
                  className="w-14 h-14 rounded-full object-cover border-2 border-emerald-500/30"
                />
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                    {adviser.name}
                  </h3>
                  {adviser.isLocationVerified && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      <ShieldCheck className="w-3 h-3" />
                      Verified Center
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                  {adviser.specialization}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {adviser.organization} • {adviser.experienceYears} yrs exp.
                </div>
              </div>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200 dark:border-slate-700">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-bold">
                <MapPin className="w-3.5 h-3.5" />
                <span>{adviser.distanceDisplay}</span>
              </div>
              <a
                href={`tel:${adviser.phoneNumber}`}
                className="inline-flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>{adviser.phoneNumber}</span>
              </a>
            </div>
          </div>

          {/* Verified Consultation Center & Navigation */}
          <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-bold text-xs text-emerald-950 dark:text-emerald-200">
                    {loc.label}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-200/60 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300">
                    {loc.type}
                  </span>
                </div>
                <p className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed">
                  {loc.address}, {loc.district}, {loc.state}
                </p>
                <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80">
                  Hours: {adviser.consultationHours || '08:00 AM - 06:00 PM IST'} • Max Travel Radius: {loc.meetingRadiusKm || 30} km
                </p>
              </div>
              <a
                id="btn-navigate-to-adviser"
                href={navigationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 shrink-0"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Open Maps</span>
              </a>
            </div>
          </div>

          {/* Success State */}
          {successMeeting ? (
            <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-center space-y-3 animate-in fade-in zoom-in-95">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-white">
                Consultation Meeting Request Sent!
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto">
                Your request for <strong>{successMeeting.preferredDate} at {successMeeting.preferredTime}</strong> has been transmitted directly to <strong>{adviser.name}</strong>.
              </p>
              <div className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-left text-xs space-y-1 max-w-md mx-auto">
                <div className="text-slate-500 dark:text-slate-400">Request ID: <span className="font-mono text-slate-700 dark:text-slate-300">{successMeeting.id}</span></div>
                <div className="text-slate-500 dark:text-slate-400">Status: <span className="text-amber-600 dark:text-amber-400 font-semibold">{successMeeting.status}</span> (Adviser notified)</div>
                <div className="text-slate-500 dark:text-slate-400">Meeting Point: <span className="text-slate-700 dark:text-slate-300">{successMeeting.preferredMeetingPoint}</span></div>
              </div>
              <div className="pt-2">
                <button
                  onClick={onClose}
                  className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* Meeting Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Date & Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                    Preferred Date
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      required
                      className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                    Preferred Time Slot
                  </label>
                  <select
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="08:30 AM">08:30 AM (Early Field Walk)</option>
                    <option value="10:30 AM">10:30 AM (Morning Clinic)</option>
                    <option value="01:00 PM">01:00 PM (Midday Session)</option>
                    <option value="03:30 PM">03:30 PM (Afternoon Field Inspection)</option>
                    <option value="05:30 PM">05:30 PM (Evening Consultation)</option>
                  </select>
                </div>
              </div>

              {/* Meeting Point Option */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2 block">
                  Select Meeting Location
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setMeetingPointChoice('adviser_office')}
                    className={`p-3 rounded-xl border text-left text-xs transition-all ${
                      meetingPointChoice === 'adviser_office'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-950 dark:text-emerald-200 font-semibold'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 font-bold">
                      <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Adviser Center</span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {loc.label}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMeetingPointChoice('farmer_field')}
                    className={`p-3 rounded-xl border text-left text-xs transition-all ${
                      meetingPointChoice === 'farmer_field'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-950 dark:text-emerald-200 font-semibold'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 font-bold">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      <span>My Farm Field</span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {farmerLocation.district}, {farmerLocation.state}
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setMeetingPointChoice('extension_center')}
                    className={`p-3 rounded-xl border text-left text-xs transition-all ${
                      meetingPointChoice === 'extension_center'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-950 dark:text-emerald-200 font-semibold'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1 font-bold">
                      <Navigation className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Custom Hub</span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      Specify Custom Point
                    </div>
                  </button>
                </div>

                {meetingPointChoice === 'extension_center' && (
                  <div className="mt-2.5">
                    <input
                      type="text"
                      value={customMeetingPoint}
                      onChange={(e) => setCustomMeetingPoint(e.target.value)}
                      placeholder="e.g. Krishi Vigyan Kendra Mandi Gate, Samrala"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                )}
              </div>

              {/* Consultation Topic */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 block">
                  Primary Consultation Topic
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {COMMON_REASONS.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setSelectedReason(r)}
                      className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                        selectedReason === r
                          ? 'bg-emerald-600 text-white font-medium shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 block">
                  Additional Field Observation or Request Notes
                </label>
                <textarea
                  rows={2}
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder="Describe symptoms, recent fertilizers applied, or specific questions..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="text-[11px] text-slate-400">
                  Direct SMS & Notification sent to adviser
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    id="btn-confirm-meeting-request"
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending Request...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Send Meeting Request</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
