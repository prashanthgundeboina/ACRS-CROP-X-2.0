import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, BellOff, AlertTriangle, ShieldAlert, CheckCircle2, X } from 'lucide-react';

interface YieldBenchmarkPushNotifierProps {
  cropName: string;
  currentYield: number; // e.g. 5.2 tons/ha
  benchmarkYield?: number; // e.g. 8.0 tons/ha
}

export const YieldBenchmarkPushNotifier: React.FC<YieldBenchmarkPushNotifierProps> = ({
  cropName,
  currentYield,
  benchmarkYield = 8.0
}) => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [showAlertBanner, setShowAlertBanner] = useState<boolean>(true);
  const [lastNotifiedYield, setLastNotifiedYield] = useState<number | null>(null);

  // 70% threshold calculation
  const thresholdYield = benchmarkYield * 0.7; // e.g. 8.0 * 0.7 = 5.6 tons/ha
  const isYieldDeficit = currentYield < thresholdYield && currentYield > 0;
  const deficitPct = Math.round(((benchmarkYield - currentYield) / benchmarkYield) * 100);

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert('Browser push notifications are not supported in this browser.');
      return;
    }
    try {
      const res = await Notification.requestPermission();
      setPermission(res);
      if (res === 'granted' && isYieldDeficit) {
        triggerPushNotification();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const triggerPushNotification = () => {
    if (!('Notification' in window) || Notification.permission !== 'granted') return;

    // Avoid spamming if yield hasn't changed
    if (lastNotifiedYield === currentYield) return;

    const title = `⚠️ AgriPro Yield Warning: ${cropName}`;
    const options = {
      body: `Expected yield dropped to ${currentYield} tons/ha (${deficitPct}% below ${benchmarkYield} t/ha benchmark threshold). Immediate soil nutrient or irrigation action required!`,
      icon: '/icon.png',
      tag: 'yield-warning-' + cropName
    };

    try {
      new Notification(title, options);
      setLastNotifiedYield(currentYield);
    } catch (err) {
      console.error('Notification trigger error:', err);
    }
  };

  // Trigger push notification automatically if threshold breached & permission granted
  useEffect(() => {
    if (isYieldDeficit && permission === 'granted') {
      triggerPushNotification();
    }
  }, [isYieldDeficit, currentYield, cropName, permission]);

  if (!isYieldDeficit) return null;

  return (
    <AnimatePresence>
      {showAlertBanner && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-red-900 text-white p-4 rounded-2xl border-2 border-red-500 shadow-xl space-y-3 relative overflow-hidden"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-red-600 rounded-xl text-white shrink-0 animate-bounce">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif font-bold text-sm text-red-100">CRITICAL YIELD DEFICIT WARNING</span>
                  <span className="text-[10px] font-mono font-black uppercase bg-red-500 text-white px-2 py-0.5 rounded-full">
                    {deficitPct}% Below Benchmark
                  </span>
                </div>
                <p className="text-xs text-red-200 mt-0.5">
                  Expected yield for <strong className="text-white">{cropName}</strong> ({currentYield} tons/ha) has fallen below the 70% threshold benchmark ({thresholdYield.toFixed(1)} tons/ha).
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              {permission !== 'granted' ? (
                <button
                  onClick={requestNotificationPermission}
                  className="px-3.5 py-1.5 bg-white text-red-900 hover:bg-red-100 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  <Bell className="w-3.5 h-3.5 text-red-700 animate-pulse" />
                  <span>Enable Push Alerts</span>
                </button>
              ) : (
                <div className="flex items-center gap-1.5 bg-red-800 border border-red-600 text-red-100 px-3 py-1 rounded-xl text-xs font-bold font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Push Alerts Active</span>
                </div>
              )}

              <button
                onClick={() => setShowAlertBanner(false)}
                className="p-1.5 hover:bg-white/10 rounded-xl text-red-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
