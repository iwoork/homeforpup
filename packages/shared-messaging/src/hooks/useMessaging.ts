import { useState, useEffect, useCallback } from 'react';
import { 
  Message, 
  MessageThread, 
  Announcement, 
  MessagesResponse, 
  AnnouncementsResponse,
  SendMessageRequest,
  CreateAnnouncementRequest,
  AnnouncementFilters 
} from '../types';

export const useMessaging = (userId?: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    console.log('useMessaging: fetchMessages called with userId:', userId);
    
    if (!userId) {
      console.log('useMessaging: No userId provided, skipping fetch');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      console.log('useMessaging: Fetching threads from /api/messages/threads');
      
      // Fetch threads first
      const threadsResponse = await fetch('/api/messages/threads', {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        credentials: 'include', // Include cookies for session
      });

      console.log('useMessaging: Threads response status:', threadsResponse.status);

      if (!threadsResponse.ok) {
        const errorText = await threadsResponse.text();
        console.error('useMessaging: Failed to fetch threads:', errorText);
        throw new Error(`Failed to fetch threads: ${threadsResponse.status} ${errorText}`);
      }

      const threadsData = await threadsResponse.json();
      console.log('useMessaging: Threads data received:', threadsData);
      
      setThreads(threadsData.threads || []);
      
      // Calculate unread count from threads
      const unreadCount = threadsData.threads?.reduce((total: number, thread: any) => {
        return total + (thread.unreadCount?.[userId] || 0);
      }, 0) || 0;
      
      setUnreadCount(unreadCount);
      
      // For now, we'll fetch messages when a thread is selected
      // This is more efficient than loading all messages at once
      setMessages([]);
    } catch (err) {
      console.error('useMessaging: Error fetching messages:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const sendMessage = useCallback(async (messageData: SendMessageRequest): Promise<Message> => {
    try {
      setError(null);

      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...messageData, senderId: userId }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      const newMessage: Message = await response.json();
      
      // Update local state
      setMessages(prev => [newMessage, ...prev]);
      
      // Update or create thread
      const existingThread = threads.find(t => 
        t.participants.includes(messageData.recipientId)
      );

      if (existingThread) {
        setThreads(prev => prev.map(t => 
          t.id === existingThread.id 
            ? { ...t, lastMessage: newMessage, messageCount: t.messageCount + 1, updatedAt: newMessage.timestamp }
            : t
        ));
      } else {
        // Create new thread
        const newThread: MessageThread = {
          id: `thread_${Date.now()}`,
          subject: newMessage.subject,
          participants: [userId!, messageData.recipientId],
          lastMessage: newMessage,
          messageCount: 1,
          unreadCount: {},
          createdAt: newMessage.timestamp,
          updatedAt: newMessage.timestamp
        };
        setThreads(prev => [newThread, ...prev]);
      }

      return newMessage;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send message');
      throw err;
    }
  }, [userId, threads]);

  const markAsRead = useCallback(async (messageIds: string[]) => {
    try {
      const response = await fetch('/api/messages/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageIds }),
      });

      if (!response.ok) throw new Error('Failed to mark messages as read');

      // Update local state
      setMessages(prev => prev.map(msg => 
        messageIds.includes(msg.id) ? { ...msg, read: true } : msg
      ));

      // Update unread count
      setUnreadCount(prev => Math.max(0, prev - messageIds.length));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark messages as read');
    }
  }, []);

  const deleteMessage = useCallback(async (messageId: string) => {
    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete message');

      // Update local state
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete message');
    }
  }, []);

  const fetchThreadMessages = useCallback(async (threadId: string) => {
    try {
      const response = await fetch(`/api/messages/threads/${threadId}/messages`);
      
      if (!response.ok) throw new Error('Failed to fetch thread messages');
      
      const data = await response.json();
      return data.messages;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch thread messages');
      return [];
    }
  }, []);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  return {
    messages,
    threads,
    unreadCount,
    loading,
    error,
    fetchMessages,
    sendMessage,
    markAsRead,
    deleteMessage,
    fetchThreadMessages,
  };
};
