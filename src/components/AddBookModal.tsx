import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, Upload, Search, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { supabase } from '../lib/supabase';
import { compressImage } from '../lib/image';
import { moderateImage } from '../lib/moderation';
import toast from 'react-hot-toast';
import Tesseract from 'tesseract.js';

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
    genre: '',
    condition: 'Good',
    pace: 'Medium',
    depth: 'Medium',
    timeCapsule: ''
  });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  // Tracks whether user manually uploaded an image (not via Google Books)
  const [isManualUpload, setIsManualUpload] = useState(false);
  // Confirmation that the uploaded image matches the book title
  const [coverConfirmed, setCoverConfirmed] = useState(false);
  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const [ocrError, setOcrError] = useState<string | null>(null);

  const resetForm = () => {
    setFormData({ title: '', author: '', cover: '', genre: '', condition: 'Good', pace: 'Medium', depth: 'Medium', timeCapsule: '' });
    setFile(null);
    setPreview(null);
    setIsManualUpload(false);
    setCoverConfirmed(false);
    setOcrError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

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
          setIsManualUpload(false);
          setCoverConfirmed(true); // Google Books result is always "confirmed"
          toast.success('Kapak ve yazar bilgisi bulundu!');
        } else {
          toast.error('Bu kitap için kapak görseli bulunamadı.');
        }
      } else {
        toast.error('Kitap bulunamadı. Kitap adını kontrol edin.');
      }
    } catch (error) {
      console.error('Google Kitaplar API hatası', error);
      toast.error('Arama sırasında bir hata oluştu.');
    } finally {
      setIsSearching(false);
    }
  };

  // Compress & preview image before upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!formData.title.trim()) {
      toast.error('Lütfen önce kitap adını girin!');
      e.target.value = '';
      return;
    }

    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];

      // Revoke previous preview URL to free memory
      if (preview && preview.startsWith('blob:')) URL.revokeObjectURL(preview);

      try {
        const compressedFile = await compressImage(selectedFile);

        // Moderation check
        const isSafe = await moderateImage(compressedFile);
        if (!isSafe) {
          toast.error('Görsel uygunsuz içerik içeriyor. Lütfen uygun bir kapak görseli seçin.');
          return;
        }

        setFile(compressedFile);
        setPreview(URL.createObjectURL(compressedFile));
        setIsManualUpload(true);
        setCoverConfirmed(false);
        setOcrError(null);

        // OCR ile Kitap Adı Eşleşmesi Kontrolü
        setIsOcrLoading(true);
        try {
          toast.loading('Kapak görseli analiz ediliyor...', { id: 'ocr-toast' });
          const { data: { text } } = await Tesseract.recognize(compressedFile, 'tur+eng');
          
          const cleanText = text.toLowerCase().replace(/[^a-zçğıöşü]/g, '');
          const titleWords = formData.title.toLowerCase().replace(/[^a-zçğıöşü\s]/g, '').split(/\s+/).filter(w => w.length > 2);
          
          const matches = titleWords.length > 0 && titleWords.some(word => cleanText.includes(word));
          
          if (matches) {
             setCoverConfirmed(true);
             toast.success('Kapak metni onaylandı!', { id: 'ocr-toast' });
          } else {
             setCoverConfirmed(false);
             setOcrError('Görselde kitap adı bulunamadı. Lütfen kapağı daha net çeken bir fotoğraf yükleyin veya doğruluğundan eminseniz alttaki kutucuğu işaretleyin.');
             toast.error('Kitap adı görselle eşleşmedi!', { id: 'ocr-toast' });
          }
        } catch (ocrErr) {
          console.error('OCR Hatası:', ocrErr);
          setOcrError('Görsel analiz edilemedi. Kapağın doğruluğundan eminseniz manuel onaylayın.');
          toast.dismiss('ocr-toast');
        } finally {
          setIsOcrLoading(false);
        }
      } catch (error) {
        console.error('Görsel sıkıştırma hatası:', error);
        // Fallback to original
        const isSafe = await moderateImage(selectedFile);
        if (!isSafe) {
          toast.error('Görsel uygunsuz içerik içeriyor.');
          return;
        }
        setFile(selectedFile);
        setPreview(URL.createObjectURL(selectedFile));
        setIsManualUpload(true);
        setCoverConfirmed(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate: if there's a manual upload, user must confirm it matches the title
    if (isManualUpload && !coverConfirmed) {
      toast.error('Lütfen yüklediğiniz görselin kitap kapağıyla eşleştiğini onaylayın.');
      return;
    }

    // If no cover provided at all, warn but allow
    if (!formData.cover && !file) {
      toast.error('Lütfen bir kapak görseli ekleyin (arama butonunu veya yükleme alanını kullanın).');
      return;
    }

    setLoading(true);

    let finalCoverUrl = formData.cover;

    if (file) {
      const { uploadImageToStorage } = await import('../lib/image');
      const url = await uploadImageToStorage(file);
      if (url) finalCoverUrl = url;
    }

    await addBook({
      ...formData,
      cover: finalCoverUrl,
      timeCapsule: formData.timeCapsule ? { message: formData.timeCapsule, from: '' } : undefined
    });
    setLoading(false);
    handleClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-ink/70 flex items-end justify-center"
          onClick={handleClose}
        >
          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="bg-parchment-light w-full max-w-md rounded-t-3xl shadow-2xl overflow-y-auto"
            style={{ maxHeight: '94dvh', paddingBottom: 'max(env(safe-area-inset-bottom), 20px)' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Drag indicator */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 bg-ink/20 rounded-full" />
            </div>

            <div className="px-5 pb-2">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-xl font-serif text-ink flex items-center gap-2">
                  <BookOpen className="text-karma" size={22} /> Kitap Ekle
                </h2>
                <button
                  onClick={handleClose}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-ink/5 text-ink/50 active:bg-ink/10 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">

                {/* Kitap Adı + Arama */}
                <div>
                  <label className="block text-xs font-bold text-ink/60 uppercase tracking-wider mb-1.5">Kitap Adı *</label>
                  <div className="flex gap-2">
                    <input
                      required
                      value={formData.title}
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                      className="flex-1 bg-white border border-ink/10 py-3 px-4 rounded-xl text-ink font-medium focus:outline-none focus:border-karma transition-all"
                      placeholder="Örn: Körlük"
                    />
                    <button
                      type="button"
                      onClick={searchGoogleBooks}
                      disabled={isSearching || !formData.title.trim()}
                      className="min-w-[52px] h-[50px] bg-ink text-parchment-light rounded-xl flex items-center justify-center disabled:opacity-40 active:bg-ink/80 transition-colors"
                      title="Otomatik Kapak ve Yazar Bul"
                    >
                      {isSearching
                        ? <div className="w-5 h-5 border-2 border-parchment-light border-t-transparent rounded-full animate-spin" />
                        : <Search size={20} />}
                    </button>
                  </div>
                  <p className="text-[10px] text-ink/40 mt-1">🔍 Arama butonuyla kapak ve yazar otomatik doldurulur</p>
                </div>

                {/* Yazar */}
                <div>
                  <label className="block text-xs font-bold text-ink/60 uppercase tracking-wider mb-1.5">Yazar *</label>
                  <input
                    required
                    value={formData.author}
                    onChange={e => setFormData({ ...formData, author: e.target.value })}
                    className="w-full bg-white border border-ink/10 py-3 px-4 rounded-xl text-ink font-medium focus:outline-none focus:border-karma transition-all"
                    placeholder="Örn: José Saramago"
                  />
                </div>

                {/* Tür */}
                <div>
                  <label className="block text-xs font-bold text-ink/60 uppercase tracking-wider mb-1.5">Tür *</label>
                  <select
                    required
                    value={formData.genre}
                    onChange={e => setFormData({ ...formData, genre: e.target.value })}
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

                {/* Kapak Görseli */}
                <div>
                  <label className="block text-xs font-bold text-ink/60 uppercase tracking-wider mb-1.5">Kapak Görseli *</label>
                  <div className="relative border-2 border-dashed border-ink/20 rounded-xl p-4 text-center active:bg-white/50 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    {preview ? (
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-22 rounded-lg shadow-md overflow-hidden flex-shrink-0 border border-ink/10" style={{ height: '88px' }}>
                          <img src={preview} alt="Kapak Önizleme" className="w-full h-full object-cover" />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-bold text-ink">{formData.title || 'Kitap Kapağı'}</p>
                          <p className="text-xs text-ink/50 mt-0.5">Değiştirmek için dokun</p>
                          {isManualUpload && (
                            <p className="text-[10px] text-amber-600 mt-1 flex items-center gap-1">
                              <AlertCircle size={10} /> Manuel yükleme
                            </p>
                          )}
                          {!isManualUpload && (
                            <p className="text-[10px] text-green-600 mt-1 flex items-center gap-1">
                              <CheckCircle2 size={10} /> Kitap veritabanından
                            </p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-ink/40 py-2">
                        <Upload size={28} />
                        <span className="text-sm font-medium">Cihazdan Görsel Seç</span>
                        <span className="text-[10px]">veya yukarıdan otomatik ara</span>
                      </div>
                    )}
                  </div>

                  {/* Onay kutusu — sadece manuel yükleme yapıldığında */}
                  {isManualUpload && preview && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`mt-2 p-3 border rounded-xl ${coverConfirmed && !ocrError ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}
                    >
                      {isOcrLoading ? (
                        <div className="flex items-center gap-2 text-ink/60 text-xs font-medium py-1">
                          <div className="w-4 h-4 border-2 border-karma border-t-transparent rounded-full animate-spin" />
                          Görsel yapay zeka ile inceleniyor...
                        </div>
                      ) : (
                        <label className="flex items-start gap-3 cursor-pointer">
                          <div className="relative mt-0.5">
                            <input
                              type="checkbox"
                              checked={coverConfirmed}
                              onChange={e => setCoverConfirmed(e.target.checked)}
                              className="sr-only"
                              disabled={coverConfirmed && !ocrError} // If auto-confirmed by OCR, prevent unchecking
                            />
                            <div
                              className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                                coverConfirmed ? 'bg-green-500 border-green-500' : 'bg-white border-amber-400'
                              } ${(coverConfirmed && !ocrError) ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              {coverConfirmed && <CheckCircle2 size={12} className="text-white" />}
                            </div>
                          </div>
                          <div className="flex flex-col">
                            {coverConfirmed && !ocrError ? (
                              <span className="text-xs text-green-800 font-bold leading-relaxed">
                                Yapay Zeka Onayı: Görsel, kitap adıyla başarıyla eşleşti.
                              </span>
                            ) : (
                              <>
                                <span className="text-xs text-amber-800 font-medium leading-relaxed">
                                  Yüklediğim görsel <strong>"{formData.title || 'bu kitabın'}"</strong> kapağıdır ve kitap adıyla eşleşmektedir.
                                </span>
                                {ocrError && <span className="text-[10px] font-bold text-amber-700 mt-1 flex items-start gap-1"><AlertCircle size={12} className="shrink-0 mt-0.5" /> {ocrError}</span>}
                              </>
                            )}
                          </div>
                        </label>
                      )}
                    </motion.div>
                  )}
                </div>

                {/* Kondisyon & Tempo */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-ink/60 uppercase tracking-wider mb-1.5">Durum</label>
                    <select
                      value={formData.condition}
                      onChange={e => setFormData({ ...formData, condition: e.target.value })}
                      className="w-full bg-white border border-ink/10 py-3 px-3 rounded-xl text-ink font-medium focus:outline-none focus:border-karma transition-all text-sm"
                    >
                      <option value="Mint">Mükemmel</option>
                      <option value="Good">İyi</option>
                      <option value="Fair">Orta</option>
                      <option value="Poor">Yıpranmış</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-ink/60 uppercase tracking-wider mb-1.5">Tempo</label>
                    <select
                      value={formData.pace}
                      onChange={e => setFormData({ ...formData, pace: e.target.value })}
                      className="w-full bg-white border border-ink/10 py-3 px-3 rounded-xl text-ink font-medium focus:outline-none focus:border-karma transition-all text-sm"
                    >
                      <option value="Slow">Yavaş</option>
                      <option value="Medium">Orta</option>
                      <option value="Fast">Hızlı</option>
                    </select>
                  </div>
                </div>

                {/* Zaman Kapsülü */}
                <div>
                  <label className="block text-xs font-bold text-ink/60 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    Zaman Kapsülü <span className="text-karma font-normal normal-case">(İsteğe Bağlı)</span>
                  </label>
                  <textarea
                    value={formData.timeCapsule}
                    onChange={e => setFormData({ ...formData, timeCapsule: e.target.value })}
                    className="w-full bg-white border border-ink/10 py-3 px-4 rounded-xl text-ink font-medium focus:outline-none focus:border-karma transition-all resize-none h-20"
                    placeholder="Bu kitabı alan kişiye gizli bir not bırakın..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || (isManualUpload && !coverConfirmed)}
                  className="w-full mt-1 bg-ink text-parchment-light py-4 rounded-xl font-bold shadow-lg shadow-ink/20 active:bg-ink/80 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Ekleniyor...' : 'Kütüphaneye Ekle'}
                </button>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
