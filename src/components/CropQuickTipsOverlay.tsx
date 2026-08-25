import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CropRecommendation, FarmerProfile } from '../types';
import { Sparkles, Zap, AlertTriangle, Droplets, Info, ShieldAlert, CheckCircle2, X, Leaf, Sun } from 'lucide-react';

interface CropQuickTipsOverlayProps {
  crop?: CropRecommendation | null;
  cropName?: string;
  farmerProfile?: FarmerProfile;
  soilTypeZone?: string;
  onClose?: () => void;
}

// Database of specific crop nitrogen requirements & seasonal pitfalls
const CROP_QUICK_TIPS_DATABASE: Record<string, {
  nitrogenReq: string;
  nitrogenDosing: string[];
  pitfalls: string[];
  idealNpks: string;
  waterAdvice: string;
  locationNote: string;
}> = {
  rice: {
    nitrogenReq: "120 - 150 kg N/ha (High Demand)",
    nitrogenDosing: [
      "Basal application: 25% at transplanting / sowing",
      "Active tillering (20-25 DAT): 50% Urea top-dressing",
      "Panicle initiation (45 DAT): 25% final split for grain weight"
    ],
    pitfalls: [
      "Late monsoon waterlogging causing stem rot & sheath blight",
      "Excessive Nitrogen leading to crop lodging and neck blast fungus",
      "Zinc deficiency ('Khaira' disease) in anaerobic flooded soils"
    ],
    idealNpks: "N:P:K = 4:2:1 (120:60:30 kg/ha)",
    waterAdvice: "Maintain 3-5 cm standing water during tillering; drain 10 days before harvest.",
    locationNote: "Optimal for alluvial plains and clay-loam zones with canal/borewell irrigation."
  },
  wheat: {
    nitrogenReq: "100 - 120 kg N/ha (Medium-High Demand)",
    nitrogenDosing: [
      "Basal application: 50% at sowing along with full Phosphorus & Potassium",
      "First irrigation (Crown Root Initiation, 21 DAS): 25% Urea top-dressing",
      "Second irrigation (Flag leaf / Jointing stage): 25% remaining Urea"
    ],
    pitfalls: [
      "Terminal heat stress during grain filling in late-sown conditions",
      "Yellow rust fungal attack under cool, foggy winter conditions",
      "Irrigation waterlogging at seed emergence causing root hypoxia"
    ],
    idealNpks: "N:P:K = 4:2:1 (120:60:40 kg/ha)",
    waterAdvice: "4 to 6 light irrigations at critical stages (CRI, Tillering, Flowering, Milk stage).",
    locationNote: "Thrives in deep well-drained alluvial and loamy soils with cool winter nights."
  },
  maize: {
    nitrogenReq: "120 - 180 kg N/ha (Heavy Feeder)",
    nitrogenDosing: [
      "Basal: 25% at sowing with DAP and MOP",
      "Knee-high stage (30 DAS): 50% Urea side-dressing",
      "Tasseling stage (50 DAS): 25% top-dressing before silking"
    ],
    pitfalls: [
      "Fall Armyworm (Spodoptera frugiperda) infestation in whorls",
      "Waterlogging sensitivity during seedling stage causing stunt",
      "Nitrogen leaching loss in heavy rain sandier soils"
    ],
    idealNpks: "N:P:K = 3:2:2 (150:75:75 kg/ha)",
    waterAdvice: "Requires uniform moisture; sensitive to drought at tasseling and silking.",
    locationNote: "Best suited for fertile red loams and alluvial soils with high organic matter."
  },
  cotton: {
    nitrogenReq: "120 - 160 kg N/ha (Deep Rooted)",
    nitrogenDosing: [
      "Basal: 20% at field preparation",
      "Square initiation (45 DAS): 40% split application",
      "Peak bolling (75 DAS): 40% final split for lint development"
    ],
    pitfalls: [
      "Pink bollworm and whitefly infestation in warm humid climate",
      "Excess Nitrogen encouraging rank vegetative growth instead of bolls",
      "Parawilt disease triggered by sudden heavy rain after dry spell"
    ],
    idealNpks: "N:P:K = 3:1.5:1.5 (120:60:60 kg/ha)",
    waterAdvice: "Drip irrigation at 4-7 day intervals; avoid flooding during boll opening.",
    locationNote: "Ideal for deep black cotton soils (vertisols) with good water holding capacity."
  },
  chickpea: {
    nitrogenReq: "20 - 30 kg N/ha (Low - Biological Fixation)",
    nitrogenDosing: [
      "Basal: 100% at sowing (Rhizobium inoculated seed treatment recommended)",
      "No top-dressing needed; excess N inhibits root nodulation!"
    ],
    pitfalls: [
      "Helicoverpa pod borer damage during pod formation",
      "Wilt rot caused by Fusarium fungi in excessively moist soil",
      "Frost damage during peak flowering period"
    ],
    idealNpks: "N:P:K = 1:2:1 (20:40:20 kg/ha + Sulfur)",
    waterAdvice: "Requires minimal water; 1-2 irrigations max (at branch initiation & pod fill).",
    locationNote: "Thrives in residual moisture black & sandy-loam soils."
  },
  sugarcane: {
    nitrogenReq: "250 - 300 kg N/ha (Very Heavy Feeder)",
    nitrogenDosing: [
      "10% at planting, 20% at 45 days, 30% at 90 days, 40% at earthing up (120 days)"
    ],
    pitfalls: [
      "Early shoot borer and red rot fungal epidemics",
      "Potassium deficiency reducing sucrose recovery percentage",
      "Severe drought stress during elongation phase"
    ],
    idealNpks: "N:P:K = 2.5:1:1 (250:100:100 kg/ha)",
    waterAdvice: "High water demand; frequent light drip irrigations every 3-5 days.",
    locationNote: "Requires deep fertile alluvial loams with high solar radiation."
  }
};

export const CropQuickTipsOverlay: React.FC<CropQuickTipsOverlayProps> = ({
  crop,
  cropName,
  farmerProfile,
  soilTypeZone,
  onClose
}) => {
  const activeCropName = crop?.crop || cropName || 'Rice';
  const key = activeCropName.toLowerCase();
  const tipData = CROP_QUICK_TIPS_DATABASE[key] || {
    nitrogenReq: "90 - 120 kg N/ha (Standard Demand)",
    nitrogenDosing: [
      "Basal application: 50% at sowing/planting",
      "Top-dressing: 50% at active vegetative growth stage"
    ],
    pitfalls: [
      "Insect pest infestations during warm, humid spells",
      "Fungal foliar blights under wet leaves & poor air circulation",
      "Nutrient lockup if soil pH deviates from 6.0 - 7.2"
    ],
    idealNpks: "N:P:K = 3:2:1 balanced formula",
    waterAdvice: "Maintain consistent root zone moisture without waterlogging.",
    locationNote: `Calibrated for ${soilTypeZone || farmerProfile?.soilTypeZone || 'Alluvial soil'} conditions.`
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="mt-6 bg-gradient-to-br from-[#1b2e1b] via-[#244224] to-[#1b2e1b] text-white rounded-3xl p-6 md:p-8 border-2 border-[#4CAF50]/60 shadow-2xl relative overflow-hidden"
      >
        {/* Glow ambient background element */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#4CAF50]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-[#4CAF50] rounded-2xl flex items-center justify-center text-white shadow-lg">
                <Sparkles className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#a5d6a7] bg-black/40 px-2.5 py-0.5 rounded-full border border-white/10">
                    Agronomist Quick Tips
                  </span>
                  <span className="text-[10px] font-bold text-amber-300">
                    Target Crop: {activeCropName}
                  </span>
                </div>
                <h4 className="font-serif text-2xl font-bold text-white mt-1">
                  {activeCropName} Precision Care & Seasonal Pitfalls
                </h4>
              </div>
            </div>

            {onClose && (
              <button
                onClick={onClose}
                className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Nitrogen & Pitfalls Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Nitrogen Requirements & Dosing */}
            <div className="bg-black/30 p-5 rounded-2xl border border-[#4CAF50]/30 space-y-3">
              <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
                <Leaf className="w-4 h-4 text-[#4CAF50]" />
                <span>Nitrogen Dosage & Application Splits</span>
              </div>

              <div className="p-3 bg-[#4CAF50]/20 rounded-xl border border-[#4CAF50]/40 text-xs text-emerald-200">
                <strong className="text-white block font-mono text-sm">{tipData.nitrogenReq}</strong>
                <span className="text-[11px] opacity-90">Target Balance: {tipData.idealNpks}</span>
              </div>

              <div className="space-y-2 pt-1">
                <span className="text-[10px] uppercase font-black text-emerald-400 tracking-wider">Application Timeline:</span>
                <ul className="space-y-1.5 text-xs text-gray-200">
                  {tipData.nitrogenDosing.map((dose, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-[#4CAF50]/30 text-[#a5d6a7] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{dose}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Seasonal Pitfalls & Hazards */}
            <div className="bg-black/30 p-5 rounded-2xl border border-amber-500/30 space-y-3">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <span>Seasonal Pitfalls & Vulnerabilities</span>
              </div>

              <div className="space-y-2">
                {tipData.pitfalls.map((pitfall, idx) => (
                  <div key={idx} className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-100 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <span>{pitfall}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-white/10 text-xs text-emerald-200/90 flex items-center gap-2">
                <Droplets className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>{tipData.waterAdvice}</span>
              </div>
            </div>

          </div>

          {/* Location & Soil Zone Context Note */}
          <div className="p-3 bg-black/40 rounded-xl border border-white/10 text-xs text-emerald-300/90 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-400" />
              <span><strong>Regional Soil Context:</strong> {tipData.locationNote}</span>
            </div>
            <span className="text-[10px] text-gray-400 font-mono hidden sm:inline">GPS Calibrated</span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
