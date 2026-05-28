import type { StateCreator } from 'zustand';

export interface SwapChat {
  swapId: string;
  bookId: string;
  ownerId: string;
  requesterId: string;
  otherUserId: string;
  otherUserName: string;
  otherUserAvatar: string;
  bookTitle: string;
  bookCover: string;
  /** Sohbeti hangi kullanıcı sonlandırdı (varsa) */
  chatEndedBy?: string | null;
}

export interface UISlice {
  theme: 'light' | 'dark' | 'gold' | 'gold-dark';
  selectedBookId: string | null;
  activeSwapChat: SwapChat | null;
  setTheme: (theme: 'light' | 'dark' | 'gold' | 'gold-dark') => void;
  setSelectedBook: (id: string | null) => void;
  setActiveSwapChat: (chat: SwapChat | null) => void;
}

export const createUISlice: StateCreator<UISlice, [], [], UISlice> = (set) => ({
  theme: (localStorage.getItem('parsomen_theme') as any) || 'light',
  selectedBookId: null,
  activeSwapChat: null,
  setTheme: (theme) => {
    localStorage.setItem('parsomen_theme', theme);
    set({ theme });
  },
  setSelectedBook: (id) => set({ selectedBookId: id }),
  setActiveSwapChat: (chat) => set({ activeSwapChat: chat }),
});
