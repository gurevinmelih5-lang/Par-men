import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { MapPin, BookOpen, Clock, Edit2, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCurrentLocation } from '../lib/location';
import toast from 'react-hot-toast';

import { useNavigate } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const user = useStore(state => state.user);
  const books = useStore(state => state.books);
  const scriptums = useStore(state => state.scriptums);
  const requestSwap = useStore(state => state.requestSwap);
  const requestedSwaps = useStore(state => state.requestedSwaps);
  const updateReadingProgress = useStore(state => state.updateReadingProgress);
  const updateLocation = useStore(state => state.updateLocation);
  const navigate = useNavigate();
  const [isEditingProgress, setIsEditingProgress] = useState(false);
  const [tempTotalPages, setTempTotalPages] = useState<number | string>('');
  const [tempCurrentPage, setTempCurrentPage] = useState<number | string>('');
  const [isLocating, setIsLocating] = useState(false);

  const myBooks = books.filter(b => b.ownerId === user?.id);
  const [activeBookId, setActiveBookId] = useState<string>(() => {
    return localStorage.getItem('parsomen_active_reading_book_id') || '';
  });

  useEffect(() => {
    if (myBooks.length > 0) {
      const saved = localStorage.getItem('parsomen_active_reading_book_id');
      const exists = myBooks.some(b => b.id === saved);
      if (!saved || !exists) {
        setActiveBookId(myBooks[0].id);
        localStorage.setItem('parsomen_active_reading_book_id', myBooks[0].id);
      }
    } else {
      setActiveBookId('');
    }
  }, [books, user?.id]);

  useEffect(() => {
    // Automatically update location once on mount
    const updateMyLocation = async () => {
      try {
        setIsLocating(true);
        const { lat, lng } = await getCurrentLocation();
        await updateLocation(lat, lng);
      } catch (err) {
        console.warn("Konum alınamadı. Lütfen tarayıcı izinlerini kontrol edin.", err);
      } finally {
        setIsLocating(false);
      }
    };
    updateMyLocation();
  }, []);
  
  // Get books owned by others, sorted by distance
  const nearBooks = books.filter(b => b.ownerId !== user?.id).sort((a, b) => a.distance - b.distance);
  
  // Find currently reading book by activeBookId
  const currentBook = books.find(b => b.id === activeBookId);
  
  const totalNum = Number(tempTotalPages) || 0;
  const currentNum = Number(tempCurrentPage) || 0;
  const calculatedPercent = totalNum > 0 ? Math.min(100, Math.max(0, Math.round((currentNum / totalNum) * 100))) : 0;

  const handleSaveProgress = () => {
    if (!currentBook) return;
    const total = Number(tempTotalPages);
    const current = Number(tempCurrentPage);

    if (isNaN(total) || total <= 0) {
      toast.error('Lütfen geçerli bir toplam sayfa sayısı girin.');
      return;
    }
    if (isNaN(current) || current < 0) {
      toast.error('Lütfen geçerli bir okunan sayfa sayısı girin.');
      return;
    }
    if (current > total) {
      toast.error('Okunan sayfa sayısı toplam sayfa sayısından büyük olamaz!');
      return;
    }

    const calculatedProgress = Math.round((current / total) * 100);
    updateReadingProgress(currentBook.id, calculatedProgress, total, current);
    setIsEditingProgress(false);
  };

  
  const dailyScriptum = scriptums[0];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      className="px-4 pt-6 pb-28 space-y-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.header variants={item}>
        <h1 className="text-2xl sm:text-3xl font-serif text-ink tracking-tight">Merhaba, {user.name.split(' ')[0]}</h1>
        <p className="text-ink/60 mt-1.5 font-sans text-sm flex items-center gap-1">
          Parşömen'in sayfaları bugün senin için açılıyor.
          {isLocating && <span className="animate-pulse ml-2 text-karma/60 flex items-center gap-1"><MapPin size={12}/> Konum güncelleniyor...</span>}
        </p>
      </motion.header>

      {/* Progress Bar or Empty State */}
      {currentBook ? (
        <motion.section variants={item} className="bg-parchment p-5 rounded-2xl shadow-sm border border-ink/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-karma/5 rounded-bl-full -mr-10 -mt-10" />
          
          {myBooks.length > 1 && (
            <div className="mb-4 relative z-10 max-w-xs">
              <select
                value={activeBookId}
                onChange={(e) => {
                  setActiveBookId(e.target.value);
                  localStorage.setItem('parsomen_active_reading_book_id', e.target.value);
                  setIsEditingProgress(false);
                }}
                className="w-full bg-white/80 backdrop-blur-sm border border-ink/10 rounded-xl px-3 py-1.5 text-xs text-ink outline-none focus:border-karma/50 font-bold cursor-pointer"
              >
                {myBooks.map(b => (
                  <option key={b.id} value={b.id}>{b.title} — {b.author}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex justify-between items-center mb-4 relative z-10">
            <h2 className="font-serif text-xl flex items-center gap-2">
              <BookOpen size={20} className="text-karma" />
              Okuma İlerlemen
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-karma">
                {isEditingProgress ? `${calculatedPercent}%` : `${currentBook.progress || 0}%`}
              </span>
              {!isEditingProgress ? (
                <button 
                  onClick={() => { 
                    setIsEditingProgress(true); 
                    setTempTotalPages(currentBook.totalPages || ''); 
                    setTempCurrentPage(currentBook.currentPage || ''); 
                  }} 
                  className="w-10 h-10 flex items-center justify-center text-ink/40 hover:text-ink transition-colors bg-ink/5 rounded-full"
                >
                  <Edit2 size={16} />
                </button>
              ) : (
                <div className="flex items-center gap-1">
                  <button 
                    onClick={handleSaveProgress} 
                    className="w-10 h-10 flex items-center justify-center text-green-600 hover:text-green-700 bg-green-50 rounded-full transition-colors"
                  >
                    <Check size={20} />
                  </button>
                  <button 
                    onClick={() => setIsEditingProgress(false)} 
                    className="w-10 h-10 flex items-center justify-center text-red-400 hover:text-red-500 bg-red-50 rounded-full transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {isEditingProgress ? (
            <div className="flex gap-4 mb-4 relative z-10 py-1">
              <div className="flex-1">
                <label className="block text-[10px] font-bold text-ink/40 uppercase tracking-wider mb-1">Kaldığın Sayfa</label>
                <input 
                  type="number"
                  min="0"
                  value={tempCurrentPage}
                  onChange={(e) => setTempCurrentPage(e.target.value === '' ? '' : parseInt(e.target.value))}
                  placeholder="Örn: 144"
                  className="w-full bg-white border border-ink/10 py-2 px-3 rounded-xl text-ink font-medium text-base focus:outline-none focus:border-karma transition-all"
                />
              </div>
              <div className="flex-1">
                <label className="block text-[10px] font-bold text-ink/40 uppercase tracking-wider mb-1">Toplam Sayfa</label>
                <input 
                  type="number"
                  min="1"
                  value={tempTotalPages}
                  onChange={(e) => setTempTotalPages(e.target.value === '' ? '' : parseInt(e.target.value))}
                  placeholder="Örn: 320"
                  className="w-full bg-white border border-ink/10 py-2 px-3 rounded-xl text-ink font-medium text-base focus:outline-none focus:border-karma transition-all"
                />
              </div>
            </div>
          ) : (
            <div className="w-full bg-parchment-dark/50 rounded-full h-2 mb-3 overflow-hidden relative z-10">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${currentBook.progress || 0}%` }}
                transition={{ duration: 1, delay: 0.2 }}
                className="bg-karma h-full rounded-full" 
              />
            </div>
          )}
          <div className="flex items-center justify-between relative z-10">
            <div className="flex flex-col">
              <p className="text-xs text-ink/60 font-medium">{currentBook.title} — {currentBook.author}</p>
              {!isEditingProgress && currentBook.currentPage != null && currentBook.totalPages != null && (
                <p className="text-[10px] text-ink/40 font-medium mt-0.5">
                  {currentBook.currentPage} / {currentBook.totalPages} sayfa okundu
                </p>
              )}
            </div>
            <p className="text-[10px] text-karma font-bold">
              {(isEditingProgress ? calculatedPercent : (currentBook.progress || 0)) === 0 && 'Henüz başlamadın...'}
              {(isEditingProgress ? calculatedPercent : (currentBook.progress || 0)) > 0 && (isEditingProgress ? calculatedPercent : (currentBook.progress || 0)) < 25 && '🌱 Yeni başladın!'}
              {(isEditingProgress ? calculatedPercent : (currentBook.progress || 0)) >= 25 && (isEditingProgress ? calculatedPercent : (currentBook.progress || 0)) < 50 && '📖 Yarı yoldasın!'}
              {(isEditingProgress ? calculatedPercent : (currentBook.progress || 0)) >= 50 && (isEditingProgress ? calculatedPercent : (currentBook.progress || 0)) < 80 && '🔥 Harika gidiyorsun!'}
              {(isEditingProgress ? calculatedPercent : (currentBook.progress || 0)) >= 80 && (isEditingProgress ? calculatedPercent : (currentBook.progress || 0)) < 100 && '⚡ Neredeyse bitti!'}
              {(isEditingProgress ? calculatedPercent : (currentBook.progress || 0)) === 100 && '🏆 Tebrikler! Bitirdin!'}
            </p>
          </div>
        </motion.section>
      ) : (
        <motion.section variants={item} className="bg-parchment/60 p-6 rounded-2xl border border-dashed border-ink/20 flex flex-col items-center justify-center text-center relative overflow-hidden">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-3 text-ink/30 shadow-sm">
            <BookOpen size={24} />
          </div>
          <h3 className="font-serif font-bold text-lg mb-1">Kütüphanen Boş</h3>
          <p className="text-sm text-ink/60 mb-4">Okumakta olduğun bir kitap ekle ve ilerlemeni takip et.</p>
          <button 
            onClick={() => navigate('/profile')}
            className="bg-karma text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-sm hover:bg-karma/90 transition-colors"
          >
            Kitap Ekle
          </button>
        </motion.section>
      )}

      {/* Near Swap Opportunities */}
      <motion.section variants={item} className="space-y-4">
        <div className="flex justify-between items-end">
          <h2 className="font-serif text-xl">Yakınındaki Fırsatlar</h2>
          <span 
            onClick={() => navigate('/discovery')}
            className="text-xs text-karma font-medium cursor-pointer hover:text-karma/80 transition-colors"
          >
            Tümünü Gör
          </span>
        </div>
        
        <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 snap-x scroll-touch" style={{ scrollbarWidth: 'none' }}>
          {nearBooks.map(book => (
            <div 
              key={book.id} 
              className="min-w-[160px] snap-center bg-white p-3 rounded-xl shadow-sm border border-ink/5 flex-shrink-0 active:shadow-md transition-shadow relative"
            >
              <div 
                className="relative h-32 mb-3 rounded-lg overflow-hidden bg-parchment-dark cursor-pointer group"
                onClick={() => navigate(`/book/${book.id}`)}
              >
                <img src={book.cover} alt={book.title} className="w-full h-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-bold flex items-center gap-1 text-ink shadow-sm">
                  <MapPin size={10} /> {book.distance} km
                </div>
              </div>
              <h3 className="font-serif font-bold text-sm leading-tight truncate">{book.title}</h3>
              <p className="text-xs text-ink/60 truncate mb-3">{book.author}</p>
              <div className="flex items-center justify-between">
                <span className="text-[10px] px-2 py-1 bg-parchment-light rounded text-ink/70 font-medium">
                  {book.condition}
                </span>
                
                <AnimatePresence mode="wait">
                  {requestedSwaps.includes(book.id) ? (
                    <motion.button 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="bg-green-600 text-white text-[11px] font-medium px-4 py-1.5 rounded-full flex items-center gap-1 cursor-default"
                    >
                      <Check size={12} /> İstendi
                    </motion.button>
                  ) : (
                    <motion.button 
                      whileTap={{ scale: 0.9 }}
                      onClick={(e) => { e.stopPropagation(); requestSwap(book.id); }}
                      className="bg-ink text-parchment-light text-[11px] font-medium px-4 py-1.5 rounded-full hover:bg-ink/80 transition-colors shadow-sm"
                    >
                      İste
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* Scriptum of the Day */}
      {dailyScriptum && (
        <motion.section variants={item} className="relative p-6 rounded-2xl bg-ink text-parchment-light shadow-lg overflow-hidden">
          <div className="absolute top-0 right-4 opacity-5 font-serif text-9xl leading-none select-none">"</div>
          <h2 className="font-serif text-lg mb-4 text-karma flex items-center gap-2">
            <Clock size={18} />
            Günün Yazısı
          </h2>
          <p className="font-serif text-lg italic leading-relaxed relative z-10 text-parchment-light/90">
            "{dailyScriptum.content}"
          </p>
          <div className="mt-6 flex items-center justify-between relative z-10">
            <button 
              className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity text-left"
              onClick={() => { useStore.getState().setViewedUser({ id: dailyScriptum.userId, name: dailyScriptum.userName, avatar: dailyScriptum.userAvatar, karma: { physical: 0, intellectual: 0, social: 0, total: 0 } } as any); navigate(`/public-profile/${dailyScriptum.userId}`); }}
            >
              <div className="w-8 h-8 rounded-full bg-parchment-dark overflow-hidden border border-parchment-light/20 flex-shrink-0">
                 <img src={dailyScriptum.userAvatar || "https://i.pravatar.cc/150"} alt="User Avatar" className="w-full h-full object-cover" />
              </div>
              <p className="text-xs text-parchment-light/70">— {dailyScriptum.userName}</p>
            </button>
            <span className="text-[10px] bg-white/10 px-3 py-1 rounded-full text-parchment-light/80">{dailyScriptum.likes} Beğeni</span>
          </div>
        </motion.section>
      )}
    </motion.div>
  );
};
