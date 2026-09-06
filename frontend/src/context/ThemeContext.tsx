import React, { createContext, useContext, useState, useLayoutEffect } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Always start with 'light' — ignore any previously saved value
  const [theme, setTheme] = useState<Theme>('light');

  // Run synchronously before paint so there's no flash
  useLayoutEffect(() => {
    const root = document.documentElement;
    // Force remove dark class and ensure light theme
    root.classList.remove('dark');
    root.setAttribute('data-theme', 'light');
    // Overwrite any stale saved value
    localStorage.setItem('trippilot_theme', 'light');
  }, []); // only on mount

  useLayoutEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.setAttribute('data-theme', 'light');
    }
    localStorage.setItem('trippilot_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
