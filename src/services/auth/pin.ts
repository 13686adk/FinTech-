import * as Crypto from 'expo-crypto';

export interface PinRecord {
  hash: string;
  salt: string;
}

export async function createPinRecord(pin: string): Promise<PinRecord> {
  const salt = Crypto.randomUUID();
  return { hash: await hashPin(pin, salt), salt };
}

export async function hashPin(pin: string, salt: string): Promise<string> {
  const digest = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    `${salt}:${pin}`,
  );
  return digest;
}

export async function verifyPin(pin: string, record: PinRecord): Promise<boolean> {
  const candidate = await hashPin(pin, record.salt);
  return candidate === record.hash;
}