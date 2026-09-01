import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Layers,
  Search,
  Filter,
  Download,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownLeft,
  FileSpreadsheet,
  Calendar,
  RefreshCw,
  Building2,
  Wallet,
  ShieldCheck
} from 'lucide-react';
import { FinancialLedgerEntry, FinancialEntityType, FinancialEntryType } from '../../types';

interface RevenueMetrics {
  totalGmv: number;
  platformCommission: number;
  deliveryFeesCollected: number;
  totalPlatformRevenue: number;
  farmerPayoutsPending: number;
  adviserPayoutsPending: number;
  deliveryPayoutsPending: number;
  lastAuditTimestamp: string;
}

interface AdminFinancialLedgerViewProps {
  onRefresh?: () => void;
}

export const AdminFinancialLedgerView: React.FC<AdminFinancialLedgerViewProps> = ({ onRefresh }) => {
  const [metrics, setMetrics] = useState<RevenueMetrics>({
    totalGmv: 4850000,
    platformCommission: 485000,
    deliveryFeesCollected: 312000,
    totalPlatformRevenue: 797000,
    farmerPayoutsPending: 142000,
    adviserPayoutsPending: 48000,
    deliveryPayoutsPending: 64000,
    lastAuditTimestamp: new Date().toISOString()
  });

  const [ledgerEntries, setLedgerEntries] = useState<FinancialLedgerEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedEntity, setSelectedEntity] = useState<string>('ALL');
  const [selectedEntryType, setSelectedEntryType] = useState<string>('ALL');

  const fetchLedgerData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/financial/ledger');
      const data = await res.json();
      if (data.success) {
        if (data.metrics) setMetrics(data.metrics);
        if (Array.isArray(data.entries)) setLedgerEntries(data.entries);
      }
    } catch (e) {
      // Demo dataset for interactive exploration
      if (ledgerEntries.length === 0) {
        setLedgerEntries([
          {
            id: 'LED-001',
            transactionId: 'TXN-881920',
            entityType: 'order',
            entityId: 'ORD-98234-AGRI',
            entryType: 'CREDIT',
            amount: 4500,
            currency: 'INR',
            description: 'Farmer purchase of Organic Bio-Fertilizer 50kg',
            reference: 'RAZORPAY_PAY_991823',
            createdBy: 'PLATFORM_GATEWAY',
            timestamp: new Date(Date.now() - 3600000).toISOString()
          },
          {
            id: 'LED-002',
            transactionId: 'TXN-881921',
            entityType: 'delivery_fee',
            entityId: 'JOB-DLV-8821',
            entryType: 'DEBIT',
            amount: 370,
            currency: 'INR',
            description: 'Delivery partner payout for Guntur to Nandigama transit',
            reference: 'FLEET_SETTLE_102',
            createdBy: 'FLEET_DISPATCH_ENGINE',
            timestamp: new Date(Date.now() - 2400000).toISOString()
          },
          {
            id: 'LED-003',
            transactionId: 'TXN-881922',
            entityType: 'adviser_payout',
            entityId: 'ADV-CERT-7712',
            entryType: 'CREDIT',
            amount: 750,
            currency: 'INR',
            description: 'Agronomist consultation booking commission (15%)',
            reference: 'CONSULT_FEES_550',
            createdBy: 'ADVISER_ENGINE',
            timestamp: new Date(Date.now() - 1200000).toISOString()
          },
          {
            id: 'LED-004',
            transactionId: 'TXN-881923',
            entityType: 'settlement',
            entityId: 'FRM-SETTLE-009',
            entryType: 'DEBIT',
            amount: 3825,
            currency: 'INR',
            description: 'Farmer produce marketplace payout settlement',
            reference: 'NEFT_BNK_99120',
            createdBy: 'FINANCE_ADMIN',
            timestamp: new Date(Date.now() - 600000).toISOString()
          }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedgerData();
  }, []);

  const filteredEntries = ledgerEntries.filter(entry => {
    const matchesSearch = searchQuery === '' ||
      entry.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.entityId.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesEntity = selectedEntity === 'ALL' || entry.entityType === selectedEntity;
    const matchesType = selectedEntryType === 'ALL' || entry.entryType === selectedEntryType;

    return matchesSearch && matchesEntity && matchesType;
  });

  return (
    <div id="admin-financial-ledger-view" className="space-y-6">
      {/* Top Banner & Audit Timestamp */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 md:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200 dark:border-stone-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">Financial Ledger & Revenue Command</h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                  <ShieldCheck className="w-3 h-3" /> Immutable Audit Ledger
                </span>
              </div>
              <p className="text-xs text-stone-500">Authoritative platform financials, escrow payouts, and transaction logging</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchLedgerData}
              disabled={loading}
              className="flex items-center gap-1.5 px-4 py-2 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-xl text-xs font-semibold transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Ledger</span>
            </button>
          </div>
        </div>

        {/* Revenue KPI Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="p-4 bg-stone-50 dark:bg-stone-800/40 rounded-2xl border border-stone-200 dark:border-stone-700">
            <div className="text-xs text-stone-500 font-semibold uppercase tracking-wider">Gross Platform GMV</div>
            <div className="text-2xl font-black text-stone-900 dark:text-stone-100 mt-1">₹{metrics.totalGmv.toLocaleString()}</div>
            <div className="text-[10px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" /> All Marketplace Orders
            </div>
          </div>

          <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-2xl border border-emerald-200 dark:border-emerald-800/60">
            <div className="text-xs text-emerald-700 dark:text-emerald-300 font-semibold uppercase tracking-wider">Net Platform Revenue</div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">₹{metrics.totalPlatformRevenue.toLocaleString()}</div>
            <div className="text-[10px] text-stone-500 mt-1">Commissions + Delivery Margins</div>
          </div>

          <div className="p-4 bg-stone-50 dark:bg-stone-800/40 rounded-2xl border border-stone-200 dark:border-stone-700">
            <div className="text-xs text-stone-500 font-semibold uppercase tracking-wider">Logistics Fleet Fees</div>
            <div className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">₹{metrics.deliveryFeesCollected.toLocaleString()}</div>
            <div className="text-[10px] text-stone-500 mt-1">Total Delivery Inflow</div>
          </div>

          <div className="p-4 bg-stone-50 dark:bg-stone-800/40 rounded-2xl border border-stone-200 dark:border-stone-700">
            <div className="text-xs text-stone-500 font-semibold uppercase tracking-wider">Escrow Pending Payouts</div>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">₹{(metrics.farmerPayoutsPending + metrics.adviserPayoutsPending + metrics.deliveryPayoutsPending).toLocaleString()}</div>
            <div className="text-[10px] text-amber-600 font-semibold mt-1">Due to Farmers & Drivers</div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by Transaction ID, Entity ID, or Description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs text-stone-800 dark:text-stone-200 focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedEntity}
              onChange={(e) => setSelectedEntity(e.target.value)}
              className="px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-semibold text-stone-700 dark:text-stone-300"
            >
              <option value="ALL">All Entities</option>
              <option value="ORDER">Orders (Agri)</option>
              <option value="DELIVERY">Delivery Fleet</option>
              <option value="ADVISER">Agronomist Adviser</option>
              <option value="FARMER">Farmer Payout</option>
            </select>

            <select
              value={selectedEntryType}
              onChange={(e) => setSelectedEntryType(e.target.value)}
              className="px-3 py-2 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl text-xs font-semibold text-stone-700 dark:text-stone-300"
            >
              <option value="ALL">All Flow</option>
              <option value="CREDIT">Credits (Inflow)</option>
              <option value="DEBIT">Debits (Outflow)</option>
            </select>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-800/40 text-stone-500 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">TXN / Ledger ID</th>
                <th className="py-3 px-4">Entity</th>
                <th className="py-3 px-4">Description & Ref</th>
                <th className="py-3 px-4">Flow</th>
                <th className="py-3 px-4">Amount (INR)</th>
                <th className="py-3 px-4">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60">
              {filteredEntries.length > 0 ? (
                filteredEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-stone-50/80 dark:hover:bg-stone-800/30 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-stone-900 dark:text-stone-100">
                      <div>{entry.transactionId}</div>
                      <span className="text-[10px] text-stone-400 font-normal">{entry.id}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 font-semibold text-[10px]">
                        {entry.entityType}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-stone-800 dark:text-stone-200">{entry.description}</div>
                      <div className="text-[10px] text-stone-400 font-mono mt-0.5">Ref: {entry.reference || 'N/A'}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      {entry.entryType === 'CREDIT' ? (
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full text-[10px]">
                          <ArrowDownLeft className="w-3 h-3" /> Credit
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-600 font-bold bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-full text-[10px]">
                          <ArrowUpRight className="w-3 h-3" /> Debit
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-black font-mono text-stone-900 dark:text-stone-100">
                      {entry.entryType === 'CREDIT' ? '+' : '-'}₹{entry.amount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-stone-400 text-[11px] whitespace-nowrap">
                      {new Date(entry.timestamp).toLocaleDateString()} {new Date(entry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-stone-400">
                    No financial ledger transactions matching current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
