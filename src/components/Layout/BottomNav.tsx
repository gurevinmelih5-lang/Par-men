import React from 'react';
import { Home, Compass, MapPin, User as UserIcon, Layers } from 'lucide-react';
import { useStore } from '../../store/useStore';
import clsx from 'clsx';

export const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab, requestedSwaps, openSwapChats } = useStore();

  const tabs = [
    { id: 'dashboard' as const, icon: Home, label: 'Pano' },
    { id: 'discovery' as const, icon: Compass, label: 'Keşfet' },
    { id: 'scriptumFeed' as const, icon: Layers, label: 'Akış' },
    { id: 'swap' as const, icon: MapPin, label: 'Takas' },
    { id: 'profile' as const, icon: UserIcon, label: 'Profil' },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 bg-parchment-light border-t border-ink/10 z-50 no-select"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 0px)' }}
    >
      <div className="max-w-md mx-auto flex justify-around items-stretch" style={{ minHeight: '56px' }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                'flex flex-col items-center justify-center w-full flex-1 space-y-0.5 transition-all duration-200 relative active:scale-90 tap-target',
                isActive ? 'text-ink' : 'text-ink/40'
              )}
            >
              <div className="relative">
                <Icon
                  size={22}
                  strokeWidth={isActive ? 2.5 : 2}
                  className={clsx('transition-transform duration-150', isActive && 'scale-110')}
                />
                {tab.id === 'profile' && openSwapChats.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full border border-parchment-light" />
                )}
                {tab.id === 'swap' && requestedSwaps.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border border-parchment-light" />
                )}
              </div>
              <span className={clsx(
                'text-[9px] font-bold tracking-widest uppercase transition-all duration-200',
                isActive ? 'opacity-100' : 'opacity-60'
              )}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
