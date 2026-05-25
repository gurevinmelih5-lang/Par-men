import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { createUISlice } from './slices/uiSlice';
import type { UISlice } from './slices/uiSlice';
import { createUserSlice } from './slices/userSlice';
import type { UserSlice } from './slices/userSlice';
import { createBookSlice } from './slices/bookSlice';
import type { BookSlice } from './slices/bookSlice';
import { createSocialSlice } from './slices/socialSlice';
import type { SocialSlice } from './slices/socialSlice';
import { createRoomSlice } from './slices/roomSlice';
import type { RoomSlice } from './slices/roomSlice';
import type { DBProfile, DBBook, DBScriptum } from '../types/database.types';

export type StoreState = UISlice & UserSlice & BookSlice & SocialSlice & RoomSlice & {
  fetchInitialData: () => Promise<void>;
};

export const useStore = create<StoreState>()((...a) => ({
  ...createUISlice(...a),
  ...createUserSlice(...a),
  ...createBookSlice(...a),
  ...createSocialSlice(...a),
  ...createRoomSlice(...a),
  
  fetchInitialData: async () => {
    const set = a[0];
    const get = a[1];
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      // 1. Fetch User Profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (profile) {
        set({ user: get().mapDBUserToState(profile as DBProfile) });
      }

      // 2. Fetch Books with Lineage and Profiles
      const { data: booksData, error: booksError } = await supabase
        .from('books')
        .select('*, book_lineage(*), profiles(lat, lng), book_capsules(*)');
        
      if (!booksError && booksData) {
        const FAKE_USER_IDS = ['11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222'];
        const filteredBooks = booksData.filter(b => !FAKE_USER_IDS.includes(b.owner_id));
        set({ books: filteredBooks.map(b => get().mapDBBookToState(b as DBBook, profile?.lat, profile?.lng)) });
      }

      // 3. Fetch Scriptums with Profiles
      const { data: scriptumsData, error: scriptumsError } = await supabase
        .from('scriptums')
        .select(`
          *,
          profiles:user_id(name, avatar_url),
          scriptum_replies(*, profiles:user_id(name, avatar_url)),
          scriptum_likes(user_id)
        `)
        .order('created_at', { ascending: false });
        
      if (!scriptumsError && scriptumsData) {
        const FAKE_USER_IDS = ['11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222'];
        const filteredScriptums = scriptumsData.filter(s => !FAKE_USER_IDS.includes(s.user_id));
        const cleanedScriptums = filteredScriptums.map(s => {
          if (s.scriptum_replies) {
            s.scriptum_replies = s.scriptum_replies.filter((r: any) => !FAKE_USER_IDS.includes(r.user_id));
          }
          return s;
        });
        set({ scriptums: cleanedScriptums.map(s => get().mapDBScriptumToState(s as DBScriptum)) });
      }

      // 4. Fetch Incoming Swap Requests
      await get().fetchIncomingRequests();
      await get().fetchOpenSwapChats();
      
      // 5. Load Rooms
      get().loadRooms();

    } catch (error) {
      console.error("Error fetching initial data from Supabase:", error);
    }
  }
}));
