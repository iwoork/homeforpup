import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  Platform,
  Image,
  Keyboard,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { theme } from '../utils/theme';

interface Breed {
  id: string;
  name: string;
  image?: string;
}

interface BreedSelectorModalProps {
  selectedBreeds: string[];
  onBreedsChange: (breeds: string[]) => void;
  availableBreeds: Breed[];
  placeholder?: string;
  error?: boolean;
  editable?: boolean;
  multiSelect?: boolean;
}

const BreedSelectorModal: React.FC<BreedSelectorModalProps> = ({
  selectedBreeds,
  onBreedsChange,
  availableBreeds,
  placeholder = 'Select breeds',
  error = false,
  editable = true,
  multiSelect = true,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [tempSelectedBreeds, setTempSelectedBreeds] = useState<string[]>(selectedBreeds);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    setTempSelectedBreeds(selectedBreeds);
  }, [selectedBreeds]);

  // Listen to keyboard events
  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
      }
    );
    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  const handleOpenModal = () => {
    if (editable) {
      setTempSelectedBreeds(selectedBreeds);
      setSearchQuery('');
      setIsModalVisible(true);
    }
  };

  const handleToggleBreed = (breedName: string) => {
    if (multiSelect) {
      setTempSelectedBreeds((prev) =>
        prev.includes(breedName)
          ? prev.filter((b) => b !== breedName)
          : [...prev, breedName]
      );
    } else {
      setTempSelectedBreeds([breedName]);
    }
  };

  const handleConfirm = () => {
    console.log('Confirming breed selection:', tempSelectedBreeds);
    onBreedsChange(tempSelectedBreeds);
    setIsModalVisible(false);
    setSearchQuery('');
    Keyboard.dismiss();
  };

  const handleCancel = () => {
    setTempSelectedBreeds(selectedBreeds);
    setIsModalVisible(false);
    setSearchQuery('');
    Keyboard.dismiss();
  };

  const filteredBreeds = searchQuery
    ? availableBreeds.filter((breed) =>
        breed.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : availableBreeds;

  const getDisplayText = () => {
    if (selectedBreeds.length === 0) return placeholder;
    if (selectedBreeds.length === 1) return selectedBreeds[0];
    if (selectedBreeds.length === 2) return selectedBreeds.join(', ');
    return `${selectedBreeds.slice(0, 2).join(', ')} +${selectedBreeds.length - 2} more`;
  };

  return (
    <>
      {/* Input Field */}
      <TouchableOpacity
        style={[
          styles.container,
          error && styles.containerError,
          !editable && styles.containerDisabled,
        ]}
        onPress={handleOpenModal}
        activeOpacity={editable ? 0.7 : 1}
      >
        <Icon
          name="paw"
          size={20}
          color={!editable ? theme.colors.textTertiary : theme.colors.textSecondary}
          style={styles.icon}
        />
        <Text
          style={[
            styles.valueText,
            selectedBreeds.length === 0 && styles.placeholderText,
            !editable && styles.disabledText,
          ]}
          numberOfLines={1}
        >
          {getDisplayText()}
        </Text>
        {selectedBreeds.length > 0 && editable && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{selectedBreeds.length}</Text>
          </View>
        )}
        {editable && (
          <Icon
            name="chevron-down"
            size={20}
            color={theme.colors.textSecondary}
          />
        )}
      </TouchableOpacity>

      {/* Modal with Breed Selection */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCancel}
        presentationStyle="overFullScreen"
        statusBarTranslucent={true}
      >
        <View style={styles.modalOverlay}>
          <TouchableOpacity 
            style={styles.overlayTouchable}
            activeOpacity={1} 
            onPress={handleCancel}
          />
          <View style={[
            styles.modalContent,
            keyboardHeight > 0 && {
              marginBottom: keyboardHeight,
              maxHeight: Dimensions.get('window').height - keyboardHeight - 100,
            }
          ]}>
            {/* Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {multiSelect ? 'Select Breeds' : 'Select Breed'}
              </Text>
              <TouchableOpacity onPress={handleCancel} style={styles.closeButton}>
                <Icon name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>

            {/* Selected Count */}
            {multiSelect && tempSelectedBreeds.length > 0 && (
              <View style={styles.selectedCountContainer}>
                <Icon name="checkmark-circle" size={20} color={theme.colors.primary} />
                <Text style={styles.selectedCountText}>
                  {tempSelectedBreeds.length} breed{tempSelectedBreeds.length !== 1 ? 's' : ''} selected
                </Text>
              </View>
            )}

            {/* Search Input */}
            <View style={styles.searchContainer}>
              <Icon name="search" size={20} color={theme.colors.textSecondary} />
              <TextInput
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search breeds..."
                placeholderTextColor={theme.colors.textSecondary}
                autoCorrect={false}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <Icon name="close-circle" size={20} color={theme.colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>

            {/* Breeds List */}
            <FlatList
              data={filteredBreeds}
              keyExtractor={(item) => item.id}
              keyboardShouldPersistTaps="always"
              scrollEnabled={true}
              renderItem={({ item }) => {
                const isSelected = tempSelectedBreeds.includes(item.name);
                const breedImageUrl = item.image || `https://homeforpup.com/breeds/${item.name}.jpg`;
                
                return (
                  <TouchableOpacity
                    style={[
                      styles.breedItem,
                      isSelected && styles.breedItemSelected,
                    ]}
                    onPress={() => handleToggleBreed(item.name)}
                    activeOpacity={0.7}
                  >
                    <Image
                      source={{ uri: breedImageUrl }}
                      style={styles.breedImage}
                    />
                    <Text style={[
                      styles.breedName,
                      isSelected && styles.breedNameSelected,
                    ]}>
                      {item.name}
                    </Text>
                    {isSelected && (
                      <Icon
                        name="checkmark-circle"
                        size={24}
                        color={theme.colors.primary}
                      />
                    )}
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Icon name="search" size={48} color={theme.colors.textTertiary} />
                  <Text style={styles.emptyText}>
                    {searchQuery
                      ? `No breeds found matching "${searchQuery}"`
                      : 'No breeds available'}
                  </Text>
                </View>
              }
              contentContainerStyle={styles.listContent}
            />

            {/* Action Buttons */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={handleConfirm}
                activeOpacity={0.8}
              >
                <Icon name="checkmark" size={20} color="#ffffff" />
                <Text style={styles.confirmButtonText}>
                  Confirm {tempSelectedBreeds.length > 0 ? `(${tempSelectedBreeds.length})` : ''}
                </Text>
              </TouchableOpacity>

              {multiSelect && tempSelectedBreeds.length > 0 && (
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={() => setTempSelectedBreeds([])}
                  activeOpacity={0.8}
                >
                  <Text style={styles.clearButtonText}>Clear All</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    minHeight: 48,
  },
  containerError: {
    borderColor: theme.colors.error,
  },
  containerDisabled: {
    backgroundColor: theme.colors.backgroundSecondary,
    borderColor: theme.colors.borderLight,
  },
  icon: {
    marginRight: theme.spacing.sm,
  },
  valueText: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
  },
  placeholderText: {
    color: theme.colors.textSecondary,
  },
  disabledText: {
    color: theme.colors.textSecondary,
  },
  badge: {
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: theme.spacing.sm,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    zIndex: 9999,
    elevation: 9999,
  },
  overlayTouchable: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    maxHeight: '85%',
    paddingBottom: Platform.OS === 'ios' ? 34 : theme.spacing.lg,
    zIndex: 10000,
    elevation: 10000,
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
  closeButton: {
    padding: theme.spacing.xs,
  },
  selectedCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.primaryLight,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  selectedCountText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    margin: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
    paddingVertical: theme.spacing.md,
    marginLeft: theme.spacing.sm,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: theme.spacing.md,
  },
  breedItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  breedItemSelected: {
    backgroundColor: theme.colors.primaryLight,
  },
  breedImage: {
    width: 50,
    height: 50,
    borderRadius: theme.borderRadius.md,
    marginRight: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  breedName: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: theme.colors.text,
  },
  breedNameSelected: {
    fontWeight: '600',
    color: theme.colors.primary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl * 2,
  },
  emptyText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
    textAlign: 'center',
  },
  modalFooter: {
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    gap: theme.spacing.sm,
  },
  confirmButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: theme.spacing.md + 2,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.sm,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  clearButton: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.border,
  },
  clearButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
});

export default BreedSelectorModal;

