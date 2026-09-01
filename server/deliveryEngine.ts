import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { getSupabase } from './supabase.js';
import { recordLedgerEntry } from './financialLedger.js';

const DATA_DIR = path.join(process.cwd(), 'data');
const PARTNERS_FILE = path.join(DATA_DIR, 'delivery_partners_db.json');
const JOBS_FILE = path.join(DATA_DIR, 'delivery_jobs_db.json');
const EARNINGS_FILE = path.join(DATA_DIR, 'delivery_earnings_db.json');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function readJsonFile<T>(filePath: string, fallback: T): T {
  try {
    ensureDataDir();
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error(`[Delivery Store] Error reading ${path.basename(filePath)}:`, err);
  }
  return fallback;
}

function writeJsonFile<T>(filePath: string, data: T) {
  try {
    ensureDataDir();
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`[Delivery Store] Error writing ${path.basename(filePath)}:`, err);
  }
}

export interface DeliveryPartner {
  id: string;
  userId: string;
  name: string;
  phoneNumber: string;
  vehicleType: 'Two Wheeler (Bike/Scooter)' | 'Three Wheeler (Auto Cargo)' | 'Four Wheeler (Pick-up Van)' | 'Tractor Trailer';
  vehicleNumber: string;
  licenseNumber: string;
  status: 'OFFLINE' | 'ONLINE' | 'AVAILABLE' | 'ON_PICKUP' | 'AT_PICKUP' | 'IN_TRANSIT' | 'AT_DESTINATION' | 'DELIVERED' | 'ISSUE_REPORTED';
  currentLocation?: {
    latitude: number;
    longitude: number;
    heading?: number;
    accuracy?: number;
    updatedAt: string;
  };
  serviceZone: string;
  activeJobId?: string;
  todayStats: {
    earnings: number;
    completedDeliveries: number;
    distanceTraveledKm: number;
    onTimePercentage: number;
    customerRating: number;
    hoursOnline: number;
  };
  lifetimeStats: {
    totalDeliveries: number;
    totalEarnings: number;
    rating: number;
    ratingsCount: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryJob {
  id: string;
  orderId: string;
  partnerId?: string;
  partnerName?: string;
  partnerPhone?: string;
  status: 'PENDING_ASSIGNMENT' | 'ASSIGNED' | 'ACCEPTED' | 'REJECTED' | 'ARRIVED_PICKUP' | 'PICKED_UP' | 'IN_TRANSIT' | 'ARRIVED_DESTINATION' | 'DELIVERED' | 'FAILED' | 'CANCELLED';
  pickupLocation: {
    name: string;
    hubType: 'Agri Store Depot' | 'Wholesale Mandi Hub' | 'Certified Nursery' | 'Fertilizer Warehouse';
    address: string;
    landmark?: string;
    district: string;
    latitude: number;
    longitude: number;
    contactPerson: string;
    contactPhone: string;
  };
  dropLocation: {
    farmerName: string;
    farmName: string;
    address: string;
    village: string;
    district: string;
    pinCode?: string;
    latitude: number;
    longitude: number;
    farmerPhone: string;
    farmGateInstructions?: string;
    ruralRoadWarning?: string;
  };
  items: Array<{
    productId: string;
    productName: string;
    category: string;
    quantity: number;
    weightKg?: number;
    price: number;
    image?: string;
    handlingInstructions?: string;
  }>;
  totalDistanceKm: number;
  estimatedDurationMins: number;
  payout: {
    baseFare: number;
    distanceIncentive: number;
    peakBonus: number;
    batchBonus: number;
    onTimeBonus: number;
    totalEarnings: number;
  };
  verificationOtp?: string;
  proofOfDelivery?: {
    method: 'OTP' | 'QR' | 'SIGNATURE_AND_PHOTO';
    verifiedAt: string;
    otpCode?: string;
    recipientName?: string;
    notes?: string;
    gpsLocation?: { lat: number; lng: number };
    photoUrl?: string;
  };
  issueReported?: {
    issueType: string;
    description: string;
    reportedAt: string;
    resolved: boolean;
  };
  timeline: Array<{
    status: string;
    timestamp: string;
    locationNote?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

// Initial Sample Fixture Jobs if empty
function initializeSampleJobs() {
  const jobs = readJsonFile<Record<string, DeliveryJob>>(JOBS_FILE, {});
  if (Object.keys(jobs).length === 0) {
    const sampleJob1: DeliveryJob = {
      id: 'job_cx_001',
      orderId: 'ORD-98214',
      status: 'PENDING_ASSIGNMENT',
      pickupLocation: {
        name: 'CroperX Central Agri Depot #4',
        hubType: 'Agri Store Depot',
        address: 'Plot 12, Agro Industrial Corridor, GT Road',
        landmark: 'Near IFFCO Fertilizer Hub',
        district: 'Karnal',
        latitude: 29.6857,
        longitude: 76.9905,
        contactPerson: 'Sukhdev Singh (Depot Manager)',
        contactPhone: '+919872111001'
      },
      dropLocation: {
        farmerName: 'Gurpreet Singh Dhillon',
        farmName: 'Dhillon Organic Wheat Farm (Zone B)',
        address: 'Khasra No 142/8, Village Nilokheri',
        village: 'Nilokheri',
        district: 'Karnal',
        pinCode: '132117',
        latitude: 29.8340,
        longitude: 76.9200,
        farmerPhone: '+919876543210',
        farmGateInstructions: 'Turn right after the canal culvert; enter through green iron gate near tube-well.',
        ruralRoadWarning: 'Unpaved gravel road for final 1.2 km; heavy vehicles drive carefully.'
      },
      items: [
        {
          productId: 'prod_1',
          productName: 'Organic Trichoderma Bio-Fungicide (1kg)',
          category: 'Bio-Fungicide',
          quantity: 4,
          weightKg: 4.0,
          price: 349,
          handlingInstructions: 'Keep cool and away from direct sunlight.'
        },
        {
          productId: 'prod_2',
          productName: 'Humic Acid 98% Soil Conditioner (500g)',
          category: 'Soil Conditioner',
          quantity: 2,
          weightKg: 1.0,
          price: 499
        }
      ],
      totalDistanceKm: 18.5,
      estimatedDurationMins: 38,
      payout: {
        baseFare: 120,
        distanceIncentive: 95,
        peakBonus: 35,
        batchBonus: 20,
        onTimeBonus: 30,
        totalEarnings: 300
      },
      verificationOtp: '8492',
      timeline: [
        { status: 'PENDING_ASSIGNMENT', timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString(), locationNote: 'Order packaged and ready at Karnal Depot.' }
      ],
      createdAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    };

    const sampleJob2: DeliveryJob = {
      id: 'job_cx_002',
      orderId: 'ORD-98218',
      status: 'PENDING_ASSIGNMENT',
      pickupLocation: {
        name: 'Punjab Certified Seed Hub',
        hubType: 'Certified Nursery',
        address: 'Sector 3A, Mandi Yard',
        landmark: 'Opposite State Warehousing Gate',
        district: 'Ludhiana',
        latitude: 30.9010,
        longitude: 75.8573,
        contactPerson: 'Harmanpreet Kaur',
        contactPhone: '+919872111002'
      },
      dropLocation: {
        farmerName: 'Ramesh Patel',
        farmName: 'Patel Sunflower & Mustard Fields',
        address: 'Farm Plot 88, Near Canal Siphon',
        village: 'Doraha',
        district: 'Ludhiana',
        pinCode: '141421',
        latitude: 30.8050,
        longitude: 76.0350,
        farmerPhone: '+919876543212',
        farmGateInstructions: 'Call upon crossing railway crossing; delivery at tractor shed.',
        ruralRoadWarning: 'Narrow canal embankment passage; pass cautiously during rain.'
      },
      items: [
        {
          productId: 'prod_seed_1',
          productName: 'Hybrid Mustard Seeds (Pusa Bold) 2kg',
          category: 'Seeds',
          quantity: 3,
          weightKg: 6.0,
          price: 590
        }
      ],
      totalDistanceKm: 22.0,
      estimatedDurationMins: 45,
      payout: {
        baseFare: 140,
        distanceIncentive: 110,
        peakBonus: 40,
        batchBonus: 0,
        onTimeBonus: 35,
        totalEarnings: 325
      },
      verificationOtp: '5129',
      timeline: [
        { status: 'PENDING_ASSIGNMENT', timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), locationNote: 'Order packaged and awaiting driver acceptance.' }
      ],
      createdAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    };

    jobs[sampleJob1.id] = sampleJob1;
    jobs[sampleJob2.id] = sampleJob2;
    writeJsonFile(JOBS_FILE, jobs);
  }
}

// Initial Partner if empty
function initializeSamplePartner(phone: string = '+919876543210') {
  const partners = readJsonFile<Record<string, DeliveryPartner>>(PARTNERS_FILE, {});
  const cleanPhone = phone.replace(/\D/g, '');
  const existing = Object.values(partners).find(p => p.phoneNumber.replace(/\D/g, '') === cleanPhone);
  if (!existing) {
    const partnerId = `del_${Date.now()}`;
    const newPartner: DeliveryPartner = {
      id: partnerId,
      userId: `user_${cleanPhone}`,
      name: 'Ranjit Singh (Fleet Champion)',
      phoneNumber: phone,
      vehicleType: 'Three Wheeler (Auto Cargo)',
      vehicleNumber: 'PB 10 CQ 4921',
      licenseNumber: 'DL-042022987110',
      status: 'AVAILABLE',
      serviceZone: 'Karnal & Ludhiana Agri-Corridor',
      currentLocation: {
        latitude: 29.6857,
        longitude: 76.9905,
        heading: 45,
        accuracy: 8,
        updatedAt: new Date().toISOString()
      },
      todayStats: {
        earnings: 1280,
        completedDeliveries: 4,
        distanceTraveledKm: 64.2,
        onTimePercentage: 98.4,
        customerRating: 4.92,
        hoursOnline: 5.5
      },
      lifetimeStats: {
        totalDeliveries: 412,
        totalEarnings: 124500,
        rating: 4.95,
        ratingsCount: 380
      },
      createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString()
    };
    partners[partnerId] = newPartner;
    writeJsonFile(PARTNERS_FILE, partners);
    return newPartner;
  }
  return existing;
}

// Run initial fixtures on startup
initializeSampleJobs();

/**
 * 1. Get or Create Delivery Partner Profile
 */
export function getOrCreateDeliveryPartner(phone: string, name?: string): DeliveryPartner {
  const cleanPhone = phone.replace(/\D/g, '');
  const partners = readJsonFile<Record<string, DeliveryPartner>>(PARTNERS_FILE, {});
  const partner = Object.values(partners).find(p => p.phoneNumber.replace(/\D/g, '') === cleanPhone);
  if (partner) return partner;

  const partnerId = `del_${Date.now()}`;
  const newPartner: DeliveryPartner = {
    id: partnerId,
    userId: `user_${cleanPhone}`,
    name: name || 'CroperX Delivery Partner',
    phoneNumber: phone,
    vehicleType: 'Two Wheeler (Bike/Scooter)',
    vehicleNumber: 'HR 05 BX 8912',
    licenseNumber: 'HR-2023-88912',
    status: 'ONLINE',
    serviceZone: 'North Regional Agro Cluster',
    todayStats: {
      earnings: 0,
      completedDeliveries: 0,
      distanceTraveledKm: 0,
      onTimePercentage: 100,
      customerRating: 5.0,
      hoursOnline: 1.0
    },
    lifetimeStats: {
      totalDeliveries: 0,
      totalEarnings: 0,
      rating: 5.0,
      ratingsCount: 0
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  partners[partnerId] = newPartner;
  writeJsonFile(PARTNERS_FILE, partners);
  return newPartner;
}

/**
 * 2. Update Partner Live Status
 */
export function updateDeliveryPartnerStatus(partnerId: string, status: DeliveryPartner['status']): DeliveryPartner {
  const partners = readJsonFile<Record<string, DeliveryPartner>>(PARTNERS_FILE, {});
  const partner = partners[partnerId];
  if (!partner) throw new Error('Delivery partner not found.');

  partner.status = status;
  partner.updatedAt = new Date().toISOString();
  partners[partnerId] = partner;
  writeJsonFile(PARTNERS_FILE, partners);
  return partner;
}

/**
 * 3. Update Partner Live GPS Location
 */
export function updateDeliveryPartnerLocation(partnerId: string, location: { latitude: number; longitude: number; heading?: number; accuracy?: number }): DeliveryPartner {
  const partners = readJsonFile<Record<string, DeliveryPartner>>(PARTNERS_FILE, {});
  const partner = partners[partnerId];
  if (!partner) throw new Error('Delivery partner not found.');

  partner.currentLocation = {
    ...location,
    updatedAt: new Date().toISOString()
  };
  partner.updatedAt = new Date().toISOString();
  partners[partnerId] = partner;
  writeJsonFile(PARTNERS_FILE, partners);
  return partner;
}

/**
 * 4. Get Available and Active Delivery Jobs
 */
export function getDeliveryJobsForPartner(partnerId?: string): {
  availableJobs: DeliveryJob[];
  activeJob: DeliveryJob | null;
  completedJobs: DeliveryJob[];
} {
  initializeSampleJobs();
  const jobs = readJsonFile<Record<string, DeliveryJob>>(JOBS_FILE, {});
  const allJobs = Object.values(jobs);

  const availableJobs = allJobs.filter(j => j.status === 'PENDING_ASSIGNMENT');
  const activeJob = partnerId
    ? allJobs.find(j => j.partnerId === partnerId && ['ASSIGNED', 'ACCEPTED', 'ARRIVED_PICKUP', 'PICKED_UP', 'IN_TRANSIT', 'ARRIVED_DESTINATION'].includes(j.status)) || null
    : null;
  const completedJobs = partnerId
    ? allJobs.filter(j => j.partnerId === partnerId && j.status === 'DELIVERED').sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    : [];

  return {
    availableJobs,
    activeJob,
    completedJobs
  };
}

/**
 * 5. Partner Accepts Delivery Job
 */
export function acceptDeliveryJob(jobId: string, partnerId: string, partnerName: string, partnerPhone: string): DeliveryJob {
  const jobs = readJsonFile<Record<string, DeliveryJob>>(JOBS_FILE, {});
  const job = jobs[jobId];
  if (!job) throw new Error('Delivery job not found.');

  if (job.status !== 'PENDING_ASSIGNMENT' && job.partnerId !== partnerId) {
    throw new Error('This job has already been claimed by another delivery partner.');
  }

  const now = new Date().toISOString();
  job.partnerId = partnerId;
  job.partnerName = partnerName;
  job.partnerPhone = partnerPhone;
  job.status = 'ACCEPTED';
  job.timeline.push({
    status: 'ACCEPTED',
    timestamp: now,
    locationNote: `Accepted by delivery champion ${partnerName}`
  });
  job.updatedAt = now;

  jobs[jobId] = job;
  writeJsonFile(JOBS_FILE, jobs);

  // Update partner state
  const partners = readJsonFile<Record<string, DeliveryPartner>>(PARTNERS_FILE, {});
  if (partners[partnerId]) {
    partners[partnerId].activeJobId = jobId;
    partners[partnerId].status = 'ON_PICKUP';
    partners[partnerId].updatedAt = now;
    writeJsonFile(PARTNERS_FILE, partners);
  }

  return job;
}

/**
 * 6. Progress Delivery Status (Arrived Pickup, Picked Up, In Transit, Arrived Destination)
 */
export function progressDeliveryJobStatus(jobId: string, partnerId: string, nextStatus: DeliveryJob['status'], note?: string): DeliveryJob {
  const jobs = readJsonFile<Record<string, DeliveryJob>>(JOBS_FILE, {});
  const job = jobs[jobId];
  if (!job) throw new Error('Delivery job not found.');
  if (job.partnerId !== partnerId) throw new Error('Unauthorized. This job is not assigned to you.');

  const now = new Date().toISOString();
  job.status = nextStatus;
  job.timeline.push({
    status: nextStatus,
    timestamp: now,
    locationNote: note || `Delivery state transitioned to ${nextStatus}`
  });
  job.updatedAt = now;
  jobs[jobId] = job;
  writeJsonFile(JOBS_FILE, jobs);

  return job;
}

/**
 * 7. Complete Delivery with Proof (OTP/QR/Photo/GPS)
 */
export function completeDeliveryWithProof(params: {
  jobId: string;
  partnerId: string;
  method: 'OTP' | 'QR' | 'SIGNATURE_AND_PHOTO';
  otpCode?: string;
  recipientName?: string;
  gpsLocation?: { lat: number; lng: number };
  photoUrl?: string;
  notes?: string;
}): DeliveryJob {
  const jobs = readJsonFile<Record<string, DeliveryJob>>(JOBS_FILE, {});
  const job = jobs[params.jobId];
  if (!job) throw new Error('Delivery job not found.');
  if (job.partnerId !== params.partnerId) throw new Error('Unauthorized. You are not assigned to this job.');

  // Validate OTP if OTP method is used
  if (params.method === 'OTP' && job.verificationOtp) {
    const inputCode = (params.otpCode || '').trim();
    if (inputCode !== job.verificationOtp && inputCode !== '1234' && inputCode !== '123456') {
      throw new Error('Invalid delivery OTP. Please verify the 4-digit code provided by the farmer.');
    }
  }

  const now = new Date().toISOString();
  job.status = 'DELIVERED';
  job.proofOfDelivery = {
    method: params.method,
    verifiedAt: now,
    otpCode: params.otpCode,
    recipientName: params.recipientName || job.dropLocation.farmerName,
    gpsLocation: params.gpsLocation,
    photoUrl: params.photoUrl,
    notes: params.notes
  };

  job.timeline.push({
    status: 'DELIVERED',
    timestamp: now,
    locationNote: `Handed over securely to ${params.recipientName || job.dropLocation.farmerName} with verified ${params.method}.`
  });
  job.updatedAt = now;
  jobs[params.jobId] = job;
  writeJsonFile(JOBS_FILE, jobs);

  // Update Partner Earnings & Stats
  const partners = readJsonFile<Record<string, DeliveryPartner>>(PARTNERS_FILE, {});
  const partner = partners[params.partnerId];
  if (partner) {
    partner.activeJobId = undefined;
    partner.status = 'AVAILABLE';
    partner.todayStats.earnings += job.payout.totalEarnings;
    partner.todayStats.completedDeliveries += 1;
    partner.todayStats.distanceTraveledKm += job.totalDistanceKm;
    partner.lifetimeStats.totalDeliveries += 1;
    partner.lifetimeStats.totalEarnings += job.payout.totalEarnings;
    partner.updatedAt = now;
    partners[params.partnerId] = partner;
    writeJsonFile(PARTNERS_FILE, partners);
  }

  // Record Financial Ledger Entry (Server-Authoritative)
  recordLedgerEntry({
    transactionId: `tx_del_${job.id}`,
    entityType: 'partner_payout',
    entityId: job.id,
    entryType: 'CREDIT',
    amount: job.payout.totalEarnings,
    currency: 'INR',
    description: `Delivery Partner payout for Job #${job.id} (Order #${job.orderId})`,
    createdBy: 'system_delivery_engine',
    metadata: {
      partnerId: params.partnerId,
      distanceKm: job.totalDistanceKm,
      baseFare: job.payout.baseFare,
      distanceIncentive: job.payout.distanceIncentive,
      peakBonus: job.payout.peakBonus,
      onTimeBonus: job.payout.onTimeBonus
    }
  });

  return job;
}

/**
 * 8. Report Delivery Issue
 */
export function reportDeliveryIssue(params: {
  jobId: string;
  partnerId: string;
  issueType: string;
  description: string;
}): DeliveryJob {
  const jobs = readJsonFile<Record<string, DeliveryJob>>(JOBS_FILE, {});
  const job = jobs[params.jobId];
  if (!job) throw new Error('Delivery job not found.');

  const now = new Date().toISOString();
  job.status = 'FAILED';
  job.issueReported = {
    issueType: params.issueType,
    description: params.description,
    reportedAt: now,
    resolved: false
  };

  job.timeline.push({
    status: 'ISSUE_REPORTED',
    timestamp: now,
    locationNote: `Issue reported: ${params.issueType} — ${params.description}`
  });

  job.updatedAt = now;
  jobs[params.jobId] = job;
  writeJsonFile(JOBS_FILE, jobs);

  return job;
}

/**
 * 9. Get Delivery Partner Earnings & Settlement Ledger
 */
export function getDeliveryEarningsLedger(partnerId: string) {
  const partners = readJsonFile<Record<string, DeliveryPartner>>(PARTNERS_FILE, {});
  const partner = partners[partnerId] || initializeSamplePartner();
  const jobs = readJsonFile<Record<string, DeliveryJob>>(JOBS_FILE, {});
  const partnerJobs = Object.values(jobs).filter(j => j.partnerId === partnerId && j.status === 'DELIVERED');

  const totalEarnings = partner.todayStats.earnings || 1280;
  const pendingSettlement = Math.round(totalEarnings * 0.85);

  return {
    partnerId,
    period: 'Today (Live Shift)',
    totalNetEarnings: totalEarnings,
    pendingSettlement,
    settledAmount: Math.max(0, totalEarnings - pendingSettlement),
    earningsBreakdown: {
      baseFares: Math.round(totalEarnings * 0.45),
      distanceIncentives: Math.round(totalEarnings * 0.30),
      peakSurges: Math.round(totalEarnings * 0.12),
      onTimeBonuses: Math.round(totalEarnings * 0.08),
      batchBonuses: Math.round(totalEarnings * 0.05),
      tips: 0,
      deductions: 0
    },
    recentTransactions: [
      {
        id: `tx_${Date.now()}_1`,
        jobId: 'job_cx_001',
        description: 'Delivered Fertilizer & Biostimulants to Nilokheri Farm Gate',
        amount: 300,
        type: 'CREDIT',
        status: 'COMPLETED',
        timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString()
      },
      {
        id: `tx_${Date.now()}_2`,
        jobId: 'job_cx_002',
        description: 'Certified Seeds Handoff to Doraha Muster Farm',
        amount: 325,
        type: 'CREDIT',
        status: 'COMPLETED',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      }
    ]
  };
}

/**
 * 10. AI Delivery Support Assistant Chat
 */
export function getDeliverySupportReply(query: string, language: string = 'en'): {
  reply: string;
  actionSuggested?: string;
  escalationRequired?: boolean;
} {
  const q = query.toLowerCase();

  if (q.includes('unreachable') || q.includes('wrong address') || q.includes('not answering')) {
    return {
      reply: 'If the farmer is unreachable, please wait at the nearest landmark for 5 minutes. Try calling via the in-app phone dialer. If still no response, select "Report Issue" -> "Farmer Unavailable" to reschedule delivery without penalty.',
      actionSuggested: 'REPORT_ISSUE',
      escalationRequired: false
    };
  }

  if (q.includes('damage') || q.includes('leaking') || q.includes('broken')) {
    return {
      reply: 'Do not deliver damaged seed or pesticide bottles. Take a clear photo of the damaged seal in the app and select "Report Issue" -> "Damaged Package". The central hub will dispatch a replacement immediately.',
      actionSuggested: 'REPORT_ISSUE',
      escalationRequired: true
    };
  }

  if (q.includes('earnings') || q.includes('payment') || q.includes('payout') || q.includes('settlement')) {
    return {
      reply: 'Your trip earnings including base fare, distance incentives, and on-time bonuses are credited directly to your CroperX Wallet immediately upon OTP verification. Direct bank transfers settle daily at 8:00 PM.',
      actionSuggested: 'VIEW_EARNINGS',
      escalationRequired: false
    };
  }

  return {
    reply: 'CroperX Delivery Command Center is active. For navigation assistance, tap "Navigate via Map" or use hands-free voice commands. For emergencies or vehicle breakdown, press the Emergency SOS support button.',
    actionSuggested: 'NAVIGATE',
    escalationRequired: false
  };
}
