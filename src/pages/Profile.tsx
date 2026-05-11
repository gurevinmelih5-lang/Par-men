import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, PolarRadiusAxis } from 'recharts';
import { useStore } from '../store/useStore';
import { Shield, BookOpen, MessageSquare, Award, Plus, MapPin, Edit2, Trash2, Moon, Sun, Camera } from 'lucide-react';
import { AddBookModal } from '../components/AddBookModal';
import { EditBookModal } from '../components/EditBookModal';
import { getCurrentLocation } from '../lib/location';
import imageCompression from 'browser-image-compression';

export const Profile: React.FC = () => {
  const { user, books, incomingRequests, respondToSwapRequest, deleteBook, updateLocation, setActiveTab, theme, setTheme } = useStore();
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<any>(null);
  const [isUpdatingLocation, setIsUpdatingLocation] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const myBooks = books.filter(b => b.ownerId === user.id);

  const handleUpdateLocation = async () => {
    try {
      setIsUpdatingLocation(true);
      const coords = await getCurrentLocation();
      await updateLocation(coords.lat, coords.lng);
      alert('Konumunuz başarıyla güncellendi!');
    } catch (error) {
      alert('Konum alınamadı. Lütfen tarayıcı izinlerini kontrol edin.');
    } finally {
      setIsUpdatingLocation(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bu kitabı silmek istediğinize emin misiniz?')) {
      await deleteBook(id);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      try {
        setIsUploadingAvatar(true);
        const options = {
          maxSizeMB: 0.5,
          maxWidthOrHeight: 400,
          useWebWorker: true,
        };
        const compressed = await imageCompression(file, options);
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
      className="p-6 space-y-8"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.header variants={item} className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-serif text-ink tracking-tight">{user.name}</h1>
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
              {isUpdatingLocation ? 'Alınıyor...' : (user.lat ? 'Konumu Güncelle' : 'Konum Ekle')}
            </button>
          </div>
        </div>
        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
          <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-karma shadow-lg relative z-10 bg-parchment-dark">
            <img src={user.avatar} alt={user.name} className={`w-full h-full object-cover transition-opacity ${isUploadingAvatar ? 'opacity-50' : 'group-hover:opacity-80'}`} />
            <div className="absolute inset-0 bg-ink/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera size={20} className="text-white" />
            </div>
            {isUploadingAvatar && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              </div>
            )}
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
        onClick={() => setActiveTab('discovery')}
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
      <motion.section variants={item} className="grid grid-cols-2 gap-4">
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
        <motion.section variants={item} className="space-y-4 mb-8">
          <div className="flex justify-between items-end">
            <h2 className="font-serif text-xl">Gelen Takas İstekleri</h2>
            <span className="text-xs text-red-500 font-medium bg-red-100 px-2 py-1 rounded-full animate-pulse">{incomingRequests.length} Yeni İstek</span>
          </div>
          <div className="space-y-3">
            {incomingRequests.map(req => (
              <div key={req.id} className="bg-white p-4 rounded-2xl shadow-sm border border-red-500/20 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={req.requesterAvatar} alt={req.requesterName} className="w-10 h-10 rounded-full border border-ink/10" />
                    <div>
                      <p className="text-sm font-bold text-ink leading-tight">{req.requesterName}</p>
                      <p className="text-xs text-ink/60">"{req.bookTitle}" kitabınızı istiyor.</p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => respondToSwapRequest(req.id, true)}
                    className="flex-1 bg-ink text-white py-2 rounded-xl text-xs font-bold hover:bg-ink/80 transition-colors"
                  >
                    Kabul Et
                  </button>
                  <button 
                    onClick={() => respondToSwapRequest(req.id, false)}
                    className="flex-1 bg-red-50 text-red-600 border border-red-200 py-2 rounded-xl text-xs font-bold hover:bg-red-100 transition-colors"
                  >
                    Reddet
                  </button>
                </div>
              </div>
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
                <div className="relative h-40 mb-3 rounded-xl overflow-hidden bg-parchment-dark group">
                  <img src={book.cover} alt={book.title} className="w-full h-full object-cover opacity-90" />
                  
                  {/* Edit/Delete Overlay */}
                  <div className="absolute inset-0 bg-ink/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button 
                      onClick={() => setEditingBook(book)}
                      className="w-8 h-8 rounded-full bg-white text-ink flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button 
                      onClick={() => handleDelete(book.id)}
                      className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center hover:scale-110 transition-transform shadow-lg"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <h3 className="font-serif font-bold text-sm leading-tight truncate">{book.title}</h3>
                <p className="text-xs text-ink/60 truncate mb-2">{book.author}</p>
                <div className="mt-auto flex justify-between items-center">
                  <span className="text-[10px] px-2 py-1 bg-parchment-light rounded text-ink/70 font-medium">
                    {book.condition}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.section>

      <AddBookModal isOpen={isBookModalOpen} onClose={() => setIsBookModalOpen(false)} />
      <EditBookModal isOpen={!!editingBook} onClose={() => setEditingBook(null)} book={editingBook} />
    </motion.div>
  );
};
