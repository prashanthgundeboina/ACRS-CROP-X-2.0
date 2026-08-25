import React, { useState } from 'react';
import { ArrowLeftRight, Calculator, Check, Copy } from 'lucide-react';

export const UnitConverterPanel: React.FC = () => {
  // Converter States
  const [areaVal, setAreaVal] = useState<number>(1);
  const [areaUnit, setAreaUnit] = useState<'acres' | 'hectares' | 'sqm'>('acres');

  const [tempVal, setTempVal] = useState<number>(25);
  const [tempUnit, setTempUnit] = useState<'celsius' | 'fahrenheit'>('celsius');

  const [fertVal, setFertVal] = useState<number>(100);
  const [fertUnit, setFertUnit] = useState<'kgha' | 'lbsacre'>('kgha');

  const [rainVal, setRainVal] = useState<number>(150);
  const [rainUnit, setRainUnit] = useState<'mm' | 'inches'>('mm');

  const [copied, setCopied] = useState(false);

  // Area Calculations
  const areaInHectares = areaUnit === 'hectares' ? areaVal : areaUnit === 'acres' ? areaVal * 0.404686 : areaVal / 10000;
  const areaAcres = (areaInHectares * 2.47105).toFixed(2);
  const areaSqm = (areaInHectares * 10000).toFixed(0);

  // Temperature Calculations
  const tempC = tempUnit === 'celsius' ? tempVal : (tempVal - 32) * (5 / 9);
  const tempF = tempUnit === 'celsius' ? (tempVal * 9) / 5 + 32 : tempVal;

  // Fertilizer Application Rate Calculations
  const fertKgHa = fertUnit === 'kgha' ? fertVal : fertVal * 1.12085;
  const fertLbsAcre = fertUnit === 'kgha' ? fertVal * 0.892179 : fertVal;

  // Rainfall Calculations
  const rainMm = rainUnit === 'mm' ? rainVal : rainVal * 25.4;
  const rainInches = rainUnit === 'mm' ? rainVal / 25.4 : rainVal;

  const copyResultToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-[#c8e6c9] shadow-sm space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#c8e6c9] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[#4CAF50]">
            <Calculator className="w-5 h-5" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#2e7d32]">Agronomic Measurement Utility</span>
          </div>
          <h3 className="font-serif text-2xl font-bold text-[#1b2e1b]">Agricultural Unit Converter</h3>
          <p className="text-xs text-[#667e66]">Convert international farming parameters seamlessly between metric and imperial standards.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Area Converter */}
        <div className="p-5 bg-[#f8fcf8] rounded-3xl border border-[#c8e6c9] space-y-3">
          <div className="flex justify-between items-center text-xs font-bold text-[#2e7d32]">
            <span>Land Surface Area</span>
            <ArrowLeftRight className="w-4 h-4 text-[#4CAF50]" />
          </div>
          <div className="flex gap-2">
            <input
              type="number"
              value={areaVal}
              onChange={(e) => setAreaVal(parseFloat(e.target.value) || 0)}
              className="flex-1 bg-white border border-[#c8e6c9] font-bold text-sm rounded-xl px-3 py-2 outline-none"
            />
            <select
              value={areaUnit}
              onChange={(e) => setAreaUnit(e.target.value as any)}
              className="bg-white border border-[#c8e6c9] font-bold text-xs rounded-xl px-3 py-2 outline-none"
            >
              <option value="acres">Acres</option>
              <option value="hectares">Hectares</option>
              <option value="sqm">Sq Meters</option>
            </select>
          </div>
          <div className="p-3 bg-white rounded-2xl border border-[#c8e6c9] text-xs space-y-1">
            <div className="flex justify-between text-gray-700">
              <span>Hectares (ha):</span> <span className="font-mono font-bold text-[#2e7d32]">{areaInHectares.toFixed(2)} ha</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Acres (ac):</span> <span className="font-mono font-bold text-[#2e7d32]">{areaAcres} ac</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Square Meters (m²):</span> <span className="font-mono font-bold text-[#2e7d32]">{areaSqm} m²</span>
            </div>
          </div>
        </div>

        {/* 2. Temperature Converter */}
        <div className="p-5 bg-[#f8fcf8] rounded-3xl border border-[#c8e6c9] space-y-3">
          <div className="flex justify-between items-center text-xs font-bold text-[#2e7d32]">
            <span>Ambient Temperature</span>
            <ArrowLeftRight className="w-4 h-4 text-[#4CAF50]" />
          </div>
          <div className="flex gap-2">
            <input
              type="number"
              value={tempVal}
              onChange={(e) => setTempVal(parseFloat(e.target.value) || 0)}
              className="flex-1 bg-white border border-[#c8e6c9] font-bold text-sm rounded-xl px-3 py-2 outline-none"
            />
            <select
              value={tempUnit}
              onChange={(e) => setTempUnit(e.target.value as any)}
              className="bg-white border border-[#c8e6c9] font-bold text-xs rounded-xl px-3 py-2 outline-none"
            >
              <option value="celsius">Celsius (°C)</option>
              <option value="fahrenheit">Fahrenheit (°F)</option>
            </select>
          </div>
          <div className="p-3 bg-white rounded-2xl border border-[#c8e6c9] text-xs space-y-1">
            <div className="flex justify-between text-gray-700">
              <span>Celsius:</span> <span className="font-mono font-bold text-[#2e7d32]">{tempC.toFixed(1)} °C</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Fahrenheit:</span> <span className="font-mono font-bold text-[#2e7d32]">{tempF.toFixed(1)} °F</span>
            </div>
          </div>
        </div>

        {/* 3. Fertilizer Application Rate Converter */}
        <div className="p-5 bg-[#f8fcf8] rounded-3xl border border-[#c8e6c9] space-y-3">
          <div className="flex justify-between items-center text-xs font-bold text-[#2e7d32]">
            <span>Fertilizer Application Dosage</span>
            <ArrowLeftRight className="w-4 h-4 text-[#4CAF50]" />
          </div>
          <div className="flex gap-2">
            <input
              type="number"
              value={fertVal}
              onChange={(e) => setFertVal(parseFloat(e.target.value) || 0)}
              className="flex-1 bg-white border border-[#c8e6c9] font-bold text-sm rounded-xl px-3 py-2 outline-none"
            />
            <select
              value={fertUnit}
              onChange={(e) => setFertUnit(e.target.value as any)}
              className="bg-white border border-[#c8e6c9] font-bold text-xs rounded-xl px-3 py-2 outline-none"
            >
              <option value="kgha">kg / hectare</option>
              <option value="lbsacre">lbs / acre</option>
            </select>
          </div>
          <div className="p-3 bg-white rounded-2xl border border-[#c8e6c9] text-xs space-y-1">
            <div className="flex justify-between text-gray-700">
              <span>Metric Dosage:</span> <span className="font-mono font-bold text-[#2e7d32]">{fertKgHa.toFixed(1)} kg/ha</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Imperial Dosage:</span> <span className="font-mono font-bold text-[#2e7d32]">{fertLbsAcre.toFixed(1)} lbs/acre</span>
            </div>
          </div>
        </div>

        {/* 4. Rainfall / Water Depth Converter */}
        <div className="p-5 bg-[#f8fcf8] rounded-3xl border border-[#c8e6c9] space-y-3">
          <div className="flex justify-between items-center text-xs font-bold text-[#2e7d32]">
            <span>Precipitation / Irrigation Depth</span>
            <ArrowLeftRight className="w-4 h-4 text-[#4CAF50]" />
          </div>
          <div className="flex gap-2">
            <input
              type="number"
              value={rainVal}
              onChange={(e) => setRainVal(parseFloat(e.target.value) || 0)}
              className="flex-1 bg-white border border-[#c8e6c9] font-bold text-sm rounded-xl px-3 py-2 outline-none"
            />
            <select
              value={rainUnit}
              onChange={(e) => setRainUnit(e.target.value as any)}
              className="bg-white border border-[#c8e6c9] font-bold text-xs rounded-xl px-3 py-2 outline-none"
            >
              <option value="mm">Millimeters (mm)</option>
              <option value="inches">Inches (in)</option>
            </select>
          </div>
          <div className="p-3 bg-white rounded-2xl border border-[#c8e6c9] text-xs space-y-1">
            <div className="flex justify-between text-gray-700">
              <span>Millimeters:</span> <span className="font-mono font-bold text-[#2e7d32]">{rainMm.toFixed(1)} mm</span>
            </div>
            <div className="flex justify-between text-gray-700">
              <span>Inches:</span> <span className="font-mono font-bold text-[#2e7d32]">{rainInches.toFixed(2)} in</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
