import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Send, Users, Clock, AlertCircle, ShieldAlert, MoreVertical, Flag, Ban } from 'lucide-react';
import { useStore } from '../store/useStore';
import toast from 'react-hot-toast';

export const RoomPanel: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, rooms, sendRoomMessage, deleteRoom, leaveRoom } = useStore();
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [activeOptionId, setActiveOptionId] = useState<string | null>(null);

  const room = rooms.find(r => r.id === id);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [room?.messages]);

  if (!room) {
    return (
      <div className="min-h-[100dvh] bg-parchment-light flex flex-col items-center justify-center p-6 text-center">
        <ShieldAlert size={48} className="text-red-500/50 mb-4" />
        <h2 className="font-serif text-2xl font-bold text-ink mb-2">Oda Bulunamadı</h2>
        <p className="text-ink/60 mb-6 text-sm max-w-xs">Bu okuma odası kapanmış veya silinmiş olabilir.</p>
        <button onClick={() => navigate('/discovery')} className="bg-ink text-parchment-light px-6 py-3 rounded-xl font-bold shadow-md">
          Odalara Dön
        </button>
      </div>
    );
  }

  const isHost = room.hostId === user.id;

  // Time check logic
  const checkIsTimeArrived = () => {
    if (room.isLive) return true;
    if (!room.time) return true;
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    const [hours, mins] = room.time.split(':').map(Number);
    const roomMinutes = hours * 60 + mins;
    return currentMinutes >= roomMinutes;
  };

  const isTimeArrived = checkIsTimeArrived();
  const canChat = isHost || isTimeArrived;
  const visibleMessages = room.messages?.filter(msg => !user?.blockedUsers?.includes(msg.userId)) || [];

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !canChat) return;

    sendRoomMessage(room.id, {
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      content: input.trim(),
    });
    setInput('');
  };

  const handleCloseRoom = () => {
    if (window.confirm('Bu odayı tamamen kapatmak istediğinize emin misiniz? Tüm katılımcılar odadan çıkarılacak.')) {
      deleteRoom(room.id);
      toast.success('Oda başarıyla kapatıldı.');
      navigate('/discovery');
    }
  };

  const handleLeaveRoom = () => {
    if (window.confirm('Odadan ayrılmak istediğinize emin misiniz?')) {
      leaveRoom(room.id, user.id);
      navigate('/discovery');
    }
  };

  return (
    <div className="flex h-[100dvh] bg-white overflow-hidden relative">
      
      {/* Sidebar - Desktop always visible, Mobile toggleable */}
      <div className={`
        fixed inset-y-0 right-0 z-40 w-64 bg-parchment-light border-l border-ink/10 shadow-2xl
        transform transition-transform duration-300 ease-in-out flex flex-col
        md:relative md:transform-none md:shadow-none
        ${showSidebar ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
      `}>
        <div className="p-4 bg-ink text-parchment-light flex items-center justify-between">
          <h3 className="font-serif font-bold text-sm flex items-center gap-2">
            <Users size={16} className="text-karma" /> Katılımcılar ({room.participantsList?.length || 0})
          </h3>
          <button className="md:hidden p-1 text-parchment-light/60 hover:text-white" onClick={() => setShowSidebar(false)}>
            Kapat
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {room.participantsList?.map(p => (
            <div key={p.id} className="relative flex items-center justify-between p-2 rounded-xl hover:bg-ink/5 transition-colors cursor-pointer group">
              <div className="flex items-center gap-3 flex-1" onClick={() => { useStore.getState().setViewedUser(p as any); navigate(`/public-profile/${p.id}`); }}>
                <div className="relative">
                  <img src={p.avatar} alt={p.name} className="w-8 h-8 rounded-full object-cover border border-ink/20" />
                  {p.id === room.hostId && (
                    <div className="absolute -bottom-1 -right-1 bg-karma rounded-full p-0.5 shadow-sm" title="Oda Kurucusu">
                      <ShieldAlert size={8} className="text-ink" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-ink truncate flex items-center gap-1">
                    {p.name}
                    {p.id === room.hostId && <span className="text-[9px] text-karma bg-karma/10 px-1.5 py-0.5 rounded">Kurucu</span>}
                  </p>
                </div>
              </div>

              {p.id !== user.id && (
                <div className="relative shrink-0">
                  <button 
                    onClick={(e) => { e.stopPropagation(); setActiveOptionId(activeOptionId === p.id ? null : p.id); }}
                    className="p-1 text-ink/30 hover:text-ink/70 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreVertical size={14} />
                  </button>
                  <AnimatePresence>
                    {activeOptionId === p.id && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="absolute right-0 top-6 w-36 bg-white rounded-lg shadow-xl border border-ink/10 py-1 z-50 overflow-hidden"
                      >
                        <button 
                          onClick={(e) => { e.stopPropagation(); useStore.getState().reportContent('user', p.id, 'Inappropriate behavior in room'); setActiveOptionId(null); }}
                          className="w-full px-3 py-2 flex items-center gap-2 text-[11px] font-medium text-ink/70 hover:bg-ink/5 text-left"
                        >
                          <Flag size={12} /> Şikayet Et
                        </button>
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            if (window.confirm('Bu kullanıcıyı engellemek istediğinize emin misiniz?')) {
                              useStore.getState().blockUser(p.id); 
                              setActiveOptionId(null); 
                            }
                          }}
                          className="w-full px-3 py-2 flex items-center gap-2 text-[11px] font-bold text-red-600 hover:bg-red-50 text-left border-t border-ink/5"
                        >
                          <Ban size={12} /> Engelle
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Sidebar Footer / Actions */}
        <div className="p-4 border-t border-ink/10 bg-white">
          {isHost ? (
            <button onClick={handleCloseRoom} className="w-full py-2.5 bg-red-50 text-red-600 font-bold text-xs rounded-xl hover:bg-red-100 transition-colors">
              Odayı Kapat
            </button>
          ) : (
            <button onClick={handleLeaveRoom} className="w-full py-2.5 bg-ink/5 text-ink/60 font-bold text-xs rounded-xl hover:bg-ink/10 transition-colors">
              Odadan Ayrıl
            </button>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0 relative h-full">
        {/* Header */}
        <header className="h-16 bg-white border-b border-ink/10 flex items-center justify-between px-4 shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/discovery')}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-ink/5 text-ink/60 hover:bg-ink/10 transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <div>
              <h1 className="font-serif font-bold text-ink truncate max-w-[200px] sm:max-w-[300px]">{room.title}</h1>
              <p className="text-[10px] text-ink/50 flex items-center gap-1">
                {room.type} • {room.isLive ? <span className="text-karma">Canlı</span> : <>{room.time}</>}
              </p>
            </div>
          </div>
          
          <button 
            className="md:hidden flex items-center gap-1 text-xs font-bold text-ink/60 bg-ink/5 px-3 py-1.5 rounded-lg"
            onClick={() => setShowSidebar(true)}
          >
            <Users size={14} /> {room.participantsList?.length || 0}
          </button>
        </header>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FDFBF7]">
          {visibleMessages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-ink/40 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-ink/5 flex items-center justify-center mb-2">
                <Clock size={24} className="text-karma" />
              </div>
              <p className="font-serif text-lg font-bold text-ink/60">Henüz mesaj yok</p>
              <p className="text-xs max-w-xs leading-relaxed">
                {!isTimeArrived 
                  ? "Etkinlik saati gelene kadar sadece oda kurucusu mesaj gönderebilir." 
                  : "İlk mesajı sen gönder ve sohbeti başlat!"}
              </p>
            </div>
          ) : (
            visibleMessages.map((msg, i) => {
              const isMe = msg.userId === user.id;
              const isConsecutive = i > 0 && visibleMessages[i - 1].userId === msg.userId;
              
              return (
                <motion.div 
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''} ${isConsecutive ? 'mt-1' : 'mt-4'}`}
                >
                  {!isConsecutive ? (
                    <img src={msg.userAvatar} alt={msg.userName} className="w-8 h-8 rounded-full object-cover shrink-0 mt-1" />
                  ) : (
                    <div className="w-8 shrink-0" />
                  )}
                  <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[75%]`}>
                    {!isConsecutive && (
                      <span className="text-[10px] text-ink/40 font-bold mb-1 ml-1 flex items-center gap-1">
                        {msg.userName} {msg.userId === room.hostId && <span className="text-[8px] bg-karma/20 text-karma px-1 rounded">KURUCU</span>}
                      </span>
                    )}
                    <div className={`px-4 py-2.5 rounded-2xl text-[13px] ${
                      isMe ? 'bg-ink text-parchment-light rounded-tr-sm' : 'bg-white border border-ink/10 text-ink rounded-tl-sm shadow-sm'
                    }`}>
                      {msg.content}
                    </div>
                    <span className="text-[9px] text-ink/30 mt-1 mr-1">
                      {new Date(msg.timestamp).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </motion.div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input Area */}
        <div className="p-3 sm:p-4 bg-white border-t border-ink/10 shrink-0" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 16px)' }}>
          <form onSubmit={handleSend} className="relative max-w-4xl mx-auto">
            {!canChat && (
              <div className="absolute -top-10 left-0 right-0 flex justify-center z-10">
                <div className="bg-amber-100 text-amber-800 text-[10px] font-bold px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1">
                  <AlertCircle size={12} />
                  Etkinlik saati henüz gelmedi
                </div>
              </div>
            )}
            
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={!canChat}
              placeholder={canChat ? "Mesaj yaz..." : "Sadece kurucu yazabilir..."}
              className="w-full bg-parchment-light border border-ink/10 py-3.5 pl-4 pr-12 rounded-2xl text-sm font-medium focus:outline-none focus:border-karma focus:ring-1 focus:ring-karma disabled:bg-ink/5 disabled:cursor-not-allowed transition-all"
            />
            <button
              type="submit"
              disabled={!input.trim() || !canChat}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-karma text-ink rounded-xl disabled:opacity-40 disabled:bg-ink/20 transition-all hover:scale-105 active:scale-95"
            >
              <Send size={16} className={input.trim() && canChat ? "ml-0.5" : ""} />
            </button>
          </form>
        </div>
      </div>
      
      {/* Overlay for mobile sidebar */}
      {showSidebar && (
        <div 
          className="fixed inset-0 bg-ink/50 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}
    </div>
  );
};
