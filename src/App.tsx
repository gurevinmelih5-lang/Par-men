import React from 'react';
import { Layout } from './components/Layout/Layout';
import { useStore } from './store/useStore';
import { Dashboard } from './pages/Dashboard';
import { Discovery } from './pages/Discovery';
import { Swap } from './pages/Swap';
import { Profile } from './pages/Profile';
import { BookDetail } from './pages/BookDetail';
import { PublicProfile } from './pages/PublicProfile';
import { SwapChat } from './pages/SwapChat';
import { Auth } from './pages/Auth';
import { UpdatePasswordForm } from './components/UpdatePasswordForm';
import { AnimatePresence, motion } from 'framer-motion';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import { ThemeProvider } from './components/ThemeProvider';
import { Onboarding, useOnboarding } from './components/Onboarding';
import { Arena } from './pages/Arena';

function App() {
  const { activeTab } = useStore();
  const [session, setSession] = React.useState<Session | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [passwordRecovery, setPasswordRecovery] = React.useState(false);
  const { showOnboarding, completeOnboarding } = useOnboarding();

  const toaster = (
    <Toaster
      position="top-center"
      toastOptions={{ duration: 3000, style: { borderRadius: '16px', background: '#333', color: '#fff' } }}
    />
  );

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setSession(initialSession);
      if (typeof window !== 'undefined' && window.location.hash.includes('type=recovery')) {
        setPasswordRecovery(true);
      }
      if (initialSession) {
        useStore.getState().fetchInitialData().finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (event === 'PASSWORD_RECOVERY') {
        setPasswordRecovery(true);
      }
      if (event === 'SIGNED_OUT') {
        setPasswordRecovery(false);
      }
      setSession(nextSession);
      if (nextSession) {
        useStore.getState().fetchInitialData();
      }
    });

    const requestsSubscription = supabase
      .channel('public:swap_requests')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'swap_requests' },
        (payload) => {
          if (session?.user?.id === payload.new.owner_id) {
            useStore.getState().fetchIncomingRequests();
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'swap_requests' },
        async (payload) => {
          const uid = session?.user?.id;
          if (!uid) return;
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
          await useStore.getState().openSwapChatById(row.id, { goToChatTab: isRequester });

          if (isRequester) {
            toast.success(
              'Takasınız onaylandı. Karşı taraf ile buluşmayı planlayabilirsiniz.',
              { id: `swap-accepted-${row.id}`, duration: 5000 }
            );
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
      supabase.removeChannel(requestsSubscription);
    };
  }, [session?.user?.id]);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'discovery': return <Discovery />;
      case 'swap': return <Swap />;
      case 'profile': return <Profile />;
      case 'bookDetail': return <BookDetail />;
      case 'publicProfile': return <PublicProfile />;
      case 'chat': return <SwapChat />;
      case 'arena': return <Arena />;
      default: return <Dashboard />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-parchment-light flex items-center justify-center font-serif text-ink">
        Yükleniyor...
      </div>
    );
  }

  if (session && passwordRecovery) {
    return (
      <ThemeProvider>
        {toaster}
        <UpdatePasswordForm onCompleted={() => setPasswordRecovery(false)} />
      </ThemeProvider>
    );
  }

  if (!session) {
    return (
      <>
        {toaster}
        <Auth onSuccess={() => {}} />
      </>
    );
  }

  return (
    <ThemeProvider>
      {toaster}
      {showOnboarding && <Onboarding onComplete={completeOnboarding} />}
      <Layout>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </Layout>
    </ThemeProvider>
  );
}

export default App;
