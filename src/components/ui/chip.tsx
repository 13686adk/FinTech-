import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: React.ReactNode;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  suffix?: string;
  selectedColor?: string;
}

export function Chip({
  label,
  selected = false,
  onPress,
  icon,
  disabled,
  style,
  suffix,
  selectedColor,
}: ChipProps) {
  const theme = useTheme();
  const accent = selectedColor ?? theme.primary;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected ? accent : theme.surface,
          borderColor: selected ? accent : theme.border,
          opacity: disabled ? 0.4 : pressed ? 0.9 : 1,
        },
        style,
      ]}>
      {icon ? <View style={styles.icon}>{icon}</View> : null}
      <ThemedText
        variant="captionStrong"
        style={{ color: selected ? theme.onPrimary : theme.textSecondary }}
        numberOfLines={1}>
        {label}
      </ThemedText>
      {suffix ? (
        <ThemedText
          variant="tiny"
          style={{ color: selected ? theme.onPrimary : theme.textMuted }}>
          {suffix}
        </ThemedText>
      ) : null}
    </Pressable>
  );
}

export function ChipRow({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.row, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.md,
    borderWidth: 1.5,
    maxWidth: '100%',
  },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  icon: {},
});