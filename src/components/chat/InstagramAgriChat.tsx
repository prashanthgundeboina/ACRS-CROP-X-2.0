import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Send,
  Image as ImageIcon,
  Mic,
  MicOff,
  Video,
  Phone,
  Paperclip,
  Smile,
  Heart,
  Search,
  CheckCheck,
  Check,
  Clock,
  Sparkles,
  Droplets,
  CloudSun,
  ShieldCheck,
  Play,
  Pause,
  PlusCircle,
  MoreVertical,
  ChevronLeft,
  X,
  Compass,
  ArrowRight,
  Info
} from 'lucide-react';
import { ChatConversation, ChatMessage, ChatTelemetryCard, UserRole } from '../../types';
import { chatService } from '../../services/chatService';
import { LivePresencePulseBadge } from '../common/LivePresencePulseBadge';
import { presenceService } from '../../services/presenceService';

interface InstagramAgriChatProps {
  currentUserId: string;
  currentUserName: string;
  currentUserRole: UserRole;
  currentUserAvatar?: string;
  onInitiateVideoCall?: (targetUserId: string, targetName: string) => void;
  className?: string;
  defaultRecipientId?: string;
}

const AVAILABLE_EMOJIS = ['❤️', '👍', '🌾', '💧', '🔥', '👏', '🚨'];

export const InstagramAgriChat: React.FC<InstagramAgriChatProps> = ({
  currentUserId,
  currentUserName,
  currentUserRole,
  currentUserAvatar,
  onInitiateVideoCall,
  className = '',
  defaultRecipientId,
}) => {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState<'all' | 'advisers' | 'farmers'>('all');
  const [showEmojiBarForMsg, setShowEmojiBarForMsg] = useState<string | null>(null);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [voiceDuration, setVoiceDuration] = useState(0);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [typingUser, setTypingUser] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const voiceTimerRef = useRef<any>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Load conversations
  const loadConversations = async () => {
    const convs = await chatService.getConversations(currentUserId);
    setConversations(convs);
    if (!activeConvId && convs.length > 0) {
      if (defaultRecipientId) {
        const found = convs.find(
          (c) => c.participantA.userId === defaultRecipientId || c.participantB.userId === defaultRecipientId
        );
        if (found) setActiveConvId(found.id);
        else setActiveConvId(convs[0].id);
      } else {
        setActiveConvId(convs[0].id);
      }
    }
  };

  useEffect(() => {
    loadConversations();
    return () => {
      if (voiceTimerRef.current) clearInterval(voiceTimerRef.current);
      if (audioCtxRef.current) {
        const ctx = audioCtxRef.current;
        audioCtxRef.current = null;
        try {
          if (ctx.state !== 'closed') {
            ctx.close().catch(() => {});
          }
        } catch (e) {}
      }
    };
  }, [currentUserId]);

  // Load messages when active conversation changes
  useEffect(() => {
    if (!activeConvId) return;
    const fetchMsgs = async () => {
      const msgs = await chatService.getMessages(activeConvId);
      setMessages(msgs);
      await chatService.markSeen(activeConvId, currentUserId);
    };
    fetchMsgs();
  }, [activeConvId, currentUserId]);

  // Subscribe to real-time chat events
  useEffect(() => {
    const unsubMsg = chatService.onMessage((newMsg) => {
      if (newMsg.conversationId === activeConvId) {
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
        chatService.markSeen(activeConvId, currentUserId);
      }
      loadConversations();
    });

    const unsubReaction = chatService.onReaction(({ messageId, reactions }) => {
      setMessages((prev) =>
        prev.map((m) => (m.id === messageId ? { ...m, reactions } : m))
      );
    });

    const unsubTyping = chatService.onTyping(({ conversationId, userId, isTyping }) => {
      if (conversationId === activeConvId && userId !== currentUserId) {
        setTypingUser(isTyping ? userId : null);
      }
    });

    return () => {
      unsubMsg();
      unsubReaction();
      unsubTyping();
    };
  }, [activeConvId, currentUserId]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isRecordingVoice]);

  // Active conversation object and other participant
  const activeConversation = conversations.find((c) => c.id === activeConvId);
  const otherParticipant = activeConversation
    ? activeConversation.participantA.userId === currentUserId
      ? activeConversation.participantB
      : activeConversation.participantA
    : null;

  // Send Text Message
  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText !== undefined ? customText : inputText;
    if (!textToSend.trim() || !otherParticipant) return;

    setInputText('');
    chatService.sendTypingStatus(activeConvId || '', currentUserId, false);

    const sent = await chatService.sendMessage({
      conversationId: activeConvId || undefined,
      senderId: currentUserId,
      senderName: currentUserName,
      senderRole: currentUserRole,
      senderAvatar: currentUserAvatar,
      receiverId: otherParticipant.userId,
      receiverName: otherParticipant.name,
      receiverRole: otherParticipant.role,
      receiverAvatar: otherParticipant.avatar,
      text: textToSend.trim(),
    });

    if (sent && (!activeConvId || activeConvId === sent.conversationId)) {
      setMessages((prev) => [...prev, sent]);
    }
  };

  // Send Telemetry Card
  const handleSendTelemetryCard = async () => {
    if (!otherParticipant) return;

    const telemetry: ChatTelemetryCard = {
      cropName: 'Wheat (Triticum aestivum)',
      soilMoisture: '28% (Optimal Irrigation Window)',
      weatherCondition: '31°C, Sunny • 42% Humidity',
      soilPh: 6.5,
      fieldZone: 'Zone A - North Parcel',
      latitude: 30.9010,
      longitude: 75.8573,
      timestamp: new Date().toISOString(),
      notes: 'Live canopy spectral reflection normal. Sensor probe depth: 20cm.',
    };

    const sent = await chatService.sendMessage({
      conversationId: activeConvId || undefined,
      senderId: currentUserId,
      senderName: currentUserName,
      senderRole: currentUserRole,
      senderAvatar: currentUserAvatar,
      receiverId: otherParticipant.userId,
      receiverName: otherParticipant.name,
      receiverRole: otherParticipant.role,
      receiverAvatar: otherParticipant.avatar,
      mediaType: 'telemetry',
      telemetryCard: telemetry,
    });

    if (sent) {
      setMessages((prev) => [...prev, sent]);
    }
  };

  // Voice Note Recording
  const handleStartVoiceRecord = () => {
    setIsRecordingVoice(true);
    setVoiceDuration(0);
    voiceTimerRef.current = setInterval(() => {
      setVoiceDuration((d) => d + 1);
    }, 1000);
  };

  const handleStopVoiceRecordAndSend = async () => {
    if (voiceTimerRef.current) clearInterval(voiceTimerRef.current);
    const duration = voiceDuration;
    setIsRecordingVoice(false);
    setVoiceDuration(0);

    if (duration < 1 || !otherParticipant) return;

    const sent = await chatService.sendMessage({
      conversationId: activeConvId || undefined,
      senderId: currentUserId,
      senderName: currentUserName,
      senderRole: currentUserRole,
      senderAvatar: currentUserAvatar,
      receiverId: otherParticipant.userId,
      receiverName: otherParticipant.name,
      receiverRole: otherParticipant.role,
      receiverAvatar: otherParticipant.avatar,
      mediaType: 'voice',
      voiceDurationSeconds: duration,
      mediaUrl: 'simulated_voice_audio',
    });

    if (sent) {
      setMessages((prev) => [...prev, sent]);
    }
  };

  const handleCancelVoiceRecord = () => {
    if (voiceTimerRef.current) clearInterval(voiceTimerRef.current);
    setIsRecordingVoice(false);
    setVoiceDuration(0);
  };

  // Play simulated voice note
  const handlePlayVoice = (msgId: string, durationSec: number = 3) => {
    if (playingVoiceId === msgId) {
      setPlayingVoiceId(null);
      return;
    }

    setPlayingVoiceId(msgId);
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        if (!audioCtxRef.current) audioCtxRef.current = new AudioCtx();
        const ctx = audioCtxRef.current;
        if (ctx.state === 'suspended') ctx.resume();

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.frequency.setValueAtTime(320, ctx.currentTime);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + Math.min(durationSec, 3));
      }
    } catch (e) {
      // ignore
    }

    setTimeout(() => {
      setPlayingVoiceId(null);
    }, durationSec * 1000);
  };

  // Handle Emoji Reaction
  const handleReact = async (messageId: string, emoji: string) => {
    setShowEmojiBarForMsg(null);
    await chatService.reactToMessage(messageId, emoji, currentUserId);
  };

  return (
    <div
      className={`bg-slate-900/95 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row text-white h-[650px] ${className}`}
    >
      {/* ============================================================
          LEFT COLUMN: INSTAGRAM DM LIST & STORIES
          ============================================================ */}
      <div className="w-full md:w-80 lg:w-96 border-b md:border-b-0 md:border-r border-slate-800 flex flex-col bg-slate-950/60 shrink-0">
        {/* Instagram Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-base font-black tracking-tight text-white flex items-center gap-1.5">
              <span>Direct Messages</span>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </span>
          </div>
          <LivePresencePulseBadge status="online" size="xs" showLabel labelText="Online" />
        </div>

        {/* Stories / Active Presence Bar */}
        <div className="px-4 py-3 border-b border-slate-800 overflow-x-auto no-scrollbar flex items-center gap-3">
          {conversations.map((conv) => {
            const part = conv.participantA.userId === currentUserId ? conv.participantB : conv.participantA;
            const isSelected = conv.id === activeConvId;
            return (
              <button
                key={conv.id}
                onClick={() => setActiveConvId(conv.id)}
                className="flex flex-col items-center gap-1 shrink-0 group focus:outline-none"
              >
                <div
                  className={`p-0.5 rounded-full transition-all ${
                    isSelected ? 'ig-story-ring-live scale-105' : 'ig-story-ring'
                  }`}
                >
                  <div className="p-0.5 bg-slate-900 rounded-full">
                    <img
                      src={
                        part.avatar ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
                      }
                      alt={part.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  </div>
                </div>
                <span className="text-[11px] text-slate-300 font-medium truncate w-14 text-center">
                  {part.name.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Filter Chips */}
        <div className="p-3 border-b border-slate-800/80 space-y-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700/80 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/50">
          {conversations.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-xs">
              No active conversations yet.
            </div>
          ) : (
            conversations.map((conv) => {
              const part = conv.participantA.userId === currentUserId ? conv.participantB : conv.participantA;
              const isSelected = conv.id === activeConvId;
              const unread = conv.participantA.userId === currentUserId ? conv.unreadCountA : conv.unreadCountB;

              return (
                <button
                  key={conv.id}
                  onClick={() => setActiveConvId(conv.id)}
                  className={`w-full p-3.5 flex items-center gap-3 text-left transition-colors ${
                    isSelected ? 'bg-slate-800/90 border-l-4 border-indigo-500' : 'hover:bg-slate-900/50'
                  }`}
                >
                  <div className="relative shrink-0">
                    <img
                      src={
                        part.avatar ||
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
                      }
                      alt={part.name}
                      className="w-11 h-11 rounded-full object-cover border border-slate-700"
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 p-0.5 bg-slate-900 rounded-full">
                      <LivePresencePulseBadge status="online" size="xs" />
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <h4 className="text-xs font-bold text-white truncate flex items-center gap-1">
                        {part.name}
                        {part.role === 'farmer_adviser' && (
                          <span title="Certified Agronomist">
                            <ShieldCheck className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          </span>
                        )}
                      </h4>
                      <span className="text-[10px] text-slate-400">
                        {conv.lastMessage ? new Date(conv.lastMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-[11px] text-slate-400 truncate pr-2">
                        {conv.lastMessage?.text || (conv.lastMessage?.mediaType === 'telemetry' ? '📊 Field Telemetry Shared' : 'Voice message')}
                      </p>
                      {unread > 0 && (
                        <span className="px-1.5 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-black shrink-0">
                          {unread}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ============================================================
          RIGHT COLUMN: INSTAGRAM DIRECT CHAT ROOM
          ============================================================ */}
      <div className="flex-1 flex flex-col bg-slate-900 min-w-0">
        {otherParticipant ? (
          <>
            {/* Direct Chat Header */}
            <div className="p-3.5 sm:p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative shrink-0">
                  <img
                    src={
                      otherParticipant.avatar ||
                      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
                    }
                    alt={otherParticipant.name}
                    className="w-10 h-10 rounded-full object-cover border border-slate-700"
                  />
                  <div className="absolute -bottom-0.5 -right-0.5 p-0.5 bg-slate-900 rounded-full">
                    <LivePresencePulseBadge status="online" size="xs" />
                  </div>
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold text-white truncate">{otherParticipant.name}</h3>
                    {otherParticipant.role === 'farmer_adviser' ? (
                      <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-bold border border-blue-500/30">
                        Agronomist
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                        Farmer
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                    <Compass className="w-3 h-3" />
                    <span>Live GPS Synced • Ready for Consultation</span>
                  </p>
                </div>
              </div>

              {/* Header Action Buttons: Video Call, Voice Call */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onInitiateVideoCall?.(otherParticipant.userId, otherParticipant.name)}
                  className="p-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/30 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                  title="Start WebRTC Video Consultation"
                >
                  <Video className="w-4 h-4" />
                  <span className="hidden sm:inline">1-Click Video Call</span>
                </button>
              </div>
            </div>

            {/* Messages Feed */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950">
              {messages.map((msg) => {
                const isMe = msg.senderId === currentUserId;
                const hasReactions = msg.reactions && Object.keys(msg.reactions).length > 0;

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group relative`}
                  >
                    <div className="flex items-end gap-2 max-w-[85%] sm:max-w-[75%]">
                      {!isMe && (
                        <img
                          src={
                            msg.senderAvatar ||
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
                          }
                          alt={msg.senderName}
                          className="w-7 h-7 rounded-full object-cover shrink-0 mb-1 border border-slate-700"
                        />
                      )}

                      <div className="relative">
                        {/* Text Message Bubble */}
                        {msg.text && (
                          <div
                            onDoubleClick={() => handleReact(msg.id, '❤️')}
                            className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-md ${
                              isMe
                                ? 'bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-br-sm'
                                : 'bg-slate-800 border border-slate-700 text-slate-100 rounded-bl-sm'
                            }`}
                          >
                            {msg.text}
                          </div>
                        )}

                        {/* Telemetry Card Bubble */}
                        {msg.telemetryCard && (
                          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950 border border-indigo-500/40 text-xs shadow-xl w-72 sm:w-80">
                            <div className="flex items-center justify-between pb-2 border-b border-indigo-500/20 mb-2.5">
                              <span className="font-bold text-indigo-300 flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                                Live Field Telemetry
                              </span>
                              <span className="text-[10px] text-slate-400">{msg.telemetryCard.fieldZone}</span>
                            </div>

                            <div className="space-y-1.5 text-slate-200">
                              <div className="flex justify-between">
                                <span className="text-slate-400">Crop:</span>
                                <span className="font-semibold text-emerald-300">{msg.telemetryCard.cropName}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Soil Moisture:</span>
                                <span className="font-bold text-cyan-300">{msg.telemetryCard.soilMoisture}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-slate-400">Weather:</span>
                                <span className="text-amber-300">{msg.telemetryCard.weatherCondition}</span>
                              </div>
                              {msg.telemetryCard.notes && (
                                <p className="text-[11px] text-slate-300 italic pt-1 border-t border-white/5">
                                  "{msg.telemetryCard.notes}"
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Voice Note Bubble */}
                        {msg.mediaType === 'voice' && (
                          <div
                            className={`p-3 rounded-2xl flex items-center gap-3 shadow-md ${
                              isMe
                                ? 'bg-indigo-600 text-white rounded-br-sm'
                                : 'bg-slate-800 border border-slate-700 text-white rounded-bl-sm'
                            }`}
                          >
                            <button
                              onClick={() => handlePlayVoice(msg.id, msg.voiceDurationSeconds)}
                              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-all shrink-0 cursor-pointer"
                            >
                              {playingVoiceId === msg.id ? (
                                <Pause className="w-4 h-4 text-white" />
                              ) : (
                                <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                              )}
                            </button>
                            <div className="flex items-center gap-1">
                              {[30, 70, 45, 90, 60, 80, 40, 65, 30].map((h, i) => (
                                <span
                                  key={i}
                                  style={{ height: `${h * 0.25}px` }}
                                  className={`w-1 rounded-full ${
                                    playingVoiceId === msg.id ? 'bg-amber-300 animate-pulse' : 'bg-white/60'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-[11px] font-mono opacity-80">
                              0:0{msg.voiceDurationSeconds || 3}
                            </span>
                          </div>
                        )}

                        {/* Emoji Reaction Popover on Hover */}
                        <div
                          className={`absolute -top-7 ${
                            isMe ? 'right-0' : 'left-0'
                          } opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-slate-800 border border-slate-700 rounded-full px-2 py-0.5 shadow-lg z-10`}
                        >
                          {AVAILABLE_EMOJIS.map((emoji) => (
                            <button
                              key={emoji}
                              onClick={() => handleReact(msg.id, emoji)}
                              className="text-xs hover:scale-125 transition-transform"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>

                        {/* Displayed Emoji Badges */}
                        {hasReactions && (
                          <div
                            className={`flex items-center gap-1 absolute -bottom-2.5 ${
                              isMe ? 'right-2' : 'left-2'
                            } bg-slate-800 border border-slate-700 rounded-full px-1.5 py-0.5 shadow-md`}
                          >
                            {Object.entries(msg.reactions!).map(([emoji, users]) => (
                              <span key={emoji} className="text-[11px] flex items-center">
                                {emoji}
                                {users.length > 1 && (
                                  <span className="text-[9px] text-slate-300 font-bold ml-0.5">
                                    {users.length}
                                  </span>
                                )}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Timestamp & Delivery State */}
                    <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-500 px-1">
                      <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {isMe && (
                        <span>
                          {msg.status === 'seen' ? (
                            <CheckCheck className="w-3.5 h-3.5 text-indigo-400 inline" />
                          ) : (
                            <Check className="w-3.5 h-3.5 text-slate-400 inline" />
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Typing indicator */}
              {typingUser && (
                <div className="flex items-center gap-2 text-xs text-slate-400 italic">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]" />
                  </div>
                  <span>{otherParticipant.name} is typing...</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Suggestion Chips */}
            <div className="px-4 py-2 bg-slate-950/70 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto no-scrollbar text-xs">
              <button
                onClick={handleSendTelemetryCard}
                className="px-3 py-1 rounded-full bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border border-indigo-500/40 shrink-0 font-medium flex items-center gap-1.5 transition-all"
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
                Share Telemetry
              </button>

              <button
                onClick={() => handleSendMessage('Can you review my irrigation schedule for tomorrow morning?')}
                className="px-3 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 shrink-0 transition-all"
              >
                💧 Review Irrigation
              </button>

              <button
                onClick={() => handleSendMessage('Please prescribe dosage for nitrogen top-dressing.')}
                className="px-3 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 shrink-0 transition-all"
              >
                🧪 Nutrient Dosage
              </button>
            </div>

            {/* Input Bar */}
            <div className="p-3.5 border-t border-slate-800 bg-slate-950">
              {isRecordingVoice ? (
                <div className="flex items-center justify-between gap-3 bg-red-950/40 border border-red-500/50 rounded-2xl p-2.5 text-white">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                    <span className="text-xs font-bold text-red-400">Recording Voice Note... ({voiceDuration}s)</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCancelVoiceRecord}
                      className="px-3 py-1 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleStopVoiceRecordAndSend}
                      className="px-4 py-1 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold"
                    >
                      Send Voice
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleStartVoiceRecord}
                    className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all shrink-0"
                    title="Record Voice Note"
                  >
                    <Mic className="w-4 h-4 text-emerald-400" />
                  </button>

                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => {
                      setInputText(e.target.value);
                      chatService.sendTypingStatus(activeConvId || '', currentUserId, true);
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Message..."
                    className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />

                  <button
                    onClick={() => handleSendMessage()}
                    disabled={!inputText.trim()}
                    className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white disabled:text-slate-600 transition-all shrink-0 cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-400">
            <Sparkles className="w-12 h-12 text-indigo-400 mb-3 animate-pulse" />
            <h3 className="text-lg font-bold text-white mb-1">CroperX Agronomy Chat</h3>
            <p className="text-xs text-slate-400 max-w-sm">
              Select an agronomist or farmer from the left to start instant direct messaging, share live soil telemetry, or launch 1-click video calls.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
