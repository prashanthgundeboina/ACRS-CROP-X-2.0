import React, { useState, useMemo } from 'react';
import { SoilData } from '../types';
import { predictExpectedYield } from '../services/geminiService';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceDot } from 'recharts';
import { TrendingUp, Activity, Sparkles, Sliders } from 'lucide-react';

interface Props {
  currentSoilData: SoilData;
}

type SensitivityVariable = 'nitrogen' | 'phosphorus' | 'potassium' | 'ph' | 'rainfall' | 'organic_matter';

export const RealTimeYieldCurve: React.FC<Props> = ({ currentSoilData }) => {
  const [selectedVar, setSelectedVar] = useState<SensitivityVariable>('nitrogen');

  // Compute curve data across 10 sample steps of the selected variable
  const curveData = useMemo(() => {
    const list: { varVal: number; predictedYield: number; currentPoint?: boolean }[] = [];

    let min = 0;
    let max = 200;
    let step = 20;

    if (selectedVar === 'nitrogen') { min = 10; max = 200; step = 15; }
    else if (selectedVar === 'phosphorus') { min = 5; max = 120; step = 10; }
    else if (selectedVar === 'potassium') { min = 10; max = 150; step = 12; }
    else if (selectedVar === 'ph') { min = 4.0; max = 9.0; step = 0.5; }
    else if (selectedVar === 'rainfall') { min = 40; max = 350; step = 25; }
    else if (selectedVar === 'organic_matter') { min = 0.5; max = 7.0; step = 0.5; }

    const currentValue = currentSoilData[selectedVar];

    for (let v = min; v <= max; v += step) {
      const simulatedSoil: SoilData = {
        ...currentSoilData,
        [selectedVar]: v
      };
      const est = predictExpectedYield(simulatedSoil);
      list.push({
        varVal: parseFloat(v.toFixed(1)),
        predictedYield: est.expectedYield
      });
    }

    return { list, currentValue };
  }, [currentSoilData, selectedVar]);

  // Current yield
  const currentEst = predictExpectedYield(currentSoilData);

  // Variable label text
  const varLabels: Record<SensitivityVariable, string> = {
    nitrogen: 'Nitrogen (N ppm)',
    phosphorus: 'Phosphorus (P ppm)',
    potassium: 'Potassium (K ppm)',
    ph: 'Soil pH Level',
    rainfall: 'Rainfall (mm)',
    organic_matter: 'Organic Matter (%)'
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-[#c8e6c9] shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[#4CAF50]">
            <Activity className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#2e7d32]">Real-Time Sensitivity Engine</span>
          </div>
          <h3 className="font-serif text-2xl font-bold text-[#1b2e1b]">Dynamic Yield Sensitivity Response</h3>
          <p className="text-xs text-[#667e66]">Real-time curve tracking expected yield changes as sidebar soil sliders fluctuate.</p>
        </div>

        {/* Variable Switcher Buttons */}
        <div className="flex flex-wrap gap-1.5 bg-[#f8fcf8] p-1.5 rounded-2xl border border-[#c8e6c9]">
          {(['nitrogen', 'phosphorus', 'potassium', 'ph', 'rainfall', 'organic_matter'] as SensitivityVariable[]).map((v) => (
            <button
              key={v}
              onClick={() => setSelectedVar(v)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-bold capitalize transition-all ${
                selectedVar === v
                  ? 'bg-[#4CAF50] text-white shadow-sm'
                  : 'text-[#5b7a5b] hover:bg-[#e8f5e9]'
              }`}
            >
              {v === 'nitrogen' ? 'N' : v === 'phosphorus' ? 'P' : v === 'potassium' ? 'K' : v === 'ph' ? 'pH' : v === 'rainfall' ? 'Rain' : 'Organic'}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Overlay Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-[#f8fcf8] to-[#e8f5e9] p-4 rounded-2xl border border-[#c8e6c9]">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-[#4CAF50] animate-ping" />
          <span className="text-xs font-bold text-gray-700">Active Variable: <span className="text-[#2e7d32]">{varLabels[selectedVar]}</span></span>
        </div>
        <div className="flex items-center gap-4 text-xs">
          <span className="font-semibold text-gray-600">Current Position: <span className="font-mono font-bold text-[#4CAF50]">{currentSoilData[selectedVar]}</span></span>
          <span className="font-semibold text-gray-600">Yield Output: <span className="font-mono font-bold text-[#1b2e1b]">{currentEst.expectedYield} tons/ha</span></span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[260px] w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={curveData.list}>
            <defs>
              <linearGradient id="yieldGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#4CAF50" stopOpacity={0.0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="varVal" stroke="#8a8a70" fontSize={11} label={{ value: varLabels[selectedVar], position: 'insideBottom', offset: -5, style: {fontSize: 10, fill: '#667e66'} }} />
            <YAxis stroke="#8a8a70" fontSize={11} domain={[0, 12]} label={{ value: 'Yield (tons/ha)', angle: -90, position: 'insideLeft', style: {fontSize: 10, fill: '#667e66'} }} />
            <RechartsTooltip formatter={(val: any) => [`${val} tons/ha`, 'Predicted Yield']} />
            <Area type="monotone" dataKey="predictedYield" stroke="#2e7d32" strokeWidth={3} fillOpacity={1} fill="url(#yieldGrad)" />
            <ReferenceDot x={curveData.currentValue} y={currentEst.expectedYield} r={7} fill="#1b2e1b" stroke="#4CAF50" strokeWidth={3} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
