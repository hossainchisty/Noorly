import { getLocales } from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { I18nManager } from 'react-native';

import { ar } from './locales/ar';
import { bn } from './locales/bn';
import { en } from './locales/en';

export const SUPPORTED_LANGUAGES = ['en', 'ar', 'bn'] as const;
export type AppLanguage = (typeof SUPPORTED_LANGUAGES)[number];

export const LANGUAGE_LABELS: Record<AppLanguage, string> = {
  en: 'English',
  ar: 'العربية',
  bn: 'বাংলা',
};

const deviceLanguage = getLocales()[0]?.languageCode;

export function isRtlLanguage(language: AppLanguage): boolean {
  return language === 'ar';
}

export function applyRtlForLanguage(language: AppLanguage, needsReload: boolean = false) {
  const wantsRtl = isRtlLanguage(language);
  if (I18nManager.isRTL !== wantsRtl) {
    I18nManager.allowRTL(wantsRtl);
    I18nManager.forceRTL(wantsRtl);
    if (needsReload && typeof I18nManager.forceRTL === 'function') {
      // Native reload is required for layout direction to take full effect.
      // eslint-disable-next-line no-undef
      const { DevSettings } = require('react-native');
      DevSettings?.reload?.();
    }
  }
}

export function initI18n(language: AppLanguage) {
  const detected = SUPPORTED_LANGUAGES.includes(deviceLanguage as AppLanguage)
    ? (deviceLanguage as AppLanguage)
    : 'en';

  i18n.use(initReactI18next).init({
    resources: {
      en: { translation: en },
      ar: { translation: ar },
      bn: { translation: bn },
    },
    lng: language ?? detected,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });

  applyRtlForLanguage((language ?? detected) as AppLanguage);
  return i18n;
}

export function changeLanguage(language: AppLanguage) {
  i18n.changeLanguage(language);
  applyRtlForLanguage(language);
}

export default i18n;
