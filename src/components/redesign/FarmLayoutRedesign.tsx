import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Grid,
  Bell,
  BellOff,
  PhoneCall,
  Sprout,
  Droplets,
  Bug,
  ShieldCheck,
  Plus,
  Trash2,
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { StatusBadge } from '../ui/StatusBadge';
import { FarmerButton } from '../ui/FarmerButton';
import { NoFarmZoneEmptyState } from '../ui/EmptyState';
import { FarmZone } from '../../types';

interface FarmLayoutRedesignProps {
  zones: FarmZone[];
  onToggleZonePush: (zoneId: string) => void;
  onOpenCallModal: () => void;
  onAddZone?: () => void;
}

export const FarmLayoutRedesign: React.FC<FarmLayoutRedesignProps> = ({
  zones,
  onToggleZonePush,
  onOpenCallModal,
  onAddZone,
}) => {
  const [selectedZone, setSelectedZone] = useState<FarmZone | null>(zones[0] || null);

  if (zones.length === 0) {
    return (
      <div className="my-6">
        <NoFarmZoneEmptyState onAddField={onAddZone || (() => {})} />
      </div>
    );
  }

  return (
    <div className="space-y-6 my-6">
      <GlassCard padding="lg" className="border-2 border-[#c8e6c9]">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-100 text-[#2e7d32] rounded-2xl">
              <Grid className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-2xl text-[#1b2e1b]">
                🗺️ Interactive Farm Layout & Zone Telemetry
              </h2>
              <p className="text-xs text-gray-600 font-sans">
                Manage plot zones, track soil moisture per plot, and configure push notifications.
              </p>
            </div>
          </div>

          <FarmerButton
            onClick={onOpenCallModal}
            variant="voice"
            size="sm"
            icon={PhoneCall}
          >
            🎙️ Explain Zone Status
          </FarmerButton>
        </div>

        {/* Zones Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-6">
          {zones.map((zone) => {
            const isSelected = selectedZone?.id === zone.id;
            return (
              <GlassCard
                key={zone.id}
                clickable
                onClick={() => setSelectedZone(zone)}
                className={`space-y-3 transition-all ${isSelected ? 'border-2 border-[#2e7d32] bg-[#f1f8f1]' : 'border-[#c8e6c9]'}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-serif font-bold text-lg text-[#1b2e1b]">
                    {zone.name}
                  </span>
                  <StatusBadge
                    label={zone.pushNotificationsEnabled ? 'Push Active' : 'Push Muted'}
                    variant={zone.pushNotificationsEnabled ? 'success' : 'neutral'}
                    size="sm"
                  />
                </div>

                <div className="text-xs text-gray-600 space-y-1">
                  <p><strong>Current Crop:</strong> {zone.currentCrop}</p>
                  <p><strong>Plot Size:</strong> {zone.areaAcres} Acres</p>
                </div>

                {/* Zone Telemetry Metrics */}
                <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] font-mono">
                  <div className="p-2 bg-white rounded-xl border border-gray-100 flex items-center gap-1.5">
                    <Droplets className="w-3.5 h-3.5 text-cyan-600" />
                    <span>{zone.soilMoisture}% Moist</span>
                  </div>
                  <div className="p-2 bg-white rounded-xl border border-gray-100 flex items-center gap-1.5">
                    <Bug className="w-3.5 h-3.5 text-amber-600" />
                    <span>{zone.pestRisk} Risk</span>
                  </div>
                </div>

                {/* Push Notification Toggle Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleZonePush(zone.id);
                  }}
                  className={`w-full py-1.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    zone.pushNotificationsEnabled
                      ? 'bg-emerald-100 text-[#2e7d32] hover:bg-emerald-200'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {zone.pushNotificationsEnabled ? (
                    <>
                      <Bell className="w-3.5 h-3.5 text-[#2e7d32]" />
                      <span>Push Alerts Enabled</span>
                    </>
                  ) : (
                    <>
                      <BellOff className="w-3.5 h-3.5 text-gray-400" />
                      <span>Enable Push Alerts</span>
                    </>
                  )}
                </button>
              </GlassCard>
            );
          })}
        </div>
      </GlassCard>
    </div>
  );
};
