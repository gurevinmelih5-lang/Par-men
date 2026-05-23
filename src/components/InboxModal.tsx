import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Inbox, ChevronRight } from 'lucide-react';
import { useStore } from '../store/useStore';
import { SwapTableModal } from './SwapTableModal';
import type { SwapRequest } from '../store/slices/bookSlice';

interface InboxModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InboxModal: React.FC<InboxModalProps> = ({ isOpen, onClose }) => {
  const { incomingRequests } = useStore();
  const [selectedRequest, setSelectedRequest] = useState<SwapRequest | null>(null);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-ink/60 backdrop-blur-sm z-[100] flex items-end justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 20, scale: 0.98 }}
          animate={{ y: 0, scale: 1 }}
          exit={{ y: 20, scale: 0.98 }}
          className="bg-parchment-light w-full max-w-md rounded-t-3xl sm:rounded-3xl flex flex-col shadow-2xl overflow-hidden"
          style={{ maxHeight: '85dvh', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-ink p-4 flex justify-between items-center text-parchment-light shadow-md z-10 relative">
            <h2 className="font-serif text-lg font-bold flex items-center gap-2">
              <Inbox size={18} />
              Gelen Takas Talepleri
            </h2>
            <button onClick={onClose} className="p-1.5 hover:bg-parchment-light/10 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 overflow-y-auto flex-1 bg-white">
            {incomingRequests.length === 0 ? (
              <div className="py-12 text-center text-ink/50 flex flex-col items-center">
                <Inbox size={40} className="opacity-20 mb-3" />
                <p>Henüz gelen bir talep yok.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {incomingRequests.map(req => (
                  <div
                    key={req.id}
                    onClick={() => setSelectedRequest(req)}
                    className="flex items-center gap-4 p-3 rounded-2xl border border-ink/5 hover:border-karma/50 bg-parchment-light/30 cursor-pointer transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border border-ink/10">
                      <img src={req.requesterAvatar} alt={req.requesterName} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-serif font-bold text-ink text-sm">{req.requesterName}</h4>
                      <p className="text-xs text-ink/60 truncate">"{req.bookTitle}" kitabını istiyor</p>
                    </div>
                    <ChevronRight size={18} className="text-ink/30 shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Review Request Modal */}
      {selectedRequest && (
        <SwapTableModal
          isOpen={true}
          onClose={() => {
            setSelectedRequest(null);
            onClose(); // Optional: Close inbox too when done, or let them go back to it
          }}
          request={selectedRequest}
        />
      )}
    </AnimatePresence>
  );
};
