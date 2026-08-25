import React, { useState } from 'react';
import { 
  CheckCircle, 
  AlertCircle, 
  HelpCircle, 
  Activity, 
  ArrowRight, 
  RefreshCw, 
  ShieldAlert,
  Play
} from 'lucide-react';
import { irrigationVerificationService } from '../../services/resources/irrigationVerificationService';
import { IrrigationVerificationEvent } from '../../types/resources/farmResourceTypes';

interface IrrigationVerificationCardProps {
  onSelectTab?: (tab: string) => void;
}

export const IrrigationVerificationCard: React.FC<IrrigationVerificationCardProps> = ({
  onSelectTab
}) => {
  const [events, setEvents] = useState<IrrigationVerificationEvent[]>(() => irrigationVerificationService.getEvents());
  const [isVerifying, setIsVerifying] = useState(false);

  const handleRunManualVerification = () => {
    setIsVerifying(true);
    setTimeout(() => {
      const newEvent = irrigationVerificationService.verifyIrrigationSession({
        zoneId: 'z1',
        zoneName: 'North Field A',
        durationMinutes: 40,
        estimatedWaterLiters: 14000,
        preMoisturePercent: 23,
        postMoisturePercent: 44
      });
      setEvents(irrigationVerificationService.getEvents());
      setIsVerifying(false);
    }, 600);
  };

  const getStatusBadge = (status: IrrigationVerificationEvent['status']) => {
    switch (status) {
      case 'Effective':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Effective Response</span>
          </span>
        );
      case 'Partially effective':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Partially Effective</span>
          </span>
        );
      case 'No significant response':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-500/20 text-red-300 border border-red-500/30 flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>No Significant Response</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-700 text-slate-300">
            Insufficient Data
          </span>
        );
    }
  };

  return (
    <div id="irrigation-verification-card" className="bg-[#111C15]/90 border border-[#2E4A38]/50 rounded-2xl p-5 md:p-6 backdrop-blur-md shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#2E4A38]/40">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/30 text-teal-400">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg md:text-xl font-bold text-slate-100">Irrigation Verification</h2>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                Pre vs Post Telemetry
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Validating whether watering sessions successfully reach and infiltrate the root zone
            </p>
          </div>
        </div>

        <button
          onClick={handleRunManualVerification}
          disabled={isVerifying}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white text-xs font-semibold shadow-lg shadow-teal-900/30 transition-all cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
          <span>Verify Latest Cycle</span>
        </button>
      </div>

      {/* Safety Notice Guard */}
      <div className="mt-4 p-3 rounded-xl bg-blue-950/30 border border-blue-800/30 flex items-start gap-2.5 text-xs text-slate-300">
        <HelpCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-blue-300">Agronomic Safety Rule: </strong>
          Low sensor response may be caused by dry macro-pores, localized drip dripper clogging, or loose soil contact. CroperX recommends physical lateral inspection before assuming equipment failure.
        </div>
      </div>

      {/* Verification Sessions List */}
      <div className="mt-5 space-y-3">
        {events.map(event => (
          <div 
            key={event.id}
            className="p-4 rounded-xl bg-[#18291F]/50 border border-[#2E4A38]/40 hover:border-[#2E4A38]/70 transition-all"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[#2E4A38]/30">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-100 text-sm">{event.zoneName}</span>
                <span className="text-xs text-slate-400">• {event.date} at {event.startTime}</span>
                <span className="text-xs text-slate-400">• {event.durationMinutes} min ({event.estimatedWaterLiters.toLocaleString()} L)</span>
              </div>
              <div>{getStatusBadge(event.status)}</div>
            </div>

            {/* Soil Delta Visual */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-3 text-xs">
              <div className="p-2.5 rounded-lg bg-[#111C15]/70 border border-[#2E4A38]/30 flex items-center justify-between">
                <span className="text-slate-400">Pre-Watering Moisture</span>
                <span className="font-bold text-slate-200 text-sm">{event.preMoisturePercent}%</span>
              </div>

              <div className="p-2.5 rounded-lg bg-[#111C15]/70 border border-[#2E4A38]/30 flex items-center justify-between">
                <span className="text-slate-400">Post-Watering Moisture</span>
                <span className="font-bold text-emerald-400 text-sm">{event.postMoisturePercent}%</span>
              </div>

              <div className="p-2.5 rounded-lg bg-[#111C15]/70 border border-[#2E4A38]/30 flex items-center justify-between">
                <span className="text-slate-400">Infiltration Delta</span>
                <span className={`font-bold text-sm ${event.moistureDeltaPercent >= 10 ? 'text-emerald-400' : 'text-amber-400'}`}>
                  +{event.moistureDeltaPercent}%
                </span>
              </div>
            </div>

            {/* Feedback and Recommendation */}
            <div className="text-xs space-y-1">
              <div className="font-medium text-slate-200">{event.responseHeadline}</div>
              <div className="text-slate-400">
                <strong className="text-slate-300">Action: </strong>{event.recommendation}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
