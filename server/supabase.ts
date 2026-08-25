import { createClient, SupabaseClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Supabase Client Lazy Initializer
let supabaseClientInstance: SupabaseClient | null = null;
let supabaseChecked = false;
let isSupabaseConfigured = false;

export function getSupabase(): { client: SupabaseClient | null; isConfigured: boolean } {
  if (supabaseChecked && supabaseClientInstance) {
    return { client: supabaseClientInstance, isConfigured: isSupabaseConfigured };
  }

  const supabaseUrl = process.env.SUPABASE_URL?.trim();
  const supabaseKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY)?.trim();

  if (supabaseUrl && supabaseKey && supabaseUrl.startsWith('https://') && !supabaseUrl.includes('YOUR_')) {
    try {
      supabaseClientInstance = createClient(supabaseUrl, supabaseKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      });
      isSupabaseConfigured = true;
      supabaseChecked = true;
      console.log(`[Supabase PostgreSQL] Connected to Supabase Instance at ${supabaseUrl}`);
      return { client: supabaseClientInstance, isConfigured: true };
    } catch (err) {
      console.warn('[Supabase PostgreSQL] Initialization warning:', err);
      isSupabaseConfigured = false;
      supabaseChecked = true;
      return { client: null, isConfigured: false };
    }
  }

  isSupabaseConfigured = false;
  supabaseChecked = true;
  return { client: null, isConfigured: false };
}

export interface SupabaseUserRecord {
  id: string;
  mobile: string;
  email?: string | null;
  password_hash?: string | null;
  password_salt?: string | null;
  role: 'farmer' | 'farmer_adviser' | 'customer' | 'admin';
  status: 'active' | 'suspended' | 'deleted' | 'pending';
  phone_verified: boolean;
  full_name: string;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
  last_login_at?: string | null;
  profile?: any;
}

/**
 * Ensures required Supabase tables exist or syncs data.
 */
export async function testSupabaseConnection(): Promise<{ ok: boolean; message: string; latencyMs: number }> {
  const { client, isConfigured } = getSupabase();
  if (!isConfigured || !client) {
    return { ok: false, message: 'Supabase credentials (SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY) are not configured. Running in Local High-Performance File Persistence Mode.', latencyMs: 0 };
  }

  const start = Date.now();
  try {
    const { data, error } = await client.from('users').select('count', { count: 'exact', head: true });
    const latency = Date.now() - start;
    if (error) {
      return { ok: true, message: `Connected to Supabase endpoint (${latency}ms) - Note: ${error.message}`, latencyMs: latency };
    }
    return { ok: true, message: `Supabase PostgreSQL active and healthy (${latency}ms)`, latencyMs: latency };
  } catch (err: any) {
    return { ok: false, message: err?.message || 'Failed to ping Supabase database.', latencyMs: Date.now() - start };
  }
}

/**
 * Authoritative Supabase User Queries
 */
export async function supabaseFindUserByMobile(mobile: string): Promise<any | null> {
  const { client, isConfigured } = getSupabase();
  if (!isConfigured || !client) return null;

  try {
    const { data: user, error } = await client
      .from('users')
      .select('*')
      .eq('mobile', mobile)
      .single();

    if (error || !user) return null;

    // Fetch related profile
    let profileData: any = {};
    if (user.role === 'farmer') {
      const { data: fProfile } = await client.from('farmer_profiles').select('*').eq('user_id', user.id).single();
      if (fProfile) profileData = fProfile;
    } else if (user.role === 'farmer_adviser') {
      const { data: aProfile } = await client.from('adviser_profiles').select('*').eq('user_id', user.id).single();
      const { data: aLoc } = await client.from('adviser_locations').select('*').eq('adviser_id', user.id).single();
      if (aProfile) profileData = { ...aProfile, consultationLocation: aLoc || null };
    } else if (user.role === 'customer') {
      const { data: cProfile } = await client.from('customer_profiles').select('*').eq('user_id', user.id).single();
      if (cProfile) profileData = cProfile;
    }

    return {
      id: user.id,
      phoneNumber: user.mobile,
      fullName: user.full_name,
      farmerName: user.full_name,
      email: user.email,
      role: user.role,
      accountStatus: user.status,
      isVerified: user.phone_verified,
      passwordHash: user.password_hash,
      passwordSalt: user.password_salt,
      profileImage: user.avatar_url,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      lastLoginAt: user.last_login_at,
      ...profileData
    };
  } catch (err) {
    console.warn('[Supabase] findUserByMobile error:', err);
    return null;
  }
}

export async function supabaseFindUserByEmail(email: string): Promise<any | null> {
  const { client, isConfigured } = getSupabase();
  if (!isConfigured || !client || !email) return null;

  try {
    const { data: user, error } = await client
      .from('users')
      .select('*')
      .eq('email', email.trim().toLowerCase())
      .single();

    if (error || !user) return null;

    let profileData: any = {};
    if (user.role === 'farmer') {
      const { data: fProfile } = await client.from('farmer_profiles').select('*').eq('user_id', user.id).single();
      if (fProfile) profileData = fProfile;
    } else if (user.role === 'farmer_adviser') {
      const { data: aProfile } = await client.from('adviser_profiles').select('*').eq('user_id', user.id).single();
      if (aProfile) profileData = aProfile;
    } else if (user.role === 'customer') {
      const { data: cProfile } = await client.from('customer_profiles').select('*').eq('user_id', user.id).single();
      if (cProfile) profileData = cProfile;
    }

    return {
      id: user.id,
      phoneNumber: user.mobile || '',
      fullName: user.full_name,
      farmerName: user.full_name,
      email: user.email,
      auth_provider: user.auth_provider || 'password',
      role: user.role,
      accountStatus: user.status,
      isVerified: user.phone_verified,
      passwordHash: user.password_hash,
      passwordSalt: user.password_salt,
      profileImage: user.avatar_url,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      lastLoginAt: user.last_login_at,
      ...profileData
    };
  } catch (err) {
    console.warn('[Supabase] findUserByEmail error:', err);
    return null;
  }
}

export async function supabaseFindUserById(id: string): Promise<any | null> {
  const { client, isConfigured } = getSupabase();
  if (!isConfigured || !client) return null;

  try {
    const { data: user, error } = await client
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !user) return null;

    let profileData: any = {};
    if (user.role === 'farmer') {
      const { data: fProfile } = await client.from('farmer_profiles').select('*').eq('user_id', user.id).single();
      if (fProfile) profileData = fProfile;
    } else if (user.role === 'farmer_adviser') {
      const { data: aProfile } = await client.from('adviser_profiles').select('*').eq('user_id', user.id).single();
      if (aProfile) profileData = aProfile;
    } else if (user.role === 'customer') {
      const { data: cProfile } = await client.from('customer_profiles').select('*').eq('user_id', user.id).single();
      if (cProfile) profileData = cProfile;
    }

    return {
      id: user.id,
      phoneNumber: user.mobile || '',
      fullName: user.full_name,
      farmerName: user.full_name,
      email: user.email,
      role: user.role,
      accountStatus: user.status,
      isVerified: user.phone_verified,
      passwordHash: user.password_hash,
      passwordSalt: user.password_salt,
      profileImage: user.avatar_url,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      lastLoginAt: user.last_login_at,
      ...profileData
    };
  } catch (err) {
    console.warn('[Supabase] findUserById error:', err);
    return null;
  }
}

export async function supabaseCreateUser(userData: any): Promise<any> {
  const { client, isConfigured } = getSupabase();
  if (!isConfigured || !client) return null;

  try {
    const { data: newUser, error } = await client.from('users').insert({
      mobile: userData.phoneNumber || '',
      full_name: userData.fullName || userData.farmerName || 'User',
      email: userData.email || null,
      password_hash: userData.passwordHash || null,
      password_salt: userData.passwordSalt || null,
      role: userData.role || 'farmer',
      status: userData.accountStatus || 'active',
      phone_verified: userData.isVerified ?? true,
      avatar_url: userData.profileImage || null,
      created_at: userData.createdAt || new Date().toISOString(),
      updated_at: userData.updatedAt || new Date().toISOString()
    }).select().single();

    if (error || !newUser) {
      throw new Error(error?.message || 'Failed to insert user into Supabase');
    }

    // Insert corresponding role profile
    if (newUser.role === 'farmer') {
      await client.from('farmer_profiles').insert({
        user_id: newUser.id,
        farm_name: userData.farmLocation || 'Green Valley Farm',
        farm_location: userData.farmLocation || (userData.district ? `${userData.district}, ${userData.state}` : 'Ludhiana, Punjab'),
        farm_size: userData.farmAreaSize || 5,
        farm_unit: userData.unitPreference || 'metric',
        primary_crop: userData.primaryCrop || 'Rice',
        preferred_crop_cycle: userData.preferredCropCycle || 'Kharif Rice → Rabi Wheat → Summer Pulse',
        water_source: userData.primaryWaterSource || 'Borewell Drip Irrigation',
        soil_type: userData.soilTypeZone || 'Alluvial Loam',
        target_ph: userData.targetPhGoal || 6.5,
        latitude: userData.latitude || null,
        longitude: userData.longitude || null,
        district: userData.district || '',
        state: userData.state || ''
      });
    } else if (newUser.role === 'farmer_adviser') {
      await client.from('adviser_profiles').insert({
        user_id: newUser.id,
        specialization: userData.specialization || 'Plant Pathology & Crop Health',
        organization: userData.organization || 'Agricultural Extension Network',
        license_number: userData.licenseNumber || `ADV-${Math.floor(1000 + Math.random() * 9000)}`,
        consultation_hours: userData.consultationHours || '08:00 AM - 06:00 PM IST',
        bio: userData.bio || '',
        rating: 4.9,
        assigned_farmers_count: 0,
        active_calls_today: 0
      });
    } else if (newUser.role === 'customer') {
      await client.from('customer_profiles').insert({
        user_id: newUser.id,
        customer_type: userData.customerType || 'Commercial Farm Buyer',
        organization: userData.organization || 'Agro Commodities Trade',
        customer_notes: userData.customerNotes || ''
      });
    }

    return { ...userData, id: newUser.id };
  } catch (err: any) {
    console.error('[Supabase] Create user error:', err);
    throw err;
  }
}

export async function supabaseUpdateUser(idOrMobile: string, updates: any): Promise<any> {
  const { client, isConfigured } = getSupabase();
  if (!isConfigured || !client) return null;

  try {
    const isMobile = !idOrMobile.includes('-') && !idOrMobile.startsWith('usr_');
    const updatePayload: any = {
      updated_at: new Date().toISOString()
    };

    if (updates.fullName || updates.farmerName) updatePayload.full_name = updates.fullName || updates.farmerName;
    if (updates.accountStatus) updatePayload.status = updates.accountStatus;
    if (updates.role) updatePayload.role = updates.role;
    if (updates.profileImage !== undefined) updatePayload.avatar_url = updates.profileImage;
    if (updates.passwordHash !== undefined) updatePayload.password_hash = updates.passwordHash;
    if (updates.passwordSalt !== undefined) updatePayload.password_salt = updates.passwordSalt;
    if (updates.lastLoginAt !== undefined) updatePayload.last_login_at = updates.lastLoginAt;
    if (updates.email !== undefined) updatePayload.email = updates.email;

    const userQuery = client.from('users').update(updatePayload);

    const { data: updated, error } = isMobile
      ? await userQuery.eq('mobile', idOrMobile).select().single()
      : await userQuery.eq('id', idOrMobile).select().single();

    if (error) throw new Error(error.message);
    return updated;
  } catch (err: any) {
    console.error('[Supabase] Update user error:', err);
    throw err;
  }
}

export async function supabaseRecordAuditLog(log: {
  actor_id?: string;
  actor_role?: string;
  action: string;
  target_id?: string;
  result?: string;
  ip_address?: string;
}): Promise<void> {
  const { client, isConfigured } = getSupabase();
  if (!isConfigured || !client) return;

  try {
    await client.from('audit_logs').insert({
      actor_id: log.actor_id || 'system',
      actor_role: log.actor_role || 'system',
      action: log.action,
      target_id: log.target_id || null,
      result: log.result || 'Success',
      ip_address: log.ip_address || '127.0.0.1',
      created_at: new Date().toISOString()
    });
  } catch (err) {
    console.warn('[Supabase] Record audit log notice:', err);
  }
}

/**
 * Idempotent Administrator Bootstrapper for Supabase PostgreSQL
 */
export async function supabaseBootstrapAdmin(hashFn: (pwd: string) => { hash: string; salt: string }): Promise<void> {
  const { client, isConfigured } = getSupabase();
  if (!isConfigured || !client) return;

  const adminMobile = process.env.ADMIN_BOOTSTRAP_MOBILE || process.env.CROPERX_DEMO_ADMIN_MOBILE || '00110099';
  const adminPass = process.env.ADMIN_BOOTSTRAP_PASSWORD || process.env.CROPERX_DEMO_ADMIN_PASSWORD || 'Admin@2821';

  try {
    const { data: existingAdmin } = await client
      .from('users')
      .select('*')
      .eq('mobile', adminMobile)
      .single();

    if (!existingAdmin) {
      const { hash, salt } = hashFn(adminPass);
      await client.from('users').insert({
        mobile: adminMobile,
        full_name: 'CroperX Administrator',
        role: 'admin',
        status: 'active',
        phone_verified: true,
        password_hash: hash,
        password_salt: salt,
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
      console.log(`[Supabase PostgreSQL] Permanent Administrator (${adminMobile}) bootstrapped successfully.`);
    } else {
      // Ensure admin has role 'admin' and status 'active'
      if (existingAdmin.role !== 'admin' || existingAdmin.status !== 'active') {
        await client.from('users').update({
          role: 'admin',
          status: 'active',
          updated_at: new Date().toISOString()
        }).eq('id', existingAdmin.id);
      }
    }
  } catch (err) {
    console.warn('[Supabase PostgreSQL] Admin bootstrap notice:', err);
  }
}

