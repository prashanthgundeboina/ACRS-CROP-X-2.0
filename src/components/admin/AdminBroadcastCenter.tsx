import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Megaphone, Send, Clock, Users, ShieldAlert, CheckCircle2,
  AlertTriangle, RefreshCw, X, Trash2, Calendar, Filter, Sparkles,
  Radio, Globe
} from 'lucide-react';
import {
  fetchAdminNotifications,
  createAdminNotification,
  sendAdminNotification,
  deleteAdminNotification
} from '../../services/adminService';

export const AdminBroadcastCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<any>({
    title: '',
    message: '',
    type: 'ALERT',
    targetAudience: 'ALL_FARMERS',
    priority: 'HIGH',
    channels: ['IN_APP', 'SMS'],
    targetRegion: '',
    targetCrop: '',
    targetLanguage: '',
    scheduledFor: ''
  });
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminNotifications();
      setNotifications(data || []);
    } catch (err: any) {
      console.error('Failed to load notifications:', err);
      setFeedback({ type: 'error', message: err.message || 'Failed to load notifications.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleOpenCreate = () => {
    setFormData({
      title: '',
      message: '',
      type: 'ALERT',
      targetAudience: 'ALL_FARMERS',
      priority: 'HIGH',
      channels: ['IN_APP', 'SMS'],
      targetRegion: '',
      targetCrop: '',
      targetLanguage: '',
      scheduledFor: ''
    });
    setShowModal(true);
  };

  const handleToggleChannel = (channel: string) => {
    const current = formData.channels || [];
    if (current.includes(channel)) {
      if (current.length === 1) return; // Keep at least one channel
      setFormData({ ...formData, channels: current.filter((c: string) => c !== channel) });
    } else {
      setFormData({ ...formData, channels: [...current, channel] });
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.message.trim()) {
      setFeedback({ type: 'error', message: 'Title and broadcast message are required.' });
      return;
    }

    setSaving(true);
    try {
      await createAdminNotification(formData);
      setFeedback({ type: 'success', message: `Broadcast "${formData.title}" created successfully.` });
      setShowModal(false);
      loadNotifications();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to create broadcast.' });
    } finally {
      setSaving(false);
    }
  };

  const handleSendNow = async (id: string, title: string) => {
    try {
      await sendAdminNotification(id);
      setFeedback({ type: 'success', message: `Broadcast "${title}" dispatched immediately.` });
      loadNotifications();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to send broadcast.' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this notification record?')) return;
    try {
      await deleteAdminNotification(id);
      setFeedback({ type: 'success', message: 'Notification record removed.' });
      loadNotifications();
    } catch (err: any) {
      setFeedback({ type: 'error', message: err.message || 'Failed to delete.' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Megaphone className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              Broadcast & Notification Engine
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-amber-500/20 text-amber-400 border border-amber-500/30">
                {notifications.length} Broadcast Records
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Dispatch multi-channel advisories, weather warnings, pest alarms, and subsidy updates across India
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={loadNotifications}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700"
            title="Refresh Broadcasts"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-sm font-bold shadow-lg shadow-amber-900/30 transition-all"
          >
            <Send className="w-4 h-4" />
            New Broadcast
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

      {/* Broadcast History Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Broadcast Title & Details</th>
                <th className="py-3.5 px-4">Target Audience</th>
                <th className="py-3.5 px-4">Priority & Channels</th>
                <th className="py-3.5 px-4">Delivery Status</th>
                <th className="py-3.5 px-4">Recipient Count</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {notifications.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No broadcast notifications created yet.
                  </td>
                </tr>
              ) : (
                notifications.map((n) => (
                  <tr key={n.id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Title & Message */}
                    <td className="py-3.5 px-4 max-w-[280px]">
                      <div className="font-bold text-white text-sm">{n.title}</div>
                      <div className="text-slate-400 text-xs mt-1 line-clamp-2">{n.message}</div>
                      <div className="text-[10px] text-slate-500 font-mono mt-1">
                        Created by {n.createdBy || 'Admin'} • {new Date(n.createdAt).toLocaleString()}
                      </div>
                    </td>

                    {/* Audience */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-200">
                        <Users className="w-3.5 h-3.5 text-amber-400" />
                        {n.targetAudience}
                      </div>
                      {n.targetRegion && (
                        <div className="text-[10px] text-slate-400 mt-0.5">Region: {n.targetRegion}</div>
                      )}
                      {n.targetCrop && (
                        <div className="text-[10px] text-slate-400 mt-0.5">Crop: {n.targetCrop}</div>
                      )}
                    </td>

                    {/* Priority & Channels */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                          n.priority === 'CRITICAL' || n.priority === 'URGENT'
                            ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                            : n.priority === 'HIGH'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        }`}
                      >
                        {n.priority}
                      </span>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {n.channels?.map((ch: string) => (
                          <span key={ch} className="px-1.5 py-0.5 rounded text-[9px] bg-slate-800 text-slate-300 border border-slate-700">
                            {ch}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      {n.status === 'SENT' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          <CheckCircle2 className="w-3 h-3" />
                          Sent at {new Date(n.sentAt || n.updatedAt).toLocaleTimeString()}
                        </span>
                      ) : n.status === 'SCHEDULED' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          <Clock className="w-3 h-3" />
                          Scheduled for {new Date(n.scheduledFor).toLocaleDateString()}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                          Draft
                        </span>
                      )}
                    </td>

                    {/* Recipients */}
                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      {n.recipientsCount ? n.recipientsCount.toLocaleString() : 'All Active'}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {n.status !== 'SENT' && (
                          <button
                            onClick={() => handleSendNow(n.id, n.title)}
                            className="px-2.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white text-xs font-bold border border-emerald-500/30 transition-all flex items-center gap-1"
                          >
                            <Send className="w-3 h-3" />
                            Send Now
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(n.id)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-950/60 hover:border-red-700/50 text-slate-400 hover:text-red-400 transition-colors"
                          title="Delete Broadcast"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Broadcast Creation Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-8"
            >
              <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/80">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Megaphone className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-white">Create New Advisory Broadcast</h3>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
                {/* Title */}
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Broadcast Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Yellow Rust Early Warning - Malwa Belt"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Message */}
                <div className="space-y-1">
                  <label className="text-slate-300 font-semibold">Broadcast Message *</label>
                  <textarea
                    rows={3}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Provide actionable advisory, spraying instructions or weather alert details..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                {/* Grid for Audience & Priority */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold">Target Audience</label>
                    <select
                      value={formData.targetAudience}
                      onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="ALL_USERS">All Users (Farmers + Advisers)</option>
                      <option value="ALL_FARMERS">All Registered Farmers</option>
                      <option value="ALL_ADVISERS">Certified Advisers Only</option>
                      <option value="REGION_SPECIFIC">Region Specific</option>
                      <option value="CROP_SPECIFIC">Crop Specific</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-300 font-semibold">Priority Level</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="NORMAL">NORMAL (General Update)</option>
                      <option value="HIGH">HIGH (Advisory Notice)</option>
                      <option value="URGENT">URGENT (Pest / Weather Alert)</option>
                      <option value="CRITICAL">CRITICAL (Emergency / Disaster)</option>
                    </select>
                  </div>
                </div>

                {/* Targeting Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold">Target Region / State</label>
                    <input
                      type="text"
                      value={formData.targetRegion}
                      onChange={(e) => setFormData({ ...formData, targetRegion: e.target.value })}
                      placeholder="e.g. Punjab, Haryana"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold">Target Crop</label>
                    <input
                      type="text"
                      value={formData.targetCrop}
                      onChange={(e) => setFormData({ ...formData, targetCrop: e.target.value })}
                      placeholder="e.g. Wheat, Cotton"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-slate-400 font-semibold">Target Language</label>
                    <select
                      value={formData.targetLanguage}
                      onChange={(e) => setFormData({ ...formData, targetLanguage: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    >
                      <option value="">All Languages</option>
                      <option value="hi">Hindi (हिंदी)</option>
                      <option value="pa">Punjabi (ਪੰਜਾਬੀ)</option>
                      <option value="te">Telugu (తెలుగు)</option>
                      <option value="ta">Tamil (தமிழ்)</option>
                      <option value="mr">Marathi (मराठी)</option>
                      <option value="bn">Bengali (বাংলা)</option>
                      <option value="kn">Kannada (ಕನ್ನಡ)</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                </div>

                {/* Multi-Channel Checklist */}
                <div className="space-y-1.5 pt-2">
                  <label className="text-slate-300 font-semibold">Delivery Channels</label>
                  <div className="flex flex-wrap gap-2">
                    {['IN_APP', 'SMS', 'PUSH', 'WHATSAPP'].map((ch) => {
                      const isSelected = formData.channels?.includes(ch);
                      return (
                        <button
                          key={ch}
                          type="button"
                          onClick={() => handleToggleChannel(ch)}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all ${
                            isSelected
                              ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          {ch === 'IN_APP' && '📱 In-App Notification'}
                          {ch === 'SMS' && '💬 SMS Gateway'}
                          {ch === 'PUSH' && '🔔 Web Push'}
                          {ch === 'WHATSAPP' && '🟢 WhatsApp Bot'}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Submit */}
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
                    className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold flex items-center gap-2 disabled:opacity-50"
                  >
                    {saving && <RefreshCw className="w-4 h-4 animate-spin" />}
                    Create & Dispatch Broadcast
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
