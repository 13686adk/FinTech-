import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { NetworkBadge, networkLabel } from '@/components/brand/network-badge';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Chip, ChipRow } from '@/components/ui/chip';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { SkeletonList } from '@/components/ui/skeleton';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useCatalog, useVerifyCustomer } from '@/hooks/use-vtu';
import { formatNaira } from '@/lib/format';
import { detectNetwork, isValidPhone } from '@/lib/validate';
import { pushCheckout } from '@/features/checkout/types';
import type { DataPlan, DataPlanType, Network } from '@/services/api/types';
import { useSession } from '@/store/session-store';

const NETWORKS: { id: Network; label: string }[] = [
  { id: 'mtn', label: 'MTN' },
  { id: 'glo', label: 'Glo' },
  { id: 'airtel', label: 'Airtel' },
  { id: '9mobile', label: '9mobile' },
];

const TYPES: { id: DataPlanType | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'sme', label: 'SME' },
  { id: 'cg', label: 'CG' },
  { id: 'gifting', label: 'Gifting' },
];

export default function DataScreen() {
  const theme = useTheme();
  const user = useSession((s) => s.user);
  const catalog = useCatalog();
  const verifyCustomer = useVerifyCustomer();

  const [network, setNetwork] = useState<Network>('mtn');
  const [type, setType] = useState<DataPlanType | 'all'>('all');
  const [phone, setPhone] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<DataPlan | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [verifying, setVerifying] = useState(false);

  const detected = detectNetwork(phone);

  const plans = useMemo(() => {
    const onNetwork = (catalog.data?.dataPlans ?? []).filter((p) => p.network === network);
    return type === 'all' ? onNetwork : onNetwork.filter((p) => p.type === type);
  }, [catalog.data, network, type]);

  const selectPlan = (plan: DataPlan) => {
    setSelectedPlan(plan);
    if (!phone) return;
    void verify(plan, phone);
  };

  const verify = async (plan: DataPlan, target: string) => {
    if (!user) return;
    setVerifying(true);
    try {
      await verifyCustomer.mutateAsync({
        userId: user.id,
        category: 'data',
        network: plan.network,
        recipient: target,
      });
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setVerifying(false);
    }
  };

  const continueToCheckout = async () => {
    setError(null);
    if (!selectedPlan) {
      setError('Pick a data plan to continue.');
      return;
    }
    if (!isValidPhone(phone)) {
      setError('Enter a valid phone number.');
      return;
    }
    if (detected && detected !== selectedPlan.network) {
      setError('The recipient number must match the plan network.');
      return;
    }
    if (!user) return;

    let customerName: string | undefined;
    try {
      const info = await verifyCustomer.mutateAsync({
        userId: user.id,
        category: 'data',
        network: selectedPlan.network,
        recipient: phone,
      });
      customerName = info.name ?? undefined;
    } catch {
      // Non-blocking — proceed to checkout with a warning handled above if hard error.
    }

    pushCheckout({
      category: 'data',
      title: 'Data Bundle',
      product: selectedPlan.name,
      network: selectedPlan.network,
      recipient: phone,
      amount: selectedPlan.sellingPrice,
      profit: selectedPlan.sellingPrice - selectedPlan.dealerPrice,
      rows: [
        { label: 'Plan', value: `${selectedPlan.name} — ${selectedPlan.validity}` },
        { label: 'Network', value: networkLabel(selectedPlan.network) },
        { label: 'Recipient', value: customerName ? `${customerName} (${phone})` : phone },
        { label: 'You pay', value: formatNaira(selectedPlan.sellingPrice) },
      ],
      request: {
        category: 'data',
        productId: selectedPlan.id,
        network: selectedPlan.network,
        recipient: phone,
        amount: selectedPlan.sellingPrice,
        plan: { name: selectedPlan.name, size: selectedPlan.size, validity: selectedPlan.validity },
      },
    });
  };

  return (
    <Screen subtitle="Wholesale-priced SME, CG and gifting bundles.">
      <View style={{ gap: Spacing.xl, paddingTop: Spacing.md }}>
        <View style={{ gap: Spacing.sm }}>
          <ThemedText variant="captionStrong" color="textSecondary">
            Network
          </ThemedText>
          <ChipRow>
            {NETWORKS.map((n) => (
              <Chip
                key={n.id}
                label={n.label}
                selected={network === n.id}
                icon={<NetworkBadge network={n.id} size={22} />}
                onPress={() => {
                  setNetwork(n.id);
                  setSelectedPlan(null);
                }}
              />
            ))}
          </ChipRow>
        </View>

        <View style={{ gap: Spacing.sm }}>
          <ThemedText variant="captionStrong" color="textSecondary">
            Recipient phone
          </ThemedText>
          <Input
            placeholder="0812 345 6789"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            right={
              detected ? (
                <NetworkBadge network={detected} size={30} />
              ) : (
                <Ionicons name="person-outline" size={20} color="#94A19B" />
              )
            }
            error={error}
          />
        </View>

        <View style={{ gap: Spacing.sm }}>
          <ChipRow>
            {TYPES.map((t) => (
              <Chip key={t.id} label={t.label} selected={type === t.id} onPress={() => setType(t.id)} />
            ))}
          </ChipRow>
        </View>

        <View style={{ gap: Spacing.sm }}>
          <ThemedText variant="captionStrong" color="textSecondary">
            Choose a plan
          </ThemedText>
          {catalog.isLoading ? (
            <SkeletonList rows={4} />
          ) : plans.length === 0 ? (
            <Card>
              <ThemedText variant="caption" color="textSecondary">
                No {type === 'all' ? '' : `${type} `}plans for {networkLabel(network)} right now.
              </ThemedText>
            </Card>
          ) : (
            plans.map((plan) => {
              const selected = selectedPlan?.id === plan.id;
              return (
                <Pressable key={plan.id} onPress={() => selectPlan(plan)}>
                  <Card
                    style={[
                      styles.plan,
                      { borderColor: selected ? theme.primary : theme.border, borderWidth: selected ? 1.5 : 0.5 },
                    ]}
                    padded={true}>
                    <View style={styles.planRow}>
                      <NetworkBadge network={plan.network} size={38} />
                      <View style={{ flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
                          <ThemedText variant="captionStrong">{plan.name}</ThemedText>
                          {plan.popular ? (
                            <View style={[styles.pop, { backgroundColor: theme.primarySoft }]}>
                              <ThemedText variant="tiny" color="primary">
                                POPULAR
                              </ThemedText>
                            </View>
                          ) : null}
                        </View>
                        <ThemedText variant="small" color="textMuted">
                          {plan.size} • {plan.validity} • {plan.type.toUpperCase()}
                        </ThemedText>
                      </View>
                      <View style={{ alignItems: 'flex-end', gap: 2 }}>
                        <ThemedText variant="bodyStrong" color="primary">
                          {formatNaira(plan.sellingPrice, { decimals: false })}
                        </ThemedText>
                        {selected ? (
                          <Ionicons name="checkmark-circle" size={18} color={theme.primary} />
                        ) : null}
                      </View>
                    </View>
                  </Card>
                </Pressable>
              );
            })
          )}
        </View>

        <Button
          label={verifying ? 'Verifying…' : 'Continue'}
          onPress={() => void continueToCheckout()}
          loading={verifying}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  plan: {},
  planRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  pop: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: Radius.sm },
});