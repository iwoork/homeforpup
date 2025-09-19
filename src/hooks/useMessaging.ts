// hooks/useMessaging.ts
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
} from '@/types/messaging';

export const useMessaging = (userId?: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);
      setError(null);

      // Replace with actual API call
      const response = await fetch(`/api/messages?userId=${userId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error('Failed to fetch messages');

      const data: MessagesResponse = await response.json();
      
      setMessages(data.messages);
      setThreads(data.threads);
      setUnreadCount(data.unreadCount);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch messages');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const sendMessage = useCallback(async (messageData: SendMessageRequest) => {
    try {
      setError(null);

      // Replace with actual API call
      const response = await fetch('/api/messages', {
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
        t.participants.includes(messageData.receiverId)
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
          participants: [userId!, messageData.receiverId],
          lastMessage: newMessage,
          messageCount: 1,
          unreadCount: 0,
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
      // Replace with actual API call
      await fetch('/api/messages/mark-read', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageIds, userId }),
      });

      // Update local state
      setMessages(prev => prev.map(msg => 
        messageIds.includes(msg.id) ? { ...msg, read: true } : msg
      ));

      setUnreadCount(prev => Math.max(0, prev - messageIds.length));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark messages as read');
    }
  }, [userId]);

  const deleteMessage = useCallback(async (messageId: string) => {
    try {
      // Replace with actual API call
      await fetch(`/api/messages/${messageId}`, {
        method: 'DELETE',
      });

      setMessages(prev => prev.filter(msg => msg.id !== messageId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete message');
    }
  }, []);

  useEffect(() => {
    if (userId) {
      fetchMessages();
    }
  }, [userId, fetchMessages]);

  return {
    messages,
    threads,
    unreadCount,
    loading,
    error,
    sendMessage,
    markAsRead,
    deleteMessage,
    refetch: fetchMessages,
  };
};

export const useAnnouncements = (userId?: string) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const fetchAnnouncements = useCallback(async (
    filters?: AnnouncementFilters, 
    pageNum: number = 1,
    resetData: boolean = false
  ) => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      if (filters?.type) queryParams.append('type', filters.type);
      if (filters?.breed) queryParams.append('breed', filters.breed);
      if (filters?.location) queryParams.append('location', filters.location);
      if (filters?.search) queryParams.append('search', filters.search);
      queryParams.append('page', pageNum.toString());
      queryParams.append('limit', '10');

      // Replace with actual API call
      const response = await fetch(`/api/announcements?${queryParams}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error('Failed to fetch announcements');

      const data: AnnouncementsResponse = await response.json();
      
      if (resetData || pageNum === 1) {
        setAnnouncements(data.announcements);
      } else {
        setAnnouncements(prev => [...prev, ...data.announcements]);
      }
      
      setHasMore(data.pagination.hasMore);
      setPage(pageNum);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch announcements');
    } finally {
      setLoading(false);
    }
  }, []);

  const createAnnouncement = useCallback(async (announcementData: CreateAnnouncementRequest) => {
    try {
      setError(null);

      // Replace with actual API call
      const response = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...announcementData, breederId: userId }),
      });

      if (!response.ok) throw new Error('Failed to create announcement');

      const newAnnouncement: Announcement = await response.json();
      
      // Add to the beginning of the list
      setAnnouncements(prev => [newAnnouncement, ...prev]);
      
      return newAnnouncement;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create announcement');
      throw err;
    }
  }, [userId]);

  const updateAnnouncement = useCallback(async (
    announcementId: string, 
    updates: Partial<Announcement>
  ) => {
    try {
      setError(null);

      // Replace with actual API call
      const response = await fetch(`/api/announcements/${announcementId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) throw new Error('Failed to update announcement');

      const updatedAnnouncement: Announcement = await response.json();
      
      setAnnouncements(prev => prev.map(ann => 
        ann.id === announcementId ? updatedAnnouncement : ann
      ));
      
      return updatedAnnouncement;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update announcement');
      throw err;
    }
  }, []);

  const deleteAnnouncement = useCallback(async (announcementId: string) => {
    try {
      setError(null);

      // Replace with actual API call
      await fetch(`/api/announcements/${announcementId}`, {
        method: 'DELETE',
      });

      setAnnouncements(prev => prev.filter(ann => ann.id !== announcementId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete announcement');
      throw err;
    }
  }, []);

  const likeAnnouncement = useCallback(async (announcementId: string) => {
    try {
      // Optimistically update UI
      setAnnouncements(prev => prev.map(ann => {
        if (ann.id === announcementId) {
          const isLiked = ann.likedBy?.includes(userId || '');
          return {
            ...ann,
            interactions: {
              ...ann.interactions,
              likes: isLiked ? ann.interactions.likes - 1 : ann.interactions.likes + 1
            },
            likedBy: isLiked 
              ? ann.likedBy?.filter(id => id !== userId) || []
              : [...(ann.likedBy || []), userId || '']
          };
        }
        return ann;
      }));

      // Replace with actual API call
      await fetch(`/api/announcements/${announcementId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to like announcement');
      // Revert optimistic update on error
      fetchAnnouncements();
    }
  }, [userId, fetchAnnouncements]);

  const shareAnnouncement = useCallback(async (announcementId: string) => {
    try {
      // Replace with actual API call
      await fetch(`/api/announcements/${announcementId}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      // Update share count
      setAnnouncements(prev => prev.map(ann => 
        ann.id === announcementId 
          ? { ...ann, interactions: { ...ann.interactions, shares: ann.interactions.shares + 1 }}
          : ann
      ));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to share announcement');
    }
  }, [userId]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchAnnouncements(undefined, page + 1);
    }
  }, [loading, hasMore, page, fetchAnnouncements]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  return {
    announcements,
    loading,
    error,
    hasMore,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    likeAnnouncement,
    shareAnnouncement,
    loadMore,
    refetch: (filters?: AnnouncementFilters) => fetchAnnouncements(filters, 1, true),
  };
};

export const useNotifications = (userId?: string) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!userId) return;

    try {
      setLoading(true);

      // Replace with actual API call
      const response = await fetch(`/api/notifications?userId=${userId}`);
      const data = await response.json();

      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const markNotificationAsRead = useCallback(async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PATCH',
      });

      setNotifications(prev => prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      ));
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      fetchNotifications();
      
      // Set up real-time notifications (WebSocket, SSE, etc.)
      // This is a placeholder for real-time functionality
    }
  }, [userId, fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead: markNotificationAsRead,
    refetch: fetchNotifications,
  };
};

// Utility hook for real-time updates
export const useRealTimeUpdates = (userId?: string) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!userId) return;

    // Initialize WebSocket connection
    const ws = new WebSocket(`wss://your-api.com/ws?userId=${userId}`);
    
    ws.onopen = () => {
      setIsConnected(true);
      console.log('WebSocket connected');
    };

    ws.onclose = () => {
      setIsConnected(false);
      console.log('WebSocket disconnected');
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      // Handle different types of real-time updates
      switch (data.type) {
        case 'new_message':
          // Trigger message refetch or update state
          break;
        case 'announcement_liked':
          // Update announcement like count
          break;
        case 'new_comment':
          // Update comment count
          break;
        default:
          console.log('Unknown message type:', data.type);
      }
    };

    setSocket(ws);

    return () => {
      ws.close();
    };
  }, [userId]);

  const sendMessage = useCallback((message: any) => {
    if (socket && isConnected) {
      socket.send(JSON.stringify(message));
    }
  }, [socket, isConnected]);

  return {
    isConnected,
    sendMessage,
  };
};