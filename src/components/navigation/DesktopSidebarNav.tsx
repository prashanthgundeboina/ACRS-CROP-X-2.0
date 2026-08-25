import React from 'react';
import { motion } from 'motion/react';
import {
  Sprout,
  TrendingUp,
  ShieldCheck,
  ShieldAlert,
  BookOpen,
  Radio,
  Globe,
  Grid,
  MapPin,
  Calendar,
  Calculator,
  RefreshCw,
  HelpCircle,
  LineChart,
  Compass,
  CloudRain,
  PhoneCall,
  Bot,
  type LucideIcon,
  Sparkles,
  Droplets,
  Brain,
  Coins,
  Camera,
  MessageCircle,
  Video
} from 'lucide-react';
import { AppTabId } from '../HeaderIconMenuBar';
import { SimpleExpertToggle } from '../ui/SimpleExpertToggle';

interface DesktopSidebarNavProps {
  activeTab: AppTabId;
  onSelectTab: (tab: AppTabId) => void;
  onOpenCallModal: () => void;
  onOpenChat: () => void;
  isExpertMode: boolean;
  onToggleExpertMode: (expert: boolean) => void;
}

interface NavGroup {
  title: string;
  items: {
    id: AppTabId;
    label: string;
    icon: LucideIcon;
    badge?: string;
  }[];
}

export const DesktopSidebarNav: React.FC<DesktopSidebarNavProps> = ({
  activeTab,
  onSelectTab,
  onOpenCallModal,
  onOpenChat,
  isExpertMode,
  onToggleExpertMode,
}) => {
  const navGroups: NavGroup[] = [
    {
      title: 'Core AI & Crops',
      items: [
        { id: 'autonomous', label: 'Farm Brain AI', icon: Brain, badge: 'Supervisor' },
        { id: 'vision', label: '📷 Field Vision AI', icon: Camera, badge: 'Phase 12' },
        { id: 'intelligence', label: 'Farm Intelligence', icon: Brain, badge: 'Digital Twin' },
        { id: 'recommendation', label: 'Crop Match AI', icon: Sprout, badge: 'AI' },
        { id: 'arbitrage', label: '📊 Mandi Arbitrage', icon: TrendingUp, badge: 'Arbitrage' },
        { id: 'risk', label: 'Crop Risk AI', icon: ShieldAlert, badge: 'Early Warning' },
        { id: 'irrigation', label: 'Smart Irrigation', icon: Droplets, badge: 'AI' },
        { id: 'diagnostics', label: 'Plant Scan', icon: ShieldCheck, badge: 'Vision' },
        { id: 'market', label: 'Market ROI', icon: TrendingUp },
        { id: 'tutorial', label: 'Farmer Academy', icon: BookOpen },
      ],
    },
    {
      title: 'Real-Time Adviser Hub',
      items: [
        { id: 'chat', label: '💬 Instagram Agri-Chat', icon: MessageCircle, badge: 'DMs & GPS' },
        { id: 'calls', label: '📹 Live Farmer Calls', icon: Video, badge: 'WebRTC' },
      ],
    },
    {
      title: 'Farm Operations',
      items: [
        { id: 'resources', label: '💰 Farm Resources', icon: Coins, badge: 'Cost & Risk' },
        { id: 'carbon', label: '🌱 Carbon Credits', icon: Sprout, badge: 'Verra ESG' },
        { id: 'operations', label: '🌾 Farm Operations', icon: Sprout, badge: 'Lifecycle' },
        { id: 'farm', label: 'My Farm Zones', icon: MapPin },
        { id: 'harvest', label: 'Harvest Tracker', icon: Calendar },
        { id: 'fertilizer', label: 'Fertilizer Dose', icon: Calculator },
        { id: 'rotation', label: '3-Season Rotation', icon: RefreshCw },
      ],
    },
    {
      title: 'Field Telemetry & GIS',
      items: [
        { id: 'drone', label: '🛰️ Drone Scouting', icon: Compass, badge: 'UAV 4K' },
        { id: 'iot', label: 'IoT Sensors', icon: Radio, badge: 'USB ESP32' },
        { id: 'weather', label: 'Weather & Hazards', icon: CloudRain },
        { id: 'sensors', label: 'Mesh Live Probes', icon: Radio },
        { id: 'satellite', label: 'Satellite NDVI', icon: Globe },
        { id: 'heatmap', label: '2D Soil Grid Map', icon: Grid },
      ],
    },
    {
      title: 'Analytics & Tools',
      items: [
        { id: 'bioacoustics', label: '🔊 Soil Bio-Acoustics', icon: Radio, badge: 'Geophone' },
        { id: 'soilTrend', label: '30-Day Soil Trend', icon: LineChart },
        { id: 'historical', label: 'Compare Crops', icon: Compass },
        { id: 'converter', label: 'Unit Calculator', icon: HelpCircle },
      ],
    },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-72 bg-white/90 backdrop-blur-xl border-r border-[#c8e6c9]/70 h-screen sticky top-0 shrink-0 z-30 shadow-xs overflow-y-auto custom-scrollbar">
      {/* Brand Header */}
      <div className="p-5 border-b border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-[#2e7d32] to-[#1b2e1b] text-white rounded-2xl shadow-md">
            <Sprout className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h1 className="font-serif font-extrabold text-xl text-[#1b2e1b] tracking-tight leading-none">
              CroperX
            </h1>
            <span className="text-[10px] font-mono font-bold uppercase text-[#2e7d32] tracking-wider">
              Agritech AI 2.0
            </span>
          </div>
        </div>
      </div>

      {/* Voice & Assistant Action Hub */}
      <div className="p-4 space-y-2 border-b border-gray-100">
        <button
          onClick={onOpenCallModal}
          className="w-full p-3 bg-gradient-to-r from-amber-500 via-emerald-600 to-teal-700 text-white rounded-2xl font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-between group cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-white/20 rounded-xl">
              <PhoneCall className="w-4 h-4 animate-bounce" />
            </div>
            <div className="text-left leading-tight">
              <span className="text-xs font-extrabold block">CroperX Call</span>
              <span className="text-[10px] opacity-90 font-sans">Voice AI Agronomist</span>
            </div>
          </div>
          <Sparkles className="w-4 h-4 text-amber-200 group-hover:scale-125 transition-transform" />
        </button>

        <button
          onClick={onOpenChat}
          className="w-full p-2.5 bg-[#e8f5e9] hover:bg-[#c8e6c9] text-[#1b2e1b] rounded-2xl font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer border border-[#a5d6a7]/60"
        >
          <Bot className="w-4 h-4 text-[#2e7d32]" />
          <span>Ask CroperX Assistant</span>
        </button>
      </div>

      {/* Mode Switcher */}
      <div className="p-4 border-b border-gray-100 flex items-center justify-between">
        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider font-mono">
          Interface
        </span>
        <SimpleExpertToggle isExpertMode={isExpertMode} onToggle={onToggleExpertMode} />
      </div>

      {/* Navigation Groups */}
      <div className="p-4 space-y-6 flex-1">
        {navGroups.map((group) => (
          <div key={group.title} className="space-y-1.5">
            <h3 className="px-3 text-[11px] font-mono uppercase font-bold text-gray-500 tracking-wider">
              {group.title}
            </h3>
            <div className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectTab(item.id)}
                    className={`w-full px-3 py-2.5 rounded-2xl font-sans text-xs sm:text-sm font-bold transition-all flex items-center justify-between cursor-pointer ${
                      isActive
                        ? 'bg-[#1b2e1b] text-white shadow-md'
                        : 'text-gray-700 hover:bg-[#e8f5e9]/70 hover:text-[#1b2e1b]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-4 h-4 ${
                          isActive ? 'text-[#4CAF50]' : 'text-[#2e7d32]'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full uppercase font-extrabold ${
                          isActive
                            ? 'bg-emerald-500/30 text-emerald-200'
                            : 'bg-emerald-100 text-[#2e7d32]'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer info */}
      <div className="p-4 border-t border-gray-100 text-center text-[10px] text-gray-600 font-mono">
        <p>CroperX Agritech 2.0</p>
        <p className="text-[#2e7d32]">Google Gemini 2.5 • Open-Meteo</p>
      </div>
    </aside>
  );
};
