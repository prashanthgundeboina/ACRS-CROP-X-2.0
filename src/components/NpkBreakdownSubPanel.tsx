import React, { useState } from 'react';
import { motion } from 'motion/react';
import { SoilData, CropRecommendation } from '../types';
import { TestTube, Sparkles, AlertCircle, CheckCircle2, TrendingUp, Info } from 'lucide-react';

interface NpkBreakdownSubPanelProps {
  formData: SoilData;
  cropRecommendation?: CropRecommendation;
}

// Typical recommended ideal NPK levels (in ppm / mg/kg) and target ratios for major crops
const CROP_NPK_TARGETS: Record<string, { n: number; p: number; k: number; ratio: string; guide: string }> = {
  'Rice': { n: 120, p: 60, k: 60, ratio: '2 : 1 : 1', guide: 'High Nitrogen needed during tillering stage.' },
  'Maize': { n: 150, p: 75, k: 75, ratio: '2 : 1 : 1', guide: 'Heavy feeder. Nitrogen and Phosphorus essential early.' },
  'Wheat': { n: 120, p: 60, k: 40, ratio: '3 : 1.5 : 1', guide: 'Balanced N-P required for root anchorage & grain filling.' },
  'Cotton': { n: 100, p: 50, k: 50, ratio: '2 : 1 : 1', guide: 'Potassium vital for boll development and fiber length.' },
  'Coffee': { n: 180, p: 50, k: 120, ratio: '3.6 : 1 : 2.4', guide: 'High Potassium & Nitrogen required for bean filling.' },
  'Jute': { n: 80, p: 40, k: 40, ratio: '2 : 1 : 1', guide: 'Moderate NPK requirement; responds well to organic compost.' },
  'Sugarcane': { n: 200, p: 80, k: 120, ratio: '2.5 : 1 : 1.5', guide: 'Very high Nitrogen demand for maximum stalk tonnage.' },
  'Default': { n: 100, p: 50, k: 50, ratio: '2 : 1 : 1', guide: 'Standard agronomic baseline target.' }
};

export const NpkBreakdownSubPanel: React.FC<NpkBreakdownSubPanelProps> = ({
  formData,
  cropRecommendation
}) => {
  const cropName = cropRecommendation?.crop || 'Rice';
  const targets = CROP_NPK_TARGETS[cropName] || CROP_NPK_TARGETS['Default'];

  const currentN = formData?.nitrogen ?? 0;
  const currentP = formData?.phosphorus ?? 0;
  const currentK = formData?.potassium ?? 0;

  // Calculate percentage of target
  const pctN = Math.min(Math.round((currentN / targets.n) * 100), 180);
  const pctP = Math.min(Math.round((currentP / targets.p) * 100), 180);
  const pctK = Math.min(Math.round((currentK / targets.k) * 100), 180);

  // Compute actual ratio string simplified
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  const rawMin = Math.max(1, Math.min(currentN, currentP, currentK));
  const rN = (currentN / rawMin).toFixed(1);
  const rP = (currentP / rawMin).toFixed(1);
  const rK = (currentK / rawMin).toFixed(1);
  const currentRatioStr = `${rN} : ${rP} : ${rK}`;

  const getStatus = (pct: number) => {
    if (pct < 75) return { label: 'Deficit', color: 'text-amber-600 bg-amber-50 border-amber-200', bar: 'bg-amber-500' };
    if (pct <= 125) return { label: 'Optimal', color: 'text-emerald-700 bg-emerald-50 border-emerald-200', bar: 'bg-emerald-500' };
    return { label: 'Surplus', color: 'text-blue-700 bg-blue-50 border-blue-200', bar: 'bg-blue-500' };
  };

  const statusN = getStatus(pctN);
  const statusP = getStatus(pctP);
  const statusK = getStatus(pctK);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-[2.5rem] p-8 border-2 border-[#c8e6c9] shadow-lg space-y-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#c8e6c9]/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#1b2e1b] text-[#4CAF50] flex items-center justify-center shadow-md">
            <TestTube className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-serif text-xl font-bold text-[#1b2e1b] flex items-center gap-2">
              <span>NPK Ratio & Nutrient Level Breakdown</span>
              <span className="text-[10px] font-mono font-bold bg-[#f1f8f1] text-[#2e7d32] border border-[#c8e6c9] px-2.5 py-0.5 rounded-full">
                Target Crop: {cropName}
              </span>
            </h4>
            <p className="text-xs text-[#667e66]">
              Real-time comparison of your active soil N-P-K concentration against crop-specific ideal levels.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-[#f8fcf8] p-3 rounded-2xl border border-[#c8e6c9] text-xs">
          <div className="text-right">
            <div className="text-[10px] uppercase font-black text-[#8a8a70]">Active Soil Ratio</div>
            <div className="font-mono font-black text-[#2e7d32] text-sm">{currentRatioStr}</div>
          </div>
          <div className="h-6 w-px bg-[#c8e6c9]" />
          <div>
            <div className="text-[10px] uppercase font-black text-[#8a8a70]">Target Ratio</div>
            <div className="font-mono font-bold text-gray-700 text-sm">{targets.ratio}</div>
          </div>
        </div>
      </div>

      {/* 3 Nutrient Metric Progress Bars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Nitrogen */}
        <div className="p-5 bg-[#fcfdfc] border border-[#c8e6c9] rounded-2xl space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="font-serif font-bold text-sm text-gray-900 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
              Nitrogen (N)
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusN.color}`}>
              {statusN.label}
            </span>
          </div>

          <div className="flex items-baseline justify-between font-mono">
            <div>
              <span className="text-2xl font-black text-[#1b2e1b]">{currentN}</span>
              <span className="text-xs text-gray-500 ml-1">ppm</span>
            </div>
            <div className="text-xs text-gray-400 font-sans">Ideal: {targets.n} ppm</div>
          </div>

          <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(pctN, 100)}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={`h-full rounded-full ${statusN.bar}`}
            />
          </div>
          <div className="flex justify-between text-[10px] text-gray-500 font-medium">
            <span>{pctN}% of target</span>
            <span>{currentN < targets.n ? `-${targets.n - currentN} ppm` : `+${currentN - targets.n} ppm`}</span>
          </div>
        </div>

        {/* Phosphorus */}
        <div className="p-5 bg-[#fcfdfc] border border-[#c8e6c9] rounded-2xl space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="font-serif font-bold text-sm text-gray-900 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-orange-500 inline-block" />
              Phosphorus (P)
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusP.color}`}>
              {statusP.label}
            </span>
          </div>

          <div className="flex items-baseline justify-between font-mono">
            <div>
              <span className="text-2xl font-black text-[#1b2e1b]">{currentP}</span>
              <span className="text-xs text-gray-500 ml-1">ppm</span>
            </div>
            <div className="text-xs text-gray-400 font-sans">Ideal: {targets.p} ppm</div>
          </div>

          <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(pctP, 100)}%` }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
              className={`h-full rounded-full ${statusP.bar}`}
            />
          </div>
          <div className="flex justify-between text-[10px] text-gray-500 font-medium">
            <span>{pctP}% of target</span>
            <span>{currentP < targets.p ? `-${targets.p - currentP} ppm` : `+${currentP - targets.p} ppm`}</span>
          </div>
        </div>

        {/* Potassium */}
        <div className="p-5 bg-[#fcfdfc] border border-[#c8e6c9] rounded-2xl space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="font-serif font-bold text-sm text-gray-900 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-sky-500 inline-block" />
              Potassium (K)
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusK.color}`}>
              {statusK.label}
            </span>
          </div>

          <div className="flex items-baseline justify-between font-mono">
            <div>
              <span className="text-2xl font-black text-[#1b2e1b]">{currentK}</span>
              <span className="text-xs text-gray-500 ml-1">ppm</span>
            </div>
            <div className="text-xs text-gray-400 font-sans">Ideal: {targets.k} ppm</div>
          </div>

          <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(pctK, 100)}%` }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
              className={`h-full rounded-full ${statusK.bar}`}
            />
          </div>
          <div className="flex justify-between text-[10px] text-gray-500 font-medium">
            <span>{pctK}% of target</span>
            <span>{currentK < targets.k ? `-${targets.k - currentK} ppm` : `+${currentK - targets.k} ppm`}</span>
          </div>
        </div>
      </div>

      {/* Actionable Agronomic Recommendation Footer */}
      <div className="bg-[#1b2e1b] text-white p-4 rounded-2xl flex items-start gap-3 border border-[#4CAF50]/30 text-xs">
        <Sparkles className="w-5 h-5 text-[#4CAF50] shrink-0 mt-0.5 animate-pulse" />
        <div className="space-y-1">
          <div className="font-serif font-bold text-sm text-[#81c784] flex items-center gap-2">
            <span>Agronomist NPK Optimization Directive</span>
          </div>
          <p className="text-gray-200 leading-relaxed">
            {targets.guide}{' '}
            {currentN < targets.n && `Apply Urea (46% N) to close the ${targets.n - currentN} ppm Nitrogen gap. `}
            {currentP < targets.p && `Incorporate Single Super Phosphate (SSP) for root strength. `}
            {currentK < targets.k && `Apply Muriate of Potash (MOP) to achieve balanced vigor.`}
          </p>
        </div>
      </div>
    </motion.div>
  );
};
