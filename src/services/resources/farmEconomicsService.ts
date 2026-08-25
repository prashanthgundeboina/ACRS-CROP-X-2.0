import { 
  FarmExpenseItem, 
  FarmEconomicsSummary, 
  ExpenseCategory, 
  BudgetVarianceCategory 
} from '../../types/resources/farmResourceTypes';

const STORAGE_EXPENSES_KEY = 'croperx_farm_expenses_v2';
const STORAGE_BUDGET_KEY = 'croperx_farm_planned_budget_v2';

const DEFAULT_PLANNED_BUDGET: Record<ExpenseCategory, number> = {
  Seeds: 4500,
  Fertilizer: 8500,
  Pesticides: 3000,
  Labour: 12000,
  Irrigation: 3500,
  Electricity: 2400,
  Fuel: 3800,
  Machinery: 5000,
  Transport: 2500,
  Storage: 1500,
  Other: 1000
};

const DEFAULT_ACTUAL_EXPENSES: FarmExpenseItem[] = [
  {
    id: 'exp_001',
    date: new Date(Date.now() - 14 * 86400000).toISOString().split('T')[0],
    category: 'Seeds',
    amountInr: 4800,
    fieldZone: 'Main Field (Zone A)',
    cropSeason: 'Kharif 2026',
    notes: 'Certified Hybrid Seeds (3 packets)',
    type: 'actual'
  },
  {
    id: 'exp_002',
    date: new Date(Date.now() - 10 * 86400000).toISOString().split('T')[0],
    category: 'Fertilizer',
    amountInr: 10030, // 18% higher than planned 8500
    fieldZone: 'Main Field (Zone A)',
    cropSeason: 'Kharif 2026',
    notes: 'DAP (2 bags) + Urea top-dress',
    type: 'actual'
  },
  {
    id: 'exp_003',
    date: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0],
    category: 'Labour',
    amountInr: 9500,
    fieldZone: 'All Zones',
    cropSeason: 'Kharif 2026',
    notes: 'Transplanting & bed shaping crew',
    type: 'actual'
  },
  {
    id: 'exp_004',
    date: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
    category: 'Electricity',
    amountInr: 2100,
    fieldZone: 'Borewell Pump #1',
    cropSeason: 'Kharif 2026',
    notes: 'Agricultural power tariff',
    type: 'actual'
  },
  {
    id: 'exp_005',
    date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
    category: 'Machinery',
    amountInr: 4200,
    fieldZone: 'Zone A & B',
    cropSeason: 'Kharif 2026',
    notes: 'Tractor rotavator rental (4 hours)',
    type: 'actual'
  }
];

export class FarmEconomicsService {
  private getStoredExpenses(): FarmExpenseItem[] {
    try {
      const stored = localStorage.getItem(STORAGE_EXPENSES_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to load expenses from localStorage:', e);
    }
    return DEFAULT_ACTUAL_EXPENSES;
  }

  private getStoredPlannedBudget(): Record<ExpenseCategory, number> {
    try {
      const stored = localStorage.getItem(STORAGE_BUDGET_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to load planned budget from localStorage:', e);
    }
    return DEFAULT_PLANNED_BUDGET;
  }

  public getExpenses(): FarmExpenseItem[] {
    return this.getStoredExpenses();
  }

  public addExpense(item: Omit<FarmExpenseItem, 'id'>): FarmExpenseItem {
    const expenses = this.getStoredExpenses();
    const newExpense: FarmExpenseItem = {
      ...item,
      id: `exp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
    };
    const updated = [newExpense, ...expenses];
    try {
      localStorage.setItem(STORAGE_EXPENSES_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save expense:', e);
    }
    return newExpense;
  }

  public deleteExpense(id: string): FarmExpenseItem[] {
    const expenses = this.getStoredExpenses().filter(e => e.id !== id);
    try {
      localStorage.setItem(STORAGE_EXPENSES_KEY, JSON.stringify(expenses));
    } catch (e) {
      console.warn('Failed to delete expense:', e);
    }
    return expenses;
  }

  public setPlannedBudgetCategory(category: ExpenseCategory, amountInr: number): void {
    const budget = this.getStoredPlannedBudget();
    budget[category] = Math.max(0, amountInr);
    try {
      localStorage.setItem(STORAGE_BUDGET_KEY, JSON.stringify(budget));
    } catch (e) {
      console.warn('Failed to save planned budget:', e);
    }
  }

  public getPlannedBudget(): Record<ExpenseCategory, number> {
    return this.getStoredPlannedBudget();
  }

  public calculateEconomics(params: {
    cropName?: string;
    farmAreaAcres?: number;
    expectedYieldKg?: number;
    expectedPricePerKg?: number;
  }): FarmEconomicsSummary {
    const farmAreaAcres = params.farmAreaAcres || 3.5;
    const farmAreaHa = farmAreaAcres * 0.404686;
    const expectedYieldKg = params.expectedYieldKg || (farmAreaAcres * 1200); // 1200 kg/acre default
    const expectedPricePerKg = params.expectedPricePerKg || 32; // INR/kg

    const expenses = this.getStoredExpenses();
    const plannedBudget = this.getStoredPlannedBudget();

    const actualByCategory: Record<ExpenseCategory, number> = {
      Seeds: 0,
      Fertilizer: 0,
      Pesticides: 0,
      Labour: 0,
      Irrigation: 0,
      Electricity: 0,
      Fuel: 0,
      Machinery: 0,
      Transport: 0,
      Storage: 0,
      Other: 0
    };

    let totalActualCost = 0;
    expenses.forEach(exp => {
      if (exp.type === 'actual') {
        actualByCategory[exp.category] = (actualByCategory[exp.category] || 0) + exp.amountInr;
        totalActualCost += exp.amountInr;
      }
    });

    let totalPlannedCost = 0;
    const budgetVariances: BudgetVarianceCategory[] = Object.keys(plannedBudget).map(catKey => {
      const category = catKey as ExpenseCategory;
      const planned = plannedBudget[category] || 0;
      const actual = actualByCategory[category] || 0;
      totalPlannedCost += planned;

      const variancePercent = planned > 0 ? Math.round(((actual - planned) / planned) * 100) : 0;
      let status: BudgetVarianceCategory['status'] = 'within_budget';
      if (variancePercent > 10) status = 'exceeded';
      else if (variancePercent > -5 && variancePercent <= 10) status = 'near_limit';

      return {
        category,
        plannedInr: planned,
        actualInr: actual,
        variancePercent,
        status
      };
    });

    const expectedRevenue = expectedYieldKg * expectedPricePerKg;
    const expectedProfit = expectedRevenue - totalActualCost;
    const roiPercentage = totalActualCost > 0 ? Math.round((expectedProfit / totalActualCost) * 100) : 0;

    const costPerAcre = Math.round(totalActualCost / farmAreaAcres);
    const profitPerAcre = Math.round(expectedProfit / farmAreaAcres);
    const costPerHectare = Math.round(totalActualCost / farmAreaHa);
    const profitPerHectare = Math.round(expectedProfit / farmAreaHa);

    const costBreakdown = Object.entries(actualByCategory)
      .filter(([_, amount]) => amount > 0)
      .map(([cat, amount]) => ({
        category: cat as ExpenseCategory,
        amount,
        percentage: totalActualCost > 0 ? Math.round((amount / totalActualCost) * 100) : 0
      }))
      .sort((a, b) => b.amount - a.amount);

    return {
      totalActualCost,
      totalPlannedCost,
      expectedYieldKg,
      expectedPricePerKg,
      expectedRevenue,
      expectedProfit,
      roiPercentage,
      costPerAcre,
      profitPerAcre,
      costPerHectare,
      profitPerHectare,
      currency: '₹',
      budgetVariances,
      costBreakdown
    };
  }
}

export const farmEconomicsService = new FarmEconomicsService();
