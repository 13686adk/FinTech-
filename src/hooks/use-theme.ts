import { darkTheme, lightTheme, type ThemeTokens } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function useTheme(): ThemeTokens {
  const scheme = useColorScheme();
  return scheme === 'dark' ? darkTheme : lightTheme;
}

export function useThemeMode(): 'light' | 'dark' {
  return useTheme().mode;
}