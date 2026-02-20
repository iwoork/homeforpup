import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Image,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../../utils/theme';
import { messageService, MessageThread } from '../../services/messageService';
import { useAuth } from '../../contexts/AuthContext';

const MessagesScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const currentUserId = user?.userId || '';

  useEffect(() => {
    fetchMessageThreads();

    // Poll for new messages every 10 seconds
    const pollInterval = setInterval(() => {
      if (!loading && !refreshing) {
        fetchMessageThreads();
      }
    }, 10000);

    return () => clearInterval(pollInterval);
  }, [loading, refreshing]);

  const fetchMessageThreads = async () => {
    try {
      const fetchedThreads = await messageService.getThreads();
      setThreads(fetchedThreads);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching message threads:', error);
      Alert.alert('Error', 'Failed to load messages. Please try again.');
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMessageThreads();
    setRefreshing(false);
  };

  const formatTimestamp = (timestamp: string) => {
    const now = new Date();
    const messageTime = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - messageTime.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const getMessageTypeIcon = (type: string) => {
    switch (type) {
      case 'inquiry':
        return '❓';
      case 'business':
        return '💼';
      case 'urgent':
        return '❗';
      default:
        return '💬';
    }
  };

  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case 'inquiry':
        return theme.colors.primary;
      case 'business':
        return theme.colors.secondary;
      case 'urgent':
        return theme.colors.error;
      default:
        return theme.colors.textSecondary;
    }
  };

  const handleThreadPress = useCallback((thread: MessageThread) => {
    navigation.navigate('MessageDetail' as never, { thread } as never);
  }, [navigation]);

  const renderThreadItem = ({ item }: { item: MessageThread }) => {
    const unreadCount = currentUserId ? (item.unreadCount[currentUserId] || 0) : 0;
    const otherParticipant = item.participants.find(id => id !== currentUserId);
    const otherParticipantName = item.otherParticipantName || 
      (otherParticipant && item.participantNames ? item.participantNames[otherParticipant] : 'Unknown');

    return (
      <TouchableOpacity 
        style={styles.threadCard}
        onPress={() => handleThreadPress(item)}
      >
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {otherParticipantName.charAt(0).toUpperCase()}
            </Text>
          </View>
          {unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>{unreadCount}</Text>
            </View>
          )}
        </View>
        
        <View style={styles.threadContent}>
          <View style={styles.threadHeader}>
            <Text style={styles.senderName}>{otherParticipantName}</Text>
            <Text style={styles.timestamp}>{formatTimestamp(item.lastMessage.timestamp)}</Text>
          </View>
          
          <Text style={styles.threadSubject} numberOfLines={1}>
            {item.subject}
          </Text>
          
          <Text 
            style={[
              styles.lastMessage,
              unreadCount > 0 && styles.unreadMessage
            ]} 
            numberOfLines={2}
          >
            {item.lastMessage.content}
          </Text>
          
          <View style={styles.threadFooter}>
            <View style={styles.messageTypeContainer}>
              <Text style={styles.messageTypeIcon}>
                {getMessageTypeIcon(item.lastMessage.messageType)}
              </Text>
              <Text style={[
                styles.messageTypeText,
                { color: getMessageTypeColor(item.lastMessage.messageType) }
              ]}>
                {item.lastMessage.messageType}
              </Text>
            </View>
            
            <Text style={styles.messageCount}>
              {item.messageCount} message{item.messageCount !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>
        
        <Text style={styles.chevronIcon}>›</Text>
      </TouchableOpacity>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>💬</Text>
      <Text style={styles.emptyTitle}>No Messages Yet</Text>
      <Text style={styles.emptySubtitle}>
        Your conversations with breeders about available puppies will appear here
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading messages...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={threads}
        renderItem={renderThreadItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={threads.length === 0 ? styles.emptyContainer : styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={renderEmptyState}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  listContainer: {
    padding: theme.spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  threadCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: theme.spacing.md,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  unreadBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: theme.colors.error,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  threadContent: {
    flex: 1,
  },
  threadHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  senderName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  timestamp: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  threadSubject: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: '500',
    marginBottom: theme.spacing.xs,
  },
  lastMessage: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  unreadMessage: {
    color: theme.colors.text,
    fontWeight: '500',
  },
  threadFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  messageTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  messageTypeIcon: {
    fontSize: 14,
    marginRight: theme.spacing.xs,
  },
  messageTypeText: {
    fontSize: 12,
    textTransform: 'capitalize',
  },
  messageCount: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  chevronIcon: {
    fontSize: 32,
    color: theme.colors.textSecondary,
    fontWeight: '300',
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  emptyIcon: {
    fontSize: 64,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  emptySubtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});

export default MessagesScreen;
