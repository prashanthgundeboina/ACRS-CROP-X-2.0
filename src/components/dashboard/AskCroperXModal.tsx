import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Mic, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  PhoneCall, 
  HelpCircle, 
  MessageSquare,
  Bot,
  ChevronRight,
  Droplets,
  Sprout,
  Calculator,
  CloudRain,
  Send,
  User,
  AlertTriangle,
  ShieldAlert,
  Brain,
  RotateCcw,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';
import { SoilData, CropRecommendation, FarmZone } from '../../types';
import { AppTabId } from '../HeaderIconMenuBar';
import { evaluateIrrigationDecision } from '../../services/irrigationEngine';
import { evaluateCropRisk } from '../../services/cropRiskEngine';
import { iotDeviceService } from '../../services/iot/iotDeviceService';
import { farmPredictionService } from '../../services/intelligence/farmPredictionService';

interface AskCroperXModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuestion?: string;
  soilData: SoilData;
  recommendations?: CropRecommendation[];
  weatherTemp?: number;
  weatherRainProb?: number;
  farmZones?: FarmZone[];
  isExpertMode?: boolean;
  onOpenCallModal: () => void;
  onNavigateTab?: (tab: AppTabId) => void;
  onSelectTab?: (tab: AppTabId) => void;
}

export interface StructuredAnswer {
  what: string;       // WHAT IS HAPPENING / ANSWER
  why: string;        // WHY?
  action: string;     // WHAT SHOULD I DO?
  when: string;       // WHEN?
  avoid?: string;     // WHAT SHOULD I AVOID?
  navTab: AppTabId;   // Action navigation tab
  navLabel: string;   // Label for navigation button e.g. "Water Field"
  expertDetail?: string; // Additional metric details for Expert Mode
  sourceSignals?: Record<string, boolean>; // Traceability
  isDataMissing?: boolean; // AI Safety flag if required context missing
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text?: string;
  structured?: StructuredAnswer;
  timestamp: string;
}

export const AskCroperXModal: React.FC<AskCroperXModalProps> = ({
  isOpen,
  onClose,
  initialQuestion,
  soilData,
  recommendations = [],
  weatherTemp = 30,
  weatherRainProb = 20,
  farmZones = [],
  isExpertMode = false,
  onOpenCallModal,
  onNavigateTab,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuery, setInputQuery] = useState<string>('');
  const [voiceStep, setVoiceStep] = useState<'idle' | 'listening' | 'understanding' | 'checking' | 'speaking'>('idle');
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Quick prompt presets
  const quickQuestions = [
    { q: 'What may happen next on my farm?', icon: Brain },
    { q: 'Will my field become dry tomorrow?', icon: Droplets },
    { q: 'Which field needs attention?', icon: Sprout },
    { q: 'Is my sensor working correctly?', icon: ShieldCheck },
    { q: 'Is my crop under stress?', icon: AlertTriangle },
    { q: 'Is my crop at risk this week?', icon: ShieldAlert },
    { q: 'Should I water my field?', icon: Droplets },
    { q: 'Is rain coming?', icon: CloudRain },
    { q: 'What fertilizer should I use?', icon: Calculator },
  ];

  // Generate structured response using real farm context & intent recognition
  const generateStructuredAnswer = (question: string, history: ChatMessage[] = []): StructuredAnswer => {
    const qLower = question.toLowerCase();

    // Context Safety Check: If soil data or moisture is uninitialized/missing
    if (!soilData || soilData.soil_moisture === undefined || soilData.soil_moisture === null) {
      return {
        what: "I don't have enough information to give you a reliable recommendation.",
        why: "Essential soil and moisture telemetry are currently missing or uninitialized.",
        action: "Run a quick soil test or enter your farm parameters manually.",
        when: "Before planning field operations",
        avoid: "Do not apply chemical fertilizers or heavy irrigation without soil tests.",
        navTab: 'recommendation',
        navLabel: 'Add Farm Data',
        isDataMissing: true,
        sourceSignals: { soilMoisture: false, npk: false }
      };
    }

    // Evaluate Phase 7 Predictive Farm Intelligence
    const primaryCrop = recommendations[0]?.crop || 'Rice';
    const intelligence = farmPredictionService.evaluateIntelligence({
      soilData,
      farmZones,
      weatherTemp,
      weatherRainProb,
      weatherRainfallForecastMm: soilData.rainfall || 0,
      cropName: primaryCrop,
      recommendations
    });

    // 0.0 Phase 7 Predictive Intelligence Intent: "What may happen next?", "Will field become dry?", "Water tomorrow?", "Soil drying quickly?"
    if (
      qLower.includes('what may happen') ||
      qLower.includes('what will happen') ||
      qLower.includes('become dry') ||
      qLower.includes('drying quickly') ||
      qLower.includes('water tomorrow') ||
      qLower.includes('need water tomorrow') ||
      qLower.includes('future') ||
      qLower.includes('timeline') ||
      qLower.includes('farm intelligence')
    ) {
      const waterExp = intelligence.waterRisk.explanation;
      const rate = intelligence.waterRisk.depletionRatePerHour;
      const hoursToWilting = intelligence.waterRisk.hoursToWiltingDeficit;

      return {
        what: `🧠 ${intelligence.waterRisk.title}: ${waterExp.what}`,
        why: `Depletion rate is ~${rate}%/hr under current ${weatherTemp}°C conditions. ${hoursToWilting ? `Wilting threshold may be reached in ~${hoursToWilting} hours without irrigation.` : ''}`,
        action: waterExp.action,
        when: waterExp.when,
        avoid: waterExp.avoid,
        navTab: 'intelligence',
        navLabel: 'Open Farm Intelligence',
        expertDetail: `Depletion: ~${rate}%/hr | Wilting Deficit: ~${hoursToWilting ?? 'N/A'} hrs | ETc: ${(soilData.temperature * 0.15).toFixed(1)} mm/d | Confidence: ${intelligence.overallPredictionConfidence.score}%`,
        sourceSignals: { weather: true, soilMoisture: true, humidity: true, rainForecast: true, iotSensors: true }
      };
    }

    // 0.1 Phase 7 Zone Comparison Intent: "Which field needs attention?", "Which zone?"
    if (
      qLower.includes('which field') ||
      qLower.includes('which zone') ||
      qLower.includes('field needs attention') ||
      qLower.includes('compare fields')
    ) {
      const urgentZone = intelligence.digitalTwinZones.find(z => z.riskStatus === 'CRITICAL' || z.riskStatus === 'HIGH') 
        || intelligence.digitalTwinZones[0];

      return {
        what: `📍 Zone Attention: ${urgentZone?.name || 'Main Field'} requires attention (${urgentZone?.moisture}% moisture).`,
        why: urgentZone?.riskSummary || 'Moisture variance detected across management zones.',
        action: 'Inspect the zone in Farm Layout and verify drip line pressure.',
        when: 'Today during morning field walk',
        avoid: 'Do not apply blanket watering across zones with differing moisture balances.',
        navTab: 'intelligence',
        navLabel: 'Compare Field Zones',
        expertDetail: `Urgent Zone: ${urgentZone?.name} | Moisture: ${urgentZone?.moisture}% | Crop: ${urgentZone?.assignedCrop} | NDVI: ${urgentZone?.vegetationNdvi}`,
        sourceSignals: { soilMoisture: true, cropPhenology: true, iotSensors: true }
      };
    }

    // 0.2 Phase 7 Crop Stress Intent: "Is my crop under stress?"
    if (
      qLower.includes('crop stress') ||
      qLower.includes('under stress') ||
      qLower.includes('plant stress') ||
      qLower.includes('stressed')
    ) {
      const stressExp = intelligence.cropStress.explanation;
      return {
        what: `🌱 ${intelligence.cropStress.title}: ${stressExp.what}`,
        why: stressExp.why,
        action: stressExp.action,
        when: stressExp.when,
        avoid: stressExp.avoid,
        navTab: 'intelligence',
        navLabel: 'Check Crop Stress Intelligence',
        expertDetail: `Stress Score: ${intelligence.cropStress.stressScore}/100 | Dominant: ${intelligence.cropStress.dominantCause}`,
        sourceSignals: { weather: true, soilMoisture: true, humidity: true, npk: true }
      };
    }

    // 0.3 Phase 7 Sensor Verification Intent: "Is my sensor working correctly?"
    if (
      qLower.includes('sensor working') ||
      qLower.includes('sensor correct') ||
      qLower.includes('sensor faulty') ||
      qLower.includes('sensor anomaly') ||
      qLower.includes('probe accurate')
    ) {
      const anomaly = intelligence.sensorAnomaly;
      return {
        what: `📡 ${anomaly.title}: ${anomaly.message}`,
        why: anomaly.explanation.why,
        action: anomaly.explanation.action,
        when: anomaly.explanation.when,
        avoid: anomaly.explanation.avoid,
        navTab: 'iot',
        navLabel: 'Open IoT Sensor Hub',
        expertDetail: anomaly.details,
        sourceSignals: { iotSensors: true, soilMoisture: true }
      };
    }

    // 0. Crop Risk & Early Warning Intent (Phase 6)
    if (
      qLower.includes('risk') || 
      qLower.includes('danger') || 
      qLower.includes('warning') || 
      qLower.includes('threat') || 
      qLower.includes('problem') || 
      qLower.includes('early warning') ||
      qLower.includes('pest risk') ||
      qLower.includes('disease risk')
    ) {
      const primaryCrop = recommendations[0]?.crop || 'Rice';
      const riskReport = evaluateCropRisk({
        soilData,
        farmZones,
        weatherTemp,
        weatherRainProb,
        weatherRainfallForecastMm: soilData.rainfall || 0,
        weatherWindSpeed: soilData.wind_speed,
        weatherHumidity: soilData.humidity,
        cropName: primaryCrop,
        recommendations
      });

      const topFactor = riskReport.rankedFactors[0];
      const activeCount = riskReport.rankedFactors.filter(f => f.level === 'HIGH' || f.level === 'MODERATE').length;

      return {
        what: `${riskReport.overallLevel} RISK: ${riskReport.headline}`,
        why: riskReport.summary,
        action: topFactor?.action || "Inspect fields and review preventive recommendations in Crop Risk AI.",
        when: topFactor?.when || "Today",
        avoid: topFactor?.avoid || "Avoid waiting until crop leaves show visible symptoms.",
        navTab: 'risk',
        navLabel: 'Open Predictive Crop Risk AI',
        expertDetail: `Overall Risk Score: ${riskReport.overallScore}/100 | Dominant: ${riskReport.dominantRiskLabel} | Active Hazards: ${activeCount}`,
        sourceSignals: { weather: true, soilMoisture: true, humidity: true, npk: true, rainForecast: true }
      };
    }

    // 0.5 IoT Sensor Intent
    if (
      qLower.includes('sensor') || 
      qLower.includes('iot') || 
      qLower.includes('esp32') || 
      qLower.includes('probe') ||
      qLower.includes('telemetry') || 
      (qLower.includes('soil moisture') && (qLower.includes('live') || qLower.includes('reading') || qLower.includes('what is')))
    ) {
      const iotState = iotDeviceService.getState();
      const isLive = iotState.connectionState === 'receiving_data';
      const latestTelemetry = iotState.latestTelemetry;
      const lastKnown = iotState.lastKnownTelemetry;
      const moistureVal = latestTelemetry?.readings['soil_moisture']?.value ?? lastKnown?.readings['soil_moisture']?.value ?? soilData.soil_moisture;

      if (isLive && latestTelemetry) {
        const timeAgoSec = Math.max(1, Math.round((Date.now() - new Date(latestTelemetry.timestamp).getTime()) / 1000));
        return {
          what: `📡 Connected sensor reports ${moistureVal}% soil moisture.`,
          why: `Live telemetry received ${timeAgoSec}s ago from device ID ${latestTelemetry.deviceId}.`,
          action: "Review sensor status or open Smart Irrigation to see real-time watering needs.",
          when: "Right now (Live stream active)",
          avoid: "Do not disconnect the USB cable during active telemetry logging.",
          navTab: 'iot',
          navLabel: 'Open IoT Sensors',
          expertDetail: `Device: ${latestTelemetry.deviceId} | Packets: ${iotState.healthMetrics.totalPacketsReceived} | Status: Healthy`,
          sourceSignals: { iotSensors: true, soilMoisture: true }
        };
      } else if (lastKnown) {
        const dateStr = new Date(lastKnown.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        return {
          what: `🔌 Sensor is currently disconnected. Last known reading was ${moistureVal}% at ${dateStr}.`,
          why: "USB Serial stream is not active. Using cached reading or farm baseline.",
          action: "Plug in the ESP32 USB cable and click Connect Sensor to resume live readings.",
          when: "When physical device is reconnected",
          avoid: "Never assume disconnected readings represent real-time rainfall changes.",
          navTab: 'iot',
          navLabel: 'Connect IoT Sensor',
          expertDetail: `Last Seen: ${lastKnown.deviceId} at ${dateStr} | Status: Disconnected`,
          sourceSignals: { iotSensors: false, soilMoisture: true }
        };
      } else {
        return {
          what: `No physical sensor is connected. Using farm baseline moisture: ${soilData.soil_moisture}%.`,
          why: "CroperX works standalone, but connecting an ESP32 USB probe enables live soil and canopy telemetry.",
          action: "Connect your ESP32 sensor or test the Developer Simulator in the IoT Sensor Hub.",
          when: "Anytime",
          avoid: "No physical sensor is needed to run CroperX predictions.",
          navTab: 'iot',
          navLabel: 'Explore IoT Hub',
          expertDetail: `Hardware: No serial port claimed | Baseline: ${soilData.soil_moisture}%`,
          sourceSignals: { iotSensors: false, soilMoisture: true }
        };
      }
    }

    // 1. Water / Irrigation Intent
    if (qLower.includes('water') || qLower.includes('irrigate') || qLower.includes('dry') || qLower.includes('moisture') || qLower.includes('pump')) {
      const primaryCrop = recommendations[0]?.crop || 'Rice';
      const evalResult = evaluateIrrigationDecision({
        soilData,
        cropName: primaryCrop,
        weatherTemp,
        weatherRainProb,
        weatherRainfallForecastMm: soilData.rainfall || 0,
        areaHa: farmZones[0]?.areaHa || 1.5,
        zoneName: farmZones[0]?.name || 'Main Field'
      });

      return {
        what: `${evalResult.statusLabel}: ${evalResult.what}`,
        why: evalResult.why,
        action: evalResult.action,
        when: evalResult.when,
        avoid: evalResult.avoid,
        navTab: 'irrigation',
        navLabel: 'Open Smart Irrigation AI',
        expertDetail: `ET₀: ${evalResult.evapotranspirationMmDay}mm/d | ETc (${primaryCrop}): ${evalResult.cropWaterNeedMmDay}mm/d | Req: ${evalResult.grossIrrigationRequiredMm || 0}mm | Moisture: ${soilData.soil_moisture}%`,
        sourceSignals: { soilMoisture: true, rainForecast: true, weather: true, cropPhenology: true }
      };
    }

    // 2. Follow-Up Intent: "What if it doesn't rain?"
    if (qLower.includes("doesn't rain") || qLower.includes("no rain") || qLower.includes("if it does not rain")) {
      return {
        what: "💧 If no rain occurs by tomorrow evening, start drip irrigation.",
        why: `Soil moisture is currently at ${soilData.soil_moisture}%. If cloud cover clears without precipitation, root stress will begin.`,
        action: "Run drip irrigation for 30–40 minutes if rainfall fails to materialize.",
        when: "Tomorrow at sunset (6:00 PM).",
        avoid: "Don't let soil moisture drop below 25%.",
        navTab: 'farm',
        navLabel: 'Open Field Layout',
        expertDetail: `Current Moisture: ${soilData.soil_moisture}% | Depletion Rate: ~3%/day`,
        sourceSignals: { soilMoisture: true, weatherForecast: true }
      };
    }

    // 3. Rain / Weather Intent
    if (qLower.includes('rain') || qLower.includes('weather') || qLower.includes('forecast') || qLower.includes('temperature') || qLower.includes('wind')) {
      if (weatherRainProb > 50 || soilData.rainfall > 100) {
        return {
          what: "🌧️ Yes, rain activity is likely in your area.",
          why: `Current atmospheric humidity is ${soilData.humidity}% with a precipitation probability of ${weatherRainProb}%.`,
          action: "Keep field drainage ditches clear and pause all pesticide or fertilizer spraying.",
          when: "Next 24 to 48 hours.",
          avoid: "Do not apply foliage sprays before rain to prevent wash-off.",
          navTab: 'weather',
          navLabel: 'View Live Weather Radar',
          expertDetail: `Rain Prob: ${weatherRainProb}% | Humidity: ${soilData.humidity}% | Temp: ${weatherTemp}°C`,
          sourceSignals: { weather: true, precipitation: true }
        };
      }

      return {
        what: "☀️ Clear to partly cloudy weather expected today.",
        why: `Current temperature is ${weatherTemp}°C with calm winds (${soilData.wind_speed} km/h). Rain risk is low (${weatherRainProb}%).`,
        action: "Ideal weather for field weeding, pruning, or liquid fertilizer top dressing.",
        when: "Throughout today.",
        avoid: "Avoid chemical spraying if wind speeds exceed 20 km/h.",
        navTab: 'weather',
        navLabel: 'View Weather',
        expertDetail: `Temp: ${weatherTemp}°C | Wind: ${soilData.wind_speed} km/h | Humidity: ${soilData.humidity}%`,
        sourceSignals: { weather: true, windSpeed: true }
      };
    }

    // 4. Fertilizer Intent
    if (qLower.includes('fertilizer') || qLower.includes('urea') || qLower.includes('dap') || qLower.includes('npk') || qLower.includes('nutrient')) {
      const nDeficit = Math.max(0, 140 - soilData.nitrogen);
      const crop = recommendations[0]?.crop || 'Primary Crop';
      return {
        what: `🧪 Apply Nitrogen boost (Urea) for your ${crop}.`,
        why: `Soil Nitrogen is recorded at ${soilData.nitrogen} kg/ha (Deficit: ${nDeficit} kg/ha for target crop yield).`,
        action: `Top dress with ${nDeficit > 0 ? Math.ceil(nDeficit / 23) : 1} bag(s) of Urea per acre.`,
        when: "Apply during early morning after light soil moistening.",
        avoid: "Never broadcast dry fertilizer onto water-stressed plants.",
        navTab: 'fertilizer',
        navLabel: 'Calculate Fertilizer Dose',
        expertDetail: `N: ${soilData.nitrogen} kg/ha | P: ${soilData.phosphorus} kg/ha | K: ${soilData.potassium} kg/ha | pH: ${soilData.ph}`,
        sourceSignals: { npk: true, cropType: true, growthStage: true }
      };
    }

    // 5. Crop Disease / Health Intent
    if (qLower.includes('unhealthy') || qLower.includes('pest') || qLower.includes('disease') || qLower.includes('spot') || qLower.includes('yellow') || qLower.includes('leaf')) {
      if (soilData.humidity > 70) {
        return {
          what: "🐛 High fungal spore & pest risk detected in your field.",
          why: `High relative humidity (${soilData.humidity}%) combined with temperature (${weatherTemp}°C) favors fungal blight.`,
          action: "Inspect lower leaf surfaces and take a photo using the Plant Scan diagnostic tool.",
          when: "Today morning during light inspection.",
          avoid: "Do not touch healthy plants after touching infected leaves.",
          navTab: 'diagnostics',
          navLabel: 'Scan Plant Photo',
          expertDetail: `Relative Humidity: ${soilData.humidity}% | Pest Risk Index: High`,
          sourceSignals: { humidity: true, pestPressure: true }
        };
      }

      return {
        what: "🌿 Crop health is generally stable, but preventive check is advised.",
        why: "No acute disease outbreaks reported in local telemetry.",
        action: "Use AI Leaf Diagnostic to scan any discolored leaves for leaf spot or yellowing.",
        when: "During weekly field walkthrough.",
        avoid: "Avoid over-using non-selective chemical pesticides.",
        navTab: 'diagnostics',
        navLabel: 'Scan Plant',
        expertDetail: `Crop Density: ${soilData.crop_density} | Growth Stage: ${soilData.growth_stage}%`,
        sourceSignals: { cropHealth: true }
      };
    }

    // 6. What to Plant Intent
    if (qLower.includes('plant') || qLower.includes('crop') || qLower.includes('rotation') || qLower.includes('sow')) {
      const topCrop = recommendations[0]?.crop || 'Wheat / Rice';
      const matchPct = recommendations[0]?.matchPercentage || 92;
      return {
        what: `🌱 Best suited crop for your soil is ${topCrop} (${matchPct}% Match).`,
        why: `Your soil NPK profile (N: ${soilData.nitrogen}, P: ${soilData.phosphorus}, K: ${soilData.potassium}) and pH (${soilData.ph}) match ${topCrop} requirements.`,
        action: "Review full 22-parameter soil match analysis and seed treatment requirements.",
        when: "Upcoming Kharif / Rabi sowing window.",
        avoid: "Do not plant high-water crops if soil drainage is poor.",
        navTab: 'recommendation',
        navLabel: 'Predict Crop',
        expertDetail: `pH: ${soilData.ph} | EC: ${soilData.ec} dS/m | Top Crop: ${topCrop}`,
        sourceSignals: { soilAnalysis: true, cropSuitability: true }
      };
    }

    // 7. Default General Farm Overview Intent ("What should I do today?")
    const topRec = recommendations[0]?.crop || 'Wheat';
    const mainAction = soilData.soil_moisture < 35 
      ? 'Irrigate dry field plots' 
      : soilData.nitrogen < 120 
      ? 'Apply Urea top dressing' 
      : 'Perform routine crop walkthrough';

    return {
      what: `🌱 Your overall farm status is stable. Top action: ${mainAction}.`,
      why: `Soil moisture is at ${soilData.soil_moisture}%, temperature is ${weatherTemp}°C, and ${topRec} is progressing well.`,
      action: mainAction,
      when: "Today before evening.",
      avoid: "Avoid delaying routine soil nutrient top-dressing.",
      navTab: soilData.soil_moisture < 35 ? 'farm' : 'fertilizer',
      navLabel: 'View Action Details',
      expertDetail: `Moisture: ${soilData.soil_moisture}% | N: ${soilData.nitrogen}kg/ha | Temp: ${weatherTemp}°C`,
      sourceSignals: { fullFarmTelemetry: true }
    };
  };

  // Initialize or handle question submission
  const handleAskQuestion = (qText: string) => {
    if (!qText.trim()) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: qText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setVoiceStep('understanding');

    // Simulate understanding -> checking farm -> answer pipeline
    setTimeout(() => {
      setVoiceStep('checking');
      setTimeout(() => {
        const answerObj = generateStructuredAnswer(qText, messages);
        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          structured: answerObj,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, userMsg, aiMsg]);
        setInputQuery('');
        setVoiceStep('speaking');

        // Speech Synthesis
        speakAnswer(answerObj.what + " " + answerObj.action);
      }, 400);
    }, 400);
  };

  const speakAnswer = (text: string) => {
    if (!('speechSynthesis' in window)) {
      setVoiceStep('idle');
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onstart = () => {
      setIsSpeaking(true);
      setVoiceStep('speaking');
    };
    utterance.onend = () => {
      setIsSpeaking(false);
      setVoiceStep('idle');
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      setVoiceStep('idle');
    };
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setVoiceStep('idle');
  };

  // Handle Initial Load
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const startQ = initialQuestion || 'What should I do today?';
      handleAskQuestion(startQ);
    }
  }, [isOpen]);

  // Scroll to bottom on new messages
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, voiceStep]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-3xl border border-[#c8e6c9] shadow-2xl max-w-xl w-full overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-5 bg-gradient-to-br from-[#1b2e1b] via-[#2e7d32] to-[#142214] text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-400/20 rounded-2xl border border-emerald-400/30 text-emerald-300">
                <Bot className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-emerald-200 text-[10px] font-mono font-bold uppercase tracking-wider mb-0.5">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  <span>CroperX Farm Intelligence</span>
                </div>
                <h2 className="text-lg font-bold font-serif">Ask CroperX AI</h2>
              </div>
            </div>

            <button
              onClick={() => {
                stopSpeaking();
                onClose();
              }}
              className="p-2 hover:bg-white/20 rounded-full text-white/80 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Voice Processing Status Bar */}
          <AnimatePresence>
            {voiceStep !== 'idle' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-emerald-900 text-emerald-100 px-4 py-2 text-xs font-mono font-bold flex items-center justify-between border-b border-emerald-700/50 shrink-0"
              >
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-amber-300 animate-spin" />
                  <span>
                    {voiceStep === 'listening' && '🎙️ Listening to your voice...'}
                    {voiceStep === 'understanding' && '🧠 Understanding intent...'}
                    {voiceStep === 'checking' && '🌱 Checking your real farm telemetry...'}
                    {voiceStep === 'speaking' && '🔊 Speaking advice...'}
                  </span>
                </div>

                {isSpeaking && (
                  <button
                    onClick={stopSpeaking}
                    className="px-2 py-0.5 bg-rose-500 hover:bg-rose-600 text-white rounded text-[10px] uppercase font-bold"
                  >
                    Mute
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick Preset Chips */}
          <div className="p-3 bg-gray-50 border-b border-gray-100 flex items-center gap-2 overflow-x-auto scrollbar-hide shrink-0">
            {quickQuestions.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.q}
                  onClick={() => handleAskQuestion(item.q)}
                  className="px-3 py-1.5 bg-white hover:bg-emerald-50 text-[#1b2e1b] hover:text-[#2e7d32] border border-gray-200 hover:border-emerald-300 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
                >
                  <Icon className="w-3.5 h-3.5 text-[#2e7d32]" />
                  <span>{item.q}</span>
                </button>
              );
            })}
          </div>

          {/* Conversation History Body */}
          <div className="p-5 overflow-y-auto space-y-4 custom-scrollbar flex-1">
            {messages.map((msg) => (
              <div key={msg.id} className="space-y-2">
                {/* User Bubble */}
                {msg.sender === 'user' && (
                  <div className="flex justify-end">
                    <div className="bg-[#1b2e1b] text-white px-4 py-2.5 rounded-2xl rounded-tr-xs max-w-[85%] text-xs font-medium shadow-xs">
                      <div className="flex items-center gap-1.5 mb-1 text-[10px] text-emerald-300 font-mono">
                        <User className="w-3 h-3" />
                        <span>You ({msg.timestamp})</span>
                      </div>
                      <p>{msg.text}</p>
                    </div>
                  </div>
                )}

                {/* AI Structured Answer Card */}
                {msg.sender === 'ai' && msg.structured && (
                  <div className="flex justify-start">
                    <div className="bg-gradient-to-br from-emerald-50/90 via-white to-green-50/80 border border-emerald-200 rounded-2xl rounded-tl-xs p-4 max-w-[95%] w-full shadow-sm space-y-3">
                      <div className="flex items-center justify-between border-b border-emerald-100 pb-2">
                        <span className="text-[11px] font-mono font-bold uppercase text-[#2e7d32] flex items-center gap-1">
                          <Bot className="w-3.5 h-3.5" />
                          <span>CroperX AI Recommendation</span>
                        </span>
                        <span className="text-[10px] text-gray-400 font-mono">
                          {msg.timestamp}
                        </span>
                      </div>

                      {/* Structured Answer Blocks */}
                      <div className="space-y-2 text-xs">
                        {/* WHAT IS HAPPENING */}
                        <div>
                          <strong className="text-[#1b2e1b] uppercase font-mono text-[10px] block font-bold">
                            WHAT IS HAPPENING?
                          </strong>
                          <p className="text-gray-900 font-semibold font-serif text-sm">
                            {msg.structured.what}
                          </p>
                        </div>

                        {/* WHY */}
                        <div>
                          <strong className="text-amber-800 uppercase font-mono text-[10px] block font-bold">
                            WHY?
                          </strong>
                          <p className="text-gray-700 font-sans">
                            {msg.structured.why}
                          </p>
                        </div>

                        {/* WHAT SHOULD I DO */}
                        <div>
                          <strong className="text-emerald-800 uppercase font-mono text-[10px] block font-bold">
                            WHAT SHOULD I DO?
                          </strong>
                          <p className="text-emerald-900 font-semibold">
                            {msg.structured.action}
                          </p>
                        </div>

                        {/* WHEN */}
                        <div className="flex items-center gap-2 text-gray-600">
                          <strong className="text-gray-800 uppercase font-mono text-[10px]">WHEN:</strong>
                          <span>{msg.structured.when}</span>
                        </div>

                        {/* WHAT SHOULD I AVOID */}
                        {msg.structured.avoid && (
                          <div className="p-2 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] flex items-center gap-1.5">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                            <span><strong>Avoid:</strong> {msg.structured.avoid}</span>
                          </div>
                        )}

                        {/* Expert Telemetry Metrics if Expert Mode enabled */}
                        {isExpertMode && msg.structured.expertDetail && (
                          <div className="pt-2 border-t border-emerald-200 font-mono text-[11px] text-emerald-900 bg-emerald-100/60 p-2 rounded-lg">
                            📊 <strong>Expert Telemetry:</strong> {msg.structured.expertDetail}
                          </div>
                        )}
                      </div>

                      {/* Action Navigation Button */}
                      <div className="pt-2 border-t border-emerald-100 flex items-center justify-between gap-2">
                        <button
                          onClick={() => {
                            stopSpeaking();
                            onClose();
                            onNavigateTab(msg.structured!.navTab);
                          }}
                          className="px-4 py-2 bg-[#1b2e1b] hover:bg-[#2e7d32] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>{msg.structured.navLabel}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => speakAnswer(msg.structured!.what + " " + msg.structured!.action)}
                          className="p-2 bg-white text-[#2e7d32] border border-emerald-200 hover:bg-emerald-50 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>Listen</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={chatBottomRef} />
          </div>

          {/* Input Chat Box & Call Trigger Footer */}
          <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-3 shrink-0">
            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAskQuestion(inputQuery);
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder="Ask about watering, rain, fertilizer, pests..."
                className="flex-1 px-4 py-2.5 bg-white border border-gray-300 focus:border-[#4CAF50] rounded-2xl text-xs font-medium text-gray-900 focus:outline-none shadow-xs"
              />
              <button
                type="submit"
                disabled={!inputQuery.trim()}
                className="p-2.5 bg-[#2e7d32] hover:bg-[#1b2e1b] disabled:bg-gray-300 text-white rounded-2xl transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            {/* Duplex Voice Call Trigger */}
            <div className="p-3 bg-white rounded-2xl border border-gray-200 flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-gray-800 flex items-center gap-1.5">
                  <PhoneCall className="w-3.5 h-3.5 text-[#2e7d32]" />
                  <span>Hands-Free Voice Mode</span>
                </div>
                <div className="text-[10px] text-gray-500">
                  Talk directly with CroperX Voice AI Agent.
                </div>
              </div>

              <button
                onClick={() => {
                  stopSpeaking();
                  onClose();
                  onOpenCallModal();
                }}
                className="px-3 py-1.5 bg-[#2e7d32] hover:bg-[#1b2e1b] text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1 shrink-0 cursor-pointer"
              >
                <span>CroperX Call</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
