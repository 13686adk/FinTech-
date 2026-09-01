import { catalog } from '@/services/catalog/catalog-data';
import { AppConfig } from '@/constants/config';
import { generateId, generateReference, pickRandom, randomInt } from '@/lib/id';
import { detectNetwork, normalizeIuc, normalizeMeter, isValidIuc, isValidMeter } from '@/lib/validate';
import { storage } from '@/services/storage';

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

export interface VtuProvider {
  name: string;
  getCatalog(): Promise<Catalog>;
  getWallet(userId: string): Promise<Wallet>;
  getTransactions(userId: string, query?: TransactionQuery): Promise<Transaction[]>;
  verifyCustomer(req: {
    userId: string;
    category: string;
    network?: string;
    provider?: string;
    recipient?: string;
  }): Promise<CustomerInfo>;
  purchase(userId: string, req: BuyRequest): Promise<OrderResult>;
  getFundingMethods(): Promise<FundMethod[]>;
  requestVirtualAccount(userId: string): Promise<FundAccount>;
  fundViaTransfer(userId: string, reference: string, amount: number): Promise<OrderResult>;
}

export const MOCK_LATENCY_MS = 750;

/**
 * Offline demo provider. Keeps a wallet + transaction ledger per user in storage,
 * applies real pricing from the catalog and simulates provider latency so the whole
 * app is fully testable before you connect a live VTU API.
 */
export class MockVtuProvider implements VtuProvider {
  readonly name = 'MockProvider';

  private walletKey(userId: string) {
    return `vtu.wallet.${userId}`;
  }

  private txKey(userId: string) {
    return `vtu.transactions.${userId}`;
  }

  private async loadWallet(userId: string): Promise<Wallet> {
    const existing =
      (await storage.get<Wallet>(this.walletKey(userId))) ??
      ({
        balance: AppConfig.demoSeedBalance,
        totalDebit: 0,
        totalCredit: AppConfig.demoSeedBalance,
        premium: false,
      } satisfies Wallet);
    return existing;
  }

  private async saveWallet(userId: string, wallet: Wallet): Promise<void> {
    await storage.set(this.walletKey(userId), wallet);
  }

  private async loadTx(userId: string): Promise<Transaction[]> {
    return (await storage.get<Transaction[]>(this.txKey(userId))) ?? [];
  }

  private async saveTx(userId: string, txs: Transaction[]): Promise<void> {
    await storage.set(this.txKey(userId), txs);
  }

  async getCatalog(): Promise<Catalog> {
    await sleep(MOCK_LATENCY_MS);
    return catalog;
  }

  async getWallet(userId: string): Promise<Wallet> {
    await sleep(MOCK_LATENCY_MS);
    return this.loadWallet(userId);
  }

  async getTransactions(userId: string, query?: TransactionQuery): Promise<Transaction[]> {
    await sleep(MOCK_LATENCY_MS);
    const all = await this.loadTx(userId);
    const sorted = [...all].sort((a, b) => b.createdAt - a.createdAt);
    if (!query) return sorted;
    return sorted.filter((t) => {
      const catOk = !query.category || query.category === 'all' || t.category === query.category;
      const statusOk = !query.status || query.status === 'all' || t.status === query.status;
      return catOk && statusOk;
    });
  }

  async verifyCustomer(req: {
    userId: string;
    category: string;
    network?: string;
    provider?: string;
    recipient?: string;
  }): Promise<CustomerInfo> {
    await sleep(MOCK_LATENCY_MS * 0.7);
    const names = [
      'CHUKWUEMEKA OKAFOR',
      'AMINAT BELLO',
      'KELECHI NWOSU',
      'OLUWASEUN ADEGOKE',
      'TIMOTHY DAVID',
      'GRACE ABIMBOLA',
      'SANI MUSA',
      'NGOZI EZE',
      'IBRAHIM SALISU',
      'FUNKE ADEBAYO',
    ];
    if (req.category === 'data' || req.category === 'airtime') {
      const network = req.network ?? detectNetwork(req.recipient ?? '') ?? null;
      return { name: `${pickRandom(names)}`, product: null, network: network as CustomerInfo['network'] };
    }
    if (req.category === 'cable') {
      const iuc = normalizeIuc(req.recipient ?? '');
      if (!isValidIuc(iuc)) {
        throw new Error('Please enter a valid 10-character IUC number.');
      }
      return { name: pickRandom(names), product: 'Bouquet subscriber', provider: req.provider };
    }
    if (req.category === 'electricity') {
      const meter = normalizeMeter(req.recipient ?? '');
      if (!isValidMeter(meter)) {
        throw new Error('Please enter a valid meter number.');
      }
      return { name: pickRandom(names), product: 'Prepaid meter', provider: req.provider };
    }
    return { name: null, product: null };
  }

  async purchase(userId: string, req: BuyRequest): Promise<OrderResult> {
    // Simulate provider processing window.
    await sleep(MOCK_LATENCY_MS);

    const wallet = await this.loadWallet(userId);
    const txs = await this.loadTx(userId);

    const { price, profit, productName } = this.resolvePricing(req);
    if (wallet.balance < price) {
      throw new Error(
        'Insufficient wallet balance. Please fund your wallet to complete this transaction.',
      );
    }

    const status = Math.random() > 0.04 ? 'success' : 'pending';
    const reference = generateReference();
    const token = generateReference('TKN');
    const pin = generateReference('PIN');

    const newBalance = +(wallet.balance - price).toFixed(2);
    const tx: Transaction = {
      id: generateId('tx'),
      reference,
      category: req.category,
      product: productName,
      network: req.network,
      recipient: req.recipient,
      amount: price,
      profit,
      status,
      createdAt: Date.now(),
      method: 'wallet',
    };
    txs.unshift(tx);
    await this.saveTx(userId, txs);

    if (status === 'success') {
      await this.saveWallet(userId, {
        ...wallet,
        balance: newBalance,
        totalDebit: +(wallet.totalDebit + price).toFixed(2),
      });
    }

    return {
      reference,
      status,
      amount: price,
      message:
        status === 'success'
          ? 'Delivery successful. The recipient has been credited instantly.'
          : 'Transaction is being processed. You will be credited within minutes.',
      token: req.category === 'electricity' ? token : undefined,
      pin: req.category === 'education' ? pin : undefined,
      oldBalance: wallet.balance,
      newBalance: status === 'success' ? newBalance : wallet.balance,
    };
  }

  private resolvePricing(req: BuyRequest): {
    price: number;
    profit: number;
    productName: string;
  } {
    const { category } = req;

    if (category === 'airtime') {
      const denom =
        catalog.airtimeDenominations.find(
          (d) => d.network === req.network && d.denomination === req.amount,
        ) ?? {
          network: req.network!,
          denomination: req.amount ?? 0,
          dealerPrice: (req.amount ?? 0) * 0.975,
          sellingPrice: req.amount ?? 0,
        };
      return {
        price: denom.sellingPrice,
        profit: +(denom.sellingPrice - denom.dealerPrice).toFixed(2),
        productName: `${networkName(req.network)} Airtime ₦${denom.denomination}`,
      };
    }

    if (category === 'data') {
      const plan = catalog.dataPlans.find((p) => p.id === req.productId);
      if (!plan) throw new Error('Invalid data plan selected.');
      return {
        price: plan.sellingPrice,
        profit: plan.sellingPrice - plan.dealerPrice,
        productName: `${plan.name} (${plan.validity})`,
      };
    }

    if (category === 'cable') {
      const cable = catalog.cables.find((c) => c.id === req.provider);
      const pkg = cable?.packages.find((p) => p.id === req.productId);
      if (!cable || !pkg) throw new Error('Invalid cable package selected.');
      const fee = Math.round(pkg.price * 0.015);
      return {
        price: pkg.price + fee,
        profit: fee,
        productName: `${cable.name} – ${pkg.name}`,
      };
    }

    if (category === 'electricity') {
      const disco = catalog.discos.find((d) => d.id === req.provider);
      const amount = req.amount ?? 0;
      const fee = disco?.fee ?? 100;
      return {
        price: amount + fee,
        profit: fee,
        productName: `${disco?.name ?? 'Electricity'} token`,
      };
    }

    if (category === 'education') {
      const item = catalog.education.find((e) => e.id === req.productId);
      if (!item) throw new Error('Invalid exam pin product.');
      return {
        price: item.price,
        profit: item.price - item.dealerPrice,
        productName: item.name,
      };
    }

    if (category === 'betting') {
      const provider = catalog.betting.find((b) => b.id === req.provider);
      const amount = req.amount ?? 0;
      const fee = Math.max(50, Math.round(amount * 0.01));
      return {
        price: amount + fee,
        profit: fee,
        productName: `${provider?.name ?? 'Betting'} wallet funding`,
      };
    }

    throw new Error('Unsupported category.');
  }

  async getFundingMethods(): Promise<FundMethod[]> {
    await sleep(MOCK_LATENCY_MS * 0.5);
    return [
      {
        id: 'bank-transfer',
        label: 'Bank Transfer',
        detail: 'Get a dedicated account number and pay in seconds.',
        kind: 'bank_transfer',
      },
      {
        id: 'card',
        label: 'Card / Debit',
        detail: 'Debit card via Paystack/Flutterwave (live in production).',
        kind: 'card',
      },
      {
        id: 'ussd',
        label: 'USSD Top-Up',
        detail: '*737*555*Amount# from any bank (live in production).',
        kind: 'ussd',
      },
    ];
  }

  async requestVirtualAccount(userId: string): Promise<FundAccount> {
    await sleep(MOCK_LATENCY_MS);
    const accountNumber = `987${String(randomInt(10000000, 99999999))}`;
    return {
      accountNumber,
      bankName: 'SwiftTop Demo Bank',
      accountName: 'SWIFTTOP  WALLET',
      expiresAt: Date.now() + 30 * 60_000,
      reference: generateReference('VA'),
    };
  }

  async fundViaTransfer(userId: string, reference: string, amount: number): Promise<OrderResult> {
    await sleep(MOCK_LATENCY_MS * 1.4);
    const wallet = await this.loadWallet(userId);
    const txs = await this.loadTx(userId);
    if (amount <= 0) throw new Error('Invalid amount.');

    const newBalance = +(wallet.balance + amount).toFixed(2);
    await this.saveWallet(userId, {
      ...wallet,
      balance: newBalance,
      totalCredit: +(wallet.totalCredit + amount).toFixed(2),
    });

    const tRef = generateReference('DEP');
    txs.unshift({
      id: generateId('tx'),
      reference: tRef,
      category: 'airtime',
      product: 'Wallet Funding (Bank Transfer)',
      amount,
      profit: 0,
      status: 'success',
      createdAt: Date.now(),
      method: 'bank_transfer',
    });
    await this.saveTx(userId, txs);

    return {
      reference: tRef,
      status: 'success',
      amount,
      message: 'Your wallet has been credited successfully.',
      oldBalance: wallet.balance,
      newBalance,
    };
  }
}

export function networkName(network?: string): string {
  switch (network) {
    case 'mtn':
      return 'MTN';
    case 'glo':
      return 'Glo';
    case 'airtel':
      return 'Airtel';
    case '9mobile':
      return '9mobile';
    default:
      return network ?? '';
  }
}

export const categoryToLabel: Record<string, string> = {
  airtime: 'Airtime',
  data: 'Data Bundle',
  cable: 'Cable TV',
  electricity: 'Electricity',
  education: 'Exam PIN',
  betting: 'Betting',
  funding: 'Funding',
};

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Re-export helpers used across screens.
export { detectNetwork }; // keep consumers importing from a single place