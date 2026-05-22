import type { StateCreator } from 'zustand';
import { supabase } from '../../lib/supabase';
import type { Scriptum, SwapNegotiation } from '../../types/models';
import type { DBScriptum } from '../../types/database.types';
import toast from 'react-hot-toast';
import type { UserSlice } from './userSlice';
import { containsProfanity } from '../../lib/moderation';

export interface SocialSlice {
  scriptums: Scriptum[];
  swapNegotiations: SwapNegotiation[];
  addScriptum: (scriptumData: Partial<Scriptum>) => Promise<void>;
  likeScriptum: (scriptumId: string) => Promise<void>;
  addReply: (scriptumId: string, content: string) => Promise<void>;
  mapDBScriptumToState: (dbScriptum: DBScriptum) => Scriptum;
}

export const createSocialSlice: StateCreator<SocialSlice & UserSlice, [], [], SocialSlice> = (set, get) => ({
  scriptums: [],
  swapNegotiations: [],

  mapDBScriptumToState: (dbScriptum): Scriptum => {
    const currentUserId = get().user?.id;
    const likedByMe = dbScriptum.scriptum_likes?.some((l: any) => l.user_id === currentUserId) || false;

    return {
      id: dbScriptum.id,
      bookId: dbScriptum.book_id || undefined,
      customBookTitle: dbScriptum.custom_book_title || undefined,
      customBookAuthor: dbScriptum.custom_book_author || undefined,
      userId: dbScriptum.user_id,
      userName: dbScriptum.profiles?.name || 'Anonim',
      userAvatar: dbScriptum.profiles?.avatar_url || 'https://i.pravatar.cc/150',
      content: dbScriptum.content,
      highlightedText: dbScriptum.highlighted_text || undefined,
      likes: dbScriptum.likes,
      likedByMe,
      replies: dbScriptum.scriptum_replies?.map((r: any) => ({
        id: r.id,
        userId: r.user_id,
        userName: r.profiles?.name || 'Anonim',
        userAvatar: r.profiles?.avatar_url || 'https://i.pravatar.cc/150',
        content: r.content,
        timestamp: new Date(r.created_at).toLocaleDateString('tr-TR'),
        likes: 0
      })) || []
    };
  },

  addScriptum: async (scriptumData) => {
    try {
      const { user } = get();
      if (!user) return;

      if (scriptumData.content && containsProfanity(scriptumData.content)) {
        toast.error('Gönderiniz uygunsuz kelimeler içeriyor. Lütfen düzelterek tekrar deneyin.');
        return;
      }

      toast.loading('Gönderiliyor...', { id: 'addScriptum' });
      const { data, error } = await supabase.from('scriptums').insert({
        book_id: scriptumData.bookId || null,
        custom_book_title: scriptumData.customBookTitle || null,
        custom_book_author: scriptumData.customBookAuthor || null,
        user_id: user.id,
        content: scriptumData.content,
        highlighted_text: scriptumData.highlightedText || null
      }).select(`
        *,
        profiles:user_id(name, avatar_url)
      `).single();

      if (error) throw error;
      if (data) {
        set((state) => ({ scriptums: [get().mapDBScriptumToState(data as DBScriptum), ...state.scriptums] }));
        toast.success('İçerik paylaşıldı.', { id: 'addScriptum' });
      }
    } catch (error) {
      console.error("Error adding scriptum:", error);
      toast.error('İçerik eklenemedi.', { id: 'addScriptum' });
    }
  },

  addReply: async (scriptumId, content) => {
    try {
      const { user } = get();
      if (!user) return;
      if (!content.trim()) return;

      if (containsProfanity(content)) {
        toast.error('Gönderiniz uygunsuz kelimeler içeriyor. Lütfen düzelterek tekrar deneyin.');
        return;
      }

      const { data, error } = await supabase.from('scriptum_replies').insert({
        scriptum_id: scriptumId,
        user_id: user.id,
        content: content
      }).select(`*, profiles:user_id(name, avatar_url)`).single();

      if (error) throw error;
      if (data) {
        const newReply = {
          id: data.id,
          userId: data.user_id,
          userName: data.profiles?.name || 'Anonim',
          userAvatar: data.profiles?.avatar_url || 'https://i.pravatar.cc/150',
          content: data.content,
          timestamp: new Date(data.created_at).toLocaleDateString('tr-TR'),
          likes: 0
        };

        set((state) => ({
          scriptums: state.scriptums.map(s => 
            s.id === scriptumId ? { ...s, replies: [...(s.replies || []), newReply] } : s
          )
        }));
        toast.success('Yorumunuz eklendi.');
      }
    } catch (error) {
      console.error("Error adding reply:", error);
      toast.error('Yorum eklenemedi.');
    }
  },

  likeScriptum: async (scriptumId: string) => {
    try {
      const { user, scriptums } = get();
      if (!user) return;

      const current = scriptums.find(s => s.id === scriptumId);
      if (!current) return;

      const isLiked = current.likedByMe;

      // Optimistic update
      set((state) => ({
        scriptums: state.scriptums.map(s => 
          s.id === scriptumId 
            ? { ...s, likedByMe: !isLiked, likes: isLiked ? Math.max(0, s.likes - 1) : s.likes + 1 } 
            : s
        )
      }));

      if (isLiked) {
        // Unlike
        const { error } = await supabase
          .from('scriptum_likes')
          .delete()
          .eq('scriptum_id', scriptumId)
          .eq('user_id', user.id);
        
        if (error) {
          // Fallback direct count update if likes table fails
          await supabase
            .from('scriptums')
            .update({ likes: Math.max(0, current.likes - 1) })
            .eq('id', scriptumId);
        }
      } else {
        // Like
        const { error } = await supabase
          .from('scriptum_likes')
          .insert({
            scriptum_id: scriptumId,
            user_id: user.id
          });
          
        if (error) {
          // Fallback direct count update if likes table fails
          await supabase
            .from('scriptums')
            .update({ likes: current.likes + 1 })
            .eq('id', scriptumId);
        }
      }
    } catch (err) {
      console.error('Error toggling like on scriptum', err);
    }
  }
});
