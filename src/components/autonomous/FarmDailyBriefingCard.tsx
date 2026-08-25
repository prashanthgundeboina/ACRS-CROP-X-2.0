import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Sun, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  Droplets, 
  CloudSun, 
  Sprout, 
  ShieldAlert, 
  Coins, 
  CalendarClock
} from 'lucide-react';
import { DailyFarmBriefing } from '../../types/autonomous/farmAutonomousTypes';
import { AppTabId } from '../HeaderIconMenuBar';

interface FarmDailyBriefingCardProps {
  briefing: DailyFarmBriefing;
  onSelectTab: (tab: AppTabId) => void;
  onOpenAskCroperX?: (question: string) => void;
}

export const FarmDailyBriefingCard: React.FC<FarmDailyBriefingCardProps> = ({
  briefing,
  onSelectTab,
  onOpenAskCroperX
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const handlePlayVoiceBriefing = () => {
    if ('speechSynthesis' in window) {
      if (isPlayingAudio) {
        window.speechSynthesis.cancel();
        setIsPlayingAudio(false);
      } else {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(briefing.voiceScript);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        utterance.onend = () => setIsPlayingAudio(false);
        utterance.onerror = () => setIsPlayingAudio(false);
        window.speechSynthesis.speak(utterance);
        setIsPlayingAudio(true);
      }
    }
  };

  return (
    <div className="bg-gradient-to-br from-emerald-900/90 via-slate-900 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 border border-emerald-500/30 shadow-xl relative overflow-hidden space-y-6">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/20 text-emerald-300 rounded-2xl border border-emerald-500/30">
            <Sun className="w-7 h-7 animate-spin-slow" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Autonomous Briefing
              </span>
              <span className="text-xs text-emerald-200/60">Generated: {briefing.generatedAt}</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white mt-0.5">
              {briefing.greeting}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={handlePlayVoiceBriefing}
            className={`px-4 py-2.5 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-md w-full sm:w-auto ${
              isPlayingAudio
                ? 'bg-rose-500 hover:bg-rose-600 text-white animate-pulse'
                : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold'
            }`}
          >
            {isPlayingAudio ? (
              <>
                <VolumeX className="w-4 h-4" />
                <span>Stop Voice Briefing</span>
              </>
            ) : (
              <>
                <Volume2 className="w-4 h-4" />
                <span>Play Voice Briefing</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Farm Health Snapshot Headline */}
      <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="text-xs uppercase tracking-wider font-bold text-emerald-300">
              Supervisor State
            </span>
          </div>
          <p className="text-sm text-slate-200 leading-relaxed font-medium">
            {briefing.headline}
          </p>
        </div>
        <div className="flex items-center gap-3 px-4 py-2 bg-black/40 rounded-xl border border-white/10">
          <div className="text-right">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block font-semibold">Health Score</span>
            <span className="text-lg font-bold text-emerald-400">{briefing.overallHealthScore}/100</span>
          </div>
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
        </div>
      </div>

      {/* Top 3 Daily Priorities */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-200/90 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Top 3 Farm Priorities for Today
          </h3>
          <span className="text-xs text-slate-400">Deterministic Autonomous Ranking</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {briefing.top3Priorities.map((prio) => (
            <motion.div
              key={prio.id}
              whileHover={{ y: -2 }}
              className="bg-slate-900/80 rounded-2xl p-4 border border-white/10 flex flex-col justify-between space-y-3 hover:border-emerald-500/40 transition-all shadow-md"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold flex items-center justify-center border border-emerald-500/30">
                    {prio.rank}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    prio.urgency === 'Immediate' 
                      ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                      : prio.urgency === 'Today'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}>
                    {prio.urgency}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-white leading-tight">
                  {prio.title}
                </h4>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {prio.summary}
                </p>
              </div>

              <button
                onClick={() => onSelectTab(prio.targetTab as AppTabId)}
                className="w-full py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 hover:text-emerald-200 border border-emerald-500/30 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <span>{prio.actionLabel}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Multi-Domain 5-Pillar Snapshot */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
        <div className="bg-black/30 p-3 rounded-xl border border-white/5 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-sky-300 flex items-center gap-1">
            <CloudSun className="w-3 h-3" /> Weather
          </span>
          <p className="text-xs text-slate-200 line-clamp-2">{briefing.weatherSummary}</p>
        </div>

        <div className="bg-black/30 p-3 rounded-xl border border-white/5 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1">
            <Droplets className="w-3 h-3" /> Water
          </span>
          <p className="text-xs text-slate-200 line-clamp-2">{briefing.waterSummary}</p>
        </div>

        <div className="bg-black/30 p-3 rounded-xl border border-white/5 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1">
            <Sprout className="w-3 h-3" /> Crop
          </span>
          <p className="text-xs text-slate-200 line-clamp-2">{briefing.cropSummary}</p>
        </div>

        <div className="bg-black/30 p-3 rounded-xl border border-white/5 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-300 flex items-center gap-1">
            <ShieldAlert className="w-3 h-3" /> Risk
          </span>
          <p className="text-xs text-slate-200 line-clamp-2">{briefing.riskSummary}</p>
        </div>

        <div className="bg-black/30 p-3 rounded-xl border border-white/5 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 flex items-center gap-1">
            <Coins className="w-3 h-3" /> Money
          </span>
          <p className="text-xs text-slate-200 line-clamp-2">{briefing.moneySummary}</p>
        </div>

        <div className="bg-black/30 p-3 rounded-xl border border-white/5 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1">
            <CalendarClock className="w-3 h-3" /> Task
          </span>
          <p className="text-xs text-slate-200 line-clamp-2">{briefing.upcomingTask}</p>
        </div>
      </div>
    </div>
  );
};
