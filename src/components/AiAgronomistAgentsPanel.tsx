import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bot, 
  FlaskConical, 
  CloudSun, 
  Dna, 
  TrendingUp, 
  Zap, 
  CheckCircle2, 
  Sparkles,
  Layers,
  ShieldCheck,
  RefreshCw,
  Search,
  ChevronRight,
  Filter
} from 'lucide-react';
import { SoilData, CropRecommendation } from '../types';
import { SPECIALIST_AGENT_REGISTRY } from '../services/intelligence/specialistAgentRegistry';
import { SpecialistAgentMetadata } from '../types/intelligenceTypes';

interface AiAgronomistAgentsPanelProps {
  soilData: SoilData;
  recommendations?: CropRecommendation[];
  onOpenCropMission?: () => void;
}

export const AiAgronomistAgentsPanel: React.FC<AiAgronomistAgentsPanelProps> = ({
  soilData,
  recommendations = [],
  onOpenCropMission
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [selectedAgent, setSelectedAgent] = useState<SpecialistAgentMetadata | null>(null);

  const topCrop = recommendations[0]?.crop || 'Rice';
  const n = soilData?.nitrogen ?? 120;
  const p = soilData?.phosphorus ?? 60;
  const k = soilData?.potassium ?? 60;
  const ph = soilData?.ph ?? 6.5;
  const temp = soilData?.temperature ?? 28;
  const hum = soilData?.humidity ?? 65;
  const moisture = soilData?.soil_moisture ?? 54;

  const categories = [
    { id: 'all', label: 'All 50+ Agents' },
    { id: 'crop', label: '🌾 Crop & Physiology' },
    { id: 'soil', label: '🧪 Soil & Chemistry' },
    { id: 'water', label: '💧 Water & Irrigation' },
    { id: 'weather', label: '🌦️ Weather & Climate' },
    { id: 'vision', label: '📷 Vision & Pathology' },
    { id: 'economics', label: '📈 Economics & Mandi' },
    { id: 'operations', label: '⚙️ Farm Operations' },
    { id: 'intelligence', label: '🧠 Consensus Supervisor' },
  ];

  // Filter agents by search and category
  const filteredAgents = SPECIALIST_AGENT_REGISTRY.filter((agent) => {
    const matchesCategory = selectedCategory === 'all' || agent.category === selectedCategory;
    const matchesSearch =
      agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (agent.role ? agent.role.toLowerCase().includes(searchQuery.toLowerCase()) : false);
    return matchesCategory && matchesSearch;
  });

  const handleRefreshAgents = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
    }, 1000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-gradient-to-br from-[#122012] via-[#0d170d] to-[#122012] rounded-[2.5rem] p-6 sm:p-8 text-white border-2 border-[#4CAF50]/40 shadow-2xl space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-slate-950 flex items-center justify-center font-bold shadow-lg">
            <Bot className="w-7 h-7 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                CroperX 50+ Autonomous Specialist Agents Network
              </h4>
              <span className="text-[10px] font-mono font-bold bg-[#4CAF50]/20 text-[#a5d6a7] border border-[#4CAF50]/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                50 Active Agents Parallel
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Supervised multi-agent architecture executing real-time ICAR & FAO-56 calculations over 500+ botanical crop records.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap self-start md:self-auto">
          {onOpenCropMission && (
            <button
              onClick={onOpenCropMission}
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg flex items-center gap-1.5 transition-all transform hover:scale-[1.02]"
            >
              <Zap className="w-4 h-4 text-slate-950 fill-slate-950" />
              <span>Multi-Model AI Prediction</span>
            </button>
          )}

          <button
            onClick={handleRefreshAgents}
            disabled={isProcessing}
            className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 transition-all flex items-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isProcessing ? 'animate-spin' : ''}`} />
            <span>{isProcessing ? 'Refreshing...' : 'Re-run Network'}</span>
          </button>
        </div>
      </div>

      {/* Category Pills and Search Filter */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide text-xs">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`py-1.5 px-3 rounded-xl font-bold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search 50+ specialist agents..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Agent Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 max-h-[480px] overflow-y-auto pr-1">
        {filteredAgents.map((agent, i) => {
          const isTopAgent = i < 4;
          return (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.3) }}
              onClick={() => setSelectedAgent(agent)}
              className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-emerald-500/50 hover:bg-white/10 transition-all space-y-2.5 cursor-pointer relative group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                    {agent.category}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    [{agent.preferredModel}]
                  </span>
                </div>

                <h5 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors line-clamp-1">
                  {agent.name}
                </h5>

                <p className="text-xs text-slate-300 line-clamp-2 mt-1 leading-relaxed">
                  {agent.description}
                </p>
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-400">
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Ready
                </span>
                <span className="group-hover:text-emerald-400 transition-colors flex items-center gap-0.5">
                  Inspect <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Selected Agent Modal Detail */}
      <AnimatePresence>
        {selectedAgent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 max-w-lg w-full text-white shadow-2xl space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-400 px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20">
                    {selectedAgent.category} Agent
                  </span>
                  <h3 className="text-lg font-bold text-white mt-1">{selectedAgent.name}</h3>
                  <p className="text-xs text-slate-400">{selectedAgent.role || `${selectedAgent.category.toUpperCase()} Specialist`}</p>
                </div>
                <button
                  onClick={() => setSelectedAgent(null)}
                  className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm"
                >
                  ✕
                </button>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs text-slate-300">
                <p className="text-white font-medium">{selectedAgent.description}</p>
                <div className="pt-2 border-t border-slate-800 grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-500 block">Preferred Model:</span>
                    <span className="font-mono text-emerald-400">{selectedAgent.preferredModel}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Agronomic Standard:</span>
                    <span className="text-slate-200">FAO-56 & ICAR 2026</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setSelectedAgent(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
