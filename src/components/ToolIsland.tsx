import { lazy, Suspense, useEffect, useRef, type ComponentType, type LazyExoticComponent, type MouseEvent } from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { CssVarsProvider } from '@mui/joy/styles';
import CssBaseline from '@mui/joy/CssBaseline';
import { I18nProvider } from '@lingui/react';
import { i18n } from '../i18n';
import theme from '../theme';
import { canonicalPath, defaultLocale, type Locale } from '../content/site';
import type { ToolKey } from '../content/routes';
import TurnstileMount from './TurnstileMount';

interface ToolIslandProps {
  tool: ToolKey;
  locale: Locale;
  loadTurnstile?: boolean;
}

type PageComponent = ComponentType<Record<string, never>>;
type LazyPage = LazyExoticComponent<PageComponent>;
type PageModule = { default: PageComponent };

const page = (loader: () => Promise<{ default: PageComponent }>): LazyPage => lazy(loader);

const pagePaths: Record<Exclude<ToolKey, 'privacy' | 'terms' | 'legal' | 'security' | 'not-found'>, string> = {
  home: '../react-pages/HomePage.tsx',
  'image-convert': '../react-pages/ImageConvertPage.tsx',
  'heic-convert': '../react-pages/HeicConvertPage.tsx',
  'pdf-compress': '../react-pages/PdfCompressPage.tsx',
  'image-compress': '../react-pages/ImageCompressPage.tsx',
  ocr: '../react-pages/OcrPage.tsx',
  'metadata-remove': '../react-pages/MetadataRemovePage.tsx',
  'pdf-merge': '../react-pages/PdfMergePage.tsx',
  'image-to-pdf': '../react-pages/ImageToPdfPage.tsx',
  'qr-code': '../react-pages/QrCodePage.tsx',
  'cert-inspect': '../react-pages/CertInspectPage.tsx',
  'cert-convert': '../react-pages/CertConvertPage.tsx',
  'archive-create': '../react-pages/ArchivePage.tsx',
  'password-generator': '../react-pages/PasswordGeneratorPage.tsx',
  'yaml-json': '../react-pages/YamlJsonPage.tsx',
  'json-csv': '../react-pages/JsonCsvPage.tsx',
  'markdown-pdf': '../react-pages/MarkdownPdfPage.tsx',
  'audio-extract': '../react-pages/AudioExtractPage.tsx',
  'audio-convert': '../react-pages/AudioConvertPage.tsx',
  'video-compress': '../react-pages/VideoCompressPage.tsx',
  'mov-to-mp4': '../react-pages/MovToMp4Page.tsx',
  'video-to-gif': '../react-pages/VideoGifPage.tsx',
  'pdf-password': '../react-pages/PdfPasswordPage.tsx',
  'pdf-editor': '../react-pages/PdfEditorPage.tsx',
  'pdf-extract-images': '../react-pages/PdfExtractImagesPage.tsx',
  'archive-decompress': '../react-pages/DecompressPage.tsx',
  'csv-excel': '../react-pages/CsvExcelPage.tsx',
  ascii: '../react-pages/AsciiPage.tsx',
  'word-counter': '../react-pages/WordCounterPage.tsx',
  base64: '../react-pages/Base64Page.tsx',
  hash: '../react-pages/HashGeneratorPage.tsx',
  'font-convert': '../react-pages/FontConvertPage.tsx',
  'pdf-repair': '../react-pages/PdfRepairPage.tsx',
  'ebook-convert': '../react-pages/EbookConvertPage.tsx',
};

const lazyModules = import.meta.glob<PageModule>('../react-pages/*Page.tsx');

function pageForTool(tool: ToolKey): LazyPage {
  const path = pagePaths[tool as keyof typeof pagePaths] ?? pagePaths.home;
  return page((lazyModules[path] as () => Promise<PageModule>) ?? (lazyModules[pagePaths.home] as () => Promise<PageModule>));
}

function pathForLocale(pathname: string, locale: Locale) {
  if (locale === defaultLocale) {
    return pathname.endsWith('/') ? pathname : `${pathname}/`;
  }

  if (pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)) {
    return pathname.endsWith('/') ? pathname : `${pathname}/`;
  }

  return canonicalPath(pathname, locale);
}

function NavigationReload({ locale }: { locale: Locale }) {
  const location = useLocation();
  const mounted = useRef(false);

  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }

    const nextPath = pathForLocale(location.pathname, locale);
    window.location.assign(`${nextPath}${location.search}${location.hash}`);
  }, [locale, location.hash, location.pathname, location.search]);

  return null;
}

function handleIslandClick(event: MouseEvent<HTMLDivElement>, locale: Locale) {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

  const target = event.target instanceof HTMLElement ? event.target : null;
  const anchor = target?.closest('a[href]');
  if (!(anchor instanceof HTMLAnchorElement)) return;
  if (anchor.hasAttribute('download') || (anchor.target && anchor.target !== '_self')) return;

  const url = new URL(anchor.href, window.location.href);
  if (url.origin !== window.location.origin) return;

  event.preventDefault();
  event.stopPropagation();
  window.location.assign(`${pathForLocale(url.pathname, locale)}${url.search}${url.hash}`);
}

function ToolRuntimeFallback() {
  return (
    <div className="tool-runtime-fallback" aria-busy="true" aria-label="Loading tool">
      <div className="tool-runtime-fallback-panel">
        <div className="tool-runtime-fallback-bar" />
        <div className="tool-runtime-fallback-drop" />
        <div className="tool-runtime-fallback-grid">
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  );
}

export default function ToolIsland({ tool, locale, loadTurnstile = true }: ToolIslandProps) {
  i18n.activate(locale);
  const Page = pageForTool(tool);
  const content = (
    <CssVarsProvider
      theme={theme}
      defaultMode="dark"
      modeStorageKey="filemagic-joy-mode"
      colorSchemeStorageKey="filemagic-joy-color-scheme"
      disableTransitionOnChange
    >
      <CssBaseline />
      {loadTurnstile && <TurnstileMount />}
      <Suspense fallback={<ToolRuntimeFallback />}>
        <Page />
      </Suspense>
    </CssVarsProvider>
  );

  return (
    <I18nProvider i18n={i18n}>
      <BrowserRouter>
        <NavigationReload locale={locale} />
        <div onClickCapture={(event) => handleIslandClick(event, locale)}>
          {content}
        </div>
      </BrowserRouter>
    </I18nProvider>
  );
}
