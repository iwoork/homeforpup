import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Switch,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Icon from 'react-native-vector-icons/Ionicons';
import { theme } from '../../utils/theme';
import { VeterinaryVisit } from '@homeforpup/shared-types';
import { useAuth } from '../../contexts/AuthContext';
import { useDogs } from '../../hooks/useApi';
import apiService from '../../services/apiService';

interface RouteParams {
  dogId?: string;
}

interface MedicationItem {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
}

const RecordVetVisitScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { user } = useAuth();
  const params = route.params as RouteParams;
  
  const { data: dogsData } = useDogs({ ownerId: user?.userId });
  const dogs = dogsData?.dogs || [];

  const [loading, setLoading] = useState(false);
  const [showDogPicker, setShowDogPicker] = useState(false);
  const [showVisitDatePicker, setShowVisitDatePicker] = useState(false);
  const [showFollowUpDatePicker, setShowFollowUpDatePicker] = useState(false);
  const [showVisitTypePicker, setShowVisitTypePicker] = useState(false);

  const [formData, setFormData] = useState({
    dogId: params?.dogId || '',
    visitDate: new Date(),
    visitType: 'routine_checkup' as VeterinaryVisit['visitType'],
    veterinarianName: '',
    clinicName: '',
    clinicPhone: '',
    clinicEmail: '',
    reason: '',
    diagnosis: '',
    treatment: '',
    followUpRequired: false,
    followUpDate: new Date(),
    cost: '',
    weight: '',
    temperature: '',
    heartRate: '',
    notes: '',
  });

  const [medications, setMedications] = useState<MedicationItem[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const visitTypes: { label: string; value: VeterinaryVisit['visitType'] }[] = [
    { label: 'Routine Checkup', value: 'routine_checkup' },
    { label: 'Vaccination', value: 'vaccination' },
    { label: 'Illness', value: 'illness' },
    { label: 'Injury', value: 'injury' },
    { label: 'Surgery', value: 'surgery' },
    { label: 'Dental', value: 'dental' },
    { label: 'Emergency', value: 'emergency' },
    { label: 'Follow-up', value: 'follow_up' },
    { label: 'Other', value: 'other' },
  ];

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.dogId) {
      newErrors.dogId = 'Please select a dog';
    }

    if (!formData.veterinarianName.trim()) {
      newErrors.veterinarianName = 'Veterinarian name is required';
    }

    if (!formData.clinicName.trim()) {
      newErrors.clinicName = 'Clinic name is required';
    }

    if (!formData.reason.trim()) {
      newErrors.reason = 'Reason for visit is required';
    }

    if (formData.weight && isNaN(Number(formData.weight))) {
      newErrors.weight = 'Weight must be a number';
    }

    if (formData.temperature && isNaN(Number(formData.temperature))) {
      newErrors.temperature = 'Temperature must be a number';
    }

    if (formData.heartRate && isNaN(Number(formData.heartRate))) {
      newErrors.heartRate = 'Heart rate must be a number';
    }

    if (formData.cost && isNaN(Number(formData.cost))) {
      newErrors.cost = 'Cost must be a number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please correct the errors in the form');
      return;
    }

    setLoading(true);

    try {
      const vetVisitData: Partial<VeterinaryVisit> = {
        dogId: formData.dogId,
        visitDate: formData.visitDate.toISOString(),
        visitType: formData.visitType,
        veterinarian: {
          name: formData.veterinarianName,
          clinic: formData.clinicName,
          phone: formData.clinicPhone || undefined,
          email: formData.clinicEmail || undefined,
        },
        reason: formData.reason,
        diagnosis: formData.diagnosis || undefined,
        treatment: formData.treatment || undefined,
        medications: medications.length > 0 ? medications : undefined,
        followUpRequired: formData.followUpRequired,
        followUpDate: formData.followUpRequired ? formData.followUpDate.toISOString() : undefined,
        cost: formData.cost ? parseFloat(formData.cost) : undefined,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        temperature: formData.temperature ? parseFloat(formData.temperature) : undefined,
        heartRate: formData.heartRate ? parseInt(formData.heartRate) : undefined,
        notes: formData.notes || undefined,
      };

      await apiService.createVetVisit(vetVisitData);

      Alert.alert(
        'Success',
        'Vet visit recorded successfully',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      console.error('Error recording vet visit:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to record vet visit. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const addMedication = () => {
    setMedications([...medications, { name: '', dosage: '', frequency: '', duration: '' }]);
  };

  const updateMedication = (index: number, field: keyof MedicationItem, value: string) => {
    const updated = [...medications];
    updated[index][field] = value;
    setMedications(updated);
  };

  const removeMedication = (index: number) => {
    setMedications(medications.filter((_, i) => i !== index));
  };

  const selectedDog = dogs.find(d => d.id === formData.dogId);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView style={styles.container}>
        <View style={styles.headerSection}>
          <Icon name="medical" size={48} color={theme.colors.primary} />
          <Text style={styles.headerTitle}>Record Vet Visit</Text>
          <Text style={styles.headerSubtitle}>
            Keep track of your dog's health and veterinary care
          </Text>
        </View>

        {/* Dog Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dog Information</Text>
          
          <Text style={styles.label}>
            Select Dog <Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity
            style={[styles.picker, errors.dogId && styles.inputError]}
            onPress={() => setShowDogPicker(!showDogPicker)}
          >
            <Text style={[styles.pickerText, !selectedDog && styles.placeholderText]}>
              {selectedDog ? `${selectedDog.name} (${selectedDog.breed})` : 'Select a dog...'}
            </Text>
            <Icon name="chevron-down" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>
          {errors.dogId && <Text style={styles.errorText}>{errors.dogId}</Text>}

          {showDogPicker && (
            <View style={styles.pickerModal}>
              {dogs.map((dog) => (
                <TouchableOpacity
                  key={dog.id}
                  style={styles.pickerOption}
                  onPress={() => {
                    setFormData({ ...formData, dogId: dog.id });
                    setShowDogPicker(false);
                    setErrors({ ...errors, dogId: '' });
                  }}
                >
                  <Text style={styles.pickerOptionText}>
                    {dog.name} - {dog.breed} ({dog.dogType})
                  </Text>
                </TouchableOpacity>
              ))}
              {dogs.length === 0 && (
                <Text style={styles.emptyText}>No dogs found. Please add a dog first.</Text>
              )}
            </View>
          )}
        </View>

        {/* Visit Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Visit Details</Text>

          <Text style={styles.label}>
            Visit Date <Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity
            style={styles.dateButton}
            onPress={() => setShowVisitDatePicker(true)}
          >
            <Icon name="calendar-outline" size={20} color={theme.colors.primary} />
            <Text style={styles.dateButtonText}>
              {formData.visitDate.toLocaleDateString()}
            </Text>
          </TouchableOpacity>

          {showVisitDatePicker && (
            <DateTimePicker
              value={formData.visitDate}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowVisitDatePicker(Platform.OS === 'ios');
                if (selectedDate) {
                  setFormData({ ...formData, visitDate: selectedDate });
                }
              }}
              maximumDate={new Date()}
            />
          )}

          <Text style={styles.label}>
            Visit Type <Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity
            style={styles.picker}
            onPress={() => setShowVisitTypePicker(!showVisitTypePicker)}
          >
            <Text style={styles.pickerText}>
              {visitTypes.find(vt => vt.value === formData.visitType)?.label}
            </Text>
            <Icon name="chevron-down" size={20} color={theme.colors.textSecondary} />
          </TouchableOpacity>

          {showVisitTypePicker && (
            <View style={styles.pickerModal}>
              {visitTypes.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={styles.pickerOption}
                  onPress={() => {
                    setFormData({ ...formData, visitType: type.value });
                    setShowVisitTypePicker(false);
                  }}
                >
                  <Text style={styles.pickerOptionText}>{type.label}</Text>
                  {formData.visitType === type.value && (
                    <Icon name="checkmark" size={20} color={theme.colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Text style={styles.label}>
            Reason for Visit <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.textArea, errors.reason && styles.inputError]}
            placeholder="e.g., Annual checkup, limping, vaccination due"
            value={formData.reason}
            onChangeText={(text) => {
              setFormData({ ...formData, reason: text });
              setErrors({ ...errors, reason: '' });
            }}
            multiline
            numberOfLines={3}
          />
          {errors.reason && <Text style={styles.errorText}>{errors.reason}</Text>}
        </View>

        {/* Veterinarian Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Veterinarian Information</Text>

          <Text style={styles.label}>
            Veterinarian Name <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.veterinarianName && styles.inputError]}
            placeholder="Dr. Smith"
            value={formData.veterinarianName}
            onChangeText={(text) => {
              setFormData({ ...formData, veterinarianName: text });
              setErrors({ ...errors, veterinarianName: '' });
            }}
          />
          {errors.veterinarianName && <Text style={styles.errorText}>{errors.veterinarianName}</Text>}

          <Text style={styles.label}>
            Clinic Name <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, errors.clinicName && styles.inputError]}
            placeholder="Happy Paws Veterinary Clinic"
            value={formData.clinicName}
            onChangeText={(text) => {
              setFormData({ ...formData, clinicName: text });
              setErrors({ ...errors, clinicName: '' });
            }}
          />
          {errors.clinicName && <Text style={styles.errorText}>{errors.clinicName}</Text>}

          <Text style={styles.label}>Clinic Phone</Text>
          <TextInput
            style={styles.input}
            placeholder="(555) 123-4567"
            value={formData.clinicPhone}
            onChangeText={(text) => setFormData({ ...formData, clinicPhone: text })}
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>Clinic Email</Text>
          <TextInput
            style={styles.input}
            placeholder="info@happypawsvet.com"
            value={formData.clinicEmail}
            onChangeText={(text) => setFormData({ ...formData, clinicEmail: text })}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Vital Signs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vital Signs</Text>

          <View style={styles.row}>
            <View style={styles.halfWidth}>
              <Text style={styles.label}>Weight (lbs)</Text>
              <TextInput
                style={[styles.input, errors.weight && styles.inputError]}
                placeholder="45.5"
                value={formData.weight}
                onChangeText={(text) => {
                  setFormData({ ...formData, weight: text });
                  setErrors({ ...errors, weight: '' });
                }}
                keyboardType="decimal-pad"
              />
              {errors.weight && <Text style={styles.errorText}>{errors.weight}</Text>}
            </View>

            <View style={styles.halfWidth}>
              <Text style={styles.label}>Temperature (°F)</Text>
              <TextInput
                style={[styles.input, errors.temperature && styles.inputError]}
                placeholder="101.5"
                value={formData.temperature}
                onChangeText={(text) => {
                  setFormData({ ...formData, temperature: text });
                  setErrors({ ...errors, temperature: '' });
                }}
                keyboardType="decimal-pad"
              />
              {errors.temperature && <Text style={styles.errorText}>{errors.temperature}</Text>}
            </View>
          </View>

          <Text style={styles.label}>Heart Rate (bpm)</Text>
          <TextInput
            style={[styles.input, errors.heartRate && styles.inputError]}
            placeholder="80"
            value={formData.heartRate}
            onChangeText={(text) => {
              setFormData({ ...formData, heartRate: text });
              setErrors({ ...errors, heartRate: '' });
            }}
            keyboardType="number-pad"
          />
          {errors.heartRate && <Text style={styles.errorText}>{errors.heartRate}</Text>}
        </View>

        {/* Diagnosis & Treatment */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Diagnosis & Treatment</Text>

          <Text style={styles.label}>Diagnosis</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Enter diagnosis if provided..."
            value={formData.diagnosis}
            onChangeText={(text) => setFormData({ ...formData, diagnosis: text })}
            multiline
            numberOfLines={3}
          />

          <Text style={styles.label}>Treatment</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Enter treatment plan..."
            value={formData.treatment}
            onChangeText={(text) => setFormData({ ...formData, treatment: text })}
            multiline
            numberOfLines={3}
          />
        </View>

        {/* Medications */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Medications</Text>
            <TouchableOpacity onPress={addMedication} style={styles.addButton}>
              <Icon name="add-circle" size={24} color={theme.colors.primary} />
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
          </View>

          {medications.map((medication, index) => (
            <View key={index} style={styles.medicationCard}>
              <View style={styles.medicationHeader}>
                <Text style={styles.medicationTitle}>Medication {index + 1}</Text>
                <TouchableOpacity onPress={() => removeMedication(index)}>
                  <Icon name="trash-outline" size={20} color={theme.colors.error} />
                </TouchableOpacity>
              </View>

              <Text style={styles.label}>Medication Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Amoxicillin"
                value={medication.name}
                onChangeText={(text) => updateMedication(index, 'name', text)}
              />

              <Text style={styles.label}>Dosage</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 500mg"
                value={medication.dosage}
                onChangeText={(text) => updateMedication(index, 'dosage', text)}
              />

              <Text style={styles.label}>Frequency</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Twice daily"
                value={medication.frequency}
                onChangeText={(text) => updateMedication(index, 'frequency', text)}
              />

              <Text style={styles.label}>Duration</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 10 days"
                value={medication.duration}
                onChangeText={(text) => updateMedication(index, 'duration', text)}
              />
            </View>
          ))}
        </View>

        {/* Follow-up */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Follow-up</Text>

          <View style={styles.switchRow}>
            <Text style={styles.label}>Follow-up Required?</Text>
            <Switch
              value={formData.followUpRequired}
              onValueChange={(value) => setFormData({ ...formData, followUpRequired: value })}
              trackColor={{ false: theme.colors.border, true: theme.colors.primary }}
              thumbColor="#ffffff"
            />
          </View>

          {formData.followUpRequired && (
            <>
              <Text style={styles.label}>Follow-up Date</Text>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowFollowUpDatePicker(true)}
              >
                <Icon name="calendar-outline" size={20} color={theme.colors.primary} />
                <Text style={styles.dateButtonText}>
                  {formData.followUpDate.toLocaleDateString()}
                </Text>
              </TouchableOpacity>

              {showFollowUpDatePicker && (
                <DateTimePicker
                  value={formData.followUpDate}
                  mode="date"
                  display="default"
                  onChange={(event, selectedDate) => {
                    setShowFollowUpDatePicker(Platform.OS === 'ios');
                    if (selectedDate) {
                      setFormData({ ...formData, followUpDate: selectedDate });
                    }
                  }}
                  minimumDate={new Date()}
                />
              )}
            </>
          )}
        </View>

        {/* Cost & Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Information</Text>

          <Text style={styles.label}>Visit Cost ($)</Text>
          <TextInput
            style={[styles.input, errors.cost && styles.inputError]}
            placeholder="150.00"
            value={formData.cost}
            onChangeText={(text) => {
              setFormData({ ...formData, cost: text });
              setErrors({ ...errors, cost: '' });
            }}
            keyboardType="decimal-pad"
          />
          {errors.cost && <Text style={styles.errorText}>{errors.cost}</Text>}

          <Text style={styles.label}>Additional Notes</Text>
          <TextInput
            style={styles.textArea}
            placeholder="Any additional notes or observations..."
            value={formData.notes}
            onChangeText={(text) => setFormData({ ...formData, notes: text })}
            multiline
            numberOfLines={4}
          />
        </View>

        {/* Submit Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <>
                <Icon name="checkmark-circle" size={24} color="#ffffff" />
                <Text style={styles.submitButtonText}>Record Visit</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerSection: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.xl,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    backgroundColor: theme.colors.surface,
    padding: theme.spacing.lg,
    marginTop: theme.spacing.md,
    marginHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadows.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
    marginTop: theme.spacing.sm,
  },
  required: {
    color: theme.colors.error,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: 15,
    color: theme.colors.text,
    backgroundColor: theme.colors.background,
  },
  textArea: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: 15,
    color: theme.colors.text,
    backgroundColor: theme.colors.background,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: theme.colors.error,
  },
  errorText: {
    fontSize: 13,
    color: theme.colors.error,
    marginTop: theme.spacing.xs,
  },
  picker: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  pickerText: {
    fontSize: 15,
    color: theme.colors.text,
  },
  placeholderText: {
    color: theme.colors.textSecondary,
  },
  pickerModal: {
    marginTop: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background,
    maxHeight: 250,
  },
  pickerOption: {
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pickerOptionText: {
    fontSize: 15,
    color: theme.colors.text,
  },
  emptyText: {
    padding: theme.spacing.lg,
    textAlign: 'center',
    color: theme.colors.textSecondary,
    fontSize: 14,
  },
  dateButton: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  dateButtonText: {
    fontSize: 15,
    color: theme.colors.text,
    marginLeft: theme.spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  halfWidth: {
    flex: 1,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  addButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  medicationCard: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  medicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  medicationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  buttonContainer: {
    padding: theme.spacing.xl,
    paddingBottom: theme.spacing.xxl,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    ...theme.shadows.md,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
  },
  cancelButton: {
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  cancelButtonText: {
    color: theme.colors.textSecondary,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RecordVetVisitScreen;

