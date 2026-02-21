import { useState } from 'react';

export type Lang = 'en' | 'fr';

const STORAGE_KEY = 'filemagic-lang';

function getInitialLang(): Lang {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'fr' || stored === 'en') return stored;
  } catch {}
  const browserLang = navigator.language?.slice(0, 2);
  return browserLang === 'fr' ? 'fr' : 'en';
}

export function useLang(): [Lang, (l: Lang) => void] {
  const [lang, setLangState] = useState<Lang>(getInitialLang);

  const setLang = (l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {}
  };

  return [lang, setLang];
}
