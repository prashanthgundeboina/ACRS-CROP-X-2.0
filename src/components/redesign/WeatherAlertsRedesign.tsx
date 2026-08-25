import React from 'react';
import { motion } from 'motion/react';
import {
  CloudRain,
  Sun,
  Wind,
  Thermometer,
  ShieldAlert,
  PhoneCall,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Umbrella,
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { StatusBadge } from '../ui/StatusBadge';
import { FarmerButton } from '../ui/FarmerButton';
import { SoilData } from '../../types';

interface WeatherAlertsRedesignProps {
  soilData: SoilData;
  onOpenCallModal: () => void;
  onSyncLiveWeather?: () => void;
}

export const WeatherAlertsRedesign: React.FC<WeatherAlertsRedesignProps> = ({
  soilData,
  onOpenCallModal,
  onSyncLiveWeather,
}) => {
  const isHighRainRisk = soilData.rainfall > 100 || soilData.rain_probability > 50;
  const rainProbability = soilData.rain_probability || (soilData.rainfall > 100 ? 70 : 20);
  const temp = soilData.temperature || 28;
  const humidity = soilData.humidity || 65;
  const wind = soilData.wind_speed || 12;

  // Practical advice logic
  let farmerAdvice = 'Ideal day for field work, weeding, and fertilizer application.';
  if (isHighRainRisk) {
    farmerAdvice = '🌧️ Hold off on liquid fertilizer & irrigation! Heavy rain expected soon.';
  } else if (temp > 35) {
    farmerAdvice = '☀️ High heat warning! Irrigate early morning or late evening to avoid evaporation.';
  } else if (humidity > 80) {
    farmerAdvice = '⚠️ High humidity alert! Monitor foliage for fungal leaf spot mildew.';
  }

  return (
    <div className="space-y-6 my-6">
      <GlassCard variant="emerald" padding="lg" className="border-2 border-emerald-400">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/10 rounded-2xl text-amber-300">
              <CloudRain className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-2xl text-white">
                🌦️ Live Field Weather & Early Warnings
              </h2>
              <p className="text-xs text-emerald-100/90 font-sans">
                Real-time microclimate predictions powered by Open-Meteo Satellite Telemetry.
              </p>
            </div>
          </div>

          <FarmerButton
            onClick={onOpenCallModal}
            variant="voice"
            size="sm"
            icon={PhoneCall}
          >
            🎙️ Listen To Weather Advice
          </FarmerButton>
        </div>

        {/* Rain Direct Query Block */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center pt-6">
          <div className="md:col-span-5 p-6 bg-black/20 rounded-3xl border border-white/10 text-center space-y-2">
            <span className="text-xs text-emerald-200 font-mono font-bold uppercase">
              Will It Rain Today?
            </span>
            <div className="flex items-center justify-center gap-2">
              <Umbrella className="w-8 h-8 text-amber-300" />
              <div className="text-3xl font-black text-white font-mono">
                {isHighRainRisk ? 'YES (High Risk)' : 'NO (Low Risk)'}
              </div>
            </div>
            <p className="text-xs text-emerald-100">
              Rain Chance: <strong className="text-amber-300">{rainProbability}%</strong>
            </p>
          </div>

          {/* Quick Telemetry Cards Grid */}
          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-3 text-white">
            <div className="p-3 bg-white/10 rounded-2xl border border-white/10 space-y-1">
              <span className="text-[10px] text-emerald-200 font-mono font-bold flex items-center gap-1">
                <Thermometer className="w-3.5 h-3.5 text-amber-300" /> Temp
              </span>
              <div className="text-lg font-black font-mono">{temp}°C</div>
            </div>

            <div className="p-3 bg-white/10 rounded-2xl border border-white/10 space-y-1">
              <span className="text-[10px] text-emerald-200 font-mono font-bold flex items-center gap-1">
                <Wind className="w-3.5 h-3.5 text-cyan-300" /> Wind
              </span>
              <div className="text-lg font-black font-mono">{wind} km/h</div>
            </div>

            <div className="p-3 bg-white/10 rounded-2xl border border-white/10 space-y-1">
              <span className="text-[10px] text-emerald-200 font-mono font-bold flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-300" /> Frost Risk
              </span>
              <div className="text-lg font-black font-mono">{soilData.frost_risk || 0}%</div>
            </div>
          </div>
        </div>

        {/* Practical Farmer Recommendation Banner */}
        <div className="mt-6 p-4 bg-amber-400 text-amber-950 rounded-2xl font-sans font-bold text-xs sm:text-sm flex items-center gap-3 shadow-md">
          <Sparkles className="w-5 h-5 shrink-0 text-amber-900" />
          <span>{farmerAdvice}</span>
        </div>
      </GlassCard>
    </div>
  );
};
