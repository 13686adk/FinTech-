import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { router, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { formatNaira } from '@/lib/format';
import type { CheckoutOrder } from '@/features/checkout/types';
import type { OrderResult } from '@/services/api/types';
import { useApp } from '@/store/app-store';

export default function SuccessScreen() {
  const params = useLocalSearchParams<{ order?: string; result?: string }>();
  const theme = useTheme();
  const showToast = useApp((s) => s.showToast);

  const order = useMemo<CheckoutOrder | null>(() => {
    try {
      return JSON.parse(params.order ?? '') as CheckoutOrder;
    } catch {
      return null;
    }
  }, [params.order]);

  const result = useMemo<OrderResult | null>(() => {
    try {
      return JSON.parse(params.result ?? '') as OrderResult;
    } catch {
      return null;
    }
  }, [params.result]);

  const isPending = result?.status === 'pending';
  const tokenPayout = result?.token;
  const pinPayout = result?.pin;

  const copy = (text: string, label: string) => {
    void Clipboard.setStringAsync(text).then(() => showToast(`${label} copied`, 'success'));
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.overlay }]}>
      <View style={[styles.card, { backgroundColor: theme.surface }]}>
        <View style={styles.top} />
        <Animated.View entering={FadeInDown.springify().damping(14)} style={styles.content}>
          <View
            style={[
              styles.check,
              { backgroundColor: isPending ? theme.warningSoft : theme.successSoft },
            ]}>
            <Ionicons
              name={isPending ? 'hourglass-outline' : 'checkmark'}
              size={46}
              color={isPending ? theme.warning : theme.success}
            />
          </View>

          <ThemedText variant="h3" style={{ textAlign: 'center' }}>
            {isPending ? 'Processing…' : 'Success!'}
          </ThemedText>
          <ThemedText variant="caption" color="textSecondary" style={{ textAlign: 'center' }}>
            {result?.message ?? 'Your transaction is complete.'}
          </ThemedText>

          {tokenPayout ? (
            <Animated.View
              entering={FadeInUp.delay(200)}
              style={[styles.payout, { backgroundColor: theme.primarySoft, borderColor: theme.primary }]}>
              <ThemedText variant="tiny" color="primary">
                ELECTRICITY TOKEN — TAP TO COPY
              </ThemedText>
              <Pressable onPress={() => copy(tokenPayout, 'Token')}>
                <ThemedText variant="h2" color="primary" style={{ textAlign: 'center' }}>
                  {tokenPayout}
                </ThemedText>
              </Pressable>
            </Animated.View>
          ) : null}

          {pinPayout ? (
            <Animated.View
              entering={FadeInUp.delay(200)}
              style={[styles.payout, { backgroundColor: theme.primarySoft, borderColor: theme.primary }]}>
              <ThemedText variant="tiny" color="primary">
                SCRATCH CARD PIN — TAP TO COPY
              </ThemedText>
              <Pressable onPress={() => copy(pinPayout, 'PIN')}>
                <ThemedText variant="h2" color="primary" style={{ textAlign: 'center' }}>
                  {pinPayout}
                </ThemedText>
              </Pressable>
            </Animated.View>
          ) : null}

          <Card style={styles.summary}>
            <Row label="Reference" value={result?.reference ?? '—'} mono />
            <Row label="Product" value={order?.product ?? '—'} />
            <Row label="Amount" value={formatNaira(order?.amount ?? 0)} />
            <Row
              label="Wallet balance"
              value={formatNaira(result?.newBalance ?? 0, { decimals: false })}
            />
            {order && order.profit > 0 ? (
              <Row
                label="Your margin"
                value={formatNaira(order.profit, { decimals: false })}
                accent
              />
            ) : null}
          </Card>
        </Animated.View>

        <View style={styles.actions}>
          <Button
            label="View history"
            variant="secondary"
            onPress={() => {
              router.dismissTo('/');
              router.replace('/transactions');
            }}
          />
          <Button
            label="Done"
            onPress={() => {
              router.dismissTo('/');
            }}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

function Row({ label, value, mono, accent }: { label: string; value: string; mono?: boolean; accent?: boolean }) {
  return (
    <View style={styles.row}>
      <ThemedText variant="small" color="textSecondary">
        {label}
      </ThemedText>
      <ThemedText variant="captionStrong" color={accent ? 'success' : 'text'} numberOfLines={2} style={[mono ? { fontFamily: 'monospace' } : null, { maxWidth: '60%', textAlign: 'right' }]}>
        {value}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  card: {
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xxxl,
  },
  top: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, backgroundColor: '#CBD5D2', marginBottom: Spacing.lg },
  content: { alignItems: 'center', gap: Spacing.md },
  check: {
    width: 92,
    height: 92,
    borderRadius: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  payout: {
    width: '100%',
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.lg,
    gap: 4,
    alignItems: 'center',
  },
  summary: { width: '100%', marginTop: Spacing.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.sm, paddingVertical: 6 },
  actions: { marginTop: Spacing.xxl, gap: Spacing.sm },
});