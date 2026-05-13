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
import type { DBProfile, DBBook, DBScriptum } from '../types/database.types';

export type StoreState = UISlice & UserSlice & BookSlice & SocialSlice & {
  fetchInitialData: () => Promise<void>;
};

export const useStore = create<StoreState>()((...a) => ({
  ...createUISlice(...a),
  ...createUserSlice(...a),
  ...createBookSlice(...a),
  ...createSocialSlice(...a),
  
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
        .select('*, book_lineage(*), profiles(lat, lng)');
        
      if (!booksError && booksData) {
        set({ books: booksData.map(b => get().mapDBBookToState(b as DBBook, profile?.lat, profile?.lng)) });
      }

      // 3. Fetch Scriptums with Profiles and Duels
      const { data: scriptumsData, error: scriptumsError } = await supabase
        .from('scriptums')
        .select(`
          *,
          profiles:user_id(name, avatar_url),
          scriptum_duels(
            *,
            profiles:opponent_id(name, avatar_url)
          )
        `);
        
        if (!scriptumsError && scriptumsData) {
        set({ scriptums: scriptumsData.map(s => get().mapDBScriptumToState(s as DBScriptum)) });
      }

      // 4. Fetch Incoming Swap Requests
      await get().fetchIncomingRequests();
      await get().fetchOpenSwapChats();

    } catch (error) {
      console.error("Error fetching initial data from Supabase:", error);
    }
  }
}));
