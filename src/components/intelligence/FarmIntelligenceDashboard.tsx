import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { 
  Brain, 
  Droplets, 
  Thermometer, 
  CloudRain, 
  Sprout, 
  ShieldAlert, 
  Radio, 
  Sliders, 
  Clock, 
  Compass, 
  Info, 
  CheckCircle2, 
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Layers,
  HelpCircle
} from 'lucide-react';
import { SoilData, FarmZone, CropRecommendation } from '../../types';
import { farmPredictionService } from '../../services/intelligence/farmPredictionService';
import { iotDeviceService } from '../../services/iot/iotDeviceService';
import { PredictiveRiskCard } from './PredictiveRiskCard';
import { FarmPredictionTimeline } from './FarmPredictionTimeline';
import { ZoneComparison } from './ZoneComparison';
import { SensorAnomalyCard } from './SensorAnomalyCard';
import { IrrigationVerification } from './IrrigationVerification';
import { FarmWhatIfSimulator } from './FarmWhatIfSimulator';

interface FarmIntelligenceDashboardProps {
  soilData: SoilData;
  farmZones?: FarmZone[];
  weatherTemp?: number;
  weatherHumidity?: number;
  weatherWindSpeed?: number;
  weatherRainProb?: number;
  weatherRainfallForecastMm?: number;
  cropName?: string;
  recommendations?: CropRecommendation[];
  isExpertMode?: boolean;
  onToggleExpertMode?: () => void;
  onSelectTab: (tabId: string) => void;
  onOpenCallModal?: () => void;
}

export const FarmIntelligenceDashboard: React.FC<FarmIntelligenceDashboardProps> = ({
  soilData,
  farmZones = [],
  weatherTemp = 28,
  weatherHumidity = 65,
  weatherWindSpeed = 12,
  weatherRainProb = 20,
  weatherRainfallForecastMm = 0,
  cropName = 'Rice',
  recommendations = [],
  isExpertMode = false,
  onToggleExpertMode,
  onSelectTab,
  onOpenCallModal
}) => {
  const [refreshTick, setRefreshTick] = useState(0);

  // Subscribe to IoT device updates so live telemetry changes recalculate intelligence in real time
  useEffect(() => {
    const unsub = iotDeviceService.subscribe(() => {
      setRefreshTick(prev => prev + 1);
    });
    return unsub;
  }, []);

  const intelligence = useMemo(() => {
    return farmPredictionService.evaluateIntelligence({
      soilData,
      farmZones,
      weatherTemp,
      weatherHumidity,
      weatherWindSpeed,
      weatherRainProb,
      weatherRainfallForecastMm,
      cropName,
      recommendations
    });
  }, [
    soilData,
    farmZones,
    weatherTemp,
    weatherHumidity,
    weatherWindSpeed,
    weatherRainProb,
    weatherRainfallForecastMm,
    cropName,
    recommendations,
    refreshTick
  ]);

  const handleRefresh = () => {
    setRefreshTick(prev => prev + 1);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Farmer Header & High-Level Purpose Banner */}
      <div className="bg-gradient-to-r from-[#1b5e20] to-[#2e7d32] rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden space-y-4">
        <div className="flex items-start justify-between flex-wrap gap-4 relative z-10">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-mono font-bold uppercase tracking-wider backdrop-blur-xs flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5" />
                Phase 7 Digital Twin Intelligence
              </span>
              <span className="text-xs text-white/80 font-mono">
                {intelligence.overallPredictionConfidence.score}% Real-Time Confidence
              </span>
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-white">
              What may happen next?
            </h1>
            <p className="text-sm text-emerald-50 leading-relaxed">
              CroperX looks at your live sensors, weather radar, and soil history to warn you about possible problems before they become serious.
            </p>
          </div>

          {/* Mode Toggle & Actions */}
          <div className="flex items-center gap-2.5">
            {onToggleExpertMode && (
              <button
                type="button"
                onClick={onToggleExpertMode}
                className="px-4 py-2 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs transition-colors border border-white/20 flex items-center gap-2 min-h-[44px]"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isExpertMode ? 'Switch to Simple Mode' : 'Switch to Expert Mode'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleRefresh}
              className="p-2.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white transition-colors border border-white/20 min-h-[44px] min-w-[44px] flex items-center justify-center"
              title="Refresh Predictive Intelligence"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Minimal Data Requirements / Sufficiency Note */}
        {intelligence.dataSufficiencyNotice && (
          <div className="p-3 rounded-2xl bg-black/20 border border-white/15 text-xs text-emerald-100 flex items-center gap-2 relative z-10">
            <Info className="w-4 h-4 shrink-0 text-emerald-300" />
            <span>{intelligence.dataSufficiencyNotice}</span>
          </div>
        )}
      </div>

      {/* 2. Sensor Telemetry Anomaly Guard Banner */}
      <SensorAnomalyCard
        anomalyReport={intelligence.sensorAnomaly}
        onOpenIoTDiagnostics={() => onSelectTab('iot')}
      />

      {/* 3. Six Predictive Intelligence Cards (Simple & Expert) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-serif font-bold text-lg sm:text-xl text-[#1b2e1b] flex items-center gap-2">
            <span>Predictive Risk Matrix</span>
            <span className="text-xs font-mono font-normal text-gray-500">
              (Live Multimodal Signals)
            </span>
          </h2>
          <span className="text-xs font-mono text-[#2e7d32] font-semibold">
            6 Independent Early-Warning Vectors
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {/* Card 1: 💧 Water Risk */}
          <PredictiveRiskCard
            id="water-risk"
            title="💧 Water Risk"
            icon={Droplets}
            iconBgColor="bg-blue-100"
            iconColor="text-blue-600"
            status={intelligence.waterRisk.status}
            explanation={intelligence.waterRisk.explanation}
            confidence={intelligence.waterRisk.confidence}
            metricBadge={`${intelligence.waterRisk.currentMoisture}% Vol`}
            isExpertMode={isExpertMode}
            onNavigateTab={onSelectTab}
          />

          {/* Card 2: 🌡️ Heat Risk */}
          <PredictiveRiskCard
            id="heat-risk"
            title="🌡️ Heat Risk"
            icon={Thermometer}
            iconBgColor="bg-orange-100"
            iconColor="text-orange-600"
            status={intelligence.heatRisk.status}
            explanation={intelligence.heatRisk.explanation}
            confidence={intelligence.heatRisk.confidence}
            metricBadge={`Peak ${intelligence.heatRisk.forecastMaxTemp}°C`}
            isExpertMode={isExpertMode}
            onNavigateTab={onSelectTab}
          />

          {/* Card 3: 🌧️ Rain Risk */}
          <PredictiveRiskCard
            id="rain-risk"
            title="🌧️ Rain Risk"
            icon={CloudRain}
            iconBgColor="bg-sky-100"
            iconColor="text-sky-600"
            status={intelligence.rainfallDecision.status}
            explanation={intelligence.rainfallDecision.explanation}
            confidence={intelligence.rainfallDecision.confidence}
            metricBadge={`${intelligence.rainfallDecision.rainProbability}% Prob`}
            isExpertMode={isExpertMode}
            onNavigateTab={onSelectTab}
          />

          {/* Card 4: 🌱 Crop Stress */}
          <PredictiveRiskCard
            id="crop-stress"
            title="🌱 Crop Stress"
            icon={Sprout}
            iconBgColor="bg-emerald-100"
            iconColor="text-[#2e7d32]"
            status={intelligence.cropStress.status}
            explanation={intelligence.cropStress.explanation}
            confidence={intelligence.cropStress.confidence}
            metricBadge={`Stress: ${intelligence.cropStress.stressScore}/100`}
            isExpertMode={isExpertMode}
            onNavigateTab={onSelectTab}
          />

          {/* Card 5: 🐛 Disease Risk */}
          <PredictiveRiskCard
            id="disease-risk"
            title="🐛 Disease Risk"
            icon={ShieldAlert}
            iconBgColor="bg-purple-100"
            iconColor="text-purple-600"
            status={intelligence.diseaseRisk.status}
            explanation={intelligence.diseaseRisk.explanation}
            confidence={intelligence.diseaseRisk.confidence}
            metricBadge={`Index: ${intelligence.diseaseRisk.riskScore}/100`}
            isExpertMode={isExpertMode}
            onNavigateTab={onSelectTab}
          />

          {/* Card 6: 📡 Sensor Risk */}
          <PredictiveRiskCard
            id="sensor-risk"
            title="📡 Sensor Risk"
            icon={Radio}
            iconBgColor="bg-teal-100"
            iconColor="text-teal-700"
            status={intelligence.sensorAnomaly.severity}
            explanation={intelligence.sensorAnomaly.explanation}
            confidence={intelligence.sensorAnomaly.confidence}
            metricBadge={intelligence.sensorAnomaly.hasAnomaly ? 'Anomaly Detected' : 'Verified Healthy'}
            isExpertMode={isExpertMode}
            onNavigateTab={onSelectTab}
          />
        </div>
      </div>

      {/* 4. 72-Hour Predictive Timeline */}
      <FarmPredictionTimeline
        timeline={intelligence.timeline}
        depletionRatePerHour={intelligence.waterRisk.depletionRatePerHour}
      />

      {/* 5. Field Zone Comparison (Digital Twin) */}
      <ZoneComparison
        zones={intelligence.digitalTwinZones}
        onOpenFarmLayout={() => onSelectTab('farm')}
      />

      {/* 6. Irrigation Verification Check */}
      <IrrigationVerification
        verification={intelligence.irrigationVerification}
        currentMoisture={intelligence.waterRisk.currentMoisture}
        onRefresh={handleRefresh}
      />

      {/* 7. Farm What-If Scenario Sandbox */}
      <FarmWhatIfSimulator
        currentMoisture={intelligence.waterRisk.currentMoisture}
        currentTemp={weatherTemp}
      />
    </div>
  );
};
