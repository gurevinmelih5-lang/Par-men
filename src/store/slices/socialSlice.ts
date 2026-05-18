import type { StateCreator } from 'zustand';
import { supabase } from '../../lib/supabase';
import { mockScriptums, mockSwapNegotiations } from '../../mockData';
import type { Scriptum, SwapNegotiation } from '../../mockData';
import type { DBScriptum } from '../../types/database.types';
import toast from 'react-hot-toast';
import type { UserSlice } from './userSlice';
import { containsProfanity } from '../../lib/moderation';

export interface SocialSlice {
  scriptums: Scriptum[];
  swapNegotiations: SwapNegotiation[];
  addScriptum: (scriptumData: Partial<Scriptum>) => Promise<void>;
  likeScriptum: (scriptumId: string) => Promise<void>;
  acceptSwapRequest: (swapId: string) => void;
  sendMessage: (swapId: string, text: string) => void;
  mapDBScriptumToState: (dbScriptum: DBScriptum) => Scriptum;
}

export const createSocialSlice: StateCreator<SocialSlice & UserSlice, [], [], SocialSlice> = (set, get) => ({
  scriptums: mockScriptums,
  swapNegotiations: mockSwapNegotiations,

  mapDBScriptumToState: (dbScriptum): Scriptum => {
    return {
      id: dbScriptum.id,
      bookId: dbScriptum.book_id,
      userId: dbScriptum.user_id,
      userName: dbScriptum.profiles?.name || 'Anonim',
      userAvatar: dbScriptum.profiles?.avatar_url || 'https://i.pravatar.cc/150',
      content: dbScriptum.content,
      highlightedText: dbScriptum.highlighted_text || undefined,
      likes: dbScriptum.likes
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

      toast.loading('Katman ekleniyor...', { id: 'addScriptum' });
      const { data, error } = await supabase.from('scriptums').insert({
        book_id: scriptumData.bookId,
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
        toast.success('Yeni bir katman yarattınız.', { id: 'addScriptum' });
      }
    } catch (error) {
      console.error("Error adding scriptum:", error);
      toast.error('Katman eklenemedi.', { id: 'addScriptum' });
    }
  },

  likeScriptum: async (scriptumId: string) => {
    try {
      // Optimistic update
      const { scriptums } = get();
      const current = scriptums.find(s => s.id === scriptumId);
      if (!current) return;

      set((state) => ({
        scriptums: state.scriptums.map(s => 
          s.id === scriptumId ? { ...s, likes: s.likes + 1 } : s
        )
      }));

      // In a real app we'd have a scriptum_likes table to prevent double liking,
      // but for this implementation we'll just increment the integer column.
      const { error } = await supabase.rpc('increment_scriptum_likes', { p_scriptum_id: scriptumId });
      
      // Fallback if rpc doesn't exist
      if (error) {
         await supabase
          .from('scriptums')
          .update({ likes: current.likes + 1 })
          .eq('id', scriptumId);
      }
    } catch (err) {
      console.error('Error liking scriptum', err);
    }
  },

  acceptSwapRequest: (swapId) => {
    set(state => ({
      swapNegotiations: state.swapNegotiations.map(s => s.id === swapId ? { ...s, status: 'accepted' } : s)
    }));
  },

  sendMessage: (swapId, text) => {
    const { user } = get();
    set(state => ({
      swapNegotiations: state.swapNegotiations.map(s => {
        if (s.id === swapId) {
          return {
            ...s,
            messages: [...s.messages, { id: Date.now().toString(), senderId: user.id, text, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]
          };
        }
        return s;
      })
    }));
  }
});
