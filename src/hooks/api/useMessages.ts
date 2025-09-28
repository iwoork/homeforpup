// hooks/useMessages.ts
'use client';

import { useState, useCallback, useMemo } from 'react';
import useSWR, { mutate } from 'swr';
import { Message, MessageThread, MessageFilters } from '@/types';
import { useAuth } from '@/hooks';

// Type definition for compose message form
interface ComposeMessageFormValues {
  recipient: string;
  subject: string;
  content: string;
  messageType?: string;
}

interface UseMessagesProps {
  userId: string;
  userName: string;
  pollingInterval?: number; // in milliseconds, default 5000 (5 seconds)
}

interface UseMessagesReturn {
  threads: MessageThread[];
  selectedThread: MessageThread | null;
  messages: Message[];
  unreadCount: number;
  loading: boolean;
  sendingMessage: boolean;
  loadingMoreMessages: boolean;
  error: string | null;
  
  // Actions
  selectThread: (thread: MessageThread) => void;
  sendMessage: (values: ComposeMessageFormValues, recipientName: string) => Promise<void>;
  sendReply: (content: string) => Promise<void>;
  markThreadAsRead: (threadId: string) => void;
  deleteThread: (threadId: string) => void;
  searchThreads: (filters: MessageFilters) => void;
  loadMoreMessages: () => Promise<void>;
  refreshThreads: () => void;
}

// API fetcher function with NextAuth session cookies
const createFetcher = () => {
  return async (url: string) => {
    const response = await fetch(url, {
      credentials: 'include', // Include session cookies
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  };
};

// API request function with NextAuth session cookies
const createApiRequest = () => {
  return async (url: string, options: RequestInit = {}) => {
    const response = await fetch(url, {
      ...options,
      credentials: 'include', // Include session cookies
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  };
};

export const useMessages = ({ 
  userId, 
  pollingInterval = 5000 
}: UseMessagesProps): UseMessagesReturn => {
  const [selectedThread, setSelectedThread] = useState<MessageThread | null>(null);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [loadingMoreMessages, setLoadingMoreMessages] = useState(false);
  const [filters, setFilters] = useState<MessageFilters>({});

  // Create memoized fetcher and request functions
  const fetcher = useMemo(() => createFetcher(), []);
  const apiRequest = useMemo(() => createApiRequest(), []);

  // Fetch threads using SWR with automatic revalidation
  const {
    data: threadsData,
    error: threadsError,
    isLoading: threadsLoading,
    mutate: mutateThreads
  } = useSWR(
    userId ? '/api/messages/threads' : null,
    fetcher,
    {
      refreshInterval: pollingInterval,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 2000, // Prevent duplicate requests within 2 seconds
      onError: (error) => {
        console.error('Error fetching threads:', error);
      },
      onSuccess: (data) => {
        console.log('Successfully fetched threads:', data);
      }
    }
  );

  // Debug logging for threads
  console.log('useMessages hook state:', {
    userId,
    userIdType: typeof userId,
    userIdLength: userId?.length,
    threadsData,
    threadsError,
    threadsLoading,
    url: userId ? '/api/messages/threads' : null,
    willMakeRequest: !!userId
  });

  // Fetch messages for selected thread using SWR
  const {
    data: messagesData,
    error: messagesError,
    isLoading: messagesLoading,
    mutate: mutateMessages
  } = useSWR(
    selectedThread ? `/api/messages/threads/${selectedThread.id}/messages` : null,
    fetcher,
    {
      refreshInterval: selectedThread ? pollingInterval : 0,
      revalidateOnFocus: true,
      onError: (error) => {
        console.error('Error fetching messages:', error);
      }
    }
  );

  const threads = threadsData?.threads || [];
  const messages = messagesData?.messages || [];
  const loading = threadsLoading || messagesLoading;
  const error = threadsError?.message || messagesError?.message || null;

  // Helper function to safely get unread count
  const getUnreadCount = (thread: MessageThread, userId: string): number => {
    console.log(`Thread ${thread.id} unread for user ${userId}:`, {
      threadUnreadCount: thread.unreadCount,
      userId,
      userIdType: typeof userId,
      result: typeof thread.unreadCount === 'object' && thread.unreadCount !== null 
        ? (thread.unreadCount as Record<string, number>)[userId] || 0 
        : 0
    });
    
    if (typeof thread.unreadCount === 'object' && thread.unreadCount !== null) {
      return (thread.unreadCount as Record<string, number>)[userId] || 0;
    }
    return 0;
  };

  // Calculate total unread count
  const unreadCount = useMemo(() => {
    console.log('Calculating unread count:', {
      threadsCount: threads.length,
      userId,
      userIdType: typeof userId,
      threads: threads.map(t => ({ id: t.id, unreadCount: t.unreadCount }))
    });
    
    const total = threads.reduce((sum: number, thread: MessageThread) => sum + getUnreadCount(thread, userId), 0);
    console.log('Total unread count:', total);
    return total;
  }, [threads, userId]);

  // Handle thread selection
  const selectThread = useCallback(async (thread: MessageThread) => {
    setSelectedThread(thread);
    
    // Mark as read if there are unread messages
    if (getUnreadCount(thread, userId) > 0) {
      markThreadAsRead(thread.id);
    }
  }, [userId]);

  // Send new message (create thread)
  const sendMessage = useCallback(async (values: ComposeMessageFormValues, recipientName: string) => {
    setSendingMessage(true);
    try {
      const data = await apiRequest('/api/messages/send', {
        method: 'POST',
        body: JSON.stringify({
          recipientId: values.recipient,
          recipientName,
          subject: values.subject,
          content: values.content,
          messageType: values.messageType
        }),
      });

      // Update local state
      setSelectedThread(data.thread);
      
      // Refresh threads and messages
      mutateThreads();
      mutate(`/api/messages/threads/${data.thread.id}/messages`);
      
    } catch (err) {
      console.error('Failed to send message:', err);
      throw err;
    } finally {
      setSendingMessage(false);
    }
  }, [apiRequest, mutateThreads]);

  // Send reply to existing thread
  const sendReply = useCallback(async (content: string) => {
    if (!selectedThread) return;

    setSendingMessage(true);
    try {
      const otherParticipant = selectedThread.participants.find(p => p !== userId);
      
      // Try to get participant name safely
      let recipientName = 'Unknown';
      if (otherParticipant) {
        if ('participantNames' in selectedThread && selectedThread.participantNames) {
          recipientName = (selectedThread.participantNames as Record<string, string>)[otherParticipant] || 'Unknown';
        } else if (selectedThread.lastMessage.senderId === otherParticipant) {
          recipientName = selectedThread.lastMessage.senderName || 'Unknown';
        }
      }

      await apiRequest('/api/messages/reply', {
        method: 'POST',
        body: JSON.stringify({
          threadId: selectedThread.id,
          content,
          receiverId: otherParticipant || '',
          receiverName: recipientName,
          subject: selectedThread.subject
        }),
      });

      // Refresh both threads and messages
      mutateThreads();
      mutateMessages();
      
    } catch (err) {
      console.error('Failed to send reply:', err);
      throw err;
    } finally {
      setSendingMessage(false);
    }
  }, [selectedThread, userId, apiRequest, mutateThreads, mutateMessages]);

  // Mark thread as read
  const markThreadAsRead = useCallback(async (threadId: string) => {
    try {
      await apiRequest(`/api/messages/threads/${threadId}/read`, {
        method: 'PATCH',
      });
      
      // Refresh threads to get updated data from server
      mutateThreads();
      
    } catch (err) {
      console.error('Failed to mark thread as read:', err);
    }
  }, [apiRequest, mutateThreads]);

  // Delete thread
  const deleteThread = useCallback(async (threadId: string) => {
    try {
      await apiRequest(`/api/messages/threads/${threadId}`, {
        method: 'DELETE',
      });
      
      if (selectedThread?.id === threadId) {
        setSelectedThread(null);
      }
      
      // Refresh threads
      mutateThreads();
      
    } catch (err) {
      console.error('Failed to delete thread:', err);
      throw err;
    }
  }, [selectedThread?.id, apiRequest, mutateThreads]);

  // Search/filter threads (client-side filtering for now)
  const searchThreads = useCallback((newFilters: MessageFilters) => {
    setFilters(newFilters);
  }, []);

  // Load more messages for current thread
  const loadMoreMessages = useCallback(async () => {
    if (!selectedThread || loadingMoreMessages) return;

    setLoadingMoreMessages(true);
    try {
      // This could be enhanced to support pagination
      const data = await fetcher(`/api/messages/threads/${selectedThread.id}/messages?limit=100`);
      mutate(`/api/messages/threads/${selectedThread.id}/messages`, data, false);
    } catch (err) {
      console.error('Failed to load more messages:', err);
    } finally {
      setLoadingMoreMessages(false);
    }
  }, [selectedThread, loadingMoreMessages, fetcher]);

  // Manual refresh
  const refreshThreads = useCallback(() => {
    mutateThreads();
    if (selectedThread) {
      mutateMessages();
    }
  }, [mutateThreads, mutateMessages, selectedThread]);

  // Filter threads based on current filters
  const filteredThreads = useMemo(() => {
    return threads.filter((thread: MessageThread) => {
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const matchesSearch = 
          thread.subject.toLowerCase().includes(searchTerm) ||
          thread.lastMessage.content.toLowerCase().includes(searchTerm);
        if (!matchesSearch) return false;
      }

      if (filters.read !== undefined) {
        const isUnread = getUnreadCount(thread, userId) > 0;
        if (filters.read && isUnread) return false;
        if (!filters.read && !isUnread) return false;
      }

      if (filters.type && thread.lastMessage.messageType !== filters.type) {
        return false;
      }

      return true;
    });
  }, [threads, filters, userId]);

  return {
    threads: filteredThreads,
    selectedThread,
    messages,
    unreadCount,
    loading,
    sendingMessage,
    loadingMoreMessages,
    error,
    
    selectThread,
    sendMessage,
    sendReply,
    markThreadAsRead,
    deleteThread,
    searchThreads,
    loadMoreMessages,
    refreshThreads
  };
};