import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Droplets, 
  MapPin, 
  CloudRain, 
  Sparkles, 
  RefreshCw, 
  Sliders, 
  FileText, 
  Calendar, 
  Layers, 
  ShieldCheck, 
  Bot, 
  ChevronRight,
  Info,
  CheckCircle2
} from 'lucide-react';
import { 
  SoilData, 
  FarmZone, 
  CropRecommendation, 
  FarmerProfile, 
  UserAccount 
} from '../../types';
import { 
  evaluateIrrigationDecision, 
  evaluateAllZones, 
  generateDailyIrrigationPlan 
} from '../../services/irrigationEngine';
import { IrrigationRecommendationCard } from './IrrigationRecommendationCard';
import { IrrigationPlan } from './IrrigationPlan';
import { ZoneIrrigationStatus } from './ZoneIrrigationStatus';
import { IrrigationDetailsModal } from './IrrigationDetailsModal';
import { AskCroperXModal } from '../dashboard/AskCroperXModal';

interface SmartIrrigationDashboardProps {
  soilData: SoilData;
  farmZones?: FarmZone[];
  weatherTemp?: number;
  weatherRainProb?: number;
  weatherRainfallForecastMm?: number;
  recommendations?: CropRecommendation[];
  isExpertMode: boolean;
  onToggleExpertMode: (expert: boolean) => void;
  onOpenCallModal: () => void;
  currentUser?: UserAccount | null;
  farmerProfile?: FarmerProfile | null;
}

export const SmartIrrigationDashboard: React.FC<SmartIrrigationDashboardProps> = ({
  soilData,
  farmZones = [],
  weatherTemp = 28,
  weatherRainProb = 20,
  weatherRainfallForecastMm = 0,
  recommendations = [],
  isExpertMode,
  onToggleExpertMode,
  onOpenCallModal,
  currentUser,
  farmerProfile
}) => {
  const [selectedZoneId, setSelectedZoneId] = useState<string>(farmZones[0]?.id || 'default_zone');
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState<boolean>(false);
  const [isAskModalOpen, setIsAskModalOpen] = useState<boolean>(false);
  const [askQuestion, setAskQuestion] = useState<string>('Should I water my field?');
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'plan' | 'zones'>('overview');

  // Evaluate all zones
  const { evaluations, criticalZone } = evaluateAllZones(
    farmZones,
    soilData,
    weatherTemp,
    weatherRainProb,
    weatherRainfallForecastMm
  );

  // Active selected zone evaluation
  const activeZoneEval = evaluations.find(z => z.zoneId === selectedZoneId) || evaluations[0];
  const primaryCrop = activeZoneEval?.crop || recommendations[0]?.crop || 'Rice';

  // Overall recommendation for the selected zone or primary field
  const recommendation = activeZoneEval?.recommendation || evaluateIrrigationDecision({
    soilData,
    cropName: primaryCrop,
    weatherTemp,
    weatherRainProb,
    weatherRainfallForecastMm,
    zoneName: activeZoneEval?.zoneName || 'Main Field'
  });

  // Generate Daily Irrigation Plan
  const irrigationPlan = generateDailyIrrigationPlan(
    farmerProfile?.farmLocation || 'My Farm',
    recommendation,
    evaluations,
    weatherTemp,
    weatherRainProb
  );

  const handleAskCroperX = (q: string) => {
    setAskQuestion(q);
    setIsAskModalOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* Top Header & Mode Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-[2.5rem] border border-[#c8e6c9] shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-2xl bg-[#e8f5e9] text-[#2e7d32]">
              <Droplets className="w-6 h-6" />
            </span>
            <h2 className="font-serif text-3xl font-bold text-[#1b2e1b]">
              Precision Irrigation AI
            </h2>
          </div>
          <p className="text-xs text-[#667e66] flex items-center gap-2">
            <span>FAO-56 Evapotranspiration Decision Engine</span>
            <span>•</span>
            <span>Deterministic Agronomic Modeling</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Sub Navigation Buttons */}
          <div className="bg-[#f8fcf8] p-1 rounded-2xl border border-[#c8e6c9] flex items-center gap-1">
            <button
              onClick={() => setActiveSubTab('overview')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'overview'
                  ? 'bg-[#1b2e1b] text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveSubTab('plan')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'plan'
                  ? 'bg-[#1b2e1b] text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Daily Plan
            </button>
            <button
              onClick={() => setActiveSubTab('zones')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeSubTab === 'zones'
                  ? 'bg-[#1b2e1b] text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Zones ({evaluations.length})
            </button>
          </div>

          {/* Expert Mode Switch */}
          <button
            onClick={() => onToggleExpertMode(!isExpertMode)}
            className={`px-3 py-2 rounded-2xl text-xs font-bold border transition-all cursor-pointer ${
              isExpertMode 
                ? 'bg-[#e8f5e9] border-[#4CAF50] text-[#2e7d32]' 
                : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            {isExpertMode ? '🔬 Expert Mode ON' : '🌱 Simple Mode'}
          </button>

          <button
            onClick={() => setIsDetailsModalOpen(true)}
            className="p-2.5 bg-[#f8fcf8] hover:bg-[#e8f5e9] text-[#2e7d32] border border-[#c8e6c9] rounded-2xl transition-all cursor-pointer"
            title="Open Simulator & Audit"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {activeSubTab === 'overview' && (
        <div className="space-y-8">
          {/* Main Primary Recommendation Hero Card */}
          <IrrigationRecommendationCard
            recommendation={recommendation}
            selectedZoneName={activeZoneEval?.zoneName || 'Main Field'}
            cropName={primaryCrop}
            currentMoisture={activeZoneEval?.currentMoisture ?? soilData.soil_moisture ?? 32}
            rainfallForecastMm={weatherRainfallForecastMm}
            rainProbability={weatherRainProb}
            temperature={weatherTemp}
            isExpertMode={isExpertMode}
            onViewPlan={() => setActiveSubTab('plan')}
            onRefreshData={() => {}}
            onAskCroperX={handleAskCroperX}
            onOpenDetailsModal={() => setIsDetailsModalOpen(true)}
          />

          {/* Quick Zone Health Strip */}
          <ZoneIrrigationStatus
            evaluations={evaluations}
            selectedZoneId={selectedZoneId}
            onSelectZone={(id) => setSelectedZoneId(id)}
            onOpenDetailsModal={(z) => setIsDetailsModalOpen(true)}
          />

          {/* Daily Schedule Plan */}
          <IrrigationPlan
            plan={irrigationPlan}
            onSelectZone={(id) => setSelectedZoneId(id)}
          />
        </div>
      )}

      {activeSubTab === 'plan' && (
        <div className="space-y-6">
          <IrrigationPlan
            plan={irrigationPlan}
            onSelectZone={(id) => setSelectedZoneId(id)}
          />
        </div>
      )}

      {activeSubTab === 'zones' && (
        <div className="space-y-6">
          <ZoneIrrigationStatus
            evaluations={evaluations}
            selectedZoneId={selectedZoneId}
            onSelectZone={(id) => {
              setSelectedZoneId(id);
              setActiveSubTab('overview');
            }}
            onOpenDetailsModal={(z) => setIsDetailsModalOpen(true)}
          />
        </div>
      )}

      {/* Details & Simulation Audit Modal */}
      <IrrigationDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        zoneEvaluation={activeZoneEval}
        soilData={soilData}
        weatherTemp={weatherTemp}
        weatherRainProb={weatherRainProb}
        weatherRainfallForecastMm={weatherRainfallForecastMm}
      />

      {/* Ask CroperX AI Assistant Modal */}
      <AskCroperXModal
        isOpen={isAskModalOpen}
        onClose={() => setIsAskModalOpen(false)}
        initialQuestion={askQuestion}
        soilData={soilData}
        farmZones={farmZones}
        weatherTemp={weatherTemp}
        weatherRainProb={weatherRainProb}
        recommendations={recommendations}
        isExpertMode={isExpertMode}
        onSelectTab={() => {}}
        onOpenCallModal={onOpenCallModal}
      />
    </div>
  );
};
