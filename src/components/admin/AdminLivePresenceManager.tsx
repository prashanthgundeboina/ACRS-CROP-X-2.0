import React, { useState, useEffect } from 'react';
import {
  Users, Radio, Siren, MapPin, PhoneCall, ShieldCheck,
  RefreshCw, CheckCircle2, AlertTriangle, Activity, Search,
  Compass, Eye, Clock, Shield, Sparkles, Filter
} from 'lucide-react';
import { presenceService } from '../../services/presenceService';
import { UserLivePresence, EmergencyIncident } from '../../types';
import { LivePresenceMap } from '../common/LivePresenceMap';

export const AdminLivePresenceManager: React.FC = () => {
  const [users, setUsers] = useState<UserLivePresence[]>([]);
  const [emergencies, setEmergencies] = useState<EmergencyIncident[]>([]);
  const [activeTab, setActiveTab] = useState<'map' | 'table' | 'emergencies'>('map');
  const [roleFilter, setRoleFilter] = useState<'all' | 'farmer' | 'farmer_adviser' | 'emergency' | 'in_consultation'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [resolutionModal, setResolutionModal] = useState<EmergencyIncident | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState<string>('');

  useEffect(() => {
    fetchData();

    const unsubPresence = presenceService.onPresenceChange((list) => {
      setUsers(list);
    });

    const unsubEmergencies = presenceService.onEmergencyChange((list) => {
      setEmergencies(list);
    });

    return () => {
      unsubPresence();
      unsubEmergencies();
    };
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [uList, eList] = await Promise.all([
        presenceService.fetchLivePresence(),
        presenceService.fetchActiveEmergencies()
      ]);
      setUsers(uList);
      setEmergencies(eList);
    } catch (err) {
      console.warn('Admin presence fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResolveEmergency = async () => {
    if (!resolutionModal) return;
    await presenceService.resolveEmergency(
      resolutionModal.id,
      'System Administrator',
      resolutionNotes || 'Emergency incident verified and resolved by Administrator.'
    );
    setResolutionModal(null);
    setResolutionNotes('');
    fetchData();
  };

  const activeFarmersCount = users.filter(u => u.role === 'farmer' && u.state !== 'offline').length;
  const activeAdvisersCount = users.filter(u => u.role === 'farmer_adviser' && u.state !== 'offline').length;
  const inConsultationCount = users.filter(u => u.state === 'in_consultation').length;
  const activeEmergencies = emergencies.filter(e => e.status !== 'Resolved');

  const filteredUsers = users.filter((u) => {
    if (roleFilter === 'farmer' && u.role !== 'farmer') return false;
    if (roleFilter === 'farmer_adviser' && u.role !== 'farmer_adviser') return false;
    if (roleFilter === 'emergency' && u.state !== 'emergency') return false;
    if (roleFilter === 'in_consultation' && u.state !== 'in_consultation') return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        u.name.toLowerCase().includes(q) ||
        u.phoneNumber.toLowerCase().includes(q) ||
        (u.crop && u.crop.toLowerCase().includes(q)) ||
        (u.farmName && u.farmName.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* Header & Telemetry Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Online Farmers</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
          </div>
          <p className="text-2xl font-black text-white mt-2">{activeFarmersCount}</p>
          <p className="text-[11px] text-emerald-400 mt-1">Live field GPS heartbeats active</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Available Advisers</span>
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white mt-2">{activeAdvisersCount}</p>
          <p className="text-[11px] text-sky-400 mt-1">Certified for WebRTC video consult</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">In Consultations</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <PhoneCall className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white mt-2">{inConsultationCount}</p>
          <p className="text-[11px] text-purple-400 mt-1">Active video audio bridges</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-red-500/40 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-red-400 uppercase tracking-wider">Emergency Incidents</span>
            <div className="p-2 rounded-xl bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse">
              <Siren className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-red-400 mt-2">{activeEmergencies.length}</p>
          <p className="text-[11px] text-red-300 mt-1">Requiring immediate response</p>
        </div>
      </div>

      {/* Main View Mode Selector */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-3">
        <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('map')}
            className={`px-4 py-2 rounded-lg font-bold transition flex items-center gap-2 ${
              activeTab === 'map' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Compass className="w-4 h-4" />
            Live National Map
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('table')}
            className={`px-4 py-2 rounded-lg font-bold transition flex items-center gap-2 ${
              activeTab === 'table' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            Presence Grid ({users.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('emergencies')}
            className={`px-4 py-2 rounded-lg font-bold transition flex items-center gap-2 ${
              activeTab === 'emergencies' ? 'bg-red-600 text-white shadow' : 'text-red-400 hover:text-red-300'
            }`}
          >
            <Siren className="w-4 h-4" />
            Emergency SOS Network ({activeEmergencies.length})
          </button>
        </div>

        <button
          type="button"
          onClick={fetchData}
          disabled={isLoading}
          className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-2 border border-slate-700 transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
          Refresh Live Network
        </button>
      </div>

      {/* TAB 1: LIVE MAP */}
      {activeTab === 'map' && (
        <div className="space-y-4">
          <LivePresenceMap userLat={28.6139} userLon={77.2090} />
        </div>
      )}

      {/* TAB 2: LIVE PRESENCE GRID */}
      {activeTab === 'table' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setRoleFilter('all')}
                className={`px-3 py-1 rounded-lg font-bold transition ${
                  roleFilter === 'all' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setRoleFilter('farmer')}
                className={`px-3 py-1 rounded-lg font-bold transition ${
                  roleFilter === 'farmer' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Farmers
              </button>
              <button
                type="button"
                onClick={() => setRoleFilter('farmer_adviser')}
                className={`px-3 py-1 rounded-lg font-bold transition ${
                  roleFilter === 'farmer_adviser' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Advisers
              </button>
              <button
                type="button"
                onClick={() => setRoleFilter('in_consultation')}
                className={`px-3 py-1 rounded-lg font-bold transition ${
                  roleFilter === 'in_consultation' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                In Call
              </button>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search live users..."
                className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-56"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3.5">User</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5">State</th>
                  <th className="p-3.5">GPS / Farm Telemetry</th>
                  <th className="p-3.5">Trust & Liveness</th>
                  <th className="p-3.5">Last Heartbeat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredUsers.map((u) => (
                  <tr key={u.userId} className="hover:bg-slate-800/30 transition">
                    <td className="p-3.5">
                      <div className="flex items-center gap-3">
                        <img
                          src={u.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80'}
                          alt={u.name}
                          className="w-8 h-8 rounded-lg object-cover border border-slate-700"
                        />
                        <div>
                          <p className="font-bold text-white">{u.name}</p>
                          <p className="text-[11px] font-mono text-slate-400">{u.phoneNumber}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        u.role === 'farmer_adviser' ? 'bg-sky-500/20 text-sky-300' : 'bg-emerald-500/20 text-emerald-300'
                      }`}>
                        {u.role === 'farmer_adviser' ? 'Adviser' : 'Farmer'}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        u.state === 'emergency'
                          ? 'bg-red-500 text-white animate-pulse'
                          : u.state === 'in_consultation'
                          ? 'bg-purple-500/20 text-purple-300'
                          : u.state === 'online'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {u.state}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <div className="space-y-0.5">
                        <p className="text-white font-medium">{u.farmName || u.organization || 'Field Grid'}</p>
                        {u.latitude && u.longitude ? (
                          <p className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-emerald-400" />
                            {u.latitude.toFixed(4)}°N, {u.longitude.toFixed(4)}°E
                          </p>
                        ) : (
                          <p className="text-[11px] text-slate-500">Location Hidden</p>
                        )}
                      </div>
                    </td>
                    <td className="p-3.5">
                      {u.verifiedLiveness ? (
                        <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 text-[10px] font-bold flex items-center gap-1 w-fit">
                          <ShieldCheck className="w-3 h-3 text-teal-400" /> Verified
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-500">Standard</span>
                      )}
                    </td>
                    <td className="p-3.5 font-mono text-slate-400">
                      {Math.max(1, Math.round((Date.now() - u.lastHeartbeat) / 1000))}s ago
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: EMERGENCY INCIDENTS */}
      {activeTab === 'emergencies' && (
        <div className="space-y-4">
          {emergencies.length === 0 ? (
            <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
              <h4 className="font-bold text-white text-base">No Active Emergencies</h4>
              <p className="text-xs text-slate-400 mt-1">All agricultural emergency alerts are triaged and resolved.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {emergencies.map((inc) => (
                <div
                  key={inc.id}
                  className="p-4 rounded-2xl bg-slate-900 border border-red-500/40 shadow-xl flex items-start justify-between gap-4 flex-wrap"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-600 text-white uppercase">
                        {inc.status}
                      </span>
                      <span className="font-mono text-xs text-red-300">#{inc.id}</span>
                      <span className="font-bold text-white">{inc.farmerName}</span>
                      <span className="text-xs text-slate-400 font-mono">({inc.farmerPhone})</span>
                    </div>

                    <p className="text-sm font-semibold text-red-100">{inc.description}</p>

                    <div className="flex items-center gap-4 text-xs text-slate-300 flex-wrap">
                      <span>🌾 <strong>Crop:</strong> {inc.crop}</span>
                      <span>📍 <strong>Location:</strong> {inc.farmName} ({inc.latitude.toFixed(4)}, {inc.longitude.toFixed(4)})</span>
                      <span>⏱️ <strong>Triggered:</strong> {new Date(inc.triggeredAt).toLocaleString()}</span>
                      {inc.assignedAdviserName && (
                        <span>👨‍🌾 <strong>Assigned Adviser:</strong> {inc.assignedAdviserName}</span>
                      )}
                    </div>
                  </div>

                  {inc.status !== 'Resolved' && (
                    <button
                      type="button"
                      onClick={() => setResolutionModal(inc)}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 transition"
                    >
                      Admin Resolve
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Resolution Notes Modal */}
      {resolutionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              Resolve Emergency #{resolutionModal.id.slice(-6)}
            </h4>
            <textarea
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="Provide admin resolution details..."
              rows={3}
              className="w-full px-3 py-2 text-xs bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
            <div className="flex gap-2.5 justify-end">
              <button
                type="button"
                onClick={() => setResolutionModal(null)}
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResolveEmergency}
                className="px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition"
              >
                Confirm Resolution
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
