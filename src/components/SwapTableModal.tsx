import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Book, ShieldCheck } from 'lucide-react';
import { useStore } from '../store/useStore';
import type { Book as BookType } from '../mockData';

interface SwapTableModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetBook: BookType;
  onConfirm: () => void;
}

export const SwapTableModal: React.FC<SwapTableModalProps> = ({ isOpen, onClose, targetBook, onConfirm }) => {
  const { user, books } = useStore();
  const [message, setMessage] = useState('');
  
  // Mock conversation for demo
  const [messages, setMessages] = useState([
    { id: 1, sender: 'other', text: 'Merhaba, bu kitabı takaslamak isterim.' },
  ]);

  const myBooks = books.filter(b => b.ownerId === user.id);
  const [offeredBook, setOfferedBook] = useState<string | null>(null);

  const handleSend = () => {
    if (!message.trim()) return;
    setMessages([...messages, { id: Date.now(), sender: 'me', text: message }]);
    setMessage('');
  };

  if (!isOpen) return null;

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
          className="bg-parchment-light w-full max-w-lg h-[85vh] sm:h-[80vh] rounded-t-3xl sm:rounded-3xl flex flex-col shadow-2xl overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-ink p-4 flex justify-between items-center text-parchment-light shadow-md z-10 relative">
            <div className="absolute right-0 top-0 w-24 h-24 bg-karma/10 rounded-bl-full" />
            <div>
              <h2 className="font-serif text-xl font-bold flex items-center gap-2 relative z-10">
                <ShieldCheck className="text-karma" size={20} />
                Takas Masası
              </h2>
              <p className="text-xs text-parchment-light/70 relative z-10">Güvenli Müzakere Alanı</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-parchment-light/10 rounded-full transition-colors relative z-10">
              <X size={20} />
            </button>
          </div>

          {/* Table Area (Books) */}
          <div className="bg-white p-4 border-b border-ink/5 flex gap-4 items-center justify-between shadow-sm z-10">
            {/* My Offer */}
            <div className="flex-1 flex flex-col items-center gap-2">
              <p className="text-[10px] font-bold text-ink/40 uppercase tracking-widest">Senin Teklifin</p>
              {offeredBook ? (
                <div className="w-16 h-24 rounded shadow-md overflow-hidden border-2 border-karma relative cursor-pointer group" onClick={() => setOfferedBook(null)}>
                  <img src={books.find(b => b.id === offeredBook)?.cover} alt="Offer" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-red-500/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <X size={20} className="text-white" />
                  </div>
                </div>
              ) : (
                <div className="w-16 h-24 rounded border-2 border-dashed border-ink/20 flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-parchment-dark/50 transition-colors">
                  <Book size={20} className="text-ink/30" />
                  <select 
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => setOfferedBook(e.target.value)}
                  >
                    <option value="">Kitap Seç</option>
                    {myBooks.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
                  </select>
                </div>
              )}
            </div>

            <div className="w-8 h-8 rounded-full bg-karma text-ink flex items-center justify-center font-bold shadow-sm shadow-karma/30 shrink-0">
              ⇄
            </div>

            {/* Target Book */}
            <div className="flex-1 flex flex-col items-center gap-2">
              <p className="text-[10px] font-bold text-ink/40 uppercase tracking-widest">İstediğin</p>
              <div className="w-16 h-24 rounded shadow-md overflow-hidden">
                <img src={targetBook.cover} alt="Target" className="w-full h-full object-cover" />
              </div>
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-parchment-light/50">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.sender === 'me' ? 'bg-ink text-parchment-light rounded-tr-sm' : 'bg-white text-ink shadow-sm border border-ink/5 rounded-tl-sm'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>

          {/* Action Area */}
          <div className="p-4 bg-white border-t border-ink/5 space-y-3">
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Mesaj yaz..."
                className="flex-1 bg-parchment-dark rounded-xl px-4 py-2 text-sm outline-none border border-ink/5 focus:border-karma/50"
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <button 
                onClick={handleSend}
                className="w-10 h-10 rounded-xl bg-karma text-ink flex items-center justify-center hover:bg-karma/90 transition-colors shadow-sm"
              >
                <Send size={16} />
              </button>
            </div>
            <button 
              onClick={onConfirm}
              className="w-full bg-ink text-parchment-light py-3 rounded-xl font-bold hover:bg-ink/90 transition-colors shadow-md active:scale-[0.98]"
            >
              Anlaşmayı Onayla ve QR Oluştur
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
