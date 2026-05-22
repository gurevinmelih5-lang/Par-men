import React from 'react';
import { motion } from 'framer-motion';
import { useStore } from '../store/useStore';
import { ChevronLeft, MapPin, Award, BookOpen, Check } from 'lucide-react';

export const PublicProfile: React.FC = () => {
  const { viewedUser, books, setActiveTab, goBack, requestSwap, requestedSwaps } = useStore();

  if (!viewedUser) {
    return (
      <div className="min-h-screen bg-parchment-light flex flex-col items-center justify-center p-6 text-center">
        <h2 className="font-serif text-2xl text-ink mb-2">Kullanıcı Bulunamadı</h2>
        <button 
          onClick={() => setActiveTab('discovery')}
          className="bg-ink text-parchment-light px-6 py-2 rounded-full font-medium mt-4"
        >
          Geri Dön
        </button>
      </div>
    );
  }

  // Get books owned by the viewed user
  const userBooks = books.filter(b => b.ownerId === viewedUser.id);
  const karmaTotal = viewedUser.karma.total || 0;
  const isGold = karmaTotal >= 80;

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      initial="hidden"
      animate="show"
      exit={{ opacity: 0 }}
      variants={container}
      className="min-h-screen bg-parchment-light pb-24 relative"
    >
      <header className="p-4 flex items-center justify-between relative z-10">
        <button 
          onClick={() => goBack()}
          className="p-2 bg-white rounded-full shadow-sm text-ink/60 active:text-ink transition-colors tap-target"
        >
          <ChevronLeft size={24} />
        </button>
      </header>

      <div className="px-4 -mt-2">
        {/* Profile Header */}
        <motion.div variants={item} className="flex flex-col items-center text-center mb-8">
          <div className="relative mb-4">
            <div className={`w-28 h-28 rounded-full overflow-hidden border-4 ${isGold ? 'border-karma shadow-[0_0_15px_rgba(212,175,55,0.5)]' : 'border-white shadow-md'}`}>
               <img src={viewedUser.avatar || "https://i.pravatar.cc/150"} alt={viewedUser.name} className="w-full h-full object-cover" />
            </div>
            {isGold && (
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-karma to-yellow-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-sm whitespace-nowrap">
                Mühürlü Okur
              </div>
            )}
          </div>
          <h1 className="text-2xl font-serif text-ink font-bold">{viewedUser.name}</h1>
          {viewedUser.lat && viewedUser.lng && (
            <p className="text-sm text-ink/60 flex items-center justify-center gap-1 mt-1">
              <MapPin size={14} /> Konum Bilgisi Açık
            </p>
          )}
        </motion.div>

        {/* Karma Stats */}
        <motion.div variants={item} className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-white p-3 rounded-2xl shadow-sm text-center border border-ink/5 flex flex-col items-center justify-center">
            <Award size={18} className="text-karma mb-1" />
            <p className="text-[10px] text-ink/60 uppercase font-bold tracking-wider mb-1">Toplam</p>
            <p className="font-serif text-xl text-ink font-bold">{karmaTotal}</p>
          </div>
          <div className="bg-white p-3 rounded-2xl shadow-sm text-center border border-ink/5">
            <p className="text-[10px] text-ink/60 uppercase font-bold tracking-wider mb-1">Fiziksel</p>
            <p className="font-serif text-lg text-ink font-bold">{viewedUser.karma.physical || 0}</p>
          </div>
          <div className="bg-white p-3 rounded-2xl shadow-sm text-center border border-ink/5">
            <p className="text-[10px] text-ink/60 uppercase font-bold tracking-wider mb-1">Sosyal</p>
            <p className="font-serif text-lg text-ink font-bold">{viewedUser.karma.social || 0}</p>
          </div>
        </motion.div>

        {/* User's Books */}
        <motion.div variants={item} className="space-y-4">
          <h2 className="font-serif text-xl flex items-center gap-2">
            <BookOpen size={20} className="text-karma" />
            Kütüphanesi
          </h2>
          {userBooks.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {userBooks.map(book => (
                <div key={book.id} className="bg-white rounded-2xl p-3 shadow-sm border border-ink/5 flex flex-col">
                  <div className="w-full h-36 bg-parchment-dark rounded-xl overflow-hidden mb-3">
                    <img src={book.cover} alt={book.title} className="w-full h-full object-cover" />
                  </div>
                  <h3 className="font-serif text-sm font-bold leading-tight mb-1 truncate">{book.title}</h3>
                  <p className="text-[10px] text-ink/60 truncate mb-2">{book.author}</p>
                  <div className="mt-auto flex justify-between items-center gap-2">
                    <span className="text-[10px] font-bold text-ink/70 bg-parchment-light px-2 py-1 rounded">
                      {book.condition}
                    </span>
                    {requestedSwaps.includes(book.id) ? (
                      <button
                        type="button"
                        disabled
                        title="Bu kitap için takas isteği zaten gönderildi"
                        className="flex items-center gap-1 text-[10px] font-bold bg-green-600 text-white px-2 py-1 rounded-full cursor-default opacity-90"
                      >
                        <Check size={10} /> İstendi
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => requestSwap(book.id)}
                        className="text-[10px] font-bold bg-ink text-parchment-light px-2 py-1 rounded-full hover:bg-ink/80 transition-colors touch-manipulation"
                      >
                        Takas İste
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-6 rounded-2xl text-center border border-ink/5 border-dashed">
              <p className="text-ink/60 text-sm">Bu kullanıcının kütüphanesinde henüz kitap yok.</p>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};
