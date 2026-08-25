import React from 'react';
import { ShieldCheck, ArrowLeft, Eye, Lock } from 'lucide-react';
import { UserRole } from '../../types';

interface AdminPreviewBannerProps {
  previewRole: UserRole;
  onExitPreview: () => void;
}

export const AdminPreviewBanner: React.FC<AdminPreviewBannerProps> = ({
  previewRole,
  onExitPreview
}) => {
  const isFarmer = previewRole === 'farmer';

  return (
    <div className="sticky top-0 z-50 bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 text-white px-4 py-2.5 shadow-md flex items-center justify-between gap-3 text-xs sm:text-sm font-semibold">
      <div className="flex items-center gap-2.5">
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/20 text-white font-mono uppercase tracking-wider text-[11px] font-bold">
          <Eye className="w-3.5 h-3.5" />
          <span>{isFarmer ? 'ADMIN PREVIEW — FARMER VIEW' : 'ADMIN PREVIEW — ADVISER VIEW'}</span>
        </div>
        <span className="hidden md:inline text-amber-100 text-xs font-normal">
          Preview mode active (Read-only sandbox scope. No simulated permissions altered.)
        </span>
      </div>

      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center gap-1 text-amber-200 text-xs font-medium bg-black/20 px-2 py-1 rounded-lg">
          <Lock className="w-3 h-3 text-amber-300" />
          <span>Admin Authenticated</span>
        </div>

        <button
          onClick={onExitPreview}
          className="flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-amber-50 text-amber-900 rounded-xl font-bold shadow-sm transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Admin</span>
        </button>
      </div>
    </div>
  );
};
