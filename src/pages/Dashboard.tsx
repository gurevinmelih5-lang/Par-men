import React, { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { MapPin, BookOpen, Clock, Edit2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCurrentLocation } from '../lib/location';

export const Dashboard: React.FC = () => {
  const { user, books, scriptums, setActiveTab, requestSwap, requestedSwaps, updateReadingProgress, updateLocation } = useStore();
  const [isEditingProgress, setIsEditingProgress] = useState(false);
  const [tempProgress, setTempProgress] = useState(45); // Default matching mock data
  const [isLocating, setIsLocating] = useState(false);

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
  const nearBooks = books.filter(b => b.ownerId !== user.id).sort((a, b) => a.distance - b.distance);
  
  // Find currently reading book (first book owned by user)
  const currentBook = books.find(b => b.ownerId === user.id) || { id: 'b1', title: 'Körlük', author: 'José Saramago', progress: 45 };
  
  const handleSaveProgress = () => {
    updateReadingProgress(currentBook.id, tempProgress);
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
      className="p-6 space-y-8"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.header variants={item}>
        <h1 className="text-3xl font-serif text-ink tracking-tight">Merhaba, {user.name.split(' ')[0]}</h1>
        <p className="text-ink/60 mt-2 font-sans text-sm flex items-center gap-1">
          Parşömen'in sayfaları bugün senin için açılıyor.
          {isLocating && <span className="animate-pulse ml-2 text-karma/60 flex items-center gap-1"><MapPin size={12}/> Konum güncelleniyor...</span>}
        </p>
      </motion.header>

      {/* Progress Bar */}
      <motion.section variants={item} className="bg-parchment p-5 rounded-2xl shadow-sm border border-ink/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-karma/5 rounded-bl-full -mr-10 -mt-10" />
        <div className="flex justify-between items-center mb-4 relative z-10">
          <h2 className="font-serif text-xl flex items-center gap-2">
            <BookOpen size={20} className="text-karma" />
            Okuma İlerlemen
          </h2>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-karma">{isEditingProgress ? `${tempProgress}%` : `${currentBook.progress || 0}%`}</span>
            {!isEditingProgress ? (
              <button onClick={() => { setIsEditingProgress(true); setTempProgress(currentBook.progress || 0); }} className="text-ink/40 hover:text-ink transition-colors">
                <Edit2 size={14} />
              </button>
            ) : (
              <button onClick={handleSaveProgress} className="text-green-600 hover:text-green-700 transition-colors">
                <Check size={16} />
              </button>
            )}
          </div>
        </div>
        
        {isEditingProgress ? (
          <div className="mb-3 relative z-10 py-1">
            <input 
              type="range" 
              min="0" max="100" 
              value={tempProgress}
              onChange={(e) => setTempProgress(parseInt(e.target.value))}
              className="w-full h-2 bg-parchment-dark rounded-lg appearance-none cursor-pointer accent-karma"
            />
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
          <p className="text-xs text-ink/60 font-medium">{currentBook.title} — {currentBook.author}</p>
          <p className="text-[10px] text-karma font-bold">
            {(currentBook.progress || 0) === 0 && 'Henüz başlamadın...'}
            {(currentBook.progress || 0) > 0 && (currentBook.progress || 0) < 25 && '🌱 Yeni başladın!'}
            {(currentBook.progress || 0) >= 25 && (currentBook.progress || 0) < 50 && '📖 Yarı yoldasın!'}
            {(currentBook.progress || 0) >= 50 && (currentBook.progress || 0) < 80 && '🔥 Harika gidiyorsun!'}
            {(currentBook.progress || 0) >= 80 && (currentBook.progress || 0) < 100 && '⚡ Neredeyse bitti!'}
            {(currentBook.progress || 0) === 100 && '🏆 Tebrikler! Bitirdin!'}
          </p>
        </div>
      </motion.section>

      {/* Near Swap Opportunities */}
      <motion.section variants={item} className="space-y-4">
        <div className="flex justify-between items-end">
          <h2 className="font-serif text-xl">Yakınındaki Fırsatlar</h2>
          <span onClick={() => setActiveTab('discovery')} className="text-xs text-karma font-medium cursor-pointer hover:text-karma/80 transition-colors">Tümünü Gör</span>
        </div>
        
        <div className="flex gap-4 overflow-x-auto pb-4 -mx-6 px-6 snap-x" style={{ scrollbarWidth: 'none' }}>
          {nearBooks.map(book => (
            <div 
              key={book.id} 
              className="min-w-[200px] snap-center bg-white p-3 rounded-xl shadow-sm border border-ink/5 flex-shrink-0 hover:shadow-md transition-shadow relative"
            >
              <div 
                className="relative h-32 mb-3 rounded-lg overflow-hidden bg-parchment-dark cursor-pointer group"
                onClick={() => setActiveTab('bookDetail')}
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
            Günün Scriptum'u
          </h2>
          <p className="font-serif text-lg italic leading-relaxed relative z-10 text-parchment-light/90">
            "{dailyScriptum.content}"
          </p>
          <div className="mt-6 flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-parchment-dark overflow-hidden border border-parchment-light/20">
                 <img src={dailyScriptum.userAvatar || "https://i.pravatar.cc/150"} alt="User Avatar" className="w-full h-full object-cover" />
              </div>
              <p className="text-xs text-parchment-light/70">— {dailyScriptum.userName}</p>
            </div>
            <span className="text-[10px] bg-white/10 px-3 py-1 rounded-full text-parchment-light/80">{dailyScriptum.likes} Beğeni</span>
          </div>
        </motion.section>
      )}
    </motion.div>
  );
};
