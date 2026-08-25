import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, Volume2, VolumeX, Square, RefreshCw, Send, Sparkles, X, ArrowRight, UserCheck, MessageSquare, PhoneCall } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { FarmerChatbotResponse } from '../../types';
import { farmerAdviserService } from '../../services/farmerAdviserService';

interface FarmerVoiceAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  onConnectAdviser: () => void;
  cropName?: string;
  soilMoisture?: number | string;
  weatherSummary?: string;
}

type VoiceState = 'idle' | 'listening' | 'thinking' | 'speaking';

export const FarmerVoiceAssistant: React.FC<FarmerVoiceAssistantProps> = ({
  isOpen,
  onClose,
  onConnectAdviser,
  cropName = 'Wheat',
  soilMoisture = '28%',
  weatherSummary = '28°C, Partly Cloudy',
}) => {
  const { language } = useLanguage();
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const [queryText, setQueryText] = useState('');
  const [activeResponse, setActiveResponse] = useState<FarmerChatbotResponse | null>({
    answer: language === 'hi' ? 'नमस्ते! मैं क्रोपरएक्स हूँ।' : 'Hello! I am CroperX.',
    reason: language === 'hi' ? 'आप अपनी फसल या सिंचाई के बारे में कुछ भी पूछ सकते हैं।' : 'You can ask any question about your crop, water, or weather.',
    action: language === 'hi' ? 'माइक दबाकर बोलें या नीचे दिए गए प्रश्नों को चुनें।' : 'Tap the microphone or choose a quick question below.',
    timing: language === 'hi' ? 'अभी' : 'Now',
  });
  const [history, setHistory] = useState<Array<{ q: string; a: FarmerChatbotResponse }>>([]);
  const [isMuted, setIsMuted] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Quick Questions
  const quickQuestions = language === 'hi'
    ? [
        { label: '🌾 आज मुझे क्या करना चाहिए?', q: 'What should I do today?' },
        { label: '💧 क्या मुझे पानी देना चाहिए?', q: 'Should I water my crop?' },
        { label: '🌧️ क्या बारिश आने वाली है?', q: 'Is rain coming?' },
        { label: '🌿 क्या मेरी फसल स्वस्थ है?', q: 'Is my crop healthy?' },
        { label: '👨‍🌾 कृषि सलाहकार से बात करें', q: 'Talk to my adviser', isAdviserAction: true },
      ]
    : [
        { label: '🌾 What should I do today?', q: 'What should I do today?' },
        { label: '💧 Should I water?', q: 'Should I water my crop?' },
        { label: '🌧️ Is rain coming?', q: 'Is rain coming?' },
        { label: '🌿 Is my crop healthy?', q: 'Is my crop healthy?' },
        { label: '👨‍🌾 Talk to my adviser', q: 'Talk to my adviser', isAdviserAction: true },
      ];

  // Speech Recognition Setup
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recog = new SpeechRecognition();
        recog.continuous = false;
        recog.interimResults = false;
        recog.lang = language === 'hi' ? 'hi-IN' : 'en-US';

        recog.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setQueryText(transcript);
          handleAskQuestion(transcript);
        };

        recog.onerror = () => {
          setVoiceState('idle');
        };

        recog.onend = () => {
          if (voiceState === 'listening') {
            setVoiceState('idle');
          }
        };

        recognitionRef.current = recog;
      }
    }

    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [language]);

  // Voice synthesis speaker
  const speakText = (text: string) => {
    if (isMuted) return;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'hi' ? 'hi-IN' : 'en-US';
      utterance.rate = 0.95;

      utterance.onstart = () => setVoiceState('speaking');
      utterance.onend = () => setVoiceState('idle');
      utterance.onerror = () => setVoiceState('idle');

      window.speechSynthesis.speak(utterance);
    }
  };

  const handleToggleListening = () => {
    if (voiceState === 'speaking') {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      setVoiceState('idle');
      return;
    }

    if (voiceState === 'listening') {
      try {
        recognitionRef.current?.stop();
      } catch {}
      setVoiceState('idle');
      return;
    }

    // Start listening
    setVoiceState('listening');
    try {
      recognitionRef.current?.start();
    } catch {
      // Fallback
      setTimeout(() => {
        setVoiceState('idle');
      }, 4000);
    }
  };

  const handleAskQuestion = async (query: string) => {
    if (!query.trim()) return;

    // Check if user asked for adviser directly
    if (query.toLowerCase().includes('adviser') || query.toLowerCase().includes('सलाहकार')) {
      onConnectAdviser();
      onClose();
      return;
    }

    setVoiceState('thinking');
    try {
      const response = await farmerAdviserService.askCroperXFarmer({
        query,
        language,
        cropName,
        soilMoisture: typeof soilMoisture === 'number' ? `${soilMoisture}%` : soilMoisture,
        weatherSummary,
      });

      setActiveResponse(response);
      setHistory((prev) => [{ q: query, a: response }, ...prev.slice(0, 5)]);

      const speakable = `${response.answer} ${response.reason} ${response.action} ${response.timing}`;
      speakText(response.audioText || speakable);
    } catch (e) {
      setVoiceState('idle');
    }
  };

  const handleStopSpeaking = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setVoiceState('idle');
  };

  const handleReplayAudio = () => {
    if (activeResponse) {
      const speakable = `${activeResponse.answer} ${activeResponse.reason} ${activeResponse.action} ${activeResponse.timing}`;
      speakText(activeResponse.audioText || speakable);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-md"
        />

        {/* Assistant Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10 my-6"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-5 sm:p-6 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl shadow-inner">
                🌾
              </div>
              <div>
                <h3 className="text-xl font-bold tracking-tight">
                  {language === 'hi' ? 'क्रोपरएक्स से पूछें' : 'Ask CroperX'}
                </h3>
                <p className="text-xs text-emerald-100/90 font-medium">
                  {language === 'hi' ? 'सरल आवाज सहायक' : 'Voice-First Farm Assistant'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 sm:p-6 space-y-6">
            {/* Massive Voice Microphone Interactive Button */}
            <div className="flex flex-col items-center justify-center py-2 space-y-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleToggleListening}
                className={`relative w-28 h-28 sm:w-32 sm:h-32 rounded-full flex flex-col items-center justify-center text-white shadow-2xl transition-all cursor-pointer ${
                  voiceState === 'listening'
                    ? 'bg-rose-600 shadow-rose-500/50 animate-pulse'
                    : voiceState === 'thinking'
                    ? 'bg-amber-600 shadow-amber-500/50'
                    : voiceState === 'speaking'
                    ? 'bg-blue-600 shadow-blue-500/50'
                    : 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/40'
                }`}
                aria-label="Toggle Voice Input"
              >
                {voiceState === 'listening' ? (
                  <>
                    <Mic className="w-12 h-12 sm:w-14 sm:h-14 animate-bounce" />
                    <span className="text-[10px] uppercase font-bold tracking-wider mt-1">Listening</span>
                  </>
                ) : voiceState === 'thinking' ? (
                  <>
                    <RefreshCw className="w-10 h-10 sm:w-12 sm:h-12 animate-spin" />
                    <span className="text-[10px] uppercase font-bold tracking-wider mt-1">Checking</span>
                  </>
                ) : voiceState === 'speaking' ? (
                  <>
                    <Volume2 className="w-12 h-12 sm:w-14 sm:h-14 animate-pulse" />
                    <span className="text-[10px] uppercase font-bold tracking-wider mt-1">Speaking</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-12 h-12 sm:w-14 sm:h-14" />
                    <span className="text-[11px] uppercase font-bold tracking-wider mt-1">Tap To Talk</span>
                  </>
                )}
              </motion.button>

              {/* Status Banner */}
              <div className="text-center font-medium text-sm text-slate-700 dark:text-slate-200">
                {voiceState === 'idle' && (language === 'hi' ? '🎙️ बोलने के लिए माइक पर टैप करें' : '🎙️ Tap mic to speak')}
                {voiceState === 'listening' && (language === 'hi' ? '👂 मैं सुन रहा हूँ...' : "👂 I'm listening...")}
                {voiceState === 'thinking' && (language === 'hi' ? '🧠 आपके खेत की जांच हो रही है...' : '🧠 Checking your farm...')}
                {voiceState === 'speaking' && (language === 'hi' ? '🔊 क्रोपरएक्स बोल रहा है...' : '🔊 CroperX is speaking...')}
              </div>

              {/* Control Buttons (Stop / Replay / Mute) */}
              <div className="flex items-center gap-2 pt-1">
                {voiceState === 'speaking' && (
                  <button
                    onClick={handleStopSpeaking}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-200 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-300 transition-all"
                  >
                    <Square className="w-3.5 h-3.5 fill-current" />
                    <span>Stop</span>
                  </button>
                )}
                {activeResponse && (
                  <button
                    onClick={handleReplayAudio}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-200 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-300 transition-all"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Replay Voice</span>
                  </button>
                )}
                <button
                  onClick={() => setIsMuted((m) => !m)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    isMuted
                      ? 'bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                  }`}
                >
                  {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                  <span>{isMuted ? 'Muted' : 'Sound On'}</span>
                </button>
              </div>
            </div>

            {/* 4-Part Response Card */}
            {activeResponse && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-emerald-50/70 dark:bg-slate-800/80 border-2 border-emerald-500/30 rounded-3xl p-5 space-y-3.5 shadow-md"
              >
                {/* 1. Answer */}
                <div className="flex items-start gap-2.5">
                  <span className="text-xl">✅</span>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 block">
                      {language === 'hi' ? 'उत्तर' : 'Answer'}
                    </span>
                    <p className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                      {activeResponse.answer}
                    </p>
                  </div>
                </div>

                {/* 2. Reason */}
                <div className="flex items-start gap-2.5 pt-2 border-t border-emerald-200/60 dark:border-slate-700/60">
                  <span className="text-xl">💡</span>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                      {language === 'hi' ? 'कारण' : 'Why'}
                    </span>
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mt-0.5">
                      {activeResponse.reason}
                    </p>
                  </div>
                </div>

                {/* 3. Action */}
                <div className="flex items-start gap-2.5 pt-2 border-t border-emerald-200/60 dark:border-slate-700/60">
                  <span className="text-xl">👉</span>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 block">
                      {language === 'hi' ? 'क्या करें' : 'What You Should Do'}
                    </span>
                    <p className="text-sm font-semibold text-emerald-950 dark:text-emerald-200 mt-0.5">
                      {activeResponse.action}
                    </p>
                  </div>
                </div>

                {/* 4. Timing */}
                <div className="flex items-start gap-2.5 pt-2 border-t border-emerald-200/60 dark:border-slate-700/60">
                  <span className="text-xl">⏰</span>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                      {language === 'hi' ? 'कब करें' : 'When'}
                    </span>
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
                      {activeResponse.timing}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Quick Questions Horizontal Scroll / Grid */}
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-2.5">
                {language === 'hi' ? 'जल्दी पूछे जाने वाले प्रश्न' : 'Quick Questions'}
              </span>
              <div className="flex flex-wrap gap-2">
                {quickQuestions.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      if (item.isAdviserAction) {
                        onConnectAdviser();
                        onClose();
                      } else {
                        setQueryText(item.q);
                        handleAskQuestion(item.q);
                      }
                    }}
                    className={`px-3.5 py-2 rounded-2xl text-xs font-semibold border transition-all text-left flex items-center gap-1.5 ${
                      item.isAdviserAction
                        ? 'bg-blue-50 dark:bg-blue-950/30 border-blue-400 text-blue-700 dark:text-blue-300 hover:bg-blue-100'
                        : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50'
                    }`}
                  >
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Text Input Option */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAskQuestion(queryText);
              }}
              className="flex items-center gap-2 pt-1"
            >
              <input
                type="text"
                value={queryText}
                onChange={(e) => setQueryText(e.target.value)}
                placeholder={
                  language === 'hi'
                    ? 'या यहाँ सवाल टाइप करें...'
                    : 'Or type your question here...'
                }
                className="flex-1 px-4 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="submit"
                disabled={!queryText.trim() || voiceState === 'thinking'}
                className="p-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white transition-all disabled:opacity-40"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
