import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Swords, ThumbsUp, ThumbsDown, Trophy } from 'lucide-react';
import { useStore } from '../store/useStore';

export const Arena: React.FC = () => {
  const { scriptums, voteDuel, user, setActiveTab } = useStore();
  const duels = scriptums.filter(s => s.duel);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [votingFeedback, setVotingFeedback] = useState<{ id: string, supportPercent: number } | null>(null);

  const currentScriptum = duels[currentIndex];

  const handleVote = (isSupport: boolean) => {
    if (!currentScriptum || votingFeedback) return;
    
    // Generate mock community stats
    const basePercent = isSupport ? Math.floor(Math.random() * 30) + 55 : Math.floor(Math.random() * 40) + 10;
    
    setVotingFeedback({ id: currentScriptum.id, supportPercent: basePercent });
    voteDuel(currentScriptum.id, isSupport);
    
    setTimeout(() => {
      setDirection(isSupport ? 1 : -1);
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
        setDirection(0);
        setVotingFeedback(null);
      }, 400);
    }, 1500);
  };

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1 }
  };

  if (!currentScriptum) {
    return (
      <motion.div 
        className="min-h-screen bg-parchment-light flex flex-col items-center justify-center p-6 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <Trophy size={48} className="text-karma mb-4" />
        <h2 className="font-serif text-2xl text-ink mb-2">Arena Sessiz...</h2>
        <p className="text-ink/60 text-sm mb-6 max-w-xs">Şu an tartışılacak yeni bir fikir yok. Bir kitabı okuyup Scriptum ekledikten sonra buraya düello açabilirsin.</p>
        <button
          onClick={() => setActiveTab('bookDetail')}
          className="bg-karma text-ink px-6 py-3 rounded-xl font-bold shadow-md shadow-karma/20 hover:bg-karma/90 transition-all active:scale-[0.98]"
        >
          Kitap’lara Git
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="p-6 h-[calc(100vh-64px)] flex flex-col"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <header className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-serif text-ink tracking-tight flex items-center gap-2">
            <Swords className="text-karma" /> Arena
          </h1>
          <p className="text-ink/60 mt-2 font-sans text-sm">Fikirleri tart, Karma kazan.</p>
        </div>
        <div className="bg-karma/10 px-3 py-1 rounded-full border border-karma/20">
          <span className="text-xs font-bold text-ink">Karma: {user.karma.total}</span>
        </div>
      </header>

      <div className="flex-1 relative overflow-hidden flex items-center justify-center">
        <AnimatePresence mode="popLayout" custom={direction}>
          <motion.div
            key={currentScriptum.id}
            custom={direction}
            initial={{ opacity: 0, x: direction === 0 ? 0 : direction * 100, rotate: direction * 10 }}
            animate={{ opacity: 1, x: 0, rotate: 0 }}
            exit={{ opacity: 0, x: direction * -100, rotate: direction * -10 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute inset-x-0 mx-auto w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-ink/5 overflow-hidden"
          >
            {/* Top Area: Original Scriptum */}
            <div className="p-6 bg-parchment-dark/30 border-b border-ink/5 relative">
              <div className="absolute top-4 right-4 text-ink/10 text-6xl font-serif leading-none">"</div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-parchment overflow-hidden border-2 border-white shadow-sm">
                  <img src={currentScriptum.userAvatar} alt="User" />
                </div>
                <div>
                  <p className="text-sm font-bold text-ink leading-none">{currentScriptum.userName}</p>
                  <p className="text-[10px] text-ink/60 uppercase tracking-widest mt-1">Savunan</p>
                </div>
              </div>
              <p className="font-serif text-lg leading-relaxed text-ink/90 relative z-10">
                {currentScriptum.content}
              </p>
            </div>

            {/* Bottom Area: Duel Argument */}
            <div className="p-6 bg-white relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 bg-karma text-white rounded-full flex items-center justify-center shadow-md">
                <Swords size={12} />
              </div>
              
              <div className="flex items-center gap-3 mb-4 justify-end">
                <div className="text-right">
                  <p className="text-sm font-bold text-ink leading-none">{currentScriptum.duel?.opponentName}</p>
                  <p className="text-[10px] text-ink/60 uppercase tracking-widest mt-1">Meydan Okuyan</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-parchment overflow-hidden border-2 border-karma shadow-sm">
                  <img src={currentScriptum.duel?.opponentAvatar} alt="Opponent" />
                </div>
              </div>
              <p className="font-serif text-lg leading-relaxed text-ink/90 italic text-right">
                "{currentScriptum.duel?.argument}"
              </p>

              {/* Action Buttons & Feedback */}
              <div className="mt-8 relative h-16">
                <AnimatePresence mode="wait">
                  {votingFeedback?.id === currentScriptum.id ? (
                    <motion.div 
                      key="feedback"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex flex-col items-center justify-center bg-karma/10 rounded-2xl border border-karma/20"
                    >
                      <p className="text-sm font-bold text-ink mb-1">
                        Topluluğun <span className="text-karma">% {votingFeedback.supportPercent}</span>'i Haklı Buldu
                      </p>
                      <div className="w-3/4 h-1.5 bg-ink/10 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }} 
                          animate={{ width: `${votingFeedback.supportPercent}%` }} 
                          transition={{ duration: 0.5, ease: "easeOut" }}
                          className="h-full bg-karma" 
                        />
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="buttons"
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex gap-4"
                    >
                      <button 
                        onClick={() => handleVote(false)}
                        className="flex-1 flex flex-col items-center justify-center gap-2 bg-red-50 text-red-600 py-2 rounded-2xl hover:bg-red-100 transition-colors border border-red-100 shadow-sm active:scale-95"
                      >
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                          <ThumbsDown size={16} />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest">Hatalı</span>
                      </button>
                      
                      <button 
                        onClick={() => handleVote(true)}
                        className="flex-1 flex flex-col items-center justify-center gap-2 bg-green-50 text-green-600 py-2 rounded-2xl hover:bg-green-100 transition-colors border border-green-100 shadow-sm active:scale-95"
                      >
                        <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                          <ThumbsUp size={16} />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest">Haklı</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
