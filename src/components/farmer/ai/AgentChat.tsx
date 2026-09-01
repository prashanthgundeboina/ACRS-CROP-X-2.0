import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  User,
  Bot,
  AlertTriangle,
  ShoppingBag,
  CheckCircle2,
  PhoneCall,
  Loader2,
  RefreshCw,
  HelpCircle
} from 'lucide-react';
import { AIAgentInteraction, AIRiskLevel, AIIntentCategory } from '../../../types';
import { useLanguage } from '../../../context/LanguageContext';

interface AgentChatProps {
  farmer: {
    id: string;
    name: string;
    phoneNumber?: string;
    location?: string;
    primaryCrop?: string;
    farmSizeAcres?: number;
  };
  onEscalateRequested: () => void;
  automationMode?: string;
  isPaused?: boolean;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  intent?: AIIntentCategory;
  riskLevel?: AIRiskLevel;
  confidence?: number;
  recommendedActions?: string[];
  recommendedProducts?: Array<{ id: string; name: string; price: number; reason: string }>;
  escalated?: boolean;
  escalationReason?: string;
  timestamp: string;
}

export const AgentChat: React.FC<AgentChatProps> = ({
  farmer,
  onEscalateRequested,
  automationMode = 'HYBRID',
  isPaused = false
}) => {
  const { language } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-msg',
      sender: 'agent',
      text: `Hello ${farmer.name || 'Farmer'}! I am your dedicated CropX AI Agronomist for your ${farmer.primaryCrop || 'crops'} in ${farmer.location || 'your farm'}. How can I assist your field today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      confidence: 99.0,
      riskLevel: 'LOW',
      intent: 'GENERAL_ADVISORY',
      recommendedActions: [
        'Ask about pest detection & bio-pesticides',
        'Review current irrigation AWD water schedule',
        'Check soil health & fertilizer top-dressing'
      ]
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedPrompts = [
    'How should I manage stem borer in my paddy field?',
    'What is the recommended fertilizer schedule for this week?',
    'Is rain expected in the next 48 hours for spraying?',
    'Show me recommended bio-fertilizers and pest traps'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim() || loading || isPaused) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/adviser/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          farmer: {
            id: farmer.id,
            name: farmer.name,
            phone: farmer.phoneNumber,
            location: farmer.location,
            primaryCrop: farmer.primaryCrop,
            farmSizeAcres: farmer.farmSizeAcres,
            language
          },
          message: query
        })
      });

      if (!res.ok) {
        throw new Error('Failed to reach AI Advisory service.');
      }

      const data = await res.json();

      const agentMsg: ChatMessage = {
        id: `agt-${Date.now()}`,
        sender: 'agent',
        text: data.response,
        intent: data.intent,
        riskLevel: data.riskLevel,
        confidence: data.confidence,
        recommendedActions: data.recommendedActions,
        recommendedProducts: data.recommendedProducts,
        escalated: data.escalated,
        escalationReason: data.escalationReason,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, agentMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'agent',
          text: 'We encountered a momentary communication delay with the server. Connecting you with fallback agronomy rules or live adviser.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          riskLevel: 'LOW',
          escalated: true
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[520px] bg-slate-900/90 rounded-2xl border border-emerald-500/20 overflow-hidden shadow-2xl backdrop-blur-xl">
      {/* Header */}
      <div className="px-5 py-3.5 bg-slate-950/80 border-b border-emerald-500/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-0.5 shadow-lg shadow-emerald-900/40">
              <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                <Bot className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <span
              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-900 ${
                isPaused ? 'bg-amber-500' : 'bg-emerald-400 animate-pulse'
              }`}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-wide">
                Personal AI Adviser
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 font-semibold border border-emerald-500/30">
                {automationMode}
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <span>{farmer.primaryCrop || 'Paddy'} Specialist</span>
              <span>•</span>
              <span className="text-emerald-400 font-medium">Authoritative Memory</span>
            </p>
          </div>
        </div>

        <button
          onClick={onEscalateRequested}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-xl transition-all shadow-sm"
          title="Connect with a Human Agronomist"
        >
          <PhoneCall className="w-3.5 h-3.5" />
          <span>Call Human Adviser</span>
        </button>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-700">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-start gap-2.5 ${
              m.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-1 ${
                m.sender === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-emerald-600/30 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              {m.sender === 'user' ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-lg ${
                m.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-none'
                  : 'bg-slate-800/90 text-slate-200 border border-slate-700/60 rounded-tl-none'
              }`}
            >
              {/* Agent meta badge */}
              {m.sender === 'agent' && (
                <div className="flex flex-wrap items-center gap-2 mb-2 pb-2 border-b border-slate-700/60 text-[10px] text-slate-400">
                  <span className="font-semibold text-emerald-400">CropX AI</span>
                  {m.confidence && (
                    <span className="px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/40">
                      {m.confidence}% Confidence
                    </span>
                  )}
                  {m.riskLevel && (
                    <span
                      className={`px-1.5 py-0.5 rounded font-semibold ${
                        m.riskLevel === 'HIGH'
                          ? 'bg-red-950/60 text-red-300 border border-red-800/40'
                          : m.riskLevel === 'MEDIUM'
                          ? 'bg-amber-950/60 text-amber-300 border border-amber-800/40'
                          : 'bg-slate-700/40 text-slate-300'
                      }`}
                    >
                      {m.riskLevel} Risk
                    </span>
                  )}
                  {m.escalated && (
                    <span className="px-1.5 py-0.5 rounded bg-amber-900/40 text-amber-200 border border-amber-700/40 flex items-center gap-1">
                      <AlertTriangle className="w-2.5 h-2.5" /> Escalated
                    </span>
                  )}
                </div>
              )}

              <p className="whitespace-pre-line">{m.text}</p>

              {/* Recommended Actions */}
              {m.recommendedActions && m.recommendedActions.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-700/50 space-y-1.5">
                  <p className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Action Plan:
                  </p>
                  {m.recommendedActions.map((act, i) => (
                    <div
                      key={i}
                      className="text-xs text-slate-300 bg-slate-900/60 px-2.5 py-1.5 rounded-lg border border-slate-700/40 flex items-start gap-1.5"
                    >
                      <span className="text-emerald-400 font-bold">•</span>
                      <span>{act}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Recommended Products */}
              {m.recommendedProducts && m.recommendedProducts.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-slate-700/50 space-y-2">
                  <p className="text-[11px] font-bold text-teal-300 flex items-center gap-1">
                    <ShoppingBag className="w-3.5 h-3.5" /> Certified Inputs (Agri Store):
                  </p>
                  <div className="grid grid-cols-1 gap-1.5">
                    {m.recommendedProducts.map((p) => (
                      <div
                        key={p.id}
                        className="p-2 bg-emerald-950/20 border border-emerald-500/20 rounded-lg flex items-center justify-between text-xs"
                      >
                        <div>
                          <p className="font-semibold text-emerald-200">{p.name}</p>
                          <p className="text-[10px] text-slate-400">{p.reason}</p>
                        </div>
                        <span className="text-emerald-400 font-bold shrink-0 ml-2">₹{p.price}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <span className="block text-[9px] text-slate-400 mt-2 text-right">
                {m.timestamp}
              </span>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-slate-400 text-xs py-2 px-3 bg-slate-800/40 rounded-xl w-fit border border-slate-700/40">
            <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
            <span>Consulting agronomy models & farm memory...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested prompts pills */}
      <div className="px-4 py-2 bg-slate-950/60 border-t border-slate-800 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-[10px] font-bold text-slate-400 shrink-0 flex items-center gap-1">
          <HelpCircle className="w-3 h-3 text-emerald-400" /> Suggestions:
        </span>
        {suggestedPrompts.map((sp, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(sp)}
            className="text-[11px] text-slate-300 bg-slate-800/80 hover:bg-emerald-900/40 hover:text-emerald-200 border border-slate-700/60 rounded-full px-2.5 py-1 whitespace-nowrap transition-colors shrink-0"
          >
            {sp}
          </button>
        ))}
      </div>

      {/* Input bar */}
      <div className="p-3 bg-slate-950 border-t border-emerald-500/20">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              isPaused
                ? 'AI is currently paused by administrator...'
                : `Ask your ${farmer.primaryCrop || 'crop'} AI Adviser...`
            }
            disabled={isPaused || loading}
            className="flex-1 bg-slate-900 border border-slate-700/80 focus:border-emerald-500 text-white rounded-xl px-4 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || loading || isPaused}
            className="p-2.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white rounded-xl font-semibold shadow-lg shadow-emerald-900/30 transition-all disabled:opacity-40"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  );
};
