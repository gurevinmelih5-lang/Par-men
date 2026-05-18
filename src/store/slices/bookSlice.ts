import type { StateCreator } from 'zustand';
import { supabase } from '../../lib/supabase';
import { mockBooks } from '../../mockData';
import type { Book, LineageEntry } from '../../mockData';
import type { DBBook } from '../../types/database.types';
import { calculateDistance } from '../../lib/location';
import toast from 'react-hot-toast';
import type { UserSlice } from './userSlice';
import type { SwapChat } from './uiSlice';

export interface OpenSwapChatSummary {
  swapId: string;
  bookTitle: string;
  bookCover: string;
  peerName: string;
  peerAvatar: string;
}

export interface SwapRequest {
  id: string;
  bookId: string;
  bookTitle: string;
  requesterName: string;
  requesterAvatar: string;
  requesterId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
}

export interface BookSlice {
  books: Book[];
  requestedSwaps: string[];
  incomingRequests: SwapRequest[];
  /** Onaylı ve henüz sonlandırılmamış takas sohbetleri (profil listesi) */
  openSwapChats: OpenSwapChatSummary[];
  addBook: (bookData: Partial<Book>) => Promise<void>;
  updateBook: (id: string, updates: Partial<Book>) => Promise<void>;
  deleteBook: (id: string) => Promise<void>;
  executeSwap: (bookId: string) => Promise<void>;
  requestSwap: (bookId: string) => Promise<void>;
  fetchIncomingRequests: () => Promise<void>;
  fetchOpenSwapChats: () => Promise<void>;
  fetchSwapChatPayload: (swapRequestId: string) => Promise<SwapChat | null>;
  openSwapChatById: (swapRequestId: string, opts?: { goToChatTab?: boolean }) => Promise<void>;
  endSwapChat: (swapRequestId: string) => Promise<void>;
  respondToSwapRequest: (requestId: string, accept: boolean) => Promise<void>;
  updateReadingProgress: (bookId: string, progress: number) => Promise<void>;
  mapDBBookToState: (dbBook: DBBook, userLat?: number, userLng?: number) => Book;
}

export const createBookSlice: StateCreator<BookSlice & UserSlice, [], [], BookSlice> = (set, get) => ({
  books: mockBooks,
  requestedSwaps: [],
  openSwapChats: [],
  incomingRequests: [
    {
      id: 'mock-req-1',
      bookId: 'b1',
      bookTitle: 'Körlük',
      requesterName: 'Caner Öz',
      requesterAvatar: 'https://i.pravatar.cc/150?u=a042581f4e29026024d',
      requesterId: 'u2',
      status: 'pending' as const,
      createdAt: new Date().toISOString(),
    }
  ],

  mapDBBookToState: (dbBook, userLat, userLng): Book => {
    const ownerLat = dbBook.profiles?.lat || dbBook.lat;
    const ownerLng = dbBook.profiles?.lng || dbBook.lng;
    let distance = Number(dbBook.distance_km) || 0;

    if (userLat != null && userLng != null && ownerLat != null && ownerLng != null) {
      distance = calculateDistance(userLat, userLng, ownerLat, ownerLng);
    }

    return {
      id: dbBook.id,
      title: dbBook.title,
      author: dbBook.author,
      cover: dbBook.cover_url,
      condition: dbBook.condition as Book['condition'],
      pace: dbBook.pace as Book['pace'],
      depth: dbBook.depth as Book['depth'],
      ownerId: dbBook.owner_id,
      distance,
      lineage: dbBook.book_lineage ? dbBook.book_lineage.map((l: any): LineageEntry => ({
        city: l.city,
        date: l.date,
        ownerName: l.owner_name
      })) : [],
      progress: dbBook.progress,
      timeCapsule: dbBook.time_capsule_message ? {
        message: dbBook.time_capsule_message,
        from: dbBook.time_capsule_from || 'Anonim'
      } : undefined
    };
  },

  addBook: async (bookData) => {
    try {
      const { user } = get();
      if (!user) return;
      
      toast.loading('Kitap ekleniyor...', { id: 'addBook' });
      const { data, error } = await supabase.from('books').insert({
        title: bookData.title,
        author: bookData.author,
        cover_url: bookData.cover || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400',
        condition: bookData.condition || 'Good',
        pace: bookData.pace || 'Medium',
        depth: bookData.depth || 'Medium',
        owner_id: user.id,
        lat: user.lat,
        lng: user.lng,
        time_capsule_message: bookData.timeCapsule?.message || null,
        time_capsule_from: bookData.timeCapsule?.message ? user.name : null
      }).select('*, book_lineage(*)').single();

      if (error) throw error;
      if (data) {
        set((state) => ({ books: [...state.books, get().mapDBBookToState(data as DBBook, user.lat, user.lng)] }));
        toast.success('Kitap kütüphanene eklendi!', { id: 'addBook' });
      }
    } catch (error) {
      console.error("Error adding book:", error);
      toast.error('Kitap eklenirken bir sorun oluştu.', { id: 'addBook' });
    }
  },

  updateBook: async (id, updates) => {
    try {
      const dbUpdates = {
        title: updates.title,
        author: updates.author,
        cover_url: updates.cover,
        condition: updates.condition,
        pace: updates.pace,
        depth: updates.depth
      };
      
      const { data, error } = await supabase
        .from('books')
        .update(dbUpdates)
        .eq('id', id)
        .select('*, book_lineage(*)').single();

      if (error) throw error;
      if (data) {
        set(state => ({
          books: state.books.map(b => b.id === id ? get().mapDBBookToState(data as DBBook, state.user.lat, state.user.lng) : b)
        }));
        toast.success('Kitap güncellendi.');
      }
    } catch (error) {
      console.error("Error updating book:", error);
      toast.error('Kitap güncellenemedi.');
    }
  },

  deleteBook: async (id) => {
    try {
      const { error } = await supabase.from('books').delete().eq('id', id);
      if (error) throw error;
      set(state => ({ books: state.books.filter(b => b.id !== id) }));
      toast.success('Kitap silindi.');
    } catch (error) {
      console.error("Error deleting book:", error);
      toast.error('Kitap silinemedi.');
    }
  },

  executeSwap: async (bookId) => {
    try {
      const { user, books } = get();
      if (!user) return;
      
      const book = books.find(b => b.id === bookId);
      if (!book) return;

      toast.loading('Takas gerçekleştiriliyor...', { id: 'swapBook' });

      const dateStr = new Date().toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });
      const cityStr = 'Parşömen Ağı'; 
      
      const { error: rpcError } = await supabase.rpc('swap_book', {
        p_book_id: bookId,
        p_new_owner_id: user.id,
        p_owner_name: user.name,
        p_city: cityStr,
        p_date: dateStr
      });
      
      if (rpcError) throw rpcError;

      const newPhysical = user.karma.physical + 5;
      const newSocial = user.karma.social + 10;
      
      await supabase
        .from('profiles')
        .update({ karma_physical: newPhysical, karma_social: newSocial })
        .eq('id', user.id);
      
      toast.success('Takas başarılı! Kitap kütüphanene eklendi.', { id: 'swapBook' });
      
      // Bu adımda verileri yeniden çekmek en doğrusudur ama dilimlere böldüğümüz için
      // fetchInitialData root store'da olacak. O yüzden çağıran componentte veya root store içinden
      // yönetilebilir.
      
    } catch (error) {
      console.error("Error executing swap:", error);
      toast.error('Takas başarısız oldu.', { id: 'swapBook' });
    }
  },

  requestSwap: async (bookId) => {
    try {
      const { user, books } = get();
      if (!user) { toast.error('Giriş yapman gerekiyor.'); return; }

      const book = books.find(b => b.id === bookId);
      if (!book) return;

      // Check duplicate request
      if (get().requestedSwaps.includes(bookId)) {
        toast('Zaten bu kitap için istek gönderdin.', { icon: 'ℹ️' });
        return;
      }

      toast.loading('Takas isteği gönderiliyor...', { id: 'reqSwap' });

      const { error } = await supabase.from('swap_requests').insert({
        book_id: bookId,
        requester_id: user.id,
        owner_id: book.ownerId,
        status: 'pending'
      });

      if (error) throw error;

      set(state => ({ requestedSwaps: [...state.requestedSwaps, bookId] }));
      toast.success('Takas isteği kitap sahibine gönderildi!', { id: 'reqSwap' });
    } catch (error: any) {
      console.error('Error requesting swap:', error);
      // If duplicate key (already requested)
      if (error?.code === '23505') {
        set(state => ({ requestedSwaps: [...state.requestedSwaps, bookId] }));
        toast('Bu kitap için zaten istek gönderdin.', { icon: 'ℹ️', id: 'reqSwap' });
      } else {
        toast.error('İstek gönderilemedi. Tekrar dene.', { id: 'reqSwap' });
      }
    }
  },

  fetchIncomingRequests: async () => {
    try {
      const { user } = get();
      if (!user) return;

      const { data, error } = await supabase
        .from('swap_requests')
        .select(`
          id,
          book_id,
          requester_id,
          status,
          created_at,
          books ( title ),
          profiles!swap_requests_requester_id_fkey ( name, avatar_url )
        `)
        .eq('owner_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const mapped: SwapRequest[] = (data || []).map((r: any) => ({
        id: r.id,
        bookId: r.book_id,
        bookTitle: r.books?.title || 'Bilinmeyen Kitap',
        requesterName: r.profiles?.name || 'Anonim',
        requesterAvatar: r.profiles?.avatar_url || 'https://i.pravatar.cc/150',
        requesterId: r.requester_id,
        status: r.status,
        createdAt: r.created_at
      }));

      set({ incomingRequests: mapped });
    } catch (error) {
      console.error('Error fetching swap requests:', error);
    }
  },

  fetchOpenSwapChats: async () => {
    try {
      const { user } = get();
      if (!user) return;

      const { data, error } = await supabase
        .from('swap_requests')
        .select(`
          id,
          owner_id,
          requester_id,
          books ( title, cover_url ),
          requester_p:profiles!swap_requests_requester_id_fkey ( name, avatar_url ),
          owner_p:profiles!swap_requests_owner_id_fkey ( name, avatar_url )
        `)
        .eq('status', 'accepted')
        .is('chat_ended_by', null)
        .or(`owner_id.eq.${user.id},requester_id.eq.${user.id}`);

      if (error) throw error;

      const list: OpenSwapChatSummary[] = (data || []).map((row: any) => {
        const isOwner = row.owner_id === user.id;
        const peer = isOwner ? row.requester_p : row.owner_p;
        return {
          swapId: row.id,
          bookTitle: row.books?.title || 'Kitap',
          bookCover: row.books?.cover_url || '',
          peerName: peer?.name || 'Okur',
          peerAvatar: peer?.avatar_url || 'https://i.pravatar.cc/150',
        };
      });
      set({ openSwapChats: list });
    } catch (error) {
      console.error('Error fetching open swap chats:', error);
    }
  },

  fetchSwapChatPayload: async (swapRequestId) => {
    try {
      const { user } = get();
      if (!user) return null;

      const { data, error } = await supabase
        .from('swap_requests')
        .select(`
          id,
          book_id,
          owner_id,
          requester_id,
          status,
          chat_ended_by,
          books ( title, cover_url ),
          requester_p:profiles!swap_requests_requester_id_fkey ( id, name, avatar_url ),
          owner_p:profiles!swap_requests_owner_id_fkey ( id, name, avatar_url )
        `)
        .eq('id', swapRequestId)
        .single();

      if (error || !data) return null;
      const row = data as any;
      if (row.status !== 'accepted') return null;

      const isOwner = row.owner_id === user.id;
      const peer = isOwner ? row.requester_p : row.owner_p;
      if (!peer?.id) return null;

      return {
        swapId: row.id,
        bookId: row.book_id,
        ownerId: row.owner_id,
        requesterId: row.requester_id,
        otherUserId: peer.id,
        otherUserName: peer.name || 'Okur',
        otherUserAvatar: peer.avatar_url || 'https://i.pravatar.cc/150',
        bookTitle: row.books?.title || 'Kitap',
        bookCover: row.books?.cover_url || '',
        chatEndedBy: row.chat_ended_by ?? null,
      };
    } catch (error) {
      console.error('Error fetching swap chat payload:', error);
      return null;
    }
  },

  openSwapChatById: async (swapRequestId, opts) => {
    const payload = await get().fetchSwapChatPayload(swapRequestId);
    const ui = get() as any;
    if (payload) {
      ui.setActiveSwapChat(payload);
      if (opts?.goToChatTab) ui.setActiveTab('chat');
    }
    await get().fetchOpenSwapChats();
  },

  endSwapChat: async (swapRequestId) => {
    try {
      const { error } = await supabase.rpc('end_swap_chat', { p_swap_request_id: swapRequestId });
      if (error) throw error;
      const ui = get() as any;
      if (ui.activeSwapChat?.swapId === swapRequestId) {
        ui.setActiveSwapChat(null);
        ui.setActiveTab('profile');
      }
      await get().fetchOpenSwapChats();
      toast.success('Sohbet sonlandırıldı.');
    } catch (error) {
      console.error('Error ending swap chat:', error);
      toast.error('Sohbet sonlandırılamadı. Supabase\'de swap_chat_extension.sql çalıştırıldığından emin olun.');
    }
  },

  respondToSwapRequest: async (requestId, accept) => {
    try {
      const newStatus = accept ? 'accepted' : 'rejected';
      const { incomingRequests } = get();
      const req = incomingRequests.find(r => r.id === requestId);

      const { error } = await supabase
        .from('swap_requests')
        .update({ status: newStatus })
        .eq('id', requestId);

      if (error) throw error;

      set(state => ({
        incomingRequests: state.incomingRequests.filter(r => r.id !== requestId)
      }));

      if (accept && req) {
        set(state => ({
          requestedSwaps: state.requestedSwaps.filter(id => id !== req.bookId),
        }));

        await get().openSwapChatById(requestId, { goToChatTab: true });
        toast.success('Takas kabul edildi! Sohbet açıldı.');
      } else {
        toast.success(accept ? 'Takas isteği kabul edildi!' : 'Takas isteği reddedildi.');
      }
    } catch (error) {
      console.error('Error responding to swap request:', error);
      toast.error('İşlem başarısız.');
    }
  },

  updateReadingProgress: async (bookId, progress) => {
    try {
      // Optimistic update
      set(state => ({
        books: state.books.map(b => b.id === bookId ? { ...b, progress } : b)
      }));

      const { error } = await supabase
        .from('books')
        .update({ progress })
        .eq('id', bookId);
        
      if (error) {
        throw error;
      }
      toast.success('Okuma ilerlemesi kaydedildi.');
    } catch (error) {
      console.error("Error updating reading progress:", error);
      toast.error('İlerleme kaydedilemedi.');
    }
  }
});
