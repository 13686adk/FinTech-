import { View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type BadgeTone = 'success' | 'danger' | 'warning' | 'info' | 'neutral' | 'primary' | 'gold';

const toneMap = (t: ReturnType<typeof useTheme>) => ({
  success: { bg: t.successSoft, fg: t.success },
  danger: { bg: t.dangerSoft, fg: t.danger },
  warning: { bg: t.warningSoft, fg: t.warning },
  info: { bg: t.infoSoft, fg: t.info },
  neutral: { bg: t.skeleton, fg: t.textSecondary },
  primary: { bg: t.primarySoft, fg: t.primary },
  gold: { bg: t.goldSoft, fg: t.gold },
});

export function Badge({
  tone = 'neutral',
  children,
  small,
}: {
  tone?: BadgeTone;
  children: React.ReactNode;
  small?: boolean;
}) {
  const theme = useTheme();
  const colors = toneMap(theme)[tone];
  return (
    <View
      style={{
        backgroundColor: colors.bg,
        paddingHorizontal: small ? Spacing.sm : Spacing.md,
        paddingVertical: small ? 3 : Spacing.xs + 1,
        borderRadius: Radius.full,
        alignSelf: 'flex-start',
      }}>
      <ThemedText
        variant={small ? 'tiny' : 'small'}
        style={{ color: colors.fg, textTransform: 'capitalize', fontWeight: '700' }}>
        {children}
      </ThemedText>
    </View>
  );
}