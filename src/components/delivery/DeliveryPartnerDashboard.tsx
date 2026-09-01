import React, { useState, useEffect } from 'react';
import {
  Truck,
  MapPin,
  Navigation,
  CheckCircle2,
  AlertCircle,
  Phone,
  ShieldCheck,
  QrCode,
  KeyRound,
  DollarSign,
  PackageCheck,
  Clock,
  ArrowRight,
  RefreshCw,
  Volume2,
  Globe,
  Sliders,
  Check,
  ChevronRight,
  TrendingUp,
  CreditCard
} from 'lucide-react';
import { SUPPORTED_LANGUAGES, getDeliveryVoiceAnnouncement } from '../../utils/i18n';

interface DeliveryJob {
  id: string;
  orderId: string;
  partnerMobile: string;
  pickupLocation: { address: string; lat?: number; lng?: number; contactPerson: string; contactPhone: string };
  dropLocation: { address: string; lat?: number; lng?: number; recipientName: string; recipientPhone: string };
  status: 'PENDING_ASSIGNMENT' | 'ACCEPTED' | 'PICKED_UP' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED';
  distanceKm: number;
  deliveryFee: number;
  tip: number;
  packageDetails: { weightKg: number; itemsSummary: string; isHazardous?: boolean };
  verificationOtp?: string;
  createdAt: string;
}

interface DeliveryPartnerDashboardProps {
  partnerMobile: string;
  partnerName?: string;
  currentUser?: any;
  onOpenProfile?: () => void;
  onOpenSettings?: (section?: any) => void;
  onLogout?: () => void;
  onBackToHome?: () => void;
}

export const DeliveryPartnerDashboard: React.FC<DeliveryPartnerDashboardProps> = ({
  partnerMobile,
  partnerName = 'CroperX Logistics Driver',
  currentUser,
  onOpenProfile,
  onOpenSettings,
  onLogout,
  onBackToHome
}) => {
  const [activeJob, setActiveJob] = useState<DeliveryJob | null>(null);
  const [availableJobs, setAvailableJobs] = useState<DeliveryJob[]>([]);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [earningsSummary, setEarningsSummary] = useState<{ totalEarnings: number; completedCount: number; availableBalance: number }>({
    totalEarnings: 2450,
    completedCount: 8,
    availableBalance: 1850
  });

  const [selectedLanguage, setSelectedLanguage] = useState<string>('en');
  const [otpInput, setOtpInput] = useState<string>('');
  const [otpError, setOtpError] = useState<string | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);
  const [showQrModal, setShowQrModal] = useState<boolean>(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Voice Announcement Player
  const announceEvent = (actionType: string, details?: any) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const text = getDeliveryVoiceAnnouncement(selectedLanguage, actionType, details);
      const utterance = new SpeechSynthesisUtterance(text);
      const langObj = SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage);
      if (langObj) utterance.lang = langObj.speechLang;
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Fetch Current Assigned Jobs & Available Feed
  const fetchJobs = async () => {
    try {
      const res = await fetch(`/api/delivery/partner/jobs?mobile=${encodeURIComponent(partnerMobile)}`);
      const data = await res.json();
      if (data.success) {
        if (data.activeJob) {
          setActiveJob(data.activeJob);
        } else {
          setActiveJob(null);
        }
        if (Array.isArray(data.availableJobs)) {
          setAvailableJobs(data.availableJobs);
        }
        if (data.earnings) {
          setEarningsSummary(data.earnings);
        }
      }
    } catch (e) {
      // Fallback demo job for interactive exploration
      if (!activeJob) {
        setActiveJob({
          id: 'JOB-DLV-8821',
          orderId: 'ORD-98234-AGRI',
          partnerMobile,
          pickupLocation: {
            address: 'CroperX Regional Hub #4, Guntur Highway Depot, Andhra Pradesh',
            contactPerson: 'Ramesh Agri Seeds Depot',
            contactPhone: '+91 98480 22334'
          },
          dropLocation: {
            address: 'Farm Plot #14, Nandigama Village, Krishna District',
            recipientName: 'Koteswara Rao (Farmer)',
            recipientPhone: '+91 94401 55667'
          },
          status: 'ACCEPTED',
          distanceKm: 14.8,
          deliveryFee: 320,
          tip: 50,
          packageDetails: {
            weightKg: 12.5,
            itemsSummary: 'Organic Bio-NPK Fertilizer (2x5kg) & Micronutrient Spray',
            isHazardous: false
          },
          verificationOtp: '7294',
          createdAt: new Date().toISOString()
        });
      }
    }
  };

  useEffect(() => {
    fetchJobs();
    announceEvent('NEW_JOB', {
      pickup: 'Guntur Agri Depot',
      drop: 'Nandigama Farm',
      distance: 15,
      payout: 370
    });
  }, [partnerMobile]);

  // Handle State Machine Status Transitions
  const handleUpdateStatus = async (nextStatus: string, otpValue?: string) => {
    if (!activeJob) return;
    setIsUpdatingStatus(true);
    setOtpError(null);
    setFeedbackMsg(null);

    try {
      const res = await fetch('/api/delivery/job/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: activeJob.id,
          partnerMobile,
          newStatus: nextStatus,
          otp: otpValue || otpInput
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update job status.');
      }

      setActiveJob(data.job);
      setFeedbackMsg(`Status updated to ${nextStatus}`);

      if (nextStatus === 'PICKED_UP') {
        announceEvent('ARRIVED_PICKUP');
      } else if (nextStatus === 'IN_TRANSIT') {
        announceEvent('ARRIVED_DESTINATION');
      } else if (nextStatus === 'DELIVERED') {
        announceEvent('DELIVERED', { payout: activeJob.deliveryFee + activeJob.tip });
        setEarningsSummary(prev => ({
          ...prev,
          totalEarnings: prev.totalEarnings + activeJob.deliveryFee + activeJob.tip,
          completedCount: prev.completedCount + 1,
          availableBalance: prev.availableBalance + activeJob.deliveryFee + activeJob.tip
        }));
      }
    } catch (err: any) {
      setOtpError(err.message || 'Status update failed.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div id="delivery-fleet-dashboard" className="w-full max-w-6xl mx-auto space-y-6">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-emerald-950 text-white rounded-3xl p-6 md:p-8 shadow-xl border border-stone-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center font-bold shadow-inner">
              <Truck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-800">
                  CroperX Agri Fleet Command
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              </div>
              <h1 className="text-2xl font-black text-white mt-1">{partnerName}</h1>
              <p className="text-xs text-stone-400 font-mono">{partnerMobile}</p>
            </div>
          </div>

          {/* Regional Voice Guidance & Controls */}
          <div className="flex flex-wrap items-center gap-3 bg-stone-900/80 p-3 rounded-2xl border border-stone-700/80">
            {/* Online/Offline Status Switch */}
            <button
              onClick={() => {
                const next = !isOnline;
                setIsOnline(next);
                setFeedbackMsg(next ? 'You are now ONLINE and visible for dispatch.' : 'You are now OFFLINE.');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
                isOnline ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-stone-800 text-stone-400 border border-stone-700'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-stone-500'}`} />
              <span>{isOnline ? 'ONLINE' : 'OFFLINE'}</span>
            </button>

            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-stone-400 shrink-0" />
              <select
                value={selectedLanguage}
                onChange={(e) => {
                  setSelectedLanguage(e.target.value);
                  announceEvent('NEW_JOB');
                }}
                className="text-xs bg-stone-800 border border-stone-600 rounded-lg px-2.5 py-1.5 text-stone-200 font-medium focus:ring-1 focus:ring-emerald-500"
              >
                {SUPPORTED_LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.flag} {l.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => announceEvent(activeJob ? 'ARRIVED_DESTINATION' : 'NEW_JOB')}
              title="Voice Announce Status"
              className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition cursor-pointer"
            >
              <Volume2 className="w-4 h-4" />
            </button>

            {onOpenProfile && (
              <button
                onClick={onOpenProfile}
                title="Driver Profile"
                className="px-2.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium rounded-lg transition cursor-pointer"
              >
                Profile
              </button>
            )}

            {onOpenSettings && (
              <button
                onClick={() => onOpenSettings()}
                title="Settings"
                className="px-2.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium rounded-lg transition cursor-pointer"
              >
                Settings
              </button>
            )}

            {onBackToHome && (
              <button
                onClick={onBackToHome}
                title="Back to Welcome Portal"
                className="px-2.5 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium rounded-lg transition cursor-pointer"
              >
                Home
              </button>
            )}

            {onLogout && (
              <button
                onClick={onLogout}
                title="Logout"
                className="px-2.5 py-1.5 bg-red-950/60 hover:bg-red-900 border border-red-800/60 text-red-300 text-xs font-bold rounded-lg transition cursor-pointer"
              >
                Logout
              </button>
            )}
          </div>
        </div>

        {/* Fleet Metrics Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-stone-800">
          <div className="p-4 bg-stone-900/60 rounded-2xl border border-stone-800 flex items-center justify-between">
            <div>
              <div className="text-xs text-stone-400 font-medium">Today's Completed Trips</div>
              <div className="text-xl font-bold text-white mt-0.5">{earningsSummary.completedCount} Deliveries</div>
            </div>
            <PackageCheck className="w-6 h-6 text-emerald-400" />
          </div>

          <div className="p-4 bg-stone-900/60 rounded-2xl border border-stone-800 flex items-center justify-between">
            <div>
              <div className="text-xs text-stone-400 font-medium">Total Revenue Earned</div>
              <div className="text-xl font-bold text-emerald-400 mt-0.5">₹{earningsSummary.totalEarnings.toLocaleString()}</div>
            </div>
            <TrendingUp className="w-6 h-6 text-emerald-400" />
          </div>

          <div className="p-4 bg-stone-900/60 rounded-2xl border border-stone-800 flex items-center justify-between">
            <div>
              <div className="text-xs text-stone-400 font-medium">Wallet Balance</div>
              <div className="text-xl font-bold text-white mt-0.5">₹{earningsSummary.availableBalance.toLocaleString()}</div>
            </div>
            <CreditCard className="w-6 h-6 text-blue-400" />
          </div>
        </div>
      </div>

      {/* Active Delivery Job Container */}
      {activeJob ? (
        <div id="active-delivery-job-card" className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 md:p-8 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-200 dark:border-stone-800">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                Active Assignment: {activeJob.id}
              </span>
              <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100 mt-2">
                Order #{activeJob.orderId}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-mono bg-stone-100 dark:bg-stone-800 px-3 py-1.5 rounded-xl text-stone-600 dark:text-stone-300 font-bold">
                {activeJob.distanceKm} km trip
              </span>
              <span className="text-sm font-black text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-3.5 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
                ₹{activeJob.deliveryFee + activeJob.tip} Payout
              </span>
            </div>
          </div>

          {/* Job State Timeline */}
          <div className="py-6 border-b border-stone-200 dark:border-stone-800">
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className={`p-2.5 rounded-xl border ${['ACCEPTED', 'PICKED_UP', 'IN_TRANSIT', 'DELIVERED'].includes(activeJob.status) ? 'bg-emerald-500 text-white font-bold' : 'bg-stone-100 text-stone-400'}`}>
                1. Accepted
              </div>
              <div className={`p-2.5 rounded-xl border ${['PICKED_UP', 'IN_TRANSIT', 'DELIVERED'].includes(activeJob.status) ? 'bg-emerald-500 text-white font-bold' : 'bg-stone-100 text-stone-400'}`}>
                2. Picked Up
              </div>
              <div className={`p-2.5 rounded-xl border ${['IN_TRANSIT', 'DELIVERED'].includes(activeJob.status) ? 'bg-emerald-500 text-white font-bold' : 'bg-stone-100 text-stone-400'}`}>
                3. In Transit
              </div>
              <div className={`p-2.5 rounded-xl border ${activeJob.status === 'DELIVERED' ? 'bg-emerald-500 text-white font-bold' : 'bg-stone-100 text-stone-400'}`}>
                4. Delivered
              </div>
            </div>
          </div>

          {/* Pickup & Destination Routing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
            <div className="p-5 bg-stone-50 dark:bg-stone-800/40 rounded-2xl border border-stone-200 dark:border-stone-700 space-y-3">
              <div className="flex items-center gap-2 text-amber-600 font-bold text-xs uppercase tracking-wider">
                <MapPin className="w-4 h-4" /> 1. Pickup Origin (Agri Depot)
              </div>
              <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                {activeJob.pickupLocation.address}
              </p>
              <div className="text-xs text-stone-500 flex items-center justify-between pt-2 border-t border-stone-200 dark:border-stone-700">
                <span>Contact: {activeJob.pickupLocation.contactPerson}</span>
                <a href={`tel:${activeJob.pickupLocation.contactPhone}`} className="text-emerald-600 font-bold flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" /> Call
                </a>
              </div>
            </div>

            <div className="p-5 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200 dark:border-emerald-800/50 space-y-3">
              <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wider">
                <Navigation className="w-4 h-4" /> 2. Delivery Destination (Farmer's Gate)
              </div>
              <p className="text-sm font-semibold text-stone-900 dark:text-stone-100">
                {activeJob.dropLocation.address}
              </p>
              <div className="text-xs text-stone-500 flex items-center justify-between pt-2 border-t border-emerald-200 dark:border-emerald-800">
                <span>Farmer: {activeJob.dropLocation.recipientName}</span>
                <a href={`tel:${activeJob.dropLocation.recipientPhone}`} className="text-emerald-600 font-bold flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5" /> Call Farmer
                </a>
              </div>
            </div>
          </div>

          {/* Package Details Banner */}
          <div className="p-4 bg-stone-100 dark:bg-stone-800/80 rounded-2xl border border-stone-200 dark:border-stone-700 text-xs text-stone-700 dark:text-stone-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <PackageCheck className="w-4 h-4 text-emerald-600" />
              <span><strong>Cargo:</strong> {activeJob.packageDetails.itemsSummary} ({activeJob.packageDetails.weightKg} kg)</span>
            </div>
            <span className="font-bold text-emerald-600 bg-white dark:bg-stone-700 px-2.5 py-1 rounded-lg">
              Verified Agri-Seal
            </span>
          </div>

          {/* Proof of Delivery Verification & State Transition Action */}
          <div className="mt-8 pt-6 border-t border-stone-200 dark:border-stone-800">
            {activeJob.status === 'ACCEPTED' && (
              <button
                type="button"
                disabled={isUpdatingStatus}
                onClick={() => handleUpdateStatus('PICKED_UP')}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base rounded-2xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <PackageCheck className="w-5 h-5" />
                <span>Confirm Pickup & Package Inspection</span>
              </button>
            )}

            {activeJob.status === 'PICKED_UP' && (
              <button
                type="button"
                disabled={isUpdatingStatus}
                onClick={() => handleUpdateStatus('IN_TRANSIT')}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base rounded-2xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Navigation className="w-5 h-5" />
                <span>Start Transit to Farmer's Field</span>
              </button>
            )}

            {activeJob.status === 'IN_TRANSIT' && (
              <div className="space-y-4 bg-stone-50 dark:bg-stone-800/60 p-6 rounded-2xl border border-stone-200 dark:border-stone-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-stone-900 dark:text-stone-100 text-sm">
                    <KeyRound className="w-4 h-4 text-emerald-600" />
                    <span>Farmer Handover Verification OTP</span>
                  </div>
                  <span className="text-xs text-stone-500">Collect 4-digit code from recipient</span>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Enter 4-digit OTP (e.g. 7294)"
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value.trim())}
                    className="flex-1 px-4 py-3 bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-700 rounded-xl text-center text-lg font-mono tracking-widest font-bold focus:ring-2 focus:ring-emerald-500"
                  />

                  <button
                    type="button"
                    disabled={isUpdatingStatus || !otpInput}
                    onClick={() => handleUpdateStatus('DELIVERED', otpInput)}
                    className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-300 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Verify & Complete Delivery</span>
                  </button>
                </div>

                {otpError && (
                  <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{otpError}</span>
                  </div>
                )}
              </div>
            )}

            {activeJob.status === 'DELIVERED' && (
              <div className="p-6 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h3 className="text-lg font-bold text-emerald-900 dark:text-emerald-100">Delivery Successfully Completed!</h3>
                <p className="text-xs text-emerald-700 dark:text-emerald-300">
                  ₹{activeJob.deliveryFee + activeJob.tip} has been credited to your CroperX Fleet Wallet.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Empty / Available Jobs Feed */
        <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-8 shadow-sm text-center">
          <Truck className="w-12 h-12 text-stone-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">No Active Trip Assigned</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1 mb-6">
            You are online and active in the CroperX Logistics Pool. Nearby delivery requests will appear below.
          </p>

          <button
            onClick={fetchJobs}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-semibold text-xs rounded-xl transition cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" /> Refresh Dispatch Feed
          </button>
        </div>
      )}
    </div>
  );
};
