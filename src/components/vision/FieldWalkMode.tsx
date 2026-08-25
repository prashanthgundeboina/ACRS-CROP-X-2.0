import React, { useState } from 'react';
import { 
  Footprints, 
  MapPin, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  Play, 
  Square, 
  Plus, 
  Download, 
  Share2, 
  Sparkles,
  Camera,
  Trash2,
  Calendar
} from 'lucide-react';
import { FieldWalkSession } from '../../types/fieldObservationTypes';
import { CropVisionObservation } from '../../types/visionTypes';
import { FarmZone } from '../../types';
import { fieldObservationService } from '../../services/fieldObservationService';

interface FieldWalkModeProps {
  farmZones: FarmZone[];
  activeSession: FieldWalkSession | null;
  onStartWalk: (zoneId: string, zoneName: string, cropName: string) => void;
  onCompleteWalk: (summaryNotes: string) => void;
  onSelectObservation?: (obs: CropVisionObservation) => void;
  onCaptureFrameForWalk?: () => void;
}

export const FieldWalkMode: React.FC<FieldWalkModeProps> = ({
  farmZones,
  activeSession,
  onStartWalk,
  onCompleteWalk,
  onSelectObservation,
  onCaptureFrameForWalk,
}) => {
  const [selectedZoneId, setSelectedZoneId] = useState<string>(farmZones[0]?.id || 'zone-1');
  const [walkNotes, setWalkNotes] = useState('');
  const [completedSummary, setCompletedSummary] = useState<FieldWalkSession | null>(null);

  const selectedZone = farmZones.find((z) => z.id === selectedZoneId) || farmZones[0];

  const handleStart = () => {
    if (!selectedZone) return;
    onStartWalk(selectedZone.id, selectedZone.name, selectedZone.assignedCrop || 'Rice');
    setCompletedSummary(null);
  };

  const handleFinish = () => {
    if (!activeSession) return;
    const completed = fieldObservationService.completeFieldWalk(walkNotes);
    if (completed) {
      setCompletedSummary(completed);
    }
    onCompleteWalk(walkNotes);
    setWalkNotes('');
  };

  const downloadSummaryText = () => {
    if (!completedSummary) return;
    const content = `CroperX Field Walk Inspection Report
Zone: ${completedSummary.zoneName} (${completedSummary.cropName})
Date: ${new Date(completedSummary.startedAt).toLocaleString()}
Total Plants Scanned: ${completedSummary.totalPlantsScanned}
Healthy: ${completedSummary.healthyCount}
Stress / Deficit: ${completedSummary.stressCount}
Pest / Disease: ${completedSummary.pestDiseaseCount}
Notes: ${completedSummary.summaryNote || 'None'}
`;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `field-walk-${completedSummary.zoneName.toLowerCase().replace(/\s+/g, '-')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#c8e6c9] shadow-sm space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#c8e6c9]/60 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 bg-[#e8f5e9] text-[#2e7d32] rounded-2xl">
            <Footprints className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold text-[#2e7d32] uppercase tracking-wider">
              Guided Field Walk Mode
            </span>
            <h4 className="text-base font-bold text-gray-900">
              Live Field Scouting & Observation Tour
            </h4>
          </div>
        </div>

        {activeSession && (
          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-mono font-bold flex items-center gap-1.5 animate-pulse">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            Walk Active ({activeSession.zoneName})
          </span>
        )}
      </div>

      {/* When NO walk is active */}
      {!activeSession && !completedSummary && (
        <div className="space-y-4">
          <p className="text-xs text-gray-600 leading-relaxed">
            Walk through your farm with your phone camera. CroperX counts inspected plants, tags visual stress or pest findings by zone, and compiles a comprehensive field inspection summary.
          </p>

          <div className="p-4 bg-[#f8fcf8] rounded-2xl border border-[#c8e6c9] space-y-3">
            <label className="text-xs font-bold text-gray-700 block">
              1. Choose Field Zone to Scout:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {farmZones.map((z) => {
                const isSel = z.id === selectedZoneId;
                return (
                  <button
                    key={z.id}
                    onClick={() => setSelectedZoneId(z.id)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSel
                        ? 'bg-[#1b2e1b] text-white border-[#2e7d32] shadow-md ring-2 ring-[#4CAF50]/30'
                        : 'bg-white text-gray-800 border-gray-200 hover:border-[#a5d6a7]'
                    }`}
                  >
                    <span className="text-xs font-bold block truncate">{z.name}</span>
                    <span className={`text-[10px] block truncate ${isSel ? 'text-gray-300' : 'text-gray-400'}`}>
                      {z.assignedCrop || 'Crop Zone'} • {z.areaHa || 1.5} ha
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={handleStart}
            className="w-full py-4 min-h-[48px] bg-[#2e7d32] hover:bg-[#1b2e1b] text-white rounded-2xl font-bold text-sm shadow-md active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Play className="w-4 h-4 fill-current" />
            Start Scouting Tour in {selectedZone ? selectedZone.name : 'Field'}
          </button>
        </div>
      )}

      {/* When a walk IS active */}
      {activeSession && (
        <div className="space-y-4">
          {/* Active Walk Stats Counter Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-[#f8fcf8] p-3 rounded-2xl border border-[#c8e6c9] text-center">
              <span className="text-[10px] text-gray-500 font-bold uppercase block">Plants Scanned</span>
              <span className="text-2xl font-black text-gray-900">{activeSession.totalPlantsScanned}</span>
            </div>
            <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-200 text-center">
              <span className="text-[10px] text-emerald-700 font-bold uppercase block">🟢 Healthy</span>
              <span className="text-2xl font-black text-emerald-800">{activeSession.healthyCount}</span>
            </div>
            <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200 text-center">
              <span className="text-[10px] text-amber-700 font-bold uppercase block">🟡 Water/Heat Stress</span>
              <span className="text-2xl font-black text-amber-800">{activeSession.stressCount}</span>
            </div>
            <div className="bg-rose-50 p-3 rounded-2xl border border-rose-200 text-center">
              <span className="text-[10px] text-rose-700 font-bold uppercase block">🔴 Pest/Disease</span>
              <span className="text-2xl font-black text-rose-800">{activeSession.pestDiseaseCount}</span>
            </div>
          </div>

          {/* Quick Capture Hint */}
          <div className="p-3.5 bg-emerald-950 text-white rounded-2xl flex items-center justify-between gap-3">
            <div className="text-xs space-y-0.5">
              <span className="font-bold text-emerald-400 block">Walk through the field rows</span>
              <span className="text-gray-300 text-[11px]">Point camera at crop leaves and tap &quot;Analyze Crop&quot; above to log plant health.</span>
            </div>
            {onCaptureFrameForWalk && (
              <button
                onClick={onCaptureFrameForWalk}
                className="px-3.5 py-2 bg-[#4CAF50] hover:bg-[#2e7d32] text-white rounded-xl text-xs font-bold whitespace-nowrap active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Camera className="w-3.5 h-3.5" />
                Snap Plant
              </button>
            )}
          </div>

          {/* End Walk Form */}
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <label className="text-xs font-bold text-gray-700 block">
              Tour Notes / Observations (Optional):
            </label>
            <input
              type="text"
              value={walkNotes}
              onChange={(e) => setWalkNotes(e.target.value)}
              placeholder="e.g. Checked rows 1-8 near borewell drip line..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs bg-white focus:ring-2 focus:ring-[#2e7d32] focus:outline-none"
            />
          </div>

          <button
            onClick={handleFinish}
            className="w-full py-3.5 min-h-[44px] bg-[#1b2e1b] hover:bg-black text-white rounded-2xl font-bold text-xs shadow-md active:scale-98 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Square className="w-4 h-4 fill-current text-rose-400" />
            Complete Field Walk & Generate Summary
          </button>
        </div>
      )}

      {/* Completed Summary View */}
      {completedSummary && (
        <div className="p-5 bg-gradient-to-br from-[#f8fcf8] to-[#edf7ee] rounded-2xl border border-[#c8e6c9] space-y-4 animate-fade-in">
          <div className="flex items-center justify-between border-b border-[#c8e6c9]/60 pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#2e7d32]" />
              <h5 className="text-sm font-bold text-gray-900">
                Field Walk Complete: {completedSummary.zoneName}
              </h5>
            </div>
            <span className="text-xs text-gray-500 font-mono">
              {new Date(completedSummary.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="bg-white p-2.5 rounded-xl border border-gray-100 text-center">
              <span className="text-[10px] text-gray-400 block">Scanned</span>
              <span className="text-lg font-black text-gray-900">{completedSummary.totalPlantsScanned}</span>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-gray-100 text-center">
              <span className="text-[10px] text-emerald-600 block">Healthy</span>
              <span className="text-lg font-black text-emerald-700">{completedSummary.healthyCount}</span>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-gray-100 text-center">
              <span className="text-[10px] text-amber-600 block">Stress</span>
              <span className="text-lg font-black text-amber-700">{completedSummary.stressCount}</span>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-gray-100 text-center">
              <span className="text-[10px] text-rose-600 block">Pest/Disease</span>
              <span className="text-lg font-black text-rose-700">{completedSummary.pestDiseaseCount}</span>
            </div>
          </div>

          {completedSummary.summaryNote && (
            <div className="p-3 bg-white rounded-xl border border-[#c8e6c9] text-xs text-gray-700">
              <strong>Farmer Notes:</strong> {completedSummary.summaryNote}
            </div>
          )}

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={downloadSummaryText}
              className="py-2.5 px-3.5 bg-[#2e7d32] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-[#1b2e1b] transition-all cursor-pointer shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              Download Report
            </button>
            <button
              onClick={() => setCompletedSummary(null)}
              className="py-2.5 px-3.5 bg-white text-gray-700 border border-gray-300 rounded-xl text-xs font-bold hover:bg-gray-50 transition-all cursor-pointer"
            >
              Start Another Tour
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
