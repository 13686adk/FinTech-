import { generateId, generateReference, randomInt } from '@/lib/id';
import type { UserProfile } from '@/services/api/types';
import { storage } from '@/services/storage';

/**
 * Mock authentication backend.
 * In production swap these functions for calls to your backend (Supabase, Firebase,
 * custom API) or a phone-verification service (Termii, Twilio Verify, etc).
 * Every function mirrors the shape of the real provider adapter so the UI never changes.
 */

export type AuthUser = UserProfile;

const USERS_KEY = 'swifttop.users';
const SESSIONS_KEY = 'swifttop.sessions';

interface StoredUser extends AuthUser {
  passwordHash: string;
  createdAt: number;
}

interface OtpSession {
  code: string;
  expiresAt: number;
  attempts: number;
}

interface SessionRow {
  token: string;
  userId: string;
  createdAt: number;
}

const otps = new Map<string, OtpSession>();

async function loadUsers(): Promise<StoredUser[]> {
  return (await storage.get<StoredUser[]>(USERS_KEY)) ?? [];
}

async function saveUsers(users: StoredUser[]): Promise<void> {
  await storage.set(USERS_KEY, users);
}

async function loadSessions(): Promise<SessionRow[]> {
  return (await storage.get<SessionRow[]>(SESSIONS_KEY)) ?? [];
}

async function saveSessions(rows: SessionRow[]): Promise<void> {
  await storage.set(SESSIONS_KEY, rows);
}

export interface RequestOtpResult {
  devCode: string;
  expiresInSeconds: number;
}

export async function mockRequestOtp(phone: string): Promise<RequestOtpResult> {
  const code = `${randomInt(100000, 999999)}`;
  otps.set(phone, { code, expiresAt: Date.now() + 5 * 60_000, attempts: 0 });
  // In production, dispatch the code via SMS here.
  return { devCode: code, expiresInSeconds: 300 };
}

export async function mockVerifyOtp(phone: string, code: string): Promise<boolean> {
  const otp = otps.get(phone);
  if (!otp) return false;
  if (Date.now() > otp.expiresAt) {
    otps.delete(phone);
    return false;
  }
  if (otp.attempts >= 5) {
    otps.delete(phone);
    return false;
  }
  if (otp.code === code.trim()) {
    otps.delete(phone);
    return true;
  }
  otp.attempts += 1;
  return false;
}

function hashDummyPassword(password: string): string {
  // Not a real hashing concern in demo mode; swap for bcrypt/argon2 server-side.
  return `demo:${password.split('').reverse().join('')}`;
}

export async function mockRegister(input: {
  name: string;
  phone: string;
  password: string;
  email?: string;
  referralCode?: string;
}): Promise<AuthUser> {
  const users = await loadUsers();
  if (users.some((u) => u.phone === input.phone)) {
    throw new Error('A user with this phone number already exists.');
  }
  const user: StoredUser = {
    id: generateId('usr'),
    name: input.name,
    phone: input.phone,
    email: input.email,
    referralCode: `ST${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
    passwordHash: hashDummyPassword(input.password),
    tier: 'starter',
    createdAt: Date.now(),
  };
  users.push(user);
  await saveUsers(users);
  return toPublic(user);
}

export async function mockLogin(phone: string, password: string): Promise<AuthUser> {
  const users = await loadUsers();
  const user = users.find((u) => u.phone === phone);
  if (!user || user.passwordHash !== hashDummyPassword(password)) {
    throw new Error('Invalid phone number or password.');
  }
  return toPublic(user);
}

export async function mockFindByPhone(phone: string): Promise<AuthUser | null> {
  const users = await loadUsers();
  const user = users.find((u) => u.phone === phone);
  return user ? toPublic(user) : null;
}

export async function mockGetUser(id: string): Promise<AuthUser | null> {
  const users = await loadUsers();
  const user = users.find((u) => u.id === id);
  return user ? toPublic(user) : null;
}

export async function mockUpdateProfile(
  id: string,
  patch: Partial<Pick<AuthUser, 'name' | 'email'>>,
): Promise<AuthUser> {
  const users = await loadUsers();
  const index = users.findIndex((u) => u.id === id);
  if (index === -1) throw new Error('User not found.');
  users[index] = { ...users[index], ...patch };
  await saveUsers(users);
  return toPublic(users[index]);
}

export async function createSession(userId: string): Promise<string> {
  const token = generateReference('TKN').toLowerCase();
  const sessions = await loadSessions();
  sessions.push({ token, userId, createdAt: Date.now() });
  await saveSessions(sessions);
  return token;
}

export async function restoreSession(token: string): Promise<AuthUser | null> {
  const sessions = await loadSessions();
  const row = sessions.find((s) => s.token === token);
  if (!row) return null;
  return mockGetUser(row.userId);
}

export async function destroySession(token: string): Promise<void> {
  const sessions = await loadSessions();
  await saveSessions(sessions.filter((s) => s.token !== token));
}

export { toPublic };

function toPublic(user: StoredUser): AuthUser {
  const { passwordHash: _ph, createdAt: _ca, ...rest } = user;
  return { ...rest };
}