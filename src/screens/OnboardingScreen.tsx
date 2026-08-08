import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthTextInput } from '../components/AuthTextInput';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors, radii, spacing, typography } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { AccountType } from '../types/profile';
import { RootStackParamList } from '../navigation/types';
import { bloodGroups } from '../constants/bloodCompatibility';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

export function OnboardingScreen({ navigation }: Props) {
  const { user, completeProfile } = useAuth();
  const [accountType, setAccountType] = useState<AccountType>('patient');
  const [age, setAge] = useState('');
  const [bloodGroup, setBloodGroup] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [treatingHospital, setTreatingHospital] = useState('');
  const [loading, setLoading] = useState(false);

  const handleComplete = async () => {
    const parsedAge = Number(age);
    const trimmedNumber = phoneNumber.trim();

    if (!Number.isInteger(parsedAge) || parsedAge < 1 || parsedAge > 120) {
      Alert.alert('Check your age', 'Please enter an age between 1 and 120.');
      return;
    }

    if (!bloodGroup) {
      Alert.alert('Select a blood group', 'Please choose your blood group.');
      return;
    }

    if (trimmedNumber.length < 7) {
      Alert.alert('Check your phone number', 'Please enter a valid phone number.');
      return;
    }

    if (accountType === 'patient' && emergencyContact.trim().length < 7) {
      Alert.alert(
        'Emergency contact needed',
        'Please enter a valid emergency contact number.',
      );
      return;
    }

    if (accountType === 'patient' && !treatingHospital.trim()) {
      Alert.alert('Treating hospital needed', 'Please enter your treating hospital.');
      return;
    }

    if (!user) {
      Alert.alert('Session expired', 'Please log in again to finish setting up your profile.');
      return;
    }

    setLoading(true);
    try {
      await completeProfile({
        uid: user.uid,
        accountType,
        age: parsedAge,
        bloodGroup,
        phoneNumber: trimmedNumber,
        ...(accountType === 'patient'
          ? {
              emergencyContact: emergencyContact.trim(),
              treatingHospital: treatingHospital.trim(),
            }
          : { isAvailable: false }),
        completedAt: new Date().toISOString(),
      });
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } catch {
      Alert.alert('Could not save your details', 'Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.headingRow}>
            <View style={styles.iconCircle}>
              <Ionicons name="heart" size={24} color={colors.brandRed} />
            </View>
            <View style={styles.stepPill}>
              <Text style={styles.stepText}>ONE LAST STEP</Text>
            </View>
          </View>

          <Text style={styles.title}>Tell us about yourself</Text>
          <Text style={styles.subtitle}>
            This helps us tailor ThalCare to the support you need.
          </Text>

          <Text style={styles.sectionLabel}>I&apos;m joining as a</Text>
          <View style={styles.typeRow}>
            <AccountTypeCard
              active={accountType === 'patient'}
              icon="medical-outline"
              title="Patient"
              detail="Manage your care"
              onPress={() => setAccountType('patient')}
            />
            <AccountTypeCard
              active={accountType === 'donor'}
              icon="heart-outline"
              title="Donor"
              detail="Be ready to help"
              onPress={() => setAccountType('donor')}
            />
          </View>

          <View style={styles.form}>
            <AuthTextInput
              label="Age"
              placeholder="Enter your age"
              value={age}
              onChangeText={setAge}
              keyboardType="number-pad"
              maxLength={3}
            />

            <Text style={styles.fieldLabel}>Blood group</Text>
            <View style={styles.bloodGroupGrid}>
              {bloodGroups.map((group) => {
                const selected = bloodGroup === group;
                return (
                  <TouchableOpacity
                    key={group}
                    style={[styles.bloodGroup, selected && styles.bloodGroupSelected]}
                    onPress={() => setBloodGroup(group)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.bloodGroupText,
                        selected && styles.bloodGroupTextSelected,
                      ]}
                    >
                      {group}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <AuthTextInput
              label="Phone number"
              placeholder="e.g. 0300 1234567"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              keyboardType="phone-pad"
              autoComplete="tel"
              maxLength={20}
            />

            {accountType === 'patient' ? (
              <>
                <AuthTextInput
                  label="Emergency contact number"
                  placeholder="e.g. 0300 1234567"
                  value={emergencyContact}
                  onChangeText={setEmergencyContact}
                  keyboardType="phone-pad"
                  autoComplete="tel"
                  maxLength={20}
                />
                <AuthTextInput
                  label="Treating hospital"
                  placeholder="Hospital or clinic name"
                  value={treatingHospital}
                  onChangeText={setTreatingHospital}
                  autoCapitalize="words"
                  autoComplete="off"
                />
              </>
            ) : null}

            <PrimaryButton
              title={accountType === 'patient' ? 'Open my dashboard' : 'Complete profile'}
              onPress={handleComplete}
              loading={loading}
              style={styles.completeButton}
            />
          </View>

          <Text style={styles.privacyNote}>
            Your details stay private and are used only to personalize your experience.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function AccountTypeCard({
  active,
  icon,
  title,
  detail,
  onPress,
}: {
  active: boolean;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  detail: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.typeCard, active && styles.typeCardActive]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={[styles.typeIcon, active && styles.typeIconActive]}>
        <Ionicons name={icon} size={23} color={active ? colors.white : colors.brandRed} />
      </View>
      <Text style={styles.typeTitle}>{title}</Text>
      <Text style={styles.typeDetail}>{detail}</Text>
      {active ? <Ionicons name="checkmark-circle" size={19} color={colors.brandRed} /> : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.white },
  flex: { flex: 1 },
  content: { padding: spacing.lg, paddingBottom: spacing.xxl, gap: spacing.md },
  headingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  iconCircle: { width: 46, height: 46, borderRadius: 23, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.waveLight },
  stepPill: { backgroundColor: colors.waveLight, borderRadius: 999, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs },
  stepText: { color: colors.brandRed, fontSize: 10, fontWeight: '800', letterSpacing: 0.8 },
  title: { ...typography.title, fontSize: 27, marginTop: spacing.sm },
  subtitle: { ...typography.subtitle, lineHeight: 22 },
  sectionLabel: { color: colors.textPrimary, fontSize: 15, fontWeight: '700', marginTop: spacing.sm },
  typeRow: { flexDirection: 'row', gap: spacing.sm },
  typeCard: { flex: 1, borderWidth: 1.5, borderColor: colors.border, borderRadius: radii.input, padding: spacing.md, gap: spacing.xs, backgroundColor: colors.white },
  typeCardActive: { borderColor: colors.brandRed, backgroundColor: '#FFF8F8' },
  typeIcon: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.waveLight, marginBottom: spacing.xs },
  typeIconActive: { backgroundColor: colors.brandRed },
  typeTitle: { color: colors.textPrimary, fontSize: 16, fontWeight: '800' },
  typeDetail: { color: colors.textSecondary, fontSize: 12, minHeight: 28 },
  form: { marginTop: spacing.sm },
  fieldLabel: { color: colors.textPrimary, fontSize: 14, fontWeight: '600', marginBottom: spacing.sm },
  bloodGroupGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  bloodGroup: { width: '23%', minWidth: 64, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingVertical: 11 },
  bloodGroupSelected: { backgroundColor: colors.brandRed, borderColor: colors.brandRed },
  bloodGroupText: { color: colors.textPrimary, fontSize: 14, fontWeight: '700' },
  bloodGroupTextSelected: { color: colors.white },
  completeButton: { marginTop: spacing.sm },
  privacyNote: { color: colors.textMuted, fontSize: 12, lineHeight: 18, textAlign: 'center', marginTop: spacing.sm },
});
