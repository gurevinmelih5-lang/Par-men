import React from 'react';
import { Home, Compass, MapPin, User as UserIcon } from 'lucide-react';
import { useStore } from '../../store/useStore';
import clsx from 'clsx';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, requestedSwaps, openSwapChats } = useStore();

  const tabs = [
    { id: 'dashboard' as const, icon: Home, label: 'Pano' },
    { id: 'discovery' as const, icon: Compass, label: 'Keşfet' },
    { id: 'swap' as const, icon: MapPin, label: 'Takas' },
    { id: 'profile' as const, icon: UserIcon, label: 'Profil' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-parchment-light border-t border-ink/10 z-50 pb-safe touch-manipulation">
      <div className="max-w-md mx-auto flex justify-around items-stretch min-h-[calc(4rem+env(safe-area-inset-bottom,0px))]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                "flex flex-col items-center justify-center w-full min-h-[48px] flex-1 space-y-1 transition-colors duration-200 relative active:opacity-80",
                isActive ? "text-ink" : "text-ink/40 hover:text-ink/60"
              )}
            >
              <div className="relative">
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                {tab.id === 'profile' && openSwapChats.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full border border-parchment-light" />
                )}
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
