import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { Share, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ListItem } from '@/components/ui/list-item';
import { Screen } from '@/components/ui/screen';
import { Radius, Spacing } from '@/constants/theme';
import { AppConfig } from '@/constants/config';
import { useTheme } from '@/hooks/use-theme';
import { useApp } from '@/store/app-store';
import { useSession } from '@/store/session-store';

export default function ReferralScreen() {
  const theme = useTheme();
  const user = useSession((s) => s.user);
  const showToast = useApp((s) => s.showToast);

  if (!user) return null;
  const code = user.referralCode;
  const inviteLink = `https://swifttop.example/r/${code}`;

  const copyCode = () => {
    void Clipboard.setStringAsync(code).then(() => showToast('Referral code copied', 'success'));
  };

  const shareInvite = async () => {
    try {
      await Share.share({
        message: `Join me on ${AppConfig.appName} — buy cheap airtime, data and pay bills instantly. Use my code ${code} to get started. ${inviteLink}`,
      });
    } catch {
      // user dismissed share sheet
    }
  };

  return (
    <Screen title="Refer & earn" subtitle={`Earn ${AppConfig.referrerBonus.toLocaleString()} for every friend who joins`}>
      <View style={{ gap: Spacing.xl, paddingTop: Spacing.md }}>
        <Card style={[styles.codeCard, { backgroundColor: theme.goldSoft, borderColor: theme.gold }]}>
          <ThemedText variant="tiny" color="gold">
            YOUR REFERRAL CODE
          </ThemedText>
          <View style={styles.codeRow}>
            <ThemedText variant="h1" color="gold" style={{ letterSpacing: 4 }}>
              {code}
            </ThemedText>
            <Button label="Copy" size="sm" variant="secondary" onPress={copyCode} />
          </View>
        </Card>

        <Button label="Invite friends" icon={<Ionicons name="share-social-outline" size={18} color="#fff" />} onPress={() => void shareInvite()} />

        <Card padded={false}>
          <ListItem
            icon={<Ionicons name="people-outline" size={20} color={theme.primary} />}
            title="Friends joined"
            value="0"
          />
          <ListItem
            icon={<Ionicons name="cash-outline" size={20} color={theme.primary} />}
            title="Earnings from referrals"
            value="₦0"
          />
        </Card>

        <Card>
          <ThemedText variant="bodyStrong">How it works</ThemedText>
          <View style={{ gap: Spacing.sm, marginTop: Spacing.sm }}>
            <Step n={1} text="Share your code with friends on WhatsApp, Telegram or social media." />
            <Step n={2} text="They sign up and fund their wallet with any amount." />
            <Step n={3} text={`You instantly earn ${AppConfig.referrerBonus.toLocaleString()}, and they get a bonus too.`} />
            <Step n={4} text="Withdraw your earnings into your wallet balance at any time." />
          </View>
        </Card>

        <View style={styles.note}>
          <Ionicons name="information-circle-outline" size={16} color={theme.textMuted} />
          <ThemedText variant="tiny" color="textMuted">
            Referral payouts are credited to your wallet and appear in your transaction history.
          </ThemedText>
        </View>
      </View>
    </Screen>
  );
}

function Step({ n, text }: { n: number; text: string }) {
  const theme = useTheme();
  return (
    <View style={styles.stepRow}>
      <View style={[styles.stepNum, { backgroundColor: theme.primarySoft }]}>
        <ThemedText variant="captionStrong" color="primary">
          {n}
        </ThemedText>
      </View>
      <ThemedText variant="caption" color="textSecondary" style={{ flex: 1 }}>
        {text}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  codeCard: { padding: Spacing.xl, borderRadius: Radius.xl, borderWidth: 1.5 },
  codeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: Spacing.sm },
  note: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingHorizontal: Spacing.sm, marginTop: Spacing.sm },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  stepNum: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
});