import { useState } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export interface InputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  error?: string | null;
  hint?: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
  containerStyle?: TextInputProps['style'];
}

export function Input({
  label,
  error,
  hint,
  left,
  right,
  onFocus,
  onBlur,
  containerStyle,
  ...rest
}: InputProps) {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <View style={[styles.wrap, containerStyle]}>
      {label ? (
        <ThemedText variant="captionStrong" color="textSecondary" style={styles.label}>
          {label}
        </ThemedText>
      ) : null}
      <View
        style={[
          styles.box,
          {
            backgroundColor: theme.surface,
            borderColor: error ? theme.danger : focused ? theme.primary : theme.border,
          },
        ]}>
        {left ? <View style={styles.side}>{left}</View> : null}
        <TextInput
          placeholderTextColor={theme.textMuted}
          selectionColor={theme.primary}
          {...rest}
          style={[
            styles.input,
            { color: theme.text },
            left || right ? styles.inputWithSide : null,
            rest.multiline ? styles.multiline : null,
          ]}
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
        />
        {right ? <View style={styles.side}>{right}</View> : null}
      </View>
      {error ? (
        <ThemedText variant="small" color="danger" style={styles.message}>
          {error}
        </ThemedText>
      ) : hint ? (
        <ThemedText variant="small" color="textMuted" style={styles.message}>
          {hint}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: Spacing.xs },
  label: { marginLeft: Spacing.xs },
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.md,
    borderWidth: 1.5,
    minHeight: 52,
    overflow: 'hidden',
  },
  input: { flex: 1, paddingHorizontal: Spacing.lg, paddingVertical: Spacing.md, fontSize: 16 },
  inputWithSide: { paddingHorizontal: Spacing.sm },
  multiline: { minHeight: 96, textAlignVertical: 'top' },
  side: { paddingHorizontal: Spacing.md },
  message: { marginLeft: Spacing.xs },
});