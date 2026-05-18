import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Send, BookOpen, CheckCheck, Ban } from 'lucide-react';
import { useStore } from '../store/useStore';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { containsProfanity } from '../lib/moderation';

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  read: boolean;
}

/** swap_messages satırı (Supabase) */
interface SwapMessageRow {
  id: string;
  sender_id: string;
  body: string;
  created_at: string;
}

function formatMsgTime(iso: string) {
  try {
    return new Date(iso).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

export const SwapChat: React.FC = () => {
  const {
    user,
    activeSwapChat,
    goBack,
    endSwapChat,
    setActiveTab,
  } = useStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const swapId = activeSwapChat?.swapId;
  const chatEnded = Boolean(activeSwapChat?.chatEndedBy);
  const endedByMe = activeSwapChat?.chatEndedBy === user.id;

  const loadMessages = useCallback(async () => {
    if (!swapId) return;
    const { data, error } = await supabase
      .from('swap_messages')
      .select('id, sender_id, body, created_at')
      .eq('swap_request_id', swapId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error(error);
      return;
    }
    setMessages(
      (data as SwapMessageRow[] | null)?.map((m) => ({
        id: m.id,
        senderId: m.sender_id,
        text: m.body,
        timestamp: formatMsgTime(m.created_at),
        read: true,
      })) ?? []
    );
  }, [swapId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!swapId) return;

    const loadTimer = window.setTimeout(() => {
      void loadMessages();
    }, 0);

    const channel = supabase
      .channel(`swap-chat-${swapId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'swap_messages',
          filter: `swap_request_id=eq.${swapId}`,
        },
        (payload) => {
          const m = payload.new as SwapMessageRow;
          setMessages((prev) => {
            if (prev.some((x) => x.id === m.id)) return prev;
            return [
              ...prev,
              {
                id: m.id,
                senderId: m.sender_id,
                text: m.body,
                timestamp: formatMsgTime(m.created_at),
                read: true,
              },
            ];
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'swap_requests',
          filter: `id=eq.${swapId}`,
        },
        (payload) => {
          const row = payload.new as { chat_ended_by?: string | null };
          if (row.chat_ended_by) {
            void useStore.getState().openSwapChatById(swapId, { goToChatTab: false });
          }
        }
      )
      .subscribe();

    return () => {
      window.clearTimeout(loadTimer);
      void supabase.removeChannel(channel);
    };
  }, [swapId, loadMessages]);

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

  const handleSend = async () => {
    if (!input.trim() || !swapId || chatEnded) return;
    const text = input.trim();
    
    if (containsProfanity(text)) {
      toast.error('Mesajınız uygunsuz kelimeler içeriyor. Lütfen düzelterek tekrar deneyin.');
      return;
    }

    setInput('');

    const { data, error } = await supabase
      .from('swap_messages')
      .insert({
        swap_request_id: swapId,
        sender_id: user.id,
        body: text,
      })
      .select('id, sender_id, body, created_at')
      .single();

    if (error) {
      console.error(error);
      toast.error('Mesaj gönderilemedi. swap_chat_extension.sql ile tabloları oluşturduğunuzdan emin olun.');
      setInput(text);
      return;
    }

    if (data) {
      const m = data as SwapMessageRow;
      setMessages((prev) => {
        if (prev.some((x) => x.id === m.id)) return prev;
        return [
          ...prev,
          {
            id: m.id,
            senderId: m.sender_id,
            text: m.body,
            timestamp: formatMsgTime(m.created_at),
            read: true,
          },
        ];
      });
    }
  };

  const handleEndChat = async () => {
    if (!swapId || chatEnded) return;
    if (!window.confirm('Sohbeti sonlandırmak istediğinize emin misiniz? Karşı taraf da yazamayacaktır.')) return;
    await endSwapChat(swapId);
  };

  return (
    <div className="flex flex-col min-h-[100dvh] bg-parchment-light">
      <header className="flex items-center gap-2 p-3 border-b border-ink/10 bg-white shadow-sm z-10 flex-shrink-0">
        <button
          type="button"
          onClick={() => goBack()}
          className="p-2 rounded-full hover:bg-parchment-light transition-colors text-ink/60"
          aria-label="Geri"
        >
          <ChevronLeft size={22} />
        </button>

        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-karma/40 flex-shrink-0">
          <img src={activeSwapChat.otherUserAvatar} alt="" className="w-full h-full object-cover" />
        </div>

        <div className="flex-grow min-w-0">
          <p className="font-bold text-sm text-ink truncate">{activeSwapChat.otherUserName}</p>
          <p className="text-[10px] text-ink/50 truncate flex items-center gap-1">
            <BookOpen size={9} /> {activeSwapChat.bookTitle} takası
          </p>
        </div>

        {activeSwapChat.bookCover && (
          <div className="w-9 h-12 rounded-lg overflow-hidden bg-parchment-dark flex-shrink-0 shadow-md border border-ink/10">
            <img src={activeSwapChat.bookCover} alt="" className="w-full h-full object-cover" />
          </div>
        )}

        {activeSwapChat.ownerId === user.id && !chatEnded && (
          <button
            type="button"
            onClick={async () => {
              if (window.confirm('Kitabı teslim ettiniz mi? Takası tamamlamak üzeresiniz.')) {
                await useStore.getState().executeSwap(activeSwapChat.bookId);
                await useStore.getState().endSwapChat(swapId);
              }
            }}
            className="p-2 rounded-full text-green-600/90 hover:bg-green-50 transition-colors flex-shrink-0"
            title="Takası Tamamla"
          >
            <CheckCheck size={20} />
          </button>
        )}

        <button
          type="button"
          onClick={handleEndChat}
          disabled={chatEnded}
          className="p-2 rounded-full text-red-600/90 hover:bg-red-50 disabled:opacity-30 transition-colors flex-shrink-0"
          title="Sohbeti sonlandır"
          aria-label="Sohbeti sonlandır"
        >
          <Ban size={20} />
        </button>
      </header>

      <div className="bg-green-50 border-b border-green-200 px-4 py-2 flex-shrink-0">
        <span className="text-green-700 text-xs font-bold">✓ Takas onaylandı</span>
        <span className="text-[10px] text-green-600 ml-2">— Buluşma için yalnızca karşı tarafınızla yazışın</span>
      </div>

      {chatEnded && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-[11px] text-amber-900 flex-shrink-0">
          {endedByMe
            ? 'Bu sohbeti siz sonlandırdınız.'
            : 'Karşı taraf sohbeti sonlandırdı. Yeni mesaj gönderilemez.'}
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 min-h-0">
        {messages.length === 0 && !chatEnded && (
          <p className="text-center text-xs text-ink/45 py-8">Henüz mesaj yok. Buluşma yeri ve saati için yazın.</p>
        )}
        {messages.map((msg) => {
          const isMe = msg.senderId === user.id;
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
                  alt=""
                  className="w-7 h-7 rounded-full object-cover flex-shrink-0 mb-0.5"
                />
              )}
              <div
                className={`max-w-[72%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                  isMe
                    ? 'bg-ink text-parchment-light rounded-br-sm'
                    : 'bg-white text-ink border border-ink/5 shadow-sm rounded-bl-sm'
                }`}
              >
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

      <div className="p-4 border-t border-ink/10 bg-white flex-shrink-0 pb-[calc(1rem+env(safe-area-inset-bottom,0px))]">
        <div className="flex items-center gap-3 bg-parchment-light rounded-2xl px-4 py-2 border border-ink/10">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={chatEnded ? 'Sohbet kapalı' : 'Mesaj yaz...'}
            disabled={chatEnded}
            className="flex-1 bg-transparent outline-none text-sm text-ink placeholder:text-ink/30 font-medium disabled:opacity-50"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={!input.trim() || chatEnded}
            className="w-9 h-9 rounded-xl bg-ink text-parchment-light flex items-center justify-center disabled:opacity-30 transition-all active:scale-95 shadow-sm"
            aria-label="Gönder"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
