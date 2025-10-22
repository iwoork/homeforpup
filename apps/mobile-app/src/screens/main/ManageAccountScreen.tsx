import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Switch,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../contexts/AuthContext';
import { theme } from '../../utils/theme';
import apiService from '../../services/apiService';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  interval: 'monthly' | 'yearly';
  features: string[];
  isPopular?: boolean;
  isCurrent?: boolean;
}

interface BillingHistoryItem {
  id: string;
  date: string;
  description: string;
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  invoiceUrl?: string;
}

const ManageAccountScreen: React.FC = () => {
  const { user, updateUser } = useAuth();
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [billingHistory, setBillingHistory] = useState<BillingHistoryItem[]>([]);
  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>([]);
  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    push: true,
    sms: false,
  });

  // Mock subscription plans - in real app, these would come from API
  const mockSubscriptionPlans: SubscriptionPlan[] = [
    {
      id: 'basic',
      name: 'Basic Plan',
      price: 0,
      interval: 'monthly',
      features: [
        '1 kennel',
        'Basic litter management',
        'Standard support',
        'Basic analytics',
      ],
      isCurrent: user?.subscriptionPlan === 'basic',
    },
    {
      id: 'premium',
      name: 'Premium Plan',
      price: 29.99,
      interval: 'monthly',
      features: [
        'Unlimited kennels',
        'Advanced litter management',
        'Contract management',
        'Priority support',
        'Advanced analytics',
        'Custom branding',
      ],
      isPopular: true,
      isCurrent: user?.subscriptionPlan === 'premium',
    },
    {
      id: 'pro',
      name: 'Pro Plan',
      price: 49.99,
      interval: 'monthly',
      features: [
        'Everything in Premium',
        'API access',
        'White-label solution',
        'Dedicated support',
        'Custom integrations',
        'Advanced reporting',
      ],
      isCurrent: user?.subscriptionPlan === 'pro',
    },
  ];

  // Mock billing history - in real app, this would come from API
  const mockBillingHistory: BillingHistoryItem[] = [
    {
      id: '1',
      date: '2024-01-15',
      description: 'Premium Plan - Monthly',
      amount: 29.99,
      status: 'paid',
    },
    {
      id: '2',
      date: '2023-12-15',
      description: 'Premium Plan - Monthly',
      amount: 29.99,
      status: 'paid',
    },
    {
      id: '3',
      date: '2023-11-15',
      description: 'Premium Plan - Monthly',
      amount: 29.99,
      status: 'paid',
    },
  ];

  useEffect(() => {
    setSubscriptionPlans(mockSubscriptionPlans);
    setBillingHistory(mockBillingHistory);
  }, [user?.subscriptionPlan]);

  const fetchBillingHistory = useCallback(async () => {
    try {
      // In real app, this would be an API call
      // const response = await apiService.getBillingHistory();
      // setBillingHistory(response.data);
    } catch (error) {
      console.error('Error fetching billing history:', error);
    }
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchBillingHistory();
    setRefreshing(false);
  }, [fetchBillingHistory]);

  const handleSubscriptionChange = async (planId: string) => {
    const plan = subscriptionPlans.find(p => p.id === planId);
    if (!plan) return;

    if (plan.isCurrent) {
      Alert.alert('Current Plan', 'This is your current subscription plan.');
      return;
    }

    setLoading(true);
    try {
      // In real app, this would be an API call to update subscription
      // const response = await apiService.updateSubscription(planId);
      
      // Mock success
      Alert.alert(
        'Subscription Updated',
        `Your subscription has been updated to ${plan.name}.`,
        [
          {
            text: 'OK',
            onPress: () => {
              // Update user context
              updateUser({
                ...user,
                subscriptionPlan: planId as 'basic' | 'premium' | 'pro',
              });
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to update subscription. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = () => {
    Alert.alert(
      'Cancel Subscription',
      'Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your current billing period.',
      [
        { text: 'Keep Subscription', style: 'cancel' },
        {
          text: 'Cancel Subscription',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              // In real app, this would be an API call
              // await apiService.cancelSubscription();
              Alert.alert('Subscription Cancelled', 'Your subscription has been cancelled.');
            } catch (error) {
              Alert.alert('Error', 'Failed to cancel subscription. Please try again.');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleUpdatePaymentMethod = () => {
    Alert.alert(
      'Update Payment Method',
      'This would open a secure payment method update flow in a real app.',
      [{ text: 'OK' }]
    );
  };

  const handleDownloadInvoice = (invoiceId: string) => {
    Alert.alert(
      'Download Invoice',
      'This would download the invoice PDF in a real app.',
      [{ text: 'OK' }]
    );
  };

  const handleNotificationToggle = (key: keyof typeof notificationSettings) => {
    setNotificationSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const accountMenuItems = [
    {
      title: 'Personal Information',
      subtitle: 'Update your profile details',
      icon: 'person-outline',
      iconColor: theme.colors.primary,
      onPress: () => navigation.navigate('EditProfile' as never),
    },
    {
      title: 'Security Settings',
      subtitle: 'Password, 2FA, and security',
      icon: 'shield-checkmark-outline',
      iconColor: '#10b981',
      onPress: () => navigation.navigate('PrivacySettingsScreen' as never),
    },
    {
      title: 'Notification Preferences',
      subtitle: 'Manage how you receive notifications',
      icon: 'notifications-outline',
      iconColor: '#f59e0b',
      onPress: () => navigation.navigate('NotificationsScreen' as never),
    },
    {
      title: 'Data & Privacy',
      subtitle: 'Control your data and privacy',
      icon: 'lock-closed-outline',
      iconColor: '#8b5cf6',
      onPress: () => navigation.navigate('PrivacySettingsScreen' as never),
    },
  ];

  const currentPlan = subscriptionPlans.find(plan => plan.isCurrent);

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[theme.colors.primary]}
          tintColor={theme.colors.primary}
        />
      }
    >
      {/* Current Subscription Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Current Subscription</Text>
        {currentPlan && (
          <View style={styles.subscriptionCard}>
            <LinearGradient
              colors={
                currentPlan.id === 'premium'
                  ? ['#6366f1', '#4f46e5']
                  : currentPlan.id === 'pro'
                  ? ['#f59e0b', '#d97706']
                  : [theme.colors.primary, theme.colors.primaryDark]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.subscriptionGradient}
            >
              <View style={styles.subscriptionHeader}>
                <View style={styles.subscriptionBadge}>
                  <Icon
                    name={
                      currentPlan.id === 'pro' ? 'star' : 
                      currentPlan.id === 'premium' ? 'diamond' : 'shield-checkmark'
                    }
                    size={24}
                    color="#ffffff"
                  />
                </View>
                <View style={styles.subscriptionInfo}>
                  <Text style={styles.planName}>{currentPlan.name}</Text>
                  <Text style={styles.planPrice}>
                    {currentPlan.price === 0 ? 'Free' : `$${currentPlan.price}/${currentPlan.interval}`}
                  </Text>
                </View>
                {currentPlan.id !== 'basic' && (
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={handleCancelSubscription}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                )}
              </View>
            </LinearGradient>
          </View>
        )}
      </View>

      {/* Subscription Plans Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Available Plans</Text>
        {subscriptionPlans.map((plan) => (
          <TouchableOpacity
            key={plan.id}
            style={[
              styles.planCard,
              plan.isCurrent && styles.currentPlanCard,
              plan.isPopular && styles.popularPlanCard,
            ]}
            onPress={() => handleSubscriptionChange(plan.id)}
            disabled={loading}
          >
            {plan.isPopular && (
              <View style={styles.popularBadge}>
                <Text style={styles.popularBadgeText}>Most Popular</Text>
              </View>
            )}
            <View style={styles.planHeader}>
              <View style={styles.planInfo}>
                <Text style={styles.planTitle}>{plan.name}</Text>
                <Text style={styles.planPriceText}>
                  {plan.price === 0 ? 'Free' : `$${plan.price}/${plan.interval}`}
                </Text>
              </View>
              {plan.isCurrent && (
                <View style={styles.currentBadge}>
                  <Icon name="checkmark-circle" size={20} color={theme.colors.success} />
                  <Text style={styles.currentBadgeText}>Current</Text>
                </View>
              )}
            </View>
            <View style={styles.planFeatures}>
              {plan.features.map((feature, index) => (
                <View key={index} style={styles.featureRow}>
                  <Icon name="checkmark" size={16} color={theme.colors.success} />
                  <Text style={styles.featureText}>{feature}</Text>
                </View>
              ))}
            </View>
          </TouchableOpacity>
        ))}
      </View>

      {/* Billing History Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Billing History</Text>
        {billingHistory.map((item) => (
          <View key={item.id} style={styles.billingItem}>
            <View style={styles.billingInfo}>
              <Text style={styles.billingDescription}>{item.description}</Text>
              <Text style={styles.billingDate}>{item.date}</Text>
            </View>
            <View style={styles.billingAmount}>
              <Text style={styles.billingAmountText}>${item.amount.toFixed(2)}</Text>
              <View style={[
                styles.statusBadge,
                { backgroundColor: item.status === 'paid' ? theme.colors.success : theme.colors.warning }
              ]}>
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
            </View>
            {item.invoiceUrl && (
              <TouchableOpacity
                style={styles.downloadButton}
                onPress={() => handleDownloadInvoice(item.id)}
              >
                <Icon name="download-outline" size={16} color={theme.colors.primary} />
              </TouchableOpacity>
            )}
          </View>
        ))}
      </View>

      {/* Payment Method Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Payment Method</Text>
        <TouchableOpacity
          style={styles.paymentMethodCard}
          onPress={handleUpdatePaymentMethod}
        >
          <View style={styles.paymentMethodInfo}>
            <Icon name="card-outline" size={24} color={theme.colors.primary} />
            <View style={styles.paymentMethodDetails}>
              <Text style={styles.paymentMethodTitle}>Visa ending in 4242</Text>
              <Text style={styles.paymentMethodSubtitle}>Expires 12/25</Text>
            </View>
          </View>
          <Icon name="chevron-forward" size={20} color={theme.colors.textTertiary} />
        </TouchableOpacity>
      </View>

      {/* Account Settings Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Settings</Text>
        {accountMenuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={item.onPress}
          >
            <View style={[styles.menuIconContainer, { backgroundColor: `${item.iconColor}15` }]}>
              <Icon name={item.icon} size={22} color={item.iconColor} />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>{item.title}</Text>
              <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
            </View>
            <Icon name="chevron-forward" size={20} color={theme.colors.textTertiary} />
          </TouchableOpacity>
        ))}
      </View>

      {/* Notification Settings Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notification Settings</Text>
        <View style={styles.notificationCard}>
          <View style={styles.notificationItem}>
            <View style={styles.notificationInfo}>
              <Icon name="mail-outline" size={20} color={theme.colors.primary} />
              <Text style={styles.notificationLabel}>Email Notifications</Text>
            </View>
            <Switch
              value={notificationSettings.email}
              onValueChange={() => handleNotificationToggle('email')}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor="#ffffff"
            />
          </View>
          <View style={styles.notificationItem}>
            <View style={styles.notificationInfo}>
              <Icon name="notifications-outline" size={20} color={theme.colors.primary} />
              <Text style={styles.notificationLabel}>Push Notifications</Text>
            </View>
            <Switch
              value={notificationSettings.push}
              onValueChange={() => handleNotificationToggle('push')}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor="#ffffff"
            />
          </View>
          <View style={styles.notificationItem}>
            <View style={styles.notificationInfo}>
              <Icon name="chatbubble-outline" size={20} color={theme.colors.primary} />
              <Text style={styles.notificationLabel}>SMS Notifications</Text>
            </View>
            <Switch
              value={notificationSettings.sms}
              onValueChange={() => handleNotificationToggle('sms')}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor="#ffffff"
            />
          </View>
        </View>
      </View>

      {/* Loading Overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Processing...</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  section: {
    marginBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  subscriptionCard: {
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.lg,
  },
  subscriptionGradient: {
    padding: theme.spacing.lg,
  },
  subscriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subscriptionBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  subscriptionInfo: {
    flex: 1,
  },
  planName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  planPrice: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.9,
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  cancelButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  planCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.sm,
  },
  currentPlanCard: {
    borderColor: theme.colors.primary,
    borderWidth: 2,
  },
  popularPlanCard: {
    borderColor: '#f59e0b',
    borderWidth: 2,
  },
  popularBadge: {
    position: 'absolute',
    top: -8,
    right: theme.spacing.md,
    backgroundColor: '#f59e0b',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  popularBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  planInfo: {
    flex: 1,
  },
  planTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  planPriceText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  currentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.success + '20',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  currentBadgeText: {
    color: theme.colors.success,
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  planFeatures: {
    marginTop: theme.spacing.sm,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  featureText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.sm,
  },
  billingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.sm,
  },
  billingInfo: {
    flex: 1,
  },
  billingDescription: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  billingDate: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  billingAmount: {
    alignItems: 'flex-end',
    marginRight: theme.spacing.sm,
  },
  billingAmountText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  statusText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  downloadButton: {
    padding: theme.spacing.sm,
  },
  paymentMethodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.sm,
  },
  paymentMethodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentMethodDetails: {
    marginLeft: theme.spacing.md,
  },
  paymentMethodTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  paymentMethodSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
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
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  notificationCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.sm,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  notificationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  notificationLabel: {
    fontSize: 16,
    color: theme.colors.text,
    marginLeft: theme.spacing.md,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text,
    fontWeight: '500',
  },
});

export default ManageAccountScreen;
