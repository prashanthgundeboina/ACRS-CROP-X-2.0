import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, X, Sparkles, ArrowRight, Sprout, ShieldCheck, ShieldAlert, Droplets, CloudRain, Calculator, TrendingUp, Calendar, PhoneCall, Bot, Radio, Brain, Coins, Camera, Flame, Footprints, Compass } from 'lucide-react';
import { AppTabId } from '../HeaderIconMenuBar';

interface GlobalSmartSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: AppTabId) => void;
  onOpenCallModal: () => void;
  onOpenChat: () => void;
}

interface QuickQuery {
  text: string;
  tabId?: AppTabId;
  action?: 'call' | 'chat';
  icon: React.ElementType;
  category: string;
}

export const GlobalSmartSearchModal: React.FC<GlobalSmartSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectTab,
  onOpenCallModal,
  onOpenChat,
}) => {
  const [query, setQuery] = useState('');

  const quickQueries: QuickQuery[] = [
    { text: 'Live phone camera & crop vision analysis (Phase 11)', tabId: 'vision', icon: Camera, category: 'Live Vision' },
    { text: 'Field walk scouting tour & plant leaf inspection', tabId: 'vision', icon: Footprints, category: 'Live Vision' },
    { text: 'Thermal IR camera matrix & canopy cooling CTD', tabId: 'vision', icon: Flame, category: 'Live Vision' },
    { text: 'Compare before and after crop observation images', tabId: 'vision', icon: Compass, category: 'Live Vision' },
    { text: 'Farm AI Brain & Autonomous Multi-Agent Command Center', tabId: 'autonomous', icon: Brain, category: 'Farm Brain' },
    { text: 'Daily Morning Farm Briefing & Voice Summary', tabId: 'autonomous', icon: Brain, category: 'Farm Brain' },
    { text: 'Farm Goal Selector (Save Water, Maximize Yield, Cut Costs)', tabId: 'autonomous', icon: Brain, category: 'Farm Brain' },
    { text: 'Agronomic What-If Decision Simulator & Scenario Comparison', tabId: 'autonomous', icon: Brain, category: 'Farm Brain' },
    { text: 'IoT Closed-Loop Execution & Soil Penetration Verification', tabId: 'autonomous', icon: Brain, category: 'Farm Brain' },
    { text: 'Farm Autonomous Action Permissions & Safety Modes', tabId: 'autonomous', icon: Brain, category: 'Farm Brain' },
    { text: 'Farm Decisions Audit Log & Historical Records', tabId: 'autonomous', icon: Brain, category: 'Farm Brain' },
    { text: 'Farm Money & Expense Tracker (Seeds, Fertilizers, Labor, Diesel)', tabId: 'resources', icon: Coins, category: 'Farm Resources' },
    { text: 'Water Budget & Days of Water Reserve Remaining', tabId: 'resources', icon: Droplets, category: 'Farm Resources' },
    { text: 'Harvest Yield Forecast Range (Quintals / Acre)', tabId: 'resources', icon: Sprout, category: 'Farm Resources' },
    { text: 'Pump & Motor Electricity Consumption (kWh & Cost)', tabId: 'resources', icon: Coins, category: 'Farm Resources' },
    { text: '6-Pillar Farm Risk Radar (Water, Weather, Crop, Soil, Market, Ops)', tabId: 'resources', icon: ShieldAlert, category: 'Farm Resources' },
    { text: 'Irrigation Penetration Verification (Pre vs Post Telemetry)', tabId: 'resources', icon: Droplets, category: 'Farm Resources' },
    { text: 'Farm Operations & Crop Lifecycle Journey (Planting to Selling)', tabId: 'operations', icon: Sprout, category: 'Farm Operations' },
    { text: 'Farm Calendar & Scheduled Daily/Weekly Tasks', tabId: 'operations', icon: Calendar, category: 'Farm Operations' },
    { text: 'Harvest Readiness Planning & Logistics Coordination', tabId: 'operations', icon: Calendar, category: 'Farm Operations' },
    { text: 'Post-Harvest Mandi Selling vs Storage Decision Assistant', tabId: 'operations', icon: TrendingUp, category: 'Farm Operations' },
    { text: 'Fertilizer Timing & Weather Conflict Safety Check', tabId: 'operations', icon: Calculator, category: 'Farm Operations' },
    { text: 'What may happen next? Predictive Digital Twin Intelligence', tabId: 'intelligence', icon: Brain, category: 'Farm Intelligence' },
    { text: 'Will my field become dry or need water tomorrow?', tabId: 'intelligence', icon: Brain, category: 'Farm Intelligence' },
    { text: 'Connect ESP32 USB hardware or check IoT sensors', tabId: 'iot', icon: Radio, category: 'IoT Sensors' },
    { text: 'Is my crop at risk from pests, heat, or disease?', tabId: 'risk', icon: ShieldAlert, category: 'Crop Risk AI' },
    { text: 'Should I irrigate today and how much water is needed?', tabId: 'irrigation', icon: Droplets, category: 'Smart Irrigation' },
    { text: 'What crop should I plant next?', tabId: 'recommendation', icon: Sprout, category: 'Crop Match AI' },
    { text: 'Why are my plant leaves yellow or spotted?', tabId: 'diagnostics', icon: ShieldCheck, category: 'Plant Scan' },
    { text: 'Will it rain on my farm today?', tabId: 'weather', icon: CloudRain, category: 'Weather Hazards' },
    { text: 'How many bags of fertilizer do I need?', tabId: 'fertilizer', icon: Calculator, category: 'Fertilizer Calculator' },
    { text: 'What is today Mandi market price for Rice?', tabId: 'market', icon: TrendingUp, category: 'Market ROI' },
    { text: 'When is my crop ready for harvest?', tabId: 'harvest', icon: Calendar, category: 'Harvest Tracker' },
    { text: 'Speak with CroperX Voice AI Agronomist', action: 'call', icon: PhoneCall, category: 'Voice Assistant' },
    { text: 'Ask CroperX AI any custom farming question', action: 'chat', icon: Bot, category: 'AI Chatbot' },
  ];

  const filteredQueries = quickQueries.filter((q) =>
    q.text.toLowerCase().includes(query.toLowerCase()) ||
    q.category.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelectQuery = (item: QuickQuery) => {
    onClose();
    if (item.action === 'call') {
      onOpenCallModal();
    } else if (item.action === 'chat') {
      onOpenChat();
    } else if (item.tabId) {
      onSelectTab(item.tabId);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-[#c8e6c9] overflow-hidden z-10"
        >
          {/* Search Input Header */}
          <div className="p-4 border-b border-gray-100 flex items-center gap-3">
            <Search className="w-5 h-5 text-[#2e7d32] shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask CroperX: e.g. 'What should I plant?', 'Will it rain?'"
              className="w-full bg-transparent text-sm sm:text-base font-sans font-medium text-[#1b2e1b] focus:outline-none placeholder-gray-400"
              autoFocus
            />
            {query && (
              <button onClick={() => setQuery('')} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="px-2.5 py-1 text-xs font-bold text-gray-500 hover:text-gray-800 bg-gray-100 rounded-lg"
            >
              ESC
            </button>
          </div>

          {/* Quick Suggestions List */}
          <div className="p-4 max-h-[60vh] overflow-y-auto space-y-2 custom-scrollbar">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase text-gray-500 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Smart Queries & Module Shortcuts</span>
            </div>

            {filteredQueries.length === 0 ? (
              <div className="text-center py-8 space-y-3">
                <p className="text-sm text-gray-600">No direct shortcut found for "{query}".</p>
                <button
                  onClick={() => {
                    onClose();
                    onOpenChat();
                  }}
                  className="px-4 py-2 bg-[#2e7d32] text-white rounded-2xl text-xs font-bold inline-flex items-center gap-2"
                >
                  <Bot className="w-4 h-4" />
                  <span>Ask CroperX AI Assistant</span>
                </button>
              </div>
            ) : (
              filteredQueries.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectQuery(item)}
                    className="w-full p-3 rounded-2xl bg-[#f8fcf8] hover:bg-[#e8f5e9] border border-gray-100 hover:border-[#a5d6a7] transition-all flex items-center justify-between text-left group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white text-[#2e7d32] rounded-xl shadow-2xs group-hover:scale-110 transition-transform">
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-xs sm:text-sm font-bold text-[#1b2e1b] font-sans block">
                          {item.text}
                        </span>
                        <span className="text-[10px] font-mono font-semibold text-[#2e7d32]">
                          {item.category}
                        </span>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#2e7d32] group-hover:translate-x-1 transition-all" />
                  </button>
                );
              })
            )}
          </div>

          {/* Footer note */}
          <div className="p-3 bg-gray-50 border-t border-gray-100 text-center text-[11px] text-gray-500 font-mono">
            <span>Powered by CroperX Natural Language Agriculture Parser</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
