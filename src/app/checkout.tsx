import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CategoryIcon, categoryMeta } from '@/components/brand/category-icon';
import { ThemedText } from '@/components/themed-text';
import { PinDots, PinPad } from '@/components/ui/pin-pad';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { usePurchase, useWallet } from '@/hooks/use-vtu';
import { formatNaira } from '@/lib/format';
import type { CheckoutOrder } from '@/features/checkout/types';
import { useApp } from '@/store/app-store';
import { useSession } from '@/store/session-store';

export default function CheckoutScreen() {
  const params = useLocalSearchParams<{ order: string }>();
  const theme = useTheme();
  const showToast = useApp((s) => s.showToast);
  const user = useSession((s) => s.user);
  const hasPin = useSession((s) => Boolean(s.pin));
  const checkPin = useSession((s) => s.checkPin);

  const order = useMemo<CheckoutOrder | null>(() => {
    try {
      return JSON.parse(params.order ?? '') as CheckoutOrder;
    } catch {
      return null;
    }
  }, [params.order]);

  const wallet = useWallet(user?.id);
  const purchase = usePurchase();

  const [pin, setPin] = useState('');
  const [checking, setChecking] = useState(false);
  const [pinError, setPinError] = useState(false);

  const processing = purchase.isPending || checking;
  const insufficient = (wallet.data?.balance ?? 0) < (order?.amount ?? 0);

  const handleDigit = (d: string) => {
    if (pin.length >= 4) return;
    const next = pin + d;
    setPin(next);
    if (next.length === 4) {
      void authorize(next);
    }
  };

  const handleBackspace = () => {
    setPin((p) => p.slice(0, -1));
    setPinError(false);
  };

  const authorize = async (fullPin: string) => {
    if (!user || !order) return;
    setChecking(true);
    try {
      if (hasPin) {
        const ok = await checkPin(fullPin);
        if (!ok) {
          void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          setPinError(true);
          setPin('');
          setChecking(false);
          return;
        }
      }
      const result = await purchase.mutateAsync({
        userId: user.id,
        req: order.request,
      });
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.replace({
        pathname: '/success',
        params: {
          order: JSON.stringify(order),
          result: JSON.stringify(result),
        },
      });
    } catch (e) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showToast((e as Error).message, 'error');
      setPin('');
      setChecking(false);
    }
  };

  if (!order) {
    return (
      <SafeAreaView style={[styles.root, { backgroundColor: theme.overlay }]}>
        <View style={styles.sheetBase}>
          <ThemedText variant="body">Invalid checkout session.</ThemedText>
          <Pressable onPress={() => router.back()}>
            <ThemedText variant="link" color="primary">
              Go back
            </ThemedText>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.overlay }]}>
      <View style={[styles.sheet, { backgroundColor: theme.surface }]}>
        <View style={styles.handle} />
        <View style={styles.header}>
          <CategoryIcon category={order.category} size={30} />
          <View style={{ flex: 1 }}>
            <ThemedText variant="h3" numberOfLines={2}>
              {order.product}
            </ThemedText>
            <ThemedText variant="small" color="textSecondary">
              {order.title} • {categoryMeta[order.category].label}
            </ThemedText>
          </View>
        </View>

        <View style={styles.rows}>
          {order.rows.map((row) => (
            <View key={row.label} style={styles.row}>
              <ThemedText variant="caption" color="textSecondary">
                {row.label}
              </ThemedText>
              <ThemedText
                variant="captionStrong"
                numberOfLines={2}
                style={{ maxWidth: '60%', textAlign: 'right' }}>
                {row.value}
              </ThemedText>
            </View>
          ))}
          <View style={styles.divider} />
          <View style={styles.row}>
            <ThemedText variant="bodyStrong">Total payable</ThemedText>
            <ThemedText variant="bodyStrong" color="primary">
              {formatNaira(order.amount)}
            </ThemedText>
          </View>
          <View style={styles.row}>
            <ThemedText variant="tiny" color="textMuted">
              Wallet balance
            </ThemedText>
            <ThemedText variant="tiny" color={insufficient ? 'danger' : 'textMuted'}>
              {wallet.isLoading ? '…' : formatNaira(wallet.data?.balance ?? 0)}
            </ThemedText>
          </View>
        </View>

        {insufficient ? (
          <View style={[styles.warn, { backgroundColor: theme.dangerSoft }]}>
            <Ionicons name="alert-circle-outline" size={18} color={theme.danger} />
            <ThemedText variant="small" color="danger" style={{ flex: 1 }}>
              Insufficient balance. Fund your wallet first.
            </ThemedText>
            <Pressable onPress={() => router.push('/wallet')}>
              <ThemedText variant="link" color="danger">
                Fund
              </ThemedText>
            </Pressable>
          </View>
        ) : (
          <>
            <ThemedText
              variant="captionStrong"
              color="textSecondary"
              style={{ textAlign: 'center' }}>
              {hasPin ? 'Enter your 4-digit PIN to authorize' : 'Confirm purchase'}
            </ThemedText>
            <View style={{ alignItems: 'center', marginVertical: Spacing.md }}>
              <PinDots entered={pin.length} error={pinError} />
            </View>
            {!hasPin ? (
              <Pressable
                onPress={() => void authorize('0000')}
                disabled={processing}
                style={{ opacity: processing ? 0.5 : 1 }}>
                <ThemedText variant="linkPrimary" color="primary" style={{ textAlign: 'center' }}>
                  Pay {formatNaira(order.amount)}
                </ThemedText>
              </Pressable>
            ) : null}
            <View style={{ alignItems: 'center', marginBottom: Spacing.sm }}>
              <PinPad onDigit={handleDigit} onBackspace={handleBackspace} disabled={processing} />
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  sheet: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xxxl,
  },
  sheetBase: {
    backgroundColor: 'transparent',
    padding: Spacing.xxl,
    alignItems: 'center',
    gap: Spacing.md,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#CBD5D2',
    marginBottom: Spacing.lg,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, marginBottom: Spacing.lg },
  rows: { gap: Spacing.sm, marginBottom: Spacing.lg },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.md },
  divider: { height: 1, backgroundColor: '#E4E9E6', marginVertical: Spacing.sm },
  warn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: 12,
    marginBottom: Spacing.sm,
  },
});