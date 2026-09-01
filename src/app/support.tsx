import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Card } from '@/components/ui/card';
import { ListItem } from '@/components/ui/list-item';
import { Screen } from '@/components/ui/screen';
import { Spacing } from '@/constants/theme';
import { AppConfig } from '@/constants/config';
import { useTheme } from '@/hooks/use-theme';

const FAQS = [
  {
    q: 'How fast is delivery?',
    a: 'Airtime and data are delivered in under 30 seconds. Cable TV and electricity tokens usually arrive within 10–30 seconds.',
  },
  {
    q: 'What happens if a transaction fails?',
    a: 'Your money is automatically refunded to your wallet within minutes. You can track the status of any order in History.',
  },
  {
    q: 'How do I fund my wallet?',
    a: 'Open the Wallet tab, choose Bank Transfer, and pay into your dedicated account number — funds reflect instantly.',
  },
  {
    q: 'Can I become a reseller?',
    a: 'Yes. Every SwiftTop member buys at wholesale rates. Upgrade to a Dealer tier from your profile to unlock bigger margins.',
  },
  {
    q: 'Which networks are supported?',
    a: 'MTN, Glo, Airtel and 9mobile for airtime and data, plus DStv, GOtv, StarTimes, Showmax, all major DISCOs and betting platforms.',
  },
];

export default function SupportScreen() {
  const theme = useTheme();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <Screen title="Support" subtitle="We usually reply within minutes">
      <View style={{ gap: Spacing.lg, paddingTop: Spacing.md }}>
        <Card padded={false}>
          <ListItem
            icon={<Ionicons name="logo-whatsapp" size={20} color={theme.success} />}
            title="WhatsApp"
            subtitle="Chat with a human instantly"
            onPress={() => void Linking.openURL(`https://wa.me/${AppConfig.supportWhatsApp}`)}
          />
          <ListItem
            icon={<Ionicons name="mail-outline" size={20} color={theme.primary} />}
            title="Email"
            subtitle={AppConfig.supportEmail}
            onPress={() => void Linking.openURL(`mailto:${AppConfig.supportEmail}`)}
          />
          <ListItem
            icon={<Ionicons name="call-outline" size={20} color={theme.info} />}
            title="Call / SMS"
            subtitle={AppConfig.supportPhone}
            onPress={() => void Linking.openURL(`tel:${AppConfig.supportPhone.replace(/\s/g, '')}`)}
          />
        </Card>

        <Card>
          <ThemedText variant="bodyStrong" style={{ marginBottom: Spacing.sm }}>
            Frequently asked questions
          </ThemedText>
          {FAQS.map((faq, i) => {
            const isOpen = open === i;
            return (
              <View key={faq.q}>
                <Pressable
                  onPress={() => setOpen(isOpen ? null : i)}
                  style={styles.faqRow}>
                  <ThemedText variant="captionStrong" style={{ flex: 1 }} numberOfLines={2}>
                    {faq.q}
                  </ThemedText>
                  <Ionicons name={isOpen ? 'chevron-up' : 'chevron-down'} size={16} color={theme.textMuted} />
                </Pressable>
                {isOpen ? (
                  <ThemedText variant="small" color="textSecondary" style={{ paddingBottom: Spacing.md }}>
                    {faq.a}
                  </ThemedText>
                ) : null}
                {i < FAQS.length - 1 ? <View style={styles.divider} /> : null}
              </View>
            );
          })}
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  faqRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.md },
  divider: { height: 1, backgroundColor: '#E4E9E6' },
});