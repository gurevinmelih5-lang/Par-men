import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, PolarRadiusAxis } from 'recharts';
import { useStore } from '../store/useStore';
import { Shield, BookOpen, MessageSquare, Award, Plus, MapPin, Edit2, Trash2, Moon, Sun, Camera, ArrowRightLeft, Clock, X, Users, ChevronRight, CheckCircle, XCircle, HelpCircle, LogOut } from 'lucide-react';
import { AddBookModal } from '../components/AddBookModal';
import { EditBookModal } from '../components/EditBookModal';
import { UserManual } from '../components/UserManual';
import { SwapTableModal } from '../components/SwapTableModal';
import { getCurrentLocation } from '../lib/location';
import imageCompression from 'browser-image-compression';
import { supabase } from '../lib/supabase';
import { compressImage } from '../lib/image';
import toast from 'react-hot-toast';
import { translateCondition } from '../lib/translations';
import { useNavigate } from 'react-router-dom';

export const Profile: React.FC = () => {
  const { user, books, incomingRequests, respondToSwapRequest, deleteBook, updateLocation, theme, setTheme, requestedSwaps, setViewedUser, openSwapChats, openSwapChatById, setActiveSwapChat } = useStore();
  const navigate = useNavigate();
  const [cancelledSwaps, setCancelledSwaps] = React.useState<string[]>([]);
  const [accountEmail, setAccountEmail] = React.useState<string | null>(null);

  // Books user has sent swap requests for (that haven't been cancelled locally)
  const pendingBooks = books.filter(
    b => requestedSwaps.includes(b.id) && !cancelledSwaps.includes(b.id)
  );
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<any>(null);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const myBooks = books.filter(b => b.ownerId === user.id);

  React.useEffect(() => {
    void supabase.auth.getSession().then(({ data: { session } }) => {
      setAccountEmail(session?.user?.email ?? null);
    });
  }, []);

  const handleLogout = async () => {
    toast((t) => (
      <div>
        <p className="text-sm font-medium mb-3">Çıkış yapmak istediğinize emin misiniz?</p>
        <div className="flex gap-2">
          <button onClick={async () => {
            toast.dismiss(t.id);
            const { error } = await supabase.auth.signOut();
            if (error) {
              toast.error('Çıkış yapılamadı. Tekrar dene.');
              return;
            }
            setActiveSwapChat(null);
            navigate('/');
            toast.success('Güvenle çıkış yaptın.');
          }} className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold">Evet, Çıkış Yap</button>
          <button onClick={() => toast.dismiss(t.id)} className="bg-ink/10 px-3 py-1.5 rounded-lg text-xs font-bold text-ink">İptal</button>
        </div>
      </div>
    ), { duration: Infinity, style: { background: '#fff', color: '#1A202C' } });
  };

  const handleUpdateLocation = async () => {
    try {
      setIsUpdatingLocation(true);
      const coords = await getCurrentLocation();
      await updateLocation(coords.lat, coords.lng);
      toast.success('Konumunuz başarıyla güncellendi!');
    } catch (error) {
      toast.error('Konum alınamadı. Lütfen tarayıcı izinlerini kontrol edin.');
    } finally {
      setIsUpdatingLocation(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Bu kitabı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.")) {
      try {
        await deleteBook(id);
        toast.success("Kitap başarıyla silindi.");
      } catch (err) {
        toast.error("Kitap silinirken bir hata oluştu.");
      }
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        setIsUploadingAvatar(true);
        const compressed = await compressImage(file, { maxSizeMB: 0.5, maxWidthOrHeight: 400 });
        await useStore.getState().updateUserAvatar(compressed);
      } catch (error) {
        console.error('Avatar upload error:', error);
      } finally {
        setIsUploadingAvatar(false);
      }
    }
  };

  const data = [
    { subject: 'Fiziksel Kondisyon', A: user.karma.physical, fullMark: 100 },
    { subject: 'Entelektüel Katkı', A: user.karma.intellectual, fullMark: 100 },
    { subject: 'Sosyal Güvenilirlik', A: user.karma.social, fullMark: 100 },
  ];

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  const maxKarma = Math.max(user.karma.physical, user.karma.intellectual, user.karma.social);
  let title = "Okur";
  if (user.karma.total >= 80) title = "Mühürlü Okur";
  else if (maxKarma === user.karma.intellectual) title = "Filozof";
  else if (maxKarma === user.karma.physical) title = "Arşivci";
  else if (maxKarma === user.karma.social) title = "Seyyah";

  return (
    <motion.div 
      className="px-4 pt-5 pb-28 space-y-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.header variants={item} className="flex justify-between items-start">
        <div>
        <h1 className="text-2xl sm:text-3xl font-serif text-ink tracking-tight">{user.name}</h1>
          <div className="flex gap-2 items-center mt-2 flex-wrap">
            <div className={`inline-block text-ink text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-sm ${user.karma.total >= 80 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white' : 'bg-karma'}`}>
              {title}
            </div>
            {user.karma.total >= 80 && (
              <button
                onClick={() => setTheme(theme === 'gold' ? 'light' : 'gold')}
                className="flex items-center gap-1 text-[10px] bg-ink text-parchment-light px-2 py-1 rounded-full font-bold hover:bg-ink/80 transition-colors shadow-sm"
              >
                {theme === 'gold' ? <Sun size={12} /> : <Moon size={12} />}
                {theme === 'gold' ? 'Aydınlık' : 'Altın Tema'}
              </button>
            )}
            <button 
              onClick={handleUpdateLocation}
              disabled={isUpdatingLocation}
              className="flex items-center gap-1 text-[10px] bg-white border border-ink/10 px-2 py-1 rounded-full font-bold text-ink/70 hover:bg-parchment transition-colors active:scale-95"
            >
              <MapPin size={12} className={isUpdatingLocation ? "animate-bounce text-karma" : ""} />
              {isUpdatingLocation ? 'Alınıyor...' : (user.lat ? 'Konum' : 'Konum Ekle')}
            </button>
            <button 
              onClick={() => setIsManualOpen(true)}
              className="flex items-center gap-1 text-[10px] bg-white border border-ink/10 px-2 py-1 rounded-full font-bold text-ink/70 hover:bg-parchment transition-colors active:scale-95"
            >
              <HelpCircle size={12} />
              Rehber
            </button>
          </div>
        </div>
        <div className="relative group cursor-pointer">
          <div className="flex flex-col items-center">
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              className={`relative w-28 h-28 rounded-full border-4 mb-4 ${isGold ? 'border-karma shadow-[0_0_15px_rgba(212,175,55,0.5)]' : 'border-white shadow-md'}`}
            >
              <div className="w-full h-full rounded-full overflow-hidden bg-parchment-dark group">
                <img src={user.avatar} alt={user.name} className={`w-full h-full object-cover transition-opacity ${isUploadingAvatar ? 'opacity-50' : 'group-hover:opacity-80'}`} />
                <label className="absolute inset-0 flex items-center justify-center bg-ink/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera size={24} className="text-white" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={isUploadingAvatar} />
                </label>
              </div>
            </motion.div>
          </div>
          {/* Decorative badge background */}
          <div className="absolute inset-0 bg-karma/20 scale-125 rounded-full animate-pulse -z-10" />
          <input 
            type="file" 
            ref={fileInputRef} 
            accept="image/*" 
            className="hidden" 
            onChange={handleAvatarUpload} 
          />
        </div>
      </motion.header>

      {/* Karma Decay Warning */}
      <motion.div 
        variants={item} 
        onClick={() => navigate('/discovery')}
        className="bg-orange-50 border border-orange-200 p-3 rounded-xl flex items-center justify-between shadow-sm cursor-pointer hover:bg-orange-100 transition-colors group relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-orange-400/0 via-orange-400/10 to-orange-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
        <div className="flex items-center gap-2 relative z-10">
          <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
          <p className="text-xs font-bold text-orange-800">Ekosistem Canlılığı Düşüyor</p>
        </div>
        <div className="flex items-center gap-2 relative z-10">
          <p className="text-[10px] font-medium text-orange-700/80 group-hover:text-orange-800 transition-colors">Karmanı korumak için takas yap.</p>
          <div className="w-5 h-5 rounded-full bg-orange-200 flex items-center justify-center text-orange-800 group-hover:bg-orange-300 transition-colors shadow-sm">
            <span className="text-[10px] font-bold">→</span>
          </div>
        </div>
      </motion.div>

      {/* Karma Score Card */}
      <motion.section variants={item} className="bg-ink text-parchment-light p-6 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-karma/10 rounded-bl-full -mr-10 -mt-10" />
        
        <div className="relative z-10 flex items-center justify-between mb-2">
          <h2 className="font-serif text-xl text-karma flex items-center gap-2">
            <Award size={24} />
            Parşömen Kalitesi
          </h2>
          <span className="text-4xl font-serif font-bold text-parchment-light">{user.karma.total}</span>
        </div>

        <div style={{ width: '100%', height: 256 }} className="-ml-4 relative z-10">
          <ResponsiveContainer width="100%" height={256}>
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
              <PolarGrid stroke="#F5F0E6" strokeOpacity={0.2} />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#F5F0E6', fontSize: 11, opacity: 0.9 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar name="Karma" dataKey="A" stroke="#D4AF37" strokeWidth={2} fill="#D4AF37" fillOpacity={0.4} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </motion.section>

      {/* Detail Stats */}
      <motion.section variants={item} className="grid grid-cols-2 gap-3">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-ink/5">
          <div className="flex items-center gap-2 text-ink/60 mb-2">
            <Shield size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">Kondisyon</span>
          </div>
          <p className="font-serif text-3xl font-bold text-ink">{user.karma.physical}</p>
          <p className="text-[10px] text-ink/50 mt-1">Kitaplarına ne kadar iyi bakıyorsun.</p>
        </div>
        
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-ink/5">
          <div className="flex items-center gap-2 text-ink/60 mb-2">
            <MessageSquare size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">Katkı</span>
          </div>
          <p className="font-serif text-3xl font-bold text-ink">{user.karma.intellectual}</p>
          <p className="text-[10px] text-ink/50 mt-1">Scriptum'larının kalitesi ve etkisi.</p>
        </div>
        
        <div className="col-span-2 bg-white p-4 rounded-2xl shadow-sm border border-ink/5 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-ink/60 mb-1">
              <BookOpen size={16} />
              <span className="text-xs font-bold uppercase tracking-wider">Takas Sayısı</span>
            </div>
            <p className="font-serif text-2xl font-bold text-ink">42 Kitap</p>
          </div>
          <button 
            onClick={() => setIsBookModalOpen(true)}
            className="w-12 h-12 rounded-full bg-karma text-ink flex items-center justify-center shadow-lg shadow-karma/30 hover:bg-karma/90 transition-transform active:scale-95"
          >
            <Plus size={24} />
          </button>
        </div>
      </motion.section>

      {/* Incoming Requests */}
      {incomingRequests && incomingRequests.length > 0 && (
        <motion.section variants={item} className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-serif text-xl">Gelen Takas İstekleri</h2>
            <span className="text-xs text-red-500 font-bold bg-red-50 border border-red-200 px-2 py-1 rounded-full animate-pulse">
              {incomingRequests.length} Yeni
            </span>
          </div>
          <div className="space-y-3">
            {incomingRequests.map(req => {
              const requestedBook = books.find(b => b.id === req.bookId);
              const requesterUser = { 
                id: req.requesterId, 
                name: req.requesterName, 
                avatar: req.requesterAvatar,
                karma: { physical: 70, intellectual: 65, social: 90, total: 75 }
              };
              return (
                <motion.div
                  key={req.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl shadow-sm border border-red-100 overflow-hidden"
                >
                  {/* Header: requester info */}
                  <div className="flex items-center gap-3 p-4 border-b border-ink/5">
                    <button
                      onClick={() => { setViewedUser(requesterUser as any); navigate(`/public-profile/${requesterUser?.id}`); }}
                      className="relative flex-shrink-0 group"
                      title="Profili Görüntüle"
                    >
                      <img
                        src={req.requesterAvatar}
                        alt={req.requesterName}
                        className="w-11 h-11 rounded-full border-2 border-karma/30 object-cover group-hover:border-karma transition-colors"
                      />
                      <div className="absolute inset-0 rounded-full bg-ink/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Users size={14} className="text-white" />
                      </div>
                    </button>
                    <div className="flex-grow min-w-0">
                      <button
                        onClick={() => { setViewedUser(requesterUser as any); navigate(`/public-profile/${requesterUser?.id}`); }}
                        className="font-bold text-sm text-ink hover:text-karma transition-colors text-left"
                      >
                        {req.requesterName}
                      </button>
                      <p className="text-[11px] text-ink/50">"{req.bookTitle}" kitabını takaslamak istiyor</p>
                    </div>
                    <span className="text-[9px] font-bold bg-orange-50 text-orange-500 border border-orange-200 px-2 py-0.5 rounded-full flex-shrink-0">
                      BEKLEMEDE
                    </span>
                  </div>

                  {/* Book preview */}
                  {requestedBook && (
                    <div
                      className="flex items-center gap-3 px-4 py-3 bg-parchment-light/50 cursor-pointer hover:bg-parchment-light transition-colors"
                      onClick={() => { navigate(`/book/${requestedBook.id}`); }}
                    >
                      <div className="w-10 h-14 rounded-lg overflow-hidden bg-parchment-dark flex-shrink-0 shadow-sm">
                        <img src={requestedBook.cover} alt={requestedBook.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-ink truncate">{requestedBook.title}</p>
                        <p className="text-[10px] text-ink/50 truncate">{requestedBook.author}</p>
                        <span className="text-[9px] px-2 py-0.5 bg-white rounded border border-ink/10 text-ink/60 mt-0.5 inline-block">{requestedBook.condition}</span>
                      </div>
                      <div className="ml-auto text-ink/20">
                        <ChevronRight size={16} />
                      </div>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex gap-2 p-3">
                    <button
                      onClick={() => setSelectedRequest(req)}
                      className="flex-1 bg-ink text-white py-2.5 rounded-xl text-xs font-bold hover:bg-ink/80 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle size={14} /> İncele ve Kabul Et
                    </button>
                    <button
                      onClick={() => respondToSwapRequest(req.id, false)}
                      className="flex-1 bg-red-50 text-red-600 border border-red-200 py-2.5 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <XCircle size={14} /> Reddet
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.section>
      )}

      {openSwapChats.length > 0 && (
        <motion.section variants={item} className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-serif text-xl flex items-center gap-2">
              <MessageSquare size={18} className="text-green-600" />
              Onaylı takas sohbetleri
            </h2>
            <span className="text-xs font-bold bg-green-50 text-green-700 px-2 py-1 rounded-full border border-green-200">
              {openSwapChats.length} açık
            </span>
          </div>
          <p className="text-[11px] text-ink/50 -mt-2">Taraflardan biri sohbeti sonlandırana kadar mesajlaşabilirsiniz.</p>
          <div className="space-y-2">
            {openSwapChats.map((s) => (
              <button
                key={s.swapId}
                type="button"
                onClick={async () => {
                  await openSwapChatById(s.swapId);
                  navigate(`/chat/${s.swapId}`);
                }}
                className="w-full flex items-center gap-3 p-3 bg-white rounded-2xl shadow-sm border border-green-100 text-left hover:border-green-200 transition-colors"
              >
                <div className="w-10 h-14 rounded-lg overflow-hidden bg-parchment-dark flex-shrink-0 shadow-sm">
                  {s.bookCover ? (
                    <img src={s.bookCover} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-parchment-light">
                      <BookOpen size={16} className="text-ink/30" />
                    </div>
                  )}
                </div>
                <div className="flex-grow min-w-0">
                  <p className="text-xs font-bold text-ink truncate">{s.bookTitle}</p>
                  <p className="text-[10px] text-ink/50 truncate">{s.peerName} ile sohbet</p>
                </div>
                <img src={s.peerAvatar} alt="" className="w-9 h-9 rounded-full object-cover border border-ink/10 flex-shrink-0" />
                <ChevronRight size={16} className="text-ink/25 flex-shrink-0" />
              </button>
            ))}
          </div>
        </motion.section>
      )}

      {/* Outgoing / Pending Swap Requests */}
      {pendingBooks.length > 0 && (
        <motion.section variants={item} className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-serif text-xl flex items-center gap-2">
              <ArrowRightLeft size={18} className="text-karma" />
              Takas Bekleyen
            </h2>
            <span className="text-xs font-bold bg-karma/20 text-karma px-2 py-1 rounded-full border border-karma/20">
              {pendingBooks.length} İstek
            </span>
          </div>

          <div className="space-y-3">
            {pendingBooks.map(book => (
              <motion.div
                key={book.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -40 }}
                className="flex gap-3 p-3 bg-white rounded-2xl shadow-sm border border-karma/10 relative overflow-hidden"
              >
                {/* Subtle karma shimmer */}
                <div className="absolute top-0 left-0 w-1 h-full bg-karma rounded-l-2xl" />

                <div
                  className="w-14 h-20 rounded-xl overflow-hidden bg-parchment-dark flex-shrink-0 cursor-pointer"
                  onClick={() => { navigate(`/book/${book.id}`); }}
                >
                  <img src={book.cover} alt={book.title} className="w-full h-full object-cover" />
                </div>

                <div className="flex flex-col flex-grow min-w-0 py-0.5">
                  <h3
                    className="font-serif font-bold text-sm leading-tight truncate cursor-pointer hover:text-karma transition-colors"
                    onClick={() => { navigate(`/book/${book.id}`); }}
                  >
                    {book.title}
                  </h3>
                  <p className="text-[11px] text-ink/50 truncate mb-1">{book.author}</p>
                  <div className="flex items-center gap-1.5 mt-auto">
                    <Clock size={11} className="text-karma/70" />
                    <span className="text-[10px] text-karma font-bold">Yanıt Bekleniyor</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[10px] px-2 py-0.5 bg-parchment-light rounded border border-ink/10 text-ink/60">{translateCondition(book.condition || '')}</span>
                    <span className="text-[10px] text-ink/40">{book.distance} km uzakta</span>
                  </div>
                </div>

                {/* Cancel button */}
                <button
                  onClick={() => setCancelledSwaps(prev => [...prev, book.id])}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-ink/5 flex items-center justify-center text-ink/40 hover:bg-red-50 hover:text-red-500 transition-colors"
                  title="İsteği İptal Et"
                >
                  <X size={18} />
                </button>
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      {/* My Library */}
      <motion.section variants={item} className="space-y-4">
        <div className="flex justify-between items-end">
          <h2 className="font-serif text-xl">Kütüphanem</h2>
          <span className="text-xs text-karma font-medium">{myBooks.length} Kitap</span>
        </div>
        
        {myBooks.length === 0 ? (
          <div className="bg-white p-6 rounded-2xl border border-ink/5 text-center shadow-sm">
            <BookOpen size={32} className="mx-auto text-ink/20 mb-3" />
            <p className="text-sm font-medium text-ink/70">Henüz hiç kitap eklemedin.</p>
            <p className="text-xs text-ink/40 mt-1">Yukarıdaki artı butonundan ilk kitabını ekle.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {myBooks.map(book => (
              <div key={book.id} className="bg-white p-3 rounded-2xl shadow-sm border border-ink/5 flex flex-col">
                <div className="relative h-40 mb-3 rounded-xl overflow-hidden bg-parchment-dark">
                  <img src={book.cover} alt={book.title} className="w-full h-full object-cover opacity-90" />
                </div>
                <h3 className="font-serif font-bold text-sm leading-tight truncate">{book.title}</h3>
                <p className="text-xs text-ink/60 truncate mb-2">{book.author}</p>
                <div className="mt-auto flex justify-between items-center border-t border-ink/5 pt-2">
                  <span className="text-[10px] px-2 py-1 bg-parchment-light rounded text-ink/70 font-medium truncate max-w-[50%]">
                    {translateCondition(book.condition || '')}
                  </span>
                  <div className="flex gap-1">
                    <button 
                      onClick={() => setEditingBook(book)}
                      className="w-7 h-7 rounded-full bg-ink/5 text-ink flex items-center justify-center hover:bg-karma hover:text-white transition-colors"
                      title="Düzenle"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button 
                      onClick={() => handleDelete(book.id)}
                      className="w-7 h-7 rounded-full bg-ink/5 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-colors"
                      title="Sil"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.section>

      <motion.section variants={item} className="space-y-3">
        <h2 className="font-serif text-xl text-ink/90">Hesap</h2>
        <div className="bg-white rounded-2xl border border-ink/10 shadow-sm p-4 space-y-4">
          {accountEmail && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-ink/40 mb-1">Oturum e-postası</p>
              <p className="text-sm font-medium text-ink break-all">{accountEmail}</p>
            </div>
          )}
          <button
            type="button"
            onClick={() => void handleLogout()}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm font-bold hover:bg-red-100 transition-colors active:scale-[0.99]"
          >
            <LogOut size={18} />
            Çıkış yap
          </button>
        </div>
      </motion.section>

      <AddBookModal isOpen={isBookModalOpen} onClose={() => setIsBookModalOpen(false)} />
      <EditBookModal isOpen={!!editingBook} onClose={() => setEditingBook(null)} book={editingBook} />
      <UserManual isOpen={isManualOpen} onClose={() => setIsManualOpen(false)} />
      <SwapTableModal isOpen={!!selectedRequest} onClose={() => setSelectedRequest(null)} request={selectedRequest} />
    </motion.div>
  );
};
