import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack, useTheme as useNavTheme, ThemeProvider, type Theme } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';

import { ToastHost } from '@/components/ui/toast';
import { darkTheme, lightTheme } from '@/constants/theme';
import { useSession } from '@/store/session-store';

SplashScreen.preventAutoHideAsync();
void SplashScreen.setOptions?.({ duration: 400, fade: true });

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

function buildNavTheme(mode: 'light' | 'dark'): Theme {
  const tokens = mode === 'dark' ? darkTheme : lightTheme;
  return {
    dark: mode === 'dark',
    fonts: {
      regular: { fontFamily: undefined as never, fontWeight: '400' },
      medium: { fontFamily: undefined as never, fontWeight: '500' },
      bold: { fontFamily: undefined as never, fontWeight: '700' },
      heavy: { fontFamily: undefined as never, fontWeight: '900' },
    },
    colors: {
      primary: tokens.primary,
      background: tokens.background,
      card: tokens.background,
      text: tokens.text,
      border: tokens.border,
      notification: tokens.primary,
    },
  };
}

export default function RootLayout() {
  const scheme = useColorScheme();
  const mode = scheme === 'dark' ? 'dark' : 'light';
  const theme = useNavTheme();

  const restore = useSession((s) => s.restore);
  const bootstrapped = useSession((s) => s.bootstrapped);

  useEffect(() => {
    restore()
      .catch(() => {})
      .finally(() => {
        SplashScreen.hideAsync();
      });
  }, [restore]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={buildNavTheme(mode)}>
        <QueryClientProvider client={queryClient}>
          <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
          {bootstrapped && (
            <Stack
              screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
                contentStyle: { backgroundColor: theme.colors.background },
              }}>
              <Stack.Screen name="(auth)" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="buy" options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="checkout" options={{ presentation: 'transparentModal', animation: 'fade' }} />
              <Stack.Screen name="success" options={{ presentation: 'transparentModal', animation: 'fade' }} />
              <Stack.Screen name="referral" />
              <Stack.Screen name="security" />
              <Stack.Screen name="support" />
            </Stack>
          )}
          <ToastHost />
        </QueryClientProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}