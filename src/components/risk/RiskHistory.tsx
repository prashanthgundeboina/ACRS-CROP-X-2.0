import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  History, 
  Eye, 
  Camera, 
  Plus, 
  Trash2, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Clock, 
  ShieldCheck, 
  FileText,
  X
} from 'lucide-react';
import { RiskHistoryEntry, PlantObservationHistory, CropRiskLevel } from '../../types/cropRisk';
import { riskSignalService } from '../../services/riskSignalService';

interface RiskHistoryProps {
  cropName: string;
  isExpertMode: boolean;
  onOpenPlantScan: () => void;
}

export const RiskHistory: React.FC<RiskHistoryProps> = ({
  cropName,
  isExpertMode,
  onOpenPlantScan
}) => {
  const [historyList, setHistoryList] = useState<RiskHistoryEntry[]>([]);
  const [plantObservations, setPlantObservations] = useState<PlantObservationHistory[]>([]);
  const [isAddingObs, setIsAddingObs] = useState(false);
  const [newFinding, setNewFinding] = useState('');
  const [newSeverity, setNewSeverity] = useState<'LOW' | 'WATCH' | 'MODERATE' | 'HIGH'>('WATCH');
  const [newAction, setNewAction] = useState('');

  const loadData = () => {
    setHistoryList(riskSignalService.getRiskHistory());
    setPlantObservations(riskSignalService.getPlantObservations());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddObservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFinding.trim()) return;

    riskSignalService.recordPlantObservation({
      cropName,
      source: 'field_scout',
      finding: newFinding.trim(),
      severity: newSeverity,
      actionTaken: newAction.trim() || undefined,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    });

    setNewFinding('');
    setNewAction('');
    setIsAddingObs(false);
    loadData();
  };

  const handleDeleteObservation = (id: string) => {
    riskSignalService.deletePlantObservation(id);
    loadData();
  };

  const getLevelPill = (level: CropRiskLevel) => {
    switch (level) {
      case 'HIGH':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'MODERATE':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'WATCH':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'LOW':
      default:
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-[#c8e6c9] shadow-sm p-6 sm:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#2e7d32] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Audit & Observations
            </span>
            <span className="text-xs text-gray-500">• Timeline of real crop risk changes</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#1b2e1b] mt-1 flex items-center gap-2">
            📜 Risk History & Scouting Records
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onOpenPlantScan}
            className="px-3.5 py-2 rounded-xl bg-[#2e7d32] hover:bg-[#1b5e20] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 min-h-[44px]"
          >
            <Camera className="w-4 h-4" />
            <span>📷 AI Plant Scan</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddingObs(!isAddingObs)}
            className="px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold transition-all flex items-center gap-1.5 min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            <span>Log Field Scout</span>
          </button>
        </div>
      </div>

      {/* Manual Observation Form Drawer */}
      <AnimatePresence>
        {isAddingObs && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleAddObservation}
            className="p-5 rounded-2xl bg-[#f8fcf8] border border-[#c8e6c9] space-y-4"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-[#2e7d32]" /> Log Manual Field Scouting Observation
              </h4>
              <button
                type="button"
                onClick={() => setIsAddingObs(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 space-y-1">
                <label className="text-[10px] uppercase font-bold text-gray-600">
                  What did you observe? (e.g. slight yellow spots on lower leaves)
                </label>
                <input
                  type="text"
                  required
                  value={newFinding}
                  onChange={(e) => setNewFinding(e.target.value)}
                  placeholder="e.g. Mild leaf curl on north border rows..."
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-[#2e7d32] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-gray-600">
                  Severity Level
                </label>
                <select
                  value={newSeverity}
                  onChange={(e) => setNewSeverity(e.target.value as 'LOW' | 'WATCH' | 'MODERATE' | 'HIGH')}
                  className="w-full px-3 py-2 rounded-xl border border-gray-300 text-xs bg-white focus:ring-2 focus:ring-[#2e7d32] focus:outline-none"
                >
                  <option value="LOW">🟢 Low / Minor</option>
                  <option value="WATCH">👀 Watch / Noticeable</option>
                  <option value="MODERATE">🟡 Moderate Concern</option>
                  <option value="HIGH">🔴 High Alert</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-gray-600">
                Action Taken / Planned (Optional)
              </label>
              <input
                type="text"
                value={newAction}
                onChange={(e) => setNewAction(e.target.value)}
                placeholder="e.g. Pruned affected leaves and cleared furrow weeds."
                className="w-full px-3.5 py-2 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-[#2e7d32] focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddingObs(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#2e7d32] text-white text-xs font-bold hover:bg-[#1b5e20] shadow-sm min-h-[44px]"
              >
                Save Scouting Record
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Two Columns: Recent Plant Observations & Risk History Snapshots */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Column 1: Plant Observations & Scouting */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600 flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-[#2e7d32]" />
            Field Scouting & Vision Scan Logs ({plantObservations.length})
          </h4>

          {plantObservations.length === 0 ? (
            <div className="p-6 rounded-2xl bg-[#f8fcf8] border border-dashed border-[#c8e6c9] text-center space-y-2">
              <p className="text-xs text-gray-500 font-medium">
                No scouting logs recorded yet. Use AI Plant Scan or Log Field Scout to save leaf observations.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
              {plantObservations.map((obs) => (
                <div
                  key={obs.id}
                  className="p-3.5 rounded-2xl border border-gray-200 bg-white hover:border-[#c8e6c9] transition-colors space-y-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getLevelPill(obs.severity)}`}>
                        {obs.severity}
                      </span>
                      <span className="text-xs font-bold text-gray-800">
                        {obs.source === 'vision_scan' ? '📷 AI Vision Scan' : '🌾 Manual Scout'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-400 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {obs.date}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteObservation(obs.id)}
                        className="text-gray-300 hover:text-rose-500 p-1"
                        title="Delete log"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-gray-700 leading-snug font-medium">
                    {obs.finding}
                  </p>

                  {obs.actionTaken && (
                    <p className="text-[11px] text-emerald-800 bg-emerald-50/80 p-2 rounded-xl font-semibold">
                      Action: {obs.actionTaken}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Column 2: Changing Risk Level History Timeline */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600 flex items-center gap-1.5">
            <History className="w-3.5 h-3.5 text-[#2e7d32]" />
            Risk Index Evolution ({historyList.length})
          </h4>

          {historyList.length === 0 ? (
            <div className="p-6 rounded-2xl bg-[#f8fcf8] border border-dashed border-[#c8e6c9] text-center space-y-2">
              <p className="text-xs text-gray-500 font-medium">
                System actively recording risk snapshots as weather and farm data change.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
              {historyList.map((entry) => (
                <div
                  key={entry.id}
                  className="p-3.5 rounded-2xl border border-gray-200 bg-white hover:border-[#c8e6c9] transition-colors space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getLevelPill(entry.overallLevel)}`}>
                        {entry.overallLevel}
                      </span>
                      <span className="text-xs font-bold text-gray-800">
                        {entry.dominantRisk}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 font-mono">
                      {isExpertMode && (
                        <span className="text-xs font-bold text-gray-700">
                          {entry.overallScore}/100
                        </span>
                      )}
                      <span className="text-[10px] text-gray-400">
                        {entry.date}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-gray-600 leading-snug">
                    {entry.topFactor}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
