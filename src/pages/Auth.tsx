import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Feather, ArrowRight, KeyRound } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface AuthProps {
  onSuccess: () => void;
}

type AuthView = 'login' | 'register' | 'forgot';

function authErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return 'Bir hata oluştu.';
}

export const Auth: React.FC<AuthProps> = ({ onSuccess }) => {
  const [view, setView] = useState<AuthView>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const isLogin = view === 'login';
  const isForgot = view === 'forgot';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setInfo(null);

    try {
      if (isForgot) {
        const redirectTo = `${window.location.origin}${window.location.pathname}`;
        const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo,
        });
        if (resetErr) throw resetErr;
        toast.success('Sıfırlama bağlantısı e-postana gönderildi. Gelen kutunu kontrol et.', { duration: 6000 });
        setView('login');
        setPassword('');
        return;
      }

      if (isLogin) {
        const { error: signErr } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (signErr) throw signErr;
      } else {
        const { data, error: signUpErr } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { full_name: name.trim() },
            emailRedirectTo: `${window.location.origin}${window.location.pathname}`,
          },
        });
        if (signUpErr) throw signUpErr;
        if (data.user && !data.session) {
          setInfo('Kayıt alındı. Hesabını doğrulamak için e-postandaki bağlantıya tıkla; ardından giriş yap.');
          setPassword('');
          setView('login');
          return;
        }
      }
      onSuccess();
    } catch (err: unknown) {
      setError(authErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!email.trim()) {
      toast.error('Önce e-posta adresini gir.');
      return;
    }
    setLoading(true);
    try {
      const { error: resendErr } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}${window.location.pathname}`,
        },
      });
      if (resendErr) throw resendErr;
      toast.success('Doğrulama e-postası yeniden gönderildi.', { duration: 5000 });
    } catch (err: unknown) {
      toast.error(authErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F0E6] flex justify-center items-end sm:items-center relative overflow-hidden">
      <div className="absolute top-0 left-0 w-64 h-64 bg-karma/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-ink/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm bg-parchment-light px-6 pt-8 pb-12 sm:pb-8 sm:rounded-3xl shadow-2xl shadow-ink/10 relative z-10 border border-ink/5 rounded-t-3xl"
      >
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-ink text-parchment-light rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
            {isForgot ? <KeyRound size={32} /> : <Feather size={32} />}
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif text-ink tracking-tight">Parşömen</h1>
          <p className="text-ink/60 mt-2 font-sans text-sm">
            {isForgot
              ? 'Şifreni sıfırlamak için e-posta adresini gir.'
              : isLogin
                ? 'Entelektüel ağına geri dön.'
                : 'Kitapların yolculuğuna katıl.'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl text-center">
            {error}
          </div>
        )}
        {info && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl text-center leading-relaxed">
            {info}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && !isForgot && (
            <div className="relative">
              <Feather className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/40" size={18} />
              <input
                type="text"
                placeholder="Adınız Soyadınız"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                maxLength={50}
                className="w-full bg-white border border-ink/10 py-3 pl-12 pr-4 rounded-xl text-base text-ink font-medium focus:outline-none focus:border-karma focus:ring-1 focus:ring-karma transition-all"
              />
            </div>
          )}

          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/40" size={18} />
            <input
              type="email"
              placeholder="E-posta adresiniz"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full bg-white border border-ink/10 py-3 pl-12 pr-4 rounded-xl text-base text-ink font-medium focus:outline-none focus:border-karma focus:ring-1 focus:ring-karma transition-all"
            />
          </div>

          {!isForgot && (
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/40" size={18} />
              <input
                type="password"
                placeholder="Şifreniz"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                className="w-full bg-white border border-ink/10 py-3 pl-12 pr-4 rounded-xl text-base text-ink font-medium focus:outline-none focus:border-karma focus:ring-1 focus:ring-karma transition-all"
              />
            </div>
          )}

          {!isLogin && !isForgot && (
            <div className="flex items-start gap-2 pt-1 pl-1">
              <input
                type="checkbox"
                id="terms"
                required
                className="mt-1 w-4 h-4 accent-karma cursor-pointer"
              />
              <label htmlFor="terms" className="text-xs text-ink/70 leading-tight cursor-pointer select-none">
                <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-karma font-bold hover:underline">
                  Güvenlik Sözleşmesi ve Gizlilik Politikası
                </a>'nı okudum ve kabul ediyorum.
              </label>
            </div>
          )}

          {isLogin && (
            <div className="flex justify-end -mt-1">
              <button
                type="button"
                onClick={() => {
                  setView('forgot');
                  setError(null);
                  setInfo(null);
                }}
                className="text-[11px] font-bold text-karma hover:text-ink transition-colors py-2 px-1"
              >
                Şifremi unuttum
              </button>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ink text-parchment-light py-4 rounded-xl font-bold shadow-lg shadow-ink/20 hover:bg-ink/90 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {loading
              ? 'Bekleniyor...'
              : isForgot
                ? 'Sıfırlama bağlantısı gönder'
                : isLogin
                  ? 'Giriş yap'
                  : 'Kayıt ol'}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        {isLogin && (
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => void handleResendConfirmation()}
              disabled={loading}
              className="text-[11px] font-medium text-ink/50 hover:text-karma transition-colors disabled:opacity-40"
            >
              Doğrulama e-postası gelmediyse tekrar gönder
            </button>
          </div>
        )}

        <div className="mt-6 text-center space-y-2">
          {isForgot ? (
            <button
              type="button"
              onClick={() => {
                setView('login');
                setError(null);
              }}
              className="text-xs font-bold text-ink/60 hover:text-karma transition-colors block w-full"
            >
              Giriş ekranına dön
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                setView(isLogin ? 'register' : 'login');
                setError(null);
                setInfo(null);
              }}
              className="text-xs font-bold text-ink/60 hover:text-karma transition-colors"
            >
              {isLogin ? 'Henüz hesabın yok mu? Kayıt ol' : 'Zaten hesabın var mı? Giriş yap'}
            </button>
          )}
        </div>

        <p className="mt-6 text-[10px] text-center text-ink/40 leading-relaxed">
          Şifre sıfırlama e-postası bazen spam klasörüne düşer. Birkaç dakika beklemeden gelmezse tekrar dene.
        </p>
      </motion.div>
    </div>
  );
};
