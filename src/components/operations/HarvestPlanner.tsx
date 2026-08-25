import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Tractor, 
  Users, 
  Truck, 
  Warehouse, 
  Calendar, 
  IndianRupee, 
  Check, 
  Edit3, 
  AlertCircle,
  Save,
  Clock,
  Sparkles
} from 'lucide-react';
import { HarvestPlan } from '../../types/operations/farmOperationsTypes';
import { harvestIntelligenceService } from '../../services/operations/harvestIntelligenceService';

interface HarvestPlannerProps {
  cropName: string;
  isExpertMode?: boolean;
  onClose?: () => void;
}

export const HarvestPlanner: React.FC<HarvestPlannerProps> = ({
  cropName,
  isExpertMode = false,
  onClose
}) => {
  const [plan, setPlan] = useState<HarvestPlan>(() => harvestIntelligenceService.getSavedHarvestPlan(cropName));
  const [isSavedAlert, setIsSavedAlert] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    harvestIntelligenceService.saveHarvestPlan(plan);
    setIsSavedAlert(true);
    setTimeout(() => setIsSavedAlert(false), 3000);
  };

  // Logistics calculations
  const laborDeficit = Math.max(0, plan.laborersNeeded - plan.laborersSecured);
  const estimatedDaysToHarvest = Math.ceil(plan.expectedYieldKg / (plan.laborersSecured > 0 ? plan.laborersSecured * 500 : 1000));
  const transportCapacityDeficit = plan.transportCapacityKg ? Math.max(0, plan.expectedYieldKg - plan.transportCapacityKg) : 0;

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-7 border border-orange-200 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-700 shrink-0 border border-orange-200">
            <Tractor className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase bg-orange-100 text-orange-900 border border-orange-200">
                Harvest Operations Planner
              </span>
              {isSavedAlert && (
                <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 animate-pulse">
                  <Check className="w-3.5 h-3.5" /> Saved!
                </span>
              )}
            </div>
            <h2 className="font-serif font-bold text-xl sm:text-2xl text-[#1b2e1b] mt-0.5">
              Labor, Transport & Storage Coordination
            </h2>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs font-semibold"
          >
            Close Planner
          </button>
        )}
      </div>

      {/* Interactive Form */}
      <form onSubmit={handleSave} className="space-y-6 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {/* Target Date */}
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
            <label className="block font-bold text-gray-800 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-orange-600" />
              Target Harvest Date
            </label>
            <input
              type="date"
              value={plan.targetHarvestDate}
              onChange={(e) => setPlan({ ...plan, targetHarvestDate: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-gray-300 bg-white font-mono"
            />
            <p className="text-[11px] text-gray-500">
              Align with clear, dry forecast window.
            </p>
          </div>

          {/* Expected Yield */}
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
            <label className="block font-bold text-gray-800 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-orange-600" />
              Expected Harvest Yield (Kg)
            </label>
            <input
              type="number"
              value={plan.expectedYieldKg}
              onChange={(e) => setPlan({ ...plan, expectedYieldKg: parseFloat(e.target.value) || 0 })}
              className="w-full p-2.5 rounded-xl border border-gray-300 bg-white font-mono font-bold text-sm"
            />
            <p className="text-[11px] text-gray-500">
              Based on acre canopy & current fruit set.
            </p>
          </div>

          {/* Harvest Method */}
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
            <label className="block font-bold text-gray-800 flex items-center gap-1.5">
              <Tractor className="w-4 h-4 text-orange-600" />
              Harvesting Method
            </label>
            <select
              value={plan.harvestMethod}
              onChange={(e) => setPlan({ ...plan, harvestMethod: e.target.value as any })}
              className="w-full p-2.5 rounded-xl border border-gray-300 bg-white font-medium"
            >
              <option value="manual">Manual Picking (Hand Labor)</option>
              <option value="mechanized">Combine / Machine Harvester</option>
              <option value="semi_mechanized">Semi-Mechanized (Trolley assisted)</option>
            </select>
            <p className="text-[11px] text-gray-500">
              Manual ensures higher Grade A selection for vegetables.
            </p>
          </div>

          {/* Labor Crew */}
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
            <label className="block font-bold text-gray-800 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-blue-600" />
              Labor Crew Planning
            </label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[10px] text-gray-500 block">Needed</span>
                <input
                  type="number"
                  value={plan.laborersNeeded}
                  onChange={(e) => setPlan({ ...plan, laborersNeeded: parseInt(e.target.value) || 0 })}
                  className="w-full p-2 rounded-lg border border-gray-300 bg-white font-mono"
                />
              </div>
              <div>
                <span className="text-[10px] text-gray-500 block">Secured</span>
                <input
                  type="number"
                  value={plan.laborersSecured}
                  onChange={(e) => setPlan({ ...plan, laborersSecured: parseInt(e.target.value) || 0 })}
                  className="w-full p-2 rounded-lg border border-gray-300 bg-white font-mono"
                />
              </div>
            </div>
            {laborDeficit > 0 && (
              <span className="text-[11px] font-semibold text-rose-600 block">
                ⚠️ Need {laborDeficit} more laborers for 1-day picking.
              </span>
            )}
          </div>

          {/* Transport Logistics */}
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
            <label className="block font-bold text-gray-800 flex items-center gap-1.5">
              <Truck className="w-4 h-4 text-teal-600" />
              Transport Arrangement
            </label>
            <select
              value={plan.transportType || 'tractor_trolley'}
              onChange={(e) => setPlan({ ...plan, transportType: e.target.value as any })}
              className="w-full p-2.5 rounded-xl border border-gray-300 bg-white font-medium"
            >
              <option value="tractor_trolley">Tractor Trolley (~3.5 Ton)</option>
              <option value="small_truck">Small Commercial Truck (Tata Ace / 1.5 Ton)</option>
              <option value="commercial_logistics">Commercial Logistics Truck (10 Ton)</option>
              <option value="none">No Transport Arranged Yet</option>
            </select>
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="trans_chk"
                checked={plan.transportBooked}
                onChange={(e) => setPlan({ ...plan, transportBooked: e.target.checked })}
                className="rounded border-gray-300 text-teal-600 focus:ring-teal-500"
              />
              <label htmlFor="trans_chk" className="text-[11px] text-gray-700 font-semibold">
                Transport Confirmed & Booked
              </label>
            </div>
          </div>

          {/* Storage Availability */}
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
            <label className="block font-bold text-gray-800 flex items-center gap-1.5">
              <Warehouse className="w-4 h-4 text-purple-600" />
              Holding / Storage Facility
            </label>
            <select
              value={plan.storageType || 'farm_shed'}
              onChange={(e) => setPlan({ ...plan, storageType: e.target.value as any })}
              className="w-full p-2.5 rounded-xl border border-gray-300 bg-white font-medium"
            >
              <option value="farm_shed">Covered Farm Shed (Temporary 1-2d)</option>
              <option value="cold_storage">Regional Cold Storage</option>
              <option value="warehouse_mandi">APMC Mandi Warehouse</option>
              <option value="none">No Storage (Direct Field to Mandi)</option>
            </select>
            <p className="text-[11px] text-gray-500">
              Protects harvested crates from midday solar heating.
            </p>
          </div>
        </div>

        {/* Notes & Cost Summary */}
        <div className="p-4 rounded-2xl bg-orange-50/50 border border-orange-200 flex items-center justify-between flex-wrap gap-3">
          <div className="space-y-1">
            <span className="font-bold text-gray-900 block">Harvest Budget & Operational Feasibility:</span>
            <p className="text-gray-600 text-xs">
              Estimated picking duration: <strong>{estimatedDaysToHarvest} days</strong> • Labor capacity: <strong>{plan.laborersSecured * 500} kg/day</strong>
            </p>
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-orange-600 text-white font-bold hover:bg-orange-700 flex items-center gap-2 shadow-sm"
          >
            <Save className="w-4 h-4" />
            <span>Save Harvest Plan</span>
          </button>
        </div>
      </form>
    </div>
  );
};
