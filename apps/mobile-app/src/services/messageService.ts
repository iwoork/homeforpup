import { config } from '../config/config';
import authService from './authService';

const API_BASE_URL = config.api.baseUrl;

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
  threadId?: string;
  replyTo?: string;
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
  otherParticipant?: string;
  otherParticipantName?: string;
}

export interface SendMessageRequest {
  recipientId: string;
  recipientName?: string;
  subject: string;
  content: string;
  messageType?: 'inquiry' | 'general' | 'business' | 'urgent';
}

export interface SendReplyRequest {
  threadId: string;
  content: string;
  receiverId: string;
  receiverName?: string;
  subject?: string;
}

class MessageService {
  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const token = await authService.getAuthToken();
    
    console.log('Making request to:', `${API_BASE_URL}${endpoint}`);
    console.log('Token exists:', !!token);
    console.log('Token preview:', token?.substring(0, 50) + '...');
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response body:', errorText);
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText };
      }
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const responseText = await response.text();
    console.log('Success response body:', responseText);
    return JSON.parse(responseText);
  }

  /**
   * Get all message threads for the authenticated user
   */
  async getThreads(): Promise<MessageThread[]> {
    try {
      console.log('Fetching threads from:', `${API_BASE_URL}/messages/threads`);
      const data = await this.makeRequest('/messages/threads');
      console.log('Threads response:', data);
      return data.threads || [];
    } catch (error) {
      console.error('Error fetching threads:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      throw error;
    }
  }

  /**
   * Get all messages in a specific thread
   */
  async getMessages(threadId: string, limit: number = 50): Promise<Message[]> {
    try {
      const data = await this.makeRequest(`/messages/threads/${threadId}/messages?limit=${limit}`);
      return data.messages || [];
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }

  /**
   * Send a new message (creates a new thread)
   */
  async sendMessage(request: SendMessageRequest): Promise<{ thread: MessageThread; message: Message }> {
    try {
      console.log('📧 messageService.sendMessage called with:', {
        recipientId: request.recipientId,
        recipientName: request.recipientName,
        subject: request.subject,
        contentLength: request.content?.length,
        messageType: request.messageType,
        hasRecipientId: !!request.recipientId,
        hasSubject: !!request.subject,
        hasContent: !!request.content,
      });
      
      const requestBody = JSON.stringify(request);
      console.log('📦 Request body:', requestBody);
      
      return await this.makeRequest('/messages/send', {
        method: 'POST',
        body: requestBody,
      });
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  /**
   * Reply to an existing thread
   */
  async sendReply(request: SendReplyRequest): Promise<{ message: Message }> {
    try {
      return await this.makeRequest('/messages/reply', {
        method: 'POST',
        body: JSON.stringify(request),
      });
    } catch (error) {
      console.error('Error sending reply:', error);
      throw error;
    }
  }

  /**
   * Mark a thread as read
   */
  async markThreadAsRead(threadId: string): Promise<{ success: boolean; markedCount: number }> {
    try {
      return await this.makeRequest(`/messages/threads/${threadId}/read`, {
        method: 'PATCH',
      });
    } catch (error) {
      console.error('Error marking thread as read:', error);
      throw error;
    }
  }

  /**
   * Get unread message count across all threads
   */
  async getUnreadCount(): Promise<number> {
    try {
      const threads = await this.getThreads();
      // This would need userId from auth context
      // For now, we'll sum all unread counts
      return threads.reduce((sum, thread) => {
        const counts = Object.values(thread.unreadCount);
        return sum + counts.reduce((a, b) => a + b, 0);
      }, 0);
    } catch (error) {
      console.error('Error getting unread count:', error);
      return 0;
    }
  }
}

export const messageService = new MessageService();

