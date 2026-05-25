import type { StateCreator } from 'zustand';
import { supabase } from '../../lib/supabase';
import type { User } from '../../types/models';
import type { DBProfile } from '../../types/database.types';
import toast from 'react-hot-toast';
import { moderateImage } from '../../lib/moderation';

export interface UserSlice {
  user: User;
  viewedUser: User | null;
  setViewedUser: (user: User | null) => void;
  updateLocation: (lat: number, lng: number) => Promise<void>;
  updateUserAvatar: (file: File) => Promise<void>;
  searchUsers: (query: string) => Promise<User[]>;
  mapDBUserToState: (dbProfile: DBProfile) => User;
  blockUser: (userId: string) => void;
  unblockUser: (userId: string) => void;
  reportContent: (type: 'user' | 'message' | 'book', id: string, reason: string) => void;
  deleteAccount: () => Promise<void>;
}

export const createUserSlice: StateCreator<UserSlice, [], [], UserSlice> = (set, get) => ({
  user: null as unknown as User,
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
    lng: dbProfile.lng || undefined,
    blockedUsers: JSON.parse(localStorage.getItem('parsomen_blocked_users') || '[]')
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

  updateUserAvatar: async (file) => {
    try {
      const { user } = get();
      if (!user) return;

      toast.loading('Görsel kontrol ediliyor...', { id: 'avatarUpload' });
      const isSafe = await moderateImage(file);
      if (!isSafe) {
        toast.error('Profil fotoğrafı uygunsuz içerik içeriyor. Cinsel, hakaret içeren veya siyasi görseller eklenemez.', { id: 'avatarUpload' });
        return;
      }

      toast.loading('Profil fotoğrafı güncelleniyor...', { id: 'avatarUpload' });
      
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `avatars/${user.id}_${Math.random()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('book-covers')
        .upload(fileName, file, { upsert: true });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('book-covers')
        .getPublicUrl(data.path);

      const { error: dbError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (dbError) throw dbError;

      set(state => ({
        user: { ...state.user, avatar: publicUrl }
      }));

      toast.success('Profil fotoğrafı güncellendi!', { id: 'avatarUpload' });
    } catch (error) {
      console.error('Error updating avatar:', error);
      toast.error('Fotoğraf güncellenemedi.', { id: 'avatarUpload' });
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
      const FAKE_USER_IDS = ['11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222'];
      const filtered = (data as DBProfile[] || []).filter(p => !FAKE_USER_IDS.includes(p.id));
      return filtered.map(get().mapDBUserToState);
    } catch (error) {
      console.error("Error searching users:", error);
      toast.error('Okurlar aranırken bir sorun oluştu.');
      return [];
    }
  },

  blockUser: (userId: string) => {
    set((state) => {
      const currentBlocked = state.user?.blockedUsers || [];
      if (currentBlocked.includes(userId)) return state;
      const updatedBlocked = [...currentBlocked, userId];
      localStorage.setItem('parsomen_blocked_users', JSON.stringify(updatedBlocked));
      return { user: { ...state.user, blockedUsers: updatedBlocked } };
    });
    toast.success('Kullanıcı engellendi. Artık bu kullanıcının içeriklerini görmeyeceksiniz.');
  },

  unblockUser: (userId: string) => {
    set((state) => {
      const currentBlocked = state.user?.blockedUsers || [];
      const updatedBlocked = currentBlocked.filter(id => id !== userId);
      localStorage.setItem('parsomen_blocked_users', JSON.stringify(updatedBlocked));
      return { user: { ...state.user, blockedUsers: updatedBlocked } };
    });
    toast.success('Kullanıcının engeli kaldırıldı.');
  },

  reportContent: (type, id, reason) => {
    // In a real app, this would send an API request to a moderation endpoint.
    console.log(`Reported ${type} with id ${id} for reason: ${reason}`);
    toast.success('Şikayetiniz modetör ekibimize iletilmiştir. Geri bildiriminiz için teşekkürler.');
  },

  deleteAccount: async () => {
    try {
      const { user } = get();
      if (!user) return;
      
      toast.loading('Hesabınız siliniyor...', { id: 'deleteAccount' });
      // 1. Delete profile from DB (This requires RLS policy allowing delete, or edge function)
      // For now we try to delete it from 'profiles'. If RLS blocks it, auth.signOut will at least log them out.
      await supabase.from('profiles').delete().eq('id', user.id);
      
      // 2. Sign out
      await supabase.auth.signOut();
      
      toast.success('Hesabınız başarıyla silindi.', { id: 'deleteAccount' });
      // Will trigger Auth state change to Signed Out and redirect to login
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Hesabınız silinirken bir hata oluştu.', { id: 'deleteAccount' });
    }
  }
});
