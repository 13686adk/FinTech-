import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export interface ListItemProps {
  icon?: React.ReactNode;
  title: string;
  subtitle?: string;
  value?: string;
  valueColor?: string;
  trailing?: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
}

export function ListItem({
  icon,
  title,
  subtitle,
  value,
  valueColor,
  trailing,
  onPress,
  disabled,
}: ListItemProps) {
  const theme = useTheme();
  const content = (
    <View style={styles.row}>
      {icon ? <View style={styles.icon}>{icon}</View> : null}
      <View style={styles.textWrap}>
        <ThemedText variant="bodyStrong" numberOfLines={1}>
          {title}
        </ThemedText>
        {subtitle ? (
          <ThemedText variant="small" color="textSecondary" numberOfLines={1}>
            {subtitle}
          </ThemedText>
        ) : null}
      </View>
      {value ? (
        <ThemedText variant="captionStrong" style={{ color: valueColor ?? theme.text }} numberOfLines={1}>
          {value}
        </ThemedText>
      ) : null}
      {trailing}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        disabled={disabled}
        style={({ pressed }) => [pressed && !disabled && { opacity: 0.7 }]}>
        {content}
      </Pressable>
    );
  }
  return content;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    minHeight: 60,
  },
  icon: { alignItems: 'center', justifyContent: 'center' },
  textWrap: { flex: 1, gap: 1 },
});