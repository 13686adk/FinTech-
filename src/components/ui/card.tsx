import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
  onPress?: () => void;
  surface?: 'surface' | 'surfaceElevated';
}

export function Card({ children, style, padded = true, onPress, surface = 'surface' }: CardProps) {
  const theme = useTheme();
  const content = (
    <View
      style={[
        styles.card,
        { backgroundColor: theme[surface], borderColor: theme.border },
        padded && styles.padded,
        style,
      ]}>
      {children}
    </View>
  );
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => (pressed ? [styles.press, { transform: [{ scale: 0.99 }] }] : null)}>
        {content}
      </Pressable>
    );
  }
  return content;
}

export function CardTitle({
  title,
  actionLabel,
  onAction,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.titleRow}>
      <ThemedText variant="bodyStrong">{title}</ThemedText>
      {actionLabel && onAction ? (
        <Pressable onPress={onAction} hitSlop={8}>
          <ThemedText variant="link" color="primary">
            {actionLabel}
          </ThemedText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  padded: { padding: Spacing.lg },
  press: {},
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
});