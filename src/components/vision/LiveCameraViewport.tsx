import React, { useRef, useEffect, useState } from 'react';
import { 
  Camera, 
  RotateCw, 
  Sparkles, 
  Maximize2, 
  Minimize2, 
  Sun, 
  AlertTriangle, 
  CheckCircle2, 
  MapPin, 
  Radio, 
  Eye, 
  Square,
  Zap
} from 'lucide-react';
import { cameraDeviceService } from '../../services/cameraDeviceService';
import { ImageQualityReport } from '../../types/cameraTypes';
import { FarmZone } from '../../types';

interface LiveCameraViewportProps {
  stream: MediaStream | null;
  isStreaming: boolean;
  isAnalyzing: boolean;
  selectedZone: FarmZone | null;
  qualityReport: ImageQualityReport | null;
  onStartCamera: () => void;
  onStopCamera: () => void;
  onSwitchCamera: () => void;
  onCaptureFrame: (frameDataUrl: string, imageData: ImageData) => void;
  onAnalyzeFrame: (frameDataUrl: string, imageData: ImageData) => void;
  onSelectZoneClick: () => void;
  isSimulated?: boolean;
}

export const LiveCameraViewport: React.FC<LiveCameraViewportProps> = ({
  stream,
  isStreaming,
  isAnalyzing,
  selectedZone,
  qualityReport,
  onStartCamera,
  onStopCamera,
  onSwitchCamera,
  onCaptureFrame,
  onAnalyzeFrame,
  onSelectZoneClick,
  isSimulated = false,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lastCaptureFlash, setLastCaptureFlash] = useState(false);

  // Attach stream to video tag
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch((e) => {
        console.warn('Video auto-play interrupted:', e);
      });
    }
  }, [stream]);

  const handleCaptureAction = (analyzeAfter = false) => {
    if (!videoRef.current) return;
    const captured = cameraDeviceService.captureFrame(videoRef.current);
    if (captured) {
      setLastCaptureFlash(true);
      setTimeout(() => setLastCaptureFlash(false), 200);

      if (analyzeAfter) {
        onAnalyzeFrame(captured.dataUrl, captured.imageData);
      } else {
        onCaptureFrame(captured.dataUrl, captured.imageData);
      }
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  return (
    <div
      ref={containerRef}
      className={`relative bg-black rounded-3xl overflow-hidden shadow-2xl border border-gray-800 transition-all ${
        isFullscreen ? 'w-screen h-screen rounded-none' : 'w-full aspect-[4/3] sm:aspect-[16/9] max-h-[560px]'
      }`}
    >
      {/* Video Element */}
      {isStreaming && (
        <video
          ref={videoRef}
          playsInline
          muted
          autoPlay
          className="w-full h-full object-cover"
        />
      )}

      {/* Standby / Disconnected Screen */}
      {!isStreaming && (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-gradient-to-b from-gray-900 via-[#122312] to-black text-white space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-[#2e7d32]/20 border border-[#4CAF50]/40 flex items-center justify-center text-[#4CAF50] shadow-lg animate-pulse">
            <Camera className="w-8 h-8" />
          </div>
          <div className="max-w-md space-y-1.5">
            <h4 className="text-lg font-bold text-white">
              {isSimulated ? 'Simulator Stream Ready' : 'Field Camera Standby'}
            </h4>
            <p className="text-xs text-gray-300">
              Tap &quot;Start Camera&quot; to begin inspecting foliage in real-time or switch between available phone sensors.
            </p>
          </div>
          <button
            onClick={onStartCamera}
            className="px-6 py-3.5 min-h-[44px] bg-[#2e7d32] hover:bg-[#4CAF50] text-white font-bold rounded-2xl text-sm transition-all shadow-lg active:scale-95 cursor-pointer flex items-center gap-2"
          >
            <Camera className="w-5 h-5" />
            Start Field Camera
          </button>
        </div>
      )}

      {/* White Flash Effect on Capture */}
      {lastCaptureFlash && (
        <div className="absolute inset-0 bg-white opacity-80 z-30 pointer-events-none transition-opacity duration-200" />
      )}

      {/* Overlays when streaming */}
      {isStreaming && (
        <>
          {/* Top Info Bar Overlay */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-20 pointer-events-none">
            {/* Zone Tag & Mode Pill */}
            <div className="flex items-center gap-2 pointer-events-auto flex-wrap">
              <button
                onClick={onSelectZoneClick}
                className="px-3 py-1.5 min-h-[36px] bg-black/60 hover:bg-black/80 backdrop-blur-md text-white rounded-xl border border-white/20 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-md active:scale-95"
              >
                <MapPin className="w-3.5 h-3.5 text-[#4CAF50]" />
                <span>{selectedZone ? selectedZone.name : 'Select Farm Zone'}</span>
              </button>

              {isSimulated && (
                <span className="px-2.5 py-1 bg-amber-500/80 backdrop-blur-md text-white text-[10px] font-mono font-black uppercase rounded-lg border border-amber-300/40">
                  Demo / Simulated
                </span>
              )}
            </div>

            {/* Quality & Fullscreen buttons */}
            <div className="flex items-center gap-2 pointer-events-auto">
              {qualityReport && (
                <div
                  className={`px-2.5 py-1 min-h-[32px] rounded-xl backdrop-blur-md text-[11px] font-bold flex items-center gap-1.5 border shadow-md ${
                    qualityReport.isValid
                      ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40'
                      : 'bg-amber-950/70 text-amber-300 border-amber-500/40'
                  }`}
                >
                  {qualityReport.isValid ? (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  )}
                  <span>{qualityReport.isValid ? 'Optimal Focus' : 'Adjust Camera'}</span>
                </div>
              )}

              <button
                onClick={toggleFullscreen}
                className="p-2 min-w-[36px] min-h-[36px] bg-black/60 hover:bg-black/80 backdrop-blur-md text-white rounded-xl border border-white/20 transition-all cursor-pointer flex items-center justify-center"
                title="Toggle Fullscreen"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Viewfinder Target Reticle */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div className="w-56 h-56 sm:w-72 sm:h-72 border-2 border-white/30 rounded-3xl relative">
              {/* Corner Accents */}
              <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-[#4CAF50] rounded-tl-xl" />
              <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-[#4CAF50] rounded-tr-xl" />
              <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-[#4CAF50] rounded-bl-xl" />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-[#4CAF50] rounded-br-xl" />
              
              {/* Center Crosshair */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-[#4CAF50]/60 animate-ping" />
              </div>
            </div>
          </div>

          {/* Quality Guidance Tip Banner (if issues exist) */}
          {qualityReport && qualityReport.farmerGuidance.length > 0 && !qualityReport.isValid && (
            <div className="absolute top-14 left-4 right-4 z-20 pointer-events-none">
              <div className="max-w-md mx-auto bg-black/80 backdrop-blur-md border border-amber-400/50 rounded-2xl p-2.5 text-amber-200 text-xs flex items-center gap-2 shadow-xl">
                <Sun className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="truncate">{qualityReport.farmerGuidance[0]}</span>
              </div>
            </div>
          )}

          {/* Bottom Floating Control Bar */}
          <div className="absolute bottom-4 left-0 right-0 z-20 flex items-center justify-center gap-3 px-4">
            {/* Switch Camera Button (Front/Back) */}
            <button
              onClick={onSwitchCamera}
              className="p-3.5 min-w-[48px] min-h-[48px] bg-white/20 hover:bg-white/30 backdrop-blur-xl text-white rounded-2xl border border-white/30 shadow-lg active:scale-90 transition-all cursor-pointer flex items-center justify-center"
              title="Switch Camera Facing Mode"
            >
              <RotateCw className="w-5 h-5" />
            </button>

            {/* Primary Action: Live Vision AI Analyze */}
            <button
              onClick={() => handleCaptureAction(true)}
              disabled={isAnalyzing}
              className="px-6 py-3.5 min-h-[50px] bg-gradient-to-r from-[#2e7d32] to-[#4CAF50] hover:brightness-110 text-white font-bold rounded-2xl shadow-2xl active:scale-95 transition-all cursor-pointer flex items-center gap-2 border border-white/30 text-sm disabled:opacity-50"
            >
              <Sparkles className="w-5 h-5 animate-spin-slow" />
              <span>{isAnalyzing ? 'Analyzing Foliage...' : 'Analyze Crop'}</span>
            </button>

            {/* Still Frame Snap */}
            <button
              onClick={() => handleCaptureAction(false)}
              className="p-3.5 min-w-[48px] min-h-[48px] bg-white/20 hover:bg-white/30 backdrop-blur-xl text-white rounded-2xl border border-white/30 shadow-lg active:scale-90 transition-all cursor-pointer flex items-center justify-center"
              title="Capture Still Frame"
            >
              <Eye className="w-5 h-5" />
            </button>

            {/* Stop Camera Button */}
            <button
              onClick={onStopCamera}
              className="p-3.5 min-w-[48px] min-h-[48px] bg-red-600/80 hover:bg-red-700 backdrop-blur-xl text-white rounded-2xl border border-red-400/40 shadow-lg active:scale-90 transition-all cursor-pointer flex items-center justify-center"
              title="Stop Camera Stream"
            >
              <Square className="w-4 h-4 fill-current" />
            </button>
          </div>
        </>
      )}
    </div>
  );
};
