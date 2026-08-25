import React from 'react';
import { motion } from 'motion/react';
import {
  Radio,
  Wifi,
  WifiOff,
  Cable,
  RefreshCw,
  Power,
  Sliders,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Clock,
  Sparkles,
  Layers,
  HelpCircle,
  FlaskConical
} from 'lucide-react';
import { IoTDeviceState } from '../../types/iot/iotTypes';

interface IoTConnectionCardProps {
  state: IoTDeviceState;
  isExpertMode: boolean;
  onToggleExpertMode: (val: boolean) => void;
  onConnectPhysical: () => void;
  onDisconnect: () => void;
  onReconnect: () => void;
  onToggleSimulator: () => void;
}

export const IoTConnectionCard: React.FC<IoTConnectionCardProps> = ({
  state,
  isExpertMode,
  onToggleExpertMode,
  onConnectPhysical,
  onDisconnect,
  onReconnect,
  onToggleSimulator
}) => {
  const isConnected = state.connectionState === 'connected' || state.connectionState === 'receiving_data';
  const isStale = state.connectionState === 'stale_telemetry';
  const isConnecting = state.connectionState === 'connecting' || state.connectionState === 'detecting' || state.connectionState === 'handshaking';
  const isError = state.connectionState === 'connection_error' || state.connectionState === 'sensor_error';
  const isDisconnected = state.connectionState === 'disconnected';
  const isIdle = state.connectionState === 'idle';

  const getStatusBadge = () => {
    if (state.isSimulatorActive) {
      return {
        bg: 'bg-purple-50 text-purple-900 border-purple-300',
        dot: 'bg-purple-500 animate-pulse',
        icon: FlaskConical,
        title: '🧪 Developer Simulator Active',
        subtitle: 'Test Feed — Simulated ESP32 agricultural telemetry'
      };
    }
    if (isConnected) {
      return {
        bg: 'bg-emerald-50 text-emerald-900 border-emerald-300',
        dot: 'bg-emerald-500 animate-ping',
        icon: CheckCircle2,
        title: '🟢 Farm Sensor Connected',
        subtitle: `Receiving live data from ${state.handshake?.device_id || 'ESP32'}`
      };
    }
    if (isStale) {
      return {
        bg: 'bg-amber-50 text-amber-900 border-amber-300',
        dot: 'bg-amber-500 animate-pulse',
        icon: Clock,
        title: '🟡 No Recent Telemetry',
        subtitle: 'Waiting for sensor stream... Last known reading cached'
      };
    }
    if (isConnecting) {
      return {
        bg: 'bg-blue-50 text-blue-900 border-blue-300',
        dot: 'bg-blue-500 animate-spin',
        icon: RefreshCw,
        title: '🟡 Connecting & Verifying USB Device',
        subtitle: 'Performing CroperX handshake with ESP32...'
      };
    }
    if (isError) {
      return {
        bg: 'bg-rose-50 text-rose-900 border-rose-300',
        dot: 'bg-rose-500',
        icon: AlertTriangle,
        title: '🔴 Connection Error',
        subtitle: state.errorMessage || 'Unable to open USB serial port'
      };
    }
    if (isDisconnected) {
      return {
        bg: 'bg-rose-50 text-rose-900 border-rose-300',
        dot: 'bg-rose-500',
        icon: WifiOff,
        title: '🔴 Farm Sensor Offline / Disconnected',
        subtitle: 'USB device disconnected. Reconnect sensor to restore live telemetry.'
      };
    }
    return {
      bg: 'bg-gray-50 text-gray-800 border-gray-200',
      dot: 'bg-gray-400',
      icon: Cable,
      title: '⚪ No Physical Sensor Connected',
      subtitle: 'Connect your ESP32 or Arduino sensor node using a USB cable'
    };
  };

  const status = getStatusBadge();
  const StatusIcon = status.icon;

  return (
    <div className="bg-white rounded-3xl border border-[#c8e6c9] shadow-sm p-6 sm:p-8 space-y-6 relative overflow-hidden">
      {/* Decorative ambient background accent */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-[#e8f5e9]/50 via-transparent to-transparent pointer-events-none rounded-full" />

      {/* Header & Controls Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#c8e6c9] pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#2e7d32] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1.5">
              <Radio className="w-3 h-3 text-[#2e7d32] animate-pulse" />
              Physical Hardware Hub
            </span>
            {state.isSimulatorActive && (
              <span className="text-[10px] font-black uppercase tracking-widest text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                🛠️ Developer Simulator
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#1b2e1b] flex items-center gap-2">
            📡 Farm IoT Sensors & Hardware Stream
          </h2>
          <p className="text-xs text-gray-500 max-w-2xl">
            Stream live soil moisture, temperature, humidity, and micro-climate telemetry directly from an ESP32 microcontroller into CroperX intelligence.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Simple vs Expert Toggle */}
          <button
            type="button"
            onClick={() => onToggleExpertMode(!isExpertMode)}
            className={`px-3 py-2 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 border min-h-[44px] ${
              isExpertMode
                ? 'bg-gray-900 text-white border-gray-800 shadow-sm'
                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{isExpertMode ? 'Expert Telemetry' : 'Simple Mode'}</span>
          </button>

          {/* Primary Action Button */}
          {isConnected || state.isSimulatorActive ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onReconnect}
                className="px-3.5 py-2 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold transition-all flex items-center gap-1.5 min-h-[44px]"
                title="Refresh and Re-handshake with device"
              >
                <RefreshCw className="w-3.5 h-3.5 text-gray-600" />
                <span>Re-sync</span>
              </button>

              <button
                type="button"
                onClick={onDisconnect}
                className="px-4 py-2 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold transition-all flex items-center gap-1.5 min-h-[44px]"
              >
                <Power className="w-3.5 h-3.5 text-rose-600" />
                <span>Disconnect</span>
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onConnectPhysical}
              disabled={isConnecting}
              className="px-5 py-2.5 rounded-2xl bg-[#2e7d32] hover:bg-[#1b5e20] text-white text-xs font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-2 min-h-[44px]"
            >
              {isConnecting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <Cable className="w-4 h-4" />
                  <span>Connect ESP32 (USB)</span>
                </>
              )}
            </button>
          )}

          {/* Developer Simulator Toggle */}
          <button
            type="button"
            onClick={onToggleSimulator}
            className={`px-3 py-2 rounded-2xl text-[11px] font-bold transition-all border min-h-[44px] flex items-center gap-1.5 ${
              state.isSimulatorActive
                ? 'bg-purple-600 text-white border-purple-700 shadow-sm'
                : 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
            }`}
            title="Toggle Developer Sensor Simulator for test without physical ESP32"
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span>{state.isSimulatorActive ? 'Stop Simulator' : 'Test Simulator'}</span>
          </button>
        </div>
      </div>

      {/* Main Connection Status Card */}
      <div className={`p-5 sm:p-6 rounded-3xl border transition-all ${status.bg}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white rounded-2xl shadow-sm border border-gray-200/80 flex-shrink-0">
              <StatusIcon className={`w-6 h-6 ${isConnected ? 'text-emerald-600' : isStale ? 'text-amber-600' : isError || isDisconnected ? 'text-rose-600' : 'text-gray-500'}`} />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${status.dot}`} />
                <h3 className="font-serif text-lg sm:text-xl font-bold text-gray-900">
                  {status.title}
                </h3>
              </div>
              <p className="text-xs text-gray-700 font-medium leading-relaxed">
                {status.subtitle}
              </p>

              {/* Cached reading notice if disconnected */}
              {(isDisconnected || isStale) && state.lastKnownTelemetry && (
                <div className="pt-2 flex items-center gap-2 text-[11px] text-gray-600">
                  <Clock className="w-3.5 h-3.5 text-gray-400" />
                  <span>
                    Last known valid packet: <strong>{new Date(state.lastKnownTelemetry.timestamp).toLocaleTimeString()}</strong> ({state.lastKnownTelemetry.activeSensorsCount} sensors cached)
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Quick Hardware Metadata Badges */}
          <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0">
            {state.handshake && (
              <div className="p-3 bg-white/90 rounded-2xl border border-gray-200/80 space-y-0.5 text-xs font-mono">
                <div className="text-[9px] uppercase font-bold text-gray-400">Device Node</div>
                <div className="font-bold text-gray-900">{state.handshake.device_id}</div>
              </div>
            )}

            {state.handshake && (
              <div className="p-3 bg-white/90 rounded-2xl border border-gray-200/80 space-y-0.5 text-xs font-mono">
                <div className="text-[9px] uppercase font-bold text-gray-400">Microcontroller</div>
                <div className="font-bold text-emerald-800">{state.handshake.device_type}</div>
              </div>
            )}

            {state.latestTelemetry && (
              <div className="p-3 bg-white/90 rounded-2xl border border-gray-200/80 space-y-0.5 text-xs font-mono">
                <div className="text-[9px] uppercase font-bold text-gray-400">Active Sensors</div>
                <div className="font-bold text-emerald-800">
                  {state.latestTelemetry.activeSensorsCount} Probes Live
                </div>
              </div>
            )}

            {isExpertMode && state.portMetadata && (
              <div className="p-3 bg-white/90 rounded-2xl border border-gray-200/80 space-y-0.5 text-xs font-mono">
                <div className="text-[9px] uppercase font-bold text-gray-400">Serial Baud</div>
                <div className="font-bold text-gray-800">{state.portMetadata.baudRate} bps</div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Web Serial Browser Compatibility Warning if not supported */}
      {!state.isWebSerialSupported && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-xs text-amber-900">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold block">Browser Web Serial API Notice</span>
            <p>
              Direct USB serial connection requires a Web Serial-supported browser such as Google Chrome, Microsoft Edge, or Opera on desktop/laptop. You can still test all workflows with the Developer Simulator!
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
