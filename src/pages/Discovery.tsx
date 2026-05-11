import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, Users, Book as BookIcon, BookOpen, Radio, Clock, Lock } from 'lucide-react';
import { useStore } from '../store/useStore';
import type { User } from '../mockData';
import { mockRooms } from '../mockData';

export const Discovery: React.FC = () => {
  const { books, user, searchUsers, setViewedUser, setActiveTab } = useStore();
  const [tempo, setTempo] = useState<number>(50);
  const [depth, setDepth] = useState<number>(50);
  const [searchTab, setSearchTab] = useState<'books' | 'users' | 'rooms'>('books');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);

  useEffect(() => {
    const fetchUsers = async () => {
      if (searchTab === 'users' && searchQuery.trim().length > 2) {
        const results = await searchUsers(searchQuery);
        setSearchResults(results.filter(u => u.id !== user.id)); // Exclude self
      } else {
        setSearchResults([]);
      }
    };
    
    // Simple debounce
    const timer = setTimeout(() => {
      fetchUsers();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchQuery, searchTab, searchUsers, user.id]);

  const filteredBooks = books.filter(b => {
    if (b.ownerId === user.id) return false;
    
    // Pace map: Slow (0-40), Medium (30-70), Fast (60-100)
    let paceMatch = false;
    if (b.pace === 'Slow' && tempo <= 40) paceMatch = true;
    else if (b.pace === 'Medium' && tempo > 30 && tempo < 70) paceMatch = true;
    else if (b.pace === 'Fast' && tempo >= 60) paceMatch = true;

    // Depth map: Low (0-40), Medium (30-70), High (60-100)
    let depthMatch = false;
    if (b.depth === 'Low' && depth <= 40) depthMatch = true;
    else if (b.depth === 'Medium' && depth > 30 && depth < 70) depthMatch = true;
    else if (b.depth === 'High' && depth >= 60) depthMatch = true;

    // Show if both match, or if one matches closely
    return paceMatch && depthMatch;
  });

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      className="p-6 space-y-8"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.header variants={item}>
        <h1 className="text-3xl font-serif text-ink tracking-tight">Keşfet</h1>
        <p className="text-ink/60 mt-2 font-sans text-sm">Ruh haline uygun yeni sayfalar bul.</p>
      </motion.header>

      {/* Mood Search */}
      <motion.section variants={item} className="bg-white p-6 rounded-3xl shadow-sm border border-ink/5 space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-parchment-dark/30 rounded-bl-full -mr-10 -mt-10" />
        {/* Search Input */}
        <div className="relative z-10 flex items-center gap-3 border-b border-ink/10 pb-4">
          <Search className="text-ink/40" size={20} />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={searchTab === 'books' ? "Ne okumak istersin?" : "Hangi okuru arıyorsun?"} 
            className="bg-transparent border-none outline-none w-full text-ink placeholder:text-ink/40 font-serif text-lg"
          />
        </div>

        {/* Tabs */}
        <div className="relative z-10 flex p-1 bg-parchment-dark/50 rounded-xl mb-4">
          <button 
            onClick={() => setSearchTab('books')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-lg transition-colors ${searchTab === 'books' ? 'bg-white shadow-sm text-ink' : 'text-ink/60 hover:text-ink'}`}
          >
            <BookIcon size={16} /> Kitaplar
          </button>
          <button 
            onClick={() => setSearchTab('users')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-lg transition-colors ${searchTab === 'users' ? 'bg-white shadow-sm text-ink' : 'text-ink/60 hover:text-ink'}`}
          >
            <Users size={16} /> Okurlar
          </button>
          <button 
            onClick={() => setSearchTab('rooms')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-bold rounded-lg transition-colors ${searchTab === 'rooms' ? 'bg-white shadow-sm text-ink' : 'text-ink/60 hover:text-ink'}`}
          >
            <BookOpen size={16} /> Odalar
          </button>
        </div>

        {searchTab === 'books' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative z-10 space-y-5">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-serif text-sm font-bold flex items-center gap-2">
              <SlidersHorizontal size={14} className="text-karma" />
              Ruh Haline Göre Ara
            </h3>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-ink/60 font-medium">
              <span>Yavaş & Sakin</span>
              <span className="text-karma font-bold">Tempo</span>
              <span>Hızlı & Akıcı</span>
            </div>
            <input 
              type="range" 
              min="0" max="100" 
              value={tempo}
              onChange={(e) => setTempo(parseInt(e.target.value))}
              className="w-full h-1.5 bg-parchment-dark rounded-lg appearance-none cursor-pointer accent-karma"
            />
          </div>

          <div className="space-y-2 pt-2">
            <div className="flex justify-between text-xs text-ink/60 font-medium">
              <span>Hafif Okuma</span>
              <span className="text-karma font-bold">Derinlik</span>
              <span>Felsefi & Yoğun</span>
            </div>
            <input 
              type="range" 
              min="0" max="100" 
              value={depth}
              onChange={(e) => setDepth(parseInt(e.target.value))}
              className="w-full h-1.5 bg-parchment-dark rounded-lg appearance-none cursor-pointer accent-karma"
            />
          </div>

          <button onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })} className="w-full mt-4 bg-ink text-parchment-light py-3 rounded-xl font-medium shadow-md shadow-ink/20 hover:bg-ink/90 transition-all active:scale-[0.98]">
            Kitap Bul
          </button>
        </motion.div>
        )}
      </motion.section>

      {/* Results Section */}
      {searchTab === 'books' ? (
        <motion.section variants={item} className="space-y-4">
          <h2 className="font-serif text-xl">Senin İçin Seçilenler</h2>
          <div className="space-y-4">
            {filteredBooks.length > 0 ? (
              filteredBooks.map(book => (
                <motion.div 
                  key={book.id} 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex gap-4 p-3 bg-white rounded-2xl shadow-sm border border-ink/5 hover:shadow-md transition-shadow cursor-pointer group"
                >
                  <div className="w-20 h-28 rounded-lg overflow-hidden bg-parchment-dark flex-shrink-0">
                    <img src={book.cover} alt={book.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="flex flex-col justify-center flex-grow py-1">
                    <h3 className="font-serif font-bold text-base leading-tight mb-1">{book.title}</h3>
                    <p className="text-xs text-ink/60 mb-2">{book.author}</p>
                    
                    <div className="flex gap-2 mb-2">
                      <span className="text-[10px] px-2 py-0.5 bg-parchment-light text-ink/70 rounded border border-ink/10">
                        {book.pace} Tempo
                      </span>
                      <span className="text-[10px] px-2 py-0.5 bg-parchment-light text-ink/70 rounded border border-ink/10">
                        {book.depth} Derinlik
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="py-12 px-6 flex flex-col items-center justify-center text-center bg-white/50 rounded-3xl border border-ink/5 border-dashed"
              >
                <div className="w-16 h-16 rounded-full bg-parchment flex items-center justify-center mb-4">
                  <Search size={24} className="text-ink/20" />
                </div>
                <p className="font-serif text-lg text-ink/80 mb-2">Bu derinlikte kimse yok...</p>
                <p className="text-xs text-ink/50 font-sans max-w-[200px]">Farklı bir tempo veya derinlik arayarak Parşömen ağının diğer köşelerini keşfet.</p>
              </motion.div>
            )}
          </div>
        </motion.section>
      ) : searchTab === 'users' ? (
        <motion.section variants={item} className="space-y-4">
          <h2 className="font-serif text-xl">Okur Sonuçları</h2>
          <div className="space-y-3">
            {searchResults.length > 0 ? (
              searchResults.map(resultUser => (
                <motion.div
                  key={resultUser.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => {
                    setViewedUser(resultUser);
                    setActiveTab('publicProfile');
                  }}
                  className="flex items-center gap-4 p-4 bg-white rounded-2xl shadow-sm border border-ink/5 hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-parchment-dark border border-ink/10 flex-shrink-0">
                    <img src={resultUser.avatar || "https://i.pravatar.cc/150"} alt={resultUser.name} className="w-full h-full object-cover" />
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
                <p className="font-serif text-lg text-ink/80 mb-2">{searchQuery.length > 2 ? "Okur bulunamadı." : "Aramak için isim girin..."}</p>
              </div>
            )}
          </div>
        </motion.section>
      ) : (
        <motion.section variants={item} className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl">Okuma Odaları</h2>
            <span className="text-[10px] font-bold text-karma bg-karma/10 px-2 py-1 rounded-full border border-karma/20 uppercase tracking-widest">{mockRooms.filter(r => r.isLive).length} Canlı</span>
          </div>
          <div className="space-y-3">
            {mockRooms.map((room, idx) => (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.08 }}
                className={`p-4 rounded-2xl border shadow-sm relative overflow-hidden ${
                  room.isLive ? 'bg-ink text-parchment-light border-karma/30' : 'bg-white border-ink/5'
                }`}
              >
                {room.isLive && (
                  <div className="absolute top-0 right-0 w-24 h-24 bg-karma/10 rounded-bl-full -mr-4 -mt-4" />
                )}
                <div className="flex items-start gap-3 relative z-10">
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-karma/30 flex-shrink-0">
                    <img src={room.hostAvatar} alt={room.hostName} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className={`font-serif font-bold text-base leading-tight ${room.isLive ? 'text-parchment-light' : 'text-ink'}`}>{room.title}</h3>
                      {room.isLive && (
                        <span className="flex items-center gap-1 text-[9px] font-bold text-karma bg-karma/20 px-2 py-0.5 rounded-full">
                          <Radio size={8} className="animate-pulse" /> CANLI
                        </span>
                      )}
                    </div>
                    <p className={`text-[10px] mt-0.5 ${room.isLive ? 'text-parchment-light/60' : 'text-ink/50'}`}>
                      {room.hostName} tarafından • {room.type}
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
                        className={`text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all active:scale-95 flex items-center gap-1 ${
                          room.participants >= room.maxParticipants
                            ? 'bg-ink/20 text-ink/40 cursor-not-allowed'
                            : room.isLive
                            ? 'bg-karma text-ink shadow-karma/30 shadow-md'
                            : 'bg-ink text-parchment-light'
                        }`}
                        disabled={room.participants >= room.maxParticipants}
                      >
                        {room.participants >= room.maxParticipants ? <><Lock size={10} /> Dolu</> : room.isLive ? 'Katıl' : 'Kaydol'}
                      </button>
                    </div>
                    <div className="mt-2 h-1.5 rounded-full bg-ink/10 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-karma transition-all"
                        style={{ width: `${(room.participants / room.maxParticipants) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}
    </motion.div>
  );
};
