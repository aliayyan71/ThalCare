import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { AuthTextInput } from '../components/AuthTextInput';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, spacing, typography } from '../constants/theme';
import { RootStackParamList } from '../navigation/types';
import { resetPassword } from '../services/authService';
import { validateEmail } from '../utils/validation';
import { useAuth } from '../context/AuthContext';

type Props = NativeStackScreenProps<RootStackParamList, 'ForgotPassword'>;

export function ForgotPasswordScreen({ navigation }: Props) {
  const { isConfigured } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [loading, setLoading] = useState(false);

  const handleReset = async () => {
    const emailResult = validateEmail(email);
    setError(emailResult.valid ? undefined : emailResult.message);

    if (!emailResult.valid) {
      return;
    }

    if (!isConfigured) {
      Alert.alert(
        'Firebase not configured',
        'Add your Firebase keys to a .env file (see .env.example), then restart the app.',
      );
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email);
      Alert.alert(
        'Check your email',
        'We sent a password reset link to your email address.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }],
      );
    } catch (err) {
      Alert.alert('Reset failed', (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.content}>
          <Text style={styles.title}>Forgot Password</Text>
          <Text style={styles.subtitle}>
            Enter your email and we&apos;ll send you a reset link
          </Text>

          <AuthTextInput
            placeholder="Email address"
            value={email}
            onChangeText={setEmail}
            error={error}
            keyboardType="email-address"
            autoComplete="email"
          />

          <PrimaryButton title="Send Reset Link" onPress={handleReset} loading={loading} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  flex: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  back: {
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
    width: 40,
  },
  content: {
    flex: 1,
  },
  title: {
    ...typography.title,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.subtitle,
    marginBottom: spacing.xl,
  },
});
