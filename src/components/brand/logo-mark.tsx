import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

export function LogoMark({ size = 44 }: { size?: number }) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.mark,
        {
          width: size,
          height: size,
          borderRadius: size * 0.28,
          backgroundColor: theme.primary,
        },
      ]}>
      <ThemedText
        variant="bodyStrong"
        style={{ color: theme.onPrimary, fontSize: size * 0.4, fontWeight: '900' }}>
        ST
      </ThemedText>
    </View>
  );
}

export function Wordmark({ size = 24, color }: { size?: number; color?: string }) {
  const theme = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'baseline' }}>
      <ThemedText style={{ color: color ?? theme.text, fontSize: size, fontWeight: '900' }}>
        Swift
      </ThemedText>
      <ThemedText style={{ color: theme.primary, fontSize: size, fontWeight: '900' }}>Top</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  mark: { alignItems: 'center', justifyContent: 'center' },
});