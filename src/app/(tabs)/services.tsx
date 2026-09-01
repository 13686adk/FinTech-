import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { CategoryIcon, categoryMeta } from '@/components/brand/category-icon';
import { ProviderBadge } from '@/components/brand/network-badge';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Card } from '@/components/ui/card';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useCatalog } from '@/hooks/use-vtu';

export default function ServicesScreen() {
  const router = useRouter();
  const catalog = useCatalog();

  const go = (route: string) => router.push(route as never);

  return (
    <ThemedView surface="background" style={styles.root}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <ThemedText variant="h2">All services</ThemedText>
        <ThemedText variant="caption" color="textSecondary">
          Buy wholesale, resell retail, keep the margin.
        </ThemedText>

        <ServiceSection
          title={categoryMeta.airtime.label}
          icon={<CategoryIcon category="airtime" size={24} />}
          onPress={() => go('/buy/airtime')}
          items={[
            { label: 'MTN', sub: '3% discount' },
            { label: 'Glo', sub: '3% discount' },
            { label: 'Airtel', sub: '2.5% discount' },
            { label: '9mobile', sub: '2.5% discount' },
          ]}
        />

        <ServiceSection
          title={categoryMeta.data.label}
          icon={<CategoryIcon category="data" size={24} />}
          onPress={() => go('/buy/data')}
          items={[
            { label: 'MTN SME & CG', sub: 'cheapest rates' },
            { label: 'Glo SME', sub: 'up to 30% off' },
            { label: 'Airtel SME', sub: 'daily packs' },
            { label: '9mobile SME', sub: 'monthly packs' },
          ]}
        />

        <ServiceSection
          title={categoryMeta.cable.label}
          icon={<CategoryIcon category="cable" size={24} />}
          onPress={() => go('/buy/cable')}
          items={catalog.data?.cables.map((c) => ({ label: c.name, sub: `${c.packages.length} plans` })) ?? []}
        />

        <ServiceSection
          title={categoryMeta.electricity.label}
          icon={<CategoryIcon category="electricity" size={24} />}
          onPress={() => go('/buy/electricity')}
          items={catalog.data?.discos.slice(0, 4).map((d) => ({ label: d.code, sub: 'prepaid tokens' })) ?? []}
        />

        <ServiceSection
          title={categoryMeta.education.label}
          icon={<CategoryIcon category="education" size={24} />}
          onPress={() => go('/buy/education')}
          items={catalog.data?.education.map((e) => ({ label: e.name, sub: 'instant delivery' })) ?? []}
        />

        <ServiceSection
          title={categoryMeta.betting.label}
          icon={<CategoryIcon category="betting" size={24} />}
          onPress={() => go('/buy/betting')}
          items={catalog.data?.betting.map((b) => ({ label: b.name, sub: 'wallet funding' })) ?? []}
        />

        <View style={{ height: Spacing.sm }} />
      </ScrollView>
    </ThemedView>
  );
}

function ServiceSection({
  title,
  icon,
  onPress,
  items,
}: {
  title: string;
  icon: React.ReactNode;
  onPress: () => void;
  items: { label: string; sub: string }[];
}) {
  const theme = useTheme();
  return (
    <View style={{ marginTop: Spacing.xl }}>
      <Card style={{ marginBottom: Spacing.sm }} onPress={onPress}>
        <View style={styles.sectionHeader}>
          {icon}
          <ThemedText variant="bodyStrong" style={{ flex: 1 }}>
            {title}
          </ThemedText>
          <Ionicons name="chevron-forward" size={18} color={theme.textMuted} />
        </View>
      </Card>
      <View style={styles.subGrid}>
        {items.map((item) => (
          <Pressable
            key={item.label}
            style={[styles.subItem, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={onPress}>
            <ProviderBadge provider={item.label.toLowerCase()} size={34} />
            <View style={{ flex: 1 }}>
              <ThemedText variant="captionStrong" numberOfLines={1}>
                {item.label}
              </ThemedText>
              <ThemedText variant="small" color="textMuted" numberOfLines={1}>
                {item.sub}
              </ThemedText>
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: Spacing.lg, paddingBottom: 120 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  subGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  subItem: {
    width: '48.5%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 0.5,
  },
});