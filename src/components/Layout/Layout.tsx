import React from 'react';
import { BottomNav } from './BottomNav';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#F5F0E6] flex justify-center">
      <main className="w-full max-w-md bg-parchment-light min-h-[100dvh] relative shadow-2xl overflow-x-hidden">
        <div className="pb-[calc(4rem+env(safe-area-inset-bottom,0px))]">
          {children}
        </div>
        <BottomNav />
      </main>
    </div>
  );
};
