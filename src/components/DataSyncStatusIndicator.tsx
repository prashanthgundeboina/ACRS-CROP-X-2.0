import React, { useState, useEffect } from 'react';
import { CloudCheck, CloudOff, RefreshCw, Wifi, WifiOff, CheckCircle2, AlertTriangle, Database } from 'lucide-react';

export type SyncStatusType = 'synced' | 'syncing' | 'pending_offline';

interface Props {
  lastSyncedTime?: string;
  onForceSync?: () => void;
}

export const DataSyncStatusIndicator: React.FC<Props> = ({
  lastSyncedTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
  onForceSync
}) => {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [syncStatus, setSyncStatus] = useState<SyncStatusType>(
    typeof navigator !== 'undefined' && !navigator.onLine ? 'pending_offline' : 'synced'
  );
  const [pendingQueueCount, setPendingQueueCount] = useState<number>(0);
  const [lastSyncTs, setLastSyncTs] = useState<string>(lastSyncedTime);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setSyncStatus('syncing');
      setTimeout(() => {
        setSyncStatus('synced');
        setPendingQueueCount(0);
        setLastSyncTs(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      }, 1500);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setSyncStatus('pending_offline');
      setPendingQueueCount((prev) => prev + 1);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Periodic check simulation
    const interval = setInterval(() => {
      if (!isOnline) {
        setPendingQueueCount((prev) => prev + Math.floor(Math.random() * 2));
      }
    }, 12000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, [isOnline]);

  const handleManualSync = () => {
    if (syncStatus === 'syncing') return;
    setSyncStatus('syncing');
    if (onForceSync) onForceSync();

    setTimeout(() => {
      setSyncStatus('synced');
      setPendingQueueCount(0);
      setLastSyncTs(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 1200);
  };

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <button
        onClick={handleManualSync}
        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all border flex items-center gap-2 shadow-sm ${
          syncStatus === 'synced'
            ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
            : syncStatus === 'syncing'
            ? 'bg-amber-50 text-amber-800 border-amber-300 animate-pulse'
            : 'bg-red-50 text-red-800 border-red-300 hover:bg-red-100'
        }`}
      >
        {syncStatus === 'synced' && (
          <>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <CloudCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-mono text-[11px]">Telemetry Synced</span>
          </>
        )}

        {syncStatus === 'syncing' && (
          <>
            <RefreshCw className="w-4 h-4 text-amber-600 animate-spin shrink-0" />
            <span className="font-mono text-[11px]">Syncing to Cloud...</span>
          </>
        )}

        {syncStatus === 'pending_offline' && (
          <>
            <CloudOff className="w-4 h-4 text-red-600 shrink-0" />
            <span className="font-mono text-[11px]">
              Offline ({pendingQueueCount} Pending Sync)
            </span>
          </>
        )}
      </button>

      {/* Hover Tooltip / Status Popover */}
      {isHovered && (
        <div className="absolute top-full right-0 mt-2 w-72 bg-[#1b2e1b] text-white p-3.5 rounded-2xl shadow-xl border border-[#4CAF50]/40 z-50 text-xs space-y-2 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-white/15 pb-2">
            <span className="font-black text-[#4CAF50] text-[10px] uppercase tracking-wider flex items-center gap-1">
              <Database className="w-3.5 h-3.5" />
              Cloud Telemetry Sync Status
            </span>
            <span className={`px-2 py-0.5 rounded-md text-[9px] font-mono font-bold ${
              isOnline ? 'bg-emerald-900/80 text-emerald-300' : 'bg-red-900/80 text-red-300'
            }`}>
              {isOnline ? 'Internet Active' : 'Offline Mode'}
            </span>
          </div>

          <div className="space-y-1.5 text-[11px]">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">Connection:</span>
              <span className="font-bold flex items-center gap-1">
                {isOnline ? <Wifi className="w-3.5 h-3.5 text-emerald-400" /> : <WifiOff className="w-3.5 h-3.5 text-red-400" />}
                {isOnline ? 'Cloud Online' : 'No Connection'}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-300">Last Telemetry Sync:</span>
              <span className="font-mono text-emerald-300 font-bold">{lastSyncTs}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-300">Pending Local Records:</span>
              <span className={`font-mono font-bold ${pendingQueueCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {pendingQueueCount} records
              </span>
            </div>
          </div>

          <div className="pt-2 border-t border-white/10 flex justify-between items-center">
            <span className="text-[10px] text-gray-400">Auto-sync active on reconnect</span>
            <button
              onClick={handleManualSync}
              className="px-2.5 py-1 bg-[#4CAF50] hover:bg-[#2e7d32] text-[#1b2e1b] hover:text-white font-bold text-[10px] rounded-lg transition-colors flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              Sync Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
