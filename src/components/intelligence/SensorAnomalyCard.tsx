import React from 'react';
import { motion } from 'motion/react';
import { 
  Radio, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight, 
  Cpu, 
  Wrench,
  HelpCircle
} from 'lucide-react';
import { SensorAnomalyReport } from '../../types/intelligence/farmIntelligenceTypes';

interface SensorAnomalyCardProps {
  anomalyReport: SensorAnomalyReport;
  onOpenIoTDiagnostics: () => void;
}

export const SensorAnomalyCard: React.FC<SensorAnomalyCardProps> = ({
  anomalyReport,
  onOpenIoTDiagnostics
}) => {
  if (!anomalyReport.hasAnomaly) {
    return (
      <div className="bg-[#f1f8e9] rounded-3xl p-4 sm:p-5 border border-[#c8e6c9] flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#c8e6c9] flex items-center justify-center text-[#2e7d32] shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-[#1b2e1b] flex items-center gap-2">
              <span>{anomalyReport.title}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#2e7d32] text-white">
                CRC Verified
              </span>
            </h4>
            <p className="text-xs text-gray-600">
              {anomalyReport.message}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenIoTDiagnostics}
          className="text-xs font-bold text-[#2e7d32] hover:underline flex items-center gap-1"
        >
          <span>IoT Hub Diagnostics</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  // Anomaly Active
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-amber-50/90 rounded-3xl p-5 border-2 border-amber-300 shadow-sm space-y-3"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-200 text-amber-900 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-serif font-bold text-base text-amber-950">
                {anomalyReport.title}
              </h4>
              <span className="text-[10px] font-mono font-black uppercase px-2.5 py-0.5 rounded-md bg-amber-200 text-amber-900 border border-amber-400">
                Unusual Reading Isolated
              </span>
            </div>
            <p className="text-xs text-amber-900 font-medium mt-0.5">
              {anomalyReport.message}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenIoTDiagnostics}
          className="py-2 px-3.5 rounded-xl bg-amber-200 hover:bg-amber-300 text-amber-950 font-bold text-xs flex items-center gap-1.5 transition-colors shrink-0"
        >
          <Wrench className="w-3.5 h-3.5" />
          <span>Fix in Diagnostics</span>
        </button>
      </div>

      <div className="p-3.5 rounded-2xl bg-white/90 border border-amber-200 text-xs space-y-2 text-amber-950">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div>
            <span className="text-[10px] font-black uppercase text-amber-800 block">Why isolated?</span>
            <p className="text-xs text-gray-700 mt-0.5">
              {anomalyReport.explanation.why}
            </p>
          </div>
          <div>
            <span className="text-[10px] font-black uppercase text-amber-800 block">Farmer Action:</span>
            <p className="text-xs font-semibold text-gray-900 mt-0.5">
              {anomalyReport.explanation.action}
            </p>
          </div>
        </div>

        <div className="pt-2 border-t border-amber-100 flex items-center justify-between text-[11px] text-gray-500 font-mono">
          <span>Safety Mechanism: Mathematical baseline used during verification</span>
          <span>Confidence: {anomalyReport.confidence.score}%</span>
        </div>
      </div>
    </motion.div>
  );
};
