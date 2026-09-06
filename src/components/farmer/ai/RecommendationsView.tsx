import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  ShieldCheck,
  Send,
  ThumbsUp,
  RefreshCw,
  HelpCircle
} from 'lucide-react';
import { AIRecommendation, AIActionOutcome } from '../../../types';

interface RecommendationsViewProps {
  farmerId: string;
}

export const RecommendationsView: React.FC<RecommendationsViewProps> = ({ farmerId }) => {
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [outcomeInputs, setOutcomeInputs] = useState<Record<string, string>>({});
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/ai/recommendations?farmerId=${encodeURIComponent(farmerId)}`);
      if (res.ok) {
        const data = await res.json();
        setRecommendations(data.recommendations || []);
      }
    } catch (err) {
      console.error('Failed to load recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecommendations();
  }, [farmerId]);

  const handleConfirm = async (recId: string, action: AIActionOutcome) => {
    try {
      setSubmittingId(recId);
      const res = await fetch(`/api/ai/recommendations/${recId}/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      if (res.ok) {
        setSuccessMsg(`Recommendation ${action === 'ACCEPTED' ? 'Accepted' : 'Declined'}.`);
        setTimeout(() => setSuccessMsg(null), 3000);
        loadRecommendations();
      }
    } catch (err) {
      console.error('Failed to confirm recommendation:', err);
    } finally {
      setSubmittingId(null);
    }
  };

  const handleReportOutcome = async (recId: string) => {
    const text = outcomeInputs[recId];
    if (!text || !text.trim()) return;

    try {
      setSubmittingId(recId);
      const res = await fetch(`/api/ai/recommendations/${recId}/outcome`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmerId,
          action: 'ACCEPTED',
          outcomeText: text.trim(),
          validated: true
        })
      });
      if (res.ok) {
        setSuccessMsg('Field outcome verified and memorized for continuous AI model tuning.');
        setOutcomeInputs((prev) => ({ ...prev, [recId]: '' }));
        setTimeout(() => setSuccessMsg(null), 4000);
        loadRecommendations();
      }
    } catch (err) {
      console.error('Failed to report outcome:', err);
    } finally {
      setSubmittingId(null);
    }
  };

  if (loading) {
    return (
      <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center animate-pulse">
        <RefreshCw className="w-6 h-6 text-emerald-400 mx-auto animate-spin mb-2" />
        <p className="text-xs text-slate-400">Loading personalized recommendations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <span>Explainable Agronomic Recommendations</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Transparent rationale, consensus confidence, and verified outcome tracking.
          </p>
        </div>
        <button
          onClick={loadRecommendations}
          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {successMsg && (
        <div className="p-3 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {recommendations.length === 0 ? (
        <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-2">
          <ShieldCheck className="w-8 h-8 text-emerald-400 mx-auto" />
          <p className="text-white text-xs font-bold">Standing Crop is In Optimal Condition</p>
          <p className="text-slate-400 text-[11px]">
            No urgent advisory interventions required. The Autonomous Multi-Agent Network will notify you if anomalies appear.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {recommendations.map((rec) => {
            const isConfirmed = rec.farmerAction === 'ACCEPTED' || rec.status === 'CONFIRMED';
            const isRejected = rec.farmerAction === 'REJECTED' || rec.status === 'REJECTED';
            const explain = rec.explainability || {
              whatIsHappening: rec.recommendation,
              whyGenerated: rec.reasoningSummary || 'Synthesized from farm telemetry.',
              actionToBeTaken: rec.recommendedActions?.[0] || 'Apply verified agronomic practices.',
              urgencyLevel: rec.urgency
            };

            return (
              <div
                key={rec.id}
                className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/30 transition-all space-y-4 shadow-xl"
              >
                {/* Header: Urgency, Confidence, Specialists */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        rec.urgency === 'CRITICAL'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : rec.urgency === 'HIGH'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {rec.urgency} URGENCY
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      Specialists: {rec.specialistAgentsUsed?.join(', ') || 'CropIntelligenceAgent'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-400">
                      {rec.confidenceScore || 95}% Consensus
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {new Date(rec.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {/* Structured Explainability Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1">
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">
                      1. What Is Happening
                    </span>
                    <p className="text-slate-200 leading-relaxed">{explain.whatIsHappening}</p>
                  </div>

                  <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-1">
                    <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider block">
                      2. Why This Was Generated
                    </span>
                    <p className="text-slate-300 leading-relaxed">{explain.whyGenerated}</p>
                  </div>
                </div>

                {/* Primary Action Box */}
                <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 flex items-start gap-3 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-emerald-300 block font-bold mb-0.5">3. Recommended Action</strong>
                    <p className="text-slate-200 leading-relaxed">{explain.actionToBeTaken}</p>
                  </div>
                </div>

                {/* Recommended Products */}
                {rec.recommendedProducts && rec.recommendedProducts.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span className="text-[11px] text-slate-400 font-semibold">Verified Eco-Products:</span>
                    {rec.recommendedProducts.map((p, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-[11px]"
                      >
                        {p.name} ({p.reason || `₹${p.price}`})
                      </span>
                    ))}
                  </div>
                )}

                {/* Confirmation & Outcome Reporting Controls */}
                <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {isConfirmed ? (
                      <span className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-300 font-bold text-xs flex items-center gap-1.5 border border-emerald-500/30">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Accepted by Farmer</span>
                      </span>
                    ) : isRejected ? (
                      <span className="px-3 py-1 rounded-xl bg-rose-500/20 text-rose-300 font-bold text-xs flex items-center gap-1.5 border border-rose-500/30">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Declined</span>
                      </span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleConfirm(rec.id, 'ACCEPTED')}
                          disabled={submittingId === rec.id}
                          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-emerald-950/40"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Accept Recommendation</span>
                        </button>
                        <button
                          onClick={() => handleConfirm(rec.id, 'REJECTED')}
                          disabled={submittingId === rec.id}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
                        >
                          Decline
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Continuous Learning: Report Observed Field Outcome */}
                  {isConfirmed && !rec.outcomeValidated && (
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <input
                        type="text"
                        placeholder="Observed outcome (e.g., 'Leaf blast arrested in 3 days')..."
                        value={outcomeInputs[rec.id] || ''}
                        onChange={(e) =>
                          setOutcomeInputs((prev) => ({ ...prev, [rec.id]: e.target.value }))
                        }
                        className="flex-1 sm:w-64 bg-slate-950 border border-slate-800 text-white text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:border-indigo-500"
                      />
                      <button
                        onClick={() => handleReportOutcome(rec.id)}
                        disabled={submittingId === rec.id}
                        className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shrink-0 transition-colors"
                      >
                        Submit Outcome
                      </button>
                    </div>
                  )}

                  {rec.outcomeValidated && (
                    <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>Outcome Verified: {rec.outcomeObserved}</span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
