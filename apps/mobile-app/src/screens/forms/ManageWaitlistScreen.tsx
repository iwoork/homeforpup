import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  FlatList,
  TextInput,
  Modal,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import { theme } from '../../utils/theme';
import { Litter } from '../../types';

interface WaitlistEntry {
  id: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone?: string;
  position: number;
  preferredGender?: 'male' | 'female' | 'no_preference';
  preferredColor?: string;
  depositPaid: boolean;
  depositAmount?: number;
  notes?: string;
  contactedDate: string;
  addedDate: string;
  status: 'active' | 'matched' | 'passed' | 'cancelled';
}

interface RouteParams {
  litter: Litter;
}

const ManageWaitlistScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { litter } = route.params as RouteParams;

  // Mock waitlist data - in real app, this would come from API
  const [waitlist, setWaitlist] = useState<WaitlistEntry[]>([
    {
      id: '1',
      buyerName: 'Sarah Johnson',
      buyerEmail: 'sarah.j@email.com',
      buyerPhone: '+1 (555) 123-4567',
      position: 1,
      preferredGender: 'female',
      preferredColor: 'Golden',
      depositPaid: true,
      depositAmount: 500,
      notes: 'Prefers a calm temperament. Has a large yard.',
      contactedDate: '2024-01-15T10:00:00Z',
      addedDate: '2024-01-10T14:30:00Z',
      status: 'active',
    },
    {
      id: '2',
      buyerName: 'Mike Chen',
      buyerEmail: 'mike.chen@email.com',
      buyerPhone: '+1 (555) 234-5678',
      position: 2,
      preferredGender: 'male',
      depositPaid: true,
      depositAmount: 500,
      notes: 'First-time dog owner. Looking for a family companion.',
      contactedDate: '2024-01-18T09:15:00Z',
      addedDate: '2024-01-12T11:20:00Z',
      status: 'active',
    },
    {
      id: '3',
      buyerName: 'Emily Rodriguez',
      buyerEmail: 'emily.r@email.com',
      position: 3,
      preferredGender: 'no_preference',
      depositPaid: false,
      notes: 'Interested in show quality puppy.',
      contactedDate: '2024-01-20T16:20:00Z',
      addedDate: '2024-01-18T13:45:00Z',
      status: 'active',
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newEntry, setNewEntry] = useState({
    buyerName: '',
    buyerEmail: '',
    buyerPhone: '',
    preferredGender: 'no_preference' as 'male' | 'female' | 'no_preference',
    preferredColor: '',
    notes: '',
  });

  // Set up navigation header with add button and subtitle
  useEffect(() => {
    const AddButton = () => (
      <TouchableOpacity
        style={{ marginRight: 16 }}
        onPress={() => setShowAddModal(true)}
      >
        <Icon name="add-circle" size={28} color={theme.colors.primary} />
      </TouchableOpacity>
    );

    navigation.setOptions({
      title: `${litter.breed} Litter Waitlist`,
      headerRight: AddButton,
    });
  }, [navigation, setShowAddModal, litter.breed]);

  const getStatusColor = (status: WaitlistEntry['status']) => {
    switch (status) {
      case 'active':
        return '#10b981';
      case 'matched':
        return '#3b82f6';
      case 'passed':
        return '#f59e0b';
      case 'cancelled':
        return '#ef4444';
      default:
        return theme.colors.textSecondary;
    }
  };

  const getStatusLabel = (status: WaitlistEntry['status']) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'matched':
        return 'Matched';
      case 'passed':
        return 'Passed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const handleAddToWaitlist = () => {
    if (!newEntry.buyerName.trim() || !newEntry.buyerEmail.trim()) {
      Alert.alert('Error', 'Please enter buyer name and email');
      return;
    }

    const entry: WaitlistEntry = {
      id: Date.now().toString(),
      buyerName: newEntry.buyerName,
      buyerEmail: newEntry.buyerEmail,
      buyerPhone: newEntry.buyerPhone || undefined,
      position: waitlist.length + 1,
      preferredGender: newEntry.preferredGender,
      preferredColor: newEntry.preferredColor || undefined,
      depositPaid: false,
      notes: newEntry.notes || undefined,
      contactedDate: new Date().toISOString(),
      addedDate: new Date().toISOString(),
      status: 'active',
    };

    setWaitlist([...waitlist, entry]);
    setShowAddModal(false);
    setNewEntry({
      buyerName: '',
      buyerEmail: '',
      buyerPhone: '',
      preferredGender: 'no_preference',
      preferredColor: '',
      notes: '',
    });

    Alert.alert('Success', 'Buyer added to waitlist');
  };

  const handleMoveUp = (entry: WaitlistEntry) => {
    if (entry.position === 1) return;

    const newWaitlist = [...waitlist];
    const currentIndex = newWaitlist.findIndex(e => e.id === entry.id);
    const previousIndex = newWaitlist.findIndex(
      e => e.position === entry.position - 1,
    );

    if (currentIndex !== -1 && previousIndex !== -1) {
      // Swap positions
      newWaitlist[currentIndex].position -= 1;
      newWaitlist[previousIndex].position += 1;

      // Sort by position
      newWaitlist.sort((a, b) => a.position - b.position);
      setWaitlist(newWaitlist);
    }
  };

  const handleMoveDown = (entry: WaitlistEntry) => {
    if (entry.position === waitlist.length) return;

    const newWaitlist = [...waitlist];
    const currentIndex = newWaitlist.findIndex(e => e.id === entry.id);
    const nextIndex = newWaitlist.findIndex(
      e => e.position === entry.position + 1,
    );

    if (currentIndex !== -1 && nextIndex !== -1) {
      // Swap positions
      newWaitlist[currentIndex].position += 1;
      newWaitlist[nextIndex].position -= 1;

      // Sort by position
      newWaitlist.sort((a, b) => a.position - b.position);
      setWaitlist(newWaitlist);
    }
  };

  const handleMarkDeposit = (entry: WaitlistEntry) => {
    Alert.alert('Mark Deposit', `Has ${entry.buyerName} paid the deposit?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Mark as Paid',
        onPress: () => {
          const newWaitlist = waitlist.map(e =>
            e.id === entry.id
              ? { ...e, depositPaid: true, depositAmount: 500 }
              : e,
          );
          setWaitlist(newWaitlist);
          Alert.alert('Success', 'Deposit marked as paid');
        },
      },
    ]);
  };

  const handleMatchPuppy = (entry: WaitlistEntry) => {
    Alert.alert('Match Puppy', `Match a puppy to ${entry.buyerName}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Match',
        onPress: () => {
          const newWaitlist = waitlist.map(e =>
            e.id === entry.id ? { ...e, status: 'matched' as const } : e,
          );
          setWaitlist(newWaitlist);
          Alert.alert('Success', 'Buyer matched with puppy');
        },
      },
    ]);
  };

  const handleContactBuyer = (entry: WaitlistEntry) => {
    Alert.alert(
      'Contact Buyer',
      `Contact ${entry.buyerName}?\n\nEmail: ${entry.buyerEmail}${
        entry.buyerPhone ? `\nPhone: ${entry.buyerPhone}` : ''
      }`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Email',
          onPress: () => {
            // TODO: Implement email functionality
            console.log('Send email to:', entry.buyerEmail);
          },
        },
        entry.buyerPhone
          ? {
              text: 'Call',
              onPress: () => {
                // TODO: Implement call functionality
                console.log('Call:', entry.buyerPhone);
              },
            }
          : { text: 'OK', style: 'cancel' },
      ],
    );
  };

  const handleRemoveFromWaitlist = (entry: WaitlistEntry) => {
    Alert.alert(
      'Remove from Waitlist',
      `Remove ${entry.buyerName} from the waitlist?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            const newWaitlist = waitlist
              .filter(e => e.id !== entry.id)
              .map((e, index) => ({ ...e, position: index + 1 }));
            setWaitlist(newWaitlist);
            Alert.alert('Success', 'Buyer removed from waitlist');
          },
        },
      ],
    );
  };

  const renderWaitlistEntry = ({ item }: { item: WaitlistEntry }) => (
    <View style={styles.entryCard}>
      <View style={styles.entryHeader}>
        <View style={styles.positionBadge}>
          <Text style={styles.positionText}>#{item.position}</Text>
        </View>
        <View style={styles.entryHeaderInfo}>
          <Text style={styles.buyerName}>{item.buyerName}</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: `${getStatusColor(item.status)}20` },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(item.status) },
              ]}
            >
              {getStatusLabel(item.status)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.entryDetails}>
        <View style={styles.detailRow}>
          <Icon name="mail" size={16} color={theme.colors.textSecondary} />
          <Text style={styles.detailText}>{item.buyerEmail}</Text>
        </View>
        {item.buyerPhone && (
          <View style={styles.detailRow}>
            <Icon name="call" size={16} color={theme.colors.textSecondary} />
            <Text style={styles.detailText}>{item.buyerPhone}</Text>
          </View>
        )}
        {item.preferredGender && item.preferredGender !== 'no_preference' && (
          <View style={styles.detailRow}>
            <Icon
              name={item.preferredGender === 'male' ? 'male' : 'female'}
              size={16}
              color={item.preferredGender === 'male' ? '#3b82f6' : '#ec4899'}
            />
            <Text style={styles.detailText}>
              Prefers {item.preferredGender}
            </Text>
          </View>
        )}
        {item.preferredColor && (
          <View style={styles.detailRow}>
            <Icon
              name="color-palette"
              size={16}
              color={theme.colors.textSecondary}
            />
            <Text style={styles.detailText}>Color: {item.preferredColor}</Text>
          </View>
        )}
        {item.notes && (
          <View style={styles.notesContainer}>
            <Icon
              name="document-text"
              size={16}
              color={theme.colors.textSecondary}
            />
            <Text style={styles.notesText}>{item.notes}</Text>
          </View>
        )}
      </View>

      <View style={styles.depositRow}>
        <View style={styles.depositInfo}>
          <Icon
            name={item.depositPaid ? 'checkmark-circle' : 'time'}
            size={20}
            color={item.depositPaid ? '#10b981' : '#f59e0b'}
          />
          <Text
            style={[
              styles.depositText,
              { color: item.depositPaid ? '#10b981' : '#f59e0b' },
            ]}
          >
            {item.depositPaid
              ? `Deposit Paid ${
                  item.depositAmount ? `($${item.depositAmount})` : ''
                }`
              : 'No Deposit'}
          </Text>
        </View>
        <Text style={styles.dateText}>
          Added {new Date(item.addedDate).toLocaleDateString()}
        </Text>
      </View>

      <View style={styles.entryActions}>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => handleMoveUp(item)}
          disabled={item.position === 1}
        >
          <Icon
            name="arrow-up"
            size={18}
            color={
              item.position === 1
                ? theme.colors.textTertiary
                : theme.colors.primary
            }
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => handleMoveDown(item)}
          disabled={item.position === waitlist.length}
        >
          <Icon
            name="arrow-down"
            size={18}
            color={
              item.position === waitlist.length
                ? theme.colors.textTertiary
                : theme.colors.primary
            }
          />
        </TouchableOpacity>
        {!item.depositPaid && (
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => handleMarkDeposit(item)}
          >
            <Icon name="cash" size={18} color="#10b981" />
          </TouchableOpacity>
        )}
        {item.status === 'active' && (
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => handleMatchPuppy(item)}
          >
            <Icon name="link" size={18} color="#3b82f6" />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => handleContactBuyer(item)}
        >
          <Icon name="chatbubbles" size={18} color="#8b5cf6" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => handleRemoveFromWaitlist(item)}
        >
          <Icon name="trash" size={18} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Icon name="people-outline" size={64} color={theme.colors.textTertiary} />
      <Text style={styles.emptyTitle}>No Waitlist Yet</Text>
      <Text style={styles.emptySubtitle}>
        Add interested buyers to manage your litter waitlist
      </Text>
    </View>
  );

  const activeWaitlist = waitlist.filter(e => e.status === 'active');
  const matchedCount = waitlist.filter(e => e.status === 'matched').length;
  const depositCount = waitlist.filter(e => e.depositPaid).length;

  return (
    <View style={styles.container}>
      {/* Statistics */}
      <View style={styles.statsContainer}>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{activeWaitlist.length}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{matchedCount}</Text>
            <Text style={styles.statLabel}>Matched</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{depositCount}</Text>
            <Text style={styles.statLabel}>Deposits</Text>
          </View>
        </View>
      </View>

      {/* Waitlist */}
      <View style={styles.listContainer}>
        {waitlist.length === 0 ? (
          renderEmptyState()
        ) : (
          <FlatList
            data={waitlist}
            renderItem={renderWaitlistEntry}
            keyExtractor={item => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
          />
        )}
      </View>

      {/* Add to Waitlist Modal */}
      <Modal
        visible={showAddModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add to Waitlist</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Icon name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Buyer Name *</Text>
                <TextInput
                  style={styles.input}
                  value={newEntry.buyerName}
                  onChangeText={text =>
                    setNewEntry({ ...newEntry, buyerName: text })
                  }
                  placeholder="Enter buyer name"
                  placeholderTextColor={theme.colors.textSecondary}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email *</Text>
                <TextInput
                  style={styles.input}
                  value={newEntry.buyerEmail}
                  onChangeText={text =>
                    setNewEntry({ ...newEntry, buyerEmail: text })
                  }
                  placeholder="buyer@email.com"
                  placeholderTextColor={theme.colors.textSecondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone (Optional)</Text>
                <TextInput
                  style={styles.input}
                  value={newEntry.buyerPhone}
                  onChangeText={text =>
                    setNewEntry({ ...newEntry, buyerPhone: text })
                  }
                  placeholder="+1 (555) 123-4567"
                  placeholderTextColor={theme.colors.textSecondary}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Preferred Gender</Text>
                <View style={styles.genderButtons}>
                  {['male', 'female', 'no_preference'].map(gender => (
                    <TouchableOpacity
                      key={gender}
                      style={[
                        styles.genderButton,
                        newEntry.preferredGender === gender &&
                          styles.genderButtonActive,
                      ]}
                      onPress={() =>
                        setNewEntry({
                          ...newEntry,
                          preferredGender: gender as any,
                        })
                      }
                    >
                      <Text
                        style={[
                          styles.genderButtonText,
                          newEntry.preferredGender === gender &&
                            styles.genderButtonTextActive,
                        ]}
                      >
                        {gender === 'no_preference'
                          ? 'No Pref'
                          : gender.charAt(0).toUpperCase() + gender.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  Preferred Color (Optional)
                </Text>
                <TextInput
                  style={styles.input}
                  value={newEntry.preferredColor}
                  onChangeText={text =>
                    setNewEntry({ ...newEntry, preferredColor: text })
                  }
                  placeholder="e.g., Golden, Black, Cream"
                  placeholderTextColor={theme.colors.textSecondary}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Notes (Optional)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={newEntry.notes}
                  onChangeText={text =>
                    setNewEntry({ ...newEntry, notes: text })
                  }
                  placeholder="Any special requirements or notes..."
                  placeholderTextColor={theme.colors.textSecondary}
                  multiline
                  numberOfLines={4}
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowAddModal(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleAddToWaitlist}
              >
                <Text style={styles.saveButtonText}>Add to Waitlist</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  statsContainer: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    ...theme.shadows.sm,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
  },
  listContent: {
    paddingBottom: theme.spacing.xl,
  },
  entryCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.sm,
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  positionBadge: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.full,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.md,
  },
  positionText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  entryHeaderInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  buyerName: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    marginLeft: theme.spacing.sm,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  entryDetails: {
    marginBottom: theme.spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  detailText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.sm,
  },
  notesContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: theme.spacing.sm,
    padding: theme.spacing.sm,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
  },
  notesText: {
    fontSize: 14,
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
    flex: 1,
    fontStyle: 'italic',
  },
  depositRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  depositInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  depositText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: theme.spacing.sm,
  },
  dateText: {
    fontSize: 12,
    color: theme.colors.textTertiary,
  },
  entryActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.sm,
  },
  actionBtn: {
    padding: theme.spacing.sm,
    marginLeft: theme.spacing.sm,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl * 2,
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
    paddingHorizontal: theme.spacing.lg,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
  },
  modalBody: {
    padding: theme.spacing.lg,
  },
  inputGroup: {
    marginBottom: theme.spacing.lg,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  input: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  genderButtons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  genderButton: {
    flex: 1,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
  },
  genderButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  genderButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  genderButtonTextActive: {
    color: '#ffffff',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: theme.spacing.lg,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    gap: theme.spacing.md,
  },
  modalButton: {
    flex: 1,
    padding: theme.spacing.md + 2,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: theme.colors.background,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
});

export default ManageWaitlistScreen;
