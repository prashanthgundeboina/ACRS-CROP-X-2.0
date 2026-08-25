import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Calculator,
  Calendar,
  PhoneCall,
  Sparkles,
  AlertTriangle,
  Package,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { StatusBadge } from '../ui/StatusBadge';
import { FarmerButton } from '../ui/FarmerButton';
import { SoilData } from '../../types';

interface FertilizerCalculatorRedesignProps {
  soilData: SoilData;
  onOpenCallModal: () => void;
}

export const FertilizerCalculatorRedesign: React.FC<FertilizerCalculatorRedesignProps> = ({
  soilData,
  onOpenCallModal,
}) => {
  const [fieldSizeAcres, setFieldSizeAcres] = useState<number>(2.5);
  const [cropType, setCropType] = useState<string>('Rice');
  const [targetYield, setTargetYield] = useState<number>(5.0);

  // Exact bag calculations based on NPK deficits & field size
  const nitrogenDeficit = Math.max(0, 120 - (soilData.nitrogen || 40));
  const phosphorusDeficit = Math.max(0, 60 - (soilData.phosphorus || 20));
  const potassiumDeficit = Math.max(0, 60 - (soilData.potassium || 25));

  const ureaBags = Math.round(((nitrogenDeficit * 2.17 * fieldSizeAcres) / 50) * 10) / 10 || (1.5 * fieldSizeAcres);
  const dapBags = Math.round(((phosphorusDeficit * 2.17 * fieldSizeAcres) / 50) * 10) / 10 || (1.0 * fieldSizeAcres);
  const mopBags = Math.round(((potassiumDeficit * 1.67 * fieldSizeAcres) / 50) * 10) / 10 || (0.5 * fieldSizeAcres);

  return (
    <div className="space-y-6 my-6">
      <GlassCard padding="lg" className="border-2 border-[#c8e6c9]">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-100 text-[#2e7d32] rounded-2xl">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-2xl text-[#1b2e1b]">
                🧪 Precision Fertilizer Bag Calculator
              </h2>
              <p className="text-xs text-gray-600 font-sans">
                Calculate exact bag quantities and split dosage schedule to maximize crop growth.
              </p>
            </div>
          </div>

          <FarmerButton
            onClick={onOpenCallModal}
            variant="voice"
            size="sm"
            icon={PhoneCall}
          >
            🎙️ Explain Fertilizer Plan
          </FarmerButton>
        </div>

        {/* Input Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700">Select Crop</label>
            <select
              value={cropType}
              onChange={(e) => setCropType(e.target.value)}
              className="w-full p-2.5 bg-[#f8fcf8] border border-[#c8e6c9] rounded-xl text-xs font-bold text-[#1b2e1b] outline-none"
            >
              <option value="Rice">🌾 Rice (Paddy)</option>
              <option value="Wheat">🌾 Wheat</option>
              <option value="Cotton">🌱 Cotton</option>
              <option value="Maize">🌽 Maize (Corn)</option>
              <option value="Sugarcane">🎍 Sugarcane</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700">Field Size (Acres)</label>
            <input
              type="number"
              step="0.5"
              min="0.5"
              value={fieldSizeAcres}
              onChange={(e) => setFieldSizeAcres(parseFloat(e.target.value) || 1)}
              className="w-full p-2.5 bg-[#f8fcf8] border border-[#c8e6c9] rounded-xl text-xs font-bold text-[#1b2e1b] outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700">Target Yield (Tons/Acre)</label>
            <input
              type="number"
              step="0.5"
              min="1"
              value={targetYield}
              onChange={(e) => setTargetYield(parseFloat(e.target.value) || 4)}
              className="w-full p-2.5 bg-[#f8fcf8] border border-[#c8e6c9] rounded-xl text-xs font-bold text-[#1b2e1b] outline-none"
            />
          </div>
        </div>

        {/* Calculated Bag Quantities */}
        <div className="mt-6 p-6 bg-gradient-to-br from-[#1b2e1b] to-[#142214] rounded-3xl text-white space-y-4 shadow-md">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <span className="text-xs font-mono font-bold uppercase text-amber-300 flex items-center gap-1">
              <Package className="w-4 h-4" /> Required Commercial Bags ({fieldSizeAcres} Acres)
            </span>
            <span className="text-[10px] text-emerald-200">50kg Standard Bags</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-white/10 rounded-2xl border border-white/10 text-center space-y-1">
              <span className="text-xs text-emerald-200 uppercase font-mono font-bold">Urea (46% N)</span>
              <div className="text-3xl font-extrabold text-amber-300 font-mono">{ureaBags} <span className="text-xs text-white">Bags</span></div>
            </div>

            <div className="p-4 bg-white/10 rounded-2xl border border-white/10 text-center space-y-1">
              <span className="text-xs text-emerald-200 uppercase font-mono font-bold">DAP (18-46-0)</span>
              <div className="text-3xl font-extrabold text-emerald-300 font-mono">{dapBags} <span className="text-xs text-white">Bags</span></div>
            </div>

            <div className="p-4 bg-white/10 rounded-2xl border border-white/10 text-center space-y-1">
              <span className="text-xs text-emerald-200 uppercase font-mono font-bold">MOP (60% K2O)</span>
              <div className="text-3xl font-extrabold text-cyan-300 font-mono">{mopBags} <span className="text-xs text-white">Bags</span></div>
            </div>
          </div>

          {/* Split Schedule Timeline */}
          <div className="pt-4 border-t border-white/10 space-y-3">
            <h4 className="text-xs font-mono font-bold uppercase text-amber-300 flex items-center gap-1.5">
              <Calendar className="w-4 h-4" /> Split Application Schedule
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-white/10 rounded-xl space-y-1">
                <span className="font-mono font-bold text-emerald-300 block text-[10px]">DAY 1 • BASAL DOSAGE</span>
                <p className="text-white font-medium">Apply {dapBags} Bags DAP + {Math.round(ureaBags * 0.3 * 10) / 10} Bags Urea before sowing.</p>
              </div>

              <div className="p-3 bg-white/10 rounded-xl space-y-1">
                <span className="font-mono font-bold text-amber-300 block text-[10px]">DAY 25 • FIRST TOP DRESSING</span>
                <p className="text-white font-medium">Broadcast {Math.round(ureaBags * 0.35 * 10) / 10} Bags Urea during early tillering stage.</p>
              </div>

              <div className="p-3 bg-white/10 rounded-xl space-y-1">
                <span className="font-mono font-bold text-cyan-300 block text-[10px]">DAY 45 • PANICLE INITIATION</span>
                <p className="text-white font-medium">Broadcast remaining {Math.round(ureaBags * 0.35 * 10) / 10} Bags Urea + {mopBags} Bags MOP.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Warning Tips */}
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs font-medium text-amber-950 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
          <span><strong>Farmer Caution:</strong> Do not apply top-dressing urea right before heavy rainfall to avoid fertilizer runoff. Incorporate 2 inches deep.</span>
        </div>
      </GlassCard>
    </div>
  );
};
