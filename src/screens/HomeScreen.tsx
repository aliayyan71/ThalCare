import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThalCareLogo } from '../components/ThalCareLogo';
import { colors, radii, spacing } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { logout } from '../services/authService';
import { getCompatibleRedCellRecipients } from '../constants/bloodCompatibility';

export function HomeScreen() {
  const { user, profile } = useAuth();
  const firstName = user?.displayName?.split(' ')[0] ?? 'there';

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      Alert.alert('Could not log out', 'Please try again.');
    }
  };

  if (!profile) {
    return null;
  }

  if (profile.accountType === 'donor') {
    return <DonorHome firstName={firstName} bloodGroup={profile.bloodGroup} onLogout={handleLogout} />;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.logoRow}>
            <ThalCareLogo size={39} />
            <Text style={styles.logoText}>ThalCare</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.headerAction} accessibilityLabel="Log out">
            <Ionicons name="log-out-outline" size={23} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        <Text style={styles.eyebrow}>PATIENT DASHBOARD</Text>
        <Text style={styles.greeting}>Good to see you, {firstName}.</Text>
        <Text style={styles.intro}>Here&apos;s your care overview for today.</Text>

        <View style={styles.statusCard}>
          <View style={styles.statusIcon}>
            <Ionicons name="heart" size={25} color={colors.white} />
          </View>
          <View style={styles.statusContent}>
            <Text style={styles.statusLabel}>YOUR BLOOD GROUP</Text>
            <Text style={styles.statusValue}>{profile.bloodGroup}</Text>
            <Text style={styles.statusDetail}>Keep your emergency details up to date.</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Care at a glance</Text>
        <View style={styles.metricRow}>
          <MetricCard icon="calendar-outline" label="Next transfusion" value="Not scheduled" tone="red" />
          <MetricCard icon="medkit-outline" label="Treating hospital" value={profile.treatingHospital ?? 'Not added'} tone="blue" />
        </View>

        <Text style={styles.sectionTitle}>Quick access</Text>
        <View style={styles.quickList}>
          <QuickLink icon="document-text-outline" title="My health records" subtitle="Keep reports and prescriptions together" />
          <QuickLink icon="calendar-clear-outline" title="Appointments" subtitle="Track your hospital visits" />
          <QuickLink icon="call-outline" title="Emergency contact" subtitle={profile.emergencyContact ?? 'Not added'} last />
        </View>

        <View style={styles.tipCard}>
          <Ionicons name="bulb-outline" size={22} color={colors.brandRed} />
          <Text style={styles.tipText}>Tip: Bring your latest blood report to every transfusion visit.</Text>
        </View>
      </ScrollView>

      <View style={styles.tabBar}>
        <Tab icon="home" label="Home" active />
      </View>
    </SafeAreaView>
  );
}

function DonorHome({ firstName, bloodGroup, onLogout }: { firstName: string; bloodGroup: string; onLogout: () => void }) {
  const recipientGroups = getCompatibleRedCellRecipients(bloodGroup);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.donorScrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.logoRow}><ThalCareLogo size={39} /><Text style={styles.logoText}>ThalCare</Text></View>
          <TouchableOpacity onPress={onLogout} style={styles.headerAction} accessibilityLabel="Log out"><Ionicons name="log-out-outline" size={23} color={colors.textSecondary} /></TouchableOpacity>
        </View>

        <Text style={styles.eyebrow}>DONOR DASHBOARD</Text>
        <Text style={styles.greeting}>Hello, {firstName}.</Text>
        <Text style={styles.intro}>Your willingness to donate can make a real difference to someone&apos;s care.</Text>

        <View style={styles.donorHeroCard}>
          <View style={styles.donorHeroIcon}><Ionicons name="heart" size={25} color={colors.white} /></View>
          <View style={styles.donorHeroCopy}>
            <Text style={styles.donorHeroLabel}>YOUR DONOR TYPE</Text>
            <Text style={styles.donorHeroBlood} selectable>{bloodGroup}</Text>
            <Text style={styles.donorHeroDetail}>Registered donor profile</Text>
          </View>
          <Ionicons name="checkmark-circle" size={24} color="#DDFBE5" />
        </View>

        <View style={styles.donorSectionHeader}>
          <View>
            <Text style={styles.sectionTitleNoMargin}>People you can help</Text>
            <Text style={styles.donorSectionSubtitle}>Your red cells may be compatible with these blood groups.</Text>
          </View>
          <View style={styles.recipientCount}><Text style={styles.recipientCountText}>{recipientGroups.length}</Text></View>
        </View>

        <View style={styles.compatibilityCard}>
          <View style={styles.compatibilityIntro}>
            <View style={styles.compatibilityIcon}><Ionicons name="people-outline" size={21} color={colors.brandRed} /></View>
            <Text style={styles.compatibilityTitle}>Eligible recipient blood groups</Text>
          </View>
          <View style={styles.bloodChipList}>
            {recipientGroups.map((group) => <BloodGroupChip key={group} bloodGroup={group} />)}
          </View>
          <View style={styles.safetyNote}>
            <Ionicons name="information-circle-outline" size={18} color={colors.textSecondary} />
            <Text style={styles.safetyNoteText}>Compatibility shown is for red cells. A blood bank always confirms the final match and donation eligibility.</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Your next step</Text>
        <View style={styles.donorActionCard}>
          <View style={styles.donorActionIcon}><Ionicons name="calendar-outline" size={22} color="#2563EB" /></View>
          <View style={styles.donorActionCopy}>
            <Text style={styles.donorActionTitle}>Stay ready to donate</Text>
            <Text style={styles.donorActionDetail}>We&apos;ll add donation availability and request matching here next.</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.tabBar}>
        <Tab icon="home" label="Home" active />
      </View>
    </SafeAreaView>
  );
}

function BloodGroupChip({ bloodGroup }: { bloodGroup: string }) {
  return <View style={styles.bloodChip}><Ionicons name="heart" size={13} color={colors.brandRed} /><Text style={styles.bloodChipText} selectable>{bloodGroup}</Text></View>;
}

function MetricCard({ icon, label, value, tone }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string; tone: 'red' | 'blue' }) {
  return <View style={styles.metricCard}><View style={[styles.metricIcon, tone === 'blue' && styles.metricIconBlue]}><Ionicons name={icon} size={20} color={tone === 'blue' ? '#2563EB' : colors.brandRed} /></View><Text style={styles.metricLabel}>{label}</Text><Text style={styles.metricValue} numberOfLines={2}>{value}</Text></View>;
}

function QuickLink({ icon, title, subtitle, last = false }: { icon: keyof typeof Ionicons.glyphMap; title: string; subtitle: string; last?: boolean }) {
  return <TouchableOpacity style={[styles.quickLink, !last && styles.quickLinkBorder]} activeOpacity={0.75}><View style={styles.quickIcon}><Ionicons name={icon} size={21} color={colors.brandRed} /></View><View style={styles.quickText}><Text style={styles.quickTitle}>{title}</Text><Text style={styles.quickSubtitle} numberOfLines={1}>{subtitle}</Text></View><Ionicons name="chevron-forward" size={19} color={colors.textMuted} /></TouchableOpacity>;
}

function Tab({ icon, label, active = false }: { icon: keyof typeof Ionicons.glyphMap; label: string; active?: boolean }) {
  return <View style={styles.tabItem}><Ionicons name={icon} size={21} color={active ? colors.brandRed : colors.textMuted} /><Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.white },
  content: { paddingHorizontal: spacing.lg, paddingBottom: 104 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.lg },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  logoText: { color: colors.brandRed, fontSize: 20, fontWeight: '800' },
  headerAction: { padding: spacing.sm },
  eyebrow: { color: colors.brandRed, fontSize: 11, fontWeight: '800', letterSpacing: 1.1, marginTop: spacing.sm, marginBottom: spacing.sm },
  greeting: { color: colors.textPrimary, fontSize: 26, fontWeight: '800', letterSpacing: -0.3 },
  intro: { color: colors.textSecondary, fontSize: 15, lineHeight: 22, marginTop: spacing.xs, marginBottom: spacing.lg },
  statusCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.brandRed, borderRadius: 18, padding: spacing.lg, gap: spacing.md, boxShadow: '0 8px 16px rgba(229, 30, 37, 0.16)' },
  statusIcon: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.22)' },
  statusContent: { flex: 1 },
  statusLabel: { color: '#FFE3E5', fontSize: 11, fontWeight: '800', letterSpacing: 0.8 },
  statusValue: { color: colors.white, fontSize: 30, fontWeight: '800', marginTop: 1 },
  statusDetail: { color: '#FFF1F2', fontSize: 12, marginTop: 2 },
  sectionTitle: { color: colors.textPrimary, fontSize: 18, fontWeight: '800', marginTop: spacing.xl, marginBottom: spacing.md },
  metricRow: { flexDirection: 'row', gap: spacing.sm },
  metricCard: { flex: 1, minHeight: 148, borderWidth: 1, borderColor: colors.border, borderRadius: radii.input, padding: spacing.md, backgroundColor: colors.white },
  metricIcon: { width: 37, height: 37, borderRadius: 18.5, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.waveLight, marginBottom: spacing.md },
  metricIconBlue: { backgroundColor: '#E8F0FF' },
  metricLabel: { color: colors.textMuted, fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  metricValue: { color: colors.textPrimary, fontSize: 14, fontWeight: '800', marginTop: spacing.xs, lineHeight: 19 },
  quickList: { borderWidth: 1, borderColor: colors.border, borderRadius: radii.input, overflow: 'hidden' },
  quickLink: { minHeight: 72, paddingHorizontal: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.white },
  quickLinkBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  quickIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.waveLight },
  quickText: { flex: 1 },
  quickTitle: { color: colors.textPrimary, fontSize: 14, fontWeight: '700' },
  quickSubtitle: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },
  tipCard: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start', backgroundColor: '#FFF8EA', borderRadius: radii.input, padding: spacing.md, marginTop: spacing.lg },
  tipText: { flex: 1, color: '#7A4B00', fontSize: 13, lineHeight: 19 },
  tabBar: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.border, paddingVertical: spacing.sm, paddingHorizontal: spacing.sm, backgroundColor: colors.white },
  tabItem: { flex: 1, alignItems: 'center', gap: 3 },
  tabLabel: { color: colors.textMuted, fontSize: 10 },
  tabLabelActive: { color: colors.brandRed, fontWeight: '700' },
  donorScrollContent: { paddingHorizontal: spacing.lg, paddingBottom: 104 },
  donorHeroCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1F9D55', borderRadius: 18, padding: spacing.lg, gap: spacing.md, boxShadow: '0 8px 16px rgba(31, 157, 85, 0.16)' },
  donorHeroIcon: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.2)' },
  donorHeroCopy: { flex: 1 },
  donorHeroLabel: { color: '#DDFBE5', fontSize: 11, fontWeight: '800', letterSpacing: 0.8 },
  donorHeroBlood: { color: colors.white, fontSize: 30, fontWeight: '800', marginTop: 1 },
  donorHeroDetail: { color: '#E8FFF0', fontSize: 12, marginTop: 2 },
  donorSectionHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: spacing.md, marginTop: spacing.xl, marginBottom: spacing.md },
  sectionTitleNoMargin: { color: colors.textPrimary, fontSize: 18, fontWeight: '800' },
  donorSectionSubtitle: { color: colors.textSecondary, fontSize: 13, lineHeight: 19, marginTop: spacing.xs, maxWidth: 270 },
  recipientCount: { minWidth: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.waveLight },
  recipientCountText: { color: colors.brandRed, fontSize: 14, fontWeight: '800', fontVariant: ['tabular-nums'] },
  compatibilityCard: { borderWidth: 1, borderColor: colors.border, borderRadius: radii.input, padding: spacing.md, backgroundColor: colors.white },
  compatibilityIntro: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  compatibilityIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.waveLight },
  compatibilityTitle: { color: colors.textPrimary, fontSize: 14, fontWeight: '700' },
  bloodChipList: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginTop: spacing.md },
  bloodChip: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, borderWidth: 1, borderColor: '#F7B7BB', borderRadius: 999, paddingHorizontal: 11, paddingVertical: 8, backgroundColor: '#FFF8F8' },
  bloodChipText: { color: colors.brandRed, fontSize: 14, fontWeight: '800' },
  safetyNote: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.xs, borderTopWidth: 1, borderTopColor: colors.border, marginTop: spacing.md, paddingTop: spacing.md },
  safetyNoteText: { flex: 1, color: colors.textSecondary, fontSize: 12, lineHeight: 18 },
  donorActionCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderWidth: 1, borderColor: colors.border, borderRadius: radii.input, padding: spacing.md, backgroundColor: '#F8FAFF' },
  donorActionIcon: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E8F0FF' },
  donorActionCopy: { flex: 1 },
  donorActionTitle: { color: colors.textPrimary, fontSize: 14, fontWeight: '800' },
  donorActionDetail: { color: colors.textSecondary, fontSize: 12, lineHeight: 18, marginTop: 2 },
});
