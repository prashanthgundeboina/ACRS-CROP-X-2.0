import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Brain, 
  Droplets, 
  Sprout, 
  TestTube, 
  CloudSun, 
  Bug, 
  TrendingUp, 
  Coins, 
  Calendar, 
  Radio, 
  ShieldCheck, 
  AlertTriangle, 
  Activity, 
  RotateCw, 
  Layers, 
  Eye, 
  Sliders, 
  Sparkles, 
  Zap, 
  Sun, 
  Moon, 
  CloudRain, 
  Compass, 
  CheckCircle2, 
  Maximize2, 
  Minimize2, 
  Pause, 
  Play, 
  Info,
  ChevronRight,
  RefreshCw,
  Cpu,
  HeartPulse,
  Signal,
  Gauge
} from 'lucide-react';
import { FarmAgentId, FarmAgentStatus, AgentRecommendation, ConflictResolution } from '../../types/autonomous/farmAutonomousTypes';
import { AgentReasoningModal } from './AgentReasoningModal';

export type CommandTheme = 'farm-light' | 'cinematic-dark';
export type OrchestratorViewMode = '3d-hologram' | '3d-isometric' | '2d-matrix';

interface AgentOrchestratorPanelProps {
  agentStatuses: Record<FarmAgentId, FarmAgentStatus>;
  conflicts?: ConflictResolution[];
  onExecuteRecommendation?: (rec: AgentRecommendation) => void;
  activeGoal?: string;
  themeMode?: CommandTheme;
}

interface Node3D {
  agentId: FarmAgentId;
  name: string;
  shortName: string;
  role: string;
  angle: number;
  radius: number;
  height: number;
  color: string;
  glowColor: string;
  x3d: number;
  y3d: number;
  z3d: number;
  screenX: number;
  screenY: number;
  scale: number;
  opacity: number;
  latencyMs: number;
  heartbeatBpm: number;
  isEvaluating: boolean;
}

const AGENT_META: Record<FarmAgentId, { label: string; shortName: string; icon: any; defaultColor: string; baseBpm: number }> = {
  irrigation: { label: 'Irrigation & Hydrology', shortName: 'Water & Pump AI', icon: Droplets, defaultColor: '#0284c7', baseBpm: 68 },
  crop_health: { label: 'Crop Health & Digital Twin', shortName: 'Canopy Biomass AI', icon: Sprout, defaultColor: '#16a34a', baseBpm: 72 },
  soil: { label: 'Soil Chemistry & Nutrition', shortName: 'Soil NPK AI', icon: TestTube, defaultColor: '#9333ea', baseBpm: 64 },
  weather: { label: 'Weather & Microclimate', shortName: 'Atmospheric AI', icon: CloudSun, defaultColor: '#2563eb', baseBpm: 80 },
  pest_disease: { label: 'Pest & Pathogen Scouting', shortName: 'Bio-Defense AI', icon: Bug, defaultColor: '#dc2626', baseBpm: 76 },
  market: { label: 'Market & Mandi Price', shortName: 'Mandi Arbitrage AI', icon: TrendingUp, defaultColor: '#d97706', baseBpm: 60 },
  finance: { label: 'Farm Finance & ROI', shortName: 'Economics AI', icon: Coins, defaultColor: '#ca8a04', baseBpm: 58 },
  harvest: { label: 'Harvest Readiness & Logistics', shortName: 'Harvest AI', icon: Calendar, defaultColor: '#ea580c', baseBpm: 66 },
  iot_health: { label: 'IoT Telemetry & Hardware', shortName: 'Sensor Mesh AI', icon: Radio, defaultColor: '#0891b2', baseBpm: 88 }
};

export const AgentOrchestratorPanel: React.FC<AgentOrchestratorPanelProps> = ({
  agentStatuses,
  conflicts = [],
  onExecuteRecommendation,
  activeGoal = 'Balanced Farming',
  themeMode = 'cinematic-dark'
}) => {
  const isDark = themeMode === 'cinematic-dark';
  const [viewMode, setViewMode] = useState<OrchestratorViewMode>('3d-isometric');
  const [isLiveStreaming, setIsLiveStreaming] = useState<boolean>(true);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [selectedAgentId, setSelectedAgentId] = useState<FarmAgentId | null>(null);
  const [detailModalAgent, setDetailModalAgent] = useState<FarmAgentStatus | null>(null);
  const [simulatedHeartbeatTick, setSimulatedHeartbeatTick] = useState<number>(0);

  // 3D Orbit Camera angles
  const [pitch, setPitch] = useState<number>(0.38);
  const [yaw, setYaw] = useState<number>(0);
  const [zoom, setZoom] = useState<number>(1);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number; startYaw: number; startPitch: number }>({ x: 0, y: 0, startYaw: 0, startPitch: 0 });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const allAgentsList = Object.keys(agentStatuses) as FarmAgentId[];

  // Real-time Heartbeat Waveform Generator
  useEffect(() => {
    if (!isLiveStreaming) return;
    const interval = setInterval(() => {
      setSimulatedHeartbeatTick(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isLiveStreaming]);

  // Handle Canvas 3D Orbital Constellation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || viewMode !== '3d-hologram') return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let localYaw = yaw;

    const render = () => {
      if (autoRotate && isLiveStreaming) {
        localYaw += 0.005;
        setYaw(localYaw);
      }

      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;

      ctx.clearRect(0, 0, width, height);

      // Background Gradient Fill
      const bgGrad = ctx.createRadialGradient(centerX, centerY, 50, centerX, centerY, width * 0.7);
      if (isDark) {
        bgGrad.addColorStop(0, '#0a152d');
        bgGrad.addColorStop(0.6, '#040916');
        bgGrad.addColorStop(1, '#02050e');
      } else {
        bgGrad.addColorStop(0, '#f0fdf4');
        bgGrad.addColorStop(0.7, '#f8fafc');
        bgGrad.addColorStop(1, '#e2e8f0');
      }
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // 1. Draw 3D Radial Grid Floor with Perspective
      const ringCount = 4;
      const baseRadius = (Math.min(width, height) * 0.38) * zoom;
      const gridColor = isDark ? 'rgba(16, 185, 129, 0.15)' : 'rgba(5, 150, 105, 0.2)';

      for (let r = 1; r <= ringCount; r++) {
        const ringRadius = (baseRadius / ringCount) * r;
        ctx.beginPath();
        ctx.ellipse(
          centerX,
          centerY + (Math.sin(pitch) * 20),
          ringRadius,
          ringRadius * Math.sin(pitch + 0.5),
          0,
          0,
          Math.PI * 2
        );
        ctx.strokeStyle = gridColor;
        ctx.lineWidth = r === ringCount ? 1.5 : 1;
        ctx.setLineDash(r % 2 === 0 ? [6, 4] : []);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Draw Perspective Spokes
      for (let s = 0; s < 8; s++) {
        const angle = (Math.PI * 2 / 8) * s + localYaw;
        const x = centerX + Math.cos(angle) * baseRadius;
        const y = centerY + Math.sin(angle) * baseRadius * Math.sin(pitch + 0.5);
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(x, y);
        ctx.strokeStyle = gridColor;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      // 2. Compute 3D Nodes
      const nodes: Node3D[] = allAgentsList.map((id, index) => {
        const status = agentStatuses[id];
        const angle = (Math.PI * 2 / allAgentsList.length) * index + localYaw;
        const radius = baseRadius * 0.88;
        const heightOffset = Math.sin(angle * 2 + simulatedHeartbeatTick * 0.6) * 15;

        const x3d = Math.cos(angle) * radius;
        const z3d = Math.sin(angle) * radius;
        const y3d = heightOffset;

        const cosPitch = Math.cos(pitch);
        const sinPitch = Math.sin(pitch);
        const projectedY = (y3d * cosPitch - z3d * sinPitch);
        const projectedZ = (y3d * sinPitch + z3d * cosPitch);

        const cameraDistance = 600;
        const perspectiveFactor = cameraDistance / (cameraDistance + projectedZ);

        const screenX = centerX + x3d * perspectiveFactor;
        const screenY = centerY + projectedY * perspectiveFactor;
        const scale = Math.max(0.65, Math.min(1.35, perspectiveFactor));
        const opacity = Math.max(0.35, Math.min(1, (perspectiveFactor - 0.5) / 0.7));

        const isAlert = status.status === 'alert' || status.status === 'warning';
        const color = isAlert ? '#ef4444' : (AGENT_META[id]?.defaultColor || '#10b981');

        return {
          agentId: id,
          name: AGENT_META[id]?.label || status.name,
          shortName: AGENT_META[id]?.shortName || status.name,
          role: status.role,
          angle,
          radius,
          height: heightOffset,
          color,
          glowColor: isAlert ? 'rgba(239, 68, 68, 0.5)' : isDark ? 'rgba(16, 185, 129, 0.45)' : 'rgba(5, 150, 105, 0.3)',
          x3d,
          y3d,
          z3d: projectedZ,
          screenX,
          screenY,
          scale,
          opacity,
          latencyMs: 12 + (index * 3) + (simulatedHeartbeatTick % 4),
          heartbeatBpm: (AGENT_META[id]?.baseBpm || 70) + (isAlert ? 18 : (simulatedHeartbeatTick % 6) - 3),
          isEvaluating: isLiveStreaming
        };
      });

      // Sort nodes by depth for true 3D occlusion
      nodes.sort((a, b) => a.z3d - b.z3d);

      // 3. Central AI Supervisor Core
      const coreRadius = 38 * zoom;
      const corePulse = Math.sin(Date.now() * 0.005) * 4;

      const coreGlow = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, coreRadius * 2.4);
      coreGlow.addColorStop(0, isDark ? 'rgba(16, 185, 129, 0.5)' : 'rgba(5, 150, 105, 0.35)');
      coreGlow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = coreGlow;
      ctx.beginPath();
      ctx.arc(centerX, centerY, coreRadius * 2.4, 0, Math.PI * 2);
      ctx.fill();

      // Rotating Outer Gyroscope Ring
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(-localYaw * 1.6);
      ctx.beginPath();
      ctx.arc(0, 0, coreRadius + 14 + corePulse, 0, Math.PI * 2);
      ctx.strokeStyle = isDark ? '#10b981' : '#059669';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([8, 6, 2, 6]);
      ctx.stroke();
      ctx.restore();

      // Central Core Body
      const coreGrad = ctx.createRadialGradient(centerX - 8, centerY - 8, 4, centerX, centerY, coreRadius + corePulse);
      if (isDark) {
        coreGrad.addColorStop(0, '#ffffff');
        coreGrad.addColorStop(0.3, '#10b981');
        coreGrad.addColorStop(1, '#064e3b');
      } else {
        coreGrad.addColorStop(0, '#ffffff');
        coreGrad.addColorStop(0.4, '#059669');
        coreGrad.addColorStop(1, '#022c22');
      }
      ctx.fillStyle = coreGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, coreRadius + corePulse, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Core Label
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('SUPERVISOR', centerX, centerY - 2);
      ctx.font = '8px system-ui, sans-serif';
      ctx.fillStyle = isDark ? '#a7f3d0' : '#d1fae5';
      ctx.fillText('ORCHESTRATOR', centerX, centerY + 10);

      // 4. Synaptic Data Lines & Flowing Heartbeat Energy
      nodes.forEach((node, i) => {
        const isSelected = selectedAgentId === node.agentId;
        const isFocused = !selectedAgentId || isSelected;

        ctx.save();
        ctx.globalAlpha = isFocused ? node.opacity : 0.25;

        // Quadratic bezier synaptic arc
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        const midX = (centerX + node.screenX) / 2 + Math.sin(node.angle + Date.now() * 0.002) * 14;
        const midY = (centerY + node.screenY) / 2 - 18;
        ctx.quadraticCurveTo(midX, midY, node.screenX, node.screenY);
        ctx.strokeStyle = isSelected ? (isDark ? '#ffffff' : '#0f172a') : node.color;
        ctx.lineWidth = isSelected ? 2.5 : 1.2;
        ctx.stroke();

        // Traveling heartbeat energy pulse along curve
        if (isLiveStreaming) {
          const packetProgress = ((simulatedHeartbeatTick * 0.28 + i * 0.14) % 1);
          const px = (1 - packetProgress) * (1 - packetProgress) * centerX + 2 * (1 - packetProgress) * packetProgress * midX + packetProgress * packetProgress * node.screenX;
          const py = (1 - packetProgress) * (1 - packetProgress) * centerY + 2 * (1 - packetProgress) * packetProgress * midY + packetProgress * packetProgress * node.screenY;

          ctx.beginPath();
          ctx.arc(px, py, 3.5, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.shadowColor = node.color;
          ctx.shadowBlur = 10;
          ctx.fill();
          ctx.shadowBlur = 0;
        }

        ctx.restore();
      });

      // 5. Render 3D Floating Agent Nodes
      nodes.forEach((node) => {
        const isSelected = selectedAgentId === node.agentId;
        const isFocused = !selectedAgentId || isSelected;
        const status = agentStatuses[node.agentId];
        const isAlert = status.status === 'alert' || status.status === 'warning';
        const nodeRadius = (isSelected ? 26 : 21) * node.scale;

        ctx.save();
        ctx.globalAlpha = isFocused ? node.opacity : 0.3;

        // Ground drop shadow
        const groundY = centerY + (Math.sin(pitch) * 20) + (node.screenY - centerY) * 0.85 + 24 * node.scale;
        ctx.beginPath();
        ctx.ellipse(node.screenX, groundY, nodeRadius * 0.8, nodeRadius * 0.3, 0, 0, Math.PI * 2);
        ctx.fillStyle = isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.15)';
        ctx.fill();

        // Vertical elevation beacon line
        ctx.beginPath();
        ctx.moveTo(node.screenX, groundY);
        ctx.lineTo(node.screenX, node.screenY);
        ctx.strokeStyle = node.glowColor;
        ctx.lineWidth = 0.8;
        ctx.setLineDash([3, 3]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Glow ring
        const nodeGlow = ctx.createRadialGradient(node.screenX, node.screenY, 2, node.screenX, node.screenY, nodeRadius * 1.8);
        nodeGlow.addColorStop(0, node.glowColor);
        nodeGlow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = nodeGlow;
        ctx.beginPath();
        ctx.arc(node.screenX, node.screenY, nodeRadius * 1.8, 0, Math.PI * 2);
        ctx.fill();

        // Node Sphere Body
        const nodeGrad = ctx.createRadialGradient(
          node.screenX - nodeRadius * 0.3,
          node.screenY - nodeRadius * 0.3,
          nodeRadius * 0.1,
          node.screenX,
          node.screenY,
          nodeRadius
        );
        nodeGrad.addColorStop(0, '#ffffff');
        nodeGrad.addColorStop(0.3, node.color);
        nodeGrad.addColorStop(1, isDark ? '#090d16' : '#1e293b');

        ctx.fillStyle = nodeGrad;
        ctx.beginPath();
        ctx.arc(node.screenX, node.screenY, nodeRadius, 0, Math.PI * 2);
        ctx.fill();

        // Border
        ctx.strokeStyle = isSelected ? '#ffffff' : isAlert ? '#ef4444' : node.color;
        ctx.lineWidth = isSelected ? 2.5 : 1.5;
        ctx.stroke();

        // Live Heartbeat Indicator Pip
        const pulseSize = (4 + Math.sin(Date.now() * 0.008 + node.angle) * 1.5) * node.scale;
        ctx.beginPath();
        ctx.arc(node.screenX + nodeRadius * 0.7, node.screenY - nodeRadius * 0.7, pulseSize, 0, Math.PI * 2);
        ctx.fillStyle = isAlert ? '#ef4444' : '#10b981';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.fill();
        ctx.stroke();

        // Label above node
        ctx.fillStyle = isDark ? '#ffffff' : '#0f172a';
        ctx.font = `bold ${Math.max(9, Math.round(11 * node.scale))}px system-ui, sans-serif`;
        ctx.textAlign = 'center';
        if (isDark) {
          ctx.shadowColor = 'rgba(0,0,0,0.8)';
          ctx.shadowBlur = 4;
        }
        ctx.fillText(node.shortName, node.screenX, node.screenY - nodeRadius - 7);

        // Heartbeat & Confidence Badge below node
        ctx.fillStyle = isAlert ? '#f87171' : node.color;
        ctx.font = `bold ${Math.max(8, Math.round(9 * node.scale))}px system-ui, sans-serif`;
        ctx.fillText(`${status.confidenceScore}% • ${node.heartbeatBpm} BPM`, node.screenX, node.screenY + nodeRadius + 13);
        ctx.shadowBlur = 0;

        ctx.restore();
      });

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [allAgentsList, agentStatuses, pitch, yaw, zoom, autoRotate, isLiveStreaming, selectedAgentId, simulatedHeartbeatTick, viewMode, isDark]);

  // Canvas Mouse Controls
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setAutoRotate(false);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startYaw: yaw,
      startPitch: pitch
    };
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;
    setYaw(dragStartRef.current.startYaw + deltaX * 0.008);
    setPitch(Math.max(0.1, Math.min(1.2, dragStartRef.current.startPitch + deltaY * 0.006)));
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
  };

  // Canvas Click Detection
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) * (canvas.width / rect.width);
    const clickY = (e.clientY - rect.top) * (canvas.height / rect.height);
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const baseRadius = (Math.min(canvas.width, canvas.height) * 0.38) * zoom;

    let clickedAgent: FarmAgentId | null = null;

    allAgentsList.forEach((id, index) => {
      const angle = (Math.PI * 2 / allAgentsList.length) * index + yaw;
      const radius = baseRadius * 0.88;
      const heightOffset = Math.sin(angle * 2 + simulatedHeartbeatTick * 0.6) * 15;
      const x3d = Math.cos(angle) * radius;
      const z3d = Math.sin(angle) * radius;
      const y3d = heightOffset;

      const cosPitch = Math.cos(pitch);
      const sinPitch = Math.sin(pitch);
      const projectedY = (y3d * cosPitch - z3d * sinPitch);
      const projectedZ = (y3d * sinPitch + z3d * cosPitch);

      const cameraDistance = 600;
      const perspectiveFactor = cameraDistance / (cameraDistance + projectedZ);
      const screenX = centerX + x3d * perspectiveFactor;
      const screenY = centerY + projectedY * perspectiveFactor;
      const nodeRadius = 26 * perspectiveFactor;

      const dist = Math.hypot(clickX - screenX, clickY - screenY);
      if (dist <= nodeRadius * 1.5) {
        clickedAgent = id;
      }
    });

    if (clickedAgent) {
      setSelectedAgentId(prev => prev === clickedAgent ? null : clickedAgent);
    }
  };

  const selectedAgentStatus = selectedAgentId ? agentStatuses[selectedAgentId] : null;

  return (
    <motion.div 
      layout
      className={`rounded-3xl p-6 sm:p-8 transition-all duration-300 border shadow-2xl relative overflow-hidden space-y-6 ${
        isDark 
          ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-[#0b1329] text-white border-white/10'
          : 'bg-white text-slate-900 border-slate-200 shadow-slate-200/50'
      }`}
      style={{
        boxShadow: isDark ? '0 25px 50px -12px rgba(0, 0, 0, 0.7)' : '0 15px 35px -5px rgba(0, 0, 0, 0.05)'
      }}
    >
      {/* 3D Ambient Volumetric Light Glow */}
      <div 
        className="absolute top-0 right-0 w-[450px] h-[450px] rounded-full blur-3xl pointer-events-none opacity-20"
        style={{ backgroundColor: isDark ? '#10b981' : '#059669' }}
      />

      {/* Header & Controls Bar */}
      <div className={`flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 border-b pb-5 ${
        isDark ? 'border-white/10' : 'border-slate-100'
      }`}>
        <div className="flex items-center gap-3.5">
          <motion.div 
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
            className={`p-3 rounded-2xl border shadow-inner ${
              isDark 
                ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30' 
                : 'bg-emerald-50 text-emerald-600 border-emerald-200'
            }`}
          >
            <Brain className="w-7 h-7" />
          </motion.div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider border ${
                isDark 
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                  : 'bg-emerald-100 text-emerald-800 border-emerald-200'
              }`}>
                9-Agent Live Orchestrator
              </span>
              <span className={`flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full border ${
                isDark 
                  ? 'bg-slate-800/80 text-slate-300 border-white/10' 
                  : 'bg-slate-100 text-slate-700 border-slate-200'
              }`}>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Live Telemetry Synchronized
              </span>
            </div>
            <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight mt-1 ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>
              Autonomous Multi-Agent Agronomy Hive
            </h2>
            <p className={`text-xs mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              Real-time heartbeat monitoring, confidence matrix, and deterministic agronomy arbitration.
            </p>
          </div>
        </div>

        {/* View Mode & Stream Controls */}
        <div className="flex items-center gap-2 flex-wrap w-full xl:w-auto justify-start xl:justify-end">
          {/* View Mode Switcher */}
          <div className={`p-1 rounded-xl border flex items-center gap-1 ${
            isDark ? 'bg-black/40 border-white/10' : 'bg-slate-100 border-slate-200'
          }`}>
            <button
              onClick={() => setViewMode('3d-isometric')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === '3d-isometric'
                  ? isDark ? 'bg-white text-slate-950 shadow-md font-extrabold' : 'bg-white text-slate-900 shadow-md'
                  : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>3D Isometric Deck</span>
            </button>
            <button
              onClick={() => setViewMode('3d-hologram')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === '3d-hologram'
                  ? isDark ? 'bg-white text-slate-950 shadow-md font-extrabold' : 'bg-white text-slate-900 shadow-md'
                  : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>3D Spatial Orbit</span>
            </button>
            <button
              onClick={() => setViewMode('2d-matrix')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === '2d-matrix'
                  ? isDark ? 'bg-white text-slate-950 shadow-md font-extrabold' : 'bg-white text-slate-900 shadow-md'
                  : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Tactical Grid</span>
            </button>
          </div>

          {/* Live Telemetry Stream Simulation Toggle */}
          <button
            onClick={() => setIsLiveStreaming(!isLiveStreaming)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-all shadow-sm ${
              isLiveStreaming
                ? isDark 
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                  : 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200'
                : isDark
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                  : 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200'
            }`}
          >
            {isLiveStreaming ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isLiveStreaming ? 'Heartbeat Live' : 'Heartbeat Paused'}</span>
          </button>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* VIEW MODE 1: 3D ISOMETRIC INTERACTIVE DECK */}
      {/* ------------------------------------------------------------- */}
      {viewMode === '3d-isometric' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 [perspective:1400px]">
          {allAgentsList.map((id, index) => {
            const status = agentStatuses[id];
            const meta = AGENT_META[id];
            const Icon = meta.icon;
            const isAlert = status.status === 'alert' || status.status === 'warning';
            const isSelected = selectedAgentId === id;
            const currentBpm = meta.baseBpm + (isAlert ? 16 : (simulatedHeartbeatTick % 4) - 2);

            return (
              <motion.div
                key={id}
                layout
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.04 }}
                whileHover={{ 
                  scale: 1.025, 
                  rotateX: 4, 
                  rotateY: -3, 
                  z: 30,
                  transition: { duration: 0.2 } 
                }}
                onClick={() => setSelectedAgentId(prev => prev === id ? null : id)}
                className={`rounded-2xl p-5 border shadow-xl transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between space-y-4 [transform-style:preserve-3d] ${
                  isSelected
                    ? isDark 
                      ? 'bg-white/15 border-white ring-2 ring-white/50 shadow-2xl' 
                      : 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-400 shadow-xl'
                    : isAlert
                    ? isDark
                      ? 'bg-gradient-to-br from-red-950/80 via-slate-900 to-rose-950/80 border-red-500/50'
                      : 'bg-red-50/90 border-red-200'
                    : isDark
                    ? 'bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-black/80 border-white/10 hover:border-emerald-500/40'
                    : 'bg-white border-slate-200 hover:border-emerald-500/40 hover:shadow-lg'
                }`}
              >
                {/* 3D Specular Light Overlay */}
                <div className="absolute top-0 right-0 w-36 h-36 bg-white/5 rounded-full blur-2xl pointer-events-none" />

                <div className="space-y-3">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-2xl border shadow-inner ${
                        isDark ? 'bg-white/10 border-white/15' : 'bg-slate-100 border-slate-200'
                      }`}>
                        <Icon className="w-5 h-5" style={{ color: meta.defaultColor }} />
                      </div>
                      <div>
                        <h4 className={`font-bold text-sm leading-snug ${isDark ? 'text-white' : 'text-slate-900'}`}>
                          {status.name}
                        </h4>
                        <span className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                          {meta.shortName}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                        isAlert 
                          ? isDark ? 'bg-red-500/20 text-red-300 border-red-500/40' : 'bg-red-100 text-red-800 border-red-200'
                          : isDark ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                      }`}>
                        {status.status}
                      </span>
                      <span className={`text-[10px] mt-1 font-mono font-bold ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {status.confidenceScore}% Confidence
                      </span>
                    </div>
                  </div>

                  {/* Live Heartbeat & Telemetry Status Visualization Layer */}
                  <div className={`p-3 rounded-xl border space-y-2 ${
                    isDark ? 'bg-black/40 border-white/10' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="flex items-center gap-1.5 font-bold text-emerald-500">
                        <HeartPulse className="w-3.5 h-3.5 animate-pulse text-rose-500" />
                        <span>{currentBpm} BPM • {12 + (index * 2)}ms</span>
                      </span>
                      <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded ${
                        isLiveStreaming ? 'text-emerald-500 bg-emerald-500/10' : 'text-slate-400 bg-slate-500/10'
                      }`}>
                        {isLiveStreaming ? 'ANALYZING TELEMETRY' : 'STANDBY'}
                      </span>
                    </div>

                    {/* Simulated SVG Heartbeat Waveform Line */}
                    <div className="h-6 w-full flex items-center overflow-hidden">
                      <svg className="w-full h-full" viewBox="0 0 100 24" preserveAspectRatio="none">
                        <path
                          d={`M 0,12 L 20,12 L 25,${isAlert ? 2 : 5} L 30,${isAlert ? 22 : 19} L 35,12 L 45,12 L 50,${(simulatedHeartbeatTick % 2 === 0 ? 4 : 8)} L 55,16 L 60,12 L 80,12 L 85,${isAlert ? 3 : 6} L 90,${isAlert ? 21 : 18} L 95,12 L 100,12`}
                          fill="none"
                          stroke={isAlert ? '#ef4444' : meta.defaultColor}
                          strokeWidth="1.8"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>

                    {/* Confidence Meter Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>Confidence Gauge</span>
                        <span className="font-bold">{status.confidenceScore}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-500"
                          style={{ 
                            width: `${status.confidenceScore}%`,
                            backgroundColor: isAlert ? '#ef4444' : meta.defaultColor 
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Recommendation Directive */}
                  {status.currentRecommendation && (
                    <div className={`p-3 rounded-xl border space-y-1 ${
                      isDark ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200'
                    }`}>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500 block">
                        {status.currentRecommendation.domain}
                      </span>
                      <p className={`text-xs font-semibold line-clamp-2 leading-relaxed ${
                        isDark ? 'text-slate-200' : 'text-slate-800'
                      }`}>
                        {status.currentRecommendation.headline}
                      </p>
                    </div>
                  )}
                </div>

                {/* Card Action Footer */}
                <div className={`flex items-center justify-between pt-3 border-t text-xs ${
                  isDark ? 'border-white/10' : 'border-slate-100'
                }`}>
                  <span className={`text-[10px] flex items-center gap-1 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                    <Signal className="w-3 h-3 text-emerald-500" />
                    <span>Sync: 0.8s ago</span>
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDetailModalAgent(status);
                    }}
                    className="text-xs font-bold text-emerald-500 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center gap-1 hover:underline"
                  >
                    <span>6-Part Rationale</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* VIEW MODE 2: 3D HOLOGRAPHIC SPATIAL ORBIT */}
      {/* ------------------------------------------------------------- */}
      {viewMode === '3d-hologram' && (
        <div className={`relative rounded-3xl border overflow-hidden shadow-2xl ${
          isDark ? 'bg-slate-950 border-white/10' : 'bg-slate-100 border-slate-200'
        }`}>
          <canvas
            ref={canvasRef}
            width={1000}
            height={520}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
            onClick={handleCanvasClick}
            className="w-full h-[420px] sm:h-[500px] cursor-grab active:cursor-grabbing block"
          />

          {/* 3D Canvas HUD Overlay */}
          <div className="absolute top-4 left-4 flex flex-col gap-2 pointer-events-none">
            <div className={`px-3 py-1.5 rounded-xl border text-xs flex items-center gap-2 backdrop-blur-md ${
              isDark ? 'bg-black/60 border-white/10 text-slate-300' : 'bg-white/80 border-slate-200 text-slate-800'
            }`}>
              <Compass className="w-3.5 h-3.5 text-emerald-500" />
              <span>Pitch: {(pitch * 180 / Math.PI).toFixed(0)}° • Yaw: {(yaw * 180 / Math.PI).toFixed(0)}°</span>
            </div>
            <div className={`px-3 py-1.5 rounded-xl border text-[11px] backdrop-blur-md ${
              isDark ? 'bg-black/60 border-white/10 text-slate-400' : 'bg-white/80 border-slate-200 text-slate-600'
            }`}>
              💡 Drag to tilt 3D orbit • Click node to inspect
            </div>
          </div>

          {/* 3D Orbit Controls */}
          <div className={`absolute top-4 right-4 flex items-center gap-1.5 p-1.5 rounded-xl border backdrop-blur-md ${
            isDark ? 'bg-black/60 border-white/10' : 'bg-white/80 border-slate-200'
          }`}>
            <button
              onClick={() => setAutoRotate(!autoRotate)}
              className={`p-2 rounded-lg text-xs font-bold transition-colors ${
                autoRotate ? 'bg-emerald-500/30 text-emerald-400' : isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Toggle Auto Rotation"
            >
              <RotateCw className={`w-4 h-4 ${autoRotate ? 'animate-spin-slow' : ''}`} />
            </button>
            <button
              onClick={() => setZoom(prev => Math.min(1.4, prev + 0.1))}
              className={`p-2 rounded-lg text-xs transition-colors ${
                isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Zoom In"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setZoom(prev => Math.max(0.7, prev - 0.1))}
              className={`p-2 rounded-lg text-xs transition-colors ${
                isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Zoom Out"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setPitch(0.38);
                setYaw(0);
                setZoom(1);
                setAutoRotate(true);
              }}
              className={`p-2 rounded-lg text-xs transition-colors ${
                isDark ? 'text-slate-300 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Reset View"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* VIEW MODE 3: 2D HIGH-DENSITY TACTICAL GRID */}
      {/* ------------------------------------------------------------- */}
      {viewMode === '2d-matrix' && (
        <div className={`overflow-x-auto rounded-2xl border ${
          isDark ? 'border-white/10 bg-black/40' : 'border-slate-200 bg-white'
        }`}>
          <table className="w-full text-left text-xs">
            <thead className={`border-b text-[11px] uppercase tracking-wider ${
              isDark ? 'bg-white/5 border-white/10 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-500'
            }`}>
              <tr>
                <th className="py-3.5 px-4">Agronomy Agent</th>
                <th className="py-3.5 px-4">Heartbeat & Status</th>
                <th className="py-3.5 px-4">Confidence</th>
                <th className="py-3.5 px-4">Current Directive</th>
                <th className="py-3.5 px-4">Permission</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-white/5' : 'divide-slate-100'}`}>
              {allAgentsList.map((id) => {
                const status = agentStatuses[id];
                const meta = AGENT_META[id];
                const Icon = meta.icon;
                const isAlert = status.status === 'alert' || status.status === 'warning';
                const rec = status.currentRecommendation;

                return (
                  <tr 
                    key={id} 
                    onClick={() => setSelectedAgentId(prev => prev === id ? null : id)}
                    className={`transition-colors cursor-pointer ${
                      isDark ? 'hover:bg-white/5' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded-lg ${isDark ? 'bg-white/10' : 'bg-slate-100'}`}>
                          <Icon className="w-4 h-4" style={{ color: meta.defaultColor }} />
                        </div>
                        <div>
                          <span className={`font-bold block ${isDark ? 'text-white' : 'text-slate-900'}`}>{status.name}</span>
                          <span className={`text-[10px] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{meta.shortName}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                          isAlert 
                            ? isDark ? 'bg-red-500/20 text-red-300 border-red-500/40' : 'bg-red-100 text-red-800 border-red-200'
                            : isDark ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                        }`}>
                          {status.status}
                        </span>
                        <span className="text-[11px] font-mono text-emerald-500 font-bold">
                          {meta.baseBpm} BPM
                        </span>
                      </div>
                    </td>
                    <td className={`py-3 px-4 font-mono font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      {status.confidenceScore}%
                    </td>
                    <td className="py-3 px-4">
                      <p className={`font-medium line-clamp-1 max-w-md ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                        {rec?.headline || 'Monitoring telemetry baseline.'}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                        isDark ? 'bg-white/10 text-slate-300' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {rec?.requiredPermission || 'advisory'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDetailModalAgent(status);
                        }}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                          isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-900'
                        }`}
                      >
                        Deep Dive
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Selected Agent Spotlight Inspector */}
      <AnimatePresence>
        {selectedAgentStatus && (
          <motion.div
            layout
            initial={{ opacity: 0, y: 15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.98 }}
            className={`p-6 rounded-3xl border shadow-2xl space-y-4 ${
              isDark ? 'bg-black/60 border-white/20' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className={`flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b pb-4 ${
              isDark ? 'border-white/10' : 'border-slate-200'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-2xl border ${isDark ? 'bg-white/10 border-white/20' : 'bg-white border-slate-200'}`}>
                  <Brain className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                      isDark ? 'bg-white/10 text-white' : 'bg-slate-200 text-slate-800'
                    }`}>
                      Agent Telemetry Inspector
                    </span>
                    <span className="text-xs text-emerald-500 font-semibold">
                      {selectedAgentStatus.confidenceScore}% Confidence Score
                    </span>
                  </div>
                  <h3 className={`text-xl font-bold mt-0.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    {selectedAgentStatus.name}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDetailModalAgent(selectedAgentStatus)}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-colors shadow-md flex items-center gap-1.5 ${
                    isDark ? 'bg-white text-slate-950 hover:bg-slate-100' : 'bg-emerald-600 text-white hover:bg-emerald-500'
                  }`}
                >
                  <span>Full 6-Part Rationale</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setSelectedAgentId(null)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors ${
                    isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-slate-200 hover:bg-slate-300 text-slate-800'
                  }`}
                >
                  Close Spotlight
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className={`p-4 rounded-2xl border space-y-1 ${
                isDark ? 'bg-white/5 border-white/5' : 'bg-white border-slate-200'
              }`}>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  Role & Objective
                </span>
                <p className={`leading-relaxed font-medium ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                  {selectedAgentStatus.role}
                </p>
              </div>

              <div className={`p-4 rounded-2xl border space-y-1 md:col-span-2 ${
                isDark ? 'bg-white/5 border-white/5' : 'bg-white border-slate-200'
              }`}>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500">
                  Current Autonomous Directive
                </span>
                <h5 className={`font-bold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  {selectedAgentStatus.currentRecommendation?.headline}
                </h5>
                <p className={`leading-relaxed mt-1 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  {selectedAgentStatus.currentRecommendation?.what}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 6-Part Explainable Rationale Modal */}
      <AgentReasoningModal
        isOpen={Boolean(detailModalAgent)}
        onClose={() => setDetailModalAgent(null)}
        agentStatus={detailModalAgent}
        onExecuteAction={onExecuteRecommendation}
      />
    </motion.div>
  );
};
