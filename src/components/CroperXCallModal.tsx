import React, { useState, useEffect, useRef } from 'react';
import { PhoneCall, PhoneOff, Mic, MicOff, Volume2, VolumeX, Send, Sparkles, Bot, Clock, Radio, User, AlertCircle } from 'lucide-react';
import { SUPPORTED_LANGUAGES, LanguageOption } from '../utils/i18n';
import { SoilData, CropRecommendation } from '../types';
import { sendAgriChatMessage } from '../services/geminiService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentLanguage: string;
  soilData: SoilData;
  cropRecommendations?: CropRecommendation[] | null;
  onAddTranscriptLog: (userQuery: string, aiResponse: string) => void;
}

export const CroperXCallModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentLanguage,
  soilData,
  cropRecommendations,
  onAddTranscriptLog
}) => {
  const [callDuration, setCallDuration] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [userTextQuery, setUserTextQuery] = useState<string>('');
  const [callMessages, setCallMessages] = useState<Array<{ sender: 'user' | 'ai'; text: string; time: string }>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const synthRef = useRef<SpeechSynthesis | null>(null);
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<any>(null);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  const activeLangObj = SUPPORTED_LANGUAGES.find(l => l.code === currentLanguage) || SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    if (!isOpen) {
      if (timerRef.current) clearInterval(timerRef.current);
      if (synthRef.current) synthRef.current.cancel();
      setIsSpeaking(false);
      setIsListening(false);
      return;
    }

    setCallDuration(0);
    timerRef.current = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }

    // Initial greeting from CroperX Call Agent
    const topCrop = cropRecommendations?.[0]?.crop || 'your recommended crop';
    const nVal = soilData?.nitrogen ?? 90;
    const phVal = soilData?.ph ?? 6.5;
    let welcomeMsg = `Hello farmer! I am CroperX, your personal crop recommender on line. I see your soil Nitrogen is ${nVal} ppm and pH is ${phVal}. Ask me anything about fertilizers, crop suitability, or yield optimization!`;
    
    if (currentLanguage === 'hi') {
      welcomeMsg = `नमस्ते किसान भाई! मैं कॉल पर आपका क्रोपरएक्स एआई कृषि एजेंट हूँ। आपकी मिट्टी का नाइट्रोजन ${nVal} पीपीएम और पीएच ${phVal} है। फसल, खाद या सिंचाई के बारे में कोई भी सवाल पूछें!`;
    } else if (currentLanguage === 'te') {
      welcomeMsg = `నమస్కారం రైతు సోదరా! నేను క్రోపర్ ఎక్స్ AI వ్యవసాయ ఏజెంట్‌ను. మీ నేల వివరాలపై ఏవైనా ప్రశ్నలు అడగండి!`;
    } else if (currentLanguage === 'ta') {
      welcomeMsg = `வணக்கம் விவசாயியே! நான் உங்கள் க்ரோபர்எக்ஸ் பயிர் ஆலோசகர். உங்கள் மண் பற்றிய எந்த கேள்வியையும் கேளுங்கள்!`;
    } else if (currentLanguage === 'mr') {
      welcomeMsg = `नमस्कार शेतकरी बंधूंनो! मी आपला क्रोपरएक्स कृषी एजंट आहे. आपल्या मातीबद्दल किंवा पिकाबद्दल काहीही विचारा!`;
    } else if (currentLanguage === 'bn') {
      welcomeMsg = `নমস্কার কৃষক ভাই! আমি আপনার ক্রোপারএক্স এআই কৃষি এজেন্ট। ফসল ও সার সংক্রান্ত যেকোনো প্রশ্ন জিজ্ঞেস করুন!`;
    }

    setCallMessages([
      {
        sender: 'ai',
        text: welcomeMsg,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);

    speakUtterance(welcomeMsg);

    // Setup speech recognition
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = activeLangObj.speechLang;

        rec.onresult = (e: any) => {
          const transcript = e.results[0][0].transcript;
          setIsListening(false);
          if (transcript.trim()) {
            handleUserMessage(transcript);
          }
        };

        rec.onerror = () => setIsListening(false);
        rec.onend = () => setIsListening(false);
        recognitionRef.current = rec;
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (synthRef.current) synthRef.current.cancel();
    };
  }, [isOpen, currentLanguage]);

  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [callMessages]);

  const speakUtterance = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const synth = window.speechSynthesis;
    synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = activeLangObj.speechLang;
    utterance.rate = 0.95;

    const voices = synth.getVoices();
    const matchedVoice = voices.find(v => v.lang.startsWith(activeLangObj.code) || v.lang.includes(activeLangObj.code));
    if (matchedVoice) utterance.voice = matchedVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    synth.speak(utterance);
  };

  const handleUserMessage = async (queryText: string) => {
    if (!queryText.trim() || isLoading) return;

    const userMsg = {
      sender: 'user' as const,
      text: queryText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setCallMessages(prev => [...prev, userMsg]);
    setUserTextQuery('');
    setIsLoading(true);

    try {
      const aiReply = await sendAgriChatMessage(
        [...callMessages, userMsg],
        soilData,
        currentLanguage
      );

      const aiMsg = {
        sender: 'ai' as const,
        text: aiReply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setCallMessages(prev => [...prev, aiMsg]);
      onAddTranscriptLog(queryText, aiReply);
      speakUtterance(aiReply);
    } catch (e) {
      const fallback = `I understand you are asking about "${queryText}". For your soil (N:${soilData?.nitrogen ?? 90}, pH:${soilData?.ph ?? 6.5}), ensure balanced moisture and consult our recommended crop list!`;
      const aiMsg = {
        sender: 'ai' as const,
        text: fallback,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setCallMessages(prev => [...prev, aiMsg]);
      onAddTranscriptLog(queryText, fallback);
      speakUtterance(fallback);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMicListening = () => {
    if (isListening) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsListening(false);
    } else {
      if (synthRef.current) synthRef.current.cancel();
      setIsSpeaking(false);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.lang = activeLangObj.speechLang;
          recognitionRef.current.start();
          setIsListening(true);
        } catch (e) {
          console.warn("Call mic error:", e);
        }
      } else {
        alert("Microphone voice recognition is not supported in this browser. You can type your query in the call chat!");
      }
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div className="w-full max-w-2xl bg-[#122315] border-2 border-[#4CAF50]/60 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Call Header */}
        <div className="bg-gradient-to-r from-[#1b3e1e] via-[#2e7d32] to-[#1b3e1e] p-4 text-white flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/30 p-0.5 border border-emerald-400/50 flex items-center justify-center">
                <Bot className="w-7 h-7 text-emerald-300 animate-pulse" />
              </div>
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-[#122315] animate-ping" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif italic font-black text-lg text-white">CroperX Recommender</h3>
                <span className="bg-emerald-400 text-[#122315] font-mono text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                  Live Agent Call
                </span>
              </div>
              <p className="text-xs text-emerald-200/90 flex items-center gap-1.5 font-mono">
                <Clock className="w-3 h-3 text-amber-300" /> {formatTime(callDuration)} • Language: {activeLangObj.nativeName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 bg-red-600/80 hover:bg-red-600 text-white rounded-2xl transition-all border border-red-400 flex items-center gap-1.5 text-xs font-bold"
          >
            <PhoneOff className="w-4 h-4" /> End Call
          </button>
        </div>

        {/* Audio Wave Sound Visualizer */}
        <div className="bg-black/40 px-4 py-2 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-emerald-300 font-mono">
            <Radio className={`w-4 h-4 ${isSpeaking || isListening ? 'text-amber-400 animate-spin' : 'text-emerald-400'}`} />
            <span>
              {isSpeaking
                ? `CroperX speaking in ${activeLangObj.nativeName}...`
                : isListening
                ? `Listening to your query...`
                : `Line clear. Speak or type below.`}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {[40, 70, 30, 90, 50, 80, 40, 60, 100, 30].map((h, i) => (
              <span
                key={i}
                className={`w-1 rounded-full transition-all duration-300 ${
                  isSpeaking
                    ? 'bg-amber-400 animate-pulse'
                    : isListening
                    ? 'bg-red-500 animate-ping'
                    : 'bg-emerald-500/40'
                }`}
                style={{ height: `${(isSpeaking || isListening) ? Math.max(8, (h * Math.random())) : 8}px` }}
              />
            ))}
          </div>
        </div>

        {/* Live Conversation Transcript */}
        <div ref={chatScrollRef} className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-[#0e1b10] scrollbar-thin">
          {callMessages.map((msg, index) => (
            <div
              key={index}
              className={`flex items-start gap-2.5 max-w-[85%] ${
                msg.sender === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white font-bold text-xs ${
                  msg.sender === 'user' ? 'bg-amber-600' : 'bg-emerald-700'
                }`}
              >
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-emerald-200" />}
              </div>

              <div
                className={`p-3 rounded-2xl text-xs sm:text-sm leading-relaxed border ${
                  msg.sender === 'user'
                    ? 'bg-amber-500/20 text-amber-100 border-amber-500/40 rounded-tr-none'
                    : 'bg-emerald-900/40 text-emerald-100 border-emerald-500/30 rounded-tl-none font-serif'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1 border-b border-white/10 pb-1 text-[10px] font-mono text-emerald-300/80">
                  <span>{msg.sender === 'user' ? 'Farmer' : 'CroperX AI'}</span>
                  <span>{msg.time}</span>
                </div>
                <p className="whitespace-pre-wrap">{msg.text}</p>
                {msg.sender === 'ai' && (
                  <button
                    onClick={() => speakUtterance(msg.text)}
                    className="mt-2 text-[10px] font-bold text-amber-300 hover:text-amber-200 flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-lg"
                  >
                    <Volume2 className="w-3 h-3" /> Replay Speech
                  </button>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-amber-300 font-mono bg-amber-500/10 p-2.5 rounded-2xl border border-amber-500/30 w-fit">
              <Sparkles className="w-4 h-4 animate-spin" /> CroperX is computing agronomic answer...
            </div>
          )}
        </div>

        {/* Quick Suggested Farmer Questions */}
        <div className="p-2 bg-black/50 border-t border-white/10 overflow-x-auto flex items-center gap-1.5 scrollbar-none">
          <span className="text-[10px] text-emerald-300 uppercase font-bold shrink-0 px-2">Quick Queries:</span>
          {[
            "Why is Rice recommended for my soil?",
            "How much Urea fertilizer should I apply?",
            "What if soil pH drops to 5.5?",
            "Suggest best crop rotation plan"
          ].map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleUserMessage(q)}
              className="text-[11px] bg-white/10 hover:bg-emerald-600/30 text-emerald-100 px-2.5 py-1 rounded-xl whitespace-nowrap border border-white/10 transition-all shrink-0"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Bottom Call Action Controls */}
        <div className="p-3 bg-[#172d1b] border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          
          {/* Text Input for Typing Queries */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleUserMessage(userTextQuery);
            }}
            className="flex items-center gap-2 w-full sm:flex-1"
          >
            <input
              type="text"
              value={userTextQuery}
              onChange={(e) => setUserTextQuery(e.target.value)}
              placeholder={`Ask CroperX in ${activeLangObj.nativeName}...`}
              className="flex-1 bg-black/40 text-white placeholder-emerald-300/50 text-xs sm:text-sm px-3 py-2 rounded-2xl border border-white/20 outline-none focus:border-[#4CAF50]"
            />
            <button
              type="submit"
              disabled={!userTextQuery.trim() || isLoading}
              className="p-2.5 bg-[#4CAF50] hover:bg-emerald-600 text-[#122315] font-bold rounded-2xl transition-all disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Mic & Audio Controls */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={toggleMicListening}
              className={`p-3 rounded-2xl font-bold text-xs transition-all flex items-center gap-1.5 border ${
                isListening
                  ? 'bg-red-600 text-white border-red-400 animate-pulse shadow-lg shadow-red-500/50'
                  : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
              }`}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-emerald-400" />}
              <span className="text-xs">{isListening ? 'Listening...' : 'Speak'}</span>
            </button>

            <button
              onClick={() => {
                if (synthRef.current) synthRef.current.cancel();
                setIsSpeaking(false);
              }}
              className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl border border-white/20"
              title="Stop Speech Output"
            >
              <VolumeX className="w-4 h-4 text-amber-300" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
