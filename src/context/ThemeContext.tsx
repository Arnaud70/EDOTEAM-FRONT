import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'default' | 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const stored = localStorage.getItem('site-theme');
      return (stored as Theme) || 'default';
    } catch (e) {
      return 'default';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('site-theme', theme);
    } catch (e) {}
    document.documentElement.setAttribute('data-site-theme', theme);
  }, [theme]);

  const toggleTheme = () => setThemeState((t) => {
    if (t === 'default') return 'light';
    if (t === 'light') return 'dark';
    return 'default';
  });
  const setTheme = (t: Theme) => setThemeState(t);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};

export default ThemeContext;
