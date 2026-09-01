import { useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { MaxContentWidth, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function BottomSheet({
  visible,
  onClose,
  title,
  subtitle,
  children,
  height = 0.68,
}: {
  visible: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  height?: number;
}) {
  const theme = useTheme();
  const { height: winHeight, width } = useWindowDimensions();
  const [mounted, setMounted] = useState(() => visible);

  const sheetHeight = Math.min(winHeight * height, 640);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
      onShow={() => setMounted(true)}
      onDismiss={() => setMounted(false)}>
      {mounted && (
        <View style={styles.root}>
          <Pressable style={[StyleSheet.absoluteFill, styles.backdrop, { backgroundColor: theme.overlay }]} onPress={onClose} />
          <View
            style={[
              styles.sheet,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
                height: sheetHeight,
                maxWidth: MaxContentWidth,
                width: width > MaxContentWidth ? MaxContentWidth : undefined,
                alignSelf: 'center',
              },
            ]}>
            <View style={styles.handle} />
            <View style={styles.header}>
              <View style={{ flex: 1 }}>
                <ThemedText variant="h3">{title}</ThemedText>
                {subtitle ? (
                  <ThemedText variant="small" color="textSecondary">
                    {subtitle}
                  </ThemedText>
                ) : null}
              </View>
              <Pressable onPress={onClose} hitSlop={10} style={styles.close}>
                <ThemedText style={{ color: theme.textSecondary, fontSize: 20 }}>✕</ThemedText>
              </Pressable>
            </View>
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.content}
              bounces={false}>
              {children}
            </ScrollView>
          </View>
        </View>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {},
  sheet: {
    borderTopLeftRadius: Radius.xxl,
    borderTopRightRadius: Radius.xxl,
    borderWidth: StyleSheet.hairlineWidth,
    paddingTop: Spacing.sm,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  handle: {
    alignSelf: 'center',
    width: 42,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#CBD5D2',
    marginBottom: Spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.xxl,
    paddingBottom: Spacing.md,
    gap: Spacing.sm,
  },
  close: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00000010',
  },
  content: { paddingHorizontal: Spacing.xxl, paddingBottom: Spacing.xxxl },
});