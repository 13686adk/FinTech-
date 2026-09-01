import { create } from 'zustand';

export interface ToastItem {
  id: string;
  message: string;
  tone: 'success' | 'error' | 'info' | 'warning';
}

interface AppState {
  toasts: ToastItem[];
  showToast: (message: string, tone?: ToastItem['tone']) => void;
  dismissToast: (id: string) => void;
}

export const useApp = create<AppState>((set) => ({
  toasts: [],
  showToast: (message, tone = 'info') => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    set((s) => ({ toasts: [...s.toasts, { id, message, tone }] }));
  },
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));