import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Crosshair,
  Phone,
  Video,
  MessageSquare,
  Calendar,
  ShieldCheck,
  Building2,
  Navigation,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronRight,
  ExternalLink,
  Sparkles,
  Map as MapIcon,
  List,
  Compass,
  Clock,
  UserCheck,
  Star,
  Users,
} from 'lucide-react';
import { ConsultationMeetingRequest, FarmerLocationState, NearbyAdviser } from '../../types';
import { locationService } from '../../services/locationService';
import { FarmerLocationPickerModal } from './FarmerLocationPickerModal';
import { AdviserMeetingModal } from './AdviserMeetingModal';

interface NearbyAdvisersSectionProps {
  farmerLocation: FarmerLocationState;
  farmerName: string;
  farmerPhone: string;
  onUpdateLocation: (location: Partial<FarmerLocationState>) => void;
  onStartVideoCall?: (adviser: NearbyAdviser) => void;
  onStartChat?: (adviser: NearbyAdviser) => void;
  onAskCroperXAI?: (topic: string) => void;
}

const RADIUS_OPTIONS: Array<{ label: string; value: number | 'all'; desc: string }> = [
  { label: '5 km', value: 5, desc: 'Immediate Field Vicinity' },
  { label: '10 km', value: 10, desc: 'Local Farming Cluster' },
  { label: '25 km', value: 25, desc: 'Sub-District Zone (Default)' },
  { label: '50 km', value: 50, desc: 'District Wide' },
  { label: 'All', value: 'all', desc: 'All Certified Advisers' },
];

const SPECIALTY_OPTIONS = [
  { label: 'All Specialists', value: 'all' },
  { label: 'Agronomy & Soil', value: 'agronomy' },
  { label: 'Pest & Pathology', value: 'pathology' },
  { label: 'Irrigation & Sensors', value: 'irrigation' },
  { label: 'Horticulture & Fruits', value: 'horticulture' },
];

export const NearbyAdvisersSection: React.FC<NearbyAdvisersSectionProps> = ({
  farmerLocation,
  farmerName,
  farmerPhone,
  onUpdateLocation,
  onStartVideoCall,
  onStartChat,
  onAskCroperXAI,
}) => {
  const [selectedRadius, setSelectedRadius] = useState<number | 'all'>(25);
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');

  const [advisers, setAdvisers] = useState<NearbyAdviser[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);
  const [meetingModalAdviser, setMeetingModalAdviser] = useState<NearbyAdviser | null>(null);
  const [selectedMapAdviser, setSelectedMapAdviser] = useState<NearbyAdviser | null>(null);

  // Active meeting requests list
  const [myMeetings, setMyMeetings] = useState<ConsultationMeetingRequest[]>([]);

  const fetchAdvisers = async () => {
    setIsLoading(true);
    try {
      const lat = farmerLocation.latitude ?? 30.901;
      const lon = farmerLocation.longitude ?? 75.8573;

      const res = await locationService.getNearbyAdvisers({
        latitude: lat,
        longitude: lon,
        radiusKm: selectedRadius,
        specialization: selectedSpecialty !== 'all' ? selectedSpecialty : undefined,
        availableOnly,
      });

      setAdvisers(res.advisers);
      setTotalCount(res.totalAdvisers);
      if (res.advisers.length > 0 && !selectedMapAdviser) {
        setSelectedMapAdviser(res.advisers[0]);
      }
    } catch (e) {
      console.warn('Could not fetch advisers:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMyMeetings = async () => {
    if (!farmerPhone) return;
    try {
      const list = await locationService.getConsultationMeetings(farmerPhone, 'farmer');
      setMyMeetings(list);
    } catch (e) {
      console.warn('Failed to load meetings:', e);
    }
  };

  useEffect(() => {
    fetchAdvisers();
  }, [farmerLocation.latitude, farmerLocation.longitude, selectedRadius, selectedSpecialty, availableOnly]);

  useEffect(() => {
    fetchMyMeetings();
  }, [farmerPhone]);

  const handleRefreshGps = async () => {
    try {
      setIsLoading(true);
      const coords = await locationService.getBrowserCoordinates();
      const geo = await locationService.reverseGeocode(coords.latitude, coords.longitude);
      onUpdateLocation({
        permission: 'granted',
        latitude: coords.latitude,
        longitude: coords.longitude,
        accuracyMeters: coords.accuracyMeters,
        accuracyLevel: coords.accuracyLevel,
        locality: geo.locality,
        district: geo.district,
        state: geo.state,
        country: geo.country,
        fullAddress: geo.fullAddress,
        lastUpdated: new Date().toISOString(),
        isManual: false,
      });
    } catch (e) {
      setIsLocationPickerOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAdvisers = advisers.filter((a) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      a.name.toLowerCase().includes(q) ||
      a.specialization.toLowerCase().includes(q) ||
      a.organization.toLowerCase().includes(q) ||
      a.consultationLocation.label.toLowerCase().includes(q) ||
      a.consultationLocation.district.toLowerCase().includes(q)
    );
  });

  return (
    <div id="nearby-advisers-section" className="space-y-6">
      {/* Top Header Card */}
      <div className="p-5 md:p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Nearby Certified Farm Advisers
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-200 dark:border-emerald-800">
                {filteredAdvisers.length} Found
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Discover accredited agronomists, extension clinics, and crop protection specialists around your field
            </p>
          </div>

          {/* Current Farmer Location Pill & Switch */}
          <div className="flex items-center flex-wrap gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80">
            <div className="flex items-center gap-2 px-2 text-xs">
              <span
                className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                  farmerLocation.accuracyLevel === 'high'
                    ? 'bg-emerald-500'
                    : farmerLocation.accuracyLevel === 'medium'
                    ? 'bg-amber-500'
                    : 'bg-slate-400'
                }`}
              />
              <div className="space-y-0.5">
                <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1 truncate max-w-[200px] sm:max-w-xs">
                  <MapPin className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>
                    {farmerLocation.district
                      ? `${farmerLocation.locality ? `${farmerLocation.locality}, ` : ''}${farmerLocation.district}, ${farmerLocation.state}`
                      : 'PAU Agronomy Center, Ludhiana, Punjab'}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400">
                  {farmerLocation.isManual ? 'Manual Location' : 'GPS Accurate (±15m)'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 ml-auto">
              <button
                id="btn-refresh-location"
                onClick={handleRefreshGps}
                title="Refresh GPS"
                className="p-2 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:text-emerald-600 text-xs transition-colors"
              >
                <Crosshair className="w-3.5 h-3.5" />
              </button>
              <button
                id="btn-change-location"
                onClick={() => setIsLocationPickerOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:border-emerald-500 text-xs font-semibold transition-colors"
              >
                Change Location
              </button>
            </div>
          </div>
        </div>

        {/* Location Unknown / Denied Prompt */}
        {farmerLocation.permission === 'denied' && (
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-300">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>
                Location access is blocked. Allow location permissions in your browser or select your district manually to calculate accurate distances.
              </span>
            </div>
            <button
              onClick={() => setIsLocationPickerOpen(true)}
              className="px-3 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white font-semibold shrink-0"
            >
              Choose District
            </button>
          </div>
        )}

        {/* Filter Controls Bar */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Radius Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-1">
              <Compass className="w-3.5 h-3.5" />
              <span>Radius:</span>
            </span>
            {RADIUS_OPTIONS.map((opt) => {
              const isSelected = selectedRadius === opt.value;
              return (
                <button
                  key={String(opt.value)}
                  onClick={() => setSelectedRadius(opt.value)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                  title={opt.desc}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          {/* Specialty Dropdown & Search & View Toggle */}
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              {SPECIALTY_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>

            <button
              onClick={() => setAvailableOnly(!availableOnly)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                availableOnly
                  ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Available Now</span>
            </button>

            {/* View Mode Toggle */}
            <div className="flex items-center p-0.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 ml-auto">
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
                  viewMode === 'map'
                    ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400'
                }`}
                title="Map View"
              >
                <MapIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Active Meeting Requests Tracker Banner */}
      {myMeetings.length > 0 && (
        <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span className="font-bold text-xs text-emerald-950 dark:text-emerald-200">
                Your In-Person Consultation Meetings ({myMeetings.length})
              </span>
            </div>
            <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
              Real-time tracker
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {myMeetings.slice(0, 2).map((m) => (
              <div
                key={m.id}
                className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs"
              >
                <div className="space-y-0.5 min-w-0 pr-2">
                  <div className="font-bold text-slate-900 dark:text-white truncate">
                    {m.adviserName}
                  </div>
                  <div className="text-slate-500 dark:text-slate-400 text-[11px]">
                    📅 {m.preferredDate} at {m.preferredTime}
                  </div>
                  <div className="text-slate-500 dark:text-slate-400 text-[10px] truncate">
                    📍 {m.preferredMeetingPoint}
                  </div>
                </div>
                <div className="shrink-0 text-right space-y-1">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      m.status === 'Accepted' || m.status === 'Confirmed'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : m.status === 'Requested'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {m.status}
                  </span>
                  {m.meetingAddress && (
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(m.meetingAddress)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline font-semibold"
                    >
                      Directions ↗
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main View: List or Interactive Map */}
      {isLoading ? (
        <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            Scanning certified agricultural advisers near your field...
          </p>
        </div>
      ) : filteredAdvisers.length === 0 ? (
        /* Empty State */
        <div className="p-8 md:p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
            <Compass className="w-7 h-7" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              No Advisers Found Within {selectedRadius === 'all' ? 'Your Search' : `${selectedRadius} km`}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              We couldn't find an available registered adviser in this narrow radius right now. You can expand your search distance or get instant guidance through CroperX AI.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              id="btn-expand-radius-50"
              onClick={() => setSelectedRadius(50)}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
            >
              <Compass className="w-4 h-4" />
              <span>Expand Search Area (50 km)</span>
            </button>
            <button
              onClick={() => setSelectedRadius('all')}
              className="px-4 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-500 text-xs font-semibold transition-all flex items-center gap-1.5"
            >
              <Users className="w-4 h-4" />
              <span>View All Certified Advisers</span>
            </button>
            {onAskCroperXAI && (
              <button
                onClick={() => onAskCroperXAI('How to check soil moisture and treat leaf yellowing?')}
                className="px-4 py-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-semibold hover:bg-purple-100 transition-all flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                <span>Ask CroperX AI Assistant</span>
              </button>
            )}
          </div>
        </div>
      ) : viewMode === 'list' ? (
        /* List / Grid View of Advisers */
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredAdvisers.map((adviser) => {
            const loc = adviser.consultationLocation;
            return (
              <div
                key={adviser.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
              >
                {/* Card Header */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={adviser.profileImage}
                          alt={adviser.name}
                          className="w-13 h-13 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shadow-sm"
                        />
                        <span
                          className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900 ${
                            adviser.availability === 'available'
                              ? 'bg-emerald-500 ring-2 ring-emerald-500/20'
                              : adviser.availability === 'busy'
                              ? 'bg-amber-500'
                              : 'bg-slate-400'
                          }`}
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                            {adviser.name}
                          </h3>
                        </div>
                        <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 truncate">
                          {adviser.specialization}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                          {adviser.organization}
                        </div>
                      </div>
                    </div>

                    {/* Real Distance Badge */}
                    <div className="shrink-0 text-right space-y-1">
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-500/20">
                        <MapPin className="w-3.5 h-3.5" />
                        <span>{adviser.distanceDisplay}</span>
                      </div>
                      <div className="flex items-center justify-end gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-semibold">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                        <span>{adviser.rating.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Verified Consultation Location Box */}
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200 truncate">
                        <Building2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                        <span className="truncate">{loc.label}</span>
                      </div>
                      {adviser.isLocationVerified && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 shrink-0">
                          <ShieldCheck className="w-3 h-3" />
                          Verified
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {loc.address}, {loc.district}, {loc.state}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
                      <span>Exp: {adviser.experienceYears} yrs • {adviser.languages.join(', ')}</span>
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${loc.latitude},${loc.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5 font-medium"
                      >
                        <span>Directions</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* 4 Accessible Action Buttons (Touch Target >= 44px) */}
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/60">
                  <a
                    href={`tel:${adviser.phoneNumber}`}
                    className="min-h-[44px] px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Phone className="w-4 h-4 text-emerald-600" />
                    <span>Call</span>
                  </a>

                  {onStartVideoCall ? (
                    <button
                      onClick={() => onStartVideoCall(adviser)}
                      className="min-h-[44px] px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Video className="w-4 h-4 text-emerald-600" />
                      <span>Video Call</span>
                    </button>
                  ) : (
                    <a
                      href={`sms:${adviser.phoneNumber}`}
                      className="min-h-[44px] px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <MessageSquare className="w-4 h-4 text-sky-600" />
                      <span>SMS</span>
                    </a>
                  )}

                  <button
                    onClick={() => {
                      if (onStartChat) onStartChat(adviser);
                      else if (onAskCroperXAI) onAskCroperXAI(`Ask adviser ${adviser.name} about ${adviser.specialization}`);
                    }}
                    className="min-h-[44px] px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                    <span>Message</span>
                  </button>

                  <button
                    id={`btn-meet-adviser-${adviser.id}`}
                    onClick={() => setMeetingModalAdviser(adviser)}
                    className="min-h-[44px] px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-bold shadow-sm flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Meet Adviser</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Interactive Map View */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Map Canvas Visualizer */}
          <div className="lg:col-span-2 rounded-2xl bg-slate-900 border border-slate-800 p-5 relative min-h-[420px] flex flex-col justify-between overflow-hidden shadow-inner">
            {/* Map Top Status Bar */}
            <div className="flex items-center justify-between z-10 bg-slate-900/80 backdrop-blur-md p-3 rounded-xl border border-slate-800">
              <div className="flex items-center gap-2 text-xs text-white">
                <Compass className="w-4 h-4 text-emerald-400 animate-spin-slow" />
                <span className="font-bold">Agro-Geographic Discovery Radar</span>
                <span className="text-slate-400">({selectedRadius === 'all' ? 'All India' : `Radius: ${selectedRadius} km`})</span>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-slate-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 ring-2 ring-blue-500/40" />
                  Your Field
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/40" />
                  Verified Advisers ({filteredAdvisers.length})
                </span>
              </div>
            </div>

            {/* Interactive SVG Field & Adviser Grid */}
            <div className="relative w-full h-72 my-4 flex items-center justify-center">
              {/* Radar Circles */}
              <div className="absolute w-64 h-64 rounded-full border border-emerald-500/20 animate-pulse" />
              <div className="absolute w-44 h-44 rounded-full border border-emerald-500/30" />
              <div className="absolute w-24 h-24 rounded-full border border-emerald-500/40" />

              {/* Center: Farmer Pin */}
              <div className="absolute z-20 flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center shadow-lg ring-4 ring-blue-500/30 animate-bounce">
                  <MapPin className="w-5 h-5" />
                </div>
                <span className="mt-1 px-2 py-0.5 rounded-full bg-blue-950/90 border border-blue-700 text-blue-200 text-[10px] font-bold">
                  You ({farmerLocation.district || 'My Field'})
                </span>
              </div>

              {/* Adviser Pins Distributed around Farmer */}
              {filteredAdvisers.map((adviser, idx) => {
                // Distribute positions deterministically based on distance and index
                const angle = (idx / Math.max(1, filteredAdvisers.length)) * 2 * Math.PI - Math.PI / 2;
                const distanceFactor = Math.min(110, Math.max(45, (adviser.distanceKm / (typeof selectedRadius === 'number' ? selectedRadius : 50)) * 120 + 40));
                const offsetX = Math.cos(angle) * distanceFactor;
                const offsetY = Math.sin(angle) * distanceFactor;

                const isSelected = selectedMapAdviser?.id === adviser.id;

                return (
                  <div
                    key={adviser.id}
                    style={{
                      transform: `translate(${offsetX}px, ${offsetY}px)`,
                    }}
                    onClick={() => setSelectedMapAdviser(adviser)}
                    className={`absolute z-20 cursor-pointer transition-all ${
                      isSelected ? 'scale-125 z-30' : 'hover:scale-110'
                    }`}
                  >
                    <div
                      className={`relative px-2.5 py-1 rounded-xl flex items-center gap-1.5 shadow-xl border ${
                        isSelected
                          ? 'bg-emerald-500 text-white border-white ring-4 ring-emerald-500/40 font-bold'
                          : 'bg-slate-800 text-emerald-300 border-emerald-500/40 hover:bg-slate-700'
                      }`}
                    >
                      <Building2 className="w-3.5 h-3.5" />
                      <span className="text-[11px] whitespace-nowrap">{adviser.name.split(' ')[0]}</span>
                      <span className="text-[9px] px-1 py-0.2 rounded bg-black/30">
                        {adviser.distanceDisplay}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Map Bottom Hint */}
            <div className="z-10 text-center text-slate-400 text-[11px]">
              Tap any adviser pin on the radar map to view consultation details and direct navigation directions
            </div>
          </div>

          {/* Selected Adviser Spotlight Card */}
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between space-y-4">
            {selectedMapAdviser ? (
              <>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedMapAdviser.profileImage}
                      alt={selectedMapAdviser.name}
                      className="w-14 h-14 rounded-2xl object-cover border border-slate-200 dark:border-slate-700"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                          {selectedMapAdviser.name}
                        </h4>
                        {selectedMapAdviser.isLocationVerified && (
                          <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        )}
                      </div>
                      <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        {selectedMapAdviser.specialization}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {selectedMapAdviser.organization}
                      </div>
                    </div>
                  </div>

                  {/* Distance & Travel Box */}
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-950 dark:text-emerald-200">
                        📍 {selectedMapAdviser.distanceDisplay}
                      </span>
                      <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">
                        ★ {selectedMapAdviser.rating.toFixed(1)} Rating
                      </span>
                    </div>
                    <div className="text-xs text-emerald-900 dark:text-emerald-300 font-medium">
                      {selectedMapAdviser.consultationLocation.label}
                    </div>
                    <div className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80">
                      {selectedMapAdviser.consultationLocation.address}
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                    {selectedMapAdviser.bio}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${selectedMapAdviser.consultationLocation.latitude},${selectedMapAdviser.consultationLocation.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                  >
                    <Navigation className="w-4 h-4 text-emerald-600" />
                    <span>Get Turn-by-Turn Navigation</span>
                  </a>

                  <button
                    onClick={() => setMeetingModalAdviser(selectedMapAdviser)}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm flex items-center justify-center gap-2 transition-all"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Request Meeting with {selectedMapAdviser.name.split(' ')[0]}</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-slate-400 text-xs">
                Select an adviser pin on the map
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      <FarmerLocationPickerModal
        isOpen={isLocationPickerOpen}
        onClose={() => setIsLocationPickerOpen(false)}
        currentLocation={farmerLocation}
        onLocationSelected={(loc) => onUpdateLocation(loc)}
      />

      <AdviserMeetingModal
        isOpen={Boolean(meetingModalAdviser)}
        onClose={() => setMeetingModalAdviser(null)}
        adviser={meetingModalAdviser}
        farmerLocation={farmerLocation}
        farmerName={farmerName}
        farmerPhone={farmerPhone}
        onMeetingRequested={(newMeeting) => {
          setMyMeetings([newMeeting, ...myMeetings]);
        }}
      />
    </div>
  );
};
