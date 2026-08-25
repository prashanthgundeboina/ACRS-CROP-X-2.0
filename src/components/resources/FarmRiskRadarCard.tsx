import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Droplets, 
  CloudSun, 
  Bug, 
  TestTube, 
  TrendingDown, 
  Truck, 
  AlertTriangle, 
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { farmRiskRadarService } from '../../services/resources/farmRiskRadarService';
import { SoilData, FarmZone } from '../../types';
import { RiskRadarPillar } from '../../types/resources/farmResourceTypes';

interface FarmRiskRadarCardProps {
  soilData?: SoilData;
  cropName?: string;
  temperatureC?: number;
  humidityPercent?: number;
  rainfallMm?: number;
  windSpeedKmh?: number;
  farmZones?: FarmZone[];
  isExpertMode?: boolean;
  onSelectTab?: (tab: string) => void;
}

export const FarmRiskRadarCard: React.FC<FarmRiskRadarCardProps> = ({
  soilData,
  cropName = 'Tomato',
  temperatureC = 29,
  humidityPercent = 58,
  rainfallMm = 0,
  windSpeedKmh = 14,
  farmZones = [],
  isExpertMode = false,
  onSelectTab
}) => {
  const [selectedPillar, setSelectedPillar] = useState<RiskRadarPillar | 'all'>('all');

  const radar = farmRiskRadarService.evaluateFarmRiskRadar({
    soilData,
    cropName,
    temperatureC,
    humidityPercent,
    rainfallMm,
    windSpeedKmh,
    farmZones
  });

  const getPillarIcon = (pillar: RiskRadarPillar) => {
    switch (pillar) {
      case 'water': return <Droplets className="w-4 h-4 text-blue-400" />;
      case 'weather': return <CloudSun className="w-4 h-4 text-amber-400" />;
      case 'crop': return <Bug className="w-4 h-4 text-emerald-400" />;
      case 'soil': return <TestTube className="w-4 h-4 text-purple-400" />;
      case 'market': return <TrendingDown className="w-4 h-4 text-rose-400" />;
      case 'operations': return <Truck className="w-4 h-4 text-cyan-400" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high':
      case 'critical':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-red-500/20 text-red-300 border border-red-500/30">High Risk</span>;
      case 'moderate':
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">Moderate</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Low Risk</span>;
    }
  };

  const filteredItems = selectedPillar === 'all' 
    ? radar.items 
    : radar.items.filter(i => i.pillar === selectedPillar);

  return (
    <div id="farm-risk-radar-card" className="bg-[#111C15]/90 border border-[#2E4A38]/50 rounded-2xl p-5 md:p-6 backdrop-blur-md shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#2E4A38]/40">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg md:text-xl font-bold text-slate-100">Farm Risk Radar</h2>
              <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${
                radar.overallRiskScore > 45 
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' 
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              }`}>
                Overall Risk Index: {radar.overallRiskScore}/100
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Continuous 6-pillar threat matrix monitoring Water, Weather, Crop, Soil, Market & Logistics
            </p>
          </div>
        </div>

        {/* Pillar Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setSelectedPillar('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
              selectedPillar === 'all' 
                ? 'bg-emerald-600 text-white' 
                : 'bg-[#18291F] text-slate-400 hover:text-slate-200'
            }`}
          >
            All Pillars (6)
          </button>
          {radar.items.map(item => (
            <button
              key={item.pillar}
              onClick={() => setSelectedPillar(item.pillar)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                selectedPillar === item.pillar 
                  ? 'bg-emerald-600 text-white' 
                  : 'bg-[#18291F] text-slate-400 hover:text-slate-200'
              }`}
            >
              {getPillarIcon(item.pillar)}
              <span className="capitalize">{item.pillar}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Prioritized Action Banner */}
      <div className="mt-4 p-3.5 rounded-xl bg-amber-950/30 border border-amber-600/30">
        <div className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Top Mitigations for Today</span>
        </div>
        <ul className="space-y-1 text-xs text-slate-300">
          {radar.prioritizedActionPlan.map((action, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="text-amber-400">•</span>
              <span>{action}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 6 Radar Pillar Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 mt-5">
        {filteredItems.map(item => (
          <div 
            key={item.pillar}
            className="p-4 rounded-xl bg-[#18291F]/50 border border-[#2E4A38]/40 hover:border-[#2E4A38]/70 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-[#2E4A38]/30">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-[#111C15]">
                    {getPillarIcon(item.pillar)}
                  </div>
                  <span className="font-bold text-slate-100 text-xs capitalize">{item.pillar} Risk</span>
                </div>
                {getSeverityBadge(item.severity)}
              </div>

              <div className="mt-3 space-y-1.5 text-xs">
                <div>
                  <span className="text-slate-400">Primary Hazard: </span>
                  <span className="font-medium text-slate-200">{item.primaryHazard}</span>
                </div>
                <div>
                  <span className="text-slate-400">Affected Scope: </span>
                  <span className="text-slate-300">{item.affectedZoneOrCrop}</span>
                </div>
                <div>
                  <span className="text-slate-400">Time to Impact: </span>
                  <span className="text-amber-300 font-semibold">{item.timeToImpact}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#2E4A38]/30 text-xs">
              <div className="text-slate-400 font-medium mb-1">Action:</div>
              <div className="text-emerald-300 font-medium leading-relaxed bg-[#111C15]/60 p-2 rounded-lg border border-[#2E4A38]/20">
                {item.mitigationAction}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
