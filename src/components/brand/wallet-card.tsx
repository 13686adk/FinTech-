import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatNaira } from '@/lib/format';

export function WalletCard({
  balance,
  masked = false,
  onToggleMask,
  onFund,
  referralCode,
  loading,
}: {
  balance: number;
  masked?: boolean;
  onToggleMask?: () => void;
  onFund?: () => void;
  referralCode?: string;
  loading?: boolean;
}) {
  const theme = useTheme();
  const display = masked ? '••••••' : formatNaira(balance, { decimals: balance % 1 === 0 });

  return (
    <LinearGradient
      colors={[...theme.cardGradient]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}>
      <View style={styles.topRow}>
        <ThemedText variant="captionStrong" style={styles.label}>
          Wallet Balance
        </ThemedText>
        <Pressable onPress={onToggleMask} hitSlop={10}>
          <Ionicons
            name={masked ? 'eye-off-outline' : 'eye-outline'}
            size={20}
            color="rgba(255,255,255,0.9)"
          />
        </Pressable>
      </View>
      <ThemedText
        variant="h1"
        adjustsFontSizeToFit
        numberOfLines={1}
        style={styles.balanceText}>
        {loading ? '…' : display}
      </ThemedText>
      <View style={styles.bottomRow}>
        {referralCode ? (
          <View style={styles.referral}>
            <Ionicons name="gift-outline" size={14} color="rgba(255,255,255,0.9)" />
            <ThemedText style={styles.referralText}>REF {referralCode}</ThemedText>
          </View>
        ) : (
          <View />
        )}
        {onFund ? (
          <Pressable onPress={onFund} style={styles.fundBtn}>
            <Ionicons name="add" size={16} color={theme.primary} />
            <ThemedText style={styles.fundLabel}>Fund</ThemedText>
          </Pressable>
        ) : null}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.xxl,
    padding: Spacing.xxl,
    gap: Spacing.sm,
    overflow: 'hidden',
    shadowColor: '#06351F',
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: { color: 'rgba(255,255,255,0.85)' },
  balanceText: { color: '#fff', marginTop: Spacing.xs },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
  },
  referral: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  referralText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  fundBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
  },
  fundLabel: { color: '#0B8A5C', fontWeight: '800', fontSize: 13 },
});