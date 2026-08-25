import React, { useState } from 'react';
import { 
  Sparkles, 
  Play, 
  Smartphone, 
  Flame, 
  CheckCircle2, 
  AlertTriangle, 
  Sprout, 
  Radio,
  Bug,
  Droplets,
  Sun
} from 'lucide-react';

export type SimulatorScenario = 
  | 'healthy_paddy' 
  | 'wilted_cotton' 
  | 'pest_maize' 
  | 'nitrogen_wheat'
  | 'simulated_thermal'
  | 'remote_phone';

interface CameraSimulatorPanelProps {
  activeScenario: SimulatorScenario;
  onSelectScenario: (scenario: SimulatorScenario) => void;
  onTriggerSimulatedAnalysis: (scenario: SimulatorScenario) => void;
}

export const CameraSimulatorPanel: React.FC<CameraSimulatorPanelProps> = ({
  activeScenario,
  onSelectScenario,
  onTriggerSimulatedAnalysis,
}) => {
  const scenarios: {
    id: SimulatorScenario;
    title: string;
    crop: string;
    tag: string;
    description: string;
    icon: React.ElementType;
    badgeColor: string;
  }[] = [
    {
      id: 'healthy_paddy',
      title: '🌾 Healthy Rice (Paddy)',
      crop: 'Rice (Paddy)',
      tag: 'Optimal Canopy',
      description: 'Dense, erect, chlorophyll-rich green leaves with 36% soil moisture balance.',
      icon: Sprout,
      badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    },
    {
      id: 'wilted_cotton',
      title: '🍂 Drought-Stressed Cotton',
      crop: 'Cotton',
      tag: 'Water Deficit Stress',
      description: 'Midday foliar curling, drooping upper leaves with 21% soil moisture deficit.',
      icon: Droplets,
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    },
    {
      id: 'pest_maize',
      title: '🐛 Pest-Damaged Maize',
      crop: 'Maize / Corn',
      tag: 'Leaf Feeding Signs',
      description: 'Foliar shot-holes and marginal feeding symptoms matching early lepidopteran activity.',
      icon: Bug,
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-300',
    },
    {
      id: 'nitrogen_wheat',
      title: '🍃 Chlorotic Wheat (N-Deficit)',
      crop: 'Wheat',
      tag: 'Nutrient Chlorosis',
      description: 'Lower leaf yellowing with green venation indicating nitrogen or iron mobility deficit.',
      icon: Sun,
      badgeColor: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    },
    {
      id: 'remote_phone',
      title: '📱 Remote Phone Scout Stream',
      crop: 'Multi-Zone Field',
      tag: 'WebRTC Bridge',
      description: 'Simulates high-definition 1080p stream received from a paired Samsung/iPhone scout.',
      icon: Smartphone,
      badgeColor: 'bg-blue-100 text-blue-800 border-blue-300',
    },
    {
      id: 'simulated_thermal',
      title: '🌡️ MLX90640 Thermal IR Feed',
      crop: 'Infrared Matrix',
      tag: 'Canopy Temp 26.8°C',
      description: 'Simulates 32x24 false-color thermal canopy radiation with 3.1°C transpiration cooling.',
      icon: Flame,
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-300',
    },
  ];

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#c8e6c9] shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#c8e6c9]/60 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-amber-50 text-amber-700 rounded-2xl">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold text-amber-700 uppercase tracking-wider">
              Developer & Field Hardware Simulator
            </span>
            <h4 className="text-base font-bold text-gray-900">
              Live Field Camera Test Benches
            </h4>
          </div>
        </div>

        <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded-full text-[10px] font-mono font-black uppercase">
          DEMO / SIMULATED
        </span>
      </div>

      <p className="text-xs text-gray-600 leading-relaxed">
        Test crop vision intelligence, multi-sensor correlation, and farmer advice generation even when physical hardware or field cameras are not currently accessible.
      </p>

      {/* Scenario Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {scenarios.map((scen) => {
          const Icon = scen.icon;
          const isSelected = activeScenario === scen.id;

          return (
            <div
              key={scen.id}
              onClick={() => onSelectScenario(scen.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer relative space-y-2 ${
                isSelected
                  ? 'bg-gradient-to-br from-[#f8fcf8] to-[#edf7ee] border-[#4CAF50] shadow-md ring-2 ring-[#4CAF50]/30'
                  : 'bg-gray-50/70 border-gray-200 hover:border-[#a5d6a7]'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className={`p-2 rounded-xl ${isSelected ? 'bg-[#2e7d32] text-white' : 'bg-gray-200 text-gray-700'}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${scen.badgeColor}`}>
                  {scen.tag}
                </span>
              </div>

              <div className="space-y-1">
                <h5 className="text-xs font-bold text-gray-900">{scen.title}</h5>
                <p className="text-[11px] text-gray-500 leading-snug">{scen.description}</p>
              </div>

              <div className="pt-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectScenario(scen.id);
                    onTriggerSimulatedAnalysis(scen.id);
                  }}
                  className="w-full py-2 min-h-[36px] bg-white hover:bg-[#2e7d32] text-[#2e7d32] hover:text-white border border-[#a5d6a7] rounded-xl text-xs font-bold transition-all shadow-2xs active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Analyze Scenario
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
