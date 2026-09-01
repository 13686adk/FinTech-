import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Switch, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Card } from '@/components/ui/card';
import { ListItem } from '@/components/ui/list-item';
import { PinDots, PinPad } from '@/components/ui/pin-pad';
import { Screen } from '@/components/ui/screen';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { hasBiometricEnabled, setBiometricEnabled } from '@/services/storage/secure';
import { useApp } from '@/store/app-store';
import { useSession } from '@/store/session-store';

type PinStage = 'current' | 'new' | 'confirm';

export default function SecurityScreen() {
  const theme = useTheme();
  const showToast = useApp((s) => s.showToast);
  const checkPin = useSession((s) => s.checkPin);
  const savePin = useSession((s) => s.savePin);

  const [pinVisible, setPinVisible] = useState(false);
  const [stage, setStage] = useState<PinStage>('current');
  const [pin, setPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [error, setError] = useState(false);
  const [biometricOn, setBiometricOn] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  useEffect(() => {
    void (async () => {
      const enrolled = await LocalAuthentication.isEnrolledAsync();
      const on = await hasBiometricEnabled();
      setBiometricAvailable(enrolled);
      setBiometricOn(enrolled && on);
    })();
  }, []);

  const openSheet = () => {
    setStage('current');
    setPin('');
    setNewPin('');
    setError(false);
    setPinVisible(true);
  };

  const handleDigit = (d: string) => {
    const next = pin + d;
    setPin(next);
    if (next.length === 4) {
      void advance(next);
    }
  };

  const backspace = () => {
    setPin((p) => p.slice(0, -1));
    setError(false);
  };

  const advance = async (value: string) => {
    if (stage === 'current') {
      const ok = await checkPin(value);
      if (!ok) {
        setError(true);
        setPin('');
        return;
      }
      setStage('new');
      setPin('');
    } else if (stage === 'new') {
      setNewPin(value);
      setStage('confirm');
      setPin('');
    } else {
      if (value !== newPin) {
        setError(true);
        setPin('');
        setStage('new');
        showToast("PINs didn't match. Try again.", 'error');
        return;
      }
      await savePin(value);
      setPinVisible(false);
      showToast('PIN changed successfully', 'success');
    }
  };

  const toggleBiometric = async (value: boolean) => {
    if (value) {
      const res = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Confirm to enable biometric lock',
        cancelLabel: 'Not now',
      });
      if (res.success) {
        await setBiometricEnabled(true);
        setBiometricOn(true);
        showToast('Biometric lock enabled', 'success');
      }
    } else {
      await setBiometricEnabled(false);
      setBiometricOn(false);
    }
  };

  const stageTitle =
    stage === 'current' ? 'Enter current PIN' : stage === 'new' ? 'Enter new PIN' : 'Confirm new PIN';

  return (
    <Screen title="Security & PIN" subtitle="Protect your wallet and transactions">
      <View style={{ gap: Spacing.lg, paddingTop: Spacing.md }}>
        <Card padded={false}>
          <ListItem
            icon={<Ionicons name="keypad-outline" size={20} color={theme.primary} />}
            title="Change transaction PIN"
            subtitle="4-digit PIN used to authorize payments"
            onPress={openSheet}
          />
        </Card>

        <Card padded={false}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleIcon}>
              <Ionicons name="finger-print-outline" size={20} color={theme.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText variant="bodyStrong">Biometric lock</ThemedText>
              <ThemedText variant="small" color="textSecondary">
                {biometricAvailable
                  ? 'Sign in with Face ID / fingerprint'
                  : 'Not available on this device'}
              </ThemedText>
            </View>
            <Switch
              value={biometricOn}
              onValueChange={(v) => void toggleBiometric(v)}
              disabled={!biometricAvailable}
              trackColor={{ true: theme.primary }}
            />
          </View>
        </Card>

        <Card padded={false}>
          <ListItem
            icon={<Ionicons name="log-out-outline" size={20} color={theme.danger} />}
            title="Sign out of this device"
            onPress={() => router.push('/profile')}
          />
        </Card>

        <ThemedText variant="tiny" color="textMuted" style={{ paddingHorizontal: Spacing.sm }}>
          Your PIN is stored as a one-way hash in the device secure enclave and never leaves your
          phone.
        </ThemedText>
      </View>

      <BottomSheet
        visible={pinVisible}
        onClose={() => setPinVisible(false)}
        title="Change PIN"
        subtitle={stageTitle}>
        <View style={{ alignItems: 'center', gap: Spacing.lg }}>
          <PinDots entered={pin.length} error={error} />
          <ThemedText variant="tiny" color="textMuted">
            {stage === 'current' ? 'Verify it is really you' : 'Choose something memorable'}
          </ThemedText>
          <PinPad onDigit={handleDigit} onBackspace={backspace} />
          <Pressable onPress={() => setPinVisible(false)} hitSlop={8}>
            <ThemedText variant="link" color="textSecondary">
              Cancel
            </ThemedText>
          </Pressable>
        </View>
      </BottomSheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, padding: Spacing.lg },
  toggleIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#EAF6F0', alignItems: 'center', justifyContent: 'center' },
});