import React, { useState } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  Droplets, 
  Activity, 
  RotateCcw,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { IrrigationVerificationResult } from '../../types/intelligence/farmIntelligenceTypes';
import { farmPredictionService } from '../../services/intelligence/farmPredictionService';

interface IrrigationVerificationProps {
  verification: IrrigationVerificationResult;
  currentMoisture: number;
  onRefresh: () => void;
}

export const IrrigationVerification: React.FC<IrrigationVerificationProps> = ({
  verification,
  currentMoisture,
  onRefresh
}) => {
  const [testBefore, setTestBefore] = useState<number>(23);
  const [testAfter, setTestAfter] = useState<number>(38);
  const [showLogger, setShowLogger] = useState(false);

  const handleSimulateLog = () => {
    farmPredictionService.logIrrigationEvent(testBefore, testAfter);
    setShowLogger(false);
    onRefresh();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'effective':
        return {
          bg: 'bg-emerald-100 text-emerald-900 border-[#c8e6c9]',
          label: '✅ Effective Penetration'
        };
      case 'low_change':
        return {
          bg: 'bg-amber-100 text-amber-900 border-amber-300',
          label: '🟡 Low Moisture Response'
        };
      case 'no_change_or_drop':
        return {
          bg: 'bg-rose-100 text-rose-800 border-rose-300',
          label: '🔴 No Moisture Infiltration'
        };
      case 'insufficient_data':
      default:
        return {
          bg: 'bg-gray-100 text-gray-700 border-gray-200',
          label: '⚪ Ready to Track'
        };
    }
  };

  const badge = getStatusBadge(verification.status);

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#c8e6c9] shadow-sm space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-[#e8f5e9] flex items-center justify-center text-[#2e7d32]">
            <Droplets className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-lg text-[#1b2e1b]">
              Irrigation Response Verification
            </h3>
            <p className="text-xs text-gray-500">
              Sensor delta comparison before and after watering events
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowLogger(!showLogger)}
          className="text-xs font-bold text-[#2e7d32] hover:underline"
        >
          {showLogger ? 'Close Logger' : 'Log Irrigation Event'}
        </button>
      </div>

      {/* Manual Logger Drawer */}
      {showLogger && (
        <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
          <span className="text-xs font-bold text-gray-800 block">
            Record Irrigation Run for Telemetry Verification
          </span>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-medium text-gray-600 block">
                Pre-Irrigation Moisture (%)
              </label>
              <input
                type="number"
                value={testBefore}
                onChange={(e) => setTestBefore(Number(e.target.value))}
                className="w-full mt-1 p-2 rounded-xl border border-gray-300 text-xs font-mono"
              />
            </div>
            <div>
              <label className="text-[11px] font-medium text-gray-600 block">
                Post-Irrigation Moisture (%)
              </label>
              <input
                type="number"
                value={testAfter}
                onChange={(e) => setTestAfter(Number(e.target.value))}
                className="w-full mt-1 p-2 rounded-xl border border-gray-300 text-xs font-mono"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={handleSimulateLog}
            className="w-full py-2 rounded-xl bg-[#2e7d32] text-white text-xs font-bold hover:bg-[#1b5e20] transition-colors"
          >
            Save & Evaluate Infiltration Response
          </button>
        </div>
      )}

      {/* Verification Results Panel */}
      <div className="p-4 rounded-2xl bg-[#fafdfa] border border-[#c8e6c9]/70 space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-serif font-bold text-sm text-gray-900">
            {verification.title}
          </span>
          <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${badge.bg}`}>
            {badge.label}
          </span>
        </div>

        {verification.hasRecord && (
          <div className="grid grid-cols-3 gap-2 text-center p-3 rounded-xl bg-white border border-gray-100">
            <div>
              <span className="text-[10px] text-gray-500 uppercase block">Before Run</span>
              <span className="font-mono font-bold text-sm text-gray-800">
                {verification.beforeMoisture}%
              </span>
            </div>
            <div>
              <span className="text-[10px] text-gray-500 uppercase block">After Run</span>
              <span className="font-mono font-bold text-sm text-gray-800">
                {verification.afterMoisture}%
              </span>
            </div>
            <div>
              <span className="text-[10px] text-gray-500 uppercase block">Response Delta</span>
              <span className={`font-mono font-bold text-sm ${verification.deltaMoisture! > 0 ? 'text-[#2e7d32]' : 'text-rose-600'}`}>
                {verification.deltaMoisture! > 0 ? `+${verification.deltaMoisture}%` : `${verification.deltaMoisture}%`}
              </span>
            </div>
          </div>
        )}

        <div className="space-y-1 text-xs">
          <p className="text-gray-700">
            <span className="font-semibold text-gray-900">Observation: </span>
            {verification.observationMessage}
          </p>
          <p className="text-gray-600">
            <span className="font-semibold text-gray-900">Action: </span>
            {verification.suggestedAction}
          </p>
        </div>

        <div className="pt-2 border-t border-gray-200/60 flex items-center justify-between text-[10px] text-gray-500">
          <span>Observation mode: Evaluated via volumetric soil sensor dynamics</span>
          <span>Disclaimer: Non-guaranteed physical observation</span>
        </div>
      </div>
    </div>
  );
};
