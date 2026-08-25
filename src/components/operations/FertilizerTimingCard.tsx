import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  FlaskConical, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  Calendar, 
  ShieldCheck, 
  Clock, 
  History, 
  ChevronRight,
  Droplets,
  CloudRain
} from 'lucide-react';
import { FertilizerRecord } from '../../types/operations/farmOperationsTypes';
import { farmTaskService } from '../../services/operations/farmTaskService';

interface FertilizerTimingCardProps {
  cropName: string;
  growthStage: string;
  soilMoisture: number;
  soilN: number;
  soilP: number;
  soilK: number;
  weatherRainProb: number;
  weatherRainfallForecastMm: number;
  isExpertMode?: boolean;
  onSelectTab: (tabId: string) => void;
}

export const FertilizerTimingCard: React.FC<FertilizerTimingCardProps> = ({
  cropName,
  growthStage,
  soilMoisture,
  soilN,
  soilP,
  soilK,
  weatherRainProb,
  weatherRainfallForecastMm,
  isExpertMode = false,
  onSelectTab
}) => {
  const [history, setHistory] = useState<FertilizerRecord[]>(() => farmTaskService.getFertilizerHistory());
  const [isAddingRecord, setIsAddingRecord] = useState(false);

  // Form states
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [fertilizerType, setFertilizerType] = useState('Urea (46% N)');
  const [amountKg, setAmountKg] = useState('25');
  const [fieldZone, setFieldZone] = useState('Main Field (Zone A)');
  const [notes, setNotes] = useState('');

  const lastApplication = history[0];
  const daysSinceLast = lastApplication 
    ? Math.floor((new Date().getTime() - new Date(lastApplication.date).getTime()) / (1000 * 60 * 60 * 24))
    : 30;

  const isRainComing = weatherRainProb >= 50 || weatherRainfallForecastMm >= 10;
  const isSoilTooDry = soilMoisture < 20;

  let timingSuitability: 'optimal' | 'marginal' | 'unfavorable' = 'optimal';
  let timingHeadline = 'Weather and Soil Conditions are Optimal for Nutrient Application';
  let timingReason = `Soil moisture (${soilMoisture}%) is adequate for nutrient dissolution. No heavy rain is forecast in the next 24-48 hours.`;

  if (isRainComing) {
    timingSuitability = 'unfavorable';
    timingHeadline = '⚠️ Delay Application — Rainfall In Forecast';
    timingReason = `Expected rain (${weatherRainfallForecastMm} mm / ${weatherRainProb}% probability) may cause surface runoff and severe nitrogen leaching. Hold off until rain passes.`;
  } else if (isSoilTooDry) {
    timingSuitability = 'marginal';
    timingHeadline = 'Irrigate First — Topsoil Too Dry';
    timingReason = `Topsoil moisture (${soilMoisture}%) is below 20%. Applying dry chemical fertilizers without moisture can scorch root hairs. Water field first.`;
  } else if (daysSinceLast < 10) {
    timingSuitability = 'marginal';
    timingHeadline = 'Recent Application Recorded — Avoid Overdosing';
    timingReason = `Last application was ${daysSinceLast} days ago (${lastApplication.fertilizerType}). Allow canopy time to assimilate nutrients.`;
  }

  const handleAddRecord = (e: React.FormEvent) => {
    e.preventDefault();
    const created = farmTaskService.addFertilizerRecord({
      date,
      fertilizerType,
      amountKg: parseFloat(amountKg) || 20,
      fieldZone,
      cropStage: growthStage,
      notes: notes.trim(),
      weatherSuitability: timingSuitability
    });
    setHistory([created, ...history]);
    setIsAddingRecord(false);
    setNotes('');
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 border border-[#c8e6c9] shadow-sm space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-700 shrink-0 border border-purple-200">
            <FlaskConical className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase bg-purple-100 text-purple-800 border border-purple-200">
                Nutrient Timing & History
              </span>
              <span className="text-xs text-gray-500 font-medium">
                Last applied: {lastApplication ? `${daysSinceLast}d ago` : 'None recorded'}
              </span>
            </div>
            <h2 className="font-serif font-bold text-xl sm:text-2xl text-[#1b2e1b] mt-0.5">
              Fertilizer Timing Intelligence
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onSelectTab('fertilizer')}
            className="px-3 py-1.5 rounded-xl border border-purple-200 bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs font-bold transition-colors min-h-[40px] flex items-center gap-1"
          >
            <span>Dosage Calculator</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setIsAddingRecord(!isAddingRecord)}
            className="px-3.5 py-1.5 rounded-xl bg-[#2e7d32] text-white hover:bg-[#1b5e20] text-xs font-bold transition-colors min-h-[40px] flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Log Application</span>
          </button>
        </div>
      </div>

      {/* Suitability Banner (WHAT, WHY, WHEN, WHAT TO AVOID) */}
      <div className={`p-4 sm:p-5 rounded-2xl border ${
        timingSuitability === 'optimal'
          ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
          : timingSuitability === 'marginal'
            ? 'bg-amber-50/70 border-amber-300 text-amber-950'
            : 'bg-rose-50/80 border-rose-300 text-rose-950'
      }`}>
        <div className="flex items-start gap-3">
          {timingSuitability === 'optimal' ? (
            <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
          ) : timingSuitability === 'marginal' ? (
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          ) : (
            <CloudRain className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" />
          )}

          <div className="space-y-1.5 flex-1">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="font-bold text-sm sm:text-base">
                {timingHeadline}
              </h3>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase ${
                timingSuitability === 'optimal'
                  ? 'bg-emerald-200 text-emerald-900'
                  : timingSuitability === 'marginal'
                    ? 'bg-amber-200 text-amber-900'
                    : 'bg-rose-200 text-rose-900'
              }`}>
                {timingSuitability} window
              </span>
            </div>
            <p className="text-xs opacity-90 leading-relaxed">
              {timingReason}
            </p>
            <div className="pt-2 flex items-center gap-3 text-xs opacity-80 flex-wrap">
              <span>Soil NPK: <strong>{soilN}N - {soilP}P - {soilK}K</strong></span>
              <span>•</span>
              <span>Soil Moisture: <strong>{soilMoisture}%</strong></span>
              <span>•</span>
              <span>Rain Probability: <strong>{weatherRainProb}%</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Log Application Modal / Drawer */}
      <AnimatePresence>
        {isAddingRecord && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleAddRecord}
            className="p-5 rounded-2xl bg-purple-50/40 border border-purple-200 space-y-4"
          >
            <div className="flex items-center justify-between">
              <span className="font-serif font-bold text-sm text-purple-950">Record Fertilizer Application (Prevents Duplicate Dosing)</span>
              <button
                type="button"
                onClick={() => setIsAddingRecord(false)}
                className="text-xs text-gray-500 hover:text-gray-800"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 bg-white font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Fertilizer Type</label>
                <input
                  type="text"
                  required
                  value={fertilizerType}
                  onChange={(e) => setFertilizerType(e.target.value)}
                  placeholder="e.g. Urea (46% N), DAP, 19:19:19"
                  className="w-full p-2.5 rounded-xl border border-gray-300 bg-white font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Quantity (Kg)</label>
                <input
                  type="number"
                  required
                  value={amountKg}
                  onChange={(e) => setAmountKg(e.target.value)}
                  placeholder="25"
                  className="w-full p-2.5 rounded-xl border border-gray-300 bg-white font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Field Zone</label>
                <input
                  type="text"
                  value={fieldZone}
                  onChange={(e) => setFieldZone(e.target.value)}
                  placeholder="Zone A / North Bed"
                  className="w-full p-2.5 rounded-xl border border-gray-300 bg-white font-medium"
                />
              </div>

              <div className="sm:col-span-4">
                <label className="block font-semibold text-gray-700 mb-1">Application Notes</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Applied via drip fertigation tank after 20 min flush."
                  className="w-full p-2.5 rounded-xl border border-gray-300 bg-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAddingRecord(false)}
                className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-purple-700 text-white text-xs font-bold hover:bg-purple-800 shadow-sm"
              >
                Save to Farm Log
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Application History Log (Prevents accidental duplicates) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-bold text-xs uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
            <History className="w-3.5 h-3.5" />
            Previous Applications ({history.length})
          </span>
          <span className="text-xs text-gray-400">Recorded for safety tracking</span>
        </div>

        <div className="space-y-2">
          {history.slice(0, 3).map((rec) => (
            <div
              key={rec.id}
              className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-between gap-3 text-xs flex-wrap"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-xs shrink-0">
                  🧪
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">{rec.fertilizerType}</span>
                    <span className="font-mono font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200 text-[11px]">
                      {rec.amountKg} kg
                    </span>
                  </div>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    {rec.fieldZone} • Stage: {rec.cropStage} • {rec.notes || 'Routine application'}
                  </p>
                </div>
              </div>

              <div className="text-right font-mono text-gray-500 text-[11px] shrink-0">
                {rec.date}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
