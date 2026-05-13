import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Feather, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface UpdatePasswordFormProps {
  onCompleted: () => void;
}

export const UpdatePasswordForm: React.FC<UpdatePasswordFormProps> = ({ onCompleted }) => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalı.');
      return;
    }
    if (password !== confirm) {
      setError('Şifreler eşleşmiyor.');
      return;
    }
    setLoading(true);
    try {
      const { error: upErr } = await supabase.auth.updateUser({ password });
      if (upErr) throw upErr;
      if (typeof window !== 'undefined' && window.location.hash) {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
      toast.success('Şifren başarıyla güncellendi.');
      onCompleted();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Şifre güncellenemedi.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F0E6] flex justify-center items-center p-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-64 h-64 bg-karma/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-ink/5 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm bg-parchment-light p-8 rounded-3xl shadow-2xl shadow-ink/10 relative z-10 border border-ink/5"
      >
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-ink text-parchment-light rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
            <Feather size={32} />
          </div>
        </div>
        <div className="text-center mb-6">
          <h1 className="text-2xl font-serif text-ink tracking-tight">Yeni şifre</h1>
          <p className="text-ink/60 mt-2 font-sans text-sm">Aşağıdan yeni şifreni belirle.</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-xs rounded-xl text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/40" size={18} />
            <input
              type="password"
              placeholder="Yeni şifre (en az 6 karakter)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
              className="w-full bg-white border border-ink/10 py-3 pl-12 pr-4 rounded-xl text-base text-ink font-medium focus:outline-none focus:border-karma focus:ring-1 focus:ring-karma transition-all"
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/40" size={18} />
            <input
              type="password"
              placeholder="Yeni şifre (tekrar)"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
              className="w-full bg-white border border-ink/10 py-3 pl-12 pr-4 rounded-xl text-base text-ink font-medium focus:outline-none focus:border-karma focus:ring-1 focus:ring-karma transition-all"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ink text-parchment-light py-4 rounded-xl font-bold shadow-lg shadow-ink/20 hover:bg-ink/90 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {loading ? 'Kaydediliyor...' : 'Şifreyi güncelle'}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>
      </motion.div>
    </div>
  );
};
