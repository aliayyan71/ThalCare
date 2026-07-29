import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
  Alert,
} from 'react-native';
import { colors, radii, spacing } from '../constants/theme';

type SocialAuthButtonProps = {
  provider: 'google' | 'apple';
};

export function SocialAuthButton({ provider }: SocialAuthButtonProps) {
  const isGoogle = provider === 'google';
  const label = isGoogle ? 'Continue with Google' : 'Continue with Apple';

  const handlePress = () => {
    Alert.alert(
      'Coming soon',
      `${isGoogle ? 'Google' : 'Apple'} sign-in will be available in a future update.`,
    );
  };

  return (
    <TouchableOpacity style={styles.button} onPress={handlePress} activeOpacity={0.85}>
      <View style={styles.icon}>
        {isGoogle ? (
          <Text style={styles.googleIcon}>G</Text>
        ) : (
          <Text style={styles.appleIcon}>{'\uF8FF'}</Text>
        )}
      </View>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.button,
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.white,
    marginBottom: spacing.sm,
  },
  icon: {
    width: 24,
    height: 24,
    marginRight: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIcon: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4285F4',
  },
  appleIcon: {
    fontSize: 20,
    color: colors.textPrimary,
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textPrimary,
  },
});
