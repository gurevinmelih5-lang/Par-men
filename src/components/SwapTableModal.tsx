import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Book, ShieldCheck, Check } from 'lucide-react';
import { useStore } from '../store/useStore';
import type { Book as BookType } from '../types/models';
import { supabase } from '../lib/supabase';
import type { SwapRequest } from '../store/slices/bookSlice';
import toast from 'react-hot-toast';

interface SwapTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: SwapRequest;
}

export const SwapTableModal: React.FC<SwapTableModalProps> = ({ isOpen, onClose, request }) => {
  const { books, respondToSwapRequest, setViewedUser, setActiveTab } = useStore();
  const [requesterBooks, setRequesterBooks] = useState<BookType[]>([]);
  const [offeredBookId, setOfferedBookId] = useState<string>('');
  const [loadingBooks, setLoadingBooks] = useState(false);

  useEffect(() => {
    if (isOpen && request?.requesterId) {
      const fetchBooks = async () => {
        setLoadingBooks(true);
        try {
          const { data } = await supabase
            .from('books')
            .select('*')
            .eq('owner_id', request.requesterId);
          
          if (data) {
             setRequesterBooks(data.map(b => ({
               id: b.id,
               title: b.title,
               cover: b.cover_url,
               author: b.author
             } as any)));
          }
        } catch (error) {
          console.error(error);
        } finally {
          setLoadingBooks(false);
        }
      };
      fetchBooks();
    }
  }, [isOpen, request]);

  const handleConfirm = async () => {
    if (!offeredBookId) {
      toast.error('Lütfen karşı taraftan takas için bir kitap seçin!');
      return;
    }
    await respondToSwapRequest(request.id, true, offeredBookId);
    onClose();
  };

  const handleReject = async () => {
    await respondToSwapRequest(request.id, false);
    onClose();
  };

  if (!isOpen || !request) return null;

  const targetBook = books.find(b => b.id === request.bookId) || { title: request.bookTitle, cover: '' };
  const selectedOfferedBook = requesterBooks.find(b => b.id === offeredBookId);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-ink/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center sm:p-6"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="bg-parchment-light w-full max-w-lg sm:rounded-3xl rounded-t-3xl flex flex-col shadow-2xl overflow-hidden"
          style={{ maxHeight: '92dvh', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-ink p-4 flex justify-between items-center text-parchment-light shadow-md z-10 relative">
            <div className="absolute right-0 top-0 w-24 h-24 bg-karma/10 rounded-bl-full" />
            <div>
              <h2 className="font-serif text-xl font-bold flex items-center gap-2 relative z-10">
                <ShieldCheck className="text-karma" size={20} />
                Takas Müzakeresi
              </h2>
              <p className="text-xs text-parchment-light/70 relative z-10">
                <button 
                  onClick={() => {
                     setViewedUser({ id: request.requesterId, name: request.requesterName, avatar: request.requesterAvatar, karma: { physical: 70, intellectual: 70, social: 70, total: 70 } } as any);
                     setActiveTab('publicProfile');
                     onClose();
                  }}
                  className="font-bold underline hover:text-white transition-colors cursor-pointer"
                >
                  {request.requesterName}
                </button> senden "{request.bookTitle}" kitabını istiyor.
              </p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-parchment-light/10 rounded-full transition-colors relative z-10">
              <X size={20} />
            </button>
          </div>

          {/* Table Area (Books) */}
          <div className="bg-white p-6 border-b border-ink/5 flex gap-6 items-center justify-between shadow-sm z-10">
            {/* Requester's Offer */}
            <div className="flex-1 flex flex-col items-center gap-2">
              <p className="text-[10px] font-bold text-ink/40 uppercase tracking-widest text-center">{request.requesterName}'in Vereceği</p>
              {selectedOfferedBook ? (
                <div className="w-20 h-28 rounded shadow-md overflow-hidden border-2 border-karma relative cursor-pointer group" onClick={() => setOfferedBookId('')}>
                  <img src={selectedOfferedBook.cover} alt="Offer" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-red-500/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <X size={24} className="text-white" />
                  </div>
                </div>
              ) : (
                <div className="w-20 h-28 rounded border-2 border-dashed border-ink/20 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-parchment-dark/50 transition-colors relative overflow-hidden text-center p-2">
                  {loadingBooks ? (
                    <span className="text-xs text-ink/40">Yükleniyor...</span>
                  ) : requesterBooks.length === 0 ? (
                    <span className="text-[10px] text-ink/40">Kullanıcının kitabı yok.</span>
                  ) : (
                    <>
                      <Book size={24} className="text-ink/30" />
                      <span className="text-[10px] text-ink/60 font-bold">Kitap Seç</span>
                      <select 
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={(e) => setOfferedBookId(e.target.value)}
                        value={offeredBookId}
                      >
                        <option value="">Seçim Yap</option>
                        {requesterBooks.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
                      </select>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="w-10 h-10 rounded-full bg-karma text-ink flex items-center justify-center font-bold shadow-sm shadow-karma/30 shrink-0 text-lg">
              ⇄
            </div>

            {/* Target Book (My Book) */}
            <div className="flex-1 flex flex-col items-center gap-2">
              <p className="text-[10px] font-bold text-ink/40 uppercase tracking-widest text-center">Senin Vereceğin</p>
              <div className="w-20 h-28 rounded shadow-md overflow-hidden">
                {targetBook.cover ? (
                   <img src={targetBook.cover} alt="Target" className="w-full h-full object-cover" />
                ) : (
                   <div className="w-full h-full bg-ink/5 flex items-center justify-center text-xs text-center text-ink/40 p-2">{targetBook.title}</div>
                )}
              </div>
            </div>
          </div>

          <div className="p-4 bg-parchment-light/30 space-y-2 text-center overflow-y-auto scroll-touch">
             <p className="text-xs sm:text-sm text-ink/70">
               Takas gerçekleşmesi için karşılığında bir kitap seçmelisin. Onayladığında bir sohbet penceresi açılacak ve buluşma yerini ayarlayabileceksiniz.
             </p>
          </div>

          {/* Action Area */}
          <div className="p-4 bg-white border-t border-ink/5 flex gap-3">
            <button 
              onClick={handleReject}
              className="flex-1 bg-red-50 text-red-600 py-3 rounded-xl font-bold hover:bg-red-100 transition-colors"
            >
              Reddet
            </button>
            <button 
              onClick={handleConfirm}
              disabled={!offeredBookId}
              className={`flex-[2] py-3 rounded-xl font-bold transition-all shadow-md active:scale-[0.98] flex justify-center items-center gap-2 ${offeredBookId ? 'bg-karma text-ink shadow-karma/30 active:bg-karma/90' : 'bg-ink/10 text-ink/40 cursor-not-allowed'}`}
            >
              <Check size={18} /> Takası Onayla
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
