import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { SoilData, CropRecommendation } from '../types';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Area, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend 
} from 'recharts';
import { TrendingUp, Sprout, Calendar, Zap, AlertTriangle, CheckCircle } from 'lucide-react';

interface PredictiveYield6MonthProjectionProps {
  soilData: SoilData;
  cropRecommendation?: CropRecommendation;
}

export const PredictiveYield6MonthProjection: React.FC<PredictiveYield6MonthProjectionProps> = ({
  soilData,
  cropRecommendation
}) => {
  const [scenarioMode, setScenarioMode] = useState<'standard' | 'boosted' | 'drought'>('standard');

  const cropName = cropRecommendation?.crop || 'Rice';
  const baseYield = cropRecommendation?.expected_yield 
    ? (typeof cropRecommendation.expected_yield === 'number' ? cropRecommendation.expected_yield : parseFloat(String(cropRecommendation.expected_yield))) 
    : 7.5;

  // Compute 6 month trend curve data
  const monthData = useMemo(() => {
    const months = [
      { name: 'Month 1', stage: 'Germination & Seedling', multiplier: 0.1, biomass: 12 },
      { name: 'Month 2', stage: 'Vegetative & Tillering', multiplier: 0.35, biomass: 38 },
      { name: 'Month 3', stage: 'Panicle Initiation & Booting', multiplier: 0.65, biomass: 72 },
      { name: 'Month 4', stage: 'Flowering & Anthesis', multiplier: 0.85, biomass: 90 },
      { name: 'Month 5', stage: 'Grain Filling & Milk Stage', multiplier: 0.98, biomass: 98 },
      { name: 'Month 6', stage: 'Maturation & Harvest', multiplier: 1.0, biomass: 100 },
    ];

    // Environmental penalty/bonus multipliers
    const n = soilData?.nitrogen ?? 120;
    const moisture = soilData?.soil_moisture || soilData?.moisture || 32;
    const ph = soilData?.ph ?? 6.5;

    let envModifier = 1.0;
    if (n < 80) envModifier -= 0.15;
    if (moisture < 25) envModifier -= 0.20;
    if (ph < 5.5 || ph > 7.8) envModifier -= 0.10;

    let modeMultiplier = 1.0;
    if (scenarioMode === 'boosted') modeMultiplier = 1.22;
    if (scenarioMode === 'drought') modeMultiplier = 0.68;

    return months.map((m) => {
      const projectedYield = Math.max(0.5, Math.round((baseYield * m.multiplier * envModifier * modeMultiplier) * 10) / 10);
      const projectedBiomass = Math.min(100, Math.round(m.biomass * envModifier * modeMultiplier));

      return {
        month: m.name,
        stage: m.stage,
        projectedYield: projectedYield,
        targetBenchmark: Math.round((baseYield * m.multiplier) * 10) / 10,
        biomassIndex: projectedBiomass,
      };
    });
  }, [baseYield, soilData, scenarioMode]);

  const finalYield = monthData[monthData.length - 1].projectedYield;
  const benchmarkFinal = monthData[monthData.length - 1].targetBenchmark;
  const yieldDiffPct = Math.round(((finalYield - benchmarkFinal) / benchmarkFinal) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-[2.5rem] p-8 border-2 border-[#c8e6c9] shadow-lg space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#c8e6c9]/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#1b2e1b] text-[#4CAF50] flex items-center justify-center shadow-md">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-serif text-xl font-bold text-[#1b2e1b] flex items-center gap-2">
              <span>6-Month Predictive Yield & Biomass Growth Projection</span>
              <span className="text-[10px] font-mono font-bold bg-[#e8f5e9] text-[#2e7d32] border border-[#c8e6c9] px-2.5 py-0.5 rounded-full">
                Target: {cropName}
              </span>
            </h4>
            <p className="text-xs text-[#667e66]">
              Predictive growth timeline modeling cumulative yield trajectory (tons/ha) across crop lifecycle stages.
            </p>
          </div>
        </div>

        {/* Scenario Selector Buttons */}
        <div className="flex items-center gap-1.5 bg-[#f8fcf8] p-1.5 rounded-2xl border border-[#c8e6c9]">
          <button
            onClick={() => setScenarioMode('standard')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              scenarioMode === 'standard'
                ? 'bg-[#4CAF50] text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Current Parameters
          </button>
          <button
            onClick={() => setScenarioMode('boosted')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
              scenarioMode === 'boosted'
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-300" />
            Optimized (+22%)
          </button>
          <button
            onClick={() => setScenarioMode('drought')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              scenarioMode === 'drought'
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Water Stressed
          </button>
        </div>
      </div>

      {/* Yield Milestone Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-[#f8fcf8] border border-[#c8e6c9] rounded-2xl">
          <div className="text-[10px] uppercase font-bold text-[#8a8a70]">6-Month Forecast Yield</div>
          <div className="text-2xl font-black font-mono text-[#1b2e1b] mt-0.5">{finalYield} <span className="text-xs font-sans text-gray-500">tons/ha</span></div>
          <div className={`text-[10px] font-bold mt-1 ${yieldDiffPct >= 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
            {yieldDiffPct >= 0 ? `+${yieldDiffPct}% vs Baseline` : `${yieldDiffPct}% vs Baseline`}
          </div>
        </div>

        <div className="p-4 bg-[#f8fcf8] border border-[#c8e6c9] rounded-2xl">
          <div className="text-[10px] uppercase font-bold text-[#8a8a70]">Baseline Benchmark</div>
          <div className="text-2xl font-black font-mono text-gray-700 mt-0.5">{benchmarkFinal} <span className="text-xs font-sans text-gray-500">tons/ha</span></div>
          <div className="text-[10px] text-gray-500 mt-1">Regional 5-yr average</div>
        </div>

        <div className="p-4 bg-[#f8fcf8] border border-[#c8e6c9] rounded-2xl">
          <div className="text-[10px] uppercase font-bold text-[#8a8a70]">Peak Canopy Month</div>
          <div className="text-2xl font-black text-emerald-800 mt-0.5">Month 4</div>
          <div className="text-[10px] text-gray-500 mt-1">Flowering & Anthesis stage</div>
        </div>

        <div className="p-4 bg-[#f8fcf8] border border-[#c8e6c9] rounded-2xl">
          <div className="text-[10px] uppercase font-bold text-[#8a8a70]">Harvest Maturity Index</div>
          <div className="text-2xl font-black font-mono text-sky-700 mt-0.5">{monthData[5].biomassIndex}%</div>
          <div className="text-[10px] text-gray-500 mt-1">Full canopy development</div>
        </div>
      </div>

      {/* Recharts 6-Month Growth Chart */}
      <div className="h-[280px] w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={monthData} margin={{ top: 10, right: 30, left: 10, bottom: 20 }}>
            <defs>
              <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#4CAF50" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
            <YAxis yAxisId="yield" orientation="left" stroke="#2e7d32" fontSize={11} unit=" t/ha" />
            <YAxis yAxisId="biomass" orientation="right" stroke="#0284c7" fontSize={11} unit="%" domain={[0, 100]} />
            <RechartsTooltip 
              contentStyle={{ backgroundColor: '#1b2e1b', borderColor: '#4CAF50', borderRadius: '12px', color: '#fff', fontSize: '12px' }}
              labelStyle={{ fontWeight: 'bold', color: '#a5d6a7' }}
            />
            <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />

            <Area 
              yAxisId="yield"
              type="monotone" 
              dataKey="projectedYield" 
              name="Projected Cumulative Yield (tons/ha)" 
              stroke="#2e7d32" 
              strokeWidth={3} 
              fillOpacity={1} 
              fill="url(#growthGrad)" 
            />

            <Line 
              yAxisId="yield"
              type="monotone" 
              dataKey="targetBenchmark" 
              name="Baseline Benchmark (tons/ha)" 
              stroke="#94a3b8" 
              strokeWidth={2} 
              strokeDasharray="5 5" 
            />

            <Line 
              yAxisId="biomass"
              type="monotone" 
              dataKey="biomassIndex" 
              name="Canopy Biomass Index (%)" 
              stroke="#0284c7" 
              strokeWidth={2.5} 
              dot={{ r: 4, fill: '#0284c7' }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Lifecycle Stage Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 pt-2">
        {monthData.map((m, i) => (
          <div key={m.month} className="p-3 bg-[#f8fcf8] border border-[#c8e6c9] rounded-xl text-center space-y-1">
            <div className="text-[10px] font-black uppercase text-[#2e7d32]">{m.month}</div>
            <div className="text-[11px] font-bold text-gray-800 truncate" title={m.stage}>{m.stage}</div>
            <div className="text-xs font-mono font-black text-[#1b2e1b]">{m.projectedYield} t/ha</div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
