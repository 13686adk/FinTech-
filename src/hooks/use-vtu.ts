import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { api } from '@/services/api/client';
import type { BuyRequest, CustomerInfo, TransactionQuery } from '@/services/api/types';

export const queryKeys = {
  catalog: ['catalog'] as const,
  wallet: (userId: string) => ['wallet', userId] as const,
  transactions: (userId: string, query?: TransactionQuery) =>
    ['transactions', userId, query] as const,
  fundingMethods: ['funding-methods'] as const,
};

export function useCatalog() {
  return useQuery({
    queryKey: queryKeys.catalog,
    queryFn: () => api.getCatalog(),
    staleTime: 10 * 60 * 1000,
  });
}

export function useWallet(userId?: string | null) {
  return useQuery({
    queryKey: queryKeys.wallet(userId ?? ''),
    queryFn: () => api.getWallet(userId ?? ''),
    enabled: Boolean(userId),
  });
}

export function useTransactions(userId?: string | null, query?: TransactionQuery) {
  return useQuery({
    queryKey: queryKeys.transactions(userId ?? '', query),
    queryFn: () => api.getTransactions(userId ?? '', query),
    enabled: Boolean(userId),
  });
}

export function useVerifyCustomer() {
  return useMutation({
    mutationFn: (req: {
      userId: string;
      category: string;
      network?: string;
      provider?: string;
      recipient?: string;
    }) => api.verifyCustomer(req),
  });
}

export function usePurchase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, req }: { userId: string; req: BuyRequest }) =>
      api.purchase(userId, req),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.wallet(variables.userId) });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.transactions(variables.userId),
      });
    },
  });
}

export function useFundingMethods() {
  return useQuery({
    queryKey: queryKeys.fundingMethods,
    queryFn: () => api.getFundingMethods(),
  });
}

export function useVirtualAccount(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.requestVirtualAccount(userId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['virtual-account', userId] });
    },
  });
}

export function useFundWallet(userId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ reference, amount }: { reference: string; amount: number }) =>
      api.fundViaTransfer(userId, reference, amount),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.wallet(userId) });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.transactions(userId),
      });
    },
  });
}

export type { CustomerInfo };