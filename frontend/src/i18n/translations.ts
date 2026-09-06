import { LanguageCode } from '../context/TravelSettingsContext';
import { en } from './locales/en';
import { hi } from './locales/hi';
import { te } from './locales/te';
import { ta } from './locales/ta';
import { kn } from './locales/kn';
import { ml } from './locales/ml';
import { bn } from './locales/bn';
import { mr } from './locales/mr';
import { gu } from './locales/gu';
import { pa } from './locales/pa';
import { es } from './locales/es';
import { fr } from './locales/fr';
import { de } from './locales/de';
import { ar } from './locales/ar';

export interface TranslationDict {
  [key: string]: string;
}

export const TRANSLATIONS: Record<LanguageCode, TranslationDict> = {
  en,
  hi,
  te,
  ta,
  kn,
  ml,
  bn,
  mr,
  gu,
  pa,
  es,
  fr,
  de,
  ar,
};
