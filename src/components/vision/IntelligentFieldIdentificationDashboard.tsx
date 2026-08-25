import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Smartphone, 
  Radio, 
  Sliders, 
  Layers, 
  Droplets, 
  CloudSun, 
  RotateCw, 
  Maximize2, 
  Flame, 
  ChevronRight, 
  Play, 
  Eye, 
  HelpCircle,
  Square,
  Info,
  Send,
  User,
  Trees,
  Mountain
} from 'lucide-react';
import { FarmZone, SoilData, FarmerProfile } from '../../types';
import { CameraDevice, MobileBridgeSession, ImageQualityReport } from '../../types/cameraTypes';
import { FusedSensorContext, CropVisionObservation } from '../../types/visionTypes';
import { 
  SceneIdentificationResult, 
  SceneSimulatorScenario, 
  CameraAiWorkflowState, 
  SceneBoundingBox 
} from '../../types/sceneIdentificationTypes';

import { cameraConnectionService } from '../../services/cameraConnectionService';
import { cameraDeviceService } from '../../services/cameraDeviceService';
import { sceneUnderstandingEngine } from '../../services/intelligence/sceneUnderstandingEngine';
import { fieldVoiceGuidanceService } from '../../services/intelligence/fieldVoiceGuidanceService';
import { fieldObservationService } from '../../services/fieldObservationService';
import { getStoredUser, userToFarmerProfile } from '../../services/authService';

import { FieldEnvironmentCard } from './FieldEnvironmentCard';
import { CroperXUnderstandingCard } from './CroperXUnderstandingCard';
import { CameraPermissionDialog } from './CameraPermissionDialog';

interface IntelligentFieldIdentificationDashboardProps {
  farmZones?: FarmZone[];
  soilData?: SoilData;
  weatherTemp?: number;
  weatherHumidity?: number;
  weatherRainProb?: number;
  weatherRainfallForecastMm?: number;
  onNavigateTab?: (tab: string) => void;
  onSendToSupervisor?: (obs: any) => void;
}

export const IntelligentFieldIdentificationDashboard: React.FC<IntelligentFieldIdentificationDashboardProps> = ({
  farmZones = [],
  soilData,
  weatherTemp = 29.5,
  weatherHumidity = 58,
  weatherRainProb = 10,
  weatherRainfallForecastMm = 0,
  onNavigateTab,
  onSendToSupervisor,
}) => {
  // Video element & container refs
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Farmer profile identification (No facial recognition; read from auth / storage)
  const [farmerProfile, setFarmerProfile] = useState<FarmerProfile>(() => {
    const stored = getStoredUser();
    if (stored) return userToFarmerProfile(stored);
    return {
      farmerName: 'Ravi',
      farmLocation: 'Green Valley Field',
      farmAreaSize: 4.5,
      unitPreference: 'metric',
      preferredCropCycle: 'Rice → Wheat',
      primaryWaterSource: 'Borewell Drip',
      soilTypeZone: 'Alluvial Loam',
      targetPhGoal: 6.5,
    };
  });

  // Zones
  const zones: FarmZone[] = farmZones.length > 0 ? farmZones : [
    { id: 'zone-1', name: 'North Field A', areaHa: 2.5, assignedCrop: 'Rice (Paddy)', soilType: 'Alluvial Loam', nitrogen: 90, ph: 6.5, moisture: 34, status: 'Active Cultivation' },
    { id: 'zone-2', name: 'South Field B', areaHa: 2.0, assignedCrop: 'Maize / Corn', soilType: 'Clay Loam', nitrogen: 75, ph: 6.8, moisture: 24, status: 'Active Cultivation' },
  ];
  const [selectedZoneId, setSelectedZoneId] = useState<string>(zones[0]?.id || 'zone-1');
  const currentZone = zones.find((z) => z.id === selectedZoneId) || zones[0];

  // Camera & Stream State
  const [stream, setStream] = useState<MediaStream | null>(cameraConnectionService.getActiveStream());
  const [isStreaming, setIsStreaming] = useState<boolean>(!!cameraConnectionService.getActiveStream());
  const [devices, setDevices] = useState<CameraDevice[]>([]);
  const [activeBridge, setActiveBridge] = useState<MobileBridgeSession | null>(cameraConnectionService.getActiveBridgeSession());
  const [isPermissionDialogOpen, setIsPermissionDialogOpen] = useState(false);

  // Voice AI Controls
  const [isMuted, setIsMuted] = useState(fieldVoiceGuidanceService.getIsMuted());
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastVoiceText, setLastVoiceText] = useState('');

  // Simulator / Scenario
  const [isSimulatedMode, setIsSimulatedMode] = useState<boolean>(false);
  const [simScenario, setSimScenario] = useState<SceneSimulatorScenario>('human_crop_soil');

  // Scene Identification State Result
  const [sceneResult, setSceneResult] = useState<SceneIdentificationResult>(() => {
    return sceneUnderstandingEngine.analyzeSceneFrame({
      farmerName: farmerProfile.farmerName,
      sensorContext: {
        soilMoisturePercent: currentZone.moisture ?? soilData?.soil_moisture ?? 32,
        ambientTempC: weatherTemp ?? soilData?.temperature ?? 29.5,
        humidityPercent: weatherHumidity ?? soilData?.humidity ?? 58,
        rainForecastMm: weatherRainfallForecastMm,
        ndviIndex: 0.74,
        cropRiskLevel: currentZone.pestRisk || 'low',
      },
      isSimulated: false,
      expectedCrop: currentZone.assignedCrop,
    });
  });

  const [lastFlash, setLastFlash] = useState(false);

  // Subscribe to Camera Connection Service
  useEffect(() => {
    const unsubStream = cameraConnectionService.subscribeStream((activeStream) => {
      setStream(activeStream);
      setIsStreaming(!!activeStream);
      if (activeStream && videoRef.current) {
        videoRef.current.srcObject = activeStream;
        videoRef.current.play().catch(() => {});
      }
    });

    const unsubDevices = cameraConnectionService.subscribeDevices((devs) => {
      setDevices(devs);
    });

    const unsubSession = cameraConnectionService.subscribeSession((sess) => {
      setActiveBridge(sess);
    });

    const unsubVoice = fieldVoiceGuidanceService.subscribe((speaking, text) => {
      setIsSpeaking(speaking);
      setLastVoiceText(text);
    });

    return () => {
      unsubStream();
      unsubDevices();
      unsubSession();
      unsubVoice();
    };
  }, []);

  // Update video element when stream changes
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch((e) => console.warn('Play video failed:', e));
    }
  }, [stream]);

  // Periodic frame evaluation & AI scene progression
  useEffect(() => {
    if (!isStreaming && !isSimulatedMode) return;

    const interval = setInterval(() => {
      if (isSimulatedMode) {
        const simRes = sceneUnderstandingEngine.analyzeSceneFrame({
          farmerName: farmerProfile.farmerName,
          sensorContext: getFusedContext(),
          isSimulated: true,
          scenarioOverride: simScenario,
          expectedCrop: currentZone.assignedCrop,
        });
        setSceneResult(simRes);
        if (simRes.voiceMessage && !isMuted) {
          fieldVoiceGuidanceService.speak(simRes.voiceMessage);
        }
        return;
      }

      // Real Camera Frame evaluation
      if (videoRef.current && isStreaming) {
        const captured = cameraDeviceService.captureFrame(videoRef.current);
        if (captured) {
          const res = sceneUnderstandingEngine.analyzeSceneFrame({
            imageData: captured.imageData,
            farmerName: farmerProfile.farmerName,
            sensorContext: getFusedContext(),
            isSimulated: false,
            expectedCrop: currentZone.assignedCrop,
          });
          setSceneResult(res);

          // If voice guidance triggered
          if (res.voiceMessage && !isMuted) {
            fieldVoiceGuidanceService.speak(res.voiceMessage);
          }
        }
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isStreaming, isSimulatedMode, simScenario, farmerProfile.farmerName, isMuted, selectedZoneId]);

  // Initial greeting trigger when starting
  useEffect(() => {
    if (sceneResult.voiceMessage && !isMuted) {
      fieldVoiceGuidanceService.speak(sceneResult.voiceMessage);
    }
  }, []);

  const getFusedContext = (): FusedSensorContext => {
    return {
      soilMoisturePercent: currentZone.moisture ?? soilData?.soil_moisture ?? 32,
      ambientTempC: weatherTemp ?? soilData?.temperature ?? 29.5,
      humidityPercent: weatherHumidity ?? soilData?.humidity ?? 58,
      rainForecastMm: weatherRainfallForecastMm,
      ndviIndex: 0.74,
      cropRiskLevel: currentZone.pestRisk || 'low',
    };
  };

  const handleStartCamera = () => {
    setIsPermissionDialogOpen(true);
  };

  const handleConfirmStartCamera = async () => {
    setIsPermissionDialogOpen(false);
    setIsSimulatedMode(false);
    try {
      const active = await cameraConnectionService.connectCamera({ facingMode: 'environment' });
      setStream(active);
      setIsStreaming(true);
    } catch (e) {
      console.warn('Camera connection failed:', e);
    }
  };

  const handleStopCamera = () => {
    cameraConnectionService.disconnectCamera();
    setStream(null);
    setIsStreaming(false);
  };

  const handleSwitchFacing = async () => {
    try {
      const switched = await cameraDeviceService.switchFacingMode();
      setStream(switched);
    } catch (e) {
      console.warn('Switch facing failed:', e);
    }
  };

  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    fieldVoiceGuidanceService.setMuted(next);
  };

  const handleReplayVoice = () => {
    if (sceneResult.voiceMessage) {
      fieldVoiceGuidanceService.speak(sceneResult.voiceMessage, true);
    } else {
      fieldVoiceGuidanceService.replayLast();
    }
  };

  const handleStopVoice = () => {
    fieldVoiceGuidanceService.stop();
  };

  const handleManualScan = () => {
    if (videoRef.current) {
      const captured = cameraDeviceService.captureFrame(videoRef.current);
      if (captured) {
        setLastFlash(true);
        setTimeout(() => setLastFlash(false), 200);

        const res = sceneUnderstandingEngine.analyzeSceneFrame({
          imageData: captured.imageData,
          farmerName: farmerProfile.farmerName,
          sensorContext: getFusedContext(),
          isSimulated: isSimulatedMode,
          scenarioOverride: isSimulatedMode ? simScenario : undefined,
          expectedCrop: currentZone.assignedCrop,
        });
        setSceneResult(res);

        // Save observation to field history
        if (res.cropAnalysis) {
          const obs: CropVisionObservation = {
            id: `obs-${Date.now()}`,
            timestamp: new Date().toISOString(),
            dateFormatted: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
            zoneId: currentZone.id,
            zoneName: currentZone.name,
            cropName: currentZone.assignedCrop || 'Rice (Paddy)',
            deviceLabel: activeBridge?.deviceModel || 'Smartphone Camera',
            deviceKind: 'mobile',
            frameThumbnailUrl: captured.dataUrl,
            quality: res.quality,
            detection: {
              cropType: currentZone.assignedCrop || 'Rice (Paddy)',
              cropConfidence: res.cropAnalysis.confidence,
              growthStage: 'vegetative',
              canopyCoveragePercent: 82,
              plantDensity: 'optimal',
              leafSymptoms: [],
              detectedStresses: [],
              weedPresence: { detected: false, coveragePercent: 0, riskLevel: 'low' },
              pestPresence: { detected: false, confidence: 0 },
              rawAnalysisTimestamp: new Date().toISOString(),
            },
            advice: {
              whatISee: res.supervisorUnderstanding.whatIsHappening,
              whyItMayBeHappening: res.supervisorUnderstanding.why,
              whatYouShouldDo: res.supervisorUnderstanding.whatShouldIDo,
              when: res.supervisorUnderstanding.when,
              whatToAvoid: res.supervisorUnderstanding.whatShouldIAvoid,
              confidenceLevel: res.supervisorUnderstanding.confidence,
              confidenceScore: res.supervisorUnderstanding.confidenceScore,
            },
            fusedSensorContext: getFusedContext(),
            isSimulated: isSimulatedMode,
          };
          fieldObservationService.addObservation(obs);
        }
      }
    }
  };

  const getStatusPill = () => {
    switch (sceneResult.state) {
      case 'HUMAN_DETECTED':
        return (
          <span className="px-3 py-1 bg-blue-100 text-blue-900 border border-blue-300 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 animate-pulse">
            <User className="w-3.5 h-3.5 text-blue-700" />
            Farmer Identified
          </span>
        );
      case 'WAITING_FOR_CROP':
        return (
          <span className="px-3 py-1 bg-amber-100 text-amber-900 border border-amber-300 rounded-full text-xs font-mono font-bold flex items-center gap-1.5">
            <Trees className="w-3.5 h-3.5 text-amber-700" />
            Waiting for Crop
          </span>
        );
      case 'CROP_DETECTED':
      case 'SOIL_DETECTED':
      case 'ANALYZING':
        return (
          <span className="px-3 py-1 bg-purple-100 text-purple-900 border border-purple-300 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-purple-700" />
            Analyzing Crop & Soil
          </span>
        );
      case 'COMPLETE':
        return (
          <span className="px-3 py-1 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-full text-xs font-mono font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
            Analysis Complete
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-gray-100 text-gray-800 border border-gray-300 rounded-full text-xs font-mono font-bold flex items-center gap-1.5">
            <Camera className="w-3.5 h-3.5 text-gray-600" />
            Searching Scene
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Hero Banner */}
      <div className="bg-gradient-to-r from-[#122312] via-[#1b381b] to-[#122312] text-white rounded-3xl p-6 sm:p-7 border border-[#2e7d32]/40 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-[#4CAF50]/10 to-transparent pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 rounded-full text-xs font-mono font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#4CAF50]" />
                CroperX 2.0 Intelligent Vision
              </span>

              {getStatusPill()}

              {isSimulatedMode && (
                <span className="px-3 py-1 bg-amber-950 text-amber-300 border border-amber-500/40 rounded-full text-xs font-mono font-black uppercase">
                  SIMULATED
                </span>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl lg:text-3xl font-serif font-bold text-white flex items-center gap-2.5">
              🌾 Your Field Camera: I&apos;m looking at your field with you.
            </h2>
            <p className="text-xs sm:text-sm text-gray-300 max-w-2xl leading-relaxed">
              Real-time scene identification for <strong>Human</strong>, <strong>Crop</strong>, and <strong>Soil</strong> with fused IoT soil sensor telemetry and microclimate intelligence.
            </p>
          </div>

          {/* Voice AI Toolbar & Session Controls */}
          <div className="flex flex-wrap items-center gap-2 bg-black/40 p-2.5 rounded-2xl border border-emerald-900/60 shrink-0">
            <button
              onClick={handleToggleMute}
              className={`p-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                isMuted
                  ? 'bg-red-950/80 text-red-300 border border-red-800'
                  : 'bg-emerald-950/80 text-emerald-300 border border-emerald-700'
              }`}
              title={isMuted ? 'Unmute Voice AI' : 'Mute Voice AI'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span>{isMuted ? 'Muted' : 'Voice On'}</span>
            </button>

            <button
              onClick={handleReplayVoice}
              className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer border border-white/10"
              title="Replay last spoken advice"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Replay</span>
            </button>

            {isSpeaking && (
              <button
                onClick={handleStopVoice}
                className="p-2.5 bg-red-900/60 hover:bg-red-900 text-red-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                title="Stop current speech"
              >
                <span>Stop</span>
              </button>
            )}

            {/* Zone Selector */}
            <div className="border-l border-white/20 pl-2">
              <select
                value={selectedZoneId}
                onChange={(e) => setSelectedZoneId(e.target.value)}
                className="bg-black/60 text-white text-xs font-bold px-3 py-2 rounded-xl border border-emerald-800/80 focus:outline-none cursor-pointer"
              >
                {zones.map((z) => (
                  <option key={z.id} value={z.id} className="bg-gray-900 text-white">
                    {z.name} ({z.assignedCrop})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Personalized Farmer Greeting Banner */}
        <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-emerald-300 font-medium">
            <span className="text-base">👋</span>
            <span>
              Welcome, <strong>{farmerProfile.farmerName}</strong>! Farm Zone: <strong>{currentZone.name}</strong>
            </span>
          </div>

          <div className="text-[11px] font-mono text-gray-400">
            Privacy: Person Detection Only • No Facial Recognition • Zero Biometric Storage
          </div>
        </div>
      </div>

      {/* Main 2-Column Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Camera Viewport & Overlay Controls (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Camera Stage */}
          <div
            ref={containerRef}
            className="relative bg-black rounded-3xl overflow-hidden shadow-xl border border-gray-800 aspect-[4/3] sm:aspect-[16/10] flex items-center justify-center"
          >
            {/* Flash Effect */}
            {lastFlash && (
              <div className="absolute inset-0 bg-white opacity-80 z-40 pointer-events-none transition-opacity duration-200" />
            )}

            {/* Video stream tag */}
            {isStreaming && !isSimulatedMode ? (
              <video
                ref={videoRef}
                playsInline
                muted
                autoPlay
                className="w-full h-full object-cover"
              />
            ) : isSimulatedMode ? (
              <div className="relative w-full h-full bg-gradient-to-b from-[#1b2b1b] via-[#102010] to-[#0a120a] flex flex-col items-center justify-center p-6 text-center text-white">
                <div className="p-3 bg-[#2e7d32]/20 rounded-2xl border border-[#4CAF50]/30 text-[#4CAF50] mb-2 animate-pulse">
                  <Camera className="w-8 h-8" />
                </div>
                <h5 className="text-sm font-bold text-white mb-1">
                  Synthetic Field Inspection View
                </h5>
                <p className="text-xs text-gray-300 max-w-xs mb-3">
                  Simulating agronomic field observation: <strong className="text-emerald-300">{sceneResult.simulationScenario}</strong>
                </p>
                <span className="px-3 py-1 bg-black/60 rounded-full text-[10px] font-mono border border-emerald-700 text-emerald-400">
                  {sceneResult.cropAnalysis?.cropType || 'Rice (Paddy)'} • {sceneResult.cropAnalysis?.visualHealth || 'Healthy'}
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-6 text-center text-white space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-[#2e7d32]/20 border border-[#4CAF50]/40 flex items-center justify-center text-[#4CAF50]">
                  <Camera className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold">Camera Inactive</h4>
                  <p className="text-xs text-gray-400 max-w-xs">
                    Start your device camera or connect your smartphone via QR to begin real-time field identification.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                  <button
                    onClick={handleStartCamera}
                    className="px-4 py-2.5 bg-[#2e7d32] hover:bg-[#4CAF50] text-white text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer shadow-md"
                  >
                    <Camera className="w-4 h-4" />
                    Start Device Camera
                  </button>
                  <button
                    onClick={() => {
                      setIsSimulatedMode(true);
                    }}
                    className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl flex items-center gap-2 cursor-pointer border border-white/10"
                  >
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    Use Simulator Mode
                  </button>
                </div>
              </div>
            )}

            {/* Bounding Boxes Overlay */}
            {(isStreaming || isSimulatedMode) && sceneResult.boundingBoxes.map((b) => (
              <div
                key={b.id}
                style={{
                  left: `${b.box.x}%`,
                  top: `${b.box.y}%`,
                  width: `${b.box.width}%`,
                  height: `${b.box.height}%`,
                }}
                className={`absolute border-2 rounded-xl pointer-events-none transition-all duration-300 z-20 ${
                  b.classType === 'human'
                    ? 'border-blue-400 bg-blue-500/10'
                    : b.classType === 'crop'
                    ? 'border-[#4CAF50] bg-[#4CAF50]/10'
                    : 'border-amber-600 bg-amber-700/10'
                }`}
              >
                <span
                  className={`absolute -top-3 left-2 px-2 py-0.5 rounded text-[10px] font-mono font-bold text-white shadow-md ${
                    b.classType === 'human'
                      ? 'bg-blue-600'
                      : b.classType === 'crop'
                      ? 'bg-[#2e7d32]'
                      : 'bg-amber-800'
                  }`}
                >
                  {b.label} ({b.confidence}%)
                </span>
              </div>
            ))}

            {/* Floating Camera Guidance Banner */}
            {(isStreaming || isSimulatedMode) && (
              <div className="absolute bottom-3 left-3 right-3 z-30 pointer-events-none">
                <div className="p-3 bg-black/85 backdrop-blur-md rounded-2xl border border-emerald-500/40 text-white shadow-xl flex items-center gap-2.5">
                  <div className="p-1.5 bg-[#2e7d32] text-white rounded-lg shrink-0">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="text-xs font-medium leading-tight">
                    <strong className="text-[#81C784] block font-mono text-[10px] uppercase">
                      Field Guidance
                    </strong>
                    <span>{sceneResult.guidanceMessage}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Camera Viewport Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-white rounded-2xl border border-gray-200/80 shadow-sm text-xs">
            <div className="flex items-center gap-2">
              {isStreaming ? (
                <button
                  onClick={handleStopCamera}
                  className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 font-bold rounded-xl transition-all cursor-pointer"
                >
                  Stop Camera
                </button>
              ) : (
                <button
                  onClick={handleStartCamera}
                  className="px-3 py-1.5 bg-[#2e7d32] hover:bg-[#4CAF50] text-white font-bold rounded-xl transition-all cursor-pointer"
                >
                  Start Camera
                </button>
              )}

              {isStreaming && (
                <button
                  onClick={handleSwitchFacing}
                  className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl transition-all cursor-pointer"
                  title="Flip camera"
                >
                  <RotateCw className="w-4 h-4" />
                </button>
              )}

              <button
                onClick={handleManualScan}
                className="px-3 py-1.5 bg-[#1b381b] hover:bg-[#2e7d32] text-white font-bold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>Snap & Log</span>
              </button>
            </div>

            {/* Quality badge */}
            <div className="flex items-center gap-2 text-[11px] font-mono text-gray-500">
              <span>Sharpness: {sceneResult.quality.blurScore}%</span>
              <span>•</span>
              <span>Lighting: {sceneResult.quality.brightnessScore}%</span>
            </div>
          </div>

          {/* Simulator Scenario Switcher */}
          <div className="p-4 bg-[#f8fcf8] rounded-3xl border border-[#c8e6c9] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-[#2e7d32]" />
                Field Simulator Scenarios
              </span>
              <span className="text-[10px] font-mono text-[#2e7d32] font-bold">
                12 Presets
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {[
                { id: 'human_only', label: '👨‍🌾 Human Only' },
                { id: 'human_and_crop', label: '👨‍🌾+🌱 Human & Crop' },
                { id: 'crop_only', label: '🌱 Crop Only' },
                { id: 'soil_only', label: '🟤 Soil Only' },
                { id: 'human_crop_soil', label: '🌾 Human+Crop+Soil' },
                { id: 'healthy_crop', label: '✨ Healthy Crop' },
                { id: 'stressed_crop', label: '💧 Stressed Crop' },
                { id: 'disease_symptoms', label: '🔬 Disease Symptoms' },
                { id: 'dry_soil', label: '🏜️ Dry / Cracked Soil' },
                { id: 'wet_soil', label: '🌊 Wet / Waterlogged' },
                { id: 'poor_lighting', label: '🌑 Poor Lighting' },
                { id: 'blurry_camera', label: '💨 Blurry Motion' },
              ].map((sc) => (
                <button
                  key={sc.id}
                  onClick={() => {
                    setIsSimulatedMode(true);
                    setSimScenario(sc.id as SceneSimulatorScenario);
                  }}
                  className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-left transition-all cursor-pointer truncate ${
                    isSimulatedMode && simScenario === sc.id
                      ? 'bg-[#2e7d32] text-white shadow-sm'
                      : 'bg-white hover:bg-emerald-50 text-gray-700 border border-gray-200'
                  }`}
                >
                  {sc.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Progressive Intelligence Sections (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Section 1: What I Can See */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#c8e6c9] shadow-sm space-y-3.5">
            <div className="flex items-center justify-between border-b border-[#c8e6c9]/60 pb-2.5">
              <h4 className="text-sm sm:text-base font-serif font-bold text-gray-900 flex items-center gap-2">
                👀 Section 1: What I Can See in Current Frame
              </h4>
              <span className="text-[10px] font-mono text-gray-400">
                Primary Scene Classification
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Human Card */}
              <div
                className={`p-3.5 rounded-2xl border transition-all ${
                  sceneResult.detectedClasses.human
                    ? 'bg-blue-50/70 border-blue-300 ring-1 ring-blue-300/40'
                    : 'bg-gray-50 border-gray-200 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
                    <User className="w-4 h-4" />
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                    sceneResult.detectedClasses.human ? 'bg-blue-200 text-blue-900' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {sceneResult.detectedClasses.human ? 'Detected' : 'Not in View'}
                  </span>
                </div>
                <div className="text-xs font-bold text-gray-900">Farmer / Human</div>
                <div className="text-[11px] text-gray-500 mt-0.5">
                  {sceneResult.detectedClasses.human
                    ? `Identified as ${farmerProfile.farmerName}`
                    : 'Ready for greeting'}
                </div>
              </div>

              {/* Crop Card */}
              <div
                className={`p-3.5 rounded-2xl border transition-all ${
                  sceneResult.detectedClasses.crop
                    ? 'bg-emerald-50/70 border-[#4CAF50] ring-1 ring-[#4CAF50]/40'
                    : 'bg-gray-50 border-gray-200 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="p-2 bg-emerald-100 text-[#2e7d32] rounded-xl">
                    <Trees className="w-4 h-4" />
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                    sceneResult.detectedClasses.crop ? 'bg-emerald-200 text-emerald-900' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {sceneResult.detectedClasses.crop ? 'Detected' : 'Not in View'}
                  </span>
                </div>
                <div className="text-xs font-bold text-gray-900">Crop / Plants</div>
                <div className="text-[11px] text-gray-500 mt-0.5">
                  {sceneResult.detectedClasses.crop
                    ? (sceneResult.cropAnalysis?.cropType || 'Rice (Paddy)')
                    : 'Point at canopy'}
                </div>
              </div>

              {/* Soil Card */}
              <div
                className={`p-3.5 rounded-2xl border transition-all ${
                  sceneResult.detectedClasses.soil
                    ? 'bg-amber-50/70 border-amber-400 ring-1 ring-amber-400/40'
                    : 'bg-gray-50 border-gray-200 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                    <Mountain className="w-4 h-4" />
                  </div>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                    sceneResult.detectedClasses.soil ? 'bg-amber-200 text-amber-900' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {sceneResult.detectedClasses.soil ? 'Detected' : 'Not in View'}
                  </span>
                </div>
                <div className="text-xs font-bold text-gray-900">Soil Bed</div>
                <div className="text-[11px] text-gray-500 mt-0.5">
                  {sceneResult.detectedClasses.soil
                    ? (sceneResult.soilAnalysis?.visualState || 'Visible')
                    : 'Point at root-bed'}
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Crop Condition */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#c8e6c9] shadow-sm space-y-3.5">
            <div className="flex items-center justify-between border-b border-[#c8e6c9]/60 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-emerald-100 text-[#2e7d32] rounded-xl">
                  <Sparkles className="w-4 h-4" />
                </div>
                <h4 className="text-sm sm:text-base font-serif font-bold text-gray-900">
                  🌱 Section 2: Crop Condition Analysis
                </h4>
              </div>

              {sceneResult.cropAnalysis && (
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                  Confidence: {sceneResult.cropAnalysis.confidence}%
                </span>
              )}
            </div>

            {sceneResult.cropAnalysis ? (
              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-2.5 bg-[#fbfdfb] rounded-xl border border-gray-200">
                    <span className="text-gray-500 block text-[10px]">Crop Type</span>
                    <strong className="text-gray-900">{sceneResult.cropAnalysis.cropType}</strong>
                  </div>
                  <div className="p-2.5 bg-[#fbfdfb] rounded-xl border border-gray-200">
                    <span className="text-gray-500 block text-[10px]">Growth Stage</span>
                    <strong className="text-gray-900">{sceneResult.cropAnalysis.growthStage}</strong>
                  </div>
                  <div className="p-2.5 bg-[#fbfdfb] rounded-xl border border-gray-200">
                    <span className="text-gray-500 block text-[10px]">Visual Health</span>
                    <strong className={
                      sceneResult.cropAnalysis.visualHealth === 'Healthy-looking'
                        ? 'text-emerald-700 font-bold'
                        : 'text-amber-700 font-bold'
                    }>
                      {sceneResult.cropAnalysis.visualHealth}
                    </strong>
                  </div>
                  <div className="p-2.5 bg-[#fbfdfb] rounded-xl border border-gray-200">
                    <span className="text-gray-500 block text-[10px]">Canopy Density</span>
                    <strong className="text-gray-900">{sceneResult.cropAnalysis.canopyDensity}</strong>
                  </div>
                </div>

                {/* Foliage & Symptoms Breakdown */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 space-y-1">
                    <span className="text-[11px] font-bold text-gray-800 block">
                      Foliage & Possible Stress Signs
                    </span>
                    <ul className="space-y-1 text-[11px] text-gray-600">
                      {sceneResult.cropAnalysis.possibleStress.map((st, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-amber-500 font-bold">•</span>
                          <span>{st}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 space-y-1">
                    <span className="text-[11px] font-bold text-gray-800 block">
                      Possible Disease / Pest Observations
                    </span>
                    <ul className="space-y-1 text-[11px] text-gray-600">
                      {sceneResult.cropAnalysis.possibleDiseaseSymptoms.map((ds, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-blue-500 font-bold">•</span>
                          <span>{ds}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200/80 text-gray-800 text-[11px]">
                  <strong>Agronomist Summary: </strong>
                  <span>{sceneResult.cropAnalysis.summaryNote}</span>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-xs">
                Point camera toward crop canopy to activate foliage diagnosis.
              </div>
            )}
          </div>

          {/* Section 3: Soil Condition */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#c8e6c9] shadow-sm space-y-3.5">
            <div className="flex items-center justify-between border-b border-[#c8e6c9]/60 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-amber-100 text-amber-800 rounded-xl">
                  <Droplets className="w-4 h-4" />
                </div>
                <h4 className="text-sm sm:text-base font-serif font-bold text-gray-900">
                  🟤 Section 3: Soil Condition & IoT Moisture Fusion
                </h4>
              </div>

              {sceneResult.soilAnalysis && (
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 bg-amber-100 text-amber-900 rounded-full">
                  Visual Confidence: {sceneResult.soilAnalysis.confidence}%
                </span>
              )}
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="p-3 bg-[#fbfdfb] rounded-xl border border-gray-200">
                  <span className="text-gray-500 block text-[10px]">Visual Observation</span>
                  <strong className="text-gray-900 text-sm">
                    {sceneResult.soilAnalysis?.visualState || 'Standby for Soil View'}
                  </strong>
                </div>

                <div className="p-3 bg-[#fbfdfb] rounded-xl border border-gray-200">
                  <span className="text-gray-500 block text-[10px]">Live IoT Soil Moisture</span>
                  {currentZone.moisture !== undefined ? (
                    <strong className="text-blue-700 text-sm font-mono">
                      {currentZone.moisture}% Volume (Live)
                    </strong>
                  ) : (
                    <span className="text-gray-400 italic text-[11px]">
                      No live soil sensor reading available
                    </span>
                  )}
                </div>

                <div className="p-3 bg-[#fbfdfb] rounded-xl border border-gray-200">
                  <span className="text-gray-500 block text-[10px]">Waterlogging / Cracking</span>
                  <strong className="text-gray-900 text-xs">
                    {sceneResult.soilAnalysis?.waterloggingIndication
                      ? '⚠️ Saturated / Pooling'
                      : sceneResult.soilAnalysis?.crackingIndication
                      ? '⚠️ Surface Fissures'
                      : 'None (Stable Tilth)'}
                  </strong>
                </div>
              </div>

              {sceneResult.soilAnalysis && (
                <div className="p-3 bg-amber-50/70 rounded-2xl border border-amber-200 text-gray-800 text-[11px]">
                  <strong>Soil Inspection Note: </strong>
                  <span>{sceneResult.soilAnalysis.visualSummary}</span>
                </div>
              )}
            </div>
          </div>

          {/* Section 4: Field Environment */}
          <FieldEnvironmentCard
            score={sceneResult.environmentScore}
            sensorContext={sceneResult.sensorContext}
            visualSoilState={sceneResult.soilAnalysis?.visualState}
            visualCropHealth={sceneResult.cropAnalysis?.visualHealth}
            thermalAvailable={true}
          />

          {/* Section 5: CroperX Understanding */}
          <CroperXUnderstandingCard
            understanding={sceneResult.supervisorUnderstanding}
            onSendToSupervisor={() => {
              if (onSendToSupervisor) {
                onSendToSupervisor(sceneResult);
              }
              if (onNavigateTab) {
                onNavigateTab('autonomous');
              }
            }}
          />
        </div>
      </div>

      {/* Camera Permission Dialog */}
      <CameraPermissionDialog
        isOpen={isPermissionDialogOpen}
        onConfirm={handleConfirmStartCamera}
        onCancel={() => setIsPermissionDialogOpen(false)}
        onUseSimulator={() => {
          setIsPermissionDialogOpen(false);
          setIsSimulatedMode(true);
        }}
        isDenied={false}
      />
    </div>
  );
};
