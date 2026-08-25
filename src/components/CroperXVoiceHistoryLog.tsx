import React, { useState } from 'react';
import { History, Volume2, MessageSquare, ChevronDown, ChevronUp, Trash2, Mic, Bot, Sparkles } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../utils/i18n';

export interface TranscriptEntry {
  id: string;
  time: string;
  userQuery: string;
  aiResponse: string;
  languageCode: string;
}

interface Props {
  transcriptLogs: TranscriptEntry[];
  onClearLogs: () => void;
  currentLanguage: string;
}

export const CroperXVoiceHistoryLog: React.FC<Props> = ({
  transcriptLogs,
  onClearLogs,
  currentLanguage
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  const activeLangObj = SUPPORTED_LANGUAGES.find(l => l.code === currentLanguage) || SUPPORTED_LANGUAGES[0];

  const playSpeech = (text: string, langCode: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const synth = window.speechSynthesis;
    synth.cancel();

    const langObj = SUPPORTED_LANGUAGES.find(l => l.code === langCode) || activeLangObj;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langObj.speechLang;
    utterance.rate = 0.95;

    const voices = synth.getVoices();
    const matched = voices.find(v => v.lang.startsWith(langObj.code) || v.lang.includes(langObj.code));
    if (matched) utterance.voice = matched;

    synth.speak(utterance);
  };

  if (transcriptLogs.length === 0) return null;

  return (
    <div className="w-full bg-white border border-[#c8e6c9] rounded-3xl shadow-sm overflow-hidden transition-all">
      
      {/* Header Bar */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-gradient-to-r from-[#1b3e1e]/5 via-[#2e7d32]/10 to-[#1b3e1e]/5 p-3 sm:p-4 flex items-center justify-between cursor-pointer select-none border-b border-[#c8e6c9]"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-[#2e7d32] text-white flex items-center justify-center font-bold text-xs">
            <History className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-sm text-[#1b3e1e]">Voice Command & Call Transcript History</h4>
              <span className="bg-[#2e7d32] text-white text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
                {transcriptLogs.length} {transcriptLogs.length === 1 ? 'Inquiry' : 'Inquiries'}
              </span>
            </div>
            <p className="text-[11px] text-gray-600">
              Visual log of past voice queries and CroperX AI responses
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {transcriptLogs.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClearLogs();
              }}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
              title="Clear transcript history"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          <button className="p-1.5 text-gray-600 hover:bg-black/5 rounded-lg">
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Expanded Logs Content */}
      {isExpanded && (
        <div className="p-3 sm:p-4 space-y-3 max-h-80 overflow-y-auto bg-slate-50/50">
          {transcriptLogs.map((item) => {
            const itemLang = SUPPORTED_LANGUAGES.find(l => l.code === item.languageCode) || activeLangObj;
            return (
              <div
                key={item.id}
                className="bg-white p-3 rounded-2xl border border-gray-200 shadow-2xl/5 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between text-[10px] text-gray-500 font-mono pb-1 border-b border-gray-100">
                  <span className="flex items-center gap-1 font-bold text-[#2e7d32]">
                    <Mic className="w-3 h-3 text-[#2e7d32]" /> Query via Voice / Call
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-200 font-bold">
                      {itemLang.flag} {itemLang.nativeName}
                    </span>
                    <span>{item.time}</span>
                  </div>
                </div>

                {/* Farmer Question */}
                <div className="flex items-start gap-2">
                  <span className="font-bold text-amber-700 shrink-0 uppercase text-[10px] bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                    Farmer:
                  </span>
                  <p className="text-gray-800 font-medium italic">"{item.userQuery}"</p>
                </div>

                {/* CroperX Response */}
                <div className="flex items-start justify-between gap-2 bg-[#f1f8e9] p-2.5 rounded-xl border border-[#c8e6c9]">
                  <div className="flex items-start gap-2">
                    <Bot className="w-4 h-4 text-[#2e7d32] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-[#1b3e1e] text-[10px] uppercase block mb-0.5">
                        CroperX AI Answer:
                      </span>
                      <p className="text-gray-800 leading-relaxed font-serif whitespace-pre-wrap">
                        {item.aiResponse}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => playSpeech(item.aiResponse, item.languageCode)}
                    className="p-1.5 bg-[#2e7d32] hover:bg-[#1b3e1e] text-white rounded-lg text-[10px] font-bold flex items-center gap-1 shrink-0 shadow-sm"
                    title="Replay CroperX vocal output"
                  >
                    <Volume2 className="w-3.5 h-3.5" /> Replay
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
