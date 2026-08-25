import React, { useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  Plus, 
  Trash2, 
  PieChart as PieChartIcon, 
  Coins, 
  Sparkles,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';
import { farmEconomicsService } from '../../services/resources/farmEconomicsService';
import { ExpenseCategory, FarmExpenseItem } from '../../types/resources/farmResourceTypes';

interface FarmEconomicsCardProps {
  cropName?: string;
  farmAreaAcres?: number;
  isExpertMode?: boolean;
  onOpenAskCroperX?: (question: string) => void;
}

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Seeds',
  'Fertilizer',
  'Pesticides',
  'Labour',
  'Irrigation',
  'Electricity',
  'Fuel',
  'Machinery',
  'Transport',
  'Storage',
  'Other'
];

export const FarmEconomicsCard: React.FC<FarmEconomicsCardProps> = ({
  cropName = 'Tomato',
  farmAreaAcres = 3.5,
  isExpertMode = false,
  onOpenAskCroperX
}) => {
  const [expenses, setExpenses] = useState<FarmExpenseItem[]>(() => farmEconomicsService.getExpenses());
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showAllVariances, setShowAllVariances] = useState(false);

  // Form State for Adding Expense
  const [newCategory, setNewCategory] = useState<ExpenseCategory>('Fertilizer');
  const [newAmount, setNewAmount] = useState<string>('');
  const [newNotes, setNewNotes] = useState<string>('');
  const [newZone, setNewZone] = useState<string>('Main Field (Zone A)');

  const economics = farmEconomicsService.calculateEconomics({
    cropName,
    farmAreaAcres
  });

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(newAmount);
    if (isNaN(amount) || amount <= 0) return;

    farmEconomicsService.addExpense({
      date: new Date().toISOString().split('T')[0],
      category: newCategory,
      amountInr: amount,
      notes: newNotes.trim() || undefined,
      fieldZone: newZone,
      cropSeason: 'Kharif 2026',
      type: 'actual'
    });

    setExpenses(farmEconomicsService.getExpenses());
    setNewAmount('');
    setNewNotes('');
    setIsAddModalOpen(false);
  };

  const handleDeleteExpense = (id: string) => {
    const updated = farmEconomicsService.deleteExpense(id);
    setExpenses(updated);
  };

  const criticalOverBudget = economics.budgetVariances.filter(v => v.status === 'exceeded');

  return (
    <div id="farm-economics-card" className="bg-[#111C15]/90 border border-[#2E4A38]/50 rounded-2xl p-5 md:p-6 backdrop-blur-md shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#2E4A38]/40">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg md:text-xl font-bold text-slate-100">Farm Money & Economics</h2>
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Phase 9 Live
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Crop cycle financial budget, cost tracking, and projected harvest return
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-900/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Expense</span>
          </button>
        </div>
      </div>

      {/* Critical Overspend Alerts */}
      {criticalOverBudget.length > 0 && (
        <div className="mt-4 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-semibold text-amber-300">Budget Warning: </span>
            {criticalOverBudget.map((v, i) => (
              <span key={v.category} className="text-slate-200">
                {v.category} spending is <strong className="text-amber-300">+{v.variancePercent}% higher</strong> than planned ({economics.currency}{v.actualInr.toLocaleString()} vs {economics.currency}{v.plannedInr.toLocaleString()}){i < criticalOverBudget.length - 1 ? '; ' : '.'}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 4 Primary Financial KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mt-5">
        {/* Total Money Spent */}
        <div className="bg-[#18291F]/60 border border-[#2E4A38]/40 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Money Spent</span>
            <DollarSign className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2">
            <div className="text-xl md:text-2xl font-bold text-slate-100">
              {economics.currency}{economics.totalActualCost.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Plan: {economics.currency}{economics.totalPlannedCost.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Expected Income */}
        <div className="bg-[#18291F]/60 border border-[#2E4A38]/40 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Expected Income</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2">
            <div className="text-xl md:text-2xl font-bold text-emerald-400">
              {economics.currency}{economics.expectedRevenue.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {economics.expectedYieldKg.toLocaleString()} kg @ {economics.currency}{economics.expectedPricePerKg}/kg
            </div>
          </div>
        </div>

        {/* Expected Net Profit */}
        <div className="bg-[#18291F]/60 border border-[#2E4A38]/40 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Expected Profit</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2">
            <div className="text-xl md:text-2xl font-bold text-amber-300">
              {economics.currency}{economics.expectedProfit.toLocaleString()}
            </div>
            <div className="text-[11px] text-emerald-400 font-medium mt-0.5">
              +{economics.roiPercentage}% Net Return (ROI)
            </div>
          </div>
        </div>

        {/* Profit Per Acre */}
        <div className="bg-[#18291F]/60 border border-[#2E4A38]/40 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Profit / Acre</span>
            <Coins className="w-4 h-4 text-emerald-300" />
          </div>
          <div className="mt-2">
            <div className="text-xl md:text-2xl font-bold text-emerald-300">
              {economics.currency}{economics.profitPerAcre.toLocaleString()}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Cost: {economics.currency}{economics.costPerAcre.toLocaleString()} / acre
            </div>
          </div>
        </div>
      </div>

      {/* Simple Farmer Translation Card */}
      <div className="mt-4 p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800/40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <p className="text-xs md:text-sm text-emerald-200">
            <strong>Farmer Summary:</strong> You may earn about <span className="font-bold text-amber-300">{economics.currency}{Math.round(economics.roiPercentage / 1)}</span> profit for every {economics.currency}100 invested on your {farmAreaAcres} acres.
          </p>
        </div>
        {onOpenAskCroperX && (
          <button
            onClick={() => onOpenAskCroperX("Explain my farm spending and expected profit in simple words")}
            className="text-xs text-emerald-400 hover:text-emerald-300 underline shrink-0 ml-3"
          >
            Ask AI
          </button>
        )}
      </div>

      {/* Planned vs Actual Budget Tracking Section */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <span>Planned vs Actual Cost by Category</span>
          </h3>
          <button
            onClick={() => setShowAllVariances(!showAllVariances)}
            className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
          >
            <span>{showAllVariances ? 'Show Top Only' : 'View All Categories'}</span>
            {showAllVariances ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {(showAllVariances ? economics.budgetVariances : economics.budgetVariances.slice(0, 6)).map(item => {
            const isExceeded = item.status === 'exceeded';
            const isNear = item.status === 'near_limit';
            return (
              <div 
                key={item.category}
                className={`p-3 rounded-xl border ${
                  isExceeded 
                    ? 'bg-amber-950/20 border-amber-600/30' 
                    : isNear
                    ? 'bg-yellow-950/10 border-yellow-600/20'
                    : 'bg-[#18291F]/40 border-[#2E4A38]/30'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-200">{item.category}</span>
                  <span className={`font-semibold px-2 py-0.5 rounded-full text-[11px] ${
                    isExceeded 
                      ? 'bg-amber-500/20 text-amber-300' 
                      : item.actualInr > 0
                      ? 'bg-emerald-500/10 text-emerald-300'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    {item.variancePercent > 0 ? `+${item.variancePercent}% Over` : item.variancePercent === 0 ? 'On Track' : `${item.variancePercent}%`}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs mt-2 text-slate-400">
                  <span>Actual: <strong className="text-slate-200">{economics.currency}{item.actualInr.toLocaleString()}</strong></span>
                  <span>Planned: {economics.currency}{item.plannedInr.toLocaleString()}</span>
                </div>
                {/* Progress Bar */}
                <div className="w-full bg-slate-800/80 rounded-full h-1.5 mt-2 overflow-hidden">
                  <div 
                    className={`h-1.5 rounded-full ${
                      isExceeded ? 'bg-amber-500' : isNear ? 'bg-yellow-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, item.plannedInr > 0 ? (item.actualInr / item.plannedInr) * 100 : 0)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Expert Mode Breakdown */}
      {isExpertMode && (
        <div className="mt-6 pt-5 border-t border-[#2E4A38]/40">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <PieChartIcon className="w-4 h-4 text-emerald-400" />
            <span>Expert Agro-Economic Analytics</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-2.5 rounded-lg bg-[#18291F]/50 border border-[#2E4A38]/30">
              <div className="text-slate-400">Cost per Hectare</div>
              <div className="text-sm font-bold text-slate-200 mt-1">{economics.currency}{economics.costPerHectare.toLocaleString()}</div>
            </div>
            <div className="p-2.5 rounded-lg bg-[#18291F]/50 border border-[#2E4A38]/30">
              <div className="text-slate-400">Profit per Hectare</div>
              <div className="text-sm font-bold text-emerald-400 mt-1">{economics.currency}{economics.profitPerHectare.toLocaleString()}</div>
            </div>
            <div className="p-2.5 rounded-lg bg-[#18291F]/50 border border-[#2E4A38]/30">
              <div className="text-slate-400">Yield Assumption</div>
              <div className="text-sm font-bold text-slate-200 mt-1">{(economics.expectedYieldKg / 100).toFixed(1)} Quintals</div>
            </div>
            <div className="p-2.5 rounded-lg bg-[#18291F]/50 border border-[#2E4A38]/30">
              <div className="text-slate-400">Price Assumption</div>
              <div className="text-sm font-bold text-slate-200 mt-1">{economics.currency}{economics.expectedPricePerKg} / kg</div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Actual Expenses Table */}
      <div className="mt-6 pt-5 border-t border-[#2E4A38]/40">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-200">Recent Recorded Expenses</h3>
          <span className="text-xs text-slate-400">{expenses.length} records</span>
        </div>

        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {expenses.map(exp => (
            <div 
              key={exp.id} 
              className="flex items-center justify-between p-2.5 rounded-xl bg-[#18291F]/40 border border-[#2E4A38]/20 text-xs hover:border-[#2E4A38]/50 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-medium text-[11px]">
                  {exp.category}
                </span>
                <span className="text-slate-300 font-medium">{exp.notes || exp.fieldZone || 'Farm Expense'}</span>
                <span className="text-slate-500 text-[11px]">{exp.date}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-slate-100">{economics.currency}{exp.amountInr.toLocaleString()}</span>
                <button
                  onClick={() => handleDeleteExpense(exp.id)}
                  className="p-1 text-slate-500 hover:text-red-400 transition-colors cursor-pointer"
                  title="Delete record"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Expense Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#111C15] border border-[#2E4A38] rounded-2xl w-full max-w-md p-5 shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between pb-3 border-b border-[#2E4A38]">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-400" />
                <span>Record Farm Expense</span>
              </h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Expense Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as ExpenseCategory)}
                  className="w-full bg-[#18291F] border border-[#2E4A38] rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  {EXPENSE_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Amount ({economics.currency})</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 3500"
                  value={newAmount}
                  onChange={(e) => setNewAmount(e.target.value)}
                  className="w-full bg-[#18291F] border border-[#2E4A38] rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Field Zone</label>
                <input
                  type="text"
                  placeholder="e.g. Main Field (Zone A)"
                  value={newZone}
                  onChange={(e) => setNewZone(e.target.value)}
                  className="w-full bg-[#18291F] border border-[#2E4A38] rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Notes / Item Details</label>
                <input
                  type="text"
                  placeholder="e.g. 2 bags of micro-nutrient soluble mix"
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full bg-[#18291F] border border-[#2E4A38] rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#2E4A38]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-lg shadow-emerald-900/30"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
