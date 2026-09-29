import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import translationFR from './locales/fr.json';
import translationEN from './locales/en.json';
import translationFI from './locales/fi.json';

// the translations
const resources = {
  fr: {
    translation: translationFR
  },
  en: {
    translation: translationEN
  },
  fi: {
    translation: translationFI
  }
};

/** Langues proposées dans la barre latérale (libellé dans la langue elle-même). */
export const LANGUAGES = [
  { code: 'fr', label: 'Français', short: 'FR' },
  { code: 'en', label: 'English', short: 'EN' },
  { code: 'fi', label: 'Suomi', short: 'FI' },
] as const;

// Langue choisie via la barre latérale, mémorisée pour ne pas revenir au
// français à chaque rechargement.
const LANGUAGE_KEY = 'nexus-language';

function savedLanguage() {
  try {
    const lng = localStorage.getItem(LANGUAGE_KEY);
    return LANGUAGES.some(l => l.code === lng) ? lng : null;
  } catch {
    return null;
  }
}

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: savedLanguage() ?? 'fr', // default language
    fallbackLng: 'fr',
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

document.documentElement.lang = i18n.language;
i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng;
  try {
    localStorage.setItem(LANGUAGE_KEY, lng);
  } catch {
    // préférence facultative
  }
});

export default i18n;
