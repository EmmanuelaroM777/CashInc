import React, { createContext, useState, useEffect } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Retrieve saved theme from localStorage, default to 'dark'
    const saved = localStorage.getItem('cashinc-theme');
    return saved || 'dark';
  });

  useEffect(() => {
    // Apply theme to the root HTML element
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('cashinc-theme', theme);
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
