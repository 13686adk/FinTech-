import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { BottomSheet } from '@/components/ui/bottom-sheet';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ListItem } from '@/components/ui/list-item';
import { AppVersion } from '@/constants/config';
import { Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useSession } from '@/store/session-store';
import { initials, formatPhoneNumber } from '@/lib/format';
import { useApp } from '@/store/app-store';

export default function ProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const user = useSession((s) => s.user);
  const updateProfile = useSession((s) => s.updateProfile);
  const signOut = useSession((s) => s.signOut);
  const showToast = useApp((s) => s.showToast);

  const [editVisible, setEditVisible] = useState(false);
  const [name, setName] = useState(user?.name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [confirmOut, setConfirmOut] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  const saveProfile = async () => {
    setSaving(true);
    try {
      await updateProfile({ name: name.trim(), email: email.trim() });
      showToast('Profile updated', 'success');
      setEditVisible(false);
    } catch (e) {
      showToast((e as Error).message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const doSignOut = async () => {
    setConfirmOut(false);
    await signOut();
  };

  return (
    <ThemedView surface="background" style={styles.root}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <View style={styles.avatar}>
            <ThemedText variant="h3" style={{ color: '#fff' }}>
              {initials(user.name)}
            </ThemedText>
          </View>
          <View style={{ flex: 1 }}>
            <ThemedText variant="h3">{user.name}</ThemedText>
            <ThemedText variant="small" color="textSecondary">
              {formatPhoneNumber(user.phone)}
            </ThemedText>
          </View>
          <Pressable
            onPress={() => setEditVisible(true)}
            style={[styles.editBtn, { backgroundColor: theme.primarySoft }]}>
            <Ionicons name="create-outline" size={18} color={theme.primary} />
          </Pressable>
        </View>

        <Card padded={false} style={styles.section}>
          <ListItem
            icon={<Ionicons name="pricetag-outline" size={20} color={theme.primary} />}
            title="Referral code"
            subtitle={`Share and earn ₦500 per sign-up (code: ${user.referralCode})`}
            onPress={() => router.push('/referral')}
          />
          <Divider />
          <ListItem
            icon={<Ionicons name="finger-print-outline" size={20} color={theme.primary} />}
            title="Security & PIN"
            subtitle="Change PIN, enable biometric lock"
            onPress={() => router.push('/security')}
          />
          <Divider />
          <ListItem
            icon={<Ionicons name="help-circle-outline" size={20} color={theme.primary} />}
            title="Support"
            subtitle="WhatsApp, email and FAQs"
            onPress={() => router.push('/support')}
          />
        </Card>

        <Card padded={false} style={styles.section}>
          <ListItem
            icon={<Ionicons name="stats-chart-outline" size={20} color={theme.primary} />}
            title="Transaction history"
            onPress={() => router.push('/transactions')}
          />
          <Divider />
          <ListItem
            icon={<Ionicons name="wallet-outline" size={20} color={theme.primary} />}
            title="Fund wallet"
            onPress={() => router.push('/wallet')}
          />
          <Divider />
          <ListItem
            icon={<Ionicons name="information-circle-outline" size={20} color={theme.primary} />}
            title="About"
            subtitle={`SwiftTop v${AppVersion}`}
          />
        </Card>

        <Button
          label="Sign out"
          variant="danger"
          onPress={() => setConfirmOut(true)}
          style={{ marginTop: Spacing.xl }}
        />
      </ScrollView>

      <BottomSheet
        visible={editVisible}
        onClose={() => setEditVisible(false)}
        title="Edit profile">
        <View style={{ gap: Spacing.lg }}>
          <Input label="Full name" value={name} onChangeText={setName} />
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="you@example.com"
          />
          <Button label="Save changes" onPress={saveProfile} loading={saving} disabled={!name.trim()} />
        </View>
      </BottomSheet>

      <BottomSheet visible={confirmOut} onClose={() => setConfirmOut(false)} title="Sign out?">
        <View style={{ gap: Spacing.lg }}>
          <ThemedText variant="caption" color="textSecondary">
            You can sign back in with your phone number and password.
          </ThemedText>
          <Button label="Yes, sign out" variant="danger" onPress={() => void doSignOut()} />
          <Button label="Cancel" variant="secondary" size="md" onPress={() => setConfirmOut(false)} />
        </View>
      </BottomSheet>
    </ThemedView>
  );
}

function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: Spacing.lg, paddingBottom: 120 },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#0BA163',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBtn: {
    width: 40,
    height: 40,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: { marginBottom: Spacing.md, paddingHorizontal: Spacing.lg },
  divider: { height: 1, backgroundColor: '#E4E9E6', marginLeft: 52 },
});