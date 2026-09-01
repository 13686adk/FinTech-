import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { LogoMark, Wordmark } from '@/components/brand/logo-mark';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Screen } from '@/components/ui/screen';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { normalizePhone, isValidEmail, isValidName, isValidPhone } from '@/lib/validate';
import { isValidPassword } from '@/lib/validate-password';
import { mockRequestOtp } from '@/services/auth/mock-auth';
import { useApp } from '@/store/app-store';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const showToast = useApp((s) => s.showToast);

  const submit = async () => {
    setError(null);
    if (!isValidName(name)) {
      setError('Please enter your full name.');
      return;
    }
    if (!isValidPhone(phone)) {
      setError('Enter a valid Nigerian mobile number.');
      return;
    }
    if (email && !isValidEmail(email)) {
      setError('Enter a valid email address (or leave it blank).');
      return;
    }
    if (!isValidPassword(password)) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const normalized = normalizePhone(phone);
      const { devCode } = await mockRequestOtp(normalized);
      showToast('OTP sent — demo code below', 'info');
      router.push({
        pathname: '/verify-otp',
        params: {
          mode: 'register',
          name: name.trim(),
          phone: normalized,
          email: email.trim(),
          password,
          referralCode: referralCode.trim(),
          devCode,
        },
      });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen title="Create account" subtitle="Start reselling in under two minutes">
      <View style={{ paddingTop: Spacing.lg }}>
        <View style={{ alignItems: 'center', marginBottom: Spacing.xxl }}>
          <LogoMark size={60} />
          <View style={{ marginTop: Spacing.md }}>
            <Wordmark size={19} />
          </View>
        </View>

        <Input label="Full name" placeholder="e.g. Chidi Okafor" autoComplete="name" value={name} onChangeText={setName} />
        <View style={{ height: Spacing.lg }} />
        <Input
          label="Phone number"
          placeholder="0812 345 6789"
          keyboardType="phone-pad"
          autoComplete="tel"
          value={phone}
          onChangeText={setPhone}
        />
        <View style={{ height: Spacing.lg }} />
        <Input label="Email (optional)" placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
        <View style={{ height: Spacing.lg }} />
        <Input
          label="Password"
          placeholder="Create a password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <View style={{ height: Spacing.lg }} />
        <Input
          label="Referral code (optional)"
          placeholder="STXXXXX"
          autoCapitalize="characters"
          value={referralCode}
          onChangeText={setReferralCode}
        />

        {error ? (
          <ThemedText variant="small" color="danger" style={{ marginTop: Spacing.md }}>
            {error}
          </ThemedText>
        ) : null}

        <View style={{ height: Spacing.xxl }} />
        <Button label="Continue" onPress={submit} loading={loading} disabled={!name || !phone || !password} />

        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: Spacing.lg }}>
          <Ionicons name="arrow-back" size={15} color="#94A19B" />
          <ThemedText variant="caption" color="textSecondary">
            Back
          </ThemedText>
        </Pressable>
      </View>
    </Screen>
  );
}