import type { Network } from '@/services/api/types';

const NETWORK_MOBILE_PREFIXES: Record<Network, string[]> = {
  mtn: ['0703', '0706', '0803', '0806', '0810', '0813', '0814', '0816', '0903', '0906', '0913', '0916'],
  glo: ['0705', '0805', '0807', '0811', '0815', '0905', '0915'],
  airtel: ['0701', '0708', '0802', '0808', '0812', '0901', '0902', '0904', '0907', '0912'],
  '9mobile': ['0809', '0817', '0818', '0909', '0908'],
};

export function normalizePhone(raw: string): string {
  return raw.replace(/[^\d+]/g, '').trim();
}

export function isValidPhone(raw: string): boolean {
  const p = normalizePhone(raw);
  if (/^0\d{10}$/.test(p)) return true;
  if (/^\+?234\d{10}$/.test(p)) return true;
  return false;
}

export function detectNetwork(raw: string): Network | null {
  const p = normalizePhone(raw);
  let digits = '';
  if (/^\+?234(\d{10})$/.test(p)) {
    digits = '0' + p.replace(/^\+?234/, '');
  } else if (/^0\d{10}$/.test(p)) {
    digits = p;
  }
  if (digits.length !== 11) return null;
  const prefix = digits.slice(0, 4);
  for (const [network, prefixes] of Object.entries(NETWORK_MOBILE_PREFIXES)) {
    if (prefixes.includes(prefix)) return network as Network;
  }
  return null;
}

export function isValidAmount(amount: number, min = 1, max = 1000000): boolean {
  return Number.isFinite(amount) && amount >= min && amount <= max;
}

export function isValidOtp(otp: string, length = 6): boolean {
  return new RegExp(`^\\d{${length}}$`).test(otp);
}

export function isValidPin(pin: string, length = 4): boolean {
  return new RegExp(`^\\d{${length}}$`).test(pin);
}

export function normalizeIuc(raw: string): string {
  return raw.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
}

export function isValidIuc(raw: string): boolean {
  return /^[A-Z0-9]{10}$/.test(normalizeIuc(raw));
}

export function normalizeMeter(raw: string): string {
  return raw.replace(/[^\d]/g, '');
}

export function isValidMeter(raw: string): boolean {
  const n = normalizeMeter(raw);
  return n.length >= 6 && n.length <= 12;
}

export function isValidEmail(raw: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw.trim());
}

export function isValidName(raw: string): boolean {
  return raw.trim().length >= 2;
}

export function toMinimumDigits(amount: number): number {
  // Round amounts to the nearest 50 per local vending convention.
  return Math.max(50, Math.ceil(amount / 50) * 50);
}