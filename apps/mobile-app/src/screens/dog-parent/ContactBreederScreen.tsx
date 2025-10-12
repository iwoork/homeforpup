import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { theme } from '../../utils/theme';
import { useAuth } from '../../contexts/AuthContext';
import apiService from '../../services/apiService';
import { messageService } from '../../services/messageService';

interface ContactBreederRouteParams {
  receiverId: string;
  breederName?: string;
  puppyId?: string;
  puppyName?: string;
  puppyBreed?: string;
  puppyPhoto?: string;
}

const ContactBreederScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const params = route.params as ContactBreederRouteParams;

  const [breederInfo, setBreederInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  // Fetch breeder info
  useEffect(() => {
    const fetchBreederInfo = async () => {
      if (params?.receiverId) {
        setLoading(true);
        try {
          const response = await apiService.getUserById(params.receiverId);
          if (response.success && response.data) {
            setBreederInfo(response.data);
          }
        } catch (error) {
          console.error('Error fetching breeder info:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchBreederInfo();

    // Pre-fill subject and message based on user type
    if (params?.puppyName) {
      if (user?.userType === 'breeder') {
        // Message template for breeders contacting other breeders
        setSubject(`Inquiry about ${params.puppyName} - Breeding/Collaboration`);
        setMessage(
          `Hello,\n\nI'm a fellow breeder and I'm interested in discussing ${params.puppyName}${
            params.puppyBreed ? ` (${params.puppyBreed})` : ''
          }. I'd like to learn more about potential breeding opportunities, stud services, or collaboration.\n\nLooking forward to connecting with you.\n\nBest regards,\n${user.name}`
        );
      } else {
        // Message template for future dog parents
        setSubject(`Inquiry about ${params.puppyName}`);
        setMessage(
          `Hi,\n\nI'm interested in learning more about ${params.puppyName}${
            params.puppyBreed ? ` (${params.puppyBreed})` : ''
          }. Could you please provide more information?\n\nThank you!`
        );
      }
    }
  }, [params, user]);

  const handleSend = async () => {
    // Validate recipient ID first
    if (!params?.receiverId) {
      Alert.alert('Error', 'Recipient information is missing. Please try again.');
      console.error('❌ Missing receiverId:', params);
      return;
    }

    if (!subject.trim()) {
      Alert.alert('Required', 'Please enter a subject');
      return;
    }

    if (!message.trim()) {
      Alert.alert('Required', 'Please enter a message');
      return;
    }

    setSending(true);
    try {
      // Get the breeder name before using it
      const recipientName = params?.breederName || breederInfo?.name || breederInfo?.displayName || 'Breeder';
      
      const messagePayload = {
        recipientId: params.receiverId,
        recipientName,
        subject: subject.trim(),
        content: message.trim(),
        messageType: user?.userType === 'breeder' ? 'business' : 'inquiry',
      };
      
      console.log('📤 Sending message with payload:', {
        recipientId: messagePayload.recipientId,
        recipientName: messagePayload.recipientName,
        subject: messagePayload.subject,
        contentLength: messagePayload.content.length,
        messageType: messagePayload.messageType,
        from: user?.userId,
        puppyId: params?.puppyId,
      });

      // Send message using the messageService
      const response = await messageService.sendMessage(messagePayload);

      console.log('✅ Message sent successfully:', {
        threadId: response.thread.id,
        messageId: response.message.id,
      });

      Alert.alert(
        'Success',
        'Your message has been sent!',
        [
          {
            text: 'View Message',
            onPress: () => {
              navigation.navigate('MessageDetail' as never, {
                thread: response.thread,
              } as never);
            },
          },
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
            style: 'cancel',
          },
        ]
      );
    } catch (error) {
      console.error('❌ Error sending message:', error);
      Alert.alert(
        'Error',
        error instanceof Error ? error.message : 'Failed to send message. Please try again.'
      );
    } finally {
      setSending(false);
    }
  };

  const breederName =
    params?.breederName || breederInfo?.name || breederInfo?.displayName || 'Breeder';

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Breeder/Kennel Info Card */}
        <View style={styles.breederCard}>
          <LinearGradient
            colors={[theme.colors.primary + '20', theme.colors.secondary + '20']}
            style={styles.breederCardGradient}
          >
            <View style={styles.breederHeader}>
              <View style={styles.breederAvatarContainer}>
                {breederInfo?.profileImage ? (
                  <Image
                    source={{ uri: breederInfo.profileImage }}
                    style={styles.breederAvatar}
                  />
                ) : (
                  <View style={styles.breederAvatarPlaceholder}>
                    <Icon name="home" size={32} color={theme.colors.primary} />
                  </View>
                )}
              </View>
              <View style={styles.breederInfo}>
                {breederInfo?.breederInfo?.kennelName ? (
                  <>
                    <Text style={styles.kennelName}>
                      {breederInfo.breederInfo.kennelName}
                    </Text>
                    <View style={styles.breederRow}>
                      <Icon name="person" size={14} color={theme.colors.textSecondary} />
                      <Text style={styles.breederNameSubtext}>{breederName}</Text>
                    </View>
                    {breederInfo.breederInfo.specialties && breederInfo.breederInfo.specialties.length > 0 && (
                      <View style={styles.specialtiesRow}>
                        <Icon name="paw" size={14} color={theme.colors.textSecondary} />
                        <Text style={styles.specialtiesText}>
                          {breederInfo.breederInfo.specialties.slice(0, 2).join(', ')}
                          {breederInfo.breederInfo.specialties.length > 2 ? `, +${breederInfo.breederInfo.specialties.length - 2} more` : ''}
                        </Text>
                      </View>
                    )}
                    {breederInfo.breederInfo.experience && (
                      <View style={styles.experienceRow}>
                        <Icon name="ribbon" size={14} color={theme.colors.textSecondary} />
                        <Text style={styles.experienceText}>
                          {breederInfo.breederInfo.experience} years experience
                        </Text>
                      </View>
                    )}
                  </>
                ) : (
                  <>
                    <Text style={styles.breederLabel}>Contacting</Text>
                    <Text style={styles.breederName}>{breederName}</Text>
                  </>
                )}
                {breederInfo?.location && (
                  <View style={styles.locationRow}>
                    <Icon
                      name="location"
                      size={14}
                      color={theme.colors.textSecondary}
                    />
                    <Text style={styles.locationText}>{breederInfo.location}</Text>
                  </View>
                )}
              </View>
            </View>
            {breederInfo?.breederInfo?.kennelName && (
              <TouchableOpacity
                style={styles.viewProfileButton}
                onPress={() => {
                  // TODO: Navigate to kennel/breeder profile
                  console.log('View breeder profile:', params.receiverId);
                }}
              >
                <Text style={styles.viewProfileText}>View Kennel Profile</Text>
                <Icon name="arrow-forward" size={16} color={theme.colors.primary} />
              </TouchableOpacity>
            )}
          </LinearGradient>
        </View>

        {/* Dog/Puppy Context Card */}
        {params?.puppyName && (
          <View style={styles.puppyCard}>
            <View style={styles.puppyCardHeader}>
              <Icon name="paw" size={20} color={theme.colors.primary} />
              <Text style={styles.puppyCardTitle}>
                {user?.userType === 'breeder' ? 'About This Dog' : 'About This Puppy'}
              </Text>
            </View>
            <View style={styles.puppyCardContent}>
              {params.puppyPhoto && (
                <Image
                  source={{ uri: params.puppyPhoto }}
                  style={styles.puppyThumbnail}
                />
              )}
              <View style={styles.puppyDetails}>
                <Text style={styles.puppyName}>{params.puppyName}</Text>
                {params.puppyBreed && (
                  <Text style={styles.puppyBreed}>{params.puppyBreed}</Text>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Message Form */}
        <View style={styles.formSection}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Subject *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter subject"
              placeholderTextColor={theme.colors.textTertiary}
              value={subject}
              onChangeText={setSubject}
              autoCapitalize="sentences"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Message *</Text>
            <TextInput
              style={[styles.input, styles.messageInput]}
              placeholder="Write your message..."
              placeholderTextColor={theme.colors.textTertiary}
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={8}
              textAlignVertical="top"
              autoCapitalize="sentences"
            />
            <Text style={styles.characterCount}>{message.length} characters</Text>
          </View>

          {/* Quick Message Templates */}
          <View style={styles.templatesSection}>
            <Text style={styles.templatesTitle}>Quick Templates</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={styles.templatesList}>
                {(user?.userType === 'breeder'
                  ? [
                      'Interested in breeding collaboration',
                      'Inquiring about stud services',
                      'Would like to discuss this dog',
                      'Can we schedule a call?',
                    ]
                  : [
                      'Tell me more about this puppy',
                      'Is this puppy still available?',
                      'Can I schedule a visit?',
                      'What are the next steps?',
                    ]
                ).map((template, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.templateChip}
                    onPress={() =>
                      setMessage(
                        prev =>
                          `${prev}${prev ? '\n\n' : ''}${template}`
                      )
                    }
                  >
                    <Icon name="add-circle-outline" size={16} color={theme.colors.primary} />
                    <Text style={styles.templateText}>{template}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
          </View>

          {/* Tips */}
          <View style={styles.tipsCard}>
            <Icon name="bulb-outline" size={20} color={theme.colors.info} />
            <View style={styles.tipsContent}>
              <Text style={styles.tipsTitle}>
                {user?.userType === 'breeder'
                  ? 'Tips for professional breeder communication:'
                  : 'Tips for messaging breeders:'}
              </Text>
              <Text style={styles.tipsText}>
                {user?.userType === 'breeder'
                  ? '• Introduce your kennel and experience\n• Be specific about your breeding goals\n• Discuss health testing and certifications\n• Be professional and respectful'
                  : "• Be specific about what you'd like to know\n• Mention your experience with dogs\n• Ask about health tests and certifications\n• Be respectful of their time"}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Send Button */}
      <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, theme.spacing.lg) }]}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={() => navigation.goBack()}
          disabled={sending}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sendButton, sending && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={sending}
        >
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.primaryDark]}
            style={styles.sendButtonGradient}
          >
            {sending ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Icon name="send" size={18} color="#ffffff" />
                <Text style={styles.sendButtonText}>Send Message</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  breederCard: {
    margin: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.md,
  },
  breederCardGradient: {
    padding: theme.spacing.lg,
  },
  breederHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  breederAvatarContainer: {
    marginRight: theme.spacing.md,
  },
  breederAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.surface,
  },
  breederAvatarPlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  breederInfo: {
    flex: 1,
  },
  breederLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  breederName: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 2,
  },
  kennelName: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 6,
  },
  breederRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  breederNameSubtext: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  specialtiesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  specialtiesText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  experienceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  experienceText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  locationText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
  },
  viewProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  viewProfileText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  puppyCard: {
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 2,
    borderColor: theme.colors.primary + '40',
    ...theme.shadows.sm,
  },
  puppyCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  puppyCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  puppyCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  puppyThumbnail: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.md,
    marginRight: theme.spacing.md,
    backgroundColor: theme.colors.backgroundSecondary,
  },
  puppyDetails: {
    flex: 1,
  },
  puppyName: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 2,
  },
  puppyBreed: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  formSection: {
    paddingHorizontal: theme.spacing.lg,
  },
  inputGroup: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  input: {
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text,
  },
  messageInput: {
    minHeight: 150,
    paddingTop: theme.spacing.md,
  },
  characterCount: {
    fontSize: 12,
    color: theme.colors.textTertiary,
    marginTop: theme.spacing.xs,
    textAlign: 'right',
  },
  templatesSection: {
    marginBottom: theme.spacing.lg,
  },
  templatesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  templatesList: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  templateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  templateText: {
    fontSize: 13,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  tipsCard: {
    flexDirection: 'row',
    backgroundColor: theme.colors.infoLight,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.info + '40',
    gap: theme.spacing.md,
  },
  tipsContent: {
    flex: 1,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  tipsText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    // paddingBottom will be set dynamically with safe area insets
    backgroundColor: theme.colors.surface,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    gap: theme.spacing.md,
    ...theme.shadows.lg,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
  },
  sendButton: {
    flex: 2,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  sendButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: theme.spacing.md,
  },
  sendButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default ContactBreederScreen;

