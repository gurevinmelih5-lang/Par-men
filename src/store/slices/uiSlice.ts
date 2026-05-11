import type { StateCreator } from 'zustand';

export interface UISlice {
  activeTab: 'dashboard' | 'discovery' | 'swap' | 'profile' | 'bookDetail' | 'publicProfile';
  theme: 'light' | 'gold';
  selectedBookId: string | null;
  setActiveTab: (tab: UISlice['activeTab']) => void;
  setTheme: (theme: 'light' | 'gold') => void;
  setSelectedBook: (id: string | null) => void;
}

export const createUISlice: StateCreator<UISlice, [], [], UISlice> = (set) => ({
  activeTab: 'dashboard',
  theme: 'light',
  selectedBookId: null,
  setActiveTab: (tab) => set({ activeTab: tab }),
  setTheme: (theme) => set({ theme }),
  setSelectedBook: (id) => set({ selectedBookId: id }),
});
