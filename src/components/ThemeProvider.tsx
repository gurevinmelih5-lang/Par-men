import React, { useEffect } from 'react';
import { useStore } from '../store/useStore';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme } = useStore();

  useEffect(() => {
    if (theme === 'gold') {
      document.documentElement.classList.add('theme-gold');
    } else {
      document.documentElement.classList.remove('theme-gold');
    }
  }, [theme]);

  return <>{children}</>;
};
