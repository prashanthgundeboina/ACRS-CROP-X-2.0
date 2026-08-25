import {
  AdminFarmerRecord,
  AdminAdviserRecord,
  AdminFarmRecord,
  AdminCaseRecord,
  AdminDeviceRecord,
  AdminAuditLog,
  AdminSystemHealth,
  UserRole
} from '../types';
import { getStoredUser } from './authService';

function getAdminHeaders(): Record<string, string> {
  const user = getStoredUser();
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('croperx_auth_token') : null;
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : (user?.phoneNumber ? `Bearer ${user.phoneNumber}` : ''),
    'x-user-phone': user?.phoneNumber || '',
    'x-user-role': user?.role || '',
  };
}

export interface AdminUserQuery {
  role?: string;
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
  sortBy?: 'newest' | 'oldest' | 'name';
}

export interface AdminUsersResponse {
  users: any[];
  totalCount: number;
  page: number;
  totalPages: number;
}

export interface AdminMetrics {
  total_farmers: number;
  total_advisers: number;
  active_advisers: number;
  pending_accounts: number;
  total_users: number;
  timestamp: string;
}

export async function fetchAdminFarmers(): Promise<AdminFarmerRecord[]> {
  try {
    const res = await fetch('/api/admin/farmers', { headers: getAdminHeaders() });
    if (!res.ok) {
      if (res.status === 403) throw new Error('Administrator access required.');
      throw new Error('Failed to fetch farmers from backend');
    }
    const data = await res.json();
    return data.farmers || [];
  } catch (err: any) {
    console.warn('Could not load authoritative farmers:', err);
    if (err.message === 'Administrator access required.') throw err;
    return [];
  }
}

export async function fetchAdminAdvisers(): Promise<AdminAdviserRecord[]> {
  try {
    const res = await fetch('/api/admin/advisers', { headers: getAdminHeaders() });
    if (!res.ok) {
      if (res.status === 403) throw new Error('Administrator access required.');
      throw new Error('Failed to fetch advisers from backend');
    }
    const data = await res.json();
    return data.advisers || [];
  } catch (err: any) {
    console.warn('Could not load authoritative advisers:', err);
    if (err.message === 'Administrator access required.') throw err;
    return [];
  }
}

export async function fetchAdminUsers(params: AdminUserQuery = {}): Promise<AdminUsersResponse> {
  try {
    const query = new URLSearchParams();
    if (params.role) query.set('role', params.role);
    if (params.search) query.set('search', params.search);
    if (params.status) query.set('status', params.status);
    if (params.page) query.set('page', String(params.page));
    if (params.limit) query.set('limit', String(params.limit));
    if (params.sortBy) query.set('sortBy', params.sortBy);

    const res = await fetch(`/api/admin/users?${query.toString()}`, { headers: getAdminHeaders() });
    if (!res.ok) {
      if (res.status === 403) throw new Error('Administrator access required.');
      throw new Error('Failed to fetch unified user list');
    }
    const data = await res.json();
    return {
      users: data.users || [],
      totalCount: data.totalCount || 0,
      page: data.page || 1,
      totalPages: data.totalPages || 1
    };
  } catch (err: any) {
    console.warn('Failed to fetch unified users:', err);
    if (err.message === 'Administrator access required.') throw err;
    return { users: [], totalCount: 0, page: 1, totalPages: 1 };
  }
}

export async function fetchAdminUserDetails(userId: string): Promise<any> {
  const res = await fetch(`/api/admin/users/${userId}`, { headers: getAdminHeaders() });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to fetch user details');
  }
  const data = await res.json();
  return data.user;
}

export async function fetchAdminMetrics(): Promise<AdminMetrics> {
  try {
    const res = await fetch('/api/admin/metrics', { headers: getAdminHeaders() });
    if (!res.ok) {
      if (res.status === 403) throw new Error('Administrator access required.');
      throw new Error('Failed to fetch platform metrics');
    }
    return await res.json();
  } catch (err: any) {
    console.warn('Failed to fetch metrics:', err);
    if (err.message === 'Administrator access required.') throw err;
    return {
      total_farmers: 0,
      total_advisers: 0,
      active_advisers: 0,
      pending_accounts: 0,
      total_users: 0,
      timestamp: new Date().toISOString()
    };
  }
}

export async function updateUserRole(userId: string, role: UserRole): Promise<any> {
  const res = await fetch(`/api/admin/users/${userId}/role`, {
    method: 'PATCH',
    headers: getAdminHeaders(),
    body: JSON.stringify({ role })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to update user role');
  }
  return data;
}

export async function updateUserAccountStatus(userId: string, status: 'active' | 'suspended' | 'pending' | 'deactivated'): Promise<any> {
  const res = await fetch(`/api/admin/users/${userId}/status`, {
    method: 'PATCH',
    headers: getAdminHeaders(),
    body: JSON.stringify({ status })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to update account status');
  }
  return data;
}

export async function updateAdviserProfile(userId: string, profile: {
  specialization?: string;
  organization?: string;
  licenseNumber?: string;
  consultationHours?: string;
  bio?: string;
}): Promise<any> {
  const res = await fetch(`/api/admin/advisers/${userId}`, {
    method: 'PATCH',
    headers: getAdminHeaders(),
    body: JSON.stringify(profile)
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to update adviser profile');
  }
  return data;
}

export async function fetchAdminFarms(): Promise<AdminFarmRecord[]> {
  try {
    const res = await fetch('/api/admin/farms', { headers: getAdminHeaders() });
    if (!res.ok) {
      if (res.status === 403) throw new Error('Administrator access required.');
      throw new Error('Failed to fetch farms');
    }
    const data = await res.json();
    return data.farms || [];
  } catch (err: any) {
    if (err.message === 'Administrator access required.') throw err;
    return [
      { id: "farm-1", name: "Green Valley Model Farm", ownerName: "Ramesh Kumar", location: "Ludhiana, Punjab", acreage: 12.5, cropCycle: "Rice → Wheat → Pulse", zonesCount: 4, irrigationType: "Solar Drip Irrigation", soilType: "Alluvial Loam" },
      { id: "farm-2", name: "Golden Wheat Plains", ownerName: "Harpreet Singh", location: "Amritsar, Punjab", acreage: 28.0, cropCycle: "Basmati Rice → Wheat", zonesCount: 6, irrigationType: "Canal & Borewell", soilType: "Clay Loam" },
      { id: "farm-3", name: "Saraswati Agro Zone", ownerName: "Kavita Devi", location: "Karnal, Haryana", acreage: 18.0, cropCycle: "Sugarcane → Mustard", zonesCount: 4, irrigationType: "Smart Pivot Grid", soilType: "Sandy Loam" },
      { id: "farm-4", name: "Surya Precision Orchard", ownerName: "Vijay Deshmukh", location: "Nashik, Maharashtra", acreage: 35.0, cropCycle: "Grapes → Pomegranate", zonesCount: 8, irrigationType: "Micro-Drip Fertigation", soilType: "Black Cotton Soil" },
    ];
  }
}

export async function fetchAdminCases(): Promise<AdminCaseRecord[]> {
  try {
    const res = await fetch('/api/admin/cases', { headers: getAdminHeaders() });
    if (!res.ok) {
      if (res.status === 403) throw new Error('Administrator access required.');
      throw new Error('Failed to fetch cases');
    }
    const data = await res.json();
    return data.cases || [];
  } catch (err: any) {
    if (err.message === 'Administrator access required.') throw err;
    return [
      { id: "case-101", farmerName: "Ramesh Kumar", crop: "Wheat", diagnosis: "Early Leaf Spot / Cercospora Blight", severity: "Medium", status: "In Progress", adviserAssigned: "Dr. Anand Sharma", createdAt: "Today, 10:14 AM" },
      { id: "case-102", farmerName: "Harpreet Singh", crop: "Rice", diagnosis: "Nitrogen Deficiency (Chlorosis in lower leaves)", severity: "Low", status: "Resolved", adviserAssigned: "Dr. Sunita Rao", createdAt: "Yesterday, 4:30 PM" },
      { id: "case-103", farmerName: "Vijay Deshmukh", crop: "Grapes", diagnosis: "Downy Mildew spore germination risk", severity: "High", status: "Open", adviserAssigned: "Prof. Arvind Patel", createdAt: "Today, 08:45 AM" },
      { id: "case-104", farmerName: "Kavita Devi", crop: "Mustard", diagnosis: "Aphid vector infestation near border rows", severity: "Critical", status: "In Progress", adviserAssigned: "Dr. Meenakshi Sundaram", createdAt: "Today, 11:20 AM" },
    ];
  }
}

export async function fetchAdminLiveSessions(): Promise<any[]> {
  try {
    const res = await fetch('/api/admin/live-sessions', { headers: getAdminHeaders() });
    if (!res.ok) {
      if (res.status === 403) throw new Error('Administrator access required.');
      throw new Error('Failed to fetch live sessions');
    }
    const data = await res.json();
    return data.liveSessions || [];
  } catch (err: any) {
    if (err.message === 'Administrator access required.') throw err;
    return [
      {
        callId: "call-demo-active",
        farmerName: "Ramesh Kumar",
        farmName: "Green Valley Farm",
        crop: "Wheat (Canopy Scan)",
        status: "ACTIVE",
        createdAt: Date.now() - 1000 * 180,
        connectedAt: Date.now() - 1000 * 180,
        durationSec: 180,
        adviserName: "Dr. Anand Sharma",
        privacyCompliant: true
      }
    ];
  }
}

export async function fetchAdminDevices(): Promise<AdminDeviceRecord[]> {
  try {
    const res = await fetch('/api/admin/devices', { headers: getAdminHeaders() });
    if (!res.ok) {
      if (res.status === 403) throw new Error('Administrator access required.');
      throw new Error('Failed to fetch devices');
    }
    const data = await res.json();
    return data.devices || [];
  } catch (err: any) {
    if (err.message === 'Administrator access required.') throw err;
    return [
      { id: "dev-probe-01", name: "Soil NPK & Moisture Probe A1", type: "Soil Probe", farm: "Green Valley Farm (Zone 1)", battery: 94, signalQuality: "Strong (-62 dBm)", status: "Online", lastPing: "2 mins ago" },
      { id: "dev-gate-02", name: "LoRaWAN 868MHz Edge Gateway", type: "IoT Gateway", farm: "Green Valley Farm (HQ)", battery: 100, signalQuality: "Fiber / 4G Fallback", status: "Online", lastPing: "Just now" },
      { id: "dev-valve-03", name: "Zone 2 Drip Solenoid Actuator", type: "Smart Valve", farm: "Green Valley Farm (Zone 2)", battery: 88, signalQuality: "Mesh Linked", status: "Online", lastPing: "5 mins ago" },
      { id: "dev-met-04", name: "Micro-Climate Solar Weather Stn", type: "Weather Station", farm: "Punjab Regional Array", battery: 99, signalQuality: "Cellular IoT", status: "Online", lastPing: "1 min ago" },
      { id: "dev-drone-05", name: "Autonomous Crop Scout Dock 1", type: "Drone Dock", farm: "Amritsar Research Quad", battery: 78, signalQuality: "5G Telemetry", status: "Online", lastPing: "12 mins ago" },
    ];
  }
}

export async function fetchAdminSystemHealth(): Promise<AdminSystemHealth> {
  try {
    const res = await fetch('/api/admin/system-health', { headers: getAdminHeaders() });
    if (!res.ok) {
      if (res.status === 403) throw new Error('Administrator access required.');
      throw new Error('Failed to fetch system health');
    }
    const data = await res.json();
    return data.systemHealth;
  } catch (err: any) {
    if (err.message === 'Administrator access required.') throw err;
    return {
      uptimePercent: 99.98,
      apiLatencyMs: 24,
      activeWebRTCTunnels: 1,
      aiModelLatencyMs: 280,
      iotGatewayConnections: 42,
      serverStatus: 'Operational'
    };
  }
}

export async function fetchAdminAuditLogs(): Promise<AdminAuditLog[]> {
  try {
    const res = await fetch('/api/admin/audit-logs', { headers: getAdminHeaders() });
    if (!res.ok) {
      if (res.status === 403) throw new Error('Administrator access required.');
      throw new Error('Failed to fetch audit logs');
    }
    const data = await res.json();
    return data.auditLogs || [];
  } catch (err: any) {
    if (err.message === 'Administrator access required.') throw err;
    return [
      { id: "log-1", timestamp: new Date(Date.now() - 1000 * 60 * 3).toISOString(), user: "Admin (Chief Operations)", role: "admin", action: "System Health Verification", target: "Global Telemetry Ingress", ipAddress: "192.168.1.10", status: "Success" },
      { id: "log-2", timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(), user: "Dr. Anand Sharma", role: "farmer_adviser", action: "Completed Video Advisory Session", target: "Call #call-98214 (Ramesh Kumar)", ipAddress: "10.0.4.52", status: "Success" },
      { id: "log-3", timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(), user: "Ramesh Kumar", role: "farmer", action: "Camera Crop Scan & Diagnostic", target: "North Field Zone A", ipAddress: "172.16.8.9", status: "Success" },
    ];
  }
}

export async function createAdminUser(userData: {
  role: UserRole;
  fullName: string;
  phoneNumber: string;
  password?: string;
  farmLocation?: string;
  farmAreaSize?: number;
  assignedCrop?: string;
  specialization?: string;
  organization?: string;
  licenseNumber?: string;
  consultationHours?: string;
  customerType?: string;
  customerNotes?: string;
  consultationLocation?: any;
}): Promise<any> {
  const res = await fetch('/api/admin/users', {
    method: 'POST',
    headers: getAdminHeaders(),
    body: JSON.stringify(userData),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to create user account');
  }
  return data;
}

export async function updateAdminUserDetails(userId: string, updateData: any): Promise<any> {
  const res = await fetch(`/api/admin/users/${userId}`, {
    method: 'PATCH',
    headers: getAdminHeaders(),
    body: JSON.stringify(updateData),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to update user record');
  }
  return data;
}

export async function deleteAdminUser(userId: string, options: {
  adminPassword?: string;
  reason?: string;
  adminName?: string;
}): Promise<any> {
  const res = await fetch(`/api/admin/users/${userId}/delete`, {
    method: 'POST',
    headers: getAdminHeaders(),
    body: JSON.stringify(options),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to delete user account');
  }
  return data;
}

export async function suspendAdminUser(userId: string, reason?: string): Promise<any> {
  const res = await fetch(`/api/admin/users/${userId}/suspend`, {
    method: 'POST',
    headers: getAdminHeaders(),
    body: JSON.stringify({ reason }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to suspend user account');
  }
  return data;
}

export async function reactivateAdminUser(userId: string): Promise<any> {
  const res = await fetch(`/api/admin/users/${userId}/reactivate`, {
    method: 'POST',
    headers: getAdminHeaders(),
    body: JSON.stringify({}),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to reactivate user account');
  }
  return data;
}

export async function fetchAdminLocationsOverview(): Promise<any[]> {
  try {
    const res = await fetch('/api/admin/locations', { headers: getAdminHeaders() });
    if (!res.ok) {
      if (res.status === 403) throw new Error('Administrator access required.');
      throw new Error('Failed to fetch admin locations');
    }
    const data = await res.json();
    return data.locations || [];
  } catch (err: any) {
    console.warn('Failed to load locations:', err);
    if (err.message === 'Administrator access required.') throw err;
    return [];
  }
}

export async function verifyAdviserConsultationLocation(phoneNumber: string, isVerified: boolean, verifiedBy?: string): Promise<any> {
  const res = await fetch('/api/admin/adviser/verify-location', {
    method: 'POST',
    headers: getAdminHeaders(),
    body: JSON.stringify({ phoneNumber, isVerified, verifiedBy }),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to verify location');
  }
  return data;
}

