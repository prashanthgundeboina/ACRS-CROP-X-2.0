import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Mic, MicOff, Languages, Bot, Sparkles, PhoneCall, Compass, History, Radio, ChevronDown, ChevronUp, ArrowRight, Play, X, Sliders, Settings, HelpCircle, Flame, Smile, ShieldAlert, Zap, MessageSquare, Activity, Waves } from 'lucide-react';
import { SUPPORTED_LANGUAGES, getTranslation, generateCroperXExplanationText, LanguageOption } from '../utils/i18n';
import { SoilData, CropRecommendation } from '../types';
import { CroperXCallModal } from './CroperXCallModal';
import { CroperXGuidedTour } from './CroperXGuidedTour';
import { CroperXVoiceHistoryLog, TranscriptEntry } from './CroperXVoiceHistoryLog';

export interface CommandHistoryItem {
  id: string;
  time: string;
  rawVoiceQuery: string;
  interpretedAction: string;
  targetTab?: string;
  languageCode: string;
  status: 'executed' | 'understood';
}

export type AgentTone = 'friendly' | 'professional' | 'enthusiastic';

interface QuickCommandItem {
  id: string;
  category: 'soil' | 'crop' | 'fertilizer' | 'weather' | 'pest';
  queryText: string;
  nativeQuery: Record<string, string>;
  targetTab: string;
}

const QUICK_COMMANDS: QuickCommandItem[] = [
  {
    id: 'cmd_1',
    category: 'crop',
    queryText: 'What are the best crops for my soil NPK values?',
    nativeQuery: {
      en: 'What are the best crops for my soil NPK values?',
      hi: 'मेरी मिट्टी के NPK मान के लिए सबसे अच्छी फसलें कौन सी हैं?',
      pa: 'ਮੇਰੀ ਮਿੱਟੀ ਦੇ NPK ਮੁੱਲਾਂ ਲਈ ਸਭ ਤੋਂ ਵਧੀਆ ਫਸਲਾਂ ਕਿਹੜੀਆਂ ਹਨ?',
      te: 'నా నేల NPK విలువలకి ఏ పంటలు ఉత్తమం?'
    },
    targetTab: 'recommendation'
  },
  {
    id: 'cmd_2',
    category: 'fertilizer',
    queryText: 'Calculate Urea and DAP fertilizer dosage for my farm',
    nativeQuery: {
      en: 'Calculate Urea and DAP fertilizer dosage for my farm',
      hi: 'मेरे खेत के लिए यूरिया और डीएपी खाद की मात्रा की गणना करें',
      pa: 'ਮੇਰੇ ਖੇਤ ਲਈ ਯੂਰੀਆ ਅਤੇ ਡੀ.ਏ.ਪੀ. ਖਾਦ ਦੀ ਖੁਰਾਕ ਦੀ ਗਣਨਾ ਕਰੋ',
      te: 'నా పొలానికి యూరియా మరియు DAP ఎరువుల మోతాదును లెక్కించండి'
    },
    targetTab: 'fertilizer'
  },
  {
    id: 'cmd_3',
    category: 'weather',
    queryText: 'Show rainfall forecast and weather alerts',
    nativeQuery: {
      en: 'Show rainfall forecast and weather alerts',
      hi: 'मौसम का पूर्वानुमान और बारिश की चेतावनी दिखाएं',
      pa: 'ਮੌਸਮ ਦੀ ਭਵਿੱਖਬਾਣੀ ਅਤੇ ਬਾਰਿਸ਼ ਦੀਆਂ ਚੇਤਾਵਨੀਆਂ ਦਿਖਾਓ',
      te: 'వర్షపాతం అంచనా మరియు వాతావరణ హెచ్చరికలను చూపించు'
    },
    targetTab: 'weather'
  },
  {
    id: 'cmd_4',
    category: 'pest',
    queryText: 'Diagnose leaf yellowing and crop diseases',
    nativeQuery: {
      en: 'Diagnose leaf yellowing and crop diseases',
      hi: 'पत्तियों के पीलेपन और फसल की बीमारियों का निदान करें',
      pa: 'ਪੱਤਿਆਂ ਦੇ ਪੀਲੇਪਣ ਅਤੇ ਫਸਲਾਂ ਦੀਆਂ ਬਿਮਾਰੀਆਂ ਦਾ ਇਲਾਜ ਲੱਭੋ',
      te: 'ఆకులు పసుపు రంగులోకి మారడం మరియు తెగుళ్ల సమస్యలను విశ్లేషించండి'
    },
    targetTab: 'diagnostics'
  },
  {
    id: 'cmd_5',
    category: 'soil',
    queryText: 'Explain my soil pH and organic matter health',
    nativeQuery: {
      en: 'Explain my soil pH and organic matter health',
      hi: 'मेरी मिट्टी के pH और जैविक पदार्थ के स्वास्थ्य के बारे में बताएं',
      pa: 'ਮੇਰੀ ਮਿੱਟੀ ਦੇ pH ਅਤੇ ਜੈਵਿਕ ਮਾਦੇ ਬਾਰੇ ਸਮਝਾਓ',
      te: 'నా నేల pH మరియు సేంద్రీయ పదార్థం గురించి వివరించండి'
    },
    targetTab: 'recommendation'
  }
];

interface Props {
  currentLanguage: string;
  onLanguageChange: (langCode: string) => void;
  soilData: SoilData;
  cropRecommendations?: CropRecommendation[] | null;
  environmentalInsight?: string | null;
  onVoiceCommandQuery?: (query: string) => void;
  onNavigateTab?: (tab: string) => void;
}

export const CroperXHeaderAgent: React.FC<Props> = ({
  currentLanguage,
  onLanguageChange,
  soilData,
  cropRecommendations,
  environmentalInsight,
  onVoiceCommandQuery,
  onNavigateTab
}) => {
  // Speech & Voice States
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);

  // Personality & Noise Settings
  const [agentTone, setAgentTone] = useState<AgentTone>('friendly');
  const [micSensitivity, setMicSensitivity] = useState<number>(75); // 1-100 sensitivity threshold
  const [showVoiceSettings, setShowVoiceSettings] = useState<boolean>(false);
  const [showQuickHelp, setShowQuickHelp] = useState<boolean>(false);

  // Pitch & Rate mapping based on selected personality tone
  const getPitchRate = () => {
    switch (agentTone) {
      case 'professional':
        return { pitch: 0.95, rate: 0.92 };
      case 'enthusiastic':
        return { pitch: 1.15, rate: 1.05 };
      case 'friendly':
      default:
        return { pitch: 1.05, rate: 0.98 };
    }
  };

  // Real-time Sentence Highlighting Transcript States
  const [activeFullText, setActiveFullText] = useState<string>('');
  const [activeSentences, setActiveSentences] = useState<string[]>([]);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState<number>(-1);
  const [isTranscriptExpanded, setIsTranscriptExpanded] = useState<boolean>(true);

  // Command History State (Last 10 commands)
  const [commandHistory, setCommandHistory] = useState<CommandHistoryItem[]>([]);
  const [isCmdHistoryExpanded, setIsCmdHistoryExpanded] = useState<boolean>(false);

  // Modals & Drawers
  const [isCallOpen, setIsCallOpen] = useState<boolean>(false);
  const [isTourOpen, setIsTourOpen] = useState<boolean>(false);
  const [transcriptLogs, setTranscriptLogs] = useState<TranscriptEntry[]>([]);

  const t = getTranslation(currentLanguage);
  const activeLangObj = SUPPORTED_LANGUAGES.find(l => l.code === currentLanguage) || SUPPORTED_LANGUAGES[0];

  const synthRef = useRef<SpeechSynthesis | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }

    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = activeLangObj.speechLang;

        rec.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setIsListening(false);
          processUserQuery(transcript);
        };

        rec.onerror = (event: any) => {
          console.warn("Speech recognition error:", event.error);
          setIsListening(false);
        };

        rec.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = rec;
      }
    }

    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, [currentLanguage, activeLangObj, soilData, cropRecommendations, agentTone]);

  const processUserQuery = (queryText: string) => {
    // Determine interpreted action and tab navigation
    let interpretedAction = `Analyzed soil telemetry for query "${queryText}"`;
    let targetTab = '';
    const lower = queryText.toLowerCase();

    if (lower.includes("weather") || lower.includes("rain") || lower.includes("forecast") || lower.includes("monsoon") || lower.includes("barish")) {
      interpretedAction = "Opened Weather & Predictive Alerts Dashboard";
      targetTab = 'weather';
    } else if (lower.includes("fertilizer") || lower.includes("urea") || lower.includes("dap") || lower.includes("mop") || lower.includes("khad")) {
      interpretedAction = "Opened Fertilizer NPK Dosage Calculator";
      targetTab = 'fertilizer';
    } else if (lower.includes("disease") || lower.includes("health") || lower.includes("pest") || lower.includes("b बीमारी") || lower.includes("kida")) {
      interpretedAction = "Opened Leaf Health & Pest AI Diagnostics";
      targetTab = 'diagnostics';
    } else if (lower.includes("predict") || lower.includes("crop") || lower.includes("recommend") || lower.includes("fasal")) {
      interpretedAction = "Triggered Machine Learning Crop Recommendation";
      targetTab = 'recommendation';
    } else if (lower.includes("ph") || lower.includes("nitrogen") || lower.includes("soil")) {
      interpretedAction = "Analyzed Soil Chemistry & Telemetry";
      targetTab = 'recommendation';
    }

    if (targetTab && onNavigateTab) {
      onNavigateTab(targetTab);
    }

    // Add to last 10 Command History
    const cmdItem: CommandHistoryItem = {
      id: Date.now().toString(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      rawVoiceQuery: queryText,
      interpretedAction,
      targetTab,
      languageCode: currentLanguage,
      status: 'executed'
    };

    setCommandHistory(prev => [cmdItem, ...prev].slice(0, 10));

    // Log in transcript
    const prefix = agentTone === 'enthusiastic' ? "Great question farmer friend! " : agentTone === 'professional' ? "Agronomic Analysis: " : "Hello! ";
    const defaultReply = `${prefix}I processed "${queryText}". ${interpretedAction}. Top recommended crop for your farm is ${cropRecommendations?.[0]?.crop || 'Rice/Wheat'}.`;
    
    addTranscriptLog(queryText, defaultReply);

    if (onVoiceCommandQuery) {
      onVoiceCommandQuery(queryText);
    }

    // Vocalize confirmation
    speakText(`${prefix}I understood: ${queryText}. ${interpretedAction}.`);
  };

  const addTranscriptLog = (query: string, reply: string) => {
    const newEntry: TranscriptEntry = {
      id: Date.now().toString(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      userQuery: query,
      aiResponse: reply,
      languageCode: currentLanguage
    };
    setTranscriptLogs(prev => [newEntry, ...prev]);
  };

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
    }
    setIsSpeaking(false);
    setCurrentSentenceIndex(-1);
  };

  // Speak sentence-by-sentence for real-time highlighting
  const speakText = (fullText: string) => {
    if (!synthRef.current) return;

    synthRef.current.cancel();
    setActiveFullText(fullText);

    // Split text into sentences for sentence-level highlighting
    const rawSentences = fullText.match(/[^.!?\n]+[.!?\n]+/g) || [fullText];
    const sentences = rawSentences.map(s => s.trim()).filter(Boolean);

    if (sentences.length === 0) {
      sentences.push(fullText);
    }

    setActiveSentences(sentences);
    setCurrentSentenceIndex(-1);

    if (isMuted) {
      setIsSpeaking(false);
      return;
    }

    speakSentenceAtIndex(0, sentences);
  };

  const speakSentenceAtIndex = (index: number, sentenceList: string[]) => {
    if (!synthRef.current || index >= sentenceList.length || isMuted) {
      if (index >= sentenceList.length) {
        setIsSpeaking(false);
        setCurrentSentenceIndex(-1);
      }
      return;
    }

    synthRef.current.cancel();
    setCurrentSentenceIndex(index);
    setIsSpeaking(true);

    const utterance = new SpeechSynthesisUtterance(sentenceList[index]);
    utterance.lang = activeLangObj.speechLang;

    const { pitch, rate } = getPitchRate();
    utterance.pitch = pitch;
    utterance.rate = rate;

    const voices = synthRef.current.getVoices();
    const matchedVoice = voices.find(v => v.lang.startsWith(activeLangObj.code) || v.lang.includes(activeLangObj.code));
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onend = () => {
      if (index + 1 < sentenceList.length) {
        speakSentenceAtIndex(index + 1, sentenceList);
      } else {
        setIsSpeaking(false);
        setCurrentSentenceIndex(-1);
      }
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setCurrentSentenceIndex(-1);
    };

    synthRef.current.speak(utterance);
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    if (nextMuted) {
      stopSpeaking();
    } else if (activeSentences.length > 0) {
      speakSentenceAtIndex(0, activeSentences);
    }
  };

  const explainCropRecommendationWithCroperX = () => {
    if (!cropRecommendations || cropRecommendations.length === 0) {
      const noResultsMsg = currentLanguage === 'hi'
        ? "कृपया पहले पूर्वानुमान मॉडल चलाएं ताकि क्रोपरएक्स आपकी मिट्टी के लिए फसल सिफारिश दे सके।"
        : "Please run the prediction model first so CroperX can explain crop recommendations for your soil telemetry.";
      speakText(noResultsMsg);
      return;
    }

    const topRec = cropRecommendations[0];
    const allCropNames = cropRecommendations.map(r => r.crop);

    let explanation = generateCroperXExplanationText(
      currentLanguage,
      topRec.crop,
      topRec.confidence,
      soilData?.nitrogen ?? 90,
      soilData?.ph ?? 6.5,
      soilData?.temperature ?? 25,
      soilData?.rainfall ?? 150,
      allCropNames
    );

    if (agentTone === 'enthusiastic') {
      explanation = "🌾 Excellent farming news! " + explanation + " Happy harvesting!";
    } else if (agentTone === 'professional') {
      explanation = "Agronomist Assessment: " + explanation;
    }

    speakText(explanation);
    addTranscriptLog("Explain crop recommendation in " + activeLangObj.name, explanation);
  };

  const toggleMicListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
    } else {
      stopSpeaking();
      if (recognitionRef.current) {
        try {
          recognitionRef.current.lang = activeLangObj.speechLang;
          recognitionRef.current.start();
          setIsListening(true);
          speakText("CroperX is listening in " + activeLangObj.nativeName + "... Speak now!");
        } catch (e) {
          console.warn("Mic start error:", e);
        }
      } else {
        alert("Voice recognition is not supported in this browser. You can still click quick voice commands below!");
      }
    }
  };

  return (
    <div className="w-full space-y-3">
      {/* Primary Header Card */}
      <div className="w-full bg-gradient-to-r from-[#1b2e1b] via-[#2e7d32] to-[#1b2e1b] text-white p-3.5 md:p-4 rounded-3xl shadow-xl border border-[#4CAF50]/40 transition-all">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
          
          {/* Left: CroperX Agent Branding, Avatar & Live Animated Equalizer Waveform */}
          <div className="flex items-center gap-3.5 w-full lg:w-auto">
            <div className="relative shrink-0">
              <div className="w-13 h-13 rounded-2xl bg-[#4CAF50] p-0.5 shadow-lg flex items-center justify-center border-2 border-white/30">
                <div className="w-full h-full bg-[#1b2e1b] rounded-xl flex items-center justify-center relative overflow-hidden">
                  <Bot className="w-7 h-7 text-[#4CAF50] animate-pulse" />
                  {isSpeaking && !isMuted && (
                    <span className="absolute inset-0 bg-[#4CAF50]/20 animate-ping rounded-xl pointer-events-none" />
                  )}
                </div>
              </div>
              <span className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#1b2e1b] ${
                isMuted ? 'bg-gray-400' : isSpeaking ? 'bg-amber-400 animate-bounce' : isListening ? 'bg-red-500 animate-ping' : 'bg-emerald-400'
              }`} />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-serif italic font-black text-lg md:text-xl tracking-tight text-white flex items-center gap-1.5">
                  CroperX <span className="not-italic text-xs bg-[#4CAF50] text-[#1b2e1b] font-mono font-bold px-2 py-0.5 rounded-full uppercase">AI Agent</span>
                </h3>

                {/* Agent Personality Tone Badge */}
                <span className="text-[10px] bg-emerald-950/80 text-emerald-200 border border-emerald-400/40 px-2 py-0.5 rounded-full font-bold uppercase flex items-center gap-1">
                  {agentTone === 'enthusiastic' ? <Flame className="w-3 h-3 text-amber-400" /> : agentTone === 'professional' ? <Zap className="w-3 h-3 text-cyan-300" /> : <Smile className="w-3 h-3 text-emerald-300" />}
                  {agentTone}
                </span>

                {isMuted ? (
                  <span className="flex items-center gap-1 text-[10px] bg-red-500/20 text-red-300 font-bold px-2 py-0.5 rounded-full border border-red-400/40">
                    <VolumeX className="w-3 h-3 text-red-400" /> Voice Muted
                  </span>
                ) : isSpeaking ? (
                  <span className="flex items-center gap-1 text-[10px] bg-amber-400/20 text-amber-300 font-bold px-2 py-0.5 rounded-full border border-amber-400/40 animate-pulse">
                    <Sparkles className="w-3 h-3" /> Speaking in {activeLangObj.nativeName}
                  </span>
                ) : null}
              </div>

              {/* REAL-TIME SPEAKING AUDIO WAVEFORM VISUALIZER */}
              {isSpeaking && !isMuted ? (
                <div className="flex items-center gap-1 py-1 px-2.5 bg-black/40 rounded-xl border border-amber-400/40 w-fit">
                  <Waves className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <div className="flex items-end gap-1 h-4 px-1">
                    <span className="w-1 bg-amber-400 rounded-full animate-bounce h-2" style={{ animationDelay: '0ms', animationDuration: '400ms' }} />
                    <span className="w-1 bg-emerald-400 rounded-full animate-bounce h-4" style={{ animationDelay: '100ms', animationDuration: '300ms' }} />
                    <span className="w-1 bg-amber-300 rounded-full animate-bounce h-3" style={{ animationDelay: '200ms', animationDuration: '500ms' }} />
                    <span className="w-1 bg-teal-300 rounded-full animate-bounce h-4" style={{ animationDelay: '150ms', animationDuration: '350ms' }} />
                    <span className="w-1 bg-amber-400 rounded-full animate-bounce h-2.5" style={{ animationDelay: '250ms', animationDuration: '450ms' }} />
                    <span className="w-1 bg-emerald-300 rounded-full animate-bounce h-3.5" style={{ animationDelay: '300ms', animationDuration: '380ms' }} />
                  </div>
                  <span className="text-[10px] font-mono text-amber-300 font-bold ml-1">Live Waveform</span>
                </div>
              ) : (
                <p className="text-[11px] text-emerald-200/90 font-medium">
                  Multilingual AI Agronomist • Supports 10 Indian Languages
                </p>
              )}
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex flex-wrap items-center justify-end gap-2 w-full lg:w-auto">
            
            {/* 1. Persistent Mute / Unmute Toggle Button */}
            <button
              onClick={toggleMute}
              className={`px-3 py-2 rounded-2xl font-black text-xs transition-all flex items-center gap-1.5 border shadow-md ${
                isMuted
                  ? 'bg-red-600/90 hover:bg-red-600 text-white border-red-400 animate-pulse'
                  : 'bg-emerald-800/80 hover:bg-emerald-800 text-emerald-100 border-emerald-400/50'
              }`}
              title={isMuted ? "Unmute CroperX Voice Assistant" : "Mute CroperX Voice Assistant"}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-amber-300" /> : <Volume2 className="w-4 h-4 text-amber-300" />}
              <span>{isMuted ? 'Unmute' : 'Mute'}</span>
            </button>

            {/* 2. Quick Help / Command Menu Button */}
            <button
              onClick={() => {
                setShowQuickHelp(!showQuickHelp);
                setShowVoiceSettings(false);
              }}
              className={`px-3 py-2 rounded-2xl font-bold text-xs border transition-all flex items-center gap-1.5 ${
                showQuickHelp
                  ? 'bg-amber-400 text-slate-950 font-black border-amber-300 shadow-lg'
                  : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
              }`}
              title="Open Quick Voice Commands list for instant soil health analysis"
            >
              <HelpCircle className="w-4 h-4 text-amber-300" />
              <span>Quick Help</span>
            </button>

            {/* 3. Voice Settings Button (Tone & Sensitivity) */}
            <button
              onClick={() => {
                setShowVoiceSettings(!showVoiceSettings);
                setShowQuickHelp(false);
              }}
              className={`px-3 py-2 rounded-2xl font-bold text-xs border transition-all flex items-center gap-1.5 ${
                showVoiceSettings
                  ? 'bg-teal-500 text-slate-950 font-black border-teal-300 shadow-lg'
                  : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
              }`}
              title="Customize agent tone personality and mic noise sensitivity"
            >
              <Sliders className="w-4 h-4 text-teal-300" />
              <span>Settings</span>
            </button>

            {/* 4. Call CroperX Agent Button */}
            <button
              onClick={() => {
                stopSpeaking();
                setIsCallOpen(true);
              }}
              className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-black text-xs rounded-2xl shadow-lg border border-emerald-300/40 flex items-center gap-1.5 transition-all"
              title="Start an interactive live call with CroperX Crop Recommender Agent"
            >
              <PhoneCall className="w-4 h-4 text-amber-300" />
              <span>Call Agent</span>
            </button>

            {/* 5. Guided Tour Button */}
            <button
              onClick={() => {
                stopSpeaking();
                setIsTourOpen(true);
              }}
              className="px-3 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 font-bold text-xs rounded-2xl border border-amber-400/40 flex items-center gap-1.5 transition-all"
              title="Begin step-by-step guided audio tour"
            >
              <Compass className="w-4 h-4 text-amber-400" />
              <span>Tour</span>
            </button>

            {/* 6. Command History Button */}
            <button
              onClick={() => setIsCmdHistoryExpanded(!isCmdHistoryExpanded)}
              className={`px-3 py-2 rounded-2xl font-bold text-xs border transition-all flex items-center gap-1.5 ${
                commandHistory.length > 0
                  ? 'bg-amber-400/20 text-amber-200 border-amber-400/50 hover:bg-amber-400/30'
                  : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
              }`}
              title="View scrollable list of last 10 interpreted voice commands"
            >
              <History className="w-4 h-4 text-amber-300" />
              <span>History ({commandHistory.length})</span>
            </button>

            {/* 7. Language Selector */}
            <div className="flex items-center gap-1 bg-black/30 border border-white/20 rounded-2xl px-2.5 py-1.5">
              <Languages className="w-4 h-4 text-[#4CAF50]" />
              <select
                value={currentLanguage}
                onChange={(e) => {
                  onLanguageChange(e.target.value);
                  stopSpeaking();
                }}
                className="bg-transparent text-xs font-bold text-white outline-none cursor-pointer pr-1"
              >
                {SUPPORTED_LANGUAGES.map((lang: LanguageOption) => (
                  <option key={lang.code} value={lang.code} className="bg-[#1b2e1b] text-white">
                    {lang.flag} {lang.nativeName} ({lang.name})
                  </option>
                ))}
              </select>
            </div>

            {/* 8. Voice Mic Button */}
            <button
              onClick={toggleMicListening}
              className={`p-2 rounded-2xl font-bold text-xs transition-all flex items-center gap-1 border ${
                isListening
                  ? 'bg-red-600 text-white border-red-400 animate-pulse'
                  : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
              }`}
              title="Speak query to CroperX voice assistant"
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-[#4CAF50]" />}
            </button>

          </div>
        </div>

        {/* VOICE SETTINGS PANEL (Tone & Mic Sensitivity) */}
        {showVoiceSettings && (
          <div className="mt-3.5 pt-3 border-t border-white/20 bg-emerald-950/90 p-4 rounded-2xl space-y-4 animate-fadeIn border border-teal-400/40">
            <div className="flex items-center justify-between text-xs border-b border-white/10 pb-2">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-teal-300" />
                <span className="font-bold text-teal-200">
                  CroperX Voice Personality & Microphone Noise Settings
                </span>
              </div>
              <button
                onClick={() => setShowVoiceSettings(false)}
                className="text-gray-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* 1. Agent Personality Tone Selector */}
              <div className="space-y-2 bg-black/30 p-3 rounded-xl border border-white/10">
                <span className="font-bold text-amber-300 block uppercase tracking-wide text-[10px]">
                  Agent Voice Personality Tone:
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setAgentTone('friendly')}
                    className={`py-2 px-2 rounded-xl font-bold flex flex-col items-center justify-center gap-1 border transition-all ${
                      agentTone === 'friendly'
                        ? 'bg-emerald-600 text-white border-emerald-300 shadow-md'
                        : 'bg-white/5 text-emerald-200 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <Smile className="w-4 h-4 text-emerald-300" />
                    <span>Friendly</span>
                  </button>

                  <button
                    onClick={() => setAgentTone('professional')}
                    className={`py-2 px-2 rounded-xl font-bold flex flex-col items-center justify-center gap-1 border transition-all ${
                      agentTone === 'professional'
                        ? 'bg-cyan-600 text-white border-cyan-300 shadow-md'
                        : 'bg-white/5 text-cyan-200 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <Zap className="w-4 h-4 text-cyan-300" />
                    <span>Professional</span>
                  </button>

                  <button
                    onClick={() => setAgentTone('enthusiastic')}
                    className={`py-2 px-2 rounded-xl font-bold flex flex-col items-center justify-center gap-1 border transition-all ${
                      agentTone === 'enthusiastic'
                        ? 'bg-amber-500 text-slate-950 font-black border-amber-300 shadow-md'
                        : 'bg-white/5 text-amber-200 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <Flame className="w-4 h-4 text-amber-400" />
                    <span>Enthusiastic</span>
                  </button>
                </div>
              </div>

              {/* 2. Microphone Noise Sensitivity Slider */}
              <div className="space-y-2 bg-black/30 p-3 rounded-xl border border-white/10">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-teal-300 uppercase tracking-wide text-[10px]">
                    Mic Noise Sensitivity Threshold:
                  </span>
                  <span className="font-mono text-xs text-amber-300 font-bold">
                    {micSensitivity}% ({micSensitivity > 80 ? 'High Quiet' : micSensitivity > 50 ? 'Outdoor Farm' : 'High Tractor Noise Cancel'})
                  </span>
                </div>

                <input
                  type="range"
                  min="20"
                  max="100"
                  value={micSensitivity}
                  onChange={(e) => setMicSensitivity(Number(e.target.value))}
                  className="w-full accent-teal-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />

                <div className="flex items-center justify-between text-[10px] text-emerald-200/70 pt-1">
                  <span>🚜 Outdoor Wind/Tractor</span>
                  <span>🌾 Balanced Field</span>
                  <span>🏠 Quiet Room</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* QUICK HELP / COMMON VOICE COMMANDS SECTION */}
        {showQuickHelp && (
          <div className="mt-3.5 pt-3 border-t border-white/20 bg-black/40 p-4 rounded-2xl space-y-3 animate-fadeIn border border-amber-400/40">
            <div className="flex items-center justify-between text-xs border-b border-white/10 pb-2">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-amber-200">
                  Quick Voice Commands - Click to ask CroperX instantly in {activeLangObj.nativeName}
                </span>
              </div>
              <button
                onClick={() => setShowQuickHelp(false)}
                className="text-gray-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {QUICK_COMMANDS.map((cmd) => {
                const nativeText = cmd.nativeQuery[currentLanguage] || cmd.queryText;
                return (
                  <button
                    key={cmd.id}
                    onClick={() => {
                      processUserQuery(nativeText);
                      setShowQuickHelp(false);
                    }}
                    className="p-2.5 bg-emerald-950/70 hover:bg-emerald-900/90 text-left rounded-xl border border-emerald-500/30 hover:border-amber-400 transition-all flex items-start gap-2 group"
                  >
                    <MessageSquare className="w-4 h-4 text-amber-300 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                    <div>
                      <p className="text-xs font-semibold text-white group-hover:text-amber-200">
                        "{nativeText}"
                      </p>
                      <span className="text-[10px] text-emerald-300/80 font-serif">
                        Category: {cmd.category.toUpperCase()} • Click to speak
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Real-time Accessibility Expandable Transcript Panel */}
        {activeSentences.length > 0 && (
          <div className="mt-3.5 pt-3 border-t border-white/20 bg-black/30 p-3.5 rounded-2xl space-y-2.5 animate-fadeIn">
            <div className="flex items-center justify-between text-xs border-b border-white/10 pb-2">
              <div className="flex items-center gap-2">
                <Radio className={`w-4 h-4 ${isSpeaking && !isMuted ? 'text-amber-400 animate-spin' : 'text-emerald-400'}`} />
                <span className="font-bold text-emerald-200">
                  Real-time Accessibility Voice Transcript ({activeLangObj.nativeName})
                </span>
                {isMuted && (
                  <span className="text-[10px] text-red-300 font-mono bg-red-500/20 px-2 py-0.5 rounded-full border border-red-400/30">
                    Audio Muted (Visual Mode)
                  </span>
                )}
              </div>

              <button
                onClick={() => setIsTranscriptExpanded(!isTranscriptExpanded)}
                className="text-[11px] text-amber-300 hover:text-amber-200 font-bold flex items-center gap-1 bg-white/10 px-2 py-1 rounded-lg"
              >
                {isTranscriptExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                {isTranscriptExpanded ? 'Collapse Panel' : 'Expand Panel'}
              </button>
            </div>

            {/* Sentence-by-Sentence Real-Time Line Highlighting */}
            {isTranscriptExpanded && (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1 scrollbar-thin">
                {activeSentences.map((sentence, idx) => {
                  const isCurrent = idx === currentSentenceIndex;
                  return (
                    <div
                      key={idx}
                      className={`p-2.5 rounded-xl text-xs sm:text-sm font-serif leading-relaxed transition-all duration-300 flex items-start gap-2.5 border ${
                        isCurrent
                          ? 'bg-amber-400 text-slate-950 font-bold border-emerald-400 shadow-md scale-[1.01]'
                          : 'bg-white/5 text-emerald-100 border-white/10 hover:bg-white/10'
                      }`}
                    >
                      <span
                        className={`text-[10px] font-mono px-1.5 py-0.5 rounded shrink-0 ${
                          isCurrent ? 'bg-slate-900 text-amber-300 font-bold' : 'bg-black/30 text-emerald-400'
                        }`}
                      >
                        Line {idx + 1}
                      </span>
                      <p className="flex-1">{sentence}</p>
                      {isCurrent && (
                        <span className="text-[10px] bg-slate-900 text-amber-300 px-2 py-0.5 rounded-full font-mono font-bold animate-pulse shrink-0">
                          Active Speaking
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Scrollable Command History View (Last 10 Commands) */}
        {isCmdHistoryExpanded && (
          <div className="mt-3.5 pt-3 border-t border-white/20 bg-emerald-950/80 p-3.5 rounded-2xl space-y-2.5 animate-fadeIn border border-emerald-500/40">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-amber-200">
                  Last 10 Interpreted Voice Commands History
                </span>
              </div>
              <button
                onClick={() => setIsCmdHistoryExpanded(false)}
                className="text-gray-300 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {commandHistory.length === 0 ? (
              <p className="text-xs text-emerald-200/70 italic py-2">
                No voice commands processed yet. Click the microphone button or Quick Help commands to speak!
              </p>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
                {commandHistory.map((cmd, index) => (
                  <div
                    key={cmd.id}
                    className="p-2.5 bg-black/40 rounded-xl border border-emerald-500/30 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-amber-400 font-bold bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/30">
                          #{commandHistory.length - index} • {cmd.time}
                        </span>
                        <span className="font-semibold text-white">"{cmd.rawVoiceQuery}"</span>
                      </div>
                      <p className="text-[11px] text-emerald-300 flex items-center gap-1 font-serif">
                        <ArrowRight className="w-3 h-3 text-amber-300" /> Interpreted Action: {cmd.interpretedAction}
                      </p>
                    </div>

                    {cmd.targetTab && (
                      <button
                        onClick={() => {
                          if (onNavigateTab && cmd.targetTab) {
                            onNavigateTab(cmd.targetTab);
                          }
                        }}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 shrink-0 self-start sm:self-auto"
                      >
                        <Play className="w-3 h-3" /> Re-open Tab
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Visual Voice Command & Call Transcript Log History */}
      <CroperXVoiceHistoryLog
        transcriptLogs={transcriptLogs}
        onClearLogs={() => setTranscriptLogs([])}
        currentLanguage={currentLanguage}
      />

      {/* Interactive Call Modal */}
      <CroperXCallModal
        isOpen={isCallOpen}
        onClose={() => setIsCallOpen(false)}
        currentLanguage={currentLanguage}
        soilData={soilData}
        cropRecommendations={cropRecommendations}
        onAddTranscriptLog={addTranscriptLog}
      />

      {/* Guided Tour Modal */}
      <CroperXGuidedTour
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        currentLanguage={currentLanguage}
        onNavigateTab={onNavigateTab}
      />
    </div>
  );
};
