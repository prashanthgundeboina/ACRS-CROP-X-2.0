import React from 'react';
import { motion } from 'motion/react';
import { 
  MapPin, 
  Droplets, 
  Layers, 
  ChevronRight, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Activity,
  Sprout
} from 'lucide-react';
import { ZoneIrrigationEvaluation } from '../../types';

interface ZoneIrrigationStatusProps {
  evaluations: ZoneIrrigationEvaluation[];
  selectedZoneId?: string;
  onSelectZone: (zoneId: string) => void;
  onOpenDetailsModal?: (zone: ZoneIrrigationEvaluation) => void;
}

export const ZoneIrrigationStatus: React.FC<ZoneIrrigationStatusProps> = ({
  evaluations,
  selectedZoneId,
  onSelectZone,
  onOpenDetailsModal
}) => {
  return (
    <div className="bg-white rounded-[2.5rem] border border-[#c8e6c9] p-6 sm:p-8 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#c8e6c9]/60 pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-[#e8f5e9] text-[#2e7d32]">
              <MapPin className="w-5 h-5" />
            </span>
            <h3 className="font-serif text-2xl font-bold text-[#1b2e1b]">
              Farm Zone Water Status
            </h3>
          </div>
          <p className="text-xs text-[#667e66]">
            Compare root-zone water stress across all fields to target irrigation where it is needed most.
          </p>
        </div>

        <div className="text-xs font-mono text-[#667e66] bg-[#f8fcf8] px-3 py-1.5 rounded-xl border border-[#c8e6c9]">
          {evaluations.length} Active Zones Monitored
        </div>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {evaluations.map((zone) => {
          const isSelected = selectedZoneId === zone.zoneId;
          const isCritical = zone.status === 'critical';
          const isWarning = zone.status === 'warning';

          // Status Badge styling
          let badgeClass = 'bg-emerald-100 text-emerald-800 border-emerald-300';
          let moistureBarColor = 'bg-[#4CAF50]';
          if (isCritical) {
            badgeClass = 'bg-red-100 text-red-800 border-red-300 animate-pulse';
            moistureBarColor = 'bg-red-500';
          } else if (isWarning) {
            badgeClass = 'bg-amber-100 text-amber-800 border-amber-300';
            moistureBarColor = 'bg-amber-500';
          }

          return (
            <div
              key={zone.zoneId}
              onClick={() => onSelectZone(zone.zoneId)}
              className={`p-5 rounded-3xl border transition-all cursor-pointer flex flex-col justify-between space-y-4 hover:shadow-md ${
                isSelected 
                  ? 'border-[#2e7d32] bg-[#f8fcf8] ring-2 ring-[#4CAF50]/30 shadow-md' 
                  : 'border-[#c8e6c9]/80 bg-[#fcfdfc] hover:border-[#4CAF50]'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-white border border-[#c8e6c9] text-[#2e7d32]">
                      <Sprout className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#1b2e1b]">
                        {zone.zoneName}
                      </h4>
                      <p className="text-[11px] text-[#667e66]">
                        {zone.crop} • {zone.areaHa} Ha
                      </p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${badgeClass}`}>
                    {zone.statusLabel}
                  </span>
                </div>

                {/* Soil Moisture Bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-gray-500">Root-Zone Moisture:</span>
                    <span className="font-bold text-[#1b2e1b]">{zone.currentMoisture}%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${moistureBarColor}`}
                      style={{ width: `${Math.min(100, Math.max(5, zone.currentMoisture))}%` }}
                    />
                  </div>
                </div>

                {/* Recommended Action Summary */}
                <div className="p-3 rounded-2xl bg-white border border-[#c8e6c9]/60 text-xs space-y-1">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#667e66]">
                    Recommendation
                  </div>
                  <p className="text-[#1b2e1b] font-medium line-clamp-2">
                    {zone.recommendation.action}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-[#667e66]">
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  <span>{zone.lastUpdated}</span>
                </div>

                <div className="flex items-center gap-1 text-[#2e7d32] font-bold">
                  <span>{isSelected ? 'Selected' : 'Inspect'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
