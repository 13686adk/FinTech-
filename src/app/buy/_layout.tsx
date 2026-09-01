import { router, Stack } from 'expo-router';
import { Pressable } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

export default function BuyLayout() {
  const theme = useTheme();
  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: theme.background },
        headerTintColor: theme.text,
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: '700' },
        headerLeft: () => (
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <ThemedText color="primary" style={{ fontSize: 26, lineHeight: 28 }}>
              ‹
            </ThemedText>
          </Pressable>
        ),
        contentStyle: { backgroundColor: theme.background },
      }}>
      <Stack.Screen name="airtime" options={{ title: 'Buy Airtime' }} />
      <Stack.Screen name="data" options={{ title: 'Buy Data' }} />
      <Stack.Screen name="cable" options={{ title: 'Cable TV' }} />
      <Stack.Screen name="electricity" options={{ title: 'Electricity' }} />
      <Stack.Screen name="education" options={{ title: 'Exam PIN' }} />
      <Stack.Screen name="betting" options={{ title: 'Betting' }} />
    </Stack>
  );
}