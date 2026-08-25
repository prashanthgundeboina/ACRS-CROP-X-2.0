import React, { useState } from 'react';
import { SoilData, FarmZone as FarmZoneType, AlertCategoryType } from '../types';
import { 
  Grid, 
  Plus, 
  Trash2, 
  Edit3, 
  MapPin, 
  Layers, 
  Check, 
  Sprout, 
  Bell, 
  BellOff, 
  Zap, 
  Filter, 
  ShieldCheck, 
  Radio, 
  Sliders,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { CATEGORY_METADATA } from './EarlyWeatherAlertBanner';

interface Props {
  baselineSoil: SoilData;
  onApplyZoneDataToMain?: (zoneData: Partial<SoilData>) => void;
  zones?: FarmZoneType[];
  onUpdateZones?: (zones: FarmZoneType[]) => void;
}

export const FarmLayoutEditor: React.FC<Props> = ({ 
  baselineSoil, 
  onApplyZoneDataToMain,
  zones: externalZones,
  onUpdateZones
}) => {
  const [internalZones, setInternalZones] = useState<FarmZoneType[]>([
    {
      id: 'z1',
      name: 'North Field A',
      areaHa: 4.5,
      assignedCrop: 'Maize',
      soilType: 'Loamy',
      nitrogen: 110,
      ph: 6.5,
      moisture: 32,
      status: 'Active Cultivation',
      pushNotificationsEnabled: true,
      pushCategories: ['weather', 'pests', 'soil']
    },
    {
      id: 'z2',
      name: 'South Greenhouse B',
      areaHa: 2.0,
      assignedCrop: 'Tomatoes / Peppers',
      soilType: 'Sandy Loam',
      nitrogen: 135,
      ph: 6.8,
      moisture: 40,
      status: 'Active Cultivation',
      pushNotificationsEnabled: true,
      pushCategories: ['weather', 'pests', 'soil', 'market']
    },
    {
      id: 'z3',
      name: 'East Terraces C',
      areaHa: 6.0,
      assignedCrop: 'Rice',
      soilType: 'Clay',
      nitrogen: 90,
      ph: 7.1,
      moisture: 48,
      status: 'Soil Preparation',
      pushNotificationsEnabled: true,
      pushCategories: ['weather', 'pests']
    }
  ]);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [expandedZoneSettings, setExpandedZoneSettings] = useState<string | null>(null);

  const zones = externalZones || internalZones;

  const updateZonesList = (updater: (prev: FarmZoneType[]) => FarmZoneType[]) => {
    const updated = updater(zones);
    if (onUpdateZones) {
      onUpdateZones(updated);
    } else {
      setInternalZones(updated);
    }
  };

  const [newZoneName, setNewZoneName] = useState<string>('West Valley D');
  const [newCrop, setNewCrop] = useState<string>('Chickpea');
  const [newArea, setNewArea] = useState<number>(3.5);

  const handleAddZone = () => {
    const created: FarmZoneType = {
      id: 'z_' + Date.now(),
      name: newZoneName,
      areaHa: newArea,
      assignedCrop: newCrop,
      soilType: 'Silty',
      nitrogen: baselineSoil.nitrogen,
      ph: baselineSoil.ph,
      moisture: baselineSoil.soil_moisture,
      status: 'Soil Preparation',
      pushNotificationsEnabled: true,
      pushCategories: ['weather', 'pests', 'soil']
    };
    updateZonesList(prev => [...prev, created]);
    setNewZoneName(`Zone ${zones.length + 2}`);
    showToast(`Added new zone: ${created.name} with push notifications enabled!`);
  };

  const handleDeleteZone = (id: string) => {
    updateZonesList(prev => prev.filter(z => z.id !== id));
  };

  const handleToggleZonePush = (id: string) => {
    // Request native permission if enabling push
    const target = zones.find(z => z.id === id);
    if (target && !target.pushNotificationsEnabled && 'Notification' in window) {
      Notification.requestPermission().catch(() => {});
    }

    updateZonesList(prev =>
      prev.map(z => z.id === id ? { ...z, pushNotificationsEnabled: !z.pushNotificationsEnabled } : z)
    );

    const isNowOn = target ? !target.pushNotificationsEnabled : false;
    showToast(`${isNowOn ? '🔔 Enabled' : '🔕 Muted'} push notifications for ${target?.name}`);
  };

  const handleToggleCategoryForZone = (zoneId: string, category: AlertCategoryType) => {
    updateZonesList(prev =>
      prev.map(z => {
        if (z.id !== zoneId) return z;
        const currentCats = z.pushCategories || ['weather', 'pests', 'soil', 'market'];
        const updatedCats = currentCats.includes(category)
          ? currentCats.filter(c => c !== category)
          : [...currentCats, category];
        return { ...z, pushCategories: updatedCats };
      })
    );
  };

  const handleToggleAllPush = (enable: boolean) => {
    updateZonesList(prev => prev.map(z => ({ ...z, pushNotificationsEnabled: enable })));
    showToast(`${enable ? '🔔 Enabled' : '🔕 Disabled'} push alerts across ALL farm zones.`);
  };

  const handleTestZonePush = (zone: FarmZoneType) => {
    // Mobile haptic vibration
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200]);
    }

    // Native browser push notification
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(`🔔 ZONE PUSH ALERT: ${zone.name}`, {
          body: `Real-time push notification test active for ${zone.assignedCrop} (${zone.areaHa} ha). All telemetry channels operational.`,
          icon: '/icon.png',
          tag: 'zone-push-test'
        });
      } catch (e) {
        console.warn('Native notification error:', e);
      }
    }

    showToast(`⚡ Test Push Dispatched to ${zone.name} (${zone.assignedCrop})! Haptic buzz triggered.`);
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const totalArea = zones.reduce((acc, z) => acc + z.areaHa, 0);
  const estimatedFarmYieldTons = zones.reduce((acc, z) => acc + z.areaHa * (z.assignedCrop === 'Rice' ? 4.5 : 3.8), 0);
  const activePushCount = zones.filter(z => z.pushNotificationsEnabled).length;

  return (
    <div className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-[#c8e6c9] shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#c8e6c9] pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[#4CAF50]">
            <Grid className="w-5 h-5 text-[#2e7d32]" />
            <span className="text-[10px] font-black uppercase tracking-widest text-[#2e7d32]">Spatial Agricultural Zoning & Push Dispatch</span>
          </div>
          <h3 className="font-serif text-2xl font-bold text-[#1b2e1b]">Multi-Zone Farm Layout & Push Notification Manager</h3>
          <p className="text-xs text-[#667e66]">
            Define sector boundaries, assign crop rotation allocations, and subscribe selected zones to real-time mobile push notifications.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-[#f8fcf8] p-3.5 rounded-2xl border border-[#c8e6c9] text-xs">
          <div>
            <div className="text-[10px] uppercase font-bold text-gray-500">Total Farm Area</div>
            <div className="text-lg font-black text-[#1b2e1b] font-mono">{totalArea.toFixed(1)} ha</div>
          </div>
          <div className="h-6 w-px bg-[#c8e6c9]" />
          <div>
            <div className="text-[10px] uppercase font-bold text-gray-500">Est. Total Harvest</div>
            <div className="text-lg font-black text-[#2e7d32] font-mono">{estimatedFarmYieldTons.toFixed(1)} Tons</div>
          </div>
          <div className="h-6 w-px bg-[#c8e6c9]" />
          <div>
            <div className="text-[10px] uppercase font-bold text-gray-500">Active Zone Push</div>
            <div className="text-lg font-black text-emerald-600 font-mono flex items-center gap-1">
              <Bell className="w-4 h-4 text-emerald-500 animate-pulse" />
              <span>{activePushCount} / {zones.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Zone Push Notification Master Controller Strip */}
      <div className="p-4 bg-gradient-to-r from-[#1b2e1b] to-[#2e7d32] text-white rounded-2xl border border-[#4CAF50]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-700/60 rounded-xl text-emerald-200 border border-emerald-500/40 shrink-0">
            <Radio className="w-5 h-5 text-emerald-400 animate-pulse" />
          </div>
          <div>
            <div className="font-bold text-sm text-white flex items-center gap-2">
              <span>Targeted Zone Push Dispatch Engine</span>
              <span className="text-[10px] bg-emerald-950 text-emerald-300 font-mono px-2 py-0.5 rounded-md border border-emerald-500/30">
                Live Spatial Linking
              </span>
            </div>
            <p className="text-emerald-200 text-xs mt-0.5">
              Weather and pest outbreak alerts are automatically filtered and dispatched to the specific farm sectors you enable below.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => handleToggleAllPush(true)}
            className="px-3 py-1.5 bg-[#4CAF50] hover:bg-[#388E3C] text-[#1b2e1b] hover:text-white font-bold rounded-xl transition-all flex items-center gap-1"
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Enable All Push</span>
          </button>
          <button
            onClick={() => handleToggleAllPush(false)}
            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-gray-200 hover:text-white font-bold rounded-xl transition-all flex items-center gap-1"
          >
            <BellOff className="w-3.5 h-3.5" />
            <span>Mute All</span>
          </button>
        </div>
      </div>

      {/* Toast Feedback Banner */}
      {toastMessage && (
        <div className="p-3 bg-emerald-600 text-white font-bold text-xs rounded-2xl flex items-center gap-2 shadow-lg animate-bounce">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Grid of Farm Layout Zones */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {zones.map((zone) => {
          const isPushEnabled = zone.pushNotificationsEnabled ?? true;
          const zoneCategories = zone.pushCategories || ['weather', 'pests', 'soil', 'market'];
          const isSettingsOpen = expandedZoneSettings === zone.id;

          return (
            <div
              key={zone.id}
              className={`p-5 rounded-3xl border transition-all space-y-4 relative group ${
                isPushEnabled
                  ? 'bg-[#f8fcf8] border-[#c8e6c9] hover:border-[#4CAF50]'
                  : 'bg-gray-50 border-gray-200 opacity-90'
              }`}
            >
              {/* Card Header */}
              <div className="flex justify-between items-start border-b border-[#c8e6c9] pb-3">
                <div>
                  <div className="flex items-center gap-1.5 text-[#2e7d32] font-bold text-base font-serif">
                    <MapPin className="w-4 h-4 text-[#4CAF50]" />
                    <span>{zone.name}</span>
                  </div>
                  <span className="text-[10px] text-gray-500 font-mono">{zone.areaHa} Hectares ({zone.soilType})</span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleDeleteZone(zone.id)}
                    className="p-1.5 text-gray-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Delete Sector"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Push Notification Toggle Bar for this Zone */}
              <div className="p-2.5 bg-white rounded-2xl border border-[#c8e6c9] space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-gray-800">
                    {isPushEnabled ? (
                      <Bell className="w-4 h-4 text-emerald-600 animate-pulse" />
                    ) : (
                      <BellOff className="w-4 h-4 text-gray-400" />
                    )}
                    <span>Zone Push Notifications</span>
                  </div>

                  <button
                    onClick={() => handleToggleZonePush(zone.id)}
                    className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all shadow-sm flex items-center gap-1 border ${
                      isPushEnabled
                        ? 'bg-emerald-600 text-white border-emerald-700'
                        : 'bg-gray-200 text-gray-600 border-gray-300'
                    }`}
                  >
                    {isPushEnabled ? 'Push Active' : 'Push Muted'}
                  </button>
                </div>

                {/* Categories Targeted for this Zone */}
                {isPushEnabled && (
                  <div className="pt-1.5 border-t border-gray-100 space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] text-gray-500">
                      <span className="font-semibold">Subscribed Category Channels:</span>
                      <button
                        onClick={() => setExpandedZoneSettings(isSettingsOpen ? null : zone.id)}
                        className="text-[#2e7d32] hover:underline font-bold flex items-center gap-0.5"
                      >
                        <span>{isSettingsOpen ? 'Hide' : 'Configure'}</span>
                        <ChevronDown className={`w-3 h-3 transition-transform ${isSettingsOpen ? 'rotate-180' : ''}`} />
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {(['weather', 'pests', 'soil', 'market'] as AlertCategoryType[]).map((catKey) => {
                        const meta = CATEGORY_METADATA[catKey];
                        const isCatSub = zoneCategories.includes(catKey);

                        return (
                          <button
                            key={catKey}
                            onClick={() => handleToggleCategoryForZone(zone.id, catKey)}
                            className={`px-2 py-0.5 rounded-md font-bold text-[10px] transition-all flex items-center gap-1 border ${
                              isCatSub
                                ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                                : 'bg-gray-100 text-gray-400 border-gray-200 line-through'
                            }`}
                          >
                            <span>{meta.shortLabel}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Crop & Telemetry Stats */}
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center p-2 bg-white rounded-xl border border-[#c8e6c9]">
                  <span className="text-gray-600 font-medium">Assigned Crop:</span>
                  <span className="font-bold text-[#1b2e1b] flex items-center gap-1">
                    <Sprout className="w-3.5 h-3.5 text-[#4CAF50]" /> {zone.assignedCrop}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                  <div className="p-2 bg-white rounded-xl border border-[#c8e6c9]">
                    <div className="text-[9px] text-gray-400 uppercase">Nitrogen</div>
                    <div className="font-bold text-[#2e7d32] font-mono">{zone.nitrogen}</div>
                  </div>
                  <div className="p-2 bg-white rounded-xl border border-[#c8e6c9]">
                    <div className="text-[9px] text-gray-400 uppercase">Soil pH</div>
                    <div className="font-bold text-[#2e7d32] font-mono">{zone.ph}</div>
                  </div>
                  <div className="p-2 bg-white rounded-xl border border-[#c8e6c9]">
                    <div className="text-[9px] text-gray-400 uppercase">Moisture</div>
                    <div className="font-bold text-[#2e7d32] font-mono">{zone.moisture}%</div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <button
                  onClick={() => handleTestZonePush(zone)}
                  className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-100 animate-pulse" />
                  <span>Test Push Dispatch & Haptic Buzz</span>
                </button>

                {onApplyZoneDataToMain && (
                  <button
                    onClick={() => onApplyZoneDataToMain({ nitrogen: zone.nitrogen, ph: zone.ph, soil_moisture: zone.moisture })}
                    className="w-full py-2 bg-[#1b2e1b] hover:bg-[#2e7d32] text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    <Check className="w-3.5 h-3.5 text-[#4CAF50]" /> Load Zone Telemetry to AI
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* Add New Zone Sector Box */}
        <div className="p-5 bg-[#1b2e1b] text-white rounded-3xl border border-[#2e7d32] space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h4 className="font-serif text-base font-bold text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#4CAF50]" /> Add Sector / Greenhouse
            </h4>

            <div className="space-y-2 text-xs">
              <div>
                <label className="text-[10px] text-[#a5d6a7] font-bold">Zone Label</label>
                <input
                  type="text"
                  value={newZoneName}
                  onChange={(e) => setNewZoneName(e.target.value)}
                  className="w-full bg-[#122012] border border-[#2e7d32] text-white rounded-xl p-2 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-[#a5d6a7] font-bold">Area (ha)</label>
                  <input
                    type="number"
                    value={newArea}
                    onChange={(e) => setNewArea(parseFloat(e.target.value) || 1)}
                    className="w-full bg-[#122012] border border-[#2e7d32] text-white rounded-xl p-2 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-[#a5d6a7] font-bold">Crop Variety</label>
                  <select
                    value={newCrop}
                    onChange={(e) => setNewCrop(e.target.value)}
                    className="w-full bg-[#122012] border border-[#2e7d32] text-white rounded-xl p-2 outline-none"
                  >
                    <option value="Rice">Rice</option>
                    <option value="Maize">Maize</option>
                    <option value="Chickpea">Chickpea</option>
                    <option value="Wheat">Wheat</option>
                    <option value="Cotton">Cotton</option>
                    <option value="Tomatoes / Peppers">Tomatoes / Peppers</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleAddZone}
            className="w-full py-2.5 bg-[#4CAF50] hover:bg-[#2e7d32] text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 shadow-md"
          >
            <Plus className="w-4 h-4" /> Save Zone Sector
          </button>
        </div>
      </div>
    </div>
  );
};
