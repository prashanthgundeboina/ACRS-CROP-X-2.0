import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  FileText, 
  Search, 
  Filter, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ShieldCheck,
  ChevronDown,
  Layers
} from 'lucide-react';
import { FarmAuditLogRecord } from '../../types/autonomous/farmAutonomousTypes';

interface FarmAuditLogViewerProps {
  logs: FarmAuditLogRecord[];
}

export const FarmAuditLogViewer: React.FC<FarmAuditLogViewerProps> = ({ logs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDecision, setFilterDecision] = useState<string>('all');

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.triggeredEvent.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.supervisorRecommendation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.actionPerformed.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterDecision === 'all' || log.farmerDecision.toLowerCase() === filterDecision.toLowerCase();

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              <FileText className="w-5 h-5" />
            </span>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Autonomous Farm Decision Audit Log
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Immutable chronological record of events, agent activations, farmer authorizations, and field outcomes.
          </p>
        </div>

        <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-xs font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
          {logs.length} Total Audit Records
        </span>
      </div>

      {/* Filter and Search controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search audit trail..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-400">Filter by:</span>
          {['all', 'Approved', 'Modified', 'Rejected', 'Automated'].map((decision) => (
            <button
              key={decision}
              onClick={() => setFilterDecision(decision)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-colors ${
                filterDecision.toLowerCase() === decision.toLowerCase()
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {decision}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Log Timeline */}
      <div className="space-y-4">
        {filteredLogs.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
              No audit logs match your search criteria.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      {log.timestamp}
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      Event: {log.triggeredEvent}
                    </span>
                  </div>

                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase self-start sm:self-auto ${
                    log.farmerDecision === 'Approved'
                      ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                      : log.farmerDecision === 'Rejected'
                      ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                      : 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300'
                  }`}>
                    Decision: {log.farmerDecision}
                  </span>
                </div>

                {/* Agents Activated Chips */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Activated Agents:</span>
                  {log.agentsActivated.map((ag) => (
                    <span key={ag} className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[10px] font-semibold text-slate-700 dark:text-slate-300">
                      {ag}
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Supervisor Recommendation</span>
                    <p className="text-slate-800 dark:text-slate-200 font-medium">
                      {log.supervisorRecommendation}
                    </p>
                  </div>

                  <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-semibold">Action Performed & Outcome</span>
                    <p className="text-slate-800 dark:text-slate-200 font-medium">
                      {log.actionPerformed}
                    </p>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">
                      ✓ {log.verificationResult}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
