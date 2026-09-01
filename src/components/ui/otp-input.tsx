import { useRef, useState } from 'react';
import {
  Keyboard,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type TextInput as TextInputType,
} from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { isValidOtp } from '@/lib/validate';

export function OTPInput({
  length = 6,
  value,
  onChange,
  error,
  autoFocus = true,
}: {
  length?: number;
  value: string;
  onChange: (v: string) => void;
  error?: boolean;
  autoFocus?: boolean;
}) {
  const theme = useTheme();
  const refs = useRef<(TextInputType | null)[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  const digits = value.split('');

  const setAt = (index: number, char: string) => {
    const next = digits.slice();
    next[index] = char;
    const joined = next.join('').slice(0, length);
    onChange(joined);
    return joined.length;
  };

  const handleKeyPress = (index: number, key: string) => {
    if (key === 'Backspace') {
      if (digits[index]) {
        onChange(digits.slice(0, index).join('') + digits.slice(index + 1).join(''));
      } else if (index > 0) {
        onChange(digits.slice(0, index - 1).join(''));
        refs.current[index - 1]?.focus();
      }
    }
  };

  return (
    <View style={styles.row}>
      {Array.from({ length }).map((_, i) => {
        const filled = Boolean(digits[i]);
        const isActive = i === activeIndex;
        return (
          <Pressable key={i} onPress={() => refs.current[i]?.focus()} style={{ flex: 1 }}>
            <TextInput
              ref={(el) => {
                refs.current[i] = el;
              }}
              value={digits[i] ?? ''}
              maxLength={1}
              autoFocus={autoFocus && i === 0}
              keyboardType="number-pad"
              selectionColor={theme.primary}
              onFocus={() => setActiveIndex(i)}
              onBlur={() => setActiveIndex(-1)}
              onChangeText={(text) => {
                const char = text.replace(/\D/g, '');
                if (!char) {
                  handleKeyPress(i, 'Backspace');
                  return;
                }
                const len = setAt(i, char);
                if (i < length - 1) {
                  refs.current[i + 1]?.focus();
                } else {
                  Keyboard.dismiss();
                }
                if (!error && len === length) {
                  // all filled
                }
              }}
              onKeyPress={({ nativeEvent }) => handleKeyPress(i, nativeEvent.key)}
              editable
              style={[
                styles.box,
                {
                  backgroundColor: theme.surface,
                  borderColor: filled
                    ? theme.primary
                    : isActive
                      ? theme.primary
                      : error
                        ? theme.danger
                        : theme.border,
                  color: theme.text,
                },
              ]}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

export function isValidOtpValue(v: string, length: number) {
  return isValidOtp(v, length);
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: Spacing.sm },
  box: {
    borderWidth: 1.5,
    borderRadius: Radius.md,
    height: 58,
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
});