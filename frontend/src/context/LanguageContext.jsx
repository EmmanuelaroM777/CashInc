import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../locales/translations';
import { AuthContext } from './AuthContext';

export const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  
  // Default to 'es' but try to get it from the user profile if available
  const [language, setLanguage] = useState('es');

  useEffect(() => {
    if (user && user.language) {
      setLanguage(user.language);
    }
  }, [user]);

  // Function to retrieve translated strings by dot notation key (e.g. "sidebar.dashboard")
  const t = (key) => {
    const keys = key.split('.');
    let value = translations[language];
    
    for (let k of keys) {
      if (value && value[k] !== undefined) {
        value = value[k];
      } else {
        // Fallback to Spanish if string is missing in English
        let fallbackValue = translations['es'];
        for (let fk of keys) {
          if (fallbackValue && fallbackValue[fk] !== undefined) {
            fallbackValue = fallbackValue[fk];
          } else {
            return key; // Return the key itself if not found anywhere
          }
        }
        return fallbackValue;
      }
    }
    return value;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
