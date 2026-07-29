import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { ThalCareLogo } from '../components/ThalCareLogo';
import { WaveFooter } from '../components/WaveFooter';
import { colors, spacing } from '../constants/theme';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Splash'>;

export function SplashScreen({ navigation }: Props) {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Login');
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <ThalCareLogo size={130} />
        <Text style={styles.title}>ThalCare</Text>
        <Text style={styles.tagline}>Your companion for thalassemia care</Text>
        <Ionicons
          name="heart"
          size={18}
          color={colors.brandRed}
          style={styles.heart}
        />
      </View>
      <WaveFooter />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  title: {
    fontSize: 36,
    fontWeight: '800',
    color: colors.brandRed,
    marginTop: spacing.lg,
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 15,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  heart: {
    marginTop: spacing.xl,
  },
});
