import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { CategoryIcon, categoryMeta } from '@/components/brand/category-icon';
import { NetworkBadge } from '@/components/brand/network-badge';
import { WalletCard } from '@/components/brand/wallet-card';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Badge } from '@/components/ui/badge';
import { Card, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { SkeletonList } from '@/components/ui/skeleton';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useWallet, useTransactions, useCatalog } from '@/hooks/use-vtu';
import { formatNaira, formatRelativeDate, initials } from '@/lib/format';
import type { Category } from '@/services/api/types';
import { useSession } from '@/store/session-store';

export const QUICK_ACTIONS: { category: Category; route: string }[] = [
  { category: 'airtime', route: '/buy/airtime' },
  { category: 'data', route: '/buy/data' },
  { category: 'cable', route: '/buy/cable' },
  { category: 'electricity', route: '/buy/electricity' },
  { category: 'education', route: '/buy/education' },
  { category: 'betting', route: '/buy/betting' },
];

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const user = useSession((s) => s.user);
  const [masked, setMasked] = useState(false);

  const wallet = useWallet(user?.id);
  const transactions = useTransactions(user?.id);
  const catalog = useCatalog();

  const recent = transactions.data?.slice(0, 5) ?? [];
  const popular =
    catalog.data?.dataPlans.filter((p) => p.popular).slice(0, 6) ?? [];

  return (
    <ThemedView surface="background" style={styles.root}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.greeting}>
            <View style={styles.avatar}>
              <ThemedText variant="bodyStrong" style={{ color: '#fff' }}>
                {initials(user?.name ?? 'SwiftTop')}
              </ThemedText>
            </View>
            <View>
              <ThemedText variant="caption" color="textSecondary">
                Good {greeting()},
              </ThemedText>
              <ThemedText variant="bodyStrong">{firstName(user?.name)}</ThemedText>
            </View>
          </View>
          <Badge tone="success" small>
            {user?.tier ?? 'starter'}
          </Badge>
        </View>

        <WalletCard
          balance={wallet.data?.balance ?? 0}
          masked={masked}
          onToggleMask={() => setMasked((m) => !m)}
          onFund={() => router.push('/wallet')}
          referralCode={user?.referralCode}
          loading={wallet.isLoading}
        />

        <View style={styles.quickWrap}>
          <CardTitle title="Quick actions" />
          <View style={styles.quickGrid}>
            {QUICK_ACTIONS.map((a) => (
              <Pressable
                key={a.category}
                style={[styles.quickItem, { backgroundColor: theme.surface, borderColor: theme.border }]}
                onPress={() => router.push(a.route as never)}>
                <CategoryIcon category={a.category} size={26} />
                <ThemedText variant="small" color="textSecondary" numberOfLines={2}>
                  {categoryMeta[a.category].label}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </View>

        {popular.length > 0 ? (
          <View>
            <CardTitle title="Popular data" actionLabel="See all" onAction={() => router.push('/buy/data')} />
            <View style={{ gap: Spacing.sm }}>
              {popular.map((plan) => (
                <Card key={plan.id} style={styles.planRow} onPress={() => router.push('/buy/data')}>
                  <NetworkBadge network={plan.network} size={40} />
                  <View style={{ flex: 1 }}>
                    <ThemedText variant="captionStrong">{plan.name}</ThemedText>
                    <ThemedText variant="small" color="textMuted">
                      {plan.validity}
                    </ThemedText>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <ThemedText variant="bodyStrong" color="primary">
                      {formatNaira(plan.sellingPrice, { decimals: false })}
                    </ThemedText>
                    <ThemedText variant="tiny" color="textMuted">
                      {plan.size}
                    </ThemedText>
                  </View>
                </Card>
              ))}
            </View>
          </View>
        ) : null}

        <View style={{ marginTop: Spacing.lg }}>
          <CardTitle
            title="Recent transactions"
            actionLabel="View all"
            onAction={() => router.push('/transactions')}
          />
          {transactions.isLoading ? (
            <SkeletonList rows={4} />
          ) : recent.length === 0 ? (
            <Card>
              <EmptyState
                icon={<Ionicons name="receipt-outline" size={40} color="#94A19B" />}
                title="No transactions yet"
                message="Buy airtime or data to see your activity here."
              />
            </Card>
          ) : (
            <Card padded={false} style={styles.txCard}>
              {recent.map((tx, i) => (
                <View key={tx.id}>
                  {i > 0 ? <View style={styles.divider} /> : null}
                  <Pressable
                    style={styles.txRow}
                    onPress={() => router.push('/transactions')}>
                    <CategoryIcon category={tx.category} size={22} />
                    <View style={{ flex: 1 }}>
                      <ThemedText variant="captionStrong" numberOfLines={1}>
                        {tx.product}
                      </ThemedText>
                      <ThemedText variant="small" color="textMuted">
                        {formatRelativeDate(tx.createdAt)}
                      </ThemedText>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <ThemedText variant="captionStrong">
                        -{formatNaira(tx.amount, { decimals: false })}
                      </ThemedText>
                      <Badge tone={tx.status === 'success' ? 'success' : tx.status === 'pending' ? 'warning' : 'danger'} small>
                        {tx.status}
                      </Badge>
                    </View>
                  </Pressable>
                </View>
              ))}
            </Card>
          )}
        </View>

        <Pressable
          style={[styles.referralBanner, { backgroundColor: theme.goldSoft }]}
          onPress={() => router.push('/referral')}>
          <View style={styles.referralIcon}>
            <Ionicons name="gift" size={22} color={theme.gold} />
          </View>
          <View style={{ flex: 1 }}>
            <ThemedText variant="captionStrong">Refer friends, earn ₦500</ThemedText>
            <ThemedText variant="small" color="textSecondary">
              Share your code and get rewarded on every sign-up.
            </ThemedText>
          </View>
          <Ionicons name="chevron-forward" size={18} color={theme.gold} />
        </Pressable>
      </ScrollView>
    </ThemedView>
  );
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

function firstName(name?: string) {
  return name?.split(' ')[0] ?? 'there';
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: Spacing.lg, paddingBottom: 120, gap: Spacing.xl },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
  },
  greeting: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0BA163',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickWrap: { marginTop: Spacing.xs },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  quickItem: {
    width: '31.5%',
    flexGrow: 1,
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.sm,
    borderRadius: Radius.lg,
    borderWidth: 0.5,
  },
  planRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  txCard: { paddingHorizontal: Spacing.lg },
  txRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.md },
  divider: { height: 1, backgroundColor: '#E4E9E6' },
  referralBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    marginTop: Spacing.xs,
  },
  referralIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});