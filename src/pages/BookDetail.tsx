import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, MessageSquareQuote, Layers, Star, Map, Lock, Unlock, ThumbsUp, ThumbsDown, MessageSquarePlus } from 'lucide-react';
import { useStore } from '../store/useStore';
import { AddScriptumModal } from '../components/AddScriptumModal';

export const BookDetail: React.FC = () => {
  const { books, scriptums, setActiveTab, user } = useStore();
  const book = books[0]; // Simulating with the first book
  const bookScriptums = book ? scriptums.filter(s => s.bookId === book.id) : [];
  const isOwner = book ? book.ownerId === user.id : false;
  const isRequested = book ? useStore(state => state.requestedSwaps).includes(book.id) : false;
  
  const [showScriptums, setShowScriptums] = useState(false);
  const [isScriptumModalOpen, setIsScriptumModalOpen] = useState(false);
  
  const progress = book?.progress || 0;
  const isUnlocked = isOwner && progress >= 100;

  const lineageContainer = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  const lineageItem = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 }
  };

  if (!book) {
    return (
      <div className="min-h-screen bg-parchment-light flex flex-col items-center justify-center p-6 text-center">
        <h2 className="font-serif text-2xl text-ink mb-2">Henüz Bir Kitap Yok</h2>
        <p className="text-ink/60 text-sm mb-6">Sisteme henüz hiç kitap eklenmemiş. Profilinden ilk kitabı sen ekleyebilirsin.</p>
        <button 
          onClick={() => setActiveTab('profile')}
          className="bg-ink text-parchment-light px-6 py-2 rounded-full font-medium"
        >
          Profile Git
        </button>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-parchment-light relative"
    >
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 p-4 z-20 flex justify-between items-center text-parchment-light">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className="p-2 bg-ink/40 backdrop-blur-md rounded-full hover:bg-ink/60 transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <button 
          onClick={() => setShowScriptums(true)}
          className="py-2 px-4 bg-karma/90 backdrop-blur-md rounded-full hover:bg-karma transition-colors shadow-lg shadow-karma/30 flex items-center gap-2 text-ink"
        >
          <Layers size={18} />
          <span className="text-xs font-bold uppercase tracking-wider">{bookScriptums.length} Katman</span>
        </button>
      </header>

      {/* Book Cover Background */}
      <div className="relative h-[45vh] bg-ink">
        <img src={book.cover} alt={book.title} className="w-full h-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-t from-parchment-light via-parchment-light/20 to-transparent" />
      </div>

      {/* Content */}
      <div className="px-6 relative z-10 -mt-20 space-y-6 pb-24">
        <div className="bg-white p-6 rounded-3xl shadow-xl shadow-ink/5 border border-ink/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-parchment-dark/30 rounded-bl-full -mr-6 -mt-6" />
          <h1 className="text-3xl font-serif text-ink font-bold leading-tight mb-1">{book.title}</h1>
          <p className="text-ink/60 text-lg mb-5 font-serif italic">{book.author}</p>
          
          <div className="flex gap-4 border-t border-ink/10 pt-4">
            <div className="flex-1">
              <p className="text-[10px] text-ink/40 uppercase tracking-wider font-bold mb-1">Kondisyon</p>
              <p className="text-sm font-medium">{book.condition}</p>
            </div>
            <div className="w-px bg-ink/10" />
            <div className="flex-1">
              <p className="text-[10px] text-ink/40 uppercase tracking-wider font-bold mb-1">Tempo</p>
              <p className="text-sm font-medium">{book.pace}</p>
            </div>
            <div className="w-px bg-ink/10" />
            <div className="flex-1">
              <p className="text-[10px] text-ink/40 uppercase tracking-wider font-bold mb-1">Derinlik</p>
              <p className="text-sm font-medium">{book.depth}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="font-serif text-xl font-bold">Kitap Hakkında</h2>
          <p className="text-ink/80 text-sm leading-relaxed font-serif">
            Körlük, körlüğün salgın bir hastalık gibi yayıldığı bir toplumda korku ve paniğin hakim olmasını 
            anlatır. İlk körleşen adam, ardından onu tedavi eden doktor ve giderek herkes bu salgına yakalanır.
            Saramago, insan doğasının en karanlık yönlerini ve hayatta kalma mücadelesini sarsıcı bir dille 
            gözler önüne seriyor.
          </p>
        </div>

        {/* Kitabın Yolculuğu & Zaman Kapsülü */}
        <div className="space-y-6 pt-6 border-t border-ink/10">
          <div>
            <h2 className="font-serif text-xl font-bold flex items-center gap-2 mb-4">
              <Map className="text-karma" size={20} />
              Kitabın Yolculuğu
            </h2>
            <motion.div 
              variants={lineageContainer}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="relative pl-4 border-l-2 border-karma/30 space-y-5"
            >
              {book.lineage?.map((entry, idx) => (
                <motion.div variants={lineageItem} key={idx} className="relative">
                  <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full bg-karma border-2 border-parchment-light shadow-[0_0_8px_rgba(212,175,55,0.6)]" />
                  <p className="text-sm font-bold text-ink">{entry.city}</p>
                  <p className="text-xs text-ink/60">{entry.ownerName} • {entry.date}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {book.timeCapsule && (
            <div className="bg-ink text-parchment-light p-5 rounded-2xl relative overflow-hidden shadow-lg">
              <div className="absolute right-0 top-0 w-32 h-32 bg-karma/10 rounded-bl-full" />
              <div className="flex items-center gap-2 mb-3 relative z-10">
                {isUnlocked ? <Unlock className="text-karma" size={18} /> : <Lock className="text-ink/40" size={18} />}
                <h3 className="font-serif text-lg text-karma">Zaman Kapsülü</h3>
              </div>
              
              <div className={`relative z-10 transition-all duration-1000 ${!isUnlocked ? 'blur-md select-none opacity-40' : ''}`}>
                <p className="font-serif italic text-sm leading-relaxed mb-3">"{book.timeCapsule.message}"</p>
                <p className="text-xs text-right text-parchment-light/60">— {book.timeCapsule.from}</p>
              </div>
              
              {!isUnlocked && (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                  <span className="bg-ink/90 text-parchment-light text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-sm border border-parchment-light/10 mb-2 shadow-lg">
                    {isOwner ? "%100 Okumaya Ulaşınca Açılır" : "Sadece Kitabın Sahibi Okuyabilir"}
                  </span>
                  {isOwner && <span className="text-[10px] text-karma font-bold">Mevcut: %{progress}</span>}
                </div>
              )}
            </div>
          )}
        </div>

        {!isOwner && (
          <button 
            onClick={() => useStore.getState().requestSwap(book.id)}
            disabled={isRequested}
            className={`w-full py-4 rounded-xl font-bold shadow-lg transition-all active:scale-[0.98] ${
              isRequested 
                ? 'bg-green-600 text-white cursor-default shadow-green-600/20' 
                : 'bg-ink text-parchment-light shadow-ink/20 hover:bg-ink/90'
            }`}
          >
            {isRequested ? 'Takas İsteği Gönderildi ✓' : 'Takas İsteği Gönder'}
          </button>
        )}
      </div>

      {/* Scriptum Layers Drawer */}
      <AnimatePresence>
        {showScriptums && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-ink/60 backdrop-blur-sm z-50 flex justify-end"
            onClick={() => setShowScriptums(false)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-4/5 max-w-sm h-full bg-parchment-light shadow-2xl p-6 overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-serif text-2xl flex items-center gap-2">
                  <Layers className="text-karma" />
                  Katmanlar
                </h2>
                <button onClick={() => setShowScriptums(false)} className="text-ink/40 hover:text-ink">
                  <ChevronLeft size={24} className="rotate-180" />
                </button>
              </div>

              <button 
                onClick={() => setIsScriptumModalOpen(true)}
                className="w-full mb-6 bg-karma/20 text-ink py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-karma/30 transition-colors active:scale-[0.98]"
              >
                <MessageSquarePlus size={18} /> Yeni Katman Ekle
              </button>

              <div className="space-y-6">
                {bookScriptums.map((scriptum, idx) => (
                  <motion.div 
                    key={scriptum.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="relative bg-white p-5 rounded-2xl shadow-sm border border-ink/5"
                  >
                    <MessageSquareQuote size={20} className="absolute top-4 right-4 text-karma/30" />
                    
                    {scriptum.highlightedText ? (
                      <p 
                        className="font-serif text-sm leading-relaxed mb-4 text-ink/90 relative z-10 italic"
                        dangerouslySetInnerHTML={{
                          __html: `"${scriptum.content.replace(
                            scriptum.highlightedText, 
                            `<span class="bg-karma/30 text-ink font-bold px-1 rounded">${scriptum.highlightedText}</span>`
                          )}"`
                        }}
                      />
                    ) : (
                      <p className="font-serif text-sm leading-relaxed mb-4 text-ink/90 relative z-10 italic">
                        "{scriptum.content}"
                      </p>
                    )}

                    <div className="flex items-center justify-between border-t border-ink/5 pt-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-parchment-dark overflow-hidden">
                           <img src={scriptum.userAvatar} alt="User" />
                        </div>
                        <p className="text-[10px] text-ink/60 font-bold uppercase tracking-wide">{scriptum.userName}</p>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-karma font-bold">
                        <Star size={14} fill="currentColor" />
                        {scriptum.likes}
                      </div>
                    </div>

                    {scriptum.duel && (
                      <div className="mt-4 pt-4 border-t border-ink/5 bg-ink/5 -mx-5 px-5 pb-2 rounded-b-2xl">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-5 h-5 rounded-full overflow-hidden bg-parchment-dark">
                            <img src={scriptum.duel.opponentAvatar} alt="Opponent" />
                          </div>
                          <p className="text-[10px] font-bold text-ink/70">Fikir Düellosu: {scriptum.duel.opponentName}</p>
                        </div>
                        <p className="font-serif text-xs leading-relaxed text-ink/80 mb-3 italic">
                          "{scriptum.duel.argument}"
                        </p>
                        <div className="flex gap-2">
                          <button className="flex-1 flex items-center justify-center gap-1 bg-white border border-ink/10 py-1.5 rounded-lg text-[10px] font-bold text-ink hover:bg-karma/10 transition-colors">
                            <ThumbsUp size={12} /> Haklı ({scriptum.duel.support})
                          </button>
                          <button className="flex-1 flex items-center justify-center gap-1 bg-white border border-ink/10 py-1.5 rounded-lg text-[10px] font-bold text-ink hover:bg-red-500/10 transition-colors">
                            <ThumbsDown size={12} /> Hatalı ({scriptum.duel.oppose})
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AddScriptumModal isOpen={isScriptumModalOpen} onClose={() => setIsScriptumModalOpen(false)} bookId={book?.id} />
    </motion.div>
  );
};
