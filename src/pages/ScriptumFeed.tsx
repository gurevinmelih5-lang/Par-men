import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, Star, MessageSquareQuote, MessageCircle, Send, Book, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import toast from 'react-hot-toast';

export const ScriptumFeed: React.FC = () => {
  const { scriptums, books, user, addScriptum, likeScriptum, addReply, setViewedUser, deleteScriptum } = useStore();
  const navigate = useNavigate();
  const [newPostContent, setNewPostContent] = useState('');
  const [selectedBookId, setSelectedBookId] = useState<string>('');
  const [isManualBook, setIsManualBook] = useState(false);
  const [customBookTitle, setCustomBookTitle] = useState('');
  const [customBookAuthor, setCustomBookAuthor] = useState('');
  
  const [replyContent, setReplyContent] = useState<Record<string, string>>({});
  const [expandedReplies, setExpandedReplies] = useState<string[]>([]);

  const uniqueBooks = books.reduce((acc: typeof books, current) => {
    const isDup = acc.some(b => b.title.toLowerCase() === current.title.toLowerCase() && b.author.toLowerCase() === current.author.toLowerCase());
    if (!isDup) {
      acc.push(current);
    }
    return acc;
  }, []).sort((a, b) => a.title.localeCompare(b.title, 'tr'));

  const handlePost = async () => {
    if (!newPostContent.trim()) {
      toast.error('Lütfen bir şeyler yazın!');
      return;
    }

    if (isManualBook && !customBookTitle.trim()) {
      toast.error('Lütfen kitap adını girin!');
      return;
    }

    await addScriptum({
      content: newPostContent,
      bookId: selectedBookId || undefined,
      customBookTitle: isManualBook ? customBookTitle.trim() : undefined,
      customBookAuthor: isManualBook ? customBookAuthor.trim() : undefined,
    });
    setNewPostContent('');
    setSelectedBookId('');
    setCustomBookTitle('');
    setCustomBookAuthor('');
    setIsManualBook(false);
  };

  const handleReply = async (scriptumId: string) => {
    const text = replyContent[scriptumId];
    if (!text?.trim()) return;
    await addReply(scriptumId, text);
    setReplyContent(prev => ({ ...prev, [scriptumId]: '' }));
    if (!expandedReplies.includes(scriptumId)) {
      setExpandedReplies(prev => [...prev, scriptumId]);
    }
  };

  const toggleReplies = (id: string) => {
    setExpandedReplies(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-parchment-light pb-24 pt-4 px-4 touch-manipulation">
      <header className="mb-5 flex items-center gap-3">
        <Layers className="text-karma" size={24} />
        <div>
          <h1 className="font-serif text-xl sm:text-2xl font-bold text-ink">Akış</h1>
          <p className="text-xs text-ink/60">Okurların düşünceleri ve katmanları</p>
        </div>
      </header>

      {/* Post Composer */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-ink/5 mb-6">
        <div className="flex gap-3 mb-3">
          <img src={user?.avatar || 'https://i.pravatar.cc/150'} alt="Sen" className="w-10 h-10 rounded-full object-cover border border-ink/10" />
          <textarea
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            placeholder="Ne düşünüyorsun? (Kitaplardan veya hayattan...)"
            className="w-full bg-parchment-light/30 rounded-xl p-3 text-sm outline-none border border-ink/5 focus:border-karma/50 resize-none h-20"
          />
        </div>

        {isManualBook && (
          <div className="flex flex-col sm:flex-row gap-2 mb-3 pl-[52px]">
            <input
              type="text"
              value={customBookTitle}
              onChange={(e) => setCustomBookTitle(e.target.value)}
              placeholder="Kitap Adı..."
              className="flex-1 bg-parchment-light/50 border border-ink/10 rounded-xl px-3 py-2 text-base sm:text-sm text-ink outline-none focus:border-karma/50 font-medium"
            />
            <input
              type="text"
              value={customBookAuthor}
              onChange={(e) => setCustomBookAuthor(e.target.value)}
              placeholder="Yazar..."
              className="flex-1 bg-parchment-light/50 border border-ink/10 rounded-xl px-3 py-2 text-base sm:text-sm text-ink outline-none focus:border-karma/50 font-medium"
            />
          </div>
        )}

        <div className="flex flex-wrap items-center justify-end sm:justify-between gap-2 pl-[52px]">
          <div className="relative flex-1 min-w-0">
            <select
              value={isManualBook ? "manual" : selectedBookId}
              onChange={(e) => {
                if (e.target.value === "manual") {
                  setIsManualBook(true);
                  setSelectedBookId('');
                } else {
                  setIsManualBook(false);
                  setSelectedBookId(e.target.value);
                }
              }}
              className="w-full appearance-none bg-parchment-dark/50 text-ink/70 text-[10px] sm:text-xs font-bold px-3 py-2 rounded-full outline-none border border-ink/5 pl-7 pr-6 cursor-pointer truncate"
            >
              <option value="">(İsteğe bağlı) Kitap Seç</option>
              <option value="manual">✍️ Manuel Kitap Bilgisi Gir</option>
              {uniqueBooks.map(b => (
                <option key={b.id} value={b.id}>{b.title} — {b.author}</option>
              ))}
            </select>
            <Book size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink/40" />
          </div>
          <button
            onClick={handlePost}
            className="bg-karma text-ink px-4 py-2 sm:py-1.5 rounded-full text-xs font-bold hover:bg-karma/90 transition-colors shadow-sm flex items-center gap-1 flex-shrink-0"
          >
            <Send size={14} /> Paylaş
          </button>
        </div>
      </div>

      {/* Feed */}
      <div className="space-y-6">
        {scriptums.map((scriptum, idx) => {
          const book = scriptum.bookId ? books.find((b) => b.id === scriptum.bookId) : null;
          const isExpanded = expandedReplies.includes(scriptum.id);
          const replies = scriptum.replies || [];

          return (
            <motion.div
              key={scriptum.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-3xl p-5 shadow-sm border border-ink/5"
            >
              <div className="flex items-center justify-between mb-3">
                <button 
                  className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity text-left"
                  onClick={() => { setViewedUser({ id: scriptum.userId, name: scriptum.userName, avatar: scriptum.userAvatar, karma: { physical: 0, intellectual: 0, social: 0, total: 0 } } as any); navigate(`/public-profile/${scriptum.userId}`); }}
                >
                  <img src={scriptum.userAvatar} alt="User" className="w-10 h-10 rounded-full object-cover border border-ink/10" />
                  <div>
                    <p className="text-sm font-bold text-ink">{scriptum.userName}</p>
                    <p className="text-[10px] text-ink/50">{scriptum.timestamp || 'Yeni'}</p>
                  </div>
                </button>
                
                {scriptum.userId === user?.id && (
                  <button
                    onClick={async () => {
                      if (window.confirm('Bu paylaşımı silmek istediğinize emin misiniz?')) {
                        await deleteScriptum(scriptum.id);
                      }
                    }}
                    className="p-1.5 text-ink/40 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors flex items-center justify-center cursor-pointer"
                    title="Paylaşımı Sil"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              {book && (
                <div className="flex items-center gap-3 mb-3 p-2 bg-parchment-light/50 rounded-xl border border-ink/5">
                  <img src={book.cover} alt={book.title} className="w-8 h-12 object-cover rounded shadow-sm" />
                  <div>
                    <p className="font-serif font-bold text-ink text-xs leading-tight">{book.title}</p>
                    <p className="font-serif italic text-ink/60 text-[10px]">{book.author}</p>
                  </div>
                </div>
              )}

              {!book && scriptum.customBookTitle && (
                <div className="flex items-center gap-3 mb-3 p-2 bg-parchment-light/50 rounded-xl border border-ink/5">
                  <div className="w-8 h-12 bg-karma/10 rounded flex items-center justify-center border border-ink/5 shadow-sm">
                    <Book size={16} className="text-karma/60" />
                  </div>
                  <div>
                    <p className="font-serif font-bold text-ink text-xs leading-tight">{scriptum.customBookTitle}</p>
                    {scriptum.customBookAuthor && (
                      <p className="font-serif italic text-ink/60 text-[10px]">{scriptum.customBookAuthor}</p>
                    )}
                  </div>
                </div>
              )}

              <div className="relative mb-4 mt-2">
                {(scriptum.bookId || scriptum.customBookTitle) && <MessageSquareQuote size={20} className="absolute -top-1 -left-1 text-karma/20" />}
                {scriptum.highlightedText ? (
                  <p className="font-serif text-sm leading-relaxed text-ink/90 italic pl-6">
                    "{scriptum.content.split(scriptum.highlightedText).map((part, i, arr) => (
                      <React.Fragment key={i}>
                        {part}
                        {i < arr.length - 1 && (
                          <span className="bg-karma/30 text-ink font-bold px-1 rounded">
                            {scriptum.highlightedText}
                          </span>
                        )}
                      </React.Fragment>
                    ))}"
                  </p>
                ) : (
                  <p className={`text-sm leading-relaxed text-ink/90 ${(scriptum.bookId || scriptum.customBookTitle) ? 'font-serif italic pl-6' : 'font-sans'}`}>
                    {scriptum.content}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-ink/5">
                <button
                  onClick={() => likeScriptum(scriptum.id)}
                  className="flex items-center gap-1.5 text-[11px] text-ink/60 hover:text-karma font-bold transition-colors"
                >
                  <Star size={16} className={scriptum.likedByMe ? "fill-karma text-karma" : ""} />
                  {scriptum.likes}
                </button>
                <button
                  onClick={() => toggleReplies(scriptum.id)}
                  className="flex items-center gap-1.5 text-[11px] text-ink/60 hover:text-ink font-bold transition-colors"
                >
                  <MessageCircle size={16} />
                  {replies.length} Yorum
                  {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
              </div>

              {/* Replies Section */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mt-4 pt-4 border-t border-ink/5"
                  >
                    <div className="space-y-4 mb-4">
                      {replies.map(reply => (
                        <div key={reply.id} className="flex gap-3">
                          <button 
                            className="cursor-pointer hover:opacity-80 transition-opacity shrink-0"
                            onClick={() => { setViewedUser({ id: reply.userId, name: reply.userName, avatar: reply.userAvatar, karma: { physical: 0, intellectual: 0, social: 0, total: 0 } } as any); navigate(`/public-profile/${reply.userId}`); }}
                          >
                            <img src={reply.userAvatar} alt="Reply User" className="w-6 h-6 rounded-full object-cover mt-1 border border-ink/10" />
                          </button>
                          <div className="bg-parchment-light/50 p-2.5 rounded-2xl rounded-tl-none text-sm border border-ink/5 flex-1">
                            <p className="font-bold text-[10px] text-ink/60 mb-0.5 cursor-pointer hover:underline" onClick={() => { setViewedUser({ id: reply.userId, name: reply.userName, avatar: reply.userAvatar, karma: { physical: 0, intellectual: 0, social: 0, total: 0 } } as any); navigate(`/public-profile/${reply.userId}`); }}>{reply.userName}</p>
                            <p className="text-ink/90">{reply.content}</p>
                          </div>
                        </div>
                      ))}
                      {replies.length === 0 && (
                         <p className="text-xs text-ink/40 text-center italic">Henüz yorum yok. İlk yorumu sen yap!</p>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Yorum yaz..."
                        value={replyContent[scriptum.id] || ''}
                        onChange={(e) => setReplyContent(prev => ({ ...prev, [scriptum.id]: e.target.value }))}
                        onKeyDown={(e) => e.key === 'Enter' && handleReply(scriptum.id)}
                        className="flex-1 bg-parchment-light rounded-xl px-3 py-2 text-xs outline-none border border-ink/10 focus:border-karma/50"
                      />
                      <button
                        onClick={() => handleReply(scriptum.id)}
                        className="w-8 h-8 rounded-full bg-karma text-ink flex items-center justify-center shrink-0 hover:bg-karma/90 transition-colors"
                      >
                        <Send size={12} />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}

        {scriptums.length === 0 && (
          <div className="text-center py-10 text-ink/50">
            <Layers size={40} className="mx-auto mb-3 opacity-20" />
            <p className="font-serif">Henüz hiç içerik yok. İlk paylaşan sen ol!</p>
          </div>
        )}
      </div>
    </div>
  );
};
