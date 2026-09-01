import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useApp, type ToastItem } from '@/store/app-store';

const toneBg = (t: ReturnType<typeof useTheme>, tone: ToastItem['tone']) => {
  switch (tone) {
    case 'success':
      return t.successSoft;
    case 'error':
      return t.dangerSoft;
    case 'warning':
      return t.warningSoft;
    default:
      return t.surface;
  }
};

const toneFg = (t: ReturnType<typeof useTheme>, tone: ToastItem['tone']) => {
  switch (tone) {
    case 'success':
      return t.success;
    case 'error':
      return t.danger;
    case 'warning':
      return t.warning;
    default:
      return t.text;
  }
};

function ToastCard({ toast }: { toast: ToastItem }) {
  const theme = useTheme();
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(24);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 220 });
    translateY.value = withSpring(0, { damping: 16, stiffness: 180 });
    const timer = setTimeout(() => useApp.getState().dismissToast(toast.id), 4000);
    return () => clearTimeout(timer);
  }, [opacity, toast.id, translateY]);

  return (
    <Animated.View
      style={[
        styles.card,
        {
          backgroundColor: toneBg(theme, toast.tone),
          borderColor: theme.border,
          opacity,
          transform: [{ translateY }],
        },
      ]}>
      <ThemedText variant="captionStrong" style={{ color: toneFg(theme, toast.tone) }}>
        {toast.message}
      </ThemedText>
    </Animated.View>
  );
}

export function ToastHost() {
  const toasts = useApp((s) => s.toasts);
  return (
    <SafeAreaView pointerEvents="box-none" style={styles.container}>
      {toasts.slice(-3).map((t) => (
        <ToastCard key={t.id} toast={t} />
      ))}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: Spacing.lg,
    right: Spacing.lg,
    bottom: 90,
    alignItems: 'center',
    gap: Spacing.sm,
    zIndex: 1000,
    elevation: 10,
  },
  card: {
    maxWidth: 520,
    width: '100%',
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderWidth: StyleSheet.hairlineWidth,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
});