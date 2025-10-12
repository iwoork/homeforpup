import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../utils/theme';
import { messageService, Message, MessageThread } from '../../services/messageService';
import authService from '../../services/authService';

const MessageDetailScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const flatListRef = useRef<FlatList>(null);
  
  const { thread } = (route.params as { thread: MessageThread }) || {};
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string>('');

  useEffect(() => {
    if (!thread) {
      Alert.alert('Error', 'Thread not found');
      navigation.goBack();
      return;
    }

    loadCurrentUser();
    loadMessages();
    markAsRead();

    // Poll for new messages every 5 seconds
    const pollInterval = setInterval(() => {
      if (!loading && !sending) {
        loadMessages();
      }
    }, 5000);

    return () => clearInterval(pollInterval);
  }, [thread, loading, sending]);

  const loadCurrentUser = async () => {
    try {
      const user = await authService.getCurrentUser();
      if (user) {
        setCurrentUserId(user.userId);
      }
    } catch (error) {
      console.error('Error loading current user:', error);
    }
  };

  const loadMessages = async () => {
    if (!thread) return;
    
    try {
      const fetchedMessages = await messageService.getMessages(thread.id);
      // Sort messages by timestamp (oldest first for chat display)
      const sortedMessages = fetchedMessages.sort((a, b) => 
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      );
      setMessages(sortedMessages);
      setLoading(false);
      
      // Scroll to bottom after messages load
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Error loading messages:', error);
      Alert.alert('Error', 'Failed to load messages');
      setLoading(false);
    }
  };

  const markAsRead = async () => {
    if (!thread) return;
    
    try {
      await messageService.markThreadAsRead(thread.id);
    } catch (error) {
      console.error('Error marking thread as read:', error);
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !thread || sending) return;

    const otherParticipant = thread.participants.find(p => p !== currentUserId);
    if (!otherParticipant) {
      Alert.alert('Error', 'Could not find recipient');
      return;
    }

    setSending(true);
    try {
      const result = await messageService.sendReply({
        threadId: thread.id,
        content: replyText.trim(),
        receiverId: otherParticipant,
        receiverName: thread.otherParticipantName,
        subject: thread.subject,
      });

      // Add the new message to the list
      setMessages([...messages, result.message]);
      setReplyText('');
      
      // Scroll to bottom
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error) {
      console.error('Error sending reply:', error);
      Alert.alert('Error', 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isCurrentUser = item.senderId === currentUserId;
    
    return (
      <View style={[
        styles.messageContainer,
        isCurrentUser ? styles.messageRight : styles.messageLeft
      ]}>
        <View style={[
          styles.messageBubble,
          isCurrentUser ? styles.messageBubbleRight : styles.messageBubbleLeft
        ]}>
          {!isCurrentUser && (
            <Text style={styles.senderName}>{item.senderName}</Text>
          )}
          <Text style={[
            styles.messageText,
            isCurrentUser ? styles.messageTextRight : styles.messageTextLeft
          ]}>
            {item.content}
          </Text>
          <Text style={[
            styles.timestamp,
            isCurrentUser ? styles.timestampRight : styles.timestampLeft
          ]}>
            {formatTimestamp(item.timestamp)}
          </Text>
        </View>
      </View>
    );
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return diffInMinutes < 1 ? 'Just now' : `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (!thread) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Thread not found</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{thread.otherParticipantName || 'Unknown'}</Text>
        <Text style={styles.headerSubtitle}>{thread.subject}</Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      <View style={[
        styles.inputContainer,
        { paddingBottom: Math.max(insets.bottom, theme.spacing.md) }
      ]}>
        <TextInput
          style={styles.input}
          value={replyText}
          onChangeText={setReplyText}
          placeholder="Type your message..."
          placeholderTextColor={theme.colors.textSecondary}
          multiline
          maxLength={1000}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!replyText.trim() || sending) && styles.sendButtonDisabled
          ]}
          onPress={handleSendReply}
          disabled={!replyText.trim() || sending}
        >
          {sending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.sendButtonText}>Send</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
  header: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  messagesList: {
    padding: theme.spacing.md,
  },
  messageContainer: {
    marginBottom: theme.spacing.md,
    maxWidth: '80%',
  },
  messageLeft: {
    alignSelf: 'flex-start',
  },
  messageRight: {
    alignSelf: 'flex-end',
  },
  messageBubble: {
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
  },
  messageBubbleLeft: {
    backgroundColor: theme.colors.surface,
    borderBottomLeftRadius: 4,
  },
  messageBubbleRight: {
    backgroundColor: theme.colors.primary,
    borderBottomRightRadius: 4,
  },
  senderName: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  messageTextLeft: {
    color: theme.colors.text,
  },
  messageTextRight: {
    color: '#fff',
  },
  timestamp: {
    fontSize: 11,
    marginTop: theme.spacing.xs,
  },
  timestampLeft: {
    color: theme.colors.textSecondary,
  },
  timestampRight: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  inputContainer: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.md,
    // paddingBottom will be set dynamically with safe area insets
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    marginRight: theme.spacing.sm,
    fontSize: 16,
    color: theme.colors.text,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 70,
  },
  sendButtonDisabled: {
    backgroundColor: theme.colors.textSecondary,
    opacity: 0.5,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MessageDetailScreen;


