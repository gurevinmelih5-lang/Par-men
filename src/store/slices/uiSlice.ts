import type { StateCreator } from 'zustand';

export interface UISlice {
  activeTab: 'dashboard' | 'discovery' | 'swap' | 'profile' | 'bookDetail' | 'arena' | 'publicProfile';
  theme: 'light' | 'gold';
  setActiveTab: (tab: UISlice['activeTab']) => void;
  setTheme: (theme: 'light' | 'gold') => void;
}

export const createUISlice: StateCreator<UISlice, [], [], UISlice> = (set) => ({
  activeTab: 'dashboard',
  theme: 'light',
  setActiveTab: (tab) => set({ activeTab: tab }),
  setTheme: (theme) => set({ theme }),
});
