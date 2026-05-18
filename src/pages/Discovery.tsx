import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, SlidersHorizontal, Users, Book as BookIcon, BookOpen, Radio, Clock, Lock, X, Plus, Star } from 'lucide-react';
import { useStore } from '../store/useStore';
import type { User, Room } from '../mockData';
import { mockRooms } from '../mockData';
import toast from 'react-hot-toast';

// Karma threshold required to create a room
const ROOM_CREATION_KARMA_THRESHOLD = 75;

export const Discovery: React.FC = () => {
  const { books, user, searchUsers, setViewedUser, setActiveTab, setSelectedBook } = useStore();
  const [tempo, setTempo] = useState<number>(50);
  const [depth, setDepth] = useState<number>(50);
  const [searchTab, setSearchTab] = useState<'books' | 'users' | 'rooms'>('books');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [rooms, setRooms] = useState<Room[]>(mockRooms);
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [newRoom, setNewRoom] = useState({ title: '', type: 'Sessiz Okuma' as Room['type'], time: '', maxParticipants: 20 });
  const [joinedRooms, setJoinedRooms] = useState<Set<string>>(new Set());

  // Debounced user search
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchTab === 'users' && searchQuery.trim().length > 2) {
        const results = await searchUsers(searchQuery);
        setSearchResults(results.filter(u => u.id !== user.id));
      } else {
        setSearchResults([]);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery, searchTab, searchUsers, user.id]);

  // Filter books by title/author OR mood sliders
  const filteredBooks = books.filter(b => {
    if (b.ownerId === user.id) return false;
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      return b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q);
    }
    let paceMatch = false;
    if (b.pace === 'Slow' && tempo <= 40) paceMatch = true;
    else if (b.pace === 'Medium' && tempo > 30 && tempo < 70) paceMatch = true;
    else if (b.pace === 'Fast' && tempo >= 60) paceMatch = true;
    let depthMatch = false;
    if (b.depth === 'Low' && depth <= 40) depthMatch = true;
    else if (b.depth === 'Medium' && depth > 30 && depth < 70) depthMatch = true;
    else if (b.depth === 'High' && depth >= 60) depthMatch = true;
    return paceMatch && depthMatch;
  });

  const canCreateRoom = user.karma.total >= ROOM_CREATION_KARMA_THRESHOLD;

  const handleCreateRoom = () => {
    if (!canCreateRoom) {
      toast.error(`Oda kurabilmek için en az ${ROOM_CREATION_KARMA_THRESHOLD} Karma gerekiyor!`);
      return;
    }
    setShowCreateRoom(true);
  };

  const handleSubmitRoom = () => {
    if (!newRoom.title.trim()) {
      toast.error('Oda adı boş bırakılamaz.');
      return;
    }
    const created: Room = {
      id: `room_${Date.now()}`,
      title: newRoom.title,
      hostName: user.name,
      hostAvatar: user.avatar,
      participants: 1,
      maxParticipants: newRoom.maxParticipants,
      time: newRoom.time || 'Şu an',
      isLive: !newRoom.time,
      type: newRoom.type,
    };
    setRooms(prev => [created, ...prev]);
    setShowCreateRoom(false);
    setNewRoom({ title: '', type: 'Sessiz Okuma', time: '', maxParticipants: 20 });
    toast.success('Odanız başarıyla oluşturuldu!');
  };

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } },
  };

  return (
    <motion.div className="p-6 pb-28 space-y-8" variants={container} initial="hidden" animate="show">
      <motion.header variants={item}>
        <h1 className="text-3xl font-serif text-ink tracking-tight">Keşfet</h1>
        <p className="text-ink/60 mt-2 font-sans text-sm">Ruh haline uygun yeni sayfalar bul.</p>
      </motion.header>



      {/* Search + Tabs Card */}
      <motion.section variants={item} className="bg-white p-6 rounded-3xl shadow-sm border border-ink/5 space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-parchment-dark/30 rounded-bl-full -mr-10 -mt-10" />

        {/* Search Input */}
        <div className="relative z-10 flex items-center gap-3 border-b border-ink/10 pb-4">
          <Search className="text-ink/40 flex-shrink-0" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder={
              searchTab === 'books'
                ? 'Kitap adı veya yazar ara...'
                : searchTab === 'users'
                ? 'Hangi okuru arıyorsun?'
                : 'Oda ara...'
            }
            className="bg-transparent border-none outline-none w-full text-ink placeholder:text-ink/40 font-serif text-base"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="text-ink/30 hover:text-ink flex-shrink-0 transition-colors">
              <X size={16} />
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="relative z-10 flex p-1 bg-parchment-dark/50 rounded-xl overflow-x-auto hide-scrollbar">
          {(['books', 'users', 'rooms'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => { setSearchTab(tab); setSearchQuery(''); }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[11px] font-bold rounded-lg transition-all duration-200 ${
                searchTab === tab ? 'bg-white shadow-sm text-ink' : 'text-ink/60 hover:text-ink'
              }`}
            >
              {tab === 'books' && <><BookIcon size={13} /> Kitaplar</>}
              {tab === 'users' && <><Users size={13} /> Okurlar</>}
              {tab === 'rooms' && <><BookOpen size={13} /> Odalar</>}
            </button>
          ))}
        </div>

        {/* Books: Mood Sliders (hidden when typing) */}
        {searchTab === 'books' && !searchQuery && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative z-10 space-y-4">
            <h3 className="font-serif text-sm font-bold flex items-center gap-2">
              <SlidersHorizontal size={14} className="text-karma" />
              Ruh Haline Göre Ara
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-ink/60 font-medium">
                <span>Yavaş & Sakin</span>
                <span className="text-karma font-bold">Tempo</span>
                <span>Hızlı & Akıcı</span>
              </div>
              <input type="range" min="0" max="100" value={tempo} onChange={e => setTempo(parseInt(e.target.value))}
                className="w-full h-1.5 bg-parchment-dark rounded-lg appearance-none cursor-pointer accent-karma" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-ink/60 font-medium">
                <span>Hafif Okuma</span>
                <span className="text-karma font-bold">Derinlik</span>
                <span>Felsefi & Yoğun</span>
              </div>
              <input type="range" min="0" max="100" value={depth} onChange={e => setDepth(parseInt(e.target.value))}
                className="w-full h-1.5 bg-parchment-dark rounded-lg appearance-none cursor-pointer accent-karma" />
            </div>
          </motion.div>
        )}
      </motion.section>

      {/* Results */}
      {searchTab === 'books' && (
        <motion.section variants={item} className="space-y-4">
          <h2 className="font-serif text-xl">
            {searchQuery ? `"${searchQuery}" için sonuçlar` : 'Senin İçin Seçilenler'}
          </h2>
          <div className="space-y-4">
            {filteredBooks.length > 0 ? (
              filteredBooks.map(book => (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={() => { setSelectedBook(book.id); setActiveTab('bookDetail'); }}
                  className="flex gap-4 p-3 bg-white rounded-2xl shadow-sm border border-ink/5 hover:shadow-md transition-shadow cursor-pointer group"
                >
                  <div className="w-20 h-28 rounded-lg overflow-hidden bg-parchment-dark flex-shrink-0">
                    <img src={book.cover} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="flex flex-col justify-center flex-grow py-1">
                    <h3 className="font-serif font-bold text-base leading-tight mb-0.5">{book.title}</h3>
                    <p className="text-xs text-ink/60 mb-2">{book.author}</p>
                    <div className="flex gap-2 flex-wrap">
                      <span className="text-[10px] px-2 py-0.5 bg-parchment-light text-ink/70 rounded border border-ink/10">{book.pace} Tempo</span>
                      <span className="text-[10px] px-2 py-0.5 bg-parchment-light text-ink/70 rounded border border-ink/10">{book.depth} Derinlik</span>
                      {book.isLegendary && (
                        <span className="text-[10px] px-2 py-0.5 bg-karma/20 text-karma rounded border border-karma/20 font-bold">🔥 Efsanevi</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="py-12 px-6 flex flex-col items-center justify-center text-center bg-white/50 rounded-3xl border border-ink/5 border-dashed"
              >
                <div className="w-16 h-16 rounded-full bg-parchment flex items-center justify-center mb-4">
                  <Search size={24} className="text-ink/20" />
                </div>
                <p className="font-serif text-lg text-ink/80 mb-2">
                  {searchQuery ? 'Kitap bulunamadı.' : 'Bu derinlikte kimse yok...'}
                </p>
                <p className="text-xs text-ink/50 max-w-[200px]">
                  {searchQuery ? 'Farklı bir başlık veya yazar adı dene.' : 'Farklı bir tempo veya derinlik arayarak keşfet.'}
                </p>
              </motion.div>
            )}
          </div>
        </motion.section>
      )}

      {searchTab === 'users' && (
        <motion.section variants={item} className="space-y-4">
          <h2 className="font-serif text-xl">Okur Sonuçları</h2>
          <div className="space-y-3">
            {searchResults.length > 0 ? (
              searchResults.map(resultUser => (
                <motion.div
                  key={resultUser.id}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  onClick={() => { setViewedUser(resultUser); setActiveTab('publicProfile'); }}
                  className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm border border-ink/5 hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-parchment-dark border border-ink/10 flex-shrink-0">
                    <img src={resultUser.avatar || 'https://i.pravatar.cc/150'} alt={resultUser.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-grow">
                    <h3 className="font-serif font-bold text-ink">{resultUser.name}</h3>
                    <p className="text-xs text-ink/60">Karma: {resultUser.karma?.total || 0}</p>
                  </div>
                  <div className="text-karma"><Users size={18} /></div>
                </motion.div>
              ))
            ) : (
              <div className="py-12 px-6 flex flex-col items-center justify-center text-center bg-white/50 rounded-3xl border border-ink/5 border-dashed">
                <div className="w-16 h-16 rounded-full bg-parchment flex items-center justify-center mb-4 text-ink/20"><Users size={24} /></div>
                <p className="font-serif text-lg text-ink/80 mb-2">{searchQuery.length > 2 ? 'Okur bulunamadı.' : 'Aramak için isim girin...'}</p>
              </div>
            )}
          </div>
        </motion.section>
      )}

      {searchTab === 'rooms' && (
        <motion.section variants={item} className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-xl">Okuma Odaları</h2>
              <p className="text-[10px] text-ink/50 mt-0.5">En az <span className="font-bold text-karma">{ROOM_CREATION_KARMA_THRESHOLD} Karma</span> ile oda kurabilirsin.</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-karma bg-karma/10 px-2 py-1 rounded-full border border-karma/20 uppercase tracking-widest">
                {rooms.filter(r => r.isLive).length} Canlı
              </span>
              <button
                onClick={handleCreateRoom}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${
                  canCreateRoom
                    ? 'bg-ink text-parchment-light shadow-md shadow-ink/20 hover:bg-ink/90'
                    : 'bg-ink/10 text-ink/40 cursor-not-allowed'
                }`}
              >
                <Plus size={14} />
                Oda Kur
              </button>
            </div>
          </div>

          {/* Karma requirement badge */}
          {!canCreateRoom && (
            <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-3">
              <div className="text-amber-500"><Star size={18} fill="currentColor" /></div>
              <div>
                <p className="text-xs font-bold text-amber-800">Karma Yetersiz</p>
                <p className="text-[10px] text-amber-600">
                  Oda kurabilmek için {ROOM_CREATION_KARMA_THRESHOLD} Karma gerekiyor. Mevcut karman: <span className="font-bold">{user.karma.total}</span>.
                  Daha fazla takas yap ve Scriptum bırak!
                </p>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {rooms
              .filter(r => !searchQuery || r.title.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((room, idx) => (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.07 }}
                className={`p-4 rounded-2xl border shadow-sm relative overflow-hidden ${
                  room.isLive ? 'bg-ink text-parchment-light border-karma/30' : 'bg-white border-ink/5'
                }`}
              >
                {room.isLive && <div className="absolute top-0 right-0 w-24 h-24 bg-karma/10 rounded-bl-full -mr-4 -mt-4" />}
                <div className="flex items-start gap-3 relative z-10">
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-karma/30 flex-shrink-0">
                    <img src={room.hostAvatar} alt={room.hostName} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-grow min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className={`font-serif font-bold text-sm leading-tight ${room.isLive ? 'text-parchment-light' : 'text-ink'}`}>{room.title}</h3>
                      {room.isLive && (
                        <span className="flex items-center gap-1 text-[9px] font-bold text-karma bg-karma/20 px-2 py-0.5 rounded-full flex-shrink-0">
                          <Radio size={8} className="animate-pulse" /> CANLI
                        </span>
                      )}
                    </div>
                    <p className={`text-[10px] mt-0.5 truncate ${room.isLive ? 'text-parchment-light/60' : 'text-ink/50'}`}>
                      {room.hostName} • {room.type}
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-3">
                        <span className={`text-[10px] font-bold flex items-center gap-1 ${room.isLive ? 'text-parchment-light/70' : 'text-ink/60'}`}>
                          <Users size={11} /> {room.participants}/{room.maxParticipants}
                        </span>
                        <span className={`text-[10px] font-bold flex items-center gap-1 ${room.isLive ? 'text-karma' : 'text-ink/60'}`}>
                          <Clock size={11} /> {room.time}
                        </span>
                      </div>
                      <button
                        className={`text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all active:scale-95 flex items-center gap-1 flex-shrink-0 ${
                          room.participants >= room.maxParticipants
                            ? 'bg-ink/20 text-ink/40 cursor-not-allowed'
                            : room.isLive
                            ? 'bg-karma text-ink shadow-karma/30 shadow-md'
                            : 'bg-ink text-parchment-light'
                        }`}
                        disabled={room.participants >= room.maxParticipants}
                        onClick={() => {
                          if (joinedRooms.has(room.id)) {
                            toast('Bu etkinliğe zaten katıldınız.', { icon: 'ℹ️' });
                            return;
                          }
                          if (room.participants < room.maxParticipants) {
                            setJoinedRooms(prev => {
                              const newSet = new Set(prev);
                              newSet.add(room.id);
                              return newSet;
                            });
                            setRooms(prev => prev.map(r => r.id === room.id ? { ...r, participants: r.participants + 1 } : r));
                            toast.success(`"${room.title}" odasına katıldınız! Etkinlik: ${room.time}`);
                          }
                        }}
                      >
                        {joinedRooms.has(room.id) ? <><Lock size={10} /> Katıldın</> : room.participants >= room.maxParticipants ? <><Lock size={10} /> Dolu</> : room.isLive ? 'Katıl' : 'Kaydol'}
                      </button>
                    </div>
                    <div className="mt-2 h-1.5 rounded-full bg-ink/10 overflow-hidden">
                      <div className="h-full rounded-full bg-karma transition-all" style={{ width: `${(room.participants / room.maxParticipants) * 100}%` }} />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      {/* Create Room Modal */}
      <AnimatePresence>
        {showCreateRoom && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-ink/60 backdrop-blur-sm z-50 flex items-end justify-center p-4"
            onClick={() => setShowCreateRoom(false)}
          >
            <motion.div
              initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="w-full max-w-md bg-parchment-light rounded-3xl p-6 space-y-4 shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <h2 className="font-serif text-xl font-bold text-ink">Yeni Oda Kur</h2>
                <button onClick={() => setShowCreateRoom(false)} className="text-ink/40 hover:text-ink transition-colors">
                  <X size={22} />
                </button>
              </div>

              <div className="flex items-center gap-2 bg-karma/10 rounded-xl p-2.5 border border-karma/20">
                <Star size={14} className="text-karma flex-shrink-0" fill="currentColor" />
                <p className="text-[11px] text-ink/70">
                  Karma: <span className="font-bold text-karma">{user.karma.total}</span> — Oda kurma yetkisi aktif ✓
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-ink/60 uppercase tracking-wider mb-1">Oda Adı *</label>
                  <input
                    type="text"
                    value={newRoom.title}
                    onChange={e => setNewRoom(p => ({ ...p, title: e.target.value }))}
                    placeholder="Örn: Cumartesi Sabahı Sessizliği"
                    className="w-full bg-white border border-ink/10 py-3 px-4 rounded-xl text-ink font-medium focus:outline-none focus:border-karma transition-all text-sm"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-ink/60 uppercase tracking-wider mb-1">Oda Türü</label>
                  <select
                    value={newRoom.type}
                    onChange={e => setNewRoom(p => ({ ...p, type: e.target.value as Room['type'] }))}
                    className="w-full bg-white border border-ink/10 py-3 px-4 rounded-xl text-ink font-medium focus:outline-none focus:border-karma transition-all text-sm appearance-none"
                  >
                    <option value="Sessiz Okuma">📖 Sessiz Okuma</option>
                    <option value="Felsefe Tartışması">🧠 Felsefe Tartışması</option>
                    <option value="Gece Okuması">🌙 Gece Okuması</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-ink/60 uppercase tracking-wider mb-1">Başlangıç (boş = canlı)</label>
                    <input
                      type="time"
                      value={newRoom.time}
                      onChange={e => setNewRoom(p => ({ ...p, time: e.target.value }))}
                      className="w-full bg-white border border-ink/10 py-3 px-4 rounded-xl text-ink font-medium focus:outline-none focus:border-karma transition-all text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-ink/60 uppercase tracking-wider mb-1">Maks. Katılımcı</label>
                    <input
                      type="number"
                      min={2} max={100}
                      value={newRoom.maxParticipants}
                      onChange={e => setNewRoom(p => ({ ...p, maxParticipants: parseInt(e.target.value) || 20 }))}
                      className="w-full bg-white border border-ink/10 py-3 px-4 rounded-xl text-ink font-medium focus:outline-none focus:border-karma transition-all text-sm"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleSubmitRoom}
                className="w-full bg-ink text-parchment-light py-3.5 rounded-xl font-bold shadow-lg shadow-ink/20 hover:bg-ink/90 transition-all active:scale-[0.98]"
              >
                Odayı Oluştur
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
