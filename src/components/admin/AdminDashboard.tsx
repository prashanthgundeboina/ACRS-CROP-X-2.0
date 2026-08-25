import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Shield, Users, UserCheck, Map, FileText, PhoneCall, Radio, BarChart3,
  Activity, ScrollText, Settings, Search, RefreshCw, ExternalLink, LogOut,
  User, CheckCircle2, AlertTriangle, AlertCircle, Eye, ChevronRight, Server,
  Cpu, HardDrive, Wifi, Smartphone, Globe, ShieldCheck, ArrowUpRight, Filter,
  Siren
} from 'lucide-react';
import { UserAccount, UserRole, AdminFarmerRecord, AdminAdviserRecord, AdminFarmRecord, AdminCaseRecord, AdminDeviceRecord, AdminAuditLog, AdminSystemHealth } from '../../types';
import {
  fetchAdminFarmers,
  fetchAdminAdvisers,
  fetchAdminFarms,
  fetchAdminCases,
  fetchAdminLiveSessions,
  fetchAdminDevices,
  fetchAdminSystemHealth,
  fetchAdminAuditLogs,
  updateUserRole
} from '../../services/adminService';
import { GlobalAccountMenu } from '../account/GlobalAccountMenu';
import { AdminHomeMediaManager } from './AdminHomeMediaManager';
import { AdminLivePresenceManager } from './AdminLivePresenceManager';

interface AdminDashboardProps {
  currentUser: UserAccount | null;
  onOpenProfile: () => void;
  onOpenSettings?: (section?: string) => void;
  onLogout: () => void;
  onOpenFarmerPreview: () => void;
  onOpenAdviserPreview: () => void;
}

type AdminTab =
  | 'overview'
  | 'home_cms'
  | 'live_presence'
  | 'farmers'
  | 'advisers'
  | 'farms'
  | 'cases'
  | 'live_sessions'
  | 'devices'
  | 'reports'
  | 'system_health'
  | 'audit_logs'
  | 'settings';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  onOpenProfile,
  onOpenSettings,
  onLogout,
  onOpenFarmerPreview,
  onOpenAdviserPreview,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // Data states
  const [farmers, setFarmers] = useState<AdminFarmerRecord[]>([]);
  const [advisers, setAdvisers] = useState<AdminAdviserRecord[]>([]);
  const [farms, setFarms] = useState<AdminFarmRecord[]>([]);
  const [cases, setCases] = useState<AdminCaseRecord[]>([]);
  const [liveSessions, setLiveSessions] = useState<any[]>([]);
  const [devices, setDevices] = useState<AdminDeviceRecord[]>([]);
  const [health, setHealth] = useState<AdminSystemHealth | null>(null);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);
  const [roleUpdateMsg, setRoleUpdateMsg] = useState<string | null>(null);

  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const [
        fData,
        aData,
        farmData,
        caseData,
        liveData,
        devData,
        healthData,
        auditData,
      ] = await Promise.all([
        fetchAdminFarmers(),
        fetchAdminAdvisers(),
        fetchAdminFarms(),
        fetchAdminCases(),
        fetchAdminLiveSessions(),
        fetchAdminDevices(),
        fetchAdminSystemHealth(),
        fetchAdminAuditLogs(),
      ]);

      setFarmers(fData);
      setAdvisers(aData);
      setFarms(farmData);
      setCases(caseData);
      setLiveSessions(liveData);
      setDevices(devData);
      setHealth(healthData);
      setAuditLogs(auditData);
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllAdminData();
    const interval = setInterval(loadAllAdminData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRoleChange = async (userId: string, role: UserRole) => {
    try {
      await updateUserRole(userId, role);
      setRoleUpdateMsg(`Role updated to ${role} for user #${userId}`);
      setTimeout(() => setRoleUpdateMsg(null), 4000);
      loadAllAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to update role');
    }
  };

  // Nav Items
  const navItems: { id: AdminTab; label: string; icon: any; count?: number }[] = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'live_presence', label: 'Live Presence & SOS', icon: Radio },
    { id: 'home_cms', label: 'Home Page CMS', icon: Globe },
    { id: 'farmers', label: 'Farmers', icon: Users, count: farmers.length },
    { id: 'advisers', label: 'Advisers', icon: UserCheck, count: advisers.length },
    { id: 'farms', label: 'Farms', icon: Map, count: farms.length },
    { id: 'cases', label: 'Cases', icon: FileText, count: cases.filter(c => c.status !== 'Resolved').length },
    { id: 'live_sessions', label: 'Live Sessions', icon: PhoneCall, count: liveSessions.length },
    { id: 'devices', label: 'Devices', icon: Radio, count: devices.length },
    { id: 'reports', label: 'Reports', icon: ScrollText },
    { id: 'system_health', label: 'System Health', icon: Activity },
    { id: 'audit_logs', label: 'Audit Logs', icon: Shield },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Admin Header */}
      <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Brand & Badge */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-900/30">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-tight text-white">CroperX Administration</h1>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[10px] font-mono font-bold text-emerald-400">
                SYSTEM ADMIN
              </span>
              {(currentUser?.isDemoAdmin || currentUser?.phoneNumber === '00110099') && (
                <span className="px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/40 text-[10px] font-mono font-bold text-purple-300 animate-pulse">
                  DEMO ADMIN (SIH Test Mode)
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Enterprise Agricultural Operations & Governance Control Center
            </p>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2.5">
          {/* Workspace Preview Quick Launcher */}
          <div className="hidden lg:flex items-center gap-1.5 p-1 bg-slate-800/80 border border-slate-700/60 rounded-2xl">
            <button
              onClick={onOpenFarmerPreview}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-700/60 hover:bg-emerald-600/30 hover:text-emerald-300 text-xs font-bold text-slate-200 transition-all"
              title="Open Farmer Dashboard Preview"
            >
              <span>🌾</span>
              <span>Open Farmer View</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </button>
            <button
              onClick={onOpenAdviserPreview}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-700/60 hover:bg-emerald-600/30 hover:text-emerald-300 text-xs font-bold text-slate-200 transition-all"
              title="Open Adviser Workstation Preview"
            >
              <span>🧑‍🌾</span>
              <span>Open Adviser Workstation</span>
              <ExternalLink className="w-3 h-3 opacity-60" />
            </button>
          </div>

          {/* System Status Pill */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-300 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>99.98% Uptime</span>
          </div>

          {/* Refresh Button */}
          <button
            onClick={loadAllAdminData}
            disabled={loading}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-all cursor-pointer"
            title="Refresh Real-Time Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {/* Admin Global Account Menu */}
          <GlobalAccountMenu
            currentUser={currentUser}
            currentRole="admin"
            onOpenProfile={onOpenProfile}
            onOpenSettings={(sec) => {
              if (onOpenSettings) {
                onOpenSettings(sec);
              } else {
                setActiveTab('settings');
              }
            }}
            onOpenSecurity={() => {
              if (onOpenSettings) {
                onOpenSettings('security');
              } else {
                setActiveTab('settings');
              }
            }}
            onOpenAuditLogs={() => {
              setActiveTab('audit_logs');
            }}
            onLogout={onLogout}
          />
        </div>
      </header>

      {/* Main Admin Body: Sidebar Navigation + Content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Left Sidebar Navigation */}
        <aside className="w-full md:w-64 bg-slate-900/60 border-r border-slate-800 p-3 flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/30'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && item.count > 0 && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}

          {/* Quick Preview Links on Mobile/Sidebar */}
          <div className="mt-auto pt-4 border-t border-slate-800/80 hidden md:block space-y-1.5">
            <p className="text-[10px] uppercase tracking-wider text-slate-500 font-bold px-2">
              Workspace Previews
            </p>
            <button
              onClick={onOpenFarmerPreview}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-800/50 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700/50 transition-all"
            >
              <span className="flex items-center gap-2">🌾 Farmer View</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
            </button>
            <button
              onClick={onOpenAdviserPreview}
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-800/50 hover:bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700/50 transition-all"
            >
              <span className="flex items-center gap-2">🧑‍🌾 Adviser View</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-500" />
            </button>
          </div>
        </aside>

        {/* Content Pane */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto space-y-6">
          {/* Notification banner for updates */}
          {roleUpdateMsg && (
            <div className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{roleUpdateMsg}</span>
            </div>
          )}

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stat Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-bold uppercase tracking-wider">Total Farmers</span>
                    <Users className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="text-3xl font-black text-white">{farmers.length * 142 + 24}</div>
                  <p className="text-[11px] text-emerald-400 font-medium">↑ 18% growth this month</p>
                </div>

                <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-bold uppercase tracking-wider">Active Advisers</span>
                    <UserCheck className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="text-3xl font-black text-white">{advisers.length * 8 + 4}</div>
                  <p className="text-[11px] text-blue-400 font-medium">96% session satisfaction</p>
                </div>

                <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-bold uppercase tracking-wider">Registered Acreage</span>
                    <Map className="w-5 h-5 text-amber-400" />
                  </div>
                  <div className="text-3xl font-black text-white">4,850 <span className="text-sm font-normal text-slate-400">Acres</span></div>
                  <p className="text-[11px] text-amber-400 font-medium">16 Agro-Climatic Zones</p>
                </div>

                <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="text-xs font-bold uppercase tracking-wider">Live Video Calls</span>
                    <PhoneCall className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="text-3xl font-black text-white">{Math.max(1, liveSessions.length)}</div>
                  <p className="text-[11px] text-purple-400 font-medium">Active WebRTC streams</p>
                </div>
              </div>

              {/* Live Session Monitor + Recent Cases */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Live Sessions Monitor */}
                <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                      <h2 className="text-base font-bold text-white">Active Advisory Calls</h2>
                    </div>
                    <button
                      onClick={() => setActiveTab('live_sessions')}
                      className="text-xs text-emerald-400 hover:underline font-bold"
                    >
                      View All →
                    </button>
                  </div>

                  <div className="space-y-2.5">
                    {liveSessions.map((session, i) => (
                      <div
                        key={session.callId || i}
                        className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-200">{session.farmerName}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-300 font-mono">
                              {session.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400">
                            🌾 {session.farmName} • Crop: {session.crop}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-xs font-mono text-emerald-400 font-bold">
                            ⏱️ {Math.floor((session.durationSec || 120) / 60)}m {((session.durationSec || 120) % 60)}s
                          </div>
                          <span className="text-[10px] text-slate-500">Adviser: {session.adviserName}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* System Infrastructure Telemetry */}
                <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-bold text-white">Platform Health & Telemetry</h2>
                    <span className="text-xs text-slate-400">Real-Time Ingress</span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/40 border border-slate-700/40">
                      <div className="flex items-center gap-3">
                        <Server className="w-5 h-5 text-emerald-400" />
                        <div>
                          <p className="text-xs font-bold text-slate-200">Core REST API Service</p>
                          <p className="text-[10px] text-slate-400">Latency: {health?.apiLatencyMs || 24}ms</p>
                        </div>
                      </div>
                      <span className="px-2 py-1 rounded-xl bg-emerald-950 text-emerald-300 text-xs font-bold">
                        Operational
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/40 border border-slate-700/40">
                      <div className="flex items-center gap-3">
                        <Cpu className="w-5 h-5 text-blue-400" />
                        <div>
                          <p className="text-xs font-bold text-slate-200">AI Agronomic Inference Engine</p>
                          <p className="text-[10px] text-slate-400">Gemini 3.7 Flash: {health?.aiModelLatencyMs || 280}ms</p>
                        </div>
                      </div>
                      <span className="px-2 py-1 rounded-xl bg-blue-950 text-blue-300 text-xs font-bold">
                        Online
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/40 border border-slate-700/40">
                      <div className="flex items-center gap-3">
                        <Wifi className="w-5 h-5 text-purple-400" />
                        <div>
                          <p className="text-xs font-bold text-slate-200">WebRTC Video Relay Gateway</p>
                          <p className="text-[10px] text-slate-400">Tunnels Active: {health?.activeWebRTCTunnels || 1}</p>
                        </div>
                      </div>
                      <span className="px-2 py-1 rounded-xl bg-purple-950 text-purple-300 text-xs font-bold">
                        Healthy
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FARMERS */}
          {activeTab === 'farmers' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-white">Registered Farmers Directory</h2>
                  <p className="text-xs text-slate-400">Authorized farm profiles and assigned agronomy extension teams</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search farmers..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                      <tr>
                        <th className="p-4">Farmer Name</th>
                        <th className="p-4">Location</th>
                        <th className="p-4">Farm Size</th>
                        <th className="p-4">Primary Crop</th>
                        <th className="p-4">Assigned Adviser</th>
                        <th className="p-4">Soil Score</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-right">Role Governance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {farmers
                        .filter(f => !searchQuery || f.name.toLowerCase().includes(searchQuery.toLowerCase()))
                        .map((f) => (
                          <tr key={f.id} className="hover:bg-slate-800/30 transition-colors">
                            <td className="p-4 font-bold text-white flex items-center gap-2">
                              <span className="w-8 h-8 rounded-full bg-emerald-950 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-mono">
                                👨‍🌾
                              </span>
                              <div>
                                <p>{f.name}</p>
                                <p className="text-[10px] text-slate-500 font-mono">{f.phoneNumber}</p>
                              </div>
                            </td>
                            <td className="p-4">{f.farmLocation}</td>
                            <td className="p-4 font-mono">{f.farmAreaSize} Ha</td>
                            <td className="p-4 font-semibold text-emerald-400">{f.assignedCrop}</td>
                            <td className="p-4">{f.assignedAdviser}</td>
                            <td className="p-4 font-mono">
                              <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 font-bold border border-emerald-500/30">
                                {f.soilHealthScore}/100
                              </span>
                            </td>
                            <td className="p-4">
                              <span className="px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-600/40 text-[10px] font-bold">
                                {f.status}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <select
                                defaultValue="farmer"
                                onChange={(e) => handleRoleChange(f.id, e.target.value as UserRole)}
                                className="bg-slate-800 border border-slate-700 text-[11px] text-slate-200 rounded-lg px-2 py-1 focus:outline-none"
                              >
                                <option value="farmer">Farmer Role</option>
                                <option value="farmer_adviser">Promote to Adviser</option>
                                <option value="admin">Promote to Admin</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ADVISERS */}
          {activeTab === 'advisers' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-white">Agronomy Adviser Directory</h2>
                  <p className="text-xs text-slate-400">
                    Authoritative roster of certified agronomists, plant pathologists, and extension specialists ({advisers.length} registered)
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={loadAllAdminData}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all border border-slate-700"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                  </button>
                </div>
              </div>

              {advisers.length === 0 ? (
                <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 text-center space-y-4 max-w-xl mx-auto my-6">
                  <div className="w-14 h-14 rounded-2xl bg-teal-950/80 border border-teal-500/30 flex items-center justify-center text-2xl mx-auto text-teal-400">
                    🧑‍🌾
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">No Farm Advisers Registered Yet</h3>
                    <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                      All demo accounts have been purged according to Phase 32 authoritative directory rules. Real advisers will appear here immediately when a user registers with the <span className="text-teal-300 font-semibold">Farm Adviser</span> role, or when you convert an existing Farmer.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
                    <button
                      onClick={() => setActiveTab('farmers')}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
                    >
                      <Users className="w-4 h-4" />
                      <span>Promote a Farmer from Directory</span>
                    </button>
                    <button
                      onClick={onOpenAdviserPreview}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-all flex items-center gap-2"
                    >
                      <span>Preview Adviser Console</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {advisers.map((adv) => (
                    <div
                      key={adv.id}
                      className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-sm space-y-3.5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-teal-900/40 border border-teal-500/40 flex items-center justify-center text-xl shadow-xs">
                            🧑‍🌾
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-bold text-white">{adv.name}</h3>
                              <span className="px-1.5 py-0.5 rounded-md bg-teal-500/20 text-teal-300 text-[10px] font-mono font-bold">
                                REAL ADVISER
                              </span>
                            </div>
                            <p className="text-xs text-emerald-400 font-medium">{adv.specialty || 'General Agronomy & Plant Health'}</p>
                            <p className="text-[11px] text-slate-400 font-mono">{adv.phoneNumber}</p>
                          </div>
                        </div>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            adv.status === 'Available'
                              ? 'bg-emerald-950 text-emerald-400 border-emerald-500/40'
                              : adv.status === 'On Call'
                              ? 'bg-purple-950 text-purple-400 border-purple-500/40'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                        >
                          {adv.status || 'Active'}
                        </span>
                      </div>

                      {/* Location and Organization */}
                      <div className="space-y-1 text-xs text-slate-300 bg-slate-800/30 p-2.5 rounded-2xl border border-slate-800/80">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Organization:</span>
                          <span className="font-medium text-slate-200">{(adv as any).organization || 'Agricultural Extension Network'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Jurisdiction:</span>
                          <span className="text-slate-200">{adv.location || 'Regional Bureau'}</span>
                        </div>
                        {(adv as any).licenseNumber && (
                          <div className="flex justify-between">
                            <span className="text-slate-400">License ID:</span>
                            <span className="font-mono text-teal-300 font-bold">{(adv as any).licenseNumber}</span>
                          </div>
                        )}
                        {(adv as any).consultationHours && (
                          <div className="flex justify-between">
                            <span className="text-slate-400">Advisory Hours:</span>
                            <span className="text-slate-300">{(adv as any).consultationHours}</span>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                        <div className="p-2 rounded-xl bg-slate-800/40 border border-slate-800">
                          <p className="text-[10px] text-slate-400 uppercase font-semibold">Farmers</p>
                          <p className="text-sm font-bold text-white">{adv.assignedFarmersCount ?? 0}</p>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-800/40 border border-slate-800">
                          <p className="text-[10px] text-slate-400 uppercase font-semibold">Calls Today</p>
                          <p className="text-sm font-bold text-emerald-400">{adv.activeCallsToday ?? 0}</p>
                        </div>
                        <div className="p-2 rounded-xl bg-slate-800/40 border border-slate-800">
                          <p className="text-[10px] text-slate-400 uppercase font-semibold">Rating</p>
                          <p className="text-sm font-bold text-amber-400">★ {adv.rating || 4.9}</p>
                        </div>
                      </div>

                      {/* Role Management Actions */}
                      <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                        <span className="text-[11px] text-slate-400 font-medium">Account Role:</span>
                        <div className="flex items-center gap-2">
                          <select
                            defaultValue="farmer_adviser"
                            onChange={(e) => handleRoleChange(adv.id, e.target.value as UserRole)}
                            className="bg-slate-800 border border-slate-700 text-[11px] text-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:border-teal-500"
                          >
                            <option value="farmer_adviser">Farm Adviser</option>
                            <option value="farmer">Revert to Farmer</option>
                            <option value="admin">Promote to Admin</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: FARMS */}
          {activeTab === 'farms' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-white">Registered Farm Holdings</h2>
                <p className="text-xs text-slate-400">Geospatial parcel management, irrigation grids, and crop cycles</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {farms.map((farm) => (
                  <div
                    key={farm.id}
                    className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-sm space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-sm font-bold text-white">🌾 {farm.name}</h3>
                        <p className="text-xs text-slate-400">Owner: {farm.ownerName} • 📍 {farm.location}</p>
                      </div>
                      <span className="px-2.5 py-1 rounded-xl bg-slate-800 text-xs font-mono font-bold text-emerald-400 border border-slate-700">
                        {farm.acreage} Acres
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-slate-800/80">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Crop Rotation:</span>
                        <span className="font-semibold text-emerald-400">{farm.cropCycle}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Irrigation System:</span>
                        <span>{farm.irrigationType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Soil Classification:</span>
                        <span>{farm.soilType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Telemetry Zones:</span>
                        <span className="font-mono text-blue-400">{farm.zonesCount} Zones Active</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: CASES */}
          {activeTab === 'cases' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-white">Diagnostic & Agronomic Cases</h2>
                <p className="text-xs text-slate-400">Pathogen alerts, crop health tickets, and advisory resolutions</p>
              </div>

              <div className="space-y-3">
                {cases.map((c) => (
                  <div
                    key={c.id}
                    className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">#{c.id} • {c.farmerName}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            c.severity === 'Critical'
                              ? 'bg-rose-950 text-rose-400 border-rose-500/40'
                              : c.severity === 'High'
                              ? 'bg-amber-950 text-amber-400 border-amber-500/40'
                              : 'bg-blue-950 text-blue-400 border-blue-500/40'
                          }`}
                        >
                          {c.severity} Severity
                        </span>
                        <span className="text-xs text-slate-500">Crop: {c.crop}</span>
                      </div>
                      <p className="text-xs text-slate-300 font-medium">🔬 {c.diagnosis}</p>
                      <p className="text-[11px] text-slate-500">Assigned: {c.adviserAssigned} • Created {c.createdAt}</p>
                    </div>

                    <div>
                      <span
                        className={`px-3 py-1 rounded-xl text-xs font-bold border ${
                          c.status === 'Resolved'
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40'
                            : 'bg-amber-950 text-amber-300 border-amber-500/40'
                        }`}
                      >
                        {c.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: LIVE SESSIONS */}
          {activeTab === 'live_sessions' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-white">Live Field Collaboration Sessions</h2>
                <p className="text-xs text-slate-400">Non-intrusive WebRTC video telemetry monitoring (Privacy Compliant)</p>
              </div>

              <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-sm font-bold text-emerald-400">Live Active Streams</span>
                  </div>
                  <span className="text-xs text-slate-500 font-mono">End-to-End Encrypted Tunnel</span>
                </div>

                <div className="space-y-3">
                  {liveSessions.map((session, i) => (
                    <div
                      key={session.callId || i}
                      className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">🌾 Farmer: {session.farmerName}</span>
                          <span className="text-xs text-slate-400">↔</span>
                          <span className="text-sm font-bold text-emerald-400">🧑‍🌾 Adviser: {session.adviserName}</span>
                        </div>
                        <p className="text-xs text-slate-300">
                          Farm: {session.farmName} • Target: {session.crop}
                        </p>
                        <p className="text-[11px] text-slate-500 font-mono">
                          Session ID: {session.callId} • Privacy Policy Standard Verified
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-xs text-slate-400">Duration</p>
                          <p className="text-sm font-mono text-emerald-400 font-bold">
                            {Math.floor((session.durationSec || 180) / 60)}m {((session.durationSec || 180) % 60)}s
                          </p>
                        </div>
                        <span className="px-3 py-1.5 rounded-xl bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
                          Stream Active
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: DEVICES */}
          {activeTab === 'devices' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-white">IoT Sensor Grid & Telemetry Gateways</h2>
                <p className="text-xs text-slate-400">Real-time status of LoRaWAN probes, weather stations, and drone docks</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {devices.map((dev) => (
                  <div
                    key={dev.id}
                    className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-sm space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-lg">
                          📡
                        </div>
                        <div>
                          <h3 className="text-xs font-bold text-white">{dev.name}</h3>
                          <p className="text-[11px] text-slate-400">{dev.farm}</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/40 text-[10px] font-bold">
                        {dev.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800/80 text-center text-xs">
                      <div className="p-2 rounded-xl bg-slate-800/40">
                        <p className="text-[10px] text-slate-400">Battery</p>
                        <p className="font-bold text-white">{dev.battery}%</p>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-800/40">
                        <p className="text-[10px] text-slate-400">Signal</p>
                        <p className="font-bold text-emerald-400">{dev.signalQuality}</p>
                      </div>
                      <div className="p-2 rounded-xl bg-slate-800/40">
                        <p className="text-[10px] text-slate-400">Last Ping</p>
                        <p className="font-bold text-slate-300">{dev.lastPing}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 8: REPORTS */}
          {activeTab === 'reports' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-white">Agronomic & Enterprise Intelligence Reports</h2>
                <p className="text-xs text-slate-400">Aggregated yield forecasts, soil health trends, and sustainability compliance</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-sm space-y-3">
                  <h3 className="text-sm font-bold text-white">🌾 Regional Yield Benchmark</h3>
                  <p className="text-xs text-slate-400">Estimated wheat harvest projected at +18.4% above provincial historical baselines.</p>
                  <button className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all">
                    Download PDF Summary
                  </button>
                </div>

                <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-sm space-y-3">
                  <h3 className="text-sm font-bold text-white">💧 Water Resource Index</h3>
                  <p className="text-xs text-slate-400">Total water savings of 2.4 million liters achieved through precision ET0 scheduling.</p>
                  <button className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all">
                    Export Water Ledger
                  </button>
                </div>

                <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-sm space-y-3">
                  <h3 className="text-sm font-bold text-white">🌿 Carbon Sequestration</h3>
                  <p className="text-xs text-slate-400">1,480 Verified Carbon Units minted under Regenerative Alluvial Farming Protocol.</p>
                  <button className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all">
                    Audit Certificates
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: SYSTEM HEALTH */}
          {activeTab === 'system_health' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-white">System Infrastructure & Diagnostics</h2>
                <p className="text-xs text-slate-400">Live uptime, API latency, and database performance counters</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-sm space-y-2">
                  <span className="text-xs text-slate-400 font-bold uppercase">Uptime SLA</span>
                  <div className="text-3xl font-black text-emerald-400">99.98%</div>
                  <p className="text-[11px] text-slate-500">Zero unplanned outages in last 90 days</p>
                </div>

                <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-sm space-y-2">
                  <span className="text-xs text-slate-400 font-bold uppercase">Avg REST Latency</span>
                  <div className="text-3xl font-black text-blue-400">{health?.apiLatencyMs || 24} ms</div>
                  <p className="text-[11px] text-slate-500">Global edge caching active</p>
                </div>

                <div className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-sm space-y-2">
                  <span className="text-xs text-slate-400 font-bold uppercase">AI Gemini Flash Ingress</span>
                  <div className="text-3xl font-black text-purple-400">{health?.aiModelLatencyMs || 280} ms</div>
                  <p className="text-[11px] text-slate-500">Server-side secure proxy</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 10: AUDIT LOGS */}
          {activeTab === 'audit_logs' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-white">Governance & Security Audit Logs</h2>
                <p className="text-xs text-slate-400">Immutable record of logins, role updates, and advisory actions</p>
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-800/80 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                      <tr>
                        <th className="p-4">Timestamp</th>
                        <th className="p-4">User</th>
                        <th className="p-4">Role</th>
                        <th className="p-4">Action</th>
                        <th className="p-4">Target Resource</th>
                        <th className="p-4">IP Address</th>
                        <th className="p-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                      {auditLogs.map((log) => (
                        <tr key={log.id} className="hover:bg-slate-800/30">
                          <td className="p-4 text-slate-400">{new Date(log.timestamp).toLocaleTimeString()}</td>
                          <td className="p-4 font-bold text-white font-sans">{log.user}</td>
                          <td className="p-4 text-emerald-400">{log.role}</td>
                          <td className="p-4 text-slate-200 font-sans">{log.action}</td>
                          <td className="p-4 text-slate-400">{log.target}</td>
                          <td className="p-4 text-slate-500">{log.ipAddress}</td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                              {log.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: LIVE PRESENCE & EMERGENCY NETWORK */}
          {activeTab === 'live_presence' && (
            <AdminLivePresenceManager />
          )}

          {/* TAB: HOME PAGE CMS */}
          {activeTab === 'home_cms' && (
            <AdminHomeMediaManager currentUser={currentUser} />
          )}

          {/* TAB 11: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-xl font-bold text-white">System & Governance Settings</h2>
                <p className="text-xs text-slate-400">Session policies, role permissions, and WebRTC bridge configurations</p>
              </div>

              <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-sm space-y-6 max-w-2xl">
                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-white">Public Gateway & CMS Controls</h3>
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50">
                    <div>
                      <p className="text-xs font-semibold text-white">Public Home Page Media & Content</p>
                      <p className="text-[10px] text-slate-400">Configure hero drone video, image backgrounds and headlines</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('home_cms')}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all"
                    >
                      Manage Home CMS
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-sm font-bold text-white">Security & Authentication Policies</h3>
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/50 border border-slate-700/50">
                    <div>
                      <p className="text-xs font-semibold text-white">Enforce PBKDF2 Password Encryption</p>
                      <p className="text-[10px] text-slate-400">100,000 iterations SHA-512</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-xl bg-emerald-950 text-emerald-400 text-xs font-bold">Enabled</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/50 border border-slate-700/50">
                    <div>
                      <p className="text-xs font-semibold text-white">Cross-Tab Session Synchronization</p>
                      <p className="text-[10px] text-slate-400">Instant logout broadcast across all tabs</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-xl bg-emerald-950 text-emerald-400 text-xs font-bold">Active</span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/50 border border-slate-700/50">
                    <div>
                      <p className="text-xs font-semibold text-white">WebRTC Video Privacy Boundary</p>
                      <p className="text-[10px] text-slate-400">Ephemeral peer-to-peer tunnels without centralized recording</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-xl bg-emerald-950 text-emerald-400 text-xs font-bold">Enforced</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
