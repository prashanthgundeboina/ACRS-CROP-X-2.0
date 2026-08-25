import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  AlertTriangle, 
  CloudRain, 
  Sun, 
  Wind, 
  Thermometer, 
  ShieldAlert, 
  CheckCircle2, 
  RefreshCw, 
  Zap, 
  X, 
  ChevronRight,
  Droplets,
  Bug,
  TrendingUp,
  Filter,
  Bell,
  BellOff,
  Sliders,
  MapPin,
  Sparkles,
  Check
} from 'lucide-react';
import { SoilData, FarmZone, AlertCategoryType, EarlyAlert } from '../types';

interface EarlyWeatherAlertBannerProps {
  formData: SoilData;
  onSyncLiveWeatherToForm: (liveData: { temperature: number; humidity: number; rainfall: number; windSpeed: number }) => void;
  latitude?: number;
  longitude?: number;
  locationName?: string;
  locationDenied?: boolean;
  zones?: FarmZone[];
  subscribedCategories?: AlertCategoryType[];
  onToggleCategorySubscription?: (category: AlertCategoryType) => void;
  onToggleZonePush?: (zoneId: string) => void;
  onDetectLocationClick?: () => void;
}

// Framer Motion Weather Condition Animated Icon Component
const AnimatedWeatherIcon: React.FC<{ condition: string; weatherCode?: number }> = ({ condition, weatherCode = 0 }) => {
  const isRain = condition.toLowerCase().includes('rain') || condition.toLowerCase().includes('shower') || weatherCode > 50;
  const isSun = condition.toLowerCase().includes('clear') || condition.toLowerCase().includes('sun');

  if (isRain) {
    return (
      <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
        <motion.div
          animate={{ y: [-2, 2, -2] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
          className="text-cyan-300 z-10"
        >
          <CloudRain className="w-6 h-6 drop-shadow-sm" />
        </motion.div>
        <div className="absolute inset-x-0 bottom-1 flex justify-center gap-1 z-0">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              initial={{ y: -2, opacity: 0 }}
              animate={{ y: [0, 6, 10], opacity: [0, 1, 0] }}
              transition={{
                duration: 1.1,
                repeat: Infinity,
                delay: i * 0.35,
                ease: 'linear'
              }}
              className="w-1 h-1.5 bg-cyan-200 rounded-full"
            />
          ))}
        </div>
      </div>
    );
  }

  if (isSun) {
    return (
      <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 18, repeat: Infinity, ease: 'linear' }}
          className="text-amber-300 z-10"
        >
          <Sun className="w-7 h-7 drop-shadow-sm" />
        </motion.div>
        <motion.div
          animate={{ scale: [1, 1.25, 1], opacity: [0.2, 0.6, 0.2] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute w-8 h-8 rounded-full bg-amber-400/20 blur-sm"
        />
      </div>
    );
  }

  // Floating Cloud Default
  return (
    <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
      <motion.div
        animate={{ x: [-3, 3, -3], y: [-1.5, 1.5, -1.5] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
        className="text-[#a5d6a7] z-10"
      >
        <CloudRain className="w-6 h-6 text-[#81c784]" />
      </motion.div>
      <motion.div
        animate={{ opacity: [0.4, 0.9, 0.4] }}
        transition={{ duration: 2.5, repeat: Infinity }}
        className="absolute -top-0.5 -right-0.5 text-amber-200"
      >
        <Sun className="w-3.5 h-3.5" />
      </motion.div>
    </div>
  );
};

export const CATEGORY_METADATA: Record<AlertCategoryType, {
  label: string;
  shortLabel: string;
  description: string;
  icon: React.FC<{ className?: string }>;
  color: string;
  badgeBg: string;
}> = {
  weather: {
    label: 'Extreme Weather & Frost',
    shortLabel: 'Weather & Frost',
    description: 'Alerts for sudden temperature drops, heavy rainstorms, heatwaves, and lodging winds.',
    icon: CloudRain,
    color: 'text-sky-600',
    badgeBg: 'bg-sky-100 text-sky-800 border-sky-300'
  },
  pests: {
    label: 'Pest & Disease Outbreaks',
    shortLabel: 'Pests & Diseases',
    description: 'Warnings for fungal spore humidity windows, armyworms, locusts, and stem borers.',
    icon: Bug,
    color: 'text-amber-600',
    badgeBg: 'bg-amber-100 text-amber-800 border-amber-300'
  },
  soil: {
    label: 'Soil & Moisture Telemetry',
    shortLabel: 'Soil Telemetry',
    description: 'Monitors root-zone water depletion, hypoxia risk, and nutrient leaching anomalies.',
    icon: Droplets,
    color: 'text-emerald-600',
    badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300'
  },
  market: {
    label: 'Market Rates & Input Prices',
    shortLabel: 'Market Volatility',
    description: 'Tracks Mandi price spikes, regional crop demand shifts, and fertilizer cost spikes.',
    icon: TrendingUp,
    color: 'text-purple-600',
    badgeBg: 'bg-purple-100 text-purple-800 border-purple-300'
  }
};

export const EarlyWeatherAlertBanner: React.FC<EarlyWeatherAlertBannerProps> = ({
  formData,
  onSyncLiveWeatherToForm,
  latitude = 20.5937,
  longitude = 78.9629,
  locationName = 'Current Location',
  locationDenied = false,
  zones = [],
  subscribedCategories: externalSubscribed,
  onToggleCategorySubscription: externalOnToggleCategory,
  onToggleZonePush,
  onDetectLocationClick
}) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [alerts, setAlerts] = useState<EarlyAlert[]>([]);
  const [liveWeather, setLiveWeather] = useState<{
    temperature: number;
    humidity: number;
    rainfall: number;
    windSpeed: number;
    weatherCondition: string;
    weatherCode?: number;
    feelsLike?: number;
    lastUpdated: string;
  } | null>(null);

  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);
  const [lastSyncSuccess, setLastSyncSuccess] = useState<boolean>(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState<boolean>(false);
  const [testNotificationMsg, setTestNotificationMsg] = useState<string | null>(null);

  // Internal category subscription state fallback if external prop not provided
  const [internalSubscribed, setInternalSubscribed] = useState<AlertCategoryType[]>([
    'weather',
    'pests',
    'soil',
    'market'
  ]);

  const activeSubscribedCategories = externalSubscribed || internalSubscribed;

  const handleToggleCategory = (cat: AlertCategoryType) => {
    if (externalOnToggleCategory) {
      externalOnToggleCategory(cat);
    } else {
      setInternalSubscribed(prev =>
        prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
      );
    }
  };

  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchLiveWeather = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const res = await fetch('/api/weather/live', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude, longitude }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.liveWeather) {
          setLiveWeather(data.liveWeather);
          onSyncLiveWeatherToForm({
            temperature: data.liveWeather.temperature,
            humidity: data.liveWeather.humidity,
            rainfall: data.liveWeather.rainfall,
            windSpeed: data.liveWeather.windSpeed,
          });
        }
        setAlerts(data.earlyAlerts || []);
      } else {
        setFetchError("We couldn't update the weather right now.");
      }
    } catch (err) {
      console.warn("Error fetching live weather API:", err);
      setFetchError("We couldn't update the weather right now.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveWeather();
    const interval = setInterval(fetchLiveWeather, 300000);
    return () => clearInterval(interval);
  }, [latitude, longitude]);

  const handleApplyLiveSync = () => {
    if (!liveWeather) return;
    onSyncLiveWeatherToForm({
      temperature: liveWeather.temperature,
      humidity: liveWeather.humidity,
      rainfall: liveWeather.rainfall,
      windSpeed: liveWeather.windSpeed,
    });
    setLastSyncSuccess(true);
    setTimeout(() => setLastSyncSuccess(false), 3000);
  };

  // Dispatch simulated test alert
  const handleSimulateTestAlert = (category: AlertCategoryType) => {
    const meta = CATEGORY_METADATA[category];
    const targetZone = zones.length > 0 ? zones[0] : null;

    const testAlert: EarlyAlert = {
      id: 'test_alert_' + Date.now(),
      type: 'simulated_test',
      category: category,
      severity: 'high',
      title: `⚡ TEST DISPATCH: ${meta.label}`,
      message: `Simulated real-time push alert dispatched to ${targetZone ? targetZone.name : 'Farm Sectors'}. Verify category filter and push channel settings.`,
      action: 'Acknowledge Test Signal',
      affectedZoneIds: targetZone ? [targetZone.id] : undefined
    };

    setAlerts(prev => [testAlert, ...prev]);

    // Haptic Feedback
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200]);
    }

    setTestNotificationMsg(`Dispatched test push alert for category '${meta.shortLabel}'!`);
    setTimeout(() => setTestNotificationMsg(null), 4000);
  };

  // Filter alerts by user's active category subscriptions and dismissal list
  const activeAlerts = alerts.filter(a => {
    if (dismissedAlerts.includes(a.id)) return false;
    const cat = a.category || 'weather';
    return activeSubscribedCategories.includes(cat);
  });

  const hiddenBySubscriptionCount = alerts.filter(a => !dismissedAlerts.includes(a.id)).length - activeAlerts.length;

  const pushActiveZones = zones.filter(z => z.pushNotificationsEnabled);

  const displayTemp = liveWeather?.temperature !== undefined && !isNaN(liveWeather.temperature) 
    ? liveWeather.temperature 
    : formData.temperature;

  const weatherCond = liveWeather?.weatherCondition || (formData.humidity > 65 ? 'Partly Cloudy' : 'Clear Sky');

  return (
    <div className="space-y-3 my-4">
      {/* Live Weather Telemetry Sync Bar */}
      <div className="bg-gradient-to-r from-[#1b2e1b] via-[#2e7d32] to-[#1b2e1b] text-white p-4 rounded-2xl shadow-lg border border-[#4CAF50]/40 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <AnimatedWeatherIcon condition={weatherCond} weatherCode={liveWeather?.weatherCode} />

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-black text-[#81c784] uppercase tracking-wider text-[10px]">Real-Time Open-Meteo Telemetry</span>
              
              <button
                onClick={onDetectLocationClick}
                className="px-2 py-0.5 bg-black/30 hover:bg-black/50 text-[#a5d6a7] hover:text-white rounded-md font-mono text-[10px] flex items-center gap-1 border border-white/10 transition-colors"
                title="Click to update GPS location"
              >
                <MapPin className="w-3 h-3 text-[#4CAF50]" />
                <span>{locationDenied ? '📍 Location unavailable' : `📍 ${locationName}`}</span>
              </button>

              {locationDenied && (
                <button
                  onClick={onDetectLocationClick}
                  className="px-2 py-0.5 bg-amber-500/20 hover:bg-amber-500/40 text-amber-200 border border-amber-400/30 rounded-md text-[10px] font-bold"
                >
                  [Set Location]
                </button>
              )}

              {liveWeather?.lastUpdated && !fetchError && (
                <span className="text-[10px] text-gray-300 font-mono">Last updated: {liveWeather.lastUpdated}</span>
              )}
            </div>

            {fetchError ? (
              <div className="mt-1 flex items-center gap-2 text-rose-300 font-medium text-xs">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{fetchError}</span>
                <button
                  onClick={fetchLiveWeather}
                  className="ml-2 px-2 py-0.5 bg-rose-500/30 hover:bg-rose-500/50 text-white rounded text-[10px] font-bold underline"
                >
                  Retry
                </button>
              </div>
            ) : (
              <div className="font-bold text-sm text-white flex flex-wrap items-center gap-2 sm:gap-3 mt-1">
                <span className="text-base text-amber-300 font-mono font-black">{displayTemp}°C</span>
                <span className="text-gray-400 font-normal">({weatherCond})</span>
                <span className="text-[#a5d6a7]">|</span>
                <span>{liveWeather ? `${liveWeather.humidity}% Humidity` : `${formData.humidity}% Hum`}</span>
                <span className="text-[#a5d6a7]">|</span>
                <span>{liveWeather ? `${liveWeather.rainfall} mm Rain` : `${formData.rainfall} mm Rain`}</span>
                <span className="text-[#a5d6a7]">|</span>
                <span>{liveWeather ? `${liveWeather.windSpeed} km/h Wind` : `${formData.wind_speed} km/h Wind`}</span>
              </div>
            )}

            {/* Weather Source Transparency Badge */}
            <div className="text-[10px] text-gray-300/80 mt-1 flex items-center gap-2">
              <span>Source: <strong className="text-white">Open-Meteo API</strong></span>
              <span>•</span>
              <span>Coords: <span className="font-mono">{latitude.toFixed(2)}°, {longitude.toFixed(2)}°</span></span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
          <button
            onClick={fetchLiveWeather}
            disabled={loading}
            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
            title="Refresh Live Weather from Open-Meteo"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleApplyLiveSync}
            disabled={!liveWeather}
            className={`px-3.5 py-2 rounded-xl font-bold text-xs transition-all shadow-md flex items-center gap-1.5 ${
              lastSyncSuccess
                ? 'bg-emerald-500 text-white'
                : 'bg-[#4CAF50] hover:bg-[#388E3C] text-[#1b2e1b] hover:text-white'
            }`}
          >
            {lastSyncSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-white" />
                <span>Synced to Models!</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>Sync Weather</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Category Subscriptions & Zone Push Channel Control Strip */}
      <div className="bg-white p-3.5 rounded-2xl border border-[#c8e6c9] shadow-sm space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#e8f5e9] pb-2 text-xs">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#2e7d32]" />
            <span className="font-bold text-[#1b2e1b]">Alert Subscriptions & Categories:</span>
            <span className="px-2 py-0.5 bg-[#e8f5e9] text-[#2e7d32] font-mono font-bold text-[10px] rounded-full border border-[#c8e6c9]">
              {activeSubscribedCategories.length} / 4 Active
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSubscriptionModal(!showSubscriptionModal)}
              className="text-[11px] font-bold text-[#2e7d32] hover:text-[#1b2e1b] flex items-center gap-1 underline"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{showSubscriptionModal ? 'Close Subscription Panel' : 'Manage Alert Categories'}</span>
            </button>
          </div>
        </div>

        {/* 1-Click Interactive Category Subscription Chips */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {(['weather', 'pests', 'soil', 'market'] as AlertCategoryType[]).map((catKey) => {
            const meta = CATEGORY_METADATA[catKey];
            const Icon = meta.icon;
            const isSub = activeSubscribedCategories.includes(catKey);

            return (
              <button
                key={catKey}
                onClick={() => handleToggleCategory(catKey)}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 border shadow-sm ${
                  isSub
                    ? `${meta.badgeBg} ring-1 ring-black/5`
                    : 'bg-gray-100 text-gray-400 border-gray-200 line-through opacity-75 hover:opacity-100'
                }`}
                title={`Click to ${isSub ? 'mute' : 'subscribe to'} ${meta.label}`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{meta.shortLabel}</span>
                {isSub ? (
                  <Check className="w-3 h-3 text-emerald-700 font-black ml-0.5" />
                ) : (
                  <X className="w-3 h-3 text-gray-400 ml-0.5" />
                )}
              </button>
            );
          })}
        </div>

        {/* Selected Zone Push Notification Active Bar */}
        {zones.length > 0 && (
          <div className="pt-1.5 border-t border-[#f0f7f0] flex flex-wrap items-center justify-between gap-2 text-[11px]">
            <div className="flex items-center gap-1.5 text-gray-700">
              <Bell className="w-3.5 h-3.5 text-[#2e7d32]" />
              <span className="font-semibold">Monitored Farm Layout Zones:</span>
              <div className="flex flex-wrap gap-1">
                {zones.map((zone) => {
                  const isPushOn = zone.pushNotificationsEnabled;
                  return (
                    <button
                      key={zone.id}
                      onClick={() => onToggleZonePush && onToggleZonePush(zone.id)}
                      className={`px-2 py-0.5 rounded-lg font-bold text-[10px] transition-all flex items-center gap-1 border ${
                        isPushOn
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-gray-50 text-gray-400 border-gray-200 line-through'
                      }`}
                      title={isPushOn ? 'Push Notifications Enabled for this zone' : 'Push Muted for this zone'}
                    >
                      <MapPin className="w-2.5 h-2.5 text-[#4CAF50]" />
                      <span>{zone.name}</span>
                      {isPushOn && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />}
                    </button>
                  );
                })}
              </div>
            </div>

            <span className="text-[10px] text-gray-500 italic">
              {pushActiveZones.length} of {zones.length} zone push channels active
            </span>
          </div>
        )}

        {/* Hidden Alerts Notification Notice */}
        {hiddenBySubscriptionCount > 0 && (
          <div className="p-2 bg-amber-50 border border-amber-200 text-amber-900 text-xs rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>{hiddenBySubscriptionCount}</strong> alert(s) hidden based on your muted category subscriptions.
              </span>
            </div>
            <button
              onClick={() => {
                (['weather', 'pests', 'soil', 'market'] as AlertCategoryType[]).forEach(c => {
                  if (!activeSubscribedCategories.includes(c)) handleToggleCategory(c);
                });
              }}
              className="text-[10px] font-bold text-amber-800 hover:underline shrink-0"
            >
              Show All
            </button>
          </div>
        )}

        {/* Notification Toast Confirmation */}
        {testNotificationMsg && (
          <div className="p-2.5 bg-emerald-600 text-white text-xs rounded-xl flex items-center gap-2 shadow-md animate-bounce">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>{testNotificationMsg}</span>
          </div>
        )}
      </div>

      {/* Expanded Subscription Management Drawer / Modal */}
      <AnimatePresence>
        {showSubscriptionModal && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-5 bg-[#1b2e1b] text-white rounded-3xl border border-[#2e7d32] shadow-xl space-y-4 text-xs"
          >
            <div className="flex items-center justify-between border-b border-[#2e7d32] pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-[#4CAF50]" />
                <div>
                  <h4 className="font-serif font-bold text-sm text-white">Alert Category & Push Channel Preferences</h4>
                  <p className="text-[11px] text-[#a5d6a7]">Configure specific early detection hazard categories and zone targeting.</p>
                </div>
              </div>
              <button
                onClick={() => setShowSubscriptionModal(false)}
                className="p-1 hover:bg-[#2e7d32] rounded-lg transition-colors text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(['weather', 'pests', 'soil', 'market'] as AlertCategoryType[]).map((catKey) => {
                const meta = CATEGORY_METADATA[catKey];
                const Icon = meta.icon;
                const isSub = activeSubscribedCategories.includes(catKey);

                return (
                  <div
                    key={catKey}
                    className={`p-3.5 rounded-2xl border transition-all space-y-2 ${
                      isSub
                        ? 'bg-[#122012] border-[#4CAF50]'
                        : 'bg-black/30 border-gray-700 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold text-sm">
                        <Icon className={`w-4 h-4 ${meta.color}`} />
                        <span>{meta.label}</span>
                      </div>
                      <button
                        onClick={() => handleToggleCategory(catKey)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${
                          isSub
                            ? 'bg-[#4CAF50] text-[#1b2e1b] border-[#4CAF50]'
                            : 'bg-gray-800 text-gray-400 border-gray-700'
                        }`}
                      >
                        {isSub ? 'Subscribed' : 'Muted'}
                      </button>
                    </div>

                    <p className="text-[11px] text-[#a5d6a7] leading-relaxed">{meta.description}</p>

                    <div className="pt-2 border-t border-[#2e7d32]/40 flex items-center justify-between">
                      <span className="text-[10px] text-gray-400">Dispatch Push Channel</span>
                      <button
                        onClick={() => handleSimulateTestAlert(catKey)}
                        className="px-2 py-1 bg-white/10 hover:bg-white/20 text-white rounded-md text-[10px] font-bold flex items-center gap-1"
                      >
                        <Zap className="w-3 h-3 text-amber-300" />
                        <span>Simulate Alert</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Early Detection Alert Notifications Banner List */}
      <AnimatePresence>
        {activeAlerts.map((alert) => {
          const categoryKey = (alert.category || 'weather') as AlertCategoryType;
          const meta = CATEGORY_METADATA[categoryKey] || CATEGORY_METADATA.weather;
          const CategoryIcon = meta.icon;

          // Find affected zone names
          const affectedZones = zones.filter(z => alert.affectedZoneIds?.includes(z.id));

          return (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0 }}
              className={`p-4 rounded-2xl border shadow-md flex items-start justify-between gap-3 transition-all ${
                alert.severity === 'critical'
                  ? 'bg-red-600 text-white border-red-700'
                  : alert.severity === 'high'
                  ? 'bg-amber-600 text-white border-amber-700'
                  : alert.severity === 'medium'
                  ? 'bg-orange-600 text-white border-orange-700'
                  : 'bg-emerald-800 text-white border-emerald-700'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-black/20 rounded-xl shrink-0 mt-0.5">
                  <CategoryIcon className="w-5 h-5 text-white" />
                </div>

                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2 font-serif font-bold text-sm">
                    <span>{alert.title}</span>
                    <span className="text-[9px] font-mono font-black uppercase px-2 py-0.5 bg-black/30 rounded-full border border-white/20">
                      {meta.shortLabel}
                    </span>
                    <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 bg-white/20 text-white rounded-full">
                      {alert.severity}
                    </span>
                  </div>

                  <p className="text-xs leading-relaxed opacity-95">{alert.message}</p>

                  {/* Affected Farm Layout Zones Indicator */}
                  {affectedZones.length > 0 && (
                    <div className="pt-1 flex flex-wrap items-center gap-1 text-[11px] font-semibold text-white/90">
                      <span className="text-white/70">Targeted Sectors:</span>
                      {affectedZones.map((z) => (
                        <span
                          key={z.id}
                          className="px-2 py-0.5 bg-black/30 rounded-md font-mono text-[10px] flex items-center gap-1 border border-white/20"
                        >
                          <MapPin className="w-2.5 h-2.5 text-amber-300" />
                          <span>{z.name} ({z.assignedCrop})</span>
                          {z.pushNotificationsEnabled && (
                            <span className="text-emerald-300 font-bold" title="Zone Push Active">🔔</span>
                          )}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="pt-1">
                    <button
                      onClick={handleApplyLiveSync}
                      className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white text-[11px] font-bold rounded-lg transition-colors flex items-center gap-1 border border-white/30"
                    >
                      <span>{alert.action}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setDismissedAlerts(prev => [...prev, alert.id])}
                className="p-1 hover:bg-black/20 rounded-lg transition-colors text-white shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
