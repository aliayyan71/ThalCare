import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { ThalCareLogo } from '../components/ThalCareLogo';
import { colors, spacing, typography } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { logout } from '../services/authService';

export function HomeScreen() {
  const { user } = useAuth();
  const displayName = user?.displayName ?? 'there';

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // Auth state listener will handle navigation
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.logoRow}>
          <ThalCareLogo size={40} />
          <Text style={styles.logoText}>ThalCare</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logout}>
          <Ionicons name="log-out-outline" size={22} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.greeting}>Hello, {displayName} 👋</Text>
        <Text style={styles.message}>Stay strong, we are with you!</Text>

        <View style={styles.placeholder}>
          <Ionicons name="home-outline" size={48} color={colors.brandRed} />
          <Text style={styles.placeholderTitle}>Dashboard coming soon</Text>
          <Text style={styles.placeholderText}>
            Your health summary, transfusions, medicines, and appointments will
            appear here.
          </Text>
        </View>
      </View>

      <View style={styles.tabBar}>
        {(['Home', 'Records', 'Calendar', 'Learn', 'Profile'] as const).map(
          (tab, index) => (
            <View key={tab} style={styles.tabItem}>
              <Ionicons
                name={
                  index === 0
                    ? 'home'
                    : index === 1
                      ? 'document-text-outline'
                      : index === 2
                        ? 'calendar-outline'
                        : index === 3
                          ? 'book-outline'
                          : 'person-outline'
                }
                size={22}
                color={index === 0 ? colors.brandRed : colors.textMuted}
              />
              <Text
                style={[styles.tabLabel, index === 0 && styles.tabLabelActive]}
              >
                {tab}
              </Text>
            </View>
          ),
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.brandRed,
    marginLeft: spacing.sm,
  },
  logout: {
    padding: spacing.sm,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  message: {
    ...typography.subtitle,
    marginBottom: spacing.xl,
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: 80,
  },
  placeholderTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  placeholderText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  tabBar: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  tabLabel: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  tabLabelActive: {
    color: colors.brandRed,
    fontWeight: '600',
  },
});
