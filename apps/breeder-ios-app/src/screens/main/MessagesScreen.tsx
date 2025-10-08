import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Image,
} from 'react-native';
import { theme } from '../../utils/theme';
import { MessageThread } from '../../types';

const MessagesScreen: React.FC = () => {
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchMessageThreads();
  }, []);

  const fetchMessageThreads = async () => {
    try {
      // TODO: Implement actual API call
      // Simulate API call
      setTimeout(() => {
        setThreads([
          {
            id: '1',
            subject: 'Inquiry about Golden Retriever puppies',
            participants: ['user1', 'user2'],
            participantNames: {
              user1: 'John Smith',
              user2: 'Jane Doe',
            },
            lastMessage: {
              id: 'msg1',
              senderId: 'user2',
              senderName: 'Jane Doe',
              receiverId: 'user1',
              receiverName: 'John Smith',
              subject: 'Inquiry about Golden Retriever puppies',
              content: 'Thank you for your interest! I have 3 puppies available from my latest litter.',
              timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
              read: false,
              messageType: 'inquiry',
            },
            messageCount: 5,
            unreadCount: { user1: 2 },
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
            updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: '2',
            subject: 'German Shepherd breeding inquiry',
            participants: ['user1', 'user3'],
            participantNames: {
              user1: 'John Smith',
              user3: 'Mike Johnson',
            },
            lastMessage: {
              id: 'msg2',
              senderId: 'user3',
              senderName: 'Mike Johnson',
              receiverId: 'user1',
              receiverName: 'John Smith',
              subject: 'German Shepherd breeding inquiry',
              content: 'I would love to arrange a visit to see your breeding facility.',
              timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
              read: true,
              messageType: 'business',
            },
            messageCount: 3,
            unreadCount: { user1: 0 },
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
            updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          },
          {
            id: '3',
            subject: 'Puppy care questions',
            participants: ['user1', 'user4'],
            participantNames: {
              user1: 'John Smith',
              user4: 'Sarah Wilson',
            },
            lastMessage: {
              id: 'msg3',
              senderId: 'user1',
              senderName: 'John Smith',
              receiverId: 'user4',
              receiverName: 'Sarah Wilson',
              subject: 'Puppy care questions',
              content: 'Feel free to contact me anytime if you have more questions!',
              timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
              read: true,
              messageType: 'general',
            },
            messageCount: 8,
            unreadCount: { user1: 0 },
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
            updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          },
        ]);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching message threads:', error);
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

  const renderThreadItem = ({ item }: { item: MessageThread }) => {
    const unreadCount = item.unreadCount.user1 || 0;
    const otherParticipant = item.participants.find(id => id !== 'user1');
    const otherParticipantName = otherParticipant && item.participantNames ? item.participantNames[otherParticipant] : 'Unknown';

    return (
      <TouchableOpacity style={styles.threadCard}>
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
        When potential families reach out about your puppies, their messages will appear here
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
