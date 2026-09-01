import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppColors } from '@/constants/theme';

export function NetworkBadge({ network, size = 44 }: { network: string; size?: number }) {
  const color = (AppColors.networks as Record<string, string>)[network] ?? '#888';
  return (
    <View
      style={[
        styles.badge,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
      ]}>
      <ThemedText style={{ fontSize: size * 0.34, fontWeight: '900', color: '#fff' }}>
        {networkLabel(network)[0]}
      </ThemedText>
    </View>
  );
}

export function ProviderBadge({ provider, size = 44 }: { provider: string; size?: number }) {
  const color =
    (AppColors.providers as Record<string, string>)[provider] ??
    (AppColors.networks as Record<string, string>)[provider] ??
    '#666';
  const label = providerLabel(provider);
  return (
    <View
      style={[
        styles.badge,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: color,
        },
      ]}>
      <ThemedText style={{ fontSize: size * 0.28, fontWeight: '900', color: '#fff' }}>
        {label[0]}
      </ThemedText>
    </View>
  );
}

export function networkLabel(network?: string): string {
  switch (network) {
    case 'mtn':
      return 'MTN';
    case 'glo':
      return 'Glo';
    case 'airtel':
      return 'Airtel';
    case '9mobile':
      return '9mobile';
    default:
      return network ?? '—';
  }
}

export function providerLabel(provider?: string): string {
  switch (provider) {
    case 'dstv':
      return 'DStv';
    case 'gotv':
      return 'GOtv';
    case 'startimes':
      return 'StarTimes';
    case 'showmax':
      return 'Showmax';
    case 'bet9ja':
      return 'Bet9ja';
    case 'nairabet':
      return 'NairaBet';
    case '1xbet':
      return '1xBet';
    case 'betking':
      return 'BetKing';
    case 'waec':
      return 'WAEC';
    case 'neco':
      return 'NECO';
    case 'nabteb':
      return 'NABTEB';
    case 'jamb':
      return 'JAMB';
    default:
      return provider ?? '—';
  }
}

const styles = StyleSheet.create({
  badge: { alignItems: 'center', justifyContent: 'center' },
});