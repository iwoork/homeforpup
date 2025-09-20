// hooks/useMessages.ts
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Message, MessageThread, MessageFilters } from '@/types/messaging';
import { MessageService } from '@/services/messageService';

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
  refreshThreads: () => Promise<void>;
}

export const useMessages = ({ 
  userId, 
  userName,
  pollingInterval = 5000 
}: UseMessagesProps): UseMessagesReturn => {
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<MessageThread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [loadingMoreMessages, setLoadingMoreMessages] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<MessageFilters>({});

  const messageService = useRef(new MessageService());
  const pollingRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const lastUpdateRef = useRef<string>('');

  // Helper function to safely get unread count
  const getUnreadCount = (thread: MessageThread, userId: string): number => {
    if (typeof thread.unreadCount === 'object' && thread.unreadCount !== null) {
      return (thread.unreadCount as Record<string, number>)[userId] || 0;
    }
    return 0;
  };

  // Fetch threads from DynamoDB
  const fetchThreads = useCallback(async () => {
    if (!userId) return;

    try {
      const fetchedThreads = await messageService.current.getUserThreads();
      
      // Check if data has actually changed to avoid unnecessary re-renders
      const newLastUpdate = fetchedThreads[0]?.updatedAt || '';
      if (newLastUpdate === lastUpdateRef.current && threads.length > 0) {
        return;
      }
      
      lastUpdateRef.current = newLastUpdate;
      setThreads(fetchedThreads);
      
      // Update unread count
      const totalUnread = fetchedThreads.reduce((sum, thread) => 
        sum + getUnreadCount(thread, userId), 0
      );
      setUnreadCount(totalUnread);
      
      // Update selected thread if it exists in the new data
      if (selectedThread) {
        const updatedSelectedThread = fetchedThreads.find(t => t.id === selectedThread.id);
        if (updatedSelectedThread) {
          setSelectedThread(updatedSelectedThread);
        }
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching threads:', err);
      setError('Failed to load conversations');
    }
  }, [userId, selectedThread?.id, threads.length]);

  // Fetch messages for selected thread
  const fetchMessages = useCallback(async (threadId: string, append: boolean = false) => {
    try {
      if (!append) setMessages([]);
      
      const fetchedMessages = await messageService.current.getThreadMessages(threadId, 50);
      
      if (append) {
        setMessages(prev => [...prev, ...fetchedMessages]);
      } else {
        setMessages(fetchedMessages);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to load messages');
    }
  }, []);

  // Initial load
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      await fetchThreads();
      setLoading(false);
    };

    if (userId) {
      initializeData();
    }
  }, [userId, fetchThreads]);

  // Set up polling for real-time updates
  useEffect(() => {
    if (!userId || loading) return;

    const startPolling = () => {
      pollingRef.current = setInterval(() => {
        fetchThreads();
        
        // Also refresh messages for selected thread
        if (selectedThread) {
          fetchMessages(selectedThread.id);
        }
      }, pollingInterval);
    };

    startPolling();

    // Cleanup polling on unmount or dependency change
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [userId, loading, selectedThread?.id, pollingInterval, fetchThreads, fetchMessages]);

  // Handle thread selection
  const selectThread = useCallback(async (thread: MessageThread) => {
    setSelectedThread(thread);
    await fetchMessages(thread.id);
    
    // Mark as read if there are unread messages
    if (getUnreadCount(thread, userId) > 0) {
      markThreadAsRead(thread.id);
    }
  }, [fetchMessages, userId]);

  // Send new message (create thread)
  const sendMessage = useCallback(async (values: ComposeMessageFormValues, recipientName: string) => {
    setSendingMessage(true);
    try {
      const { thread, message } = await messageService.current.createThread(
        userId,
        userName,
        values.recipient,
        recipientName,
        values.subject,
        values.content,
        values.messageType
      );

      // Update local state
      setThreads(prev => [thread, ...prev]);
      setSelectedThread(thread);
      setMessages([message]);
      
    } catch (err) {
      console.error('Failed to send message:', err);
      throw err;
    } finally {
      setSendingMessage(false);
    }
  }, [userId, userName]);

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

      const message = await messageService.current.sendReply(
        selectedThread.id,
        userId,
        userName,
        otherParticipant || '',
        recipientName,
        content,
        selectedThread.subject
      );

      // Update local messages
      setMessages(prev => [...prev, message]);
      
      // Refresh threads to update counts and last message
      await fetchThreads();
      
    } catch (err) {
      console.error('Failed to send reply:', err);
      throw err;
    } finally {
      setSendingMessage(false);
    }
  }, [selectedThread, userId, userName, fetchThreads]);

  // Mark thread as read
  const markThreadAsRead = useCallback(async (threadId: string) => {
    try {
      await messageService.current.markThreadAsRead(threadId);
      
      // Refresh threads to get updated data from server
      await fetchThreads();
      
    } catch (err) {
      console.error('Failed to mark thread as read:', err);
    }
  }, [fetchThreads]);

  // Delete thread
  const deleteThread = useCallback(async (threadId: string) => {
    try {
      await messageService.current.deleteThread(threadId);
      
      setThreads(prev => prev.filter(t => t.id !== threadId));
      
      if (selectedThread?.id === threadId) {
        setSelectedThread(null);
        setMessages([]);
      }
      
    } catch (err) {
      console.error('Failed to delete thread:', err);
      throw err;
    }
  }, [selectedThread?.id]);

  // Search/filter threads
  const searchThreads = useCallback(async (newFilters: MessageFilters) => {
    setFilters(newFilters);
    try {
      const filteredThreads = await messageService.current.searchThreads(userId, newFilters);
      setThreads(filteredThreads);
    } catch (err) {
      console.error('Failed to search threads:', err);
    }
  }, [userId]);

  // Load more messages for current thread
  const loadMoreMessages = useCallback(async () => {
    if (!selectedThread || loadingMoreMessages) return;

    setLoadingMoreMessages(true);
    try {
      await fetchMessages(selectedThread.id, true);
    } catch (err) {
      console.error('Failed to load more messages:', err);
    } finally {
      setLoadingMoreMessages(false);
    }
  }, [selectedThread, loadingMoreMessages, fetchMessages]);

  // Manual refresh
  const refreshThreads = useCallback(async () => {
    await fetchThreads();
    if (selectedThread) {
      await fetchMessages(selectedThread.id);
    }
  }, [fetchThreads, selectedThread, fetchMessages]);

  // Filter threads based on current filters
  const filteredThreads = threads.filter(thread => {
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