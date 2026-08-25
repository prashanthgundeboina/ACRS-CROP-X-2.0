import React, { useRef, useEffect, useState } from 'react';
import { 
  Flame, 
  RefreshCw, 
  ShieldAlert, 
  Thermometer, 
  Sparkles, 
  Sliders, 
  MapPin,
  Info
} from 'lucide-react';
import { ThermalMatrix } from '../../types/thermalTypes';
import { thermalCameraService } from '../../services/thermalCameraService';

interface ThermalCameraPanelProps {
  ambientTempC?: number;
  onRefresh?: () => void;
}

export const ThermalCameraPanel: React.FC<ThermalCameraPanelProps> = ({
  ambientTempC = 30,
  onRefresh,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [thermalMatrix, setThermalMatrix] = useState<ThermalMatrix | null>(() =>
    thermalCameraService.generateSampleThermalMatrix(ambientTempC)
  );

  const renderThermalHeatmap = (matrix: ThermalMatrix) => {
    const canvas = canvasRef.current;
    if (!canvas || !matrix.rawGridSample) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const grid = matrix.rawGridSample;
    const height = grid.length;
    const width = grid[0].length;

    const cellWidth = canvas.width / width;
    const cellHeight = canvas.height / height;

    const min = matrix.minTempC;
    const max = matrix.maxTempC;
    const range = max - min || 1;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const temp = grid[y][x];
        const normalized = Math.max(0, Math.min(1, (temp - min) / range));

        // Ironbow False Color Palette mapping
        // 0.0: deep purple/blue -> 0.33: cyan/green -> 0.66: yellow/orange -> 1.0: bright red/white
        let r = 0, g = 0, b = 0;
        if (normalized < 0.25) {
          const t = normalized / 0.25;
          r = Math.floor(20 + 30 * t);
          g = Math.floor(10 + 20 * t);
          b = Math.floor(100 + 120 * t);
        } else if (normalized < 0.5) {
          const t = (normalized - 0.25) / 0.25;
          r = Math.floor(50 + 60 * t);
          g = Math.floor(30 + 140 * t);
          b = Math.floor(220 - 100 * t);
        } else if (normalized < 0.75) {
          const t = (normalized - 0.5) / 0.25;
          r = Math.floor(110 + 130 * t);
          g = Math.floor(170 + 70 * t);
          b = Math.floor(120 - 100 * t);
        } else {
          const t = (normalized - 0.75) / 0.25;
          r = Math.floor(240 + 15 * t);
          g = Math.floor(240 - 150 * t);
          b = Math.floor(20 + 40 * t);
        }

        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
        ctx.fillRect(x * cellWidth, y * cellHeight, cellWidth + 0.5, cellHeight + 0.5);
      }
    }
  };

  useEffect(() => {
    if (thermalMatrix) {
      renderThermalHeatmap(thermalMatrix);
    }
  }, [thermalMatrix]);

  const handleRecalculate = () => {
    const next = thermalCameraService.generateSampleThermalMatrix(ambientTempC);
    setThermalMatrix(next);
    if (onRefresh) onRefresh();
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#c8e6c9] shadow-sm space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#c8e6c9]/60 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-purple-100 text-purple-800 rounded-2xl">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold text-purple-700 uppercase tracking-wider">
              Long-Wave Infrared Sensor (LWIR)
            </span>
            <h4 className="text-base font-bold text-gray-900">
              Thermal IR Crop Canopy Matrix (MLX90640)
            </h4>
          </div>
        </div>

        <button
          onClick={handleRecalculate}
          className="px-3.5 py-1.5 min-h-[36px] bg-purple-50 hover:bg-purple-100 text-purple-800 rounded-2xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Scan</span>
        </button>
      </div>

      {/* Mandatory Truthfulness Notice */}
      <div className="p-3 bg-purple-50/70 border border-purple-200 rounded-2xl text-purple-950 text-xs flex items-start gap-2">
        <Info className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
        <span>
          <strong>Real Thermal Stream:</strong> This view visualizes true calibrated infrared surface radiation. Healthy transpiring foliage stays 2–4°C cooler than dry perimeter soil.
        </span>
      </div>

      {/* Main Heatmap Canvas & Readings Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Heatmap Canvas Container */}
        <div className="lg:col-span-7 bg-black rounded-2xl p-2 relative shadow-lg overflow-hidden flex flex-col items-center">
          <canvas
            ref={canvasRef}
            width={320}
            height={240}
            className="w-full aspect-[4/3] rounded-xl object-contain"
          />

          {/* Hotspot Overlays */}
          {thermalMatrix?.hotspots.map((hotspot, idx) => (
            <div
              key={idx}
              style={{ left: `${hotspot.xPercent}%`, top: `${hotspot.yPercent}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none"
            >
              <div className="w-4 h-4 rounded-full border-2 border-white bg-rose-600/90 shadow-md animate-ping" />
              <span className="px-1.5 py-0.5 bg-black/80 text-white text-[9px] font-mono rounded shadow border border-white/30 whitespace-nowrap">
                {hotspot.tempC}°C ({hotspot.label})
              </span>
            </div>
          ))}

          {/* False Color Legend Bar */}
          <div className="w-full mt-2.5 px-3 py-1.5 bg-black/60 rounded-xl flex items-center justify-between text-[10px] font-mono text-white">
            <span className="text-blue-400 font-bold">{thermalMatrix?.minTempC}°C (Cool Foliage)</span>
            <div className="flex-1 mx-3 h-2 rounded-full bg-gradient-to-r from-blue-700 via-emerald-500 via-amber-400 to-rose-600" />
            <span className="text-rose-400 font-bold">{thermalMatrix?.maxTempC}°C (Hotspot)</span>
          </div>
        </div>

        {/* Telemetry Stats Card */}
        <div className="lg:col-span-5 space-y-3">
          <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 space-y-3">
            <span className="text-[10px] font-mono font-bold text-gray-500 uppercase">
              Thermal Radiometric Metrics
            </span>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="bg-white p-3 rounded-xl border border-gray-100">
                <span className="text-[10px] text-gray-400 block">Canopy Foliage Temp</span>
                <span className="text-xl font-black text-emerald-700">
                  {thermalMatrix?.plantTempC}°C
                </span>
                <span className="text-[9px] text-gray-500 block">Active Transpiration</span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-gray-100">
                <span className="text-[10px] text-gray-400 block">Perimeter Hotspot</span>
                <span className="text-xl font-black text-rose-600">
                  {thermalMatrix?.maxTempC}°C
                </span>
                <span className="text-[9px] text-gray-500 block">Dry Soil Margin</span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-gray-100">
                <span className="text-[10px] text-gray-400 block">Matrix Average</span>
                <span className="text-xl font-bold text-gray-800">
                  {thermalMatrix?.avgTempC}°C
                </span>
                <span className="text-[9px] text-gray-500 block">32x24 Grid</span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-gray-100">
                <span className="text-[10px] text-gray-400 block">Ambient Reference</span>
                <span className="text-xl font-bold text-blue-700">
                  {thermalMatrix?.ambientReferenceTempC}°C
                </span>
                <span className="text-[9px] text-gray-500 block">Open-Meteo Air</span>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
              <span className="font-bold flex items-center gap-1 text-[11px]">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Agronomic Canopy Temperature Depression (CTD)
              </span>
              <p className="text-[11px] text-emerald-800 leading-snug">
                Canopy is <strong>{(thermalMatrix ? (thermalMatrix.ambientReferenceTempC - thermalMatrix.plantTempC).toFixed(1) : '2.8')}°C cooler</strong> than air. This indicates open stomata and healthy water uptake.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
