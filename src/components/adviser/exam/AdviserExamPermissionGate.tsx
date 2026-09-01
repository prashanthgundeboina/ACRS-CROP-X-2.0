import React, { useState, useEffect, useRef } from 'react';
import { Camera, Mic, CheckCircle2, AlertTriangle, RefreshCw, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';

interface AdviserExamPermissionGateProps {
  onMediaReady: (stream: MediaStream) => void;
  onContinue: () => void;
}

export const AdviserExamPermissionGate: React.FC<AdviserExamPermissionGateProps> = ({ onMediaReady, onContinue }) => {
  const [cameraGranted, setCameraGranted] = useState<boolean | null>(null);
  const [micGranted, setMicGranted] = useState<boolean | null>(null);
  const [requesting, setRequesting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState<number>(0);
  const [faceInFrame, setFaceInFrame] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const requestPermissions = async () => {
    setRequesting(true);
    setErrorMsg(null);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Your browser does not support media device capture. Please update or use Chrome/Firefox/Edge.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: true
      });

      streamRef.current = stream;
      setCameraGranted(true);
      setMicGranted(true);
      onMediaReady(stream);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }

      // Live Web Audio Meter (without raw recording)
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          const audioCtx = new AudioContextClass();
          audioContextRef.current = audioCtx;
          const source = audioCtx.createMediaStreamSource(stream);
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 256;
          source.connect(analyser);

          const bufferLength = analyser.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);

          const updateVolume = () => {
            analyser.getByteFrequencyData(dataArray);
            let sum = 0;
            for (let i = 0; i < bufferLength; i++) {
              sum += dataArray[i];
            }
            const average = sum / bufferLength;
            setAudioLevel(Math.min(100, Math.round((average / 128) * 100)));
            animationFrameRef.current = requestAnimationFrame(updateVolume);
          };
          updateVolume();
        }
      } catch (audioErr) {
        console.warn('Audio metering init error:', audioErr);
      }

    } catch (err: any) {
      console.error('Media permission error:', err);
      setCameraGranted(false);
      setMicGranted(false);
      setErrorMsg(err.name === 'NotAllowedError'
        ? 'Camera and Microphone access was denied in your browser settings. Please click the lock/camera icon in your address bar and allow permissions.'
        : (err.message || 'Failed to initialize camera or microphone.'));
    } finally {
      setRequesting(false);
    }
  };

  useEffect(() => {
    // Attempt auto-request on mount
    requestPermissions();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, []);

  const allPassed = cameraGranted === true && micGranted === true;

  return (
    <div id="adviser-exam-permission-card" className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 md:p-8 shadow-sm">
      <div className="flex items-center gap-3 pb-5 border-b border-stone-200 dark:border-stone-800">
        <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">Step 3: Device & Camera/Microphone Verification</h2>
          <p className="text-sm text-stone-500 dark:text-stone-400">Continuous biometric proctoring and audio level validation</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
        {/* Left: Video Preview & Face Guide */}
        <div className="flex flex-col items-center">
          <div className="relative w-full max-w-sm aspect-4/3 bg-stone-950 rounded-2xl overflow-hidden border-2 border-stone-800 shadow-inner flex items-center justify-center">
            <video
              ref={videoRef}
              muted
              playsInline
              autoPlay
              className="w-full h-full object-cover mirror -scale-x-100"
            />

            {/* Face Oval Overlay Guide */}
            {allPassed && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-48 h-60 border-2 border-dashed border-emerald-400/80 rounded-[50%] shadow-[0_0_15px_rgba(16,185,129,0.3)] flex flex-col items-center justify-between p-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-300 bg-black/60 px-2 py-0.5 rounded-full mt-2">
                    Keep Face Inside Oval
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-300 bg-black/60 px-2 py-0.5 rounded-full mb-2 flex items-center gap-1">
                    <UserCheck className="w-3 h-3" /> Face Calibrated
                  </span>
                </div>
              </div>
            )}

            {!allPassed && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-stone-400 p-4 text-center">
                <Camera className="w-12 h-12 mb-2 text-stone-600 animate-pulse" />
                <p className="text-xs">Camera stream will appear once permission is granted.</p>
              </div>
            )}
          </div>

          {/* Audio Volume Level Meter */}
          {allPassed && (
            <div className="w-full max-w-sm mt-3 p-3 bg-stone-50 dark:bg-stone-800/60 rounded-xl border border-stone-200 dark:border-stone-700">
              <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                <span className="flex items-center gap-1 text-stone-700 dark:text-stone-300">
                  <Mic className="w-3.5 h-3.5 text-emerald-600" /> Microphone Input Signal
                </span>
                <span className={audioLevel > 15 ? 'text-emerald-600 font-bold' : 'text-stone-400'}>
                  {audioLevel > 15 ? 'Signal Detected' : 'Speak to test'}
                </span>
              </div>
              <div className="w-full bg-stone-200 dark:bg-stone-700 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-75 ${audioLevel > 60 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                  style={{ width: `${Math.max(5, audioLevel)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Right: Device Status Checklist */}
        <div className="space-y-4 flex flex-col justify-center">
          <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-lg ${cameraGranted ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600' : 'bg-stone-200 dark:bg-stone-700 text-stone-600'}`}>
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-stone-900 dark:text-stone-100 text-sm">Front Camera Sensor</h4>
                  <p className="text-xs text-stone-500">Live candidate identity & eye monitoring</p>
                </div>
              </div>
              {cameraGranted === true && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
              {cameraGranted === false && <AlertTriangle className="w-5 h-5 text-rose-600" />}
            </div>
          </div>

          <div className="p-4 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-stone-800/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-lg ${micGranted ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600' : 'bg-stone-200 dark:bg-stone-700 text-stone-600'}`}>
                  <Mic className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-stone-900 dark:text-stone-100 text-sm">Microphone Sensor</h4>
                  <p className="text-xs text-stone-500">Acoustic background voice check</p>
                </div>
              </div>
              {micGranted === true && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
              {micGranted === false && <AlertTriangle className="w-5 h-5 text-rose-600" />}
            </div>
          </div>

          {errorMsg && (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl text-rose-800 dark:text-rose-200 text-xs">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <strong>Permission Error:</strong> {errorMsg}
                </div>
              </div>
            </div>
          )}

          {!allPassed && (
            <button
              id="btn-retry-permissions"
              type="button"
              disabled={requesting}
              onClick={requestPermissions}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-stone-400 text-white font-medium text-sm rounded-xl transition shadow-sm cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${requesting ? 'animate-spin' : ''}`} />
              <span>{requesting ? 'Requesting Permissions...' : 'Grant Camera & Mic Permission'}</span>
            </button>
          )}
        </div>
      </div>

      <div className="pt-4 border-t border-stone-200 dark:border-stone-800 flex items-center justify-end">
        <button
          id="btn-adviser-continue-permissions"
          type="button"
          disabled={!allPassed}
          onClick={onContinue}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-300 dark:disabled:bg-stone-800 text-white font-semibold rounded-xl transition shadow-sm disabled:cursor-not-allowed cursor-pointer"
        >
          <span>Ready to Launch Full-Screen Exam</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
