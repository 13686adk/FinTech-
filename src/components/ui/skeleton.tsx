import { StyleSheet, View, type DimensionValue } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function Skeleton({ width = '100%', height = 16, radius = Radius.sm }: {
  width?: DimensionValue;
  height?: number;
  radius?: number;
}) {
  const theme = useTheme();
  return (
    <View
      style={{
        width,
        height,
        borderRadius: radius,
        backgroundColor: theme.skeleton,
      }}
    />
  );
}

export function SkeletonList({ rows = 5 }: { rows?: number }) {
  return (
    <View style={styles.list}>
      {Array.from({ length: rows }).map((_, i) => (
        <View key={i} style={styles.row}>
          <Skeleton width={44} height={44} radius={Radius.md} />
          <View style={styles.grow}>
            <Skeleton height={14} />
            <View style={styles.space} />
            <Skeleton width="60%" height={12} />
          </View>
          <Skeleton width={70} height={14} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: Spacing.lg },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  grow: { flex: 1 },
  space: { height: Spacing.xs },
});