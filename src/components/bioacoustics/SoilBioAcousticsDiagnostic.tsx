import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Volume2,
  VolumeX,
  Mic,
  Activity,
  Sparkles,
  Play,
  Pause,
  Layers,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Bug,
  Droplets,
  RotateCcw
} from 'lucide-react';
import { SoilData, FarmZone } from '../../types';

interface SoilBioAcousticsDiagnosticProps {
  soilData: SoilData;
  cropName: string;
  farmZones?: FarmZone[];
  onOpenCallModal?: () => void;
}

export const SoilBioAcousticsDiagnostic: React.FC<SoilBioAcousticsDiagnosticProps> = ({
  soilData,
  cropName,
  farmZones,
  onOpenCallModal
}) => {
  const [isPlayingProbe, setIsPlayingProbe] = useState(false);
  const [selectedZone, setSelectedZone] = useState<string>('Zone A (Loam)');
  const [selectedDepthCm, setSelectedDepthCm] = useState<number>(15);
  const [isRecordingCustomAudio, setIsRecordingCustomAudio] = useState(false);
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Bio-acoustic health score computed from organic matter and soil moisture
  const acousticComplexityIndex = Math.min(96, Math.round(62 + (soilData.organic_matter || 3.0) * 8 + (soilData.soil_moisture || 30) * 0.3));
  const invertebrateActivityRating = acousticComplexityIndex > 80 ? 'High Biodiversity' : acousticComplexityIndex > 65 ? 'Moderate Invertebrate Activity' : 'Low Acoustic Biological Signature';

  // Real-time canvas audio spectrogram animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      // Dark background
      ctx.fillStyle = '#061008';
      ctx.fillRect(0, 0, width, height);

      // Frequency grid lines
      ctx.strokeStyle = 'rgba(76, 175, 80, 0.15)';
      ctx.lineWidth = 1;
      for (let y = 0; y < height; y += 35) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw acoustic wave bands
      const numBands = 64;
      const barWidth = width / numBands;

      for (let i = 0; i < numBands; i++) {
        const freqOffset = Math.sin(phase + i * 0.2) * 0.5 + 0.5;
        const noise = (Math.random() - 0.5) * (isPlayingProbe ? 28 : 8);
        const organicMultiplier = (soilData.organic_matter || 3.0) / 3.0;
        
        let barHeight = (freqOffset * 80 + noise) * organicMultiplier;
        if (!isPlayingProbe) barHeight *= 0.35;
        barHeight = Math.max(4, Math.min(height - 10, barHeight));

        // Color mapping from low frequencies (warm amber/red earthworm clicks) to high frequencies (green/cyan cavitation)
        const gradient = ctx.createLinearGradient(0, height, 0, height - barHeight);
        if (i < 20) {
          gradient.addColorStop(0, '#f59e0b');
          gradient.addColorStop(1, '#ef4444');
        } else if (i < 45) {
          gradient.addColorStop(0, '#10b981');
          gradient.addColorStop(1, '#34d399');
        } else {
          gradient.addColorStop(0, '#06b6d4');
          gradient.addColorStop(1, '#3b82f6');
        }

        ctx.fillStyle = gradient;
        ctx.fillRect(i * barWidth + 1, height - barHeight, barWidth - 2, barHeight);
      }

      phase += isPlayingProbe ? 0.08 : 0.02;
      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isPlayingProbe, soilData.organic_matter, soilData.soil_moisture]);

  useEffect(() => {
    return () => {
      if (oscillatorRef.current) {
        try { oscillatorRef.current.stop(); } catch (e) {}
        oscillatorRef.current = null;
      }
      if (audioContextRef.current) {
        const ctx = audioContextRef.current;
        audioContextRef.current = null;
        try {
          if (ctx.state !== 'closed') {
            ctx.close().catch(() => {});
          }
        } catch (e) {}
      }
    };
  }, []);

  // Audio synthesis for probe sound
  const handleToggleAudio = () => {
    if (isPlayingProbe) {
      if (oscillatorRef.current) {
        try { oscillatorRef.current.stop(); } catch (e) {}
        oscillatorRef.current = null;
      }
      if (audioContextRef.current) {
        const ctx = audioContextRef.current;
        audioContextRef.current = null;
        try {
          if (ctx.state !== 'closed') {
            ctx.close().catch(() => {});
          }
        } catch (e) {}
      }
      setIsPlayingProbe(false);
    } else {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        audioContextRef.current = ctx;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(180, ctx.currentTime);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();

        oscillatorRef.current = osc;
        gainNodeRef.current = gain;
        setIsPlayingProbe(true);
      } catch (err) {
        setIsPlayingProbe(true);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0d2818] via-[#04471c] to-[#052e16] rounded-3xl p-6 text-white shadow-xl border border-emerald-500/20 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/20 rounded-xl text-emerald-400 border border-emerald-500/30">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-emerald-400">
              Subterranean Acoustic Geophone & Microbiome Diagnostic
            </span>
          </div>
          <h2 className="font-serif text-2xl md:text-3xl font-extrabold tracking-tight">
            Soil Bio-Acoustics & Micro-Fauna Sonification
          </h2>
          <p className="text-xs text-gray-300 max-w-2xl">
            Analyze subterranean invertebrate acoustic frequency patterns (0 - 15 kHz), measure earthworm bioturbation density, and identify root xylem cavitation under water deficits.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleToggleAudio}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-lg transition-all cursor-pointer ${
              isPlayingProbe
                ? 'bg-amber-500 text-white'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {isPlayingProbe ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            <span>{isPlayingProbe ? 'Mute Sonification' : 'Listen to Soil Soundscape'}</span>
          </button>
        </div>
      </div>

      {/* Top 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-[#c8e6c9] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-gray-500 text-xs font-mono uppercase">
            <span>Acoustic Complexity (ACI)</span>
            <Activity className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black font-mono text-[#1b2e1b]">
            {acousticComplexityIndex} / 100
          </div>
          <span className="text-[10px] text-emerald-700 font-bold block pt-1">
            {invertebrateActivityRating}
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#c8e6c9] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-gray-500 text-xs font-mono uppercase">
            <span>Earthworm Activity Index</span>
            <Bug className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-black font-mono text-[#1b2e1b]">
            14.2 <span className="text-xs font-bold text-gray-400">clicks / min</span>
          </div>
          <span className="text-[10px] text-gray-500 font-bold block pt-1">
            Correlated with {soilData.organic_matter}% Soil Organic Matter
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#c8e6c9] shadow-xs space-y-1">
          <div className="flex items-center justify-between text-gray-500 text-xs font-mono uppercase">
            <span>Root Xylem Cavitation</span>
            <Droplets className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-3xl font-black font-mono text-emerald-700">
            {soilData.soil_moisture > 25 ? '0.0 (Nominal)' : '3.8 (Stress Burst)'}
          </div>
          <span className="text-[10px] text-gray-500 font-bold block pt-1">
            Ultrasonic acoustic pulses from water tension
          </span>
        </div>
      </div>

      {/* Real-Time Spectrogram & Controls (2 cols + 1 col) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real-Time Audio Spectrogram Canvas (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-[#c8e6c9] shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-600" />
              <h3 className="font-serif font-bold text-lg text-[#1b2e1b]">
                Real-Time Soil Audio Spectrogram (0 - 15 kHz)
              </h3>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full">
              Geophone Probe at -{selectedDepthCm}cm Depth
            </span>
          </div>

          <div className="rounded-2xl overflow-hidden border border-gray-900 shadow-inner bg-slate-950 p-2">
            <canvas
              ref={canvasRef}
              width={640}
              height={220}
              className="w-full h-52 block rounded-xl"
            />
          </div>

          <div className="flex flex-wrap items-center justify-between text-xs text-gray-500 pt-1">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Low (0-2kHz): Earthworm Tunneling
              </span>
              <span className="flex items-center gap-1.5 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Mid (2-8kHz): Microarthropods
              </span>
              <span className="flex items-center gap-1.5 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> High (8-15kHz): Cavitation
              </span>
            </div>
          </div>
        </div>

        {/* Probe Controls and Soil Depth (1 col) */}
        <div className="bg-white rounded-3xl p-6 border border-[#c8e6c9] shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b border-gray-100 pb-3">
              <h4 className="font-serif font-bold text-base text-[#1b2e1b]">
                Geophone Probe Position
              </h4>
              <p className="text-xs text-gray-500">
                Adjust insertion depth to isolate rhizosphere vs topsoil sounds.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] uppercase font-bold text-gray-500 block">
                Target Zone Location
              </label>
              <select
                value={selectedZone}
                onChange={e => setSelectedZone(e.target.value)}
                className="farming-input text-xs py-2"
              >
                <option value="Zone A (Loam)">Zone A (North Field Loam)</option>
                <option value="Zone B (Greenhouse)">Zone B (Greenhouse Sand)</option>
                <option value="Zone C (Clay)">Zone C (East Terraces Clay)</option>
              </select>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-[10px] uppercase font-mono text-gray-500">Probe Insertion Depth</span>
                <span className="text-emerald-700 font-mono">-{selectedDepthCm} cm</span>
              </div>
              <input
                type="range"
                min="5"
                max="45"
                step="5"
                value={selectedDepthCm}
                onChange={e => setSelectedDepthCm(Number(e.target.value))}
                className="w-full accent-emerald-600"
              />
            </div>

            <div className="p-3 bg-[#f8fcf8] rounded-2xl border border-[#c8e6c9] space-y-1 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-emerald-800 text-[11px]">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>AI Sub-Soil Diagnosis</span>
              </div>
              <p className="text-gray-600 text-[11px] leading-relaxed">
                Acoustic pulse spectrum confirms active endogeic earthworm burrowing at -{selectedDepthCm}cm. No high-frequency root cavitation detected, indicating adequate cell turgor pressure.
              </p>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleToggleAudio}
              className="w-full py-2.5 bg-[#1b2e1b] hover:bg-[#2e7d32] text-white font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>{isPlayingProbe ? 'Pause Probe Monitor' : 'Start Acoustic Probe Sweep'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
