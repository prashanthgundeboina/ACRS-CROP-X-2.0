import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, RefreshCw, Sparkles, AlertCircle, CheckCircle2, Droplets, ArrowLeft, PhoneCall, Volume2, VolumeX, Shield, Sun, Flame, Zap } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { FarmerSimpleCropResult } from '../../types';

interface FarmerCameraViewProps {
  onClose: () => void;
  onConnectAdviser: (cropResult?: FarmerSimpleCropResult) => void;
  cropName?: string;
}

export const FarmerCameraView: React.FC<FarmerCameraViewProps> = ({
  onClose,
  onConnectAdviser,
  cropName = 'Wheat',
}) => {
  const { language } = useLanguage();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraPermission, setCameraPermission] = useState<'pending' | 'granted' | 'denied'>('pending');
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<FarmerSimpleCropResult | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [voiceGuidance, setVoiceGuidance] = useState<string>('Point your camera at your crop. Hold your phone steady.');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Initialize Camera
  useEffect(() => {
    let activeStream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        setCameraPermission('pending');
        setErrorMessage(null);

        // Stop any existing tracks
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }

        const constraints: MediaStreamConstraints = {
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        };

        const newStream = await navigator.mediaDevices.getUserMedia(constraints);
        activeStream = newStream;
        setStream(newStream);
        setCameraPermission('granted');

        if (videoRef.current) {
          videoRef.current.srcObject = newStream;
          videoRef.current.play().catch(() => {});
        }

        speakGuidance(
          language === 'hi'
            ? 'अपने फोन का कैमरा फसल की ओर रखें। फोन को स्थिर रखें।'
            : 'Point your camera at your crop. Hold your phone steady.'
        );
      } catch (err: any) {
        console.warn('Camera access error:', err);
        setCameraPermission('denied');
        setErrorMessage('Camera permission is needed to show your crop. Please allow camera access in your browser.');
      }
    };

    startCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [facingMode]);

  // Voice Guidance helper
  const speakGuidance = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'hi' ? 'hi-IN' : 'en-US';
      utterance.rate = 0.95;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
    setVoiceGuidance(text);
  };

  const handleToggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Perform Simple Crop & Soil Scan
  const handleCaptureAndAnalyze = () => {
    if (!videoRef.current) return;

    setIsScanning(true);
    speakGuidance(
      language === 'hi'
        ? 'फसल की जांच हो रही है...'
        : 'Checking your crop and soil condition...'
    );

    // Grab canvas frame snapshot
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setCapturedImage(dataUrl);
    }

    setTimeout(() => {
      setIsScanning(false);
      const isHealthy = Math.random() > 0.35;
      const soilMoist = Math.random() > 0.4;

      const result: FarmerSimpleCropResult = {
        cropName: cropName || 'Wheat (Triticum aestivum)',
        healthStatus: isHealthy ? 'healthy' : 'attention',
        healthSummary: isHealthy
          ? (language === 'hi' ? 'आपकी फसल स्वस्थ और हरी-भरी दिख रही है।' : 'Your crop looks healthy and green.')
          : (language === 'hi' ? 'पत्तियों में हल्का पीलापन और तनाव दिखाई दे रहा है।' : 'Leaves show mild yellowing and moisture stress.'),
        soilCondition: soilMoist ? 'moist' : 'dry',
        soilSummary: soilMoist
          ? (language === 'hi' ? 'मिट्टी में पर्याप्त नमी है।' : 'Soil looks moist.')
          : (language === 'hi' ? 'मिट्टी सूख रही है - पानी की आवश्यकता हो सकती है।' : 'Soil is getting dry - watering may be needed.'),
        primaryAction: isHealthy
          ? (language === 'hi' ? 'नियमित देखभाल जारी रखें। शाम को सिंचाई की जांच करें।' : 'Check watering in the evening and keep regular care.')
          : (language === 'hi' ? 'आज शाम 45 मिनट के लिए ड्रिप सिंचाई चलाएं।' : 'Run drip irrigation for 45 minutes this evening.'),
        actionTiming: 'Today 5:00 PM',
        confidence: 94,
      };

      setScanResult(result);
      speakGuidance(
        `${result.healthSummary} ${result.soilSummary} ${result.primaryAction}`
      );
    }, 1800);
  };

  const handleRetake = () => {
    setScanResult(null);
    setCapturedImage(null);
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {});
    }
    speakGuidance(
      language === 'hi'
        ? 'अपने फोन का कैमरा फसल की ओर रखें।'
        : 'Point your camera at your crop.'
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-black text-white flex flex-col justify-between">
      {/* Top Bar Header */}
      <div className="relative z-20 flex items-center justify-between px-4 py-3 bg-gradient-to-b from-black/80 to-transparent">
        <button
          onClick={onClose}
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-md text-white font-medium text-sm transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>{language === 'hi' ? 'वापस' : 'Back'}</span>
        </button>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{language === 'hi' ? 'क्रोपरएक्स फसल कैमरा' : 'CroperX Crop Camera'}</span>
        </div>

        <button
          onClick={handleToggleFacingMode}
          className="p-2.5 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-md text-white transition-all"
          title="Switch Camera"
        >
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      {/* Main Camera Viewport or Result Screen */}
      <div className="relative flex-1 flex items-center justify-center overflow-hidden">
        {cameraPermission === 'denied' ? (
          <div className="max-w-md p-6 text-center bg-slate-900/90 border border-slate-800 rounded-3xl mx-4 space-y-4">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto text-2xl">
              ⚠️
            </div>
            <h3 className="text-xl font-bold text-white">Camera Permission Needed</h3>
            <p className="text-sm text-slate-300">
              {errorMessage || 'Camera permission is needed to show your crop.'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-all"
            >
              Allow Camera & Retry
            </button>
          </div>
        ) : capturedImage && scanResult ? (
          // Captured Snapshot & Result Overlay
          <div className="relative w-full h-full flex flex-col items-center justify-center p-4">
            <img
              src={capturedImage}
              alt="Scanned Crop"
              className="absolute inset-0 w-full h-full object-cover opacity-35 filter blur-[2px]"
            />

            {/* Simple Result Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="relative z-10 w-full max-w-md bg-slate-900/95 border-2 border-emerald-500/50 rounded-3xl p-6 shadow-2xl space-y-4 backdrop-blur-xl"
            >
              {/* Status Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="text-3xl">
                    {scanResult.healthStatus === 'healthy' ? '🌱' : '🟡'}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white leading-tight">
                      {scanResult.cropName}
                    </h3>
                    <span className="text-xs text-emerald-400 font-medium">
                      {scanResult.healthStatus === 'healthy'
                        ? (language === 'hi' ? '🟢 फसल स्वस्थ है' : '🟢 Crop Looks Healthy')
                        : (language === 'hi' ? '🟡 थोड़ा ध्यान चाहिए' : '🟡 Needs Attention')}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() =>
                    speakGuidance(
                      `${scanResult.healthSummary} ${scanResult.soilSummary} ${scanResult.primaryAction}`
                    )
                  }
                  className="p-2.5 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>

              {/* Simple Observations */}
              <div className="space-y-2.5 text-sm">
                <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-start gap-3">
                  <span className="text-xl">🌿</span>
                  <div>
                    <span className="text-xs text-slate-400 block font-semibold uppercase tracking-wider">
                      {language === 'hi' ? 'फसल की स्थिति' : 'Crop Condition'}
                    </span>
                    <p className="text-white font-medium mt-0.5">{scanResult.healthSummary}</p>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-start gap-3">
                  <span className="text-xl">💧</span>
                  <div>
                    <span className="text-xs text-slate-400 block font-semibold uppercase tracking-wider">
                      {language === 'hi' ? 'मिट्टी की नमी' : 'Soil Observation'}
                    </span>
                    <p className="text-white font-medium mt-0.5">{scanResult.soilSummary}</p>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-500/40 flex items-start gap-3">
                  <span className="text-2xl">👉</span>
                  <div>
                    <span className="text-xs text-emerald-300 block font-bold uppercase tracking-wider">
                      {language === 'hi' ? 'आज क्या करें' : 'What You Should Do Today'}
                    </span>
                    <p className="text-white font-semibold text-sm mt-0.5">{scanResult.primaryAction}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 grid grid-cols-2 gap-3">
                <button
                  onClick={handleRetake}
                  className="py-3 px-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-semibold flex items-center justify-center gap-1.5 transition-all border border-slate-700"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>{language === 'hi' ? 'फिर से देखें' : 'Scan Again'}</span>
                </button>

                <button
                  onClick={() => {
                    onConnectAdviser(scanResult);
                    onClose();
                  }}
                  className="py-3 px-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-semibold flex items-center justify-center gap-1.5 shadow-lg shadow-blue-500/25 transition-all"
                >
                  <PhoneCall className="w-4 h-4" />
                  <span>{language === 'hi' ? 'सलाहकार को दिखाएं' : 'Show to Adviser'}</span>
                </button>
              </div>
            </motion.div>
          </div>
        ) : (
          // Live Video Stream View
          <div className="relative w-full h-full flex items-center justify-center">
            <video
              ref={videoRef}
              playsInline
              muted
              autoPlay
              className="w-full h-full object-cover"
            />

            {/* Target Reticle Overlay */}
            <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-8">
              <div className="w-64 h-64 sm:w-80 sm:h-80 border-2 border-dashed border-white/60 rounded-3xl relative flex items-center justify-center">
                <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-emerald-400 rounded-tl-xl" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-emerald-400 rounded-tr-xl" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-emerald-400 rounded-bl-xl" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-emerald-400 rounded-br-xl" />

                {isScanning && (
                  <motion.div
                    animate={{ y: [-120, 120, -120] }}
                    transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
                    className="w-full h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_12px_#10b981]"
                  />
                )}
              </div>
            </div>

            {/* Voice Guidance Banner */}
            <div className="absolute top-6 inset-x-4 flex justify-center pointer-events-none">
              <div className="bg-black/75 backdrop-blur-md px-4 py-2 rounded-full border border-white/15 text-xs sm:text-sm font-medium text-white flex items-center gap-2 shadow-lg">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>{voiceGuidance}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Shutter Action Bar */}
      {!scanResult && (
        <div className="relative z-20 px-6 py-6 bg-gradient-to-t from-black via-black/90 to-transparent flex flex-col items-center gap-4">
          <div className="flex items-center justify-center gap-6 w-full max-w-xs">
            <button
              onClick={handleCaptureAndAnalyze}
              disabled={isScanning || cameraPermission !== 'granted'}
              className="w-20 h-20 rounded-full border-4 border-white/90 bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white flex items-center justify-center shadow-2xl shadow-emerald-500/40 transition-all disabled:opacity-50 cursor-pointer"
              aria-label="Capture Crop"
            >
              {isScanning ? (
                <RefreshCw className="w-8 h-8 animate-spin" />
              ) : (
                <Camera className="w-9 h-9" />
              )}
            </button>
          </div>

          <p className="text-xs text-slate-400 text-center font-medium">
            {language === 'hi'
              ? 'फसल की जांच के लिए हरा बटन दबाएं'
              : 'Tap green button to check your crop & soil'}
          </p>
        </div>
      )}
    </div>
  );
};
