import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, QrCode, X, CheckCircle2, Flame, Map as MapIcon, Compass, Quote } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { useStore } from '../store/useStore';
import type { Book } from '../mockData';
import { gezginTurkeyBooksAsAppBooks } from '../data/gezginTurkiyeAtlas';
import toast from 'react-hot-toast';
import { SwapTableModal } from '../components/SwapTableModal';
import { MapContainer, TileLayer, Marker, Circle, Polyline } from 'react-leaflet';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

/** Yakınlık listesi (km): bu yarıçapa düşen sahneler kartta listelenir */
const GEZGIN_LIST_KM = 110;
/** Bu mesafenin altındaki checkpoint haritada altın renkte */
const GEZGIN_GOLD_KM = 24;
/** Samimi bildirim için tetikleme (km) */
const GEZGIN_TOAST_KM = 6;

type StoryLoc = NonNullable<Book['storyLocations']>[number];

type AtlasPick = {
  bookId: string;
  locIndex: number;
  location: StoryLoc;
} | null;

function gezginSceneTitle(book: Book, loc: StoryLoc): string {
  const scene = loc.sceneLabel ?? `${loc.name} bölümü`;
  return `${book.author} — «${book.title}» kitabında geçen ${scene}`;
}

function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function gezginCheckpointIcon(isGold: boolean, isSelected: boolean, orderIdx: number): L.DivIcon {
  const bg = isGold ? '#D4AF37' : '#2563eb';
  const shadow = isGold ? 'rgba(212,175,55,0.85)' : 'rgba(37,99,235,0.55)';
  const ring = isGold ? '#fff8e7' : '#e0e7ff';
  const scale = isSelected ? '1.22' : '1';
  return L.divIcon({
    className: 'gezgin-checkpoint',
    html: `<div style="padding: 5px; background: ${bg}; color: white; border-radius: 50%; box-shadow: 0 0 12px ${shadow}, 0 0 0 2px ${ring}; transform: scale(${scale}); transition: transform 0.2s; display: flex; align-items: center; justify-content: center; position: relative;">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="8" stroke-dasharray="3 3"/></svg>
      <div style="position:absolute; top:-5px; right:-5px; background: white; color: ${bg}; width:13px; height:13px; border-radius:50%; font-size:9px; font-weight:bold; display:flex; align-items:center; justify-content:center; border: 1px solid ${bg};">${orderIdx + 1}</div>
    </div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
  });
}

const literaryZones = [
  { center: [41.0082, 28.9784] as [number, number], label: 'Kadıköy', genre: 'Modern Edebiyat', color: '#D4AF37', radius: 900 },
  { center: [41.0425, 29.0093] as [number, number], label: 'Beşiktaş', genre: 'Psikoloji & Felsefe', color: '#8B5CF6', radius: 750 },
  { center: [41.0136, 28.9550] as [number, number], label: 'Beyoğlu', genre: 'Sanat & Şiir', color: '#EC4899', radius: 600 },
  { center: [41.0030, 29.0210] as [number, number], label: 'Üsküdar', genre: 'Tarih & Tasavvuf', color: '#14B8A6', radius: 700 },
];

export const Swap: React.FC = () => {
  const { books, user, executeSwap } = useStore();
  const [selectedBook, setSelectedBook] = useState<string | null>(null);
  const [showQR, setShowQR] = useState(false);
  const [showSwapTable, setShowSwapTable] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const [mapMode, setMapMode] = useState<'swap' | 'literary' | 'atlas'>('swap');
  const [selectedAtlasLocation, setSelectedAtlasLocation] = useState<AtlasPick>(null);
  const [nearbyLocation, setNearbyLocation] = useState<{ bookTitle: string; location: StoryLoc } | null>(null);

  const gezginAtlasStatic = useMemo(() => gezginTurkeyBooksAsAppBooks(), []);

  const booksForGezgin = useMemo(() => {
    return [...gezginAtlasStatic, ...books.filter((b) => (b.storyLocations?.length ?? 0) > 0)];
  }, [books, gezginAtlasStatic]);

  const nearbyGezginScenes = useMemo(() => {
    if (user.lat == null || user.lng == null) return null;
    const rows: { book: Book; loc: StoryLoc; locIndex: number; distanceKm: number }[] = [];
    booksForGezgin.forEach((book) => {
      if (!book.storyLocations) return;
      book.storyLocations.forEach((loc, locIndex) => {
        const d = haversineKm(user.lat!, user.lng!, loc.lat, loc.lng);
        if (d <= GEZGIN_LIST_KM) {
          rows.push({ book, loc, locIndex, distanceKm: d });
        }
      });
    });
    rows.sort((a, b) => a.distanceKm - b.distanceKm);
    return rows;
  }, [booksForGezgin, user.lat, user.lng]);

  const atlasMapEntries = useMemo(() => {
    return booksForGezgin
      .filter((b) => b.storyLocations && b.storyLocations.length > 0)
      .map((book) => ({
        book,
        points: book.storyLocations!.map((loc, locIndex) => ({ loc, locIndex })),
      }));
  }, [booksForGezgin]);

  const selectedGezginBook = useMemo(() => {
    if (!selectedAtlasLocation) return null;
    return booksForGezgin.find((b) => b.id === selectedAtlasLocation.bookId) ?? null;
  }, [booksForGezgin, selectedAtlasLocation]);

  const selectedGezginDistanceKm = useMemo(() => {
    if (!selectedAtlasLocation || user.lat == null || user.lng == null) return undefined;
    return haversineKm(user.lat, user.lng, selectedAtlasLocation.location.lat, selectedAtlasLocation.location.lng);
  }, [selectedAtlasLocation, user.lat, user.lng]);

  const gezginToastSeenRef = React.useRef<Set<string>>(new Set());

  React.useEffect(() => {
    if (mapMode !== 'atlas' || user.lat == null || user.lng == null) return;
    const uLat = user.lat;
    const uLng = user.lng;
    type NearToast = { key: string; d: number; book: Book; loc: StoryLoc };
    let nearestToast: NearToast | null = null;
    for (const book of booksForGezgin) {
      const locs = book.storyLocations;
      if (!locs?.length) continue;
      for (let locIndex = 0; locIndex < locs.length; locIndex++) {
        const loc = locs[locIndex];
        const d = haversineKm(uLat, uLng, loc.lat, loc.lng);
        if (d <= GEZGIN_TOAST_KM && (!nearestToast || d < nearestToast.d)) {
          nearestToast = { key: `${book.id}-${locIndex}`, d, book, loc };
        }
      }
    }
    if (!nearestToast || gezginToastSeenRef.current.has(nearestToast.key)) return;
    gezginToastSeenRef.current.add(nearestToast.key);
    toast.success(
      `Dostum, ${nearestToast.loc.name} sahnelerine sımsıcık yakınsın — «${nearestToast.book.title}» tam yanı başında.`,
      { id: `gezgin-near-${nearestToast.key}`, duration: 5500 }
    );
  }, [mapMode, user.lat, user.lng, booksForGezgin]);

  React.useEffect(() => {
    if (user.lat && user.lng) {
      let closest: { bookTitle: string; location: StoryLoc } | null = null;
      let minDistance = 1.0; // 1km threshold

      books.forEach(book => {
        if (book.storyLocations) {
          book.storyLocations.forEach(loc => {
            const dist = haversineKm(user.lat!, user.lng!, loc.lat, loc.lng);
            if (dist < minDistance) {
              minDistance = dist;
              closest = { bookTitle: book.title, location: loc };
            }
          });
        }
      });

      if (closest) {
        setNearbyLocation(closest);
      }
    }
  }, [user.lat, user.lng, books]);

  const otherBooks = books.filter(b => b.ownerId !== user.id);

  const container = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } }
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

  const getLegendaryIcon = (isLegendary: boolean, isSelected: boolean) => {
    if (isLegendary) {
      return L.divIcon({
        className: 'legendary-marker',
        html: `<div style="
          position: relative;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          <div style="
            position: absolute;
            inset: 0;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(212,175,55,0.35) 0%, transparent 70%);
            animation: pulse 2s infinite;
          "></div>
          <div style="
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background: linear-gradient(135deg, #D4AF37, #a07d1c);
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 0 16px rgba(212,175,55,0.7), 0 4px 8px rgba(0,0,0,0.3);
            font-size: 18px;
          ">🔥</div>
        </div>`,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      });
    }
    return L.divIcon({
      className: 'custom-book-marker',
      html: `<div style="padding: 6px; background: ${isSelected ? '#D4AF37' : '#1A202C'}; color: white; border-radius: 50%; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.2); transform: scale(${isSelected ? '1.2' : '1'}); transition: all 0.3s; display: flex; align-items: center; justify-content: center;">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
      </div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 32],
    });
  };

  return (
    <motion.div className="p-6 pb-28 space-y-6" variants={container} initial="hidden" animate="show">
      <motion.header variants={item}>
        <h1 className="text-3xl font-serif text-ink tracking-tight">Hiper-Lokal Takas</h1>
        <p className="text-ink/60 mt-2 font-sans text-sm">Yakınındaki güvenli buluşma noktalarında takas yap.</p>
      </motion.header>

      {/* Proximity Alert */}
      <AnimatePresence>
        {nearbyLocation && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-indigo-600 text-white p-4 rounded-2xl shadow-xl flex gap-3 items-start relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-400 to-pink-500"></div>
            <div className="p-2 bg-white/20 rounded-full flex-shrink-0 mt-1">
              <Compass size={20} className="animate-pulse" />
            </div>
            <div>
              <p className="text-sm font-bold flex items-center gap-1">
                📍 Yakınlarda Bir Hikaye Var!
              </p>
              <p className="text-xs text-indigo-100 mt-1">
                Şu an <strong>{nearbyLocation.bookTitle}</strong> romanındaki <strong>{nearbyLocation.location.name}</strong> noktasına çok yakınsın.
              </p>
              <p className="text-[10px] text-indigo-200 mt-2 italic">
                "{nearbyLocation.location.description}"
              </p>
            </div>
            <button onClick={() => setNearbyLocation(null)} className="absolute top-2 right-2 text-indigo-200 hover:text-white">
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map Mode Toggle */}
      <motion.div variants={item} className="flex p-1 bg-parchment-dark/40 rounded-2xl overflow-x-auto snap-x hide-scrollbar">
        <button
          onClick={() => setMapMode('swap')}
          className={`flex-1 min-w-[110px] flex items-center justify-center gap-2 py-2.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all duration-300 snap-center ${mapMode === 'swap' ? 'bg-ink text-parchment-light shadow-md' : 'text-ink/60 hover:text-ink'}`}
        >
          <MapPin size={16} /> Noktalar
        </button>
        <button
          onClick={() => setMapMode('literary')}
          className={`flex-1 min-w-[110px] flex items-center justify-center gap-2 py-2.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all duration-300 snap-center ${mapMode === 'literary' ? 'bg-ink text-parchment-light shadow-md' : 'text-ink/60 hover:text-ink'}`}
        >
          <MapIcon size={16} /> Edebi Harita
        </button>
        <button
          onClick={() => setMapMode('atlas')}
          className={`flex-1 min-w-[110px] flex items-center justify-center gap-2 py-2.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all duration-300 snap-center ${mapMode === 'atlas' ? 'bg-ink text-parchment-light shadow-md' : 'text-ink/60 hover:text-ink'}`}
        >
          <Compass size={16} /> Gezgin
        </button>
      </motion.div>

      {/* Legend for literary map */}
      <AnimatePresence>
        {mapMode === 'literary' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-2 gap-2"
          >
            {literaryZones.map(zone => (
              <div key={zone.label} className="flex items-center gap-2 bg-white p-2 rounded-xl border border-ink/5 shadow-sm">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: zone.color, boxShadow: `0 0 6px ${zone.color}` }} />
                <div>
                  <p className="text-[10px] font-bold text-ink leading-none">{zone.label}</p>
                  <p className="text-[9px] text-ink/50">{zone.genre}</p>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legendary book badge */}
      <AnimatePresence>
        {mapMode === 'swap' && otherBooks.some(b => b.isLegendary) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 bg-gradient-to-r from-karma/20 to-karma/5 border border-karma/30 rounded-2xl p-3"
          >
            <div className="w-9 h-9 rounded-full bg-karma/20 flex items-center justify-center text-lg flex-shrink-0">🔥</div>
            <div>
              <p className="text-xs font-bold text-ink">Efsanevi Kitap Haritada!</p>
              <p className="text-[10px] text-ink/60">Altın parlayan pin efsanevi bir kitabı işaret ediyor. Peşine düş!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Atlas / Gezgin mode */}
      <AnimatePresence>
        {mapMode === 'atlas' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3 bg-gradient-to-r from-purple-500/20 to-purple-500/5 border border-purple-500/30 rounded-2xl p-3"
          >
            <div className="w-9 h-9 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-600 flex-shrink-0">
              <Compass size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-ink">Gezgin modu</p>
              <p className="text-[10px] text-ink/60 leading-snug">
                {nearbyGezginScenes === null
                  ? 'Haritada Türkiye roman atlasından 35 kitabın tüm durakları görünür; konumunu açınca yakın olanlar altın, uzak olanlar mavi checkpoint olur.'
                  : `Altın: konumuna ~${GEZGIN_GOLD_KM} km içi; mavi: daha uzak ama yine haritada. Liste: ~${GEZGIN_LIST_KM} km içindeki sahneler.`}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {mapMode === 'atlas' && (
        <div className="flex flex-wrap items-center gap-3 text-[10px] text-ink/65 px-1">
          <span className="inline-flex items-center gap-1.5 font-bold">
            <span className="w-3 h-3 rounded-full bg-[#D4AF37] shadow-sm border border-amber-200" /> Yakın (altın)
          </span>
          <span className="inline-flex items-center gap-1.5 font-bold">
            <span className="w-3 h-3 rounded-full bg-[#2563eb] shadow-sm border border-blue-200" /> Uzak (mavi)
          </span>
        </div>
      )}

      {mapMode === 'atlas' && nearbyGezginScenes !== null && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-purple-200/60 bg-white/90 p-3 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-2 text-purple-800">
            <Quote size={16} className="flex-shrink-0" />
            <p className="text-[11px] font-bold uppercase tracking-wide">Buraya yakın geçen sahneler</p>
          </div>
          {nearbyGezginScenes.length === 0 ? (
            <p className="text-xs text-ink/55 text-center py-3">
              Bu yarıçap içinde kayıtlı kurgusal sahne yok. Profilden konumunu güncelleyebilir veya haritayı kaydırarak diğer şehirleri inceleyebilirsin.
            </p>
          ) : (
            <ul className="max-h-40 overflow-y-auto space-y-2 pr-1">
              {nearbyGezginScenes.map((row, i) => (
                <li key={`${row.book.id}-${row.locIndex}-${i}`}>
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedAtlasLocation({
                        bookId: row.book.id,
                        locIndex: row.locIndex,
                        location: row.loc,
                      })
                    }
                    className={`w-full text-left rounded-xl border px-3 py-2.5 transition-colors ${
                      selectedAtlasLocation?.bookId === row.book.id &&
                      selectedAtlasLocation?.locIndex === row.locIndex
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-ink/10 bg-parchment-light/80 hover:border-purple-300'
                    }`}
                  >
                    <p className="text-[11px] font-semibold text-ink leading-snug">{gezginSceneTitle(row.book, row.loc)}</p>
                    <p className="text-[10px] text-ink/45 mt-1 line-clamp-2">{row.loc.description}</p>
                    <p className="text-[9px] text-purple-600 font-bold mt-1.5">≈ {row.distanceKm.toFixed(1)} km</p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </motion.div>
      )}

      {/* Interactive Map */}
      <motion.section variants={item} className="relative h-[55vh] rounded-3xl overflow-hidden shadow-inner border border-ink/10" style={{ zIndex: 0 }}>
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

          {/* User location marker */}
          {user.lat && user.lng && (
            <Marker
              position={[user.lat, user.lng]}
              icon={L.divIcon({
                className: 'custom-user-marker',
                html: `<div style="width:24px;height:24px;background:rgba(37,99,235,0.2);border-radius:50%;display:flex;align-items:center;justify-content:center;animation:pulse 2s infinite;"><div style="width:10px;height:10px;background:#2563eb;border-radius:50%;border:2px solid white;"></div></div>`,
                iconSize: [24, 24],
                iconAnchor: [12, 12],
              })}
            />
          )}

          {/* Swap mode: book markers */}
          {mapMode === 'swap' && otherBooks.map(book => {
            if (!book.lat || !book.lng) return null;
            return (
              <Marker
                key={book.id}
                position={[book.lat, book.lng]}
                eventHandlers={{ click: () => setSelectedBook(book.id) }}
                icon={getLegendaryIcon(!!book.isLegendary, selectedBook === book.id)}
              />
            );
          })}

          {/* Literary mode: heatmap circles */}
          {mapMode === 'literary' && literaryZones.map(zone => (
            <React.Fragment key={zone.label}>
              <Circle
                center={zone.center}
                radius={zone.radius}
                pathOptions={{ color: zone.color, fillColor: zone.color, fillOpacity: 0.18, weight: 1.5, opacity: 0.5 }}
              />
              <Circle
                center={zone.center}
                radius={zone.radius * 0.4}
                pathOptions={{ color: zone.color, fillColor: zone.color, fillOpacity: 0.35, weight: 0, opacity: 0 }}
              />
            </React.Fragment>
          ))}

          {/* Gezgin: yakın sahneler veya konum yoksa tüm rota */}
          {mapMode === 'atlas' &&
            atlasMapEntries.map(({ book, points }) => {
              const positions: [number, number][] = points.map((p) => [p.loc.lat, p.loc.lng]);
              return (
                <React.Fragment key={`path-${book.id}`}>
                  {positions.length > 1 && (
                    <Polyline
                      positions={positions}
                      pathOptions={{ color: '#8B5CF6', weight: 2, dashArray: '4, 8', opacity: 0.6 }}
                    />
                  )}
                  {points.map(({ loc, locIndex }, orderIdx) => {
                    const isSel =
                      selectedAtlasLocation?.bookId === book.id &&
                      selectedAtlasLocation?.locIndex === locIndex;
                    const dUser =
                      user.lat != null && user.lng != null
                        ? haversineKm(user.lat, user.lng, loc.lat, loc.lng)
                        : Number.POSITIVE_INFINITY;
                    const isGold = dUser <= GEZGIN_GOLD_KM;
                    return (
                      <Marker
                        key={`${book.id}-${locIndex}`}
                        position={[loc.lat, loc.lng]}
                        eventHandlers={{
                          click: () =>
                            setSelectedAtlasLocation({ bookId: book.id, locIndex, location: loc }),
                        }}
                        icon={gezginCheckpointIcon(isGold, isSel, orderIdx)}
                      />
                    );
                  })}
                </React.Fragment>
              );
            })}
        </MapContainer>
      </motion.section>

      {/* Selected Gezgin sahne paneli */}
      <AnimatePresence>
        {mapMode === 'atlas' && selectedAtlasLocation && selectedGezginBook && (
          <motion.div
            key="gezgin-panel"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-20 left-4 right-4 p-4 rounded-2xl shadow-xl z-40 bg-white border border-purple-100"
          >
            <div className="flex flex-col">
              <div className="flex justify-between items-start mb-3 gap-2">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="p-2.5 bg-purple-100 text-purple-600 rounded-xl flex-shrink-0">
                    <Quote size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-purple-700 mb-1">Alıntı bağlamı</p>
                    <h3 className="font-serif text-sm sm:text-base font-bold text-ink leading-snug">
                      {gezginSceneTitle(selectedGezginBook, selectedAtlasLocation.location)}
                    </h3>
                    <p className="text-[11px] text-ink/55 mt-1 font-medium">{selectedAtlasLocation.location.name}</p>
                  </div>
                </div>
                <button type="button" onClick={() => setSelectedAtlasLocation(null)} className="text-ink/40 hover:text-ink flex-shrink-0">
                  <X size={20} />
                </button>
              </div>
              <div className="bg-parchment-dark/40 p-4 rounded-xl border border-ink/5 relative">
                <p className="text-sm leading-relaxed text-ink/95 font-serif italic border-l-2 border-purple-400 pl-3">
                  {selectedAtlasLocation.location.description}
                </p>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-ink/10 pt-3">
                  <p className="text-[10px] font-bold text-purple-600 uppercase tracking-widest flex items-center gap-1">
                    <Compass size={12} /> Kurgusal mekân
                  </p>
                  {selectedGezginDistanceKm != null && (
                    <p className="text-[10px] font-bold text-ink/50">
                      Senin konumuna ≈ {selectedGezginDistanceKm.toFixed(1)} km
                    </p>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected Book Card Panel */}
      <AnimatePresence>
        {activeBook && !showQR && mapMode === 'swap' && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className={`fixed bottom-20 left-4 right-4 p-4 rounded-2xl shadow-xl z-40 flex gap-4 border ${activeBook.isLegendary ? 'bg-gradient-to-r from-ink to-ink/90 text-parchment-light border-karma/40' : 'bg-white border-ink/5'}`}
          >
            <div className="w-20 h-28 rounded-lg overflow-hidden bg-parchment-dark flex-shrink-0">
              <img src={activeBook.cover} alt={activeBook.title} className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col flex-grow">
              <div className="flex justify-between items-start">
                <div>
                  {activeBook.isLegendary && (
                    <span className="text-[9px] font-bold text-karma uppercase tracking-widest flex items-center gap-1 mb-1">
                      <Flame size={10} /> Efsanevi Kitap
                    </span>
                  )}
                  <h3 className={`font-serif font-bold text-lg leading-tight ${activeBook.isLegendary ? 'text-parchment-light' : 'text-ink'}`}>{activeBook.title}</h3>
                  <p className={`text-xs ${activeBook.isLegendary ? 'text-parchment-light/60' : 'text-ink/60'}`}>{activeBook.author}</p>
                </div>
                <button onClick={() => setSelectedBook(null)} className={`${activeBook.isLegendary ? 'text-parchment-light/40 hover:text-parchment-light' : 'text-ink/40 hover:text-ink'}`}>
                  <X size={20} />
                </button>
              </div>
              <div className="mt-auto flex justify-between items-end">
                <div>
                  <p className={`text-xs font-bold mb-1 ${activeBook.isLegendary ? 'text-parchment-light/70' : 'text-ink/70'}`}>
                    {activeBook.isLegendary ? '🗺️ Son görülme: Kadıköy Sahili' : `Kondisyon: ${activeBook.condition}`}
                  </p>
                  <p className={`text-xs font-bold flex items-center gap-1 ${activeBook.isLegendary ? 'text-karma' : 'text-karma'}`}>
                    <MapPin size={12} /> Kadıköy İskele (Güvenli Nokta)
                  </p>
                </div>
                <button
                  onClick={() => setShowSwapTable(true)}
                  className={`text-sm font-medium px-4 py-2 rounded-xl transition-colors shadow-md ${activeBook.isLegendary ? 'bg-karma text-ink shadow-karma/30' : 'bg-ink text-parchment-light shadow-ink/20 hover:bg-ink/90'}`}
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
          onConfirm={() => { setShowSwapTable(false); setShowQR(true); }}
        />
      )}

      {/* QR Code Modal */}
      <AnimatePresence>
        {showQR && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-ink/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
            onClick={() => setShowQR(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-white w-full max-w-sm rounded-3xl p-8 relative overflow-hidden flex flex-col items-center text-center"
              onClick={e => e.stopPropagation()}
            >
              <button onClick={() => setShowQR(false)} className="absolute top-4 right-4 text-ink/40 hover:text-ink"><X size={24} /></button>
              <div className="w-16 h-16 bg-karma/10 rounded-full flex items-center justify-center mb-6 text-karma"><QrCode size={32} /></div>
              <h2 className="font-serif text-2xl font-bold mb-2 text-ink">Takas Onayı</h2>
              <p className="text-sm text-ink/60 mb-8 px-4">Karşı tarafın Parşömen uygulamasından bu QR kodu okutmasını isteyin.</p>
              <div className="w-48 h-48 bg-white rounded-xl border-2 border-dashed border-ink/20 flex items-center justify-center mb-8 relative p-4 shadow-sm">
                <QRCodeSVG value={JSON.stringify({ type: 'swap', bookId: activeBook?.id })} size={150} fgColor="#1A202C" />
                <motion.div
                  animate={{ top: ['0%', '100%', '0%'] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  className="absolute left-0 right-0 h-1 bg-karma/50 shadow-[0_0_10px_rgba(212,175,55,0.8)] z-10"
                />
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-green-600 bg-green-50 px-4 py-2 rounded-full mb-6">
                <CheckCircle2 size={16} /> Güvenli Bölge Doğrulandı
              </div>
              <button
                onClick={handleSwapConfirm}
                disabled={isSwapping}
                className="w-full bg-karma text-ink py-3 rounded-xl font-bold shadow-lg shadow-karma/30 hover:bg-karma/90 transition-all active:scale-[0.98]"
              >
                {isSwapping ? 'İşleniyor...' : 'Takası Onayla'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
