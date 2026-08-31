import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Boxes, Search, Plus, Minus, AlertTriangle, CheckCircle2, History,
  TrendingDown, TrendingUp, RefreshCw, X, ShieldAlert, ArrowRight,
  Filter, IndianRupee
} from 'lucide-react';
import {
  fetchAdminProducts,
  fetchAdminInventoryLogs,
  adjustAdminInventory
} from '../../services/adminService';

export const AdminStoreInventoryManager: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'levels' | 'history'>('levels');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'low_stock' | 'out_of_stock' | 'in_stock'>('all');

  // Adjustment Modal
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [adjustOperation, setAdjustOperation] = useState<'ADD' | 'SUBTRACT' | 'SET'>('ADD');
  const [adjustAmount, setAdjustAmount] = useState<string>('10');
  const [adjustReason, setAdjustReason] = useState<string>('Procurement Batch Delivery');
  const [lowStockThreshold, setLowStockThreshold] = useState<string>('10');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [prodRes, logRes] = await Promise.all([
        fetchAdminProducts({
          search,
          status: statusFilter === 'all' ? undefined : (statusFilter as any)
        }),
        fetchAdminInventoryLogs()
      ]);
      setProducts(prodRes.products || []);
      setLogs(logRes || []);
    } catch (err: any) {
      console.error('Failed to load inventory data:', err);
      setFeedback({ type: 'error', message: err.message || 'Failed to load inventory.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleOpenAdjust = (p: any) => {
    setSelectedProduct(p);
    setAdjustOperation('ADD');
    setAdjustAmount('25');
    setAdjustReason('Warehouse Restock Consignment');
    setLowStockThreshold(String(p.lowStockThreshold || 10));
    setShowAdjustModal(true);
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    setSaving(true);
    try {
      await adjustAdminInventory({
        productId: selectedProduct.id,
        operation: adjustOperation,
        adjustment: Number(adjustAmount),
        reason: adjustReason,
        lowStockThreshold: Number(lowStockThreshold)
      });

      setFeedback({
        type: 'success',
        message: `Inventory for "${selectedProduct.name}" updated successfully.`
      });
      setShowAdjustModal(false);
      loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Stock adjustment failed.' });
    } finally {
      setSaving(false);
    }
  };

  // Metrics
  const lowStockCount = products.filter(
    (p) => p.stockQuantity > 0 && p.stockQuantity <= (p.lowStockThreshold || 10)
  ).length;
  const outOfStockCount = products.filter((p) => p.stockQuantity <= 0).length;
  const totalUnits = products.reduce((acc, p) => acc + (p.stockQuantity || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Banner & KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-semibold">Total SKUs in Warehouse</div>
            <div className="text-2xl font-black text-white mt-1">{products.length}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">{totalUnits.toLocaleString()} units total buffer</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <Boxes className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-amber-400 font-semibold">Low Stock Threshold Warnings</div>
            <div className="text-2xl font-black text-amber-300 mt-1">{lowStockCount}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Need procurement replenishment</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-red-400 font-semibold">Out of Stock Alert</div>
            <div className="text-2xl font-black text-red-300 mt-1">{outOfStockCount}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Orders temporarily paused</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-emerald-400 font-semibold">Logged Stock Audit Events</div>
            <div className="text-2xl font-black text-emerald-300 mt-1">{logs.length}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Full audit trail preserved</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <History className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Feedback Toast */}
      {feedback && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className={`p-4 rounded-xl flex items-center justify-between gap-3 text-sm font-medium border ${
            feedback.type === 'success'
              ? 'bg-emerald-950/60 border-emerald-500/30 text-emerald-300'
              : 'bg-red-950/60 border-red-500/30 text-red-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      )}

      {/* Tabs & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-900 border border-slate-800 rounded-2xl">
        <div className="flex items-center gap-2 p-1 bg-slate-950 border border-slate-800 rounded-xl">
          <button
            onClick={() => setActiveTab('levels')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'levels'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Live Inventory Buffer ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'history'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Audit Transaction Logs ({logs.length})
          </button>
        </div>

        {activeTab === 'levels' && (
          <div className="flex flex-wrap items-center gap-3">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Filter by SKU or name..."
                className="pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </form>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All Inventory</option>
              <option value="low_stock">⚠️ Low Stock Alerts</option>
              <option value="out_of_stock">❌ Out of Stock</option>
              <option value="in_stock">✅ Healthy Buffer</option>
            </select>

            <button
              onClick={loadData}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        )}
      </div>

      {/* Content View */}
      {activeTab === 'levels' ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Input & SKU</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Available Units</th>
                  <th className="py-3.5 px-4">Stock Status</th>
                  <th className="py-3.5 px-4">Warning Threshold</th>
                  <th className="py-3.5 px-4 text-right">Stock Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {products.map((p) => {
                  const isLow = p.stockQuantity > 0 && p.stockQuantity <= (p.lowStockThreshold || 10);
                  const isOut = p.stockQuantity <= 0;

                  return (
                    <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-700 bg-slate-800 shrink-0"
                          />
                          <div>
                            <div className="font-bold text-white">{p.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                              SKU: {p.sku || 'N/A'} • ₹{p.price}/{p.unit}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="text-slate-300 font-medium">{p.categoryName || p.categoryId}</span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="text-sm font-black text-white font-mono">
                          {p.stockQuantity} {p.unit?.split(' ')?.[1] || 'units'}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        {isOut ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/30">
                            Out of Stock
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
                            ⚠️ Low Stock Alert
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            ✓ Adequate Buffer
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-400">
                        {p.lowStockThreshold || 10} units
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleOpenAdjust(p)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600 border border-emerald-500/40 text-emerald-300 hover:text-white text-xs font-bold transition-all"
                        >
                          Adjust Stock Level
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Inventory Transaction Logs */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="py-3.5 px-4">Timestamp</th>
                  <th className="py-3.5 px-4">Product</th>
                  <th className="py-3.5 px-4">Operation</th>
                  <th className="py-3.5 px-4">Previous → New Stock</th>
                  <th className="py-3.5 px-4">Reason / Notes</th>
                  <th className="py-3.5 px-4">Actor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      No stock transaction history recorded yet.
                    </td>
                  </tr>
                ) : (
                  logs.map((l) => (
                    <tr key={l.id} className="hover:bg-slate-800/40 transition-colors font-mono">
                      <td className="py-3 px-4 text-slate-400 text-[11px]">
                        {new Date(l.timestamp).toLocaleString()}
                      </td>

                      <td className="py-3 px-4 font-sans font-bold text-white">
                        {l.productName}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                            l.operation === 'ADD'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : l.operation === 'SUBTRACT'
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                              : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          }`}
                        >
                          {l.operation === 'ADD' && <TrendingUp className="w-3 h-3" />}
                          {l.operation === 'SUBTRACT' && <TrendingDown className="w-3 h-3" />}
                          {l.operation} ({l.adjustment > 0 ? `+${l.adjustment}` : l.adjustment})
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="text-slate-500">{l.previousStock}</span>
                        <span className="mx-1.5 text-slate-600">→</span>
                        <span className="text-white font-bold">{l.newStock}</span>
                      </td>

                      <td className="py-3 px-4 font-sans text-slate-300 max-w-[220px] truncate" title={l.reason}>
                        {l.reason}
                      </td>

                      <td className="py-3 px-4 font-sans text-slate-400">
                        {l.adminName || 'Admin'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Adjust Stock Modal */}
      <AnimatePresence>
        {showAdjustModal && selectedProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/80">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Boxes className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Adjust Product Inventory</h3>
                    <p className="text-[10px] text-slate-400 truncate max-w-[260px]">{selectedProduct.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAdjustModal(false)}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAdjustSubmit} className="p-6 space-y-4 text-xs">
                {/* Current Stock Banner */}
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
                  <span className="text-slate-400">Current Warehouse Stock:</span>
                  <span className="font-mono font-black text-white text-base">
                    {selectedProduct.stockQuantity} {selectedProduct.unit}
                  </span>
                </div>

                {/* Operation Selector */}
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-semibold">Adjustment Action</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setAdjustOperation('ADD')}
                      className={`p-2 rounded-xl border text-center font-bold transition-all ${
                        adjustOperation === 'ADD'
                          ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      + ADD Stock
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdjustOperation('SUBTRACT')}
                      className={`p-2 rounded-xl border text-center font-bold transition-all ${
                        adjustOperation === 'SUBTRACT'
                          ? 'bg-red-600/20 border-red-500 text-red-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      - SUBTRACT
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdjustOperation('SET')}
                      className={`p-2 rounded-xl border text-center font-bold transition-all ${
                        adjustOperation === 'SET'
                          ? 'bg-blue-600/20 border-blue-500 text-blue-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      = SET Exact
                    </button>
                  </div>
                </div>

                {/* Amount */}
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Quantity Adjustment</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={adjustAmount}
                    onChange={(e) => setAdjustAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Threshold */}
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Low Stock Alert Threshold</label>
                  <input
                    type="number"
                    min="0"
                    value={lowStockThreshold}
                    onChange={(e) => setLowStockThreshold(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Reason */}
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Audit Justification / Delivery Note</label>
                  <textarea
                    rows={2}
                    required
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value)}
                    placeholder="e.g. New consignment PAU-BATCH-2026 arrived at central depot..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Submit */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowAdjustModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-2 disabled:opacity-50"
                  >
                    {saving && <RefreshCw className="w-4 h-4 animate-spin" />}
                    Confirm Stock Adjustment
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
