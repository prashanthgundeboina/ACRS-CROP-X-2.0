import React, { useState, useEffect, useRef } from 'react';
import { SoilData } from '../types';
import { Wifi, Radio, RefreshCw, Zap, BatteryCharging, CheckCircle, Pause, Play, AlertCircle, Cpu, WifiOff, ShieldAlert, RotateCcw } from 'lucide-react';

interface Props {
  currentData: SoilData;
  onUpdateSoilData: (newData: Partial<SoilData>) => void;
}

export const LiveSensorSync: React.FC<Props> = ({ currentData, onUpdateSoilData }) => {
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [intervalMs, setIntervalMs] = useState<number>(3000);
  const [activeNode, setActiveNode] = useState<string>('Node-Alpha-01');
  const [lastSyncTime, setLastSyncTime] = useState<string>(new Date().toLocaleTimeString());
  const [batteryLevel, setBatteryLevel] = useState<number>(94);
  const [rssi, setRssi] = useState<number>(-62);
  const [simulatedSpike, setSimulatedSpike] = useState<string | null>(null);

  // Exponential Backoff Retry State
  const [isSimulatingFailure, setIsSimulatingFailure] = useState<boolean>(false);
  const [retryAttempt, setRetryAttempt] = useState<number>(0);
  const [nextRetrySeconds, setNextRetrySeconds] = useState<number>(0);
  const [syncStatus, setSyncStatus] = useState<'synced' | 'retrying' | 'failed'>('synced');
  const [retryLogs, setRetryLogs] = useState<{ id: string; time: string; msg: string; type: 'success' | 'warn' | 'error' }[]>([]);

  const retryTimeoutRef = useRef<any>(null);
  const countdownIntervalRef = useRef<any>(null);

  const maxRetries = 5;
  const baseDelayMs = 1000; // Initial backoff 1s

  // Exponential backoff calculator: delay = baseDelay * 2^attempt
  const calculateBackoffDelay = (attempt: number) => {
    const exponential = Math.pow(2, attempt);
    const jitter = Math.floor(Math.random() * 300); // randomize jitter up to 300ms
    return Math.min(32000, baseDelayMs * exponential + jitter);
  };

  const handleSyncAttempt = (attempt: number) => {
    if (isSimulatingFailure) {
      if (attempt >= maxRetries) {
        setSyncStatus('failed');
        setRetryLogs(prev => [
          {
            id: String(Date.now()),
            time: new Date().toLocaleTimeString(),
            msg: `Max retry limit reached (${maxRetries}/${maxRetries}). Sensor Mesh offline. Switch to offline local mode.`,
            type: 'error'
          },
          ...prev.slice(0, 8)
        ]);
        return;
      }

      const nextAttempt = attempt + 1;
      const delayMs = calculateBackoffDelay(attempt);
      const delaySec = Math.round(delayMs / 1000);

      setSyncStatus('retrying');
      setRetryAttempt(nextAttempt);
      setNextRetrySeconds(delaySec);

      setRetryLogs(prev => [
        {
          id: String(Date.now()),
          time: new Date().toLocaleTimeString(),
          msg: `HTTP 503 Gateway Timeout on ${activeNode}. Exponential backoff retry #${nextAttempt} scheduled in ${delaySec}s (${delayMs}ms delay).`,
          type: 'warn'
        },
        ...prev.slice(0, 8)
      ]);

      // Countdown timer for user interface
      let remainingSec = delaySec;
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = setInterval(() => {
        remainingSec -= 1;
        setNextRetrySeconds(Math.max(0, remainingSec));
        if (remainingSec <= 0) clearInterval(countdownIntervalRef.current);
      }, 1000);

      // Schedule next backoff retry
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = setTimeout(() => {
        handleSyncAttempt(nextAttempt);
      }, delayMs);
    } else {
      // Successful Sync
      setSyncStatus('synced');
      setRetryAttempt(0);
      setNextRetrySeconds(0);
      setLastSyncTime(new Date().toLocaleTimeString());

      // Fluctuations
      const deltaN = (Math.random() - 0.5) * 4;
      const deltaMoisture = (Math.random() - 0.5) * 2;
      const deltaTemp = (Math.random() - 0.5) * 0.8;
      const deltaPh = (Math.random() - 0.5) * 0.1;

      const newN = Math.min(250, Math.max(10, Math.round((currentData.nitrogen || 120) + deltaN)));
      const newMoisture = Math.min(100, Math.max(5, Math.round(((currentData.soil_moisture || currentData.moisture) || 32) + deltaMoisture)));
      const newTemp = Math.min(50, Math.max(10, Math.round(((currentData.temperature || 28) + deltaTemp) * 10) / 10));
      const newPh = Math.min(14, Math.max(3, Math.round(((currentData.ph || 6.5) + deltaPh) * 10) / 10));

      onUpdateSoilData({
        nitrogen: newN,
        soil_moisture: newMoisture,
        moisture: newMoisture,
        temperature: newTemp,
        ph: newPh
      });

      setRssi(-60 - Math.floor(Math.random() * 8));

      if (Math.random() < 0.15) {
        setSimulatedSpike(`Telemetry notice: Minor shift in soil moisture to ${newMoisture}% on ${activeNode}`);
      } else {
        setSimulatedSpike(null);
      }
    }
  };

  useEffect(() => {
    let timer: any = null;
    if (isStreaming && syncStatus !== 'retrying') {
      timer = setInterval(() => {
        handleSyncAttempt(retryAttempt);
      }, intervalMs);
    }
    return () => {
      if (timer) clearInterval(timer);
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [isStreaming, intervalMs, isSimulatingFailure, activeNode, currentData, syncStatus, retryAttempt]);

  const toggleSimulatedFailure = () => {
    if (isSimulatingFailure) {
      // Recovering connection
      setIsSimulatingFailure(false);
      setSyncStatus('synced');
      setRetryAttempt(0);
      setNextRetrySeconds(0);
      if (retryTimeoutRef.current) clearTimeout(retryTimeoutRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      setRetryLogs(prev => [
        {
          id: String(Date.now()),
          time: new Date().toLocaleTimeString(),
          msg: `Network link re-established with ${activeNode}. Sensor sync restored to 200 OK.`,
          type: 'success'
        },
        ...prev.slice(0, 8)
      ]);
    } else {
      // Triggering failure to initiate backoff
      setIsSimulatingFailure(true);
      handleSyncAttempt(0);
    }
  };

  return (
    <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-[#c8e6c9] shadow-sm space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#c8e6c9] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[#4CAF50]">
            <Radio className="w-5 h-5 animate-pulse text-[#2e7d32]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#2e7d32]">IoT Sensor Mesh Stream</span>
          </div>
          <h3 className="font-serif text-2xl font-bold text-[#1b2e1b]">Live IoT Field Sensor Sync</h3>
          <p className="text-xs text-[#667e66]">Real-time telemetry streaming with exponential backoff strategy for resilient network drops.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleSimulatedFailure}
            className={`px-4 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all ${
              isSimulatingFailure
                ? 'bg-red-600 hover:bg-red-700 text-white shadow-md'
                : 'bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300'
            }`}
          >
            {isSimulatingFailure ? (
              <>
                <RotateCcw className="w-4 h-4 animate-spin" /> Restore Link (Recover)
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 text-amber-700" /> Test Network Outage
              </>
            )}
          </button>

          <button
            onClick={() => setIsStreaming(!isStreaming)}
            className={`px-5 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 shadow-sm transition-all ${
              isStreaming
                ? 'bg-[#1b2e1b] text-white hover:bg-black'
                : 'bg-[#4CAF50] text-white hover:bg-[#2e7d32]'
            }`}
          >
            {isStreaming ? (
              <>
                <Pause className="w-4 h-4" /> Pause Streaming
              </>
            ) : (
              <>
                <Play className="w-4 h-4" /> Start Live Sync
              </>
            )}
          </button>
        </div>
      </div>

      {/* Sensor Controls & Telemetry Monitor */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Node Selection & Sampling Rate */}
        <div className="p-5 bg-[#f8fcf8] rounded-3xl border border-[#c8e6c9] space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-[#2e7d32] flex items-center justify-between">
            <span>Select Probe Node</span>
            <Cpu className="w-4 h-4 text-[#4CAF50]" />
          </div>

          <div className="space-y-2">
            {[
              { id: 'Node-Alpha-01', location: 'North Quadrant (Silty Loam)', status: 'Online' },
              { id: 'Node-Beta-02', location: 'South Greenhouse (Clay)', status: 'Online' },
              { id: 'Node-Gamma-03', location: 'East Orchard (Sandy Loam)', status: 'Online' }
            ].map(node => (
              <button
                key={node.id}
                onClick={() => {
                  setActiveNode(node.id);
                  setSyncStatus('synced');
                  setRetryAttempt(0);
                  setIsSimulatingFailure(false);
                }}
                className={`w-full p-3 rounded-2xl border text-left transition-all ${
                  activeNode === node.id
                    ? 'bg-white border-[#4CAF50] shadow-sm font-bold'
                    : 'bg-white/60 border-gray-200 hover:border-[#c8e6c9]'
                }`}
              >
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[#1b2e1b]">{node.id}</span>
                  <span className={`w-2 h-2 rounded-full ${syncStatus === 'synced' ? 'bg-emerald-500 animate-ping' : 'bg-red-500 animate-pulse'}`} />
                </div>
                <div className="text-[10px] text-gray-500">{node.location}</div>
              </button>
            ))}
          </div>

          <div className="pt-2 border-t border-[#c8e6c9] flex justify-between items-center text-xs">
            <span className="text-gray-600 font-medium">Sampling Rate</span>
            <select
              value={intervalMs}
              onChange={(e) => setIntervalMs(Number(e.target.value))}
              className="bg-white border border-[#c8e6c9] text-xs font-bold rounded-xl px-2 py-1 outline-none"
            >
              <option value={1000}>1 sec (Fast)</option>
              <option value={3000}>3 sec (Normal)</option>
              <option value={5000}>5 sec (Eco)</option>
            </select>
          </div>
        </div>

        {/* Live Signal Status Display */}
        <div className="md:col-span-2 p-5 bg-[#1b2e1b] text-white rounded-3xl border border-[#2e7d32] space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#2e7d32] pb-3">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl text-white ${syncStatus === 'synced' ? 'bg-[#2e7d32]' : 'bg-red-700'}`}>
                {syncStatus === 'synced' ? <Wifi className="w-5 h-5" /> : <WifiOff className="w-5 h-5 animate-bounce" />}
              </div>
              <div>
                <div className="text-xs font-bold text-white flex items-center gap-2">
                  <span>{activeNode} Telemetry Stream</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${
                    syncStatus === 'synced'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                      : 'bg-red-500/30 text-red-300 border border-red-500/50 animate-pulse'
                  }`}>
                    {syncStatus === 'synced' ? 'STREAMING ACTIVE' : `EXPONENTIAL BACKOFF: RETRY #${retryAttempt}`}
                  </span>
                </div>
                <div className="text-[10px] text-gray-400 font-mono">
                  {syncStatus === 'synced' ? `Last Synced: ${lastSyncTime}` : `Next Retry in: ${nextRetrySeconds}s (Delay: ${calculateBackoffDelay(Math.max(0, retryAttempt-1))}ms)`}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-mono text-[#81c784]">
              <span className="flex items-center gap-1">
                <Radio className="w-3.5 h-3.5 text-amber-400" /> {rssi} dBm
              </span>
              <span className="flex items-center gap-1">
                <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" /> {batteryLevel}%
              </span>
            </div>
          </div>

          {/* Exponential Backoff Banner if Retrying */}
          {syncStatus !== 'synced' && (
            <div className="p-4 bg-red-950/80 border border-red-800 rounded-2xl text-xs space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="font-bold text-red-300 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-red-400 animate-spin" />
                  Intermittent Network Drop — Exponential Backoff Strategy Engaged
                </span>
                <span className="font-mono text-[10px] bg-red-900 text-red-200 px-2 py-0.5 rounded-full font-bold">
                  Attempt {retryAttempt} / {maxRetries}
                </span>
              </div>
              <p className="text-gray-300 text-[11px]">
                System automatically retrying connection with delay formula: <code className="bg-black/40 text-emerald-400 px-1.5 py-0.5 rounded">Delay = 1000ms × 2<sup>{retryAttempt - 1}</sup> + Jitter</code>.
              </p>
            </div>
          )}

          {/* Realtime Live Metric Gauges */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3 bg-[#122012] rounded-2xl border border-[#2e7d32]/50">
              <div className="text-[10px] font-bold text-[#81c784] uppercase">Nitrogen (N)</div>
              <div className="text-xl font-black font-mono text-white mt-1">{currentData.nitrogen || 120} <span className="text-[10px] font-normal text-gray-400">ppm</span></div>
            </div>
            <div className="p-3 bg-[#122012] rounded-2xl border border-[#2e7d32]/50">
              <div className="text-[10px] font-bold text-[#81c784] uppercase">Soil Moisture</div>
              <div className="text-xl font-black font-mono text-white mt-1">{currentData.soil_moisture || currentData.moisture || 32}%</div>
            </div>
            <div className="p-3 bg-[#122012] rounded-2xl border border-[#2e7d32]/50">
              <div className="text-[10px] font-bold text-[#81c784] uppercase">Soil Temp</div>
              <div className="text-xl font-black font-mono text-white mt-1">{currentData.temperature || 28}°C</div>
            </div>
            <div className="p-3 bg-[#122012] rounded-2xl border border-[#2e7d32]/50">
              <div className="text-[10px] font-bold text-[#81c784] uppercase">Soil pH</div>
              <div className="text-xl font-black font-mono text-white mt-1">{currentData.ph || 6.5}</div>
            </div>
          </div>

          {/* Retry Audit Telemetry Logs */}
          {retryLogs.length > 0 && (
            <div className="space-y-1.5 pt-2 border-t border-white/10">
              <div className="text-[10px] font-mono text-[#81c784] uppercase font-bold">Network Retry Audit Log</div>
              <div className="max-h-24 overflow-y-auto space-y-1 font-mono text-[10px]">
                {retryLogs.map(log => (
                  <div key={log.id} className={`px-2 py-1 rounded ${log.type === 'error' ? 'bg-red-900/50 text-red-200' : log.type === 'warn' ? 'bg-amber-900/40 text-amber-200' : 'bg-emerald-900/40 text-emerald-200'}`}>
                    <span className="opacity-60">{log.time}</span> - {log.msg}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

