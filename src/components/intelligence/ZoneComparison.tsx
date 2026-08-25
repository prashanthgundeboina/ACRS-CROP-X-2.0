import React from 'react';
import { motion } from 'motion/react';
import { 
  Compass, 
  Droplets, 
  Sprout, 
  ArrowRight, 
  ShieldAlert, 
  CheckCircle2, 
  MapPin,
  Layers
} from 'lucide-react';
import { DigitalTwinZone } from '../../types/intelligence/farmIntelligenceTypes';

interface ZoneComparisonProps {
  zones: DigitalTwinZone[];
  onOpenFarmLayout: () => void;
}

export const ZoneComparison: React.FC<ZoneComparisonProps> = ({
  zones,
  onOpenFarmLayout
}) => {
  const getZoneStatusBadge = (moistureStatus: string, riskStatus: string) => {
    if (riskStatus === 'CRITICAL' || moistureStatus === 'critical_dry') {
      return {
        label: '🔴 Critical Attention',
        bg: 'bg-rose-100 text-rose-800 border-rose-200'
      };
    }
    if (riskStatus === 'HIGH' || moistureStatus === 'dry') {
      return {
        label: '🟡 Water Monitoring',
        bg: 'bg-amber-100 text-amber-900 border-amber-200'
      };
    }
    return {
      label: '🟢 Healthy & Balanced',
      bg: 'bg-emerald-100 text-emerald-900 border-[#c8e6c9]'
    };
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#c8e6c9] shadow-sm space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-[#e8f5e9] flex items-center justify-center text-[#2e7d32]">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-lg text-[#1b2e1b]">
              Digital Twin: Field Zone Comparison
            </h3>
            <p className="text-xs text-gray-500">
              Comparative telemetry and moisture dynamics across field management zones
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenFarmLayout}
          className="py-2 px-3.5 rounded-xl bg-[#e8f5e9] hover:bg-[#c8e6c9] text-[#2e7d32] font-bold text-xs flex items-center gap-1.5 transition-colors min-h-[40px]"
        >
          <Layers className="w-4 h-4" />
          <span>Open in Farm Layout</span>
        </button>
      </div>

      {/* Grid of Digital Twin Zones */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {zones.map((zone, idx) => {
          const badge = getZoneStatusBadge(zone.moistureStatus, zone.riskStatus);

          return (
            <motion.div
              key={zone.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              className="rounded-2xl border border-gray-200 p-4 bg-[#fafdfa] hover:border-[#2e7d32]/40 transition-all space-y-3 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-serif font-bold text-sm text-gray-900 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#2e7d32]" />
                    {zone.name}
                  </span>
                  <span className="text-[10px] font-mono text-gray-500">{zone.areaHa} ha</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${badge.bg}`}>
                    {badge.label}
                  </span>
                  <span className="text-[10px] text-gray-500 font-mono">
                    {zone.sensorStatus}
                  </span>
                </div>

                {/* Metrics Breakdown */}
                <div className="p-3 rounded-xl bg-white border border-gray-100 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 flex items-center gap-1">
                      <Droplets className="w-3.5 h-3.5 text-blue-500" />
                      Moisture:
                    </span>
                    <span className="font-bold font-mono text-gray-900">{zone.moisture}%</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 flex items-center gap-1">
                      <Sprout className="w-3.5 h-3.5 text-emerald-600" />
                      Crop / Stage:
                    </span>
                    <span className="font-medium text-gray-800">{zone.assignedCrop} ({zone.growthStage})</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Canopy NDVI:</span>
                    <span className="font-mono font-bold text-emerald-700">{zone.vegetationNdvi}</span>
                  </div>
                </div>

                <p className="text-xs text-gray-600">
                  {zone.riskSummary}
                </p>
              </div>

              <button
                type="button"
                onClick={onOpenFarmLayout}
                className="w-full py-2 rounded-xl bg-gray-50 hover:bg-[#e8f5e9] text-gray-700 hover:text-[#2e7d32] font-semibold text-xs flex items-center justify-center gap-1 transition-all"
              >
                <span>Inspect Zone Grid</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
