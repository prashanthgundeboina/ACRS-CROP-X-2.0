import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { getSupabase } from './supabase.js';

const DATA_DIR = path.join(process.cwd(), 'data');
const EXAM_SESSIONS_FILE = path.join(DATA_DIR, 'adviser_exam_sessions_db.json');
const EXAM_VIOLATIONS_FILE = path.join(DATA_DIR, 'adviser_exam_violations_db.json');
const EXAM_SECURITY_LOGS_FILE = path.join(DATA_DIR, 'adviser_security_events_db.json');

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
    console.error(`[AdviserSecurity Store] Error reading ${path.basename(filePath)}:`, err);
  }
  return fallback;
}

function writeJsonFile<T>(filePath: string, data: T) {
  try {
    ensureDataDir();
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`[AdviserSecurity Store] Error writing ${path.basename(filePath)}:`, err);
  }
}

export interface AdviserExamSession {
  id: string;
  mobile: string;
  applicantName: string;
  state: 'NOT_STARTED' | 'PERMISSION_PENDING' | 'DEVICE_CHECK' | 'READY' | 'IN_PROGRESS' | 'WARNING' | 'TERMINATED_SECURITY' | 'SUBMITTED' | 'EVALUATED' | 'PASSED' | 'FAILED';
  startedAt?: string;
  endedAt?: string;
  warningCount: number;
  maxWarnings: number;
  terminated: boolean;
  terminationReason?: string;
  nextEligibleAt?: string;
  score?: number;
  maxScore?: number;
  percentage?: number;
  mediaCheckPassed?: boolean;
  faceCheckPassed?: boolean;
  activeQuestionIndex?: number;
  createdAt: string;
  updatedAt: string;
}

export interface SecurityEventPayload {
  mobile: string;
  sessionId?: string;
  eventType: string;
  severity?: 'INFO' | 'WARNING' | 'CRITICAL';
  metadata?: Record<string, any>;
  questionIndex?: number;
}

/**
 * 1. Check Reattempt Eligibility
 */
export function checkReattemptEligibility(mobile: string): {
  isEligible: boolean;
  remainingDays?: number;
  nextEligibleAt?: string;
  lastTerminationReason?: string;
  adminOverride?: boolean;
  adminOverrideReason?: string;
} {
  const cleanMobile = mobile.replace(/\D/g, '');
  const sessions = readJsonFile<Record<string, AdviserExamSession>>(EXAM_SESSIONS_FILE, {});
  const candidateSessions = Object.values(sessions)
    .filter(s => s.mobile.replace(/\D/g, '') === cleanMobile)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (candidateSessions.length === 0) {
    return { isEligible: true };
  }

  const latestSession = candidateSessions[0];
  if (latestSession.terminated && latestSession.nextEligibleAt) {
    const nextDate = new Date(latestSession.nextEligibleAt);
    const now = new Date();
    if (now < nextDate) {
      const diffMs = nextDate.getTime() - now.getTime();
      const remainingDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
      return {
        isEligible: false,
        remainingDays,
        nextEligibleAt: latestSession.nextEligibleAt,
        lastTerminationReason: latestSession.terminationReason || 'Repeated security or proctoring violation detected during assessment.'
      };
    }
  }

  return { isEligible: true };
}

/**
 * 2. Initialize or Resume an Exam Session
 */
export function startAdviserExamSession(mobile: string, applicantName: string = 'Adviser Applicant'): {
  success: boolean;
  session?: AdviserExamSession;
  error?: string;
  rejection?: any;
} {
  const eligibility = checkReattemptEligibility(mobile);
  if (!eligibility.isEligible) {
    return {
      success: false,
      error: `Assessment blocked. Reattempt is scheduled for ${new Date(eligibility.nextEligibleAt!).toLocaleDateString()} (${eligibility.remainingDays} days remaining). Reason: ${eligibility.lastTerminationReason}`,
      rejection: eligibility
    };
  }

  const cleanMobile = mobile.replace(/\D/g, '');
  const sessions = readJsonFile<Record<string, AdviserExamSession>>(EXAM_SESSIONS_FILE, {});
  const sessionId = `exam_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
  const now = new Date().toISOString();

  const newSession: AdviserExamSession = {
    id: sessionId,
    mobile: mobile.trim(),
    applicantName: applicantName.trim(),
    state: 'PERMISSION_PENDING',
    startedAt: now,
    warningCount: 0,
    maxWarnings: 1, // 1 warning allowed; 2nd violation terminates
    terminated: false,
    createdAt: now,
    updatedAt: now,
  };

  sessions[sessionId] = newSession;
  writeJsonFile(EXAM_SESSIONS_FILE, sessions);

  return {
    success: true,
    session: newSession
  };
}

/**
 * 3. Update Media / Device Check Status
 */
export function updateExamDeviceCheck(sessionId: string, mediaPassed: boolean, facePassed: boolean): {
  success: boolean;
  session?: AdviserExamSession;
  error?: string;
} {
  const sessions = readJsonFile<Record<string, AdviserExamSession>>(EXAM_SESSIONS_FILE, {});
  const session = sessions[sessionId];
  if (!session) {
    return { success: false, error: 'Exam session not found.' };
  }

  session.mediaCheckPassed = mediaPassed;
  session.faceCheckPassed = facePassed;
  session.state = (mediaPassed && facePassed) ? 'READY' : 'DEVICE_CHECK';
  session.updatedAt = new Date().toISOString();

  sessions[sessionId] = session;
  writeJsonFile(EXAM_SESSIONS_FILE, sessions);

  return { success: true, session };
}

/**
 * 4. Record Security Event with Server-Authoritative Derivation and 1-Warning Termination Policy
 */
export function processExamSecurityEvent(payload: SecurityEventPayload): {
  success: boolean;
  action: 'LOGGED' | 'WARNING_ISSUED' | 'EXAM_TERMINATED';
  warningMessage?: string;
  remainingWarnings: number;
  sessionStatus?: string;
  nextEligibleAt?: string;
  event: any;
} {
  const { mobile, sessionId, eventType, metadata } = payload;
  const cleanMobile = mobile.replace(/\D/g, '');
  const now = new Date().toISOString();

  // Server-authoritative severity determination
  let derivedSeverity: 'INFO' | 'WARNING' | 'CRITICAL' = 'WARNING';
  let isViolation = false;
  let violationLabel = 'Security Violation';

  switch (eventType) {
    case 'CLIPBOARD_COPY_ATTEMPT':
    case 'CLIPBOARD_CUT_ATTEMPT':
    case 'CLIPBOARD_PASTE_ATTEMPT':
      derivedSeverity = 'CRITICAL';
      isViolation = true;
      violationLabel = 'Clipboard interaction / Copying exam text is strictly prohibited.';
      break;

    case 'TAB_SWITCH_DETECTED':
    case 'WINDOW_BLUR':
      derivedSeverity = 'CRITICAL';
      isViolation = true;
      violationLabel = 'Window focus lost / Tab switching detected during active assessment.';
      break;

    case 'FULLSCREEN_EXIT':
      derivedSeverity = 'WARNING';
      isViolation = true;
      violationLabel = 'Fullscreen mode exited. Assessment must be taken in dedicated fullscreen.';
      break;

    case 'FACE_MISSING':
      derivedSeverity = 'WARNING';
      isViolation = true;
      violationLabel = 'Candidate face not detected in camera frame.';
      break;

    case 'MULTIPLE_FACES':
      derivedSeverity = 'CRITICAL';
      isViolation = true;
      violationLabel = 'Multiple faces detected in the camera frame.';
      break;

    case 'CAMERA_DISCONNECTED':
    case 'MICROPHONE_DISCONNECTED':
      derivedSeverity = 'CRITICAL';
      isViolation = true;
      violationLabel = 'Proctoring media stream (camera/mic) was disconnected.';
      break;

    default:
      derivedSeverity = payload.severity || 'INFO';
      isViolation = derivedSeverity === 'CRITICAL';
      violationLabel = eventType;
      break;
  }

  // Record event in security log
  const logs = readJsonFile<any[]>(EXAM_SECURITY_LOGS_FILE, []);
  const eventId = `sec_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
  const logEntry = {
    id: eventId,
    sessionId: sessionId || 'unknown',
    mobile: cleanMobile,
    eventType,
    severity: derivedSeverity,
    violation: isViolation,
    violationLabel,
    metadata: metadata || {},
    timestamp: now
  };
  logs.push(logEntry);
  writeJsonFile(EXAM_SECURITY_LOGS_FILE, logs);

  // Sync to Supabase if configured
  try {
    const { client, isConfigured } = getSupabase();
    if (isConfigured && client) {
      Promise.resolve(client.from('adviser_security_events').insert({
        id: crypto.randomUUID(),
        mobile: cleanMobile,
        event_type: eventType,
        severity: derivedSeverity,
        metadata: metadata || {},
        created_at: now
      })).catch(() => {});
    }
  } catch (e) {}

  // Update session violation count
  const sessions = readJsonFile<Record<string, AdviserExamSession>>(EXAM_SESSIONS_FILE, {});
  let targetSession: AdviserExamSession | undefined;

  if (sessionId && sessions[sessionId]) {
    targetSession = sessions[sessionId];
  } else {
    // Find latest active session for this candidate
    targetSession = Object.values(sessions)
      .filter(s => s.mobile.replace(/\D/g, '') === cleanMobile && !s.terminated && s.state !== 'SUBMITTED' && s.state !== 'PASSED')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0];
  }

  if (!targetSession) {
    return {
      success: true,
      action: 'LOGGED',
      remainingWarnings: 0,
      event: logEntry
    };
  }

  if (!isViolation) {
    return {
      success: true,
      action: 'LOGGED',
      remainingWarnings: Math.max(0, targetSession.maxWarnings - targetSession.warningCount),
      event: logEntry
    };
  }

  targetSession.warningCount += 1;
  targetSession.updatedAt = now;

  // 1-Warning Policy: If warningCount > 1, TERMINATE assessment immediately
  if (targetSession.warningCount > targetSession.maxWarnings) {
    targetSession.terminated = true;
    targetSession.state = 'TERMINATED_SECURITY';
    targetSession.terminationReason = `Repeated security violation: ${violationLabel}`;
    // Next attempt scheduled in 30 days (1 month)
    const nextDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    targetSession.nextEligibleAt = nextDate.toISOString();
    targetSession.endedAt = now;

    sessions[targetSession.id] = targetSession;
    writeJsonFile(EXAM_SESSIONS_FILE, sessions);

    return {
      success: true,
      action: 'EXAM_TERMINATED',
      warningMessage: `Assessment terminated due to repeated security violation: ${violationLabel}. Next eligible attempt date: ${nextDate.toLocaleDateString()}.`,
      remainingWarnings: 0,
      sessionStatus: 'TERMINATED_SECURITY',
      nextEligibleAt: targetSession.nextEligibleAt,
      event: logEntry
    };
  }

  // First violation: issue warning
  targetSession.state = 'WARNING';
  sessions[targetSession.id] = targetSession;
  writeJsonFile(EXAM_SESSIONS_FILE, sessions);

  return {
    success: true,
    action: 'WARNING_ISSUED',
    warningMessage: `Warning 1 of 1: ${violationLabel}. A repeated violation will result in immediate termination of your assessment.`,
    remainingWarnings: targetSession.maxWarnings - targetSession.warningCount,
    sessionStatus: 'WARNING',
    event: logEntry
  };
}

/**
 * 5. Admin Security Override for Reattempt
 */
export function adminOverrideReattempt(mobile: string, adminUser: string, reason: string): {
  success: boolean;
  message: string;
  session?: AdviserExamSession;
} {
  if (!reason || reason.trim().length < 5) {
    throw new Error('A mandatory justification reason (min 5 chars) is required for an administrative reattempt override.');
  }

  const cleanMobile = mobile.replace(/\D/g, '');
  const sessions = readJsonFile<Record<string, AdviserExamSession>>(EXAM_SESSIONS_FILE, {});
  const now = new Date().toISOString();

  const candidateSessions = Object.values(sessions)
    .filter(s => s.mobile.replace(/\D/g, '') === cleanMobile)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  if (candidateSessions.length > 0) {
    const latest = candidateSessions[0];
    latest.nextEligibleAt = now; // unlock immediately
    latest.updatedAt = now;
    sessions[latest.id] = latest;
    writeJsonFile(EXAM_SESSIONS_FILE, sessions);
  }

  // Record audit log
  const logs = readJsonFile<any[]>(EXAM_SECURITY_LOGS_FILE, []);
  logs.push({
    id: `override_${Date.now()}`,
    mobile: cleanMobile,
    eventType: 'ADMIN_REATTEMPT_OVERRIDE',
    severity: 'INFO',
    adminUser,
    reason: reason.trim(),
    timestamp: now
  });
  writeJsonFile(EXAM_SECURITY_LOGS_FILE, logs);

  return {
    success: true,
    message: `Administrative override applied for applicant ${cleanMobile}. They may now reattempt the assessment immediately.`
  };
}

/**
 * 6. Get Candidate Complete Security History
 */
export function getCandidateSecurityProfile(mobile: string) {
  const cleanMobile = mobile.replace(/\D/g, '');
  const sessions = readJsonFile<Record<string, AdviserExamSession>>(EXAM_SESSIONS_FILE, {});
  const logs = readJsonFile<any[]>(EXAM_SECURITY_LOGS_FILE, []);

  const candidateSessions = Object.values(sessions)
    .filter(s => s.mobile.replace(/\D/g, '') === cleanMobile)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const candidateLogs = logs
    .filter(l => l.mobile.replace(/\D/g, '') === cleanMobile)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const eligibility = checkReattemptEligibility(mobile);

  return {
    mobile: cleanMobile,
    sessions: candidateSessions,
    securityLogs: candidateLogs,
    eligibility,
    totalViolations: candidateLogs.filter(l => l.violation).length
  };
}
