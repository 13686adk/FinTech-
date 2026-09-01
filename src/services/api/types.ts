export type Network = 'mtn' | 'glo' | 'airtel' | '9mobile';

export type Category = 'airtime' | 'data' | 'cable' | 'electricity' | 'education' | 'betting';

export type OrderStatus = 'success' | 'pending' | 'failed';

export type DataPlanType = 'sme' | 'sme2' | 'gifting' | 'corporate' | 'cg';

export interface DataPlan {
  id: string;
  network: Network;
  type: DataPlanType;
  name: string;
  size: string;
  validity: string;
  dealerPrice: number;
  sellingPrice: number;
  popular?: boolean;
}

export interface AirtimeProduct {
  network: Network;
  denomination: number;
  dealerPrice: number;
  sellingPrice: number;
}

export interface CablePackage {
  id: string;
  name: string;
  price: number;
  validity: string;
  description?: string;
}

export interface CableProvider {
  id: 'dstv' | 'gotv' | 'startimes' | 'showmax';
  name: string;
  packageLabel: string;
  packages: CablePackage[];
}

export interface Disco {
  id: string;
  name: string;
  code: string;
  minAmount: number;
  fee: number;
}

export interface EducationProvider {
  id: 'waec' | 'neco' | 'nabteb' | 'jamb';
  name: string;
  price: number;
  dealerPrice: number;
}

export interface BettingProvider {
  id: 'bet9ja' | 'nairabet' | '1xbet' | 'betking';
  name: string;
  minAmount: number;
  maxAmount: number;
}

export interface Catalog {
  dataPlans: DataPlan[];
  airtimeDenominations: AirtimeProduct[];
  cables: CableProvider[];
  discos: Disco[];
  education: EducationProvider[];
  betting: BettingProvider[];
}

export interface Wallet {
  balance: number;
  totalDebit: number;
  totalCredit: number;
  premium?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  referralCode: string;
  tier: 'starter' | 'pro' | 'dealer';
}

export interface CustomerInfo {
  name: string | null;
  product: string | null;
  network?: Network | null;
  provider?: string | null;
}

export interface OrderResult {
  reference: string;
  status: OrderStatus;
  amount: number;
  message: string;
  token?: string;
  pin?: string;
  oldBalance: number;
  newBalance: number;
}

export interface BuyRequest {
  category: Category;
  productId?: string;
  network?: Network;
  provider?: string;
  recipient?: string;
  amount?: number;
  customerName?: string;
  token?: string;
  plan?: {
    name: string;
    size?: string;
    validity?: string;
  };
}

export interface Transaction {
  id: string;
  reference: string;
  category: Category;
  product: string;
  network?: Network;
  recipient?: string;
  amount: number;
  profit: number;
  status: OrderStatus;
  createdAt: number;
  method?: string;
}

export interface TransactionQuery {
  category?: Category | 'all';
  status?: OrderStatus | 'all';
}

export interface FundMethod {
  id: string;
  label: string;
  detail: string;
  kind: 'bank_transfer' | 'card' | 'ussd';
  expiresIn?: number;
}

export interface FundAccount {
  accountNumber: string;
  bankName: string;
  accountName: string;
  expiresAt: number;
  reference: string;
}