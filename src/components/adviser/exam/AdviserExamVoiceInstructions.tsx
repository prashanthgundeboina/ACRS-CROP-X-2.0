import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Play, RotateCcw, Globe, CheckCircle2, ArrowRight } from 'lucide-react';
import { SUPPORTED_LANGUAGES, getExamVoiceScript } from '../../../utils/i18n';

interface AdviserExamVoiceInstructionsProps {
  applicantName?: string;
  selectedLanguage: string;
  onLanguageChange: (lang: string) => void;
  onContinue: () => void;
}

export const AdviserExamVoiceInstructions: React.FC<AdviserExamVoiceInstructionsProps> = ({
  applicantName = 'Candidate',
  selectedLanguage,
  onLanguageChange,
  onContinue,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);

  const voiceScript = getExamVoiceScript(selectedLanguage, applicantName);
  const currentLangObj = SUPPORTED_LANGUAGES.find(l => l.code === selectedLanguage) || SUPPORTED_LANGUAGES[0];

  const stopAudio = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
  };

  const playVoiceInstructions = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      setHasPlayed(true);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(voiceScript);
    utterance.lang = currentLangObj.speechLang || 'en-IN';
    utterance.rate = 0.95;

    utterance.onstart = () => {
      setIsPlaying(true);
      setHasPlayed(true);
    };

    utterance.onend = () => {
      setIsPlaying(false);
    };

    utterance.onerror = () => {
      setIsPlaying(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  return (
    <div id="adviser-exam-voice-card" className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl p-6 md:p-8 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-stone-200 dark:border-stone-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Volume2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">Step 2: Multilingual Voice Audio Instructions</h2>
            <p className="text-sm text-stone-500 dark:text-stone-400">Listen to proctoring guidance in your preferred regional language</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-stone-400" />
          <select
            id="select-voice-lang"
            value={selectedLanguage}
            onChange={(e) => {
              stopAudio();
              onLanguageChange(e.target.value);
            }}
            className="text-sm bg-stone-50 dark:bg-stone-800 border border-stone-300 dark:border-stone-700 rounded-lg px-3 py-2 text-stone-800 dark:text-stone-200 font-medium focus:ring-2 focus:ring-blue-500"
          >
            {SUPPORTED_LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.flag} {l.name} ({l.nativeName})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="my-6 p-5 bg-stone-50 dark:bg-stone-800/40 border border-stone-200 dark:border-stone-700/60 rounded-xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
            <Volume2 className="w-3.5 h-3.5" /> Audio Transcript ({currentLangObj.name})
          </span>
          {isPlaying && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Speaking Live
            </span>
          )}
        </div>

        <p className="text-stone-800 dark:text-stone-200 text-sm md:text-base leading-relaxed">
          {voiceScript}
        </p>

        <div className="flex items-center gap-3 mt-5">
          {!isPlaying ? (
            <button
              id="btn-play-voice-instructions"
              type="button"
              onClick={playVoiceInstructions}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-xl transition shadow-sm cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>{hasPlayed ? 'Replay Voice Instructions' : 'Play Voice Instructions'}</span>
            </button>
          ) : (
            <button
              id="btn-stop-voice-instructions"
              type="button"
              onClick={stopAudio}
              className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-medium text-sm rounded-xl transition shadow-sm cursor-pointer"
            >
              <VolumeX className="w-4 h-4" />
              <span>Stop Audio</span>
            </button>
          )}

          {hasPlayed && (
            <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" /> Audio Verified
            </span>
          )}
        </div>
      </div>

      <div className="pt-4 border-t border-stone-200 dark:border-stone-800 flex items-center justify-end">
        <button
          id="btn-adviser-continue-voice"
          type="button"
          onClick={() => {
            stopAudio();
            onContinue();
          }}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition shadow-sm cursor-pointer"
        >
          <span>Continue to Permission Check</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
