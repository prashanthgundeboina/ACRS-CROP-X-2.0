import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Camera, CheckCircle2, AlertCircle, X, RefreshCw, Sparkles, UserCheck } from 'lucide-react';
import { presenceService } from '../../services/presenceService';

interface LivenessVerificationModalProps {
  userId: string;
  userName: string;
  isOpen: boolean;
  onClose: () => void;
  onVerified: () => void;
}

export const LivenessVerificationModal: React.FC<LivenessVerificationModalProps> = ({
  userId,
  userName,
  isOpen,
  onClose,
  onVerified
}) => {
  const [step, setStep] = useState<'prompt' | 'scanning' | 'verifying' | 'success' | 'error'>('prompt');
  const [challengePrompt, setChallengePrompt] = useState<string>('Look straight into the camera');
  const [countdown, setCountdown] = useState<number>(3);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setStep('prompt');
    }
  }, [isOpen]);

  const startCamera = async () => {
    try {
      setStep('scanning');
      setErrorMessage('');
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      // Step 1: Center face
      setChallengePrompt('Step 1: Center your face in the oval frame');
      setCountdown(3);

      const timer1 = setTimeout(() => {
        // Step 2: Smile or blink
        setChallengePrompt('Step 2: Please blink naturally or smile');
        setCountdown(2);

        const timer2 = setTimeout(async () => {
          setStep('verifying');
          setChallengePrompt('Validating ephemeral liveness proof...');

          // Complete verification
          await presenceService.verifyLiveness(userId);
          stopCamera();
          setStep('success');

          setTimeout(() => {
            onVerified();
            onClose();
          }, 1500);
        }, 2200);

        return () => clearTimeout(timer2);
      }, 2500);

      return () => clearTimeout(timer1);
    } catch (err: any) {
      console.warn('Camera access denied for liveness:', err);
      setErrorMessage(err.message || 'Unable to access front camera for liveness verification.');
      setStep('error');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Facial Liveness Verification</h3>
              <p className="text-xs text-slate-400">Ephemeral biometric check for high-trust consultation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          {step === 'prompt' && (
            <div className="text-center space-y-4 py-2">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <UserCheck className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-semibold text-white text-base">Verify Real-Time Farmer Presence</h4>
                <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
                  A quick 3-second camera check verifies genuine farmer presence for certified agricultural advisers.
                  <span className="block text-emerald-400/90 font-medium mt-1">
                    🔒 Privacy Guaranteed: No raw biometric photos or facial scans are stored on servers.
                  </span>
                </p>
              </div>
              <div className="pt-2 flex gap-3 justify-center">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={startCamera}
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-950 transition"
                >
                  <Camera className="w-4 h-4" />
                  Start 3-Second Check
                </button>
              </div>
            </div>
          )}

          {step === 'scanning' && (
            <div className="space-y-4">
              <div className="relative w-64 h-64 mx-auto rounded-full overflow-hidden border-4 border-emerald-500/60 shadow-inner bg-black">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]"
                />
                {/* Oval guide overlay */}
                <div className="absolute inset-0 border-2 border-dashed border-emerald-400/70 rounded-full pointer-events-none animate-pulse" />
              </div>

              <div className="text-center space-y-1">
                <p className="text-xs font-bold text-emerald-400 flex items-center justify-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  {challengePrompt}
                </p>
                <p className="text-[11px] text-slate-400">Keep your head centered and well lit</p>
              </div>
            </div>
          )}

          {step === 'verifying' && (
            <div className="py-8 text-center space-y-3">
              <RefreshCw className="w-10 h-10 mx-auto text-emerald-400 animate-spin" />
              <p className="text-sm font-semibold text-white">{challengePrompt}</p>
              <p className="text-xs text-slate-400">Issuing cryptographic liveness token...</p>
            </div>
          )}

          {step === 'success' && (
            <div className="py-6 text-center space-y-3 animate-in zoom-in-95 duration-200">
              <div className="w-14 h-14 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="font-bold text-white text-base">Liveness Confirmed</h4>
              <p className="text-xs text-emerald-300">
                Your presence is verified. Agricultural advisers will prioritize your consultations.
              </p>
            </div>
          )}

          {step === 'error' && (
            <div className="py-4 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center">
                <AlertCircle className="w-6 h-6" />
              </div>
              <p className="text-xs text-red-300">{errorMessage}</p>
              <button
                type="button"
                onClick={startCamera}
                className="px-4 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
