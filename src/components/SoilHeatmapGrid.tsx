import React, { useState, useMemo } from 'react';
import { SoilData } from '../types';
import { Grid, Layers, Droplets, Zap, Sparkles, RefreshCw, AlertCircle, CheckCircle, Sliders } from 'lucide-react';

interface Props {
  baselineData: SoilData;
  onUpdateBaseline?: (updated: SoilData) => void;
}

export interface ZoneData {
  id: string; // e.g., "A1", "B2"
  row: number;
  col: number;
  nitrogen: number;
  phosphorus: number;
  potassium: number;
  moisture: number;
  ph: number;
  organicMatter: number;
  waterTableDepth: number; // in meters below surface
  status: 'optimal' | 'deficit' | 'excess';
}

type LayerType = 'nitrogen' | 'phosphorus' | 'potassium' | 'moisture' | 'ph' | 'waterTable';

export const SoilHeatmapGrid: React.FC<Props> = ({ baselineData }) => {
  // Multi-layer toggle support via checkboxes
  const [selectedLayers, setSelectedLayers] = useState<LayerType[]>([
    'nitrogen',
    'moisture',
    'waterTable'
  ]);
  const [selectedZone, setSelectedZone] = useState<ZoneData | null>(null);
  const [plotVariance, setPlotVariance] = useState<number>(15); // % variance across plot
  const [treatmentLog, setTreatmentLog] = useState<string[]>([]);

  const toggleLayer = (layer: LayerType) => {
    setSelectedLayers((prev) => {
      if (prev.includes(layer)) {
        if (prev.length === 1) return prev; // Keep at least one layer selected
        return prev.filter((l) => l !== layer);
      } else {
        return [...prev, layer];
      }
    });
  };

  // Generate 4x4 matrix of farm plot zones (A1 to D4) based on baseline and variance
  const zones: ZoneData[] = useMemo(() => {
    const list: ZoneData[] = [];
    const rows = ['A', 'B', 'C', 'D'];
    const cols = [1, 2, 3, 4];

    // Seeded random variance generator
    let seed = 42;
    const pseudoRandom = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    rows.forEach((r, rIdx) => {
      cols.forEach((c, cIdx) => {
        const id = `${r}${c}`;
        const offsetN = (pseudoRandom() - 0.5) * 2 * (plotVariance / 100) * baselineData.nitrogen;
        const offsetP = (pseudoRandom() - 0.5) * 2 * (plotVariance / 100) * baselineData.phosphorus;
        const offsetK = (pseudoRandom() - 0.5) * 2 * (plotVariance / 100) * baselineData.potassium;
        const offsetM = (pseudoRandom() - 0.5) * 2 * (plotVariance / 100) * baselineData.soil_moisture;
        const offsetPh = (pseudoRandom() - 0.5) * 0.8;

        const valN = Math.max(10, Math.min(180, Math.round(baselineData.nitrogen + offsetN)));
        const valP = Math.max(5, Math.min(120, Math.round(baselineData.phosphorus + offsetP)));
        const valK = Math.max(10, Math.min(150, Math.round(baselineData.potassium + offsetK)));
        const valM = Math.max(5, Math.min(60, parseFloat((baselineData.soil_moisture + offsetM).toFixed(1))));
        const valPh = Math.max(4.5, Math.min(8.5, parseFloat((baselineData.ph + offsetPh).toFixed(1))));

        // Water Table Depth inverse to moisture (shallow water table = higher soil moisture)
        const wtDepth = parseFloat(Math.max(1.2, Math.min(8.5, 6.0 - (valM / 100) * 5.0 + (pseudoRandom() - 0.5) * 0.8)).toFixed(1));

        let status: 'optimal' | 'deficit' | 'excess' = 'optimal';
        if (valN < 35 || valP < 20 || valK < 25) status = 'deficit';
        else if (valN > 140 || valP > 90 || valPh > 7.8) status = 'excess';

        list.push({
          id,
          row: rIdx,
          col: cIdx,
          nitrogen: valN,
          phosphorus: valP,
          potassium: valK,
          moisture: valM,
          ph: valPh,
          organicMatter: baselineData.organic_matter,
          waterTableDepth: wtDepth,
          status
        });
      });
    });

    return list;
  }, [baselineData, plotVariance]);

  // Color generator for heatmap cell primary layer
  const primaryMetric = selectedLayers[0] || 'nitrogen';

  const getCellStyle = (zone: ZoneData) => {
    if (primaryMetric === 'nitrogen') {
      const v = zone.nitrogen;
      if (v < 35) return { bg: 'bg-amber-100 text-amber-900 border-amber-300', fill: '#fef3c7', bar: '#f59e0b' };
      if (v < 90) return { bg: 'bg-emerald-100 text-emerald-900 border-emerald-300', fill: '#d1fae5', bar: '#10b981' };
      return { bg: 'bg-teal-200 text-teal-950 border-teal-400', fill: '#99f6e4', bar: '#0d9488' };
    }
    if (primaryMetric === 'phosphorus') {
      const v = zone.phosphorus;
      if (v < 20) return { bg: 'bg-orange-100 text-orange-900 border-orange-300', fill: '#ffedd5', bar: '#f97316' };
      if (v < 60) return { bg: 'bg-lime-100 text-lime-900 border-lime-300', fill: '#ecfccb', bar: '#84cc16' };
      return { bg: 'bg-emerald-200 text-emerald-950 border-emerald-400', fill: '#a7f3d0', bar: '#059669' };
    }
    if (primaryMetric === 'potassium') {
      const v = zone.potassium;
      if (v < 25) return { bg: 'bg-amber-100 text-amber-900 border-amber-300', fill: '#fef3c7', bar: '#d97706' };
      if (v < 75) return { bg: 'bg-green-100 text-green-900 border-green-300', fill: '#dcfce7', bar: '#22c55e' };
      return { bg: 'bg-emerald-200 text-emerald-950 border-emerald-400', fill: '#a7f3d0', bar: '#10b981' };
    }
    if (primaryMetric === 'moisture') {
      const v = zone.moisture;
      if (v < 15) return { bg: 'bg-amber-100 text-amber-900 border-amber-300', fill: '#fef3c7', bar: '#f59e0b' };
      if (v < 35) return { bg: 'bg-sky-100 text-sky-900 border-sky-300', fill: '#e0f2fe', bar: '#0284c7' };
      return { bg: 'bg-blue-200 text-blue-950 border-blue-400', fill: '#bfdbfe', bar: '#2563eb' };
    }
    if (primaryMetric === 'waterTable') {
      const v = zone.waterTableDepth;
      return { bg: 'bg-cyan-100 text-cyan-950 border-cyan-300', fill: '#cff4fc', bar: '#06b6d4' };
    }
    // pH
    const v = zone.ph;
    if (v < 5.8) return { bg: 'bg-rose-100 text-rose-900 border-rose-300', fill: '#ffe4e6', bar: '#f43f5e' };
    if (v <= 7.2) return { bg: 'bg-emerald-100 text-emerald-900 border-emerald-300', fill: '#d1fae5', bar: '#10b981' };
    return { bg: 'bg-purple-100 text-purple-900 border-purple-300', fill: '#f3e8ff', bar: '#a855f7' };
  };

  const getMetricValue = (z: ZoneData) => {
    switch (primaryMetric) {
      case 'nitrogen': return `${z.nitrogen} ppm`;
      case 'phosphorus': return `${z.phosphorus} ppm`;
      case 'potassium': return `${z.potassium} ppm`;
      case 'moisture': return `${z.moisture}%`;
      case 'ph': return `pH ${z.ph}`;
      case 'waterTable': return `${z.waterTableDepth}m`;
    }
  };

  const applyZoneTreatment = (zoneId: string, treatment: string) => {
    const msg = `Applied ${treatment} to Plot Zone ${zoneId} at ${new Date().toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}`;
    setTreatmentLog(prev => [msg, ...prev.slice(0, 4)]);
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-[#c8e6c9] shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[#4CAF50]">
            <Grid className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#2e7d32]">Spatial Precision Agriculture</span>
          </div>
          <h3 className="font-serif text-2xl font-bold text-[#1b2e1b]">Plot Zone Heatmap Matrix</h3>
          <p className="text-xs text-[#667e66]">Interactive 4x4 spatial grid displaying real-time soil property variances across sector zones A1 to D4.</p>
        </div>

        {/* Multi-Layer Checkbox Controls */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-[#1b2e1b] flex items-center gap-1">
            <Layers className="w-4 h-4 text-[#4CAF50]" /> Active Data Layers:
          </span>

          <div className="flex flex-wrap gap-2 bg-[#f8fcf8] p-2 rounded-2xl border border-[#c8e6c9]">
            {[
              { id: 'nitrogen', label: 'Nitrogen (N)', color: 'emerald' },
              { id: 'phosphorus', label: 'Phosphorus (P)', color: 'orange' },
              { id: 'potassium', label: 'Potassium (K)', color: 'amber' },
              { id: 'moisture', label: 'Moisture (%)', color: 'sky' },
              { id: 'ph', label: 'pH Acidity', color: 'purple' },
              { id: 'waterTable', label: 'Water Table (m)', color: 'cyan' },
            ].map((layer) => {
              const isChecked = selectedLayers.includes(layer.id as LayerType);
              return (
                <label
                  key={layer.id}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all border select-none ${
                    isChecked
                      ? 'bg-[#1b2e1b] text-white border-[#4CAF50] shadow-sm'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-[#e8f5e9]'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleLayer(layer.id as LayerType)}
                    className="w-3.5 h-3.5 accent-[#4CAF50] rounded cursor-pointer"
                  />
                  <span>{layer.label}</span>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      {/* Variance Slider & Active Layer Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#f8fcf8] p-4 rounded-2xl border border-[#c8e6c9]/60">
        <div className="flex items-center gap-3">
          <Sliders className="w-4 h-4 text-[#4CAF50]" />
          <span className="text-xs font-bold text-gray-700">Simulate Spatial Variance:</span>
          <input
            type="range"
            min="0"
            max="40"
            value={plotVariance}
            onChange={(e) => setPlotVariance(Number(e.target.value))}
            className="w-32 accent-[#4CAF50]"
          />
          <span className="text-xs font-mono font-bold text-[#2e7d32]">{plotVariance}%</span>
        </div>

        {/* Active Layers Legend Summary */}
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-600 flex-wrap">
          <span>Active Layers Overlay:</span>
          {selectedLayers.map((l) => (
            <span
              key={l}
              className="inline-block px-2 py-0.5 rounded bg-[#e8f5e9] text-[#1b2e1b] border border-[#c8e6c9] font-mono capitalize"
            >
              ✓ {l === 'waterTable' ? 'Water Table Depth' : l}
            </span>
          ))}
        </div>
      </div>

      {/* 4x4 Grid Matrix Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-[#1b2e1b] rounded-3xl border border-[#2e7d32]/40 shadow-inner">
          {zones.map((zone) => {
            const isSelected = selectedZone?.id === zone.id;

            return (
              <button
                key={zone.id}
                onClick={() => setSelectedZone(zone)}
                className={`p-3 rounded-2xl border transition-all duration-300 text-left relative flex flex-col justify-between min-h-[140px] bg-emerald-950/80 border-[#2e7d32]/60 text-white hover:border-[#4CAF50] ${
                  isSelected ? 'ring-4 ring-[#4CAF50] shadow-xl scale-105 z-10' : 'hover:scale-[1.02]'
                }`}
              >
                <div className="flex justify-between items-start w-full">
                  <span className="text-xs font-black font-mono tracking-wider text-[#a5d6a7] bg-black/40 px-1.5 py-0.5 rounded border border-white/10">
                    {zone.id}
                  </span>
                  {zone.status === 'deficit' && <AlertCircle className="w-3.5 h-3.5 text-amber-400" />}
                  {zone.status === 'optimal' && <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />}
                </div>

                <div className="space-y-1 my-1">
                  {selectedLayers.includes('nitrogen') && (
                    <div className="text-[11px] font-bold text-emerald-300 font-mono flex justify-between">
                      <span>N:</span> <span>{zone.nitrogen} ppm</span>
                    </div>
                  )}
                  {selectedLayers.includes('phosphorus') && (
                    <div className="text-[11px] font-bold text-orange-300 font-mono flex justify-between">
                      <span>P:</span> <span>{zone.phosphorus} ppm</span>
                    </div>
                  )}
                  {selectedLayers.includes('potassium') && (
                    <div className="text-[11px] font-bold text-amber-300 font-mono flex justify-between">
                      <span>K:</span> <span>{zone.potassium} ppm</span>
                    </div>
                  )}
                  {selectedLayers.includes('moisture') && (
                    <div className="text-[11px] font-bold text-sky-300 font-mono flex justify-between">
                      <span>Mois:</span> <span>{zone.moisture}%</span>
                    </div>
                  )}
                  {selectedLayers.includes('ph') && (
                    <div className="text-[11px] font-bold text-purple-300 font-mono flex justify-between">
                      <span>pH:</span> <span>{zone.ph}</span>
                    </div>
                  )}
                  {selectedLayers.includes('waterTable') && (
                    <div className="text-[10px] font-bold text-cyan-200 bg-cyan-900/60 px-1.5 py-0.5 rounded border border-cyan-500/40 font-mono flex justify-between mt-1">
                      <span>🌊 WT:</span> <span>{zone.waterTableDepth}m</span>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Zone Telemetry Drawer / Inspector */}
        <div className="bg-[#f8fcf8] p-6 rounded-3xl border border-[#c8e6c9] flex flex-col justify-between space-y-4">
          {selectedZone ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center border-b border-[#c8e6c9] pb-3">
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase font-black tracking-widest text-[#4CAF50]">Sector Inspector</span>
                  <h4 className="font-serif text-xl font-bold text-[#1b2e1b]">Plot Zone {selectedZone.id}</h4>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                  selectedZone.status === 'deficit' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {selectedZone.status}
                </span>
              </div>

              {/* Detailed Zone Telemetry */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-white rounded-xl border border-[#c8e6c9]">
                  <span className="text-[9px] uppercase font-bold text-gray-500">Nitrogen</span>
                  <div className="text-sm font-black text-[#2e7d32]">{selectedZone.nitrogen} ppm</div>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-[#c8e6c9]">
                  <span className="text-[9px] uppercase font-bold text-gray-500">Phosphorus</span>
                  <div className="text-sm font-black text-[#2e7d32]">{selectedZone.phosphorus} ppm</div>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-[#c8e6c9]">
                  <span className="text-[9px] uppercase font-bold text-gray-500">Potassium</span>
                  <div className="text-sm font-black text-[#2e7d32]">{selectedZone.potassium} ppm</div>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-[#c8e6c9]">
                  <span className="text-[9px] uppercase font-bold text-gray-500">Soil Moisture</span>
                  <div className="text-sm font-black text-[#2e7d32]">{selectedZone.moisture}%</div>
                </div>
                <div className="p-2.5 bg-[#e0f7fa] rounded-xl border border-cyan-300">
                  <span className="text-[9px] uppercase font-bold text-cyan-900">Water Table Depth</span>
                  <div className="text-sm font-black text-cyan-950 font-mono">🌊 {selectedZone.waterTableDepth} m</div>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-[#c8e6c9]">
                  <span className="text-[9px] uppercase font-bold text-gray-500">Acidity (pH)</span>
                  <div className="text-sm font-black text-[#2e7d32]">{selectedZone.ph}</div>
                </div>
                <div className="p-2.5 bg-white rounded-xl border border-[#c8e6c9]">
                  <span className="text-[9px] uppercase font-bold text-gray-500">Organic Matter</span>
                  <div className="text-sm font-black text-[#2e7d32]">{selectedZone.organicMatter}%</div>
                </div>
              </div>

              {/* Micro Treatment Actions */}
              <div className="space-y-2 pt-2">
                <span className="text-[10px] font-black uppercase text-gray-500">Targeted Zone Micro-Treatment</span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => applyZoneTreatment(selectedZone.id, 'Urea Drip (+15 N)')}
                    className="py-2 px-3 bg-[#4CAF50] text-white text-[10px] font-bold rounded-xl hover:bg-[#2e7d32] transition-colors"
                  >
                    + Inject N
                  </button>
                  <button
                    onClick={() => applyZoneTreatment(selectedZone.id, 'DAP Treatment (+10 P)')}
                    className="py-2 px-3 bg-emerald-700 text-white text-[10px] font-bold rounded-xl hover:bg-emerald-800 transition-colors"
                  >
                    + Inject P
                  </button>
                  <button
                    onClick={() => applyZoneTreatment(selectedZone.id, 'Micro-Irrigation (+10% Water)')}
                    className="py-2 px-3 bg-sky-600 text-white text-[10px] font-bold rounded-xl hover:bg-sky-700 transition-colors"
                  >
                    + Irrigates
                  </button>
                  <button
                    onClick={() => applyZoneTreatment(selectedZone.id, 'Lime Amendment (Neutralize pH)')}
                    className="py-2 px-3 bg-purple-600 text-white text-[10px] font-bold rounded-xl hover:bg-purple-700 transition-colors"
                  >
                    Adjust pH
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-12 space-y-3 text-gray-400">
              <Layers className="w-10 h-10 stroke-1" />
              <p className="text-xs">Click any sector zone in the 4x4 grid matrix to view precision telemetry and apply micro-treatments.</p>
            </div>
          )}

          {/* Treatment Log Feed */}
          {treatmentLog.length > 0 && (
            <div className="pt-3 border-t border-[#c8e6c9] space-y-1 text-[10px] font-medium text-[#2e7d32]">
              <span className="font-bold text-gray-600 uppercase">Recent Treatments:</span>
              {treatmentLog.map((log, i) => (
                <p key={i} className="line-clamp-1 italic">✓ {log}</p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
