import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { NetworkBadge, networkLabel } from '@/components/brand/network-badge';
import { CategoryIcon } from '@/components/brand/category-icon';
import { ThemedText } from '@/components/themed-text';
import { AmountChips } from '@/components/buy/picker-field';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Chip, ChipRow } from '@/components/ui/chip';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { Spacing } from '@/constants/theme';
import { useCatalog } from '@/hooks/use-vtu';
import { formatNaira } from '@/lib/format';
import { detectNetwork, isValidPhone } from '@/lib/validate';
import { pushCheckout } from '@/features/checkout/types';
import type { Network } from '@/services/api/types';

const NETWORKS: Network[] = ['mtn', 'glo', 'airtel', '9mobile'];
const DENOMS = [100, 200, 500, 1000, 2000, 5000];

export default function AirtimeScreen() {
  const catalog = useCatalog();
  const [network, setNetwork] = useState<Network>('mtn');
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState<number | null>(100);
  const [customAmount, setCustomAmount] = useState('');
  const [error, setError] = useState<string | null>(null);

  const detected = detectNetwork(phone);
  const activeNetwork = detected ?? network;

  const selectedAmount = customAmount ? Number(customAmount) : (amount ?? 0);

  const savings = selectedAmount
    ? catalog.data?.airtimeDenominations.find(
        (d) => d.network === activeNetwork && d.denomination === selectedAmount,
      )
    : null;

  const continueToCheckout = () => {
    setError(null);
    if (!isValidPhone(phone)) {
      setError('Enter a valid phone number.');
      return;
    }
    if (detected && detected !== activeNetwork) {
      setError('The phone number does not match the selected network.');
      return;
    }
    if (!selectedAmount || selectedAmount < 100 || selectedAmount > 50000) {
      setError('Enter an amount between ₦100 and ₦50,000.');
      return;
    }

    const denom = selectedAmount;
    const dealerPrice = (denom * (activeNetwork === 'mtn' || activeNetwork === 'glo' ? 0.97 : 0.975)).toFixed(2);

    pushCheckout({
      category: 'airtime',
      title: 'Airtime Top-Up',
      product: `${networkLabel(activeNetwork)} Airtime ₦${denom}`,
      network: activeNetwork,
      recipient: phone,
      amount: denom,
      profit: Number((denom - Number(dealerPrice)).toFixed(2)),
      rows: [
        { label: 'Network', value: networkLabel(activeNetwork) },
        { label: 'Phone', value: phone },
        { label: 'Amount', value: formatNaira(denom) },
        { label: 'Est. savings', value: formatNaira(denom - Number(dealerPrice), { decimals: false }) },
      ],
      request: {
        category: 'airtime',
        network: activeNetwork,
        recipient: phone,
        amount: denom,
      },
    });
  };

  return (
    <Screen subtitle="Recharge any Nigerian number instantly — keep the discount.">
      <View style={{ gap: Spacing.xxl, paddingTop: Spacing.md }}>
        <View style={{ gap: Spacing.sm }}>
          <ThemedText variant="captionStrong" color="textSecondary">
            Select network
          </ThemedText>
          <ChipRow>
            {NETWORKS.map((n) => (
              <Chip
                key={n}
                label={networkLabel(n)}
                selected={activeNetwork === n}
                disabled={Boolean(detected) && detected !== n}
                icon={<NetworkBadge network={n} size={22} />}
                onPress={() => {
                  setNetwork(n);
                  setCustomAmount('');
                }}
              />
            ))}
          </ChipRow>
        </View>

        <View style={{ gap: Spacing.sm }}>
          <ThemedText variant="captionStrong" color="textSecondary">
            Recipient phone number
          </ThemedText>
          <Input
            placeholder="0812 345 6789"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={(v) => {
              setPhone(v);
              setError(null);
            }}
            error={error}
            right={
              detected ? (
                <NetworkBadge network={detected} size={30} />
              ) : (
                <Ionicons name="person-outline" size={20} color="#94A19B" />
              )
            }
          />
          {detected ? (
            <ThemedText variant="tiny" color="primary">
              {networkLabel(detected)} number detected
            </ThemedText>
          ) : null}
        </View>

        <View style={{ gap: Spacing.sm }}>
          <ThemedText variant="captionStrong" color="textSecondary">
            Amount
          </ThemedText>
          <AmountChips amounts={DENOMS} selected={customAmount ? null : amount} onSelect={(a) => { setAmount(a); setCustomAmount(''); }} />
          <Input
            placeholder="Custom amount"
            keyboardType="number-pad"
            value={customAmount}
            onChangeText={(v) => setCustomAmount(v.replace(/\D/g, ''))}
            left={<ThemedText variant="bodyStrong">₦</ThemedText>}
          />
          {savings ? (
            <ThemedText variant="small" color="success">
              You save {formatNaira(selectedAmount - savings.dealerPrice, { decimals: false })} on this top-up
            </ThemedText>
          ) : null}
        </View>

        <Card style={styles.summary}>
          <View style={styles.summaryRow}>
            <CategoryIcon category="airtime" size={22} />
            <View style={{ flex: 1 }}>
              <ThemedText variant="captionStrong">You pay</ThemedText>
              <ThemedText variant="small" color="textSecondary">
                {networkLabel(activeNetwork)} airtime
              </ThemedText>
            </View>
            <ThemedText variant="bodyStrong" color="primary">
              {formatNaira(selectedAmount || 0, { decimals: false })}
            </ThemedText>
          </View>
        </Card>

        <Button label="Continue" onPress={continueToCheckout} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  summary: { flexDirection: 'row', alignItems: 'center' },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
});