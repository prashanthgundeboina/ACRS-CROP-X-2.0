import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, 
  Bug, 
  Scan, 
  Calendar, 
  Activity, 
  Plus, 
  CheckCircle2, 
  Eye, 
  ChevronRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { CropHealthTimelineEvent } from '../../types/operations/farmOperationsTypes';
import { farmTaskService } from '../../services/operations/farmTaskService';

interface CropProtectionWatchProps {
  cropName: string;
  growthStage: string;
  temperature: number;
  humidity: number;
  rainfall: number;
  isExpertMode?: boolean;
  onSelectTab: (tabId: string) => void;
}

export const CropProtectionWatch: React.FC<CropProtectionWatchProps> = ({
  cropName,
  growthStage,
  temperature,
  humidity,
  rainfall,
  isExpertMode = false,
  onSelectTab
}) => {
  const [timeline, setTimeline] = useState<CropHealthTimelineEvent[]>(() => farmTaskService.getHealthTimeline());
  const [isAddingObservation, setIsAddingObservation] = useState(false);
  const [observationTitle, setObservationTitle] = useState('');
  const [observationDesc, setObservationDesc] = useState('');

  // Environmental Pest & Disease Pressure Calculation
  let riskLevel: 'low' | 'moderate' | 'high' = 'low';
  let riskBadge = '🟢 Low Risk';
  let riskMessage = 'Atmospheric conditions are unfavorable for major fungal or bacterial disease sporulation.';
  let recommendedAction = 'Maintain routine weekly canopy checks.';

  if (humidity >= 78 && temperature >= 22 && temperature <= 32) {
    riskLevel = 'high';
    riskBadge = '🔴 Inspect Crop';
    riskMessage = `High relative humidity (${humidity}%) paired with warm canopy temperature (${temperature}°C) creates an ideal microclimate for foliar fungal pathogens (e.g. Blight, Mildew).`;
    recommendedAction = 'Conduct immediate field perimeter scout and take an AI leaf scan of lower canopy leaves.';
  } else if (humidity >= 65 || temperature >= 34) {
    riskLevel = 'moderate';
    riskBadge = '🟡 Monitor';
    riskMessage = `Moderate humidity (${humidity}%) or elevated heat index (${temperature}°C) may favor sucking pest activity (Aphids, Thrips, Whiteflies).`;
    recommendedAction = 'Check undersides of leaves and monitor sticky traps.';
  }

  const handleAddObservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!observationTitle.trim()) return;

    const created = farmTaskService.addHealthTimelineEvent({
      date: new Date().toISOString().split('T')[0],
      type: 'observation',
      title: observationTitle.trim(),
      description: observationDesc.trim() || 'Farmer manual field observation logged.',
      severity: 'normal'
    });

    setTimeline([created, ...timeline]);
    setObservationTitle('');
    setObservationDesc('');
    setIsAddingObservation(false);
  };

  const getTimelineIcon = (type: CropHealthTimelineEvent['type']) => {
    switch (type) {
      case 'scan': return '🔬';
      case 'risk_alert': return '⚠️';
      case 'ndvi_change': return '🛰️';
      case 'sensor_spike': return '📡';
      case 'weather_event': return '⛈️';
      case 'fertilizer': return '🧪';
      case 'irrigation': return '💧';
      default: return '👁️';
    }
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 border border-[#c8e6c9] shadow-sm space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-700 shrink-0 border border-amber-200">
            <Bug className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase bg-amber-100 text-amber-900 border border-amber-300">
                Crop Protection Watch
              </span>
              <span className="text-xs font-bold text-gray-700">{riskBadge}</span>
            </div>
            <h2 className="font-serif font-bold text-xl sm:text-2xl text-[#1b2e1b] mt-0.5">
              Pest & Fungal Disease Early Watch
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onSelectTab('diagnosis')}
            className="px-3.5 py-2 rounded-xl bg-[#2e7d32] text-white hover:bg-[#1b5e20] text-xs font-bold transition-colors min-h-[40px] flex items-center gap-1.5 shadow-sm"
          >
            <Scan className="w-4 h-4" />
            <span>AI Plant Scan</span>
          </button>
        </div>
      </div>

      {/* Dynamic Early Warning Status Box */}
      <div className={`p-4 sm:p-5 rounded-2xl border ${
        riskLevel === 'low'
          ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
          : riskLevel === 'moderate'
            ? 'bg-amber-50/70 border-amber-300 text-amber-950'
            : 'bg-rose-50/80 border-rose-300 text-rose-950'
      }`}>
        <div className="flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="font-bold text-sm sm:text-base">
                {riskLevel === 'high' ? 'Elevated Environmental Disease Pressure' : riskLevel === 'moderate' ? 'Moderate Pest Activity Window' : 'Canopy Conditions Clear'}
              </h3>
              <span className="text-[11px] font-mono opacity-80">
                RH: {humidity}% • Temp: {temperature}°C
              </span>
            </div>
            <p className="text-xs opacity-90 leading-relaxed">
              {riskMessage}
            </p>
            <div className="pt-2 flex items-center justify-between flex-wrap gap-2">
              <span className="text-xs font-semibold">
                👉 Suggested Action: {recommendedAction}
              </span>
              <button
                type="button"
                onClick={() => onSelectTab('risk')}
                className="text-xs font-bold underline hover:opacity-80"
              >
                Open Full Crop Risk AI Engine →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Suggested Inspection Triggers */}
      <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-bold text-xs uppercase tracking-wider text-gray-600 flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-gray-500" />
            Inspection Triggers & Scouting Guide
          </span>
          <button
            type="button"
            onClick={() => setIsAddingObservation(!isAddingObservation)}
            className="text-xs font-bold text-[#2e7d32] hover:underline flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record Observation</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
          <div className="p-3 rounded-xl bg-white border border-gray-200 space-y-1">
            <span className="font-bold text-gray-900 block">🌧️ Post-Rain Inspection</span>
            <p className="text-gray-500 text-[11px]">
              Check for soil splash on lower leaves and water accumulation in furrows.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-white border border-gray-200 space-y-1">
            <span className="font-bold text-gray-900 block">🌡️ Post-Heatwave Check</span>
            <p className="text-gray-500 text-[11px]">
              Examine young vegetative tips and flower trusses for heat scorching or wilting.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-white border border-gray-200 space-y-1">
            <span className="font-bold text-gray-900 block">🛰️ Low NDVI Sector Scout</span>
            <p className="text-gray-500 text-[11px]">
              Walk rows showing lower vigor in the satellite layer to verify ground root health.
            </p>
          </div>
        </div>
      </div>

      {/* Farmer Observation Input Form */}
      <AnimatePresence>
        {isAddingObservation && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleAddObservation}
            className="p-4 rounded-2xl bg-[#fafdfa] border border-[#c8e6c9] space-y-3 text-xs"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-gray-900">Log Field Health Observation</span>
              <button
                type="button"
                onClick={() => setIsAddingObservation(false)}
                className="text-gray-500 hover:text-gray-800"
              >
                Cancel
              </button>
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Observation Title</label>
              <input
                type="text"
                required
                placeholder="e.g. Minor yellowing on 3 border plants in Row 4"
                value={observationTitle}
                onChange={(e) => setObservationTitle(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-300 bg-white font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-700 mb-1">Details / Farmer Notes</label>
              <textarea
                rows={2}
                placeholder="Observed slight leaf curling after windy afternoon..."
                value={observationDesc}
                onChange={(e) => setObservationDesc(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-300 bg-white"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddingObservation(false)}
                className="px-3 py-1.5 rounded-xl bg-gray-100 text-gray-700 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-[#2e7d32] text-white font-bold hover:bg-[#1b5e20]"
              >
                Save Observation
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Crop Health History Timeline */}
      <div className="space-y-3">
        <span className="font-bold text-xs uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5" />
          Crop Health & Diagnosis Timeline
        </span>

        <div className="space-y-2.5">
          {timeline.map((ev) => (
            <div
              key={ev.id}
              className="p-3.5 rounded-2xl bg-gray-50/80 border border-gray-200 flex items-start gap-3 text-xs"
            >
              <div className="w-8 h-8 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-sm shrink-0 shadow-2xs">
                {getTimelineIcon(ev.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <span className="font-bold text-gray-900">{ev.title}</span>
                  <span className="font-mono text-[10px] text-gray-400">{ev.date}</span>
                </div>
                <p className="text-gray-600 mt-0.5 leading-relaxed">
                  {ev.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
