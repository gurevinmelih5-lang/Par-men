import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ChevronDown,
  BookOpen,
  Map,
  Shield,
  Compass,
  Smartphone,
  Swords,
  Layers,
  MapPin,
} from 'lucide-react';

interface UserManualProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UserManual: React.FC<UserManualProps> = ({ isOpen, onClose }) => {
  const [openSection, setOpenSection] = useState<string | null>('nav');

  const toggleSection = (id: string) => {
    setOpenSection((prev) => (prev === id ? null : id));
  };

  const sections = [
    {
      id: 'nav',
      icon: <Smartphone className="text-ink" size={20} />,
      title: 'Uygulamada Gezinme',
      content: (
        <div className="space-y-3 text-sm text-ink/80">
          <p>
            Parşömen tek sütunlu bir mobil deneyimdir; ana içerik ortada, en fazla <strong>tablet genişliğinde</strong> görünür.
          </p>
          <p className="font-bold text-ink">Alt menü</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>Pano:</strong> Şu an okuduğun kitap, ilerleme çubuğu ve çevrendeki öneriler.
            </li>
            <li>
              <strong>Keşfet:</strong> Kitap ve okur araması, ruh haline göre filtre, okuma odaları ve <strong>Fikir Arenası</strong> girişi.
            </li>
            <li>
              <strong>Takas:</strong> Harita; takas / edebî atlas / gezgin modları, pin seçimi ve takas masası.
            </li>
            <li>
              <strong>Profil:</strong> Kitaplığın, gelen takas istekleri, tema, konum güncelleme ve bu rehber.
            </li>
          </ul>
          <p>
            Kitap kartına veya detayına girdiğinde alt menü yerine <strong>geri</strong> okları ve sekme geçmişi kullanılır; çıkışta kaldığın ana sekmeye dönersin.
          </p>
        </div>
      ),
    },
    {
      id: 'karma',
      icon: <Shield className="text-karma" size={20} />,
      title: 'Karma Sistemi ve Unvanlar',
      content: (
        <div className="space-y-3 text-sm text-ink/80">
          <p>
            <strong>Parşömen Kalitesi (Karma)</strong>, ekosistemdeki güvenilirliğini ve katkını gösterir. Üç temel bileşenden oluşur:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>Fiziksel Kondisyon:</strong> Takas ettiğin kitapların durumu. İyi baktığın kitaplar puanını artırır.
            </li>
            <li>
              <strong>Entelektüel Katkı:</strong> Bıraktığın Scriptum&apos;ların (notların) kalitesi, beğeniler ve{' '}
              <strong>Fikir Arenası</strong>&apos;nda düello oylarına katılım.
            </li>
            <li>
              <strong>Sosyal Güvenilirlik:</strong> Takaslara zamanında gitmen ve iletişim nezaketin.
            </li>
          </ul>
          <p className="font-bold text-ink">Unvanlar</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <span className="text-karma font-bold">Mühürlü Okur (80+ Karma):</span> Altın tema kilidini açar, profilde vurgulanırsın.
            </li>
            <li>
              <span className="text-ink font-bold">Filozof:</span> Entelektüel puanı yüksek okurlar.
            </li>
            <li>
              <span className="text-ink font-bold">Arşivci:</span> Kitaplarına en iyi bakan okurlar.
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: 'swap',
      icon: <Map className="text-blue-500" size={20} />,
      title: 'Takas İşlemi Nasıl Yapılır?',
      content: (
        <div className="space-y-3 text-sm text-ink/80">
          <ol className="list-decimal pl-5 space-y-2">
            <li>
              <strong>Keşfet</strong> veya <strong>Pano</strong>&apos;dan bir kitap seç; sahibi sen değilsen <strong>Takas İste</strong> veya benzeri eylemi kullan.
            </li>
            <li>
              Haritada <strong>Takas</strong> sekmesinde pinlere dokun; açılan karttan da istek gönderebilirsin.
            </li>
            <li>
              Sahip onayladığında <strong>Profil</strong> bölümündeki gelen isteklerden sohbete geçebilir veya sistem seni sohbet ekranına yönlendirir.
            </li>
            <li>
              Sohbette <strong>güvenli, kalabalık bir buluşma noktası</strong> ve saat netleştirilir.
            </li>
            <li>
              Buluşmada <strong>Takas Masası</strong>&apos;nı aç; karşı taraf <strong>QR kodunu</strong> okutarak devir işlemini onaylar.
            </li>
          </ol>
          <p className="italic text-xs mt-2 text-ink/60">
            * Takasları yalnızca güvendiğin ortak alanlarda yap; uygulama fiziksel buluşmanın güvenliğinden sorumlu değildir.
          </p>
        </div>
      ),
    },
    {
      id: 'scriptum',
      icon: <Layers className="text-karma" size={20} />,
      title: 'Katmanlar (Scriptum) ve Kitap Detayı',
      content: (
        <div className="space-y-3 text-sm text-ink/80">
          <p>
            Bir kitabın <strong>Kitap Detayı</strong> ekranında kapak ve meta bilgilerin altında <strong>soyağacı</strong> (kim, ne zaman geçirdi) ve{' '}
            <strong>Katmanlar</strong> bulunur.
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              Üst bardan <strong>Katman</strong> sayısına dokunarak tam ekran liste ve düello kartlarını açarsın.
            </li>
            <li>
              <strong>Yeni katman ekle</strong> ile kitaba not, alıntı veya düşünce bırakırsın; topluluk beğenileri Entelektüel Karma&apos;ya yansır.
            </li>
            <li>
              Bir düello varsa <strong>Haklı / Hatalı</strong> oyları topluluğun eğilimini gösterir; her scriptum için bir kez oy kullanman önerilir.
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: 'arena',
      icon: <Swords className="text-karma" size={20} />,
      title: 'Fikir Arenası',
      content: (
        <div className="space-y-3 text-sm text-ink/80">
          <p>
            <strong>Keşfet</strong> sayfasındaki <strong>Fikir Arenası</strong> kartından girilir. Burada düello bağlantılı Scriptum&apos;lar kart destesi gibi sırayla gösterilir.
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>Haklı / Hatalı</strong> seçeneklerinden birine dokun; kısa geri bildirim animasyonundan sonra sıradaki karta geçilir.
            </li>
            <li>
              Oy vermek Entelektüel Karma kazandırır (uygulama içi kurallar geçerlidir).
            </li>
            <li>
              Liste bittiğinde veya düello yoksa ekran sana <strong>Keşfet</strong> veya kitap ekleme yolu önerir.
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: 'rooms',
      icon: <BookOpen className="text-green-500" size={20} />,
      title: 'Okuma Odaları',
      content: (
        <div className="space-y-3 text-sm text-ink/80">
          <p>
            <strong>Keşfet</strong> içinde <strong>Odalar</strong> sekmesinde listelenirler. Canlı veya planlı oturumları görebilir, boş kontenjana sahip odalara{' '}
            <strong>Katıl</strong> veya <strong>Kaydol</strong> dersin.
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>Yeni oda kurmak</strong> için profilinde yeterli toplam Karma gerekir (ekrandaki eşik değeri geçerlidir).
            </li>
            <li>
              Oda adı, türü, başlangıç saati ve maksimum katılımcı sayısı formdan girilir; oluşturduğun oda listeye eklenir.
            </li>
            <li>
              Odalar şu an istemci tarafında örnek veriyle zenginleştirilmiştir; ileride tam sunucu entegrasyonu için altyapı hazırdır.
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: 'atlas',
      icon: <Compass className="text-purple-500" size={20} />,
      title: 'Harita: Takas, Atlas ve Gezgin',
      content: (
        <div className="space-y-3 text-sm text-ink/80">
          <p>
            <strong>Takas</strong> sekmesindeki haritanın üstünde üç mod bulunur:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>Takas:</strong> Takas edilebilir kitapların yakınındaki pinler.
            </li>
            <li>
              <strong>Edebi atlas:</strong> Romanlara veya okumaya bağlı özel konumlar (mor pinler vb.).
            </li>
            <li>
              <strong>Gezgin:</strong> Konumuna yakın kurgusal duraklar haritada pinlenir; listede ve detayda «yazar — kitap» bağlamında sahne başlığı ve kitaptan alıntı tarzı özet görürsün.
            </li>
          </ul>
          <p className="flex items-start gap-2 text-xs text-ink/60">
            <MapPin size={14} className="shrink-0 mt-0.5" />
            Konumunu <strong>Profil</strong>&apos;den güncellediğinde mesafe ve harita önerileri daha isabetli olur.
          </p>
        </div>
      ),
    },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-sm flex justify-center items-end sm:items-center p-0 sm:p-4 touch-manipulation"
          onClick={onClose}
          role="presentation"
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="bg-parchment-light w-full max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col max-h-[min(85dvh,900px)] sm:max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="manual-title"
          >
            <div className="p-4 sm:p-6 pt-safe border-b border-ink/10 flex items-center justify-between bg-parchment shrink-0">
              <div>
                <h2 id="manual-title" className="font-serif text-2xl font-bold text-ink">
                  Parşömen Rehberi
                </h2>
                <p className="text-xs text-ink/60 mt-1">Sekmeler, takas, katmanlar ve Arena — adım adım</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="min-w-[44px] min-h-[44px] rounded-full bg-ink/5 flex items-center justify-center text-ink/50 hover:bg-ink/10 hover:text-ink transition-colors"
                aria-label="Rehberi kapat"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto overscroll-y-contain p-4 sm:p-6 space-y-3 hide-scrollbar pb-safe">
              {sections.map((section) => (
                <div
                  key={section.id}
                  className={`bg-white border rounded-2xl overflow-hidden transition-colors ${
                    openSection === section.id ? 'border-karma/30 shadow-md' : 'border-ink/5'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center justify-between p-4 text-left min-h-[48px] focus:outline-none focus-visible:ring-2 focus-visible:ring-karma/40 rounded-2xl"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`p-2 rounded-xl shrink-0 ${openSection === section.id ? 'bg-karma/10' : 'bg-ink/5'}`}
                      >
                        {section.icon}
                      </div>
                      <span
                        className={`font-serif font-bold text-left break-words ${
                          openSection === section.id ? 'text-ink' : 'text-ink/80'
                        }`}
                      >
                        {section.title}
                      </span>
                    </div>
                    <ChevronDown
                      size={18}
                      className={`shrink-0 text-ink/40 transition-transform duration-300 ${
                        openSection === section.id ? 'rotate-180 text-karma' : ''
                      }`}
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
                        <div className="p-4 pt-0 border-t border-ink/5 mt-2 bg-parchment-light/30">{section.content}</div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}

              <div className="mt-8 text-center p-6 border-t border-dashed border-ink/20">
                <p className="text-[10px] text-ink/40 font-bold tracking-widest uppercase mb-2">Destek İçin</p>
                <p className="text-xs text-ink/60">
                  Bir hata, takas uyuşmazlığı veya hesap sorunu için bize yazabilirsin. Aşağıdaki bağlantı e-posta uygulamanı açar.
                </p>
                <a
                  href="mailto:destek@parsomen.com?subject=Par%C5%9F%C3%B6men%20Destek"
                  className="mt-4 inline-flex min-h-[44px] items-center justify-center px-4 text-sm font-bold text-karma hover:underline"
                >
                  destek@parsomen.com
                </a>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
