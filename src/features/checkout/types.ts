import { router } from 'expo-router';

import type { BuyRequest, Category } from '@/services/api/types';

export interface CheckoutRow {
  label: string;
  value: string;
}

export interface CheckoutOrder {
  category: Category;
  title: string;
  product: string;
  network?: string;
  provider?: string;
  recipient?: string;
  amount: number;
  profit: number;
  rows: CheckoutRow[];
  request: BuyRequest;
}

export function pushCheckout(order: CheckoutOrder) {
  router.push({
    pathname: '/checkout',
    params: { order: JSON.stringify(order) },
  });
}