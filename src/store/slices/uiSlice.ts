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
  theme: 'light';
  selectedBookId: string | null;
  activeSwapChat: SwapChat | null;
  setTheme: (theme: 'light') => void;
  setSelectedBook: (id: string | null) => void;
  setActiveSwapChat: (chat: SwapChat | null) => void;
}

export const createUISlice: StateCreator<UISlice, [], [], UISlice> = (set) => ({
  theme: 'light',
  selectedBookId: null,
  activeSwapChat: null,
  setTheme: () => {
    set({ theme: 'light' });
  },
  setSelectedBook: (id) => set({ selectedBookId: id }),
  setActiveSwapChat: (chat) => set({ activeSwapChat: chat }),
});
