import { Ionicons } from '@expo/vector-icons';
import { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

import { CategoryIcon } from '@/components/brand/category-icon';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Chip, ChipRow } from '@/components/ui/chip';
import { EmptyState } from '@/components/ui/empty-state';
import { SkeletonList } from '@/components/ui/skeleton';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useTransactions } from '@/hooks/use-vtu';
import { formatNaira, formatRelativeDate } from '@/lib/format';
import type { Category, Transaction } from '@/services/api/types';
import { useSession } from '@/store/session-store';

const FILTERS: { label: string; value: Category | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Airtime', value: 'airtime' },
  { label: 'Data', value: 'data' },
  { label: 'Cable TV', value: 'cable' },
  { label: 'Electricity', value: 'electricity' },
  { label: 'Exam PIN', value: 'education' },
  { label: 'Betting', value: 'betting' },
];

export default function TransactionsScreen() {
  const user = useSession((s) => s.user);
  const theme = useTheme();
  const [filter, setFilter] = useState<Category | 'all'>('all');
  const [refreshing, setRefreshing] = useState(false);

  const { data, isLoading, refetch, isRefetching } = useTransactions(user?.id, {
    category: filter,
  });

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    void refetch().finally(() => setRefreshing(false));
  }, [refetch]);

  return (
    <ThemedView surface="background" style={styles.root}>
      <View style={styles.head}>
        <ThemedText variant="h2">Transactions</ThemedText>
        <ThemedText variant="caption" color="textSecondary">
          Every order, deposit and commission.
        </ThemedText>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing || isRefetching} onRefresh={onRefresh} />
        }>
        <ChipRow style={{ marginBottom: Spacing.lg }}>
          {FILTERS.map((f) => (
            <Chip
              key={f.value}
              label={f.label}
              selected={filter === f.value}
              onPress={() => setFilter(f.value)}
            />
          ))}
        </ChipRow>

        {isLoading ? (
          <SkeletonList rows={8} />
        ) : !data || data.length === 0 ? (
          <Card>
            <EmptyState
              icon={<Ionicons name="receipt-outline" size={40} color="#94A19B" />}
              title="Nothing here yet"
              message="Your airtime, data and bill payments will appear here."
            />
          </Card>
        ) : (
          <Card padded={false} style={styles.listCard}>
            {data.map((tx) => (
              <TransactionRow key={tx.id} tx={tx} theme={theme} />
            ))}
          </Card>
        )}
      </ScrollView>
    </ThemedView>
  );
}

function TransactionRow({ tx, theme }: { tx: Transaction; theme: ReturnType<typeof useTheme> }) {
  const isCredit = tx.product.includes('Funding');
  return (
    <View style={styles.row}>
      <View style={[styles.avatarWrap, { backgroundColor: theme.skeleton }]}>
        <CategoryIcon category={tx.category} size={20} />
      </View>
      <View style={styles.rowBody}>
        <ThemedText variant="captionStrong" numberOfLines={1}>
          {tx.product}
        </ThemedText>
        <ThemedText variant="small" color="textMuted">
          {formatRelativeDate(tx.createdAt)}
        </ThemedText>
        <ThemedText variant="tiny" color="textMuted">
          {tx.reference}
        </ThemedText>
      </View>
      <View style={styles.rowEnd}>
        <ThemedText variant="captionStrong" color={isCredit ? 'success' : 'text'}>
          {isCredit ? '+' : '-'}
          {formatNaira(tx.amount, { decimals: false })}
        </ThemedText>
        <Badge
          small
          tone={tx.status === 'success' ? 'success' : tx.status === 'pending' ? 'warning' : 'danger'}>
          {tx.status}
        </Badge>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  head: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.md, gap: 4 },
  content: { padding: Spacing.lg, paddingTop: Spacing.sm, paddingBottom: 120 },
  listCard: { paddingHorizontal: Spacing.lg },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E4E9E6',
  },
  avatarWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowBody: { flex: 1, gap: 1 },
  rowEnd: { alignItems: 'flex-end', gap: 4 },
});