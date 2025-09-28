// ============================================================================
// MESSAGING TYPES
// ============================================================================

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  receiverId: string;
  receiverName: string;
  subject: string;
  content: string;
  timestamp: string;
  read: boolean;
  messageType: 'inquiry' | 'general' | 'business' | 'urgent';
  attachments?: MessageAttachment[];
  threadId?: string; // For message threading
  replyTo?: string; // ID of message being replied to
}

export interface MessageAttachment {
  id: string;
  filename: string;
  url: string;
  size: number;
  type: string;
}

export interface MessageThread {
  id: string;
  subject: string;
  participants: string[];
  participantNames?: Record<string, string>;
  lastMessage?: Message;
  messageCount: number;
  unreadCount: Record<string, number>;
  createdAt: string;
  updatedAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
  isActive: boolean;
  expiresAt?: string;
}

export interface MessagesResponse {
  messages: Message[];
  threads: MessageThread[];
  unreadCount: number;
  totalCount: number;
}

export interface AnnouncementsResponse {
  announcements: Announcement[];
  totalCount: number;
}

export interface SendMessageRequest {
  recipientId: string;
  recipientName?: string;
  subject: string;
  content: string;
  messageType?: 'inquiry' | 'general' | 'business' | 'urgent';
  threadId?: string;
  replyTo?: string;
  attachments?: MessageAttachment[];
}

export interface CreateAnnouncementRequest {
  title: string;
  content: string;
  priority?: 'low' | 'medium' | 'high';
  category?: string;
  expiresAt?: string;
}

export interface AnnouncementFilters {
  category?: string;
  priority?: 'low' | 'medium' | 'high';
  isActive?: boolean;
  authorId?: string;
}

export interface MessageFilters {
  threadId?: string;
  senderId?: string;
  receiverId?: string;
  messageType?: 'inquiry' | 'general' | 'business' | 'urgent';
  read?: boolean;
  dateFrom?: string;
  dateTo?: string;
}

export interface WebSocketMessage {
  type: 'message' | 'thread_update' | 'announcement' | 'notification';
  data: any;
  timestamp: string;
}

export interface UseWebSocketMessagesReturn {
  isConnected: boolean;
  lastMessage: WebSocketMessage | null;
  sendMessage: (message: any) => void;
  reconnect: () => void;
}
