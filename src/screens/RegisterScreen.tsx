import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThalCareLogo } from '../components/ThalCareLogo';
import { WaveFooter } from '../components/WaveFooter';
import { AuthTextInput } from '../components/AuthTextInput';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, spacing, typography } from '../constants/theme';
import { RootStackParamList } from '../navigation/types';
import { register } from '../services/authService';
import {
  validateName,
  validateEmail,
  validatePassword,
  validateConfirmPassword,
} from '../utils/validation';
import { useAuth } from '../context/AuthContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;

export function RegisterScreen({ navigation }: Props) {
  const { isConfigured } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    const nameResult = validateName(name);
    const emailResult = validateEmail(email);
    const passwordResult = validatePassword(password);
    const confirmResult = validateConfirmPassword(password, confirmPassword);

    const nextErrors = {
      name: nameResult.valid ? undefined : nameResult.message,
      email: emailResult.valid ? undefined : emailResult.message,
      password: passwordResult.valid ? undefined : passwordResult.message,
      confirmPassword: confirmResult.valid ? undefined : confirmResult.message,
    };
    setErrors(nextErrors);

    if (
      !nameResult.valid ||
      !emailResult.valid ||
      !passwordResult.valid ||
      !confirmResult.valid
    ) {
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
      await register(name, email, password);
    } catch (error) {
      Alert.alert('Registration failed', (error as Error).message);
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
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoRow}>
            <ThalCareLogo size={56} />
            <Text style={styles.logoText}>ThalCare</Text>
          </View>

          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join ThalCare to manage your care</Text>

          <View style={styles.form}>
            <AuthTextInput
              placeholder="Full name"
              value={name}
              onChangeText={setName}
              error={errors.name}
              autoComplete="name"
            />
            <AuthTextInput
              placeholder="Email address"
              value={email}
              onChangeText={setEmail}
              error={errors.email}
              keyboardType="email-address"
              autoComplete="email"
            />
            <AuthTextInput
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              error={errors.password}
              secureTextEntry
              autoComplete="new-password"
            />
            <AuthTextInput
              placeholder="Confirm password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              error={errors.confirmPassword}
              secureTextEntry
              autoComplete="new-password"
            />

            <PrimaryButton
              title="Register"
              onPress={handleRegister}
              loading={loading}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <WaveFooter />
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
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: 180,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  logoText: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.brandRed,
    marginLeft: spacing.sm,
  },
  title: {
    ...typography.title,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.subtitle,
    marginBottom: spacing.xl,
  },
  form: {
    marginTop: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  footerText: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  loginLink: {
    ...typography.link,
    fontWeight: '700',
  },
});
