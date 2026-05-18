import React from 'react';
import { motion } from 'framer-motion';
import { Layers, Star, MessageSquareQuote } from 'lucide-react';
import { useStore } from '../store/useStore';

export const ScriptumFeed: React.FC = () => {
  const { scriptums, books, likeScriptum } = useStore();

  return (
    <div className="min-h-screen bg-parchment-light pb-24 pt-4 px-4 touch-manipulation">
      <header className="mb-6 flex items-center gap-3">
        <Layers className="text-karma" size={28} />
        <div>
          <h1 className="font-serif text-2xl font-bold text-ink">Akış</h1>
          <p className="text-xs text-ink/60">Okurların kitaplara bıraktığı tüm katmanlar</p>
        </div>
      </header>

      <div className="space-y-6">
        {scriptums.map((scriptum, idx) => {
          const book = books.find((b) => b.id === scriptum.bookId);
          return (
            <motion.div
              key={scriptum.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-3xl p-5 shadow-sm border border-ink/5"
            >
              {book && (
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-ink/5">
                  <img src={book.cover} alt={book.title} className="w-8 h-12 object-cover rounded bg-ink/5" />
                  <div>
                    <p className="font-serif font-bold text-ink text-sm leading-tight">{book.title}</p>
                    <p className="font-serif italic text-ink/60 text-xs">{book.author}</p>
                  </div>
                </div>
              )}

              <div className="relative mb-4">
                <MessageSquareQuote size={20} className="absolute -top-1 -left-1 text-karma/20" />
                {scriptum.highlightedText ? (
                  <p
                    className="font-serif text-sm leading-relaxed text-ink/90 italic pl-6"
                    dangerouslySetInnerHTML={{
                      __html: `"${scriptum.content.replace(
                        scriptum.highlightedText,
                        `<span class="bg-karma/30 text-ink font-bold px-1 rounded">${scriptum.highlightedText}</span>`
                      )}"`,
                    }}
                  />
                ) : (
                  <p className="font-serif text-sm leading-relaxed text-ink/90 italic pl-6">
                    "{scriptum.content}"
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <img src={scriptum.userAvatar} alt="User" className="w-6 h-6 rounded-full object-cover" />
                  <p className="text-[10px] text-ink/60 font-bold uppercase tracking-wide">
                    {scriptum.userName}
                  </p>
                </div>
                <button
                  onClick={() => likeScriptum(scriptum.id)}
                  className="flex items-center gap-1 text-[11px] text-karma font-bold hover:text-karma/80 transition-colors"
                >
                  <Star size={16} fill="currentColor" />
                  {scriptum.likes}
                </button>
              </div>
            </motion.div>
          );
        })}

        {scriptums.length === 0 && (
          <div className="text-center py-10 text-ink/50">
            <Layers size={40} className="mx-auto mb-3 opacity-20" />
            <p className="font-serif">Henüz hiç katman oluşturulmamış.</p>
          </div>
        )}
      </div>
    </div>
  );
};
