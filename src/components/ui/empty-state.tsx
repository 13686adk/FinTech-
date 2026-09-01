import { View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

export function EmptyState({
  icon,
  title,
  message,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  message?: string;
  action?: React.ReactNode;
}) {
  return (
    <View
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.xxxxl,
        gap: Spacing.sm,
      }}>
      {icon ? <View style={{ marginBottom: Spacing.xs }}>{icon}</View> : null}
      <ThemedText variant="bodyStrong">{title}</ThemedText>
      {message ? (
        <ThemedText variant="small" color="textSecondary" style={{ textAlign: 'center' }}>
          {message}
        </ThemedText>
      ) : null}
      {action ? <View style={{ marginTop: Spacing.md }}>{action}</View> : null}
    </View>
  );
}