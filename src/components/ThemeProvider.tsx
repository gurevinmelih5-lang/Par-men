import React, { useEffect } from 'react';
import { useStore } from '../store/useStore';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { theme } = useStore();

  useEffect(() => {
    // Remove all previous theme classes
    document.documentElement.classList.remove('theme-dark', 'theme-gold', 'theme-gold-dark');
    
    // Add current theme class if it's not the default 'light' theme
    if (theme !== 'light') {
      document.documentElement.classList.add(`theme-${theme}`);
    }
  }, [theme]);

  return <>{children}</>;
};
