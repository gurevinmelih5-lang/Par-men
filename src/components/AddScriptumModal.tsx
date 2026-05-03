import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageSquarePlus } from 'lucide-react';
import { useStore } from '../store/useStore';

interface AddScriptumModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookId: string;
}

export const AddScriptumModal: React.FC<AddScriptumModalProps> = ({ isOpen, onClose, bookId }) => {
  const { addScriptum } = useStore();
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState('');
  const [highlightedText, setHighlightedText] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await addScriptum({
      bookId,
      content,
      highlightedText: highlightedText || undefined
    });
    setLoading(false);
    setContent('');
    setHighlightedText('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-parchment-light w-full max-w-sm rounded-3xl p-6 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-serif text-ink flex items-center gap-2">
                <MessageSquarePlus className="text-karma" /> Katman Ekle
              </h2>
              <button onClick={onClose} className="text-ink/40 hover:text-ink transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-ink/60 uppercase tracking-wider mb-1">Kitaptan Alıntı (Opsiyonel)</label>
                <input 
                  value={highlightedText}
                  onChange={e => setHighlightedText(e.target.value)}
                  className="w-full bg-white border border-ink/10 py-3 px-4 rounded-xl text-ink font-medium focus:outline-none focus:border-karma transition-all" 
                  placeholder="Hangi cümleyi işaretliyorsun?" 
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-ink/60 uppercase tracking-wider mb-1">Senin Düşüncen</label>
                <textarea 
                  required
                  rows={4}
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  className="w-full bg-white border border-ink/10 py-3 px-4 rounded-xl text-ink font-medium focus:outline-none focus:border-karma transition-all resize-none" 
                  placeholder="Bu satırlar sana ne hissettirdi?" 
                />
              </div>

              <button 
                type="submit" 
                disabled={loading}
                className="w-full mt-2 bg-ink text-parchment-light py-4 rounded-xl font-bold shadow-lg shadow-ink/20 hover:bg-ink/90 transition-all active:scale-[0.98]"
              >
                {loading ? 'Ekleniyor...' : 'Sayfaya İşle'}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
