import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { theme } from '../../utils/theme';
import Card from '../../components/Card';
import Button from '../../components/Button';

const { width } = Dimensions.get('window');

interface JourneyStep {
  key: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  completed?: boolean;
}

const PuppyJourneyScreen: React.FC = () => {
  const navigation = useNavigation();
  const [currentStep, setCurrentStep] = useState(0);

  const journeySteps: JourneyStep[] = [
    {
      key: 'search',
      title: 'Define Your Search',
      description: 'Find your perfect puppy match',
      icon: 'search',
      color: theme.colors.primary,
    },
    {
      key: 'breeders',
      title: 'Find Ethical Breeders',
      description: 'Connect with responsible breeders',
      icon: 'people',
      color: theme.colors.secondary,
    },
    {
      key: 'trust',
      title: 'Build Trust & Confidence',
      description: 'Verify breeders and read reviews',
      icon: 'shield-checkmark',
      color: '#10b981',
    },
    {
      key: 'adoption',
      title: 'Complete Adoption',
      description: 'Finalize your puppy adoption',
      icon: 'heart',
      color: '#f59e0b',
    },
    {
      key: 'support',
      title: 'Post-Adoption Support',
      description: 'Get ongoing help and resources',
      icon: 'checkmark-circle',
      color: '#8b5cf6',
    }
  ];

  const quickActions = [
    {
      title: 'Search Wizard',
      description: 'Find your perfect puppy with our guided search',
      icon: 'search',
      color: theme.colors.primary,
      onPress: () => navigation.navigate('PuppySearchWizard' as never),
    },
    {
      title: 'Browse Puppies',
      description: 'View all available puppies',
      icon: 'heart',
      color: '#ec4899',
      onPress: () => navigation.navigate('SearchPuppies' as never),
    },
    {
      title: 'Breed Guide',
      description: 'Learn about different dog breeds',
      icon: 'book',
      color: '#8b5cf6',
      onPress: () => {}, // TODO: Navigate to breed guide
    },
    {
      title: 'Ethical Guide',
      description: 'Learn how to identify ethical breeders',
      icon: 'shield-checkmark',
      color: '#10b981',
      onPress: () => navigation.navigate('EthicalBreederGuide' as never),
    },
    {
      title: 'Trust Features',
      description: 'Reviews, verification, and transparency',
      icon: 'star',
      color: '#f59e0b',
      onPress: () => {}, // TODO: Navigate to trust features
    },
    {
      title: 'Post-Adoption',
      description: 'Support after bringing puppy home',
      icon: 'home',
      color: '#06b6d4',
      onPress: () => navigation.navigate('PostAdoptionSupport' as never),
    }
  ];

  const renderStepCard = (step: JourneyStep, index: number) => (
    <TouchableOpacity
      key={step.key}
      style={styles.stepCard}
      onPress={() => {
        switch (step.key) {
          case 'search':
            navigation.navigate('PuppySearchWizard' as never);
            break;
          case 'breeders':
            navigation.navigate('EthicalBreederGuide' as never);
            break;
          case 'trust':
            // TODO: Navigate to trust features
            break;
          case 'adoption':
            // TODO: Navigate to adoption guide
            break;
          case 'support':
            navigation.navigate('PostAdoptionSupport' as never);
            break;
        }
      }}
    >
      <LinearGradient
        colors={[step.color, `${step.color}80`]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.stepGradient}
      >
        <View style={styles.stepIconContainer}>
          <Icon name={step.icon} size={32} color="#fff" />
        </View>
        <View style={styles.stepContent}>
          <Text style={styles.stepTitle}>{step.title}</Text>
          <Text style={styles.stepDescription}>{step.description}</Text>
        </View>
        <Icon name="chevron-forward" size={24} color="#fff" />
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderQuickAction = (action: any, index: number) => (
    <TouchableOpacity
      key={index}
      style={styles.quickActionCard}
      onPress={action.onPress}
    >
      <View style={[styles.quickActionIcon, { backgroundColor: `${action.color}15` }]}>
        <Icon name={action.icon} size={24} color={action.color} />
      </View>
      <View style={styles.quickActionContent}>
        <Text style={styles.quickActionTitle}>{action.title}</Text>
        <Text style={styles.quickActionDescription}>{action.description}</Text>
      </View>
      <Icon name="chevron-forward" size={20} color={theme.colors.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <LinearGradient
          colors={['#f0f9fa', '#ffffff']}
          style={styles.heroSection}
        >
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>Find Your Perfect Puppy</Text>
            <Text style={styles.heroDescription}>
              From defining your search criteria to post-adoption support, 
              we're here to guide you through every step of finding and caring 
              for your perfect puppy.
            </Text>
          </View>
        </LinearGradient>

        {/* Journey Steps */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Complete Journey</Text>
          <Text style={styles.sectionSubtitle}>
            Follow these steps to find and care for your perfect puppy
          </Text>
          
          {journeySteps.map((step, index) => renderStepCard(step, index))}
        </View>

        {/* Quick Access */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Access</Text>
          <Text style={styles.sectionSubtitle}>
            Jump to specific resources and tools
          </Text>
          
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action, index) => renderQuickAction(action, index))}
          </View>
        </View>

        {/* Tips Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tips for Success</Text>
          
          <Card style={styles.tipCard}>
            <View style={styles.tipHeader}>
              <Icon name="bulb" size={24} color="#fbbf24" />
              <Text style={styles.tipTitle}>Be Patient</Text>
            </View>
            <Text style={styles.tipText}>
              Finding the right puppy takes time. Quality breeders often have waiting lists, 
              but this ensures you get a well-socialized, healthy puppy.
            </Text>
          </Card>

          <Card style={styles.tipCard}>
            <View style={styles.tipHeader}>
              <Icon name="shield-checkmark" size={24} color="#10b981" />
              <Text style={styles.tipTitle}>Verify Breeders</Text>
            </View>
            <Text style={styles.tipText}>
              Always verify breeders through our platform. Look for health testing, 
              home visits, and positive reviews from previous families.
            </Text>
          </Card>

          <Card style={styles.tipCard}>
            <View style={styles.tipHeader}>
              <Icon name="people" size={24} color={theme.colors.primary} />
              <Text style={styles.tipTitle}>Ask Questions</Text>
            </View>
            <Text style={styles.tipText}>
              Don't hesitate to ask breeders about their practices, health testing, 
              and ongoing support. Good breeders welcome questions.
            </Text>
          </Card>
        </View>

        {/* Call to Action */}
        <Card style={styles.ctaCard}>
          <LinearGradient
            colors={[theme.colors.primary, theme.colors.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.ctaGradient}
          >
            <View style={styles.ctaContent}>
              <Icon name="heart" size={48} color="#fff" />
              <Text style={styles.ctaTitle}>Ready to Start Your Journey?</Text>
              <Text style={styles.ctaDescription}>
                Join thousands of families who have found their perfect puppy 
                through our trusted platform.
              </Text>
              <View style={styles.ctaButtons}>
                <Button
                  title="Start Search"
                  onPress={() => navigation.navigate('PuppySearchWizard' as never)}
                  icon={<Icon name="search" size={20} color="#fff" />}
                  style={styles.ctaButton}
                  variant="outline"
                />
                <Button
                  title="Browse Puppies"
                  onPress={() => navigation.navigate('SearchPuppies' as never)}
                  icon={<Icon name="heart" size={20} color="#fff" />}
                  style={styles.ctaButton}
                  variant="outline"
                />
              </View>
            </View>
          </LinearGradient>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
  },
  heroSection: {
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
  },
  heroContent: {
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    textAlign: 'center',
  },
  heroDescription: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: width - (theme.spacing.xl * 2),
  },
  section: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.lg,
  },
  stepCard: {
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.md,
  },
  stepGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  stepIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: theme.spacing.xs,
  },
  stepDescription: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
  },
  quickActionsGrid: {
    gap: theme.spacing.sm,
  },
  quickActionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.sm,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  quickActionContent: {
    flex: 1,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  quickActionDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  tipCard: {
    marginBottom: theme.spacing.md,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
  tipText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  ctaCard: {
    margin: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
    ...theme.shadows.lg,
  },
  ctaGradient: {
    padding: theme.spacing.xl,
  },
  ctaContent: {
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  ctaDescription: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.9,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: theme.spacing.lg,
  },
  ctaButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    width: '100%',
  },
  ctaButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: '#fff',
  },
});

export default PuppyJourneyScreen;
