import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  UserCheck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  Filter, 
  RefreshCw, 
  Award, 
  Eye, 
  Check, 
  X, 
  AlertCircle, 
  FileText, 
  GraduationCap, 
  Briefcase, 
  Layers, 
  ChevronDown,
  ExternalLink,
  Loader2,
  Key
} from 'lucide-react';

export interface AdviserApplication {
  id: string;
  userId?: string;
  mobile: string;
  fullName: string;
  email?: string;
  specialization: string;
  yearsOfExperience: number;
  qualification: string;
  institution?: string;
  primaryCrops: string[];
  secondaryCrops?: string[];
  languages: string[];
  region?: string;
  district?: string;
  state?: string;
  status:
    | 'REGISTERED'
    | 'OTP_VERIFIED'
    | 'ASSESSMENT_REQUIRED'
    | 'NOT_ELIGIBLE'
    | 'PENDING_ADMIN_REVIEW'
    | 'APPROVED'
    | 'REJECTED'
    | 'ACTIVATION_REQUIRED'
    | 'LEARNING_REQUIRED'
    | 'ACTIVE';
  assessmentScore?: number;
  assessmentTotal?: number;
  assessmentPercentage?: number;
  assessmentSubmittedAt?: string;
  assessmentCategoryBreakdown?: Record<string, { correct: number; total: number }>;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  activationToken?: string;
  passwordSetupCompleted?: boolean;
  courseCompleted?: boolean;
  masteryScore?: number;
  createdAt: string;
  updatedAt: string;
}

interface AdviserVerificationAdminViewProps {
  currentUser?: any;
}

export const AdviserVerificationAdminView: React.FC<AdviserVerificationAdminViewProps> = ({
  currentUser
}) => {
  const [applications, setApplications] = useState<AdviserApplication[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  
  // Modals & Action States
  const [selectedApp, setSelectedApp] = useState<AdviserApplication | null>(null);
  const [showRejectModal, setShowRejectModal] = useState<boolean>(false);
  const [rejectingApp, setRejectingApp] = useState<AdviserApplication | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [actionInProgress, setActionInProgress] = useState<boolean>(false);
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/adviser/applications');
      const data = await res.json();
      if (data.success && Array.isArray(data.applications)) {
        setApplications(data.applications);
      }
    } catch (err) {
      console.warn('Error fetching adviser applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
    const interval = setInterval(fetchApplications, 20000);
    return () => clearInterval(interval);
  }, []);

  const handleApprove = async (app: AdviserApplication) => {
    setActionInProgress(true);
    setActionFeedback(null);
    try {
      const res = await fetch('/api/admin/adviser/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: app.id,
          action: 'APPROVE',
          reviewedBy: currentUser?.fullName || 'Administrator'
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to approve application.');
      }

      setActionFeedback({
        type: 'success',
        message: `Successfully approved verification for ${app.fullName} (${app.mobile}).`
      });

      fetchApplications();
    } catch (err: any) {
      setActionFeedback({
        type: 'error',
        message: err.message || 'Error approving application.'
      });
    } finally {
      setActionInProgress(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectingApp) return;
    setActionInProgress(true);
    setActionFeedback(null);
    try {
      const res = await fetch('/api/admin/adviser/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: rejectingApp.id,
          action: 'REJECT',
          reviewedBy: currentUser?.fullName || 'Administrator',
          rejectionReason: rejectionReason || 'Application does not meet current verification standards.'
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to reject application.');
      }

      setActionFeedback({
        type: 'success',
        message: `Application for ${rejectingApp.fullName} has been rejected.`
      });

      setShowRejectModal(false);
      setRejectingApp(null);
      setRejectionReason('');
      fetchApplications();
    } catch (err: any) {
      setActionFeedback({
        type: 'error',
        message: err.message || 'Error rejecting application.'
      });
    } finally {
      setActionInProgress(false);
    }
  };

  // Filtered List
  const filteredApplications = applications.filter(app => {
    const matchesSearch =
      searchQuery === '' ||
      app.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.mobile.includes(searchQuery) ||
      app.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.district && app.district.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus =
      statusFilter === 'ALL' ||
      (statusFilter === 'PENDING' && app.status === 'PENDING_ADMIN_REVIEW') ||
      (statusFilter === 'APPROVED' && (app.status === 'APPROVED' || app.status === 'LEARNING_REQUIRED' || app.status === 'ACTIVE')) ||
      (statusFilter === 'REJECTED' && (app.status === 'REJECTED' || app.status === 'NOT_ELIGIBLE'));

    return matchesSearch && matchesStatus;
  });

  // Summary Metrics
  const pendingCount = applications.filter(a => a.status === 'PENDING_ADMIN_REVIEW').length;
  const approvedCount = applications.filter(a => a.status === 'APPROVED' || a.status === 'LEARNING_REQUIRED' || a.status === 'ACTIVE').length;
  const rejectedCount = applications.filter(a => a.status === 'REJECTED' || a.status === 'NOT_ELIGIBLE').length;

  return (
    <div className="space-y-6">
      {/* Top Banner & Metrics */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              Adviser Credential Verification & Audit Board
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold">
              PHASE 43 ACTIVE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Authoritative vetting pipeline: 50-Question Assessment Scoring, Qualification Verification, Cryptographic Activation & Learning Gateway Tracking.
          </p>
        </div>

        <button
          onClick={fetchApplications}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all border border-slate-700 shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Action Feedback Banner */}
      {actionFeedback && (
        <div className={`p-4 rounded-2xl border text-xs sm:text-sm flex items-center justify-between gap-3 ${
          actionFeedback.type === 'success'
            ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
            : 'bg-red-950/60 border-red-500/40 text-red-200'
        }`}>
          <div className="flex items-center gap-2">
            {actionFeedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span>{actionFeedback.message}</span>
          </div>
          <button
            onClick={() => setActionFeedback(null)}
            className="text-xs text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Applications</div>
          <div className="text-2xl font-bold font-mono text-white">{applications.length}</div>
        </div>

        <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 space-y-1">
          <div className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">Pending Admin Review</div>
          <div className="text-2xl font-bold font-mono text-amber-300">{pendingCount}</div>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-1">
          <div className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">Approved / Active</div>
          <div className="text-2xl font-bold font-mono text-emerald-300">{approvedCount}</div>
        </div>

        <div className="p-4 rounded-2xl bg-red-950/30 border border-red-500/30 space-y-1">
          <div className="text-[11px] font-semibold text-red-400 uppercase tracking-wider">Rejected / Ineligible</div>
          <div className="text-2xl font-bold font-mono text-red-300">{rejectedCount}</div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search candidate name, mobile, specialty..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
          {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map(f => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                statusFilter === f
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {f === 'ALL' && 'All Applications'}
              {f === 'PENDING' && `Pending Review (${pendingCount})`}
              {f === 'APPROVED' && `Approved (${approvedCount})`}
              {f === 'REJECTED' && `Rejected (${rejectedCount})`}
            </button>
          ))}
        </div>
      </div>

      {/* Applications Table / Cards */}
      {filteredApplications.length === 0 ? (
        <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800 text-center space-y-3 max-w-md mx-auto my-6">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-xl mx-auto text-slate-400">
            🔍
          </div>
          <h4 className="text-sm font-bold text-white">No Matching Adviser Applications</h4>
          <p className="text-xs text-slate-400">
            Applications submitted by prospective agronomists via the onboarding gateway will appear here for review.
          </p>
        </div>
      ) : (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/80 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-4">Candidate & Mobile</th>
                  <th className="p-4">Specialization & Exp</th>
                  <th className="p-4">Qualification</th>
                  <th className="p-4">50-Q Assessment</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredApplications.map(app => {
                  const score = app.assessmentScore ?? 0;
                  const total = app.assessmentTotal ?? 50;
                  const pct = app.assessmentPercentage ?? Math.round((score / total) * 100);
                  const isEligible = score >= 25;

                  return (
                    <tr key={app.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-white text-sm">{app.fullName}</div>
                        <div className="text-slate-400 font-mono text-[11px] mt-0.5">{app.mobile}</div>
                        {app.district && (
                          <div className="text-[10px] text-slate-500">{app.district}, {app.state}</div>
                        )}
                      </td>

                      <td className="p-4">
                        <div className="font-medium text-emerald-400">{app.specialization}</div>
                        <div className="text-slate-400 text-[11px] mt-0.5">{app.yearsOfExperience} Years Experience</div>
                        <div className="text-[10px] text-slate-500">Crops: {app.primaryCrops.join(', ')}</div>
                      </td>

                      <td className="p-4">
                        <div className="text-slate-200 font-medium">{app.qualification}</div>
                        <div className="text-slate-400 text-[10px]">{app.institution || 'University'}</div>
                        <div className="text-[10px] text-slate-500">Lang: {app.languages.join(', ')}</div>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-lg text-xs font-mono font-bold border ${
                            isEligible
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-500/30'
                              : 'bg-red-950 text-red-300 border-red-500/30'
                          }`}>
                            {score} / {total} ({pct}%)
                          </span>
                        </div>
                        <button
                          onClick={() => setSelectedApp(app)}
                          className="text-[10px] text-teal-400 hover:underline mt-1 block"
                        >
                          View Breakdown
                        </button>
                      </td>

                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 border ${
                          app.status === 'PENDING_ADMIN_REVIEW'
                            ? 'bg-amber-950/80 text-amber-300 border-amber-500/40'
                            : app.status === 'APPROVED'
                            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                            : app.status === 'ACTIVE'
                            ? 'bg-teal-950 text-teal-300 border-teal-500/40'
                            : app.status === 'LEARNING_REQUIRED'
                            ? 'bg-blue-950 text-blue-300 border-blue-500/40'
                            : 'bg-red-950 text-red-300 border-red-500/40'
                        }`}>
                          {app.status}
                        </span>
                      </td>

                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {app.status === 'PENDING_ADMIN_REVIEW' && (
                            <>
                              <button
                                onClick={() => handleApprove(app)}
                                disabled={actionInProgress}
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1 cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Approve</span>
                              </button>
                              <button
                                onClick={() => {
                                  setRejectingApp(app);
                                  setShowRejectModal(true);
                                }}
                                disabled={actionInProgress}
                                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-red-950/60 hover:text-red-300 text-slate-300 font-bold text-xs border border-slate-700 transition-all flex items-center gap-1 cursor-pointer"
                              >
                                <X className="w-3.5 h-3.5" />
                                <span>Reject</span>
                              </button>
                            </>
                          )}

                          {app.status === 'APPROVED' && (
                            <span className="text-[11px] text-emerald-400 font-medium">
                              Approved • Awaiting Password
                            </span>
                          )}

                          {app.status === 'LEARNING_REQUIRED' && (
                            <span className="text-[11px] text-blue-400 font-medium">
                              In Learning Gateway
                            </span>
                          )}

                          {app.status === 'ACTIVE' && (
                            <span className="text-[11px] text-teal-400 font-medium">
                              Verified & Active
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CATEGORY BREAKDOWN MODAL */}
      <AnimatePresence>
        {selectedApp && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h4 className="text-base font-bold text-white">Assessment Category Breakdown</h4>
                  <p className="text-xs text-slate-400">{selectedApp.fullName} ({selectedApp.mobile})</p>
                </div>
                <button
                  onClick={() => setSelectedApp(null)}
                  className="text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-around text-center">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Total Score</div>
                  <div className="text-xl font-bold font-mono text-emerald-400">
                    {selectedApp.assessmentScore} / {selectedApp.assessmentTotal || 50}
                  </div>
                </div>
                <div className="w-px h-8 bg-slate-700" />
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Percentage</div>
                  <div className="text-xl font-bold font-mono text-emerald-400">
                    {selectedApp.assessmentPercentage}%
                  </div>
                </div>
                <div className="w-px h-8 bg-slate-700" />
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Eligibility</div>
                  <div className={`text-xs font-bold ${
                    (selectedApp.assessmentScore || 0) >= 25 ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {(selectedApp.assessmentScore || 0) >= 25 ? 'Passed (≥50%)' : 'Failed (<50%)'}
                  </div>
                </div>
              </div>

              {selectedApp.assessmentCategoryBreakdown && (
                <div className="space-y-2.5">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Domain Performance
                  </div>
                  {Object.entries(selectedApp.assessmentCategoryBreakdown).map(([cat, data]) => {
                    const catPct = Math.round((data.correct / data.total) * 100);
                    return (
                      <div key={cat} className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="font-medium text-slate-200">{cat}</span>
                          <span className="font-mono font-bold text-emerald-400">{data.correct}/{data.total} ({catPct}%)</span>
                        </div>
                        <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full"
                            style={{ width: `${catPct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setSelectedApp(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* REJECTION REASON MODAL */}
      <AnimatePresence>
        {showRejectModal && rejectingApp && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3 text-red-400">
                <XCircle className="w-6 h-6 shrink-0" />
                <div>
                  <h4 className="text-base font-bold text-white">Reject Adviser Application</h4>
                  <p className="text-xs text-slate-400">{rejectingApp.fullName} ({rejectingApp.mobile})</p>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">
                  Reason for Rejection (Visible to Applicant)
                </label>
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={e => setRejectionReason(e.target.value)}
                  placeholder="e.g. Qualification credentials could not be verified, or assessment score is below specialization requirements."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectingApp(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReject}
                  disabled={actionInProgress}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md"
                >
                  {actionInProgress ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
