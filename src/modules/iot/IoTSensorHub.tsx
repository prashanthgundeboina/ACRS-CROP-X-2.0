import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Radio,
  Sliders,
  Cable,
  RefreshCw,
  Power,
  Droplets,
  Sprout,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Bot,
  HelpCircle,
  FlaskConical
} from 'lucide-react';
import { IoTDeviceState, SensorValue, SensorType } from '../../types/iot/iotTypes';
import { iotDeviceService } from '../../services/iot/iotDeviceService';
import { IoTConnectionCard } from './IoTConnectionCard';
import { IoTSensorCard } from './IoTSensorCard';
import { IoTDeviceHealth } from './IoTDeviceHealth';
import { IoTDiagnostics } from './IoTDiagnostics';
import { IoTEmptyState } from './IoTEmptyState';
import { SoilData } from '../../types';

interface IoTSensorHubProps {
  soilData?: SoilData;
  onUpdateSoilData?: (newData: Partial<SoilData>) => void;
  onNavigateToTab?: (tabId: string) => void;
  isExpertMode?: boolean;
  onToggleExpertMode?: (val: boolean) => void;
}

export const IoTSensorHub: React.FC<IoTSensorHubProps> = ({
  soilData,
  onUpdateSoilData,
  onNavigateToTab,
  isExpertMode: parentExpertMode,
  onToggleExpertMode: parentToggleExpertMode
}) => {
  const [iotState, setIotState] = useState<IoTDeviceState>(iotDeviceService.getState());
  const [localExpertMode, setLocalExpertMode] = useState<boolean>(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  const isExpertMode = parentExpertMode !== undefined ? parentExpertMode : localExpertMode;
  const setExpertMode = parentToggleExpertMode || setLocalExpertMode;

  useEffect(() => {
    const unsubscribe = iotDeviceService.subscribe((newState) => {
      setIotState(newState);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  const handleConnectPhysical = async () => {
    await iotDeviceService.connectPhysical();
  };

  const handleDisconnect = async () => {
    await iotDeviceService.disconnect();
  };

  const handleReconnect = async () => {
    await iotDeviceService.reconnect();
  };

  const handleToggleSimulator = () => {
    iotDeviceService.toggleSimulator();
  };

  const handleSendCommand = (cmd: string) => {
    iotDeviceService.sendSerialCommand(cmd);
  };

  const handleApplyToSoilData = (sensorType: string, value: number) => {
    if (!onUpdateSoilData) return;

    if (sensorType === 'soil_moisture') {
      onUpdateSoilData({ soil_moisture: value, moisture: value });
      showNotice(`Synced soil moisture (${value}%) into active farm parameters.`);
    } else if (sensorType === 'temperature') {
      onUpdateSoilData({ temperature: value });
      showNotice(`Synced temperature (${value}°C) into active farm parameters.`);
    } else if (sensorType === 'ph') {
      onUpdateSoilData({ ph: value });
      showNotice(`Synced soil pH (${value}) into active farm parameters.`);
    } else if (sensorType === 'nitrogen') {
      onUpdateSoilData({ nitrogen: value });
      showNotice(`Synced Nitrogen (${value} mg/kg) into active farm parameters.`);
    } else if (sensorType === 'phosphorus') {
      onUpdateSoilData({ phosphorus: value });
      showNotice(`Synced Phosphorus (${value} mg/kg) into active farm parameters.`);
    } else if (sensorType === 'potassium') {
      onUpdateSoilData({ potassium: value });
      showNotice(`Synced Potassium (${value} mg/kg) into active farm parameters.`);
    }
  };

  const showNotice = (msg: string) => {
    setSyncNotice(msg);
    setTimeout(() => {
      setSyncNotice(null);
    }, 4000);
  };

  const isConnected = iotState.connectionState === 'connected' || iotState.connectionState === 'receiving_data';
  const displayTelemetry = iotState.latestTelemetry || iotState.lastKnownTelemetry;
  const isTelemetryLive = iotState.connectionState === 'receiving_data';

  const sensorReadingsList: SensorValue[] = displayTelemetry
    ? Object.values(displayTelemetry.readings)
    : [];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Connection Header Hero Card */}
      <IoTConnectionCard
        state={iotState}
        isExpertMode={isExpertMode}
        onToggleExpertMode={setExpertMode}
        onConnectPhysical={handleConnectPhysical}
        onDisconnect={handleDisconnect}
        onReconnect={handleReconnect}
        onToggleSimulator={handleToggleSimulator}
      />

      {/* Sync Confirmation Toast Notification */}
      <AnimatePresence>
        {syncNotice && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-emerald-900 text-emerald-100 rounded-2xl text-xs font-bold flex items-center justify-between border border-emerald-700 shadow-md"
          >
            <span>✓ {syncNotice}</span>
            {onNavigateToTab && (
              <button
                type="button"
                onClick={() => onNavigateToTab('irrigation')}
                className="text-white underline hover:text-emerald-200 ml-3"
              >
                View in Smart Irrigation →
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Live Sensor Cards Grid (When sensors are transmitting or cached) */}
      {sensorReadingsList.length > 0 ? (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="font-serif text-xl font-bold text-[#1b2e1b] flex items-center gap-2">
                <span>Active Agricultural Telemetry</span>
                <span className="text-xs font-mono font-bold bg-[#e8f5e9] text-[#2e7d32] px-2.5 py-0.5 rounded-full border border-[#c8e6c9]">
                  {sensorReadingsList.length} Probes Active
                </span>
              </h3>
              <p className="text-xs text-gray-500">
                {isTelemetryLive
                  ? 'Real-time readings from your connected microcontroller probe mesh.'
                  : 'Last known telemetry snapshot from previous session.'}
              </p>
            </div>

            {/* Quick Irrigation Action Link */}
            {onNavigateToTab && isConnected && (
              <button
                type="button"
                onClick={() => onNavigateToTab('irrigation')}
                className="text-xs font-bold text-[#2e7d32] hover:text-[#1b5e20] flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors self-start sm:self-auto"
              >
                <Droplets className="w-3.5 h-3.5 text-blue-600" />
                <span>Open Precision Irrigation with Live Moisture</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {sensorReadingsList.map((sensor) => (
              <IoTSensorCard
                key={sensor.type}
                sensor={sensor}
                isLive={isTelemetryLive}
                isExpertMode={isExpertMode}
                onApplyToSoilData={handleApplyToSoilData}
              />
            ))}
          </div>
        </div>
      ) : (
        /* Empty State Guidance */
        <IoTEmptyState
          onConnectPhysical={handleConnectPhysical}
          onToggleSimulator={handleToggleSimulator}
        />
      )}

      {/* 3. Connection & Hardware Health Matrix */}
      <IoTDeviceHealth state={iotState} isExpertMode={isExpertMode} />

      {/* 4. Expert Diagnostics Console (Terminal, Firmware Code, Wiring) */}
      {(isExpertMode || isConnected || iotState.isSimulatorActive) && (
        <IoTDiagnostics state={iotState} onSendCommand={handleSendCommand} />
      )}
    </div>
  );
};
