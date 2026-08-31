import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShoppingBag, Search, Filter, Truck, CheckCircle2, Clock,
  AlertTriangle, Phone, MapPin, IndianRupee, RefreshCw, X,
  FileText, ExternalLink, ChevronRight, PackageCheck, Send
} from 'lucide-react';
import {
  fetchAdminOrders,
  updateAdminOrderStatus
} from '../../services/adminService';

const ORDER_STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; border: string }> = {
  PLACED: { label: 'Order Placed', bg: 'bg-blue-500/20', text: 'text-blue-300', border: 'border-blue-500/30' },
  CONFIRMED: { label: 'Confirmed', bg: 'bg-indigo-500/20', text: 'text-indigo-300', border: 'border-indigo-500/30' },
  PROCESSING: { label: 'Processing at Hub', bg: 'bg-amber-500/20', text: 'text-amber-300', border: 'border-amber-500/30' },
  DISPATCHED: { label: 'Dispatched', bg: 'bg-purple-500/20', text: 'text-purple-300', border: 'border-purple-500/30' },
  OUT_FOR_DELIVERY: { label: 'Out for Delivery', bg: 'bg-teal-500/20', text: 'text-teal-300', border: 'border-teal-500/30' },
  DELIVERED: { label: 'Delivered', bg: 'bg-emerald-500/20', text: 'text-emerald-300', border: 'border-emerald-500/30' },
  CANCELLED: { label: 'Cancelled', bg: 'bg-red-500/20', text: 'text-red-300', border: 'border-red-500/30' }
};

export const AdminStoreOrdersManager: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');

  // Detail / Status Modal
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [newStatus, setNewStatus] = useState<string>('');
  const [newPaymentStatus, setNewPaymentStatus] = useState<string>('');
  const [internalNote, setInternalNote] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminOrders({
        search,
        status: statusFilter === 'all' ? undefined : statusFilter,
        paymentStatus: paymentFilter === 'all' ? undefined : paymentFilter
      });
      setOrders(data.orders || []);
      setTotalCount(data.total || 0);
    } catch (err: any) {
      console.error('Failed to load orders:', err);
      setFeedback({ type: 'error', message: err.message || 'Failed to load orders.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [statusFilter, paymentFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadOrders();
  };

  const handleOpenDetail = (order: any) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setNewPaymentStatus(order.paymentStatus);
    setInternalNote(order.notes || '');
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setSaving(true);
    try {
      const updated = await updateAdminOrderStatus(selectedOrder.id, {
        status: newStatus,
        paymentStatus: newPaymentStatus,
        internalNote
      });

      setFeedback({
        type: 'success',
        message: `Order #${selectedOrder.orderNumber} status updated to ${newStatus}.`
      });

      setSelectedOrder(updated);
      loadOrders();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to update order status.' });
    } finally {
      setSaving(false);
    }
  };

  // Metrics
  const pendingOrders = orders.filter((o) => ['PLACED', 'CONFIRMED', 'PROCESSING'].includes(o.status)).length;
  const dispatchedOrders = orders.filter((o) => ['DISPATCHED', 'OUT_FOR_DELIVERY'].includes(o.status)).length;
  const deliveredOrders = orders.filter((o) => o.status === 'DELIVERED').length;
  const totalRevenue = orders
    .filter((o) => o.status !== 'CANCELLED')
    .reduce((acc, o) => acc + (o.grandTotal || 0), 0);

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-semibold">Total Store Orders</div>
            <div className="text-2xl font-black text-white mt-1">{totalCount}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Across all districts</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-amber-400 font-semibold">In Fulfillment Pipeline</div>
            <div className="text-2xl font-black text-amber-300 mt-1">{pendingOrders}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Placed / Processing</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-teal-400 font-semibold">In Transit / Out for Delivery</div>
            <div className="text-2xl font-black text-teal-300 mt-1">{dispatchedOrders}</div>
            <div className="text-[10px] text-slate-500 mt-0.5">Village dispatch logistics</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
            <Truck className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-emerald-400 font-semibold">Total Order Gross Value</div>
            <div className="text-2xl font-black text-emerald-300 mt-1 font-mono">
              ₹{totalRevenue.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">{deliveredOrders} delivered orders</div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <IndianRupee className="w-5 h-5" />
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

      {/* Search & Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-900 border border-slate-800 rounded-2xl">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Order #, Farmer Name, Phone, District..."
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </form>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
        >
          <option value="all">All Order Statuses</option>
          <option value="PLACED">Placed</option>
          <option value="CONFIRMED">Confirmed</option>
          <option value="PROCESSING">Processing at Hub</option>
          <option value="DISPATCHED">Dispatched</option>
          <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
        </select>

        <div className="flex items-center gap-2">
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Payment Statuses</option>
            <option value="PAID">Paid</option>
            <option value="PENDING">Pending (COD / Verification)</option>
            <option value="FAILED">Failed</option>
          </select>

          <button
            onClick={loadOrders}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700 shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Order # & Date</th>
                <th className="py-3.5 px-4">Farmer / Customer</th>
                <th className="py-3.5 px-4">Items & Destination</th>
                <th className="py-3.5 px-4">Total Amount</th>
                <th className="py-3.5 px-4">Fulfillment Status</th>
                <th className="py-3.5 px-4">Payment</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No agri store orders matching the filter criteria.
                  </td>
                </tr>
              ) : (
                orders.map((o) => {
                  const statusConf = ORDER_STATUS_CONFIG[o.status] || {
                    label: o.status,
                    bg: 'bg-slate-800',
                    text: 'text-slate-300',
                    border: 'border-slate-700'
                  };

                  return (
                    <tr key={o.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Order # */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-white font-mono">{o.orderNumber}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          {new Date(o.createdAt).toLocaleString()}
                        </div>
                      </td>

                      {/* Farmer */}
                      <td className="py-3 px-4">
                        <div className="font-bold text-white">{o.farmerName}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 font-mono mt-0.5">
                          <Phone className="w-3 h-3 text-slate-500" />
                          {o.mobile}
                        </div>
                      </td>

                      {/* Items & Destination */}
                      <td className="py-3 px-4 max-w-[200px]">
                        <div className="font-medium text-slate-200">
                          {o.items?.length || 0} items ({o.items?.map((i: any) => i.productName).join(', ') || 'Agricultural Inputs'})
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5 truncate">
                          <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                          {o.deliveryAddress?.district}, {o.deliveryAddress?.state}
                        </div>
                      </td>

                      {/* Total */}
                      <td className="py-3 px-4 font-mono">
                        <div className="font-black text-emerald-400 text-sm">
                          ₹{o.grandTotal?.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          {o.paymentMethod || 'COD'}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${statusConf.bg} ${statusConf.text} ${statusConf.border}`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {statusConf.label}
                        </span>
                      </td>

                      {/* Payment */}
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            o.paymentStatus === 'PAID'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : o.paymentStatus === 'FAILED'
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {o.paymentStatus || 'PENDING'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleOpenDetail(o)}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs transition-colors"
                        >
                          View & Update
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail & Status Transition Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-8"
            >
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/80">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      Order #{selectedOrder.orderNumber}
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          ORDER_STATUS_CONFIG[selectedOrder.status]?.bg || 'bg-slate-800'
                        } ${ORDER_STATUS_CONFIG[selectedOrder.status]?.text || 'text-slate-300'}`}
                      >
                        {selectedOrder.status}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400">
                      Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
                {/* Farmer & Delivery Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-950 border border-slate-800 rounded-xl">
                  <div>
                    <div className="text-slate-400 font-semibold mb-1">Customer / Farmer Details</div>
                    <div className="font-bold text-white text-sm">{selectedOrder.farmerName}</div>
                    <div className="text-slate-300 mt-0.5">📞 {selectedOrder.mobile}</div>
                    <div className="text-slate-400 mt-1">
                      Recipient: {selectedOrder.deliveryAddress?.recipientName || selectedOrder.farmerName}
                    </div>
                  </div>

                  <div>
                    <div className="text-slate-400 font-semibold mb-1">Village Delivery Address</div>
                    <div className="text-slate-300 font-medium leading-relaxed">
                      {selectedOrder.deliveryAddress?.streetAddress}
                      {selectedOrder.deliveryAddress?.villageOrLocality && `, ${selectedOrder.deliveryAddress?.villageOrLocality}`}
                      <br />
                      {selectedOrder.deliveryAddress?.district}, {selectedOrder.deliveryAddress?.state} - {selectedOrder.deliveryAddress?.pincode}
                    </div>
                    {selectedOrder.deliveryAddress?.landmark && (
                      <div className="text-slate-500 mt-1 text-[11px]">
                        Landmark: {selectedOrder.deliveryAddress?.landmark}
                      </div>
                    )}
                  </div>
                </div>

                {/* Ordered Items List */}
                <div className="space-y-2">
                  <div className="text-slate-300 font-bold text-sm">Ordered Agricultural Inputs</div>
                  <div className="divide-y divide-slate-800/80 border border-slate-800 rounded-xl bg-slate-950/60 overflow-hidden">
                    {selectedOrder.items?.map((item: any, idx: number) => (
                      <div key={idx} className="p-3.5 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.imageUrl || 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=150&q=80'}
                            alt={item.productName}
                            className="w-10 h-10 rounded-lg object-cover bg-slate-800 shrink-0 border border-slate-700"
                          />
                          <div>
                            <div className="font-bold text-white">{item.productName}</div>
                            <div className="text-slate-400 text-[11px]">
                              ₹{item.unitPrice} × {item.quantity} {item.unit || 'units'}
                            </div>
                          </div>
                        </div>

                        <div className="font-bold text-emerald-400 font-mono text-sm">
                          ₹{item.lineTotal?.toLocaleString()}
                        </div>
                      </div>
                    ))}

                    <div className="p-3.5 bg-slate-950 flex flex-col gap-1 border-t border-slate-800">
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Subtotal:</span>
                        <span className="font-mono">₹{selectedOrder.subtotal?.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Delivery & Handling:</span>
                        <span className="font-mono">
                          {selectedOrder.deliveryCharge === 0 ? 'FREE' : `₹${selectedOrder.deliveryCharge}`}
                        </span>
                      </div>
                      {selectedOrder.discount > 0 && (
                        <div className="flex items-center justify-between text-emerald-400">
                          <span>Subsidy / Promo Discount:</span>
                          <span className="font-mono">-₹{selectedOrder.discount}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-white font-bold text-sm pt-2 border-t border-slate-800">
                        <span>Grand Total Payable:</span>
                        <span className="text-emerald-400 font-mono text-base">
                          ₹{selectedOrder.grandTotal?.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status Transition Form */}
                <form onSubmit={handleUpdateStatus} className="space-y-4 p-4 bg-slate-950 border border-slate-800 rounded-xl">
                  <div className="text-slate-200 font-bold">Fulfillment & Payment Workflow</div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-slate-400 font-semibold">Change Order Status</label>
                      <select
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                      >
                        <option value="PLACED">PLACED</option>
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="PROCESSING">PROCESSING (At Hub)</option>
                        <option value="DISPATCHED">DISPATCHED</option>
                        <option value="OUT_FOR_DELIVERY">OUT FOR DELIVERY</option>
                        <option value="DELIVERED">DELIVERED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-slate-400 font-semibold">Payment Status</label>
                      <select
                        value={newPaymentStatus}
                        onChange={(e) => setNewPaymentStatus(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                      >
                        <option value="PENDING">PENDING</option>
                        <option value="PAID">PAID</option>
                        <option value="FAILED">FAILED</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold">Internal Fulfillment / Dispatch Note</label>
                    <input
                      type="text"
                      value={internalNote}
                      onChange={(e) => setInternalNote(e.target.value)}
                      placeholder="e.g. Dispatched via Kisan Logistics Van #PB-10-8812"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={saving}
                      className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-2 disabled:opacity-50"
                    >
                      {saving && <RefreshCw className="w-4 h-4 animate-spin" />}
                      Save Order Changes
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
