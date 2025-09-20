// services/messageService.ts
'use client';

import { Message, MessageThread, MessageFilters } from '@/types/messaging';

export class MessageService {
  private baseUrl = '/api/messages';
  private getTokenCallback: (() => string | null) | null = null;

  // Set the token getter function from useAuth
  setTokenGetter(getToken: () => string | null) {
    this.getTokenCallback = getToken;
  }

  // Get authentication token from your auth hook
  private async getAuthToken(): Promise<string> {
    if (this.getTokenCallback) {
      const token = this.getTokenCallback();
      if (token) {
        return token;
      }
    }
    
    // Fallback: try to get from localStorage with the correct key structure
    try {
      // Try different possible OIDC storage keys
      const possibleKeys = [
        `oidc.user:${process.env.NEXT_PUBLIC_COGNITO_AUTHORITY}:${process.env.NEXT_PUBLIC_AWS_USER_POOL_CLIENT_ID}`,
        `oidc.user:https://cognito-idp.${process.env.NEXT_PUBLIC_AWS_REGION}.amazonaws.com/${process.env.NEXT_PUBLIC_AWS_USER_POOL_ID}:${process.env.NEXT_PUBLIC_AWS_USER_POOL_CLIENT_ID}`
      ];

      for (const key of possibleKeys) {
        const userData = localStorage.getItem(key);
        if (userData) {
          const parsedData = JSON.parse(userData);
          const token = parsedData.access_token || parsedData.id_token;
          if (token) {
            return token;
          }
        }
      }
    } catch (error) {
      console.warn('Failed to get token from localStorage:', error);
    }
    
    throw new Error('No authentication token available');
  }

  private async makeAuthenticatedRequest(url: string, options: RequestInit = {}) {
    try {
      const token = await this.getAuthToken();
      
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error(`API request failed for ${url}:`, error);
      throw error;
    }
  }

  async getUserThreads(): Promise<MessageThread[]> {
    const data = await this.makeAuthenticatedRequest(`${this.baseUrl}/threads`);
    return data.threads || [];
  }

  async getThreadMessages(threadId: string, limit: number = 50): Promise<Message[]> {
    const data = await this.makeAuthenticatedRequest(
      `${this.baseUrl}/threads/${threadId}/messages?limit=${limit}`
    );
    return data.messages || [];
  }

  async createThread(
    senderId: string, // This will be verified against the JWT token
    senderName: string,
    recipientId: string,
    recipientName: string,
    subject: string,
    content: string,
    messageType?: string
  ): Promise<{ thread: MessageThread; message: Message }> {
    // Note: senderId will be verified on the server against the JWT token
    const data = await this.makeAuthenticatedRequest(`${this.baseUrl}/send`, {
      method: 'POST',
      body: JSON.stringify({
        recipientId,
        recipientName,
        subject,
        content,
        messageType
      }),
    });

    return data;
  }

  async sendReply(
    threadId: string,
    senderId: string, // This will be verified against the JWT token
    senderName: string,
    receiverId: string,
    receiverName: string,
    content: string,
    subject?: string
  ): Promise<Message> {
    // Note: senderId will be verified on the server against the JWT token
    const data = await this.makeAuthenticatedRequest(`${this.baseUrl}/reply`, {
      method: 'POST',
      body: JSON.stringify({
        threadId,
        content,
        receiverId,
        receiverName,
        subject
      }),
    });

    return data.message;
  }

  async markThreadAsRead(threadId: string): Promise<void> {
    await this.makeAuthenticatedRequest(`${this.baseUrl}/threads/${threadId}/read`, {
      method: 'PATCH',
    });
  }

  async deleteThread(threadId: string): Promise<void> {
    await this.makeAuthenticatedRequest(`${this.baseUrl}/threads/${threadId}`, {
      method: 'DELETE',
    });
  }

  async searchThreads(userId: string, filters: MessageFilters): Promise<MessageThread[]> {
    const queryParams = new URLSearchParams();
    
    if (filters.search) queryParams.append('search', filters.search);
    if (filters.read !== undefined) queryParams.append('read', filters.read.toString());
    if (filters.type) queryParams.append('type', filters.type);

    const data = await this.makeAuthenticatedRequest(
      `${this.baseUrl}/threads/search?${queryParams.toString()}`
    );
    return data.threads || [];
  }
}