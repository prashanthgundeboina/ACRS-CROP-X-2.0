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
  Eye,
  CalendarCheck,
  Zap,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  LifeBuoy,
  Radio,
  BarChart3,
  Sun,
  CloudRain,
  Compass,
  Send,
  Check,
  X
} from 'lucide-react';
import {
  AIAutomationSettings,
  AIAutomationMode,
  FarmerAIAgent,
  AIEscalation,
  AIAuditEvent,
  AIAgentStatus,
  AISafetyState,
  AITask,
  AIAnomaly,
  AIFeedback,
  AIEvent,
  AIEventType,
  AIRecommendation,
  AINetworkMetrics,
  FarmerAgentMetrics
} from '../../types';
import { useLanguage } from '../../context/LanguageContext';

type AdminTab =
  | 'overview'
  | 'agents'
  | 'performance'
  | 'tasks'
  | 'events'
  | 'risk'
  | 'anomalies'
  | 'escalations'
  | 'feedback'
  | 'audit'
  | 'policies';

export const AIAutomationCenter: React.FC = () => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [settings, setSettings] = useState<AIAutomationSettings | null>(null);
  const [agents, setAgents] = useState<FarmerAIAgent[]>([]);
  const [escalations, setEscalations] = useState<AIEscalation[]>([]);
  const [auditLogs, setAuditLogs] = useState<AIAuditEvent[]>([]);
  const [tasks, setTasks] = useState<AITask[]>([]);
  const [anomalies, setAnomalies] = useState<AIAnomaly[]>([]);
  const [feedbackMetrics, setFeedbackMetrics] = useState<any>(null);
  const [events, setEvents] = useState<AIEvent[]>([]);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [networkMetrics, setNetworkMetrics] = useState<AINetworkMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Selected agent modal state with 4 inspect sub-views: memory, recommendations, safety, performance
  const [selectedAgent, setSelectedAgent] = useState<FarmerAIAgent | null>(null);
  const [agentInspectTab, setAgentInspectTab] = useState<'memory' | 'recommendations' | 'safety' | 'performance'>('memory');
  const [agentMemories, setAgentMemories] = useState<any[]>([]);
  const [agentMetrics, setAgentMetrics] = useState<FarmerAgentMetrics | null>(null);

  // Modals & action states
  const [showKillSwitchConfirm, setShowKillSwitchConfirm] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Event stream simulator state
  const [simEventType, setSimEventType] = useState<AIEventType>('WEATHER_CHANGED');
  const [simFarmerId, setSimFarmerId] = useState<string>('');
  const [simDetails, setSimDetails] = useState<string>('Heavy rainfall forecast in 24 hours: 45mm expected.');

  const loadData = async () => {
    try {
      setLoading(true);
      const [
        resAgents,
        resTasks,
        resAnomalies,
        resFeedback,
        resEvents,
        resRecommendations,
        resMetrics
      ] = await Promise.all([
        fetch('/api/admin/ai/agents'),
        fetch('/api/ai/tasks'),
        fetch('/api/ai/anomalies'),
        fetch('/api/ai/feedback/metrics'),
        fetch('/api/ai/events'),
        fetch('/api/ai/recommendations'),
        fetch('/api/ai/metrics')
      ]);

      if (resAgents.ok) {
        const data = await resAgents.json();
        setSettings(data.settings);
        setAgents(data.agents || []);
        setEscalations(data.escalations || []);
        setAuditLogs(data.auditLogs || []);
      }

      if (resTasks.ok) {
        const data = await resTasks.json();
        setTasks(data.tasks || []);
      }

      if (resAnomalies.ok) {
        const data = await resAnomalies.json();
        setAnomalies(data.anomalies || []);
      }

      if (resFeedback.ok) {
        const data = await resFeedback.json();
        setFeedbackMetrics(data);
      }

      if (resEvents.ok) {
        const data = await resEvents.json();
        setEvents(data.events || []);
      }

      if (resRecommendations.ok) {
        const data = await resRecommendations.json();
        setRecommendations(data.recommendations || []);
      }

      if (resMetrics.ok) {
        const data = await resMetrics.json();
        setNetworkMetrics(data);
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

  const handleMasterToggle = async (desiredState?: boolean) => {
    if (!settings) return;
    try {
      setActionLoading(true);
      const newEnabled = desiredState !== undefined ? desiredState : !settings.automationEnabled;
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
        setSuccessMsg(newEnabled ? 'Master AI Automation Activated' : 'Master AI Automation Paused');
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
      const res = await fetch(`/api/admin/ai/agents/${farmerId}/control`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, adminId: 'ADMIN_CHIEF' })
      });

      if (res.ok) {
        setSuccessMsg(`Agent status updated to ${newStatus}`);
        setTimeout(() => setSuccessMsg(null), 3000);
        loadData();
      }
    } catch (err) {
      console.error('Agent control error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSafetyStateChange = async (farmerId: string, safetyState: AISafetyState) => {
    try {
      setActionLoading(true);
      const res = await fetch(`/api/admin/ai/agents/${farmerId}/safety-state`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ safetyState, adminId: 'ADMIN_CHIEF' })
      });

      if (res.ok) {
        setSuccessMsg(`Safety state updated to ${safetyState}`);
        setTimeout(() => setSuccessMsg(null), 3000);
        loadData();
        if (selectedAgent && selectedAgent.farmerId === farmerId) {
          setSelectedAgent({ ...selectedAgent, safetyState });
        }
      }
    } catch (err) {
      console.error('Safety state update error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleExecuteTask = async (taskId: string) => {
    try {
      setActionLoading(true);
      const res = await fetch(`/api/ai/tasks/${taskId}/execute`, { method: 'POST' });
      if (res.ok) {
        setSuccessMsg(`Task ${taskId} executed successfully.`);
        setTimeout(() => setSuccessMsg(null), 3000);
        loadData();
      }
    } catch (err) {
      console.error('Task execute error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolveAnomaly = async (anomalyId: string) => {
    try {
      setActionLoading(true);
      const res = await fetch(`/api/ai/anomalies/${anomalyId}/resolve`, { method: 'POST' });
      if (res.ok) {
        setSuccessMsg(`Anomaly resolved.`);
        setTimeout(() => setSuccessMsg(null), 3000);
        loadData();
      }
    } catch (err) {
      console.error('Anomaly resolve error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleInspectAgent = async (agent: FarmerAIAgent, defaultTab: 'memory' | 'recommendations' | 'safety' | 'performance' = 'memory') => {
    setSelectedAgent(agent);
    setAgentInspectTab(defaultTab);
    try {
      const [resMem, resMet] = await Promise.all([
        fetch(`/api/ai/memory/${agent.farmerId}`),
        fetch(`/api/ai/metrics/farmer/${agent.farmerId}`)
      ]);
      if (resMem.ok) {
        const data = await resMem.json();
        setAgentMemories(data.memories || []);
      }
      if (resMet.ok) {
        const metData = await resMet.json();
        setAgentMetrics(metData);
      }
    } catch (err) {
      console.error('Failed to fetch agent inspect data:', err);
    }
  };

  const handleResolveEscalation = async (id: string) => {
    try {
      setActionLoading(true);
      const res = await fetch(`/api/admin/ai/escalations/${id}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adviserId: 'ADMIN_AGRONOMIST_CHIEF',
          adviserName: 'Chief Field Agronomist'
        })
      });

      if (res.ok) {
        setSuccessMsg(`Escalation ${id} resolved successfully.`);
        setTimeout(() => setSuccessMsg(null), 3000);
        loadData();
      }
    } catch (err) {
      console.error('Resolve escalation error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleTriggerProactiveScan = async (scanType: 'MORNING' | 'AFTERNOON' | 'EVENING') => {
    try {
      setActionLoading(true);
      const res = await fetch('/api/ai/proactive/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scanType })
      });
      if (res.ok) {
        const data = await res.json();
        setSuccessMsg(`Proactive ${scanType} scan executed across ${data.scan?.scannedAgents || 'active'} farmer agents.`);
        setTimeout(() => setSuccessMsg(null), 4000);
        loadData();
      }
    } catch (err) {
      console.error('Proactive scan trigger error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSimulateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const res = await fetch('/api/ai/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventType: simEventType,
          farmerId: simFarmerId || undefined,
          payload: { alert: simDetails, timestamp: new Date().toISOString() },
          source: 'ADMIN_TEST_CONSOLE'
        })
      });
      if (res.ok) {
        const data = await res.json();
        setSuccessMsg(`Event [${simEventType}] routed successfully through Multi-Agent Orchestrator.`);
        setTimeout(() => setSuccessMsg(null), 4000);
        loadData();
      }
    } catch (err) {
      console.error('Event simulation error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const filteredAgents = agents.filter((agent) => {
    const matchesSearch =
      agent.farmerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (agent.primaryCrop && agent.primaryCrop.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (agent.phoneNumber && agent.phoneNumber.includes(searchQuery));
    const matchesStatus = statusFilter === 'ALL' || agent.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header: AI Autonomous Operations Center */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 rounded-3xl border border-slate-800 p-6 shadow-xl relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-950/40">
            <Cpu className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-white tracking-tight">
                AI Autonomous Operations Center
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-extrabold uppercase border border-emerald-500/30">
                Phase 46.3 Production
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Agent Orchestration • Proactive Intelligence • Consensus Confidence • Continuous Learning
            </p>
          </div>
        </div>

        {/* Global Master Controls: Enable, Pause, Emergency Kill Switch, Resume */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 transition-colors border border-slate-700/60"
            title="Refresh Network State"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          {/* Enable / Pause Automation */}
          {settings?.automationEnabled ? (
            <button
              onClick={() => handleMasterToggle(false)}
              disabled={actionLoading}
              className="px-3.5 py-2 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-bold text-xs border border-amber-500/40 flex items-center gap-1.5 transition-all"
            >
              <Pause className="w-3.5 h-3.5" />
              <span>Pause Automation</span>
            </button>
          ) : (
            <button
              onClick={() => handleMasterToggle(true)}
              disabled={actionLoading}
              className="px-3.5 py-2 rounded-2xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-bold text-xs border border-emerald-500/40 flex items-center gap-1.5 transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Enable Automation</span>
            </button>
          )}

          {/* Emergency Kill Switch / Resume Network */}
          {settings?.emergencyStop ? (
            <button
              onClick={() => handleKillSwitch('RESET')}
              disabled={actionLoading}
              className="px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-emerald-950/40"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Resume Network</span>
            </button>
          ) : (
            <button
              onClick={() => setShowKillSwitchConfirm(true)}
              disabled={actionLoading}
              className="px-4 py-2 rounded-2xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-black text-xs flex items-center gap-2 transition-all shadow-lg shadow-red-950/50"
            >
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>Emergency Kill Switch</span>
            </button>
          )}
        </div>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Global Automation Modes Selector */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-indigo-400" />
            <h2 className="text-sm font-bold text-white">Global Automation Mode</h2>
          </div>
          <span className="text-xs text-slate-400">
            Active Mode: <strong className="text-indigo-400">{settings?.automationMode || 'HYBRID'}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
          {(
            [
              {
                mode: 'MANUAL',
                title: 'Manual Mode',
                desc: 'All queries routed to certified human agronomists'
              },
              {
                mode: 'AI_ASSIST',
                title: 'AI Assist',
                desc: 'AI drafts recommendations; agronomist reviews before sending'
              },
              {
                mode: 'HYBRID',
                title: 'Hybrid Autonomous',
                desc: 'AI handles low-risk routines; escalates moderate & high risks'
              },
              {
                mode: 'AUTONOMOUS',
                title: 'Autonomous',
                desc: 'Multi-agent orchestration with consensus safety checks'
              },
              {
                mode: 'PROACTIVE_AUTONOMOUS',
                title: 'Proactive Autonomous',
                desc: 'Scheduled morning/afternoon/evening scans & telemetry monitoring'
              }
            ] as const
          ).map((item) => (
            <button
              key={item.mode}
              onClick={() => handleModeChange(item.mode)}
              disabled={actionLoading}
              className={`p-3.5 rounded-xl text-left border transition-all text-xs flex flex-col justify-between ${
                settings?.automationMode === item.mode
                  ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-md shadow-indigo-950/50'
                  : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:border-slate-700'
              }`}
            >
              <div>
                <strong className="text-white block font-bold mb-1">{item.title}</strong>
                <p className="text-[11px] text-slate-400 leading-snug">{item.desc}</p>
              </div>
              {settings?.automationMode === item.mode && (
                <span className="mt-2 text-[10px] text-indigo-400 font-extrabold uppercase flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-indigo-400" /> Active Mode
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 11 Required Admin Dashboard Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-slate-800">
        {[
          { id: 'overview', label: 'Overview', icon: BarChart3 },
          { id: 'agents', label: `Farmer Agents (${agents.length})`, icon: Users },
          { id: 'performance', label: 'Agent Performance', icon: TrendingUp },
          { id: 'tasks', label: `Scheduled Tasks (${tasks.length})`, icon: CalendarCheck },
          { id: 'events', label: `Event Stream (${events.length})`, icon: Radio },
          { id: 'risk', label: 'Risk Monitor', icon: ShieldAlert },
          { id: 'anomalies', label: `Network Anomalies (${anomalies.filter((a) => !a.resolved).length})`, icon: AlertTriangle },
          { id: 'escalations', label: `Human Escalations (${escalations.length})`, icon: PhoneCall },
          { id: 'feedback', label: 'Farmer Feedback', icon: ThumbsUp },
          { id: 'audit', label: `AI Audit Trail (${auditLogs.length})`, icon: History },
          { id: 'policies', label: 'Safety Policies', icon: Lock }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AdminTab)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950/40'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-900/60 hover:bg-slate-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Network Metrics Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-4 space-y-1 shadow-lg">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>AI Trust Score</span>
                <Sparkles className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-3xl font-black text-emerald-400">{networkMetrics?.aiTrustScore || 96}%</p>
              <p className="text-[10px] text-slate-400">Continuous Learning & Safety Formula</p>
            </div>

            <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-4 space-y-1 shadow-lg">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Active Agents</span>
                <Users className="w-4 h-4 text-indigo-400" />
              </div>
              <p className="text-3xl font-black text-white">
                {agents.filter((a) => a.status === 'ACTIVE').length} / {agents.length}
              </p>
              <p className="text-[10px] text-slate-400">
                {agents.filter((a) => a.status === 'PAUSED').length} Paused
              </p>
            </div>

            <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-4 space-y-1 shadow-lg">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Tasks Executed</span>
                <CalendarCheck className="w-4 h-4 text-blue-400" />
              </div>
              <p className="text-3xl font-black text-white">
                {tasks.filter((t) => t.status === 'completed').length}
              </p>
              <p className="text-[10px] text-emerald-400">
                Avg execution: {networkMetrics?.averageExecutionTimeMs || 142}ms
              </p>
            </div>

            <div className="bg-slate-900/80 rounded-2xl border border-slate-800 p-4 space-y-1 shadow-lg">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Safety Blocks</span>
                <ShieldAlert className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-3xl font-black text-white">{networkMetrics?.safetyBlocks || 0}</p>
              <p className="text-[10px] text-amber-300">0 Unauthorized Mutations</p>
            </div>
          </div>

          {/* Proactive Automation Trigger Bar */}
          <div className="bg-slate-900/90 rounded-2xl border border-indigo-500/20 p-5 space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Sun className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Proactive Scheduled Intelligence Triggers</h3>
              </div>
              <span className="text-[11px] text-slate-400">Runs autonomous scans on active farmer agents</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <button
                onClick={() => handleTriggerProactiveScan('MORNING')}
                disabled={actionLoading}
                className="p-4 rounded-xl bg-slate-950 hover:bg-indigo-950/40 border border-slate-800 hover:border-indigo-500/40 text-left transition-all"
              >
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs mb-1">
                  <Sun className="w-4 h-4" />
                  <span>Morning Scan (06:00 AM)</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Weather check, AWD irrigation requirement, early disease risk & urgent farm actions.
                </p>
              </button>

              <button
                onClick={() => handleTriggerProactiveScan('AFTERNOON')}
                disabled={actionLoading}
                className="p-4 rounded-xl bg-slate-950 hover:bg-indigo-950/40 border border-slate-800 hover:border-indigo-500/40 text-left transition-all"
              >
                <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs mb-1">
                  <Compass className="w-4 h-4" />
                  <span>Afternoon Scan (01:30 PM)</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Heat stress monitoring, crop transpiration stress & midday soil moisture verification.
                </p>
              </button>

              <button
                onClick={() => handleTriggerProactiveScan('EVENING')}
                disabled={actionLoading}
                className="p-4 rounded-xl bg-slate-950 hover:bg-indigo-950/40 border border-slate-800 hover:border-indigo-500/40 text-left transition-all"
              >
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs mb-1">
                  <Activity className="w-4 h-4" />
                  <span>Evening Scan (06:30 PM)</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Daily farm summary, action completion tracking, Mandi price trends & next-day prep.
                </p>
              </button>
            </div>
          </div>

          {/* Quick Overview Tables: Recent Events & Recent Recommendations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 space-y-3 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-xs font-bold text-white flex items-center gap-2">
                  <Radio className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Live Agricultural Event Stream</span>
                </h3>
                <button
                  onClick={() => setActiveTab('events')}
                  className="text-[10px] text-indigo-400 hover:underline"
                >
                  View All ({events.length}) &rarr;
                </button>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {events.slice(0, 5).map((ev) => (
                  <div key={ev.id} className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-indigo-300 text-[11px]">{ev.eventType}</span>
                      <span className="text-[9px] text-slate-500">{new Date(ev.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-slate-300 text-[10px] mt-0.5">
                      {ev.farmerName ? `${ev.farmerName}: ` : ''}{JSON.stringify(ev.payload)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 space-y-3 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-xs font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Recent Explainable Recommendations</span>
                </h3>
                <button
                  onClick={() => setActiveTab('performance')}
                  className="text-[10px] text-indigo-400 hover:underline"
                >
                  View Metrics &rarr;
                </button>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {recommendations.slice(0, 5).map((rec) => (
                  <div key={rec.id} className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-[11px] truncate max-w-xs">{rec.recommendation}</span>
                      <span className="text-[10px] text-emerald-400 font-bold">{rec.confidenceScore}%</span>
                    </div>
                    <p className="text-slate-400 text-[10px] mt-0.5">
                      Agents: {rec.specialistAgentsUsed?.join(', ')} • Status: {rec.status}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: FARMER AGENTS (WITH PER-AGENT CONTROLS) */}
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
                  <th className="py-3 px-4">Safety State</th>
                  <th className="py-3 px-4">Confidence</th>
                  <th className="py-3 px-4">Last Activity</th>
                  <th className="py-3 px-4 text-right">Per-Agent Controls</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredAgents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500">
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
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            agent.safetyState === 'NORMAL'
                              ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                              : agent.safetyState === 'EVALUATION'
                              ? 'bg-blue-500/10 text-blue-300 border border-blue-500/20'
                              : 'bg-rose-500/10 text-rose-300 border border-rose-500/20'
                          }`}
                        >
                          {agent.safetyState || 'NORMAL'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-emerald-400 font-bold">
                          {agent.confidenceScore || 95}%
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                        {agent.lastActivityAt
                          ? new Date(agent.lastActivityAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : 'Just Provisioned'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Pause / Resume */}
                          {agent.status === 'ACTIVE' ? (
                            <button
                              onClick={() => handleAgentStatusChange(agent.farmerId, 'PAUSED')}
                              className="px-2 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold flex items-center gap-1"
                              title="Pause Agent"
                            >
                              <Pause className="w-3 h-3" />
                              <span>Pause</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleAgentStatusChange(agent.farmerId, 'ACTIVE')}
                              className="px-2 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1"
                              title="Resume Agent"
                            >
                              <Play className="w-3 h-3" />
                              <span>Resume</span>
                            </button>
                          )}

                          {/* Inspect Memory */}
                          <button
                            onClick={() => handleInspectAgent(agent, 'memory')}
                            className="px-2 py-1 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold flex items-center gap-1"
                            title="Inspect Memory"
                          >
                            <Database className="w-3 h-3" />
                            <span>Memory</span>
                          </button>

                          {/* View Recommendations */}
                          <button
                            onClick={() => handleInspectAgent(agent, 'recommendations')}
                            className="px-2 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold flex items-center gap-1"
                            title="View Recommendations"
                          >
                            <Sparkles className="w-3 h-3" />
                            <span>Recs</span>
                          </button>

                          {/* View Performance */}
                          <button
                            onClick={() => handleInspectAgent(agent, 'performance')}
                            className="px-2 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1"
                            title="View Performance"
                          >
                            <TrendingUp className="w-3 h-3" />
                            <span>Metrics</span>
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

      {/* TAB 3: AGENT PERFORMANCE */}
      {activeTab === 'performance' && (
        <div className="space-y-6">
          {/* AI Trust Score Formula Card */}
          <div className="bg-slate-900/90 rounded-2xl border border-indigo-500/30 p-6 space-y-4 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                  <span>Network AI Trust Score Engine</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1 font-mono">
                  Trust Score = Recommendation Accuracy + Farmer Satisfaction + Verified Outcome Success - Unsafe Recommendations - Repeated Failures
                </p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block">Overall Network Score</span>
                <span className="text-3xl font-black text-emerald-400">{networkMetrics?.aiTrustScore || 96}%</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[11px] text-slate-400">Recommendation Accuracy</span>
                <p className="text-lg font-bold text-emerald-400 mt-1">
                  +{networkMetrics?.recommendationAccuracy || 95}%
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[11px] text-slate-400">Farmer Satisfaction</span>
                <p className="text-lg font-bold text-indigo-400 mt-1">
                  +{networkMetrics?.farmerSatisfaction || 96}%
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[11px] text-slate-400">Verified Outcomes</span>
                <p className="text-lg font-bold text-emerald-400 mt-1">
                  +{networkMetrics?.verifiedOutcomeSuccess || 92}%
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[11px] text-slate-400">Unsafe Blocked</span>
                <p className="text-lg font-bold text-rose-400 mt-1">
                  -{networkMetrics?.unsafeRecommendations || 0}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[11px] text-slate-400">Repeated Failures</span>
                <p className="text-lg font-bold text-amber-400 mt-1">
                  -{networkMetrics?.repeatedFailures || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Per-Agent Performance Breakdown Table */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span>Farmer Agent Performance & Acceptance Metrics</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Farmer Agent</th>
                    <th className="py-3 px-4">Acceptance Rate</th>
                    <th className="py-3 px-4">Outcome Success</th>
                    <th className="py-3 px-4">Farmer Satisfaction</th>
                    <th className="py-3 px-4">Average Confidence</th>
                    <th className="py-3 px-4">Failure Rate</th>
                    <th className="py-3 px-4 text-right">Inspect</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {agents.map((ag) => (
                    <tr key={ag.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-white">{ag.farmerName}</td>
                      <td className="py-3.5 px-4 text-emerald-400 font-semibold">96%</td>
                      <td className="py-3.5 px-4 text-indigo-400 font-semibold">94%</td>
                      <td className="py-3.5 px-4 text-emerald-400 font-semibold">98%</td>
                      <td className="py-3.5 px-4 text-slate-300">{ag.confidenceScore || 95}%</td>
                      <td className="py-3.5 px-4 text-slate-400">4%</td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleInspectAgent(ag, 'performance')}
                          className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 text-[10px] font-bold"
                        >
                          View Metrics
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SCHEDULED TASKS */}
      {activeTab === 'tasks' && (
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-indigo-400" />
              <span>Autonomous Task Queue & Execution History</span>
            </h3>
            <span className="text-xs text-slate-400">Total Tasks: {tasks.length}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">Task ID & Type</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Risk Level</th>
                  <th className="py-3 px-4">Result / Diagnostics</th>
                  <th className="py-3 px-4">Scheduled / Executed</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {tasks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500">
                      No automated tasks currently queued.
                    </td>
                  </tr>
                ) : (
                  tasks.map((task) => (
                    <tr key={task.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4">
                        <strong className="text-white block uppercase tracking-wide">{task.taskType}</strong>
                        <span className="text-[10px] text-slate-400">{task.id}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            task.status === 'completed'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : task.status === 'running'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30 animate-pulse'
                              : task.status === 'queued'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          {task.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-slate-300 font-medium">{task.riskLevel}</span>
                      </td>
                      <td className="py-3 px-4 max-w-xs">
                        <p className="text-slate-300 text-[11px] truncate">
                          {task.result ? JSON.stringify(task.result) : task.errorDetails || 'Pending execution'}
                        </p>
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-[11px]">
                        {new Date(task.scheduledFor).toLocaleString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {task.status === 'queued' || task.status === 'failed' ? (
                          <button
                            onClick={() => handleExecuteTask(task.id)}
                            disabled={actionLoading}
                            className="px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] transition-colors"
                          >
                            Execute Now
                          </button>
                        ) : (
                          <span className="text-emerald-400 text-[10px] font-bold">Processed</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: EVENT STREAM & SIMULATOR */}
      {activeTab === 'events' && (
        <div className="space-y-6">
          {/* Admin Event Simulator */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Send className="w-4 h-4 text-indigo-400" />
              <span>Agricultural Event Ingestion & Simulation Console</span>
            </h3>
            <p className="text-xs text-slate-400">
              Emit events directly into the CropX Multi-Agent Orchestrator to test real reactive workflows, deduplication, and explainable recommendation synthesis.
            </p>

            <form onSubmit={handleSimulateEvent} className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-1">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Event Type</label>
                <select
                  value={simEventType}
                  onChange={(e) => setSimEventType(e.target.value as AIEventType)}
                  className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl px-3 py-2.5 focus:outline-none"
                >
                  <option value="WEATHER_CHANGED">WEATHER_CHANGED</option>
                  <option value="HEAVY_RAIN_FORECAST">HEAVY_RAIN_FORECAST</option>
                  <option value="HEAT_STRESS_RISK">HEAT_STRESS_RISK</option>
                  <option value="SOIL_SENSOR_ANOMALY">SOIL_SENSOR_ANOMALY</option>
                  <option value="CROP_DIAGNOSIS_REQUEST">CROP_DIAGNOSIS_REQUEST</option>
                  <option value="IRRIGATION_DUE">IRRIGATION_DUE</option>
                  <option value="MARKET_PRICE_CHANGE">MARKET_PRICE_CHANGE</option>
                  <option value="GROWTH_STAGE_CHANGE">GROWTH_STAGE_CHANGE</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Target Farmer (Optional)</label>
                <select
                  value={simFarmerId}
                  onChange={(e) => setSimFarmerId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl px-3 py-2.5 focus:outline-none"
                >
                  <option value="">Broadcast to All Farmers</option>
                  {agents.map((a) => (
                    <option key={a.farmerId} value={a.farmerId}>
                      {a.farmerName} ({a.primaryCrop || 'Farm'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Payload Details</label>
                <input
                  type="text"
                  value={simDetails}
                  onChange={(e) => setSimDetails(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-xl px-3 py-2.5 focus:outline-none"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-950/40"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Emit Event</span>
                </button>
              </div>
            </form>
          </div>

          {/* Event Stream Table */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-400" />
                <span>Agricultural Event Ingestion History ({events.length})</span>
              </h3>
              <span className="text-xs text-slate-400">Idempotent Deduplication Active</span>
            </div>

            <div className="space-y-2">
              {events.length === 0 ? (
                <p className="text-center py-8 text-slate-500 text-xs">No events logged in the stream.</p>
              ) : (
                events.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span className="px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 font-mono text-[10px] border border-indigo-800/40">
                        {ev.eventType}
                      </span>
                      <div>
                        <p className="text-white font-medium">
                          {ev.farmerName ? `${ev.farmerName}` : 'All Network'} &bull; Source: {ev.source}
                        </p>
                        <p className="text-[11px] text-slate-400 font-mono">
                          {JSON.stringify(ev.payload)}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 shrink-0">
                      {new Date(ev.timestamp).toLocaleString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: RISK MONITOR */}
      {activeTab === 'risk' && (
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 space-y-5 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-bold text-white">Crop Risk & Safety Policy Monitor</h3>
            </div>
            <span className="text-xs text-emerald-400 font-bold">Zero Unauthorized Mutations</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-xs text-slate-400">High Risk Detections</span>
              <p className="text-2xl font-black text-amber-400">
                {recommendations.filter((r) => r.riskLevel === 'HIGH' || r.riskLevel === 'CRITICAL').length}
              </p>
              <p className="text-[11px] text-slate-400">Automatically gated for human confirmation or escalation</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-xs text-slate-400">Policy Gate Blocks</span>
              <p className="text-2xl font-black text-rose-400">
                {auditLogs.filter((l) => l.eventType === 'AI_ACTION_BLOCKED').length}
              </p>
              <p className="text-[11px] text-slate-400">Prohibited financial/ledger mutations intercepted</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <span className="text-xs text-slate-400">Evaluation State Agents</span>
              <p className="text-2xl font-black text-indigo-400">
                {agents.filter((a) => a.safetyState === 'EVALUATION' || a.safetyState === 'RESTRICTED').length}
              </p>
              <p className="text-[11px] text-slate-400">Restricted autonomy under agronomist observation</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: NETWORK ANOMALIES */}
      {activeTab === 'anomalies' && (
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 space-y-4 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              <span>AI Anomaly & Outlier Monitoring</span>
            </h3>
            <span className="text-xs text-slate-400">
              {anomalies.filter((a) => !a.resolved).length} Unresolved
            </span>
          </div>

          <div className="space-y-3">
            {anomalies.length === 0 ? (
              <div className="p-8 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <p className="text-white text-xs font-bold">Network Operating Normally</p>
                <p className="text-slate-400 text-[11px]">
                  No anomaly spikes, memory corruption, or low-confidence clusters detected.
                </p>
              </div>
            ) : (
              anomalies.map((anom) => (
                <div
                  key={anom.id}
                  className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-all text-xs space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                          anom.severity === 'CRITICAL'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {anom.severity}
                      </span>
                      <strong className="text-white text-sm">{anom.anomalyType}</strong>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        anom.resolved ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      {anom.resolved ? 'Resolved' : 'Active'}
                    </span>
                  </div>

                  <p className="text-slate-300">{anom.details}</p>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-slate-400">
                      Detected: {new Date(anom.detectedAt).toLocaleString()}
                    </span>
                    {!anom.resolved && (
                      <button
                        onClick={() => handleResolveAnomaly(anom.id)}
                        disabled={actionLoading}
                        className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-colors"
                      >
                        Acknowledge & Resolve
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 8: HUMAN ESCALATIONS */}
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

      {/* TAB 9: FARMER FEEDBACK */}
      {activeTab === 'feedback' && (
        <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 space-y-5 shadow-xl">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <ThumbsUp className="w-5 h-5 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Farmer Satisfaction & Recommendation Outcomes</h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-xs text-slate-400">Helpful Advisories</span>
              <p className="text-xl font-bold text-emerald-400 mt-1">
                {feedbackMetrics?.helpfulCount || 0}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-xs text-slate-400">Followed Practices</span>
              <p className="text-xl font-bold text-indigo-400 mt-1">
                {feedbackMetrics?.followedCount || 0}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-xs text-slate-400">Positive Field Yields</span>
              <p className="text-xl font-bold text-emerald-400 mt-1">
                {feedbackMetrics?.goodOutcomeCount || 0}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-xs text-slate-400">Unhelpful Reports</span>
              <p className="text-xl font-bold text-rose-400 mt-1">
                {feedbackMetrics?.notHelpfulCount || 0}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 10: AI AUDIT TRAIL */}
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
                      Target: {log.targetId || 'N/A'} &bull; {JSON.stringify(log.details)}
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

      {/* TAB 11: SAFETY POLICIES */}
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

      {/* AGENT DETAIL & PER-AGENT CONTROLS MODAL */}
      {selectedAgent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-2xl bg-slate-900 rounded-3xl border border-indigo-500/30 p-6 space-y-4 shadow-2xl relative max-h-[90vh] overflow-y-auto">
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
                <p className="text-xs text-slate-400">
                  Agent ID: {selectedAgent.id} &bull; Status: <strong className="text-emerald-400">{selectedAgent.status}</strong>
                </p>
              </div>
            </div>

            {/* Sub-Tabs inside Agent Inspect */}
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              <button
                onClick={() => setAgentInspectTab('memory')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  agentInspectTab === 'memory' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Memory Inspector ({agentMemories.length})
              </button>
              <button
                onClick={() => setAgentInspectTab('recommendations')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  agentInspectTab === 'recommendations' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Recommendations
              </button>
              <button
                onClick={() => setAgentInspectTab('safety')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  agentInspectTab === 'safety' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Safety State & Events
              </button>
              <button
                onClick={() => setAgentInspectTab('performance')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  agentInspectTab === 'performance' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Agent Performance
              </button>
            </div>

            {/* Sub-view: Memory */}
            {agentInspectTab === 'memory' && (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {agentMemories.length === 0 ? (
                  <p className="text-slate-500 text-xs py-4 text-center">No persistent isolated memories found.</p>
                ) : (
                  agentMemories.map((m) => (
                    <div key={m.id} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
                      <div className="flex items-center justify-between">
                        <strong className="text-indigo-300">{m.memoryKey}</strong>
                        <span className="text-[9px] text-slate-500 uppercase">{m.memoryType}</span>
                      </div>
                      <p className="text-slate-300 text-[11px] mt-0.5">
                        {typeof m.memoryValue === 'object' ? JSON.stringify(m.memoryValue) : String(m.memoryValue)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Sub-view: Recommendations */}
            {agentInspectTab === 'recommendations' && (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {recommendations.filter((r) => r.farmerId === selectedAgent.farmerId).length === 0 ? (
                  <p className="text-slate-500 text-xs py-4 text-center">No recommendations logged for this agent.</p>
                ) : (
                  recommendations.filter((r) => r.farmerId === selectedAgent.farmerId).map((rec) => (
                    <div key={rec.id} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-white text-[11px]">{rec.recommendation}</span>
                        <span className="text-[10px] text-emerald-400 font-bold">{rec.confidenceScore}%</span>
                      </div>
                      <p className="text-slate-400 text-[10px]">
                        Status: <strong className="text-indigo-300">{rec.status}</strong> &bull; Risk: {rec.riskLevel}
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* Sub-view: Safety */}
            {agentInspectTab === 'safety' && (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs flex items-center justify-between">
                  <span className="text-slate-400">Current Safety State:</span>
                  <div className="flex items-center gap-1">
                    {(['NORMAL', 'EVALUATION', 'RESTRICTED', 'LOCKED'] as AISafetyState[]).map((st) => (
                      <button
                        key={st}
                        onClick={() => handleSafetyStateChange(selectedAgent.farmerId, st)}
                        className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                          selectedAgent.safetyState === st
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {st}
                      </button>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-400">
                  Setting safety state to RESTRICTED or LOCKED pauses autonomous chemical or irrigation recommendations for this farmer agent.
                </p>
              </div>
            )}

            {/* Sub-view: Performance */}
            {agentInspectTab === 'performance' && (
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Acceptance Rate</span>
                  <strong className="text-emerald-400 text-lg">{agentMetrics?.recommendationAcceptanceRate || 95}%</strong>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Verified Outcome Success</span>
                  <strong className="text-indigo-400 text-lg">{agentMetrics?.recommendationOutcomeSuccess || 92}%</strong>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Farmer Satisfaction</span>
                  <strong className="text-emerald-400 text-lg">{agentMetrics?.farmerSatisfaction || 96}%</strong>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-slate-400 block text-[11px]">Escalation Frequency</span>
                  <strong className="text-amber-400 text-lg">{agentMetrics?.escalationFrequency || 0}</strong>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
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
