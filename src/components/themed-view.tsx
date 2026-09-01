import { View, type ViewProps } from 'react-native';

import { useTheme } from '@/hooks/use-theme';

type Surface = 'background' | 'surface' | 'surfaceElevated' | 'transparent';

export type ThemedViewProps = ViewProps & {
  surface?: Surface;
};

export function ThemedView({ style, surface = 'background', ...otherProps }: ThemedViewProps) {
  const theme = useTheme();
  return (
    <View
      style={[{ backgroundColor: surface === 'transparent' ? 'transparent' : theme[surface] }, style]}
      {...otherProps}
    />
  );
}