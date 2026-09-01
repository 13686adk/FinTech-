import { catalog as bundledCatalog } from '@/services/catalog/catalog-data';
import { AppConfig } from '@/constants/config';
import { generateReference } from '@/lib/id';
import { sleep } from '@/services/api/mock-provider';

import type {
  BuyRequest,
  Catalog,
  CustomerInfo,
  FundAccount,
  FundMethod,
  OrderResult,
  Transaction,
  TransactionQuery,
  Wallet,
} from './types';
import type { VtuProvider } from './mock-provider';

interface ProviderHttpConfig {
  name: string;
  baseUrl: string;
  /** Header name the API key is sent in, e.g. `Authorization`. */
  authHeader: string;
  /** Static secret. May be a JWT, API key, or `key:value` basic pair per provider docs. */
  authValue: string;
  username?: string;
  password?: string;
  /** Language of the body (vtu.ng uses `application/x-www-form-urlencoded`, most use JSON). */
  formEncoded?: boolean;
}

/**
 * Generic HTTP VTU provider adapter.
 *
 * Wire it up by exporting the correct instance from `client.ts` and adding your
 * credentials to `.env`:
 *
 *   EXPO_PUBLIC_VTU_PROVIDER=vtu.ng
 *   EXPO_PUBLIC_VTU_NG_KEY=your-api-key
 *
 * Upstream APIs intentionally mirror this app's own `VtuProvider` interface so no
 * UI, store or screen ever changes when you switch providers.
 */
export class HttpVtuProvider implements VtuProvider {
  readonly name: string;

  constructor(private readonly cfg: ProviderHttpConfig) {
    this.name = this.cfg.name;
  }

  private async request<T>(path: string, body?: Record<string, string | number>): Promise<T> {
    const headers: Record<string, string> = {
      Accept: 'application/json',
    };
    if (this.cfg.authValue) headers[this.cfg.authHeader] = this.cfg.authValue;
    if (this.cfg.username && this.cfg.password) {
      headers.Authorization = `Basic ${toBase64(`${this.cfg.username}:${this.cfg.password}`)}`;
    }

    const url = `${this.cfg.baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`;
    const opts: RequestInit = { method: body ? 'POST' : 'GET', headers };

    if (body) {
      if (this.cfg.formEncoded) {
        headers['Content-Type'] = 'application/x-www-form-urlencoded';
        opts.body = new URLSearchParams(
          Object.entries(body).map(([k, v]) => [k, String(v)]),
        ).toString();
      } else {
        headers['Content-Type'] = 'application/json';
        opts.body = JSON.stringify(body);
      }
    }

    const res = await fetch(url, opts);
    if (!res.ok) {
      throw new Error(`${this.cfg.name} upstream error (HTTP ${res.status})`);
    }
    const json = (await res.json()) as Record<string, any>;
    if (json.status === 'error' || json.status === 'failed' || json.success === false) {
      throw new Error(json.message ?? `${this.cfg.name} rejected the request`);
    }
    return json as T;
  }

  async getCatalog(): Promise<Catalog> {
    const fallback = async (): Promise<Catalog> => {
      if (!this.cfg.authValue) {
        return bundledCatalog;
      }
      throw new Error(
        `[${this.name}] Catalog sync not configured. Provide a mapping from the provider's price-list response into our Catalog shape (see docs).`,
      );
    };
    return fallback();
  }

  async getWallet(_userId: string): Promise<Wallet> {
    if (!this.cfg.authValue) {
      return { balance: AppConfig.demoSeedBalance, totalDebit: 0, totalCredit: 0 };
    }
    return this.request<Wallet>('balance');
  }

  async getTransactions(_userId: string, _query?: TransactionQuery): Promise<Transaction[]> {
    if (!this.cfg.authValue) return [];
    const raw = await this.request<Record<string, any>[]>('transactions');
    return raw.map(mapTransaction);
  }

  async verifyCustomer(req: {
    userId: string;
    category: string;
    network?: string;
    provider?: string;
    recipient?: string;
  }): Promise<CustomerInfo> {
    if (!this.cfg.authValue) {
      return { name: null, product: null, network: req.network as CustomerInfo['network'] };
    }
    const res = await this.request<{ name?: string; product_name?: string }>(
      req.category === 'electricity' ? 'verify-meters' : 'verify-customers',
      {
        category: req.category,
        network: req.network ?? '',
        provider: req.provider ?? '',
        recipient: req.recipient ?? '',
      },
    );
    return { name: res.name ?? null, product: res.product_name ?? null };
  }

  async purchase(userId: string, req: BuyRequest): Promise<OrderResult> {
    if (!this.cfg.authValue) {
      throw new Error(
        `[${this.name}] Not configured. Set EXPO_PUBLIC_VTU_PROVIDER=${
          this.cfg.name
        } and EXPO_PUBLIC_VTU_NG_KEY (or the matching key) in .env, then rebuild.`,
      );
    }
    const route = {
      airtime: 'airtime',
      data: 'data',
      cable: 'cable',
      electricity: 'electricity',
      education: 'education',
      betting: 'betting',
    }[req.category];
    const res = await this.request<{
      reference?: string;
      request_id?: string;
      order_id?: string;
      amount?: number;
      token?: string;
      pin?: string;
      balance_after?: number;
    }>(route, {
      category: req.category,
      product_id: req.productId ?? '',
      network: req.network ?? '',
      recipient: req.recipient ?? '',
      amount: req.amount ?? 0,
      provider: req.provider ?? '',
    });
    return {
      reference: res.reference ?? res.request_id ?? res.order_id ?? generateReference(),
      status: 'success',
      amount: res.amount ?? req.amount ?? 0,
      message: 'Upstream provider accepted the order.',
      token: res.token,
      pin: res.pin,
      oldBalance: 0,
      newBalance: res.balance_after ?? 0,
    };
  }

  async getFundingMethods(): Promise<FundMethod[]> {
    return [
      {
        id: 'bank-transfer',
        label: 'Bank Transfer',
        detail: 'Dedicated virtual account via your payment gateway.',
        kind: 'bank_transfer',
      },
    ];
  }

  async requestVirtualAccount(_userId: string): Promise<FundAccount> {
    throw new Error(
      `[${this.name}] Virtual accounts are provisioned by your payment gateway (Paystack/Flutterwave/Monnify), not the VTU provider.`,
    );
  }

  async fundViaTransfer(userId: string, reference: string, amount: number): Promise<OrderResult> {
    // Balance reconciliation normally happens on your backend via the gateway webhook.
    // In the app we optimistically report success so the wallet store can refresh.
    return {
      reference,
      status: 'success',
      amount,
      message: 'Funding webhook will credit your wallet shortly.',
      oldBalance: 0,
      newBalance: 0,
    };
  }
}

function mapTransaction(raw: Record<string, any>): Transaction {
  return {
    id: String(raw.id ?? raw.request_id ?? Math.random()),
    reference: String(raw.reference ?? ''),
    category: (raw.category ?? 'airtime') as Transaction['category'],
    product: String(raw.product ?? raw.type ?? ''),
    network: raw.network as Transaction['network'],
    recipient: raw.recipient ?? raw.phone,
    amount: Number(raw.amount ?? 0),
    profit: Number(raw.profit ?? 0),
    status: (raw.status ?? 'success') as Transaction['status'],
    createdAt: Number(raw.created_at ?? Date.now()),
  };
}

export function vtuNgProvider(): VtuProvider {
  return new HttpVtuProvider({
    name: 'vtu.ng',
    // vtu.ng documents a basic-auth, form-encoded HTTPS JSON API rooted here.
    baseUrl: 'https://vtu.ng/wp-json/api/v1',
    authHeader: 'Authorization',
    authValue: AppConfig.providerKeys.vtu_ng,
    username: process.env.EXPO_PUBLIC_VTU_NG_USER,
    password: process.env.EXPO_PUBLIC_VTU_NG_PASSWORD,
    formEncoded: true,
  });
}

export function pairgateProvider(): VtuProvider {
  return new HttpVtuProvider({
    name: 'pairgate',
    baseUrl: 'https://pairgate.com/api',
    authHeader: 'Authorization',
    authValue: AppConfig.providerKeys.pairgate,
  });
}

export function peyflexProvider(): VtuProvider {
  return new HttpVtuProvider({
    name: 'peyflex',
    baseUrl: 'https://peyflex.com/api',
    authHeader: 'x-api-key',
    authValue: AppConfig.providerKeys.peyflex,
  });
}

export function unauthGuard(): VtuProvider {
  // Kept for type completeness; never selected at runtime.
  return new HttpVtuProvider({
    name: 'unknown',
    baseUrl: 'https://example.invalid',
    authHeader: 'Authorization',
    authValue: '',
  });
}

export { sleep };

/** Minimal ASCII-safe Base64 encoder (no Node Buffer in React Native). */
function toBase64(input: string): string {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let out = '';
  for (let i = 0; i < input.length; i += 3) {
    const b0 = input.charCodeAt(i);
    const b1 = input.charCodeAt(i + 1);
    const b2 = input.charCodeAt(i + 2);
    out += alphabet[b0 >> 2];
    out += alphabet[((b0 & 3) << 4) | (Number.isNaN(b1) ? 0 : b1 >> 4)];
    if (!Number.isNaN(b1)) {
      out += alphabet[((b1 & 15) << 2) | (Number.isNaN(b2) ? 0 : b2 >> 6)];
      out += Number.isNaN(b2) ? '=' : alphabet[b2 & 63];
    } else {
      out += '==';
    }
  }
  return out;
}