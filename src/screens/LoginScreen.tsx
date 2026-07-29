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
import { SocialAuthButton } from '../components/SocialAuthButton';
import { colors, spacing, typography } from '../constants/theme';
import { RootStackParamList } from '../navigation/types';
import { login } from '../services/authService';
import {
  validateEmailOrPhone,
  validatePassword,
} from '../utils/validation';
import { useAuth } from '../context/AuthContext';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export function LoginScreen({ navigation }: Props) {
  const { isConfigured } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ identifier?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    const identifierResult = validateEmailOrPhone(identifier);
    const passwordResult = validatePassword(password);

    const nextErrors = {
      identifier: identifierResult.valid ? undefined : identifierResult.message,
      password: passwordResult.valid ? undefined : passwordResult.message,
    };
    setErrors(nextErrors);

    if (!identifierResult.valid || !passwordResult.valid) {
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
      await login(identifier, password);
    } catch (error) {
      Alert.alert('Login failed', (error as Error).message);
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

          <Text style={styles.title}>Welcome Back!</Text>
          <Text style={styles.subtitle}>Please login to continue</Text>

          <View style={styles.form}>
            <AuthTextInput
              placeholder="Email or Phone number"
              value={identifier}
              onChangeText={setIdentifier}
              error={errors.identifier}
              keyboardType="email-address"
              autoComplete="username"
            />
            <AuthTextInput
              placeholder="Password"
              value={password}
              onChangeText={setPassword}
              error={errors.password}
              secureTextEntry
              autoComplete="password"
            />

            <TouchableOpacity
              style={styles.forgotLink}
              onPress={() => navigation.navigate('ForgotPassword')}
            >
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            <PrimaryButton title="Login" onPress={handleLogin} loading={loading} />

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            <SocialAuthButton provider="google" />
            <SocialAuthButton provider="apple" />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don&apos;t have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>Register</Text>
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
  forgotLink: {
    alignSelf: 'flex-end',
    marginBottom: spacing.sm,
  },
  forgotText: {
    ...typography.link,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    marginHorizontal: spacing.md,
    color: colors.textMuted,
    fontSize: 13,
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
  registerLink: {
    ...typography.link,
    fontWeight: '700',
  },
});
