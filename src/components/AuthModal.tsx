import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserAccount } from '../types';
import { loginUser, registerUser, resetUserPassword, requestAuthOtp, getReverseGeocode } from '../services/authService';
import { User, Phone, Lock, MapPin, Camera, Sparkles, Check, AlertCircle, Loader2, X, Upload, Compass, Eye, EyeOff, ShieldCheck, Zap, KeyRound, CheckCircle2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: UserAccount) => void;
}

const AVATAR_PRESETS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80"
];

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onAuthSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register' | 'reset'>('login');
  
  // Login State
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register State
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [farmerName, setFarmerName] = useState('');
  const [farmLocation, setFarmLocation] = useState('');
  const [profileImage, setProfileImage] = useState(AVATAR_PRESETS[0]);
  const [farmAreaSize, setFarmAreaSize] = useState(5);
  const [preferredCropCycle, setPreferredCropCycle] = useState('Kharif Rice → Rabi Wheat → Summer Pulse');
  const [primaryWaterSource, setPrimaryWaterSource] = useState('Borewell Drip Irrigation');
  const [soilTypeZone, setSoilTypeZone] = useState('Alluvial Loam');
  const [latitude, setLatitude] = useState<number | undefined>();
  const [longitude, setLongitude] = useState<number | undefined>();
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('');

  // Password Reset State
  const [resetPhone, setResetPhone] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [resetStep, setResetStep] = useState<1 | 2>(1);

  // UI state
  const [loading, setLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Evaluate Password Strength
  const evaluatePasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: 'None', color: 'bg-gray-200' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass) || /[A-Z]/.test(pass)) score += 1;

    switch (score) {
      case 1:
        return { score, label: 'Weak (min 6 chars)', color: 'bg-red-500' };
      case 2:
        return { score, label: 'Fair', color: 'bg-amber-500' };
      case 3:
        return { score, label: 'Good & Secure', color: 'bg-blue-500' };
      case 4:
        return { score, label: 'Strong Protection', color: 'bg-emerald-500' };
      default:
        return { score: 0, label: 'Too Short', color: 'bg-gray-300' };
    }
  };

  // Quick Demo Login Handler
  const handleQuickDemoLogin = async () => {
    setLoginPhone('+91 9876543210');
    setLoginPassword('farmer123');
    setLoading(true);
    setError(null);
    try {
      const res = await loginUser('+919876543210', 'farmer123');
      onAuthSuccess(res.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Quick login failed.');
    } finally {
      setLoading(false);
    }
  };

  // Handle GPS location detection
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setGeoLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        setLatitude(lat);
        setLongitude(lon);

        try {
          const locationInfo = await getReverseGeocode(lat, lon);
          setDistrict(locationInfo.district);
          setState(locationInfo.state);
          setFarmLocation(`${locationInfo.district}, ${locationInfo.state}`);
          if (locationInfo.estimatedSoilType) {
            setSoilTypeZone(locationInfo.estimatedSoilType);
          }
          setSuccessMsg(`GPS Location detected: ${locationInfo.district}, ${locationInfo.state}`);
          setTimeout(() => setSuccessMsg(null), 4000);
        } catch (e: any) {
          setFarmLocation(`Lat: ${lat.toFixed(3)}, Lon: ${lon.toFixed(3)}`);
        } finally {
          setGeoLoading(false);
        }
      },
      (err) => {
        setGeoLoading(false);
        setError("Unable to retrieve GPS location. Please allow location permissions in your browser.");
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Custom Profile Image Upload Handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("File size exceeds 5MB limit.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setProfileImage(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginPhone || !loginPassword) {
      setError("Please fill in both phone number and password.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await loginUser(loginPhone, loginPassword);
      onAuthSuccess(res.user);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to log in.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regPhone || !regPassword || !farmerName) {
      setError("Please fill in phone number, password, and your name.");
      return;
    }

    if (regPassword.length < 6) {
      setError("Password must be at least 6 characters for security.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await registerUser({
        phoneNumber: regPhone,
        password: regPassword,
        farmerName,
        profileImage,
        farmLocation: farmLocation || "Green Valley Farm",
        farmAreaSize,
        unitPreference: 'metric',
        preferredCropCycle,
        primaryWaterSource,
        soilTypeZone,
        targetPhGoal: 6.5,
        latitude,
        longitude,
        district,
        state
      });

      setSuccessMsg("Account created successfully with secure encryption!");
      setTimeout(() => {
        onAuthSuccess(res.user);
        onClose();
      }, 800);
    } catch (err: any) {
      setError(err.message || "Failed to create account.");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestResetOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPhone || resetPhone.length < 8) {
      setError("Please enter a valid mobile number.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const res = await requestAuthOtp(resetPhone, 'password_reset');
      setSuccessMsg(res.message || "Verification code sent to your mobile number.");
      setResetCode('');
      setResetStep(2);
    } catch (err: any) {
      setError(err.message || "Failed to send verification SMS.");
    } finally {
      setLoading(false);
    }
  };

  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetCode || resetCode.length < 4) {
      setError("Please enter the 6-digit verification code received on your mobile.");
      return;
    }
    if (!resetNewPassword || resetNewPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const msg = await resetUserPassword(resetPhone, resetNewPassword, resetCode);
      setSuccessMsg(msg);
      setTimeout(() => {
        setMode('login');
        setLoginPhone(resetPhone);
        setLoginPassword(resetNewPassword);
        setResetStep(1);
        setSuccessMsg("Password reset completed! Please log in now.");
      }, 1200);
    } catch (err: any) {
      setError(err.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  const strength = evaluatePasswordStrength(regPassword);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white border border-[#c8e6c9] rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden my-8"
        >
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-[#1b2e1b] via-[#2e7d32] to-[#1b2e1b] p-6 text-white relative">
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-[#4CAF50] rounded-xl flex items-center justify-center shadow-lg">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold tracking-tight">CroperX Secure Account</h2>
                <p className="text-xs text-[#a5d6a7]">Encrypted Phone Auth & Farmer Profile</p>
              </div>
            </div>

            {/* Tab Controls */}
            <div className="grid grid-cols-3 gap-1.5 mt-5 p-1 bg-black/20 rounded-2xl">
              <button
                onClick={() => { setMode('login'); setError(null); setSuccessMsg(null); }}
                className={`py-2 text-xs font-bold rounded-xl transition-all ${
                  mode === 'login' ? 'bg-white text-[#1b2e1b] shadow-md' : 'text-white/80 hover:text-white'
                }`}
              >
                Log In
              </button>
              <button
                onClick={() => { setMode('register'); setError(null); setSuccessMsg(null); }}
                className={`py-2 text-xs font-bold rounded-xl transition-all ${
                  mode === 'register' ? 'bg-white text-[#1b2e1b] shadow-md' : 'text-white/80 hover:text-white'
                }`}
              >
                Register
              </button>
              <button
                onClick={() => { setMode('reset'); setError(null); setSuccessMsg(null); setResetStep(1); }}
                className={`py-2 text-xs font-bold rounded-xl transition-all ${
                  mode === 'reset' ? 'bg-white text-[#1b2e1b] shadow-md' : 'text-white/80 hover:text-white'
                }`}
              >
                Reset PIN
              </button>
            </div>
          </div>

          <div className="p-6 max-h-[75vh] overflow-y-auto">
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{successMsg}</span>
              </div>
            )}

            {mode === 'login' && (
              /* LOGIN FORM */
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {/* One-Click Quick Demo Login */}
                <div className="p-3 bg-gradient-to-r from-emerald-50 to-amber-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-[#1b2e1b] flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
                      <span>Instant Demo Access</span>
                    </div>
                    <div className="text-[11px] text-gray-600">Pre-configured test account (+91 9876543210)</div>
                  </div>
                  <button
                    type="button"
                    onClick={handleQuickDemoLogin}
                    disabled={loading}
                    className="px-3 py-1.5 bg-[#2e7d32] hover:bg-[#1b2e1b] text-white text-xs font-bold rounded-xl shadow transition-all flex items-center gap-1"
                  >
                    <span>1-Click Login</span>
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1b2e1b] mb-1.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#2e7d32]" />
                    Registered Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="e.g. +91 9876543210 or 9876543210"
                    value={loginPhone}
                    onChange={(e) => setLoginPhone(e.target.value)}
                    className="w-full p-3 bg-[#f8fcf8] border border-[#c8e6c9] rounded-xl text-sm font-semibold outline-none focus:border-[#4CAF50]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-[#1b2e1b] flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-[#2e7d32]" />
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setMode('reset')}
                      className="text-[11px] font-bold text-[#2e7d32] hover:underline"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showLoginPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full p-3 pr-10 bg-[#f8fcf8] border border-[#c8e6c9] rounded-xl text-sm font-semibold outline-none focus:border-[#4CAF50]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 bg-[#1b2e1b] hover:bg-[#2e7d32] text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying Credentials...</span>
                    </>
                  ) : (
                    <span>Log In to Account</span>
                  )}
                </button>
              </form>
            )}

            {mode === 'register' && (
              /* REGISTER FORM */
              <form onSubmit={handleRegisterSubmit} className="space-y-4">
                {/* Profile Image & Avatar Selection */}
                <div>
                  <label className="block text-xs font-bold text-[#1b2e1b] mb-2 flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5 text-[#2e7d32]" />
                    Profile Picture / Avatar
                  </label>
                  <div className="flex items-center gap-4">
                    <img
                      src={profileImage}
                      alt="Farmer Avatar"
                      className="w-16 h-16 rounded-full border-2 border-[#4CAF50] object-cover shadow-sm shrink-0"
                    />
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap gap-2">
                        {AVATAR_PRESETS.map((preset, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setProfileImage(preset)}
                            className={`w-8 h-8 rounded-full border-2 overflow-hidden transition-all ${
                              profileImage === preset ? 'border-[#2e7d32] scale-110 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                            }`}
                          >
                            <img src={preset} alt="avatar option" className="w-full h-full object-cover" />
                          </button>
                        ))}
                      </div>

                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#f8fcf8] hover:bg-[#e8f5e9] border border-[#c8e6c9] rounded-lg text-xs font-bold text-[#1b2e1b] cursor-pointer transition-colors">
                        <Upload className="w-3.5 h-3.5 text-[#4CAF50]" />
                        <span>Upload Photo</span>
                        <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#1b2e1b] mb-1">Farmer Full Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Kumar"
                      value={farmerName}
                      onChange={(e) => setFarmerName(e.target.value)}
                      className="w-full p-2.5 bg-[#f8fcf8] border border-[#c8e6c9] rounded-xl text-xs font-bold outline-none focus:border-[#4CAF50]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1b2e1b] mb-1">Phone Number</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +91 9876543210"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      className="w-full p-2.5 bg-[#f8fcf8] border border-[#c8e6c9] rounded-xl text-xs font-bold outline-none focus:border-[#4CAF50]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1b2e1b] mb-1">Password (min 6 characters)</label>
                  <div className="relative">
                    <input
                      type={showRegPassword ? "text" : "password"}
                      required
                      placeholder="Create a strong password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full p-2.5 pr-10 bg-[#f8fcf8] border border-[#c8e6c9] rounded-xl text-xs font-bold outline-none focus:border-[#4CAF50]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    >
                      {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Password Strength Meter */}
                  {regPassword && (
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center justify-between text-[10px] font-bold">
                        <span className="text-gray-500">Security Strength:</span>
                        <span className="text-gray-800">{strength.label}</span>
                      </div>
                      <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${strength.color}`}
                          style={{ width: `${(strength.score / 4) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Farm Location with GPS Trigger */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-[#1b2e1b] flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#2e7d32]" />
                      Farm Location & District
                    </label>
                    <button
                      type="button"
                      onClick={handleDetectGPS}
                      disabled={geoLoading}
                      className="text-[11px] font-bold text-[#2e7d32] hover:text-[#1b2e1b] flex items-center gap-1 bg-[#e8f5e9] px-2 py-0.5 rounded-md border border-[#c8e6c9] transition-all"
                    >
                      {geoLoading ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin text-[#2e7d32]" />
                          <span>Locating...</span>
                        </>
                      ) : (
                        <>
                          <Compass className="w-3 h-3 text-[#2e7d32]" />
                          <span>Detect GPS</span>
                        </>
                      )}
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="e.g. Ludhiana, Punjab"
                    value={farmLocation}
                    onChange={(e) => setFarmLocation(e.target.value)}
                    className="w-full p-2.5 bg-[#f8fcf8] border border-[#c8e6c9] rounded-xl text-xs font-bold outline-none focus:border-[#4CAF50]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#1b2e1b] mb-1">Farm Area (Acres/Hectares)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={farmAreaSize}
                      onChange={(e) => setFarmAreaSize(Number(e.target.value))}
                      className="w-full p-2.5 bg-[#f8fcf8] border border-[#c8e6c9] rounded-xl text-xs font-bold outline-none focus:border-[#4CAF50]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1b2e1b] mb-1">Soil Zone Classification</label>
                    <select
                      value={soilTypeZone}
                      onChange={(e) => setSoilTypeZone(e.target.value)}
                      className="w-full p-2.5 bg-[#f8fcf8] border border-[#c8e6c9] rounded-xl text-xs font-bold outline-none focus:border-[#4CAF50]"
                    >
                      <option value="Alluvial Loam">Alluvial Loam</option>
                      <option value="Black Cotton Soil">Black Cotton Soil</option>
                      <option value="Red Sandy Soil">Red Sandy Soil</option>
                      <option value="Clay Loam">Clay Loam</option>
                      <option value="Laterite Acidic Soil">Laterite Acidic Soil</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#1b2e1b] hover:bg-[#2e7d32] text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Encrypting & Saving Account...</span>
                    </>
                  ) : (
                    <span>Complete Secure Registration</span>
                  )}
                </button>
              </form>
            )}

            {mode === 'reset' && (
              /* RESET PASSWORD WORKFLOW */
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 border border-blue-200 text-blue-900 text-xs rounded-2xl flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-blue-600 shrink-0" />
                  <span>Reset password via SMS Verification Code to recover your account securely.</span>
                </div>

                {resetStep === 1 ? (
                  <form onSubmit={handleRequestResetOTP} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-[#1b2e1b] mb-1.5 flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-[#2e7d32]" />
                        Enter Registered Phone Number
                      </label>
                      <input
                        type="tel"
                        required
                        placeholder="e.g. +91 9876543210"
                        value={resetPhone}
                        onChange={(e) => setResetPhone(e.target.value)}
                        className="w-full p-3 bg-[#f8fcf8] border border-[#c8e6c9] rounded-xl text-sm font-semibold outline-none focus:border-[#4CAF50]"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-[#1b2e1b] hover:bg-[#2e7d32] text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Sending Verification SMS...</span>
                        </>
                      ) : (
                        <span>Send Verification Code</span>
                      )}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleResetSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-[#1b2e1b] mb-1">6-Digit SMS Verification Code</label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        placeholder="Enter 6-digit code"
                        value={resetCode}
                        onChange={(e) => setResetCode(e.target.value)}
                        className="w-full p-2.5 bg-[#f8fcf8] border border-[#c8e6c9] rounded-xl text-sm font-mono text-center tracking-widest outline-none focus:border-[#4CAF50]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#1b2e1b] mb-1">New Password (min 6 chars)</label>
                      <div className="relative">
                        <input
                          type={showResetPassword ? "text" : "password"}
                          required
                          placeholder="Enter new password"
                          value={resetNewPassword}
                          onChange={(e) => setResetNewPassword(e.target.value)}
                          className="w-full p-2.5 pr-10 bg-[#f8fcf8] border border-[#c8e6c9] rounded-xl text-xs font-bold outline-none focus:border-[#4CAF50]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowResetPassword(!showResetPassword)}
                          className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                        >
                          {showResetPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 bg-[#2e7d32] hover:bg-[#1b2e1b] text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Updating Password...</span>
                        </>
                      ) : (
                        <span>Save New Password & Log In</span>
                      )}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Security Footer Notice */}
            <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-center gap-1.5 text-[10px] text-gray-500">
              <ShieldCheck className="w-3.5 h-3.5 text-[#2e7d32]" />
              <span>PBKDF2 HMAC-SHA512 Password Encryption • Brute-Force Rate Protection Active</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

