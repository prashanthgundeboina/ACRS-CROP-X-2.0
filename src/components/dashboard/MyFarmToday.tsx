import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sprout,
  Droplets,
  Bug,
  CloudRain,
  Calculator,
  TrendingUp,
  Sparkles,
  ChevronRight,
  Activity,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Clock,
  Mic,
  Volume2,
  Calendar,
  ShieldAlert,
  Info,
  Radio,
  WifiOff,
  type LucideIcon,
  Brain
} from 'lucide-react';
import { SectionHeader } from '../ui/SectionHeader';
import { StatusBadge } from '../ui/StatusBadge';
import { AppTabId } from '../HeaderIconMenuBar';
import { SoilData, FarmZone, CropRecommendation, FarmerProfile, UserAccount } from '../../types';
import { FarmHealthScoreModal, HealthScoreBreakdown } from './FarmHealthScoreModal';
import { AskCroperXModal } from './AskCroperXModal';
import { evaluateIrrigationDecision, evaluateAllZones } from '../../services/irrigationEngine';
import { evaluateCropRisk } from '../../services/cropRiskEngine';
import { farmPredictionService } from '../../services/intelligence/farmPredictionService';
import { FarmResourceSummaryWidget } from '../resources/FarmResourceSummaryWidget';
import { FarmAutonomousSummaryWidget } from '../autonomous/FarmAutonomousSummaryWidget';

interface MyFarmTodayProps {
  soilData: SoilData;
  farmZones?: FarmZone[];
  weatherTemp?: number;
  weatherRainProb?: number;
  recommendations?: CropRecommendation[];
  isExpertMode: boolean;
  onToggleExpertMode: (expert: boolean) => void;
  onSelectTab: (tab: AppTabId) => void;
  onOpenCallModal: () => void;
  currentUser?: UserAccount | null;
  farmerProfile?: FarmerProfile | null;
}

export interface PriorityRecommendation {
  id: string;
  title: string; // e.g. "💧 Water North Field"
  what: string;  // WHAT? plain language explanation
  why: string;   // WHY? telemetry rationale
  actionText: string; // ACTION text on primary button
  when: string;  // WHEN? timeframe
  tabId: AppTabId;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  category: 'Water' | 'Weather' | 'Crop Health' | 'Fertilizer' | 'Market' | 'Soil';
  icon: LucideIcon;
  badgeLabel: string;
  badgeVariant: 'success' | 'warning' | 'danger' | 'info';
  expertMetric?: string;
}

interface PlanTask {
  id: string;
  timeOfDay: 'MORNING' | 'AFTERNOON' | 'EVENING';
  title: string;
  detail: string;
  tabId?: AppTabId;
}

export const MyFarmToday: React.FC<MyFarmTodayProps> = ({
  soilData,
  farmZones = [],
  weatherTemp = 30,
  weatherRainProb = 20,
  recommendations = [],
  isExpertMode,
  onToggleExpertMode,
  onSelectTab,
  onOpenCallModal,
  currentUser,
  farmerProfile,
}) => {
  const [isHealthModalOpen, setIsHealthModalOpen] = useState<boolean>(false);
  const [isAskModalOpen, setIsAskModalOpen] = useState<boolean>(false);
  const [askModalQuestion, setAskModalQuestion] = useState<string>('What should I do today?');
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string>(
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  );

  // Completed tasks state persisted to localStorage
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('croperx_today_plan_completed');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Handle Online/Offline Detection
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const toggleTask = (taskId: string) => {
    setCompletedTasks(prev => {
      const updated = { ...prev, [taskId]: !prev[taskId] };
      try {
        localStorage.setItem('croperx_today_plan_completed', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // -------------------------------------------------------------
  // 1. CALCULATE FARM HEALTH SCORE & CATEGORY BREAKDOWN
  // -------------------------------------------------------------
  const calculateHealthBreakdown = (): HealthScoreBreakdown => {
    // Soil Score (max 25)
    let soilScore = 20;
    let soilDetail = "Nutrient levels and pH balance are within healthy targets.";
    let soilExpert = `N: ${soilData.nitrogen}kg/ha, P: ${soilData.phosphorus}kg/ha, K: ${soilData.potassium}kg/ha, pH: ${soilData.ph}`;
    if (soilData.nitrogen < 90 || soilData.phosphorus < 20) {
      soilScore = 14;
      soilDetail = "Nitrogen deficit observed. Top dressing recommended.";
    }

    // Water Score (max 25)
    let waterScore = 22;
    let waterDetail = `Soil moisture is optimal at ${soilData.soil_moisture}%.`;
    let waterExpert = `Moisture: ${soilData.soil_moisture}%, Rainfall: ${soilData.rainfall}mm`;
    if (soilData.soil_moisture < 35) {
      waterScore = 12;
      waterDetail = `Soil moisture is low (${soilData.soil_moisture}%). Root zone needs irrigation.`;
    } else if (soilData.rainfall > 120) {
      waterScore = 16;
      waterDetail = `High rainfall (${soilData.rainfall}mm) may cause waterlogging.`;
    }

    // Crop Health Score (max 20)
    let cropScore = 18;
    let cropDetail = "Vegetative canopy growth is on schedule.";
    let cropExpert = `Growth Stage: ${soilData.growth_stage}%, Density: ${soilData.crop_density}`;

    // Weather Score (max 15)
    let weatherScore = 13;
    let weatherDetail = `Temperature ${soilData.temperature}°C with normal winds.`;
    let weatherExpert = `Temp: ${soilData.temperature}°C, Humidity: ${soilData.humidity}%, Wind: ${soilData.wind_speed}km/h`;
    if (soilData.temperature > 38) {
      weatherScore = 8;
      weatherDetail = `High heat (${soilData.temperature}°C) detected. Heat stress risk.`;
    }

    // Pest Risk Score (max 15)
    let pestScore = 14;
    let pestDetail = "Pest activity is currently low.";
    let pestExpert = `Humidity: ${soilData.humidity}%, Pest Pressure Index: ${soilData.pest_pressure}`;
    if (soilData.humidity > 70) {
      pestScore = 8;
      pestDetail = `High humidity (${soilData.humidity}%) increases fungal spore risk.`;
    }

    const totalScore = soilScore + waterScore + cropScore + weatherScore + pestScore;

    let statusText = "Your farm is looking good.";
    let statusVariant: 'good' | 'warning' | 'critical' = 'good';

    if (totalScore < 55 || soilData.soil_moisture < 25) {
      statusText = "Your farm needs immediate attention.";
      statusVariant = 'critical';
    } else if (totalScore < 80 || soilData.humidity > 75 || soilData.soil_moisture < 35) {
      statusText = "Your farm needs some attention.";
      statusVariant = 'warning';
    }

    return {
      totalScore,
      statusText,
      statusVariant,
      categories: {
        soil: {
          score: soilScore,
          maxScore: 25,
          status: soilScore >= 20 ? 'Optimal' : 'Deficit',
          detail: soilDetail,
          expertData: soilExpert
        },
        water: {
          score: waterScore,
          maxScore: 25,
          status: waterScore >= 20 ? 'Optimal' : 'Needs Water',
          detail: waterDetail,
          expertData: waterExpert
        },
        cropHealth: {
          score: cropScore,
          maxScore: 20,
          status: 'Good Growth',
          detail: cropDetail,
          expertData: cropExpert
        },
        weather: {
          score: weatherScore,
          maxScore: 15,
          status: weatherScore >= 12 ? 'Favorable' : 'Extreme Heat',
          detail: weatherDetail,
          expertData: weatherExpert
        },
        pestRisk: {
          score: pestScore,
          maxScore: 15,
          status: pestScore >= 12 ? 'Low Risk' : 'High Fungal Risk',
          detail: pestDetail,
          expertData: pestExpert
        }
      }
    };
  };

  const healthBreakdown = calculateHealthBreakdown();

  // -------------------------------------------------------------
  // 2. PRIORITY ENGINE (TOP PRIORITIES & MONITOR LIST)
  // -------------------------------------------------------------
  const allGeneratedItems: PriorityRecommendation[] = [];

  // Precision Irrigation AI Evaluation
  const primaryCropName = recommendations[0]?.crop || 'Rice';
  const irrigationEval = evaluateIrrigationDecision({
    soilData,
    cropName: primaryCropName,
    weatherTemp,
    weatherRainProb,
    weatherRainfallForecastMm: soilData.rainfall || 0,
    areaHa: farmZones[0]?.areaHa || 1.5,
    zoneName: farmZones[0]?.name || 'Main Field'
  });

  // Predictive Crop Risk Early Warning Evaluation (Phase 6)
  const cropRiskReport = evaluateCropRisk({
    soilData,
    farmZones,
    weatherTemp,
    weatherRainProb,
    weatherRainfallForecastMm: soilData.rainfall || 0,
    weatherWindSpeed: soilData.wind_speed,
    weatherHumidity: soilData.humidity,
    cropName: primaryCropName,
    recommendations
  });

  // Digital Twin Predictive Intelligence Evaluation (Phase 7)
  const farmIntel = farmPredictionService.evaluateIntelligence({
    soilData,
    farmZones,
    weatherTemp,
    weatherRainProb,
    weatherRainfallForecastMm: soilData.rainfall || 0,
    cropName: primaryCropName,
    recommendations
  });

  // Item 00: Sensor Anomaly Guard (Highest priority if active)
  if (farmIntel.sensorAnomaly.hasAnomaly) {
    allGeneratedItems.push({
      id: 'p-sensor-anomaly-warning',
      title: '📡 Unusual Sensor Telemetry Detected',
      what: farmIntel.sensorAnomaly.message,
      why: farmIntel.sensorAnomaly.explanation.why,
      actionText: 'Check Sensor Hub',
      when: 'Immediate',
      tabId: 'iot',
      severity: 'CRITICAL',
      category: 'Soil',
      icon: Radio,
      badgeLabel: 'Sensor Anomaly',
      badgeVariant: 'danger',
      expertMetric: `Safety Baseline Active • Confidence: ${farmIntel.sensorAnomaly.confidence.score}%`
    });
  }

  // Item 0: Predictive Farm Intelligence Warning (if High/Critical Water or Heat Risk)
  if (farmIntel.waterRisk.status === 'CRITICAL' || farmIntel.waterRisk.status === 'HIGH') {
    allGeneratedItems.push({
      id: 'p-farm-intel-water-risk',
      title: `🧠 ${farmIntel.waterRisk.title}`,
      what: farmIntel.waterRisk.explanation.what,
      why: farmIntel.waterRisk.explanation.why,
      actionText: 'Open Farm Intelligence',
      when: farmIntel.waterRisk.explanation.when,
      tabId: 'intelligence',
      severity: farmIntel.waterRisk.status === 'CRITICAL' ? 'CRITICAL' : 'HIGH',
      category: 'Water',
      icon: Brain,
      badgeLabel: 'Predictive Risk',
      badgeVariant: farmIntel.waterRisk.status === 'CRITICAL' ? 'danger' : 'warning',
      expertMetric: `Depletion: ~${farmIntel.waterRisk.depletionRatePerHour}%/hr • Horizon: ~${farmIntel.waterRisk.hoursToWiltingDeficit ?? 'N/A'} hrs`
    });
  }

  // Item 0b: Predictive Crop Risk Early Warning (if High or Moderate)
  if (cropRiskReport.overallLevel === 'HIGH' || cropRiskReport.overallLevel === 'MODERATE') {
    allGeneratedItems.push({
      id: 'p-crop-risk-early-warning',
      title: `🌱 Early Warning: ${cropRiskReport.dominantRiskLabel}`,
      what: isExpertMode ? `Risk Index: ${cropRiskReport.overallScore}/100. ${cropRiskReport.summary}` : cropRiskReport.headline,
      why: cropRiskReport.rankedFactors[0]?.why[0] || cropRiskReport.summary,
      actionText: 'View Crop Risk AI',
      when: cropRiskReport.rankedFactors[0]?.when || 'Today',
      tabId: 'risk',
      severity: cropRiskReport.overallLevel === 'HIGH' ? 'HIGH' : 'MEDIUM',
      category: 'Crop Health',
      icon: ShieldAlert,
      badgeLabel: cropRiskReport.overallLevel === 'HIGH' ? 'Elevated Risk' : 'Emerging Risk',
      badgeVariant: cropRiskReport.overallLevel === 'HIGH' ? 'danger' : 'warning',
      expertMetric: `Risk Score: ${cropRiskReport.overallScore}/100 • Dominant: ${cropRiskReport.dominantRiskLabel}`
    });
  }

  // Item 1: Precision Irrigation AI
  if (irrigationEval.statusCode === 'WATER_NOW') {
    allGeneratedItems.push({
      id: 'p-irrigation-water-now',
      title: `💧 Water Now (${farmZones[0]?.name || 'Main Field'})`,
      what: isExpertMode ? `Deficit: ${irrigationEval.grossIrrigationRequiredMm}mm. Moisture: ${soilData.soil_moisture}%.` : irrigationEval.what,
      why: irrigationEval.why,
      actionText: 'View Irrigation Plan',
      when: irrigationEval.when,
      tabId: 'irrigation',
      severity: 'CRITICAL',
      category: 'Water',
      icon: Droplets,
      badgeLabel: 'Water Required',
      badgeVariant: 'danger',
      expertMetric: `Deficit: ${irrigationEval.grossIrrigationRequiredMm}mm • ET₀: ${irrigationEval.evapotranspirationMmDay}mm/d`
    });
  } else if (irrigationEval.statusCode === 'WATER_SOON') {
    allGeneratedItems.push({
      id: 'p-irrigation-water-soon',
      title: `💧 Water Soon (${farmZones[0]?.name || 'Main Field'})`,
      what: isExpertMode ? `Moisture is declining (${soilData.soil_moisture}%). Target: 45-60%.` : irrigationEval.what,
      why: irrigationEval.why,
      actionText: 'View Irrigation Plan',
      when: irrigationEval.when,
      tabId: 'irrigation',
      severity: 'HIGH',
      category: 'Water',
      icon: Droplets,
      badgeLabel: 'Water Soon',
      badgeVariant: 'warning',
      expertMetric: `Moisture: ${soilData.soil_moisture}% • ETc: ${irrigationEval.cropWaterNeedMmDay}mm/d`
    });
  } else if (irrigationEval.statusCode === 'WAIT') {
    allGeneratedItems.push({
      id: 'p-irrigation-wait',
      title: '🌧️ Hold Off Irrigation (Wait)',
      what: isExpertMode ? `Rain forecast (${weatherRainProb}%) or high soil moisture (${soilData.soil_moisture}%).` : irrigationEval.what,
      why: irrigationEval.why,
      actionText: 'Check Rain & Plan',
      when: irrigationEval.when,
      tabId: 'irrigation',
      severity: 'MEDIUM',
      category: 'Water',
      icon: CloudRain,
      badgeLabel: 'Delay Irrigation',
      badgeVariant: 'info',
      expertMetric: `Rain Prob: ${weatherRainProb}% • Moisture: ${soilData.soil_moisture}%`
    });
  } else {
    allGeneratedItems.push({
      id: 'p-irrigation-monitor',
      title: '💧 Moisture Balanced (Monitor)',
      what: isExpertMode ? `Root-zone hydration is balanced (${soilData.soil_moisture}%).` : irrigationEval.what,
      why: irrigationEval.why,
      actionText: 'Inspect Probes',
      when: irrigationEval.when,
      tabId: 'irrigation',
      severity: 'LOW',
      category: 'Water',
      icon: Droplets,
      badgeLabel: 'Optimal Water',
      badgeVariant: 'success',
      expertMetric: `Moisture: ${soilData.soil_moisture}% • ET₀: ${irrigationEval.evapotranspirationMmDay}mm/d`
    });
  }

  // Item 2: Pest & Disease
  if (soilData.humidity > 70 || soilData.pest_pressure > 60) {
    allGeneratedItems.push({
      id: 'p-pest',
      title: '🐛 Check Plants for Pests',
      what: isExpertMode ? `Elevated atmospheric humidity (${soilData.humidity}%) enhances fungal pathogen spore germination.` : `There may be more pests or mold in this field.`,
      why: `Warm humid air creates ideal conditions for fungal leaf spots and stem rust.`,
      actionText: 'Scan Plant Photo',
      when: 'Today morning',
      tabId: 'diagnostics',
      severity: 'HIGH',
      category: 'Crop Health',
      icon: Bug,
      badgeLabel: 'Fungal Risk',
      badgeVariant: 'danger',
      expertMetric: `RH: ${soilData.humidity}%, Pest Pressure: ${soilData.pest_pressure}`
    });
  } else {
    allGeneratedItems.push({
      id: 'p-health-check',
      title: '🌿 Preventive Leaf Inspection',
      what: `Routine crop health scan recommended.`,
      why: `Early detection of minor leaf discoloration prevents widespread infection.`,
      actionText: 'Scan Plant',
      when: 'This week',
      tabId: 'diagnostics',
      severity: 'LOW',
      category: 'Crop Health',
      icon: Sprout,
      badgeLabel: 'Routine Check',
      badgeVariant: 'info'
    });
  }

  // Item 3: Fertilizer / Nutrients
  if (soilData.nitrogen < 120) {
    const deficit = Math.max(0, 140 - soilData.nitrogen);
    allGeneratedItems.push({
      id: 'p-[#4CAF50]',
      title: '🧪 Apply Nitrogen Boost (Urea)',
      what: isExpertMode ? `Soil Nitrogen is low at ${soilData.nitrogen} kg/ha (Deficit: ${deficit} kg/ha).` : `Your crop needs extra food to grow strong.`,
      why: `Nitrogen is required for chlorophyll synthesis and leaf canopy expansion during vegetative growth.`,
      actionText: 'Calculate Fertilizer Dose',
      when: 'Within 2 days',
      tabId: 'fertilizer',
      severity: 'MEDIUM',
      category: 'Fertilizer',
      icon: Calculator,
      badgeLabel: 'Nutrient Deficit',
      badgeVariant: 'warning',
      expertMetric: `N Deficit: ${deficit} kg/ha`
    });
  } else {
    allGeneratedItems.push({
      id: 'p-market',
      title: '💰 Check Mandi Market Prices',
      what: `Local Mandi market prices are updating today.`,
      why: `Recent demand spikes for primary crops provide profitable selling opportunities.`,
      actionText: 'View Market ROI',
      when: 'Today afternoon',
      tabId: 'market',
      severity: 'LOW',
      category: 'Market',
      icon: TrendingUp,
      badgeLabel: 'Market Opportunity',
      badgeVariant: 'success'
    });
  }

  // Separate Top Priorities (Max 3) vs Monitor List (Max 3)
  const topPriorities = allGeneratedItems
    .filter(item => item.severity === 'CRITICAL' || item.severity === 'HIGH' || item.severity === 'MEDIUM')
    .slice(0, 3);

  // If less than 3, backfill with remaining items
  if (topPriorities.length < 3) {
    const remaining = allGeneratedItems.filter(item => !topPriorities.includes(item));
    topPriorities.push(...remaining.slice(0, 3 - topPriorities.length));
  }

  const monitorItems = allGeneratedItems
    .filter(item => !topPriorities.includes(item))
    .slice(0, 3);

  // If monitor items empty, add default watch items
  if (monitorItems.length === 0) {
    monitorItems.push({
      id: 'm-weather-watch',
      title: '⛅ Monitor Microclimate & Wind',
      what: 'Wind speed is currently calm at 12 km/h.',
      why: 'Calm winds allow effective spray application without drift loss.',
      actionText: 'View Weather Radar',
      when: 'Continuous',
      tabId: 'weather',
      severity: 'LOW',
      category: 'Weather',
      icon: CloudRain,
      badgeLabel: 'Calm Breeze',
      badgeVariant: 'info'
    });
  }

  // -------------------------------------------------------------
  // 3. TODAY'S FARM PLAN SCHEDULE
  // -------------------------------------------------------------
  const todayTasks: PlanTask[] = [
    {
      id: 'task-1',
      timeOfDay: 'MORNING',
      title: 'Inspect soil moisture & plant canopy',
      detail: 'Walk North plot and check moisture probe values.',
      tabId: 'farm'
    },
    {
      id: 'task-2',
      timeOfDay: 'MORNING',
      title: 'Scan leaves for early pest spots',
      detail: 'Use AI Plant Scan to check lower leaf surface for fungal spots.',
      tabId: 'diagnostics'
    },
    {
      id: 'task-3',
      timeOfDay: 'AFTERNOON',
      title: 'Check Mandi market rates & fertilizer stock',
      detail: 'Review Urea/DAP quantities for top dressing split application.',
      tabId: 'fertilizer'
    },
    {
      id: 'task-4',
      timeOfDay: 'EVENING',
      title: 'Irrigate dry sectors or review rain forecast',
      detail: 'Operate drip irrigation valves for 45 minutes if dry.',
      tabId: 'farm'
    }
  ];

  const completedCount = Object.values(completedTasks).filter(Boolean).length;

  const openVoiceExplain = (q: string) => {
    setAskModalQuestion(q);
    setIsAskModalOpen(true);
  };

  return (
    <section className="space-y-6 my-6">
      {/* Offline Banner */}
      {isOffline && (
        <div className="p-3.5 bg-amber-500/15 border border-amber-500/30 rounded-2xl text-amber-900 text-xs flex items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-amber-600 shrink-0" />
            <span className="font-semibold">
              Offline — showing your last farm plan.
            </span>
          </div>
          <span className="font-mono text-[11px] text-amber-800">
            Last updated: {lastUpdatedTime}
          </span>
        </div>
      )}

      {/* Main Header Card */}
      <div className="bg-gradient-to-br from-white via-[#f8fcf8] to-[#e8f5e9] rounded-3xl p-6 border border-[#c8e6c9] shadow-md relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#2e7d32]/10 rounded-full text-xs font-mono font-bold text-[#2e7d32]">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>AI Farm Command Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1b2e1b] font-serif tracking-tight">
              🌱 My Farm Today
            </h1>
            <p className="text-xs sm:text-sm text-gray-600 font-sans">
              Here are the most important things for your farm today based on live soil, crop & weather telemetry.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* Overall Farm Status Badge */}
            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-2xl border border-gray-200 shadow-xs">
              <span className={`w-3 h-3 rounded-full animate-ping ${
                healthBreakdown.statusVariant === 'good' ? 'bg-emerald-500' :
                healthBreakdown.statusVariant === 'warning' ? 'bg-amber-500' : 'bg-rose-500'
              }`} />
              <span className="text-xs font-bold text-gray-800 font-serif">
                {healthBreakdown.statusText}
              </span>
            </div>

            {/* Farm Health Score Trigger Button */}
            <button
              onClick={() => setIsHealthModalOpen(true)}
              className="px-4 py-2 bg-[#1b2e1b] hover:bg-[#2e7d32] text-white rounded-2xl font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer border border-[#4CAF50]/30"
            >
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>Farm Health: {healthBreakdown.totalScore}%</span>
            </button>

            {/* Voice Assistant Button */}
            <button
              onClick={() => openVoiceExplain("What should I do today?")}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white rounded-2xl font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Mic className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>🎙️ Ask CroperX</span>
            </button>
          </div>
        </div>

        {/* Quick Actions Horizontal Scroll Bar */}
        <div className="mt-6 pt-4 border-t border-gray-200/80">
          <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-gray-500 mb-2.5">
            Quick Actions
          </div>
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {[
              { label: '📷 Live Field Cam', tab: 'vision' },
              { label: '🧠 Farm Brain', tab: 'autonomous' },
              { label: '🌱 Predict Crop', tab: 'recommendation' },
              { label: '📷 Check Plant', tab: 'diagnostics' },
              { label: '💧 Check Water', tab: 'farm' },
              { label: '🧪 Fertilizer', tab: 'fertilizer' },
              { label: '🌦️ Weather', tab: 'weather' },
              { label: '💰 Market', tab: 'market' },
              { label: '🎙️ Ask AI', action: () => openVoiceExplain("What needs attention?") },
            ].map((qa) => (
              <button
                key={qa.label}
                onClick={() => {
                  if (qa.action) qa.action();
                  else if (qa.tab) onSelectTab(qa.tab as AppTabId);
                }}
                className="px-3.5 py-2 bg-white hover:bg-emerald-50 text-[#1b2e1b] hover:text-[#2e7d32] rounded-xl text-xs font-bold border border-gray-200 hover:border-emerald-300 shadow-2xs transition-all whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
              >
                <span>{qa.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4. TOP PRIORITIES (MAX 3) */}
      {/* ------------------------------------------------------------- */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-rose-500/10 text-rose-600 rounded-xl">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#1b2e1b] font-serif">
                🔥 Top Priorities
              </h2>
              <p className="text-xs text-gray-500">
                Maximum 3 immediate actions recommended for today.
              </p>
            </div>
          </div>

          <span className="text-xs font-mono font-bold text-gray-400">
            {topPriorities.length} Active Items
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {topPriorities.map((item) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl p-5 border border-gray-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 relative overflow-hidden group"
              >
                <div className="space-y-3">
                  {/* Category Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-emerald-50 text-[#2e7d32] rounded-xl border border-emerald-100">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-mono font-bold text-gray-600 uppercase">
                        {item.category}
                      </span>
                    </div>

                    <StatusBadge
                      label={item.badgeLabel}
                      variant={item.badgeVariant}
                      size="sm"
                    />
                  </div>

                  <h3 className="text-base font-bold text-gray-900 font-serif">
                    {item.title}
                  </h3>

                  {/* WHAT? WHY? ACTION? WHEN? Structured Format */}
                  <div className="space-y-2 bg-gray-50/80 p-3.5 rounded-2xl border border-gray-100 text-xs">
                    <div>
                      <strong className="text-gray-900 uppercase font-mono text-[10px] block text-emerald-800">
                        WHAT?
                      </strong>
                      <span className="text-gray-700 font-medium">{item.what}</span>
                    </div>

                    <div>
                      <strong className="text-gray-900 uppercase font-mono text-[10px] block text-amber-800">
                        WHY?
                      </strong>
                      <span className="text-gray-600">{item.why}</span>
                    </div>

                    {isExpertMode && item.expertMetric && (
                      <div className="pt-1.5 border-t border-gray-200/60 text-[11px] font-mono text-emerald-900">
                        📊 {item.expertMetric}
                      </div>
                    )}

                    <div className="flex items-center gap-1.5 text-gray-500 text-[11px] pt-1">
                      <Clock className="w-3 h-3 text-gray-400" />
                      <span>Execute: <strong>{item.when}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => onSelectTab(item.tabId)}
                    className="flex-1 py-2.5 px-3 bg-[#1b2e1b] hover:bg-[#2e7d32] text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>{item.actionText}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => openVoiceExplain(`Why should I ${item.title}?`)}
                    title="Ask CroperX Voice to explain this task"
                    className="p-2.5 bg-emerald-50 hover:bg-emerald-100 text-[#2e7d32] rounded-xl border border-emerald-200 transition-all cursor-pointer"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 4.25. FARM BRAIN & MULTI-AGENT COMMAND CENTER (PHASE 10) */}
      {/* ------------------------------------------------------------- */}
      <FarmAutonomousSummaryWidget
        soilData={soilData}
        cropName={recommendations?.[0]?.crop || 'Tomato'}
        farmZones={farmZones}
        weatherTemp={weatherTemp}
        weatherHumidity={soilData?.humidity ?? 55}
        weatherRainProb={weatherRainProb}
        weatherRainfallForecastMm={soilData?.rainfall ?? 0}
        onSelectTab={onSelectTab}
        onOpenAskCroperX={(q) => openVoiceExplain(q)}
      />

      {/* ------------------------------------------------------------- */}
      {/* 4.5. FARM RESOURCES & MONEY (PHASE 9 COMMAND CENTER) */}
      {/* ------------------------------------------------------------- */}
      <FarmResourceSummaryWidget
        soilData={soilData}
        cropName={recommendations?.[0]?.crop || 'Tomato'}
        farmAreaAcres={3.5}
        farmZones={farmZones}
        weatherTemp={weatherTemp}
        weatherHumidity={soilData?.humidity ?? 55}
        weatherRainfallForecastMm={soilData?.rainfall ?? 0}
        onNavigateToResources={(subSection) => {
          onSelectTab('resources');
        }}
      />

      {/* ------------------------------------------------------------- */}
      {/* 5. THINGS TO MONITOR */}
      {/* ------------------------------------------------------------- */}
      {monitorItems.length > 0 && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-gray-700 font-serif flex items-center gap-2">
              <Info className="w-4 h-4 text-emerald-600" />
              <span>👀 Things to Watch & Monitor</span>
            </h2>
            <span className="text-xs text-gray-400 font-mono">Max 3 Items</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {monitorItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className="p-4 bg-white/80 rounded-2xl border border-gray-200/80 flex items-center justify-between gap-3 shadow-2xs hover:bg-white transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 text-gray-700 rounded-xl">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-gray-900 font-serif">
                        {item.title}
                      </div>
                      <div className="text-[11px] text-gray-500 line-clamp-1">
                        {item.what}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => onSelectTab(item.tabId)}
                    className="p-1.5 hover:bg-emerald-50 text-gray-400 hover:text-[#2e7d32] rounded-lg transition-colors shrink-0"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 6. TODAY'S FARM PLAN (SCHEDULED TASK TIMELINE) */}
      {/* ------------------------------------------------------------- */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#2e7d32]/10 text-[#2e7d32] rounded-2xl">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#1b2e1b] font-serif">
                Today's Farm Plan
              </h2>
              <p className="text-xs text-gray-500">
                Interactive daily schedule for optimal field operations.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
              {completedCount} / {todayTasks.length} Completed
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all duration-300"
            style={{ width: `${(completedCount / todayTasks.length) * 100}%` }}
          />
        </div>

        {/* Timeline Tasks */}
        <div className="space-y-2 pt-2">
          {todayTasks.map((task) => {
            const isDone = !!completedTasks[task.id];
            return (
              <div
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isDone
                    ? 'bg-emerald-50/60 border-emerald-200 text-gray-500'
                    : 'bg-gray-50 hover:bg-emerald-50/30 border-gray-200 text-gray-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <button className="text-[#2e7d32] shrink-0">
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-300" />
                    )}
                  </button>

                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white border border-gray-200 text-gray-600">
                        {task.timeOfDay === 'MORNING' ? '🌅 MORNING' :
                         task.timeOfDay === 'AFTERNOON' ? '☀️ AFTERNOON' : '🌙 EVENING'}
                      </span>
                      <span className={`text-xs font-bold font-serif ${isDone ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                        {task.title}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 font-sans">
                      {task.detail}
                    </p>
                  </div>
                </div>

                {task.tabId && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectTab(task.tabId!);
                    }}
                    className="p-1.5 hover:bg-white text-gray-400 hover:text-[#2e7d32] rounded-lg transition-colors shrink-0"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Farm Health Score Breakdown Modal */}
      <FarmHealthScoreModal
        isOpen={isHealthModalOpen}
        onClose={() => setIsHealthModalOpen(false)}
        breakdown={healthBreakdown}
        isExpertMode={isExpertMode}
        onToggleExpertMode={onToggleExpertMode}
      />

      {/* Ask CroperX Voice Modal */}
      <AskCroperXModal
        isOpen={isAskModalOpen}
        onClose={() => setIsAskModalOpen(false)}
        initialQuestion={askModalQuestion}
        soilData={soilData}
        recommendations={recommendations}
        weatherTemp={weatherTemp}
        weatherRainProb={weatherRainProb}
        farmZones={farmZones}
        isExpertMode={isExpertMode}
        onOpenCallModal={onOpenCallModal}
        onNavigateTab={onSelectTab}
      />
    </section>
  );
};
