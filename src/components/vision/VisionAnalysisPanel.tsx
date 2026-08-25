import React from 'react';
import { 
  Sprout, 
  HelpCircle, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ShieldCheck, 
  TrendingUp, 
  Layers, 
  Droplets, 
  Sun, 
  CloudRain, 
  Share2, 
  Save, 
  Bot,
  Compass,
  Radio,
  Sparkles
} from 'lucide-react';
import { CropVisionObservation } from '../../types/visionTypes';

interface VisionAnalysisPanelProps {
  observation: CropVisionObservation | null;
  isAnalyzing: boolean;
  onSaveObservation?: (obs: CropVisionObservation) => void;
  onSendToSupervisor?: (obs: CropVisionObservation) => void;
  onCompareWithPrevious?: (obs: CropVisionObservation) => void;
}

export const VisionAnalysisPanel: React.FC<VisionAnalysisPanelProps> = ({
  observation,
  isAnalyzing,
  onSaveObservation,
  onSendToSupervisor,
  onCompareWithPrevious,
}) => {
  if (isAnalyzing) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-[#c8e6c9] shadow-sm flex flex-col items-center justify-center text-center space-y-4 min-h-[380px]">
        <div className="w-16 h-16 rounded-3xl bg-[#e8f5e9] flex items-center justify-center text-[#2e7d32] animate-bounce">
          <Sparkles className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h4 className="text-lg font-bold text-gray-900">Analyzing Foliage & Canopy...</h4>
          <p className="text-xs text-gray-500 max-w-sm">
            Evaluating leaf turgor, color spectrum, pathogen symptoms, and correlating with your IoT sensor telemetry.
          </p>
        </div>
      </div>
    );
  }

  if (!observation) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-[#c8e6c9] shadow-sm flex flex-col items-center justify-center text-center space-y-3 min-h-[380px]">
        <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400 border border-gray-100">
          <Sprout className="w-7 h-7" />
        </div>
        <h4 className="text-base font-bold text-gray-700">No Observation Active</h4>
        <p className="text-xs text-gray-400 max-w-xs">
          Point the camera at your crop leaves and tap &quot;Analyze Crop&quot; to generate real-time agronomic insights.
        </p>
      </div>
    );
  }

  const { detection, advice, fusedSensorContext } = observation;

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#c8e6c9] shadow-sm space-y-5">
      {/* Header bar with Zone & Confidence */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#c8e6c9]/60 pb-3.5">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-[#e8f5e9] text-[#2e7d32] rounded-full text-[10px] font-mono font-bold uppercase">
              {observation.zoneName}
            </span>
            <span className="text-xs text-gray-400 font-medium">
              {observation.dateFormatted}
            </span>
          </div>
          <h3 className="text-lg font-serif font-bold text-gray-900 flex items-center gap-2">
            <span>{detection.cropType}</span>
            <span className="text-xs font-normal text-gray-500">
              ({detection.cropConfidence}% confidence)
            </span>
          </h3>
        </div>

        {/* Confidence Badge */}
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#f8fcf8] border border-[#a5d6a7] rounded-2xl">
          <ShieldCheck className="w-4 h-4 text-[#2e7d32]" />
          <span className="text-xs font-bold text-[#1b2e1b]">
            {advice.confidenceLevel} Confidence ({advice.confidenceScore}%)
          </span>
        </div>
      </div>

      {/* 6-Part Farmer-Friendly Advice Card */}
      <div className="bg-gradient-to-br from-[#f8fcf8] to-[#edf7ee] rounded-2xl p-4 sm:p-5 border border-[#c8e6c9] space-y-3.5">
        <span className="text-[11px] font-mono font-bold text-[#2e7d32] uppercase tracking-wider block">
          Agronomist Action Card
        </span>

        {/* 1. What I See */}
        <div className="flex items-start gap-3">
          <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl shrink-0 mt-0.5">
            <Sprout className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">
              🌱 What I see
            </span>
            <p className="text-sm font-semibold text-gray-900 leading-snug">
              {advice.whatISee}
            </p>
          </div>
        </div>

        {/* 2. Why it may be happening */}
        <div className="flex items-start gap-3">
          <div className="p-2 bg-amber-100 text-amber-800 rounded-xl shrink-0 mt-0.5">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">
              ❓ Why it may be happening
            </span>
            <p className="text-xs font-medium text-gray-700 leading-relaxed">
              {advice.whyItMayBeHappening}
            </p>
          </div>
        </div>

        {/* 3. What you should do */}
        <div className="flex items-start gap-3">
          <div className="p-2 bg-[#2e7d32] text-white rounded-xl shrink-0 mt-0.5">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="space-y-0.5">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wide">
              👨‍🌾 What you should do
            </span>
            <p className="text-xs font-bold text-[#1b2e1b] leading-relaxed">
              {advice.whatYouShouldDo}
            </p>
          </div>
        </div>

        {/* 4. When & 5. What to Avoid (2 Column) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-[#c8e6c9]/50">
          <div className="flex items-start gap-2.5 bg-white/70 p-2.5 rounded-xl border border-[#c8e6c9]">
            <Clock className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase block">⏰ When</span>
              <span className="text-xs font-bold text-gray-800">{advice.when}</span>
            </div>
          </div>

          <div className="flex items-start gap-2.5 bg-white/70 p-2.5 rounded-xl border border-[#c8e6c9]">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase block">⚠️ What to avoid</span>
              <span className="text-xs font-medium text-gray-800">{advice.whatToAvoid}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Source Fusion Context Bar */}
      {fusedSensorContext && (
        <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono font-bold text-gray-600">
            <span className="flex items-center gap-1.5">
              <Radio className="w-3.5 h-3.5 text-[#2e7d32]" />
              Fused Evidence (IoT + Weather)
            </span>
            <span className="text-[10px] text-gray-400">Live Correlated</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="bg-white p-2 rounded-xl border border-gray-100 text-center">
              <span className="text-[10px] text-gray-400 block">Soil Moisture</span>
              <span className="text-xs font-bold text-gray-800">
                {fusedSensorContext.soilMoisturePercent !== undefined ? `${fusedSensorContext.soilMoisturePercent}%` : '--'}
              </span>
            </div>
            <div className="bg-white p-2 rounded-xl border border-gray-100 text-center">
              <span className="text-[10px] text-gray-400 block">Ambient Temp</span>
              <span className="text-xs font-bold text-gray-800">
                {fusedSensorContext.ambientTempC !== undefined ? `${fusedSensorContext.ambientTempC}°C` : '--'}
              </span>
            </div>
            <div className="bg-white p-2 rounded-xl border border-gray-100 text-center">
              <span className="text-[10px] text-gray-400 block">Air Humidity</span>
              <span className="text-xs font-bold text-gray-800">
                {fusedSensorContext.humidityPercent !== undefined ? `${fusedSensorContext.humidityPercent}%` : '--'}
              </span>
            </div>
            <div className="bg-white p-2 rounded-xl border border-gray-100 text-center">
              <span className="text-[10px] text-gray-400 block">Canopy Density</span>
              <span className="text-xs font-bold text-[#2e7d32]">
                {detection.canopyCoveragePercent}%
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2.5 pt-1">
        {onSendToSupervisor && (
          <button
            onClick={() => onSendToSupervisor(observation)}
            className="flex-1 py-3 px-4 min-h-[44px] bg-[#1b2e1b] hover:bg-[#2e7d32] text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 cursor-pointer"
          >
            <Bot className="w-4 h-4 text-[#4CAF50]" />
            Send to Farm Supervisor
          </button>
        )}

        {onCompareWithPrevious && (
          <button
            onClick={() => onCompareWithPrevious(observation)}
            className="py-3 px-4 min-h-[44px] bg-[#f8fcf8] hover:bg-[#e8f5e9] text-[#2e7d32] border border-[#a5d6a7] rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-98 cursor-pointer"
          >
            <Compass className="w-4 h-4" />
            Compare History
          </button>
        )}

        {onSaveObservation && (
          <button
            onClick={() => onSaveObservation(observation)}
            className="py-3 px-4 min-h-[44px] bg-emerald-50 hover:bg-emerald-100 text-[#2e7d32] border border-[#c8e6c9] rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-98 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Save Log
          </button>
        )}
      </div>
    </div>
  );
};
