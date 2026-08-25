import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CloudRain, ShieldAlert, Bell, BellOff, CheckCircle2, Thermometer, Wind, AlertTriangle, Radio, Zap } from 'lucide-react';

interface WeatherBackgroundMonitorProps {
  latitude?: number;
  longitude?: number;
  onLiveWeatherUpdate?: (live: { temperature: number; humidity: number; rainfall: number; windSpeed: number }) => void;
}

export const WeatherBackgroundMonitor: React.FC<WeatherBackgroundMonitorProps> = ({
  latitude = 20.5937,
  longitude = 78.9629,
  onLiveWeatherUpdate
}) => {
  const [isEnabled, setIsEnabled] = useState<boolean>(true);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [activeHazard, setActiveHazard] = useState<{ title: string; body: string; severity: 'critical' | 'high' | 'medium' } | null>(null);
  const [lastCheckTime, setLastCheckTime] = useState<string>('');
  const [lastNotifiedKey, setLastNotifiedKey] = useState<string>('');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!('Notification' in window)) {
      alert('Browser native push notifications are not supported by this browser.');
      return;
    }
    try {
      const res = await Notification.requestPermission();
      setPermission(res);
      if (res === 'granted' && activeHazard) {
        sendNativeNotification(activeHazard.title, activeHazard.body, activeHazard.severity);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const triggerTestHaptic = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([300, 100, 300, 100, 500]);
    }
    sendNativeNotification(
      '⚠️ TEST CRITICAL FROST ALERT',
      'Haptic feedback test signal triggered! Mobile vibration pattern [300ms, 100ms, 300ms, 100ms, 500ms] executed.',
      'critical'
    );
  };

  const sendNativeNotification = (title: string, body: string, severity: 'critical' | 'high' | 'medium' = 'high') => {
    // Trigger Haptic Vibration feedback on supported mobile devices
    if ('vibrate' in navigator) {
      try {
        if (severity === 'critical') {
          // Urgent multi-pulse vibration pattern for critical frost/storm hazards
          navigator.vibrate([300, 100, 300, 100, 500]);
        } else {
          // Standard alert pulse
          navigator.vibrate([200, 100, 200]);
        }
      } catch (e) {
        console.warn('Haptic vibration feedback error:', e);
      }
    }

    if (!('Notification' in window) || Notification.permission !== 'granted') return;
    try {
      new Notification(title, {
        body,
        icon: '/icon.png',
        tag: 'weather-hazard-alert',
        // Pass vibration pattern into Notification spec where supported
        vibrate: severity === 'critical' ? [300, 100, 300, 100, 500] : [200, 100, 200]
      } as any);
    } catch (err) {
      console.warn('Native notification error:', err);
    }
  };

  const checkWeatherHazards = async () => {
    if (!isEnabled) return;

    try {
      const res = await fetch('/api/weather/live', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude, longitude }),
      });
      if (!res.ok) return;

      const data = await res.json();
      const live = data.liveWeather;
      if (!live) return;

      if (onLiveWeatherUpdate) {
        onLiveWeatherUpdate(live);
      }

      setLastCheckTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));

      // Hazardous Conditions Evaluation
      let hazard: { title: string; body: string; severity: 'critical' | 'high' | 'medium' } | null = null;
      let hazardKey = '';

      if (live.temperature <= 4) {
        hazardKey = 'frost_' + live.temperature;
        hazard = {
          title: '⚠️ CRITICAL FROST HAZARD WARNING',
          body: `Temperature dropped to ${live.temperature}°C! Severe frost bite risk to roots and flowers. Activate thermal blankets or crop heating immediately.`,
          severity: 'critical'
        };
      } else if (live.rainfall >= 30) {
        hazardKey = 'storm_' + live.rainfall;
        hazard = {
          title: '🌧️ HEAVY STORM & FLOOD RISK DETECTED',
          body: `Severe precipitation of ${live.rainfall} mm recorded. Inspect field drainage to prevent root hypoxia and waterlogging.`,
          severity: 'critical'
        };
      } else if (live.windSpeed >= 25) {
        hazardKey = 'wind_' + live.windSpeed;
        hazard = {
          title: '💨 HIGH WIND CROP LODGING ALERT',
          body: `High wind speed of ${live.windSpeed} km/h detected. Stake tall crops (Maize, Rice, Bananas) to prevent physical breakage.`,
          severity: 'high'
        };
      } else if (live.temperature >= 38) {
        hazardKey = 'heatwave_' + live.temperature;
        hazard = {
          title: '🔥 SEVERE HEATWAVE THERMAL STRESS',
          body: `Ambient temp reached ${live.temperature}°C. Increase irrigation volume by +30% to prevent crop transpiration collapse.`,
          severity: 'high'
        };
      }

      setActiveHazard(hazard);

      if (hazard && hazardKey !== lastNotifiedKey) {
        sendNativeNotification(hazard.title, hazard.body, hazard.severity);
        setLastNotifiedKey(hazardKey);
      }
    } catch (e) {
      console.warn('Background weather worker check warning:', e);
    }
  };

  // Periodic polling every 45 seconds
  useEffect(() => {
    checkWeatherHazards();
    const interval = setInterval(checkWeatherHazards, 45000);
    return () => clearInterval(interval);
  }, [isEnabled, latitude, longitude]);

  return (
    <div className="bg-[#112211] text-white p-4 rounded-3xl border border-[#2e7d32] shadow-xl space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-700/60 rounded-2xl text-emerald-200 border border-emerald-500/40 shrink-0">
            <Radio className="w-5 h-5 text-emerald-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-sm text-white">24/7 Weather Radar Background Guard</span>
              <span className="text-[10px] font-mono bg-emerald-900/80 text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-500/30">
                Auto-Polling Active
              </span>
            </div>
            <p className="text-xs text-gray-300 mt-0.5">
              Continuously monitors regional temperature, wind, and storm hazards.
              {lastCheckTime && <span className="text-emerald-400 ml-1.5 font-mono">Last Sync: {lastCheckTime}</span>}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {permission !== 'granted' ? (
            <button
              onClick={requestPermission}
              className="px-3.5 py-1.5 bg-[#4CAF50] hover:bg-[#2e7d32] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <Bell className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
              <span>Enable Native Push Alerts</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 bg-emerald-950 border border-emerald-600 text-emerald-200 px-3 py-1.5 rounded-xl text-xs font-bold font-mono">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Push Active</span>
            </div>
          )}

          <button
            onClick={triggerTestHaptic}
            title="Test mobile haptic vibration feedback signal"
            className="px-2.5 py-1.5 bg-amber-900/40 hover:bg-amber-900/70 border border-amber-500/50 text-amber-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1"
          >
            <Zap className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span className="hidden sm:inline">Test Haptic Buzz</span>
          </button>

          <button
            onClick={() => setIsEnabled(!isEnabled)}
            className={`p-2 rounded-xl text-xs font-bold border transition-colors ${
              isEnabled 
                ? 'bg-emerald-900/60 text-emerald-200 border-emerald-500/50' 
                : 'bg-gray-800 text-gray-400 border-gray-700'
            }`}
          >
            {isEnabled ? 'Guard ON' : 'Guard OFF'}
          </button>
        </div>
      </div>

      {/* Active Weather Hazard Alert Banner */}
      <AnimatePresence>
        {activeHazard && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-3.5 bg-red-950/90 border-2 border-red-500/80 text-red-100 rounded-2xl space-y-1 text-xs"
          >
            <div className="flex items-center justify-between">
              <span className="font-serif font-bold text-red-200 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-400 animate-bounce" />
                {activeHazard.title}
              </span>
              <span className="text-[10px] uppercase font-mono font-black bg-red-600 text-white px-2 py-0.5 rounded-full">
                {activeHazard.severity}
              </span>
            </div>
            <p className="text-red-200 leading-relaxed pl-6">{activeHazard.body}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
