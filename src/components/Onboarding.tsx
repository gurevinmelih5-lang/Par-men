import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Map, BookOpen, ArrowLeftRight, User, X, Compass } from 'lucide-react';

const STORAGE_KEY = 'parsomen_onboarded_v1';

interface Step {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

const steps: Step[] = [
  {
    icon: <span className="text-4xl">📜</span>,
    title: "Parşömen'e Hoş Geldin!",
    description: "Kitaplarını rafta tozlandırmak yerine onlara bir yolculuk yap! Parşömen, kitapları elden ele dolaştıran, her kitaba bir kimlik kazandıran edebi bir ekosistemdir.",
    color: 'from-karma/20 to-karma/5',
  },
  {
    icon: <Map size={40} className="text-blue-500" />,
    title: "Hiper-Lokal Takas Haritası",
    description: "\"Takas\" sekmesinde çevrenizdeki kitapları haritada görün. Efsanevi kitaplar altın pinlerle parlıyor! \"Edebi Harita\" ile şehrin hangi semtinde hangi tür kitapların gezdiğini keşfet.",
    color: 'from-blue-100 to-blue-50',
  },
  {
    icon: <Compass size={40} className="text-purple-500" />,
    title: "Kitap Gezgini Modu",
    description: "Sokaklarda yürürken romanların geçtiği mekanları keşfet! Gerçek dünyada bir kitabın izini sürdüğünde, Parşömen sana o mekanın kurgusal tarihini bildirim olarak gönderir.",
    color: 'from-purple-100 to-indigo-50',
  },
  {
    icon: <BookOpen size={40} className="text-purple-500" />,
    title: "Kitap DNA'sı & Scriptum",
    description: "Her kitabın bir karakteri var! Kitap detayında DNA profilini gör: hangi saatlerde okunuyor, baskın duygular neler... Scriptum bırakarak düşüncelerini gelecek okurlarla paylaş.",
    color: 'from-purple-100 to-purple-50',
  },
  {
    icon: <ArrowLeftRight size={40} className="text-green-500" />,
    title: "Takas İste, Sohbet Et",
    description: "Beğendiğin kitaba \"İste\" butonuna bas. Kitap sahibi onayladığında kitap kütüphanene eklenir ve buluşma yerini ayarlamak için özel bir sohbet odası açılır.",
    color: 'from-green-100 to-green-50',
  },
  {
    icon: <User size={40} className="text-karma" />,
    title: "Karma & Unvanlar",
    description: "Her takasla, bıraktığın Scriptum'larla Karma puanın yükselir. 75+ Karma ile Okuma Odası kurabilir, 80+ ile özel \"Mühürlü Okur\" unvanına ve Altın Tema'ya kavuşursun!",
    color: 'from-karma/20 to-amber-50',
  },
];

interface OnboardingProps {
  onComplete: () => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const isLast = step === steps.length - 1;
  const current = steps[step];

  const handleComplete = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    onComplete();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] bg-ink/70 backdrop-blur-sm flex items-end justify-center p-4"
      >
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 60, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.98 }}
          transition={{ type: 'spring', damping: 28, stiffness: 320 }}
          className="w-full max-w-md bg-parchment-light rounded-3xl overflow-hidden shadow-2xl"
        >
          {/* Gradient top area */}
          <div className={`bg-gradient-to-br ${current.color} p-10 flex flex-col items-center justify-center relative`}>
            <button
              onClick={handleComplete}
              className="absolute top-4 right-4 text-ink/30 hover:text-ink/60 transition-colors"
            >
              <X size={20} />
            </button>
            <div className="w-20 h-20 rounded-3xl bg-white/60 backdrop-blur-sm flex items-center justify-center shadow-lg mb-2">
              {current.icon}
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <h2 className="font-serif text-2xl font-bold text-ink mb-3 leading-tight">{current.title}</h2>
            <p className="text-sm text-ink/70 leading-relaxed mb-6">{current.description}</p>

            {/* Step dots */}
            <div className="flex items-center justify-center gap-2 mb-6">
              {steps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setStep(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === step ? 'w-6 bg-ink' : 'w-1.5 bg-ink/20'
                  }`}
                />
              ))}
            </div>

            <div className="flex gap-3">
              {step > 0 && (
                <button
                  onClick={() => setStep(s => s - 1)}
                  className="flex-1 border border-ink/10 text-ink/60 py-3 rounded-xl text-sm font-bold hover:bg-parchment-dark/20 transition-colors"
                >
                  Geri
                </button>
              )}
              <button
                onClick={isLast ? handleComplete : () => setStep(s => s + 1)}
                className="flex-1 bg-ink text-parchment-light py-3 rounded-xl text-sm font-bold shadow-lg shadow-ink/20 hover:bg-ink/90 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
              >
                {isLast ? 'Başlayalım! 🚀' : 'Devam'}
                {!isLast && <ChevronRight size={16} />}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export const useOnboarding = () => {
  const [showOnboarding, setShowOnboarding] = React.useState(() => {
    return !localStorage.getItem(STORAGE_KEY);
  });
  return { showOnboarding, completeOnboarding: () => setShowOnboarding(false) };
};
