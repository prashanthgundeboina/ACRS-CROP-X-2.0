import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User,
  MapPin,
  Ruler,
  Phone,
  Globe,
  Award,
  Sparkles,
  ShieldCheck,
  Lock,
  Camera,
  X,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Compass,
  Building,
  RefreshCw,
  LogOut,
  Sliders,
  Droplets,
  Mountain,
  FileText,
  Clock,
  Trash2,
  Check
} from 'lucide-react';
import { UserAccount, UserRole, FarmerProfile } from '../../types';
import { updateUserProfile, getReverseGeocode } from '../../services/authService';

interface UnifiedProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount | null;
  currentRole: UserRole;
  farmerProfile?: FarmerProfile;
  onProfileUpdated: (user: UserAccount) => void;
  onOpenChangePassword: () => void;
  onOpenChangeLanguage?: () => void;
  onLogoutAllSessions?: () => void;
}

export const UnifiedProfileModal: React.FC<UnifiedProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  currentRole,
  farmerProfile,
  onProfileUpdated,
  onOpenChangePassword,
  onOpenChangeLanguage,
  onLogoutAllSessions,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [geoStatus, setGeoStatus] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [farmName, setFarmName] = useState('');
  const [farmLocation, setFarmLocation] = useState('');
  const [farmAreaSize, setFarmAreaSize] = useState(5);
  const [unitPreference, setUnitPreference] = useState<'metric' | 'imperial'>('metric');
  const [primaryCrop, setPrimaryCrop] = useState('Wheat / Rice');
  const [primaryWaterSource, setPrimaryWaterSource] = useState('Borewell & Drip Line');
  const [soilTypeZone, setSoilTypeZone] = useState('Alluvial Deep Loam');
  const [preferredCropCycle, setPreferredCropCycle] = useState('Kharif Rice → Rabi Wheat → Summer Pulse');
  const [preferredLanguage, setPreferredLanguage] = useState('English');
  const [assignedAdviser, setAssignedAdviser] = useState('Dr. Ramesh Sharma (Senior Agronomist)');

  // Adviser specific fields
  const [specialization, setSpecialization] = useState('Crop Protection & Soil Pathology');
  const [languages, setLanguages] = useState<string[]>(['English', 'Hindi', 'Punjabi']);
  const [bio, setBio] = useState('Senior Agricultural Scientist with 12+ years experience in precision irrigation and pest management.');

  // Photo
  const [profileImage, setProfileImage] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.farmerName || currentUser.fullName || '');
      setFarmLocation(currentUser.farmLocation || farmerProfile?.farmLocation || 'Ludhiana District, Punjab');
      setFarmAreaSize(currentUser.farmAreaSize || farmerProfile?.farmAreaSize || 5);
      setUnitPreference(currentUser.unitPreference || farmerProfile?.unitPreference || 'metric');
      setPrimaryWaterSource(currentUser.primaryWaterSource || farmerProfile?.primaryWaterSource || 'Borewell & Drip Line');
      setSoilTypeZone(currentUser.soilTypeZone || farmerProfile?.soilTypeZone || 'Alluvial Deep Loam');
      setPreferredCropCycle(currentUser.preferredCropCycle || farmerProfile?.preferredCropCycle || 'Kharif Rice → Rabi Wheat → Summer Pulse');
      setProfileImage(currentUser.profileImage || '');
      setSpecialization(currentUser.specialization || 'Crop Protection & Soil Pathology');
      if (currentUser.languages && currentUser.languages.length > 0) {
        setLanguages(currentUser.languages);
      }
      if (currentUser.bio) {
        setBio(currentUser.bio);
      }
      if (currentUser.adviserName) {
        setAssignedAdviser(currentUser.adviserName);
      }
    } else if (farmerProfile) {
      setName(farmerProfile.farmerName);
      setFarmLocation(farmerProfile.farmLocation);
      setFarmAreaSize(farmerProfile.farmAreaSize);
      setUnitPreference(farmerProfile.unitPreference);
      setPrimaryWaterSource(farmerProfile.primaryWaterSource);
      setSoilTypeZone(farmerProfile.soilTypeZone);
      setPreferredCropCycle(farmerProfile.preferredCropCycle);
    }
  }, [currentUser, farmerProfile, isOpen]);

  if (!isOpen) return null;

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        setErrorMsg('Image file size must be less than 3MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = async () => {
        const photoData = reader.result as string;
        setProfileImage(photoData);

        // Immediate background sync to server
        if (currentUser?.phoneNumber) {
          try {
            await fetch('/api/user/profile/photo', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ phoneNumber: currentUser.phoneNumber, profileImage: photoData })
            });
          } catch (err) {
            console.warn('Could not sync photo to server immediately:', err);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemovePhoto = () => {
    setProfileImage('');
  };

  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      setGeoStatus('Geolocation is not supported by your device.');
      return;
    }
    setGeoLoading(true);
    setGeoStatus(null);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const loc = await getReverseGeocode(pos.coords.latitude, pos.coords.longitude);
          const fullLoc = `${loc.district}, ${loc.state} (${loc.country})`;
          setFarmLocation(fullLoc);
          if (loc.estimatedSoilType) {
            setSoilTypeZone(loc.estimatedSoilType);
          }
          setGeoStatus(`GPS detected: ${fullLoc}`);
        } catch {
          const fallback = `GPS Coordinates (${pos.coords.latitude.toFixed(3)}, ${pos.coords.longitude.toFixed(3)})`;
          setFarmLocation(fallback);
          setGeoStatus(`Coordinates saved: ${fallback}`);
        } finally {
          setGeoLoading(false);
        }
      },
      (err) => {
        setGeoLoading(false);
        setGeoStatus('Unable to access GPS location. Please check browser permissions.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const updates: Partial<UserAccount> = {
        farmerName: name,
        farmLocation,
        farmAreaSize: Number(farmAreaSize),
        unitPreference,
        primaryWaterSource,
        soilTypeZone,
        preferredCropCycle,
        profileImage,
        specialization,
        languages,
        bio,
      };

      const phone = currentUser?.phoneNumber || '9876543210';
      const updatedUser = await updateUserProfile(phone, updates);
      onProfileUpdated(updatedUser);
      setSuccessMsg('Your changes have been saved.');
      setIsEditing(false);
      setTimeout(() => {
        setSuccessMsg(null);
      }, 3000);
    } catch (err: any) {
      setErrorMsg(err.message || "We couldn't save your changes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fallbackAvatar = currentRole === 'admin'
    ? 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80'
    : currentRole === 'farmer_adviser'
    ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'
    : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80';

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className={`w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border my-8 ${
          currentRole === 'admin'
            ? 'bg-slate-900 border-slate-800 text-slate-100'
            : 'bg-white dark:bg-slate-900 border-emerald-200 dark:border-slate-800 text-slate-900 dark:text-slate-100'
        }`}
      >
        {/* Header */}
        <div className={`p-6 relative text-white ${
          currentRole === 'admin'
            ? 'bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900'
            : currentRole === 'farmer_adviser'
            ? 'bg-gradient-to-r from-[#1b2e1b] via-[#33691e] to-[#1b2e1b]'
            : 'bg-gradient-to-r from-[#1b2e1b] via-[#2e7d32] to-[#1b2e1b]'
        }`}>
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-white/80 hover:text-white bg-black/30 p-2 rounded-full border border-white/20 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3.5">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-white shadow-lg ${
              currentRole === 'admin' ? 'bg-rose-600' : currentRole === 'farmer_adviser' ? 'bg-amber-600' : 'bg-emerald-600'
            }`}>
              <User className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-bold font-serif text-white flex items-center gap-2">
                {currentRole === 'farmer' && '👤 My Profile'}
                {currentRole === 'farmer_adviser' && '🧑‍🌾 My Adviser Profile'}
                {currentRole === 'admin' && '🛡️ Administrator Profile'}
              </h3>
              <p className="text-xs text-emerald-200/90 dark:text-slate-300">
                {currentRole === 'farmer' && 'Your personal details, farm records, and assigned adviser.'}
                {currentRole === 'farmer_adviser' && 'Professional credentials, specialization, and farmer consultation details.'}
                {currentRole === 'admin' && 'System administrator identity, governance access, and security audit status.'}
              </p>
            </div>
          </div>
        </div>

        {/* Feedback banners */}
        {successMsg && (
          <div className="mx-6 mt-4 p-3.5 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-400 text-emerald-800 dark:text-emerald-300 rounded-2xl flex items-center gap-2 font-bold text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="mx-6 mt-4 p-3.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-400 text-rose-800 dark:text-rose-300 rounded-2xl flex items-center gap-2 font-bold text-xs">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-6">
          {/* Profile Photo Section with Preview, Replace & Remove */}
          <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
            <div className="relative group">
              <img
                src={profileImage || fallbackAvatar}
                alt="Profile Preview"
                className="w-20 h-20 rounded-2xl object-cover border-2 border-emerald-500 shadow-md"
              />
              {isEditing && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/60 rounded-2xl flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Change photo"
                >
                  <Camera className="w-5 h-5" />
                  <span className="text-[9px] font-bold mt-1">Upload</span>
                </button>
              )}
            </div>

            <div className="flex-1 text-center sm:text-left space-y-2">
              <div>
                <h4 className="text-base font-bold">{name || 'User Account'}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 font-mono">
                  {currentUser?.phoneNumber ? `+91 ${currentUser.phoneNumber}` : 'Mobile Number Verified'}
                </p>
              </div>

              {isEditing && (
                <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center gap-1.5"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Replace Photo</span>
                  </button>
                  {profileImage && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="px-3 py-1.5 rounded-xl bg-rose-100 dark:bg-rose-950/60 hover:bg-rose-200 text-rose-700 dark:text-rose-300 text-xs font-bold transition-colors flex items-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ============================================================ */}
          {/* FARMER PROFILE FIELDS */}
          {/* ============================================================ */}
          {currentRole === 'farmer' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Farmer Name */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-emerald-600" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    disabled={!isEditing}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-sm outline-none focus:border-emerald-500 disabled:bg-slate-100 dark:disabled:bg-slate-800/40"
                    required
                  />
                </div>

                {/* Mobile Number (Read-only for security) */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    Mobile Number (Verified)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={currentUser?.phoneNumber ? `+91 ${currentUser.phoneNumber}` : '+91 9876543210'}
                      disabled
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/40 font-mono font-bold text-sm text-slate-600 dark:text-slate-400 outline-none"
                    />
                    <span className="absolute right-3 top-3 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
                      Verified
                    </span>
                  </div>
                </div>

                {/* Farm Location */}
                <div className="space-y-1 sm:col-span-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                      Farm Location / Village
                    </label>
                    {isEditing && (
                      <button
                        type="button"
                        onClick={handleDetectGPS}
                        disabled={geoLoading}
                        className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                      >
                        {geoLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Compass className="w-3 h-3" />}
                        <span>Auto-Detect GPS</span>
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={farmLocation}
                    disabled={!isEditing}
                    onChange={(e) => setFarmLocation(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-sm outline-none focus:border-emerald-500 disabled:bg-slate-100 dark:disabled:bg-slate-800/40"
                    placeholder="e.g. Ludhiana District, Punjab"
                    required
                  />
                  {geoStatus && <p className="text-[11px] text-emerald-600 font-semibold">{geoStatus}</p>}
                </div>

                {/* Primary Crop */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-emerald-600" />
                    Primary Crop
                  </label>
                  <input
                    type="text"
                    value={primaryCrop}
                    disabled={!isEditing}
                    onChange={(e) => setPrimaryCrop(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-sm outline-none focus:border-emerald-500 disabled:bg-slate-100 dark:disabled:bg-slate-800/40"
                  />
                </div>

                {/* Farm Size */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Ruler className="w-3.5 h-3.5 text-emerald-600" />
                    Farm Size ({unitPreference === 'metric' ? 'Hectares' : 'Acres'})
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.1"
                    value={farmAreaSize}
                    disabled={!isEditing}
                    onChange={(e) => setFarmAreaSize(parseFloat(e.target.value) || 1)}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-sm outline-none focus:border-emerald-500 disabled:bg-slate-100 dark:disabled:bg-slate-800/40"
                  />
                </div>

                {/* Assigned Adviser (Read-only farmer trust card) */}
                <div className="space-y-1 sm:col-span-2 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60">
                  <label className="text-xs font-bold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-emerald-600" />
                    My Authorized Agronomy Adviser
                  </label>
                  <div className="flex items-center justify-between mt-1">
                    <div>
                      <p className="text-sm font-black text-emerald-950 dark:text-emerald-100">
                        {assignedAdviser}
                      </p>
                      <p className="text-[11px] text-emerald-700 dark:text-emerald-300 font-medium">
                        Direct video assistance & field prescription supervisor
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100 text-xs font-bold">
                      Assigned
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* ADVISER PROFILE FIELDS */}
          {/* ============================================================ */}
          {currentRole === 'farmer_adviser' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Adviser Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    disabled={!isEditing}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-sm outline-none focus:border-amber-500 disabled:bg-slate-100 dark:disabled:bg-slate-800/40"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Mobile Number (Verified)
                  </label>
                  <input
                    type="text"
                    value={currentUser?.phoneNumber ? `+91 ${currentUser.phoneNumber}` : '+91 9876543210'}
                    disabled
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/40 font-mono font-bold text-sm text-slate-600 dark:text-slate-400 outline-none"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Professional Specialization
                  </label>
                  <select
                    value={specialization}
                    disabled={!isEditing}
                    onChange={(e) => setSpecialization(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-sm outline-none focus:border-amber-500 disabled:bg-slate-100 dark:disabled:bg-slate-800/40"
                  >
                    <option value="Crop Protection & Soil Pathology">Crop Protection & Soil Pathology</option>
                    <option value="Precision Irrigation & Nutrient Management">Precision Irrigation & Nutrient Management</option>
                    <option value="Cereal & Pulse Rotation Agronomy">Cereal & Pulse Rotation Agronomy</option>
                    <option value="Horticulture & Greenhouse Technology">Horticulture & Greenhouse Technology</option>
                    <option value="Integrated Pest Management (IPM)">Integrated Pest Management (IPM)</option>
                  </select>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Consultation Languages Spoken
                  </label>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {['English', 'Hindi', 'Punjabi', 'Telugu', 'Bengali', 'Tamil', 'Marathi', 'Gujarati'].map((lang) => {
                      const isSelected = languages.includes(lang);
                      return (
                        <button
                          key={lang}
                          type="button"
                          disabled={!isEditing}
                          onClick={() => {
                            if (isSelected) {
                              setLanguages(languages.filter(l => l !== lang));
                            } else {
                              setLanguages([...languages, lang]);
                            }
                          }}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                            isSelected
                              ? 'bg-amber-600 text-white shadow-xs'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                          } ${!isEditing ? 'opacity-90 cursor-default' : 'cursor-pointer'}`}
                        >
                          {lang}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Professional Biography & Experience
                  </label>
                  <textarea
                    rows={3}
                    value={bio}
                    disabled={!isEditing}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium outline-none focus:border-amber-500 disabled:bg-slate-100 dark:disabled:bg-slate-800/40"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* ADMINISTRATOR PROFILE FIELDS */}
          {/* ============================================================ */}
          {currentRole === 'admin' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">
                    Administrator Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    disabled={!isEditing}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full p-3 rounded-xl border border-slate-700 bg-slate-800 font-bold text-sm outline-none focus:border-rose-500 disabled:bg-slate-800/40 text-white"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">
                    Mobile Number (Verified)
                  </label>
                  <input
                    type="text"
                    value={currentUser?.phoneNumber ? `+91 ${currentUser.phoneNumber}` : '+91 9999900000'}
                    disabled
                    className="w-full p-3 rounded-xl border border-slate-700 bg-slate-800/40 font-mono font-bold text-sm text-slate-400 outline-none"
                  />
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                    Assigned Role
                  </span>
                  <span className="text-sm font-bold text-rose-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    Platform Super Administrator
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                    Account Status
                  </span>
                  <span className="text-sm font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    Active & Authenticated
                  </span>
                </div>

                <div className="sm:col-span-2 p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-slate-400 font-bold block">
                    Security Governance
                  </span>
                  <p className="text-xs text-slate-300 font-medium">
                    Protected by PBKDF2 high-iteration salting, signed bearer tokens, and granular role authorization checks.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons & Secondary Security Triggers */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onOpenChangePassword}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer text-slate-700 dark:text-slate-200"
              >
                <Lock className="w-3.5 h-3.5 text-amber-500" />
                <span>Change Password</span>
              </button>

              {currentRole === 'admin' && onLogoutAllSessions && (
                <button
                  type="button"
                  onClick={onLogoutAllSessions}
                  className="px-4 py-2 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-xs font-bold transition-all flex items-center gap-1.5 border border-rose-800/40 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout All Sessions</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs text-white shadow-md transition-all cursor-pointer ${
                    currentRole === 'admin' ? 'bg-rose-600 hover:bg-rose-700' : currentRole === 'farmer_adviser' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 font-bold text-xs"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`px-5 py-2.5 rounded-xl font-bold text-xs text-white shadow-md transition-all flex items-center gap-2 cursor-pointer ${
                      currentRole === 'admin' ? 'bg-rose-600 hover:bg-rose-700' : currentRole === 'farmer_adviser' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'
                    }`}
                  >
                    {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                    <span>Save Changes</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
