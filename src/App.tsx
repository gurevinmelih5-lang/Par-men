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
import { ScriptumFeed } from './pages/ScriptumFeed';
function App() {
  const { activeTab } = useStore();
  const [session, setSession] = React.useState<Session | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [passwordRecovery, setPasswordRecovery] = React.useState(false);
  const { showOnboarding, completeOnboarding } = useOnboarding();

  const toaster = (
    <Toaster
      position="top-center"
      toastOptions={{
        duration: 3000,
        style: {
          borderRadius: '16px',
          background: '#1A202C',
          color: '#FDFBF7',
          fontSize: '14px',
          maxWidth: '340px',
          padding: '12px 16px',
        }
      }}
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
      case 'scriptumFeed': return <ScriptumFeed />;
      default: return <Dashboard />;
    }
  };

  // SwapChat is full-screen and manages its own layout (no BottomNav needed)
  const isFullScreenTab = activeTab === 'chat';

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
      {isFullScreenTab ? (
        // Full-screen pages rendered WITHOUT Layout (no BottomNav)
        <div className="flex justify-center bg-[#F5F0E6] min-h-[100dvh]">
          <div className="w-full max-w-md bg-parchment-light relative shadow-2xl overflow-x-hidden" style={{ height: '100dvh' }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15, ease: 'easeInOut' }}
                className="h-full"
              >
                <SwapChat />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      ) : (
        <Layout>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: 'easeInOut' }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </Layout>
      )}
    </ThemeProvider>
  );
}

export default App;
