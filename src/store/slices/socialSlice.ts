import type { StateCreator } from 'zustand';
import { supabase } from '../../lib/supabase';
import { mockScriptums, mockSwapNegotiations } from '../../mockData';
import type { Scriptum, SwapNegotiation, DuelArgument } from '../../mockData';
import type { DBScriptum } from '../../types/database.types';
import toast from 'react-hot-toast';
import type { UserSlice } from './userSlice';

export interface SocialSlice {
  scriptums: Scriptum[];
  swapNegotiations: SwapNegotiation[];
  addScriptum: (scriptumData: Partial<Scriptum>) => Promise<void>;
  voteDuel: (scriptumId: string, isSupport: boolean) => void;
  acceptSwapRequest: (swapId: string) => void;
  sendMessage: (swapId: string, text: string) => void;
  mapDBScriptumToState: (dbScriptum: DBScriptum) => Scriptum;
}

export const createSocialSlice: StateCreator<SocialSlice & UserSlice, [], [], SocialSlice> = (set, get) => ({
  scriptums: mockScriptums,
  swapNegotiations: mockSwapNegotiations,

  mapDBScriptumToState: (dbScriptum): Scriptum => {
    let duel: DuelArgument | undefined = undefined;
    
    if (dbScriptum.scriptum_duels && dbScriptum.scriptum_duels.length > 0) {
      const d = dbScriptum.scriptum_duels[0];
      duel = {
        opponentName: d.profiles?.name || 'Anonim',
        opponentAvatar: d.profiles?.avatar_url || 'https://i.pravatar.cc/150',
        argument: d.argument,
        support: d.support_count,
        oppose: d.oppose_count
      };
    }

    return {
      id: dbScriptum.id,
      bookId: dbScriptum.book_id,
      userId: dbScriptum.user_id,
      userName: dbScriptum.profiles?.name || 'Anonim',
      userAvatar: dbScriptum.profiles?.avatar_url || 'https://i.pravatar.cc/150',
      content: dbScriptum.content,
      highlightedText: dbScriptum.highlighted_text || undefined,
      likes: dbScriptum.likes,
      duel
    };
  },

  addScriptum: async (scriptumData) => {
    try {
      const { user } = get();
      if (!user) return;

      toast.loading('Katman ekleniyor...', { id: 'addScriptum' });
      const { data, error } = await supabase.from('scriptums').insert({
        book_id: scriptumData.bookId,
        user_id: user.id,
        content: scriptumData.content,
        highlighted_text: scriptumData.highlightedText || null
      }).select(`
        *,
        profiles:user_id(name, avatar_url),
        scriptum_duels(
          *,
          profiles:opponent_id(name, avatar_url)
        )
      `).single();

      if (error) throw error;
      if (data) {
        set((state) => ({ scriptums: [...state.scriptums, get().mapDBScriptumToState(data as DBScriptum)] }));
        toast.success('Yeni bir katman yarattınız.', { id: 'addScriptum' });
      }
    } catch (error) {
      console.error("Error adding scriptum:", error);
      toast.error('Katman eklenemedi.', { id: 'addScriptum' });
    }
  },

  voteDuel: (scriptumId, isSupport) => {
    set(state => {
      const newScriptums = state.scriptums.map(s => {
        if (s.id === scriptumId && s.duel) {
          return {
            ...s,
            duel: {
              ...s.duel,
              support: isSupport ? s.duel.support + 1 : s.duel.support,
              oppose: !isSupport ? s.duel.oppose + 1 : s.duel.oppose
            }
          };
        }
        return s;
      });
      return { 
        scriptums: newScriptums,
        user: { ...state.user, karma: { ...state.user.karma, intellectual: state.user.karma.intellectual + 2, total: state.user.karma.total + 1 } }
      };
    });
    toast.success('Oy verildi! Entelektüel Karma kazanıldı.');
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
