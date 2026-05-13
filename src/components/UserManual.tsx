import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown, BookOpen, Map, Shield, Compass } from 'lucide-react';

interface UserManualProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserManual: React.FC<UserManualProps> = ({ isOpen, onClose }) => {
  const [openSection, setOpenSection] = useState<string | null>('karma');

  const toggleSection = (id: string) => {
    setOpenSection(prev => prev === id ? null : id);
  };

  const sections = [
    {
      id: 'karma',
      icon: <Shield className="text-karma" size={20} />,
      title: "Karma Sistemi ve Unvanlar",
      content: (
        <div className="space-y-3 text-sm text-ink/80">
          <p><strong>Parşömen Kalitesi (Karma)</strong>, ekosistemdeki güvenilirliğini ve katkını gösterir. Üç temel bileşenden oluşur:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Fiziksel Kondisyon:</strong> Takas ettiğin kitapların durumu. İyi baktığın kitaplar puanını artırır.</li>
            <li><strong>Entelektüel Katkı:</strong> Bıraktığın Scriptum'ların (notların) kalitesi ve aldığı beğeniler.</li>
            <li><strong>Sosyal Güvenilirlik:</strong> Takaslara zamanında gitmen ve iletişim nezaketin.</li>
          </ul>
          <p><strong>Unvanlar:</strong></p>
          <ul className="list-disc pl-5 space-y-1">
            <li><span className="text-karma font-bold">Mühürlü Okur (80+ Karma):</span> Altın tema kilidini açar, platformda öncelikli listelenir.</li>
            <li><span className="text-ink font-bold">Filozof:</span> Entelektüel puanı en yüksek okurlar.</li>
            <li><span className="text-ink font-bold">Arşivci:</span> Kitaplarına en iyi bakan okurlar.</li>
          </ul>
        </div>
      )
    },
    {
      id: 'swap',
      icon: <Map className="text-blue-500" size={20} />,
      title: "Takas İşlemi Nasıl Yapılır?",
      content: (
        <div className="space-y-3 text-sm text-ink/80">
          <ol className="list-decimal pl-5 space-y-2">
            <li>Haritadan veya Keşfet bölümünden bir kitap bul ve <strong>"İste"</strong> butonuna tıkla.</li>
            <li>Kitap sahibi onayladığında sistem size özel, geçici bir <strong>Sohbet Odası</strong> açar.</li>
            <li>Sohbette güvenli bir buluşma noktası belirleyin (Örn: Kadıköy İskele).</li>
            <li>Buluştuğunuzda Takas Masası'nı açın, karşı taraf <strong>QR kodunu okutarak</strong> kitabın yeni sahibi olduğunu onaylasın.</li>
          </ol>
          <p className="italic text-xs mt-2 text-ink/60">* Takaslar sadece güvenli kabul edilen ortak alanlarda yapılmalıdır.</p>
        </div>
      )
    },
    {
      id: 'rooms',
      icon: <BookOpen className="text-green-500" size={20} />,
      title: "Okuma Odaları Nedir?",
      content: (
        <div className="space-y-3 text-sm text-ink/80">
          <p><strong>Okuma Odaları</strong>, kullanıcıların dijital ortamda bir araya gelip kitap okuduğu veya tartıştığı özel alanlardır.</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Oda kurabilmek için <strong>en az 75 Karma</strong> puanına ihtiyacın vardır.</li>
            <li>Sessiz okuma seansları, felsefe tartışmaları veya gece okumaları düzenleyebilirsin.</li>
            <li>Odalara katılmak Karma kazandırır!</li>
          </ul>
        </div>
      )
    },
    {
      id: 'atlas',
      icon: <Compass className="text-purple-500" size={20} />,
      title: "Kitap Gezgini Modu",
      content: (
        <div className="space-y-3 text-sm text-ink/80">
          <p>Şehrin sokaklarında yürürken bir kitabın sayfalarında dolaştığını hayal et!</p>
          <p>Harita sekmesinden <strong>"Gezgin"</strong> modunu açtığında, romanlarda geçen gerçek mekanları mor pinlerle görürsün.</p>
          <p>Konumunu açık tutarsan, <strong>Masumiyet Müzesi</strong> veya <strong>Dan Brown'ın Cehennem'i</strong> gibi kitapların geçtiği bir sokağa yaklaştığında Parşömen sana anında bildirim gönderir.</p>
        </div>
      )
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-sm flex justify-center items-end sm:items-center p-0 sm:p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-parchment-light w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col h-[85vh] sm:h-[80vh] overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-ink/10 flex items-center justify-between bg-parchment shrink-0">
              <div>
                <h2 className="font-serif text-2xl font-bold text-ink">Parşömen Rehberi</h2>
                <p className="text-xs text-ink/60 mt-1">Uygulamanın tüm sırları burada</p>
              </div>
              <button 
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-ink/5 flex items-center justify-center text-ink/50 hover:bg-ink/10 hover:text-ink transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 hide-scrollbar">
              {sections.map((section) => (
                <div 
                  key={section.id} 
                  className={`bg-white border rounded-2xl overflow-hidden transition-colors ${openSection === section.id ? 'border-karma/30 shadow-md' : 'border-ink/5'}`}
                >
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center justify-between p-4 text-left focus:outline-none"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-xl ${openSection === section.id ? 'bg-karma/10' : 'bg-ink/5'}`}>
                        {section.icon}
                      </div>
                      <span className={`font-serif font-bold ${openSection === section.id ? 'text-ink' : 'text-ink/80'}`}>
                        {section.title}
                      </span>
                    </div>
                    <ChevronDown 
                      size={18} 
                      className={`text-ink/40 transition-transform duration-300 ${openSection === section.id ? 'rotate-180 text-karma' : ''}`} 
                    />
                  </button>
                  
                  <AnimatePresence>
                    {openSection === section.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 pt-0 border-t border-ink/5 mt-2 bg-parchment-light/30">
                          {section.content}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
              
              <div className="mt-8 text-center p-6 border-t border-dashed border-ink/20">
                <p className="text-[10px] text-ink/40 font-bold tracking-widest uppercase mb-2">Destek İçin</p>
                <p className="text-xs text-ink/60">Bir sorunla karşılaşırsan veya takas esnasında problem yaşarsan bizimle iletişime geçebilirsin.</p>
                <button className="mt-3 text-xs font-bold text-karma hover:underline">destek@parsomen.com</button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
