import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sprout,
  MapPin,
  Compass,
  Ruler,
  FlaskConical,
  CheckCircle2,
  ChevronRight,
  ArrowLeft,
  X,
  Sparkles,
  Layers,
  HelpCircle,
  Wheat,
  ShieldCheck,
  Smartphone
} from 'lucide-react';
import { FarmerProfile } from '../../types';

interface FirstTimeFarmerOnboardingProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: Partial<FarmerProfile> & { primaryCrop?: string; farmSizeUnit?: string }) => void;
  currentProfile?: FarmerProfile | null;
}

const CROP_OPTIONS = [
  { id: 'wheat', name: 'Wheat (गेहूं)', icon: '🌾', category: 'Cereal' },
  { id: 'rice', name: 'Rice / Paddy (धान)', icon: '🍚', category: 'Cereal' },
  { id: 'cotton', name: 'Cotton (कपास)', icon: '🌱', category: 'Fiber' },
  { id: 'maize', name: 'Maize / Corn (मक्का)', icon: '🌽', category: 'Cereal' },
  { id: 'sugarcane', name: 'Sugarcane (गन्ना)', icon: '🎋', category: 'Cash' },
  { id: 'soybean', name: 'Soybean (सोयाबीन)', icon: '🫘', category: 'Legume' },
  { id: 'tomato', name: 'Tomato (टमाटर)', icon: '🍅', category: 'Vegetable' },
  { id: 'mustard', name: 'Mustard (सरसों)', icon: '🌼', category: 'Oilseed' },
];

const LOCATION_PRESETS = [
  'Punjab, India',
  'Maharashtra, India',
  'Haryana, India',
  'Uttar Pradesh, India',
  'Karnataka, India',
  'Madhya Pradesh, India',
  'Gujarat, India',
  'California, USA',
  'Other / Custom',
];

export const FirstTimeFarmerOnboarding: React.FC<FirstTimeFarmerOnboardingProps> = ({
  isOpen,
  onClose,
  onComplete,
  currentProfile,
}) => {
  const [step, setStep] = useState<number>(1);
  const totalSteps = 6;

  // Form states
  const [farmerName, setFarmerName] = useState<string>(currentProfile?.name || 'Farmer');
  const [farmName, setFarmName] = useState<string>(currentProfile?.farmName || 'Green Acres');
  const [location, setLocation] = useState<string>(currentProfile?.location || 'Punjab, India');
  const [selectedCrop, setSelectedCrop] = useState<string>('wheat');
  const [farmSize, setFarmSize] = useState<number>(currentProfile?.farmSize || 5);
  const [sizeUnit, setSizeUnit] = useState<string>('Acres');
  const [soilKnowledge, setSoilKnowledge] = useState<'know' | 'report' | 'dont_know'>('dont_know');
  const [isDetectingLocation, setIsDetectingLocation] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      finishOnboarding();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const finishOnboarding = () => {
    onComplete({
      name: farmerName,
      farmName: farmName,
      location: location,
      farmSize: farmSize,
      primaryCrop: selectedCrop,
      farmSizeUnit: sizeUnit,
    });
    localStorage.setItem('croperx_onboarding_completed', 'true');
    onClose();
  };

  const handleDetectGPS = () => {
    setIsDetectingLocation(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsDetectingLocation(false);
          setLocation(`Lat: ${pos.coords.latitude.toFixed(2)}, Lon: ${pos.coords.longitude.toFixed(2)}`);
        },
        () => {
          setIsDetectingLocation(false);
          setLocation('Punjab, India');
        },
        { timeout: 5000 }
      );
    } else {
      setIsDetectingLocation(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white rounded-3xl border border-[#c8e6c9] shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Header bar with step progress */}
        <div className="p-4 bg-[#f8fcf8] border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-[#2e7d32] bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              Step {step} of {totalSteps}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {step > 1 && step < totalSteps && (
              <button
                onClick={finishOnboarding}
                className="text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors px-2 py-1 cursor-pointer"
              >
                Skip for now
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Linear Progress Bar */}
        <div className="w-full bg-gray-100 h-1.5">
          <div
            className="bg-[#2e7d32] h-full transition-all duration-300 ease-out"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          <AnimatePresence mode="wait">
            {/* STEP 1: WELCOME */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5 text-center py-4"
              >
                <div className="w-20 h-20 mx-auto bg-gradient-to-br from-emerald-100 to-green-200 text-[#2e7d32] rounded-3xl flex items-center justify-center shadow-md border border-emerald-300">
                  <Sprout className="w-10 h-10" />
                </div>

                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-[#2e7d32] rounded-full text-xs font-mono font-bold">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Welcome to CroperX 2.0</span>
                  </div>
                  <h2 className="text-2xl font-bold text-[#1b2e1b] font-serif">
                    Your AI Assistant for Smarter Farming
                  </h2>
                  <p className="text-sm text-gray-600 max-w-sm mx-auto">
                    Get clear, actionable advice on watering, weather, soil health, crop protection, and mandi prices in seconds.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleNext}
                    className="w-full py-3.5 px-6 bg-[#1b2e1b] hover:bg-[#2e7d32] text-white font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
                  >
                    <span>Get Started</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 2: YOUR FARM LOCATION */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <div className="space-y-1">
                  <div className="text-xs font-mono font-bold text-[#2e7d32] uppercase">
                    Step 2: Location
                  </div>
                  <h2 className="text-xl font-bold text-[#1b2e1b] font-serif flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-[#2e7d32]" />
                    <span>Where is your farm?</span>
                  </h2>
                  <p className="text-xs text-gray-600">
                    We use your location to give you accurate local weather forecasts and rain alerts.
                  </p>
                </div>

                {/* GPS auto-detect button */}
                <button
                  onClick={handleDetectGPS}
                  disabled={isDetectingLocation}
                  className="w-full p-3.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-2xl text-[#1b2e1b] font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Compass className={`w-4 h-4 text-[#2e7d32] ${isDetectingLocation ? 'animate-spin' : ''}`} />
                  <span>{isDetectingLocation ? 'Detecting your GPS location...' : '📍 Use Current GPS Location'}</span>
                </button>

                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-gray-200"></div>
                  <span className="flex-shrink mx-3 text-xs text-gray-400 font-mono">OR CHOOSE REGION</span>
                  <div className="flex-grow border-t border-gray-200"></div>
                </div>

                {/* Region selector */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-700">Farming Region / State</label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl text-xs font-medium text-gray-900 focus:outline-none focus:border-[#4CAF50]"
                  >
                    {LOCATION_PRESETS.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-700">Farm / Land Name (Optional)</label>
                  <input
                    type="text"
                    value={farmName}
                    onChange={(e) => setFarmName(e.target.value)}
                    placeholder="e.g. North Ridge Farm"
                    className="w-full p-3 bg-gray-50 border border-gray-300 rounded-xl text-xs font-medium text-gray-900 focus:outline-none focus:border-[#4CAF50]"
                  />
                </div>
              </motion.div>
            )}

            {/* STEP 3: YOUR CROP */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <div className="text-xs font-mono font-bold text-[#2e7d32] uppercase">
                    Step 3: Primary Crop
                  </div>
                  <h2 className="text-xl font-bold text-[#1b2e1b] font-serif flex items-center gap-2">
                    <Wheat className="w-5 h-5 text-[#2e7d32]" />
                    <span>What are you growing?</span>
                  </h2>
                  <p className="text-xs text-gray-600">
                    Select your main crop to customize fertilizer, watering, and pest protection advice.
                  </p>
                </div>

                {/* Crop Grid */}
                <div className="grid grid-cols-2 gap-2.5 max-h-60 overflow-y-auto custom-scrollbar p-1">
                  {CROP_OPTIONS.map((crop) => {
                    const isSelected = selectedCrop === crop.id;
                    return (
                      <button
                        key={crop.id}
                        onClick={() => setSelectedCrop(crop.id)}
                        className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-50 border-[#2e7d32] ring-2 ring-[#2e7d32]/20 shadow-xs'
                            : 'bg-white hover:bg-gray-50 border-gray-200'
                        }`}
                      >
                        <span className="text-2xl">{crop.icon}</span>
                        <div>
                          <div className="text-xs font-bold text-gray-900 line-clamp-1">
                            {crop.name}
                          </div>
                          <div className="text-[10px] text-gray-500 font-mono">
                            {crop.category}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* STEP 4: FARM SIZE */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <div className="space-y-1">
                  <div className="text-xs font-mono font-bold text-[#2e7d32] uppercase">
                    Step 4: Land Size
                  </div>
                  <h2 className="text-xl font-bold text-[#1b2e1b] font-serif flex items-center gap-2">
                    <Ruler className="w-5 h-5 text-[#2e7d32]" />
                    <span>How large is your farm?</span>
                  </h2>
                  <p className="text-xs text-gray-600">
                    We use farm size to calculate fertilizer quantities (bags) and irrigation schedules.
                  </p>
                </div>

                <div className="p-5 bg-emerald-50/50 rounded-2xl border border-emerald-200 space-y-4">
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-700">Total Cultivated Area</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="0.5"
                        step="0.5"
                        value={farmSize}
                        onChange={(e) => setFarmSize(parseFloat(e.target.value) || 1)}
                        className="flex-1 p-3 bg-white border border-gray-300 rounded-xl text-sm font-bold text-gray-900 focus:outline-none focus:border-[#4CAF50]"
                      />
                      <select
                        value={sizeUnit}
                        onChange={(e) => setSizeUnit(e.target.value)}
                        className="p-3 bg-white border border-gray-300 rounded-xl text-xs font-bold text-gray-800 focus:outline-none"
                      >
                        <option value="Acres">Acres (एकड़)</option>
                        <option value="Hectares">Hectares (हेक्टेयर)</option>
                        <option value="Bigha">Bigha (बीघा)</option>
                        <option value="Guntha">Guntha (गुंठा)</option>
                      </select>
                    </div>
                  </div>

                  <div className="text-[11px] text-gray-600 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Approx. {farmSize} {sizeUnit} dedicated to active cultivation.</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 5: SOIL INFORMATION */}
            {step === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="space-y-1">
                  <div className="text-xs font-mono font-bold text-[#2e7d32] uppercase">
                    Step 5: Soil Telemetry
                  </div>
                  <h2 className="text-xl font-bold text-[#1b2e1b] font-serif flex items-center gap-2">
                    <FlaskConical className="w-5 h-5 text-[#2e7d32]" />
                    <span>Do you know your soil values?</span>
                  </h2>
                  <p className="text-xs text-gray-600">
                    Don't worry if you don't have soil lab test results yet. CroperX works with regional averages.
                  </p>
                </div>

                <div className="space-y-2.5">
                  {[
                    {
                      id: 'know',
                      title: 'I know my soil values (NPK / pH)',
                      desc: 'I have specific numbers to enter.',
                      icon: '🧪'
                    },
                    {
                      id: 'report',
                      title: 'I have a soil health card / report',
                      desc: 'I can upload or review later.',
                      icon: '📄'
                    },
                    {
                      id: 'dont_know',
                      title: "I don't know (Use regional defaults)",
                      desc: 'CroperX will use standard fertile soil estimates.',
                      icon: '🌱'
                    },
                  ].map((opt) => {
                    const isSelected = soilKnowledge === opt.id;
                    return (
                      <button
                        key={opt.id}
                        onClick={() => setSoilKnowledge(opt.id as any)}
                        className={`w-full p-3.5 rounded-2xl border text-left flex items-center gap-3.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-50 border-[#2e7d32] ring-2 ring-[#2e7d32]/20'
                            : 'bg-white hover:bg-gray-50 border-gray-200'
                        }`}
                      >
                        <span className="text-2xl">{opt.icon}</span>
                        <div className="space-y-0.5">
                          <div className="text-xs font-bold text-gray-900">{opt.title}</div>
                          <div className="text-[11px] text-gray-500">{opt.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* STEP 6: READY */}
            {step === 6 && (
              <motion.div
                key="step6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5 text-center py-3"
              >
                <div className="w-16 h-16 mx-auto bg-emerald-100 text-[#2e7d32] rounded-3xl flex items-center justify-center shadow-sm">
                  <ShieldCheck className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-[#2e7d32] rounded-full text-xs font-mono font-bold">
                    <span>🎉 Setup Complete</span>
                  </div>
                  <h2 className="text-2xl font-bold text-[#1b2e1b] font-serif">
                    Your Farm Is Ready!
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 max-w-sm mx-auto">
                    CroperX will now guide you with daily watering schedules, rain forecasts, fertilizer plans, and crop health advice.
                  </p>
                </div>

                {/* Summary Card */}
                <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 text-left space-y-1.5 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">📍 Location:</span>
                    <strong className="text-gray-900">{location}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">🌾 Main Crop:</span>
                    <strong className="text-gray-900 uppercase font-mono">{selectedCrop}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">📐 Size:</span>
                    <strong className="text-gray-900">{farmSize} {sizeUnit}</strong>
                  </div>
                </div>

                <button
                  onClick={finishOnboarding}
                  className="w-full py-3.5 px-6 bg-[#2e7d32] hover:bg-[#1b2e1b] text-white font-bold rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer text-sm"
                >
                  <Sprout className="w-4 h-4" />
                  <span>Open My Farm</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Navigation (Steps 2 to 5) */}
        {step > 1 && step < totalSteps && (
          <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <button
              onClick={handleBack}
              className="py-2.5 px-4 bg-white hover:bg-gray-100 text-gray-700 font-bold rounded-xl border border-gray-200 text-xs flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <button
              onClick={handleNext}
              className="py-2.5 px-5 bg-[#1b2e1b] hover:bg-[#2e7d32] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
