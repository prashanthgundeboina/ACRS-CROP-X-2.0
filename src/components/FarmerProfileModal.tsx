import React, { useState, useEffect } from 'react';
import { FarmerProfile } from '../types';
import { getReverseGeocode } from '../services/authService';
import { User, MapPin, Ruler, RefreshCw, Droplets, Mountain, CheckCircle2, Save, X, Sparkles, Sliders, Compass, Loader2 } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onProfileSave: (profile: FarmerProfile) => void;
  currentProfile: FarmerProfile;
  onOpenAuthModal?: () => void;
}

export const DEFAULT_FARMER_PROFILE: FarmerProfile = {
  farmerName: 'Rajesh Kumar',
  farmLocation: 'Punjab Cereal Belt (Ludhiana District)',
  farmAreaSize: 5.0,
  unitPreference: 'metric',
  preferredCropCycle: 'Kharif Rice → Rabi Wheat → Summer Pulse',
  primaryWaterSource: 'Borewell & Drip Line',
  soilTypeZone: 'Alluvial Deep Loam',
  targetPhGoal: 6.5
};

export const FarmerProfileModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onProfileSave,
  currentProfile,
  onOpenAuthModal
}) => {
  const [profile, setProfile] = useState<FarmerProfile>(currentProfile || DEFAULT_FARMER_PROFILE);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);
  const [geoLoading, setGeoLoading] = useState<boolean>(false);
  const [locationStatus, setLocationStatus] = useState<string | null>(null);

  useEffect(() => {
    if (currentProfile) {
      setProfile(currentProfile);
    }
  }, [currentProfile, isOpen]);

  if (!isOpen) return null;

  // Detect GPS Location & Reverse Geocode
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      setLocationStatus("Geolocation is not supported by your browser.");
      return;
    }

    setGeoLoading(true);
    setLocationStatus(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        try {
          const loc = await getReverseGeocode(lat, lon);
          const fullLoc = `${loc.district}, ${loc.state} (${loc.country})`;
          setProfile(prev => ({
            ...prev,
            farmLocation: fullLoc,
            soilTypeZone: loc.estimatedSoilType || prev.soilTypeZone
          }));
          setLocationStatus(`GPS Location Detected: ${fullLoc}`);
        } catch (e) {
          setProfile(prev => ({ ...prev, farmLocation: `GPS Coordinates (${lat.toFixed(3)}, ${lon.toFixed(3)})` }));
          setLocationStatus(`GPS Coordinates captured (${lat.toFixed(3)}, ${lon.toFixed(3)})`);
        } finally {
          setGeoLoading(false);
        }
      },
      (err) => {
        setGeoLoading(false);
        setLocationStatus("Unable to access GPS location. Please ensure browser permissions are enabled.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onProfileSave(profile);
    localStorage.setItem('croperx_farmer_profile', JSON.stringify(profile));
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };


  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full border border-[#c8e6c9] shadow-2xl overflow-hidden animate-scaleUp my-8">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#1b2e1b] via-[#2e7d32] to-[#1b2e1b] text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-emerald-200 hover:text-white bg-black/30 p-2 rounded-full border border-white/20 transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#4CAF50] text-[#1b2e1b] flex items-center justify-center font-black shadow-lg">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif text-2xl font-bold text-white flex items-center gap-2">
                Farmer Profile & Preferences
                <Sparkles className="w-4 h-4 text-amber-300" />
              </h3>
              <p className="text-xs text-emerald-200">
                Customizes ML prediction biases, unit conversions, and regional soil algorithms.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs text-[#1b2e1b]">
          
          {savedSuccess && (
            <div className="p-3 bg-emerald-100 border border-emerald-400 text-emerald-800 rounded-2xl flex items-center gap-2 font-bold animate-fadeIn">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Farmer Profile saved successfully! Recommendation engine updated.</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Farmer Name */}
            <div className="space-y-1">
              <label className="font-bold flex items-center gap-1.5 text-[#2e7d32]">
                <User className="w-3.5 h-3.5 text-[#4CAF50]" />
                Farmer / Manager Name
              </label>
              <input
                type="text"
                value={profile.farmerName}
                onChange={(e) => setProfile({ ...profile, farmerName: e.target.value })}
                className="w-full p-3 bg-[#f8fcf8] border border-[#c8e6c9] rounded-xl font-bold outline-none focus:border-[#4CAF50]"
                required
              />
            </div>

            {/* Farm Location */}
            <div className="space-y-1 sm:col-span-2">
              <div className="flex items-center justify-between">
                <label className="font-bold flex items-center gap-1.5 text-[#2e7d32]">
                  <MapPin className="w-3.5 h-3.5 text-[#4CAF50]" />
                  Farm Location / District Zone
                </label>
                <button
                  type="button"
                  onClick={handleDetectGPS}
                  disabled={geoLoading}
                  className="text-xs font-bold text-[#2e7d32] hover:text-[#1b2e1b] flex items-center gap-1.5 bg-[#e8f5e9] hover:bg-[#c8e6c9] px-2.5 py-1 rounded-lg border border-[#c8e6c9] transition-all cursor-pointer"
                >
                  {geoLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-[#2e7d32]" />
                      <span>Detecting Location...</span>
                    </>
                  ) : (
                    <>
                      <Compass className="w-3.5 h-3.5 text-[#2e7d32]" />
                      <span>Detect GPS Location</span>
                    </>
                  )}
                </button>
              </div>
              <input
                type="text"
                value={profile.farmLocation}
                onChange={(e) => setProfile({ ...profile, farmLocation: e.target.value })}
                className="w-full p-3 bg-[#f8fcf8] border border-[#c8e6c9] rounded-xl font-bold outline-none focus:border-[#4CAF50]"
                placeholder="e.g. Ludhiana, Punjab or auto-detected location"
                required
              />
              {locationStatus && (
                <p className="text-[11px] font-semibold text-[#2e7d32] mt-1">{locationStatus}</p>
              )}
            </div>


            {/* Farm Area Size */}
            <div className="space-y-1">
              <label className="font-bold flex items-center gap-1.5 text-[#2e7d32]">
                <Ruler className="w-3.5 h-3.5 text-[#4CAF50]" />
                Farm Area Size ({profile.unitPreference === 'metric' ? 'Hectares' : 'Acres'})
              </label>
              <input
                type="number"
                step="0.5"
                min="0.1"
                value={profile.farmAreaSize}
                onChange={(e) => setProfile({ ...profile, farmAreaSize: parseFloat(e.target.value) || 1 })}
                className="w-full p-3 bg-[#f8fcf8] border border-[#c8e6c9] rounded-xl font-bold outline-none focus:border-[#4CAF50]"
                required
              />
            </div>

            {/* Preferred Unit System */}
            <div className="space-y-1">
              <label className="font-bold flex items-center gap-1.5 text-[#2e7d32]">
                <Sliders className="w-3.5 h-3.5 text-[#4CAF50]" />
                Preferred Unit System
              </label>
              <select
                value={profile.unitPreference}
                onChange={(e) => setProfile({ ...profile, unitPreference: e.target.value as 'metric' | 'imperial' })}
                className="w-full p-3 bg-[#f8fcf8] border border-[#c8e6c9] rounded-xl font-bold outline-none focus:border-[#4CAF50] cursor-pointer"
              >
                <option value="metric">Metric (Hectares, kg/ha, °C, mm)</option>
                <option value="imperial">Imperial (Acres, lbs/acre, °F, inches)</option>
              </select>
            </div>

            {/* Typical Crop Cycle */}
            <div className="space-y-1 sm:col-span-2">
              <label className="font-bold flex items-center gap-1.5 text-[#2e7d32]">
                <RefreshCw className="w-3.5 h-3.5 text-[#4CAF50]" />
                Typical Preferred Crop Rotation Cycle
              </label>
              <select
                value={profile.preferredCropCycle}
                onChange={(e) => setProfile({ ...profile, preferredCropCycle: e.target.value })}
                className="w-full p-3 bg-[#f8fcf8] border border-[#c8e6c9] rounded-xl font-bold outline-none focus:border-[#4CAF50] cursor-pointer"
              >
                <option value="Kharif Rice → Rabi Wheat → Summer Pulse">Kharif Rice → Rabi Wheat → Summer Pulse</option>
                <option value="Kharif Cotton → Rabi Mustard / Chickpea">Kharif Cotton → Rabi Mustard / Chickpea</option>
                <option value="Kharif Maize → Rabi Potato → Cover Crop">Kharif Maize → Rabi Potato → Cover Crop</option>
                <option value="Annual Sugarcane → Intercrop Legume">Annual Sugarcane → Intercrop Legume</option>

                <option value="Perennial Fruit Orchard / Multi-crop">Perennial Fruit Orchard / Multi-crop</option>
              </select>
            </div>

            {/* Water Source */}
            <div className="space-y-1">
              <label className="font-bold flex items-center gap-1.5 text-[#2e7d32]">
                <Droplets className="w-3.5 h-3.5 text-[#4CAF50]" />
                Primary Irrigation Water Source
              </label>
              <select
                value={profile.primaryWaterSource}
                onChange={(e) => setProfile({ ...profile, primaryWaterSource: e.target.value })}
                className="w-full p-3 bg-[#f8fcf8] border border-[#c8e6c9] rounded-xl font-bold outline-none focus:border-[#4CAF50] cursor-pointer"
              >
                <option value="Borewell & Drip Line">Borewell & Drip Line</option>
                <option value="Canal Gravity Feed">Canal Gravity Feed</option>
                <option value="Rainfed Monsoon Reliance">Rainfed Monsoon Reliance</option>
                <option value="Pond / Sprinkler System">Pond / Sprinkler System</option>
              </select>
            </div>

            {/* Soil Type Zone */}
            <div className="space-y-1">
              <label className="font-bold flex items-center gap-1.5 text-[#2e7d32]">
                <Mountain className="w-3.5 h-3.5 text-[#4CAF50]" />
                Primary Regional Soil Zone
              </label>
              <select
                value={profile.soilTypeZone}
                onChange={(e) => setProfile({ ...profile, soilTypeZone: e.target.value })}
                className="w-full p-3 bg-[#f8fcf8] border border-[#c8e6c9] rounded-xl font-bold outline-none focus:border-[#4CAF50] cursor-pointer"
              >
                <option value="Alluvial Deep Loam">Alluvial Deep Loam</option>
                <option value="Black Cotton Clay">Black Cotton Clay</option>
                <option value="Red Sandy Loam">Red Sandy Loam</option>
                <option value="Laterite Mountain Soil">Laterite Mountain Soil</option>
                <option value="Coastal Saline Delta">Coastal Saline Delta</option>
              </select>
            </div>

          </div>

          <div className="p-3 bg-[#f8fcf8] rounded-2xl border border-[#c8e6c9] text-[11px] text-[#667e66]">
            <span className="font-bold text-[#2e7d32]">🤖 ML Engine Auto-Biasing:</span> Setting your farm location and preferred crop rotation instructs the recommendation engine to apply regional weighting for high-yield compatibility.
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#c8e6c9]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#1b2e1b] hover:bg-[#2e7d32] text-white font-bold rounded-xl shadow-lg border border-[#4CAF50]/40 flex items-center gap-2"
            >
              <Save className="w-4 h-4 text-[#4CAF50]" />
              <span>Save Farmer Profile</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
