import { FarmerSettings, AdviserSettings, AdminSettings, UserRole } from '../types';

export const DEFAULT_FARMER_SETTINGS: FarmerSettings = {
  language: 'en',
  voiceGuidance: true,
  voiceResponses: true,
  voiceLanguage: 'en',
  cameraPermission: 'granted',
  microphonePermission: 'granted',
  preferredCamera: 'environment',
  alertsWeather: true,
  alertsCrop: true,
  alertsWater: true,
  alertsAdviser: true,
  displayTheme: 'light',
  largeText: false,
};

export const DEFAULT_ADVISER_SETTINGS: AdviserSettings = {
  notifNewCall: true,
  notifUrgentCrop: true,
  notifNewCase: true,
  notifFarmerMessage: true,
  notifIotAlert: true,
  callSound: true,
  autoAccept: false,
  cameraPreference: 'hd',
  micPreference: 'noise_cancelling',
  defaultDashboard: 'overview',
  compactMode: false,
  notificationDensity: 'all',
  interfaceLanguage: 'en',
  voiceLanguage: 'en',
};

export const DEFAULT_ADMIN_SETTINGS: AdminSettings = {
  platformName: 'CroperX Enterprise Agritech Platform',
  defaultLanguage: 'en',
  maintenanceMode: false,
  alertSystem: true,
  alertDevice: true,
  alertWebRTC: true,
  alertAiService: true,
  sessionDurationHours: 24,
  authPolicies: 'PBKDF2 Password + OTP Secondary Verification',
  passwordPolicyMinLength: 8,
  otpPolicy: 'Required for Administrative Operations',
  weatherApiStatus: 'Operational (Open-Meteo & IMD Live)',
  satelliteServiceStatus: 'Operational (Copernicus Sentinel-2 NDVI)',
  aiServiceStatus: 'Operational (Gemini 3.7 Flash + Agronomic Rule Engine)',
  iotServiceStatus: 'Operational (ESP32 Mesh Gateway Bridge)',
  webrtcServiceStatus: 'Operational (STUN/TURN High-Definition Bridge)',
  auditRetentionDays: 90,
  securityEventLogging: true,
};

export async function changeUserPassword(params: {
  phoneNumber: string;
  currentPassword: string;
  newPassword: string;
}): Promise<string> {
  const response = await fetch('/api/auth/change-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to change password');
  }

  return data.message || 'Password changed successfully.';
}

export async function logoutAllUserSessions(phoneNumber: string): Promise<string> {
  const response = await fetch('/api/auth/logout-all', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phoneNumber }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to invalidate all sessions');
  }

  return data.message || 'All sessions have been invalidated.';
}

export async function fetchUserSettings(phoneNumber: string): Promise<any> {
  try {
    const response = await fetch(`/api/auth/settings/${phoneNumber}`);
    if (response.ok) {
      const data = await response.json();
      if (data.settings) return data.settings;
    }
  } catch (err) {
    console.warn('Could not fetch server settings, using local storage fallback:', err);
  }

  try {
    const local = localStorage.getItem(`croperx_settings_${phoneNumber}`);
    return local ? JSON.parse(local) : null;
  } catch {
    return null;
  }
}

export async function saveUserSettings(phoneNumber: string, settings: any): Promise<any> {
  try {
    localStorage.setItem(`croperx_settings_${phoneNumber}`, JSON.stringify(settings));
  } catch {}

  try {
    const response = await fetch('/api/auth/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber, settings }),
    });
    if (response.ok) {
      const data = await response.json();
      return data.settings;
    }
  } catch (err) {
    console.warn('Could not save settings to server, saved locally:', err);
  }

  return settings;
}
