/**
 * CroperX Database Service Layer (Supabase & REST Authoritative Sync)
 */

export interface DatabaseHealthStatus {
  ok: boolean;
  message: string;
  latencyMs: number;
  provider?: 'supabase' | 'local_persistent';
}

export async function checkDatabaseHealth(): Promise<DatabaseHealthStatus> {
  try {
    const res = await fetch('/api/health/database');
    if (!res.ok) {
      return { ok: false, message: `Database ping returned HTTP ${res.status}`, latencyMs: 0 };
    }
    const data = await res.json();
    return data;
  } catch (err: any) {
    return { ok: false, message: err?.message || 'Database health check failed', latencyMs: 0 };
  }
}

export async function getSystemHealth(): Promise<any> {
  try {
    const res = await fetch('/api/health');
    return await res.json();
  } catch {
    return { status: 'offline', version: '2.0.0' };
  }
}
