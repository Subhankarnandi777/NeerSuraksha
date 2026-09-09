import { useMemo } from 'react';
import { useAppStore } from '../store/main.store';
import { LOCALES, type LanguageCode, type TranslationKey } from '../constants/languages';

export function useLanguage() {
  const language = useAppStore((state) => state.language);

  const t = (key: TranslationKey, fallback?: string) => {
    const dictionary = LOCALES[language as LanguageCode] ?? LOCALES.en;
    return dictionary[key] ?? fallback ?? LOCALES.en[key] ?? key;
  };

  return useMemo(() => ({
    language,
    t,
  }), [language]);
}
