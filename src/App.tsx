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
import { AnimatePresence, motion } from 'framer-motion';
import { supabase } from './lib/supabase';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './components/ThemeProvider';
import { Onboarding, useOnboarding } from './components/Onboarding';

function App() {
  const { activeTab } = useStore();
  const [session, setSession] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const { showOnboarding, completeOnboarding } = useOnboarding();

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        useStore.getState().fetchInitialData().finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
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
      default: return <Dashboard />;
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-parchment-light flex items-center justify-center font-serif text-ink">Yükleniyor...</div>;
  }

  if (!session) {
    return <Auth onSuccess={() => {}} />;
  }

  return (
    <ThemeProvider>
      <Toaster position="top-center" toastOptions={{ duration: 3000, style: { borderRadius: '16px', background: '#333', color: '#fff' } }} />
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
