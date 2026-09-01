import type {
  AirtimeProduct,
  BettingProvider,
  CableProvider,
  Catalog,
  DataPlan,
  Disco,
  EducationProvider,
} from '@/services/api/types';

/**
 * Static catalog shipped with the mock provider.
 * `dealerPrice`  = what the platform owner pays the upstream VTU provider (wholesale).
 * `sellingPrice` = what the end customer is charged in the app (retail/marked up).
 * The difference is the reseller margin recorded against every order.
 *
 * Replace or override this catalog from a live provider when a real backend is wired
 * up via `services/api/client` providers.
 */

const MTN_PLANS: DataPlan[] = [
  { id: 'mtn-sme-500', network: 'mtn', type: 'sme', name: 'MTN SME 500MB', size: '500MB', validity: '30 days', dealerPrice: 122, sellingPrice: 150, popular: true },
  { id: 'mtn-sme-1', network: 'mtn', type: 'sme', name: 'MTN SME 1GB', size: '1GB', validity: '30 days', dealerPrice: 240, sellingPrice: 300, popular: true },
  { id: 'mtn-sme-2', network: 'mtn', type: 'sme', name: 'MTN SME 2GB', size: '2GB', validity: '30 days', dealerPrice: 460, sellingPrice: 550 },
  { id: 'mtn-sme-3', network: 'mtn', type: 'sme', name: 'MTN SME 3GB', size: '3GB', validity: '30 days', dealerPrice: 690, sellingPrice: 800 },
  { id: 'mtn-sme-5', network: 'mtn', type: 'sme', name: 'MTN SME 5GB', size: '5GB', validity: '30 days', dealerPrice: 1120, sellingPrice: 1280, popular: true },
  { id: 'mtn-sme-10', network: 'mtn', type: 'sme', name: 'MTN SME 10GB', size: '10GB', validity: '30 days', dealerPrice: 2160, sellingPrice: 2450 },
  { id: 'mtn-cg-1', network: 'mtn', type: 'cg', name: 'MTN CG 1GB', size: '1GB', validity: '30 days', dealerPrice: 255, sellingPrice: 310 },
  { id: 'mtn-cg-2', network: 'mtn', type: 'cg', name: 'MTN CG 2.5GB', size: '2.5GB', validity: '30 days', dealerPrice: 560, sellingPrice: 650 },
  { id: 'mtn-gift-500', network: 'mtn', type: 'gifting', name: 'MTN Gifting 500MB', size: '500MB', validity: '7 days', dealerPrice: 140, sellingPrice: 170 },
  { id: 'mtn-gift-1', network: 'mtn', type: 'gifting', name: 'MTN Gifting 1GB', size: '1GB', validity: '30 days', dealerPrice: 262, sellingPrice: 320, popular: true },
  { id: 'mtn-gift-2', network: 'mtn', type: 'gifting', name: 'MTN Gifting 2GB', size: '2GB', validity: '30 days', dealerPrice: 500, sellingPrice: 580 },
  { id: 'mtn-gift-5', network: 'mtn', type: 'gifting', name: 'MTN Gifting 5GB', size: '5GB', validity: '30 days', dealerPrice: 1200, sellingPrice: 1350 },
];

const GLO_PLANS: DataPlan[] = [
  { id: 'glo-sme-1', network: 'glo', type: 'sme', name: 'Glo SME 1GB', size: '1GB', validity: '30 days', dealerPrice: 168, sellingPrice: 230, popular: true },
  { id: 'glo-sme-2', network: 'glo', type: 'sme', name: 'Glo SME 2GB', size: '2GB', validity: '30 days', dealerPrice: 330, sellingPrice: 420, popular: true },
  { id: 'glo-sme-3', network: 'glo', type: 'sme', name: 'Glo SME 3GB', size: '3GB', validity: '30 days', dealerPrice: 490, sellingPrice: 600 },
  { id: 'glo-sme-5', network: 'glo', type: 'sme', name: 'Glo SME 5GB', size: '5GB', validity: '30 days', dealerPrice: 780, sellingPrice: 950 },
  { id: 'glo-sme-8', network: 'glo', type: 'sme', name: 'Glo SME 8GB', size: '8GB', validity: '30 days', dealerPrice: 1190, sellingPrice: 1400 },
  { id: 'glo-sme-10', network: 'glo', type: 'sme', name: 'Glo SME 10GB', size: '10GB', validity: '30 days', dealerPrice: 1450, sellingPrice: 1680 },
  { id: 'glo-gift-1', network: 'glo', type: 'gifting', name: 'Glo Gifting 1GB', size: '1GB', validity: '7 days', dealerPrice: 200, sellingPrice: 270 },
];

const AIRTEL_PLANS: DataPlan[] = [
  { id: 'airtel-sme-1', network: 'airtel', type: 'sme', name: 'Airtel SME 1GB', size: '1GB', validity: '30 days', dealerPrice: 250, sellingPrice: 330, popular: true },
  { id: 'airtel-sme-2', network: 'airtel', type: 'sme', name: 'Airtel SME 2GB', size: '2GB', validity: '30 days', dealerPrice: 480, sellingPrice: 580 },
  { id: 'airtel-sme-3', network: 'airtel', type: 'sme', name: 'Airtel SME 3GB', size: '3GB', validity: '30 days', dealerPrice: 720, sellingPrice: 850 },
  { id: 'airtel-sme-5', network: 'airtel', type: 'sme', name: 'Airtel SME 5GB', size: '5GB', validity: '30 days', dealerPrice: 1180, sellingPrice: 1350, popular: true },
  { id: 'airtel-sme-8', network: 'airtel', type: 'sme', name: 'Airtel SME 8GB', size: '8GB', validity: '30 days', dealerPrice: 1850, sellingPrice: 2050 },
  { id: 'airtel-cg-1', network: 'airtel', type: 'cg', name: 'Airtel CG 1GB', size: '1GB', validity: '30 days', dealerPrice: 275, sellingPrice: 360 },
  { id: 'airtel-gift-2', network: 'airtel', type: 'gifting', name: 'Airtel Gifting 2GB', size: '2GB', validity: '30 days', dealerPrice: 560, sellingPrice: 650 },
];

const NINEMOBILE_PLANS: DataPlan[] = [
  { id: '9mobile-sme-1', network: '9mobile', type: 'sme', name: '9mobile SME 1GB', size: '1GB', validity: '30 days', dealerPrice: 268, sellingPrice: 360 },
  { id: '9mobile-sme-2', network: '9mobile', type: 'sme', name: '9mobile SME 2GB', size: '2GB', validity: '30 days', dealerPrice: 500, sellingPrice: 600 },
  { id: '9mobile-sme-3', network: '9mobile', type: 'sme', name: '9mobile SME 3GB', size: '3GB', validity: '30 days', dealerPrice: 760, sellingPrice: 900 },
  { id: '9mobile-sme-5', network: '9mobile', type: 'sme', name: '9mobile SME 5GB', size: '5GB', validity: '30 days', dealerPrice: 1230, sellingPrice: 1380 },
];

export const dataPlans: DataPlan[] = [...MTN_PLANS, ...GLO_PLANS, ...AIRTEL_PLANS, ...NINEMOBILE_PLANS];

export const airtimeDenominations: AirtimeProduct[] = [
  { network: 'mtn', denomination: 100, dealerPrice: 97.5, sellingPrice: 100 },
  { network: 'mtn', denomination: 200, dealerPrice: 195, sellingPrice: 200 },
  { network: 'mtn', denomination: 500, dealerPrice: 485, sellingPrice: 500 },
  { network: 'mtn', denomination: 1000, dealerPrice: 970, sellingPrice: 1000 },
  { network: 'mtn', denomination: 2000, dealerPrice: 1940, sellingPrice: 2000 },
  { network: 'mtn', denomination: 5000, dealerPrice: 4850, sellingPrice: 5000 },
  { network: 'glo', denomination: 100, dealerPrice: 97.5, sellingPrice: 100 },
  { network: 'glo', denomination: 200, dealerPrice: 195, sellingPrice: 200 },
  { network: 'glo', denomination: 500, dealerPrice: 485, sellingPrice: 500 },
  { network: 'glo', denomination: 1000, dealerPrice: 970, sellingPrice: 1000 },
  { network: 'glo', denomination: 2000, dealerPrice: 1940, sellingPrice: 2000 },
  { network: 'glo', denomination: 5000, dealerPrice: 4850, sellingPrice: 5000 },
  { network: 'airtel', denomination: 100, dealerPrice: 98, sellingPrice: 100 },
  { network: 'airtel', denomination: 200, dealerPrice: 195, sellingPrice: 200 },
  { network: 'airtel', denomination: 500, dealerPrice: 488, sellingPrice: 500 },
  { network: 'airtel', denomination: 1000, dealerPrice: 975, sellingPrice: 1000 },
  { network: 'airtel', denomination: 2000, dealerPrice: 1950, sellingPrice: 2000 },
  { network: 'airtel', denomination: 5000, dealerPrice: 4875, sellingPrice: 5000 },
  { network: '9mobile', denomination: 100, dealerPrice: 98, sellingPrice: 100 },
  { network: '9mobile', denomination: 200, dealerPrice: 196, sellingPrice: 200 },
  { network: '9mobile', denomination: 500, dealerPrice: 488, sellingPrice: 500 },
  { network: '9mobile', denomination: 1000, dealerPrice: 975, sellingPrice: 1000 },
  { network: '9mobile', denomination: 2000, dealerPrice: 1950, sellingPrice: 2000 },
  { network: '9mobile', denomination: 5000, dealerPrice: 4875, sellingPrice: 5000 },
];

export const cables: CableProvider[] = [
  {
    id: 'dstv',
    name: 'DStv',
    packageLabel: 'Bouquet',
    packages: [
      { id: 'dstv-padi', name: 'Padi', price: 2900, validity: '1 month', description: 'Start enjoying DStv on a budget' },
      { id: 'dstv-yanga', name: 'Yanga', price: 4200, validity: '1 month' },
      { id: 'dstv-confam', name: 'Confam', price: 6400, validity: '1 month', description: 'Most popular family package' },
      { id: 'dstv-comfam', name: 'Compact', price: 10500, validity: '1 month' },
      { id: 'dstv-comfamplus', name: 'Compact Plus', price: 17500, validity: '1 month' },
      { id: 'dstv-premium', name: 'Premium', price: 31000, validity: '1 month' },
    ],
  },
  {
    id: 'gotv',
    name: 'GOtv',
    packageLabel: 'Package',
    packages: [
      { id: 'gotv-jinja', name: 'Jinja', price: 1500, validity: '1 month' },
      { id: 'gotv-jolli', name: 'Jolli', price: 2800, validity: '1 month' },
      { id: 'gotv-max', name: 'Max', price: 5100, validity: '1 month', description: 'Most popular' },
      { id: 'gotv-supa', name: 'Supa', price: 7600, validity: '1 month' },
    ],
  },
  {
    id: 'startimes',
    name: 'StarTimes',
    packageLabel: 'Package',
    packages: [
      { id: 'star-basic', name: 'Basic', price: 1300, validity: '1 month' },
      { id: 'star-classic', name: 'Classic', price: 2600, validity: '1 month' },
      { id: 'star-smart', name: 'Smart', price: 4500, validity: '1 month' },
      { id: 'star-nova', name: 'Nova', price: 8400, validity: '1 month' },
    ],
  },
  {
    id: 'showmax',
    name: 'Showmax',
    packageLabel: 'Bundle',
    packages: [
      { id: 'sm-mobile', name: 'Mobile', price: 2000, validity: '1 month' },
      { id: 'sm-ent', name: 'Entertainment', price: 3200, validity: '1 month' },
    ],
  },
];

export const discos: Disco[] = [
  { id: 'abuja', name: 'Abuja Electricity (AEDC)', code: 'AEDC', minAmount: 1000, fee: 100 },
  { id: 'ikeja', name: 'Ikeja Electric (IKEDC)', code: 'IKEDC', minAmount: 1000, fee: 100 },
  { id: 'eko', name: 'Eko Electric (EKEDC)', code: 'EKEDC', minAmount: 1000, fee: 100 },
  { id: 'ibadan', name: 'Ibadan Disco (IBEDC)', code: 'IBEDC', minAmount: 1000, fee: 100 },
  { id: 'benin', name: 'Benin Electric (BEDC)', code: 'BEDC', minAmount: 1000, fee: 100 },
  { id: 'port-harcourt', name: 'Port Harcourt (PHED)', code: 'PHED', minAmount: 1000, fee: 100 },
  { id: 'enugu', name: 'Enugu Electric (EEDC)', code: 'EEDC', minAmount: 1000, fee: 100 },
  { id: 'jos', name: 'Jos Electric (JED)', code: 'JED', minAmount: 1000, fee: 100 },
  { id: 'kaduna', name: 'Kaduna Electric (KAEDCO)', code: 'KAEDCO', minAmount: 1000, fee: 100 },
  { id: 'kano', name: 'Kano Electric (KEDCO)', code: 'KEDCO', minAmount: 1000, fee: 100 },
];

export const education: EducationProvider[] = [
  { id: 'waec', name: 'WAEC Result Checker PIN', price: 2900, dealerPrice: 2850 },
  { id: 'neco', name: 'NECO Result Checker PIN', price: 1500, dealerPrice: 1470 },
  { id: 'nabteb', name: 'NABTEB Result Checker PIN', price: 1500, dealerPrice: 1470 },
  { id: 'jamb', name: 'JAMB Result / Profile PIN', price: 2700, dealerPrice: 2650 },
];

export const betting: BettingProvider[] = [
  { id: 'bet9ja', name: 'Bet9ja', minAmount: 1000, maxAmount: 100000 },
  { id: 'nairabet', name: 'NairaBet', minAmount: 1000, maxAmount: 100000 },
  { id: '1xbet', name: '1xBet', minAmount: 2000, maxAmount: 100000 },
  { id: 'betking', name: 'BetKing', minAmount: 1000, maxAmount: 100000 },
];

export const catalog: Catalog = {
  dataPlans,
  airtimeDenominations,
  cables,
  discos,
  education,
  betting,
};