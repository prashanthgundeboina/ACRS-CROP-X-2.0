import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, Volume2, VolumeX, PhoneOff, Video, RefreshCw, Sparkles, MessageSquare, AlertCircle, CheckCircle, ShieldCheck, MapPin } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { FarmerAdviserCallSession, CallAnnotation } from '../../types';
import { farmerAdviserService } from '../../services/farmerAdviserService';

interface FarmerAdviserLiveCallProps {
  isOpen: boolean;
  onClose: () => void;
  farmerName: string;
  farmName: string;
  farmZone: string;
  cropName: string;
  soilMoisture?: number | string;
  weatherSummary?: string;
  croperxObservation?: string;
  initialObservation?: string;
}

export const FarmerAdviserLiveCall: React.FC<FarmerAdviserLiveCallProps> = ({
  isOpen,
  onClose,
  farmerName,
  farmName,
  farmZone,
  cropName,
  soilMoisture = '26%',
  weatherSummary = '31°C, Clear Sky',
  croperxObservation = 'Live video requested for leaf health review',
}) => {
  const { language } = useLanguage();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [callSession, setCallSession] = useState<FarmerAdviserCallSession | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(true);
  const [callStatus, setCallStatus] = useState<'CONNECTING' | 'RINGING' | 'CONNECTED' | 'ENDED'>('CONNECTING');
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [liveAnnotations, setLiveAnnotations] = useState<CallAnnotation[]>([]);
  const [latestAdviserNote, setLatestAdviserNote] = useState<string | null>(null);

  // Start Camera and initiate call request to Adviser
  useEffect(() => {
    if (!isOpen) return;

    let localStream: MediaStream | null = null;

    const startSession = async () => {
      try {
        setCallStatus('CONNECTING');
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: facingMode }, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: true,
        });

        localStream = mediaStream;
        setStream(mediaStream);

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
          videoRef.current.play().catch(() => {});
        }

        // Send call request to Adviser queue
        const session = await farmerAdviserService.requestAdviserCall({
          farmerId: 'usr_' + farmerName.toLowerCase().replace(/\s+/g, '_'),
          farmerName,
          farmName,
          farmZone,
          crop: cropName,
          soilMoisture,
          weather: weatherSummary,
          croperxObservation,
        });

        setCallSession(session);
        setCallStatus('RINGING');
      } catch (err: any) {
        console.warn('Call start error:', err);
        setCallStatus('RINGING'); // Proceed even if virtual stream
      }
    };

    startSession();

    return () => {
      if (localStream) {
        localStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [isOpen, facingMode]);

  // Poll for Adviser Call Acceptance & Live Annotations
  useEffect(() => {
    if (!isOpen || !callSession?.callId) return;

    const interval = setInterval(async () => {
      const updated = await farmerAdviserService.getCallSession(callSession.callId);
      if (updated) {
        setCallSession(updated);
        if (updated.status === 'ACCEPTED' || updated.status === 'ACTIVE') {
          setCallStatus('CONNECTED');
        } else if (updated.status === 'ENDED' || updated.status === 'DECLINED') {
          setCallStatus('ENDED');
        }

        if (updated.annotations && updated.annotations.length > 0) {
          setLiveAnnotations(updated.annotations);
          const notes = updated.annotations.filter((a) => a.type === 'note' && a.text);
          if (notes.length > 0) {
            setLatestAdviserNote(notes[notes.length - 1].text || null);
          }
        }
      }
    }, 1200);

    return () => clearInterval(interval);
  }, [isOpen, callSession?.callId]);

  // Toggle Mute
  const handleToggleMute = () => {
    if (stream) {
      stream.getAudioTracks().forEach((track) => {
        track.enabled = isMuted; // toggle
      });
    }
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (callSession?.callId) {
      farmerAdviserService.syncAudioState(callSession.callId, { farmerMuted: nextMuted });
    }
  };

  // Toggle Camera
  const handleToggleCamera = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // End Call
  const handleEndCall = async () => {
    if (callSession?.callId) {
      await farmerAdviserService.endCall(callSession.callId);
    }
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
    }
    setCallStatus('ENDED');
    setTimeout(() => {
      onClose();
    }, 400);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col justify-between overflow-hidden">
      {/* Top Clean Header Bar */}
      <div className="relative z-30 flex items-center justify-between p-4 bg-gradient-to-b from-black/90 via-black/50 to-transparent">
        {/* Adviser Profile Capsule */}
        <div className="flex items-center gap-3 bg-black/60 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/10">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-lg font-bold text-white border-2 border-white/40">
              👨‍🌾
            </div>
            {callStatus === 'CONNECTED' && (
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-black" />
            )}
          </div>
          <div>
            <h4 className="text-sm font-bold text-white leading-tight">
              Dr. Anand Sharma
            </h4>
            <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
              {callStatus === 'CONNECTED' ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  {language === 'hi' ? 'सलाहकार लाइव जुड़े हैं' : 'Adviser Live on Call'}
                </>
              ) : callStatus === 'RINGING' ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  {language === 'hi' ? 'सलाहकार से संपर्क हो रहा है...' : 'Connecting to Adviser...'}
                </>
              ) : (
                'Initializing secure video...'
              )}
            </span>
          </div>
        </div>

        {/* Switch Camera Button */}
        <button
          onClick={handleToggleCamera}
          className="p-3 rounded-2xl bg-white/15 hover:bg-white/25 backdrop-blur-md text-white transition-all"
          title="Switch Camera"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Main Fullscreen Video Feed with Live Adviser Annotations Overlay */}
      <div className="relative flex-1 flex items-center justify-center bg-black overflow-hidden">
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          className="w-full h-full object-cover"
        />

        {/* Live Annotations Canvas Overlay */}
        <div className="absolute inset-0 pointer-events-none z-20">
          {liveAnnotations.map((annot) => {
            if (annot.type === 'point') {
              return (
                <div
                  key={annot.id}
                  style={{ left: `${annot.x}%`, top: `${annot.y}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
                >
                  <div className="relative flex items-center justify-center">
                    <span className="w-8 h-8 rounded-full bg-rose-500/40 animate-ping absolute" />
                    <div className="w-6 h-6 rounded-full bg-rose-500 border-2 border-white flex items-center justify-center text-white text-xs shadow-lg">
                      📍
                    </div>
                  </div>
                  <span className="mt-1 px-2 py-0.5 rounded-full bg-black/80 text-[10px] font-bold text-white whitespace-nowrap shadow-md">
                    {annot.text || 'Adviser Pointed Here'}
                  </span>
                </div>
              );
            }

            if (annot.type === 'highlight') {
              return (
                <div
                  key={annot.id}
                  style={{ left: `${annot.x}%`, top: `${annot.y}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2"
                >
                  <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-amber-400 bg-amber-400/20 shadow-[0_0_20px_#f59e0b] animate-pulse flex items-center justify-center">
                    <span className="text-[10px] font-bold bg-black/80 px-2 py-0.5 rounded text-amber-300">
                      {annot.text || 'Look Here'}
                    </span>
                  </div>
                </div>
              );
            }

            return null;
          })}
        </div>

        {/* Latest Adviser Guidance Note Banner */}
        <AnimatePresence>
          {latestAdviserNote && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-20 inset-x-4 z-30 flex justify-center pointer-events-none"
            >
              <div className="bg-gradient-to-r from-blue-900/90 to-indigo-900/90 backdrop-blur-md border-2 border-blue-400/60 p-4 rounded-3xl text-white shadow-2xl max-w-sm text-center flex items-center gap-3">
                <span className="text-2xl">📝</span>
                <div className="text-left">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300 block">
                    {language === 'hi' ? 'सलाहकार का संदेश' : 'Adviser Note'}
                  </span>
                  <p className="text-sm font-semibold">{latestAdviserNote}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Connecting/Ringing Overlay if waiting */}
        {callStatus === 'RINGING' && (
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-20">
            <div className="w-20 h-20 rounded-full bg-blue-600/30 border-2 border-blue-400/50 flex items-center justify-center text-3xl mb-4 animate-pulse">
              📹
            </div>
            <h3 className="text-lg font-bold text-white">
              {language === 'hi' ? 'सलाहकार को खेत का वीडियो भेजा जा रहा है...' : 'Showing your field to your Farm Adviser...'}
            </h3>
            <p className="text-xs text-slate-300 mt-1 max-w-xs">
              {language === 'hi'
                ? 'सलाहकार को लाइव कैमरा और खेत की जानकारी भेजी गई है।'
                : 'Dr. Anand Sharma is receiving your live video and crop observations.'}
            </p>
          </div>
        )}
      </div>

      {/* Bottom Simplified Farmer Controls (Mic, Speaker, End Call) */}
      <div className="relative z-30 p-6 bg-gradient-to-t from-black via-black/90 to-transparent flex items-center justify-center gap-6 sm:gap-8">
        {/* Mute/Unmute Mic */}
        <button
          onClick={handleToggleMute}
          className={`w-14 h-14 rounded-full flex flex-col items-center justify-center text-white transition-all shadow-lg ${
            isMuted ? 'bg-rose-600 shadow-rose-500/30' : 'bg-slate-800 hover:bg-slate-700'
          }`}
          aria-label="Toggle Microphone"
        >
          {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          <span className="text-[9px] uppercase font-bold tracking-wider mt-0.5">
            {isMuted ? 'Muted' : 'Mic On'}
          </span>
        </button>

        {/* End Call Button (Big Red) */}
        <button
          onClick={handleEndCall}
          className="w-20 h-20 rounded-full bg-rose-600 hover:bg-rose-500 active:scale-95 text-white flex flex-col items-center justify-center shadow-2xl shadow-rose-600/50 transition-all cursor-pointer"
          aria-label="End Call"
        >
          <PhoneOff className="w-8 h-8" />
          <span className="text-[10px] uppercase font-bold tracking-wider mt-1">
            {language === 'hi' ? 'समाप्त' : 'End Call'}
          </span>
        </button>

        {/* Speaker Toggle */}
        <button
          onClick={() => setIsSpeakerOn((s) => !s)}
          className={`w-14 h-14 rounded-full flex flex-col items-center justify-center text-white transition-all shadow-lg ${
            isSpeakerOn ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-700/60 text-slate-400'
          }`}
          aria-label="Toggle Speaker"
        >
          {isSpeakerOn ? <Volume2 className="w-6 h-6" /> : <VolumeX className="w-6 h-6" />}
          <span className="text-[9px] uppercase font-bold tracking-wider mt-0.5">Speaker</span>
        </button>
      </div>
    </div>
  );
};
