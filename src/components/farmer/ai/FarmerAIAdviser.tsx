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
  X
} from 'lucide-react';
import { AgentChat } from './AgentChat';
import { AIInsights } from './AIInsights';
import { AIActivityTimeline } from './AIActivityTimeline';
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

export const FarmerAIAdviser: React.FC<FarmerAIAdviserProps> = ({
  farmer,
  onCallHumanAdviser
}) => {
  const { language } = useLanguage();
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
                <strong className="text-emerald-300">{farmer.name}</strong> •{' '}
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

      {/* Main Grid: Interactive Chat & Activity Log */}
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
                <h3 className="text-base font-bold text-white">
                  Request Certified Human Agronomist
                </h3>
                <p className="text-xs text-slate-400">
                  Direct escalation from your AI advisory session
                </p>
              </div>
            </div>

            {escalateSuccess ? (
              <div className="p-5 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                <h4 className="text-sm font-bold text-white">
                  Agronomist Ticket Queued Successfully!
                </h4>
                <p className="text-xs text-slate-300">
                  Your ticket reference is{' '}
                  <strong className="text-emerald-400">{escalateSuccess}</strong>. An agronomist is
                  reviewing your field history and will contact you.
                </p>
                <button
                  onClick={() => {
                    setShowEscalateModal(false);
                    setEscalateSuccess(null);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors"
                >
                  Return to Dashboard
                </button>
              </div>
            ) : (
              <form onSubmit={handleEscalateSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Describe your crop concern or urgency:
                  </label>
                  <textarea
                    rows={4}
                    value={escalateReason}
                    onChange={(e) => setEscalateReason(e.target.value)}
                    placeholder="E.g., Severe leaf browning across 2 acres despite neem spray, need expert agronomist field visit or call..."
                    required
                    className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500 text-white text-xs sm:text-sm rounded-xl p-3.5 focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none"
                  />
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                  <p className="font-semibold text-slate-300">Included in Escalation Packet:</p>
                  <p>• Soil Telemetry (pH 6.8, N-P-K readings)</p>
                  <p>• Recent AI recommendations & conversation memory</p>
                  <p>• Farm acreage & primary crop profile ({farmer.primaryCrop})</p>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowEscalateModal(false)}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingEscalation || !escalateReason.trim()}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-bold transition-all shadow-lg shadow-amber-950/40 disabled:opacity-40"
                  >
                    {submittingEscalation ? 'Dispatching Ticket...' : 'Confirm Escalation'}
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
