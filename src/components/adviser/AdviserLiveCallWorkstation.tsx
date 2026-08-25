import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, PhoneOff, Video, MapPin, Sparkles, Send, CheckCircle2, AlertTriangle, Droplets, Sun, Wind, Layers, Plus, RotateCcw, X, Edit3, Circle, MessageSquare } from 'lucide-react';
import { FarmerAdviserCallSession, CallAnnotation } from '../../types';
import { farmerAdviserService } from '../../services/farmerAdviserService';

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
  const videoCanvasRef = useRef<HTMLDivElement | null>(null);

  // Poll for call state & sync
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

  // Handle Video Canvas Click for Live Annotation
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
    onClose();
  };

  const handleToggleMute = () => {
    const next = !isMuted;
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
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                LIVE CALL ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {session.farmName} • {session.farmZone} • {session.crop}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleMute}
            className={`p-2.5 rounded-xl border transition-all ${
              isMuted
                ? 'bg-rose-600/20 border-rose-500 text-rose-300'
                : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700'
            }`}
          >
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          <button
            onClick={handleEndCall}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm shadow-lg shadow-rose-600/30 transition-all"
          >
            <PhoneOff className="w-4 h-4" />
            <span>End Call</span>
          </button>
        </div>
      </header>

      {/* Main Split Body: Video Stream Canvas (Left) + Agricultural Telemetry & Annotation Tools (Right) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Left Video Stream & Live Interactive Annotation Area */}
        <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
          {/* Simulated High-Res Video Feed with Crop Field */}
          <div
            ref={videoCanvasRef}
            onClick={handleCanvasClick}
            className="relative w-full h-full cursor-crosshair select-none flex items-center justify-center bg-slate-900"
          >
            {/* Live Field Video Background or Snapshot */}
            <img
              src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1600&q=80"
              alt="Farmer Field Stream"
              className="w-full h-full object-cover opacity-90"
            />

            {/* Video Watermark Badge */}
            <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-xs font-semibold text-white">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
              <span>FARMER CAMERA: 1080p @ 30fps</span>
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
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
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
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
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
                      className={`w-5 h-5 rounded-full transition-transform ${
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
                    className="w-full text-left p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-200 hover:text-white transition-all flex items-center justify-between"
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
                className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-all disabled:opacity-40"
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
