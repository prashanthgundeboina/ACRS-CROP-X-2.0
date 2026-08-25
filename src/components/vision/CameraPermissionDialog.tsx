import React from 'react';
import { Camera, ShieldCheck, AlertCircle, HelpCircle, X, Sparkles } from 'lucide-react';

interface CameraPermissionDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  onUseSimulator: () => void;
  isDenied?: boolean;
  errorMessage?: string;
}

export const CameraPermissionDialog: React.FC<CameraPermissionDialogProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  onUseSimulator,
  isDenied,
  errorMessage,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#c8e6c9] relative space-y-5">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3.5">
          <div className="p-3.5 bg-[#e8f5e9] text-[#2e7d32] rounded-2xl">
            <Camera className="w-7 h-7" />
          </div>
          <div>
            <span className="text-[11px] font-mono font-bold text-[#2e7d32] uppercase tracking-wider">
              CroperX Field Vision
            </span>
            <h3 className="text-xl font-bold text-gray-900">
              {isDenied ? 'Camera Access Required' : 'Start Live Field Camera'}
            </h3>
          </div>
        </div>

        {isDenied ? (
          <div className="space-y-4">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-900 text-sm space-y-2">
              <div className="flex items-center gap-2 font-bold text-amber-800">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>Permission Denied or Camera Blocked</span>
              </div>
              <p className="text-xs text-amber-700 leading-relaxed">
                {errorMessage || 'Camera access was blocked by browser permissions.'}
              </p>
            </div>

            <div className="p-3.5 bg-gray-50 border border-gray-200 rounded-2xl space-y-2 text-xs text-gray-600">
              <div className="font-bold text-gray-800 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-[#2e7d32]" />
                <span>How to enable:</span>
              </div>
              <ul className="list-disc list-inside space-y-1 pl-1 text-[11px]">
                <li>Tap the lock/tune icon in your browser address bar</li>
                <li>Toggle <strong>Camera</strong> to <strong>Allow</strong></li>
                <li>Refresh the tab or tap &quot;Try Again&quot; below</li>
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <button
                onClick={onConfirm}
                className="flex-1 py-3 px-4 bg-[#2e7d32] hover:bg-[#1b2e1b] text-white font-bold rounded-2xl text-sm transition-all shadow-md active:scale-98 cursor-pointer flex items-center justify-center gap-2"
              >
                <Camera className="w-4 h-4" />
                Try Again
              </button>
              <button
                onClick={onUseSimulator}
                className="py-3 px-4 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold rounded-2xl text-sm transition-all active:scale-98 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-4 h-4 text-amber-600" />
                Use Simulator
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 leading-relaxed">
              CroperX uses your mobile phone or laptop camera to visually inspect crop leaves, measure vegetative canopy density, and detect early stress symptoms directly in your field.
            </p>

            <div className="space-y-2.5">
              <div className="flex items-start gap-2.5 text-xs text-gray-700 bg-[#f8fcf8] p-3 rounded-2xl border border-[#e8f5e9]">
                <ShieldCheck className="w-4 h-4 text-[#2e7d32] shrink-0 mt-0.5" />
                <span><strong>Explicit Privacy:</strong> CroperX never records silently. Frames are processed only when you tap &quot;Analyze&quot; or enable field walk mode.</span>
              </div>
              <div className="flex items-start gap-2.5 text-xs text-gray-700 bg-[#f8fcf8] p-3 rounded-2xl border border-[#e8f5e9]">
                <Sparkles className="w-4 h-4 text-[#2e7d32] shrink-0 mt-0.5" />
                <span><strong>Crop Health Fusion:</strong> Visual findings are combined with your IoT soil probes and Open-Meteo weather forecasts.</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <button
                onClick={onConfirm}
                className="flex-1 py-3.5 px-4 bg-[#2e7d32] hover:bg-[#1b2e1b] text-white font-bold rounded-2xl text-sm transition-all shadow-md active:scale-98 cursor-pointer flex items-center justify-center gap-2"
              >
                <Camera className="w-4 h-4" />
                Allow & Start Camera
              </button>
              <button
                onClick={onUseSimulator}
                className="py-3.5 px-4 bg-emerald-50 hover:bg-emerald-100 text-[#2e7d32] font-bold rounded-2xl text-sm transition-all border border-[#c8e6c9] active:scale-98 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                Demo Simulator
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
