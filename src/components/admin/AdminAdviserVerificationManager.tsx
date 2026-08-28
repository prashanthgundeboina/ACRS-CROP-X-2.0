import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  UserCheck, ShieldCheck, CheckCircle2, XCircle, Clock, AlertTriangle,
  Search, RefreshCw, Eye, Key, Copy, Check, ExternalLink, Filter,
  BookOpen, Award, Sparkles, ChevronRight, HelpCircle, FileCheck, Layers
} from 'lucide-react';
import { AdviserApplication } from '../../types';

interface AdminAdviserVerificationManagerProps {
  onRefreshParent?: () => void;
}

export const AdminAdviserVerificationManager: React.FC<AdminAdviserVerificationManagerProps> = ({
  onRefreshParent
}) => {
  const [applications, setApplications] = useState<AdviserApplication[]>([]);
  const [metrics, setMetrics] = useState({
    total: 0,
    pendingReview: 0,
    approved: 0,
    active: 0,
    notEligible: 0,
    rejected: 0
  });
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [selectedApp, setSelectedApp] = useState<AdviserApplication | null>(null);
  const [showApproveModal, setShowApproveModal] = useState<AdviserApplication | null>(null);
  const [showRejectModal, setShowRejectModal] = useState<AdviserApplication | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [approvalResult, setApprovalResult] = useState<{
    token: string;
    expiresAt: string;
    application: AdviserApplication;
  } | null>(null);
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/adviser/applications', {
        headers: {
          'x-user-role': 'admin'
        }
      });
      if (res.ok) {
        const data = await res.json();
        setApplications(data.applications || []);
        if (data.metrics) setMetrics(data.metrics);
      }
    } catch (err) {
      console.error('Failed to load applications:', err);
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
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/adviser/applications/${app.id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'admin'
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setApprovalResult({
          token: data.activationToken,
          expiresAt: data.expiresAt,
          application: data.application
        });
        setShowApproveModal(null);
        fetchApplications();
        if (onRefreshParent) onRefreshParent();
      } else {
        alert(data.error || 'Failed to approve application');
      }
    } catch (err: any) {
      alert(err.message || 'Error approving application');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!showRejectModal) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/admin/adviser/applications/${showRejectModal.id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'admin'
        },
        body: JSON.stringify({ reason: rejectionReason || 'Qualifications or assessment criteria not fully met' })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setShowRejectModal(null);
        setRejectionReason('');
        fetchApplications();
        if (onRefreshParent) onRefreshParent();
      } else {
        alert(data.error || 'Failed to reject application');
      }
    } catch (err: any) {
      alert(err.message || 'Error rejecting application');
    } finally {
      setActionLoading(false);
    }
  };

  const copyToClipboard = (text: string, isUrl = false) => {
    navigator.clipboard.writeText(text);
    if (isUrl) {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 3000);
    } else {
      setCopiedToken(true);
      setTimeout(() => setCopiedToken(false), 3000);
    }
  };

  const filteredApps = applications.filter(app => {
    const matchesSearch =
      (app.fullName && app.fullName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (app.mobile && app.mobile.includes(searchQuery)) ||
      (app.specialization && app.specialization.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (app.qualification && app.qualification.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;
    if (filterStatus === 'ALL') return true;
    return app.status === filterStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING_ADMIN_REVIEW':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-bold">
            <Clock className="w-3 h-3" />
            Pending Review
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[11px] font-bold">
            <Key className="w-3 h-3" />
            Approved (Token Issued)
          </span>
        );
      case 'LEARNING_REQUIRED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-[11px] font-bold">
            <BookOpen className="w-3 h-3" />
            In Learning Course
          </span>
        );
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold">
            <CheckCircle2 className="w-3 h-3" />
            Active Certified
          </span>
        );
      case 'NOT_ELIGIBLE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-[11px] font-bold">
            <XCircle className="w-3 h-3" />
            Assessment Failed (&lt;50%)
          </span>
        );
      case 'REJECTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-700/50 border border-slate-600 text-slate-400 text-[11px] font-bold">
            <XCircle className="w-3 h-3" />
            Rejected by Admin
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800 text-slate-400 text-[11px] font-bold">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Title & Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-white tracking-tight">Adviser Verification & Onboarding Hub</h2>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-mono font-bold border border-emerald-500/30">
              PHASE 43 GATEWAY
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            50-Question Agronomic Competency Screening, Identity Verification, Single-Use Activation Tokens & 12-Module Mastery Governance
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchApplications}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 transition-all"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <span className="text-[11px] font-medium text-slate-400">Total Applicants</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black text-white">{metrics.total}</span>
            <UsersIcon className="w-4 h-4 text-slate-500" />
          </div>
        </div>

        <div className={`p-3.5 rounded-2xl border flex flex-col justify-between transition-all ${
          metrics.pendingReview > 0
            ? 'bg-amber-950/30 border-amber-500/40 shadow-lg shadow-amber-950/20'
            : 'bg-slate-900/80 border-slate-800'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-amber-300">Pending Review</span>
            {metrics.pendingReview > 0 && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            )}
          </div>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black text-amber-400">{metrics.pendingReview}</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <span className="text-[11px] font-medium text-blue-400">Approved (Token Issued)</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black text-blue-400">{metrics.approved}</span>
            <Key className="w-4 h-4 text-blue-400" />
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <span className="text-[11px] font-medium text-emerald-400">Active Certified</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black text-emerald-400">{metrics.active}</span>
            <Award className="w-4 h-4 text-emerald-400" />
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <span className="text-[11px] font-medium text-rose-400">Below 50% Score</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black text-rose-400">{metrics.notEligible}</span>
            <XCircle className="w-4 h-4 text-rose-400" />
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
          <span className="text-[11px] font-medium text-slate-400">Admin Rejected</span>
          <div className="flex items-baseline justify-between mt-2">
            <span className="text-2xl font-black text-slate-400">{metrics.rejected}</span>
            <XCircle className="w-4 h-4 text-slate-500" />
          </div>
        </div>
      </div>

      {/* Approval Success Banner with Single-Use Activation Token */}
      <AnimatePresence>
        {approvalResult && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-5 rounded-3xl bg-gradient-to-r from-emerald-950/80 via-emerald-900/60 to-slate-900 border border-emerald-500/50 shadow-2xl space-y-3"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <Key className="w-5 h-5 text-slate-950" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Application Approved! Single-Use Activation Token Generated
                  </h3>
                  <p className="text-xs text-emerald-300">
                    Adviser: <span className="font-semibold text-white">{approvalResult.application.fullName}</span> ({approvalResult.application.mobile})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setApprovalResult(null)}
                className="text-xs text-slate-400 hover:text-white px-2 py-1"
              >
                ✕ Dismiss
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-emerald-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold">Secure Single-Use Activation Token</span>
                <p className="text-xs font-mono font-bold text-white tracking-wider break-all">
                  {approvalResult.token}
                </p>
                <p className="text-[10px] text-slate-400">
                  Expires in 48 hours: {new Date(approvalResult.expiresAt).toLocaleString()}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyToClipboard(approvalResult.token, false)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md"
                >
                  {copiedToken ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedToken ? 'Copied Token' : 'Copy Token'}</span>
                </button>
                <button
                  onClick={() => copyToClipboard(`${window.location.origin}/?activation_token=${approvalResult.token}`, true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition-all"
                >
                  {copiedUrl ? <Check className="w-3.5 h-3.5" /> : <ExternalLink className="w-3.5 h-3.5" />}
                  <span>{copiedUrl ? 'Copied Link' : 'Copy Link'}</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-3xl bg-slate-900/80 border border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by adviser name, phone, crop..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { id: 'ALL', label: 'All' },
            { id: 'PENDING_ADMIN_REVIEW', label: `Pending Review (${metrics.pendingReview})` },
            { id: 'APPROVED', label: 'Approved' },
            { id: 'LEARNING_REQUIRED', label: 'In Learning' },
            { id: 'ACTIVE', label: 'Active' },
            { id: 'NOT_ELIGIBLE', label: 'Failed' },
            { id: 'REJECTED', label: 'Rejected' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                filterStatus === tab.id
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Applications Table */}
      <div className="rounded-3xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase font-mono text-[10px]">
                <th className="py-3.5 px-4">Applicant & Contact</th>
                <th className="py-3.5 px-4">Qualifications & Region</th>
                <th className="py-3.5 px-4 text-center">50-Q Assessment</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4">Submitted</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredApps.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <UserCheck className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm font-semibold">No adviser applications found</p>
                    <p className="text-xs">Applications submitted via the Adviser Verification Gateway will appear here.</p>
                  </td>
                </tr>
              ) : (
                filteredApps.map((app) => {
                  const score = app.assessmentScore ?? 0;
                  const percentage = app.assessmentPercentage ?? Math.round((score / 50) * 100);
                  const isPassed = app.assessmentPassed ?? (score >= 25);

                  return (
                    <tr key={app.id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Name & Phone */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-2xl bg-emerald-950 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-black text-sm">
                            {app.fullName ? app.fullName.charAt(0).toUpperCase() : 'A'}
                          </div>
                          <div>
                            <div className="font-bold text-white text-xs">{app.fullName}</div>
                            <div className="text-[11px] font-mono text-slate-400">{app.mobile}</div>
                            {app.email && (
                              <div className="text-[10px] text-slate-500">{app.email}</div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Qualifications & Region */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div className="font-semibold text-slate-200">{app.specialization}</div>
                          <div className="text-[11px] text-slate-400">
                            {app.qualification} • {app.experienceYears} yrs exp
                          </div>
                          <div className="text-[10px] text-emerald-400/80">
                            📍 {app.region || 'Indo-Gangetic Agro Zone'}
                          </div>
                        </div>
                      </td>

                      {/* 50-Q Assessment */}
                      <td className="py-3.5 px-4 text-center">
                        {app.assessmentScore !== undefined ? (
                          <div className="inline-flex flex-col items-center">
                            <span className={`text-sm font-black font-mono ${
                              isPassed ? 'text-emerald-400' : 'text-rose-400'
                            }`}>
                              {score} / 50 ({percentage}%)
                            </span>
                            <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md mt-0.5 ${
                              isPassed ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
                            }`}>
                              {isPassed ? 'Passed (≥50%)' : 'Failed (<50%)'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-500 text-[11px]">Not Taken</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        {getStatusBadge(app.status)}
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                        {new Date(app.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedApp(app)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-all"
                            title="View Full Dossier"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {app.status === 'PENDING_ADMIN_REVIEW' && (
                            <>
                              <button
                                onClick={() => setShowApproveModal(app)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition-all shadow-sm"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => setShowRejectModal(app)}
                                className="px-2 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 text-[11px] font-bold transition-all"
                              >
                                Reject
                              </button>
                            </>
                          )}

                          {app.status === 'APPROVED' && (
                            <button
                              onClick={() => setSelectedApp(app)}
                              className="px-2 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 text-[11px] font-bold transition-all"
                            >
                              Token Active
                            </button>
                          )}

                          {app.status === 'ACTIVE' && (
                            <span className="text-[11px] text-emerald-400 font-bold px-2 py-1">
                              ✓ Verified
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: APPROVE CONFIRMATION */}
      <AnimatePresence>
        {showApproveModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Approve Adviser Application</h3>
                  <p className="text-xs text-slate-400">Issue single-use activation credential token</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Applicant:</span>
                  <span className="font-bold text-white">{showApproveModal.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Mobile:</span>
                  <span className="font-mono text-slate-300">{showApproveModal.mobile}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Assessment Score:</span>
                  <span className="font-bold text-emerald-400">
                    {showApproveModal.assessmentScore}/50 ({showApproveModal.assessmentPercentage}%)
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Specialization:</span>
                  <span className="text-slate-300">{showApproveModal.specialization}</span>
                </div>
              </div>

              <p className="text-xs text-slate-300">
                Approving this application will generate a secure, cryptographically random single-use activation token expiring in 48 hours. The applicant will use this token to establish their password and begin the 12-module learning course.
              </p>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowApproveModal(null)}
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleApprove(showApproveModal)}
                  disabled={actionLoading}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-lg shadow-emerald-950/40"
                >
                  {actionLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                  <span>{actionLoading ? 'Issuing Token...' : 'Approve & Issue Token'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: REJECT CONFIRMATION */}
      <AnimatePresence>
        {showRejectModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                  <XCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Reject Adviser Application</h3>
                  <p className="text-xs text-slate-400">{showRejectModal.fullName} ({showRejectModal.mobile})</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Reason for Rejection</label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Assessment score did not meet criteria, missing agricultural credentials..."
                  className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 h-24"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setShowRejectModal(null)}
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-lg"
                >
                  {actionLoading ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: FULL DOSSIER DETAILS */}
      <AnimatePresence>
        {selectedApp && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto space-y-6"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center font-black text-white text-lg">
                    {selectedApp.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{selectedApp.fullName}</h3>
                    <p className="text-xs text-slate-400 font-mono">{selectedApp.mobile} • {selectedApp.email || 'No email provided'}</p>
                    <div className="mt-1">{getStatusBadge(selectedApp.status)}</div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedApp(null)}
                  className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {/* Competency Assessment Breakdown */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                    50-Question Competency Scorecard
                  </h4>
                  <span className="text-base font-black font-mono text-white">
                    {selectedApp.assessmentScore ?? 0} / 50 ({selectedApp.assessmentPercentage ?? 0}%)
                  </span>
                </div>

                {selectedApp.categoryScores && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2">
                    {Object.entries(selectedApp.categoryScores).map(([cat, score]: [string, any]) => (
                      <div key={cat} className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800">
                        <span className="text-[10px] text-slate-400 capitalize block">{cat.replace('_', ' ')}</span>
                        <span className="text-xs font-black text-emerald-300">{score} pts</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Qualifications & Agronomy Focus */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Professional Background</span>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Degree/Qualification:</span>
                    <span className="font-semibold text-slate-200">{selectedApp.qualification}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Experience:</span>
                    <span className="font-semibold text-slate-200">{selectedApp.experienceYears} Years</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Specialization:</span>
                    <span className="font-semibold text-slate-200">{selectedApp.specialization}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Institution:</span>
                    <span className="font-semibold text-slate-200">{selectedApp.institution || 'PAU / Extension Org'}</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Field & Language Focus</span>
                  <div>
                    <span className="text-slate-500 block mb-1">Primary Crops:</span>
                    <div className="flex flex-wrap gap-1">
                      {(selectedApp.primaryCrops || ['Wheat', 'Rice']).map(crop => (
                        <span key={crop} className="px-2 py-0.5 rounded-md bg-emerald-950/60 border border-emerald-500/20 text-[10px] font-semibold text-emerald-300">
                          {crop}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-1">Languages:</span>
                    <div className="flex flex-wrap gap-1">
                      {(selectedApp.languages || ['English', 'Hindi']).map(lang => (
                        <span key={lang} className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-[10px] text-slate-300">
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-slate-500">Region:</span>
                    <span className="text-emerald-300 font-semibold">{selectedApp.region || 'National'}</span>
                  </div>
                </div>
              </div>

              {/* Timeline & Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <div className="text-[11px] text-slate-500">
                  Application ID: <span className="font-mono">{selectedApp.id}</span>
                </div>
                <button
                  onClick={() => setSelectedApp(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white"
                >
                  Close Dossier
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

function UsersIcon(props: any) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}
