import React, { useEffect } from 'react';
import { UserAccount, UserRole } from '../../types';
import { ShieldAlert, AlertTriangle } from 'lucide-react';

interface RoleProtectedRouteProps {
  currentUser: UserAccount | null;
  userRole: UserRole;
  targetView: UserRole | 'home';
  adminPreviewRole?: UserRole | null;
  onUnauthorized: (fallbackView: UserRole | 'home', reason: string) => void;
  children: React.ReactNode;
}

export const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({
  currentUser,
  userRole,
  targetView,
  adminPreviewRole = null,
  onUnauthorized,
  children
}) => {
  useEffect(() => {
    // If on home view, always permitted
    if (targetView === 'home') {
      return;
    }

    // Unauthenticated user attempting to access protected dashboards
    if (!currentUser) {
      onUnauthorized('home', 'Please log in to access this workspace.');
      return;
    }

    // Role-specific workspace isolation enforcement
    if (userRole === 'farmer_adviser') {
      if (targetView !== 'farmer_adviser') {
        onUnauthorized('farmer_adviser', "Access Restricted: You don't have permission to access this workspace.");
        return;
      }
    } else if (userRole === 'farmer') {
      if (targetView !== 'farmer') {
        onUnauthorized('farmer', "Access Restricted: You don't have permission to access this workspace.");
        return;
      }
    } else if (userRole === 'admin') {
      // Administrators have access to admin view, and preview mode for farmer & adviser
      if (targetView !== 'admin' && adminPreviewRole === null) {
        // Direct non-preview view switch without preview state
        // Admin is authorized to access any workspace
      }
    }
  }, [currentUser, userRole, targetView, adminPreviewRole, onUnauthorized]);

  // If unauthorized for adviser
  if (userRole === 'farmer_adviser' && (targetView === 'admin' || targetView === 'farmer')) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-800 border border-rose-500/30 rounded-2xl p-6 text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Access Forbidden</h3>
          <p className="text-sm text-slate-300">
            You do not have permission to access this workspace. Farm Advisers are restricted to the Adviser Workstation.
          </p>
          <button
            onClick={() => onUnauthorized('farmer_adviser', 'Redirecting to your authorized workspace.')}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-md cursor-pointer"
          >
            Return to Adviser Workstation
          </button>
        </div>
      </div>
    );
  }

  // If unauthorized for farmer
  if (userRole === 'farmer' && (targetView === 'admin' || targetView === 'farmer_adviser')) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-800 border border-rose-500/30 rounded-2xl p-6 text-center space-y-4 shadow-2xl">
          <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Access Forbidden</h3>
          <p className="text-sm text-slate-300">
            You do not have permission to access this workspace. Farmers are restricted to the Farmer Dashboard.
          </p>
          <button
            onClick={() => onUnauthorized('farmer', 'Redirecting to your authorized workspace.')}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-md cursor-pointer"
          >
            Return to Farmer Dashboard
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
