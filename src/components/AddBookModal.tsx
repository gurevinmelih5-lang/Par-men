import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Book, Upload, Search } from 'lucide-react';
import { useStore } from '../store/useStore';
import { supabase } from '../lib/supabase';
import imageCompression from 'browser-image-compression';
import { moderateImage } from '../lib/moderation';
import toast from 'react-hot-toast';

interface AddBookModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddBookModal: React.FC<AddBookModalProps> = ({ isOpen, onClose }) => {
  const { addBook } = useStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    cover: '',
    condition: 'Good' as any,
    pace: 'Medium' as any,
    depth: 'Medium' as any,
    timeCapsule: ''
  });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const searchGoogleBooks = async () => {
    if (!formData.title) return;
    setIsSearching(true);
    try {
      const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=intitle:${encodeURIComponent(formData.title)}`);
      const data = await res.json();
      if (data.items && data.items.length > 0) {
        const cover = data.items[0].volumeInfo.imageLinks?.thumbnail;
        const author = data.items[0].volumeInfo.authors?.[0];
        if (cover) {
          const secureCover = cover.replace('http:', 'https:');
          setFormData(prev => ({ ...prev, cover: secureCover, author: author || prev.author }));
          setPreview(secureCover);
          setFile(null);
        }
      }
    } catch (error) {
      console.error('Google Books API error', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Compress & preview image before upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];

      // Revoke previous preview URL to free memory
      if (preview) URL.revokeObjectURL(preview);

      try {
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 800,
          useWebWorker: true,
          initialQuality: 0.8
        };
        
        const compressedFile = await imageCompression(selectedFile, options);

        // Moderation check
        const isSafe = await moderateImage(compressedFile);
        if (!isSafe) {
          toast.error('Görsel uygunsuz içerik içeriyor. Cinsel, hakaret içeren veya siyasi görseller eklenemez.');
          return;
        }

        setFile(compressedFile);
        setPreview(URL.createObjectURL(compressedFile));
      } catch (error) {
        console.error('Error compressing image:', error);
        // Fallback to original
        const isSafe = await moderateImage(selectedFile);
        if (!isSafe) {
          toast.error('Görsel uygunsuz içerik içeriyor.');
          return;
        }
        setFile(selectedFile);
        setPreview(URL.createObjectURL(selectedFile));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let finalCoverUrl = formData.cover;

    if (file) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const { data, error } = await supabase.storage
        .from('book-covers')
        .upload(fileName, file);

      if (error) {
        console.error('Error uploading image:', error);
      } else if (data) {
        const { data: { publicUrl } } = supabase.storage
          .from('book-covers')
          .getPublicUrl(data.path);
        finalCoverUrl = publicUrl;
      }
    }

    await addBook({ 
      ...formData, 
      cover: finalCoverUrl, 
      timeCapsule: formData.timeCapsule ? { message: formData.timeCapsule, from: '' } : undefined 
    });
    setLoading(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-ink/70 flex items-end sm:items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div 
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'tween', duration: 0.25, ease: 'easeOut' }}
            className="bg-parchment-light w-full max-w-sm rounded-3xl p-6 shadow-2xl max-h-[92vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-serif text-ink flex items-center gap-2">
                <Book className="text-karma" /> Kitap Ekle
              </h2>
              <button onClick={onClose} className="text-ink/40 hover:text-ink transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-ink/60 uppercase tracking-wider mb-1">Kitap Adı</label>
                <div className="flex gap-2">
                  <input 
                    required 
                    value={formData.title}
                    onChange={e => setFormData({...formData, title: e.target.value})}
                    className="flex-1 bg-white border border-ink/10 py-3 px-4 rounded-xl text-ink font-medium focus:outline-none focus:border-karma transition-all" 
                    placeholder="Örn: Körlük" 
                  />
                  <button 
                    type="button"
                    onClick={searchGoogleBooks}
                    disabled={isSearching || !formData.title}
                    className="bg-ink text-parchment-light px-4 rounded-xl flex items-center justify-center disabled:opacity-50"
                    title="Otomatik Kapak ve Yazar Bul"
                  >
                    {isSearching ? <div className="w-5 h-5 border-2 border-parchment-light border-t-transparent rounded-full animate-spin" /> : <Search size={20} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-ink/60 uppercase tracking-wider mb-1">Yazar</label>
                <input 
                  required 
                  value={formData.author}
                  onChange={e => setFormData({...formData, author: e.target.value})}
                  className="w-full bg-white border border-ink/10 py-3 px-4 rounded-xl text-ink font-medium focus:outline-none focus:border-karma transition-all" 
                  placeholder="Örn: José Saramago" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-ink/60 uppercase tracking-wider mb-1">Kapak Görseli</label>
                <div className="relative border-2 border-dashed border-ink/20 rounded-xl p-4 text-center hover:bg-white/50 transition-colors">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                  />
                  {preview ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-20 h-28 rounded shadow-md overflow-hidden">
                        <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                      <span className="text-xs font-medium text-ink/60">Görseli Değiştir</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-ink/40">
                      <Upload size={24} />
                      <span className="text-sm font-medium">Cihazdan Görsel Seç</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-ink/60 uppercase tracking-wider mb-1">Kondisyon</label>
                  <select 
                    value={formData.condition}
                    onChange={e => setFormData({...formData, condition: e.target.value})}
                    className="w-full bg-white border border-ink/10 py-3 px-4 rounded-xl text-ink font-medium focus:outline-none focus:border-karma transition-all"
                  >
                    <option value="Mint">Mint (Mükemmel)</option>
                    <option value="Good">İyi</option>
                    <option value="Fair">Orta</option>
                    <option value="Poor">Yıpranmış</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-ink/60 uppercase tracking-wider mb-1">Tempo</label>
                  <select 
                    value={formData.pace}
                    onChange={e => setFormData({...formData, pace: e.target.value})}
                    className="w-full bg-white border border-ink/10 py-3 px-4 rounded-xl text-ink font-medium focus:outline-none focus:border-karma transition-all"
                  >
                    <option value="Slow">Yavaş</option>
                    <option value="Medium">Orta</option>
                    <option value="Fast">Hızlı</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-ink/60 uppercase tracking-wider mb-1 flex items-center gap-1">
                  Zaman Kapsülü <span className="text-karma font-normal normal-case">(İsteğe Bağlı)</span>
                </label>
                <textarea 
                  value={formData.timeCapsule}
                  onChange={e => setFormData({...formData, timeCapsule: e.target.value})}
                  className="w-full bg-white border border-ink/10 py-3 px-4 rounded-xl text-ink font-medium focus:outline-none focus:border-karma transition-all resize-none h-20" 
                  placeholder="Bu kitabı alan kişiye gizli bir not bırakın..." 
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full mt-2 bg-ink text-parchment-light py-4 rounded-xl font-bold shadow-lg shadow-ink/20 hover:bg-ink/90 transition-all active:scale-[0.98]"
              >
                {loading ? 'Ekleniyor...' : 'Kütüphaneye Ekle'}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
