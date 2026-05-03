import type { StateCreator } from 'zustand';
import { supabase } from '../../lib/supabase';
import { currentUser } from '../../mockData';
import type { User } from '../../mockData';
import type { DBProfile } from '../../types/database.types';
import toast from 'react-hot-toast';

export interface UserSlice {
  user: User;
  viewedUser: User | null;
  setViewedUser: (user: User | null) => void;
  updateLocation: (lat: number, lng: number) => Promise<void>;
  searchUsers: (query: string) => Promise<User[]>;
  mapDBUserToState: (dbProfile: DBProfile) => User;
}

export const createUserSlice: StateCreator<UserSlice, [], [], UserSlice> = (set, get) => ({
  user: currentUser,
  viewedUser: null,
  
  setViewedUser: (user) => set({ viewedUser: user }),

  mapDBUserToState: (dbProfile: DBProfile): User => ({
    id: dbProfile.id,
    name: dbProfile.name,
    avatar: dbProfile.avatar_url || 'https://i.pravatar.cc/150',
    karma: {
      physical: dbProfile.karma_physical,
      intellectual: dbProfile.karma_intellectual,
      social: dbProfile.karma_social,
      total: Math.round((dbProfile.karma_physical + dbProfile.karma_intellectual + dbProfile.karma_social) / 3)
    },
    lat: dbProfile.lat || undefined,
    lng: dbProfile.lng || undefined
  }),

  updateLocation: async (lat, lng) => {
    try {
      const { user } = get();
      if (!user) return;

      const { error } = await supabase
        .from('profiles')
        .update({ lat, lng })
        .eq('id', user.id);

      if (error) throw error;
      
      set(state => ({
        user: { ...state.user, lat, lng }
      }));
    } catch (error) {
      console.error("Error updating location:", error);
      toast.error('Konum güncellenirken bir hata oluştu.');
    }
  },

  searchUsers: async (query: string) => {
    if (!query.trim()) return [];
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .ilike('name', `%${query}%`)
        .limit(10);
        
      if (error) throw error;
      return (data as DBProfile[] || []).map(get().mapDBUserToState);
    } catch (error) {
      console.error("Error searching users:", error);
      toast.error('Okurlar aranırken bir sorun oluştu.');
      return [];
    }
  }
});
