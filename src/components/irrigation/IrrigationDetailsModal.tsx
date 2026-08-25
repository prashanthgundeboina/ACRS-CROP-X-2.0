import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Droplets, 
  Sparkles, 
  Sliders, 
  Info, 
  Calculator, 
  CheckCircle2, 
  AlertTriangle,
  HelpCircle,
  Thermometer,
  CloudRain,
  Gauge,
  Layers,
  Clock
} from 'lucide-react';
import { ZoneIrrigationEvaluation, SoilData } from '../../types';
import { evaluateIrrigationDecision, calculateReferenceET0, getCropCoefficient } from '../../services/irrigationEngine';

interface IrrigationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  zoneEvaluation?: ZoneIrrigationEvaluation;
  soilData: SoilData;
  weatherTemp: number;
  weatherRainProb: number;
  weatherRainfallForecastMm: number;
}

export const IrrigationDetailsModal: React.FC<IrrigationDetailsModalProps> = ({
  isOpen,
  onClose,
  zoneEvaluation,
  soilData,
  weatherTemp,
  weatherRainProb,
  weatherRainfallForecastMm
}) => {
  // Simulation interactive state
  const [simMoisture, setSimMoisture] = useState<number>(zoneEvaluation?.currentMoisture ?? soilData.soil_moisture ?? 32);
  const [simRainfall, setSimRainfall] = useState<number>(weatherRainfallForecastMm || 0);
  const [simRainProb, setSimRainProb] = useState<number>(weatherRainProb || 20);
  const [simTemp, setSimTemp] = useState<number>(weatherTemp || 28);
  const [simPumpHP, setSimPumpHP] = useState<number>(5);

  if (!isOpen) return null;

  // Run simulation calculation
  const simResult = evaluateIrrigationDecision({
    soilData: { ...soilData, soil_moisture: simMoisture, rainfall: simRainfall, temperature: simTemp },
    cropName: zoneEvaluation?.crop || 'Rice',
    areaHa: zoneEvaluation?.areaHa || 1.5,
    weatherTemp: simTemp,
    weatherRainProb: simRainProb,
    weatherRainfallForecastMm: simRainfall,
    zoneName: zoneEvaluation?.zoneName || 'Simulation Field'
  });

  // Calculate dynamic pump run time based on selected pump horsepower
  // 3 HP ~ 15,000 L/hr, 5 HP ~ 25,000 L/hr, 7.5 HP ~ 38,000 L/hr, 10 HP ~ 50,000 L/hr
  const flowRates: Record<number, number> = { 3: 15000, 5: 25000, 7.5: 38000, 10: 50000 };
  const currentFlow = flowRates[simPumpHP] || 25000;
  const customPumpHours = simResult.estimatedTotalLiters 
    ? parseFloat((simResult.estimatedTotalLiters / currentFlow).toFixed(1))
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-[2.5rem] border border-[#c8e6c9] max-w-3xl w-full p-6 sm:p-8 shadow-2xl space-y-6 my-8 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#c8e6c9]/60 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-[#e8f5e9] text-[#2e7d32]">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-serif text-2xl font-bold text-[#1b2e1b]">
                Precision Irrigation Agronomic Engine
              </h3>
              <p className="text-xs text-[#667e66]">
                FAO-56 Penman-Monteith Evapotranspiration & Water Deficit Simulator
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* What-If Interactive Simulator Section */}
        <div className="p-6 rounded-3xl bg-[#f8fcf8] border border-[#c8e6c9] space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#2e7d32]" />
              <h4 className="text-sm font-bold text-[#1b2e1b]">
                Interactive "What-If" Scenario Simulator
              </h4>
            </div>
            <span className="text-[10px] bg-[#e8f5e9] text-[#2e7d32] px-2.5 py-1 rounded-full font-bold">
              Real-time Simulation
            </span>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {/* Slider 1: Soil Moisture */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-gray-700">Simulated Soil Moisture:</span>
                <span className="font-mono font-bold text-[#2e7d32]">{simMoisture}%</span>
              </div>
              <input 
                type="range" 
                min="10" 
                max="90" 
                value={simMoisture}
                onChange={(e) => setSimMoisture(Number(e.target.value))}
                className="w-full accent-[#4CAF50] cursor-pointer"
              />
            </div>

            {/* Slider 2: Forecast Rainfall */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-gray-700">Simulated Rain Forecast:</span>
                <span className="font-mono font-bold text-blue-600">{simRainfall} mm ({simRainProb}%)</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="50" 
                value={simRainfall}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setSimRainfall(val);
                  setSimRainProb(val > 0 ? Math.min(95, val * 4 + 20) : 10);
                }}
                className="w-full accent-blue-500 cursor-pointer"
              />
            </div>

            {/* Slider 3: Temperature */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-gray-700">Simulated Temperature:</span>
                <span className="font-mono font-bold text-amber-600">{simTemp}°C</span>
              </div>
              <input 
                type="range" 
                min="15" 
                max="45" 
                value={simTemp}
                onChange={(e) => setSimTemp(Number(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            {/* Selector: Pump Horsepower */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="font-medium text-gray-700">Pump Capacity (HP):</span>
                <span className="font-mono font-bold text-[#1b2e1b]">{simPumpHP} HP (~{currentFlow.toLocaleString()} L/h)</span>
              </div>
              <select
                value={simPumpHP}
                onChange={(e) => setSimPumpHP(Number(e.target.value))}
                className="w-full p-2 bg-white border border-[#c8e6c9] rounded-xl text-xs font-bold text-[#1b2e1b]"
              >
                <option value={3}>3.0 HP (15,000 L/hr)</option>
                <option value={5}>5.0 HP (25,000 L/hr - Standard)</option>
                <option value={7.5}>7.5 HP (38,000 L/hr - Heavy Duty)</option>
                <option value={10}>10.0 HP (50,000 L/hr - High Discharge)</option>
              </select>
            </div>
          </div>

          {/* Simulation Outcome Banner */}
          <div className="p-4 rounded-2xl bg-white border border-[#c8e6c9] flex items-center justify-between gap-4 shadow-sm">
            <div className="space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-wider text-[#667e66]">
                Simulated AI Decision
              </div>
              <div className="text-base font-bold text-[#1b2e1b] flex items-center gap-2">
                <span>{simResult.statusLabel}</span>
              </div>
              <p className="text-xs text-gray-600">
                {simResult.what}
              </p>
            </div>

            {simResult.grossIrrigationRequiredMm ? (
              <div className="text-right flex-shrink-0">
                <div className="text-xs text-[#667e66]">Water Req:</div>
                <div className="text-xl font-mono font-black text-[#2e7d32]">
                  {simResult.grossIrrigationRequiredMm} mm
                </div>
                <div className="text-[11px] font-mono text-amber-700">
                  ~{customPumpHours} hrs runtime
                </div>
              </div>
            ) : (
              <div className="text-right text-xs font-bold text-emerald-700 flex-shrink-0">
                0 mm Required
              </div>
            )}
          </div>
        </div>

        {/* Agronomic Parameter Breakdown */}
        <div className="grid sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-[#fafbfa] border border-gray-200 space-y-1">
            <div className="text-gray-500 font-mono">Reference ET₀</div>
            <div className="text-lg font-black font-mono text-[#1b2e1b]">{simResult.evapotranspirationMmDay} mm/day</div>
            <p className="text-[10px] text-gray-500">Atmospheric evaporative demand based on temperature and wind.</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#fafbfa] border border-gray-200 space-y-1">
            <div className="text-gray-500 font-mono">Crop Kc Coefficient</div>
            <div className="text-lg font-black font-mono text-[#1b2e1b]">{simResult.cropCoefficientKc}</div>
            <p className="text-[10px] text-gray-500">FAO-56 transpiration coefficient for {zoneEvaluation?.crop || 'selected crop'}.</p>
          </div>

          <div className="p-4 rounded-2xl bg-[#fafbfa] border border-gray-200 space-y-1">
            <div className="text-gray-500 font-mono">Crop Need (ETc)</div>
            <div className="text-lg font-black font-mono text-[#2e7d32]">{simResult.cropWaterNeedMmDay} mm/day</div>
            <p className="text-[10px] text-gray-500">Actual daily water consumption by crop canopy.</p>
          </div>
        </div>

        {/* Disclaimer / Transparency Note */}
        <div className="p-3.5 rounded-2xl bg-[#f1f8f1] border border-[#c8e6c9] text-xs text-[#2e7d32] flex items-start gap-2">
          <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>
            These calculations use deterministic agricultural equations from FAO Irrigation & Drainage Paper 56. No speculative sensor values are generated.
          </span>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-[#1b2e1b] hover:bg-[#2e7d32] text-white font-bold text-xs rounded-2xl transition-all shadow-md cursor-pointer"
          >
            Close Audit
          </button>
        </div>
      </motion.div>
    </div>
  );
};
