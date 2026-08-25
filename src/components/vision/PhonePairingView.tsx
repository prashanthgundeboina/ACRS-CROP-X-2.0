import React, { useState, useEffect, useRef } from 'react';
import {
  Camera,
  RotateCw,
  Zap,
  ZapOff,
  CheckCircle2,
  AlertTriangle,
  Smartphone,
  ShieldCheck,
  Radio,
  ArrowLeft,
  RefreshCw,
  Battery,
  BatteryCharging,
  Wifi,
  Power
} from 'lucide-react';
import { phoneWebRTCBroadcaster } from '../../services/webrtc/PhoneWebRTCBroadcaster';
import { PairingSessionState } from '../../types/cameraTypes';

interface PhonePairingViewProps {
  sessionId: string;
  token?: string;
  onExit?: () => void;
}

export const PhonePairingView: React.FC<PhonePairingViewProps> = ({
  sessionId,
  token,
  onExit,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [sessionState, setSessionState] = useState<PairingSessionState>('MOBILE_OPENED');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [hasTorchSupport, setHasTorchSupport] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [frameCount, setFrameCount] = useState(0);
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [videoResolution, setVideoResolution] = useState<{ width: number; height: number } | null>(null);

  // Initialize phone session on load
  useEffect(() => {
    let isMounted = true;

    phoneWebRTCBroadcaster.initSession(sessionId, token).then((ok) => {
      if (!ok && isMounted) {
        setErrorMessage('Session verification failed or QR code expired.');
      }
    });

    const unsub = phoneWebRTCBroadcaster.subscribeState((state, err) => {
      if (!isMounted) return;
      setSessionState(state);
      if (err) setErrorMessage(err);
    });

    // Check battery level
    if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        if (isMounted && battery && typeof battery.level === 'number') {
          setBatteryLevel(Math.round(battery.level * 100));
        }
      }).catch(() => {});
    }

    return () => {
      isMounted = false;
      unsub();
      phoneWebRTCBroadcaster.disconnect();
    };
  }, [sessionId, token]);

  // Attach stream to video tag
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch((e) => console.warn('Video auto-play warning:', e));

      // Check torch capability
      const track = stream.getVideoTracks()[0];
      if (track) {
        const settings = track.getSettings ? track.getSettings() : {};
        if (settings.width && settings.height) {
          setVideoResolution({ width: settings.width, height: settings.height });
        }
        if ((track as any).getCapabilities) {
          const caps = (track as any).getCapabilities();
          setHasTorchSupport(Boolean(caps.torch));
        }
      }

      // Track frame counts
      const timer = setInterval(() => {
        setFrameCount((prev) => prev + 30);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [stream]);

  const handleStartCamera = async () => {
    setIsStarting(true);
    setErrorMessage(null);
    try {
      const activeStream = await phoneWebRTCBroadcaster.startBroadcasting(facingMode);
      setStream(activeStream);
    } catch (err: any) {
      setErrorMessage(err.message || 'Camera permission denied or failed to open.');
    } finally {
      setIsStarting(false);
    }
  };

  const handleSwitchCamera = async () => {
    try {
      const nextStream = await phoneWebRTCBroadcaster.switchCamera();
      setStream(nextStream);
      setFacingMode(phoneWebRTCBroadcaster.getFacingMode());
    } catch (err: any) {
      setErrorMessage('Could not switch camera.');
    }
  };

  const handleToggleTorch = async () => {
    const status = await phoneWebRTCBroadcaster.toggleTorch();
    setIsTorchOn(status);
  };

  const handleDisconnect = () => {
    phoneWebRTCBroadcaster.disconnect();
    setStream(null);
    if (onExit) onExit();
  };

  const handleRetry = () => {
    setErrorMessage(null);
    phoneWebRTCBroadcaster.initSession(sessionId, token);
  };

  return (
    <div className="min-h-screen bg-[#0d160d] text-white flex flex-col justify-between font-sans selection:bg-[#2e7d32]">
      {/* Top Header Bar */}
      <header className="p-4 bg-[#142314] border-b border-[#2e7d32]/30 flex items-center justify-between shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#2e7d32] to-[#1b2e1b] border border-[#4CAF50]/40 flex items-center justify-center text-white shadow-md">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono font-black text-[#4CAF50] uppercase tracking-wider">
                CroperX Field Scout
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <h1 className="text-base font-bold text-white leading-tight">Mobile Camera Bridge</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {batteryLevel !== null && (
            <div className="flex items-center gap-1 px-2.5 py-1 bg-black/40 rounded-xl border border-white/10 text-[11px] font-mono text-gray-300">
              <Battery className="w-3.5 h-3.5 text-emerald-400" />
              <span>{batteryLevel}%</span>
            </div>
          )}
          {onExit && (
            <button
              onClick={handleDisconnect}
              className="px-3 py-1.5 min-h-[36px] bg-white/10 hover:bg-white/20 text-xs font-bold rounded-xl border border-white/10 transition-all flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Exit
            </button>
          )}
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 p-4 max-w-md mx-auto w-full flex flex-col justify-center gap-4">
        {/* Session Status Pill */}
        <div className="bg-[#182a18] rounded-2xl p-3 border border-[#2e7d32]/30 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Radio className={`w-4 h-4 ${stream ? 'text-emerald-400 animate-pulse' : 'text-amber-400'}`} />
            <span className="font-mono text-gray-300">
              Session: <strong className="text-white">{sessionId}</strong>
            </span>
          </div>

          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
            sessionState === 'STREAM_VERIFIED' || sessionState === 'STREAMING' || sessionState === 'PEER_CONNECTED'
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
              : sessionState === 'SIGNALING_CONNECTED' || sessionState === 'OFFER_CREATED' || sessionState === 'ANSWER_RECEIVED'
              ? 'bg-blue-950 text-blue-300 border border-blue-500/40 animate-pulse'
              : sessionState === 'FAILED' || sessionState === 'EXPIRED' || sessionState === 'DISCONNECTED'
              ? 'bg-red-950 text-red-300 border border-red-500/40'
              : 'bg-amber-950 text-amber-300 border border-amber-500/40'
          }`}>
            {sessionState === 'STREAM_VERIFIED' || sessionState === 'STREAMING'
              ? '🟢 Broadcasting Live'
              : sessionState === 'PEER_CONNECTED' || sessionState === 'ANSWER_RECEIVED'
              ? '🔵 WebRTC Connected'
              : sessionState === 'SIGNALING_CONNECTED' || sessionState === 'OFFER_CREATED'
              ? '🟡 Negotiating...'
              : sessionState === 'FAILED'
              ? '🔴 Failed'
              : sessionState === 'EXPIRED'
              ? '⏱ Expired'
              : 'Standby'}
          </span>
        </div>

        {/* Error Alert if any */}
        {errorMessage && (
          <div className="bg-red-950/80 border border-red-500/50 rounded-2xl p-3.5 text-red-200 text-xs flex items-start gap-2.5 shadow-lg animate-shake">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="space-y-1 flex-1">
              <p className="font-bold">Camera Access Notice</p>
              <p className="text-red-300 text-[11px] leading-relaxed">{errorMessage}</p>
              <button
                onClick={handleRetry}
                className="mt-2 px-3 py-1 bg-red-900/60 hover:bg-red-900 text-white rounded-lg font-bold text-[10px] border border-red-400/40 cursor-pointer flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Retry Connection
              </button>
            </div>
          </div>
        )}

        {/* Viewfinder / Camera Screen */}
        <div className="relative aspect-[3/4] bg-black rounded-3xl overflow-hidden border border-[#2e7d32]/40 shadow-2xl flex items-center justify-center">
          {stream ? (
            <>
              <video
                ref={videoRef}
                playsInline
                muted
                autoPlay
                className="w-full h-full object-cover"
              />

              {/* In-view Target Reticle */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-48 h-48 border-2 border-white/30 rounded-2xl relative">
                  <div className="absolute -top-1 -left-1 w-5 h-5 border-t-4 border-l-4 border-[#4CAF50] rounded-tl-lg" />
                  <div className="absolute -top-1 -right-1 w-5 h-5 border-t-4 border-r-4 border-[#4CAF50] rounded-tr-lg" />
                  <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-4 border-l-4 border-[#4CAF50] rounded-bl-lg" />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-4 border-r-4 border-[#4CAF50] rounded-br-lg" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-[#4CAF50] animate-ping" />
                  </div>
                </div>
              </div>

              {/* Streaming Overlay Info */}
              <div className="absolute top-3 left-3 right-3 flex items-center justify-between text-[11px] pointer-events-none">
                <span className="px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-xl text-emerald-400 font-mono font-bold border border-emerald-500/30 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Camera connected to CroperX
                </span>
                <span className="px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-xl text-white font-mono border border-white/20">
                  {videoResolution ? `${videoResolution.width}x${videoResolution.height}` : '720p'} • {frameCount} frames
                </span>
              </div>
            </>
          ) : (
            <div className="p-6 text-center space-y-4 max-w-xs">
              <div className="w-16 h-16 rounded-3xl bg-[#2e7d32]/20 border border-[#4CAF50]/40 flex items-center justify-center text-[#4CAF50] mx-auto shadow-inner">
                <Camera className="w-8 h-8" />
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-bold text-white">Ready for Field Scouting</h3>
                <p className="text-xs text-gray-300">
                  Tap below to start streaming your back camera in real-time to your laptop.
                </p>
              </div>

              <button
                onClick={handleStartCamera}
                disabled={isStarting}
                className="w-full py-3.5 min-h-[48px] bg-gradient-to-r from-[#2e7d32] to-[#4CAF50] hover:brightness-110 active:scale-95 text-white font-bold rounded-2xl text-sm shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isStarting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Opening Camera...
                  </>
                ) : (
                  <>
                    <Camera className="w-5 h-5" />
                    Start Field Camera
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Live Controls when streaming */}
        {stream && (
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={handleSwitchCamera}
              className="p-3.5 min-w-[48px] min-h-[48px] bg-[#182a18] hover:bg-[#203620] text-white rounded-2xl border border-[#2e7d32]/40 shadow-lg active:scale-90 transition-all flex items-center justify-center cursor-pointer"
              title="Switch Camera (Front/Back)"
            >
              <RotateCw className="w-5 h-5" />
            </button>

            {hasTorchSupport && (
              <button
                onClick={handleToggleTorch}
                className={`p-3.5 min-w-[48px] min-h-[48px] rounded-2xl border shadow-lg active:scale-90 transition-all flex items-center justify-center cursor-pointer ${
                  isTorchOn
                    ? 'bg-amber-400 text-black border-amber-300 shadow-amber-400/20'
                    : 'bg-[#182a18] hover:bg-[#203620] text-white border-[#2e7d32]/40'
                }`}
                title="Toggle Torch / Flashlight"
              >
                {isTorchOn ? <Zap className="w-5 h-5 fill-current" /> : <ZapOff className="w-5 h-5" />}
              </button>
            )}

            <button
              onClick={handleDisconnect}
              className="px-5 py-3.5 min-h-[48px] bg-red-600/80 hover:bg-red-700 active:scale-95 text-white font-bold rounded-2xl text-xs transition-all border border-red-500/40 flex items-center gap-2 cursor-pointer"
            >
              <Power className="w-4 h-4" />
              Disconnect
            </button>
          </div>
        )}

        {/* Security & Farm Privacy Footnote */}
        <div className="bg-[#121f12] rounded-2xl p-3 border border-[#2e7d32]/20 flex items-start gap-2.5 text-[11px] text-gray-400">
          <ShieldCheck className="w-4 h-4 text-[#4CAF50] shrink-0 mt-0.5" />
          <p>
            <strong className="text-gray-200">Zero-Credential Bridge:</strong> WebRTC encrypted peer-to-peer connection. Video is only transmitted while this page remains open.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-3 text-center text-[10px] text-gray-500 border-t border-[#2e7d32]/20">
        CroperX 2.0 • Autonomous Field Scout Subsystem
      </footer>
    </div>
  );
};
