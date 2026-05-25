import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const PrivacyPolicy: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-parchment-light pb-12">
      <header className="p-4 flex items-center justify-between sticky top-0 bg-parchment-light/90 backdrop-blur-sm z-10 border-b border-ink/5">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 bg-white rounded-full shadow-sm text-ink/60 active:text-ink transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="font-serif font-bold text-lg text-ink">Gizlilik & Şartlar</h1>
        <div className="w-10 h-10 flex items-center justify-center text-karma">
          <ShieldCheck size={24} />
        </div>
      </header>

      <main className="px-5 mt-6 max-w-2xl mx-auto space-y-8">
        <motion.section 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <h2 className="font-serif text-xl font-bold text-ink">Kullanıcı Sözleşmesi ve Şartlar</h2>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-ink/5 text-sm text-ink/80 space-y-4 leading-relaxed">
            <p>
              1. <strong>UGC (Kullanıcı Tarafından Oluşturulan İçerik):</strong> Parsömen, kullanıcıların birbirleriyle mesajlaşmasına ve içerik paylaşmasına olanak tanır. Kullanıcılar, oluşturdukları içeriklerden tamamen kendileri sorumludur.
            </p>
            <p>
              2. <strong>Sakıncalı İçerik:</strong> Parsömen'de hakaret, nefret söylemi, cinsel içerik veya yasa dışı unsurlar paylaşmak kesinlikle yasaktır. Bu tür içerikleri paylaşan kullanıcıların hesapları kalıcı olarak silinir.
            </p>
            <p>
              3. <strong>Şikayet ve Engelleme:</strong> Diğer kullanıcıları profil sayfalarından, mesajlaşma ekranlarından engelleyebilir ve şikayet edebilirsiniz. Şikayet edilen içerikler moderasyon ekibimiz tarafından 24 saat içerisinde incelenir.
            </p>
          </div>
        </motion.section>

        <motion.section 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <h2 className="font-serif text-xl font-bold text-ink">Gizlilik Politikası</h2>
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-ink/5 text-sm text-ink/80 space-y-4 leading-relaxed">
            <p>
              1. <strong>Toplanan Veriler:</strong> Profil oluştururken sağladığınız isim, e-posta ve isteğe bağlı profil fotoğrafınız sunucularımızda güvenle saklanır.
            </p>
            <p>
              2. <strong>Konum Verisi:</strong> Yakındaki okuma odalarını ve kitapları görebilmeniz için konum veriniz istenir. Bu veri sadece cihazınızda ve geçici bir süre eşleştirme algoritmasında kullanılır, kalıcı olarak takip edilmez.
            </p>
            <p>
              3. <strong>Kamera Erişimi:</strong> Kamera, sadece kitap kapağı doğrulama ve profil fotoğrafı yükleme amaçlarıyla kullanılır. Yapay zeka ile incelenen fotoğraflar yasa dışı bir durum olmadıkça 3. partilerle paylaşılmaz.
            </p>
            <p>
              4. <strong>Hesap Silme:</strong> "Profil &gt; Hesap" menüsünden dilediğiniz zaman hesabınızı silebilirsiniz. Hesap silindiğinde tüm kişisel verileriniz ve mesajlarınız veritabanımızdan kalıcı olarak yok edilir.
            </p>
          </div>
        </motion.section>
      </main>
    </div>
  );
};
