import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Truck, 
  Warehouse, 
  DollarSign, 
  IndianRupee, 
  Plus, 
  CheckCircle2, 
  Tag, 
  Scale, 
  TrendingUp, 
  ArrowRight,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { PostHarvestRecord } from '../../types/operations/farmOperationsTypes';
import { harvestIntelligenceService } from '../../services/operations/harvestIntelligenceService';

interface PostHarvestPlannerProps {
  cropName: string;
  isExpertMode?: boolean;
  onSelectTab: (tabId: string) => void;
}

export const PostHarvestPlanner: React.FC<PostHarvestPlannerProps> = ({
  cropName,
  isExpertMode = false,
  onSelectTab
}) => {
  const [records, setRecords] = useState<PostHarvestRecord[]>(() => harvestIntelligenceService.getPostHarvestRecords());
  const [isAdding, setIsAdding] = useState(false);

  // Form state
  const [harvestDate, setHarvestDate] = useState(new Date().toISOString().split('T')[0]);
  const [actualYieldKg, setActualYieldKg] = useState('3200');
  const [qualityGrade, setQualityGrade] = useState<'Grade A (Premium)' | 'Grade B (Standard)' | 'Grade C (Fair)'>('Grade A (Premium)');
  const [moistureContent, setMoistureContent] = useState('12.5');
  const [decision, setDecision] = useState<'sell_immediately' | 'store_short_term' | 'store_long_term'>('sell_immediately');
  const [mandiName, setMandiName] = useState('APMC Regional Wholesale Market');
  const [salePriceKg, setSalePriceKg] = useState('32');

  const handleAddBatch = (e: React.FormEvent) => {
    e.preventDefault();
    const yieldNum = parseFloat(actualYieldKg) || 1000;
    const priceNum = parseFloat(salePriceKg) || 25;
    const transportCost = yieldNum * 0.75;
    const gross = yieldNum * priceNum;
    const net = gross - transportCost;

    const created = harvestIntelligenceService.addPostHarvestRecord({
      cropName,
      harvestDate,
      actualYieldKg: yieldNum,
      qualityGrade,
      moistureContentPercent: parseFloat(moistureContent) || undefined,
      decision,
      selectedMandiOrBuyer: mandiName,
      estimatedSalePricePerKg: priceNum,
      estimatedNetProfitInr: Math.round(net),
      isSold: decision === 'sell_immediately'
    });

    setRecords([created, ...records]);
    setIsAdding(false);
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 border border-[#c8e6c9] shadow-sm space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-700 shrink-0 border border-teal-200">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase bg-teal-100 text-teal-900 border border-teal-200">
                After Harvest
              </span>
              <span className="text-xs text-gray-500 font-medium">
                {records.length} {records.length === 1 ? 'Batch' : 'Batches'} Logged
              </span>
            </div>
            <h2 className="font-serif font-bold text-xl sm:text-2xl text-[#1b2e1b] mt-0.5">
              Post-Harvest Quality & Dispatch Log
            </h2>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsAdding(!isAdding)}
          className="px-3.5 py-2 rounded-xl bg-teal-700 text-white hover:bg-teal-800 text-xs font-bold transition-colors min-h-[40px] flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Record Harvest Batch</span>
        </button>
      </div>

      {/* Post-Harvest 5-Step Workflow Graphic */}
      <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
        <span className="text-[10px] font-mono font-bold uppercase text-gray-500 block">
          Standardized Post-Harvest Flow
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
          <div className="p-2.5 rounded-xl bg-white border border-gray-200 font-semibold text-gray-800">
            1. Field Picked 🚜
          </div>
          <div className="p-2.5 rounded-xl bg-white border border-gray-200 font-semibold text-gray-800">
            2. Grade & Sort ⚖️
          </div>
          <div className="p-2.5 rounded-xl bg-white border border-gray-200 font-semibold text-gray-800">
            3. Moisture Check 💧
          </div>
          <div className="p-2.5 rounded-xl bg-white border border-gray-200 font-semibold text-gray-800">
            4. Pack & Crate 📦
          </div>
          <div className="p-2.5 rounded-xl bg-teal-50 border border-teal-300 font-bold text-teal-900 col-span-2 sm:col-span-1">
            5. Mandi Dispatch 🚚
          </div>
        </div>
      </div>

      {/* Add Batch Form */}
      <AnimatePresence>
        {isAdding && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleAddBatch}
            className="p-5 rounded-2xl bg-teal-50/40 border border-teal-200 space-y-4 text-xs"
          >
            <div className="flex items-center justify-between">
              <span className="font-serif font-bold text-sm text-teal-950">Record New Harvest Batch</span>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="text-gray-500 hover:text-gray-800"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Harvest Date</label>
                <input
                  type="date"
                  required
                  value={harvestDate}
                  onChange={(e) => setHarvestDate(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 bg-white font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Actual Net Yield (Kg)</label>
                <input
                  type="number"
                  required
                  value={actualYieldKg}
                  onChange={(e) => setActualYieldKg(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 bg-white font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Quality Grade</label>
                <select
                  value={qualityGrade}
                  onChange={(e) => setQualityGrade(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 bg-white font-medium"
                >
                  <option value="Grade A (Premium)">Grade A (Premium - Export/Top Mandi)</option>
                  <option value="Grade B (Standard)">Grade B (Standard Wholesale)</option>
                  <option value="Grade C (Fair)">Grade C (Processing / Local)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Grain/Fruit Moisture (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={moistureContent}
                  onChange={(e) => setMoistureContent(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 bg-white font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Logistics Decision</label>
                <select
                  value={decision}
                  onChange={(e) => setDecision(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 bg-white font-medium"
                >
                  <option value="sell_immediately">Sell Immediately (Mandi Spot)</option>
                  <option value="store_short_term">Temporary Hold in Shed (3-5 days)</option>
                  <option value="store_long_term">Cold Storage / Warehouse</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Expected Price (₹/Kg)</label>
                <input
                  type="number"
                  step="0.5"
                  value={salePriceKg}
                  onChange={(e) => setSalePriceKg(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 bg-white font-mono font-bold"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block font-semibold text-gray-700 mb-1">Destination Mandi / Trader Name</label>
                <input
                  type="text"
                  value={mandiName}
                  onChange={(e) => setMandiName(e.target.value)}
                  placeholder="e.g. APMC Regional Wholesale Yard"
                  className="w-full p-2.5 rounded-xl border border-gray-300 bg-white font-medium"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-teal-700 text-white font-bold hover:bg-teal-800 shadow-sm"
              >
                Save Batch Log
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Recorded Batches List */}
      <div className="space-y-3">
        <span className="font-bold text-xs uppercase tracking-wider text-gray-500">
          Completed Harvest Records
        </span>

        <div className="space-y-2.5">
          {records.map((rec) => (
            <div
              key={rec.harvestId}
              className="p-4 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-between flex-wrap gap-3 text-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold shrink-0">
                  📦
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-gray-900 text-sm">{rec.cropName} Harvest</span>
                    <span className="font-mono font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                      {rec.actualYieldKg} kg
                    </span>
                    <span className="text-[10px] font-semibold bg-gray-200 text-gray-700 px-2 py-0.5 rounded-md">
                      {rec.qualityGrade}
                    </span>
                  </div>
                  <p className="text-gray-500 mt-1">
                    {rec.selectedMandiOrBuyer || 'Spot Market'} • Rate: <strong>₹{rec.estimatedSalePricePerKg}/kg</strong> • Net Return: <strong className="text-emerald-700 font-mono">₹{rec.estimatedNetProfitInr.toLocaleString()}</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onSelectTab('market')}
                  className="px-3 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 font-bold text-gray-700 flex items-center gap-1"
                >
                  <span>Compare Prices</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
