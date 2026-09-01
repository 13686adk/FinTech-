import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { PinDots, PinPad } from '@/components/ui/pin-pad';
import { Screen } from '@/components/ui/screen';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { setBiometricEnabled } from '@/services/storage/secure';
import { useApp } from '@/store/app-store';
import { useSession } from '@/store/session-store';

export default function CreatePinScreen() {
  const params = useLocalSearchParams<{ welcome?: string }>();
  const theme = useTheme();
  const showToast = useApp((s) => s.showToast);
  const savePin = useSession((s) => s.savePin);
  const [pin, setPin] = useState('');
  const [confirm, setConfirm] = useState('');
  const [biometricAvailable, setBiometricAvailable] = useState<boolean | null>(null);

  const step = useMemo(() => (pin.length === 4 && confirm.length < 4 ? 2 : confirm.length === 4 ? 3 : 1), [pin, confirm]);

  useMemo(() => {
    void LocalAuthentication.hasHardwareAsync()
      .then((h) => (h ? LocalAuthentication.isEnrolledAsync() : false))
      .then(setBiometricAvailable);
  }, []);

  const handleDigit = (d: string) => {
    if (step === 1) {
      setPin((p) => (p.length < 4 ? p + d : p));
    } else {
      setConfirm((c) => (c.length < 4 ? c + d : c));
    }
  };

  const handleBackspace = () => {
    if (step === 1) {
      setPin((p) => p.slice(0, -1));
    } else if (confirm.length === 0) {
      setPin((p) => p.slice(0, -1));
    } else {
      setConfirm((c) => c.slice(0, -1));
    }
  };

  const enableBiometric = async () => {
    try {
      const res = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Confirm with Face ID / fingerprint',
        cancelLabel: 'Not now',
      });
      if (res.success) {
        await setBiometricEnabled(true);
        showToast('Biometric lock enabled', 'success');
      }
    } catch {
      // user cancelled
    }
  };

  const finish = async () => {
    await savePin(pin);
    if (biometricAvailable === true) {
      await enableBiometric();
    }
    showToast(
      params.welcome ? 'Account ready — welcome to SwiftTop!' : 'Security PIN created',
      'success',
    );
    router.replace('/(tabs)');
  };

  const title =
    step === 1 ? 'Create a 4-digit PIN' : step === 2 ? 'Confirm your PIN' : 'PIN saved';
  const subtitle =
    step === 1
      ? 'This PIN protects your wallet and signs every transaction.'
      : step === 2
        ? 'Enter the same PIN once more to continue.'
        : '';

  return (
    <Screen title="Secure your account" subtitle="Set up your transaction PIN">
      <View style={styles.body}>
        <ThemedText variant="h3" style={{ textAlign: 'center' }}>
          {title}
        </ThemedText>
        <ThemedText variant="caption" color="textSecondary" style={{ textAlign: 'center' }}>
          {subtitle}
        </ThemedText>

        <View style={styles.dotsWrap}>
          <PinDots entered={step === 1 ? pin.length : confirm.length} error={Boolean(pin && pin.length < 4 && step === 3)} />
        </View>

        {step === 3 && (
          <View style={{ alignItems: 'center', gap: Spacing.md }}>
            <ThemedText variant="bodyStrong">All set 🎉</ThemedText>
            <Pressable onPress={finish} style={[styles.bioRow, { backgroundColor: theme.primarySoft }]}>
              <Ionicons name="finger-print-outline" size={20} color={theme.primary} />
              <ThemedText variant="caption" color="primary">
                {biometricAvailable ? 'Enable Face ID / fingerprint' : 'Continue without biometrics'}
              </ThemedText>
            </Pressable>
          </View>
        )}

        <View style={styles.padWrap}>
          <PinPad onDigit={handleDigit} onBackspace={handleBackspace} disabled={step === 3} />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { paddingTop: Spacing.xxl },
  dotsWrap: { marginTop: Spacing.xxl, marginBottom: Spacing.md },
  padWrap: { marginTop: Spacing.xl, alignItems: 'center' },
  bioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: 24,
  },
});