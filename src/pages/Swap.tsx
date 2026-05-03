import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, QrCode, X, CheckCircle2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useStore } from '../store/useStore';
import { SwapTableModal } from '../components/SwapTableModal';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix Leaflet default marker icon path issue with bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

export const Swap: React.FC = () => {
  const { books, user, executeSwap } = useStore();
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [showSwapTable, setShowSwapTable] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);

  const otherBooks = books.filter(b => b.ownerId !== user.id);

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  const activeBook = otherBooks.find(b => b.id === selectedBook);

  const handleSwapConfirm = async () => {
    if (!activeBook) return;
    setIsSwapping(true);
    await executeSwap(activeBook.id);
    setIsSwapping(false);
    setShowQR(false);
    setSelectedBook(null);
    alert('Takas başarıyla gerçekleşti! Kitap kütüphanenize eklendi ve yolculuğu kayıt altına alındı.');
  };

  return (
    <motion.div 
      className="p-6 space-y-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.header variants={item}>
        <h1 className="text-3xl font-serif text-ink tracking-tight">Hiper-Lokal Takas</h1>
        <p className="text-ink/60 mt-2 font-sans text-sm">Yakınındaki güvenli buluşma noktalarında takas yap.</p>
      </motion.header>

      {/* Interactive Map */}
      <motion.section variants={item} className="relative h-[60vh] rounded-3xl overflow-hidden shadow-inner border border-ink/10" style={{ zIndex: 0 }}>
        <MapContainer 
          center={[user.lat || 41.0082, user.lng || 28.9784]} 
          zoom={13} 
          scrollWheelZoom={true} 
          style={{ height: '100%', width: '100%', zIndex: 0 }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          
          {/* Current Location */}
          {user.lat && user.lng && (
            <Marker 
              position={[user.lat, user.lng]}
              icon={L.divIcon({
                className: 'custom-user-marker',
                html: `<div style="width: 24px; height: 24px; background: rgba(37,99,235,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; animation: pulse 2s infinite;"><div style="width: 10px; height: 10px; background: #2563eb; border-radius: 50%; border: 2px solid white;"></div></div>`,
                iconSize: [24, 24],
                iconAnchor: [12, 12]
              })}
            />
          )}

          {/* Book Locations */}
          {otherBooks.map(book => {
            if (!book.lat || !book.lng) return null;
            return (
              <Marker 
                key={book.id}
                position={[book.lat, book.lng]}
                eventHandlers={{
                  click: () => setSelectedBook(book.id),
                }}
                icon={L.divIcon({
                  className: 'custom-book-marker',
                  html: `<div style="padding: 6px; background: ${selectedBook === book.id ? '#D4AF37' : '#1A202C'}; color: white; border-radius: 50%; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); transition: all 0.3s; transform: scale(${selectedBook === book.id ? '1.2' : '1'}); display: flex; align-items: center; justify-content: center;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                  </div>`,
                  iconSize: [32, 32],
                  iconAnchor: [16, 32]
                })}
              >
              </Marker>
            );
          })}
        </MapContainer>
      </motion.section>

      {/* Selected Book Card Panel */}
      <AnimatePresence>
        {activeBook && !showQR && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-20 left-4 right-4 bg-white p-4 rounded-2xl shadow-xl shadow-ink/10 border border-ink/5 z-40 flex gap-4"
          >
            <div className="w-20 h-28 rounded-lg overflow-hidden bg-parchment-dark flex-shrink-0">
              <img src={activeBook.cover} alt={activeBook.title} className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col flex-grow">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-serif font-bold text-lg leading-tight">{activeBook.title}</h3>
                  <p className="text-xs text-ink/60">{activeBook.author}</p>
                </div>
                <button onClick={() => setSelectedBook(null)} className="text-ink/40 hover:text-ink">
                  <X size={20} />
                </button>
              </div>
              
              <div className="mt-auto flex justify-between items-end">
                <div>
                  <p className="text-xs font-bold text-ink/70 mb-1">Kondisyon: <span className="text-ink">{activeBook.condition}</span></p>
                  <p className="text-xs font-bold text-karma flex items-center gap-1">
                    <MapPin size={12} /> Kadıköy İskele (Güvenli Nokta)
                  </p>
                </div>
                <button 
                  onClick={() => setShowSwapTable(true)}
                  className="bg-ink text-parchment-light text-sm font-medium px-4 py-2 rounded-xl hover:bg-ink/90 transition-colors shadow-md shadow-ink/20"
                >
                  Takas Masası
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Swap Table Modal */}
      {activeBook && (
        <SwapTableModal 
          isOpen={showSwapTable} 
          onClose={() => setShowSwapTable(false)} 
          targetBook={activeBook}
          onConfirm={() => {
            setShowSwapTable(false);
            setShowQR(true);
          }}
        />
      )}

      {/* QR Code Modal Simulation */}
      <AnimatePresence>
        {showQR && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-ink/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setShowQR(false)}
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-sm rounded-3xl p-8 relative overflow-hidden flex flex-col items-center text-center"
              onClick={e => e.stopPropagation()}
            >
              <button onClick={() => setShowQR(false)} className="absolute top-4 right-4 text-ink/40 hover:text-ink">
                <X size={24} />
              </button>
              
              <div className="w-16 h-16 bg-karma/10 rounded-full flex items-center justify-center mb-6 text-karma">
                <QrCode size={32} />
              </div>
              
              <h2 className="font-serif text-2xl font-bold mb-2 text-ink">Takas Onayı</h2>
              <p className="text-sm text-ink/60 mb-8 px-4">
                Karşı tarafın Parşömen uygulamasından bu QR kodu okutmasını isteyin.
              </p>
              
              <div className="w-48 h-48 bg-white rounded-xl border-2 border-dashed border-ink/20 flex items-center justify-center mb-8 relative p-4 shadow-sm">
                 <QRCodeSVG 
                    value={JSON.stringify({ type: 'swap', bookId: activeBook?.id })} 
                    size={150} 
                    fgColor="#1A202C"
                 />
                 {/* Scanning line animation */}
                 <motion.div 
                   animate={{ top: ['0%', '100%', '0%'] }}
                   transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                   className="absolute left-0 right-0 h-1 bg-karma/50 shadow-[0_0_10px_rgba(212,175,55,0.8)] z-10"
                 />
              </div>
              
              <div className="flex items-center gap-2 text-xs font-bold text-green-600 bg-green-50 px-4 py-2 rounded-full mb-6">
                <CheckCircle2 size={16} />
                Güvenli Bölge Doğrulandı
              </div>

              <button 
                onClick={handleSwapConfirm}
                disabled={isSwapping}
                className="w-full bg-karma text-ink py-3 rounded-xl font-bold shadow-lg shadow-karma/30 hover:bg-karma/90 transition-all active:scale-[0.98]"
              >
                {isSwapping ? 'İşleniyor...' : 'Takası Onayla (QR Simüle Et)'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
