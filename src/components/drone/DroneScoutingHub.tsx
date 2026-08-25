import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Navigation,
  Play,
  Pause,
  RotateCcw,
  Layers,
  AlertTriangle,
  FileText,
  Eye,
  Crosshair,
  BatteryCharging,
  Wifi,
  Compass,
  Wind,
  Camera,
  Activity,
  CheckCircle2,
  Sparkles,
  Printer,
  ChevronRight,
  ShieldCheck,
  Zap,
  MapPin
} from 'lucide-react';
import { DroneAnomalyPin, DroneFlightStatus, DroneTelemetry, DroneWaypoint, SpectralBandMode } from '../../types/droneTypes';
import { SoilData, FarmZone } from '../../types';
import { INITIAL_ANOMALIES, generateWaypointsForZones, generateScoutingReport } from '../../services/droneScoutingService';

interface DroneScoutingHubProps {
  soilData: SoilData;
  cropName: string;
  farmZones: FarmZone[];
  isExpertMode?: boolean;
  onOpenCallModal?: () => void;
}

export const DroneScoutingHub: React.FC<DroneScoutingHubProps> = ({
  soilData,
  cropName,
  farmZones,
  isExpertMode = true,
  onOpenCallModal
}) => {
  const [flightStatus, setFlightStatus] = useState<DroneFlightStatus>('idle');
  const [bandMode, setBandMode] = useState<SpectralBandMode>('ndvi');
  const [selectedAnomaly, setSelectedAnomaly] = useState<DroneAnomalyPin | null>(null);
  const [currentWaypointIdx, setCurrentWaypointIdx] = useState(0);
  const [dronePos, setDronePos] = useState<{ x: number; y: number }>({ x: 10, y: 15 });
  const [showReportModal, setShowReportModal] = useState(false);
  const [scoutingReport, setScoutingReport] = useState(() => generateScoutingReport(cropName, soilData, INITIAL_ANOMALIES));
  const [isGeneratingAiReport, setIsGeneratingAiReport] = useState(false);

  const waypoints = useRef<DroneWaypoint[]>(generateWaypointsForZones(farmZones)).current;

  const [telemetry, setTelemetry] = useState<DroneTelemetry>({
    altitudeM: 45,
    speedMps: 0,
    batteryPct: 98,
    satelliteCount: 22,
    rtkStatus: 'FIXED',
    windSpeedKmh: soilData.wind_speed || 8.4,
    gimbalPitchDeg: -90,
    headingDeg: 34,
    distanceCoveredM: 0,
    flightTimeSec: 0,
    photosCaptured: 0
  });

  // Flight simulation interval loop
  useEffect(() => {
    let interval: any;
    if (flightStatus === 'surveying') {
      interval = setInterval(() => {
        setCurrentWaypointIdx(prevIdx => {
          const nextIdx = (prevIdx + 1) % waypoints.length;
          const targetWp = waypoints[nextIdx];
          setDronePos({ x: targetWp.x, y: targetWp.y });
          
          setTelemetry(prev => ({
            ...prev,
            speedMps: 6.2,
            batteryPct: Math.max(12, prev.batteryPct - 0.2),
            flightTimeSec: prev.flightTimeSec + 2,
            distanceCoveredM: prev.distanceCoveredM + 12,
            photosCaptured: prev.photosCaptured + 1,
            headingDeg: (prev.headingDeg + 15) % 360
          }));

          if (nextIdx === waypoints.length - 1) {
            setFlightStatus('completed');
          }
          return nextIdx;
        });
      }, 1400);
    } else if (flightStatus === 'idle') {
      setTelemetry(prev => ({ ...prev, speedMps: 0 }));
    }

    return () => clearInterval(interval);
  }, [flightStatus, waypoints]);

  const handleStartFlight = () => {
    setFlightStatus('surveying');
  };

  const handlePauseFlight = () => {
    setFlightStatus(flightStatus === 'surveying' ? 'paused' : 'surveying');
  };

  const handleResetFlight = () => {
    setFlightStatus('idle');
    setCurrentWaypointIdx(0);
    setDronePos({ x: 10, y: 15 });
    setTelemetry(prev => ({
      ...prev,
      batteryPct: 98,
      speedMps: 0,
      flightTimeSec: 0,
      distanceCoveredM: 0,
      photosCaptured: 0
    }));
  };

  const handleGenerateAiReport = () => {
    setIsGeneratingAiReport(true);
    setTimeout(() => {
      setScoutingReport(generateScoutingReport(cropName, soilData, INITIAL_ANOMALIES));
      setIsGeneratingAiReport(false);
      setShowReportModal(true);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#1b2e1b] via-[#163316] to-[#0f240f] rounded-3xl p-6 text-white shadow-xl border border-emerald-500/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-400 border border-emerald-500/30">
              <Navigation className="w-5 h-5 animate-pulse" />
            </div>
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-400">
              Autonomous UAV Telemetry & Multispectral Scouting
            </span>
          </div>
          <h2 className="font-serif text-2xl md:text-3xl font-extrabold tracking-tight">
            Precision Drone Scouting & Anomaly Mapping
          </h2>
          <p className="text-xs text-gray-300 max-w-2xl">
            Execute sub-centimeter GSD aerial sweeps, generate real-time NDVI/NDRE canopy health indexes, and automatically dispatch surgical prescription treatments.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {flightStatus === 'surveying' ? (
            <button
              onClick={handlePauseFlight}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-2xl flex items-center gap-2 shadow-lg transition-all cursor-pointer"
            >
              <Pause className="w-4 h-4" />
              <span>Hold Position</span>
            </button>
          ) : (
            <button
              onClick={handleStartFlight}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-2xl flex items-center gap-2 shadow-lg transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{flightStatus === 'paused' ? 'Resume Mission' : 'Launch UAV Sweep'}</span>
            </button>
          )}

          <button
            onClick={handleResetFlight}
            className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-all cursor-pointer"
            title="Reset Flight Coordinates"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <button
            onClick={handleGenerateAiReport}
            className="px-4 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-700 hover:from-teal-500 hover:to-emerald-600 text-white text-xs font-bold rounded-2xl flex items-center gap-2 shadow-lg transition-all cursor-pointer border border-emerald-400/30"
          >
            <Sparkles className="w-4 h-4 text-emerald-300" />
            <span>AI Mission Debrief</span>
          </button>
        </div>
      </div>

      {/* Live Telemetry HUD Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-[#c8e6c9] shadow-xs flex items-center gap-3">
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-gray-500 font-mono uppercase block">Altitude</span>
            <span className="text-base font-bold font-mono text-[#1b2e1b]">{telemetry.altitudeM}m <span className="text-[10px] text-gray-400">AGL</span></span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-[#c8e6c9] shadow-xs flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-gray-500 font-mono uppercase block">Ground Speed</span>
            <span className="text-base font-bold font-mono text-[#1b2e1b]">{telemetry.speedMps.toFixed(1)} <span className="text-[10px] text-gray-400">m/s</span></span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-[#c8e6c9] shadow-xs flex items-center gap-3">
          <div className={`p-2 rounded-xl ${telemetry.batteryPct > 30 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
            <BatteryCharging className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-gray-500 font-mono uppercase block">UAV Battery</span>
            <span className={`text-base font-bold font-mono ${telemetry.batteryPct > 30 ? 'text-[#1b2e1b]' : 'text-red-600'}`}>
              {Math.round(telemetry.batteryPct)}%
            </span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-[#c8e6c9] shadow-xs flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
            <Wifi className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-gray-500 font-mono uppercase block">RTK Satellites</span>
            <span className="text-base font-bold font-mono text-[#1b2e1b]">
              {telemetry.satelliteCount} <span className="text-[9px] font-bold text-emerald-600 px-1 py-0.2 bg-emerald-100 rounded-sm">FIX</span>
            </span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-[#c8e6c9] shadow-xs flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
            <Camera className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-gray-500 font-mono uppercase block">Multispectral</span>
            <span className="text-base font-bold font-mono text-[#1b2e1b]">{telemetry.photosCaptured} <span className="text-[10px] text-gray-400">bands</span></span>
          </div>
        </div>

        <div className="bg-white p-3.5 rounded-2xl border border-[#c8e6c9] shadow-xs flex items-center gap-3">
          <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
            <Wind className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] text-gray-500 font-mono uppercase block">Wind Resistance</span>
            <span className="text-base font-bold font-mono text-[#1b2e1b]">{telemetry.windSpeedKmh} <span className="text-[10px] text-gray-400">km/h</span></span>
          </div>
        </div>
      </div>

      {/* Main Interactive Scouting Canvas & Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Aerial Viewport (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-5 border border-[#c8e6c9] shadow-sm space-y-4 flex flex-col">
          {/* Top Layer Mode Selector */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#2e7d32]" />
              <span className="text-xs font-bold text-[#1b2e1b] uppercase font-mono">Spectral Band View:</span>
            </div>

            <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-2xl">
              {[
                { id: 'rgb' as SpectralBandMode, label: 'True RGB' },
                { id: 'ndvi' as SpectralBandMode, label: 'NDVI Canopy' },
                { id: 'ndre' as SpectralBandMode, label: 'NDRE RedEdge' },
                { id: 'thermal' as SpectralBandMode, label: 'Thermal IR' },
                { id: 'anomalies' as SpectralBandMode, label: 'AI Anomaly Map' },
              ].map(mode => (
                <button
                  key={mode.id}
                  onClick={() => setBandMode(mode.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    bandMode === mode.id
                      ? 'bg-white text-[#2e7d32] shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>

          {/* Simulated 2D Flight Canvas */}
          <div className="relative w-full aspect-16/10 rounded-2xl overflow-hidden border border-gray-200 bg-slate-950 flex items-center justify-center select-none shadow-inner">
            {/* Background Texture Based on Band Mode */}
            {bandMode === 'rgb' && (
              <div 
                className="absolute inset-0 bg-cover bg-center opacity-90 transition-opacity"
                style={{
                  backgroundImage: `radial-gradient(circle at 50% 50%, #2d5a27 0%, #1c3b18 50%, #0d200a 100%)`
                }}
              >
                {/* Field Grid lines */}
                <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:40px_40px]" />
              </div>
            )}

            {bandMode === 'ndvi' && (
              <div 
                className="absolute inset-0 transition-opacity"
                style={{
                  background: `linear-gradient(135deg, #10b981 0%, #059669 35%, #eab308 65%, #ef4444 95%)`,
                  opacity: 0.85
                }}
              >
                <div className="absolute inset-0 opacity-30 mix-blend-overlay bg-[radial-gradient(circle_at_30%_40%,#10b981_0%,transparent_60%),radial-gradient(circle_at_70%_70%,#ef4444_0%,transparent_50%)]" />
              </div>
            )}

            {bandMode === 'ndre' && (
              <div 
                className="absolute inset-0 transition-opacity"
                style={{
                  background: `linear-gradient(120deg, #065f46 0%, #047857 40%, #10b981 70%, #d97706 100%)`,
                  opacity: 0.9
                }}
              />
            )}

            {bandMode === 'thermal' && (
              <div 
                className="absolute inset-0 transition-opacity"
                style={{
                  background: `linear-gradient(135deg, #312e81 0%, #6366f1 30%, #ec4899 65%, #f97316 85%, #eab308 100%)`,
                  opacity: 0.85
                }}
              />
            )}

            {bandMode === 'anomalies' && (
              <div className="absolute inset-0 bg-slate-900 opacity-95">
                <div className="absolute inset-0 opacity-25 bg-[linear-gradient(to_right,#4CAF50_1px,transparent_1px),linear-gradient(to_bottom,#4CAF50_1px,transparent_1px)] bg-[size:30px_30px]" />
              </div>
            )}

            {/* Flight Path SVG Line */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <polyline
                points={waypoints.map(wp => `${wp.x * 6.5},${wp.y * 3.8}`).join(' ')}
                fill="none"
                stroke="rgba(255, 255, 255, 0.4)"
                strokeWidth="2"
                strokeDasharray="6 4"
              />
            </svg>

            {/* Waypoint Markers */}
            {waypoints.map((wp, idx) => (
              <div
                key={wp.id}
                style={{ left: `${wp.x}%`, top: `${wp.y}%` }}
                className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-none"
              >
                <div className={`w-2.5 h-2.5 rounded-full border border-white ${
                  idx <= currentWaypointIdx ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-white/40'
                }`} />
              </div>
            ))}

            {/* Anomaly Pinpoints */}
            {INITIAL_ANOMALIES.map(anom => {
              const isSelected = selectedAnomaly?.id === anom.id;
              return (
                <button
                  key={anom.id}
                  onClick={() => setSelectedAnomaly(anom)}
                  style={{ left: `${anom.x}%`, top: `${anom.y}%` }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 group cursor-pointer transition-transform ${
                    isSelected ? 'scale-125 z-20' : 'hover:scale-110 z-10'
                  }`}
                >
                  <div className={`p-1.5 rounded-full shadow-lg border-2 border-white flex items-center justify-center animate-bounce ${
                    anom.severity === 'critical' ? 'bg-red-600' :
                    anom.severity === 'high' ? 'bg-amber-500' : 'bg-yellow-400 text-black'
                  }`}>
                    <AlertTriangle className="w-3.5 h-3.5 text-white" />
                  </div>
                  <div className="hidden group-hover:block absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-black/90 text-white text-[10px] font-bold px-2 py-1 rounded-md whitespace-nowrap z-30 shadow-md">
                    {anom.title} ({anom.confidence}%)
                  </div>
                </button>
              );
            })}

            {/* Live Drone Icon */}
            <motion.div
              animate={{ left: `${dronePos.x}%`, top: `${dronePos.y}%` }}
              transition={{ type: 'spring', damping: 20, stiffness: 80 }}
              className="absolute -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none"
            >
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-emerald-500/30 animate-ping absolute inset-0 -m-0" />
                <div className="w-8 h-8 rounded-full bg-white shadow-xl border-2 border-emerald-500 flex items-center justify-center text-emerald-600">
                  <Navigation 
                    className="w-5 h-5 transition-transform" 
                    style={{ transform: `rotate(${telemetry.headingDeg}deg)` }} 
                  />
                </div>
              </div>
            </motion.div>

            {/* Legend Overlay bottom left */}
            <div className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-md rounded-xl p-2.5 text-white text-[10px] font-mono flex items-center gap-3 border border-white/10">
              <span className="font-bold text-emerald-400">Scale:</span>
              {bandMode === 'ndvi' && (
                <div className="flex items-center gap-1">
                  <span className="text-red-400 font-bold">0.1 (Bare)</span>
                  <div className="w-16 h-2 rounded bg-gradient-to-r from-red-500 via-yellow-400 to-emerald-500" />
                  <span className="text-emerald-400 font-bold">0.9 (Vigorous)</span>
                </div>
              )}
              {bandMode === 'thermal' && (
                <div className="flex items-center gap-1">
                  <span className="text-blue-300">Cool (-3°C)</span>
                  <div className="w-16 h-2 rounded bg-gradient-to-r from-blue-600 via-pink-500 to-yellow-400" />
                  <span className="text-yellow-400">Water Stress (+4°C)</span>
                </div>
              )}
              {(bandMode === 'rgb' || bandMode === 'ndre' || bandMode === 'anomalies') && (
                <span>GSD: 1.4 cm/pixel • Sub-Centimeter RTK</span>
              )}
            </div>

            {/* Status Chip top right */}
            <div className="absolute top-3 right-3 bg-black/75 backdrop-blur-md rounded-xl px-3 py-1.5 text-white text-[10px] font-mono flex items-center gap-2 border border-white/10">
              <span className={`w-2 h-2 rounded-full ${
                flightStatus === 'surveying' ? 'bg-emerald-400 animate-ping' :
                flightStatus === 'paused' ? 'bg-amber-400' : 'bg-gray-400'
              }`} />
              <span className="font-bold uppercase tracking-wider">{flightStatus}</span>
            </div>
          </div>
        </div>

        {/* Anomaly Inspection & Prescription Action Box (1 col) */}
        <div className="bg-white rounded-3xl p-5 border border-[#c8e6c9] shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
              <div className="flex items-center gap-2">
                <Crosshair className="w-4 h-4 text-emerald-600" />
                <h3 className="font-serif font-bold text-base text-[#1b2e1b]">
                  Sub-Field Anomaly Inspector
                </h3>
              </div>
              <span className="text-[10px] font-mono font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                {INITIAL_ANOMALIES.length} Detected
              </span>
            </div>

            {selectedAnomaly ? (
              <motion.div
                key={selectedAnomaly.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/80 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-mono uppercase font-bold text-emerald-700">
                      {selectedAnomaly.zoneName}
                    </span>
                    <h4 className="font-bold text-sm text-[#1b2e1b]">
                      {selectedAnomaly.title}
                    </h4>
                  </div>
                  <span className={`text-[9px] font-mono uppercase font-extrabold px-2 py-0.5 rounded-full ${
                    selectedAnomaly.severity === 'critical' ? 'bg-red-100 text-red-700 border border-red-200' :
                    selectedAnomaly.severity === 'high' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {selectedAnomaly.severity}
                  </span>
                </div>

                <p className="text-xs text-gray-600 leading-relaxed">
                  {selectedAnomaly.description}
                </p>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="bg-white p-2 rounded-xl border border-gray-100">
                    <span className="text-[9px] text-gray-400 uppercase block">NDVI Index</span>
                    <span className="font-bold text-emerald-700">{selectedAnomaly.ndviScore}</span>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-gray-100">
                    <span className="text-[9px] text-gray-400 uppercase block">Thermal Delta</span>
                    <span className="font-bold text-amber-600">{selectedAnomaly.thermalDeltaC > 0 ? `+${selectedAnomaly.thermalDeltaC}` : selectedAnomaly.thermalDeltaC}°C</span>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-emerald-200/70 space-y-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase text-emerald-700">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span>Targeted Surgical Prescription</span>
                  </div>
                  <p className="text-xs font-semibold text-gray-800">
                    {selectedAnomaly.recommendedAction}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[11px] text-gray-500 pt-1">
                  <span>Area: {selectedAnomaly.estimatedAreaSqm} m²</span>
                  <span className="text-red-600 font-bold">Yield Risk: -{selectedAnomaly.potentialYieldImpactPct}%</span>
                </div>
              </motion.div>
            ) : (
              <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-gray-500 space-y-2">
                <Eye className="w-8 h-8 mx-auto text-gray-400" />
                <p className="text-xs font-medium">Click any pin on the flight map to inspect specific sub-canopy anomalies.</p>
              </div>
            )}
          </div>

          <div className="pt-2">
            <button
              onClick={() => setSelectedAnomaly(INITIAL_ANOMALIES[0])}
              className="w-full py-2.5 bg-[#e8f5e9] hover:bg-[#c8e6c9] text-[#1b2e1b] font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer border border-[#a5d6a7]"
            >
              <span>Cycle Next Anomaly Pin</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* AI Drone Mission Report Modal */}
      <AnimatePresence>
        {showReportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl border border-[#c8e6c9] max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-lg text-[#1b2e1b]">
                      UAV Aerial Scouting Agronomy Report
                    </h3>
                    <span className="text-[10px] font-mono text-gray-500">
                      Report ID: {scoutingReport.id} • {scoutingReport.timestamp}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="p-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Executive Summary */}
              <div className="p-4 bg-[#f8fcf8] border border-[#c8e6c9] rounded-2xl space-y-2">
                <span className="text-[10px] font-mono font-bold uppercase text-emerald-700">Executive AI Summary</span>
                <p className="text-xs text-gray-700 leading-relaxed font-sans">
                  {scoutingReport.executiveSummary}
                </p>
              </div>

              {/* Prescription Plan Table */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold font-mono uppercase text-gray-600">
                  Targeted Micro-Spraying & Irrigation Prescriptions
                </h4>
                <div className="border border-gray-200 rounded-2xl overflow-hidden divide-y divide-gray-100 text-xs">
                  {scoutingReport.prescriptionRecommendations.map((p, idx) => (
                    <div key={idx} className="p-3 flex items-start justify-between gap-3 hover:bg-gray-50">
                      <div className="space-y-0.5">
                        <span className="font-bold text-gray-900 block">{p.zone}: {p.action}</span>
                        <span className="text-gray-500">{p.product} • Rate: {p.ratePerHa}</span>
                      </div>
                      <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        p.urgency === 'Immediate' ? 'bg-red-100 text-red-700' :
                        p.urgency === 'Within 48h' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {p.urgency}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Report</span>
                </button>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
