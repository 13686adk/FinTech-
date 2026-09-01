import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { LogoMark, Wordmark } from '@/components/brand/logo-mark';
import { Button } from '@/components/ui/button';
import { ThemedText } from '@/components/themed-text';
import { AppConfig } from '@/constants/config';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const FEATURES = [
  { icon: 'flash-outline', title: 'Instant top-ups', desc: 'Airtime & data delivered in seconds, 24/7, for MTN, Glo, Airtel & 9mobile.' },
  { icon: 'tv-outline', title: 'Cable & electricity', desc: 'DStv, GOtv, StarTimes and every major DISCO — paid from one wallet.' },
  { icon: 'school-outline', title: 'Exam pins & more', desc: 'WAEC, NECO, JAMB scratch cards plus Bet9ja and sportsbook funding.' },
  { icon: 'shield-checkmark-outline', title: 'Reseller margins', desc: 'Buy at wholesale, sell at your price and keep the difference.' },
] as const;

export default function WelcomeScreen() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <View style={styles.logoRow}>
        <LogoMark size={40} />
        <Wordmark size={22} />
      </View>

      <View style={styles.hero}>
        <LogoMark size={88} />
        <ThemedText variant="h1" style={styles.title}>
          {AppConfig.appName}
        </ThemedText>
        <ThemedText variant="body" color="textSecondary" style={styles.tagline}>
          {AppConfig.tagline}
        </ThemedText>
      </View>

      <View style={styles.features}>
        {FEATURES.map((f) => (
          <View key={f.title} style={[styles.feature, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={[styles.featureIcon, { backgroundColor: theme.primarySoft }]}>
              <Ionicons name={f.icon} size={22} color={theme.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText variant="bodyStrong">{f.title}</ThemedText>
              <ThemedText variant="small" color="textSecondary">
                {f.desc}
              </ThemedText>
            </View>
          </View>
        ))}
      </View>

      <View style={styles.actions}>
        {AppConfig.provider === 'mock' ? (
          <Pressable style={styles.demoBadge} onPress={() => router.push('/register')}>
            <Ionicons name="flask-outline" size={14} color={theme.primary} />
            <ThemedText variant="small" color="primary">
              Demo mode — tap to get started
            </ThemedText>
          </Pressable>
        ) : null}
        <Button label="Create account" onPress={() => router.push('/register')} />
        <Pressable onPress={() => router.push('/login')} hitSlop={8} style={styles.loginLink}>
          <ThemedText variant="caption" color="textSecondary">
            Already have an account?{' '}
            <ThemedText variant="captionStrong" color="primary">
              Sign in
            </ThemedText>
          </ThemedText>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, paddingHorizontal: Spacing.xxl },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingTop: Spacing.md,
  },
  hero: { alignItems: 'center', gap: Spacing.sm, marginTop: Spacing.xxxl * 2 },
  title: { marginTop: Spacing.md },
  tagline: { textAlign: 'center' },
  features: { gap: Spacing.md, marginTop: Spacing.xxxl },
  feature: {
    flexDirection: 'row',
    gap: Spacing.md,
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: { gap: Spacing.md, marginTop: 'auto', marginBottom: Spacing.md },
  demoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  loginLink: { alignItems: 'center', paddingVertical: Spacing.sm },
});