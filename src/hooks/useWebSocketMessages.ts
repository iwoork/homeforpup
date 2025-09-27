// hooks/useWebSocketMessages.ts
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Message, MessageThread } from '@/types';
import { useWebSocket, WebSocketMessage } from './useWebSocket';
import { useAuth } from '@/hooks';

interface UseWebSocketMessagesProps {
  userId: string;
  userName: string;
}

interface UseWebSocketMessagesReturn {
  threads: MessageThread[];
  selectedThread: MessageThread | null;
  messages: Message[];
  unreadCount: number;
  loading: boolean;
  sendingMessage: boolean;
  error: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: string | null;
  
  // Actions
  selectThread: (thread: MessageThread) => void;
  sendMessage: (values: any, recipientName: string) => Promise<void>;
  sendReply: (content: string) => Promise<void>;
  markThreadAsRead: (threadId: string) => void;
  deleteThread: (threadId: string) => void;
  refreshThreads: () => void;
  reconnect: () => void;
}

export const useWebSocketMessages = ({ 
  userId, 
  userName 
}: UseWebSocketMessagesProps): UseWebSocketMessagesReturn => {
  const { getToken } = useAuth();
  const { isConnected, isConnecting, error: connectionError, lastMessage, sendMessage: sendWebSocketMessage, reconnect } = useWebSocket();
  
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [selectedThread, setSelectedThread] = useState<MessageThread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const messagesRef = useRef<Message[]>([]);
  const threadsRef = useRef<MessageThread[]>([]);

  // Update refs when state changes
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    threadsRef.current = threads;
  }, [threads]);

  // Handle incoming WebSocket messages
  useEffect(() => {
    if (!lastMessage) return;

    switch (lastMessage.type) {
      case 'message':
        handleNewMessage(lastMessage.data);
        break;
      case 'typing':
        handleTypingIndicator(lastMessage.data);
        break;
      case 'read':
        handleReadReceipt(lastMessage.data);
        break;
      case 'error':
        setError(lastMessage.data.message || 'WebSocket error');
        break;
      default:
        console.log('Unknown WebSocket message type:', lastMessage.type);
    }
  }, [lastMessage]);

  const handleNewMessage = useCallback((messageData: any) => {
    const newMessage: Message = {
      id: messageData.id,
      threadId: messageData.threadId,
      senderId: messageData.senderId,
      senderName: messageData.senderName,
      senderAvatar: messageData.senderAvatar,
      receiverId: messageData.receiverId,
      receiverName: messageData.receiverName,
      content: messageData.content,
      subject: messageData.subject,
      messageType: messageData.messageType || 'general',
      timestamp: messageData.timestamp,
      read: messageData.read || false,
      attachments: messageData.attachments || []
    };

    // Add message to current messages if it's for the selected thread
    if (selectedThread && newMessage.threadId === selectedThread.id) {
      setMessages(prev => [...prev, newMessage]);
    }

    // Update thread with new message
    setThreads(prev => prev.map(thread => {
      if (thread.id === newMessage.threadId) {
        return {
          ...thread,
          lastMessage: newMessage,
          messageCount: thread.messageCount + 1,
          updatedAt: newMessage.timestamp,
          unreadCount: {
            ...thread.unreadCount,
            [userId]: (thread.unreadCount[userId] || 0) + (newMessage.receiverId === userId ? 1 : 0)
          }
        };
      }
      return thread;
    }));

    // Update unread count
    if (newMessage.receiverId === userId) {
      setUnreadCount(prev => prev + 1);
    }
  }, [selectedThread, userId]);

  const handleTypingIndicator = useCallback((typingData: any) => {
    // Handle typing indicators
    console.log('Typing indicator:', typingData);
  }, []);

  const handleReadReceipt = useCallback((readData: any) => {
    // Update message read status
    setMessages(prev => prev.map(msg => 
      msg.id === readData.messageId ? { ...msg, read: true } : msg
    ));

    // Update thread unread count
    setThreads(prev => prev.map(thread => {
      if (thread.id === readData.threadId) {
        return {
          ...thread,
          unreadCount: {
            ...thread.unreadCount,
            [userId]: Math.max(0, (thread.unreadCount[userId] || 0) - 1)
          }
        };
      }
      return thread;
    }));
  }, [userId]);

  // Fetch initial threads
  const fetchThreads = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);

      const token = await getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await fetch('/api/messages/threads', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch threads');
      }

      const data = await response.json();
      setThreads(data.threads || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (err) {
      console.error('Failed to fetch threads:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch threads');
    } finally {
      setLoading(false);
    }
  }, [userId, getToken]);

  // Fetch messages for selected thread
  const fetchMessages = useCallback(async (threadId: string) => {
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await fetch(`/api/messages/threads/${threadId}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const data = await response.json();
      setMessages(data.messages || []);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch messages');
    }
  }, [getToken]);

  // Select thread
  const selectThread = useCallback(async (thread: MessageThread) => {
    setSelectedThread(thread);
    await fetchMessages(thread.id);
    
    // Mark as read if there are unread messages
    const userUnreadCount = thread.unreadCount[userId] || 0;
    if (userUnreadCount > 0) {
      markThreadAsRead(thread.id);
    }
  }, [fetchMessages, userId]);

  // Send new message
  const sendMessage = useCallback(async (values: any, recipientName: string) => {
    setSendingMessage(true);
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const response = await fetch('/api/messages/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          recipientId: values.recipient,
          recipientName,
          subject: values.subject,
          content: values.content,
          messageType: values.messageType
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      
      // Update local state
      setSelectedThread(data.thread);
      setMessages(prev => [...prev, data.message]);
      
      // Update threads
      setThreads(prev => {
        const existingThread = prev.find(t => t.id === data.thread.id);
        if (existingThread) {
          return prev.map(t => 
            t.id === data.thread.id ? data.thread : t
          );
        } else {
          return [data.thread, ...prev];
        }
      });

      // Send via WebSocket for real-time delivery
      if (isConnected) {
        sendWebSocketMessage({
          type: 'message',
          data: data.message,
          timestamp: Date.now(),
          threadId: data.thread.id
        });
      }

    } catch (err) {
      console.error('Failed to send message:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');
      throw err;
    } finally {
      setSendingMessage(false);
    }
  }, [getToken, isConnected, sendWebSocketMessage]);

  // Send reply
  const sendReply = useCallback(async (content: string) => {
    if (!selectedThread) return;

    setSendingMessage(true);
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      const otherParticipant = selectedThread.participants.find(p => p !== userId);
      let recipientName = 'Unknown';
      
      if (otherParticipant && selectedThread.participantNames) {
        recipientName = selectedThread.participantNames[otherParticipant] || 'Unknown';
      }

      const response = await fetch('/api/messages/reply', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          threadId: selectedThread.id,
          content,
          receiverId: otherParticipant || '',
          receiverName: recipientName,
          subject: selectedThread.subject
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send reply');
      }

      const data = await response.json();
      
      // Update local state
      setMessages(prev => [...prev, data.message]);
      
      // Update thread
      setThreads(prev => prev.map(t => 
        t.id === selectedThread.id ? { ...t, lastMessage: data.message, updatedAt: data.message.timestamp } : t
      ));

      // Send via WebSocket for real-time delivery
      if (isConnected) {
        sendWebSocketMessage({
          type: 'message',
          data: data.message,
          timestamp: Date.now(),
          threadId: selectedThread.id
        });
      }

    } catch (err) {
      console.error('Failed to send reply:', err);
      setError(err instanceof Error ? err.message : 'Failed to send reply');
      throw err;
    } finally {
      setSendingMessage(false);
    }
  }, [selectedThread, userId, getToken, isConnected, sendWebSocketMessage]);

  // Mark thread as read
  const markThreadAsRead = useCallback(async (threadId: string) => {
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      await fetch(`/api/messages/threads/${threadId}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      // Update local state
      setThreads(prev => prev.map(t => 
        t.id === threadId ? { ...t, unreadCount: { ...t.unreadCount, [userId]: 0 } } : t
      ));

      // Send read receipt via WebSocket
      if (isConnected) {
        sendWebSocketMessage({
          type: 'read',
          data: { threadId, userId },
          timestamp: Date.now(),
          threadId
        });
      }

    } catch (err) {
      console.error('Failed to mark thread as read:', err);
    }
  }, [getToken, userId, isConnected, sendWebSocketMessage]);

  // Delete thread
  const deleteThread = useCallback(async (threadId: string) => {
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('No authentication token available');
      }

      await fetch(`/api/messages/threads/${threadId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      // Update local state
      setThreads(prev => prev.filter(t => t.id !== threadId));
      
      if (selectedThread?.id === threadId) {
        setSelectedThread(null);
        setMessages([]);
      }

    } catch (err) {
      console.error('Failed to delete thread:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete thread');
      throw err;
    }
  }, [getToken, selectedThread?.id]);

  // Refresh threads
  const refreshThreads = useCallback(() => {
    fetchThreads();
  }, [fetchThreads]);

  // Initial load
  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  return {
    threads,
    selectedThread,
    messages,
    unreadCount,
    loading,
    sendingMessage,
    error,
    isConnected,
    isConnecting,
    connectionError,
    selectThread,
    sendMessage,
    sendReply,
    markThreadAsRead,
    deleteThread,
    refreshThreads,
    reconnect
  };
};
