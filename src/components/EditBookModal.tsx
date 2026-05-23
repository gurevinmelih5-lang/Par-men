import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, Upload } from 'lucide-react';
import { useStore } from '../store/useStore';
import { supabase } from '../lib/supabase';
import type { Book as BookType } from '../types/models';
import imageCompression from 'browser-image-compression';

interface EditBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: BookType | null;
}

export const EditBookModal: React.FC<EditBookModalProps> = ({ isOpen, onClose, book }) => {
  const { updateBook } = useStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    cover: '',
    genre: '',
    condition: 'İyi' as any,
    pace: 'Orta' as any,
    depth: 'Orta' as any
  });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (book) {
      setFormData({
        title: book.title,
        author: book.author,
        cover: book.cover,
        genre: book.genre || 'Diğer',
        condition: book.condition,
        pace: book.pace,
        depth: book.depth
      });
      setPreview(book.cover);
      setFile(null);
    }
  }, [book]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      if (preview && !preview.startsWith('http')) URL.revokeObjectURL(preview);

      try {
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 800,
          useWebWorker: true,
          initialQuality: 0.8
        };
        
        const compressedFile = await imageCompression(selectedFile, options);
        setFile(compressedFile);
        setPreview(URL.createObjectURL(compressedFile));
      } catch (error) {
        console.error('Error compressing image:', error);
        setFile(selectedFile);
        setPreview(URL.createObjectURL(selectedFile));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!book) return;
    
    setLoading(true);
    let finalCoverUrl = formData.cover;

    if (file) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const { data, error } = await supabase.storage
        .from('book-covers')
        .upload(fileName, file);

      if (!error && data) {
        const { data: { publicUrl } } = supabase.storage
          .from('book-covers')
          .getPublicUrl(data.path);
        finalCoverUrl = publicUrl;
      }
    }

    await updateBook(book.id, { ...formData, cover: finalCoverUrl });
    setLoading(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && book && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-sm flex items-end justify-center"
          onClick={onClose}
        >
          <motion.div 
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="bg-parchment-light w-full max-w-md rounded-t-3xl shadow-2xl overflow-y-auto scroll-touch"
            style={{ maxHeight: '94dvh', paddingBottom: 'max(env(safe-area-inset-bottom), 20px)' }}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-ink/20 rounded-full" />
            </div>
            <div className="px-5 pb-2">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-serif text-ink flex items-center gap-2">
                <BookOpen className="text-karma" size={22} /> Kitabı Düzenle
              </h2>
              <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-ink/5 text-ink/50 active:bg-ink/10 transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-ink/60 uppercase tracking-wider mb-1">Kitap Adı</label>
                <input 
                  required 
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-white border border-ink/10 py-3 px-4 rounded-xl text-ink font-medium focus:outline-none focus:border-karma transition-all" 
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-ink/60 uppercase tracking-wider mb-1">Yazar</label>
                <input 
                  required 
                  value={formData.author}
                  onChange={e => setFormData({...formData, author: e.target.value})}
                  className="w-full bg-white border border-ink/10 py-3 px-4 rounded-xl text-ink font-medium focus:outline-none focus:border-karma transition-all" 
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-ink/60 uppercase tracking-wider mb-1">Tür</label>
                <select 
                  required
                  value={formData.genre}
                  onChange={e => setFormData({...formData, genre: e.target.value})}
                  className="w-full bg-white border border-ink/10 py-3 px-4 rounded-xl text-ink font-medium focus:outline-none focus:border-karma transition-all"
                >
                  <option value="" disabled>Tür Seçin (Zorunlu)</option>
                  <option value="Roman">Roman</option>
                  <option value="Bilim Kurgu">Bilim Kurgu</option>
                  <option value="Tarih">Tarih</option>
                  <option value="Felsefe">Felsefe</option>
                  <option value="Psikoloji">Psikoloji</option>
                  <option value="Şiir">Şiir</option>
                  <option value="Biyografi">Biyografi</option>
                  <option value="Sanat">Sanat</option>
                  <option value="Kişisel Gelişim">Kişisel Gelişim</option>
                  <option value="Polisiye">Polisiye</option>
                  <option value="Diğer">Diğer</option>
                </select>
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
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-ink/60 uppercase tracking-wider mb-1.5">Durum</label>
                  <select 
                    value={formData.condition}
                    onChange={e => setFormData({...formData, condition: e.target.value})}
                    className="w-full bg-white border border-ink/10 py-3 px-3 rounded-xl text-ink font-medium focus:outline-none focus:border-karma transition-all text-sm"
                  >
                    <option value="Mükemmel">Mükemmel</option>
                    <option value="İyi">İyi</option>
                    <option value="Orta">Orta</option>
                    <option value="Yıpranmış">Yıpranmış</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-ink/60 uppercase tracking-wider mb-1.5">Tempo</label>
                  <select 
                    value={formData.pace}
                    onChange={e => setFormData({...formData, pace: e.target.value})}
                    className="w-full bg-white border border-ink/10 py-3 px-3 rounded-xl text-ink font-medium focus:outline-none focus:border-karma transition-all text-sm"
                  >
                    <option value="Yavaş">Yavaş</option>
                    <option value="Orta">Orta</option>
                    <option value="Hızlı">Hızlı</option>
                  </select>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full mt-1 bg-ink text-parchment-light py-4 rounded-xl font-bold shadow-lg shadow-ink/20 active:bg-ink/80 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? 'Güncelleniyor...' : 'Değişiklikleri Kaydet'}
              </button>
            </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
