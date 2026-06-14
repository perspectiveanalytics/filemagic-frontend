export const SITE = {
  name: 'FileMagic',
  url: 'https://filemagic.app',
  ogImage: 'https://filemagic.app/og-image.png',
  defaultDescription:
    'Free, private file conversion tools. Convert images, compress PDFs, extract text with OCR, remove metadata, merge files. No signup, no ads, short-lived processing.',
};

export type Locale = 'en' | 'fr';

export const locales: Locale[] = ['en', 'fr'];
export const defaultLocale: Locale = 'en';

export function localizePath(path: string, locale: Locale) {
  if (locale === defaultLocale) return path;
  return path === '/' ? `/${locale}` : `/${locale}${path}`;
}

export function canonicalPath(path: string, locale: Locale) {
  const localized = localizePath(path, locale);
  return localized.endsWith('/') ? localized : `${localized}/`;
}

export function localeFromSlug(slug: string | undefined): Locale {
  return slug?.split('/')[0] === 'fr' ? 'fr' : 'en';
}
