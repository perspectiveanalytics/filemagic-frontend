import { useState, useCallback } from 'react';
import { Box, Typography, Button } from '@mui/joy';
import MultiFileDropZone from '../components/MultiFileDropZone';
import ConversionProgress from '../components/ConversionProgress';
import SEO, { buildToolSchema } from '../components/SEO';
import { useMergeConversion } from '../hooks/useMergeConversion';
import type { ImageToPDFOptions } from '../types/api';
import ToolDisclaimer from '../components/ToolDisclaimer';
import ToolSEOContent from '../components/ToolSEOContent';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import CollectionsOutlinedIcon from '@mui/icons-material/CollectionsOutlined';
import SortOutlinedIcon from '@mui/icons-material/SortOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import { Trans, useLingui } from '@lingui/react/macro';

export default function ImageToPdfPage() {
  const { t } = useLingui();
  const [files, setFiles] = useState<File[]>([]);

  const conversion = useMergeConversion('/merge/image-to-pdf');

  const handleConvert = useCallback(() => {
    if (files.length < 1) return;
    const options: ImageToPDFOptions = {};
    conversion.startConversion(files, options);
  }, [files, conversion]);

  const handleDownload = useCallback(() => {
    conversion.download();
    setFiles([]);
  }, [conversion]);

  const handleRetry = useCallback(() => {
    conversion.reset();
    setFiles([]);
  }, [conversion]);

  return (
    <Box sx={{ maxWidth: 520, mx: 'auto', width: '100%', py: { xs: 3, md: 4 } }}>
      <SEO title={t`Images to PDF`} description={t`Convert one or multiple images into a single PDF document for free. No signup, files processed in memory only.`} path="/merge/image-to-pdf" structuredData={buildToolSchema(t`Images to PDF`, t`Convert one or multiple images into a single PDF document for free. No signup, files processed in memory only.`, '/merge/image-to-pdf')} />
      <Typography component="h1" level="h3" sx={{ mb: 1, fontWeight: 700, letterSpacing: '-0.02em' }}><Trans>Images to PDF</Trans></Typography>
      <Typography level="body-sm" sx={{ color: 'text.tertiary', mb: 4 }}><Trans>Convert one or multiple images into a single PDF document</Trans></Typography>

      <ToolDisclaimer toolId="image-to-pdf" />

      {conversion.status === 'idle' ? (
        <>
          <MultiFileDropZone
            files={files}
            onFilesChange={setFiles}
            accept=".jpg,.jpeg,.png,.webp,.bmp,image/jpeg,image/png,image/webp,image/bmp"
            maxSize={8 * 1024 * 1024}
            maxFiles={10}
          />
          {files.length >= 1 && (
            <Button
              size="lg"
              onClick={handleConvert}
              sx={{ mt: 3, width: '100%' }}
            >
              Create PDF from {files.length} {files.length === 1 ? 'image' : 'images'}
            </Button>
          )}
        </>
      ) : (
        <Box>
          <Typography level="body-sm" sx={{ color: 'text.tertiary', mb: 2 }}>
            Converting {files.length} {files.length === 1 ? 'image' : 'images'} to PDF
          </Typography>
          <ConversionProgress
            status={conversion.status}
            position={conversion.position}
            error={conversion.error}
            inputSize={null}
            outputSize={conversion.outputSize}
            previewUrl={null}
            onDownload={handleDownload}
            onRetry={handleRetry}
          />
        </Box>
      )}
      <ToolSEOContent
        howTo={{
          title: t`How to convert images to PDF online`,
          steps: [
            t`Upload one or more images. Supported formats include JPG, PNG, WebP, and BMP.`,
            t`Drag to reorder images if needed — each image becomes one page in the PDF.`,
            t`Click "Create PDF" to combine all images into a single document.`,
            t`Download your PDF instantly.`,
          ],
        }}
        features={[
          { icon: <CollectionsOutlinedIcon />, title: t`Multiple Images`, description: t`Combine up to 10 images into a single PDF document in one step.` },
          { icon: <SortOutlinedIcon />, title: t`Drag to Reorder`, description: t`Rearrange images by dragging before creating the PDF to control page order.` },
          { icon: <ImageOutlinedIcon />, title: t`Popular Formats`, description: t`Supports JPG, PNG, WebP, and BMP image formats.` },
          { icon: <PictureAsPdfOutlinedIcon />, title: t`One Image per Page`, description: t`Each image is placed on its own page, maintaining the original dimensions.` },
          { icon: <LockOutlinedIcon />, title: t`Private & Secure`, description: t`Files are processed in an isolated sandbox and deleted immediately after download.` },
          { icon: <BoltOutlinedIcon />, title: t`No Signup Required`, description: t`Start creating PDFs immediately. No account, no email, no ads.` },
        ]}
        faq={[
          { question: t`How many images can I combine?`, answer: t`You can combine up to 10 images into a single PDF. Each image can be up to 8 MB in size.` },
          { question: t`What image formats are supported?`, answer: t`Images to PDF supports JPG/JPEG, PNG, WebP, and BMP image formats.` },
          { question: t`Can I control the page order?`, answer: t`Yes. After uploading your images, you can drag and drop them to rearrange the order. Each image becomes one page in the final PDF.` },
          { question: t`Does the conversion affect image quality?`, answer: t`No. Images are embedded in the PDF at their original resolution and quality without any additional compression.` },
          { question: t`Are my images stored on your servers?`, answer: t`No. Files are processed in isolated memory and automatically deleted as soon as you download the result. We never store, log, or share your files.` },
        ]}
        relatedTools={[
          { label: t`Image Convert`, href: '/convert/image' },
          { label: t`Image Compress`, href: '/compress/image' },
          { label: t`HEIC Convert`, href: '/convert/heic' },
          { label: t`PDF Compress`, href: '/compress/pdf' },
          { label: t`OCR`, href: '/ocr' },
        ]}
      />
    </Box>
  );
}
