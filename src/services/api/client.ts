import { AppConfig } from '@/constants/config';
import { MockVtuProvider, type VtuProvider } from '@/services/api/mock-provider';
import {
  pairgateProvider,
  peyflexProvider,
  vtuNgProvider,
} from '@/services/api/providers';

export function getProvider(): VtuProvider {
  switch (AppConfig.provider) {
    case 'vtu.ng':
      return vtuNgProvider();
    case 'pairgate':
      return pairgateProvider();
    case 'peyflex':
      return peyflexProvider();
    case 'mock':
    default:
      return new MockVtuProvider();
  }
}

export const api: VtuProvider = getProvider();

export { AppConfig };
export type { VtuProvider };
export * from './types';