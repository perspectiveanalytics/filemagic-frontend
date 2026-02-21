import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CircularProgress, Box } from '@mui/joy';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ImageConvertPage from './pages/ImageConvertPage';
import PdfCompressPage from './pages/PdfCompressPage';
import ImageCompressPage from './pages/ImageCompressPage';
import HeicConvertPage from './pages/HeicConvertPage';
import OcrPage from './pages/OcrPage';
import MetadataRemovePage from './pages/MetadataRemovePage';
import PdfMergePage from './pages/PdfMergePage';
import ImageToPdfPage from './pages/ImageToPdfPage';
import QrCodePage from './pages/QrCodePage';
import CertInspectPage from './pages/CertInspectPage';
import CertConvertPage from './pages/CertConvertPage';
import ArchivePage from './pages/ArchivePage';
// PasswordGeneratorPage lazy-loaded below (33KB wordlist)
import WordCounterPage from './pages/WordCounterPage';
import Base64Page from './pages/Base64Page';
import MarkdownPdfPage from './pages/MarkdownPdfPage';
import AudioExtractPage from './pages/AudioExtractPage';
import AudioConvertPage from './pages/AudioConvertPage';
import VideoCompressPage from './pages/VideoCompressPage';
import MovToMp4Page from './pages/MovToMp4Page';
import VideoGifPage from './pages/VideoGifPage';
import PdfPasswordPage from './pages/PdfPasswordPage';
import AsciiPage from './pages/AsciiPage';
import HashGeneratorPage from './pages/HashGeneratorPage';
import FontConvertPage from './pages/FontConvertPage';
import PdfRepairPage from './pages/PdfRepairPage';
import EbookConvertPage from './pages/EbookConvertPage';

import DecompressPage from './pages/DecompressPage';
import PdfExtractImagesPage from './pages/PdfExtractImagesPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import LegalPage from './pages/LegalPage';
import SecurityPage from './pages/SecurityPage';
import NotFoundPage from './pages/NotFoundPage';

// Auto-reload on stale chunk after deploy (hash mismatch)
function lazyWithReload<T extends { default: React.ComponentType }>(
  factory: () => Promise<T>,
): React.LazyExoticComponent<T['default']> {
  return lazy(() =>
    factory().catch(() => {
      const key = 'chunk-reload';
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, '1');
        window.location.reload();
      }
      // Return a never-resolving promise so the reload takes over
      return new Promise<T>(() => {});
    }),
  );
}

// Lazy-loaded: heavy deps, only load when needed
const YamlJsonPage = lazyWithReload(() => import('./pages/YamlJsonPage'));
const JsonCsvPage = lazyWithReload(() => import('./pages/JsonCsvPage'));
const CsvExcelPage = lazyWithReload(() => import('./pages/CsvExcelPage'));
const PdfEditorPage = lazyWithReload(() => import('./pages/PdfEditorPage'));
const PasswordGeneratorPage = lazyWithReload(() => import('./pages/PasswordGeneratorPage'));

function LazyFallback() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
      <CircularProgress size="md" thickness={3} />
    </Box>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/convert/image" element={<ImageConvertPage />} />
          <Route path="/convert/heic" element={<HeicConvertPage />} />
          <Route path="/compress/pdf" element={<PdfCompressPage />} />
          <Route path="/split/pdf" element={<Navigate to="/edit/pdf" replace />} />
          <Route path="/compress/image" element={<ImageCompressPage />} />
          <Route path="/ocr" element={<OcrPage />} />
          <Route path="/metadata/remove" element={<MetadataRemovePage />} />
          <Route path="/merge/pdf" element={<PdfMergePage />} />
          <Route path="/merge/image-to-pdf" element={<ImageToPdfPage />} />
          <Route path="/generate/qrcode" element={<QrCodePage />} />
          <Route path="/inspect/certificate" element={<CertInspectPage />} />
          <Route path="/convert/certificate" element={<CertConvertPage />} />
          <Route path="/archive/create" element={<ArchivePage />} />
          <Route path="/generate/password" element={<Suspense fallback={<LazyFallback />}><PasswordGeneratorPage /></Suspense>} />
          <Route path="/convert/yaml" element={<Suspense fallback={<LazyFallback />}><YamlJsonPage /></Suspense>} />
          <Route path="/convert/json-csv" element={<Suspense fallback={<LazyFallback />}><JsonCsvPage /></Suspense>} />
          <Route path="/convert/markdown-pdf" element={<MarkdownPdfPage />} />
          <Route path="/convert/audio-extract" element={<AudioExtractPage />} />
          <Route path="/convert/audio" element={<AudioConvertPage />} />
          <Route path="/compress/video" element={<VideoCompressPage />} />
          <Route path="/convert/mov-to-mp4" element={<MovToMp4Page />} />
          <Route path="/convert/video-to-gif" element={<VideoGifPage />} />
          <Route path="/convert/pdf-password" element={<PdfPasswordPage />} />
          <Route path="/edit/pdf" element={<Suspense fallback={<LazyFallback />}><PdfEditorPage /></Suspense>} />
          <Route path="/convert/pdf-rotate" element={<Navigate to="/edit/pdf" replace />} />
          <Route path="/convert/svg-to-png" element={<ImageConvertPage />} />
          <Route path="/convert/pdf-extract-images" element={<PdfExtractImagesPage />} />
          <Route path="/archive/decompress" element={<DecompressPage />} />
          <Route path="/convert/csv-excel" element={<Suspense fallback={<LazyFallback />}><CsvExcelPage /></Suspense>} />
          <Route path="/convert/ascii" element={<AsciiPage />} />
          <Route path="/tools/word-counter" element={<WordCounterPage />} />
          <Route path="/tools/base64" element={<Base64Page />} />
          <Route path="/tools/hash" element={<HashGeneratorPage />} />
          <Route path="/convert/font" element={<FontConvertPage />} />
          <Route path="/repair/pdf" element={<PdfRepairPage />} />
          <Route path="/convert/ebook" element={<EbookConvertPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/legal" element={<LegalPage />} />
          <Route path="/security" element={<SecurityPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
