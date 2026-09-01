import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { WalletCard } from '@/components/brand/wallet-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useFundWallet, useFundingMethods, useVirtualAccount, useWallet } from '@/hooks/use-vtu';
import { formatNaira } from '@/lib/format';
import type { FundAccount } from '@/services/api/types';
import { useApp } from '@/store/app-store';
import { useSession } from '@/store/session-store';

export default function WalletScreen() {
  const theme = useTheme();
  const user = useSession((s) => s.user);
  const showToast = useApp((s) => s.showToast);

  const wallet = useWallet(user?.id);
  const methods = useFundingMethods();
  const requestAccount = useVirtualAccount(user?.id ?? '');
  const fundWallet = useFundWallet(user?.id ?? '');

  const [activeMethod, setActiveMethod] = useState<string | null>(null);
  const [vAccount, setVAccount] = useState<FundAccount | null>(null);
  const [payAmount, setPayAmount] = useState('');
  const [funding, setFunding] = useState(false);
  const [masked, setMasked] = useState(false);

  const openMethod = async (methodId: string) => {
    if (methodId === 'bank-transfer') {
      try {
        const account = await requestAccount.mutateAsync();
        setVAccount(account);
      } catch (e) {
        showToast((e as Error).message, 'error');
        return;
      }
    }
    setActiveMethod(methodId);
  };

  const confirmPaid = async () => {
    const amount = Number(payAmount);
    if (!amount || amount < 100) {
      showToast('Enter an amount of at least ₦100', 'error');
      return;
    }
    setFunding(true);
    try {
      await fundWallet.mutateAsync({ reference: vAccount?.reference ?? 'manual', amount });
      showToast(`Wallet funded with ${formatNaira(amount, { decimals: false })}`, 'success');
      setPayAmount('');
      setActiveMethod(null);
    } catch (e) {
      showToast((e as Error).message, 'error');
    } finally {
      setFunding(false);
    }
  };

  return (
    <ThemedView surface="background" style={styles.root}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ThemedText variant="h2">Wallet</ThemedText>
        <ThemedText variant="caption" color="textSecondary">
          {user?.name}
        </ThemedText>

        <View style={{ marginTop: Spacing.md }}>
          <WalletCard
            balance={wallet.data?.balance ?? 0}
            masked={masked}
            onToggleMask={() => setMasked((m) => !m)}
            referralCode={user?.referralCode}
            loading={wallet.isLoading}
          />
        </View>

        <View style={styles.stats}>
          <StatTile label="Total funded" value={formatNaira(wallet.data?.totalCredit ?? 0, { decimals: false })} icon="arrow-down-circle-outline" />
          <StatTile label="Total spent" value={formatNaira(wallet.data?.totalDebit ?? 0, { decimals: false })} icon="arrow-up-circle-outline" />
        </View>

        <Card style={{ marginTop: Spacing.sm }}>
          <CardHeader title="Fund wallet" subtitle="Choose how you want to pay in" />
          <View style={{ gap: Spacing.sm }}>
            {methods.isLoading ? (
              <Skeleton height={64} />
            ) : (
              methods.data?.map((m) => (
                <Pressable
                  key={m.id}
                  style={[styles.methodRow, { borderColor: theme.border }]}
                  onPress={() => openMethod(m.id)}>
                  <View style={[styles.methodIcon, { backgroundColor: theme.primarySoft }]}>
                    <Ionicons
                      name={m.kind === 'bank_transfer' ? 'swap-horizontal' : m.kind === 'card' ? 'card-outline' : 'keypad-outline'}
                      size={20}
                      color={theme.primary}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <ThemedText variant="captionStrong">{m.label}</ThemedText>
                    <ThemedText variant="small" color="textMuted">
                      {m.detail}
                    </ThemedText>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
                </Pressable>
              ))
            )}
          </View>
          {methods.data?.[0]?.kind === 'bank_transfer' ? (
            <ThemedText variant="tiny" color="textMuted" style={{ marginTop: Spacing.md }}>
              In production, dedicated accounts are provisioned by your payment gateway
              (Paystack, Flutterwave or Monnify virtual accounts).
            </ThemedText>
          ) : null}
        </Card>

        <Card style={{ marginTop: Spacing.sm }}>
          <CardHeader title="Statistics" subtitle="Lifetime performance" />
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <StatLine label="Balance" value={formatNaira(wallet.data?.balance ?? 0, { decimals: false })} />
            <StatLine label="Net spend" value={formatNaira((wallet.data?.totalDebit ?? 0) - (wallet.data?.totalCredit ?? 0), { decimals: false })} />
          </View>
        </Card>

        <View style={{ height: Spacing.sm }} />
      </ScrollView>

      {/* Virtual account sheet */}
      <BottomSheet
        visible={activeMethod === 'bank-transfer'}
        onClose={() => setActiveMethod(null)}
        title="Pay via bank transfer"
        subtitle="Transfer to the account below — funds reflect instantly.">
        <View style={{ gap: Spacing.lg }}>
          <View
            style={[styles.vaBox, { backgroundColor: theme.primarySoft, borderColor: theme.primary }]}>
            <ThemedText variant="tiny" color="primary">
              {vAccount?.bankName}
            </ThemedText>
            <Pressable onPress={() => copy(showToast, vAccount?.accountNumber ?? '')}>
              <ThemedText variant="h3" color="primary" style={{ letterSpacing: 3 }}>
                {vAccount?.accountNumber ?? '…'}
              </ThemedText>
            </Pressable>
            <ThemedText variant="small" color="textSecondary">
              {vAccount?.accountName}
            </ThemedText>
          </View>

          <Input
            label="Amount you transferred"
            placeholder="e.g. 5000"
            keyboardType="number-pad"
            value={payAmount}
            onChangeText={setPayAmount}
            left={<ThemedText variant="bodyStrong">₦</ThemedText>}
          />

          <Button
            label="I have sent the money"
            onPress={confirmPaid}
            loading={funding}
            disabled={!payAmount}
          />
          <ThemedText variant="tiny" color="textMuted" style={{ textAlign: 'center' }}>
            Demo: confirms instantly. Live: verified by your gateway webhook.
          </ThemedText>
        </View>
      </BottomSheet>

      {/* Card funding sheet (placeholder) */}
      <BottomSheet
        visible={activeMethod === 'card'}
        onClose={() => setActiveMethod(null)}
        title="Card / debit"
        subtitle="This is activated when you connect a payment gateway.">
        <Card>
          <View style={{ alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.lg }}>
            <Ionicons name="card-outline" size={44} color={theme.textMuted} />
            <ThemedText variant="body">Card funding is a placeholder.</ThemedText>
            <ThemedText variant="small" color="textSecondary" style={{ textAlign: 'center' }}>
              Integrate Paystack/Flutterwave checkout to let customers fund with a debit card.
            </ThemedText>
          </View>
        </Card>
      </BottomSheet>

      {/* USSD sheet */}
      <BottomSheet
        visible={activeMethod === 'ussd'}
        onClose={() => setActiveMethod(null)}
        title="USSD top-up"
        subtitle="Dial a shortcode from any bank app.">
        <Card>
          <View style={{ alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.lg }}>
            <Ionicons name="keypad-outline" size={44} color={theme.textMuted} />
            <ThemedText variant="bodyStrong">*737*555*Amount#</ThemedText>
            <ThemedText variant="small" color="textSecondary" style={{ textAlign: 'center' }}>
              Configure your flow via a bank USSD aggregator (e.g. Flutterwave, Billstack).
            </ThemedText>
          </View>
        </Card>
      </BottomSheet>
    </ThemedView>
  );
}

function CardHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={{ marginBottom: Spacing.md }}>
      <ThemedText variant="bodyStrong">{title}</ThemedText>
      {subtitle ? (
        <ThemedText variant="small" color="textSecondary">
          {subtitle}
        </ThemedText>
      ) : null}
    </View>
  );
}

function StatTile({ label, value, icon }: { label: string; value: string; icon: keyof typeof Ionicons.glyphMap }) {
  const theme = useTheme();
  return (
    <Card style={styles.statTile}>
      <Ionicons name={icon} size={18} color={theme.primary} />
      <ThemedText variant="tiny" color="textMuted">
        {label}
      </ThemedText>
      <ThemedText variant="captionStrong">{value}</ThemedText>
    </Card>
  );
}

function StatLine({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ gap: 2 }}>
      <ThemedText variant="tiny" color="textMuted">
        {label}
      </ThemedText>
      <ThemedText variant="captionStrong">{value}</ThemedText>
    </View>
  );
}

function copy(showToast: (m: string, t?: 'success' | 'error') => void, text: string) {
  void Clipboard.setStringAsync(text).then(() => showToast('Account number copied', 'success'));
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: Spacing.lg, paddingBottom: 120 },
  stats: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  statTile: { flex: 1, gap: 4 },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  methodIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  vaBox: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.xl,
    alignItems: 'center',
    gap: 6,
  },
});