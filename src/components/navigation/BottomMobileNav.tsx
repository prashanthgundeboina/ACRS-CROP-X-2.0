import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Home,
  MapPin,
  Sprout,
  ShieldCheck,
  ShieldAlert,
  PhoneCall,
  Grid2X2,
  X,
  TrendingUp,
  BookOpen,
  Radio,
  Globe,
  Grid,
  Calendar,
  Calculator,
  RefreshCw,
  HelpCircle,
  LineChart,
  Compass,
  CloudRain,
  type LucideIcon,
  Bot,
  Droplets,
  Brain,
  Coins,
  Camera
} from 'lucide-react';
import { AppTabId } from '../HeaderIconMenuBar';

interface BottomMobileNavProps {
  activeTab: AppTabId;
  onSelectTab: (tab: AppTabId) => void;
  onOpenCallModal: () => void;
  onOpenChat: () => void;
}

interface DrawerTool {
  id: AppTabId;
  label: string;
  icon: LucideIcon;
  badge?: string;
}

export const BottomMobileNav: React.FC<BottomMobileNavProps> = ({
  activeTab,
  onSelectTab,
  onOpenCallModal,
  onOpenChat,
}) => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const drawerTools: DrawerTool[] = [
    { id: 'autonomous', label: '🧠 Farm Brain Supervisor', icon: Brain, badge: 'Phase 10' },
    { id: 'vision', label: '📷 Field Vision AI', icon: Camera, badge: 'Phase 12' },
    { id: 'resources', label: '💰 Farm Resources & Cost', icon: Coins, badge: 'Phase 9' },
    { id: 'operations', label: '🌾 Farm Operations', icon: Sprout, badge: 'Lifecycle' },
    { id: 'intelligence', label: 'Farm Intelligence', icon: Brain, badge: 'Digital Twin' },
    { id: 'recommendation', label: 'Crop Match AI', icon: Sprout, badge: 'AI' },
    { id: 'risk', label: 'Crop Risk AI', icon: ShieldAlert, badge: 'Early Warning' },
    { id: 'irrigation', label: 'Smart Irrigation', icon: Droplets, badge: 'AI' },
    { id: 'diagnostics', label: 'Plant Scan', icon: ShieldCheck, badge: 'Vision' },
    { id: 'farm', label: 'My Farm Zones', icon: MapPin },
    { id: 'weather', label: 'Weather Hazards', icon: CloudRain },
    { id: 'market', label: 'Market ROI', icon: TrendingUp },
    { id: 'drone', label: '🛰️ Drone Scouting', icon: Compass, badge: 'UAV 4K' },
    { id: 'carbon', label: '🌱 Carbon Credits', icon: Sprout, badge: 'Verra ESG' },
    { id: 'arbitrage', label: '📊 Mandi Arbitrage', icon: TrendingUp, badge: 'Arbitrage' },
    { id: 'bioacoustics', label: '🔊 Soil Bio-Acoustics', icon: Radio, badge: 'Geophone' },
    { id: 'fertilizer', label: 'Fertilizer Dose', icon: Calculator },
    { id: 'harvest', label: 'Harvest Tracker', icon: Calendar },
    { id: 'iot', label: 'IoT Sensors', icon: Radio, badge: 'USB ESP32' },
    { id: 'sensors', label: 'Mesh Live Probes', icon: Radio },
    { id: 'rotation', label: 'Crop Rotation', icon: RefreshCw },
    { id: 'tutorial', label: 'Farmer Academy', icon: BookOpen },
    { id: 'satellite', label: 'Satellite NDVI', icon: Globe },
    { id: 'heatmap', label: '2D Soil Grid Map', icon: Grid },
    { id: 'soilTrend', label: 'Soil Health Trend', icon: LineChart },
    { id: 'historical', label: 'Compare Crops', icon: Compass },
    { id: 'converter', label: 'Unit Converter', icon: HelpCircle },
  ];

  const handleSelectTool = (id: AppTabId) => {
    onSelectTab(id);
    setIsDrawerOpen(false);
  };

  return (
    <>
      {/* Mobile Sticky Bottom Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-[#c8e6c9] px-2 py-2 shadow-lg">
        <div className="flex items-center justify-around max-w-md mx-auto">
          {/* 1. Home / Prediction */}
          <button
            onClick={() => onSelectTab('recommendation')}
            className={`flex flex-col items-center gap-1 p-1.5 rounded-2xl transition-all cursor-pointer ${
              activeTab === 'recommendation' ? 'text-[#2e7d32] font-black scale-105' : 'text-gray-500 font-semibold'
            }`}
          >
            <Home className="w-5 h-5" />
            <span className="text-[10px] tracking-tight">Home</span>
          </button>

          {/* 2. My Farm */}
          <button
            onClick={() => onSelectTab('farm')}
            className={`flex flex-col items-center gap-1 p-1.5 rounded-2xl transition-all cursor-pointer ${
              activeTab === 'farm' ? 'text-[#2e7d32] font-black scale-105' : 'text-gray-500 font-semibold'
            }`}
          >
            <MapPin className="w-5 h-5" />
            <span className="text-[10px] tracking-tight">My Farm</span>
          </button>

          {/* 3. Center Prominent AI Voice Call */}
          <button
            onClick={onOpenCallModal}
            className="flex flex-col items-center -mt-5 cursor-pointer"
          >
            <div className="p-3 bg-gradient-to-r from-amber-500 via-emerald-600 to-teal-700 text-white rounded-full shadow-xl border-2 border-white animate-pulse">
              <PhoneCall className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-extrabold text-[#1b2e1b] mt-0.5">Voice AI</span>
          </button>

          {/* 4. Scan Plant Pathology */}
          <button
            onClick={() => onSelectTab('diagnostics')}
            className={`flex flex-col items-center gap-1 p-1.5 rounded-2xl transition-all cursor-pointer ${
              activeTab === 'diagnostics' ? 'text-[#2e7d32] font-black scale-105' : 'text-gray-500 font-semibold'
            }`}
          >
            <ShieldCheck className="w-5 h-5" />
            <span className="text-[10px] tracking-tight">Scan</span>
          </button>

          {/* 5. More Tools Drawer Trigger */}
          <button
            onClick={() => setIsDrawerOpen(true)}
            className={`flex flex-col items-center gap-1 p-1.5 rounded-2xl transition-all cursor-pointer ${
              isDrawerOpen ? 'text-[#2e7d32] font-black' : 'text-gray-500 font-semibold'
            }`}
          >
            <Grid2X2 className="w-5 h-5" />
            <span className="text-[10px] tracking-tight">Tools</span>
          </button>
        </div>
      </nav>

      {/* Slide-Up Tools Drawer */}
      <AnimatePresence>
        {isDrawerOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex items-end">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs"
            />

            {/* Drawer Sheet */}
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
              className="relative w-full max-h-[85vh] bg-white rounded-t-3xl border-t border-[#c8e6c9] p-5 shadow-2xl flex flex-col z-10 overflow-hidden"
            >
              {/* Drawer Handle & Header */}
              <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-4" />

              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <Grid2X2 className="w-5 h-5 text-[#2e7d32]" />
                  <h3 className="font-serif font-bold text-lg text-[#1b2e1b]">
                    CroperX All Modules & Tools
                  </h3>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Chat trigger inside drawer */}
              <div className="py-3">
                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    onOpenChat();
                  }}
                  className="w-full p-3 bg-[#e8f5e9] text-[#1b2e1b] rounded-2xl font-bold text-xs flex items-center justify-between border border-[#a5d6a7]"
                >
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-[#2e7d32]" />
                    <span>Open Interactive AI Text Chat</span>
                  </div>
                  <span className="text-[10px] font-mono text-[#2e7d32] uppercase">Chat →</span>
                </button>
              </div>

              {/* Tools Grid */}
              <div className="overflow-y-auto py-3 grid grid-cols-2 sm:grid-cols-3 gap-2.5 custom-scrollbar">
                {drawerTools.map((tool) => {
                  const Icon = tool.icon;
                  const isActive = activeTab === tool.id;
                  return (
                    <button
                      key={tool.id}
                      onClick={() => handleSelectTool(tool.id)}
                      className={`p-3 rounded-2xl text-left border transition-all flex flex-col justify-between h-20 cursor-pointer ${
                        isActive
                          ? 'bg-[#1b2e1b] text-white border-[#1b2e1b] shadow-md'
                          : 'bg-white hover:bg-[#e8f5e9]/50 border-gray-200 text-gray-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <Icon
                          className={`w-5 h-5 ${
                            isActive ? 'text-[#4CAF50]' : 'text-[#2e7d32]'
                          }`}
                        />
                        {tool.badge && (
                          <span
                            className={`text-[8px] font-mono font-extrabold px-1.5 py-0.5 rounded-full uppercase ${
                              isActive ? 'bg-emerald-500/30 text-emerald-200' : 'bg-emerald-100 text-[#2e7d32]'
                            }`}
                          >
                            {tool.badge}
                          </span>
                        )}
                      </div>
                      <span className="text-xs font-bold font-sans tracking-tight line-clamp-1">
                        {tool.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
