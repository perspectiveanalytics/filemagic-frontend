import { useState, useCallback } from 'react';
import { Box, Typography, Select, Option, FormControl, FormLabel } from '@mui/joy';
import FileDropZone from '../components/FileDropZone';
import ConversionProgress from '../components/ConversionProgress';
import SEO, { buildToolSchema } from '../components/SEO';
import { useConversion } from '../hooks/useConversion';
import ToolDisclaimer from '../components/ToolDisclaimer';
import ToolSEOContent from '../components/ToolSEOContent';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';
import DevicesOutlinedIcon from '@mui/icons-material/DevicesOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import type { EbookConvertOptions } from '../types/api';

type EbookFormat = EbookConvertOptions['targetFormat'];

const TARGET_FORMATS: { value: EbookFormat; label: string }[] = [
  { value: 'epub', label: 'EPUB (.epub)' },
  { value: 'mobi', label: 'MOBI (.mobi)' },
  { value: 'azw3', label: 'AZW3 (.azw3)' },
  { value: 'txt', label: 'Plain Text (.txt)' },
  { value: 'fb2', label: 'FB2 (.fb2)' },
  { value: 'docx', label: 'DOCX (.docx)' },
  { value: 'htmlz', label: 'HTML (.htmlz)' },
];

const ACCEPT = '.epub,.mobi,.azw3,.azw,.pdf,.fb2,.txt,.docx,.html,.htm,.rtf,.odt,.lit,.pdb,.cbz,.cbr';

export default function EbookConvertPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [targetFormat, setTargetFormat] = useState<EbookFormat>('epub');
  const conversion = useConversion('/convert/ebook');

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    conversion.startConversion(file, { targetFormat });
  }, [targetFormat, conversion]);

  const handleRetry = useCallback(() => {
    conversion.reset();
    setSelectedFile(null);
  }, [conversion]);

  const isProcessing = ['uploading', 'queued', 'processing'].includes(conversion.status);

  return (
    <Box sx={{ maxWidth: 520, mx: 'auto', width: '100%', py: { xs: 3, md: 4 } }}>
      <SEO
        title="Ebook Converter"
        description="Convert ebooks between EPUB, MOBI, AZW3, PDF, FB2 and more. Free, no signup required."
        path="/convert/ebook"
        structuredData={buildToolSchema('Ebook Converter', 'Convert ebooks between EPUB, MOBI, AZW3, PDF and more.', '/convert/ebook')}
      />
      <Typography component="h1" level="h3" sx={{ mb: 1, fontWeight: 700, letterSpacing: '-0.02em' }}>
        Ebook Converter
      </Typography>
      <Typography level="body-sm" sx={{ color: 'text.tertiary', mb: 4 }}>
        Convert between EPUB, MOBI, AZW3, PDF and more
      </Typography>

      <ToolDisclaimer toolId="ebook-convert" />

      <Box sx={{ p: 2.5, mb: 3, borderRadius: 'lg', bgcolor: 'background.surface', border: '1px solid', borderColor: 'divider' }}>
        <FormControl>
          <FormLabel>Target format</FormLabel>
          <Select value={targetFormat} onChange={(_, val) => val && setTargetFormat(val)} disabled={isProcessing} size="sm">
            {TARGET_FORMATS.map((f) => (
              <Option key={f.value} value={f.value}>{f.label}</Option>
            ))}
          </Select>
        </FormControl>
      </Box>

      {conversion.status === 'idle' ? (
        <FileDropZone
          onFileSelect={handleFileSelect}
          accept={ACCEPT}
          maxSize={50 * 1024 * 1024}
        />
      ) : (
        <Box>
          {selectedFile && (
            <Typography level="body-sm" sx={{ color: 'text.tertiary', mb: 2 }}>
              {selectedFile.name}
            </Typography>
          )}
          <ConversionProgress
            status={conversion.status}
            position={conversion.position}
            error={conversion.error}
            inputSize={conversion.inputSize}
            outputSize={conversion.outputSize}
            previewUrl={null}
            onDownload={conversion.download}
            onRetry={handleRetry}
            showSizeComparison={false}
          />
        </Box>
      )}
      <ToolSEOContent
        howTo={{
          title: 'How to convert an ebook online',
          steps: [
            'Select the target format — EPUB, MOBI, AZW3, PDF, TXT, FB2, DOCX, or HTML.',
            'Upload your ebook file (up to 50 MB).',
            'Download the converted ebook instantly.',
          ],
        }}
        features={[
          { icon: <MenuBookOutlinedIcon />, title: 'Eight Output Formats', description: 'Convert to EPUB, MOBI, AZW3, PDF, Plain Text, FB2, DOCX, or HTML.' },
          { icon: <SwapHorizOutlinedIcon />, title: 'Wide Input Support', description: 'Accepts EPUB, MOBI, AZW3, PDF, FB2, TXT, DOCX, HTML, RTF, ODT, LIT, PDB, CBZ, and CBR files.' },
          { icon: <DevicesOutlinedIcon />, title: 'Cross-Device Ready', description: 'Convert to the right format for any e-reader — Kindle (MOBI/AZW3), Kobo (EPUB), or any PDF viewer.' },
          { icon: <ArticleOutlinedIcon />, title: 'Layout Preserved', description: 'Table of contents, chapters, images, and formatting are maintained during conversion.' },
          { icon: <BoltOutlinedIcon />, title: 'Fast Conversion', description: 'Most ebooks convert in under 30 seconds, even long novels.' },
          { icon: <SecurityOutlinedIcon />, title: 'Privacy First', description: 'Ebooks are processed in isolated memory and deleted immediately after download.' },
        ]}
        faq={[
          { question: 'What ebook formats can I convert between?', answer: 'Input formats include EPUB, MOBI, AZW3, AZW, PDF, FB2, TXT, DOCX, HTML, HTM, RTF, ODT, LIT, PDB, CBZ, and CBR. Output formats are EPUB, MOBI, AZW3, PDF, TXT, FB2, DOCX, and HTML.' },
          { question: 'Can I convert a PDF to EPUB?', answer: 'Yes. PDF to EPUB conversion works best with text-based PDFs. Scanned/image-only PDFs may produce limited results since there is no OCR step.' },
          { question: 'What is the file size limit?', answer: 'The maximum upload size is 50 MB, which covers virtually all ebook files.' },
          { question: 'Which format should I use for Kindle?', answer: 'For modern Kindle devices, AZW3 offers the best feature support. MOBI is compatible with older Kindle models.' },
          { question: 'Are images and formatting preserved?', answer: 'Yes. The converter preserves images, table of contents, chapter structure, and text formatting whenever the target format supports them.' },
        ]}
        relatedTools={[
          { label: 'Font Converter', href: '/convert/font' },
          { label: 'PDF Compress', href: '/compress/pdf' },
          { label: 'PDF Editor', href: '/edit/pdf' },
          { label: 'Decompress Archive', href: '/archive/decompress' },
        ]}
      />
    </Box>
  );
}
