import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { theme } from '../../utils/theme';
import { useAuth } from '../../contexts/AuthContext';

const HelpSupportScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const supportOptions = [
    {
      title: 'Email Support',
      subtitle: 'Get help via email',
      icon: 'mail',
      iconColor: theme.colors.primary,
      onPress: () => {
        Linking.openURL('mailto:support@homeforpup.com');
      },
    },
    {
      title: 'Call Support',
      subtitle: 'Speak with our team',
      icon: 'call',
      iconColor: '#10b981',
      onPress: () => {
        Alert.alert('Coming Soon', 'Phone support will be available soon!');
      },
    },
    {
      title: 'Live Chat',
      subtitle: 'Chat with support (9AM-5PM EST)',
      icon: 'chatbubbles',
      iconColor: '#3b82f6',
      onPress: () => {
        Alert.alert('Live Chat', 'Live chat will be available soon!');
      },
    },
    {
      title: 'Report an Issue',
      subtitle: 'Report bugs or problems',
      icon: 'bug',
      iconColor: '#ef4444',
      onPress: () => {
        Alert.alert('Report Issue', 'Issue reporting will be available soon!');
      },
    },
  ];

  const documentationLinks = [
    {
      title: 'Getting Started Guide',
      icon: 'book',
      iconColor: theme.colors.primary,
      onPress: () => {
        Alert.alert('Coming Soon', 'Documentation will be available soon!');
      },
    },
    {
      title: user?.userType === 'breeder' ? 'Breeder Guide' : 'Adoption Guide',
      icon: 'information-circle',
      iconColor: '#8b5cf6',
      onPress: () => {
        Alert.alert('Coming Soon', 'Guide will be available soon!');
      },
    },
    {
      title: 'Video Tutorials',
      icon: 'play-circle',
      iconColor: '#f59e0b',
      onPress: () => {
        Alert.alert('Coming Soon', 'Video tutorials will be available soon!');
      },
    },
    {
      title: 'Terms of Service',
      icon: 'document-text',
      iconColor: '#64748b',
      onPress: () => {
        Linking.openURL('https://homeforpup.com/terms');
      },
    },
    {
      title: 'Privacy Policy',
      icon: 'shield-checkmark',
      iconColor: '#10b981',
      onPress: () => {
        Linking.openURL('https://homeforpup.com/privacy');
      },
    },
  ];

  const faqItems = [
    {
      question: 'How do I create a kennel?',
      answer: user?.userType === 'breeder' 
        ? 'Navigate to the Profile tab, tap "Manage Kennels", then tap "Add New Kennel". Fill out the required information in 4 simple steps.'
        : 'Only verified breeders can create kennels. If you\'re a breeder, please contact support for verification.',
    },
    {
      question: 'How do I change my account type?',
      answer: 'If you\'re a verified breeder, you can switch between Breeder and Dog Parent modes from your Profile screen. Tap the account type card to switch.',
    },
    {
      question: 'How do I contact a breeder?',
      answer: 'Browse available puppies, tap on a puppy to view details, then tap "Contact Breeder" to send a message directly to the breeder.',
    },
    {
      question: 'How do I update my profile?',
      answer: 'Go to Profile → Edit Profile to update your personal information. For breeders, business information is managed through "Manage Kennels".',
    },
    {
      question: 'How do I manage notifications?',
      answer: 'Go to Profile → Notifications to customize how you receive notifications (email, SMS, or push notifications).',
    },
    {
      question: 'How do I manage privacy settings?',
      answer: 'Go to Profile → Privacy & Security to control what information is visible to other users.',
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'Payment terms and methods are arranged directly between breeders and future dog parents. HomeForPup does not process payments.',
    },
    {
      question: 'How do I reset my password?',
      answer: 'On the login screen, tap "Forgot Password" and follow the instructions. You\'ll receive a verification code via email.',
    },
  ];

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* Welcome Card */}
        <View style={styles.welcomeCard}>
          <Icon name="help-circle" size={48} color={theme.colors.primary} />
          <Text style={styles.welcomeTitle}>How can we help you?</Text>
          <Text style={styles.welcomeSubtitle}>
            Browse our resources or contact our support team
          </Text>
        </View>

        {/* Contact Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Support</Text>
          {supportOptions.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={option.onPress}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.menuIconContainer,
                  { backgroundColor: `${option.iconColor}15` },
                ]}
              >
                <Icon name={option.icon} size={22} color={option.iconColor} />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>{option.title}</Text>
                <Text style={styles.menuSubtitle}>{option.subtitle}</Text>
              </View>
              <Icon
                name="chevron-forward"
                size={24}
                color={theme.colors.textTertiary}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Documentation & Resources */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Documentation & Resources</Text>
          {documentationLinks.map((link, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={link.onPress}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.menuIconContainer,
                  { backgroundColor: `${link.iconColor}15` },
                ]}
              >
                <Icon name={link.icon} size={22} color={link.iconColor} />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>{link.title}</Text>
              </View>
              <Icon
                name="chevron-forward"
                size={24}
                color={theme.colors.textTertiary}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          {faqItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.faqItem}
              onPress={() => toggleFaq(index)}
              activeOpacity={0.8}
            >
              <View style={styles.faqHeader}>
                <Icon
                  name="help-circle-outline"
                  size={20}
                  color={theme.colors.primary}
                  style={styles.faqIcon}
                />
                <Text style={styles.faqQuestion}>{item.question}</Text>
                <Icon
                  name={expandedFaq === index ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={theme.colors.textSecondary}
                />
              </View>
              {expandedFaq === index && (
                <View style={styles.faqAnswer}>
                  <Text style={styles.faqAnswerText}>{item.answer}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* App Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Information</Text>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Version</Text>
              <Text style={styles.infoValue}>1.0.0</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Build</Text>
              <Text style={styles.infoValue}>2024.01.01</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Platform</Text>
              <Text style={styles.infoValue}>iOS/Android</Text>
            </View>
          </View>
        </View>

        {/* Feedback Section */}
        <View style={styles.feedbackSection}>
          <TouchableOpacity
            style={styles.feedbackButton}
            onPress={() => {
              Alert.alert(
                'Send Feedback',
                'We\'d love to hear from you! What would you like to share?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  {
                    text: 'Send Email',
                    onPress: () => Linking.openURL('mailto:feedback@homeforpup.com?subject=App Feedback'),
                  },
                ]
              );
            }}
          >
            <Icon name="thumbs-up" size={20} color={theme.colors.primary} />
            <Text style={styles.feedbackButtonText}>Send Feedback</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom Padding */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  welcomeCard: {
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    padding: theme.spacing.xl,
    marginHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.md,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  welcomeSubtitle: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  menuItem: {
    backgroundColor: theme.colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.sm,
  },
  menuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  faqItem: {
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  faqIcon: {
    marginRight: theme.spacing.md,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    lineHeight: 22,
  },
  faqAnswer: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  faqAnswerText: {
    fontSize: 15,
    color: theme.colors.textSecondary,
    lineHeight: 22,
    paddingTop: theme.spacing.md,
  },
  infoCard: {
    backgroundColor: theme.colors.surface,
    marginHorizontal: theme.spacing.lg,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  infoLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
  },
  infoValue: {
    fontSize: 15,
    color: theme.colors.textSecondary,
  },
  feedbackSection: {
    marginTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
  },
  feedbackButton: {
    backgroundColor: theme.colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderStyle: 'dashed',
  },
  feedbackButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
    marginLeft: theme.spacing.sm,
  },
  bottomPadding: {
    height: theme.spacing.xxl,
  },
});

export default HelpSupportScreen;

