import React, { useState } from 'react';
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { GitCompare, TrendingUp, Droplets, Thermometer, ShieldCheck, Award } from 'lucide-react';

interface CropHistoryPoint {
  season: string;
  rainfall: number;
  temperature: number;
  cropAYield: number;
  cropBYield: number;
}

const CROP_HISTORICAL_DATASETS: Record<string, number[]> = {
  Rice: [5.2, 5.6, 4.8, 6.1, 5.9],
  Maize: [4.1, 4.5, 3.9, 5.0, 4.8],
  Wheat: [3.8, 4.0, 3.5, 4.4, 4.2],
  Jute: [2.9, 3.2, 2.7, 3.5, 3.3],
  Coffee: [1.8, 2.1, 1.6, 2.3, 2.2],
  Cotton: [2.4, 2.7, 2.1, 2.9, 2.8]
};

const SEASONS = ['2021', '2022', '2023', '2024', '2025'];
const CLIMATE_RAINFALL = [180, 210, 150, 240, 220]; // mm
const CLIMATE_TEMP = [21, 22, 23, 20, 21]; // °C

export const DualCropComparison: React.FC = () => {
  const [cropA, setCropA] = useState<string>('Rice');
  const [cropB, setCropB] = useState<string>('Maize');

  const comparisonData: CropHistoryPoint[] = SEASONS.map((season, idx) => ({
    season,
    rainfall: CLIMATE_RAINFALL[idx],
    temperature: CLIMATE_TEMP[idx],
    cropAYield: CROP_HISTORICAL_DATASETS[cropA][idx],
    cropBYield: CROP_HISTORICAL_DATASETS[cropB][idx]
  }));

  const avgYieldA = parseFloat((comparisonData.reduce((acc, p) => acc + p.cropAYield, 0) / 5).toFixed(2));
  const avgYieldB = parseFloat((comparisonData.reduce((acc, p) => acc + p.cropBYield, 0) / 5).toFixed(2));

  const yieldGap = parseFloat((((avgYieldA - avgYieldB) / avgYieldB) * 100).toFixed(1));

  return (
    <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-[#c8e6c9] shadow-sm space-y-8">
      {/* Selector Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-[#c8e6c9] pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[#4CAF50]">
            <GitCompare className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#2e7d32]">Multi-Crop Comparative Intelligence</span>
          </div>
          <h3 className="font-serif text-2xl font-bold text-[#1b2e1b]">Dual-Crop Dataset Benchmark</h3>
          <p className="text-xs text-[#667e66]">Simultaneously compare yield performance trajectory, climate sensitivity, and water efficiency across two crop species.</p>
        </div>

        {/* Dropdown Selectors */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#4CAF50]">Primary Crop (A)</span>
            <select
              value={cropA}
              onChange={(e) => setCropA(e.target.value)}
              className="bg-[#f8fcf8] border-2 border-[#4CAF50] text-[#1b2e1b] font-bold text-xs rounded-xl px-3 py-2 outline-none"
            >
              {Object.keys(CROP_HISTORICAL_DATASETS).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <span className="text-xs font-black text-gray-400 mt-4">VS</span>

          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-amber-600">Comparison Crop (B)</span>
            <select
              value={cropB}
              onChange={(e) => setCropB(e.target.value)}
              className="bg-[#fffbeb] border-2 border-amber-500 text-amber-950 font-bold text-xs rounded-xl px-3 py-2 outline-none"
            >
              {Object.keys(CROP_HISTORICAL_DATASETS).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Comparative Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 bg-[#f8fcf8] border border-[#c8e6c9] rounded-2xl space-y-2">
          <span className="text-[10px] font-black uppercase text-[#2e7d32] flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" /> Average Yield Differential
          </span>
          <div className="text-2xl font-black font-mono text-[#1b2e1b]">
            {avgYieldA} vs {avgYieldB} <span className="text-xs text-gray-500">tons/ha</span>
          </div>
          <p className="text-[11px] text-gray-600">
            {cropA} yields <span className="font-bold text-[#4CAF50]">{Math.abs(yieldGap)}% {yieldGap >= 0 ? 'higher' : 'lower'}</span> than {cropB} on average over 5 seasons.
          </p>
        </div>

        <div className="p-5 bg-[#f8fcf8] border border-[#c8e6c9] rounded-2xl space-y-2">
          <span className="text-[10px] font-black uppercase text-sky-700 flex items-center gap-1.5">
            <Droplets className="w-3.5 h-3.5 text-sky-500" /> Rainfall Efficiency Index
          </span>
          <div className="text-2xl font-black font-mono text-[#1b2e1b]">
            {(avgYieldA / 200 * 1000).toFixed(1)} vs {(avgYieldB / 200 * 1000).toFixed(1)} <span className="text-xs text-gray-500">kg/ha/100mm</span>
          </div>
          <p className="text-[11px] text-gray-600">
            Biomass conversion rate relative to mean regional precipitation.
          </p>
        </div>

        <div className="p-5 bg-[#f8fcf8] border border-[#c8e6c9] rounded-2xl space-y-2">
          <span className="text-[10px] font-black uppercase text-amber-700 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-500" /> Climate Vulnerability
          </span>
          <div className="text-2xl font-black font-mono text-[#1b2e1b]">
            {cropA === 'Rice' ? 'Low (0.24)' : 'Moderate (0.42)'} vs {cropB === 'Rice' ? 'Low (0.24)' : 'Moderate (0.42)'}
          </div>
          <p className="text-[11px] text-gray-600">
            Variance sensitivity when seasonal precipitation drops below 160mm.
          </p>
        </div>
      </div>

      {/* Dual Recharts Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Comparative Yield Trajectory Line Chart */}
        <div className="bg-[#fcfdfc] p-6 rounded-3xl border border-[#c8e6c9] space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-serif text-lg font-bold text-[#1b2e1b]">Historical Yield Trajectory</h4>
            <span className="text-[10px] font-mono bg-white px-2.5 py-1 rounded-full border border-[#c8e6c9] font-bold">2021 - 2025</span>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="season" stroke="#8a8a70" fontSize={11} />
                <YAxis stroke="#8a8a70" fontSize={11} label={{ value: 'tons/ha', angle: -90, position: 'insideLeft', style: {textAnchor: 'middle'} }} />
                <RechartsTooltip />
                <Legend wrapperStyle={{fontSize: 11}} />
                <Line type="monotone" name={`${cropA} (Crop A)`} dataKey="cropAYield" stroke="#4CAF50" strokeWidth={3} dot={{r: 5}} />
                <Line type="monotone" name={`${cropB} (Crop B)`} dataKey="cropBYield" stroke="#f59e0b" strokeWidth={3} dot={{r: 5}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Climate Variable Correlation Bar Chart */}
        <div className="bg-[#fcfdfc] p-6 rounded-3xl border border-[#c8e6c9] space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-serif text-lg font-bold text-[#1b2e1b]">Climate Variable Overlay</h4>
            <span className="text-[10px] font-mono bg-white px-2.5 py-1 rounded-full border border-[#c8e6c9] font-bold">Rainfall vs Temp</span>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="season" stroke="#8a8a70" fontSize={11} />
                <YAxis yAxisId="left" orientation="left" stroke="#4CAF50" fontSize={11} label={{ value: 'Rain (mm)', angle: -90, position: 'insideLeft' }} />
                <YAxis yAxisId="right" orientation="right" stroke="#3b82f6" fontSize={11} label={{ value: 'Temp (°C)', angle: 90, position: 'insideRight' }} />
                <RechartsTooltip />
                <Legend wrapperStyle={{fontSize: 11}} />
                <Bar yAxisId="left" name="Rainfall (mm)" dataKey="rainfall" fill="#a5d6a7" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" name="Temperature (°C)" dataKey="temperature" fill="#93c5fd" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
