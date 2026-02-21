import { useState, useCallback } from 'react';
import { Box, Typography, Button } from '@mui/joy';
import MultiFileDropZone from '../components/MultiFileDropZone';
import ConversionProgress from '../components/ConversionProgress';
import SEO, { buildToolSchema } from '../components/SEO';
import { useMergeConversion } from '../hooks/useMergeConversion';
import type { PDFMergeOptions } from '../types/api';
import ToolDisclaimer from '../components/ToolDisclaimer';
import ToolSEOContent from '../components/ToolSEOContent';
import MergeOutlinedIcon from '@mui/icons-material/MergeOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import ReorderOutlinedIcon from '@mui/icons-material/ReorderOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';

export default function PdfMergePage() {
  const [files, setFiles] = useState<File[]>([]);

  const conversion = useMergeConversion('/merge/pdf');

  const handleMerge = useCallback(() => {
    if (files.length < 2) return;
    const options: PDFMergeOptions = {};
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
      <SEO title="Merge PDFs" description="Combine multiple PDF files and images into one PDF document for free. No signup, files processed in memory only." path="/merge/pdf" structuredData={buildToolSchema('Merge PDFs', 'Combine multiple PDF files and images into one PDF document for free. No signup, files processed in memory only.', '/merge/pdf')} />
      <Typography component="h1" level="h3" sx={{ mb: 1, fontWeight: 700, letterSpacing: '-0.02em' }}>
        Merge PDFs
      </Typography>
      <Typography level="body-sm" sx={{ color: 'text.tertiary', mb: 4 }}>
        Combine multiple PDFs and images into one document
      </Typography>

      <ToolDisclaimer toolId="pdf-merge" />

      {conversion.status === 'idle' ? (
        <>
          <MultiFileDropZone
            files={files}
            onFilesChange={setFiles}
            accept=".pdf,application/pdf,.jpg,.jpeg,.png,.webp,.bmp,.tiff,.tif,image/jpeg,image/png,image/webp,image/bmp,image/tiff"
            maxSize={8 * 1024 * 1024}
            maxFiles={10}
            allowPreview
          />
          {files.length >= 2 && (
            <Button
              size="lg"
              onClick={handleMerge}
              sx={{ mt: 3, width: '100%' }}
            >
              Merge {files.length} files
            </Button>
          )}
        </>
      ) : (
        <Box>
          <Typography level="body-sm" sx={{ color: 'text.tertiary', mb: 2 }}>
            Merging {files.length} files
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
          title: 'How to merge PDFs online',
          steps: [
            'Drag and drop or select multiple PDF files and images (up to 10 files, 8 MB each).',
            'Reorder files by dragging them into the desired sequence.',
            'Click "Merge" to combine all files into a single PDF.',
            'Download the merged PDF instantly.',
          ],
        }}
        features={[
          { icon: <MergeOutlinedIcon />, title: 'Combine PDFs & Images', description: 'Merge PDFs, JPGs, PNGs, WebP, BMP, and TIFF files into one unified PDF document.' },
          { icon: <ReorderOutlinedIcon />, title: 'Drag-to-Reorder', description: 'Rearrange files in any order before merging with intuitive drag-and-drop.' },
          { icon: <ImageOutlinedIcon />, title: 'Mixed File Support', description: 'Combine different file types — PDFs and images — in a single merge operation.' },
          { icon: <BoltOutlinedIcon />, title: 'Fast Processing', description: 'Files are merged server-side in seconds, even with multiple large documents.' },
          { icon: <SecurityOutlinedIcon />, title: 'Privacy First', description: 'Files are processed in isolated memory and deleted immediately after download.' },
          { icon: <LockOutlinedIcon />, title: 'No Signup Required', description: 'Use the tool instantly — no account, no watermarks, completely free.' },
        ]}
        faq={[
          { question: 'How many files can I merge at once?', answer: 'You can merge up to 10 files in a single operation. Each file can be up to 8 MB.' },
          { question: 'Can I merge images with PDFs?', answer: 'Yes. You can combine PDF files with JPG, PNG, WebP, BMP, and TIFF images. Each image is converted to a PDF page during the merge.' },
          { question: 'Does the order of files matter?', answer: 'Yes. Pages appear in the merged PDF in the same order you arrange them. Use drag-and-drop to reorder files before merging.' },
          { question: 'Will the merged PDF lose quality?', answer: 'No. PDF pages are copied without re-encoding, so text, images, and formatting remain identical to the originals.' },
        ]}
        relatedTools={[
          { label: 'PDF Compress', href: '/compress/pdf' },
          { label: 'PDF Editor', href: '/edit/pdf' },
          { label: 'Images to PDF', href: '/merge/image-to-pdf' },
          { label: 'PDF Password', href: '/convert/pdf-password' },
        ]}
      />
    </Box>
  );
}
