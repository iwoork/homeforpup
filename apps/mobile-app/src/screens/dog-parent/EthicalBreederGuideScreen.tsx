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

interface BreederChecklist {
  category: string;
  items: {
    item: string;
    importance: 'critical' | 'important' | 'nice-to-have';
    description: string;
    redFlag?: string;
  }[];
}

const EthicalBreederGuideScreen: React.FC = () => {
  const navigation = useNavigation();
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());

  const toggleChecklistItem = (itemKey: string) => {
    const newCompleted = new Set(completedItems);
    if (newCompleted.has(itemKey)) {
      newCompleted.delete(itemKey);
    } else {
      newCompleted.add(itemKey);
    }
    setCompletedItems(newCompleted);
  };

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'critical': return '#ff4d4f';
      case 'important': return '#fa8c16';
      case 'nice-to-have': return '#52c41a';
      default: return '#d9d9d9';
    }
  };

  const getImportanceIcon = (importance: string) => {
    switch (importance) {
      case 'critical': return 'warning';
      case 'important': return 'information-circle';
      case 'nice-to-have': return 'checkmark-circle';
      default: return null;
    }
  };

  const breederChecklist: BreederChecklist[] = [
    {
      category: "Health & Testing",
      items: [
        {
          item: "Health clearances on parent dogs",
          importance: "critical",
          description: "Both parents should have health clearances for breed-specific conditions",
          redFlag: "Breeder cannot provide health certificates"
        },
        {
          item: "Genetic testing results",
          importance: "critical", 
          description: "DNA testing for breed-specific genetic conditions",
          redFlag: "No genetic testing or breeder doesn't understand what tests are needed"
        },
        {
          item: "Veterinary relationship",
          importance: "important",
          description: "Breeder has a good relationship with a veterinarian",
          redFlag: "Breeder doesn't have a regular vet"
        },
        {
          item: "Health guarantee",
          importance: "important",
          description: "Written health guarantee covering genetic conditions for 1-2 years",
          redFlag: "No health guarantee or very limited coverage"
        }
      ]
    },
    {
      category: "Breeding Practices",
      items: [
        {
          item: "Limited breeding frequency",
          importance: "critical",
          description: "Female dogs bred no more than once per year",
          redFlag: "Breeder has multiple litters per year"
        },
        {
          item: "Proper age for breeding",
          importance: "critical",
          description: "Dogs should be at least 2 years old before first breeding",
          redFlag: "Breeding dogs under 2 years old"
        },
        {
          item: "Breeding for improvement",
          importance: "important",
          description: "Breeder focuses on improving the breed",
          redFlag: "Breeder admits to breeding for profit only"
        }
      ]
    },
    {
      category: "Puppy Care & Socialization",
      items: [
        {
          item: "Home-raised puppies",
          importance: "critical",
          description: "Puppies raised in the breeder's home, not in kennels",
          redFlag: "Puppies kept in kennels or outdoor facilities"
        },
        {
          item: "Early socialization",
          importance: "critical",
          description: "Puppies exposed to various people and experiences",
          redFlag: "Puppies isolated or not socialized"
        },
        {
          item: "Proper weaning process",
          importance: "important",
          description: "Gradual weaning process starting around 4-5 weeks",
          redFlag: "Puppies weaned too early (before 4 weeks)"
        }
      ]
    },
    {
      category: "Breeder Transparency",
      items: [
        {
          item: "Home visits allowed",
          importance: "critical",
          description: "Breeder welcomes visits to see the breeding facility",
          redFlag: "Breeder refuses home visits"
        },
        {
          item: "Meet the parents",
          importance: "critical",
          description: "You can meet at least the mother dog",
          redFlag: "Cannot meet parent dogs"
        },
        {
          item: "Open about practices",
          importance: "important",
          description: "Breeder openly discusses their breeding practices",
          redFlag: "Breeder is secretive about practices"
        }
      ]
    },
    {
      category: "Support & Responsibility",
      items: [
        {
          item: "Take-back policy",
          importance: "critical",
          description: "Breeder will take back any puppy at any time",
          redFlag: "No take-back policy"
        },
        {
          item: "Lifetime support",
          importance: "important",
          description: "Breeder offers ongoing support throughout dog's life",
          redFlag: "No ongoing support"
        },
        {
          item: "Contract and paperwork",
          importance: "important",
          description: "Written contract with clear terms and health records",
          redFlag: "No written contract"
        }
      ]
    }
  ];

  const redFlags = [
    {
      flag: "Multiple litters available immediately",
      description: "Ethical breeders typically have waiting lists",
      severity: "high"
    },
    {
      flag: "Won't let you visit the breeding facility",
      description: "Transparent breeders welcome visits",
      severity: "critical"
    },
    {
      flag: "Puppies available before 8 weeks",
      description: "Puppies should stay with mother until at least 8 weeks",
      severity: "critical"
    },
    {
      flag: "No health testing or clearances",
      description: "Responsible breeders test for breed-specific conditions",
      severity: "critical"
    },
    {
      flag: "Pressure to buy immediately",
      description: "Good breeders want you to be sure",
      severity: "high"
    },
    {
      flag: "Cannot meet parent dogs",
      description: "You should be able to meet at least the mother dog",
      severity: "critical"
    }
  ];

  const totalItems = breederChecklist.reduce((total, category) => total + category.items.length, 0);
  const completedCount = completedItems.size;
  const progressPercentage = Math.round((completedCount / totalItems) * 100);

  const renderChecklistCategory = (category: BreederChecklist, categoryIndex: number) => (
    <Card key={categoryIndex} style={styles.categoryCard}>
      <View style={styles.categoryHeader}>
        <Icon name="shield-checkmark" size={24} color={theme.colors.primary} />
        <Text style={styles.categoryTitle}>{category.category}</Text>
      </View>
      
      {category.items.map((item, itemIndex) => {
        const itemKey = `${categoryIndex}-${itemIndex}`;
        const isCompleted = completedItems.has(itemKey);
        
        return (
          <TouchableOpacity
            key={itemIndex}
            style={styles.checklistItem}
            onPress={() => toggleChecklistItem(itemKey)}
          >
            <View style={styles.checklistItemContent}>
              <View style={styles.checklistItemLeft}>
                <View style={[
                  styles.checkbox,
                  isCompleted && styles.checkboxCompleted
                ]}>
                  {isCompleted && <Icon name="checkmark" size={16} color="#fff" />}
                </View>
                <View style={styles.checklistItemText}>
                  <Text style={[
                    styles.checklistItemTitle,
                    isCompleted && styles.checklistItemTitleCompleted
                  ]}>
                    {item.item}
                  </Text>
                  <Text style={styles.checklistItemDescription}>
                    {item.description}
                  </Text>
                  {item.redFlag && (
                    <View style={styles.redFlagContainer}>
                      <Icon name="warning" size={14} color="#ff4d4f" />
                      <Text style={styles.redFlagText}>{item.redFlag}</Text>
                    </View>
                  )}
                </View>
              </View>
              <View style={[
                styles.importanceBadge,
                { backgroundColor: getImportanceColor(item.importance) }
              ]}>
                <Icon 
                  name={getImportanceIcon(item.importance)} 
                  size={12} 
                  color="#fff" 
                />
                <Text style={styles.importanceText}>
                  {item.importance.replace('-', ' ')}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        );
      })}
    </Card>
  );

  const renderRedFlags = () => (
    <Card style={styles.redFlagsCard}>
      <View style={styles.redFlagsHeader}>
        <Icon name="warning" size={24} color="#ff4d4f" />
        <Text style={styles.redFlagsTitle}>Warning Signs & Red Flags</Text>
      </View>
      
      {redFlags.map((flag, index) => (
        <View key={index} style={styles.redFlagItem}>
          <View style={[
            styles.redFlagSeverity,
            { backgroundColor: flag.severity === 'critical' ? '#ff4d4f' : '#fa8c16' }
          ]}>
            <Text style={styles.redFlagSeverityText}>
              {flag.severity.toUpperCase()}
            </Text>
          </View>
          <View style={styles.redFlagContent}>
            <Text style={styles.redFlagTitle}>{flag.flag}</Text>
            <Text style={styles.redFlagDescription}>{flag.description}</Text>
          </View>
        </View>
      ))}
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Progress Overview */}
        <Card style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <View style={styles.progressInfo}>
              <Text style={styles.progressTitle}>Breeder Evaluation Checklist</Text>
              <Text style={styles.progressSubtitle}>
                Use this checklist to evaluate breeders you're considering
              </Text>
            </View>
            <View style={styles.progressStats}>
              <Text style={styles.progressCount}>{completedCount}/{totalItems}</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progressPercentage}%` }]} />
              </View>
            </View>
          </View>
        </Card>

        {/* Checklist Categories */}
        {breederChecklist.map((category, index) => renderChecklistCategory(category, index))}

        {/* Red Flags Section */}
        {renderRedFlags()}

        {/* Questions to Ask */}
        <Card style={styles.questionsCard}>
          <View style={styles.questionsHeader}>
            <Icon name="help-circle" size={24} color={theme.colors.primary} />
            <Text style={styles.questionsTitle}>Questions to Ask Breeders</Text>
          </View>
          
          <View style={styles.questionsContent}>
            <View style={styles.questionSection}>
              <Text style={styles.questionSectionTitle}>Health & Testing Questions</Text>
              {[
                "What health clearances do the parent dogs have?",
                "Can you provide copies of health certificates?",
                "What genetic testing has been done?",
                "What health guarantee do you provide?",
                "Have there been any health issues in previous litters?"
              ].map((question, index) => (
                <Text key={index} style={styles.questionItem}>• {question}</Text>
              ))}
            </View>

            <View style={styles.questionSection}>
              <Text style={styles.questionSectionTitle}>Breeding & Care Questions</Text>
              {[
                "How often do you breed your female dogs?",
                "Where are the puppies raised?",
                "How do you socialize the puppies?",
                "Can I meet the parent dogs?",
                "What is your take-back policy?"
              ].map((question, index) => (
                <Text key={index} style={styles.questionItem}>• {question}</Text>
              ))}
            </View>
          </View>
        </Card>

        {/* Resources */}
        <Card style={styles.resourcesCard}>
          <View style={styles.resourcesHeader}>
            <Icon name="information-circle" size={24} color={theme.colors.primary} />
            <Text style={styles.resourcesTitle}>Additional Resources</Text>
          </View>
          
          <View style={styles.resourcesGrid}>
            <TouchableOpacity style={styles.resourceItem}>
              <Icon name="heart" size={32} color={theme.colors.primary} />
              <Text style={styles.resourceTitle}>Breed-Specific Health</Text>
              <Text style={styles.resourceDescription}>
                Research health issues specific to your chosen breed
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.resourceItem}>
              <Icon name="people" size={32} color={theme.colors.primary} />
              <Text style={styles.resourceTitle}>Breed Clubs</Text>
              <Text style={styles.resourceDescription}>
                Contact local and national breed clubs for referrals
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.resourceItem}>
              <Icon name="home" size={32} color={theme.colors.primary} />
              <Text style={styles.resourceTitle}>Visit in Person</Text>
              <Text style={styles.resourceDescription}>
                Always visit the breeder's home to see the environment
              </Text>
            </TouchableOpacity>
          </View>
        </Card>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Browse Verified Breeders"
          onPress={() => navigation.navigate('SearchPuppies' as never)}
          icon={<Icon name="search" size={20} color="#fff" />}
          style={styles.footerButton}
        />
      </View>
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
    paddingHorizontal: theme.spacing.lg,
  },
  progressCard: {
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
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
  categoryCard: {
    marginBottom: theme.spacing.md,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  categoryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
  checklistItem: {
    marginBottom: theme.spacing.sm,
  },
  checklistItemContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  checklistItemLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: theme.colors.border,
    marginRight: theme.spacing.sm,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxCompleted: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  checklistItemText: {
    flex: 1,
  },
  checklistItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  checklistItemTitleCompleted: {
    textDecorationLine: 'line-through',
    color: theme.colors.textSecondary,
  },
  checklistItemDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: theme.spacing.xs,
  },
  redFlagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff2f0',
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: '#ffccc7',
  },
  redFlagText: {
    fontSize: 12,
    color: '#ff4d4f',
    marginLeft: theme.spacing.xs,
    flex: 1,
  },
  importanceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    marginLeft: theme.spacing.sm,
  },
  importanceText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '600',
    marginLeft: theme.spacing.xs,
  },
  redFlagsCard: {
    marginBottom: theme.spacing.md,
  },
  redFlagsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  redFlagsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
  redFlagItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.sm,
    padding: theme.spacing.sm,
    backgroundColor: '#fff2f0',
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: '#ffccc7',
  },
  redFlagSeverity: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    marginRight: theme.spacing.sm,
  },
  redFlagSeverityText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: '700',
  },
  redFlagContent: {
    flex: 1,
  },
  redFlagTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ff4d4f',
    marginBottom: theme.spacing.xs,
  },
  redFlagDescription: {
    fontSize: 12,
    color: '#ff4d4f',
    lineHeight: 16,
  },
  questionsCard: {
    marginBottom: theme.spacing.md,
  },
  questionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  questionsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
  questionsContent: {
    gap: theme.spacing.lg,
  },
  questionSection: {
    // No specific styles needed
  },
  questionSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  questionItem: {
    fontSize: 14,
    color: theme.colors.text,
    lineHeight: 20,
    marginBottom: theme.spacing.xs,
  },
  resourcesCard: {
    marginBottom: theme.spacing.xl,
  },
  resourcesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  resourcesTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
  resourcesGrid: {
    gap: theme.spacing.md,
  },
  resourceItem: {
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  resourceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
  },
  resourceDescription: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  footer: {
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  footerButton: {
    // Button styles are handled by the Button component
  },
});

export default EthicalBreederGuideScreen;
