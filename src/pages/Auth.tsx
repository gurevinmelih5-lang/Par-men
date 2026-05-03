import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Feather, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AuthProps {
  onSuccess: () => void;
}

export const Auth: React.FC<AuthProps> = ({ onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: {
            data: { full_name: name }
          }
        });
        if (error) throw error;
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F0E6] flex justify-center items-center p-6 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-karma/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-ink/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm bg-parchment-light p-8 rounded-3xl shadow-2xl shadow-ink/10 relative z-10 border border-ink/5"
      >
        <div className="flex justify-center mb-8">
          <div className="w-16 h-16 bg-ink text-parchment-light rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
            <Feather size={32} />
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif text-ink tracking-tight">Parşömen</h1>
          <p className="text-ink/60 mt-2 font-sans text-sm">
            {isLogin ? 'Entelektüel ağına geri dön.' : 'Kitapların yolculuğuna katıl.'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="relative">
              <Feather className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/40" size={18} />
              <input
                type="text"
                placeholder="Adınız Soyadınız"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={!isLogin}
                className="w-full bg-white border border-ink/10 py-3 pl-12 pr-4 rounded-xl text-ink font-medium focus:outline-none focus:border-karma focus:ring-1 focus:ring-karma transition-all"
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
              className="w-full bg-white border border-ink/10 py-3 pl-12 pr-4 rounded-xl text-ink font-medium focus:outline-none focus:border-karma focus:ring-1 focus:ring-karma transition-all"
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/40" size={18} />
            <input
              type="password"
              placeholder="Şifreniz"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-white border border-ink/10 py-3 pl-12 pr-4 rounded-xl text-ink font-medium focus:outline-none focus:border-karma focus:ring-1 focus:ring-karma transition-all"
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-ink text-parchment-light py-4 rounded-xl font-bold shadow-lg shadow-ink/20 hover:bg-ink/90 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {loading ? 'Bekleniyor...' : (isLogin ? 'Sayfayı Aç' : 'Hikayeye Başla')}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-xs font-bold text-ink/60 hover:text-karma transition-colors"
          >
            {isLogin ? "Henüz bir izin yok mu? Kayıt Ol" : "Zaten bir izin var mı? Giriş Yap"}
          </button>
        </div>
      </motion.div>
    </div>
  );
};
