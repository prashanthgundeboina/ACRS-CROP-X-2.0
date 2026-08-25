import React from 'react';
import { 
  Sprout, 
  TrendingUp, 
  BookOpen, 
  Activity, 
  Calendar, 
  Radio, 
  Grid, 
  HelpCircle, 
  LineChart, 
  Calculator, 
  Globe, 
  Compass, 
  RefreshCw, 
  CloudRain, 
  ShieldCheck,
  ChevronDown,
  Coins,
  Droplets,
  Brain,
  Camera
} from 'lucide-react';

export type AppTabId = 
  | 'autonomous'
  | 'vision'
  | 'recommendation' 
  | 'resources'
  | 'operations'
  | 'intelligence'
  | 'risk'
  | 'irrigation'
  | 'iot'
  | 'market' 
  | 'tutorial' 
  | 'soilTrend' 
  | 'harvest' 
  | 'sensors' 
  | 'farm' 
  | 'zones'
  | 'heatmap' 
  | 'historical' 
  | 'fertilizer' 
  | 'satellite' 
  | 'converter' 
  | 'rotation' 
  | 'weather' 
  | 'diagnostics'
  | 'drone'
  | 'carbon'
  | 'arbitrage'
  | 'bioacoustics'
  | 'chat'
  | 'calls';

interface HeaderIconMenuBarProps {
  activeTab: AppTabId;
  onSelectTab: (tab: AppTabId) => void;
}

interface MenuItem {
  id: AppTabId;
  label: string;
  icon: React.ElementType;
  category: 'AI & Crop Core' | 'IoT & Field GIS' | 'Farm Operations' | 'Soil & Weather';
  badge?: string;
}

export const HeaderIconMenuBar: React.FC<HeaderIconMenuBarProps> = ({
  activeTab,
  onSelectTab
}) => {
  const menuItems: MenuItem[] = [
    { id: 'autonomous', label: 'Farm Brain AI', icon: Brain, category: 'AI & Crop Core', badge: 'Supervisor' },
    { id: 'vision', label: '📷 Field Vision AI', icon: Camera, category: 'AI & Crop Core', badge: 'Phase 12' },
    { id: 'resources', label: 'Farm Resources', icon: Coins, category: 'Farm Operations', badge: 'Cost & Risk' },
    { id: 'operations', label: 'Farm Operations', icon: Sprout, category: 'Farm Operations', badge: 'Lifecycle' },
    { id: 'intelligence', label: 'Farm Intelligence', icon: Brain, category: 'AI & Crop Core', badge: 'Digital Twin' },
    { id: 'recommendation', label: 'Prediction Engine', icon: Sprout, category: 'AI & Crop Core', badge: 'AI Top' },
    { id: 'risk', label: 'Crop Risk AI', icon: ShieldCheck, category: 'AI & Crop Core', badge: 'Early Warning' },
    { id: 'irrigation', label: 'Smart Irrigation', icon: Droplets, category: 'AI & Crop Core', badge: 'Precision' },
    { id: 'market', label: 'Market ROI', icon: TrendingUp, category: 'AI & Crop Core' },
    { id: 'diagnostics', label: 'Plant Health', icon: ShieldCheck, category: 'AI & Crop Core', badge: 'Pathogen' },
    { id: 'tutorial', label: 'CroperX Guide', icon: BookOpen, category: 'AI & Crop Core' },

    { id: 'iot', label: 'IoT Sensors', icon: Radio, category: 'IoT & Field GIS', badge: 'USB ESP32' },
    { id: 'sensors', label: 'Live Sensor Sync', icon: Radio, category: 'IoT & Field GIS', badge: '24/7 Mesh' },
    { id: 'satellite', label: 'Satellite Canopy', icon: Globe, category: 'IoT & Field GIS' },
    { id: 'heatmap', label: 'Soil Heatmap', icon: Grid, category: 'IoT & Field GIS' },
    { id: 'farm', label: 'Farm Layout', icon: Compass, category: 'IoT & Field GIS' },

  { id: 'drone', label: '🛰️ Drone Scouting', icon: Compass, category: 'IoT & Field GIS', badge: 'UAV 4K' },
    { id: 'carbon', label: '🌱 Carbon Credits', icon: Sprout, category: 'Farm Operations', badge: 'Verra VM42' },
    { id: 'arbitrage', label: '📊 Mandi Arbitrage', icon: TrendingUp, category: 'AI & Crop Core', badge: 'Realtime' },
    { id: 'bioacoustics', label: '🔊 Soil Bio-Acoustics', icon: Activity, category: 'Soil & Weather', badge: 'Geophone' },

    { id: 'harvest', label: 'Harvest Scheduler', icon: Calendar, category: 'Farm Operations' },
    { id: 'fertilizer', label: 'Smart Fertilizer', icon: Calculator, category: 'Farm Operations' },
    { id: 'rotation', label: 'Crop Rotation', icon: RefreshCw, category: 'Farm Operations' },
    { id: 'converter', label: 'Unit Converter', icon: HelpCircle, category: 'Farm Operations' },

    { id: 'soilTrend', label: 'Soil Health', icon: Activity, category: 'Soil & Weather' },
    { id: 'historical', label: 'Dual-Crop Compare', icon: LineChart, category: 'Soil & Weather' },
    { id: 'weather', label: 'Weather Alerts', icon: CloudRain, category: 'Soil & Weather', badge: 'Live Radar' }
  ];

  return (
    <div className="bg-white rounded-3xl p-4 border border-[#c8e6c9] shadow-sm space-y-3">
      <div className="flex items-center justify-between border-b border-[#c8e6c9]/60 pb-2">
        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#2e7d32]">
          Feature Suite Navigation Bar
        </span>
        <span className="text-[10px] text-gray-500 font-mono">15 Active Modules</span>
      </div>

      {/* Icon Menu Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-15 gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              title={`${item.label} (${item.category})`}
              className={`flex flex-col items-center justify-center p-2.5 rounded-2xl border transition-all duration-200 group relative ${
                isActive
                  ? 'bg-[#1b2e1b] text-white border-[#4CAF50] shadow-md scale-105 ring-2 ring-[#4CAF50]/30'
                  : 'bg-[#f8fcf8] text-[#1b2e1b] border-[#c8e6c9] hover:bg-[#e8f5e9] hover:border-[#a5d6a7]'
              }`}
            >
              {item.badge && (
                <span className={`absolute -top-1.5 -right-1 px-1.5 py-0.2 text-[8px] font-mono font-black uppercase rounded-full shadow-sm ${
                  isActive ? 'bg-[#4CAF50] text-white' : 'bg-emerald-600 text-white'
                }`}>
                  {item.badge}
                </span>
              )}

              <div className={`p-1.5 rounded-xl ${isActive ? 'bg-[#2e7d32] text-white' : 'bg-white text-[#2e7d32] group-hover:bg-[#4CAF50] group-hover:text-white'} transition-colors`}>
                <Icon className="w-4 h-4" />
              </div>

              <span className={`text-[10px] font-bold mt-1.5 leading-tight text-center truncate w-full ${
                isActive ? 'text-white' : 'text-[#1b2e1b]'
              }`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
