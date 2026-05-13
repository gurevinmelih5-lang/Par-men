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
  activeTab: 'dashboard' | 'discovery' | 'swap' | 'profile' | 'bookDetail' | 'publicProfile' | 'chat' | 'arena';
  tabHistory: ('dashboard' | 'discovery' | 'swap' | 'profile' | 'bookDetail' | 'publicProfile' | 'chat' | 'arena')[];
  theme: 'light' | 'gold';
  selectedBookId: string | null;
  activeSwapChat: SwapChat | null;
  setActiveTab: (tab: UISlice['activeTab']) => void;
  goBack: () => void;
  setTheme: (theme: 'light' | 'gold') => void;
  setSelectedBook: (id: string | null) => void;
  setActiveSwapChat: (chat: SwapChat | null) => void;
}

export const createUISlice: StateCreator<UISlice, [], [], UISlice> = (set) => ({
  activeTab: 'dashboard',
  tabHistory: ['dashboard'],
  theme: 'light',
  selectedBookId: null,
  activeSwapChat: null,
  setActiveTab: (tab) => set((state) => {
    if (state.activeTab === tab) return state;
    return { 
      activeTab: tab, 
      tabHistory: [...state.tabHistory, state.activeTab] 
    };
  }),
  goBack: () => set((state) => {
    if (state.tabHistory.length <= 1) return { activeTab: 'dashboard' };
    const newHistory = [...state.tabHistory];
    const prevTab = newHistory.pop();
    return { activeTab: prevTab as UISlice['activeTab'], tabHistory: newHistory };
  }),
  setTheme: (theme) => set({ theme }),
  setSelectedBook: (id) => set({ selectedBookId: id }),
  setActiveSwapChat: (chat) => set({ activeSwapChat: chat }),
});
