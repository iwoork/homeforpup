import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useSignUp } from '@clerk/clerk-react';
import { useAuth } from '../../contexts/AuthContext';

interface VerifyEmailScreenProps {
  navigation: any;
  route: any;
}

const VerifyEmailScreen: React.FC<VerifyEmailScreenProps> = ({ navigation, route }) => {
  const { email } = route?.params || {};
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const { confirmSignup } = useAuth();
  const { signUp } = useSignUp();

  const handleVerify = async () => {
    if (!verificationCode.trim()) {
      Alert.alert('Error', 'Please enter the verification code');
      return;
    }

    if (!email) {
      Alert.alert('Error', 'Email not found. Please sign up again.');
      navigation.navigate('Signup');
      return;
    }

    setLoading(true);
    try {
      const result = await confirmSignup(email, verificationCode.trim());
      
      if (result.success) {
        Alert.alert(
          'Success',
          'Your email has been verified! You can now log in.',
          [
            {
              text: 'OK',
              onPress: () => navigation.replace('Login'),
            },
          ]
        );
      } else {
        Alert.alert('Verification Failed', result.error || 'Invalid verification code. Please try again.');
      }
    } catch (error) {
      console.error('Verification error:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      Alert.alert('Error', 'Email not found. Please sign up again.');
      navigation.navigate('Signup');
      return;
    }

    setResending(true);
    try {
      await signUp?.prepareEmailAddressVerification({ strategy: 'email_code' });
      Alert.alert(
        'Success',
        'Verification code has been resent to your email.'
      );
    } catch (error: any) {
      console.error('Resend code error:', error);
      Alert.alert('Error', error?.errors?.[0]?.message || error.message || 'Failed to resend code. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Verify Your Email</Text>
        <Text style={styles.subtitle}>
          We sent a verification code to:
        </Text>
        <Text style={styles.email}>{email || 'No email provided'}</Text>
        <Text style={styles.instructions}>
          Please enter the 6-digit code below
        </Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Verification Code</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter 6-digit code"
            value={verificationCode}
            onChangeText={setVerificationCode}
            keyboardType="number-pad"
            maxLength={6}
            autoFocus
            editable={!loading}
          />
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleVerify}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Verify Email</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.linkButton}
          onPress={handleResendCode}
          disabled={resending || loading}
        >
          <Text style={[styles.linkText, (resending || loading) && styles.linkTextDisabled]}>
            {resending ? 'Resending...' : 'Didn\'t receive the code? Resend'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.linkButton}
          onPress={() => navigation.replace('Signup')}
          disabled={loading}
        >
          <Text style={[styles.linkText, loading && styles.linkTextDisabled]}>
            Wrong email? Sign up again
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0066cc',
    textAlign: 'center',
    marginBottom: 8,
  },
  instructions: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  input: {
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    padding: 16,
    fontSize: 20,
    backgroundColor: '#f9f9f9',
    textAlign: 'center',
    letterSpacing: 8,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  button: {
    backgroundColor: '#0066cc',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    minHeight: 54,
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  linkButton: {
    alignItems: 'center',
    marginTop: 16,
    padding: 10,
  },
  linkText: {
    color: '#0066cc',
    fontSize: 15,
    fontWeight: '600',
  },
  linkTextDisabled: {
    opacity: 0.5,
  },
});

export default VerifyEmailScreen;
