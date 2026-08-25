import React, { useState, useEffect } from 'react';
import { 
  Camera, 
  Footprints, 
  Compass, 
  Flame, 
  Radio, 
  Sparkles, 
  History, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Droplets, 
  CloudSun, 
  Smartphone,
  Info,
  Maximize2,
  Eye
} from 'lucide-react';
import { FarmZone, SoilData } from '../../types';
import { CameraConnectionState, CameraDevice, ImageQualityReport, TemperatureTelemetry } from '../../types/cameraTypes';
import { CropVisionObservation, FusedSensorContext } from '../../types/visionTypes';
import { FieldWalkSession } from '../../types/fieldObservationTypes';

import { cameraDeviceService } from '../../services/cameraDeviceService';
import { cameraConnectionService } from '../../services/cameraConnectionService';
import { liveVisionService } from '../../services/liveVisionService';
import { thermalCameraService } from '../../services/thermalCameraService';
import { fieldObservationService } from '../../services/fieldObservationService';

import { LiveCameraViewport } from './LiveCameraViewport';
import { VisionAnalysisPanel } from './VisionAnalysisPanel';
import { TemperatureTruthCard } from './TemperatureTruthCard';
import { CameraDeviceCard } from './CameraDeviceCard';
import { ThermalCameraPanel } from './ThermalCameraPanel';
import { FieldWalkMode } from './FieldWalkMode';
import { CropComparisonModal } from './CropComparisonModal';
import { CameraHistory } from './CameraHistory';
import { CameraPermissionDialog } from './CameraPermissionDialog';
import { CameraSimulatorPanel, SimulatorScenario } from './CameraSimulatorPanel';
import { IntelligentFieldIdentificationDashboard } from './IntelligentFieldIdentificationDashboard';

type VisionSubView = 'identification' | 'live' | 'walk' | 'compare' | 'thermal' | 'devices' | 'simulator' | 'history';

interface LiveCameraDashboardProps {
  farmZones?: FarmZone[];
  soilData?: SoilData;
  weatherTemp?: number;
  weatherHumidity?: number;
  weatherRainProb?: number;
  weatherRainfallForecastMm?: number;
  onNavigateTab?: (tab: string) => void;
  onSendToSupervisor?: (obs: CropVisionObservation) => void;
}

export const LiveCameraDashboard: React.FC<LiveCameraDashboardProps> = ({
  farmZones = [],
  soilData,
  weatherTemp = 29.5,
  weatherHumidity = 58,
  weatherRainProb = 10,
  weatherRainfallForecastMm = 0,
  onNavigateTab,
  onSendToSupervisor,
}) => {
  const [subView, setSubView] = useState<VisionSubView>('live');

  // Camera stream state
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [connectionState, setConnectionState] = useState<CameraConnectionState>('DISCONNECTED');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPermissionDialogOpen, setIsPermissionDialogOpen] = useState(false);
  const [isPermissionDenied, setIsPermissionDenied] = useState(false);

  // Vision state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [latestObservation, setLatestObservation] = useState<CropVisionObservation | null>(null);
  const [allObservations, setAllObservations] = useState<CropVisionObservation[]>([]);
  const [qualityReport, setQualityReport] = useState<ImageQualityReport | null>(null);
  const [selectedZoneId, setSelectedZoneId] = useState<string>(farmZones[0]?.id || 'zone-1');

  // Connected Devices
  const [devices, setDevices] = useState<CameraDevice[]>([]);
  const [activeBridge, setActiveBridge] = useState(cameraConnectionService.getActiveBridgeSession());

  // Field Walk Session
  const [activeWalkSession, setActiveWalkSession] = useState<FieldWalkSession | null>(
    fieldObservationService.getActiveWalkSession()
  );

  // Compare modal
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [simulatorScenario, setSimulatorScenario] = useState<SimulatorScenario>('healthy_paddy');

  // Fallback Zones if none passed
  const zones: FarmZone[] = farmZones.length > 0 ? farmZones : [
    { id: 'zone-1', name: 'North Field', areaHa: 2.0, assignedCrop: 'Rice (Paddy)', soilType: 'Alluvial', nitrogen: 85, ph: 6.8, moisture: 36, status: 'Active Cultivation' },
    { id: 'zone-2', name: 'South Field', areaHa: 1.5, assignedCrop: 'Cotton', soilType: 'Black Cotton', nitrogen: 70, ph: 7.2, moisture: 23, status: 'Active Cultivation' },
    { id: 'zone-3', name: 'East Field', areaHa: 1.8, assignedCrop: 'Maize / Corn', soilType: 'Loamy', nitrogen: 60, ph: 6.5, moisture: 29, status: 'Active Cultivation' },
    { id: 'zone-4', name: 'West Field', areaHa: 1.2, assignedCrop: 'Wheat', soilType: 'Clay Loam', nitrogen: 50, ph: 6.4, moisture: 27, status: 'Active Cultivation' },
  ];

  const currentZone = zones.find((z) => z.id === selectedZoneId) || zones[0];

  // Subscribe to connection service & load observations
  useEffect(() => {
    const unsubState = cameraConnectionService.subscribeState((state, err) => {
      setConnectionState(state);
      setErrorMessage(err || null);
      if (state === 'ERROR' && err && /denied|permission/i.test(err)) {
        setIsPermissionDenied(true);
      }
    });

    const unsubDevices = cameraConnectionService.subscribeDevices((devs) => {
      setDevices(devs);
    });

    const unsubSession = cameraConnectionService.subscribeSession((sess) => {
      setActiveBridge(sess);
    });

    const unsubStream = cameraConnectionService.subscribeStream((activeStream) => {
      setStream(activeStream);
    });

    setAllObservations(fieldObservationService.getObservations());

    return () => {
      unsubState();
      unsubDevices();
      unsubSession();
      unsubStream();
      cameraConnectionService.disconnectCamera();
    };
  }, []);

  const handleStartCameraIntent = () => {
    setIsPermissionDialogOpen(true);
    setIsPermissionDenied(false);
  };

  const handleConfirmStartCamera = async () => {
    setIsPermissionDialogOpen(false);
    try {
      const active = await cameraConnectionService.connectCamera({ facingMode: 'environment' });
      setStream(active);
    } catch (err: any) {
      console.warn('Camera initiation failed:', err);
    }
  };

  const handleStopCamera = () => {
    cameraConnectionService.disconnectCamera();
    setStream(null);
  };

  const handleSwitchFacing = async () => {
    try {
      const switched = await cameraDeviceService.switchFacingMode();
      setStream(switched);
    } catch (err) {
      console.warn('Switch facing failed:', err);
    }
  };

  // Extract sensor context
  const getFusedContext = (): FusedSensorContext => {
    return {
      soilMoisturePercent: currentZone.moisture ?? soilData?.soil_moisture ?? 28,
      ambientTempC: weatherTemp ?? soilData?.temperature ?? 29.5,
      humidityPercent: weatherHumidity ?? soilData?.humidity ?? 58,
      rainForecastMm: weatherRainfallForecastMm,
      ndviIndex: 0.74,
      cropRiskLevel: currentZone.pestRisk || 'low',
    };
  };

  const handleAnalyzeFrame = async (frameDataUrl: string, imageData: ImageData) => {
    setIsAnalyzing(true);
    cameraConnectionService.setAnalyzing(true);

    try {
      // Evaluate image quality
      const quality = liveVisionService.evaluateFrameQuality(imageData);
      setQualityReport(quality);

      // Perform agronomic vision analysis
      const observation = await liveVisionService.analyzeCropFrame({
        frameThumbnailUrl: frameDataUrl,
        imageData,
        zoneId: currentZone.id,
        zoneName: currentZone.name,
        expectedCrop: currentZone.assignedCrop || 'Rice (Paddy)',
        sensorContext: getFusedContext(),
      });

      setLatestObservation(observation);
      fieldObservationService.addObservation(observation);
      setAllObservations(fieldObservationService.getObservations());
    } catch (e) {
      console.error('Analysis failed:', e);
    } finally {
      setIsAnalyzing(false);
      cameraConnectionService.setAnalyzing(false);
    }
  };

  const handleCaptureStill = (frameDataUrl: string, imageData: ImageData) => {
    const quality = liveVisionService.evaluateFrameQuality(imageData);
    setQualityReport(quality);
  };

  const handleTriggerSimulatedAnalysis = async (scenario: SimulatorScenario) => {
    setIsAnalyzing(true);
    try {
      let scenarioOverride: 'healthy' | 'water_stress' | 'pest_damage' | 'nutrient_deficiency' = 'healthy';
      let targetCrop = 'Rice (Paddy)';

      if (scenario === 'wilted_cotton') {
        scenarioOverride = 'water_stress';
        targetCrop = 'Cotton';
      } else if (scenario === 'pest_maize') {
        scenarioOverride = 'pest_damage';
        targetCrop = 'Maize / Corn';
      } else if (scenario === 'nitrogen_wheat') {
        scenarioOverride = 'nutrient_deficiency';
        targetCrop = 'Wheat';
      }

      const observation = await liveVisionService.analyzeCropFrame({
        frameThumbnailUrl: '',
        zoneId: currentZone.id,
        zoneName: currentZone.name,
        expectedCrop: targetCrop,
        sensorContext: getFusedContext(),
        isSimulated: true,
        scenarioOverride,
      });

      setLatestObservation(observation);
      fieldObservationService.addObservation(observation);
      setAllObservations(fieldObservationService.getObservations());
      setSubView('live');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveObservation = (obs: CropVisionObservation) => {
    fieldObservationService.addObservation(obs);
    setAllObservations(fieldObservationService.getObservations());
  };

  const handleDeleteObservation = (id: string) => {
    fieldObservationService.deleteObservation(id);
    setAllObservations(fieldObservationService.getObservations());
  };

  const handleClearAllObservations = () => {
    fieldObservationService.clearAllObservations();
    setAllObservations([]);
  };

  const temperatureTelemetry: TemperatureTelemetry = thermalCameraService.compileTemperatureTelemetry({
    ambientWeatherTempC: weatherTemp,
    iotSensorTempC: soilData?.temperature,
  });

  return (
    <div className="space-y-5 animate-fade-in pb-16">
      {/* Top Banner & Mode Tabs */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#c8e6c9] shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3.5 bg-gradient-to-br from-[#2e7d32] to-[#1b2e1b] text-white rounded-2xl shadow-md">
              <Camera className="w-7 h-7 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-[#2e7d32] uppercase tracking-wider">
                  Phase 11 Autonomous Vision
                </span>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-mono font-black uppercase">
                  Live
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-gray-900">
                CroperX Live Vision & Field Camera
              </h2>
              <p className="text-xs text-gray-500">
                Connect your mobile phone camera as an autonomous field observation scout.
              </p>
            </div>
          </div>

          {/* Quick Zone Selector Pill */}
          <div className="flex items-center gap-2 bg-[#f8fcf8] p-2 rounded-2xl border border-[#c8e6c9] self-start md:self-auto">
            <MapPin className="w-4 h-4 text-[#2e7d32] shrink-0" />
            <select
              value={selectedZoneId}
              onChange={(e) => setSelectedZoneId(e.target.value)}
              className="bg-transparent text-xs font-bold text-[#1b2e1b] focus:outline-none cursor-pointer pr-2"
            >
              {zones.map((z) => (
                <option key={z.id} value={z.id}>
                  {z.name} ({z.assignedCrop || 'Crop'})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide border-t border-[#c8e6c9]/60 pt-3">
          {[
            { id: 'identification', label: '🌾 Intelligent Identification', icon: Eye, badge: 'Phase 12.2' },
            { id: 'live', label: '📷 Live Camera', icon: Camera },
            { id: 'walk', label: '🚶 Field Walk Tour', icon: Footprints, badge: activeWalkSession ? 'Active' : undefined },
            { id: 'compare', label: '🔄 Before / After', icon: Compass },
            { id: 'thermal', label: '🌡️ Thermal IR', icon: Flame },
            { id: 'devices', label: '📱 Connected Devices', icon: Smartphone, badge: `${devices.filter(d => d.isConnected).length}` },
            { id: 'simulator', label: '🧪 Test Simulator', icon: Sparkles },
            { id: 'history', label: '📋 Observation Logs', icon: History, badge: `${allObservations.length}` },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = subView === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (tab.id === 'compare') {
                    setIsCompareModalOpen(true);
                  } else {
                    setSubView(tab.id as VisionSubView);
                  }
                }}
                className={`px-3.5 py-2 min-h-[44px] rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer relative ${
                  isActive
                    ? 'bg-[#1b2e1b] text-white shadow-md'
                    : 'bg-[#f8fcf8] text-gray-700 hover:bg-[#e8f5e9] border border-[#c8e6c9]'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-mono font-black ${
                    isActive ? 'bg-[#4CAF50] text-white' : 'bg-emerald-600 text-white'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* VIEW CONTENT BASED ON SUB-VIEW */}
      {subView === 'identification' && (
        <IntelligentFieldIdentificationDashboard
          farmZones={zones}
          soilData={soilData}
          weatherTemp={weatherTemp}
          weatherHumidity={weatherHumidity}
          weatherRainProb={weatherRainProb}
          weatherRainfallForecastMm={weatherRainfallForecastMm}
          onNavigateTab={onNavigateTab}
          onSendToSupervisor={onSendToSupervisor}
        />
      )}

      {subView === 'live' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Left / Top: Live Viewport & Temperature Truth */}
          <div className="lg:col-span-7 space-y-5">
            <LiveCameraViewport
              stream={stream}
              isStreaming={connectionState === 'STREAMING' || connectionState === 'ANALYZING'}
              isAnalyzing={isAnalyzing}
              selectedZone={currentZone}
              qualityReport={qualityReport}
              onStartCamera={handleStartCameraIntent}
              onStopCamera={handleStopCamera}
              onSwitchCamera={handleSwitchFacing}
              onCaptureFrame={handleCaptureStill}
              onAnalyzeFrame={handleAnalyzeFrame}
              onSelectZoneClick={() => {}}
            />

            {/* Temperature Truth Architecture Card */}
            <TemperatureTruthCard
              telemetry={temperatureTelemetry}
              onOpenThermalView={() => setSubView('thermal')}
            />
          </div>

          {/* Right / Bottom: Vision Analysis & Farmer Action */}
          <div className="lg:col-span-5 space-y-5">
            <VisionAnalysisPanel
              observation={latestObservation || allObservations[0] || null}
              isAnalyzing={isAnalyzing}
              onSaveObservation={handleSaveObservation}
              onSendToSupervisor={onSendToSupervisor}
              onCompareWithPrevious={() => setIsCompareModalOpen(true)}
            />
          </div>
        </div>
      )}

      {subView === 'walk' && (
        <FieldWalkMode
          farmZones={zones}
          activeSession={activeWalkSession}
          onStartWalk={(zoneId, zoneName, cropName) => {
            const sess = fieldObservationService.startFieldWalk(zoneId, zoneName, cropName);
            setActiveWalkSession(sess);
          }}
          onCompleteWalk={() => {
            setActiveWalkSession(null);
            setAllObservations(fieldObservationService.getObservations());
          }}
          onSelectObservation={(obs) => setLatestObservation(obs)}
          onCaptureFrameForWalk={() => {
            handleStartCameraIntent();
          }}
        />
      )}

      {subView === 'thermal' && (
        <div className="space-y-5">
          <ThermalCameraPanel ambientTempC={weatherTemp} />
          <TemperatureTruthCard telemetry={temperatureTelemetry} />
        </div>
      )}

      {subView === 'devices' && (
        <div className="space-y-5">
          <CameraDeviceCard
            devices={devices}
            activeBridge={activeBridge}
            onSimulatePhoneConnect={() => {
              cameraConnectionService.simulatePhonePairing();
              setActiveBridge(cameraConnectionService.getActiveBridgeSession());
            }}
            onConnectSimulator={() => {
              cameraConnectionService.connectSimulator();
              setSubView('live');
            }}
            onSelectDevice={(devId) => {
              if (devId === 'simulated-camera-device') {
                cameraConnectionService.connectSimulator();
                setSubView('live');
              } else if (devId === 'phone-cam-local') {
                handleStartCameraIntent();
                setSubView('live');
              } else if (devId === 'thermal-ir-flir') {
                setSubView('thermal');
              }
            }}
          />
          <TemperatureTruthCard telemetry={temperatureTelemetry} />
        </div>
      )}

      {subView === 'simulator' && (
        <div className="space-y-5">
          <CameraSimulatorPanel
            activeScenario={simulatorScenario}
            onSelectScenario={(scen) => setSimulatorScenario(scen)}
            onTriggerSimulatedAnalysis={handleTriggerSimulatedAnalysis}
          />
        </div>
      )}

      {subView === 'history' && (
        <CameraHistory
          observations={allObservations}
          farmZones={zones}
          onSelectObservation={(obs) => {
            setLatestObservation(obs);
            setSubView('live');
          }}
          onDeleteObservation={handleDeleteObservation}
          onClearAll={handleClearAllObservations}
        />
      )}

      {/* Permission Dialog */}
      <CameraPermissionDialog
        isOpen={isPermissionDialogOpen}
        isDenied={isPermissionDenied}
        errorMessage={errorMessage || undefined}
        onConfirm={handleConfirmStartCamera}
        onCancel={() => setIsPermissionDialogOpen(false)}
        onUseSimulator={() => {
          setIsPermissionDialogOpen(false);
          setSubView('simulator');
        }}
      />

      {/* Before / After Comparison Modal */}
      <CropComparisonModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        observations={allObservations}
        initialCurrentObs={latestObservation}
      />
    </div>
  );
};
