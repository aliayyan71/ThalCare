import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThalCareLogo } from '../components/ThalCareLogo';
import { colors, radii, spacing } from '../constants/theme';
import { useAuth } from '../context/AuthContext';
import { RootStackParamList } from '../navigation/types';
import {
  cancelDonationRequest,
  getDonationResponses,
  getApprovedDonorContact,
  getDonorDonationResponse,
  getPatientDonationRequests,
  respondToDonationRequest,
  subscribeToDonationResponses,
  subscribeToDonorDonationRequests,
  subscribeToPatientDonationRequests,
} from '../services/donationService';
import { logout } from '../services/authService';
import { findCompatibleDonors, setDonorAvailability } from '../services/profileService';
import { DonationRequest, DonationResponse, DonorResponseStatus } from '../types/donation';
import { UserProfile } from '../types/profile';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;
type DonorRequestItem = DonationRequest & { response: DonorResponseStatus | null };

export function HomeScreen({ navigation }: Props) {
  const { user, profile } = useAuth();
  const firstName = user?.displayName?.split(' ')[0] ?? 'there';

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      Alert.alert('Could not log out', 'Please try again.');
    }
  };

  if (!profile || !user) return null;

  return profile.accountType === 'donor'
    ? <DonorDashboard firstName={firstName} profile={profile} onLogout={handleLogout} />
    : <PatientDashboard firstName={firstName} profile={profile} navigation={navigation} onLogout={handleLogout} />;
}

function PatientDashboard({
  firstName,
  profile,
  navigation,
  onLogout,
}: {
  firstName: string;
  profile: UserProfile;
  navigation: Props['navigation'];
  onLogout: () => Promise<void>;
}) {
  const [donors, setDonors] = useState<{ uid: string; bloodGroup: string; isAvailable: boolean }[]>([]);
  const [requests, setRequests] = useState<DonationRequest[]>([]);
  const [responses, setResponses] = useState<Record<string, DonationResponse[]>>({});
  const [approvedContacts, setApprovedContacts] = useState<Record<string, string>>({});
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [loadError, setLoadError] = useState(false);

  const refresh = useCallback(async () => {
    setLoadingMatches(true);
    setLoadError(false);
    try {
      const [compatibleDonors, patientRequests] = await Promise.all([
        findCompatibleDonors(profile.bloodGroup),
        getPatientDonationRequests(profile.uid),
      ]);
      const responseEntries = await Promise.all(
        patientRequests.map(async (request) => [request.id, await getDonationResponses(request.id)] as const),
      );
      const contactEntries = await Promise.all(
        responseEntries
          .flatMap(([, requestResponses]) => requestResponses)
          .filter((response) => response.response === 'accepted')
          .map(async (response) => {
            try {
              const contact = await getApprovedDonorContact(profile.uid, response.donorId);
              return contact ? [contact.donorId, contact.phoneNumber] as const : null;
            } catch {
              return null;
            }
          }),
      );
      setDonors(compatibleDonors);
      setRequests(patientRequests);
      setResponses(Object.fromEntries(responseEntries));
      setApprovedContacts(Object.fromEntries(contactEntries.filter((entry): entry is readonly [string, string] => entry !== null)));
    } catch {
      setLoadError(true);
    } finally {
      setLoadingMatches(false);
    }
  }, [profile.bloodGroup, profile.uid]);

  useEffect(() => navigation.addListener('focus', () => { void refresh(); }), [navigation, refresh]);

  useEffect(() => subscribeToPatientDonationRequests(
    profile.uid,
    (patientRequests) => {
      setRequests(patientRequests);
      setLoadError(false);
      setLoadingMatches(false);
    },
    () => {
      setLoadError(true);
      setLoadingMatches(false);
    },
  ), [profile.uid]);

  useEffect(() => {
    const unsubscribers = requests.map((request) => subscribeToDonationResponses(
      request.id,
      (requestResponses) => {
        setResponses((current) => ({ ...current, [request.id]: requestResponses }));
        void Promise.all(
          requestResponses
            .filter((response) => response.response === 'accepted')
            .map(async (response) => {
              try {
                return await getApprovedDonorContact(profile.uid, response.donorId);
              } catch {
                return null;
              }
            }),
        ).then((contacts) => {
          setApprovedContacts((current) => ({
            ...current,
            ...Object.fromEntries(contacts.flatMap((contact) => contact ? [[contact.donorId, contact.phoneNumber]] : [])),
          }));
        });
      },
      () => setLoadError(true),
    ));
    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, [profile.uid, requests]);

  const handleCancel = (request: DonationRequest) => {
    Alert.alert('Cancel blood request?', 'Compatible donors will no longer be able to see this request.', [
      { text: 'Keep request', style: 'cancel' },
      {
        text: 'Cancel request',
        style: 'destructive',
        onPress: () => {
          void cancelDonationRequest(request.id)
            .then(refresh)
            .catch(() => Alert.alert('Could not cancel request', 'Please try again.'));
        },
      },
    ]);
  };

  const availableDonors = donors.filter((donor) => donor.isAvailable);
  const openRequests = requests.filter((request) => request.status === 'open');

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Header onLogout={onLogout} />
        <Text style={styles.eyebrow}>PATIENT DASHBOARD</Text>
        <Text style={styles.greeting}>Good to see you, {firstName}.</Text>
        <Text style={styles.intro}>Here&apos;s your care overview for today.</Text>

        <View style={styles.statusCard}>
          <View style={styles.statusIcon}><Ionicons name="heart" size={25} color={colors.white} /></View>
          <View style={styles.statusContent}>
            <Text style={styles.statusLabel}>YOUR BLOOD GROUP</Text>
            <Text style={styles.statusValue} selectable>{profile.bloodGroup}</Text>
            <Text style={styles.statusDetail}>Keep your emergency details up to date.</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.requestCard} onPress={() => navigation.navigate('RequestDonation')} activeOpacity={0.85}>
          <View style={styles.requestIcon}><Ionicons name="water-outline" size={24} color={colors.white} /></View>
          <View style={styles.requestCopy}><Text style={styles.requestTitle}>Need blood?</Text><Text style={styles.requestSubtitle}>Send a private request to compatible donors</Text></View>
          <Ionicons name="chevron-forward" size={22} color={colors.white} />
        </TouchableOpacity>

        <SectionTitle title="Compatible donors" />
        {loadingMatches ? <LoadingCard /> : loadError ? <ErrorCard onRetry={refresh} /> : (
          <View style={styles.matchList}>
            <View style={styles.matchSummary}><View style={styles.matchSummaryIcon}><Ionicons name="people-outline" size={20} color={colors.brandRed} /></View><View style={styles.flex}><Text style={styles.matchSummaryTitle}>{availableDonors.length} available compatible donor{availableDonors.length === 1 ? '' : 's'}</Text><Text style={styles.matchSummaryDetail}>Phone numbers appear only after a donor accepts your request.</Text></View></View>
            {availableDonors.slice(0, 4).map((donor) => <View style={styles.anonymousRow} key={donor.uid}><View style={styles.anonymousIcon}><Ionicons name="heart" size={15} color="#1F9D55" /></View><Text style={styles.anonymousTitle}>Available donor</Text><BloodBadge bloodGroup={donor.bloodGroup} /></View>)}
            {availableDonors.length === 0 ? <Text style={styles.emptyText}>No compatible donors are available right now. You can still send a request.</Text> : null}
          </View>
        )}

        <SectionTitle title="Your blood requests" />
        {openRequests.length === 0 ? <View style={styles.emptyCard}><Ionicons name="paper-plane-outline" size={23} color={colors.textMuted} /><Text style={styles.emptyText}>You have no open blood requests.</Text></View> : openRequests.map((request) => {
          const requestResponses = responses[request.id] ?? [];
          const accepted = requestResponses.filter((response) => response.response === 'accepted').length;
          const phoneNumbers = requestResponses
            .filter((response) => response.response === 'accepted')
            .map((response) => approvedContacts[response.donorId])
            .filter((phoneNumber): phoneNumber is string => Boolean(phoneNumber));
          return <View style={styles.patientRequestCard} key={request.id}><View style={styles.patientRequestTop}><View><Text style={styles.patientRequestTitle}>{request.requestedBloodGroup} blood request</Text><Text style={styles.patientRequestDetail}>{accepted > 0 ? `${accepted} donor${accepted === 1 ? '' : 's'} accepted` : 'Waiting for compatible donors to respond'}</Text></View><BloodBadge bloodGroup={request.requestedBloodGroup} /></View>{phoneNumbers.map((phoneNumber, index) => <View style={styles.anonymousRow} key={`${request.id}-${phoneNumber}`}><View style={styles.anonymousIcon}><Ionicons name="call-outline" size={15} color="#1F9D55" /></View><Text style={styles.anonymousTitle}>Accepted donor {index + 1}</Text><Text style={styles.contactNumber} selectable>{phoneNumber}</Text></View>)}<TouchableOpacity onPress={() => handleCancel(request)}><Text style={styles.cancelText}>Cancel request</Text></TouchableOpacity></View>;
        })}

        <SectionTitle title="Care at a glance" />
        <View style={styles.metricRow}><MetricCard icon="calendar-outline" label="Next transfusion" value="Not scheduled" tone="red" /><MetricCard icon="medkit-outline" label="Treating hospital" value={profile.treatingHospital ?? 'Not added'} tone="blue" /></View>
      </ScrollView>
      <BottomBar />
    </SafeAreaView>
  );
}

function DonorDashboard({ firstName, profile, onLogout }: { firstName: string; profile: UserProfile; onLogout: () => Promise<void> }) {
  const [isAvailable, setIsAvailable] = useState(profile.isAvailable ?? false);
  const [requests, setRequests] = useState<DonorRequestItem[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [updatingAvailability, setUpdatingAvailability] = useState(false);
  const [respondingId, setRespondingId] = useState<string | null>(null);

  useEffect(() => {
    if (!isAvailable) {
      setRequests([]);
      setLoadingRequests(false);
      return;
    }

    let active = true;
    setLoadingRequests(true);
    const unsubscribe = subscribeToDonorDonationRequests(
      profile.bloodGroup,
      (compatibleRequests) => {
        void Promise.all(compatibleRequests.map(async (request) => ({
          ...request,
          response: (await getDonorDonationResponse(request.id, profile.uid))?.response ?? null,
        }))).then((items) => {
          if (!active) return;
          setRequests(items);
          setLoadingRequests(false);
        }).catch(() => {
          if (!active) return;
          setRequests([]);
          setLoadingRequests(false);
        });
      },
      () => {
        if (!active) return;
        setRequests([]);
        setLoadingRequests(false);
      },
    );
    return () => {
      active = false;
      unsubscribe();
    };
  }, [isAvailable, profile.bloodGroup, profile.uid]);

  const handleAvailability = async (nextValue: boolean) => {
    setUpdatingAvailability(true);
    try {
      await setDonorAvailability(profile.uid, nextValue);
      setIsAvailable(nextValue);
      if (!nextValue) setRequests([]);
    } catch {
      Alert.alert('Could not update availability', 'Please try again.');
    } finally {
      setUpdatingAvailability(false);
    }
  };

  const handleResponse = async (requestId: string, response: DonorResponseStatus) => {
    setRespondingId(requestId);
    try {
      await respondToDonationRequest(requestId, profile.uid, response);
      setRequests((items) => items.map((item) => item.id === requestId ? { ...item, response } : item));
    } catch {
      Alert.alert('Could not send response', 'Please try again.');
    } finally {
      setRespondingId(null);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Header onLogout={onLogout} />
        <Text style={styles.eyebrow}>DONOR DASHBOARD</Text>
        <Text style={styles.greeting}>Hello, {firstName}.</Text>
        <Text style={styles.intro}>Your willingness to donate can make a real difference to someone&apos;s care.</Text>

        <View style={styles.donorHeroCard}><View style={styles.donorHeroIcon}><Ionicons name="heart" size={25} color={colors.white} /></View><View style={styles.donorHeroCopy}><Text style={styles.donorHeroLabel}>YOUR DONOR TYPE</Text><Text style={styles.donorHeroBlood} selectable>{profile.bloodGroup}</Text><Text style={styles.donorHeroDetail}>Registered donor profile</Text></View><Ionicons name="checkmark-circle" size={24} color="#DDFBE5" /></View>

        <SectionTitle title="Donation availability" />
        <View style={styles.availabilityCard}><View style={[styles.availabilityIcon, isAvailable && styles.availabilityIconActive]}><Ionicons name={isAvailable ? 'checkmark-circle' : 'pause-circle-outline'} size={24} color={isAvailable ? '#1F9D55' : colors.textSecondary} /></View><View style={styles.flex}><Text style={styles.availabilityTitle}>{isAvailable ? 'Available for matching requests' : 'Not available for requests'}</Text><Text style={styles.availabilityDetail}>{isAvailable ? 'Compatible patient requests can appear below.' : 'Turn this on when you are ready to receive requests.'}</Text></View>{updatingAvailability ? <ActivityIndicator color={colors.brandRed} /> : <Switch value={isAvailable} onValueChange={handleAvailability} trackColor={{ false: '#D1D5DB', true: '#A7E8BB' }} thumbColor={isAvailable ? '#1F9D55' : '#F4F4F5'} />}</View>

        <SectionTitle title="Compatible patient requests" />
        {!isAvailable ? <View style={styles.emptyCard}><Ionicons name="toggle-outline" size={23} color={colors.textMuted} /><Text style={styles.emptyText}>Become available to see compatible patient requests.</Text></View> : loadingRequests ? <LoadingCard /> : requests.length === 0 ? <View style={styles.emptyCard}><Ionicons name="heart-outline" size={23} color={colors.textMuted} /><Text style={styles.emptyText}>No compatible patient requests right now.</Text></View> : requests.map((request) => <DonorRequestCard key={request.id} request={request} responding={respondingId === request.id} onRespond={handleResponse} />)}

        <View style={styles.safetyCard}><Ionicons name="shield-checkmark-outline" size={21} color="#2563EB" /><Text style={styles.safetyText}>Requests show only the blood group needed. Patient phone numbers and personal details remain private.</Text></View>
      </ScrollView>
      <BottomBar />
    </SafeAreaView>
  );
}

function Header({ onLogout }: { onLogout: () => Promise<void> }) { return <View style={styles.header}><View style={styles.logoRow}><ThalCareLogo size={39} /><Text style={styles.logoText}>ThalCare</Text></View><TouchableOpacity onPress={() => void onLogout()} style={styles.headerAction} accessibilityLabel="Log out"><Ionicons name="log-out-outline" size={23} color={colors.textSecondary} /></TouchableOpacity></View>; }
function BottomBar() { return <View style={styles.tabBar}><View style={styles.tabItem}><Ionicons name="home" size={21} color={colors.brandRed} /><Text style={styles.tabLabelActive}>Home</Text></View></View>; }
function SectionTitle({ title }: { title: string }) { return <Text style={styles.sectionTitle}>{title}</Text>; }
function BloodBadge({ bloodGroup }: { bloodGroup: string }) { return <View style={styles.bloodBadge}><Text style={styles.bloodBadgeText} selectable>{bloodGroup}</Text></View>; }
function LoadingCard() { return <View style={styles.emptyCard}><ActivityIndicator color={colors.brandRed} /><Text style={styles.emptyText}>Loading matches…</Text></View>; }
function ErrorCard({ onRetry }: { onRetry: () => Promise<void> }) { return <TouchableOpacity style={styles.emptyCard} onPress={() => void onRetry()}><Ionicons name="refresh-outline" size={23} color={colors.brandRed} /><Text style={styles.emptyText}>Couldn&apos;t load matches. Tap to retry.</Text></TouchableOpacity>; }
function MetricCard({ icon, label, value, tone }: { icon: keyof typeof Ionicons.glyphMap; label: string; value: string; tone: 'red' | 'blue' }) { return <View style={styles.metricCard}><View style={[styles.metricIcon, tone === 'blue' && styles.metricIconBlue]}><Ionicons name={icon} size={20} color={tone === 'blue' ? '#2563EB' : colors.brandRed} /></View><Text style={styles.metricLabel}>{label}</Text><Text style={styles.metricValue} numberOfLines={2}>{value}</Text></View>; }
function DonorRequestCard({ request, responding, onRespond }: { request: DonorRequestItem; responding: boolean; onRespond: (requestId: string, response: DonorResponseStatus) => Promise<void> }) { return <View style={styles.donorRequestCard}><View style={styles.donorRequestTop}><View style={styles.flex}><Text style={styles.donorRequestTitle}>Patient needs {request.requestedBloodGroup} blood</Text><Text style={styles.donorRequestDetail}>This request is compatible with your donor type.</Text></View><BloodBadge bloodGroup={request.requestedBloodGroup} /></View>{request.response ? <View style={[styles.responsePill, request.response === 'accepted' && styles.responsePillAccepted]}><Ionicons name={request.response === 'accepted' ? 'checkmark-circle' : 'close-circle'} size={16} color={request.response === 'accepted' ? '#1F9D55' : colors.textSecondary} /><Text style={request.response === 'accepted' ? styles.responseTextAccepted : styles.responseText}>{request.response === 'accepted' ? 'You accepted this request' : 'You declined this request'}</Text></View> : <View style={styles.responseActions}>{responding ? <ActivityIndicator color={colors.brandRed} /> : <><TouchableOpacity style={styles.declineButton} onPress={() => void onRespond(request.id, 'declined')}><Text style={styles.declineText}>Decline</Text></TouchableOpacity><TouchableOpacity style={styles.acceptButton} onPress={() => void onRespond(request.id, 'accepted')}><Text style={styles.acceptText}>Accept request</Text></TouchableOpacity></>}</View>}</View>; }

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.white }, content: { paddingHorizontal: spacing.lg, paddingBottom: 104 }, flex: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: spacing.sm, paddingBottom: spacing.lg }, logoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm }, logoText: { color: colors.brandRed, fontSize: 20, fontWeight: '800' }, headerAction: { padding: spacing.sm }, eyebrow: { color: colors.brandRed, fontSize: 11, fontWeight: '800', letterSpacing: 1.1, marginTop: spacing.sm, marginBottom: spacing.sm }, greeting: { color: colors.textPrimary, fontSize: 26, fontWeight: '800', letterSpacing: -0.3 }, intro: { color: colors.textSecondary, fontSize: 15, lineHeight: 22, marginTop: spacing.xs, marginBottom: spacing.lg },
  statusCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.brandRed, borderRadius: 18, padding: spacing.lg, gap: spacing.md, boxShadow: '0 8px 16px rgba(229, 30, 37, 0.16)' }, statusIcon: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.22)' }, statusContent: { flex: 1 }, statusLabel: { color: '#FFE3E5', fontSize: 11, fontWeight: '800', letterSpacing: 0.8 }, statusValue: { color: colors.white, fontSize: 30, fontWeight: '800', marginTop: 1 }, statusDetail: { color: '#FFF1F2', fontSize: 12, marginTop: 2 },
  requestCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: '#C81A20', borderRadius: radii.input, padding: spacing.md, marginTop: spacing.lg }, requestIcon: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.18)' }, requestCopy: { flex: 1 }, requestTitle: { color: colors.white, fontSize: 16, fontWeight: '800' }, requestSubtitle: { color: '#FFE8E9', fontSize: 12, marginTop: 2 },
  sectionTitle: { color: colors.textPrimary, fontSize: 18, fontWeight: '800', marginTop: spacing.xl, marginBottom: spacing.md }, matchList: { borderWidth: 1, borderColor: colors.border, borderRadius: radii.input, overflow: 'hidden' }, matchSummary: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md, backgroundColor: '#FFF8F8' }, matchSummaryIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.waveLight }, matchSummaryTitle: { color: colors.textPrimary, fontSize: 14, fontWeight: '800' }, matchSummaryDetail: { color: colors.textSecondary, fontSize: 12, marginTop: 2 }, anonymousRow: { minHeight: 55, flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, borderTopWidth: 1, borderTopColor: colors.border, gap: spacing.sm }, anonymousIcon: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E9F9EE' }, anonymousTitle: { flex: 1, color: colors.textPrimary, fontSize: 13, fontWeight: '700' }, contactNumber: { color: '#1F9D55', fontSize: 13, fontWeight: '800' }, bloodBadge: { borderRadius: 999, backgroundColor: colors.waveLight, paddingHorizontal: 10, paddingVertical: 5 }, bloodBadgeText: { color: colors.brandRed, fontSize: 13, fontWeight: '800' },
  emptyCard: { minHeight: 70, alignItems: 'center', justifyContent: 'center', gap: spacing.sm, borderWidth: 1, borderColor: colors.border, borderRadius: radii.input, padding: spacing.md }, emptyText: { color: colors.textSecondary, fontSize: 13, lineHeight: 19, textAlign: 'center' }, patientRequestCard: { borderWidth: 1, borderColor: colors.border, borderRadius: radii.input, padding: spacing.md, gap: spacing.md }, patientRequestTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md }, patientRequestTitle: { color: colors.textPrimary, fontSize: 15, fontWeight: '800' }, patientRequestDetail: { color: colors.textSecondary, fontSize: 12, marginTop: 3 }, cancelText: { color: colors.error, fontSize: 13, fontWeight: '700' },
  metricRow: { flexDirection: 'row', gap: spacing.sm }, metricCard: { flex: 1, minHeight: 142, borderWidth: 1, borderColor: colors.border, borderRadius: radii.input, padding: spacing.md }, metricIcon: { width: 37, height: 37, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.waveLight, marginBottom: spacing.md }, metricIconBlue: { backgroundColor: '#E8F0FF' }, metricLabel: { color: colors.textMuted, fontSize: 10, fontWeight: '700', textTransform: 'uppercase' }, metricValue: { color: colors.textPrimary, fontSize: 14, fontWeight: '800', marginTop: spacing.xs, lineHeight: 19 },
  donorHeroCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1F9D55', borderRadius: 18, padding: spacing.lg, gap: spacing.md, boxShadow: '0 8px 16px rgba(31, 157, 85, 0.16)' }, donorHeroIcon: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.2)' }, donorHeroCopy: { flex: 1 }, donorHeroLabel: { color: '#DDFBE5', fontSize: 11, fontWeight: '800', letterSpacing: 0.8 }, donorHeroBlood: { color: colors.white, fontSize: 30, fontWeight: '800', marginTop: 1 }, donorHeroDetail: { color: '#E8FFF0', fontSize: 12, marginTop: 2 }, availabilityCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderWidth: 1, borderColor: colors.border, borderRadius: radii.input, padding: spacing.md }, availabilityIcon: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F3F4F6' }, availabilityIconActive: { backgroundColor: '#E9F9EE' }, availabilityTitle: { color: colors.textPrimary, fontSize: 14, fontWeight: '800' }, availabilityDetail: { color: colors.textSecondary, fontSize: 12, marginTop: 2, lineHeight: 17 },
  donorRequestCard: { borderWidth: 1, borderColor: colors.border, borderRadius: radii.input, padding: spacing.md, marginBottom: spacing.sm, gap: spacing.md }, donorRequestTop: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm }, donorRequestTitle: { color: colors.textPrimary, fontSize: 15, fontWeight: '800' }, donorRequestDetail: { color: colors.textSecondary, fontSize: 12, marginTop: 3 }, responseActions: { flexDirection: 'row', gap: spacing.sm }, declineButton: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 11, borderWidth: 1, borderColor: colors.border, borderRadius: 10 }, declineText: { color: colors.textSecondary, fontSize: 13, fontWeight: '700' }, acceptButton: { flex: 1.4, alignItems: 'center', justifyContent: 'center', paddingVertical: 11, backgroundColor: '#1F9D55', borderRadius: 10 }, acceptText: { color: colors.white, fontSize: 13, fontWeight: '800' }, responsePill: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: spacing.xs, backgroundColor: '#F3F4F6', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 }, responsePillAccepted: { backgroundColor: '#E9F9EE' }, responseText: { color: colors.textSecondary, fontSize: 12, fontWeight: '700' }, responseTextAccepted: { color: '#14753D', fontSize: 12, fontWeight: '700' },
  safetyCard: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start', backgroundColor: '#F2F6FF', borderRadius: radii.input, padding: spacing.md, marginTop: spacing.xl }, safetyText: { flex: 1, color: '#244A89', fontSize: 13, lineHeight: 19 }, tabBar: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: colors.border, paddingVertical: spacing.sm, paddingHorizontal: spacing.sm, backgroundColor: colors.white }, tabItem: { flex: 1, alignItems: 'center', gap: 3 }, tabLabelActive: { color: colors.brandRed, fontSize: 10, fontWeight: '700' },
});
