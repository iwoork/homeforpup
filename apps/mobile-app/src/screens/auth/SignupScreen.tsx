import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../../contexts/AuthContext';
import { theme } from '../../utils/theme';
import Logo from '../../components/Logo';

const COUNTRIES = [
  { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸', format: '(XXX) XXX-XXXX' },
  { code: 'CA', name: 'Canada', dialCode: '+1', flag: '🇨🇦', format: '(XXX) XXX-XXXX' },
];

interface SignupScreenProps {
  navigation: any;
}

const SignupScreen: React.FC<SignupScreenProps> = ({ navigation }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    userType: 'dog-parent' as 'dog-parent' | 'breeder',
  });
  const [loading, setLoading] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]); // Default to US
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const { signup } = useAuth();

  // Auto-detect country on mount
  useEffect(() => {
    detectCountry();
  }, []);

  const detectCountry = async () => {
    try {
      // Try to detect country from timezone or locale
      const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      
      // Simple detection based on timezone
      if (timeZone.includes('America')) {
        if (timeZone.includes('Toronto') || timeZone.includes('Vancouver') || 
            timeZone.includes('Montreal') || timeZone.includes('Edmonton')) {
          setSelectedCountry(COUNTRIES[1]); // Canada
        } else {
          setSelectedCountry(COUNTRIES[0]); // US (default)
        }
      }
    } catch (error) {
      console.log('Could not detect country, defaulting to US');
      setSelectedCountry(COUNTRIES[0]);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const formatPhoneNumber = (text: string) => {
    // Remove all non-digit characters
    const cleaned = text.replace(/\D/g, '');
    
    // Limit to 10 digits for US/Canada
    const limited = cleaned.substring(0, 10);
    
    // Format as (XXX) XXX-XXXX
    if (limited.length >= 6) {
      return `(${limited.substring(0, 3)}) ${limited.substring(3, 6)}-${limited.substring(6)}`;
    } else if (limited.length >= 3) {
      return `(${limited.substring(0, 3)}) ${limited.substring(3)}`;
    } else if (limited.length > 0) {
      return `(${limited}`;
    }
    return limited;
  };

  const handlePhoneChange = (text: string) => {
    const formatted = formatPhoneNumber(text);
    handleInputChange('phone', formatted);
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return false;
    }
    if (!formData.email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return false;
    }
    if (!formData.email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }
    if (!formData.password) {
      Alert.alert('Error', 'Please enter a password');
      return false;
    }
    if (formData.password.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }
    if (!formData.phone.trim()) {
      Alert.alert('Error', 'Please enter your phone number');
      return false;
    }
    // Check if phone has 10 digits (for US/Canada)
    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (phoneDigits.length !== 10) {
      Alert.alert('Error', 'Please enter a valid 10-digit phone number');
      return false;
    }
    return true;
  };

  const handleSignup = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Format phone with country code
      const phoneDigits = formData.phone.replace(/\D/g, '');
      const phoneWithCountryCode = `${selectedCountry.dialCode}${phoneDigits}`;
      
      const result = await signup({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: phoneWithCountryCode,
        userType: formData.userType,
      });

      if (result.success) {
        // Check if verification is required
        if (result.data?.requiresVerification) {
          // Navigate to verification screen
          setLoading(false);
          
          // Show info message if user already exists
          if (result.message?.includes('already registered')) {
            Alert.alert(
              'Account Found',
              result.message,
              [{ text: 'OK', onPress: () => navigation.replace('VerifyEmail', { email: formData.email.trim() }) }]
            );
          } else {
            navigation.replace('VerifyEmail', { email: formData.email.trim() });
          }
        } else {
          // User is already verified and logged in
          setLoading(false);
          const message = result.message || 'Account created successfully!';
          Alert.alert('Success', message);
        }
      } else {
        setLoading(false);
        Alert.alert('Signup Failed', result.error || 'Please try again');
      }
    } catch (error) {
      setLoading(false);
      Alert.alert('Error', 'An unexpected error occurred');
    }
  };

  return (
    <LinearGradient
      colors={['#ffffff', '#f0f9fa', '#e8f5f6']}
      style={styles.gradient}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.header}>
            <Logo size={80} style={styles.logo} />
            <Text style={styles.appName}>Home for Pup</Text>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              {formData.userType === 'breeder' 
                ? 'Join as a breeder and connect with families' 
                : 'Find your perfect puppy companion'}
            </Text>
          </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>I am a...</Text>
            <View style={styles.userTypeContainer}>
              <TouchableOpacity
                style={[
                  styles.userTypeButton,
                  formData.userType === 'dog-parent' && styles.userTypeButtonActive,
                ]}
                onPress={() => handleInputChange('userType', 'dog-parent')}
              >
                <Icon
                  name="heart"
                  size={24}
                  color={formData.userType === 'dog-parent' ? '#fff' : theme.colors.primary}
                />
                <Text
                  style={[
                    styles.userTypeButtonText,
                    formData.userType === 'dog-parent' && styles.userTypeButtonTextActive,
                  ]}
                >
                  Dog Parent
                </Text>
                <Text
                  style={[
                    styles.userTypeDescription,
                    formData.userType === 'dog-parent' && styles.userTypeDescriptionActive,
                  ]}
                >
                  Looking for a puppy
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.userTypeButton,
                  formData.userType === 'breeder' && styles.userTypeButtonActive,
                ]}
                onPress={() => handleInputChange('userType', 'breeder')}
              >
                <Icon
                  name="paw"
                  size={24}
                  color={formData.userType === 'breeder' ? '#fff' : theme.colors.primary}
                />
                <Text
                  style={[
                    styles.userTypeButtonText,
                    formData.userType === 'breeder' && styles.userTypeButtonTextActive,
                  ]}
                >
                  Breeder
                </Text>
                <Text
                  style={[
                    styles.userTypeDescription,
                    formData.userType === 'breeder' && styles.userTypeDescriptionActive,
                  ]}
                >
                  Breeding puppies
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your full name"
              placeholderTextColor={theme.colors.textTertiary}
              value={formData.name}
              onChangeText={(value) => handleInputChange('name', value)}
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Email Address</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter your email"
              placeholderTextColor={theme.colors.textTertiary}
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.phoneInputContainer}>
              <TouchableOpacity
                style={styles.countrySelector}
                onPress={() => setShowCountryPicker(true)}
              >
                <Text style={styles.countryFlag}>{selectedCountry.flag}</Text>
                <Text style={styles.countryCode}>{selectedCountry.dialCode}</Text>
                <Icon name="chevron-down" size={16} color={theme.colors.textSecondary} />
              </TouchableOpacity>
              <TextInput
                style={styles.phoneInput}
                placeholder={selectedCountry.format}
                placeholderTextColor={theme.colors.textTertiary}
                value={formData.phone}
                onChangeText={handlePhoneChange}
                keyboardType="phone-pad"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Create a password"
              placeholderTextColor={theme.colors.textTertiary}
              value={formData.password}
              onChangeText={(value) => handleInputChange('password', value)}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Confirm your password"
              placeholderTextColor={theme.colors.textTertiary}
              value={formData.confirmPassword}
              onChangeText={(value) => handleInputChange('confirmPassword', value)}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSignup}
            disabled={loading}
          >
            <LinearGradient
              colors={loading ? [theme.colors.textSecondary, theme.colors.textSecondary] : [theme.colors.primary, theme.colors.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.buttonGradient}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Creating Account...' : 'Create Account'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.linkButton}>
            <Text style={styles.linkText}>Terms of Service</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.footerLink}>Sign In</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>

    {/* Country Picker Modal */}
    <Modal
      visible={showCountryPicker}
      transparent
      animationType="slide"
      onRequestClose={() => setShowCountryPicker(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select Country</Text>
            <TouchableOpacity onPress={() => setShowCountryPicker(false)}>
              <Icon name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>
          </View>
          
          {COUNTRIES.map((country) => (
            <TouchableOpacity
              key={country.code}
              style={[
                styles.countryOption,
                selectedCountry.code === country.code && styles.countryOptionSelected
              ]}
              onPress={() => {
                setSelectedCountry(country);
                setShowCountryPicker(false);
              }}
            >
              <Text style={styles.countryOptionFlag}>{country.flag}</Text>
              <View style={styles.countryOptionInfo}>
                <Text style={styles.countryOptionName}>{country.name}</Text>
                <Text style={styles.countryOptionCode}>{country.dialCode}</Text>
              </View>
              {selectedCountry.code === country.code && (
                <Icon name="checkmark-circle" size={24} color={theme.colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Modal>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  logo: {
    marginBottom: theme.spacing.sm,
  },
  appName: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: theme.spacing.md,
    letterSpacing: 0.5,
  },
  title: {
    fontSize: 26,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  form: {
    marginBottom: theme.spacing.lg,
  },
  inputContainer: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  input: {
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md + 2,
    fontSize: 16,
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
  },
  button: {
    borderRadius: theme.borderRadius.lg,
    marginTop: theme.spacing.lg,
    overflow: 'hidden',
    ...theme.shadows.md,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonGradient: {
    padding: theme.spacing.md + 2,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  linkButton: {
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  linkText: {
    color: theme.colors.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: theme.spacing.lg,
  },
  footerText: {
    color: theme.colors.textSecondary,
    fontSize: 15,
  },
  footerLink: {
    color: theme.colors.primary,
    fontSize: 15,
    fontWeight: '700',
  },
  userTypeContainer: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    justifyContent: 'space-between',
  },
  userTypeButton: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
  },
  userTypeButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  userTypeButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.colors.text,
    marginTop: theme.spacing.sm,
  },
  userTypeButtonTextActive: {
    color: '#fff',
  },
  userTypeDescription: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  userTypeDescriptionActive: {
    color: '#fff',
    opacity: 0.9,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  countrySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
  },
  countryFlag: {
    fontSize: 24,
  },
  countryCode: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
  },
  phoneInput: {
    flex: 1,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md + 2,
    fontSize: 16,
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xxl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
    paddingBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: theme.colors.text,
  },
  countryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.xs,
  },
  countryOptionSelected: {
    backgroundColor: theme.colors.primaryLight,
  },
  countryOptionFlag: {
    fontSize: 32,
    marginRight: theme.spacing.md,
  },
  countryOptionInfo: {
    flex: 1,
  },
  countryOptionName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 2,
  },
  countryOptionCode: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
});

export default SignupScreen;