import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Package, Search, Plus, Edit2, Trash2, Archive, RotateCcw, Copy,
  CheckCircle2, AlertTriangle, Filter, Sparkles, X, IndianRupee,
  Layers, Tag, Info, AlertCircle, RefreshCw
} from 'lucide-react';
import {
  fetchAdminProducts,
  fetchAdminCategories,
  createAdminProduct,
  updateAdminProduct,
  archiveAdminProduct,
  restoreAdminProduct,
  duplicateAdminProduct,
  deleteAdminProduct,
  AdminProductFilter
} from '../../services/adminService';

export const AdminStoreProductsManager: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'in_stock' | 'low_stock' | 'out_of_stock' | 'archived'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'stock' | 'newest'>('newest');

  // Modal / Form state
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [formData, setFormData] = useState<any>({
    name: '',
    categoryId: 'seeds',
    price: '',
    originalPrice: '',
    unit: '1 kg',
    stockQuantity: 50,
    lowStockThreshold: 10,
    sku: '',
    manufacturer: '',
    gstRatePercent: 5,
    imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80',
    description: '',
    agriculturalUse: '',
    cropCompatibility: 'Wheat, Paddy, All Crops',
    activeIngredients: '',
    dosageInstructions: '',
    safetyInformation: '',
    isFeatured: false,
    isRecommended: false
  });
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        fetchAdminProducts({
          search,
          categoryId: selectedCategory,
          status: statusFilter,
          sortBy
        }),
        fetchAdminCategories()
      ]);
      setProducts(prodRes.products || []);
      setTotalCount(prodRes.total || 0);
      setCategories(catRes || []);
    } catch (err: any) {
      console.error('Failed to load admin products:', err);
      setFeedback({ type: 'error', message: err.message || 'Failed to load catalog.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCategory, statusFilter, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      categoryId: categories[0]?.id || 'seeds',
      price: '',
      originalPrice: '',
      unit: '1 kg',
      stockQuantity: 50,
      lowStockThreshold: 10,
      sku: `SKU-${Date.now().toString().slice(-6)}`,
      manufacturer: 'CroperX Certified Agro',
      gstRatePercent: 5,
      imageUrl: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80',
      description: '',
      agriculturalUse: '',
      cropCompatibility: 'All Crops',
      activeIngredients: '',
      dosageInstructions: '',
      safetyInformation: '',
      isFeatured: false,
      isRecommended: false
    });
    setShowModal(true);
  };

  const handleOpenEdit = (p: any) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      categoryId: p.categoryId,
      price: p.price,
      originalPrice: p.originalPrice || '',
      unit: p.unit,
      stockQuantity: p.stockQuantity,
      lowStockThreshold: p.lowStockThreshold || 10,
      sku: p.sku || '',
      manufacturer: p.manufacturer || '',
      gstRatePercent: p.gstRatePercent !== undefined ? p.gstRatePercent : 5,
      imageUrl: p.imageUrl,
      description: p.description || '',
      agriculturalUse: p.agriculturalUse || '',
      cropCompatibility: Array.isArray(p.cropCompatibility) ? p.cropCompatibility.join(', ') : p.cropCompatibility,
      activeIngredients: p.activeIngredients || '',
      dosageInstructions: p.dosageInstructions || '',
      safetyInformation: p.safetyInformation || '',
      isFeatured: !!p.isFeatured,
      isRecommended: !!p.isRecommended
    });
    setShowModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.categoryId) {
      setFeedback({ type: 'error', message: 'Name, Category, and Price are required.' });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
        stockQuantity: Number(formData.stockQuantity) || 0,
        lowStockThreshold: Number(formData.lowStockThreshold) || 10,
        gstRatePercent: Number(formData.gstRatePercent) || 0,
        cropCompatibility: formData.cropCompatibility.split(',').map((s: string) => s.trim()).filter(Boolean)
      };

      if (editingProduct) {
        await updateAdminProduct(editingProduct.id, payload);
        setFeedback({ type: 'success', message: `Product "${formData.name}" updated successfully.` });
      } else {
        await createAdminProduct(payload);
        setFeedback({ type: 'success', message: `Product "${formData.name}" added to catalog.` });
      }

      setShowModal(false);
      loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to save product.' });
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async (id: string, name: string) => {
    try {
      await archiveAdminProduct(id);
      setFeedback({ type: 'success', message: `"${name}" archived.` });
      loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Archive failed.' });
    }
  };

  const handleRestore = async (id: string, name: string) => {
    try {
      await restoreAdminProduct(id);
      setFeedback({ type: 'success', message: `"${name}" restored to active catalog.` });
      loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Restore failed.' });
    }
  };

  const handleDuplicate = async (id: string) => {
    try {
      await duplicateAdminProduct(id);
      setFeedback({ type: 'success', message: 'Product duplicated successfully.' });
      loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Duplicate failed.' });
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? If it has prior order history, it will be archived instead.`)) return;
    try {
      const res = await deleteAdminProduct(id);
      setFeedback({ type: 'success', message: res.message || 'Product removed.' });
      loadData();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Delete failed.' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              Agri Store Product Catalog
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                {totalCount} Total Items
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Manage certified seed lots, NPK fertilizers, bio-protection formulations, tools & irrigation equipment
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadData}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
            title="Refresh Catalog"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold shadow-lg shadow-emerald-900/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add New Product
          </button>
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

      {/* Search & Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4 bg-slate-900/80 border border-slate-800 rounded-2xl">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, SKU, crop..."
            className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </form>

        {/* Category Filter */}
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Stock Status Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Statuses</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">⚠️ Low Stock Alert</option>
            <option value="out_of_stock">❌ Out of Stock</option>
            <option value="archived">📦 Archived</option>
          </select>
        </div>

        {/* Sort By */}
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
          >
            <option value="newest">Sort: Newest First</option>
            <option value="price">Sort: Price</option>
            <option value="stock">Sort: Stock Quantity</option>
            <option value="name">Sort: Product Name</option>
          </select>
        </div>
      </div>

      {/* Product Table / Cards */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Product Info</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Price & GST</th>
                <th className="py-3.5 px-4">Stock Level</th>
                <th className="py-3.5 px-4">Agronomic Specs</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-500" />
                    Loading products...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No products found matching your search and filter criteria.
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const isLow = p.stockQuantity > 0 && p.stockQuantity <= (p.lowStockThreshold || 10);
                  const isOut = p.stockQuantity <= 0;

                  return (
                    <tr key={p.id} className={`hover:bg-slate-800/40 transition-colors ${p.isArchived ? 'opacity-60 bg-slate-950/40' : ''}`}>
                      {/* Product Info */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-700 bg-slate-800 shrink-0"
                          />
                          <div>
                            <div className="font-bold text-white flex items-center gap-1.5">
                              {p.name}
                              {p.isFeatured && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                  Featured
                                </span>
                              )}
                              {p.isArchived && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                                  Archived
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                              <span className="font-mono text-slate-500">{p.sku || 'NO-SKU'}</span>
                              <span>•</span>
                              <span>{p.manufacturer || 'CroperX Certified'}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-[11px] font-medium">
                          <span>{p.categoryIcon || '🌾'}</span>
                          <span>{p.categoryName || p.categoryId}</span>
                        </span>
                      </td>

                      {/* Price & GST */}
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-bold text-emerald-400 text-sm flex items-center">
                            <IndianRupee className="w-3.5 h-3.5" />
                            {p.price}
                            <span className="text-[11px] text-slate-400 font-normal ml-1">/ {p.unit}</span>
                          </div>
                          {p.originalPrice && p.originalPrice > p.price && (
                            <div className="text-[10px] text-slate-500 line-through">
                              MRP ₹{p.originalPrice}
                            </div>
                          )}
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            GST: {p.gstRatePercent !== undefined ? p.gstRatePercent : 5}%
                          </div>
                        </div>
                      </td>

                      {/* Stock Level */}
                      <td className="py-3 px-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                isOut ? 'bg-red-500 animate-pulse' : isLow ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
                              }`}
                            />
                            <span className="font-bold text-white">
                              {p.stockQuantity} {p.unit?.split(' ')?.[1] || 'units'}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-0.5">
                            {isOut ? (
                              <span className="text-red-400 font-semibold">Out of Stock</span>
                            ) : isLow ? (
                              <span className="text-amber-400 font-semibold">Low Stock (Threshold: {p.lowStockThreshold || 10})</span>
                            ) : (
                              <span className="text-emerald-400">Healthy Buffer</span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Agronomic Specs */}
                      <td className="py-3 px-4 max-w-[200px]">
                        <div className="truncate text-slate-300 text-[11px]" title={p.cropCompatibility?.join(', ')}>
                          <span className="text-slate-500">Crops: </span>
                          {p.cropCompatibility?.join(', ') || 'All Crops'}
                        </div>
                        {p.activeIngredients && (
                          <div className="truncate text-[10px] text-slate-400 mt-0.5" title={p.activeIngredients}>
                            <span className="text-slate-500">Active: </span>
                            {p.activeIngredients}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                            title="Edit Product"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDuplicate(p.id)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                            title="Duplicate Product"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                          {p.isArchived ? (
                            <button
                              onClick={() => handleRestore(p.id, p.name)}
                              className="p-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-700/50 text-emerald-400 transition-colors"
                              title="Restore to Active"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleArchive(p.id, p.name)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-amber-950/60 hover:border-amber-700/50 text-slate-400 hover:text-amber-300 transition-colors"
                              title="Archive Product"
                            >
                              <Archive className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(p.id, p.name)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-950/60 hover:border-red-700/50 text-slate-400 hover:text-red-400 transition-colors"
                            title="Delete Product"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Product Create / Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-8"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/80">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Package className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-bold text-white">
                    {editingProduct ? `Edit Product: ${editingProduct.name}` : 'Add New Agricultural Product'}
                  </h3>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-slate-300 font-semibold">Product Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Pusa Gautami HD-3086 Certified Wheat Seed"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Category */}
                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold">Category *</label>
                    <select
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.icon} {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* SKU */}
                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold">SKU / Batch Code</label>
                    <input
                      type="text"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      placeholder="e.g. SEED-WHT-3086"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>

                  {/* Price */}
                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold">Selling Price (₹) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      placeholder="e.g. 680"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Original Price */}
                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold">Original / MRP (₹)</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.originalPrice}
                      onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                      placeholder="e.g. 750"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Unit */}
                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold">Packaging Unit</label>
                    <input
                      type="text"
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      placeholder="e.g. 40 kg Bag, 1 Litre Bottle, 1 Set"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Stock Quantity */}
                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold">Initial Stock Quantity</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.stockQuantity}
                      onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Low Stock Threshold */}
                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold">Low Stock Threshold Warning</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.lowStockThreshold}
                      onChange={(e) => setFormData({ ...formData, lowStockThreshold: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* GST Rate */}
                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold">GST Rate (%)</label>
                    <select
                      value={formData.gstRatePercent}
                      onChange={(e) => setFormData({ ...formData, gstRatePercent: Number(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="0">0% (Exempt / Certified Seeds)</option>
                      <option value="5">5% (Fertilizers & Bio-fertilizers)</option>
                      <option value="12">12% (Pesticides & Bio-Pesticides)</option>
                      <option value="18">18% (Agricultural Machinery & Sprayers)</option>
                    </select>
                  </div>

                  {/* Image URL */}
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-slate-300 font-semibold">Product Image URL</label>
                    <input
                      type="url"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Crop Compatibility */}
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-slate-300 font-semibold">Crop Compatibility (Comma Separated)</label>
                    <input
                      type="text"
                      value={formData.cropCompatibility}
                      onChange={(e) => setFormData({ ...formData, cropCompatibility: e.target.value })}
                      placeholder="Wheat, Paddy, Mustard, All Crops"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Description */}
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-slate-300 font-semibold">Product Description</label>
                    <textarea
                      rows={2}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="High-yielding rust-resistant certified seed lot..."
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Agricultural Use */}
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-slate-300 font-semibold">Agricultural Application / Use Case</label>
                    <input
                      type="text"
                      value={formData.agriculturalUse}
                      onChange={(e) => setFormData({ ...formData, agriculturalUse: e.target.value })}
                      placeholder="Sowing during Rabi season for maximum tillering"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Active Ingredients */}
                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold">Active Ingredients</label>
                    <input
                      type="text"
                      value={formData.activeIngredients}
                      onChange={(e) => setFormData({ ...formData, activeIngredients: e.target.value })}
                      placeholder="e.g. Azadirachtin 10,000 PPM"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Dosage Instructions */}
                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold">Dosage & Spray Guidelines</label>
                    <input
                      type="text"
                      value={formData.dosageInstructions}
                      onChange={(e) => setFormData({ ...formData, dosageInstructions: e.target.value })}
                      placeholder="e.g. 2.5 ml per litre of water"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Toggles */}
                <div className="flex items-center gap-6 pt-2 border-t border-slate-800">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-800 bg-slate-950"
                    />
                    <span className="text-slate-300 font-medium">Mark as Featured</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isRecommended}
                      onChange={(e) => setFormData({ ...formData, isRecommended: e.target.checked })}
                      className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-800 bg-slate-950"
                    />
                    <span className="text-slate-300 font-medium">AI Smart Recommend</span>
                  </label>
                </div>

                {/* Submit button */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
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
                    {editingProduct ? 'Update Product' : 'Create Product'}
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
