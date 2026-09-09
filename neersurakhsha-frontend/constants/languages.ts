export const LANGUAGE_OPTIONS = [
  { id: 'en', native: 'English', english: 'English' },
  { id: 'hi', native: 'हिन्दी', english: 'Hindi' },
  { id: 'as', native: 'অসমীয়া', english: 'Assamese' },
  { id: 'bn', native: 'বাংলা', english: 'Bengali' },
  { id: 'brx', native: 'बर\'', english: 'Bodo' },
  { id: 'kha', native: 'Khasi', english: 'Khasi' },
  { id: 'lus', native: 'Mizo ṭawng', english: 'Mizo' },
  { id: 'mni', native: 'ꯃꯤꯇꯩꯂꯣꯟ', english: 'Manipuri' },
  { id: 'nsm', native: 'Naga', english: 'Naga' },
] as const;

export const DEFAULT_LANGUAGE = 'en';

export const LOCALES = {
  en: require('../locales/en.json'),
  hi: require('../locales/hi.json'),
  as: require('../locales/as.json'),
  bn: require('../locales/bn.json'),
  brx: require('../locales/brx.json'),
  kha: require('../locales/kha.json'),
  lus: require('../locales/lus.json'),
  mni: require('../locales/mni.json'),
  nsm: require('../locales/nsm.json'),
} as const;

export type LanguageCode = keyof typeof LOCALES;
export type TranslationKey = keyof typeof LOCALES.en;

export function resolveLanguageCode(value: string | null | undefined): LanguageCode {
  if (value && value in LOCALES) {
    return value as LanguageCode;
  }

  return DEFAULT_LANGUAGE;
}
