import React from 'react';
import { SoilData } from '../types';
import { AlertTriangle, CloudRain, Sun, Thermometer, ShieldAlert, CheckCircle, TrendingDown, Shield } from 'lucide-react';

interface Props {
  soilData: SoilData;
  frostThreshold: number;
}

export const WeatherPredictiveAlerts: React.FC<Props> = ({ soilData, frostThreshold }) => {
  // 7-Day Forecast Simulation
  const forecast = [
    { day: 'Mon', tempMax: 32, tempMin: 19, rainMm: 0, humidity: 55, risk: 'Normal' },
    { day: 'Tue', tempMax: 35, tempMin: 22, rainMm: 0, humidity: 48, risk: 'Heatwave' },
    { day: 'Wed', tempMax: 38, tempMin: 24, rainMm: 0, humidity: 42, risk: 'Severe Heatwave' },
    { day: 'Thu', tempMax: 28, tempMin: 14, rainMm: 45, humidity: 88, risk: 'Excessive Rainfall' },
    { day: 'Fri', tempMax: 22, tempMin: 9, rainMm: 12, humidity: 75, risk: 'Normal' },
    { day: 'Sat', tempMax: 18, tempMin: frostThreshold <= 5 ? frostThreshold - 2 : 4, rainMm: 0, humidity: 62, risk: soilData.frost_risk > 30 ? 'Frost Risk' : 'Cold Snap' },
    { day: 'Sun', tempMax: 24, tempMin: 12, rainMm: 2, humidity: 58, risk: 'Normal' }
  ];

  // Calculate overall yield impact risk
  let yieldLossRisk = 0;
  const mitigationTasks: string[] = [];

  if (soilData.frost_risk > 25) {
    yieldLossRisk += 14;
    mitigationTasks.push("Apply foliar Potassium (K) & Silicon spray 24h before cold snap to enhance plant osmotic turgor.");
    mitigationTasks.push("Deploy micro-sprinklers before dawn to create protective heat release during freezing hours.");
  }

  if (soilData.temperature > 32) {
    yieldLossRisk += 10;
    mitigationTasks.push("Increase drip irrigation scheduling by +25% during peak thermal solar hours (12:00-15:00).");
    mitigationTasks.push("Apply shade cloth netting over high-value vegetable beds to mitigate photo-inhibition.");
  }

  if (soilData.rainfall < 100) {
    yieldLossRisk += 12;
    mitigationTasks.push("Apply organic straw mulch around root zones to prevent soil evaporative water loss.");
  }

  if (yieldLossRisk === 0) {
    yieldLossRisk = 4;
    mitigationTasks.push("Optimal weather conditions detected. Maintain regular fertigation schedule.");
  }

  return (
    <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-[#c8e6c9] shadow-sm space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#c8e6c9] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[#4CAF50]">
            <ShieldAlert className="w-5 h-5 text-amber-600" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#2e7d32]">Predictive Yield Risk Intelligence</span>
          </div>
          <h3 className="font-serif text-2xl font-bold text-[#1b2e1b]">7-Day Weather Impact & Yield Loss Alert</h3>
          <p className="text-xs text-[#667e66]">AI model forecast evaluating upcoming weather hazards against crop sensitivity thresholds.</p>
        </div>

        <div className="flex items-center gap-3 bg-[#fff8e1] p-3.5 rounded-2xl border border-amber-300">
          <TrendingDown className="w-6 h-6 text-amber-700" />
          <div>
            <div className="text-[10px] font-bold uppercase text-amber-800">Predicted Unmitigated Loss</div>
            <div className="text-xl font-black text-amber-900 font-mono">-{yieldLossRisk}% Yield</div>
          </div>
        </div>
      </div>

      {/* 7-Day Forecast Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {forecast.map((fc, i) => (
          <div
            key={i}
            className={`p-3 rounded-2xl border text-center space-y-2 transition-all ${
              fc.risk.includes('Heatwave') || fc.risk.includes('Frost') || fc.risk.includes('Excessive')
                ? 'bg-amber-50 border-amber-300'
                : 'bg-[#f8fcf8] border-[#c8e6c9]'
            }`}
          >
            <div className="text-xs font-bold text-[#1b2e1b]">{fc.day}</div>
            <div className="flex justify-center my-1">
              {fc.risk.includes('Heatwave') ? (
                <Sun className="w-6 h-6 text-amber-500 animate-pulse" />
              ) : fc.risk.includes('Excessive') ? (
                <CloudRain className="w-6 h-6 text-blue-500" />
              ) : (
                <Thermometer className="w-6 h-6 text-[#4CAF50]" />
              )}
            </div>

            <div className="text-xs font-mono font-black text-gray-800">
              {fc.tempMax}° / <span className="text-gray-500">{fc.tempMin}°</span>
            </div>

            <div className="text-[9px] font-bold text-gray-500">
              {fc.rainMm > 0 ? `${fc.rainMm} mm` : `${fc.humidity}% Hum`}
            </div>

            <span className={`inline-block px-1.5 py-0.5 rounded text-[8px] font-black uppercase ${
              fc.risk === 'Normal' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-200 text-amber-900'
            }`}>
              {fc.risk}
            </span>
          </div>
        ))}
      </div>

      {/* Actionable Agronomic Mitigation Strategies */}
      <div className="p-5 bg-[#1b2e1b] text-white rounded-3xl border border-[#2e7d32] space-y-3">
        <div className="flex items-center gap-2 border-b border-[#2e7d32] pb-2 text-[#81c784] font-serif font-bold text-sm">
          <Shield className="w-5 h-5" />
          <span>Recommended Preventive Action Protocol</span>
        </div>

        <ul className="space-y-2 text-xs">
          {mitigationTasks.map((task, idx) => (
            <li key={idx} className="flex items-start gap-2 text-gray-200">
              <CheckCircle className="w-4 h-4 text-[#4CAF50] flex-shrink-0 mt-0.5" />
              <span className="leading-relaxed">{task}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
