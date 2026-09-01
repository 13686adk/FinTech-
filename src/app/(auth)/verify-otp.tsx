import { Ionicons } from '@expo/vector-icons';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { OTPInput } from '@/components/ui/otp-input';
import { Button } from '@/components/ui/button';
import { Screen } from '@/components/ui/screen';
import { ThemedText } from '@/components/themed-text';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useApp } from '@/store/app-store';
import { useSession } from '@/store/session-store';
import { mockRequestOtp, mockVerifyOtp } from '@/services/auth/mock-auth';

export default function VerifyOtpScreen() {
  const params = useLocalSearchParams<{
    mode: 'register' | 'login';
    name?: string;
    phone: string;
    email?: string;
    password?: string;
    referralCode?: string;
    devCode?: string;
  }>();

  const theme = useTheme();
  const showToast = useApp((s) => s.showToast);
  const register = useSession((s) => s.register);
  const loginWithOtp = useSession((s) => s.loginWithOtp);
  const hasPin = useSession((s) => Boolean(s.pin));

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendIn, setResendIn] = useState(30);

  const maskedPhone = useMemo(() => {
    const p = String(params.phone);
    return p.length > 6 ? `${p.slice(0, 3)}******${p.slice(-3)}` : p;
  }, [params.phone]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  const verify = async () => {
    setError(null);
    setLoading(true);
    try {
      const ok = await mockVerifyOtp(String(params.phone), otp);
      if (!ok) {
        setError('Incorrect or expired code. Please try again.');
        return;
      }
      if (params.mode === 'register') {
        await register({
          name: String(params.name),
          phone: String(params.phone),
          password: String(params.password),
          email: params.email || undefined,
          ...(params.referralCode ? { referralCode: params.referralCode } : {}),
        });
        showToast('Account created! 🎉', 'success');
        router.replace('/(auth)/create-pin?welcome=1');
      } else {
        await loginWithOtp(String(params.phone));
        showToast('Signed in successfully', 'success');
        router.replace(hasPin ? '/(tabs)' : '/(auth)/create-pin');
      }
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    const { devCode } = await mockRequestOtp(String(params.phone));
    showToast(`New demo code: ${devCode}`, 'info');
    setResendIn(30);
  };

  const codeReady = otp.length === 6;

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: 'Verify phone', headerBackTitle: 'Back' }} />
      <Screen title="Enter verification code" subtitle={`We sent a 6-digit code to ${maskedPhone}`}>
        <View style={styles.body}>
          {params.devCode ? (
            <View style={[styles.demoBox, { backgroundColor: theme.primarySoft, borderColor: theme.primary }]}>
              <Ionicons name="flask-outline" size={18} color={theme.primary} />
              <View style={{ flex: 1 }}>
                <ThemedText variant="tiny" color="primary">
                  DEMO MODE — DEV CODE
                </ThemedText>
                <ThemedText variant="h3" color="primary" style={{ letterSpacing: 4 }}>
                  {params.devCode}
                </ThemedText>
              </View>
            </View>
          ) : null}

          <OTPInput value={otp} onChange={setOtp} error={Boolean(error)} />

          {error ? (
            <ThemedText variant="small" color="danger" style={styles.error}>
              {error}
            </ThemedText>
          ) : null}

          <View style={{ height: Spacing.xxl }} />
          <Button label="Verify & continue" onPress={verify} loading={loading} disabled={!codeReady} />

          <View style={styles.resendRow}>
            <ThemedText variant="small" color="textSecondary">
              {"Didn't get the code?"}
            </ThemedText>
            {resendIn > 0 ? (
              <ThemedText variant="small" color="textMuted">
                Resend in {resendIn}s
              </ThemedText>
            ) : (
              <Pressable onPress={resend} hitSlop={8}>
                <ThemedText variant="captionStrong" color="primary">
                  Resend code
                </ThemedText>
              </Pressable>
            )}
          </View>
        </View>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  body: { paddingTop: Spacing.xxl, gap: Spacing.lg },
  demoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  error: { marginTop: Spacing.xs },
  resendRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: Spacing.xs },
});