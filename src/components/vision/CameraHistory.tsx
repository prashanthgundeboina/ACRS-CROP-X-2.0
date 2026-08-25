import React, { useState } from 'react';
import { 
  History, 
  Search, 
  Filter, 
  Trash2, 
  Download, 
  MapPin, 
  ShieldCheck, 
  AlertTriangle, 
  Sprout, 
  Clock,
  Eye
} from 'lucide-react';
import { CropVisionObservation } from '../../types/visionTypes';
import { FarmZone } from '../../types';

interface CameraHistoryProps {
  observations: CropVisionObservation[];
  farmZones: FarmZone[];
  onSelectObservation: (obs: CropVisionObservation) => void;
  onDeleteObservation: (id: string) => void;
  onClearAll: () => void;
}

export const CameraHistory: React.FC<CameraHistoryProps> = ({
  observations,
  farmZones,
  onSelectObservation,
  onDeleteObservation,
  onClearAll,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterZone, setFilterZone] = useState('all');

  const filtered = observations.filter((obs) => {
    const matchesZone = filterZone === 'all' || obs.zoneId === filterZone;
    const q = searchTerm.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      obs.cropName.toLowerCase().includes(q) ||
      obs.zoneName.toLowerCase().includes(q) ||
      obs.advice.whatISee.toLowerCase().includes(q) ||
      obs.advice.whatYouShouldDo.toLowerCase().includes(q);
    return matchesZone && matchesSearch;
  });

  const exportToCsv = () => {
    const headers = ['ID', 'Timestamp', 'Zone', 'Crop', 'CanopyCoverage%', 'WhatISee', 'Action', 'Confidence%'];
    const rows = filtered.map((o) => [
      o.id,
      o.timestamp,
      `"${o.zoneName}"`,
      `"${o.cropName}"`,
      o.detection.canopyCoveragePercent,
      `"${o.advice.whatISee.replace(/"/g, '""')}"`,
      `"${o.advice.whatYouShouldDo.replace(/"/g, '""')}"`,
      o.advice.confidenceScore,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `croperx-vision-history-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#c8e6c9] shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#c8e6c9]/60 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-[#e8f5e9] text-[#2e7d32] rounded-2xl">
            <History className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold text-[#2e7d32] uppercase tracking-wider">
              Observation Logs & Evidence
            </span>
            <h4 className="text-base font-bold text-gray-900">
              Field Camera Timeline ({observations.length} Logs)
            </h4>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {observations.length > 0 && (
            <>
              <button
                onClick={exportToCsv}
                className="px-3 py-1.5 min-h-[36px] bg-[#f8fcf8] hover:bg-[#e8f5e9] text-[#2e7d32] border border-[#a5d6a7] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>

              <button
                onClick={onClearAll}
                className="px-3 py-1.5 min-h-[36px] text-gray-400 hover:text-rose-600 rounded-xl text-xs font-medium transition-colors cursor-pointer"
                title="Clear observation history"
              >
                Clear All
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search crop, zone, or symptom..."
            className="w-full pl-9 pr-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-[#2e7d32] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <Filter className="w-4 h-4 text-gray-400 shrink-0" />
          <select
            value={filterZone}
            onChange={(e) => setFilterZone(e.target.value)}
            className="px-3 py-2 bg-gray-50 rounded-xl border border-gray-200 text-xs font-medium focus:ring-2 focus:ring-[#2e7d32] focus:outline-none cursor-pointer"
          >
            <option value="all">All Farm Zones</option>
            {farmZones.map((z) => (
              <option key={z.id} value={z.id}>
                {z.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Observation Item Cards */}
      {filtered.length === 0 ? (
        <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-gray-400 text-xs">
          No matching camera observations found.
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((obs) => {
            const hasStress = obs.detection.detectedStresses.length > 0;
            const hasPest = obs.detection.pestPresence.detected;

            return (
              <div
                key={obs.id}
                className="p-4 bg-white hover:bg-gray-50 rounded-2xl border border-gray-200 hover:border-[#a5d6a7] transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs group"
              >
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 bg-[#e8f5e9] text-[#2e7d32] rounded-md text-[10px] font-mono font-bold">
                      {obs.zoneName}
                    </span>
                    <span className="text-xs font-bold text-gray-900 truncate">
                      {obs.cropName}
                    </span>
                    <span className="text-[11px] text-gray-400">
                      {obs.dateFormatted}
                    </span>
                  </div>

                  <p className="text-xs text-gray-600 line-clamp-1">
                    {obs.advice.whatISee}
                  </p>

                  <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono">
                    <span>Canopy: {obs.detection.canopyCoveragePercent}%</span>
                    <span>•</span>
                    <span>Moisture: {obs.fusedSensorContext?.soilMoisturePercent ?? '--'}%</span>
                    {hasStress && (
                      <span className="text-amber-600 font-bold">• Stress Logged</span>
                    )}
                    {hasPest && (
                      <span className="text-rose-600 font-bold">• Pest Flag</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => onSelectObservation(obs)}
                    className="px-3 py-1.5 min-h-[36px] bg-[#e8f5e9] hover:bg-[#2e7d32] text-[#2e7d32] hover:text-white rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Inspect
                  </button>

                  <button
                    onClick={() => onDeleteObservation(obs.id)}
                    className="p-2 min-h-[36px] text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                    title="Delete log"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
