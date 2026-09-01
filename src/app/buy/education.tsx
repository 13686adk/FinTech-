import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ProviderBadge } from '@/components/brand/network-badge';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Screen } from '@/components/ui/screen';
import { SkeletonList } from '@/components/ui/skeleton';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useCatalog } from '@/hooks/use-vtu';
import { formatNaira } from '@/lib/format';
import { pushCheckout } from '@/features/checkout/types';
import type { EducationProvider } from '@/services/api/types';

export default function EducationScreen() {
  const theme = useTheme();
  const catalog = useCatalog();
  const [selected, setSelected] = useState<EducationProvider | null>(null);

  const continueToCheckout = () => {
    if (!selected) return;
    pushCheckout({
      category: 'education',
      title: 'Exam Result PIN',
      product: selected.name,
      amount: selected.price,
      profit: selected.price - selected.dealerPrice,
      rows: [
        { label: 'Product', value: selected.name },
        { label: 'Delivery', value: 'Scratch card PIN, instant' },
        { label: 'You pay', value: formatNaira(selected.price) },
      ],
      request: {
        category: 'education',
        productId: selected.id,
        amount: selected.price,
      },
    });
  };

  return (
    <Screen subtitle="WAEC, NECO, NABTEB and JAMB pins at reseller prices.">
      <View style={{ gap: Spacing.sm, paddingTop: Spacing.md }}>
        {catalog.isLoading ? (
          <SkeletonList rows={4} />
        ) : (
          (catalog.data?.education ?? []).map((item) => {
            const active = selected?.id === item.id;
            return (
              <Pressable key={item.id} onPress={() => setSelected(active ? null : item)}>
                <Card
                  style={{
                    borderColor: active ? theme.primary : theme.border,
                    borderWidth: active ? 1.5 : 0.5,
                  }}>
                  <View style={styles.row}>
                    <ProviderBadge provider={item.id} size={40} />
                    <View style={{ flex: 1 }}>
                      <ThemedText variant="captionStrong">{item.name}</ThemedText>
                      <ThemedText variant="small" color="textMuted">
                        Instant PIN delivery
                      </ThemedText>
                    </View>
                    <View style={{ alignItems: 'flex-end', gap: 2 }}>
                      <ThemedText variant="bodyStrong" color="primary">
                        {formatNaira(item.price, { decimals: false })}
                      </ThemedText>
                      {active ? (
                        <Ionicons name="checkmark-circle" size={18} color={theme.primary} />
                      ) : null}
                    </View>
                  </View>
                </Card>
              </Pressable>
            );
          })
        )}

        <View style={{ height: Spacing.sm }} />
        <Button label="Continue" onPress={continueToCheckout} disabled={!selected} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
});