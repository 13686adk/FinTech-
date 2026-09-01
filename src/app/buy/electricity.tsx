import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { providerLabel } from '@/components/brand/network-badge';
import { PickerField, type PickerOption } from '@/components/buy/picker-field';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { AmountChips } from '@/components/buy/picker-field';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useCatalog, useVerifyCustomer } from '@/hooks/use-vtu';
import { formatNaira } from '@/lib/format';
import { isValidMeter, normalizeMeter } from '@/lib/validate';
import { pushCheckout } from '@/features/checkout/types';
import type { CustomerInfo } from '@/services/api/types';
import { useSession } from '@/store/session-store';

const QUICK_AMOUNTS = [1000, 2000, 5000, 10000];

export default function ElectricityScreen() {
  const theme = useTheme();
  const user = useSession((s) => s.user);
  const catalog = useCatalog();
  const verifyCustomer = useVerifyCustomer();

  const [discoId, setDiscoId] = useState('abuja');
  const [meter, setMeter] = useState('');
  const [verified, setVerified] = useState<CustomerInfo | null>(null);
  const [amount, setAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const disco = catalog.data?.discos.find((d) => d.id === discoId);

  const discoOptions: PickerOption[] = useMemo(
    () =>
      (catalog.data?.discos ?? []).map((d) => ({
        id: d.id,
        label: d.name,
        subtitle: `Min ₦${d.minAmount.toLocaleString()}`, 
        icon: <Ionicons name="flash-outline" size={20} color="#F59E0B" />,
      })),
    [catalog.data],
  );

  const validAmount = customAmount ? Number(customAmount) : (amount ?? 0);

  const runVerify = async () => {
    if (!user) return;
    const value = normalizeMeter(meter);
    if (!isValidMeter(value)) {
      setError('Enter a valid meter number (6–12 digits).');
      return;
    }
    setVerifying(true);
    setError(null);
    try {
      const info = await verifyCustomer.mutateAsync({
        userId: user.id,
        category: 'electricity',
        provider: discoId,
        recipient: value,
      });
      setVerified(info);
    } catch (e) {
      setError((e as Error).message);
      setVerified(null);
    } finally {
      setVerifying(false);
    }
  };

  const continueToCheckout = () => {
    setError(null);
    if (!disco) return;
    if (!isValidMeter(meter)) {
      setError('Enter a valid meter number.');
      return;
    }
    if (!validAmount || validAmount < disco.minAmount) {
      setError(`Minimum amount for ${disco.code} is ₦${disco.minAmount.toLocaleString()}.`);
      return;
    }

    const total = validAmount + disco.fee;
    pushCheckout({
      category: 'electricity',
      title: 'Electricity Token',
      product: `${disco.code} units: ₦${validAmount.toLocaleString()}`,
      provider: disco.id,
      recipient: meter,
      amount: total,
      profit: disco.fee,
      rows: [
        { label: 'Disco', value: disco.name },
        { label: 'Meter no.', value: meter },
        { label: 'Account name', value: verified?.name || '—' },
        { label: 'Units amount', value: formatNaira(validAmount) },
        { label: 'Service fee', value: formatNaira(disco.fee, { decimals: false }) },
        { label: 'Total', value: formatNaira(total) },
      ],
      request: {
        category: 'electricity',
        provider: disco.id,
        recipient: meter,
        amount: validAmount,
        token: 'prepaid',
        customerName: verified?.name ?? undefined,
      },
    });
  };

  return (
    <Screen subtitle="Prepaid tokens delivered instantly via SMS & app.">
      <View style={{ gap: Spacing.xl, paddingTop: Spacing.md }}>
        <PickerField
          label="Distribution company"
          value={discoOptions.find((o) => o.id === discoId)}
          options={discoOptions}
          onSelect={(o) => {
            setDiscoId(o.id);
            setVerified(null);
          }}
        />

        <View style={{ gap: Spacing.sm }}>
          <ThemedText variant="captionStrong" color="textSecondary">
            Meter number
          </ThemedText>
          <Input
            placeholder="e.g. 01234567890"
            keyboardType="number-pad"
            value={meter}
            onChangeText={(v) => {
              setMeter(normalizeMeter(v));
              setVerified(null);
              setError(null);
            }}
            error={error}
            right={<Ionicons name="link-outline" size={20} color="#94A19B" />}
          />
          <Button
            label={verified ? 'Re-verify meter' : 'Verify meter'}
            variant="secondary"
            size="md"
            onPress={runVerify}
            loading={verifying}
            disabled={!meter}
          />
          {verified?.name ? (
            <View style={[styles.verified, { backgroundColor: theme.successSoft }]}>
              <Ionicons name="person-circle-outline" size={18} color={theme.success} />
              <ThemedText variant="captionStrong" color="success">
                {verified.name}
              </ThemedText>
            </View>
          ) : null}
        </View>

        <View style={{ gap: Spacing.sm }}>
          <ThemedText variant="captionStrong" color="textSecondary">
            Amount of units
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
          {disco ? (
            <ThemedText variant="tiny" color="textMuted">
              {disco.name} — minimum ₦{disco.minAmount.toLocaleString()} • service fee ₦{disco.fee}
            </ThemedText>
          ) : null}
        </View>

        <Button
          label={`Continue — ${providerLabel(disco?.code)}`}
          onPress={continueToCheckout}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  verified: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Spacing.md,
  },
});