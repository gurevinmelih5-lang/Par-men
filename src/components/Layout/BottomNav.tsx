import React from 'react';
import { Home, Compass, MapPin, User as UserIcon, Swords } from 'lucide-react';
import { useStore } from '../../store/useStore';
import clsx from 'clsx';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, requestedSwaps } = useStore();

  const tabs = [
    { id: 'dashboard' as const, icon: Home, label: 'Pano' },
    { id: 'discovery' as const, icon: Compass, label: 'Keşfet' },
    { id: 'arena' as const, icon: Swords, label: 'Arena' },
    { id: 'swap' as const, icon: MapPin, label: 'Takas' },
    { id: 'profile' as const, icon: UserIcon, label: 'Profil' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-parchment-light border-t border-ink/10 pb-safe z-50">
      <div className="max-w-md mx-auto flex justify-around items-center h-16">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors duration-200 relative",
                isActive ? "text-ink" : "text-ink/40 hover:text-ink/60"
              )}
            >
              <div className="relative">
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                {tab.id === 'swap' && requestedSwaps.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-parchment-light" />
                )}
              </div>
              <span className="text-[10px] font-medium tracking-wider uppercase">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
