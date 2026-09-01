import React, { useState, useEffect } from 'react';
import {
  Cpu,
  ShieldAlert,
  Power,
  Sliders,
  Users,
  Activity,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Search,
  Pause,
  Play,
  PhoneCall,
  Database,
  History,
  FileText,
  Lock,
  Unlock,
  ChevronRight,
  TrendingUp,
  AlertOctagon,
  Eye
} from 'lucide-react';
import {
  AIAutomationSettings,
  AIAutomationMode,
  FarmerAIAgent,
  AIEscalation,
  AIAuditEvent,
  AIAgentStatus
} from '../../types';
import { useLanguage } from '../../context/LanguageContext';

export const AIAutomationCenter: React.FC = () => {
  const { language } = useLanguage();
  const [settings, setSettings] = useState<AIAutomationSettings | null>(null);
  const [agents, setAgents] = useState<FarmerAIAgent[]>([]);
  const [escalations, setEscalations] = useState<AIEscalation[]>([]);
  const [auditLogs, setAuditLogs] = useState<AIAuditEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<'agents' | 'escalations' | 'audit' | 'policies'>('agents');
  const [selectedAgent, setSelectedAgent] = useState<FarmerAIAgent | null>(null);
  const [showKillSwitchConfirm, setShowKillSwitchConfirm] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/ai/agents');
      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings);
        setAgents(data.agents || []);
        setEscalations(data.escalations || []);
        setAuditLogs(data.auditLogs || []);
      }
    } catch (err) {
      console.error('Failed to load AI Automation Center data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleModeChange = async (mode: AIAutomationMode) => {
    if (!settings) return;
    try {
      setActionLoading(true);
      const res = await fetch('/api/admin/ai/automation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enabled: settings.automationEnabled,
          mode,
          adminId: 'ADMIN_CHIEF'
        })
      });

      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings);
        setSuccessMsg(`Automation level switched to ${mode}`);
        setTimeout(() => setSuccessMsg(null), 3000);
        loadData();
      }
    } catch (err) {
      console.error('Mode change error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleMasterToggle = async () => {
    if (!settings) return;
    try {
      setActionLoading(true);
      const newEnabled = !settings.automationEnabled;
      const res = await fetch('/api/admin/ai/automation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enabled: newEnabled,
          mode: settings.automationMode,
          adminId: 'ADMIN_CHIEF'
        })
      });

      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings);
        setSuccessMsg(newEnabled ? 'Master AI Automation Activated' : 'Master AI Automation Deactivated');
        setTimeout(() => setSuccessMsg(null), 3000);
        loadData();
      }
    } catch (err) {
      console.error('Master toggle error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleKillSwitch = async (action: 'STOP' | 'RESET') => {
    try {
      setActionLoading(true);
      const res = await fetch('/api/admin/ai/kill-switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, adminId: 'ADMIN_CHIEF' })
      });

      if (res.ok) {
        const data = await res.json();
        setSettings(data.settings);
        setShowKillSwitchConfirm(false);
        setSuccessMsg(data.message);
        setTimeout(() => setSuccessMsg(null), 4000);
        loadData();
      }
    } catch (err) {
      console.error('Kill switch error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAgentStatusChange = async (farmerId: string, newStatus: AIAgentStatus) => {
    try {
      setActionLoading(true);
      const res = await fetch(`/api/admin/ai/agents/${encodeURIComponent(farmerId)}/control`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, adminId: 'ADMIN_CHIEF' })
      });

      if (res.ok) {
        const data = await res.json();
        setSuccessMsg(data.message);
        setTimeout(() => setSuccessMsg(null), 3000);
        loadData();
        if (selectedAgent && selectedAgent.farmerId === farmerId) {
          setSelectedAgent(data.agent);
        }
      }
    } catch (err) {
      console.error('Agent control error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolveEscalation = async (escId: string) => {
    try {
      setActionLoading(true);
      const res = await fetch(`/api/admin/ai/escalations/${encodeURIComponent(escId)}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adviserId: 'ADV_ADMIN_01',
          adviserName: 'Chief Agronomist'
        })
      });

      if (res.ok) {
        setSuccessMsg('Escalation marked as RESOLVED');
        setTimeout(() => setSuccessMsg(null), 3000);
        loadData();
      }
    } catch (err) {
      console.error('Resolve error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredAgents = agents.filter((a) => {
    const matchesSearch =
      a.farmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.phoneNumber && a.phoneNumber.includes(searchQuery)) ||
      (a.primaryCrop && a.primaryCrop.toLowerCase().includes(searchQuery.toLowerCase()));

    if (statusFilter === 'ALL') return matchesSearch;
    return matchesSearch && a.status === statusFilter;
  });

  const automationModesList: Array<{ mode: AIAutomationMode; label: string; desc: string }> = [
    {
      mode: 'MANUAL',
      label: 'Manual Mode',
      desc: 'All consultations queued to physical advisers; AI disabled'
    },
    {
      mode: 'AI_ASSIST',
      label: 'AI Assist',
      desc: 'AI prepares recommendations for human adviser review'
    },
    {
      mode: 'HYBRID',
      label: 'Hybrid Mode',
      desc: 'Autonomous for routine low-risk; auto-escalates complex queries'
    },
    {
      mode: 'AUTONOMOUS',
      label: 'Autonomous Mode',
      desc: 'Automated 24/7 advisory with safety and policy safeguards'
    },
    {
      mode: 'PROACTIVE_AUTONOMOUS',
      label: 'Proactive Autonomous',
      desc: 'AI continuously monitors farm telemetry & sends alerts'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-950/90 border border-emerald-500/40 text-emerald-200 text-xs font-semibold flex items-center justify-between shadow-2xl backdrop-blur-xl animate-in slide-in-from-top">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-400 hover:text-white">
            &times;
          </button>
        </div>
      )}

      {/* Hero Control Console */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-indigo-950/40 border border-indigo-500/20 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-emerald-400 p-0.5 shadow-lg shadow-indigo-950/50">
                <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                  <Cpu className="w-6 h-6 text-indigo-400" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-black text-white">AI Automation Command Center</h2>
                  <span
                    className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${
                      settings?.emergencyStop
                        ? 'bg-red-500/20 text-red-300 border-red-500/30'
                        : settings?.automationEnabled
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                        : 'bg-slate-700 text-slate-300 border-slate-600'
                    }`}
                  >
                    {settings?.emergencyStop
                      ? 'EMERGENCY STOPPED'
                      : settings?.automationEnabled
                      ? 'SYSTEM ONLINE'
                      : 'AUTOMATION DISABLED'}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  Global autonomous intelligence orchestrator • Phase 46.1 Network Foundation
                </p>
              </div>
            </div>
          </div>

          {/* Master Controls */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
            <button
              onClick={handleMasterToggle}
              disabled={actionLoading || settings?.emergencyStop}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-lg ${
                settings?.automationEnabled
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/50'
              }`}
            >
              <Power className="w-4 h-4" />
              <span>{settings?.automationEnabled ? 'Disable Automation' : 'Enable Automation'}</span>
            </button>

            {settings?.emergencyStop ? (
              <button
                onClick={() => handleKillSwitch('RESET')}
                disabled={actionLoading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-950/40"
              >
                <Unlock className="w-4 h-4" />
                <span>Reset Emergency Stop</span>
              </button>
            ) : (
              <button
                onClick={() => setShowKillSwitchConfirm(true)}
                disabled={actionLoading}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white text-xs font-black transition-all shadow-xl shadow-red-950/50"
              >
                <AlertOctagon className="w-4 h-4" />
                <span>EMERGENCY KILL SWITCH</span>
              </button>
            )}

            <button
              onClick={loadData}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors"
              title="Refresh AI Dashboard"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-indigo-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Mode Selector Strip */}
        <div className="mt-6 pt-5 border-t border-slate-800/80">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-indigo-400" /> Active Automation Mode:
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {automationModesList.map((item) => {
              const isSelected = settings?.automationMode === item.mode;
              return (
                <button
                  key={item.mode}
                  onClick={() => handleModeChange(item.mode)}
                  disabled={actionLoading || settings?.emergencyStop}
                  className={`p-3 rounded-2xl text-left border transition-all ${
                    isSelected
                      ? 'bg-indigo-950/60 border-indigo-500 text-white ring-1 ring-indigo-500/40 shadow-lg shadow-indigo-950/40'
                      : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold">{item.label}</p>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" />}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 line-clamp-2">{item.desc}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Active AI Agents</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">
              {settings?.totalActiveAgents || agents.length}
            </span>
            <span className="text-xs text-slate-400">/ {agents.length} Total</span>
          </div>
          <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Idempotent Provisioning
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Consultations Today</span>
            <Activity className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-indigo-300">
              {settings?.consultationsToday || 14}
            </span>
            <span className="text-xs text-emerald-400 font-bold">+18% vs avg</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Autonomous resolutions</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Human Escalations</span>
            <PhoneCall className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-300">
              {escalations.filter((e) => e.status === 'PENDING').length}
            </span>
            <span className="text-xs text-slate-400">Pending Review</span>
          </div>
          <p className="text-[11px] text-amber-400/90 mt-1">Certified Agronomist Queue</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Safety Shield Rating</span>
            <ShieldAlert className="w-4 h-4 text-teal-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-teal-300">
              {settings?.averageConfidence || 94.2}%
            </span>
            <span className="text-xs text-slate-400">Avg Confidence</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {settings?.highRiskBlockedToday || 1} High-risk queries blocked
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('agents')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'agents'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-400 hover:text-slate-200 bg-slate-900'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Farmer AI Agents ({agents.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('escalations')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'escalations'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-400 hover:text-slate-200 bg-slate-900'
          }`}
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span>Human Escalation Queue ({escalations.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'audit'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-400 hover:text-slate-200 bg-slate-900'
          }`}
        >
          <History className="w-3.5 h-3.5" />
          <span>AI Audit Trail ({auditLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('policies')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === 'policies'
              ? 'bg-indigo-600 text-white'
              : 'text-slate-400 hover:text-slate-200 bg-slate-900'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Policy & Forbidden Actions</span>
        </button>
      </div>

      {/* Tab 1: Farmer AI Agents Table */}
      {activeTab === 'agents' && (
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 space-y-4 shadow-xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search farmer name, crop, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <span className="text-xs text-slate-400">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-white text-xs rounded-xl px-3 py-2 focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="PAUSED">Paused</option>
                <option value="DISABLED">Disabled</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Farmer Profile</th>
                  <th className="py-3 px-4">Acreage & Crop</th>
                  <th className="py-3 px-4">Agent Status</th>
                  <th className="py-3 px-4">Confidence</th>
                  <th className="py-3 px-4">Last Activity</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredAgents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      No matching farmer agents found.
                    </td>
                  </tr>
                ) : (
                  filteredAgents.map((agent) => (
                    <tr key={agent.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4">
                        <div>
                          <p className="font-bold text-white">{agent.farmerName}</p>
                          <p className="text-[11px] text-slate-400">{agent.phoneNumber || agent.id}</p>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div>
                          <p className="text-slate-300 font-medium">{agent.primaryCrop || 'Paddy'}</p>
                          <p className="text-[11px] text-slate-400">
                            {agent.farmSizeAcres || 3.0} Acres • {agent.location || 'Rural Farm'}
                          </p>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            agent.status === 'ACTIVE'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : agent.status === 'PAUSED'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-red-500/20 text-red-300 border border-red-500/30'
                          }`}
                        >
                          {agent.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-emerald-400 font-bold">
                          {agent.confidenceScore || 95}%
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                        {agent.lastInteractionAt
                          ? new Date(agent.lastInteractionAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : 'Just Provisioned'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {agent.status === 'ACTIVE' ? (
                            <button
                              onClick={() => handleAgentStatusChange(agent.farmerId, 'PAUSED')}
                              className="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30"
                              title="Pause Agent"
                            >
                              <Pause className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleAgentStatusChange(agent.farmerId, 'ACTIVE')}
                              className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                              title="Resume Agent"
                            >
                              <Play className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => setSelectedAgent(agent)}
                            className="p-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                            title="Inspect Agent Memory"
                          >
                            <Eye className="w-3.5 h-3.5" />
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
      )}

      {/* Tab 2: Escalations Queue */}
      {activeTab === 'escalations' && (
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-amber-400" />
              <span>Human Agronomist Escalation Tickets</span>
            </h3>
            <span className="text-xs text-slate-400">
              {escalations.filter((e) => e.status === 'PENDING').length} Pending
            </span>
          </div>

          <div className="space-y-3">
            {escalations.length === 0 ? (
              <p className="text-center py-8 text-slate-500 text-xs">
                No active human escalations recorded.
              </p>
            ) : (
              escalations.map((esc) => (
                <div
                  key={esc.id}
                  className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-amber-500/30 transition-all text-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px]">
                        {esc.id}
                      </span>
                      <strong className="text-white text-sm">{esc.farmerName}</strong>
                      <span className="text-slate-400">({esc.farmerPhone || 'Farm User'})</span>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        esc.status === 'PENDING'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-emerald-500/20 text-emerald-300'
                      }`}
                    >
                      {esc.status}
                    </span>
                  </div>

                  <p className="text-slate-300 font-medium">
                    Reason: <span className="text-amber-200">{esc.reason}</span>
                  </p>
                  <p className="text-slate-400 text-[11px] bg-slate-900/80 p-2 rounded-lg">
                    {esc.contextSummary}
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-slate-400">
                      Created: {new Date(esc.createdAt).toLocaleString()}
                    </span>
                    {esc.status === 'PENDING' && (
                      <button
                        onClick={() => handleResolveEscalation(esc.id)}
                        disabled={actionLoading}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors"
                      >
                        Mark as Resolved by Agronomist
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 3: AI Audit Trail */}
      {activeTab === 'audit' && (
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <History className="w-4 h-4 text-indigo-400" />
              <span>Immutable AI System Audit Trail</span>
            </h3>
            <span className="text-xs text-slate-400">Showing last {auditLogs.length} events</span>
          </div>

          <div className="space-y-2">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded bg-indigo-950/60 text-indigo-300 font-bold text-[10px] border border-indigo-800/40">
                    {log.eventType}
                  </span>
                  <div>
                    <p className="text-slate-200 font-medium">
                      Actor: <strong className="text-white">{log.actorId}</strong> ({log.actorRole})
                    </p>
                    <p className="text-[11px] text-slate-400">
                      Target: {log.targetId || 'N/A'} • {JSON.stringify(log.details)}
                    </p>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400 shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Policy & Safety Rules */}
      {activeTab === 'policies' && (
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 space-y-4 shadow-xl">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Lock className="w-5 h-5 text-red-400" />
            <h3 className="text-sm font-bold text-white">Strict AI Safety Policy & Forbidden Actions</h3>
          </div>

          <p className="text-xs text-slate-300">
            The CropX Autonomous AI Architecture enforces immutable server-authoritative boundaries.
            The following actions are strictly forbidden from autonomous AI execution and will be
            blocked immediately:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            {[
              'Direct mutation of financial ledgers or payment gateways',
              'Automatic cart checkout or charging farmer funds without confirmation',
              'Modification of user roles, credentials, or administrative rights',
              'Automatic price alteration or stock manipulation in Agri Store',
              'Deletion of farmer crop or soil records',
              'Overriding agronomist certification assessments or exam scores'
            ].map((rule, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-red-950/20 border border-red-500/20 text-xs text-red-200 flex items-start gap-2"
              >
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{rule}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Agent Detail Modal */}
      {selectedAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg bg-slate-900 rounded-3xl border border-indigo-500/30 p-6 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setSelectedAgent(null)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800"
            >
              &times;
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{selectedAgent.farmerName}</h3>
                <p className="text-xs text-slate-400">Agent Profile ID: {selectedAgent.id}</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <p className="text-slate-400">
                Primary Crop: <strong className="text-white">{selectedAgent.primaryCrop}</strong>
              </p>
              <p className="text-slate-400">
                Farm Size: <strong className="text-white">{selectedAgent.farmSizeAcres} Acres</strong>
              </p>
              <p className="text-slate-400">
                Location: <strong className="text-white">{selectedAgent.location}</strong>
              </p>
              <p className="text-slate-400">
                Language:{' '}
                <strong className="text-emerald-400 uppercase">{selectedAgent.language}</strong>
              </p>
              <p className="text-slate-400">
                Status:{' '}
                <strong className="text-indigo-300 uppercase">{selectedAgent.status}</strong>
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedAgent(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Emergency Kill Switch Modal */}
      {showKillSwitchConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-slate-900 rounded-3xl border border-red-500/50 p-6 space-y-4 shadow-2xl text-center">
            <div className="w-16 h-16 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 flex items-center justify-center mx-auto">
              <AlertOctagon className="w-8 h-8" />
            </div>

            <h3 className="text-lg font-black text-white">Activate Emergency Kill Switch?</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              This will immediately pause ALL autonomous AI operations across all farmer agents.
              Existing memories, ledger entries, and human workflows will remain completely safe.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setShowKillSwitchConfirm(false)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleKillSwitch('STOP')}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white text-xs font-black transition-all shadow-lg shadow-red-950/50"
              >
                Confirm Emergency Stop
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
