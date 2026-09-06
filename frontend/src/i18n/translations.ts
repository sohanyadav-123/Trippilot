import { LanguageCode } from '../context/TravelSettingsContext';
import { en } from './locales/en';
import { hi } from './locales/hi';
import { te } from './locales/te';

export interface TranslationDict {
  [key: string]: string;
}

export const TRANSLATIONS: Record<LanguageCode, TranslationDict> = {
  en,
  hi,
  te,
};
