import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, ShieldAlert, Award, Send } from 'lucide-react';
import { useStore } from '../store/useStore';
import { supabase } from '../lib/supabase';

interface PendingRatingSwap {
  id: string;
  bookId: string;
  bookTitle: string;
  bookCover: string;
  peerId: string;
  peerName: string;
  peerAvatar: string;
  completedAt: string;
  isRequester: boolean;
}

export const SwapRatingManager: React.FC = () => {
  const { user } = useStore();
  const submitSwapRating = useStore(state => state.submitSwapRating);
  const [activeSwap, setActiveSwap] = useState<PendingRatingSwap | null>(null);
  
  // Rating states
  const [socialRating, setSocialRating] = useState<number>(0);
  const [physicalRating, setPhysicalRating] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Star points conversion mapping for display
  const getPointsDescription = (stars: number) => {
    switch (stars) {
      case 1: return '-5 Puan';
      case 2: return '-3 Puan';
      case 3: return '0 Puan';
      case 4: return '+3 Puan';
      case 5: return '+5 Puan';
      default: return '';
    }
  };

  const fetchCompletedSwaps = async () => {
    if (!user?.id) return;
    try {
      // Fetch completed swaps involving the user
      const { data, error } = await supabase
        .from('swap_requests')
        .select(`
          id,
          book_id,
          requester_id,
          owner_id,
          completed_at,
          rating_owner_social,
          rating_owner_physical,
          rating_requester_social,
          books:books!swap_requests_book_id_fkey ( title, cover_url ),
          requester_p:profiles!swap_requests_requester_id_fkey ( name, avatar_url ),
          owner_p:profiles!swap_requests_owner_id_fkey ( name, avatar_url )
        `)
        .eq('status', 'completed')
        .or(`owner_id.eq.${user.id},requester_id.eq.${user.id}`);

      if (error) throw error;

      const ratingsNeeded: PendingRatingSwap[] = [];
      const now = Date.now();

      for (const rawRow of (data || [])) {
        const row = rawRow as any;
        const isRequester = row.requester_id === user.id;
        const completedTime = row.completed_at ? new Date(row.completed_at).getTime() : 0;
        
        // Timer constraint: Must be completed and 10 minutes (600,000 ms) must have passed
        const tenMinutesPassed = completedTime && (now - completedTime >= 10 * 60 * 1000);
        
        if (tenMinutesPassed) {
          if (isRequester && (row.rating_owner_social === null || row.rating_owner_physical === null)) {
            ratingsNeeded.push({
              id: row.id,
              bookId: row.book_id,
              bookTitle: row.books?.title || 'Kitap',
              bookCover: row.books?.cover_url || '',
              peerId: row.owner_id,
              peerName: row.owner_p?.name || 'Okur',
              peerAvatar: row.owner_p?.avatar_url || 'https://i.pravatar.cc/150',
              completedAt: row.completed_at,
              isRequester: true
            });
          } else if (!isRequester && row.rating_requester_social === null) {
            ratingsNeeded.push({
              id: row.id,
              bookId: row.book_id,
              bookTitle: row.books?.title || 'Kitap',
              bookCover: row.books?.cover_url || '',
              peerId: row.requester_id,
              peerName: row.requester_p?.name || 'Okur',
              peerAvatar: row.requester_p?.avatar_url || 'https://i.pravatar.cc/150',
              completedAt: row.completed_at,
              isRequester: false
            });
          }
        }
      }

      if (ratingsNeeded.length > 0) {
        setActiveSwap(ratingsNeeded[0]);
      } else {
        setActiveSwap(null);
      }
    } catch (err) {
      console.error('Error fetching completed swaps for rating:', err);
    }
  };

  // Poll database every 15 seconds to check if 10 minutes have passed for any completed swaps
  useEffect(() => {
    if (!user?.id) return;
    
    fetchCompletedSwaps();
    const interval = setInterval(fetchCompletedSwaps, 15000);
    return () => clearInterval(interval);
  }, [user?.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSwap || isSubmitting) return;

    if (activeSwap.isRequester && (socialRating === 0 || physicalRating === 0)) return;
    if (!activeSwap.isRequester && socialRating === 0) return;

    setIsSubmitting(true);
    try {
      await submitSwapRating(activeSwap.id, {
        ratingOwnerSocial: activeSwap.isRequester ? socialRating : undefined,
        ratingOwnerPhysical: activeSwap.isRequester ? physicalRating : undefined,
        ratingRequesterSocial: !activeSwap.isRequester ? socialRating : undefined
      });

      // Clear local states
      setSocialRating(0);
      setPhysicalRating(0);
      
      // Re-fetch pending
      await fetchCompletedSwaps();
    } catch (err) {
      console.error('Failed to submit rating:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!activeSwap) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-[9999] bg-ink/90 backdrop-blur-lg flex items-center justify-center p-4 overflow-y-auto"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="bg-parchment-light w-full max-w-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-karma/20 relative"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center gap-3 border-b border-ink/10 pb-4 mb-6">
            <div className="p-3 bg-karma/10 text-karma rounded-2xl">
              <Award size={24} />
            </div>
            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-ink">
                Takas Puanlaması
              </h2>
              <p className="text-xs text-ink/60 mt-0.5">
                Takas işlemi tamamlandı! Değerlendirme yapılması zorunludur.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Book & Peer details */}
            <div className="bg-white rounded-2xl p-4 border border-ink/5 flex items-center gap-4 shadow-sm">
              <img
                src={activeSwap.bookCover}
                alt=""
                className="w-12 h-16 object-cover rounded-lg shadow-md border border-ink/10 flex-shrink-0"
              />
              <div className="min-w-0">
                <p className="font-serif text-sm font-bold text-ink truncate">
                  {activeSwap.bookTitle}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <img
                    src={activeSwap.peerAvatar}
                    alt=""
                    className="w-5 h-5 rounded-full object-cover border border-karma/40"
                  />
                  <p className="text-xs text-ink/70 truncate">
                    <span className="font-bold">{activeSwap.peerName}</span> ile takas
                  </p>
                </div>
              </div>
            </div>

            {/* Social Rating (Mandatory for both requester & owner) */}
            <div className="space-y-3">
              <label className="block text-sm font-serif font-bold text-ink">
                {activeSwap.isRequester 
                  ? `Okur Davranışı (${activeSwap.peerName})`
                  : `Okur Davranışı (${activeSwap.peerName})`
                }
                <span className="text-xs font-sans font-normal text-ink/50 block mt-1">
                  Kullanıcının takas esnasındaki nezaketi, iletişimi ve zamanlaması (sosyal puan).
                </span>
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setSocialRating(star)}
                    className="p-1 hover:scale-110 active:scale-95 transition-transform"
                  >
                    <Star
                      size={32}
                      className={
                        star <= socialRating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-ink/20 hover:text-yellow-200'
                      }
                    />
                  </button>
                ))}
                {socialRating > 0 && (
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ml-2 ${
                    socialRating >= 4 ? 'bg-green-50 text-green-700' : 
                    socialRating === 3 ? 'bg-gray-100 text-gray-700' : 'bg-red-50 text-red-700'
                  }`}>
                    {getPointsDescription(socialRating)}
                  </span>
                )}
              </div>
            </div>

            {/* Physical Rating (Only for Requester, who receives the book) */}
            {activeSwap.isRequester && (
              <div className="space-y-3 pt-2 border-t border-ink/5">
                <label className="block text-sm font-serif font-bold text-ink">
                  Kitabın Fiziksel Durumu
                  <span className="text-xs font-sans font-normal text-ink/50 block mt-1">
                    Teslim aldığınız kitabın kondisyonunun belirtilen durumda olup olmadığı (fiziksel puan).
                  </span>
                </label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setPhysicalRating(star)}
                      className="p-1 hover:scale-110 active:scale-95 transition-transform"
                    >
                      <Star
                        size={32}
                        className={
                          star <= physicalRating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-ink/20 hover:text-yellow-200'
                        }
                      />
                    </button>
                  ))}
                  {physicalRating > 0 && (
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ml-2 ${
                      physicalRating >= 4 ? 'bg-green-50 text-green-700' : 
                      physicalRating === 3 ? 'bg-gray-100 text-gray-700' : 'bg-red-50 text-red-700'
                    }`}>
                      {getPointsDescription(physicalRating)}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Warning block */}
            <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200/50 flex gap-3 text-xs text-amber-800">
              <ShieldAlert className="shrink-0 text-amber-600" size={16} />
              <p className="leading-relaxed">
                Bu puanlama, ekosistemin güvenliğini sağlamak için <strong>zorunludur</strong>. Formu doldurana kadar uygulamayı kullanamazsınız.
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={
                isSubmitting ||
                (activeSwap.isRequester && (socialRating === 0 || physicalRating === 0)) ||
                (!activeSwap.isRequester && socialRating === 0)
              }
              className="w-full min-h-[48px] rounded-2xl bg-ink text-parchment-light font-bold flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-30 disabled:scale-100 shadow-md"
            >
              {isSubmitting ? (
                <span>Gönderiliyor...</span>
              ) : (
                <>
                  <Send size={16} />
                  <span>Puanlamayı Tamamla</span>
                </>
              )}
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
