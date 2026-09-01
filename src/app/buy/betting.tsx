import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { ProviderBadge } from '@/components/brand/network-badge';
import { AmountChips, PickerField, type PickerOption } from '@/components/buy/picker-field';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { Spacing } from '@/constants/theme';
import { useCatalog } from '@/hooks/use-vtu';
import { formatNaira } from '@/lib/format';
import { pushCheckout } from '@/features/checkout/types';

const QUICK_AMOUNTS = [2000, 5000, 10000, 20000];

export default function BettingScreen() {
  const catalog = useCatalog();
  const [providerId, setProviderId] = useState('bet9ja');
  const [customerId, setCustomerId] = useState('');
  const [amount, setAmount] = useState<number | null>(5000);
  const [customAmount, setCustomAmount] = useState('');
  const [error, setError] = useState<string | null>(null);

  const provider = catalog.data?.betting.find((b) => b.id === providerId);

  const providerOptions: PickerOption[] = useMemo(
    () =>
      (catalog.data?.betting ?? []).map((b) => ({
        id: b.id,
        label: b.name,
        subtitle: `Min ₦${b.minAmount.toLocaleString()} • Max ₦${b.maxAmount.toLocaleString()}`,
        icon: <ProviderBadge provider={b.id} size={30} />,
      })),
    [catalog.data],
  );

  const selectedAmount = customAmount ? Number(customAmount) : (amount ?? 0);

  const continueToCheckout = () => {
    setError(null);
    if (!customerId.trim()) {
      setError('Enter your betting account / customer ID.');
      return;
    }
    if (!provider) return;
    if (!selectedAmount || selectedAmount < provider.minAmount || selectedAmount > provider.maxAmount) {
      setError(`Amount must be ₦${provider.minAmount.toLocaleString()} – ₦${provider.maxAmount.toLocaleString()}.`);
      return;
    }
    const fee = Math.max(50, Math.round(selectedAmount * 0.01));
    const total = selectedAmount + fee;
    pushCheckout({
      category: 'betting',
      title: 'Betting Wallet Funding',
      product: `${provider.name} Funding — ₦${selectedAmount.toLocaleString()}`,
      provider: provider.id,
      recipient: customerId,
      amount: total,
      profit: fee,
      rows: [
        { label: 'Provider', value: provider.name },
        { label: 'Customer ID', value: customerId },
        { label: 'Funding amount', value: formatNaira(selectedAmount) },
        { label: 'Service fee', value: formatNaira(fee, { decimals: false }) },
        { label: 'Total', value: formatNaira(total) },
      ],
      request: {
        category: 'betting',
        provider: provider.id,
        recipient: customerId,
        amount: selectedAmount,
      },
    });
  };

  return (
    <Screen subtitle="Fund Bet9ja, NairaBet, 1xBet and BetKing wallets instantly.">
      <View style={{ gap: Spacing.xl, paddingTop: Spacing.md }}>
        <PickerField
          label="Provider"
          value={providerOptions.find((o) => o.id === providerId)}
          options={providerOptions}
          onSelect={(o) => setProviderId(o.id)}
        />

        <Input
          label="Betting account / customer ID"
          placeholder="e.g. 8401234567"
          keyboardType="number-pad"
          value={customerId}
          onChangeText={(v) => {
            setCustomerId(v.replace(/\D/g, ''));
            setError(null);
          }}
          error={error}
        />

        <View style={{ gap: Spacing.sm }}>
          <ThemedText variant="captionStrong" color="textSecondary">
            Amount to fund
          </ThemedText>
          <AmountChips
            amounts={QUICK_AMOUNTS}
            selected={customAmount ? null : amount}
            onSelect={(a) => {
              setAmount(a);
              setCustomAmount('');
            }}
          />
          <Input
            placeholder="Custom amount"
            keyboardType="number-pad"
            value={customAmount}
            onChangeText={(v) => setCustomAmount(v.replace(/\D/g, ''))}
            left={<ThemedText variant="bodyStrong">₦</ThemedText>}
          />
        </View>

        <Button label="Continue" onPress={continueToCheckout} disabled={!selectedAmount} />
      </View>
    </Screen>
  );
}