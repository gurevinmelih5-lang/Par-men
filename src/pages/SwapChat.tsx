import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Send, BookOpen, CheckCheck } from 'lucide-react';
import { useStore } from '../store/useStore';

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  read: boolean;
}

export const SwapChat: React.FC = () => {
  const { user, activeSwapChat, setActiveTab, setActiveSwapChat } = useStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'sys-1',
      senderId: 'system',
      text: `🎉 Takas onaylandı! "${activeSwapChat?.bookTitle}" kitabı için buluşma yerini ve zamanını konuşabilirsiniz.`,
      timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      read: true,
    },
  ]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!activeSwapChat) {
    return (
      <div className="min-h-screen bg-parchment-light flex items-center justify-center p-6 text-center">
        <div>
          <BookOpen size={40} className="mx-auto text-ink/20 mb-4" />
          <p className="font-serif text-lg text-ink/60">Aktif bir takas sohbeti bulunamadı.</p>
          <button onClick={() => setActiveTab('profile')} className="mt-4 text-sm font-bold text-karma underline">
            Profile Dön
          </button>
        </div>
      </div>
    );
  }

  const handleSend = () => {
    if (!input.trim()) return;
    const msg: Message = {
      id: `msg-${Date.now()}`,
      senderId: user.id,
      text: input.trim(),
      timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      read: false,
    };
    setMessages(prev => [...prev, msg]);
    setInput('');

    // Simulated auto-reply after 1.5s
    setTimeout(() => {
      const replies = [
        'Harika! Yarin ogleden sonra Kadikoy Iskele\u2019de bulusalim mi?',
        'Tamam, uygun olur. Saat kacta?',
        'Kitabin cok iyi durumda oldugunu gordum, tesekkurler!',
        'Peki saat 15:00 Moda Sahili olabilir mi?',
      ];
      const reply: Message = {
        id: `msg-${Date.now() + 1}`,
        senderId: activeSwapChat.otherUserId,
        text: replies[Math.floor(Math.random() * replies.length)],
        timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
        read: false,
      };
      setMessages(prev => [...prev, reply]);
    }, 1500);
  };

  return (
    <div className="flex flex-col h-screen bg-parchment-light">
      {/* Header */}
      <header className="flex items-center gap-3 p-4 border-b border-ink/10 bg-white shadow-sm z-10">
        <button
          onClick={() => { setActiveSwapChat(null); setActiveTab('profile'); }}
          className="p-2 rounded-full hover:bg-parchment-light transition-colors text-ink/60"
        >
          <ChevronLeft size={22} />
        </button>

        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-karma/40 flex-shrink-0">
          <img src={activeSwapChat.otherUserAvatar} alt={activeSwapChat.otherUserName} className="w-full h-full object-cover" />
        </div>

        <div className="flex-grow min-w-0">
          <p className="font-bold text-sm text-ink truncate">{activeSwapChat.otherUserName}</p>
          <p className="text-[10px] text-ink/50 truncate flex items-center gap-1">
            <BookOpen size={9} /> {activeSwapChat.bookTitle} takası
          </p>
        </div>

        {/* Book mini cover */}
        {activeSwapChat.bookCover && (
          <div className="w-9 h-12 rounded-lg overflow-hidden bg-parchment-dark flex-shrink-0 shadow-md border border-ink/10">
            <img src={activeSwapChat.bookCover} alt={activeSwapChat.bookTitle} className="w-full h-full object-cover" />
          </div>
        )}
      </header>

      {/* Swap confirmed banner */}
      <div className="bg-green-50 border-b border-green-200 px-4 py-2 flex items-center gap-2">
        <span className="text-green-600 text-xs font-bold">✓ Takas Onaylandı</span>
        <span className="text-[10px] text-green-500">— Buluşma yerini ve saatini belirleyin</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg) => {
          const isMe = msg.senderId === user.id;
          const isSystem = msg.senderId === 'system';

          if (isSystem) {
            return (
              <div key={msg.id} className="flex justify-center">
                <div className="bg-karma/10 border border-karma/20 text-ink/70 text-xs px-4 py-2 rounded-2xl max-w-xs text-center leading-relaxed">
                  {msg.text}
                </div>
              </div>
            );
          }

          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${isMe ? 'justify-end' : 'justify-start'} items-end gap-2`}
            >
              {!isMe && (
                <img
                  src={activeSwapChat.otherUserAvatar}
                  alt={activeSwapChat.otherUserName}
                  className="w-7 h-7 rounded-full object-cover flex-shrink-0 mb-0.5"
                />
              )}
              <div className={`max-w-[72%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                isMe
                  ? 'bg-ink text-parchment-light rounded-br-sm'
                  : 'bg-white text-ink border border-ink/5 shadow-sm rounded-bl-sm'
              }`}>
                <p>{msg.text}</p>
                <p className={`text-[9px] mt-1 text-right ${isMe ? 'text-parchment-light/50' : 'text-ink/30'}`}>
                  {msg.timestamp}
                  {isMe && <CheckCheck size={10} className="inline ml-1 opacity-60" />}
                </p>
              </div>
            </motion.div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-ink/10 bg-white">
        <div className="flex items-center gap-3 bg-parchment-light rounded-2xl px-4 py-2 border border-ink/10">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder="Mesaj yaz..."
            className="flex-1 bg-transparent outline-none text-sm text-ink placeholder:text-ink/30 font-medium"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="w-9 h-9 rounded-xl bg-ink text-parchment-light flex items-center justify-center disabled:opacity-30 transition-all active:scale-95 shadow-sm"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
