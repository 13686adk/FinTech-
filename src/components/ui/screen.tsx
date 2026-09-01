import { type PropsWithChildren } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type ScrollViewProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Spacing } from '@/constants/theme';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

type ScreenProps = PropsWithChildren<{
  title?: string;
  subtitle?: string;
  headerRight?: React.ReactNode;
  scroll?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
  padded?: boolean;
  scrollProps?: ScrollViewProps;
  page?: boolean;
}>;

export function Screen({
  title,
  subtitle,
  headerRight,
  scroll = true,
  padded = true,
  contentContainerStyle,
  scrollProps,
  children,
}: ScreenProps) {
  const body = scroll ? (
    <ScrollView
      {...scrollProps}
      contentContainerStyle={[
        styles.scrollContent,
        padded && styles.padded,
        contentContainerStyle,
      ]}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}>
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.flex, padded && styles.padded, contentContainerStyle]}>{children}</View>
  );

  return (
    <ThemedView surface="background" style={styles.root}>
      <SafeAreaView style={styles.safe} edges={['top']}>
        {(title || headerRight) && (
          <View style={styles.header}>
            <View style={styles.headerText}>
              {title ? <ThemedText variant="h2">{title}</ThemedText> : null}
              {subtitle ? (
                <ThemedText variant="caption" color="textSecondary">
                  {subtitle}
                </ThemedText>
              ) : null}
            </View>
            {headerRight}
          </View>
        )}
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {body}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  flex: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 96 },
  padded: { paddingHorizontal: Spacing.lg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: Spacing.md,
  },
  headerText: { flex: 1, gap: 2 },
});