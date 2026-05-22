import React, { useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface QRScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (decodedText: string) => void;
}

export const QRScanner: React.FC<QRScannerProps> = ({ isOpen, onClose, onScan }) => {
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    if (isOpen) {
      const html5QrCode = new Html5Qrcode("qr-reader");
      scannerRef.current = html5QrCode;
      
      html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          onScan(decodedText);
          html5QrCode.stop().catch(err => console.error(err));
        },
        () => {
          // parse errors are frequent, ignoring
        }
      ).catch(err => {
        console.error("Error starting scanner", err);
      });

      return () => {
        if (scannerRef.current) {
          scannerRef.current.stop().catch(err => console.error("Error stopping scanner", err));
          scannerRef.current = null;
        }
      };
    }
  }, [isOpen, onScan]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] bg-ink/90 flex flex-col items-center justify-center p-4"
        >
          <div className="w-full max-w-sm relative">
            <button 
              onClick={onClose}
              className="absolute -top-12 right-0 text-white p-2"
            >
              <X size={28} />
            </button>
            <div id="qr-reader" className="w-full bg-black rounded-xl overflow-hidden shadow-2xl"></div>
            <p className="text-white text-center mt-6 text-sm">Takas onay QR kodunu çerçeveye hizalayın.</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
