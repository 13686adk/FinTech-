import * as Haptics from 'expo-haptics';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'soft';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'lg',
  loading = false,
  disabled = false,
  icon,
  style,
  accessibilityLabel,
}: ButtonProps) {
  const theme = useTheme();

  const containerStyle = [
    styles.base,
    styles[size],
    variantStyles(theme)[variant],
    (disabled || loading) && { opacity: 0.55 },
    style,
  ];

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={() => {
        void Haptics.selectionAsync();
        onPress();
      }}
      style={({ pressed }) => [
        containerStyle,
        styles.row,
        pressed && !disabled ? { transform: [{ scale: 0.985 }] } : null,
      ]}>
      {loading ? (
        <ActivityIndicator size="small" color={variant === 'primary' ? theme.onPrimary : theme.primary} />
      ) : (
        <>
          {icon}
          <Text style={[styles.label, variantTextStyles(theme)[variant], labelSizes[size]]}>{label}</Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  sm: { height: 40, paddingHorizontal: Spacing.lg },
  md: { height: 48, paddingHorizontal: Spacing.xl },
  lg: { height: 54, paddingHorizontal: Spacing.xxl },
  label: { fontSize: 15, fontWeight: '700' },
});

const variantStyles = (t: ReturnType<typeof useTheme>) => ({
  primary: { backgroundColor: t.primary },
  secondary: {
    backgroundColor: t.surface,
    borderWidth: 1,
    borderColor: t.borderStrong,
  },
  ghost: { backgroundColor: 'transparent' },
  danger: { backgroundColor: t.danger },
  soft: { backgroundColor: t.primarySoft },
});

const variantTextStyles = (t: ReturnType<typeof useTheme>) => ({
  primary: { color: t.onPrimary },
  secondary: { color: t.text },
  ghost: { color: t.primary },
  danger: { color: '#fff' },
  soft: { color: t.primary },
});

const labelSizes = {
  sm: { fontSize: 13 },
  md: { fontSize: 14 },
  lg: { fontSize: 15 },
} as const;