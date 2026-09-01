import { create } from 'zustand';

import { createPinRecord, verifyPin, type PinRecord } from '@/services/auth/pin';
import {
  createSession,
  destroySession,
  mockFindByPhone,
  mockLogin,
  mockRegister,
  mockUpdateProfile,
  restoreSession,
  type AuthUser,
} from '@/services/auth/mock-auth';
import { getSecure, removeSecure, setSecure } from '@/services/storage/secure';

interface SessionState {
  user: AuthUser | null;
  token: string | null;
  pin: PinRecord | null;
  bootstrapped: boolean;
  restore: () => Promise<void>;
  register: (input: {
    name: string;
    phone: string;
    password: string;
    email?: string;
  }) => Promise<AuthUser>;
  login: (phone: string, password: string) => Promise<AuthUser>;
  loginWithOtp: (phone: string) => Promise<AuthUser>;
  savePin: (pin: string) => Promise<void>;
  /** Returns true when the provided PIN matches the stored PIN. */
  checkPin: (pin: string) => Promise<boolean>;
  updateProfile: (patch: Partial<Pick<AuthUser, 'name' | 'email'>>) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useSession = create<SessionState>((set, get) => ({
  user: null,
  token: null,
  pin: null,
  bootstrapped: false,

  restore: async () => {
    const [token, pin] = await Promise.all([getSecure<string>('session'), getSecure<PinRecord>('pinHash')]);
    let user: AuthUser | null = null;
    if (token) {
      user = await restoreSession(token);
      if (!user) {
        await removeSecure('session');
      }
    }
    // Auto-clear stale secret state keys if anything is malformed.
    set({ token: token && user ? token : null, user, pin, bootstrapped: true });
  },

  register: async (input) => {
    const user = await mockRegister(input);
    const token = await createSession(user.id);
    await setSecure('session', token);
    set({ user, token });
    return user;
  },

  login: async (phone, password) => {
    const user = await mockLogin(phone, password);
    const token = await createSession(user.id);
    await setSecure('session', token);
    set({ user, token });
    return user;
  },

  loginWithOtp: async (phone: string) => {
    const user = await mockFindByPhone(phone);
    if (!user) throw new Error('No account found for this number. Please register.');
    const token = await createSession(user.id);
    await setSecure('session', token);
    set({ user, token });
    return user;
  },

  savePin: async (pin) => {
    const record = await createPinRecord(pin);
    await setSecure('pinHash', record);
    set({ pin: record });
  },

  checkPin: async (pin) => {
    const record = get().pin;
    if (!record) return true;
    return verifyPin(pin, record);
  },

  updateProfile: async (patch) => {
    const user = get().user;
    if (!user) return;
    const updated = await mockUpdateProfile(user.id, patch);
    set({ user: updated });
  },

  signOut: async () => {
    const token = get().token;
    if (token) await destroySession(token);
    await Promise.all([
      removeSecure('session'),
      removeSecure('pinHash'),
      removeSecure('biometricEnabled'),
    ]);
    set({ user: null, token: null, pin: null });
  },
}));