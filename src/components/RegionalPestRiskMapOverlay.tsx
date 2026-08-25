import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bug, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  MapPin, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Info,
  Compass,
  Layers,
  Filter,
  X
} from 'lucide-react';

interface PestZone {
  id: string;
  name: string;
  district: string;
  lat: number;
  lng: number;
  x: number; // SVG %
  y: number; // SVG %
  pestName: string;
  severity: 'critical' | 'warning' | 'low';
  density: string;
  affectedCrops: string[];
  treatment: string;
  spreadRate: string;
  icon: string;
}

export const RegionalPestRiskMapOverlay: React.FC = () => {
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [selectedZone, setSelectedZone] = useState<PestZone | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'critical' | 'warning'>('all');

  const pestZones: PestZone[] = [
    {
      id: 'pest-1',
      name: 'North Delta Quadrant',
      district: 'Zone 4 - Silty Plain',
      lat: 28.6139,
      lng: 77.2090,
      x: 35,
      y: 28,
      pestName: 'Fall Armyworm (Spodoptera frugiperda)',
      severity: 'critical',
      density: '14.2 larvae / m²',
      affectedCrops: ['Maize', 'Rice', 'Sugarcane'],
      treatment: 'Apply Neem oil spray (10,000 ppm) or Chlorantraniliprole 18.5% SC within 48h.',
      spreadRate: '+18% daily expansion',
      icon: '🐛'
    },
    {
      id: 'pest-2',
      name: 'East Valley Riverbank',
      district: 'Zone 2 - Clay Lowlands',
      lat: 28.5355,
      lng: 77.3910,
      x: 72,
      y: 42,
      pestName: 'Brown Planthopper (Nilaparvata lugens)',
      severity: 'critical',
      density: '28 insects / hill',
      affectedCrops: ['Rice', 'Jute'],
      treatment: 'Drain standing water for 3 days; apply Buprofezin 25% SC at early nymph stage.',
      spreadRate: '+25% daily expansion',
      icon: '🦗'
    },
    {
      id: 'pest-3',
      name: 'South Agro Canopy',
      district: 'Zone 7 - Sandy Loam',
      lat: 28.4595,
      lng: 77.0266,
      x: 52,
      y: 75,
      pestName: 'Green Peach Aphids (Myzus persicae)',
      severity: 'warning',
      density: '6.5 colonies / plant',
      affectedCrops: ['Cotton', 'Wheat', 'Vegetables'],
      treatment: 'Introduce ladybird beetles (Coccinellidae) or spray Imidacloprid 17.8% SL.',
      spreadRate: '+8% daily expansion',
      icon: '🦟'
    },
    {
      id: 'pest-4',
      name: 'West Plateau Foothills',
      district: 'Zone 1 - High Altitude',
      lat: 28.7041,
      lng: 76.9214,
      x: 20,
      y: 60,
      pestName: 'Stem Borer (Chilo suppressalis)',
      severity: 'warning',
      density: '4.1 egg masses / m²',
      affectedCrops: ['Rice', 'Maize', 'Wheat'],
      treatment: 'Install Pheromone traps (10 traps / ha) and release Trichogramma egg parasitoids.',
      spreadRate: '+5% daily expansion',
      icon: '🪲'
    },
    {
      id: 'pest-5',
      name: 'Central Basin Station',
      district: 'Zone 3 - Alluvial Loam',
      lat: 28.5800,
      lng: 77.1500,
      x: 48,
      y: 48,
      pestName: 'Yellow Rust Fungus (Puccinia striiformis)',
      severity: 'low',
      density: 'Trace pustules detected',
      affectedCrops: ['Wheat', 'Barley'],
      treatment: 'Prophylactic spray of Propiconazole 25% EC if humidity stays above 85%.',
      spreadRate: 'Stable / Monitored',
      icon: '🍄'
    }
  ];

  const filteredZones = pestZones.filter(z => {
    if (filterSeverity === 'all') return true;
    return z.severity === filterSeverity;
  });

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.4, 2.5));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.4, 0.8));
  const handleResetZoom = () => {
    setZoomLevel(1);
    setSelectedZone(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white rounded-[2.5rem] p-8 border-2 border-[#c8e6c9] shadow-lg space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#c8e6c9]/60 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#1b2e1b] text-[#4CAF50] flex items-center justify-center shadow-md">
            <Bug className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-serif text-xl font-bold text-[#1b2e1b] flex items-center gap-2">
              <span>Regional Pest Risk Zone GIS Overlay Map</span>
              <span className="text-[10px] font-mono font-bold bg-red-100 text-red-800 border border-red-300 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                Live Outbreak Stream
              </span>
            </h4>
            <p className="text-xs text-[#667e66]">
              Interactive geolocation map plotting satellite and field scout reported pest outbreak hotspots.
            </p>
          </div>
        </div>

        {/* Map View Controls */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-[#f8fcf8] p-1.5 rounded-2xl border border-[#c8e6c9]">
            <button
              onClick={() => setFilterSeverity('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterSeverity === 'all' ? 'bg-[#4CAF50] text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All Zones ({pestZones.length})
            </button>
            <button
              onClick={() => setFilterSeverity('critical')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterSeverity === 'critical' ? 'bg-red-600 text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Critical High
            </button>
            <button
              onClick={() => setFilterSeverity('warning')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterSeverity === 'warning' ? 'bg-amber-600 text-white' : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Warning
            </button>
          </div>

          <div className="flex items-center gap-1 bg-[#1b2e1b] text-white p-1.5 rounded-2xl shadow-sm">
            <button onClick={handleZoomIn} className="p-1.5 hover:bg-white/20 rounded-xl" title="Zoom In">
              <ZoomIn className="w-4 h-4 text-[#4CAF50]" />
            </button>
            <button onClick={handleZoomOut} className="p-1.5 hover:bg-white/20 rounded-xl" title="Zoom Out">
              <ZoomOut className="w-4 h-4 text-[#4CAF50]" />
            </button>
            <button onClick={handleResetZoom} className="p-1.5 hover:bg-white/20 rounded-xl" title="Reset Map">
              <RotateCcw className="w-4 h-4 text-[#81c784]" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Map Container */}
      <div className="relative w-full h-[380px] bg-[#162716] rounded-3xl overflow-hidden border-2 border-[#2e7d32] shadow-inner flex items-center justify-center">
        {/* SVG Topographic Field Background */}
        <div 
          className="w-full h-full relative transition-transform duration-300 ease-out cursor-grab active:cursor-grabbing"
          style={{ transform: `scale(${zoomLevel})` }}
        >
          <svg className="w-full h-full opacity-40 pointer-events-none" viewBox="0 0 800 400" preserveAspectRatio="none">
            <defs>
              <pattern id="gridPattern" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#2e7d32" strokeWidth="0.5" strokeDasharray="2 2" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#gridPattern)" />
            {/* Topo lines */}
            <path d="M 100 80 Q 250 200 400 120 T 700 250" fill="none" stroke="#81c784" strokeWidth="1" opacity="0.3" />
            <path d="M 50 250 Q 300 100 550 320 T 780 180" fill="none" stroke="#81c784" strokeWidth="1" opacity="0.3" />
          </svg>

          {/* Interactive Pest Outbreak Markers */}
          {filteredZones.map((zone) => (
            <div
              key={zone.id}
              onClick={() => setSelectedZone(zone)}
              style={{ left: `${zone.x}%`, top: `${zone.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
            >
              {/* Pulse Ring */}
              <div className={`absolute -inset-4 rounded-full opacity-75 animate-ping ${
                zone.severity === 'critical' ? 'bg-red-500' : zone.severity === 'warning' ? 'bg-amber-500' : 'bg-emerald-500'
              }`} />

              {/* Marker Pin */}
              <div className={`relative w-9 h-9 rounded-full flex items-center justify-center text-lg font-bold shadow-2xl border-2 transition-transform group-hover:scale-125 ${
                zone.severity === 'critical'
                  ? 'bg-red-600 text-white border-red-300 ring-4 ring-red-500/30'
                  : zone.severity === 'warning'
                  ? 'bg-amber-500 text-white border-amber-200 ring-4 ring-amber-500/30'
                  : 'bg-emerald-600 text-white border-emerald-200'
              }`}>
                {zone.icon}
              </div>

              {/* Hover Badge */}
              <div className="absolute top-10 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#1b2e1b] text-white text-[10px] font-bold px-2.5 py-1 rounded-lg border border-[#4CAF50] whitespace-nowrap shadow-xl pointer-events-none z-30">
                {zone.name} • {zone.pestName.split(' ')[0]}
              </div>
            </div>
          ))}
        </div>

        {/* Floating Map Legend Overlay */}
        <div className="absolute bottom-4 left-4 bg-[#1b2e1b]/90 backdrop-blur-md text-white p-3 rounded-2xl border border-[#4CAF50]/40 text-xs space-y-1.5 z-10 shadow-lg">
          <div className="text-[10px] uppercase font-bold text-[#81c784] flex items-center gap-1">
            <Compass className="w-3.5 h-3.5" /> Outbreak Severity Index
          </div>
          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" /> Critical High
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Warning
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Monitored
            </span>
          </div>
        </div>
      </div>

      {/* Outbreak Detail Inspection Panel */}
      <AnimatePresence>
        {selectedZone && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-6 bg-[#1b2e1b] text-white rounded-3xl border-2 border-[#4CAF50] shadow-xl space-y-4 relative overflow-hidden"
          >
            <button
              onClick={() => setSelectedZone(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-4">
              <div className="text-4xl p-3 bg-white/10 rounded-2xl border border-white/20 shrink-0">
                {selectedZone.icon}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    selectedZone.severity === 'critical'
                      ? 'bg-red-500 text-white'
                      : 'bg-amber-500 text-black'
                  }`}>
                    {selectedZone.severity} Outbreak
                  </span>
                  <span className="text-xs font-mono text-[#a5d6a7]">GPS: {selectedZone.lat}, {selectedZone.lng}</span>
                </div>
                <h5 className="font-serif text-lg font-bold text-white">{selectedZone.pestName}</h5>
                <p className="text-xs text-[#a5d6a7]">{selectedZone.name} ({selectedZone.district})</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-black/30 p-4 rounded-2xl border border-white/10 text-xs">
              <div>
                <span className="text-[10px] uppercase text-gray-400 font-bold block">Pest Population Density</span>
                <span className="font-mono font-bold text-amber-300 text-sm">{selectedZone.density}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-gray-400 font-bold block">Primary Host Crops</span>
                <span className="font-bold text-white text-xs">{selectedZone.affectedCrops.join(', ')}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase text-gray-400 font-bold block">Spread Velocity</span>
                <span className="font-mono font-bold text-red-300 text-xs">{selectedZone.spreadRate}</span>
              </div>
            </div>

            <div className="p-4 bg-[#2e7d32]/40 rounded-2xl border border-[#4CAF50]/50 text-xs space-y-1">
              <div className="font-bold text-[#81c784] flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-[#4CAF50]" /> Recommended Agronomic Biosecurity Protocol
              </div>
              <p className="text-gray-100 text-[11px] leading-relaxed">{selectedZone.treatment}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
