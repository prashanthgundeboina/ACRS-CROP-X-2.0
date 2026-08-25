import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Brain, 
  Zap, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Clock, 
  TrendingUp, 
  Droplets, 
  Layers,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Bot
} from 'lucide-react';
import { SoilData } from '../../types';
import { AiCropPredictionOutput } from '../../types/intelligenceTypes';
import { multiModelOrchestrator } from '../../services/intelligence/multiModelOrchestrator';

interface AdviserCropPredictionMissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  soilData: SoilData;
  farmerName?: string;
  farmLocation?: string;
  onApplyRecommendation?: (cropName: string) => void;
}

export const AdviserCropPredictionMissionModal: React.FC<AdviserCropPredictionMissionModalProps> = ({
  isOpen,
  onClose,
  soilData,
  farmerName = 'Kuldeep Singh',
  farmLocation = 'Ludhiana, Punjab',
  onApplyRecommendation
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentStage, setCurrentStage] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);
  const [predictionResult, setPredictionResult] = useState<AiCropPredictionOutput | null>(null);
  const [showSpecialistAgents, setShowSpecialistAgents] = useState(false);

  const handleStartMission = async () => {
    setIsRunning(true);
    setPredictionResult(null);
    setProgressPercent(10);
    setCurrentStage('Initializing CroperX Supervisor Agent...');

    try {
      const result = await multiModelOrchestrator.executeCropPredictionMission({
        farmerName,
        farmLocation,
        soilData,
        season: 'Kharif',
        onProgressUpdate: (stage, percent) => {
          setCurrentStage(stage);
          setProgressPercent(percent);
        }
      });
      setPredictionResult(result);
    } catch (e) {
      console.error('Mission failed:', e);
    } finally {
      setIsRunning(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-slate-900 border border-emerald-500/40 rounded-3xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-white font-sans"
      >
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 border-b border-emerald-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shadow-inner">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white tracking-tight">
                  CroperX Multi-Model AI Crop Prediction Mission
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  Gemini + Groq + DeepSeek
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Supervisor Agent orchestrating 50+ Specialist Agents over 500+ botanical crop catalog
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm transition-all"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Farm & Sensor Context Strip */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Farmer:</span>
              <span className="font-bold text-emerald-400">{farmerName} ({farmLocation})</span>
            </div>
            <div className="flex items-center gap-4 text-slate-300">
              <span>🌱 Soil Moisture: <b className="text-white">{soilData.soil_moisture ?? 54}%</b></span>
              <span>🧪 pH: <b className="text-white">{soilData.ph ?? 6.8}</b></span>
              <span>🌡️ Temp: <b className="text-white">{soilData.temperature ?? 28}°C</b></span>
              <span>🧪 NPK: <b className="text-white">{soilData.nitrogen ?? 120}/{soilData.phosphorus ?? 55}/{soilData.potassium ?? 55}</b></span>
            </div>
          </div>

          {/* Trigger Banner or Progress State */}
          {!predictionResult && !isRunning && (
            <div className="text-center py-10 bg-slate-950/50 border border-dashed border-slate-800 rounded-3xl p-8 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto text-3xl shadow-lg">
                🌾
              </div>
              <div className="max-w-md mx-auto">
                <h4 className="text-base font-bold text-white">Execute Multi-Agent AI Agronomic Prediction</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Invokes the Supervisor Agent to query soil chemistry, ET0 water dynamics, satellite weather, and mandis in parallel.
                </p>
              </div>
              <button
                onClick={handleStartMission}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-xl shadow-emerald-900/40 flex items-center gap-2 mx-auto transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              >
                <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                <span>Predict Best Crops</span>
              </button>
            </div>
          )}

          {/* Running Progress State */}
          {isRunning && (
            <div className="py-10 bg-slate-950/70 border border-emerald-500/30 rounded-3xl p-8 space-y-6 text-center">
              <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-emerald-500/20 border-t-emerald-400 animate-spin" />
                <Bot className="w-8 h-8 text-emerald-400 animate-pulse" />
              </div>
              <div className="space-y-2">
                <h4 className="text-base font-bold text-white">{currentStage}</h4>
                <p className="text-xs text-slate-400">
                  Executing parallel model calls (Groq Fast Pass + Gemini Agronomics + DeepSeek Verification)
                </p>
              </div>
              <div className="w-full max-w-md mx-auto bg-slate-800 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* Finished Prediction Results */}
          {predictionResult && (
            <div className="space-y-6">
              {/* Primary Top Recommendation Card */}
              <div className="bg-gradient-to-br from-emerald-950/60 via-slate-900 to-slate-950 border-2 border-emerald-500/50 rounded-3xl p-6 shadow-xl relative overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-emerald-500/30 pb-5">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500 text-slate-950">
                        Top Recommendation
                      </span>
                      <span className="text-xs text-emerald-400 font-semibold">
                        Suitability: {predictionResult.suitabilityScore}% • Confidence: {predictionResult.confidence}%
                      </span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-black text-white">
                      {predictionResult.topRecommendedCrop.common_name}
                    </h2>
                    <p className="text-xs text-slate-400 italic">
                      {predictionResult.topRecommendedCrop.scientific_name} • Category: {predictionResult.topRecommendedCrop.crop_category}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        onApplyRecommendation?.(predictionResult.topRecommendedCrop.common_name);
                        onClose();
                      }}
                      className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg transition-all"
                    >
                      Apply To Farmer Case
                    </button>
                    <button
                      onClick={handleStartMission}
                      className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-all"
                      title="Re-run Multi-Model Prediction"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Key Agronomic Metrics Matrix */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-5">
                  <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
                    <div className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Droplets className="w-3.5 h-3.5 text-blue-400" />
                      <span>Water Requirement</span>
                    </div>
                    <div className="text-xs font-bold text-white mt-1">
                      {predictionResult.waterRequirement}
                    </div>
                  </div>

                  <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
                    <div className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-amber-400" />
                      <span>Growth Duration</span>
                    </div>
                    <div className="text-xs font-bold text-white mt-1">
                      {predictionResult.expectedGrowthDuration}
                    </div>
                  </div>

                  <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
                    <div className="text-[10px] text-slate-400 flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Expected ROI</span>
                    </div>
                    <div className="text-xs font-bold text-white mt-1">
                      {predictionResult.topRecommendedCrop.expected_roi_range}
                    </div>
                  </div>

                  <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3">
                    <div className="text-[10px] text-slate-400 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                      <span>Disease Risk Level</span>
                    </div>
                    <div className="text-xs font-bold text-emerald-400 mt-1">
                      {predictionResult.diseaseRisk.level} Risk
                    </div>
                  </div>
                </div>

                {/* Why Recommended & What Could Go Wrong */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-emerald-950/40 border border-emerald-500/20 rounded-2xl p-4">
                    <h5 className="text-xs font-bold text-emerald-300 flex items-center gap-1.5 mb-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Why Recommended by Multi-Model AI</span>
                    </h5>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {predictionResult.whyRecommended.map((r, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-emerald-400">•</span>
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-rose-950/30 border border-rose-500/20 rounded-2xl p-4">
                    <h5 className="text-xs font-bold text-rose-300 flex items-center gap-1.5 mb-2">
                      <AlertCircle className="w-4 h-4 text-rose-400" />
                      <span>Agronomic Risk Factors (What could go wrong)</span>
                    </h5>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {predictionResult.whatCouldGoWrong.map((w, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-rose-400">•</span>
                          <span>{w}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Alternative Crops Strip */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Alternative Recommended Crops ({predictionResult.alternativeCrops.length})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {predictionResult.alternativeCrops.map((alt, idx) => (
                    <div key={idx} className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 hover:border-emerald-500/40 transition-all">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-white">{alt.crop.common_name}</span>
                        <span className="text-emerald-400 font-semibold">{alt.suitabilityScore}%</span>
                      </div>
                      <p className="text-[11px] text-slate-400">{alt.primaryAdvantage}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Consensus Transparency Card */}
              <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-bold text-white">
                      AI Consensus & Verification Transparency ({predictionResult.consensusSummary.agreementScore}% Agreement)
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    Latency: {predictionResult.totalLatencyMs}ms
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px]">
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-amber-400 font-bold block mb-0.5">⚡ Groq Fast Llama-3.3</span>
                    <span className="text-slate-300">{predictionResult.consensusSummary.groqFastResponse}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-blue-400 font-bold block mb-0.5">✨ Gemini-3.7-Flash</span>
                    <span className="text-slate-300">{predictionResult.consensusSummary.geminiAgronomicValidation}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <span className="text-purple-400 font-bold block mb-0.5">🔬 DeepSeek Reasoner</span>
                    <span className="text-slate-300">{predictionResult.consensusSummary.deepseekScientificReasoning}</span>
                  </div>
                </div>
              </div>

              {/* Specialist Agents Accordion */}
              <div>
                <button
                  onClick={() => setShowSpecialistAgents(!showSpecialistAgents)}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 flex items-center justify-between text-xs font-semibold text-slate-300 transition-all"
                >
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-400" />
                    <span>View Specialist Agents Executed ({predictionResult.agentsExecuted.length} Active Agents)</span>
                  </div>
                  {showSpecialistAgents ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {showSpecialistAgents && (
                  <div className="mt-3 space-y-2 max-h-56 overflow-y-auto pr-1">
                    {predictionResult.agentsExecuted.map((agent, idx) => (
                      <div key={idx} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-start justify-between gap-3 text-xs">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-emerald-400">{agent.agentName}</span>
                            <span className="text-[10px] text-slate-500 uppercase">({agent.category})</span>
                            <span className="text-[10px] text-blue-400">[{agent.modelUsed}]</span>
                          </div>
                          <p className="text-slate-300 text-[11px] mt-0.5">{agent.findings}</p>
                        </div>
                        <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                          {agent.latencyMs}ms
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
