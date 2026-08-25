import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Camera, 
  Upload, 
  Check, 
  AlertCircle, 
  Calendar, 
  Sprout, 
  Scale, 
  Droplets, 
  Award, 
  MapPin, 
  FileText,
  Trash2,
  Sparkles
} from 'lucide-react';

export interface HarvestRecord {
  id: string;
  cropName: string;
  harvestDate: string;
  plotZone: string;
  actualYieldTonsPerHa: number;
  grainMoisturePercent: number;
  qualityGrade: 'Grade A Premium' | 'Grade B Standard' | 'Grade C Commercial';
  storageLocation: string;
  photoUrl?: string; // Data URL or URL
  notes?: string;
  loggedAt: string;
}

interface HarvestLoggingModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCropName?: string;
  onHarvestSaved?: (record: HarvestRecord) => void;
}

export const HarvestLoggingModal: React.FC<HarvestLoggingModalProps> = ({
  isOpen,
  onClose,
  defaultCropName = 'Rice',
  onHarvestSaved
}) => {
  const [cropName, setCropName] = useState(defaultCropName);
  const [harvestDate, setHarvestDate] = useState(new Date().toISOString().split('T')[0]);
  const [plotZone, setPlotZone] = useState('Sector A (Plot 1)');
  const [actualYield, setActualYield] = useState<number>(4.5);
  const [grainMoisture, setGrainMoisture] = useState<number>(13.5);
  const [qualityGrade, setQualityGrade] = useState<'Grade A Premium' | 'Grade B Standard' | 'Grade C Commercial'>('Grade A Premium');
  const [storageLocation, setStorageLocation] = useState('Silo 2 - Moisture Controlled Dry Shed');
  const [notes, setNotes] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | undefined>();

  const [saving, setSaving] = useState(false);
  const [successToast, setSuccessToast] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Photo Upload / Camera Sample Handler
  const handlePhotoCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        setErrorMsg("Photo file size exceeds 8MB limit.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setPhotoUrl(reader.result as string);
          setErrorMsg(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cropName || !actualYield) {
      setErrorMsg("Please provide crop name and valid yield number.");
      return;
    }

    setSaving(true);
    setErrorMsg(null);

    const newRecord: HarvestRecord = {
      id: 'harv_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      cropName,
      harvestDate,
      plotZone,
      actualYieldTonsPerHa: Number(actualYield),
      grainMoisturePercent: Number(grainMoisture),
      qualityGrade,
      storageLocation,
      photoUrl,
      notes,
      loggedAt: new Date().toISOString()
    };

    // Save to localStorage
    try {
      const existing: HarvestRecord[] = JSON.parse(localStorage.getItem('croperx_harvest_logs') || '[]');
      const updated = [newRecord, ...existing];
      localStorage.setItem('croperx_harvest_logs', JSON.stringify(updated));
      if (onHarvestSaved) onHarvestSaved(newRecord);
    } catch (e) {
      console.error("Save harvest error:", e);
    }

    setSaving(false);
    setSuccessToast(true);
    setTimeout(() => {
      setSuccessToast(false);
      onClose();
    }, 1200);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white border border-[#c8e6c9] rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden my-auto max-h-[92vh] flex flex-col"
        >
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-[#1b2e1b] via-[#2e7d32] to-[#1b2e1b] p-5 text-white relative shrink-0">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#4CAF50] rounded-2xl flex items-center justify-center text-white shadow-lg">
                <Sprout className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold">Log Harvest Performance Record</h3>
                <p className="text-xs text-[#a5d6a7]">Mobile-First Harvest Yield & Crop Sample Logger</p>
              </div>
            </div>
          </div>

          {/* Form Body */}
          <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 text-xs">
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successToast && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Harvest record & photo sample saved successfully!</span>
              </div>
            )}

            {/* Photo Upload / Sample Image */}
            <div className="space-y-2">
              <label className="font-bold text-[#1b2e1b] flex items-center gap-1.5 text-xs">
                <Camera className="w-4 h-4 text-[#2e7d32]" />
                Harvest Crop Sample Photo
              </label>

              {photoUrl ? (
                <div className="relative rounded-2xl overflow-hidden border-2 border-[#4CAF50] h-40 bg-black/5 group">
                  <img src={photoUrl} alt="Harvest Sample" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setPhotoUrl(undefined)}
                    className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-lg opacity-80 hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <span className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-md font-mono">
                    ✓ Sample Photo Linked
                  </span>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-[#c8e6c9] hover:border-[#4CAF50] rounded-2xl bg-[#f8fcf8] cursor-pointer transition-colors text-center space-y-2">
                  <Upload className="w-8 h-8 text-[#4CAF50]" />
                  <div>
                    <span className="font-bold text-[#1b2e1b] block">Upload or Take Photo of Harvest Sample</span>
                    <span className="text-[10px] text-gray-500">Supports JPG, PNG, WEBP (Max 8MB)</span>
                  </div>
                  <input type="file" accept="image/*" capture="environment" onChange={handlePhotoCapture} className="hidden" />
                </label>
              )}
            </div>

            {/* Crop Name & Plot Zone */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-[#1b2e1b] block mb-1">Crop Name</label>
                <input
                  type="text"
                  required
                  value={cropName}
                  onChange={(e) => setCropName(e.target.value)}
                  className="w-full p-2.5 bg-[#f8fcf8] border border-[#c8e6c9] rounded-xl font-bold outline-none focus:border-[#4CAF50]"
                  placeholder="e.g. Rice, Wheat, Maize"
                />
              </div>

              <div>
                <label className="font-bold text-[#1b2e1b] block mb-1">Plot Zone / Sector</label>
                <input
                  type="text"
                  required
                  value={plotZone}
                  onChange={(e) => setPlotZone(e.target.value)}
                  className="w-full p-2.5 bg-[#f8fcf8] border border-[#c8e6c9] rounded-xl font-bold outline-none focus:border-[#4CAF50]"
                  placeholder="e.g. Sector A1"
                />
              </div>
            </div>

            {/* Yield & Moisture */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-[#1b2e1b] block mb-1 flex items-center gap-1">
                  <Scale className="w-3.5 h-3.5 text-[#2e7d32]" />
                  Actual Yield (Tons/ha)
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={actualYield}
                  onChange={(e) => setActualYield(Number(e.target.value))}
                  className="w-full p-2.5 bg-[#f8fcf8] border border-[#c8e6c9] rounded-xl font-mono font-bold outline-none focus:border-[#4CAF50]"
                />
              </div>

              <div>
                <label className="font-bold text-[#1b2e1b] block mb-1 flex items-center gap-1">
                  <Droplets className="w-3.5 h-3.5 text-[#2e7d32]" />
                  Grain Moisture (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={grainMoisture}
                  onChange={(e) => setGrainMoisture(Number(e.target.value))}
                  className="w-full p-2.5 bg-[#f8fcf8] border border-[#c8e6c9] rounded-xl font-mono font-bold outline-none focus:border-[#4CAF50]"
                />
              </div>
            </div>

            {/* Quality Grade & Harvest Date */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-[#1b2e1b] block mb-1 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-[#2e7d32]" />
                  Quality Grade
                </label>
                <select
                  value={qualityGrade}
                  onChange={(e) => setQualityGrade(e.target.value as any)}
                  className="w-full p-2.5 bg-[#f8fcf8] border border-[#c8e6c9] rounded-xl font-bold outline-none focus:border-[#4CAF50]"
                >
                  <option value="Grade A Premium">Grade A Premium</option>
                  <option value="Grade B Standard">Grade B Standard</option>
                  <option value="Grade C Commercial">Grade C Commercial</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-[#1b2e1b] block mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#2e7d32]" />
                  Harvest Date
                </label>
                <input
                  type="date"
                  required
                  value={harvestDate}
                  onChange={(e) => setHarvestDate(e.target.value)}
                  className="w-full p-2.5 bg-[#f8fcf8] border border-[#c8e6c9] rounded-xl font-bold outline-none focus:border-[#4CAF50]"
                />
              </div>
            </div>

            {/* Storage Location */}
            <div>
              <label className="font-bold text-[#1b2e1b] block mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#2e7d32]" />
                Storage Shed / Silo Location
              </label>
              <input
                type="text"
                value={storageLocation}
                onChange={(e) => setStorageLocation(e.target.value)}
                className="w-full p-2.5 bg-[#f8fcf8] border border-[#c8e6c9] rounded-xl font-bold outline-none focus:border-[#4CAF50]"
                placeholder="e.g. Silo 2 Dry Shed"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="font-bold text-[#1b2e1b] block mb-1 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-[#2e7d32]" />
                Harvest Notes & Field Observations
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-2.5 bg-[#f8fcf8] border border-[#c8e6c9] rounded-xl font-medium outline-none focus:border-[#4CAF50]"
                placeholder="e.g. Excellent grain size; minimal pest damage observed."
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={saving}
              className="w-full py-3.5 bg-[#1b2e1b] hover:bg-[#2e7d32] text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm mt-2"
            >
              <Sparkles className="w-4 h-4 text-[#4CAF50]" />
              <span>Save Harvest Yield Record</span>
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
