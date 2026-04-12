import { useState, useCallback, useEffect } from 'react';
import { Box, Typography } from '@mui/joy';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import FileDropZone from '../components/FileDropZone';
import MultiFileResult from '../components/MultiFileResult';
import SEO, { buildToolSchema } from '../components/SEO';
import { useMultiFileConversion } from '../hooks/useMultiFileConversion';
import type { FileManifestEntry } from '../types/api';
import ToolDisclaimer from '../components/ToolDisclaimer';
import ToolSEOContent from '../components/ToolSEOContent';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import FolderZipOutlinedIcon from '@mui/icons-material/FolderZipOutlined';
import PhotoLibraryOutlinedIcon from '@mui/icons-material/PhotoLibraryOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import HighQualityOutlinedIcon from '@mui/icons-material/HighQualityOutlined';
import { Trans, useLingui } from '@lingui/react/macro';

export default function PdfExtractImagesPage() {
  const { t } = useLingui();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<{ file: FileManifestEntry; url: string } | null>(null);

  const conversion = useMultiFileConversion('/convert/pdf/extract-images');

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    conversion.startConversionWithOptions(file, {});
  }, [conversion]);

  const handleRetry = useCallback(() => {
    conversion.reset();
    setSelectedFile(null);
  }, [conversion]);

  const renderThumbnail = useCallback((file: FileManifestEntry, url: string) => {
    const isImage = file.type?.startsWith('image/');
    if (!isImage) return null;
    return (
      <Box
        component="img"
        src={url}
        alt={file.name}
        loading="lazy"
        sx={{
          width: 40,
          height: 40,
          objectFit: 'cover',
          borderRadius: 'sm',
          flexShrink: 0,
          bgcolor: 'background.level2',
        }}
      />
    );
  }, []);

  const handlePreview = useCallback((_file: FileManifestEntry, url: string) => {
    setPreview({ file: _file, url });
  }, []);

  useEffect(() => {
    if (!preview) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setPreview(null); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [preview]);

  return (
    <Box sx={{ maxWidth: 520, mx: 'auto', width: '100%', py: { xs: 3, md: 4 } }}>
      <SEO title={t`Extract Images from PDF`} description={t`Extract all images from a PDF file for free. Download individually or as ZIP.`} path="/convert/pdf-extract-images" structuredData={buildToolSchema(t`Extract Images from PDF`, t`Extract images from PDF files.`, '/convert/pdf-extract-images')} />
      <Typography component="h1" level="h3" sx={{ mb: 1, fontWeight: 700, letterSpacing: '-0.02em' }}><Trans>Extract Images from PDF</Trans></Typography>
      <Typography level="body-sm" sx={{ color: 'text.tertiary', mb: 4 }}><Trans>Extract all embedded images from a PDF file</Trans></Typography>

      <ToolDisclaimer toolId="pdf-extract-images" />

      {conversion.status === 'idle' ? (
        <FileDropZone
          onFileSelect={handleFileSelect}
          accept=".pdf,application/pdf"
          maxSize={30 * 1024 * 1024}
        />
      ) : (
        <Box>
          {selectedFile && (
            <Typography level="body-sm" sx={{ color: 'text.tertiary', mb: 2 }}>
              {selectedFile.name}
            </Typography>
          )}
          <MultiFileResult
            status={conversion.status}
            position={conversion.position}
            error={conversion.error}
            files={conversion.files}
            zipDownloadUrl={conversion.zipDownloadUrl}
            getFileUrl={conversion.getFileUrl}
            onRetry={handleRetry}
            renderThumbnail={renderThumbnail}
            onFilePreview={handlePreview}
          />
        </Box>
      )}
      <ToolSEOContent
        howTo={{
          title: t`How to extract images from a PDF`,
          steps: [
            t`Upload your PDF file (up to 30 MB).`,
            t`The tool automatically finds and extracts all embedded images.`,
            t`Preview extracted images with the built-in lightbox viewer.`,
            t`Download images individually or all at once as a ZIP file.`,
          ],
        }}
        features={[
          { icon: <ImageOutlinedIcon />, title: t`Extract All Images`, description: t`Automatically finds and extracts every embedded image from your PDF document.` },
          { icon: <HighQualityOutlinedIcon />, title: t`Original Quality`, description: t`Images are extracted at their original resolution and format without re-compression.` },
          { icon: <PhotoLibraryOutlinedIcon />, title: t`Preview & Lightbox`, description: t`Browse extracted images with thumbnails and a full-size lightbox viewer.` },
          { icon: <FolderZipOutlinedIcon />, title: t`ZIP Download`, description: t`Download all extracted images at once in a convenient ZIP archive.` },
          { icon: <BoltOutlinedIcon />, title: t`Fast Extraction`, description: t`Images are extracted in seconds, even from large multi-page PDF documents.` },
          { icon: <LockOutlinedIcon />, title: t`Privacy First`, description: t`Files are processed in isolated memory and deleted immediately after download.` },
        ]}
        faq={[
          { question: t`What image formats are extracted?`, answer: t`Images are extracted in their original embedded format — typically JPEG, PNG, or TIFF. The format depends on how images were stored in the PDF.` },
          { question: t`Can I extract images from a scanned PDF?`, answer: t`Yes. Scanned PDFs typically contain one large image per page, and each page image will be extracted.` },
          { question: t`Is there a limit on the number of images?`, answer: t`No. All embedded images are extracted regardless of quantity. The maximum PDF file size is 30 MB.` },
          { question: t`Are vector graphics extracted too?`, answer: t`No. This tool extracts raster (bitmap) images only. Vector graphics, text, and shapes are not extracted as images.` },
        ]}
        relatedTools={[
          { label: t`PDF Editor`, href: '/edit/pdf' },
          { label: t`PDF Compress`, href: '/compress/pdf' },
          { label: t`Images to PDF`, href: '/merge/image-to-pdf' },
          { label: t`PDF Merge`, href: '/merge/pdf' },
        ]}
      />

      {preview && (
        <Box
          onClick={() => setPreview(null)}
          sx={{
            position: 'fixed', inset: 0, zIndex: 1300,
            bgcolor: 'rgba(0, 0, 0, 0.85)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
          }}
        >
          <Box
            onClick={(e) => e.stopPropagation()}
            sx={{
              position: 'absolute', top: 0, left: 0, right: 0,
              display: 'flex', alignItems: 'center', gap: 1,
              px: 2, py: 1.5,
              bgcolor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)',
            }}
          >
            <Typography level="body-sm" sx={{ flex: 1, color: 'white', fontWeight: 500 }} noWrap>
              {preview.file.name}
            </Typography>
            <Box
              component="a"
              href={preview.url}
              download={preview.file.name}
              sx={{
                display: 'flex', alignItems: 'center', gap: 0.5,
                color: 'white', textDecoration: 'none', fontSize: '0.8rem',
                p: 0.75, borderRadius: 'sm',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
              }}
            >
              <DownloadRoundedIcon sx={{ fontSize: 16 }} />
            </Box>
            <Box
              component="button"
              onClick={() => setPreview(null)}
              sx={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                p: 0.75, border: 'none', bgcolor: 'transparent', borderRadius: 'sm',
                color: 'white', cursor: 'pointer',
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' },
              }}
            >
              <CloseRoundedIcon sx={{ fontSize: 20 }} />
            </Box>
          </Box>

          <Box
            component="img"
            src={preview.url}
            alt={preview.file.name}
            onClick={(e) => e.stopPropagation()}
            sx={{
              maxWidth: 'calc(100vw - 48px)',
              maxHeight: 'calc(100vh - 80px)',
              objectFit: 'contain',
              borderRadius: 'md',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            }}
          />
        </Box>
      )}
    </Box>
  );
}
