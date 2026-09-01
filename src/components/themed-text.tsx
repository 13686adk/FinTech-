import { StyleSheet, Text, type TextProps } from 'react-native';

import { Fonts } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type TextVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'body'
  | 'bodyStrong'
  | 'caption'
  | 'captionStrong'
  | 'small'
  | 'tiny'
  | 'label'
  | 'link'
  | 'linkPrimary'
  | 'code';

type TextColorKey =
  | 'text'
  | 'textSecondary'
  | 'textMuted'
  | 'textInverse'
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'gold'
  | 'onPrimary';

export type ThemedTextProps = TextProps & {
  variant?: TextVariant;
  color?: TextColorKey;
};

export function ThemedText({ style, variant = 'body', color = 'text', ...rest }: ThemedTextProps) {
  const theme = useTheme();
  return (
    <Text
      style={[styles.base, { color: theme[color] }, variantStyles[variant], style]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  base: { fontSize: 16, lineHeight: 24, fontWeight: '500' },
});

const variantStyles = StyleSheet.create({
  h1: { fontSize: 34, lineHeight: 40, fontWeight: '800', letterSpacing: -0.5 },
  h2: { fontSize: 26, lineHeight: 34, fontWeight: '800', letterSpacing: -0.3 },
  h3: { fontSize: 20, lineHeight: 28, fontWeight: '700' },
  body: { fontSize: 16, lineHeight: 24, fontWeight: '500' },
  bodyStrong: { fontSize: 16, lineHeight: 24, fontWeight: '700' },
  caption: { fontSize: 14, lineHeight: 20, fontWeight: '500' },
  captionStrong: { fontSize: 14, lineHeight: 20, fontWeight: '700' },
  small: { fontSize: 13, lineHeight: 18, fontWeight: '500' },
  tiny: { fontSize: 11, lineHeight: 16, fontWeight: '600', letterSpacing: 0.3 },
  label: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  link: { fontSize: 14, lineHeight: 20, fontWeight: '600' },
  linkPrimary: { fontSize: 14, lineHeight: 20, fontWeight: '700' },
  code: {
    fontFamily: Fonts.mono,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
});