import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Filter, 
  Sliders, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  RefreshCw, 
  Info,
  Layers,
  Calendar,
  History,
  Activity
} from 'lucide-react';
import { SoilData, FarmZone, CropRecommendation } from '../../types';
import { OverallCropRiskReport, RiskFactorEvaluation, CropRiskCategory } from '../../types/cropRisk';
import { evaluateCropRisk } from '../../services/cropRiskEngine';
import { riskSignalService } from '../../services/riskSignalService';
import { CropRiskHero } from './CropRiskHero';
import { RiskFactorCard } from './RiskFactorCard';
import { SevenDayRiskForecast } from './SevenDayRiskForecast';
import { FieldRiskMap } from './FieldRiskMap';
import { RiskHistory } from './RiskHistory';
import { RiskDetailsModal } from './RiskDetailsModal';

interface CropRiskDashboardProps {
  soilData: SoilData;
  farmZones?: FarmZone[];
  recommendations?: CropRecommendation[];
  isExpertMode: boolean;
  onToggleExpertMode: (expert: boolean) => void;
  onSelectTab: (tab: string) => void;
  onOpenVoiceAI: () => void;
  isOffline?: boolean;
}

export const CropRiskDashboard: React.FC<CropRiskDashboardProps> = ({
  soilData,
  farmZones = [],
  recommendations = [],
  isExpertMode,
  onToggleExpertMode,
  onSelectTab,
  onOpenVoiceAI,
  isOffline = false
}) => {
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<'ALL' | 'CRITICAL_ONLY' | 'BIOLOGICAL' | 'WEATHER_WATER'>('ALL');
  const [selectedFactorForModal, setSelectedFactorForModal] = useState<RiskFactorEvaluation | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<'factors' | 'forecast' | 'zones' | 'history'>('factors');
  const [mutedCategories, setMutedCategories] = useState<CropRiskCategory[]>(() => {
    return riskSignalService.getPreferences().mutedCategories;
  });

  // Evaluate risk report deterministically from current real telemetry & state
  const report: OverallCropRiskReport = useMemo(() => {
    return evaluateCropRisk({
      soilData,
      farmZones,
      weatherTemp: soilData.temperature,
      weatherRainProb: soilData.rainfall > 80 ? 70 : 25,
      weatherRainfallForecastMm: soilData.rainfall || 0,
      weatherWindSpeed: soilData.wind_speed,
      weatherHumidity: soilData.humidity,
      cropName: recommendations[0]?.crop || farmZones[0]?.assignedCrop || 'Rice',
      recommendations,
      isOffline
    });
  }, [soilData, farmZones, recommendations, isOffline]);

  const handleToggleMute = (category: CropRiskCategory) => {
    const updated = riskSignalService.toggleCategoryMute(category);
    setMutedCategories(updated.mutedCategories);
  };

  const handleOpenFactorDetails = (factor: RiskFactorEvaluation) => {
    setSelectedFactorForModal(factor);
    setIsModalOpen(true);
  };

  // Filter factors
  const filteredFactors = useMemo(() => {
    return report.rankedFactors.filter((factor) => {
      if (selectedCategoryFilter === 'CRITICAL_ONLY') {
        return factor.level === 'HIGH' || factor.level === 'MODERATE';
      }
      if (selectedCategoryFilter === 'BIOLOGICAL') {
        return factor.category === 'disease' || factor.category === 'pest' || factor.category === 'crop_health';
      }
      if (selectedCategoryFilter === 'WEATHER_WATER') {
        return factor.category === 'water' || factor.category === 'heavy_rain' || factor.category === 'heat' || factor.category === 'wind';
      }
      return true;
    });
  }, [report.rankedFactors, selectedCategoryFilter]);

  return (
    <div className="space-y-8 pb-12">
      {/* 1. HERO STATUS CARD */}
      <CropRiskHero
        report={report}
        isExpertMode={isExpertMode}
        onToggleExpertMode={onToggleExpertMode}
        onSelectTab={onSelectTab}
        onOpenVoiceAI={onOpenVoiceAI}
        isOffline={isOffline}
      />

      {/* 2. DASHBOARD NAVIGATION TABS (Horizontal Sub-navigation) */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#c8e6c9] pb-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveSection('factors')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 min-h-[44px] ${
              activeSection === 'factors'
                ? 'bg-[#2e7d32] text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>8 Risk Factors ({report.rankedFactors.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('forecast')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 min-h-[44px] ${
              activeSection === 'forecast'
                ? 'bg-[#2e7d32] text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>7-Day Risk Forecast</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('zones')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 min-h-[44px] ${
              activeSection === 'zones'
                ? 'bg-[#2e7d32] text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Field Zone Matrix ({report.zoneRisks.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('history')}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 min-h-[44px] ${
              activeSection === 'history'
                ? 'bg-[#2e7d32] text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Scouting & History</span>
          </button>
        </div>

        {/* Filter Pills when in 'factors' section */}
        {activeSection === 'factors' && (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[10px] font-bold uppercase text-gray-400 mr-1 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Filter:
            </span>
            <button
              type="button"
              onClick={() => setSelectedCategoryFilter('ALL')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors ${
                selectedCategoryFilter === 'ALL'
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategoryFilter('CRITICAL_ONLY')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors ${
                selectedCategoryFilter === 'CRITICAL_ONLY'
                  ? 'bg-rose-600 text-white'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
              }`}
            >
              ⚠️ Active Risks Only
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategoryFilter('BIOLOGICAL')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors ${
                selectedCategoryFilter === 'BIOLOGICAL'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
              }`}
            >
              🦠 Biological
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategoryFilter('WEATHER_WATER')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-colors ${
                selectedCategoryFilter === 'WEATHER_WATER'
                  ? 'bg-blue-700 text-white'
                  : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
              }`}
            >
              🌧️ Climate & Water
            </button>
          </div>
        )}
      </div>

      {/* 3. CONDITIONAL SECTION RENDERING */}
      {activeSection === 'factors' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {filteredFactors.map((factor) => (
              <RiskFactorCard
                key={factor.category}
                factor={factor}
                isExpertMode={isExpertMode}
                onSelectTab={onSelectTab}
                onOpenDetailsModal={handleOpenFactorDetails}
                isMuted={mutedCategories.includes(factor.category)}
                onToggleMute={() => handleToggleMute(factor.category)}
              />
            ))}
          </div>

          {filteredFactors.length === 0 && (
            <div className="p-12 rounded-3xl bg-white border border-[#c8e6c9] text-center space-y-3">
              <ShieldCheck className="w-12 h-12 text-emerald-600 mx-auto" />
              <h4 className="font-serif text-lg font-bold text-gray-900">
                No active critical risk signals in this filter
              </h4>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                All filtered risk categories are within safe operational thresholds.
              </p>
              <button
                type="button"
                onClick={() => setSelectedCategoryFilter('ALL')}
                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold"
              >
                Reset Filter to All (8)
              </button>
            </div>
          )}
        </div>
      )}

      {activeSection === 'forecast' && (
        <SevenDayRiskForecast
          forecasts={report.sevenDayForecast}
          isExpertMode={isExpertMode}
          onSelectTab={onSelectTab}
        />
      )}

      {activeSection === 'zones' && (
        <FieldRiskMap
          zoneRisks={report.zoneRisks}
          isExpertMode={isExpertMode}
          onSelectTab={onSelectTab}
        />
      )}

      {activeSection === 'history' && (
        <RiskHistory
          cropName={report.cropName}
          isExpertMode={isExpertMode}
          onOpenPlantScan={() => onSelectTab('diagnostics')}
        />
      )}

      {/* 4. EXPLANATION MODAL */}
      <RiskDetailsModal
        factor={selectedFactorForModal}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isExpertMode={isExpertMode}
        onSelectTab={onSelectTab}
      />
    </div>
  );
};
