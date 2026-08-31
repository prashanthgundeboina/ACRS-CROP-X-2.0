import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Siren, AlertTriangle, ShieldAlert, Plus, CheckCircle2,
  RefreshCw, X, Radio, MapPin, Calendar, Users
} from 'lucide-react';
import {
  fetchAdminAlerts,
  createAdminAlert
} from '../../services/adminService';

export const AdminOperationalAlertsManager: React.FC = () => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<any>({
    title: '',
    description: '',
    severity: 'HIGH',
    category: 'WEATHER',
    targetRegion: 'All Northern States',
    affectedCrops: 'Wheat, Mustard',
    advisoryAction: 'Apply recommended fungicide before precipitation onset'
  });
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadAlerts = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminAlerts();
      setAlerts(data || []);
    } catch (err: any) {
      console.error('Failed to load alerts:', err);
      setFeedback({ type: 'error', message: err.message || 'Failed to load operational alerts.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim()) {
      setFeedback({ type: 'error', message: 'Alert title and description are required.' });
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        affectedCrops: formData.affectedCrops.split(',').map((c: string) => c.trim()).filter(Boolean)
      };

      await createAdminAlert(payload);
      setFeedback({ type: 'success', message: `High priority alert "${formData.title}" published.` });
      setShowModal(false);
      loadAlerts();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to create alert.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
            <Siren className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              Operational Emergency Alerts & Early Warnings
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-red-500/20 text-red-400 border border-red-500/30">
                {alerts.filter(a => a.isActive !== false).length} Active Alerts
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Broadcast top-level hazard banners for severe storms, pest outbreaks, canal maintenance, and frost advisories
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadAlerts}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
            title="Refresh Alerts"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-bold shadow-lg shadow-red-900/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            Issue Alert
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

      {/* Alerts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {alerts.map((a) => (
          <div
            key={a.id}
            className={`p-5 rounded-2xl bg-slate-900 border transition-all ${
              a.severity === 'CRITICAL' || a.severity === 'URGENT'
                ? 'border-red-500/40 bg-red-950/10'
                : a.severity === 'HIGH'
                ? 'border-amber-500/40 bg-amber-950/10'
                : 'border-slate-800'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                    a.severity === 'CRITICAL'
                      ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                      : a.severity === 'HIGH'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                      : 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                  }`}
                >
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base leading-tight">{a.title}</h3>
                  <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                    Category: {a.category} • Severity: {a.severity}
                  </div>
                </div>
              </div>

              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ACTIVE
              </span>
            </div>

            <p className="text-xs text-slate-300 mt-3 leading-relaxed">
              {a.description}
            </p>

            {a.advisoryAction && (
              <div className="mt-3 p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                <span className="text-emerald-400 font-semibold">Recommended Action: </span>
                <span className="text-slate-300">{a.advisoryAction}</span>
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-medium">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-slate-400" />
                {a.targetRegion || 'All Zones'}
              </span>
              <span className="font-mono text-slate-400">
                {new Date(a.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Alert Create Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden my-8"
            >
              <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/80">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400">
                    <Siren className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-white">Publish Early Warning Alert</h3>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="p-6 space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Alert Headline *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Severe Thermal Stress & Aphid Alert"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold">Severity</label>
                    <select
                      value={formData.severity}
                      onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500"
                    >
                      <option value="NORMAL">NORMAL</option>
                      <option value="HIGH">HIGH (Advisory)</option>
                      <option value="URGENT">URGENT (Action Req.)</option>
                      <option value="CRITICAL">CRITICAL (Emergency)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500"
                    >
                      <option value="WEATHER">Weather & Climate</option>
                      <option value="PEST">Pest Outbreak</option>
                      <option value="DISEASE">Crop Disease / Rust</option>
                      <option value="MARKET">Market / MSP Alert</option>
                      <option value="INFRASTRUCTURE">Canal / Irrigation Notice</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Affected Region / Districts</label>
                  <input
                    type="text"
                    value={formData.targetRegion}
                    onChange={(e) => setFormData({ ...formData, targetRegion: e.target.value })}
                    placeholder="e.g. Punjab (Ludhiana, Sangrur, Patiala)"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Alert Description & Details *</label>
                  <textarea
                    rows={3}
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Detail the meteorological or biological risk factors..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Recommended Farm Action</label>
                  <input
                    type="text"
                    value={formData.advisoryAction}
                    onChange={(e) => setFormData({ ...formData, advisoryAction: e.target.value })}
                    placeholder="e.g. Apply light irrigation in evening hours to buffer rootzone"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-red-500"
                  />
                </div>

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
                    className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold flex items-center gap-2 disabled:opacity-50"
                  >
                    {saving && <RefreshCw className="w-4 h-4 animate-spin" />}
                    Broadcast Live Alert
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
