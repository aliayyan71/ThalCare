import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PrimaryButton } from '../components/PrimaryButton';
import { bloodGroups } from '../constants/bloodCompatibility';
import { colors, radii, spacing } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from '../navigation/types';
import {
  createDonationRequest,
  DonationRequestAlreadyOpenError,
  getOpenDonationRequest,
} from '../services/donationService';
import { findCompatibleDonors } from '../services/profileService';

type Props = NativeStackScreenProps<RootStackParamList, 'RequestDonation'>;

export function RequestDonationScreen({ navigation }: Props) {
  const { profile, user } = useAuth();
  const [bloodGroup, setBloodGroup] = useState(profile?.bloodGroup ?? '');
  const [availableDonorCount, setAvailableDonorCount] = useState<number | null>(null);
  const [checkingMatches, setCheckingMatches] = useState(false);
  const [hasOpenRequest, setHasOpenRequest] = useState(false);
  const [checkingOpenRequest, setCheckingOpenRequest] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!bloodGroup) return;
    let active = true;
    setCheckingMatches(true);
    setAvailableDonorCount(null);
    void findCompatibleDonors(bloodGroup)
      .then((donors) => active && setAvailableDonorCount(donors.filter((donor) => donor.isAvailable).length))
      .catch(() => active && setAvailableDonorCount(null))
      .finally(() => active && setCheckingMatches(false));
    return () => { active = false; };
  }, [bloodGroup]);

  useEffect(() => {
    if (!user || profile?.accountType !== 'patient' || !bloodGroup) {
      setHasOpenRequest(false);
      return;
    }

    let active = true;
    setCheckingOpenRequest(true);
    void getOpenDonationRequest(user.uid, bloodGroup)
      .then((request) => active && setHasOpenRequest(request !== null))
      .catch(() => active && setHasOpenRequest(false))
      .finally(() => active && setCheckingOpenRequest(false));
    return () => { active = false; };
  }, [bloodGroup, profile?.accountType, user]);

  const handleSubmit = async () => {
    if (!user || profile?.accountType !== 'patient') {
      Alert.alert('Patient account required', 'Only patient accounts can create a donation request.');
      return;
    }
    if (!bloodGroup) {
      Alert.alert('Select a blood group', 'Choose the blood group needed for this request.');
      return;
    }
    if (hasOpenRequest) {
      Alert.alert('Request already open', `You already have an open ${bloodGroup} blood request. Cancel it from your dashboard before sending another one.`);
      return;
    }

    setSubmitting(true);
    try {
      const result = await createDonationRequest(user.uid, bloodGroup);
      Alert.alert(
        'Request sent',
        result.availableDonorCount > 0
          ? `Your request was shared with compatible available donors. ${result.availableDonorCount} matching donor${result.availableDonorCount === 1 ? '' : 's'} can see it.`
          : 'Your request is open. It will appear to compatible donors when they make themselves available.',
        [{ text: 'Done', onPress: () => navigation.goBack() }],
      );
    } catch (error) {
      if (error instanceof DonationRequestAlreadyOpenError) {
        setHasOpenRequest(true);
        Alert.alert('Request already open', `You already have an open ${bloodGroup} blood request.`);
      } else {
        Alert.alert('Could not send request', 'Please check your connection and try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton} accessibilityLabel="Go back"><Ionicons name="chevron-back" size={24} color={colors.textPrimary} /></TouchableOpacity>
          <Text style={styles.headerTitle}>Request blood</Text>
          <View style={styles.backButton} />
        </View>
        <View style={styles.heroIcon}><Ionicons name="heart" size={28} color={colors.white} /></View>
        <Text style={styles.title}>Find compatible donors</Text>
        <Text style={styles.subtitle}>Choose the blood group needed. Compatible donors can respond without seeing your personal contact details.</Text>
        <Text style={styles.fieldLabel}>Blood group needed</Text>
        <View style={styles.bloodGroupGrid}>
          {bloodGroups.map((group) => {
            const selected = group === bloodGroup;
            return <TouchableOpacity key={group} style={[styles.bloodGroup, selected && styles.bloodGroupSelected]} onPress={() => setBloodGroup(group)} activeOpacity={0.8}><Text style={[styles.bloodGroupText, selected && styles.bloodGroupTextSelected]}>{group}</Text></TouchableOpacity>;
          })}
        </View>
        <View style={styles.matchCard}>
          <View style={styles.matchIcon}><Ionicons name="people-outline" size={22} color={colors.brandRed} /></View>
          <View style={styles.matchCopy}>
            <Text style={styles.matchTitle}>Compatible donors</Text>
            {checkingMatches ? <ActivityIndicator size="small" color={colors.brandRed} /> : <Text style={styles.matchDetail}>{availableDonorCount === null ? 'We will check for compatible donors when you send the request.' : `${availableDonorCount} available compatible donor${availableDonorCount === 1 ? '' : 's'} right now`}</Text>}
          </View>
        </View>
        <View style={styles.privacyCard}><Ionicons name="shield-checkmark-outline" size={21} color="#2563EB" /><Text style={styles.privacyText}>Your phone number and hospital details stay private. This request only shares the blood group needed.</Text></View>
        {hasOpenRequest ? <View style={styles.openRequestNotice}><Ionicons name="information-circle-outline" size={20} color="#A61B20" /><Text style={styles.openRequestNoticeText}>You already have an open request for {bloodGroup}. Cancel it from Home before requesting the same group again.</Text></View> : null}
        <PrimaryButton title={hasOpenRequest ? "Request already open" : "Send donation request"} onPress={handleSubmit} loading={submitting} disabled={hasOpenRequest || checkingOpenRequest} style={styles.submitButton} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.white }, content: { padding: spacing.lg, paddingBottom: spacing.xxl },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xl }, backButton: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }, headerTitle: { color: colors.textPrimary, fontSize: 17, fontWeight: '800' },
  heroIcon: { width: 58, height: 58, borderRadius: 29, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.brandRed, marginBottom: spacing.lg }, title: { color: colors.textPrimary, fontSize: 27, fontWeight: '800' }, subtitle: { color: colors.textSecondary, fontSize: 15, lineHeight: 22, marginTop: spacing.sm, marginBottom: spacing.xl }, fieldLabel: { color: colors.textPrimary, fontSize: 15, fontWeight: '700', marginBottom: spacing.sm },
  bloodGroupGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }, bloodGroup: { width: '23%', minWidth: 64, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: 10, paddingVertical: 11 }, bloodGroupSelected: { backgroundColor: colors.brandRed, borderColor: colors.brandRed }, bloodGroupText: { color: colors.textPrimary, fontSize: 14, fontWeight: '700' }, bloodGroupTextSelected: { color: colors.white },
  matchCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderWidth: 1, borderColor: '#F7B7BB', borderRadius: radii.input, backgroundColor: '#FFF8F8', padding: spacing.md, marginTop: spacing.xl }, matchIcon: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.waveLight }, matchCopy: { flex: 1 }, matchTitle: { color: colors.textPrimary, fontSize: 14, fontWeight: '800' }, matchDetail: { color: colors.textSecondary, fontSize: 13, marginTop: 3 },
  privacyCard: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start', borderRadius: radii.input, backgroundColor: '#F2F6FF', padding: spacing.md, marginTop: spacing.md }, privacyText: { flex: 1, color: '#244A89', fontSize: 13, lineHeight: 19 }, openRequestNotice: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, borderRadius: radii.input, backgroundColor: '#FFF3F3', padding: spacing.md, marginTop: spacing.md }, openRequestNoticeText: { flex: 1, color: '#A61B20', fontSize: 13, lineHeight: 19 }, submitButton: { marginTop: spacing.xl },
});
