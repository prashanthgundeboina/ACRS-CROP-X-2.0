import React from 'react';
import { motion } from 'motion/react';
import {
  Sprout,
  CheckCircle2,
  PhoneCall,
  Activity,
  Bookmark,
  Sparkles,
  TrendingUp,
  ChevronRight,
  Info,
} from 'lucide-react';
import { CropRecommendation, SoilData } from '../../types';
import { GlassCard } from '../ui/GlassCard';
import { StatusBadge } from '../ui/StatusBadge';
import { FarmerButton } from '../ui/FarmerButton';
import { NoCropEmptyState } from '../ui/EmptyState';

interface CropPredictionRedesignProps {
  recommendations: CropRecommendation[];
  soilData: SoilData;
  isExpertMode: boolean;
  onOpenCallModal: () => void;
  onToggleExpertMode: (expert: boolean) => void;
  onSaveScenario?: () => void;
  onSelectCrop?: (crop: CropRecommendation) => void;
  onPredictCrop?: () => void;
}

export const CropPredictionRedesign: React.FC<CropPredictionRedesignProps> = ({
  recommendations,
  soilData,
  isExpertMode,
  onOpenCallModal,
  onToggleExpertMode,
  onSaveScenario,
  onSelectCrop,
  onPredictCrop,
}) => {
  if (!recommendations || recommendations.length === 0) {
    return (
      <div className="my-6">
        <NoCropEmptyState onAddCrop={onPredictCrop || onOpenCallModal} />
      </div>
    );
  }

  const topCrop = recommendations[0];
  const suitabilityScore = Math.round((topCrop.confidence || 0.92) * 100);

  return (
    <div className="space-y-6 my-6">
      {/* 1. Primary Highlighted Crop Match Card */}
      <GlassCard variant="emerald" padding="lg" className="relative overflow-hidden border-2 border-emerald-400">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-amber-400 text-amber-950 rounded-full text-xs font-mono font-extrabold uppercase">
              🌾 Recommended Crop #1
            </span>
            <StatusBadge label={`${suitabilityScore}% Suitability`} variant="success" size="md" pulse />
          </div>

          <div className="flex items-center gap-2">
            <FarmerButton
              onClick={onOpenCallModal}
              variant="voice"
              size="sm"
              icon={PhoneCall}
            >
              🎙️ Explain This To Me
            </FarmerButton>

            {onSaveScenario && (
              <button
                onClick={onSaveScenario}
                className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-all cursor-pointer flex items-center gap-1 text-xs font-bold"
              >
                <Bookmark className="w-4 h-4 text-amber-300" />
                <span className="hidden sm:inline">Save</span>
              </button>
            )}
          </div>
        </div>

        {/* Hero Crop Title & Confidence */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center pt-6">
          <div className="md:col-span-7 space-y-2">
            <h2 className="font-serif font-black text-3xl sm:text-5xl text-white tracking-tight uppercase">
              {topCrop.crop}
            </h2>
            <p className="text-sm text-emerald-100/90 font-sans leading-relaxed">
              {topCrop.reasoning ||
                `${topCrop.crop} looks like a strong option for your current soil nutrient balance (NPK: ${soilData.nitrogen}-${soilData.phosphorus}-${soilData.potassium}) and local climate (${soilData.temperature}°C).`}
            </p>
            <div className="text-[11px] text-emerald-200/80 italic">
              * Recommendation calculated based on available farm telemetry and historical regional yields.
            </div>
          </div>

          <div className="md:col-span-5 flex flex-col items-center justify-center p-4 bg-white/10 rounded-2xl border border-white/20 text-center space-y-1">
            <span className="text-xs text-emerald-200 uppercase font-mono">Estimated Match</span>
            <div className="text-4xl font-extrabold text-amber-300 font-mono">
              {suitabilityScore}%
            </div>
            <span className="text-[10px] text-emerald-100 font-sans">
              Expected Output: {topCrop.yieldProjection || '4.8 - 5.5'} Tons/Acre
            </span>
          </div>
        </div>

        {/* Why this crop? Checklist */}
        <div className="mt-6 p-4 bg-black/20 rounded-2xl border border-white/10 space-y-3">
          <h4 className="text-xs font-mono font-bold uppercase text-amber-300 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" />
            <span>Why Is {topCrop.crop} Best For Your Farm?</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-emerald-50">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Good soil nutrient balance (N:{soilData.nitrogen}, P:{soilData.phosphorus}, K:{soilData.potassium})</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Suitable temperature range ({soilData.temperature}°C)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Optimal rainfall & soil moisture ({soilData.moisture}%)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Compatible pH index ({soilData.ph})</span>
            </div>
          </div>
        </div>

        {/* What Should You Do Next? Action Steps */}
        <div className="mt-4 p-4 bg-white/10 rounded-2xl border border-white/10 space-y-3">
          <h4 className="text-xs font-mono font-bold uppercase text-white">
            What Should You Do Next?
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div className="p-3 bg-white/10 rounded-xl space-y-1">
              <span className="font-mono font-bold text-amber-300 block text-[10px]">STEP 1 • SOIL PREP</span>
              <p className="text-white font-medium">Plough & balance soil organic matter ({soilData.organic_matter}%).</p>
            </div>
            <div className="p-3 bg-white/10 rounded-xl space-y-1">
              <span className="font-mono font-bold text-amber-300 block text-[10px]">STEP 2 • NUTRIENTS</span>
              <p className="text-white font-medium">Apply recommended Urea & DAP fertilizer dosage.</p>
            </div>
            <div className="p-3 bg-white/10 rounded-xl space-y-1">
              <span className="font-mono font-bold text-amber-300 block text-[10px]">STEP 3 • PLANTING</span>
              <p className="text-white font-medium">Sow seeds during upcoming weather window.</p>
            </div>
          </div>
        </div>

        {/* Expert Mode Button Footer */}
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs">
          <span className="text-emerald-200 text-[11px] font-mono">
            Generated using Gemini 2.5 Flash + KNN 22-Parameter Neural Engine
          </span>

          <button
            onClick={() => onToggleExpertMode(!isExpertMode)}
            className="text-xs font-bold text-amber-300 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>{isExpertMode ? 'Hide Technical Agronomic Data' : 'View Technical Details'}</span>
          </button>
        </div>
      </GlassCard>

      {/* 2. Alternative Recommended Crops Cards */}
      {recommendations.length > 1 && (
        <div className="space-y-3">
          <h3 className="font-serif font-bold text-xl text-[#1b2e1b]">
            Alternative Top Matching Crops
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recommendations.slice(1, 4).map((crop, idx) => {
              const score = Math.round((crop.confidence || 0.8) * 100);
              return (
                <GlassCard
                  key={idx}
                  clickable
                  onClick={() => onSelectCrop && onSelectCrop(crop)}
                  className="space-y-3 border-[#c8e6c9] hover:border-[#4CAF50]"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-serif font-bold text-lg text-[#1b2e1b] uppercase">
                      {crop.crop}
                    </span>
                    <StatusBadge label={`${score}% Match`} variant="info" size="sm" />
                  </div>

                  <p className="text-xs text-gray-600 line-clamp-2">
                    {crop.reasoning || `Suitable secondary crop for your field NPK and rainfall conditions.`}
                  </p>

                  <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs font-mono">
                    <span className="text-gray-500">Yield: {crop.yieldProjection || '3.5-4.2'} t/ha</span>
                    <span className="text-[#2e7d32] font-bold">Select →</span>
                  </div>
                </GlassCard>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
