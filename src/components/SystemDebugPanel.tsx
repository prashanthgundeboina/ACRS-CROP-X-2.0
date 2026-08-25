import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cpu, Terminal, Zap, Clock, ShieldCheck, Trash2, X, ChevronUp, ChevronDown, Activity } from 'lucide-react';
import { perfLogger, PerformanceLogEntry } from '../utils/performanceLogger';

export const SystemDebugPanel: React.FC = () => {
  const [logs, setLogs] = useState<PerformanceLogEntry[]>(() => perfLogger.getLogs());
  const [isOpen, setIsOpen] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = perfLogger.subscribe(() => {
      setLogs(perfLogger.getLogs());
    });
    return unsubscribe;
  }, []);

  const latestLog = logs[0];
  const avgTotalMs = logs.length > 0 
    ? (logs.reduce((acc, curr) => acc + curr.totalTimeMs, 0) / logs.length).toFixed(1)
    : '0';

  return (
    <div className="fixed bottom-4 right-4 z-40 font-sans">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-3 w-80 sm:w-96 bg-[#0f1d0f] text-white rounded-3xl border-2 border-[#4CAF50]/50 shadow-2xl p-5 space-y-4 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-[#4CAF50] rounded-xl text-white">
                  <Terminal className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-serif font-bold text-sm text-white">System Debug & Performance</h4>
                  <p className="text-[10px] text-emerald-300 font-mono">ML & Gemini API Execution Telemetry</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => perfLogger.clearLogs()}
                  title="Clear Logs"
                  className="p-1.5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Summary Metrics */}
            <div className="grid grid-cols-3 gap-2 text-center bg-black/40 p-2.5 rounded-2xl border border-white/5 font-mono text-xs">
              <div className="p-1.5">
                <div className="text-[9px] text-gray-400 uppercase">Latest ML</div>
                <div className="font-bold text-emerald-400 mt-0.5">{latestLog ? `${latestLog.mlTimeMs}ms` : 'N/A'}</div>
              </div>
              <div className="p-1.5 border-x border-white/10">
                <div className="text-[9px] text-gray-400 uppercase">Gemini AI</div>
                <div className="font-bold text-amber-300 mt-0.5">{latestLog ? `${latestLog.geminiTimeMs}ms` : 'N/A'}</div>
              </div>
              <div className="p-1.5">
                <div className="text-[9px] text-gray-400 uppercase">Avg Latency</div>
                <div className="font-bold text-sky-300 mt-0.5">{avgTotalMs}ms</div>
              </div>
            </div>

            {/* Log History Stream */}
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10">
              {logs.length === 0 ? (
                <div className="text-center py-6 text-xs text-gray-500 font-mono italic">
                  No prediction execution runs logged yet. Run a prediction to record timing metrics.
                </div>
              ) : (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-2.5 rounded-xl bg-black/30 border border-white/5 space-y-1 font-mono text-[11px]"
                  >
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="text-emerald-400 font-bold">[{log.timestamp}]</span>
                      <span className="px-1.5 py-0.2 rounded bg-emerald-900/60 text-emerald-200 border border-emerald-500/30">
                        {log.totalTimeMs}ms Total
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-gray-300 text-[10px]">
                      <span>ML Regressor: <strong className="text-white">{log.mlTimeMs}ms</strong></span>
                      <span>Gemini API: <strong className="text-amber-300">{log.geminiTimeMs}ms</strong></span>
                    </div>

                    <p className="text-[10px] text-gray-400 truncate">{log.note}</p>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Unobtrusive Launcher Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 bg-[#112211] hover:bg-[#1b2e1b] text-white px-3.5 py-2 rounded-2xl border border-[#4CAF50]/50 shadow-xl text-xs font-mono font-bold transition-all hover:scale-105 group"
      >
        <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
        <span>System Debug</span>
        {latestLog && (
          <span className="bg-[#2e7d32] text-emerald-200 text-[10px] px-1.5 py-0.2 rounded-md">
            {latestLog.totalTimeMs}ms
          </span>
        )}
        {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
};
