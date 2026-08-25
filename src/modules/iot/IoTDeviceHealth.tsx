import React from 'react';
import { motion } from 'motion/react';
import {
  Activity,
  CheckCircle2,
  Cpu,
  Clock,
  Zap,
  ShieldCheck,
  AlertTriangle,
  Layers,
  Terminal,
  Gauge,
  Radio
} from 'lucide-react';
import { IoTDeviceState } from '../../types/iot/iotTypes';

interface IoTDeviceHealthProps {
  state: IoTDeviceState;
  isExpertMode: boolean;
}

export const IoTDeviceHealth: React.FC<IoTDeviceHealthProps> = ({ state, isExpertMode }) => {
  const isConnected = state.connectionState === 'connected' || state.connectionState === 'receiving_data';
  const isReceiving = state.connectionState === 'receiving_data';

  const lastPacketSec = state.healthMetrics.lastPacketTimestamp
    ? Math.max(0, Math.round((Date.now() - state.healthMetrics.lastPacketTimestamp) / 1000))
    : null;

  const formatUptime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins < 60) return `${mins}m ${secs}s`;
    const hours = Math.floor(mins / 60);
    return `${hours}h ${mins % 60}m`;
  };

  return (
    <div className="bg-white rounded-3xl border border-[#c8e6c9] shadow-sm p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#c8e6c9] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[#2e7d32]">
            <Activity className="w-4 h-4 text-[#2e7d32]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#2e7d32]">
              Real-Time Hardware Link
            </span>
          </div>
          <h3 className="text-xl font-serif font-bold text-[#1b2e1b]">
            Sensor Health & Connection Telemetry
          </h3>
          <p className="text-xs text-gray-500">
            Continuous USB UART diagnostics, packet validation integrity, and device health metrics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-bold font-mono flex items-center gap-1.5 border ${
            isConnected
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-ping' : 'bg-rose-500'}`} />
            {isConnected ? 'HARDWARE ONLINE' : 'HARDWARE OFFLINE'}
          </span>
        </div>
      </div>

      {/* Primary Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Metric 1: Device Connection */}
        <div className="p-4 rounded-2xl bg-[#f8fcf8] border border-[#c8e6c9] space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 flex items-center justify-between">
            <span>Device Connection</span>
            <Cpu className="w-3.5 h-3.5 text-[#2e7d32]" />
          </div>
          <div className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-1.5 pt-1">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-gray-400'}`} />
            <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
          <div className="text-[10px] text-gray-500 font-mono">
            {state.handshake?.device_type || (state.isSimulatorActive ? 'Virtual ESP32' : 'No Node')}
          </div>
        </div>

        {/* Metric 2: USB Stream */}
        <div className="p-4 rounded-2xl bg-[#f8fcf8] border border-[#c8e6c9] space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 flex items-center justify-between">
            <span>Telemetry Stream</span>
            <Radio className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-1.5 pt-1">
            <span className={`w-2 h-2 rounded-full ${isReceiving ? 'bg-blue-500 animate-pulse' : isConnected ? 'bg-emerald-500' : 'bg-gray-400'}`} />
            <span>{isReceiving ? 'Receiving Data' : isConnected ? 'Idle Link' : 'No Stream'}</span>
          </div>
          <div className="text-[10px] text-gray-500 font-mono">
            {lastPacketSec !== null ? `${lastPacketSec}s ago` : 'Never'}
          </div>
        </div>

        {/* Metric 3: Total Packets Received */}
        <div className="p-4 rounded-2xl bg-[#f8fcf8] border border-[#c8e6c9] space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 flex items-center justify-between">
            <span>Packets Received</span>
            <Gauge className="w-3.5 h-3.5 text-purple-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-gray-900 pt-1">
            {state.healthMetrics.totalPacketsReceived.toLocaleString()}
          </div>
          <div className="text-[10px] text-gray-500 font-mono">
            Rate: {state.healthMetrics.packetsPerMinute} ppm
          </div>
        </div>

        {/* Metric 4: Connection Duration / Uptime */}
        <div className="p-4 rounded-2xl bg-[#f8fcf8] border border-[#c8e6c9] space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-gray-500 flex items-center justify-between">
            <span>Session Uptime</span>
            <Clock className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono text-gray-900 pt-1">
            {isConnected ? formatUptime(state.healthMetrics.connectionDurationSeconds) : '0s'}
          </div>
          <div className="text-[10px] text-gray-500 font-mono">
            Reconnects: {state.healthMetrics.reconnectAttempts}
          </div>
        </div>
      </div>

      {/* Expert Mode Detailed Diagnostics */}
      {isExpertMode && (
        <div className="pt-2 border-t border-gray-100 space-y-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 flex items-center gap-1.5">
            <Terminal className="w-3.5 h-3.5 text-[#2e7d32]" />
            <span>Hardware & Protocol Specifications</span>
          </h4>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
              <span className="text-gray-400 block text-[9px] uppercase font-bold">Protocol Version</span>
              <span className="font-bold text-gray-800">
                CroperX Handshake v{state.handshake?.protocol_version || '1'}
              </span>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
              <span className="text-gray-400 block text-[9px] uppercase font-bold">Firmware Version</span>
              <span className="font-bold text-emerald-800">
                {state.handshake?.firmware || '1.0.0'}
              </span>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
              <span className="text-gray-400 block text-[9px] uppercase font-bold">UART Baud Rate</span>
              <span className="font-bold text-gray-800">
                {state.portMetadata?.baudRate || 115200} 8N1
              </span>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
              <span className="text-gray-400 block text-[9px] uppercase font-bold">Handshake Verification</span>
              <span className={`font-bold ${state.healthMetrics.handshakeSuccess ? 'text-emerald-700' : 'text-gray-500'}`}>
                {state.healthMetrics.handshakeSuccess ? '✓ Verified 200 OK' : 'Pending'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
