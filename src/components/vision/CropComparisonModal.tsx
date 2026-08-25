import React, { useState } from 'react';
import { 
  Compass, 
  ArrowRight, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  TrendingUp, 
  Layers, 
  X,
  Sparkles
} from 'lucide-react';
import { CropVisionObservation } from '../../types/visionTypes';
import { BeforeAfterComparison } from '../../types/fieldObservationTypes';
import { fieldObservationService } from '../../services/fieldObservationService';

interface CropComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  observations: CropVisionObservation[];
  initialCurrentObs?: CropVisionObservation | null;
}

export const CropComparisonModal: React.FC<CropComparisonModalProps> = ({
  isOpen,
  onClose,
  observations,
  initialCurrentObs,
}) => {
  const [beforeId, setBeforeId] = useState<string>(
    observations.length > 1 ? observations[observations.length - 1].id : observations[0]?.id || ''
  );
  const [afterId, setAfterId] = useState<string>(
    initialCurrentObs?.id || observations[0]?.id || ''
  );

  if (!isOpen) return null;

  const beforeObs = observations.find((o) => o.id === beforeId) || observations[1] || observations[0];
  const afterObs = observations.find((o) => o.id === afterId) || observations[0];

  const comparison: BeforeAfterComparison | null =
    beforeObs && afterObs ? fieldObservationService.compareObservations(beforeObs, afterObs) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-[#c8e6c9] relative space-y-5 my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#e8f5e9] text-[#2e7d32] rounded-2xl">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold text-[#2e7d32] uppercase tracking-wider">
              Temporal Foliage Comparison
            </span>
            <h3 className="text-xl font-bold text-gray-900">
              Before / After Crop Observation Comparison
            </h3>
          </div>
        </div>

        {/* Observation Selector Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 bg-gray-50 rounded-2xl border border-gray-200">
          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1">
              Earlier Baseline Observation:
            </label>
            <select
              value={beforeId}
              onChange={(e) => setBeforeId(e.target.value)}
              className="w-full px-3 py-2 bg-white rounded-xl border border-gray-300 text-xs font-medium focus:ring-2 focus:ring-[#2e7d32] focus:outline-none"
            >
              {observations.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.zoneName} ({o.dateFormatted}) - {o.cropName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1">
              Current / Target Observation:
            </label>
            <select
              value={afterId}
              onChange={(e) => setAfterId(e.target.value)}
              className="w-full px-3 py-2 bg-white rounded-xl border border-gray-300 text-xs font-medium focus:ring-2 focus:ring-[#2e7d32] focus:outline-none"
            >
              {observations.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.zoneName} ({o.dateFormatted}) - {o.cropName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Comparison Result Container */}
        {comparison && beforeObs && afterObs && (
          <div className="space-y-4">
            {/* Side by side stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Baseline Card */}
              <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-2.5">
                <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                  <span className="text-[10px] font-mono font-bold text-gray-500 uppercase">
                    Baseline ({beforeObs.dateFormatted})
                  </span>
                  <span className="text-xs font-bold text-gray-800">{beforeObs.zoneName}</span>
                </div>
                <div className="text-xs font-bold text-gray-900">{beforeObs.cropName}</div>
                <div className="text-[11px] text-gray-600 leading-snug">
                  {beforeObs.advice.whatISee}
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <span className="px-2 py-0.5 bg-white text-gray-700 text-[10px] font-mono rounded-lg border">
                    Canopy: {beforeObs.detection.canopyCoveragePercent}%
                  </span>
                  <span className="px-2 py-0.5 bg-white text-gray-700 text-[10px] font-mono rounded-lg border">
                    Moisture: {beforeObs.fusedSensorContext?.soilMoisturePercent ?? '--'}%
                  </span>
                </div>
              </div>

              {/* Current Card */}
              <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200 space-y-2.5">
                <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                  <span className="text-[10px] font-mono font-bold text-[#2e7d32] uppercase">
                    Current Inspection ({afterObs.dateFormatted})
                  </span>
                  <span className="text-xs font-bold text-emerald-900">{afterObs.zoneName}</span>
                </div>
                <div className="text-xs font-bold text-gray-900">{afterObs.cropName}</div>
                <div className="text-[11px] text-gray-700 leading-snug">
                  {afterObs.advice.whatISee}
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <span className="px-2 py-0.5 bg-white text-emerald-800 text-[10px] font-mono rounded-lg border border-emerald-200">
                    Canopy: {afterObs.detection.canopyCoveragePercent}%
                  </span>
                  <span className="px-2 py-0.5 bg-white text-emerald-800 text-[10px] font-mono rounded-lg border border-emerald-200">
                    Moisture: {afterObs.fusedSensorContext?.soilMoisturePercent ?? '--'}%
                  </span>
                </div>
              </div>
            </div>

            {/* Visual Outcome Card */}
            <div className="p-4 bg-gradient-to-br from-[#f8fcf8] to-[#edf7ee] rounded-2xl border border-[#c8e6c9] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-[#2e7d32] uppercase">
                  Comparative Conclusion ({comparison.daysApart} Days Apart)
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  comparison.comparisonConclusion === 'Visual Improvement'
                    ? 'bg-emerald-100 text-emerald-800'
                    : comparison.comparisonConclusion === 'Visual Deterioration'
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {comparison.comparisonConclusion}
                </span>
              </div>
              <p className="text-xs font-medium text-gray-800 leading-relaxed">
                {comparison.visualNotes}
              </p>
            </div>

            {/* Mandatory Observational Disclaimer */}
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <span>{comparison.disclaimer}</span>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="py-2.5 px-5 bg-gray-800 hover:bg-black text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
};
