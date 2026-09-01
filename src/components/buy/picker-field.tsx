import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export interface PickerOption {
  id: string;
  label: string;
  subtitle?: string;
  icon?: React.ReactNode;
  meta?: string;
}

export function PickerField({
  label,
  value,
  options,
  onSelect,
  placeholder = 'Select an option',
  disabled,
}: {
  label: string;
  value?: PickerOption;
  options: PickerOption[];
  onSelect: (option: PickerOption) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <View style={{ gap: Spacing.xs }}>
      <ThemedText variant="captionStrong" color="textSecondary">
        {label}
      </ThemedText>
      <Pressable
        disabled={disabled}
        onPress={() => setOpen(true)}
        style={[
          styles.field,
          { backgroundColor: theme.surface, borderColor: theme.border, opacity: disabled ? 0.4 : 1 },
        ]}>
        {value?.icon ? <View style={styles.icon}>{value.icon}</View> : null}
        <View style={{ flex: 1 }}>
          <ThemedText variant="bodyStrong" numberOfLines={1}>
            {value?.label ?? placeholder}
          </ThemedText>
          {value?.subtitle ? (
            <ThemedText variant="small" color="textSecondary" numberOfLines={1}>
              {value.subtitle}
            </ThemedText>
          ) : null}
        </View>
        {value?.meta ? (
          <ThemedText variant="captionStrong" color="primary">
            {value.meta}
          </ThemedText>
        ) : null}
        <Ionicons name="chevron-down" size={18} color={theme.textMuted} />
      </Pressable>

      <BottomSheet visible={open} onClose={() => setOpen(false)} title={label}>
        <View style={{ gap: Spacing.xs }}>
          {options.map((option) => {
            const selected = option.id === value?.id;
            return (
              <Pressable
                key={option.id}
                onPress={() => {
                  onSelect(option);
                  setOpen(false);
                }}
                style={[
                  styles.option,
                  { backgroundColor: selected ? theme.primarySoft : theme.surface },
                ]}>
                {option.icon ? <View style={styles.icon}>{option.icon}</View> : null}
                <View style={{ flex: 1 }}>
                  <ThemedText variant="bodyStrong">{option.label}</ThemedText>
                  {option.subtitle ? (
                    <ThemedText variant="small" color="textSecondary" numberOfLines={1}>
                      {option.subtitle}
                    </ThemedText>
                  ) : null}
                </View>
                {option.meta ? (
                  <ThemedText variant="captionStrong" color="primary">
                    {option.meta}
                  </ThemedText>
                ) : null}
                {selected ? (
                  <Ionicons name="checkmark-circle" size={20} color="#0BA163" />
                ) : null}
              </Pressable>
            );
          })}
        </View>
      </BottomSheet>
    </View>
  );
}

export function AmountChips({
  amounts,
  selected,
  onSelect,
  suffix = '',
}: {
  amounts: number[];
  selected: number | null;
  onSelect: (a: number) => void;
  suffix?: string;
}) {
  const theme = useTheme();
  return (
    <View style={styles.chipRow}>
      {amounts.map((a) => {
        const active = selected === a || (selected === null && a === amounts[0]);
        return (
          <Pressable
            key={a}
            onPress={() => onSelect(a)}
            style={[
              styles.amountChip,
              {
                backgroundColor: active ? theme.primary : theme.surface,
                borderColor: active ? theme.primary : theme.border,
              },
            ]}>
            <ThemedText
              variant="captionStrong"
              style={{ color: active ? theme.onPrimary : theme.textSecondary }}>
              ₦{a.toLocaleString()}
              {suffix}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderWidth: 1.5,
    borderRadius: Radius.md,
    minHeight: 56,
    paddingHorizontal: Spacing.lg,
  },
  icon: { alignItems: 'center', justifyContent: 'center' },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: Radius.md,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  amountChip: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm + 2,
    borderRadius: Radius.md,
    borderWidth: 1.5,
  },
});