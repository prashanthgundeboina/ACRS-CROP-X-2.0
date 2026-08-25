import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  MapPin, 
  Droplets, 
  Sprout, 
  AlertTriangle, 
  CheckCircle2, 
  ChevronRight, 
  Layers, 
  Info,
  ArrowRight
} from 'lucide-react';
import { ZoneRiskEvaluation, CropRiskLevel } from '../../types/cropRisk';

interface FieldRiskMapProps {
  zoneRisks: ZoneRiskEvaluation[];
  isExpertMode: boolean;
  onSelectTab: (tab: string) => void;
}

export const FieldRiskMap: React.FC<FieldRiskMapProps> = ({
  zoneRisks,
  isExpertMode,
  onSelectTab
}) => {
  const [activeZoneId, setActiveZoneId] = useState<string>(zoneRisks[0]?.zoneId || '');

  const getLevelStyle = (level: CropRiskLevel) => {
    switch (level) {
      case 'HIGH':
        return {
          card: 'bg-white border-rose-300 ring-1 ring-rose-300/60 shadow-sm',
          badge: 'bg-rose-50 text-rose-700 border-rose-200',
          dot: 'bg-rose-500',
          indicator: 'bg-rose-500 text-white'
        };
      case 'MODERATE':
        return {
          card: 'bg-white border-amber-300 ring-1 ring-amber-300/60 shadow-sm',
          badge: 'bg-amber-50 text-amber-700 border-amber-200',
          dot: 'bg-amber-500',
          indicator: 'bg-amber-500 text-white'
        };
      case 'WATCH':
        return {
          card: 'bg-white border-blue-300 shadow-sm',
          badge: 'bg-blue-50 text-blue-700 border-blue-200',
          dot: 'bg-blue-500',
          indicator: 'bg-blue-500 text-white'
        };
      case 'LOW':
      default:
        return {
          card: 'bg-white border-[#c8e6c9] shadow-sm',
          badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dot: 'bg-emerald-500',
          indicator: 'bg-emerald-600 text-white'
        };
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-[#c8e6c9] shadow-sm p-6 sm:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#2e7d32] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Spatial Field Mapping
            </span>
            <span className="text-xs text-gray-500">• Zone-by-zone early warning</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#1b2e1b] mt-1 flex items-center gap-2">
            🗺️ Zone Risk & Field Vulnerability Matrix
          </h3>
        </div>
      </div>

      {/* Zone Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {zoneRisks.map((zone) => {
          const style = getLevelStyle(zone.overallLevel);
          const isSelected = activeZoneId === zone.zoneId;

          return (
            <motion.div
              key={zone.zoneId}
              whileHover={{ y: -2 }}
              onClick={() => setActiveZoneId(zone.zoneId)}
              className={`rounded-2xl border p-5 cursor-pointer transition-all duration-200 flex flex-col justify-between space-y-4 ${
                isSelected ? 'ring-2 ring-[#2e7d32] bg-[#f8fcf8]' : ''
              } ${style.card}`}
            >
              {/* Zone Top Bar */}
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#2e7d32] font-bold text-xs">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-base text-gray-900 leading-tight">
                        {zone.zoneName}
                      </h4>
                      <span className="text-[11px] text-gray-500">
                        {zone.areaHa} ha • {zone.cropName}
                      </span>
                    </div>
                  </div>

                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border ${style.badge}`}>
                    <span className={`w-2 h-2 rounded-full ${style.dot}`} />
                    {zone.dominantRiskLabel}
                  </span>
                </div>

                {/* Moisture & Telemetry Stats */}
                <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
                  <div className="p-2 rounded-xl bg-[#f8fcf8] border border-gray-100 flex items-center gap-1.5">
                    <Droplets className="w-3.5 h-3.5 text-blue-500" />
                    <div>
                      <span className="text-[9px] text-gray-400 block uppercase font-bold">Moisture</span>
                      <span className="font-mono font-bold text-gray-800">{zone.soilMoisture}%</span>
                    </div>
                  </div>

                  <div className="p-2 rounded-xl bg-[#f8fcf8] border border-gray-100 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    <div>
                      <span className="text-[9px] text-gray-400 block uppercase font-bold">Top Threat</span>
                      <span className="font-bold text-gray-800 capitalize truncate block max-w-[90px]">
                        {zone.dominantCategory.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Why & Action snippet */}
                <div className="space-y-1 text-xs pt-1">
                  <p className="text-gray-600 leading-snug">
                    <strong className="text-gray-800">Signal:</strong> {zone.topWhy}
                  </p>
                  <p className="text-emerald-800 font-semibold leading-snug">
                    <strong>Action:</strong> {zone.primaryAction}
                  </p>
                </div>
              </div>

              {/* Bottom Action */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[10px] text-gray-400 font-mono">
                  Telemetry live
                </span>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectTab(zone.targetTab || 'irrigation');
                  }}
                  className="text-xs font-bold text-[#2e7d32] hover:text-[#1b5e20] flex items-center gap-1 p-1"
                >
                  <span>Inspect Zone</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
