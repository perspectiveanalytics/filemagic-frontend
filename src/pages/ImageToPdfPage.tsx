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

export default function ImageToPdfPage() {
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
      <SEO title="Images to PDF" description="Convert one or multiple images into a single PDF document for free. No signup, files processed in memory only." path="/merge/image-to-pdf" structuredData={buildToolSchema('Images to PDF', 'Convert one or multiple images into a single PDF document for free. No signup, files processed in memory only.', '/merge/image-to-pdf')} />
      <Typography component="h1" level="h3" sx={{ mb: 1, fontWeight: 700, letterSpacing: '-0.02em' }}>
        Images to PDF
      </Typography>
      <Typography level="body-sm" sx={{ color: 'text.tertiary', mb: 4 }}>
        Convert one or multiple images into a single PDF document
      </Typography>

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
          title: 'How to convert images to PDF online',
          steps: [
            'Upload one or more images. Supported formats include JPG, PNG, WebP, and BMP.',
            'Drag to reorder images if needed — each image becomes one page in the PDF.',
            'Click "Create PDF" to combine all images into a single document.',
            'Download your PDF instantly.',
          ],
        }}
        features={[
          { icon: <CollectionsOutlinedIcon />, title: 'Multiple Images', description: 'Combine up to 10 images into a single PDF document in one step.' },
          { icon: <SortOutlinedIcon />, title: 'Drag to Reorder', description: 'Rearrange images by dragging before creating the PDF to control page order.' },
          { icon: <ImageOutlinedIcon />, title: 'Popular Formats', description: 'Supports JPG, PNG, WebP, and BMP image formats.' },
          { icon: <PictureAsPdfOutlinedIcon />, title: 'One Image per Page', description: 'Each image is placed on its own page, maintaining the original dimensions.' },
          { icon: <LockOutlinedIcon />, title: 'Private & Secure', description: 'Files are processed in an isolated sandbox and deleted immediately after download.' },
          { icon: <BoltOutlinedIcon />, title: 'No Signup Required', description: 'Start creating PDFs immediately. No account, no email, no ads.' },
        ]}
        faq={[
          { question: 'How many images can I combine?', answer: 'You can combine up to 10 images into a single PDF. Each image can be up to 8 MB in size.' },
          { question: 'What image formats are supported?', answer: 'Images to PDF supports JPG/JPEG, PNG, WebP, and BMP image formats.' },
          { question: 'Can I control the page order?', answer: 'Yes. After uploading your images, you can drag and drop them to rearrange the order. Each image becomes one page in the final PDF.' },
          { question: 'Does the conversion affect image quality?', answer: 'No. Images are embedded in the PDF at their original resolution and quality without any additional compression.' },
          { question: 'Are my images stored on your servers?', answer: 'No. Files are processed in isolated memory and automatically deleted as soon as you download the result. We never store, log, or share your files.' },
        ]}
        relatedTools={[
          { label: 'Image Convert', href: '/convert/image' },
          { label: 'Image Compress', href: '/compress/image' },
          { label: 'HEIC Convert', href: '/convert/heic' },
          { label: 'PDF Compress', href: '/compress/pdf' },
          { label: 'OCR', href: '/ocr' },
        ]}
      />
    </Box>
  );
}
