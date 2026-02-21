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

type FontFormat = FontConvertOptions['targetFormat'];

const TARGET_FORMATS: { value: FontFormat; label: string }[] = [
  { value: 'ttf', label: 'TrueType (.ttf)' },
  { value: 'otf', label: 'OpenType (.otf)' },
  { value: 'woff', label: 'WOFF (.woff)' },
  { value: 'woff2', label: 'WOFF2 (.woff2)' },
];

export default function FontConvertPage() {
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
        title="Font Converter"
        description="Convert fonts between TTF, OTF, WOFF and WOFF2 formats. Free, no signup required."
        path="/convert/font"
        structuredData={buildToolSchema('Font Converter', 'Convert fonts between TTF, OTF, WOFF and WOFF2 formats.', '/convert/font')}
      />
      <Typography component="h1" level="h3" sx={{ mb: 1, fontWeight: 700, letterSpacing: '-0.02em' }}>
        Font Converter
      </Typography>
      <Typography level="body-sm" sx={{ color: 'text.tertiary', mb: 4 }}>
        Convert between TTF, OTF, WOFF and WOFF2
      </Typography>

      <ToolDisclaimer toolId="font-convert" />

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
          title: 'How to convert a font online',
          steps: [
            'Select the target format — TrueType (TTF), OpenType (OTF), WOFF, or WOFF2.',
            'Upload your font file (up to 10 MB).',
            'Download the converted font instantly.',
          ],
        }}
        features={[
          { icon: <TextFieldsOutlinedIcon />, title: 'Four Font Formats', description: 'Convert between TrueType (.ttf), OpenType (.otf), WOFF (.woff), and WOFF2 (.woff2).' },
          { icon: <LanguageOutlinedIcon />, title: 'Web-Ready Output', description: 'Generate WOFF and WOFF2 files optimized for web use with smaller file sizes and faster loading.' },
          { icon: <SwapHorizOutlinedIcon />, title: 'Any-to-Any Conversion', description: 'Convert from any supported format to any other — TTF to WOFF2, OTF to TTF, WOFF to OTF, and more.' },
          { icon: <BoltOutlinedIcon />, title: 'Fast Conversion', description: 'Font files convert in seconds, even for large font families.' },
          { icon: <SecurityOutlinedIcon />, title: 'Privacy First', description: 'Fonts are processed in isolated memory and deleted immediately after download.' },
        ]}
        faq={[
          { question: 'What font formats are supported?', answer: 'You can convert between TTF (TrueType), OTF (OpenType), WOFF, and WOFF2. Any input format can be converted to any output format.' },
          { question: 'What is the difference between WOFF and WOFF2?', answer: 'Both are web font formats. WOFF2 uses Brotli compression and is typically 30% smaller than WOFF, which uses gzip. WOFF2 is supported by all modern browsers.' },
          { question: 'What is the file size limit?', answer: 'The maximum upload size is 10 MB, which covers virtually all font files including large CJK fonts.' },
          { question: 'Will the conversion affect font quality?', answer: 'No. The conversion preserves all glyphs, hinting, kerning, and OpenType features. Only the container format changes.' },
          { question: 'Can I convert variable fonts?', answer: 'Yes. Variable font axes and instances are preserved during conversion between compatible formats.' },
        ]}
        relatedTools={[
          { label: 'Ebook Converter', href: '/convert/ebook' },
          { label: 'PDF Compress', href: '/compress/pdf' },
          { label: 'QR Code Generator', href: '/generate/qrcode' },
          { label: 'Compress & Encrypt', href: '/archive/create' },
        ]}
      />
    </Box>
  );
}
