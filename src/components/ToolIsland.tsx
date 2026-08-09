import { Component, lazy, Suspense, useState, type ComponentType, type LazyExoticComponent, type ReactNode } from 'react';
import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { CssVarsProvider } from '@mui/joy/styles';
import CssBaseline from '@mui/joy/CssBaseline';
import { I18nProvider } from '@lingui/react';
import { i18n } from '../i18n';
import theme from '../theme';
import type { Locale } from '../content/site';
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

const reloadMarker = (tool: string) => `filemagic:chunk-reload:${tool}`;

function clearReloadMarker(tool: string) {
  try {
    window.sessionStorage.removeItem(reloadMarker(tool));
  } catch {
    return;
  }
}

function scheduleReload(tool: string) {
  try {
    const marker = Number(window.sessionStorage.getItem(reloadMarker(tool)));
    if (Number.isFinite(marker) && Date.now() - marker < 30_000) return false;
    window.sessionStorage.setItem(reloadMarker(tool), String(Date.now()));
  } catch {
    return false;
  }

  window.setTimeout(() => window.location.reload(), 500);
  return true;
}

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

function lazyPage(tool: string, path: string): LazyPage {
  const loader = lazyModules[path] ?? lazyModules[pagePaths.home];
  return lazy(() => loader().then((module) => {
    clearReloadMarker(tool);
    return module;
  }).catch((error: unknown) => {
    if (scheduleReload(tool)) return new Promise<PageModule>(() => undefined);
    throw error;
  }));
}

const pages = Object.fromEntries(
  Object.entries(pagePaths).map(([tool, path]) => [tool, lazyPage(tool, path)]),
) as Record<keyof typeof pagePaths, LazyPage>;

function pageForTool(tool: ToolKey): LazyPage {
  return pages[tool as keyof typeof pages] ?? pages.home;
}

interface ToolRuntimeBoundaryProps {
  children: ReactNode;
  locale: Locale;
  tool: ToolKey;
}

class ToolRuntimeBoundary extends Component<ToolRuntimeBoundaryProps, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  retry = () => {
    clearReloadMarker(this.props.tool);
    window.location.reload();
  };

  render() {
    if (!this.state.failed) return this.props.children;

    const french = this.props.locale === 'fr';
    return (
      <div className="tool-runtime-error" role="alert">
        <div className="tool-runtime-error-panel">
          <h2>{french ? 'L’outil n’a pas pu être chargé' : 'The tool could not be loaded'}</h2>
          <p>{french ? 'Vérifiez votre connexion, puis réessayez.' : 'Check your connection, then try again.'}</p>
          <button type="button" onClick={this.retry}>{french ? 'Réessayer' : 'Try again'}</button>
        </div>
      </div>
    );
  }
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
  const [emotionCache] = useState(() => createCache({ key: 'filemagic' }));
  const Page = pageForTool(tool);
  const content = (
    <ToolRuntimeBoundary locale={locale} tool={tool}>
      <CacheProvider value={emotionCache}>
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
      </CacheProvider>
    </ToolRuntimeBoundary>
  );

  return (
    <I18nProvider i18n={i18n}>
      {content}
    </I18nProvider>
  );
}
