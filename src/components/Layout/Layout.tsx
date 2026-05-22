import React from 'react';
import { BottomNav } from './BottomNav';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex justify-center bg-[#F5F0E6] min-h-[100dvh]">
      <main className="w-full max-w-md bg-parchment-light relative shadow-2xl overflow-x-hidden min-h-[100dvh]">
        {children}
        <BottomNav />
      </main>
    </div>
  );
};
