import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
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

interface Milestone {
  week: number;
  title: string;
  description: string;
  tasks: string[];
  tips: string[];
  warnings?: string[];
}

interface Resource {
  title: string;
  description: string;
  type: 'article' | 'video' | 'guide' | 'checklist';
  icon: string;
}

const PostAdoptionSupportScreen: React.FC = () => {
  const navigation = useNavigation();
  const [completedMilestones, setCompletedMilestones] = useState<Set<number>>(new Set());
  const [activeTab, setActiveTab] = useState<'milestones' | 'resources' | 'emergency' | 'community'>('milestones');

  const toggleMilestone = (week: number) => {
    const newCompleted = new Set(completedMilestones);
    if (newCompleted.has(week)) {
      newCompleted.delete(week);
    } else {
      newCompleted.add(week);
    }
    setCompletedMilestones(newCompleted);
  };

  const milestones: Milestone[] = [
    {
      week: 1,
      title: "First Week Home",
      description: "The critical adjustment period - focus on comfort and safety",
      tasks: [
        "Schedule vet appointment within 48-72 hours",
        "Set up safe, quiet space for puppy",
        "Establish feeding schedule",
        "Begin house training routine",
        "Introduce to family members gradually"
      ],
      tips: [
        "Keep the environment calm and quiet",
        "Don't overwhelm with too many new experiences",
        "Let the puppy explore at their own pace",
        "Start bonding through gentle play and treats"
      ],
      warnings: [
        "Watch for signs of stress or illness",
        "Don't leave puppy alone for long periods",
        "Avoid overwhelming with visitors"
      ]
    },
    {
      week: 2,
      title: "Settling In",
      description: "Building routines and beginning socialization",
      tasks: [
        "Continue house training consistency",
        "Introduce basic commands (sit, come)",
        "Begin crate training if using",
        "Start socialization with controlled exposure",
        "Establish sleep schedule"
      ],
      tips: [
        "Consistency is key for house training",
        "Keep training sessions short and positive",
        "Reward good behavior immediately",
        "Be patient with accidents"
      ]
    },
    {
      week: 4,
      title: "One Month Milestone",
      description: "Puppy should be more comfortable and showing personality",
      tasks: [
        "Complete first round of vaccinations",
        "Begin more structured training",
        "Introduce to other friendly dogs",
        "Start grooming routine",
        "Plan for spay/neuter consultation"
      ],
      tips: [
        "This is a great time to start puppy classes",
        "Socialization window is still open",
        "Continue positive reinforcement training"
      ]
    },
    {
      week: 8,
      title: "Two Month Mark",
      description: "Puppy should be well-adjusted and ready for more challenges",
      tasks: [
        "Complete vaccination series",
        "Begin more advanced training",
        "Increase socialization opportunities",
        "Consider puppy kindergarten",
        "Plan for spay/neuter surgery"
      ],
      tips: [
        "Puppy should be fully house trained by now",
        "Great time to introduce new experiences",
        "Continue building positive associations"
      ]
    },
    {
      week: 12,
      title: "Three Month Milestone",
      description: "Puppy is becoming a confident, well-adjusted family member",
      tasks: [
        "Complete spay/neuter surgery",
        "Begin adolescent training preparation",
        "Increase exercise and mental stimulation",
        "Continue socialization",
        "Plan for long-term care"
      ],
      tips: [
        "Puppy may start testing boundaries - stay consistent",
        "Continue training and socialization",
        "Prepare for adolescent phase"
      ]
    }
  ];

  const resources: Resource[] = [
    {
      title: "Puppy Training Basics",
      description: "Essential training techniques for new puppy owners",
      type: "guide",
      icon: "book"
    },
    {
      title: "House Training Checklist",
      description: "Step-by-step guide to successful house training",
      type: "checklist",
      icon: "list"
    },
    {
      title: "Socialization Schedule",
      description: "Critical socialization timeline and activities",
      type: "article",
      icon: "people"
    },
    {
      title: "Health Care Timeline",
      description: "Vaccination and health check schedule",
      type: "guide",
      icon: "medical"
    },
    {
      title: "Puppy Nutrition Guide",
      description: "Feeding schedules and nutritional needs",
      type: "article",
      icon: "nutrition"
    },
    {
      title: "Emergency Preparedness",
      description: "What to do in case of puppy emergencies",
      type: "guide",
      icon: "warning"
    }
  ];

  const emergencyContacts = [
    {
      name: "Emergency Vet Hotline",
      number: "1-800-PET-HELP",
      description: "24/7 emergency veterinary assistance",
      icon: "call"
    },
    {
      name: "Poison Control",
      number: "1-888-426-4435",
      description: "ASPCA Animal Poison Control Center",
      icon: "warning"
    },
    {
      name: "Your Breeder",
      number: "Contact via HomeForPup",
      description: "Your puppy's breeder for ongoing support",
      icon: "people"
    }
  ];

  const totalMilestones = milestones.length;
  const completedCount = completedMilestones.size;
  const progressPercentage = Math.round((completedCount / totalMilestones) * 100);

  const renderMilestones = () => (
    <View style={styles.tabContent}>
      {/* Progress Overview */}
      <Card style={styles.progressCard}>
        <View style={styles.progressHeader}>
          <View style={styles.progressInfo}>
            <Text style={styles.progressTitle}>Your Puppy Journey Progress</Text>
            <Text style={styles.progressSubtitle}>
              Track your puppy's development milestones
            </Text>
          </View>
          <View style={styles.progressStats}>
            <Text style={styles.progressCount}>{completedCount}/{totalMilestones}</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
            </View>
          </View>
        </View>
      </Card>

      {/* Milestones */}
      {milestones.map((milestone, index) => (
        <Card key={index} style={styles.milestoneCard}>
          <TouchableOpacity
            style={styles.milestoneHeader}
            onPress={() => toggleMilestone(milestone.week)}
          >
            <View style={styles.milestoneLeft}>
              <View style={[
                styles.milestoneIcon,
                completedMilestones.has(milestone.week) && styles.milestoneIconCompleted
              ]}>
                <Icon
                  name={completedMilestones.has(milestone.week) ? "checkmark" : "calendar"}
                  size={20}
                  color={completedMilestones.has(milestone.week) ? "#fff" : theme.colors.primary}
                />
              </View>
              <View style={styles.milestoneInfo}>
                <Text style={styles.milestoneTitle}>
                  Week {milestone.week}: {milestone.title}
                </Text>
                <Text style={styles.milestoneDescription}>{milestone.description}</Text>
              </View>
            </View>
            {completedMilestones.has(milestone.week) && (
              <View style={styles.completedBadge}>
                <Icon name="checkmark-circle" size={20} color="#52c41a" />
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.milestoneContent}>
            <View style={styles.milestoneSection}>
              <Text style={styles.milestoneSectionTitle}>Key Tasks</Text>
              {milestone.tasks.map((task, taskIndex) => (
                <View key={taskIndex} style={styles.taskItem}>
                  <Icon name="checkmark-circle-outline" size={16} color={theme.colors.primary} />
                  <Text style={styles.taskText}>{task}</Text>
                </View>
              ))}
            </View>

            <View style={styles.milestoneSection}>
              <Text style={styles.milestoneSectionTitle}>Pro Tips</Text>
              {milestone.tips.map((tip, tipIndex) => (
                <View key={tipIndex} style={styles.tipItem}>
                  <Icon name="bulb-outline" size={16} color="#fbbf24" />
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}
            </View>

            {milestone.warnings && (
              <View style={styles.milestoneSection}>
                <Text style={styles.milestoneSectionTitle}>Warnings</Text>
                {milestone.warnings.map((warning, warningIndex) => (
                  <View key={warningIndex} style={styles.warningItem}>
                    <Icon name="warning-outline" size={16} color="#ff4d4f" />
                    <Text style={styles.warningText}>{warning}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </Card>
      ))}
    </View>
  );

  const renderResources = () => (
    <View style={styles.tabContent}>
      <Text style={styles.tabTitle}>Resources & Guides</Text>
      <View style={styles.resourcesGrid}>
        {resources.map((resource, index) => (
          <TouchableOpacity key={index} style={styles.resourceCard}>
            <View style={styles.resourceIcon}>
              <Icon name={resource.icon} size={32} color={theme.colors.primary} />
            </View>
            <Text style={styles.resourceTitle}>{resource.title}</Text>
            <Text style={styles.resourceDescription}>{resource.description}</Text>
            <View style={styles.resourceType}>
              <Text style={styles.resourceTypeText}>{resource.type}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderEmergency = () => (
    <View style={styles.tabContent}>
      <Text style={styles.tabTitle}>Emergency Support</Text>
      
      <Card style={styles.emergencyAlert}>
        <View style={styles.emergencyAlertHeader}>
          <Icon name="warning" size={24} color="#ff4d4f" />
          <Text style={styles.emergencyAlertTitle}>Emergency Situations</Text>
        </View>
        <Text style={styles.emergencyAlertText}>
          If your puppy is in immediate danger or showing signs of serious illness, 
          contact emergency veterinary services immediately.
        </Text>
      </Card>

      <View style={styles.emergencyContacts}>
        {emergencyContacts.map((contact, index) => (
          <Card key={index} style={styles.contactCard}>
            <View style={styles.contactHeader}>
              <View style={styles.contactIcon}>
                <Icon name={contact.icon} size={24} color={theme.colors.primary} />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>{contact.name}</Text>
                <Text style={styles.contactNumber}>{contact.number}</Text>
                <Text style={styles.contactDescription}>{contact.description}</Text>
              </View>
              <TouchableOpacity style={styles.contactButton}>
                <Icon name="call" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </Card>
        ))}
      </View>

      <Card style={styles.emergencySigns}>
        <Text style={styles.emergencySignsTitle}>Signs of Emergency</Text>
        {[
          "Difficulty breathing or choking",
          "Unconsciousness or collapse",
          "Severe bleeding",
          "Signs of poisoning (vomiting, diarrhea, drooling)",
          "Seizures or convulsions",
          "Inability to urinate or defecate",
          "Severe pain or distress",
          "High fever (over 103°F)"
        ].map((sign, index) => (
          <View key={index} style={styles.emergencySignItem}>
            <Icon name="warning" size={16} color="#ff4d4f" />
            <Text style={styles.emergencySignText}>{sign}</Text>
          </View>
        ))}
      </Card>
    </View>
  );

  const renderCommunity = () => (
    <View style={styles.tabContent}>
      <Text style={styles.tabTitle}>Community Support</Text>
      
      <Card style={styles.communityCard}>
        <View style={styles.communityHeader}>
          <Icon name="people" size={48} color={theme.colors.primary} />
          <Text style={styles.communityTitle}>Connect with Other Puppy Parents</Text>
          <Text style={styles.communityDescription}>
            Connect with other puppy parents, share experiences, and get advice 
            from our supportive community.
          </Text>
        </View>
        <View style={styles.communityButtons}>
          <Button
            title="Join Community"
            onPress={() => {}}
            icon={<Icon name="people" size={20} color="#fff" />}
            style={styles.communityButton}
          />
          <Button
            title="Find Local Groups"
            onPress={() => {}}
            icon={<Icon name="location" size={20} color={theme.colors.primary} />}
            variant="outline"
            style={styles.communityButton}
          />
        </View>
      </Card>

      <Card style={styles.breederSupportCard}>
        <View style={styles.breederSupportHeader}>
          <Icon name="home" size={48} color={theme.colors.primary} />
          <Text style={styles.breederSupportTitle}>Stay Connected with Your Breeder</Text>
          <Text style={styles.breederSupportDescription}>
            Your breeder is a valuable resource for ongoing support and advice 
            throughout your puppy's life.
          </Text>
        </View>
        <View style={styles.breederSupportButtons}>
          <Button
            title="Contact Breeder"
            onPress={() => {}}
            icon={<Icon name="call" size={20} color="#fff" />}
            style={styles.breederSupportButton}
          />
          <Button
            title="View Contract"
            onPress={() => {}}
            icon={<Icon name="document-text" size={20} color={theme.colors.primary} />}
            variant="outline"
            style={styles.breederSupportButton}
          />
        </View>
      </Card>
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'milestones':
        return renderMilestones();
      case 'resources':
        return renderResources();
      case 'emergency':
        return renderEmergency();
      case 'community':
        return renderCommunity();
      default:
        return renderMilestones();
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Tab Navigation */}
      <View style={styles.tabNavigation}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.tabButtons}>
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'milestones' && styles.tabButtonActive]}
              onPress={() => setActiveTab('milestones')}
            >
              <Icon name="calendar" size={20} color={activeTab === 'milestones' ? '#fff' : theme.colors.primary} />
              <Text style={[styles.tabButtonText, activeTab === 'milestones' && styles.tabButtonTextActive]}>
                Milestones
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'resources' && styles.tabButtonActive]}
              onPress={() => setActiveTab('resources')}
            >
              <Icon name="book" size={20} color={activeTab === 'resources' ? '#fff' : theme.colors.primary} />
              <Text style={[styles.tabButtonText, activeTab === 'resources' && styles.tabButtonTextActive]}>
                Resources
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'emergency' && styles.tabButtonActive]}
              onPress={() => setActiveTab('emergency')}
            >
              <Icon name="warning" size={20} color={activeTab === 'emergency' ? '#fff' : theme.colors.primary} />
              <Text style={[styles.tabButtonText, activeTab === 'emergency' && styles.tabButtonTextActive]}>
                Emergency
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.tabButton, activeTab === 'community' && styles.tabButtonActive]}
              onPress={() => setActiveTab('community')}
            >
              <Icon name="people" size={20} color={activeTab === 'community' ? '#fff' : theme.colors.primary} />
              <Text style={[styles.tabButtonText, activeTab === 'community' && styles.tabButtonTextActive]}>
                Community
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderTabContent()}
      </ScrollView>

      {/* Quick Actions Footer */}
      <View style={styles.footer}>
        <View style={styles.quickActions}>
          <Button
            title="Call Emergency Vet"
            onPress={() => Alert.alert('Calling...', '1-800-PET-HELP')}
            icon={<Icon name="call" size={20} color={theme.colors.primary} />}
            variant="outline"
            style={styles.quickActionButton}
          />
          <Button
            title="Ask Community"
            onPress={() => setActiveTab('community')}
            icon={<Icon name="people" size={20} color="#fff" />}
            style={styles.quickActionButton}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  tabNavigation: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  tabButtons: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    backgroundColor: 'transparent',
  },
  tabButtonActive: {
    backgroundColor: theme.colors.primary,
  },
  tabButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
    marginLeft: theme.spacing.xs,
  },
  tabButtonTextActive: {
    color: '#fff',
  },
  content: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  tabContent: {
    paddingTop: theme.spacing.lg,
  },
  tabTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  progressCard: {
    marginBottom: theme.spacing.lg,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressInfo: {
    flex: 1,
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  progressSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  progressStats: {
    alignItems: 'flex-end',
  },
  progressCount: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  progressBar: {
    width: 80,
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary,
    borderRadius: 2,
  },
  milestoneCard: {
    marginBottom: theme.spacing.md,
  },
  milestoneHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  milestoneLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  milestoneIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${theme.colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  milestoneIconCompleted: {
    backgroundColor: theme.colors.primary,
  },
  milestoneInfo: {
    flex: 1,
  },
  milestoneTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  milestoneDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  completedBadge: {
    // No specific styles needed
  },
  milestoneContent: {
    gap: theme.spacing.md,
  },
  milestoneSection: {
    // No specific styles needed
  },
  milestoneSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  taskText: {
    fontSize: 14,
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  tipText: {
    fontSize: 14,
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
  warningItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  warningText: {
    fontSize: 14,
    color: '#ff4d4f',
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
  resourcesGrid: {
    gap: theme.spacing.md,
  },
  resourceCard: {
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  resourceIcon: {
    marginBottom: theme.spacing.md,
  },
  resourceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  resourceDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: theme.spacing.sm,
  },
  resourceType: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  resourceTypeText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  emergencyAlert: {
    marginBottom: theme.spacing.lg,
    borderWidth: 1,
    borderColor: '#ff4d4f',
    backgroundColor: '#fff2f0',
  },
  emergencyAlertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  emergencyAlertTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ff4d4f',
    marginLeft: theme.spacing.sm,
  },
  emergencyAlertText: {
    fontSize: 14,
    color: '#ff4d4f',
    lineHeight: 20,
  },
  emergencyContacts: {
    marginBottom: theme.spacing.lg,
  },
  contactCard: {
    marginBottom: theme.spacing.sm,
  },
  contactHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${theme.colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  contactNumber: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  contactDescription: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  contactButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emergencySigns: {
    marginBottom: theme.spacing.lg,
  },
  emergencySignsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  emergencySignItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  emergencySignText: {
    fontSize: 14,
    color: '#ff4d4f',
    marginLeft: theme.spacing.sm,
    flex: 1,
  },
  communityCard: {
    alignItems: 'center',
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
  },
  communityHeader: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  communityTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  communityDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  communityButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  communityButton: {
    flex: 1,
  },
  breederSupportCard: {
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  breederSupportHeader: {
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  breederSupportTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  breederSupportDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  breederSupportButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  breederSupportButton: {
    flex: 1,
  },
  footer: {
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  quickActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  quickActionButton: {
    flex: 1,
  },
});

export default PostAdoptionSupportScreen;
