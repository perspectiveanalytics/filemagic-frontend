import { useState, useCallback } from 'react';
import { Box, Typography, Select, Option, FormControl, FormLabel } from '@mui/joy';
import FileDropZone from '../components/FileDropZone';
import ConversionProgress from '../components/ConversionProgress';
import SEO, { buildToolSchema } from '../components/SEO';
import { useConversion } from '../hooks/useConversion';
import ToolDisclaimer from '../components/ToolDisclaimer';
import ToolSEOContent from '../components/ToolSEOContent';
import TextFieldsOutlinedIcon from '@mui/icons-material/TextFieldsOutlined';
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';
import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import type { FontConvertOptions } from '../types/api';
import { Trans, useLingui } from '@lingui/react/macro';

type FontFormat = FontConvertOptions['targetFormat'];

const TARGET_FORMATS: { value: FontFormat; label: string }[] = [
  { value: 'ttf', label: 'TrueType (.ttf)' },
  { value: 'otf', label: 'OpenType (.otf)' },
  { value: 'woff', label: 'WOFF (.woff)' },
  { value: 'woff2', label: 'WOFF2 (.woff2)' },
];

export default function FontConvertPage() {
  const { t } = useLingui();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [targetFormat, setTargetFormat] = useState<FontFormat>('woff2');
  const conversion = useConversion('/convert/font');

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
        title={t`Font Converter`}
        description={t`Convert fonts between TTF, OTF, WOFF and WOFF2 formats. Free, no signup required.`}
        path="/convert/font"
        structuredData={buildToolSchema(t`Font Converter`, t`Convert fonts between TTF, OTF, WOFF and WOFF2 formats.`, '/convert/font')}
      />
      <Typography component="h1" level="h3" sx={{ mb: 1, fontWeight: 700, letterSpacing: '-0.02em' }}><Trans>Font Converter</Trans></Typography>
      <Typography level="body-sm" sx={{ color: 'text.tertiary', mb: 4 }}><Trans>Convert between TTF, OTF, WOFF and WOFF2</Trans></Typography>

      <ToolDisclaimer toolId="font-convert" />

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
          accept=".ttf,.otf,.woff,.woff2"
          maxSize={10 * 1024 * 1024}
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
          title: t`How to convert a font online`,
          steps: [
            t`Select the target format — TrueType (TTF), OpenType (OTF), WOFF, or WOFF2.`,
            t`Upload your font file (up to 10 MB).`,
            t`Download the converted font instantly.`,
          ],
        }}
        features={[
          { icon: <TextFieldsOutlinedIcon />, title: t`Four Font Formats`, description: t`Convert between TrueType (.ttf), OpenType (.otf), WOFF (.woff), and WOFF2 (.woff2).` },
          { icon: <LanguageOutlinedIcon />, title: t`Web-Ready Output`, description: t`Generate WOFF and WOFF2 files optimized for web use with smaller file sizes and faster loading.` },
          { icon: <SwapHorizOutlinedIcon />, title: t`Any-to-Any Conversion`, description: t`Convert from any supported format to any other — TTF to WOFF2, OTF to TTF, WOFF to OTF, and more.` },
          { icon: <BoltOutlinedIcon />, title: t`Fast Conversion`, description: t`Font files convert in seconds, even for large font families.` },
          { icon: <SecurityOutlinedIcon />, title: t`Privacy First`, description: t`Fonts are handled in an isolated worker and expire after processing.` },
        ]}
        faq={[
          { question: t`What font formats are supported?`, answer: t`You can convert between TTF (TrueType), OTF (OpenType), WOFF, and WOFF2. Any input format can be converted to any output format.` },
          { question: t`What is the difference between WOFF and WOFF2?`, answer: t`Both are web font formats. WOFF2 uses Brotli compression and is typically 30% smaller than WOFF, which uses gzip. WOFF2 is supported by all modern browsers.` },
          { question: t`What is the file size limit?`, answer: t`The maximum upload size is 10 MB, which covers virtually all font files including large CJK fonts.` },
          { question: t`Will the conversion affect font quality?`, answer: t`No. The conversion preserves all glyphs, hinting, kerning, and OpenType features. Only the container format changes.` },
          { question: t`Can I convert variable fonts?`, answer: t`Yes. Variable font axes and instances are preserved during conversion between compatible formats.` },
        ]}
        relatedTools={[
          { label: t`Ebook Converter`, href: '/convert/ebook' },
          { label: t`PDF Compress`, href: '/compress/pdf' },
          { label: t`QR Code Generator`, href: '/qrcode' },
          { label: t`Compress & Encrypt`, href: '/archive/create' },
        ]}
      />
    </Box>
  );
}
