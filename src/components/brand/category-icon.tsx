import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import type { Category } from '@/services/api/types';
import { useTheme } from '@/hooks/use-theme';

export const categoryMeta: Record<
  Category,
  { icon: keyof typeof Ionicons.glyphMap; color: string; label: string }
> = {
  airtime: { icon: 'phone-portrait-outline', color: '#16A34A', label: 'Airtime' },
  data: { icon: 'wifi-outline', color: '#2563EB', label: 'Data' },
  cable: { icon: 'tv-outline', color: '#9333EA', label: 'Cable TV' },
  electricity: { icon: 'flash-outline', color: '#F59E0B', label: 'Electricity' },
  education: { icon: 'school-outline', color: '#DC2626', label: 'Exam PIN' },
  betting: { icon: 'dice-outline', color: '#0D9488', label: 'Betting' },
};

export function CategoryIcon({
  category,
  size = 26,
  soft = false,
}: {
  category: Category;
  size?: number;
  soft?: boolean;
}) {
  const theme = useTheme();
  const meta = categoryMeta[category];
  if (soft) {
    return (
      <View
        style={[
          styles.soft,
          {
            width: size + 16,
            height: size + 16,
            borderRadius: (size + 16) / 2,
            backgroundColor: theme.primarySoft,
          },
        ]}>
        <Ionicons name={meta.icon} size={size} color={theme.primary} />
      </View>
    );
  }
  return <Ionicons name={meta.icon} size={size} color={meta.color} />;
}

export function categoryLabel(category: Category | string): string {
  return categoryMeta[category as Category]?.label ?? category;
}

const styles = StyleSheet.create({
  soft: { alignItems: 'center', justifyContent: 'center' },
});