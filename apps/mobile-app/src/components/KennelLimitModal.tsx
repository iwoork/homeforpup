import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { theme } from '../utils/theme';

interface KennelLimitModalProps {
  visible: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  currentCount: number;
  maxCount: number;
  subscriptionPlan: string;
}

const KennelLimitModal: React.FC<KennelLimitModalProps> = ({
  visible,
  onClose,
  onUpgrade,
  currentCount,
  maxCount,
  subscriptionPlan,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
      presentationStyle="overFullScreen"
      statusBarTranslucent={true}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Icon name="home" size={32} color={theme.colors.primary} />
            </View>
            <Text style={styles.title}>Kennel Limit Reached</Text>
            <Text style={styles.subtitle}>
              You've reached the maximum number of kennels for your {subscriptionPlan} plan
            </Text>
          </View>

          {/* Current Usage */}
          <View style={styles.usageContainer}>
            <View style={styles.usageInfo}>
              <Text style={styles.usageLabel}>Current Usage</Text>
              <Text style={styles.usageCount}>
                {currentCount} / {maxCount} kennels
              </Text>
            </View>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${(currentCount / maxCount) * 100}%` }
                ]} 
              />
            </View>
          </View>

          {/* Benefits of Upgrading */}
          <View style={styles.benefitsContainer}>
            <Text style={styles.benefitsTitle}>Upgrade to Premium for:</Text>
            <View style={styles.benefitItem}>
              <Icon name="checkmark-circle" size={20} color={theme.colors.success} />
              <Text style={styles.benefitText}>Up to 10 kennels</Text>
            </View>
            <View style={styles.benefitItem}>
              <Icon name="checkmark-circle" size={20} color={theme.colors.success} />
              <Text style={styles.benefitText}>Advanced analytics</Text>
            </View>
            <View style={styles.benefitItem}>
              <Icon name="checkmark-circle" size={20} color={theme.colors.success} />
              <Text style={styles.benefitText}>Priority support</Text>
            </View>
            <View style={styles.benefitItem}>
              <Icon name="checkmark-circle" size={20} color={theme.colors.success} />
              <Text style={styles.benefitText}>Premium features</Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.upgradeButton}
              onPress={onUpgrade}
              activeOpacity={0.8}
            >
              <Icon name="star" size={20} color="#ffffff" />
              <Text style={styles.upgradeButtonText}>Upgrade to Premium</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelButtonText}>Maybe Later</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.xl,
    margin: theme.spacing.lg,
    maxWidth: width - (theme.spacing.lg * 2),
    width: '100%',
    maxHeight: '80%',
  },
  header: {
    alignItems: 'center',
    padding: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  usageContainer: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
  },
  usageInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  usageLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  usageCount: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.primary,
  },
  progressBar: {
    height: 8,
    backgroundColor: theme.colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 4,
  },
  benefitsContainer: {
    paddingHorizontal: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  benefitText: {
    fontSize: 16,
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
  buttonContainer: {
    padding: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
  },
  upgradeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  upgradeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  cancelButton: {
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
  },
  cancelButtonText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
});

export default KennelLimitModal;
