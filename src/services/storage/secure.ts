import * as SecureStore from 'expo-secure-store';

const KEYS = {
  session: 'swifttop.session',
  pinHash: 'swifttop.pinHash',
  biometricEnabled: 'swifttop.biometricEnabled',
} as const;

export async function getSecure<T>(key: keyof typeof KEYS): Promise<T | null> {
  try {
    const raw = await SecureStore.getItemAsync(KEYS[key]);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function setSecure(key: keyof typeof KEYS, value: unknown): Promise<void> {
  try {
    await SecureStore.setItemAsync(KEYS[key], JSON.stringify(value));
  } catch {
    // SecureStore has a 2KB value cap on some platforms; ignore non-critical writes.
  }
}

export async function removeSecure(key: keyof typeof KEYS): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(KEYS[key]);
  } catch {
    // ignore
  }
}

export async function hasBiometricEnabled(): Promise<boolean> {
  return (await getSecure<boolean>('biometricEnabled')) === true;
}

export async function setBiometricEnabled(enabled: boolean): Promise<void> {
  await setSecure('biometricEnabled', enabled);
}