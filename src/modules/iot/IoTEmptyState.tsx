import React from 'react';
import { motion } from 'motion/react';
import {
  Radio,
  Cable,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  FlaskConical,
  Sprout,
  Droplets,
  Thermometer,
  Zap
} from 'lucide-react';

interface IoTEmptyStateProps {
  onConnectPhysical: () => void;
  onToggleSimulator: () => void;
  onExploreSensorsGuide?: () => void;
}

export const IoTEmptyState: React.FC<IoTEmptyStateProps> = ({
  onConnectPhysical,
  onToggleSimulator,
  onExploreSensorsGuide
}) => {
  return (
    <div className="bg-white rounded-3xl border border-[#c8e6c9] shadow-sm p-6 sm:p-10 space-y-8">
      {/* Intro Banner */}
      <div className="max-w-2xl mx-auto text-center space-y-3">
        <div className="inline-flex p-3.5 rounded-3xl bg-[#e8f5e9] border border-[#c8e6c9] text-[#2e7d32] shadow-xs">
          <Radio className="w-8 h-8 animate-pulse" />
        </div>

        <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#1b2e1b]">
          Connect Real Farm IoT Sensors
        </h3>
        <p className="text-sm text-gray-600 leading-relaxed">
          CroperX operates completely standalone with predictive agricultural models. Connecting an optional <strong>ESP32 USB probe</strong> streams real-time field soil moisture, canopy temperature, and humidity directly into your irrigation and crop risk calculations.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={onConnectPhysical}
            className="px-6 py-3 rounded-2xl bg-[#2e7d32] hover:bg-[#1b5e20] text-white text-xs font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-2 min-h-[44px]"
          >
            <Cable className="w-4 h-4" />
            <span>Connect USB Sensor Node</span>
          </button>

          <button
            type="button"
            onClick={onToggleSimulator}
            className="px-5 py-3 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold transition-all flex items-center gap-2 min-h-[44px]"
          >
            <FlaskConical className="w-4 h-4" />
            <span>Test Developer Simulator</span>
          </button>
        </div>
      </div>

      {/* 4 Step Connection Visual Workflow */}
      <div className="space-y-4 pt-4 border-t border-gray-100">
        <h4 className="text-xs font-bold uppercase tracking-wider text-center text-gray-500">
          How USB Sensor Connection Works
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-[#f8fcf8] border border-[#c8e6c9] space-y-2">
            <div className="w-7 h-7 rounded-xl bg-emerald-100 text-[#2e7d32] font-mono font-bold text-xs flex items-center justify-center">
              1
            </div>
            <h5 className="font-bold text-xs text-gray-900">Plug in USB Cable</h5>
            <p className="text-[11px] text-gray-500">
              Connect your ESP32 or Arduino sensor board to your laptop USB port.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#f8fcf8] border border-[#c8e6c9] space-y-2">
            <div className="w-7 h-7 rounded-xl bg-emerald-100 text-[#2e7d32] font-mono font-bold text-xs flex items-center justify-center">
              2
            </div>
            <h5 className="font-bold text-xs text-gray-900">Browser Port Picker</h5>
            <p className="text-[11px] text-gray-500">
              Click Connect and select the detected USB Serial Port in the browser dialog.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#f8fcf8] border border-[#c8e6c9] space-y-2">
            <div className="w-7 h-7 rounded-xl bg-emerald-100 text-[#2e7d32] font-mono font-bold text-xs flex items-center justify-center">
              3
            </div>
            <h5 className="font-bold text-xs text-gray-900">CroperX Handshake</h5>
            <p className="text-[11px] text-gray-500">
              System verifies device ID, firmware, and supported agricultural probes.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-[#f8fcf8] border border-[#c8e6c9] space-y-2">
            <div className="w-7 h-7 rounded-xl bg-emerald-100 text-[#2e7d32] font-mono font-bold text-xs flex items-center justify-center">
              4
            </div>
            <h5 className="font-bold text-xs text-gray-900">Live Field Telemetry</h5>
            <p className="text-[11px] text-gray-500">
              Sensor readings stream continuously into irrigation and risk calculations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
