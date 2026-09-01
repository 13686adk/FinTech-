import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ProviderBadge } from '@/components/brand/network-badge';
import { PickerField, type PickerOption } from '@/components/buy/picker-field';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useCatalog, useVerifyCustomer } from '@/hooks/use-vtu';
import { formatNaira } from '@/lib/format';
import { isValidIuc, normalizeIuc } from '@/lib/validate';
import { pushCheckout } from '@/features/checkout/types';
import type { CablePackage, CustomerInfo } from '@/services/api/types';
import { useSession } from '@/store/session-store';

export default function CableScreen() {
  const theme = useTheme();
  const user = useSession((s) => s.user);
  const catalog = useCatalog();
  const verifyCustomer = useVerifyCustomer();

  const [providerId, setProviderId] = useState('dstv');
  const [iuc, setIuc] = useState('');
  const [verified, setVerified] = useState<CustomerInfo | null>(null);
  const [selectedPkg, setSelectedPkg] = useState<CablePackage | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const provider = catalog.data?.cables.find((c) => c.id === providerId);

  const providerOptions: PickerOption[] = useMemo(
    () =>
      (catalog.data?.cables ?? []).map((c) => ({
        id: c.id,
        label: c.name,
        subtitle: `${c.packages.length} plans available`,
        icon: <ProviderBadge provider={c.id} size={30} />,
      })),
    [catalog.data],
  );

  const runVerify = async (target?: string) => {
    if (!user) return;
    const value = normalizeIuc(target ?? iuc);
    if (!isValidIuc(value)) {
      setError('Enter a valid 10-character IUC / smart card number.');
      return;
    }
    setVerifying(true);
    setError(null);
    try {
      const info = await verifyCustomer.mutateAsync({
        userId: user.id,
        category: 'cable',
        provider: providerId,
        recipient: value,
      });
      setVerified(info);
      setIuc(value);
    } catch (e) {
      setError((e as Error).message);
      setVerified(null);
    } finally {
      setVerifying(false);
    }
  };

  const switchProvider = (opt: PickerOption) => {
    setProviderId(opt.id);
    setVerified(null);
    setSelectedPkg(null);
  };

  const continueToCheckout = async () => {
    setError(null);
    const value = normalizeIuc(iuc);
    if (!isValidIuc(value)) {
      setError('Enter a valid IUC number.');
      return;
    }
    if (!selectedPkg) {
      setError('Select a subscription package.');
      return;
    }
    if (!provider) return;

    const fee = Math.round(selectedPkg.price * 0.015);
    const total = selectedPkg.price + fee;

    pushCheckout({
      category: 'cable',
      title: 'Cable TV Subscription',
      product: `${provider.name} — ${selectedPkg.name}`,
      provider: provider.id,
      recipient: value,
      amount: total,
      profit: fee,
      rows: [
        { label: 'Provider', value: provider.name },
        { label: 'Subscriber', value: verified?.name || '—' },
        { label: 'IUC / Smart card', value: value },
        { label: 'Bouquet', value: selectedPkg.name },
        { label: 'Validity', value: selectedPkg.validity },
        { label: 'Subscription fee', value: formatNaira(fee, { decimals: false }) },
        { label: 'Total', value: formatNaira(total) },
      ],
      request: {
        category: 'cable',
        provider: provider.id,
        productId: selectedPkg.id,
        recipient: value,
        amount: total,
        customerName: verified?.name ?? undefined,
      },
    });
  };

  return (
    <Screen subtitle="Subscribe DStv, GOtv, StarTimes and Showmax instantly.">
      <View style={{ gap: Spacing.xl, paddingTop: Spacing.md }}>
        <PickerField
          label="Provider"
          value={providerOptions.find((o) => o.id === providerId)}
          options={providerOptions}
          onSelect={switchProvider}
        />

        <View style={{ gap: Spacing.sm }}>
          <ThemedText variant="captionStrong" color="textSecondary">
            IUC / Smart card number
          </ThemedText>
          <Input
            placeholder="e.g. 7012345678"
            autoCapitalize="characters"
            value={iuc}
            onChangeText={(v) => {
              setIuc(normalizeIuc(v));
              setVerified(null);
              setError(null);
            }}
            error={error}
            right={<Ionicons name="code-outline" size={20} color="#94A19B" />}
          />
          <Button
            label={verified ? 'Re-verify number' : 'Verify subscriber'}
            variant="secondary"
            size="md"
            onPress={() => void runVerify()}
            loading={verifying}
            disabled={!iuc}
          />
          {verified?.name ? (
            <View style={[styles.subscriber, { backgroundColor: theme.successSoft }]}>
              <Ionicons name="person-circle-outline" size={18} color={theme.success} />
              <View style={{ flex: 1 }}>
                <ThemedText variant="tiny" color="success">
                  SUBSCRIBER CONFIRMED
                </ThemedText>
                <ThemedText variant="captionStrong">{verified.name}</ThemedText>
              </View>
            </View>
          ) : null}
        </View>

        {provider ? (
          <View style={{ gap: Spacing.sm }}>
            <ThemedText variant="captionStrong" color="textSecondary">
              Choose a {provider.packageLabel.toLowerCase()}
            </ThemedText>
            {provider.packages.map((pkg) => {
              const selected = selectedPkg?.id === pkg.id;
              return (
                <Pressable key={pkg.id} onPress={() => setSelectedPkg(pkg)}>
                  <Card
                    style={[
                      { borderColor: selected ? theme.primary : theme.border, borderWidth: selected ? 1.5 : 0.5 },
                    ]}>
                    <View style={styles.pkgRow}>
                      <ProviderBadge provider={provider.id} size={38} />
                      <View style={{ flex: 1 }}>
                        <ThemedText variant="captionStrong">{pkg.name}</ThemedText>
                        <ThemedText variant="small" color="textMuted">
                          {pkg.validity}
                          {pkg.description ? ` • ${pkg.description}` : ''}
                        </ThemedText>
                      </View>
                      <View style={{ alignItems: 'flex-end', gap: 2 }}>
                        <ThemedText variant="bodyStrong" color="primary">
                          {formatNaira(pkg.price, { decimals: false })}
                        </ThemedText>
                        {selected ? (
                          <Ionicons name="checkmark-circle" size={18} color={theme.primary} />
                        ) : null}
                      </View>
                    </View>
                  </Card>
                </Pressable>
              );
            })}
          </View>
        ) : null}

        <Button label="Continue" onPress={continueToCheckout} disabled={!selectedPkg} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  subscriber: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: 12,
  },
  pkgRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
});