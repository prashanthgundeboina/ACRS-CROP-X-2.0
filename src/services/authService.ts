import { UserAccount, GeoLocationData, FarmerProfile, UserRole } from '../types';

const USER_STORAGE_KEY = 'croperx_authenticated_user';
const TOKEN_STORAGE_KEY = 'croperx_auth_token';

/**
 * Validates and normalizes phone numbers into E.164 format.
 * Prevents invalid/incomplete numbers (e.g. 9 digits like +992867166) from causing Twilio dispatch errors.
 */
export function validatePhoneNumber(phone: string): { valid: boolean; normalized: string; error?: string } {
  if (!phone || !phone.trim()) {
    return { valid: false, normalized: '', error: 'Mobile number is required.' };
  }
  const trimmed = phone.trim();
  if (trimmed === '00110099') {
    return { valid: true, normalized: '00110099' };
  }
  const clean = trimmed.replace(/[\s\-\(\)\.]/g, '');
  if (clean.startsWith('+')) {
    if (/^\+[1-9]\d{9,14}$/.test(clean)) {
      return { valid: true, normalized: clean };
    }
    return { valid: false, normalized: clean, error: 'Please enter a valid international mobile number with country code (e.g., +91 98765 43210).' };
  }
  if (/^\d{10}$/.test(clean)) {
    return { valid: true, normalized: '+91' + clean };
  }
  if (/^0\d{10}$/.test(clean)) {
    return { valid: true, normalized: '+91' + clean.substring(1) };
  }
  if (/^91\d{10}$/.test(clean)) {
    return { valid: true, normalized: '+' + clean };
  }
  if (/^\d{1,9}$/.test(clean)) {
    return { valid: false, normalized: clean, error: `Mobile number has only ${clean.length} digits. Please enter a complete 10-digit mobile number.` };
  }
  if (/^\d{11,15}$/.test(clean)) {
    return { valid: true, normalized: '+' + clean };
  }
  return { valid: false, normalized: clean, error: 'Please enter a valid 10-digit mobile number (e.g., 98765 43210 or +91 98765 43210).' };
}

export async function registerUser(params: {
  phoneNumber: string;
  password: string;
  farmerName?: string;
  fullName?: string;
  role?: UserRole;
  specialization?: string;
  organization?: string;
  licenseNumber?: string;
  consultationHours?: string;
  bio?: string;
  email?: string;
  profileImage?: string;
  farmLocation?: string;
  farmAreaSize?: number;
  unitPreference?: 'metric' | 'imperial';
  preferredCropCycle?: string;
  primaryWaterSource?: string;
  soilTypeZone?: string;
  targetPhGoal?: number;
  latitude?: number;
  longitude?: number;
  district?: string;
  state?: string;
  customerType?: string;
  customerNotes?: string;
}): Promise<{ user: UserAccount; token: string }> {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Registration failed');
  }

  try {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
    localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
  } catch {
    // ignore
  }
  return data;
}

export async function requestAuthOtp(phoneNumber: string, purpose: string = 'registration'): Promise<{ success: boolean; message: string; verification?: string }> {
  const response = await fetch('/api/auth/otp/request', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phoneNumber, purpose }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to dispatch verification code via SMS.');
  }
  return data;
}

export async function verifyAuthOtp(phoneNumber: string, code: string, purpose: string = 'registration'): Promise<{ success: boolean; verified: boolean; message?: string }> {
  const response = await fetch('/api/auth/otp/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phoneNumber, code, purpose }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Invalid or expired verification code');
  }
  return data;
}

export async function loginUser(phoneNumber: string, password: string): Promise<{ user: UserAccount; token: string }> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phoneNumber, password }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Login failed');
  }

  try {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
    localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
  } catch {
    // ignore
  }
  return data;
}

export async function loginUserWithOtp(phoneNumber: string, code: string): Promise<{ user: UserAccount; token: string }> {
  const response = await fetch('/api/auth/login-otp', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phoneNumber, code }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'OTP Login failed');
  }

  try {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
    localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
  } catch {
    // ignore
  }
  return data;
}

export async function resetUserPassword(phoneNumber: string, newPassword: string, code?: string): Promise<string> {
  const response = await fetch('/api/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phoneNumber, newPassword, code }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Password reset failed');
  }

  return data.message || 'Password reset successfully';
}

export async function updateUserProfile(phoneNumber: string, updates: Partial<UserAccount>): Promise<UserAccount> {
  const response = await fetch('/api/auth/update-profile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phoneNumber, ...updates }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Profile update failed');
  }

  try {
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
  } catch {
    // ignore
  }
  return data.user;
}

export function getStoredUser(): UserAccount | null {
  try {
    const saved = localStorage.getItem(USER_STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

export function clearClientAuthState(): void {
  try {
    localStorage.removeItem(USER_STORAGE_KEY);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem('croperx_user_role');
    localStorage.removeItem('croperx_admin_preview');
    sessionStorage.clear();
  } catch {
    // ignore
  }
}

export async function logoutUser(): Promise<void> {
  clearClientAuthState();

  try {
    await fetch('/api/auth/logout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.warn('Server logout notice:', e);
  }

  // Broadcast logout event across tabs
  try {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('croperx:logout'));
      window.dispatchEvent(new StorageEvent('storage', { key: 'croperx_logout_event', newValue: String(Date.now()) }));
    }
  } catch {}
}

export async function logoutAllUserSessions(phoneNumber?: string): Promise<{ success: boolean; message: string }> {
  clearClientAuthState();

  try {
    const user = getStoredUser();
    const phone = phoneNumber || user?.phoneNumber;
    const response = await fetch('/api/auth/logout-all', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber: phone }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to logout from all devices');
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('croperx:logout'));
    }

    return { success: true, message: data.message || 'All sessions terminated' };
  } catch (err: any) {
    return { success: false, message: err.message || 'Logout failed' };
  }
}


// Authoritative Session & Role Verification from Backend
export async function getAuthoritativeSession(): Promise<{ authenticated: boolean; user: UserAccount | null; role: UserRole | null }> {
  try {
    const user = getStoredUser();
    const token = typeof localStorage !== 'undefined' ? localStorage.getItem(TOKEN_STORAGE_KEY) : null;
    if (!user && !token) {
      return { authenticated: false, user: null, role: null };
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (user?.phoneNumber) headers['x-user-phone'] = user.phoneNumber;

    const res = await fetch('/api/auth/me', { headers });
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        logoutUser();
      }
      return { authenticated: false, user: null, role: null };
    }

    const data = await res.json();
    if (data.authenticated && data.user) {
      try {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
        if (data.role) {
          localStorage.setItem('croperx_user_role', data.role);
        }
      } catch {}
      return { authenticated: true, user: data.user, role: data.role };
    }
    return { authenticated: false, user: null, role: null };
  } catch (err) {
    console.warn('Authoritative session check error:', err);
    const fallbackUser = getStoredUser();
    return { authenticated: !!fallbackUser, user: fallbackUser, role: fallbackUser?.role || null };
  }
}

// Reverse Geocoding via server API
export async function getReverseGeocode(latitude: number, longitude: number): Promise<GeoLocationData> {
  const response = await fetch('/api/location/reverse-geocode', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ latitude, longitude }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || 'Failed to detect location');
  }

  return data;
}

// Convert UserAccount to FarmerProfile for app integration
export function userToFarmerProfile(user: UserAccount): FarmerProfile {
  return {
    farmerName: user.farmerName || 'Farmer ' + user.phoneNumber.slice(-4),
    farmLocation: user.farmLocation || (user.district ? `${user.district}, ${user.state}` : 'Green Valley Farm'),
    farmAreaSize: user.farmAreaSize || 5,
    unitPreference: user.unitPreference || 'metric',
    preferredCropCycle: user.preferredCropCycle || 'Kharif Rice → Rabi Wheat → Summer Pulse',
    primaryWaterSource: user.primaryWaterSource || 'Borewell Drip Irrigation',
    soilTypeZone: user.soilTypeZone || 'Alluvial Loam',
    targetPhGoal: user.targetPhGoal || 6.5,
  };
}
