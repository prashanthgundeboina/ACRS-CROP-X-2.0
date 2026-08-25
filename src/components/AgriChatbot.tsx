import React, { useState, useRef, useEffect } from 'react';
import { SoilData } from '../types';
import { sendAgriChatMessage } from '../services/geminiService';
import { MessageSquare, X, Send, Bot, User, Sparkles, Loader2, Minimize2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface Props {
  soilData: SoilData;
}

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  time: string;
}

export const AgriChatbot: React.FC<Props> = ({ soilData }) => {
  const { language, activeLangObj } = useLanguage();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [inputMsg, setInputMsg] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [hasNotifiedLowMoisture, setHasNotifiedLowMoisture] = useState<boolean>(false);

  const moistureVal = soilData?.moisture ?? soilData?.soil_moisture ?? 30;
  const phVal = soilData?.ph ?? 6.5;
  const nVal = soilData?.nitrogen ?? 90;
  const pVal = soilData?.phosphorus ?? 42;
  const kVal = soilData?.potassium ?? 43;
  const pestVal = soilData?.pest_pressure ?? 20;

  const isCriticalMoisture = moistureVal < 20;

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: `Namaste! I am **CroperX AI**, your interactive agronomist agent. Ask me anything about soil N:${nVal}, P:${pVal}, K:${kVal}, pH:${phVal}, pest management, or crop recommendations in ${activeLangObj.nativeName}!`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  // Proactive Sensor Alert: Trigger warning message when soil moisture falls below 20%
  useEffect(() => {
    if (isCriticalMoisture && !hasNotifiedLowMoisture) {
      const alertMsg: Message = {
        id: 'moisture_alert_' + Date.now(),
        sender: 'ai',
        text: `⚠️ **CRITICAL PROACTIVE SENSOR ALERT**: Live Soil Moisture has fallen to **${moistureVal}%** (below the 20% safety threshold)! \n\n*Agronomist Directive*: Immediate drip/sprinkler irrigation of 15L/m² recommended to prevent permanent wilting point and maintain crop yield potential.`,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, alertMsg]);
      setHasNotifiedLowMoisture(true);
    }
  }, [moistureVal, isCriticalMoisture, hasNotifiedLowMoisture]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputMsg;
    if (!text.trim() || loading) return;

    const userMessage: Message = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      text: text.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    if (!textToSend) setInputMsg('');
    setLoading(true);

    try {
      const chatHistory = [...messages, userMessage].map(m => ({ sender: m.sender, text: m.text }));
      const replyText = await sendAgriChatMessage(chatHistory, soilData, language);

      const aiMessage: Message = {
        id: 'ai_' + Date.now(),
        sender: 'ai',
        text: replyText,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: 'err_' + Date.now(),
          sender: 'ai',
          text: 'I had trouble connecting to the agronomy server. Please check your network connection.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickPrompts = [
    "How do I fix low Nitrogen in soil?",
    "What crop is best for pH " + phVal + "?",
    "How to manage pest index " + pestVal + "?",
    "Urea fertilizer dosage for Maize?"
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Launcher Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className={`group relative flex items-center gap-3 text-white px-5 py-3.5 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 border-2 ${
            isCriticalMoisture
              ? 'bg-red-900 hover:bg-red-800 border-red-500 animate-bounce'
              : 'bg-[#1b2e1b] hover:bg-[#2e7d32] border-[#4CAF50]'
          }`}
        >
          <div className="relative">
            <Bot className={`w-6 h-6 transition-colors ${isCriticalMoisture ? 'text-red-400' : 'text-[#4CAF50] group-hover:text-white'}`} />
            <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full animate-ping ${isCriticalMoisture ? 'bg-red-400' : 'bg-emerald-400'}`} />
            <span className={`absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full ${isCriticalMoisture ? 'bg-red-500' : 'bg-emerald-400'}`} />
          </div>
          <div className="text-left hidden sm:block">
            <div className="text-xs font-serif font-bold leading-none flex items-center gap-1.5">
              <span>AgriPro AI Chat</span>
              {isCriticalMoisture && (
                <span className="text-[9px] bg-red-500 text-white font-black px-1.5 py-0.2 rounded-full uppercase">
                  Alert
                </span>
              )}
            </div>
            <div className={`text-[10px] ${isCriticalMoisture ? 'text-red-300 font-bold' : 'text-[#a5d6a7]'}`}>
              {isCriticalMoisture ? `⚠️ Moisture ${soilData.moisture}% Low!` : 'Ask Agronomist'}
            </div>
          </div>
        </button>
      )}

      {/* Expanded Chatbox Window */}
      {isOpen && (
        <div className="w-[90vw] sm:w-[400px] h-[540px] bg-white rounded-[2.5rem] border-2 border-[#c8e6c9] shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Header */}
          <div className={`text-white p-4 px-6 flex items-center justify-between border-b ${
            isCriticalMoisture ? 'bg-red-950 border-red-800' : 'bg-[#1b2e1b] border-[#2e7d32]'
          }`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl ${isCriticalMoisture ? 'bg-red-800 text-red-200' : 'bg-[#2e7d32] text-[#81c784]'}`}>
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-serif text-sm font-bold leading-tight flex items-center gap-1.5">
                  <span>AgriPro Assistant</span>
                  {isCriticalMoisture && (
                    <span className="text-[9px] bg-red-600 text-white font-black px-1.5 py-0.5 rounded-full">
                      ⚠️ Sensor Warning
                    </span>
                  )}
                </h4>
                <p className="text-[10px] text-[#a5d6a7] flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${isCriticalMoisture ? 'bg-red-400 animate-ping' : 'bg-emerald-400'}`} />
                  Gemini 2.5 Flash Engine Active
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-gray-300 hover:text-white rounded-lg hover:bg-[#2e7d32]/50 transition-colors"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
          </div>

          {/* Critical Moisture Warning Header Bar if moisture < 20% */}
          {isCriticalMoisture && (
            <div className="bg-red-500 text-white px-4 py-2 text-[11px] font-bold flex items-center justify-between gap-2 shadow-inner">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 bg-white rounded-full animate-ping" />
                ⚠️ Soil Moisture Critical: {soilData.moisture}% (Threshold: 20%)
              </span>
              <button
                onClick={() => handleSend("Give me an emergency irrigation schedule for low soil moisture")}
                className="bg-white text-red-700 px-2.5 py-0.5 rounded-lg font-black text-[10px] hover:bg-red-100 transition-colors shrink-0"
              >
                Emergency Plan
              </button>
            </div>
          )}

          {/* Messages Feed */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#fcfdfc]">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'ai' && (
                  <div className="w-7 h-7 rounded-xl bg-[#1b2e1b] text-[#4CAF50] flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[80%] p-3.5 rounded-2xl text-xs space-y-1 ${
                    msg.sender === 'user'
                      ? 'bg-[#4CAF50] text-white rounded-tr-none font-medium'
                      : 'bg-white text-gray-800 border border-[#c8e6c9] shadow-sm rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                  <div
                    className={`text-[9px] font-mono ${
                      msg.sender === 'user' ? 'text-emerald-100 text-right' : 'text-gray-400'
                    }`}
                  >
                    {msg.time}
                  </div>
                </div>

                {msg.sender === 'user' && (
                  <div className="w-7 h-7 rounded-xl bg-gray-200 text-gray-700 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-2.5 items-center text-xs text-gray-500 italic">
                <div className="w-7 h-7 rounded-xl bg-[#1b2e1b] text-[#4CAF50] flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-3 bg-white rounded-2xl border border-[#c8e6c9] flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#4CAF50]" />
                  <span>Analyzing agronomic telemetry...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Chips */}
          <div className="p-2 px-4 bg-[#f8fcf8] border-t border-[#c8e6c9] overflow-x-auto flex gap-1.5 no-scrollbar">
            {quickPrompts.map((qp, i) => (
              <button
                key={i}
                onClick={() => handleSend(qp)}
                className="whitespace-nowrap px-2.5 py-1 bg-white hover:bg-[#e8f5e9] text-[10px] font-bold text-[#2e7d32] border border-[#c8e6c9] rounded-full transition-colors flex-shrink-0"
              >
                {qp}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-3 bg-white border-t border-[#c8e6c9] flex items-center gap-2">
            <input
              type="text"
              value={inputMsg}
              onChange={(e) => setInputMsg(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask AgriPro farming questions..."
              className="flex-1 bg-[#f8fcf8] border border-[#c8e6c9] text-xs font-medium rounded-xl px-3 py-2.5 outline-none focus:border-[#4CAF50]"
            />
            <button
              onClick={() => handleSend()}
              disabled={!inputMsg.trim() || loading}
              className="p-2.5 bg-[#4CAF50] hover:bg-[#2e7d32] text-white rounded-xl disabled:opacity-40 transition-colors shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
