import { useState, useEffect } from 'react';
import { messageService } from '../services/messageService';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook to get and automatically update the unread message count
 */
export const useUnreadMessageCount = () => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchUnreadCount = async () => {
    if (!user?.userId) return;
    
    try {
      setLoading(true);
      const threads = await messageService.getThreads();
      const totalUnread = threads.reduce((sum, thread) => {
        return sum + (thread.unreadCount[user.userId] || 0);
      }, 0);
      setUnreadCount(totalUnread);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.userId) {
      // Fetch immediately
      fetchUnreadCount();
      
      // Poll every 30 seconds for updates
      const interval = setInterval(fetchUnreadCount, 30000);
      
      return () => clearInterval(interval);
    }
  }, [user?.userId]);

  return { unreadCount, loading, refresh: fetchUnreadCount };
};

