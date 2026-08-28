import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { scoreAdviserAssessment, TOTAL_QUESTIONS_COUNT, PASSING_SCORE_THRESHOLD } from './adviserAssessmentMaster';
import { scoreAdviserMasteryTest, MASTERY_PASSING_THRESHOLD } from './adviserMasteryTestMaster';
import { getSupabase } from './supabase';

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), 'data');
const ADVISER_APPLICATIONS_FILE = path.join(DATA_DIR, 'adviser_applications_db.json');
const ADVISER_ATTEMPTS_FILE = path.join(DATA_DIR, 'adviser_attempts_db.json');
const ADVISER_COURSE_PROGRESS_FILE = path.join(DATA_DIR, 'adviser_course_progress_db.json');
const ADVISER_ACTIVATION_TOKENS_FILE = path.join(DATA_DIR, 'adviser_activation_tokens_db.json');
const USERS_FILE = path.join(DATA_DIR, 'users_db.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch (e) {
    console.warn('Could not create DATA_DIR:', e);
  }
}

export interface AdviserApplicationRecord {
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
  secondaryCrops: string[];
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
  passwordSetupCompleted: boolean;
  courseCompleted: boolean;
  masteryScore?: number;
  createdAt: string;
  updatedAt: string;
}

// In-Memory Fallback & File Sync Helpers
function readJsonFile<T>(filePath: string, fallback: T): T {
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn(`Error reading ${filePath}:`, err);
  }
  return fallback;
}

function writeJsonFile<T>(filePath: string, data: T): void {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.warn(`Error writing ${filePath}:`, err);
  }
}

// Read all applications
export function getAdviserApplications(): Record<string, AdviserApplicationRecord> {
  return readJsonFile<Record<string, AdviserApplicationRecord>>(ADVISER_APPLICATIONS_FILE, {});
}

export function saveAdviserApplications(db: Record<string, AdviserApplicationRecord>): void {
  writeJsonFile(ADVISER_APPLICATIONS_FILE, db);
}

// Helper to hash password with PBKDF2 HMAC-SHA512
function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const usedSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, usedSalt, 10000, 64, 'sha512').toString('hex');
  return { hash, salt: usedSalt };
}

/**
 * Register or update an Adviser Application
 */
export async function registerAdviserApplication(data: {
  mobile: string;
  fullName: string;
  email?: string;
  specialization?: string;
  yearsOfExperience?: number;
  qualification?: string;
  institution?: string;
  primaryCrops?: string[];
  secondaryCrops?: string[];
  languages?: string[];
  region?: string;
  district?: string;
  state?: string;
}): Promise<AdviserApplicationRecord> {
  const cleanMobile = data.mobile.trim();
  const db = getAdviserApplications();
  const existing = db[cleanMobile];

  const now = new Date().toISOString();
  const newApp: AdviserApplicationRecord = {
    id: existing?.id || 'adv_app_' + Date.now() + '_' + crypto.randomBytes(4).toString('hex'),
    userId: existing?.userId,
    mobile: cleanMobile,
    fullName: data.fullName.trim(),
    email: data.email?.trim() || existing?.email || '',
    specialization: data.specialization?.trim() || existing?.specialization || 'Plant Pathology & Crop Health',
    yearsOfExperience: Number(data.yearsOfExperience) || existing?.yearsOfExperience || 3,
    qualification: data.qualification?.trim() || existing?.qualification || 'B.Sc Agriculture',
    institution: data.institution?.trim() || existing?.institution || 'Agricultural University',
    primaryCrops: Array.isArray(data.primaryCrops) && data.primaryCrops.length > 0 ? data.primaryCrops : (existing?.primaryCrops || ['Rice', 'Wheat']),
    secondaryCrops: Array.isArray(data.secondaryCrops) ? data.secondaryCrops : (existing?.secondaryCrops || ['Cotton', 'Sugarcane']),
    languages: Array.isArray(data.languages) && data.languages.length > 0 ? data.languages : (existing?.languages || ['English', 'Hindi']),
    region: data.region?.trim() || existing?.region || 'Northern Agricultural Zone',
    district: data.district?.trim() || existing?.district || 'Ludhiana',
    state: data.state?.trim() || existing?.state || 'Punjab',
    status: existing?.status || 'ASSESSMENT_REQUIRED',
    assessmentScore: existing?.assessmentScore,
    assessmentTotal: existing?.assessmentTotal || TOTAL_QUESTIONS_COUNT,
    assessmentPercentage: existing?.assessmentPercentage,
    assessmentSubmittedAt: existing?.assessmentSubmittedAt,
    assessmentCategoryBreakdown: existing?.assessmentCategoryBreakdown,
    reviewedAt: existing?.reviewedAt,
    reviewedBy: existing?.reviewedBy,
    rejectionReason: existing?.rejectionReason,
    activationToken: existing?.activationToken,
    passwordSetupCompleted: existing?.passwordSetupCompleted ?? false,
    courseCompleted: existing?.courseCompleted ?? false,
    masteryScore: existing?.masteryScore,
    createdAt: existing?.createdAt || now,
    updatedAt: now
  };

  db[cleanMobile] = newApp;
  saveAdviserApplications(db);

  // Sync to Supabase if connected
  const { client, isConfigured } = getSupabase();
  if (isConfigured && client) {
    try {
      await client.from('adviser_applications').upsert(
        {
          id: newApp.id,
          mobile: newApp.mobile,
          full_name: newApp.fullName,
          email: newApp.email,
          specialization: newApp.specialization,
          years_of_experience: newApp.yearsOfExperience,
          qualification: newApp.qualification,
          institution: newApp.institution,
          primary_crops: newApp.primaryCrops,
          secondary_crops: newApp.secondaryCrops,
          languages: newApp.languages,
          region: newApp.region,
          district: newApp.district,
          state: newApp.state,
          status: newApp.status,
          assessment_score: newApp.assessmentScore || 0,
          assessment_total: newApp.assessmentTotal || 50,
          assessment_percentage: newApp.assessmentPercentage || 0,
          password_setup_completed: newApp.passwordSetupCompleted,
          course_completed: newApp.courseCompleted,
          updated_at: newApp.updatedAt
        },
        { onConflict: 'mobile' }
      );
    } catch (e) {
      console.warn('Supabase sync warning for adviser application:', e);
    }
  }

  return newApp;
}

/**
 * Get single application by mobile
 */
export async function getAdviserApplication(mobile: string): Promise<AdviserApplicationRecord | null> {
  const cleanMobile = mobile.trim();
  const db = getAdviserApplications();
  return db[cleanMobile] || null;
}

/**
 * Authoritative Server-Side Assessment Submission & Evaluation
 */
export async function submitAssessmentAnswers(
  mobile: string,
  answers: Record<number | string, number>
): Promise<{
  application: AdviserApplicationRecord;
  scoring: ReturnType<typeof scoreAdviserAssessment>;
}> {
  const cleanMobile = mobile.trim();
  const db = getAdviserApplications();
  let app = db[cleanMobile];

  if (!app) {
    // Create an initial shell application if submitting
    app = await registerAdviserApplication({
      mobile: cleanMobile,
      fullName: 'Adviser Applicant'
    });
  }

  // Calculate authoritative server-side score
  const scoring = scoreAdviserAssessment(answers);

  const now = new Date().toISOString();
  app.assessmentScore = scoring.score;
  app.assessmentTotal = scoring.total;
  app.assessmentPercentage = scoring.percentage;
  app.assessmentSubmittedAt = now;
  app.assessmentCategoryBreakdown = scoring.categoryBreakdown;
  app.status = scoring.status;
  app.updatedAt = now;

  db[cleanMobile] = app;
  saveAdviserApplications(db);

  // Store attempt record
  const attemptsDb = readJsonFile<any[]>(ADVISER_ATTEMPTS_FILE, []);
  const attemptRecord = {
    id: 'att_' + Date.now() + '_' + crypto.randomBytes(3).toString('hex'),
    applicationId: app.id,
    mobile: cleanMobile,
    score: scoring.score,
    total: scoring.total,
    percentage: scoring.percentage,
    isEligible: scoring.isEligible,
    status: scoring.status,
    submittedAt: now
  };
  attemptsDb.unshift(attemptRecord);
  writeJsonFile(ADVISER_ATTEMPTS_FILE, attemptsDb);

  // Supabase sync
  const { client, isConfigured } = getSupabase();
  if (isConfigured && client) {
    try {
      await client
        .from('adviser_applications')
        .update({
          status: app.status,
          assessment_score: app.assessmentScore,
          assessment_percentage: app.assessmentPercentage,
          assessment_submitted_at: app.assessmentSubmittedAt,
          updated_at: app.updatedAt
        })
        .eq('mobile', cleanMobile);

      await client.from('adviser_assessment_attempts').insert({
        application_id: app.id,
        mobile: cleanMobile,
        score: scoring.score,
        total: scoring.total,
        percentage: scoring.percentage,
        is_eligible: scoring.isEligible
      });
    } catch (e) {
      console.warn('Supabase assessment sync error:', e);
    }
  }

  return { application: app, scoring };
}

/**
 * Admin Review: Approve or Reject an Adviser Application
 */
export async function reviewAdviserApplication(
  applicationIdOrMobile: string,
  action: 'APPROVE' | 'REJECT',
  reviewedBy: string,
  rejectionReason?: string
): Promise<{
  success: boolean;
  application: AdviserApplicationRecord;
  activationToken?: string;
  message: string;
}> {
  const db = getAdviserApplications();
  let targetMobile: string | null = null;

  for (const [mob, app] of Object.entries(db)) {
    if (app.id === applicationIdOrMobile || mob === applicationIdOrMobile) {
      targetMobile = mob;
      break;
    }
  }

  if (!targetMobile || !db[targetMobile]) {
    throw new Error('Adviser application not found');
  }

  const app = db[targetMobile];
  const now = new Date().toISOString();
  let activationToken: string | undefined;

  if (action === 'APPROVE') {
    app.status = 'APPROVED';
    app.reviewedAt = now;
    app.reviewedBy = reviewedBy || 'Admin';
    app.rejectionReason = undefined;

    // Generate single-use secure activation token
    const rawToken = 'cx_act_' + crypto.randomBytes(24).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    app.activationToken = tokenHash;
    activationToken = rawToken;

    // Store token record with 48h expiry
    const tokensDb = readJsonFile<any[]>(ADVISER_ACTIVATION_TOKENS_FILE, []);
    tokensDb.push({
      applicationId: app.id,
      mobile: targetMobile,
      tokenHash,
      rawTokenForDisplay: rawToken,
      expiresAt: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
      usedAt: null,
      createdAt: now
    });
    writeJsonFile(ADVISER_ACTIVATION_TOKENS_FILE, tokensDb);
  } else {
    app.status = 'REJECTED';
    app.reviewedAt = now;
    app.reviewedBy = reviewedBy || 'Admin';
    app.rejectionReason = rejectionReason || 'Application does not meet current verification standards.';
  }

  app.updatedAt = now;
  db[targetMobile] = app;
  saveAdviserApplications(db);

  // Supabase sync
  const { client, isConfigured } = getSupabase();
  if (isConfigured && client) {
    try {
      await client
        .from('adviser_applications')
        .update({
          status: app.status,
          reviewed_at: app.reviewedAt,
          reviewed_by: app.reviewedBy,
          rejection_reason: app.rejectionReason || null,
          updated_at: app.updatedAt
        })
        .eq('mobile', targetMobile);
    } catch (e) {
      console.warn('Supabase review sync error:', e);
    }
  }

  return {
    success: true,
    application: app,
    activationToken,
    message: action === 'APPROVE' ? 'Adviser application approved successfully.' : 'Adviser application rejected.'
  };
}

/**
 * Secure Adviser Activation & Password Setup
 */
export async function activateAdviserPassword(
  mobileOrToken: string,
  newPassword: string
): Promise<{
  success: boolean;
  application: AdviserApplicationRecord;
  user: any;
  message: string;
}> {
  if (!newPassword || newPassword.length < 6) {
    throw new Error('Password must be at least 6 characters long');
  }

  const db = getAdviserApplications();
  let targetApp: AdviserApplicationRecord | null = null;
  let targetMobile = '';

  // Check by mobile or token
  for (const [mob, app] of Object.entries(db)) {
    if (mob === mobileOrToken || app.id === mobileOrToken || app.activationToken === mobileOrToken) {
      targetApp = app;
      targetMobile = mob;
      break;
    }
  }

  // Also check token hash match
  if (!targetApp) {
    const rawTokenHash = crypto.createHash('sha256').update(mobileOrToken).digest('hex');
    for (const [mob, app] of Object.entries(db)) {
      if (app.activationToken === rawTokenHash) {
        targetApp = app;
        targetMobile = mob;
        break;
      }
    }
  }

  if (!targetApp) {
    throw new Error('Adviser application not found or invalid activation credential');
  }

  if (targetApp.status !== 'APPROVED' && targetApp.status !== 'ACTIVATION_REQUIRED' && targetApp.status !== 'LEARNING_REQUIRED' && targetApp.status !== 'ACTIVE') {
    throw new Error(`Application is in ${targetApp.status} status and cannot be activated`);
  }

  const now = new Date().toISOString();
  const { hash, salt } = hashPassword(newPassword);

  // Update or create in users_db.json
  const usersDb = readJsonFile<Record<string, any>>(USERS_FILE, {});
  const existingUser = usersDb[targetMobile] || {};

  const updatedUser = {
    ...existingUser,
    id: existingUser.id || 'adv_usr_' + Date.now() + '_' + crypto.randomBytes(4).toString('hex'),
    phoneNumber: targetMobile,
    farmerName: targetApp.fullName,
    fullName: targetApp.fullName,
    role: 'farmer_adviser',
    specialization: targetApp.specialization,
    yearsOfExperience: targetApp.yearsOfExperience,
    qualification: targetApp.qualification,
    primaryCrops: targetApp.primaryCrops,
    languages: targetApp.languages,
    region: targetApp.region,
    district: targetApp.district,
    state: targetApp.state,
    phoneVerified: true,
    accountStatus: 'active',
    passwordHash: hash,
    passwordSalt: salt,
    updatedAt: now,
    lastLoginAt: now
  };

  usersDb[targetMobile] = updatedUser;
  writeJsonFile(USERS_FILE, usersDb);

  // Update application record
  targetApp.passwordSetupCompleted = true;
  targetApp.status = targetApp.courseCompleted ? 'ACTIVE' : 'LEARNING_REQUIRED';
  targetApp.userId = updatedUser.id;
  targetApp.updatedAt = now;
  targetApp.activationToken = undefined; // Invalidate token

  db[targetMobile] = targetApp;
  saveAdviserApplications(db);

  // Supabase sync
  const { client, isConfigured } = getSupabase();
  if (isConfigured && client) {
    try {
      await client.from('users').upsert(
        {
          mobile: targetMobile,
          full_name: targetApp.fullName,
          password_hash: hash,
          password_salt: salt,
          role: 'farmer_adviser',
          status: 'active',
          phone_verified: true,
          updated_at: now
        },
        { onConflict: 'mobile' }
      );

      await client
        .from('adviser_applications')
        .update({
          password_setup_completed: true,
          status: targetApp.status,
          user_id: updatedUser.id,
          updated_at: now
        })
        .eq('mobile', targetMobile);
    } catch (e) {
      console.warn('Supabase activate sync error:', e);
    }
  }

  const { passwordHash: _, passwordSalt: __, ...safeUser } = updatedUser;

  return {
    success: true,
    application: targetApp,
    user: safeUser,
    message: 'Adviser password configured successfully. Proceeding to mandatory CroperX Learning Gateway.'
  };
}

/**
 * Course Progress Handlers
 */
export async function getCourseProgress(mobile: string): Promise<{
  mobile: string;
  completedModules: string[];
  progressPercentage: number;
  lastActiveModule?: string;
}> {
  const cleanMobile = mobile.trim();
  const db = readJsonFile<Record<string, any>>(ADVISER_COURSE_PROGRESS_FILE, {});
  const rec = db[cleanMobile] || {
    mobile: cleanMobile,
    completedModules: [],
    progressPercentage: 0,
    lastActiveModule: 'mod-01-welcome'
  };
  return rec;
}

export async function updateCourseProgress(
  mobile: string,
  moduleId: string,
  completed: boolean
): Promise<{
  mobile: string;
  completedModules: string[];
  progressPercentage: number;
  lastActiveModule?: string;
}> {
  const cleanMobile = mobile.trim();
  const db = readJsonFile<Record<string, any>>(ADVISER_COURSE_PROGRESS_FILE, {});
  const rec = db[cleanMobile] || {
    mobile: cleanMobile,
    completedModules: [],
    progressPercentage: 0,
    lastActiveModule: moduleId
  };

  const set = new Set<string>(rec.completedModules || []);
  if (completed) {
    set.add(moduleId);
  } else {
    set.delete(moduleId);
  }

  const completedList = Array.from(set);
  const totalModules = 12;
  const progressPercentage = Math.min(100, Math.round((completedList.length / totalModules) * 100));

  const updated = {
    mobile: cleanMobile,
    completedModules: completedList,
    progressPercentage,
    lastActiveModule: moduleId,
    updatedAt: new Date().toISOString()
  };

  db[cleanMobile] = updated;
  writeJsonFile(ADVISER_COURSE_PROGRESS_FILE, db);

  return updated;
}

/**
 * Submit Final Mastery Test
 */
export async function submitMasteryAnswers(
  mobile: string,
  answers: Record<number | string, number>
): Promise<{
  passed: boolean;
  score: number;
  total: number;
  percentage: number;
  message: string;
  application: AdviserApplicationRecord;
}> {
  const cleanMobile = mobile.trim();
  const scoring = scoreAdviserMasteryTest(answers);

  const db = getAdviserApplications();
  let app = db[cleanMobile];

  if (!app) {
    app = await registerAdviserApplication({
      mobile: cleanMobile,
      fullName: 'Adviser'
    });
  }

  const now = new Date().toISOString();
  app.masteryScore = scoring.score;

  if (scoring.passed) {
    app.courseCompleted = true;
    app.status = 'ACTIVE';
  }

  app.updatedAt = now;
  db[cleanMobile] = app;
  saveAdviserApplications(db);

  // Update user in users_db.json
  const usersDb = readJsonFile<Record<string, any>>(USERS_FILE, {});
  if (usersDb[cleanMobile] && scoring.passed) {
    usersDb[cleanMobile].courseCompleted = true;
    usersDb[cleanMobile].role = 'farmer_adviser';
    usersDb[cleanMobile].accountStatus = 'active';
    writeJsonFile(USERS_FILE, usersDb);
  }

  return {
    passed: scoring.passed,
    score: scoring.score,
    total: scoring.total,
    percentage: scoring.percentage,
    message: scoring.message,
    application: app
  };
}

/**
 * Dashboard Access Guard Evaluator
 */
export async function checkAdviserDashboardGuard(mobile?: string, role?: string): Promise<{
  allowed: boolean;
  requiredState:
    | 'ALLOW'
    | 'AUTHENTICATION_REQUIRED'
    | 'NOT_REGISTERED'
    | 'ASSESSMENT_REQUIRED'
    | 'NOT_ELIGIBLE'
    | 'PENDING_ADMIN_REVIEW'
    | 'REJECTED'
    | 'ACTIVATION_REQUIRED'
    | 'LEARNING_REQUIRED'
    | 'ACTIVE';
  application: AdviserApplicationRecord | null;
  message: string;
}> {
  if (!mobile) {
    return {
      allowed: false,
      requiredState: 'AUTHENTICATION_REQUIRED',
      application: null,
      message: 'Please log in or register to access the Adviser Workstation.'
    };
  }

  const cleanMobile = mobile.trim();
  const db = getAdviserApplications();
  const app = db[cleanMobile];

  if (!app) {
    // If user has demo admin or active adviser account already configured
    const usersDb = readJsonFile<Record<string, any>>(USERS_FILE, {});
    const user = usersDb[cleanMobile];
    if (user && user.role === 'admin') {
      return {
        allowed: true,
        requiredState: 'ALLOW',
        application: null,
        message: 'Administrator bypass granted.'
      };
    }
    if (user && user.role === 'farmer_adviser' && (user.isDemoAdviser || user.phoneVerified)) {
      return {
        allowed: true,
        requiredState: 'ALLOW',
        application: null,
        message: 'Verified adviser session.'
      };
    }

    return {
      allowed: false,
      requiredState: 'NOT_REGISTERED',
      application: null,
      message: 'Adviser registration and professional verification required.'
    };
  }

  // Evaluate state strictly
  if (app.status === 'NOT_ELIGIBLE') {
    return {
      allowed: false,
      requiredState: 'NOT_ELIGIBLE',
      application: app,
      message: 'Assessment score does not meet minimum verification requirements (25/50).'
    };
  }

  if (app.status === 'ASSESSMENT_REQUIRED') {
    return {
      allowed: false,
      requiredState: 'ASSESSMENT_REQUIRED',
      application: app,
      message: '50-Question Agronomic Competency Assessment must be completed.'
    };
  }

  if (app.status === 'PENDING_ADMIN_REVIEW') {
    return {
      allowed: false,
      requiredState: 'PENDING_ADMIN_REVIEW',
      application: app,
      message: 'Application has passed the assessment and is currently under Admin review.'
    };
  }

  if (app.status === 'REJECTED') {
    return {
      allowed: false,
      requiredState: 'REJECTED',
      application: app,
      message: app.rejectionReason || 'Application was not approved by administration.'
    };
  }

  if (app.status === 'APPROVED' && !app.passwordSetupCompleted) {
    return {
      allowed: false,
      requiredState: 'ACTIVATION_REQUIRED',
      application: app,
      message: 'Application approved! Please set up your secure password.'
    };
  }

  if (app.passwordSetupCompleted && !app.courseCompleted) {
    return {
      allowed: false,
      requiredState: 'LEARNING_REQUIRED',
      application: app,
      message: 'Mandatory CroperX 12-Module Learning Gateway & Final Mastery Test must be completed.'
    };
  }

  if (app.status === 'ACTIVE' || (app.passwordSetupCompleted && app.courseCompleted)) {
    return {
      allowed: true,
      requiredState: 'ALLOW',
      application: app,
      message: 'Access granted.'
    };
  }

  return {
    allowed: false,
    requiredState: app.status as any,
    application: app,
    message: 'Verification in progress.'
  };
}
