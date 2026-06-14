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
import { Trans, useLingui } from '@lingui/react/macro';

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
  const { t } = useLingui();
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
        title={t`Ebook Converter`}
        description={t`Convert ebooks to EPUB, MOBI, AZW3, TXT, FB2, DOCX, or HTML. Free, no signup required.`}
        path="/convert/ebook"
        structuredData={buildToolSchema(t`Ebook Converter`, t`Convert ebooks to EPUB, MOBI, AZW3, TXT, FB2, DOCX, or HTML.`, '/convert/ebook')}
      />
      <Typography component="h1" level="h3" sx={{ mb: 1, fontWeight: 700, letterSpacing: '-0.02em' }}><Trans>Ebook Converter</Trans></Typography>
      <Typography level="body-sm" sx={{ color: 'text.tertiary', mb: 4 }}><Trans>Convert to EPUB, MOBI, AZW3, TXT, FB2, DOCX, or HTML</Trans></Typography>

      <ToolDisclaimer toolId="ebook-convert" />

      <Box sx={{ p: 2.5, mb: 3, borderRadius: 'lg', bgcolor: 'background.surface', border: '1px solid', borderColor: 'divider' }}>
        <FormControl>
          <FormLabel><Trans>Target format</Trans></FormLabel>
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
          title: t`How to convert an ebook online`,
          steps: [
            t`Select the target format — EPUB, MOBI, AZW3, TXT, FB2, DOCX, or HTML.`,
            t`Upload your ebook file (up to 50 MB).`,
            t`Download the converted ebook instantly.`,
          ],
        }}
        features={[
          { icon: <MenuBookOutlinedIcon />, title: t`Seven Output Formats`, description: t`Convert to EPUB, MOBI, AZW3, Plain Text, FB2, DOCX, or HTML.` },
          { icon: <SwapHorizOutlinedIcon />, title: t`Wide Input Support`, description: t`Accepts EPUB, MOBI, AZW3, PDF, FB2, TXT, DOCX, HTML, RTF, ODT, LIT, PDB, CBZ, and CBR files.` },
          { icon: <DevicesOutlinedIcon />, title: t`Cross-Device Ready`, description: t`Convert to the right format for common e-readers — Kindle (MOBI/AZW3), Kobo (EPUB), or plain text readers.` },
          { icon: <ArticleOutlinedIcon />, title: t`Layout Preserved`, description: t`Table of contents, chapters, images, and formatting are maintained during conversion.` },
          { icon: <BoltOutlinedIcon />, title: t`Fast Conversion`, description: t`Most ebooks convert in under 30 seconds, even long novels.` },
          { icon: <SecurityOutlinedIcon />, title: t`Privacy First`, description: t`Ebooks are handled in an isolated worker and expire after processing.` },
        ]}
        faq={[
          { question: t`What ebook formats can I convert?`, answer: t`Input formats include EPUB, MOBI, AZW3, AZW, PDF, FB2, TXT, DOCX, HTML, HTM, RTF, ODT, LIT, PDB, CBZ, and CBR. Output formats are EPUB, MOBI, AZW3, TXT, FB2, DOCX, and HTML.` },
          { question: t`Can I convert a PDF to EPUB?`, answer: t`Yes. PDF to EPUB conversion works best with text-based PDFs. Scanned/image-only PDFs may produce limited results since there is no OCR step.` },
          { question: t`What is the file size limit?`, answer: t`The maximum upload size is 50 MB, which covers virtually all ebook files.` },
          { question: t`Which format should I use for Kindle?`, answer: t`For modern Kindle devices, AZW3 offers the best feature support. MOBI is compatible with older Kindle models.` },
          { question: t`Are images and formatting preserved?`, answer: t`Yes. The converter preserves images, table of contents, chapter structure, and text formatting whenever the target format supports them.` },
        ]}
        relatedTools={[
          { label: t`Font Converter`, href: '/convert/font' },
          { label: t`PDF Compress`, href: '/compress/pdf' },
          { label: t`PDF Editor`, href: '/edit/pdf' },
          { label: t`Decompress Archive`, href: '/archive/decompress' },
        ]}
      />
    </Box>
  );
}
