import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, PhoneOff, Video, MapPin, Sparkles, Send, CheckCircle2, AlertTriangle, Droplets, Sun, Wind, Layers, Plus, RotateCcw, X, Edit3, Circle, MessageSquare, ShieldCheck, Activity, Wifi } from 'lucide-react';
import { FarmerAdviserCallSession, CallAnnotation } from '../../types';
import { farmerAdviserService } from '../../services/farmerAdviserService';
import { webRTCPairingService, STUN_SERVERS } from '../../services/webrtc/webRTCPairingService';

interface AdviserLiveCallWorkstationProps {
  callSession: FarmerAdviserCallSession;
  onClose: () => void;
}

export const AdviserLiveCallWorkstation: React.FC<AdviserLiveCallWorkstationProps> = ({
  callSession: initialSession,
  onClose,
}) => {
  const [session, setSession] = useState<FarmerAdviserCallSession>(initialSession);
  const [activeTool, setActiveTool] = useState<'point' | 'highlight' | 'draw' | 'note'>('point');
  const [selectedColor, setSelectedColor] = useState<string>('#10b981');
  const [noteInput, setNoteInput] = useState<string>('');
  const [isMuted, setIsMuted] = useState(false);
  const [annotations, setAnnotations] = useState<CallAnnotation[]>(initialSession.annotations || []);
  const [isStreamVerified, setIsStreamVerified] = useState(false);
  const [videoDimensions, setVideoDimensions] = useState<{ width: number; height: number; fps: number }>({ width: 0, height: 0, fps: 30 });
  const [connectionQuality, setConnectionQuality] = useState<'connecting' | 'good' | 'excellent'>('connecting');

  const videoCanvasRef = useRef<HTMLDivElement | null>(null);
  const remoteVideoRef = useRef<HTMLVideoElement | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localMicStreamRef = useRef<MediaStream | null>(null);

  // 1. Establish WebRTC connection and receive live Farmer camera stream
  useEffect(() => {
    const sessionId = session.sessionId;
    let isMounted = true;
    let iceCandidateSince = 0;
    let offerPollingTimer: any = null;
    let icePollingTimer: any = null;
    let frameCheckTimer: any = null;
    let lastOfferSdp: string | null = null;
    let frameCounter = 0;

    const initReceiver = async () => {
      try {
        // 1. Acquire local microphone for 2-way voice communication with farmer
        let localAudioStream: MediaStream | null = null;
        try {
          localAudioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
          localMicStreamRef.current = localAudioStream;
        } catch (micErr) {
          console.warn('[AdviserWorkstation] Mic permission warning:', micErr);
        }

        // 2. Initialize RTCPeerConnection
        const pc = new RTCPeerConnection(STUN_SERVERS);
        pcRef.current = pc;

        // Add local mic track if available
        if (localAudioStream) {
          localAudioStream.getAudioTracks().forEach((track) => {
            pc.addTrack(track, localAudioStream!);
          });
        }

        // Handle incoming remote stream from farmer
        pc.ontrack = (event) => {
          console.log('[AdviserWorkstation] Received remote track:', event.track.kind);
          const incomingStream = event.streams?.[0] || new MediaStream([event.track]);
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = incomingStream;
            remoteVideoRef.current.play().catch((err) => {
              console.warn('[AdviserWorkstation] Remote video play:', err);
            });
          }
        };

        // Handle local ICE candidates
        pc.onicecandidate = (event) => {
          if (event.candidate) {
            webRTCPairingService.sendIceCandidate(sessionId, event.candidate.toJSON(), 'laptop');
          }
        };

        pc.onconnectionstatechange = () => {
          console.log('[AdviserWorkstation] WebRTC Connection State:', pc.connectionState);
          if (pc.connectionState === 'connected') {
            setConnectionQuality('excellent');
          }
        };

        // 3. Poll for Farmer SDP Offer
        offerPollingTimer = setInterval(async () => {
          if (!isMounted || !pcRef.current) return;
          try {
            const offerData = await webRTCPairingService.getOffer(sessionId);
            if (offerData.hasOffer && offerData.sdp && offerData.sdp !== lastOfferSdp) {
              lastOfferSdp = offerData.sdp;
              console.log('[AdviserWorkstation] Received SDP Offer from Farmer');

              await pcRef.current.setRemoteDescription(
                new RTCSessionDescription({ type: 'offer', sdp: offerData.sdp })
              );

              const answer = await pcRef.current.createAnswer();
              await pcRef.current.setLocalDescription(answer);

              await webRTCPairingService.sendAnswer(sessionId, answer.sdp || '');
              await webRTCPairingService.updateSessionState(sessionId, 'ANSWER_RECEIVED');
              setConnectionQuality('good');
            }
          } catch (offerErr) {
            console.warn('[AdviserWorkstation] Offer handling warning:', offerErr);
          }
        }, 1000);

        // 4. Poll for Farmer ICE Candidates
        icePollingTimer = setInterval(async () => {
          if (!isMounted || !pcRef.current) return;
          try {
            const iceData = await webRTCPairingService.getIceCandidates(sessionId, 'laptop', iceCandidateSince);
            if (iceData.candidates && iceData.candidates.length > 0) {
              for (const cand of iceData.candidates) {
                try {
                  await pcRef.current.addIceCandidate(new RTCIceCandidate(cand));
                } catch (candErr) {
                  console.warn('[AdviserWorkstation] Adding ICE candidate warning:', candErr);
                }
              }
              iceCandidateSince = iceData.latestTimestamp;
            }
          } catch (iceErr) {
            console.warn('[AdviserWorkstation] ICE polling warning:', iceErr);
          }
        }, 1000);

        // 5. Continuous Frame Verification Loop
        frameCheckTimer = setInterval(() => {
          const video = remoteVideoRef.current;
          if (video && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && video.videoWidth > 0) {
            frameCounter += 1;
            setVideoDimensions({
              width: video.videoWidth,
              height: video.videoHeight,
              fps: 30,
            });
            setIsStreamVerified(true);
            setConnectionQuality('excellent');

            // Send periodic frame verification receipt to server
            if (frameCounter % 5 === 0) {
              webRTCPairingService.notifyFrameReceipt(sessionId, {
                frameCount: frameCounter,
                width: video.videoWidth,
                height: video.videoHeight,
                fps: 30,
              });
            }
          }
        }, 1000);

      } catch (err: any) {
        console.warn('[AdviserWorkstation] Initialization error:', err);
      }
    };

    initReceiver();

    return () => {
      isMounted = false;
      if (offerPollingTimer) clearInterval(offerPollingTimer);
      if (icePollingTimer) clearInterval(icePollingTimer);
      if (frameCheckTimer) clearInterval(frameCheckTimer);

      if (localMicStreamRef.current) {
        localMicStreamRef.current.getTracks().forEach((t) => t.stop());
        localMicStreamRef.current = null;
      }
      if (pcRef.current) {
        try {
          pcRef.current.close();
        } catch {}
        pcRef.current = null;
      }
    };
  }, [session.sessionId]);

  // 2. Poll for Call State & Telemetry Updates
  useEffect(() => {
    const interval = setInterval(async () => {
      const updated = await farmerAdviserService.getCallSession(session.callId);
      if (updated) {
        setSession(updated);
        setAnnotations(updated.annotations || []);
        if (updated.status === 'ENDED' || updated.status === 'DECLINED') {
          onClose();
        }
      }
    }, 1200);

    return () => clearInterval(interval);
  }, [session.callId]);

  // 3. Handle Video Canvas Click for Live Annotation
  const handleCanvasClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoCanvasRef.current) return;
    const rect = videoCanvasRef.current.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    let text = '';
    if (activeTool === 'point') text = 'Adviser Pointed Here';
    if (activeTool === 'highlight') text = 'Focus on this Area';

    const newAnnot = await farmerAdviserService.sendAnnotation(session.callId, {
      type: activeTool,
      x,
      y,
      color: selectedColor,
      text,
      author: 'Dr. Anand Sharma (Adviser)',
    });

    if (newAnnot) {
      setAnnotations((prev) => [...prev, newAnnot]);
    }
  };

  const handleSendNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteInput.trim()) return;

    await farmerAdviserService.sendAnnotation(session.callId, {
      type: 'note',
      x: 50,
      y: 20,
      text: noteInput.trim(),
      color: '#3b82f6',
      author: 'Dr. Anand Sharma',
    });

    setNoteInput('');
  };

  const handleEndCall = async () => {
    await farmerAdviserService.endCall(session.callId);
    if (localMicStreamRef.current) {
      localMicStreamRef.current.getTracks().forEach((t) => t.stop());
    }
    if (pcRef.current) {
      try {
        pcRef.current.close();
      } catch {}
    }
    onClose();
  };

  const handleToggleMute = () => {
    const next = !isMuted;
    if (localMicStreamRef.current) {
      localMicStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = isMuted; // Toggle
      });
    }
    setIsMuted(next);
    farmerAdviserService.syncAudioState(session.callId, { adviserMuted: next });
  };

  const quickAdviceTemplates = [
    '💧 Run drip irrigation for 45 minutes today',
    '🔍 Inspect underside of leaf for aphids',
    '🧪 Apply zinc micronutrient split dose',
    '🌧️ Hold fertilizer due to incoming rain',
  ];

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 text-white flex flex-col overflow-hidden">
      {/* Top Header Bar */}
      <header className="px-6 py-3.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white shadow-md">
            👨‍🌾
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">{session.farmerName}</h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                LIVE CALL ACTIVE
              </span>
              {isStreamVerified && (
                <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-blue-400" />
                  WebRTC P2P
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              {session.farmName} • {session.farmZone} • {session.crop}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleMute}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              isMuted
                ? 'bg-rose-600/20 border-rose-500 text-rose-300'
                : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
            }`}
            title={isMuted ? 'Unmute Microphone' : 'Mute Microphone'}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <button
            onClick={handleEndCall}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-lg shadow-rose-600/30 transition-all cursor-pointer"
          >
            <PhoneOff className="w-4 h-4" />
            <span>End Call</span>
          </button>
        </div>
      </header>

      {/* Main Split Body: Live Video Stream Canvas (Left) + Agricultural Telemetry & Annotation Tools (Right) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Video Stream & Live Interactive Annotation Area */}
        <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
          <div
            ref={videoCanvasRef}
            onClick={handleCanvasClick}
            className="relative w-full h-full cursor-crosshair select-none flex items-center justify-center bg-slate-900"
          >
            {/* Real Continuous Live WebRTC Video Stream from Farmer */}
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              controls={false}
              className="w-full h-full object-cover"
            />

            {/* Connecting State Placeholder if stream is establishing */}
            {!isStreamVerified && (
              <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-10">
                <div className="w-16 h-16 rounded-3xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-3xl mb-3 animate-pulse">
                  📹
                </div>
                <h4 className="text-sm font-bold text-white">Connecting Live Field Video Stream...</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  Establishing encrypted WebRTC peer connection with {session.farmerName}'s mobile camera.
                </p>
              </div>
            )}

            {/* Video Watermark / Telemetry Badge */}
            <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/75 backdrop-blur-md border border-white/20 text-xs font-semibold text-white">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
              <span>
                {isStreamVerified
                  ? `FARMER CAMERA: ${videoDimensions.width > 0 ? `${videoDimensions.width}x${videoDimensions.height}` : '720p'} @ ${videoDimensions.fps}fps`
                  : 'FARMER CAMERA: Connecting...'}
              </span>
            </div>

            {/* Live Overlay Annotations */}
            <div className="absolute inset-0 pointer-events-none z-20">
              {annotations.map((annot) => {
                if (annot.type === 'point') {
                  return (
                    <div
                      key={annot.id}
                      style={{ left: `${annot.x}%`, top: `${annot.y}%` }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-auto"
                    >
                      <div className="relative flex items-center justify-center">
                        <span className="w-8 h-8 rounded-full bg-emerald-500/40 animate-ping absolute" />
                        <div
                          style={{ backgroundColor: annot.color || '#10b981' }}
                          className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-white text-xs shadow-xl"
                        >
                          📍
                        </div>
                      </div>
                      <span className="mt-1 px-2.5 py-0.5 rounded-full bg-black/85 text-[10px] font-bold text-white shadow-md border border-white/20">
                        {annot.text || 'Point'}
                      </span>
                    </div>
                  );
                }

                if (annot.type === 'highlight') {
                  return (
                    <div
                      key={annot.id}
                      style={{ left: `${annot.x}%`, top: `${annot.y}%` }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
                    >
                      <div
                        style={{ borderColor: annot.color || '#f59e0b' }}
                        className="w-28 h-28 rounded-full border-4 bg-amber-400/20 shadow-[0_0_25px_#f59e0b] animate-pulse flex items-center justify-center"
                      >
                        <span className="text-[10px] font-bold bg-black/85 px-2 py-0.5 rounded text-amber-300">
                          {annot.text || 'Highlight'}
                        </span>
                      </div>
                    </div>
                  );
                }

                if (annot.type === 'note') {
                  return (
                    <div
                      key={annot.id}
                      style={{ left: `${annot.x}%`, top: `${annot.y}%` }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto"
                    >
                      <div className="px-3 py-1.5 rounded-2xl bg-blue-600 text-white text-xs font-bold shadow-xl border border-white/30 flex items-center gap-1.5">
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>{annot.text}</span>
                      </div>
                    </div>
                  );
                }

                return null;
              })}
            </div>

            {/* Bottom Stream Floating Toolbar */}
            <div className="absolute bottom-6 inset-x-6 flex items-center justify-between pointer-events-auto z-30">
              {/* Annotation Mode Selection */}
              <div className="flex items-center gap-2 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-2xl border border-slate-700 shadow-2xl">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveTool('point');
                  }}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTool === 'point'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <MapPin className="w-4 h-4" />
                  <span>Point / Pin</span>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveTool('highlight');
                  }}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    activeTool === 'highlight'
                      ? 'bg-amber-600 text-white shadow-md'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Circle className="w-4 h-4" />
                  <span>Highlight Spot</span>
                </button>

                {/* Color Selector */}
                <div className="flex items-center gap-1.5 px-2 border-l border-slate-700">
                  {['#10b981', '#f59e0b', '#ef4444', '#3b82f6'].map((col) => (
                    <button
                      key={col}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedColor(col);
                      }}
                      style={{ backgroundColor: col }}
                      className={`w-5 h-5 rounded-full transition-transform cursor-pointer ${
                        selectedColor === col ? 'scale-125 ring-2 ring-white' : 'opacity-70 hover:opacity-100'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Status Hint */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/75 backdrop-blur-md text-[11px] text-slate-300 border border-slate-800">
                <span>💡 Click on the video to drop a live pointer on the farmer's phone</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Agricultural Context & Live Advice Panel */}
        <div className="w-full lg:w-96 bg-slate-900 border-l border-slate-800 p-5 flex flex-col justify-between overflow-y-auto space-y-5">
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Live Field Context & Telemetry
            </h4>

            {/* Farm Details Card */}
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Crop Type</span>
                <span className="text-xs font-bold text-white">{session.crop}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Soil Moisture</span>
                <span className="text-xs font-bold text-emerald-400">{session.soilMoisture}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Weather</span>
                <span className="text-xs font-bold text-amber-300">{session.weather}</span>
              </div>
            </div>

            {/* CroperX AI Diagnostic Observation */}
            <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300">
                <Sparkles className="w-3.5 h-3.5" />
                <span>CroperX AI Vision Observation</span>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                {session.croperxObservation}
              </p>
            </div>

            {/* Quick Advice Recommendations */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Quick Advice Prescriptions
              </span>
              <div className="space-y-1.5">
                {quickAdviceTemplates.map((template, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      farmerAdviserService.sendAnnotation(session.callId, {
                        type: 'note',
                        x: 50,
                        y: 20,
                        text: template,
                        color: '#3b82f6',
                        author: 'Dr. Anand Sharma',
                      });
                    }}
                    className="w-full text-left p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-200 hover:text-white transition-all flex items-center justify-between cursor-pointer"
                  >
                    <span>{template}</span>
                    <Send className="w-3 h-3 text-slate-400" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Send Custom Live Note to Farmer Form */}
          <form onSubmit={handleSendNote} className="pt-2 border-t border-slate-800 space-y-2">
            <span className="text-xs font-semibold text-slate-400 block">
              Send Live Audio/Text Note to Farmer:
            </span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                placeholder="e.g. Inspect the roots closely..."
                className="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={!noteInput.trim()}
                className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-all disabled:opacity-40 cursor-pointer"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
