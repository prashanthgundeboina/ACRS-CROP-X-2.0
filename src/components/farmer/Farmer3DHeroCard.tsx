import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  Droplets,
  CloudSun,
  ShieldCheck,
  Zap,
  Activity,
  Layers,
  Leaf,
  Compass,
  Cpu
} from 'lucide-react';
import { LivePresencePulseBadge } from '../common/LivePresencePulseBadge';

interface Farmer3DHeroCardProps {
  farmerName: string;
  farmName: string;
  farmZone: string;
  crop: string;
  soilMoisture: string;
  temperature: string;
  ndviScore: number;
  isOnline: boolean;
  onLaunchScanner?: () => void;
  onLaunchAdviserCall?: () => void;
  className?: string;
}

export const Farmer3DHeroCard: React.FC<Farmer3DHeroCardProps> = ({
  farmerName,
  farmName,
  farmZone,
  crop,
  soilMoisture,
  temperature,
  ndviScore = 0.84,
  isOnline,
  onLaunchScanner,
  onLaunchAdviserCall,
  className = '',
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotX = -((y - centerY) / centerY) * 8; // max 8 deg
    const rotY = ((x - centerX) / centerX) * 8;

    setRotateX(rotX);
    setRotateY(rotY);
    setGlarePos({
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100,
    });
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
  };

  return (
    <div className={`perspective-1000 ${className}`}>
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          transition: 'transform 0.15s ease-out',
        }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-emerald-950/80 to-slate-950 border border-emerald-500/30 p-6 sm:p-8 shadow-2xl text-white transform-style-3d float-3d-card"
      >
        {/* Specular Glare Reflection */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle 320px at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,0.15), transparent 70%)`,
          }}
        />

        {/* Ambient Neon Atmosphere Orbs */}
        <div className="absolute -top-16 -right-16 w-60 h-60 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-60 h-60 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left Column: Farmer & Farm Info */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                Agronomic Command Center
              </span>
              <LivePresencePulseBadge
                status={isOnline ? 'online' : 'offline'}
                size="sm"
                showLabel
                labelText={isOnline ? 'Live Field Node' : 'Offline Node'}
              />
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2">
                <span>{farmerName}</span>
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
              </h2>
              <p className="text-sm text-slate-300 font-medium mt-1">
                📍 {farmName} • <span className="text-emerald-300">{farmZone}</span>
              </p>
            </div>

            {/* Live 3D Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-2.5 pt-2">
              <div className="p-3 rounded-2xl bg-slate-900/80 border border-white/10 shadow-lg backdrop-blur-sm transform-style-3d hover:translate-z-4 transition-transform">
                <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold">
                  <span>Soil Moisture</span>
                  <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <div className="text-sm sm:text-base font-black text-cyan-300 mt-1">{soilMoisture}</div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-900/80 border border-white/10 shadow-lg backdrop-blur-sm transform-style-3d hover:translate-z-4 transition-transform">
                <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold">
                  <span>Crop Health</span>
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="text-sm sm:text-base font-black text-emerald-300 mt-1">
                  {(ndviScore * 100).toFixed(0)}% NDVI
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-900/80 border border-white/10 shadow-lg backdrop-blur-sm transform-style-3d hover:translate-z-4 transition-transform">
                <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold">
                  <span>Weather</span>
                  <CloudSun className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div className="text-sm sm:text-base font-black text-amber-300 mt-1">{temperature}</div>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Holographic Field Orb & Action Portal */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
            <div className="relative w-44 h-44 sm:w-48 sm:h-48 flex items-center justify-center">
              {/* Outer Pulsing Glow Halo */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-emerald-500/30 to-cyan-500/20 blur-xl animate-pulse" />

              {/* Orbiting 3D Ring 1 */}
              <div
                className="absolute inset-2 rounded-full border-2 border-dashed border-emerald-400/40 animate-spin"
                style={{ animationDuration: '20s' }}
              />

              {/* Orbiting 3D Ring 2 */}
              <div
                className="absolute inset-5 rounded-full border border-cyan-400/50 animate-spin"
                style={{ animationDirection: 'reverse', animationDuration: '15s' }}
              />

              {/* Central Core Orb */}
              <div className="relative w-28 h-28 rounded-full bg-gradient-to-tr from-emerald-700 via-teal-600 to-emerald-400 p-1 shadow-2xl flex flex-col items-center justify-center text-center border-2 border-emerald-300/60">
                <Cpu className="w-6 h-6 text-white mb-1 animate-bounce" />
                <span className="text-[10px] uppercase tracking-widest text-emerald-100 font-extrabold">CroperX AI</span>
                <span className="text-xs font-black text-white">{crop.split(' ')[0]}</span>
              </div>
            </div>

            <div className="text-center mt-2">
              <span className="text-xs font-semibold text-emerald-300 flex items-center justify-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                Digital Twin Synchronized
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
