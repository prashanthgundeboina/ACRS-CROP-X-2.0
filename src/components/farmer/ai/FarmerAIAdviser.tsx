import React, { useState, useEffect } from 'react';
import {
  Bot,
  Sparkles,
  ShieldCheck,
  PhoneCall,
  AlertTriangle,
  RefreshCw,
  Clock,
  Layers,
  Activity,
  CheckCircle2,
  Calendar,
  Radio,
  X
} from 'lucide-react';
import { AgentChat } from './AgentChat';
import { AIInsights } from './AIInsights';
import { AIActivityTimeline } from './AIActivityTimeline';
import { DailyFarmPlanView } from './DailyFarmPlanView';
import { RecommendationsView } from './RecommendationsView';
import { TelemetryView } from './TelemetryView';
import { FarmerAIAgent, AIInsightSummary, AIAgentInteraction } from '../../../types';
import { useLanguage } from '../../../context/LanguageContext';

interface FarmerAIAdviserProps {
  farmer: {
    id: string;
    name: string;
    phoneNumber?: string;
    location?: string;
    primaryCrop?: string;
    farmSizeAcres?: number;
    profileImage?: string;
  };
  onCallHumanAdviser?: () => void;
}

type FarmerAITab = 'chat' | 'plan' | 'recommendations' | 'telemetry';

export const FarmerAIAdviser: React.FC<FarmerAIAdviserProps> = ({
  farmer,
  onCallHumanAdviser
}) => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<FarmerAITab>('chat');
  const [agent, setAgent] = useState<FarmerAIAgent | null>(null);
  const [insights, setInsights] = useState<AIInsightSummary | null>(null);
  const [memoriesCount, setMemoriesCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [showEscalateModal, setShowEscalateModal] = useState<boolean>(false);
  const [escalateReason, setEscalateReason] = useState<string>('');
  const [escalateSuccess, setEscalateSuccess] = useState<string | null>(null);
  const [submittingEscalation, setSubmittingEscalation] = useState<boolean>(false);

  // Fetch or provision agent profile & insights
  const loadAgentData = async () => {
    try {
      setLoading(true);
      // 1. Provision / Fetch Agent
      const provRes = await fetch('/api/ai/agent/provision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmer: {
            id: farmer.id,
            name: farmer.name,
            phone: farmer.phoneNumber,
            location: farmer.location,
            primaryCrop: farmer.primaryCrop,
            farmSizeAcres: farmer.farmSizeAcres,
            language
          }
        })
      });

      if (provRes.ok) {
        const provData = await provRes.json();
        setAgent(provData.agent);
      }

      // 2. Fetch Insights
      const insRes = await fetch(
        `/api/ai/insights?farmerId=${encodeURIComponent(farmer.id)}&name=${encodeURIComponent(
          farmer.name
        )}&primaryCrop=${encodeURIComponent(farmer.primaryCrop || 'Paddy')}&location=${encodeURIComponent(
          farmer.location || 'Rural Farm'
        )}`
      );

      if (insRes.ok) {
        const insData = await insRes.json();
        setInsights(insData);
        setMemoriesCount(insData.memoriesCount || 0);
      }
    } catch (err) {
      console.error('Error loading farmer AI agent data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAgentData();
  }, [farmer.id, farmer.primaryCrop, language]);

  const handleEscalateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!escalateReason.trim()) return;

    try {
      setSubmittingEscalation(true);
      const res = await fetch('/api/ai/escalate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmerId: farmer.id,
          farmerName: farmer.name,
          farmerPhone: farmer.phoneNumber,
          agentId: agent?.id,
          reason: escalateReason,
          contextSummary: `Crop: ${farmer.primaryCrop || 'Standing Crop'} | Location: ${farmer.location || 'Field'}`
        })
      });

      if (res.ok) {
        const data = await res.json();
        setEscalateSuccess(data.escalation.id);
        setEscalateReason('');
        loadAgentData();
        if (onCallHumanAdviser) {
          setTimeout(() => {
            onCallHumanAdviser();
          }, 2000);
        }
      }
    } catch (err) {
      console.error('Failed to submit escalation:', err);
    } finally {
      setSubmittingEscalation(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Dedicated AI Agronomist Profile */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-emerald-950/40 border border-emerald-500/20 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative z-10">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-xl shadow-emerald-950/50">
                <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
                  <Bot className="w-8 h-8 text-emerald-400" />
                </div>
              </div>
              <span
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-900 ${
                  agent?.status === 'ACTIVE'
                    ? 'bg-emerald-400 ring-2 ring-emerald-400/20 animate-pulse'
                    : 'bg-amber-500'
                }`}
              />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white">
                  CropX Autonomous AI Agronomist
                </h2>
                <span className="text-[10px] sm:text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  {agent?.automationMode || 'HYBRID'} MODE
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-bold border border-blue-500/30">
                  {agent?.confidenceScore || 95}% Confidence Rating
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Personalized intelligent advisory for{' '}
                <strong className="text-emerald-300">{farmer.name}</strong> &bull;{' '}
                <span>{farmer.primaryCrop || 'Paddy'} Cultivation</span> ({farmer.farmSizeAcres || 3} Acres)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <button
              onClick={() => setShowEscalateModal(true)}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold transition-all shadow-md"
            >
              <PhoneCall className="w-4 h-4" />
              <span>Request Human Adviser</span>
            </button>
            <button
              onClick={loadAgentData}
              className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-slate-300 transition-colors"
              title="Refresh AI Models & Telemetry"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-400' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic Telemetry Insights Banner */}
      <AIInsights
        insights={insights}
        loading={loading}
        farmerCrop={farmer.primaryCrop}
        farmLocation={farmer.location}
      />

      {/* Navigation Tabs for Farmer AI Adviser */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-800">
        {[
          { id: 'chat', label: 'Adviser Chat', icon: Bot },
          { id: 'plan', label: 'Daily Farm Plan', icon: Calendar },
          { id: 'recommendations', label: 'Explainable Recommendations', icon: Sparkles },
          { id: 'telemetry', label: 'Farm Telemetry & Sensors', icon: Radio }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as FarmerAITab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                  : 'text-slate-400 hover:text-slate-200 bg-slate-900/60 hover:bg-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Interactive Chat & Timeline */}
      {activeTab === 'chat' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7">
            <AgentChat
              farmer={farmer}
              onEscalateRequested={() => setShowEscalateModal(true)}
              automationMode={agent?.automationMode}
              isPaused={agent?.status === 'PAUSED' || agent?.status === 'DISABLED'}
            />
          </div>
          <div className="lg:col-span-5">
            <AIActivityTimeline
              interactions={insights?.recentInteractions || []}
              memoriesCount={memoriesCount}
            />
          </div>
        </div>
      )}

      {/* Tab 2: Daily Farm Plan */}
      {activeTab === 'plan' && (
        <DailyFarmPlanView
          farmerId={farmer.id}
          farmerName={farmer.name}
          cropName={farmer.primaryCrop}
          location={farmer.location}
        />
      )}

      {/* Tab 3: Explainable Recommendations & Continuous Learning */}
      {activeTab === 'recommendations' && (
        <RecommendationsView farmerId={farmer.id} />
      )}

      {/* Tab 4: Live Telemetry */}
      {activeTab === 'telemetry' && (
        <TelemetryView
          farmerId={farmer.id}
          cropName={farmer.primaryCrop}
          location={farmer.location}
        />
      )}

      {/* Human Escalation Modal */}
      {showEscalateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-lg bg-slate-900 rounded-3xl border border-amber-500/30 shadow-2xl p-6 relative">
            <button
              onClick={() => {
                setShowEscalateModal(false);
                setEscalateSuccess(null);
              }}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <PhoneCall className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Escalate to Human Agronomist</h3>
                <p className="text-xs text-slate-400">
                  A certified district agronomist will review your field condition and call you.
                </p>
              </div>
            </div>

            {escalateSuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <h4 className="text-sm font-bold text-white">Escalation Ticket Registered</h4>
                <p className="text-xs text-slate-300">
                  Ticket ID: <strong className="text-emerald-400">{escalateSuccess}</strong>. An agronomist will review within 30 minutes.
                </p>
              </div>
            ) : (
              <form onSubmit={handleEscalateSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    What field issue requires human agronomist verification?
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={escalateReason}
                    onChange={(e) => setEscalateReason(e.target.value)}
                    placeholder="Describe specific symptoms, leaf discoloration, suspected pest, or chemical uncertainty..."
                    className="w-full bg-slate-950 border border-slate-800 text-white text-xs rounded-2xl p-3 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                  <p>
                    <strong className="text-slate-300">Farmer:</strong> {farmer.name} ({farmer.phoneNumber || 'Registered Phone'})
                  </p>
                  <p>
                    <strong className="text-slate-300">Standing Crop:</strong> {farmer.primaryCrop || 'Paddy'} &bull; {farmer.location || 'Rural Farm'}
                  </p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowEscalateModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingEscalation || !escalateReason.trim()}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-lg shadow-amber-950/40 disabled:opacity-50"
                  >
                    {submittingEscalation ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Submitting Ticket...</span>
                      </>
                    ) : (
                      <>
                        <PhoneCall className="w-3.5 h-3.5" />
                        <span>Submit for Human Review</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
