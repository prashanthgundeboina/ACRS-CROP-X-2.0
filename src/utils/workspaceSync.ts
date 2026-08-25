import { UserRole } from '../types';

export interface WorkspaceTabMeta {
  workspaceId: string;
  role: UserRole;
  sessionId: string;
  openedTimestamp: number;
}

const BROADCAST_CHANNEL_NAME = 'croperx_workspace_sync';
let syncChannel: BroadcastChannel | null = null;

try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    syncChannel = new BroadcastChannel(BROADCAST_CHANNEL_NAME);
  }
} catch {
  // BroadcastChannel not available
}

export function broadcastAuthEvent(event: { type: 'LOGIN' | 'LOGOUT' | 'ROLE_CHANGED' | 'SESSION_EXPIRED'; role?: UserRole }) {
  try {
    if (syncChannel) {
      syncChannel.postMessage(event);
    }
    // Also trigger storage event for browsers without BroadcastChannel
    localStorage.setItem('croperx_auth_event', JSON.stringify({ ...event, timestamp: Date.now() }));
  } catch (e) {
    console.warn('Workspace sync broadcast warning:', e);
  }
}

export function subscribeToAuthEvents(callback: (event: { type: string; role?: UserRole }) => void) {
  if (syncChannel) {
    syncChannel.onmessage = (msg) => {
      if (msg.data) callback(msg.data);
    };
  }

  const handleStorage = (e: StorageEvent) => {
    if (e.key === 'croperx_auth_event' && e.newValue) {
      try {
        const parsed = JSON.parse(e.newValue);
        callback(parsed);
      } catch {}
    }
  };

  window.addEventListener('storage', handleStorage);
  return () => {
    window.removeEventListener('storage', handleStorage);
  };
}

export function getRoleDefaultRoute(role: UserRole | 'home'): string {
  switch (role) {
    case 'home':
      return '/';
    case 'farmer':
      return '/farmer/dashboard';
    case 'farmer_adviser':
      return '/dashboard';
    case 'admin':
      return '/admin/dashboard';
    default:
      return '/';
  }
}

export function getRolePageTitle(role: UserRole | 'home'): string {
  switch (role) {
    case 'home':
      return 'CroperX 2.0 - Agritech Intelligence Gateway';
    case 'farmer':
      return 'CroperX Farmer';
    case 'farmer_adviser':
      return 'CroperX Adviser Workstation';
    case 'admin':
      return 'CroperX Administration';
    default:
      return 'CroperX';
  }
}

export function updateAppTitleAndRoute(view: UserRole | 'home', isPreview: boolean = false, previewRole?: UserRole) {
  if (typeof document === 'undefined') return;

  if (view === 'home') {
    document.title = 'CroperX 2.0 - Agritech Intelligence Gateway';
    try {
      if (window.location.pathname !== '/' && !window.location.hash) {
        window.history.replaceState(null, '', '/');
      }
    } catch {}
    return;
  }

  if (isPreview && previewRole) {
    document.title = `[PREVIEW] ${getRolePageTitle(previewRole)} - CroperX Admin`;
  } else {
    document.title = getRolePageTitle(view);
  }

  const targetPath = isPreview && previewRole ? getRoleDefaultRoute(previewRole) : getRoleDefaultRoute(view);
  
  try {
    if (window.location.pathname !== targetPath && !window.location.hash) {
      window.history.replaceState(null, '', targetPath);
    }
  } catch {}
}

export function openRoleWorkspaceTab(role: UserRole): boolean {
  const route = getRoleDefaultRoute(role);
  try {
    const newWindow = window.open(route, '_blank');
    if (newWindow && !newWindow.closed) {
      return true; // Successfully opened in new tab
    }
  } catch (err) {
    console.warn('Popup blocked or not permitted:', err);
  }
  return false; // Fallback to current tab
}
