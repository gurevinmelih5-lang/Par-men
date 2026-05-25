import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout/Layout';
import { useStore } from './store/useStore';
import { Dashboard } from './pages/Dashboard';
import { Discovery } from './pages/Discovery';
import { Swap } from './pages/Swap';
import { Profile } from './pages/Profile';
import { BookDetail } from './pages/BookDetail';
import { PublicProfile } from './pages/PublicProfile';
import { SwapChat } from './pages/SwapChat';
import { RoomPanel } from './pages/RoomPanel';
import { Auth } from './pages/Auth';
import { UpdatePasswordForm } from './components/UpdatePasswordForm';
import { AnimatePresence, motion } from 'framer-motion';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './lib/supabase';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './components/ThemeProvider';
import { Onboarding, useOnboarding } from './components/Onboarding';
import { ScriptumFeed } from './pages/ScriptumFeed';
import { useSwapSubscriptions } from './hooks/useSwapSubscriptions';

function App() {
  const [session, setSession] = React.useState<Session | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [passwordRecovery, setPasswordRecovery] = React.useState(false);
  const { showOnboarding, completeOnboarding } = useOnboarding();
  const location = useLocation();

  useSwapSubscriptions(session);

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

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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
      <Routes location={location} key={location.pathname.startsWith('/chat') ? 'chat' : 'main'}>
        <Route path="/chat/:id" element={
          <div className="flex justify-center bg-[#F5F0E6] min-h-[100dvh]">
            <div className="w-full max-w-md bg-parchment-light relative shadow-2xl overflow-x-hidden" style={{ height: '100dvh' }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={location.pathname}
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
        } />
        <Route path="/room/:id" element={
          <div className="flex justify-center bg-[#F5F0E6] min-h-[100dvh]">
            <div className="w-full max-w-5xl bg-parchment-light relative shadow-2xl overflow-x-hidden" style={{ height: '100dvh' }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15, ease: 'easeInOut' }}
                  className="h-full"
                >
                  <RoomPanel />
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        } />
        <Route path="*" element={
          <Layout>
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18, ease: 'easeInOut' }}
              >
                <Routes location={location}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/discovery" element={<Discovery />} />
                  <Route path="/swap" element={<Swap />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/book/:id" element={<BookDetail />} />
                  <Route path="/public-profile/:id" element={<PublicProfile />} />
                  <Route path="/feed" element={<ScriptumFeed />} />
                  <Route path="*" element={<Dashboard />} />
                </Routes>
              </motion.div>
            </AnimatePresence>
          </Layout>
        } />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
