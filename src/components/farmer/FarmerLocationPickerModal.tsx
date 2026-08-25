import React, { useState } from 'react';
import {
  MapPin,
  Crosshair,
  Search,
  CheckCircle2,
  X,
  Navigation,
  Globe,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { FarmerLocationState } from '../../types';
import { locationService } from '../../services/locationService';

interface FarmerLocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation: FarmerLocationState;
  onLocationSelected: (newLocation: Partial<FarmerLocationState>) => void;
}

const PRESET_AGRO_REGIONS = [
  {
    name: 'PAU Agronomy Center, Ludhiana',
    locality: 'PAU Campus',
    district: 'Ludhiana',
    state: 'Punjab',
    latitude: 30.901,
    longitude: 75.8573,
    crops: 'Wheat, Rice, Pulses',
  },
  {
    name: 'National Agronomy Hub, Karnal',
    locality: 'NDRI Area',
    district: 'Karnal',
    state: 'Haryana',
    latitude: 29.6857,
    longitude: 76.9905,
    crops: 'Basmati Rice, Wheat, Mustard',
  },
  {
    name: 'National Capital Agro Grid, New Delhi',
    locality: 'IARI Pusa Campus',
    district: 'New Delhi',
    state: 'Delhi',
    latitude: 28.6139,
    longitude: 77.209,
    crops: 'Vegetables, Floriculture, High-Tech',
  },
  {
    name: 'Nashik Horticulture Zone, Maharashtra',
    locality: 'Dindori Agro Cluster',
    district: 'Nashik',
    state: 'Maharashtra',
    latitude: 19.9975,
    longitude: 73.7898,
    crops: 'Grapes, Onions, Pomegranate',
  },
  {
    name: 'Telangana Rice & Cotton Belt, Warangal',
    locality: 'Kakatiya Agri Zone',
    district: 'Warangal',
    state: 'Telangana',
    latitude: 17.9784,
    longitude: 79.5941,
    crops: 'Cotton, Paddy, Chilli',
  },
  {
    name: 'Mandya Sugarcane & Paddy Basin, Karnataka',
    locality: 'Cauvery Basin',
    district: 'Mandya',
    state: 'Karnataka',
    latitude: 12.5218,
    longitude: 76.8951,
    crops: 'Sugarcane, Paddy, Ragi',
  },
];

export const FarmerLocationPickerModal: React.FC<FarmerLocationPickerModalProps> = ({
  isOpen,
  onClose,
  currentLocation,
  onLocationSelected,
}) => {
  const [loadingGps, setLoadingGps] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [customLat, setCustomLat] = useState(currentLocation.latitude ? String(currentLocation.latitude) : '30.9010');
  const [customLon, setCustomLon] = useState(currentLocation.longitude ? String(currentLocation.longitude) : '75.8573');
  const [customAddress, setCustomAddress] = useState(currentLocation.fullAddress || '');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleUseGps = async () => {
    setLoadingGps(true);
    setErrorMsg(null);
    try {
      const gps = await locationService.getBrowserCoordinates();
      const geo = await locationService.reverseGeocode(gps.latitude, gps.longitude);

      onLocationSelected({
        permission: 'granted',
        latitude: gps.latitude,
        longitude: gps.longitude,
        accuracyMeters: gps.accuracyMeters,
        accuracyLevel: gps.accuracyLevel,
        locality: geo.locality || 'Detected Village/Cluster',
        district: geo.district || 'District Center',
        state: geo.state || 'State Agro Bureau',
        country: geo.country || 'India',
        fullAddress: geo.fullAddress || `${geo.locality}, ${geo.district}, ${geo.state}`,
        lastUpdated: new Date().toISOString(),
        isManual: false,
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not acquire precise GPS coordinates. Please select your district from the list below.');
    } finally {
      setLoadingGps(false);
    }
  };

  const handleSelectPreset = async (preset: typeof PRESET_AGRO_REGIONS[0]) => {
    onLocationSelected({
      permission: 'granted',
      latitude: preset.latitude,
      longitude: preset.longitude,
      accuracyMeters: 20,
      accuracyLevel: 'high',
      locality: preset.locality,
      district: preset.district,
      state: preset.state,
      country: 'India',
      fullAddress: `${preset.name}, ${preset.district}, ${preset.state}, India`,
      lastUpdated: new Date().toISOString(),
      isManual: true,
    });
    onClose();
  };

  const handleSaveCustom = async () => {
    const latNum = parseFloat(customLat);
    const lonNum = parseFloat(customLon);

    if (isNaN(latNum) || isNaN(lonNum)) {
      setErrorMsg('Please enter valid numeric latitude and longitude coordinates.');
      return;
    }

    setLoadingGps(true);
    try {
      const geo = await locationService.reverseGeocode(latNum, lonNum);
      onLocationSelected({
        permission: 'granted',
        latitude: latNum,
        longitude: lonNum,
        accuracyMeters: 50,
        accuracyLevel: 'medium',
        locality: geo.locality || 'Manual Location',
        district: geo.district || 'Agricultural District',
        state: geo.state || 'State',
        country: geo.country || 'India',
        fullAddress: customAddress || geo.fullAddress || `${latNum.toFixed(4)}, ${lonNum.toFixed(4)}`,
        lastUpdated: new Date().toISOString(),
        isManual: true,
      });
      onClose();
    } catch (e: any) {
      setErrorMsg('Failed to reverse geocode custom coordinates.');
    } finally {
      setLoadingGps(false);
    }
  };

  const filteredPresets = PRESET_AGRO_REGIONS.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.crops.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div
        id="farmer-location-picker-modal"
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Set Farm Consultation Location
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Used to find nearest certified advisers, travel distance & accurate weather
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
          {errorMsg && (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-start gap-2.5 text-amber-800 dark:text-amber-300 text-xs">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1-Click Current GPS Button */}
          <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-emerald-950 dark:text-emerald-200">
                  Detect Live GPS Location
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-medium">
                  Highest Accuracy
                </span>
              </div>
              <p className="text-xs text-emerald-800/80 dark:text-emerald-300/80">
                Uses device satellite & cellular positioning for exact field distance calculation
              </p>
            </div>
            <button
              id="btn-use-live-gps"
              onClick={handleUseGps}
              disabled={loadingGps}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white text-xs font-semibold shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-50"
            >
              {loadingGps ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Locating Field...</span>
                </>
              ) : (
                <>
                  <Crosshair className="w-4 h-4" />
                  <span>Use Live GPS</span>
                </>
              )}
            </button>
          </div>

          {/* Preset Districts / Agro-Zones */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Select Major Agricultural District
              </label>
              <span className="text-xs text-slate-400">1-click switch</span>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search district, state, or crop zone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
              {filteredPresets.map((preset) => {
                const isSelected =
                  currentLocation.district.toLowerCase() === preset.district.toLowerCase();
                return (
                  <button
                    key={preset.name}
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-3 rounded-xl border text-left transition-all flex items-start justify-between gap-2 group ${
                      isSelected
                        ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-500 dark:border-emerald-500 text-emerald-900 dark:text-emerald-200'
                        : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="space-y-0.5 min-w-0">
                      <div className="font-semibold text-xs text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 truncate">
                        {preset.district}, {preset.state}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {preset.locality}
                      </div>
                      <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-medium">
                        Crops: {preset.crops}
                      </div>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Manual Coordinates Input */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                Or Enter Custom GPS Coordinates
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-500 dark:text-slate-400 mb-1 block">
                  Latitude
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={customLat}
                  onChange={(e) => setCustomLat(e.target.value)}
                  placeholder="e.g. 30.9010"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 dark:text-slate-400 mb-1 block">
                  Longitude
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={customLon}
                  onChange={(e) => setCustomLon(e.target.value)}
                  placeholder="e.g. 75.8573"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
            <div>
              <label className="text-[11px] text-slate-500 dark:text-slate-400 mb-1 block">
                Farm / Village Address Description
              </label>
              <input
                type="text"
                value={customAddress}
                onChange={(e) => setCustomAddress(e.target.value)}
                placeholder="e.g. Near Canal Gate 4, Samrala Road, Ludhiana"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/50">
          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-emerald-500" />
            <span>OpenStreetMap & GPS Synced</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveCustom}
              disabled={loadingGps}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Apply Location</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
