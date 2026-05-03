import React from 'react';
import { BottomNav } from './BottomNav';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#F5F0E6] flex justify-center">
      <main className="w-full max-w-md bg-parchment-light min-h-screen relative shadow-2xl overflow-x-hidden">
        <div className="pb-20">
          {children}
        </div>
        <BottomNav />
      </main>
    </div>
  );
};
