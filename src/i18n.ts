import { i18n } from '@lingui/core';
import { detect, fromStorage, fromNavigator } from '@lingui/detect-locale';
import { messages as enMessages } from './locales/en/messages.po';
import { messages as frMessages } from './locales/fr/messages.po';

const STORAGE_KEY = 'filemagic-lang';
const SUPPORTED_LOCALES = ['en', 'fr'] as const;
type Locale = (typeof SUPPORTED_LOCALES)[number];

i18n.load({
  en: enMessages,
  fr: frMessages,
});

function resolveLocale(raw: string | null): Locale {
  if (!raw) return 'en';
  const base = raw.split('-')[0].toLowerCase();
  if (SUPPORTED_LOCALES.includes(base as Locale)) return base as Locale;
  return 'en';
}

const detected = typeof window === 'undefined'
  ? 'en'
  : detect(fromStorage(STORAGE_KEY), fromNavigator());
const initialLocale = resolveLocale(detected);

i18n.activate(initialLocale);

export function changeLocale(locale: Locale) {
  i18n.activate(locale);
  try {
    localStorage.setItem(STORAGE_KEY, locale);
  } catch {}
}

export { i18n };
