import React, { useState } from 'react';
import { SoilData } from '../types';
import { Radio, Eye, Waves, Layers, Globe, Zap } from 'lucide-react';

interface Props {
  soilData: SoilData;
}

export const SatNdviPanel: React.FC<Props> = ({ soilData }) => {
  const [bandMode, setBandMode] = useState<'ndvi' | 'ndwi' | 'sar'>('ndvi');

  // Compute proxy indices based on soil moisture and organic matter
  const ndviVal = parseFloat((0.45 + (soilData.soil_moisture / 100) * 0.35 + (soilData.nitrogen / 200) * 0.15).toFixed(2));
  const ndwiVal = parseFloat(((soilData.soil_moisture / 100) * 0.85).toFixed(2));
  const sarDepthMeters = (0.2 + (soilData.soil_moisture / 100) * 0.6).toFixed(2);

  return (
    <div className="bg-[#1b2e1b] text-white p-6 md:p-8 rounded-[2.5rem] border border-[#2e7d32]/50 shadow-xl space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#2e7d32]/40 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[#4CAF50]">
            <Radio className="w-5 h-5 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#81c784]">Sentinel-2 Multispectral Telemetry</span>
          </div>
          <h3 className="font-serif text-2xl font-bold text-white">Satellite Canopy & Moisture Proxy</h3>
          <p className="text-xs text-[#a5d6a7]">Real-time remote sensing proxies for canopy chlorophyll absorptance and root zone dielectric permittivity.</p>
        </div>

        {/* Band Mode Buttons */}
        <div className="flex items-center gap-1.5 bg-[#122012] p-1.5 rounded-2xl border border-[#2e7d32]/40">
          <button
            onClick={() => setBandMode('ndvi')}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
              bandMode === 'ndvi' ? 'bg-[#4CAF50] text-white shadow-sm' : 'text-[#a5d6a7] hover:bg-[#1b2e1b]'
            }`}
          >
            NDVI (Vegetation)
          </button>
          <button
            onClick={() => setBandMode('ndwi')}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
              bandMode === 'ndwi' ? 'bg-[#4CAF50] text-white shadow-sm' : 'text-[#a5d6a7] hover:bg-[#1b2e1b]'
            }`}
          >
            NDWI (Water Index)
          </button>
          <button
            onClick={() => setBandMode('sar')}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all ${
              bandMode === 'sar' ? 'bg-[#4CAF50] text-white shadow-sm' : 'text-[#a5d6a7] hover:bg-[#1b2e1b]'
            }`}
          >
            SAR Radar (Moisture)
          </button>
        </div>
      </div>

      {/* Main Satellite Telemetry Display */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-[#122012] rounded-3xl border border-[#2e7d32]/40 space-y-3">
          <div className="flex justify-between items-center text-xs text-[#a5d6a7]">
            <span>Vegetation Index</span>
            <Eye className="w-4 h-4 text-[#4CAF50]" />
          </div>
          <div className="text-3xl font-black font-mono text-white">{ndviVal}</div>
          <div className="w-full bg-[#1b2e1b] h-2 rounded-full overflow-hidden">
            <div className="bg-[#4CAF50] h-full rounded-full transition-all duration-700" style={{ width: `${ndviVal * 100}%` }} />
          </div>
          <p className="text-[11px] text-[#81c784]">
            {ndviVal >= 0.7 ? 'Dense Healthy Canopy Chlorophyll' : ndviVal >= 0.4 ? 'Moderate Biomass Density' : 'Sparse Crop Canopy'}
          </p>
        </div>

        <div className="p-6 bg-[#122012] rounded-3xl border border-[#2e7d32]/40 space-y-3">
          <div className="flex justify-between items-center text-xs text-[#a5d6a7]">
            <span>Normalized Water Index</span>
            <Waves className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-3xl font-black font-mono text-white">{ndwiVal}</div>
          <div className="w-full bg-[#1b2e1b] h-2 rounded-full overflow-hidden">
            <div className="bg-sky-400 h-full rounded-full transition-all duration-700" style={{ width: `${ndwiVal * 100}%` }} />
          </div>
          <p className="text-[11px] text-sky-300">
            Root zone hydration level at {soilData.soil_moisture}% moisture capacity.
          </p>
        </div>

        <div className="p-6 bg-[#122012] rounded-3xl border border-[#2e7d32]/40 space-y-3">
          <div className="flex justify-between items-center text-xs text-[#a5d6a7]">
            <span>Subsurface Radar Penetration</span>
            <Layers className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black font-mono text-white">{sarDepthMeters} <span className="text-xs font-normal text-gray-400">meters</span></div>
          <p className="text-[11px] text-amber-300">
            Synthetic Aperture Radar (C-band) dielectric sensor reading.
          </p>
        </div>
      </div>
    </div>
  );
};
