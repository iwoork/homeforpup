// src/services/messageService.ts (Simplified for development)
import { Message, MessageThread, MessageFilters } from '@/types/messaging';
import { getAccessToken, getMockToken } from '@/utils/auth';

export class MessageService {
  private apiUrl = '/api/messages';

  private async makeRequest<T>(
    url: string, 
    options: RequestInit = {}
  ): Promise<T> {
    try {
      // Try multiple token sources
      let token = getAccessToken();
      
      if (!token) {
        console.log('No access token found, trying mock token...');
        token = getMockToken();
      }
      
      if (!token) {
        console.log('No token found anywhere, using default mock');
        token = 'mock-development-token';
      }

      console.log('Using token:', token ? `${token.substring(0, 20)}...` : 'null');
      
      const response = await fetch(`${this.apiUrl}${url}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          ...options.headers,
        },
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Helper function to safely get unread count
  private getUnreadCount(thread: MessageThread, userId: string): number {
    if (typeof thread.unreadCount === 'object' && thread.unreadCount !== null) {
      return (thread.unreadCount as Record<string, number>)[userId] || 0;
    }
    return 0;
  }

  // Create a new thread and send first message
  async createThread(
    senderId: string,
    senderName: string,
    receiverId: string,
    receiverName: string,
    subject: string,
    content: string,
    messageType: string = 'general'
  ): Promise<{ thread: MessageThread; message: Message }> {
    return this.makeRequest('/send', {
      method: 'POST',
      body: JSON.stringify({
        recipientId: receiverId,
        recipientName: receiverName,
        subject,
        content,
        messageType
      })
    });
  }

  // Send a reply to existing thread
  async sendReply(
    threadId: string,
    senderId: string,
    senderName: string,
    receiverId: string,
    receiverName: string,
    content: string,
    subject?: string
  ): Promise<Message> {
    const response = await this.makeRequest<{ message: Message }>('/reply', {
      method: 'POST',
      body: JSON.stringify({
        threadId,
        content,
        receiverId,
        receiverName,
        subject
      })
    });
    return response.message;
  }

  // Get threads for a user (userId determined from auth token)
  async getUserThreads(): Promise<MessageThread[]> {
    const response = await this.makeRequest<{ threads: MessageThread[] }>('/threads');
    return response.threads;
  }

  // Get messages for a thread
  async getThreadMessages(threadId: string, limit: number = 50): Promise<Message[]> {
    const response = await this.makeRequest<{ messages: Message[] }>(`/threads/${threadId}/messages?limit=${limit}`);
    return response.messages;
  }

  // Mark thread as read for user (userId determined from auth token)
  async markThreadAsRead(threadId: string): Promise<void> {
    await this.makeRequest(`/threads/${threadId}/read`, {
      method: 'PATCH'
    });
  }

  // Delete thread (userId determined from auth token)
  async deleteThread(threadId: string): Promise<void> {
    await this.makeRequest(`/threads/${threadId}`, {
      method: 'DELETE'
    });
  }

  // Search threads (client-side filtering for now)
  async searchThreads(userId: string, filters: MessageFilters): Promise<MessageThread[]> {
    const threads = await this.getUserThreads();
    
    return threads.filter(thread => {
      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const matchesSearch = 
          thread.subject.toLowerCase().includes(searchTerm) ||
          thread.lastMessage.content.toLowerCase().includes(searchTerm);
        if (!matchesSearch) return false;
      }

      // Read filter
      if (filters.read !== undefined) {
        const isUnread = this.getUnreadCount(thread, userId) > 0;
        if (filters.read && isUnread) return false;
        if (!filters.read && !isUnread) return false;
      }

      // Type filter
      if (filters.type && thread.lastMessage.messageType !== filters.type) {
        return false;
      }

      return true;
    });
  }

  // Get total unread count for user
  async getUserUnreadCount(userId: string): Promise<number> {
    const threads = await this.getUserThreads();
    return threads.reduce((total, thread) => 
      total + this.getUnreadCount(thread, userId), 0
    );
  }
}

// Also export as default for compatibility
export default MessageService;