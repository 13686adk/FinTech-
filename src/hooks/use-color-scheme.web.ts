import { useColorScheme as useRNColorScheme } from 'react-native';

/**
 * Returns the active color scheme, defaulting to 'light' during static render
 * (web SSR) where the native hook reports null.
 */
export function useColorScheme() {
  return useRNColorScheme() ?? 'light';
}