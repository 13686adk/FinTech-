import Constants from 'expo-constants';

export const AppConfig = {
  appName: 'SwiftTop',
  appNameShort: 'SwiftTop',
  tagline: 'Airtime, Data & Bills — Instantly',
  supportPhone: '+234 810 000 0000',
  supportEmail: 'support@swifttop.example',
  supportWhatsApp: '2348100000000',
  // Which VTU backend to use. 'mock' ships a fully working offline demo provider.
  // Switch to 'vtu.ng', 'pairgate', or 'peyflex' once you have upstream credentials.
  provider: (process.env.EXPO_PUBLIC_VTU_PROVIDER ?? 'mock') as 'mock' | 'vtu.ng' | 'pairgate' | 'peyflex',
  // Upstream credentials for the real providers (kept out of app bundles in production).
  providerKeys: {
    vtu_ng: process.env.EXPO_PUBLIC_VTU_NG_KEY ?? '',
    pairgate: process.env.EXPO_PUBLIC_PAIRGATE_KEY ?? '',
    peyflex: process.env.EXPO_PUBLIC_PEYFLEX_KEY ?? '',
  },
  demoSeedBalance: 25000,
  referrerBonus: 500,
};

export function isDemo(): boolean {
  return AppConfig.provider === 'mock' || process.env.NODE_ENV === 'test';
}

export const AppVersion = Constants.expoConfig?.version ?? '1.0.0';