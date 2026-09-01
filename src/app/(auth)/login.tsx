import { router } from 'expo-router';

import { LogoMark, Wordmark } from '@/components/brand/logo-mark';
import { Screen } from '@/components/ui/screen';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useApp } from '@/store/app-store';
import { useSession } from '@/store/session-store';
import { useState } from 'react';
import { View } from 'react-native';
import { Spacing } from '@/constants/theme';
import { isValidPassword } from '@/lib/validate-password';

export default function LoginScreen() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const login = useSession((s) => s.login);
  const hasPin = useSession((s) => Boolean(s.pin));
  const showToast = useApp((s) => s.showToast);

  const submit = async () => {
    setError(null);
    if (!phone.trim()) {
      setError('Enter your phone number.');
      return;
    }
    if (!password || !isValidPassword(password)) {
      setError('Enter a password (at least 6 characters).');
      return;
    }
    setLoading(true);
    try {
      await login(phone.trim(), password);
      showToast('Welcome back!', 'success');
      router.replace(hasPin ? '/(tabs)' : '/(auth)/create-pin');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen
      title="Welcome back"
      subtitle="Sign in to continue to your wallet">
      <View style={{ paddingTop: Spacing.xxl }}>
        <View style={{ alignItems: 'center', marginBottom: Spacing.xxl }}>
          <LogoMark size={64} />
          <View style={{ marginTop: Spacing.md }}>
            <Wordmark size={20} />
          </View>
        </View>
        <Input
          label="Phone number"
          placeholder="0812 345 6789"
          keyboardType="phone-pad"
          autoComplete="tel"
          value={phone}
          onChangeText={setPhone}
        />
        <View style={{ height: Spacing.lg }} />
        <Input
          label="Password"
          placeholder="Your password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          error={error}
          onSubmitEditing={submit}
        />
        <View style={{ height: Spacing.xxl }} />
        <Button
          label="Sign in"
          onPress={submit}
          loading={loading}
          disabled={!phone || !password}
        />
      </View>
    </Screen>
  );
}