import React, { useState } from 'react';
import { SoilData } from '../types';
import { calculateFertilizerRequirements, CROP_TARGETS } from '../services/fertilizerService';
import { Calculator, DollarSign, Sprout, ArrowRight, ShieldAlert, Check } from 'lucide-react';

interface Props {
  soilData: SoilData;
}

export const FertilizerCalculator: React.FC<Props> = ({ soilData }) => {
  const [selectedCrop, setSelectedCrop] = useState<string>('Rice');
  const [plotHectares, setPlotHectares] = useState<number>(1.0);

  const reqs = calculateFertilizerRequirements(
    selectedCrop,
    soilData.nitrogen,
    soilData.phosphorus,
    soilData.potassium,
    soilData.ph,
    plotHectares
  );

  const target = CROP_TARGETS[selectedCrop];

  return (
    <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-[#c8e6c9] shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#c8e6c9] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[#4CAF50]">
            <Calculator className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#2e7d32]">Agronomic Soil Remediation</span>
          </div>
          <h3 className="font-serif text-2xl font-bold text-[#1b2e1b]">Smart NPK Fertilizer Calculator</h3>
          <p className="text-xs text-[#667e66]">Exact dosage requirement calculation of Urea, DAP, MOP, and pH Lime to reach target nutrient optimums.</p>
        </div>

        {/* Crop & Hectares Selector */}
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <label className="text-[10px] uppercase font-bold text-gray-500 block">Target Crop</label>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              className="bg-[#f8fcf8] border border-[#c8e6c9] font-bold text-xs rounded-xl px-3 py-2 text-[#1b2e1b] outline-none"
            >
              {Object.keys(CROP_TARGETS).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-gray-500 block">Plot Size (ha)</label>
            <input
              type="number"
              step="0.5"
              min="0.1"
              max="100"
              value={plotHectares}
              onChange={(e) => setPlotHectares(Math.max(0.1, parseFloat(e.target.value) || 1))}
              className="w-20 bg-[#f8fcf8] border border-[#c8e6c9] font-bold text-xs rounded-xl px-3 py-2 text-[#1b2e1b] outline-none"
            />
          </div>
        </div>
      </div>

      {/* Target vs Current Deficit Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-[#f8fcf8] rounded-2xl border border-[#c8e6c9] space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black uppercase text-gray-500">Nitrogen Deficit</span>
            <span className="text-xs font-bold text-[#2e7d32]">Target: {target.targetN} ppm</span>
          </div>
          <div className="text-2xl font-black font-mono text-[#1b2e1b]">{reqs.nDeficit} <span className="text-xs font-normal text-gray-500">ppm needed</span></div>
          <p className="text-[10px] text-gray-500">Current N: {soilData.nitrogen} ppm</p>
        </div>

        <div className="p-4 bg-[#f8fcf8] rounded-2xl border border-[#c8e6c9] space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black uppercase text-gray-500">Phosphorus Deficit</span>
            <span className="text-xs font-bold text-[#2e7d32]">Target: {target.targetP} ppm</span>
          </div>
          <div className="text-2xl font-black font-mono text-[#1b2e1b]">{reqs.pDeficit} <span className="text-xs font-normal text-gray-500">ppm needed</span></div>
          <p className="text-[10px] text-gray-500">Current P: {soilData.phosphorus} ppm</p>
        </div>

        <div className="p-4 bg-[#f8fcf8] rounded-2xl border border-[#c8e6c9] space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-black uppercase text-gray-500">Potassium Deficit</span>
            <span className="text-xs font-bold text-[#2e7d32]">Target: {target.targetK} ppm</span>
          </div>
          <div className="text-2xl font-black font-mono text-[#1b2e1b]">{reqs.kDeficit} <span className="text-xs font-normal text-gray-500">ppm needed</span></div>
          <p className="text-[10px] text-gray-500">Current K: {soilData.potassium} ppm</p>
        </div>
      </div>

      {/* Calculated Commercial Dosage Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-1">
          <span className="text-[10px] uppercase font-black text-emerald-800">Urea (46% N)</span>
          <div className="text-2xl font-black font-mono text-emerald-950">{reqs.ureaKgHa} <span className="text-xs font-normal">kg</span></div>
          <p className="text-[10px] text-emerald-700">Split into 3 top-dressings across vegetative stage.</p>
        </div>

        <div className="p-5 bg-blue-50 border border-blue-200 rounded-2xl space-y-1">
          <span className="text-[10px] uppercase font-black text-blue-800">DAP (18-46-0)</span>
          <div className="text-2xl font-black font-mono text-blue-950">{reqs.dapKgHa} <span className="text-xs font-normal">kg</span></div>
          <p className="text-[10px] text-blue-700">Apply basal during seedbed preparation.</p>
        </div>

        <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl space-y-1">
          <span className="text-[10px] uppercase font-black text-amber-800">MOP (60% K2O)</span>
          <div className="text-2xl font-black font-mono text-amber-950">{reqs.mopKgHa} <span className="text-xs font-normal">kg</span></div>
          <p className="text-[10px] text-amber-700">Enhances drought tolerance & grain firmness.</p>
        </div>

        <div className="p-5 bg-purple-50 border border-purple-200 rounded-2xl space-y-1">
          <span className="text-[10px] uppercase font-black text-purple-800">pH Lime / Sulfur</span>
          <div className="text-2xl font-black font-mono text-purple-950">{reqs.limeKgHa > 0 ? `${reqs.limeKgHa} kg` : reqs.sulfurKgHa > 0 ? `${reqs.sulfurKgHa} kg` : '0 kg'}</div>
          <p className="text-[10px] text-purple-700">{reqs.limeKgHa > 0 ? 'Ag Lime to elevate pH' : reqs.sulfurKgHa > 0 ? 'Elemental Sulfur to lower pH' : 'Soil pH within target window'}</p>
        </div>
      </div>

      {/* Cost Estimate Footer */}
      <div className="flex items-center justify-between p-4 bg-[#1b2e1b] text-white rounded-2xl">
        <div className="flex items-center gap-3">
          <DollarSign className="w-5 h-5 text-[#4CAF50]" />
          <div>
            <div className="text-xs font-bold text-white/80">Estimated Input Investment</div>
            <div className="text-xs text-white/50">Market price benchmark for {plotHectares} hectare(s)</div>
          </div>
        </div>
        <div className="text-2xl font-black font-mono text-[#4CAF50]">${reqs.estimatedCostUsd} USD</div>
      </div>
    </div>
  );
};
