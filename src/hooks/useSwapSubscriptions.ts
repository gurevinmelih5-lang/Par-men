import { useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import type { Session } from '@supabase/supabase-js';
import toast from 'react-hot-toast';

export const useSwapSubscriptions = (session: Session | null) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!session?.user?.id) return;

    const requestsSubscription = supabase
      .channel('public:swap_requests')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'swap_requests' },
        (payload) => {
          if (session.user.id === payload.new.owner_id) {
            useStore.getState().fetchIncomingRequests();
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'swap_requests' },
        async (payload) => {
          const uid = session.user.id;
          const row = payload.new as {
            id: string;
            status: string;
            owner_id: string;
            requester_id: string;
            chat_ended_by?: string | null;
          };
          
          if (row.status !== 'accepted') return;
          if (row.owner_id !== uid && row.requester_id !== uid) return;

          const isRequester = row.requester_id === uid;
          await useStore.getState().openSwapChatById(row.id);

          if (isRequester) {
            toast.success(
              'Takasınız onaylandı. Karşı taraf ile buluşmayı planlayabilirsiniz.',
              { id: `swap-accepted-${row.id}`, duration: 5000 }
            );
            navigate(`/chat/${row.id}`);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(requestsSubscription);
    };
  }, [session?.user?.id, navigate]);
};
