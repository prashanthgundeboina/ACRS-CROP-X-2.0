import { ChatMessage, ChatConversation, ChatTelemetryCard, UserRole } from '../types';

export class ChatService {
  private broadcastChannel: BroadcastChannel | null = null;
  private messageListeners: Set<(message: ChatMessage) => void> = new Set();
  private reactionListeners: Set<(data: { messageId: string; reactions: Record<string, string[]> }) => void> = new Set();
  private typingListeners: Set<(data: { conversationId: string; userId: string; isTyping: boolean }) => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        this.broadcastChannel = new BroadcastChannel('croperx_chat_channel');
        this.broadcastChannel.onmessage = (e) => {
          const msg = e.data;
          if (msg.type === 'CHAT_MESSAGE_RECEIVED') {
            this.messageListeners.forEach((l) => l(msg.data));
          } else if (msg.type === 'CHAT_MESSAGE_REACTED') {
            this.reactionListeners.forEach((l) => l(msg.data));
          } else if (msg.type === 'CHAT_TYPING') {
            this.typingListeners.forEach((l) => l(msg.data));
          }
        };
      } catch (err) {
        console.warn('[ChatService] BroadcastChannel init warning:', err);
      }
    }
  }

  /**
   * Get all conversations for a user
   */
  public async getConversations(userId: string): Promise<ChatConversation[]> {
    try {
      const res = await fetch(`/api/chat/conversations?userId=${encodeURIComponent(userId)}`);
      if (res.ok) {
        const data = await res.json();
        return data.conversations || [];
      }
    } catch (e) {
      console.warn('[ChatService] Failed to load conversations:', e);
    }
    return [];
  }

  /**
   * Get messages for a specific conversation
   */
  public async getMessages(conversationId: string): Promise<ChatMessage[]> {
    try {
      const res = await fetch(`/api/chat/messages?conversationId=${encodeURIComponent(conversationId)}`);
      if (res.ok) {
        const data = await res.json();
        return data.messages || [];
      }
    } catch (e) {
      console.warn('[ChatService] Failed to load messages:', e);
    }
    return [];
  }

  /**
   * Send a direct message
   */
  public async sendMessage(params: {
    conversationId?: string;
    senderId: string;
    senderName: string;
    senderRole: UserRole;
    senderAvatar?: string;
    receiverId: string;
    receiverName: string;
    receiverRole: UserRole;
    receiverAvatar?: string;
    text?: string;
    mediaUrl?: string;
    mediaType?: 'image' | 'voice' | 'telemetry';
    telemetryCard?: ChatTelemetryCard;
    voiceDurationSeconds?: number;
    replyToMessageId?: string;
  }): Promise<ChatMessage | null> {
    try {
      const res = await fetch('/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });

      if (res.ok) {
        const data = await res.json();
        const sentMessage: ChatMessage = data.message;
        this.broadcastChannel?.postMessage({
          type: 'CHAT_MESSAGE_RECEIVED',
          data: sentMessage,
        });
        return sentMessage;
      }
    } catch (e) {
      console.error('[ChatService] Failed to send message:', e);
    }
    return null;
  }

  /**
   * React with emoji to a message
   */
  public async reactToMessage(messageId: string, emoji: string, userId: string): Promise<boolean> {
    try {
      const res = await fetch('/api/chat/react', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId, emoji, userId }),
      });
      if (res.ok) {
        const data = await res.json();
        this.broadcastChannel?.postMessage({
          type: 'CHAT_MESSAGE_REACTED',
          data: { messageId, reactions: data.reactions },
        });
        return true;
      }
    } catch (e) {
      console.error('[ChatService] Failed to react:', e);
    }
    return false;
  }

  /**
   * Mark messages as seen in conversation
   */
  public async markSeen(conversationId: string, userId: string): Promise<void> {
    try {
      await fetch('/api/chat/mark-seen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId, userId }),
      });
    } catch (e) {
      // ignore
    }
  }

  /**
   * Broadcast typing state
   */
  public sendTypingStatus(conversationId: string, userId: string, isTyping: boolean): void {
    try {
      fetch('/api/chat/typing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId, userId, isTyping }),
      }).catch(() => {});
    } catch (e) {
      // ignore
    }
  }

  public onMessage(listener: (message: ChatMessage) => void): () => void {
    this.messageListeners.add(listener);
    return () => this.messageListeners.delete(listener);
  }

  public onReaction(listener: (data: { messageId: string; reactions: Record<string, string[]> }) => void): () => void {
    this.reactionListeners.add(listener);
    return () => this.reactionListeners.delete(listener);
  }

  public onTyping(listener: (data: { conversationId: string; userId: string; isTyping: boolean }) => void): () => void {
    this.typingListeners.add(listener);
    return () => this.typingListeners.delete(listener);
  }
}

export const chatService = new ChatService();
