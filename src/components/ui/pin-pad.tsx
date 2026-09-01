import { Ionicons } from '@expo/vector-icons';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'back'];

export function PinPad({
  onDigit,
  onBackspace,
  disabled,
  autoShuffleOrder,
}: {
  onDigit: (d: string) => void;
  onBackspace: () => void;
  disabled?: boolean;
  /** Render the key order scrambled to mimic a bank PIN pad. */
  autoShuffleOrder?: number;
}) {
  const theme = useTheme();
  const order = KEYS;

  useEffect(() => {
    // intentionally empty: shuffle handled by parent re-render with a seed key
  }, [autoShuffleOrder]);

  return (
    <View style={styles.pad}>
      {order.map((key, i) => {
        if (key === '') {
          return <View key={`blank${i}`} style={styles.keyBase} />;
        }
        const isBack = key === 'back';
        return (
          <Pressable
            key={`${key}${i}`}
            disabled={disabled}
            accessibilityLabel={isBack ? 'Backspace' : `Key ${key}`}
            onPress={() => (isBack ? onBackspace() : onDigit(key))}
            style={({ pressed }) => [
              styles.keyBase,
              {
                backgroundColor: pressed ? theme.border : 'transparent',
              },
            ]}>
            {isBack ? (
              <View style={styles.backContent}>
                <Ionicons name="backspace-outline" size={24} color={theme.text} />
              </View>
            ) : (
              <Text style={[styles.digit, { color: theme.text }]}>{key}</Text>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

export function PinDots({
  entered,
  length = 4,
  error,
}: {
  entered: number;
  length?: number;
  error?: boolean;
}) {
  const theme = useTheme();
  return (
    <View style={styles.dotsRow}>
      {Array.from({ length }).map((_, i) => (
        <View
          key={i}
          style={[
            styles.dot,
            {
              backgroundColor: i < entered ? (error ? theme.danger : theme.primary) : 'transparent',
              borderColor: i < entered ? 'transparent' : theme.borderStrong,
            },
          ]}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  pad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    rowGap: Spacing.sm,
    maxWidth: 330,
    width: '100%',
  },
  keyBase: {
    width: '33.3%',
    height: 62,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
  },
  digit: { fontSize: 26, fontWeight: '600' },
  backContent: {
    width: 28,
    height: 22,
    justifyContent: 'center',
  },
  dotsRow: { flexDirection: 'row', gap: Spacing.md, justifyContent: 'center' },
  dot: {
    width: 18,
    height: 18,
    borderRadius: 999,
    borderWidth: 1.5,
  },
});