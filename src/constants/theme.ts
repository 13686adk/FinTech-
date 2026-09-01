import { Platform } from 'react-native';

export type ThemeMode = 'light' | 'dark';

export interface ThemeTokens {
  mode: ThemeMode;
  background: string;
  surface: string;
  surfaceElevated: string;
  border: string;
  borderStrong: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;
  primary: string;
  primaryStrong: string;
  primarySoft: string;
  onPrimary: string;
  success: string;
  successSoft: string;
  warning: string;
  warningSoft: string;
  danger: string;
  dangerSoft: string;
  info: string;
  infoSoft: string;
  gold: string;
  goldSoft: string;
  overlay: string;
  skeleton: string;
  cardGradient: readonly [string, string, string];
  tabBar: string;
  tabBarBorder: string;
}

export const lightTheme: ThemeTokens = {
  mode: 'light',
  background: '#F4F6F5',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  border: '#E4E9E6',
  borderStrong: '#CCD5D0',
  text: '#0E1512',
  textSecondary: '#5B6761',
  textMuted: '#94A19B',
  textInverse: '#FFFFFF',
  primary: '#0BA163',
  primaryStrong: '#088351',
  primarySoft: '#DDF4E8',
  onPrimary: '#FFFFFF',
  success: '#16A34A',
  successSoft: '#DCFCE7',
  warning: '#D97706',
  warningSoft: '#FEF3C7',
  danger: '#DC2626',
  dangerSoft: '#FEE2E2',
  info: '#2563EB',
  infoSoft: '#DBEAFE',
  gold: '#F5A623',
  goldSoft: '#FDF0D3',
  overlay: 'rgba(6, 12, 9, 0.55)',
  skeleton: '#E7ECE9',
  cardGradient: ['#0BA163', '#0A965C', '#088351'] as const,
  tabBar: '#FFFFFF',
  tabBarBorder: '#E4E9E6',
};

export const darkTheme: ThemeTokens = {
  mode: 'dark',
  background: '#0A100D',
  surface: '#121A16',
  surfaceElevated: '#17221D',
  border: '#22302B',
  borderStrong: '#2E4039',
  text: '#F1F5F3',
  textSecondary: '#A3B2AC',
  textMuted: '#6E8079',
  textInverse: '#0E1512',
  primary: '#22C579',
  primaryStrong: '#2BD98A',
  primarySoft: '#123822',
  onPrimary: '#071D12',
  success: '#4ADE80',
  successSoft: '#153324',
  warning: '#FBBF24',
  warningSoft: '#33260F',
  danger: '#F87171',
  dangerSoft: '#3A1E22',
  info: '#60A5FA',
  infoSoft: '#16283E',
  gold: '#F5A623',
  goldSoft: '#33260F',
  overlay: 'rgba(0, 0, 0, 0.6)',
  skeleton: '#1D2924',
  cardGradient: ['#1BC576', '#0FA463', '#0B8A5C'] as const,
  tabBar: '#0F1613',
  tabBarBorder: '#22302B',
};

export const AppColors = {
  networks: {
    mtn: '#FFCC00',
    glo: '#009A44',
    airtel: '#E30613',
    '9mobile': '#00A99D',
  },
  providers: {
    dstv: '#F5A623',
    gotv: '#E0392B',
    startimes: '#F28C28',
    showmax: '#E50914',
    bet9ja: '#3FA33F',
    betking: '#FFB81C',
    'nairabet': '#C1272D',
    waec: '#1B4E9B',
    neco: '#0E7A3C',
    jamb: '#7C1F1B',
    nabteb: '#0F6F96',
  },
} as const;

export const Spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  xxxxl: 48,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  full: 999,
} as const;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  android: {
    sans: 'sans-serif',
    serif: 'serif',
    rounded: 'sans-serif',
    mono: 'monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
} as const);

export const BottomTabInset = Platform.select({ ios: 50, android: 88 }) ?? 0;
export const MaxContentWidth = 720;