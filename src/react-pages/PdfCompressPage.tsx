import { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Select,
  Option,
  FormControl,
  FormLabel,
  Switch,
  Slider,
  RadioGroup,
  Radio,
  Sheet,
} from '@mui/joy';
import FileDropZone from '../components/FileDropZone';
import ConversionProgress from '../components/ConversionProgress';
import SEO, { buildToolSchema } from '../components/SEO';
import { useConversion } from '../hooks/useConversion';
import type { PDFCompressOptions } from '../types/api';
import ToolDisclaimer from '../components/ToolDisclaimer';
import ToolSEOContent from '../components/ToolSEOContent';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import AdjustOutlinedIcon from '@mui/icons-material/AdjustOutlined';
import PhotoSizeSelectLargeOutlinedIcon from '@mui/icons-material/PhotoSizeSelectLargeOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { Trans, useLingui } from '@lingui/react/macro';

type CompressMode = 'level' | 'targetSize';

const TARGET_SIZE_PRESETS = [
  { label: '500 KB', value: 500 },
  { label: '1 MB', value: 1024 },
  { label: '2 MB', value: 2048 },
  { label: '5 MB', value: 5120 },
  { label: '10 MB', value: 10240 },
];

// Slider uses a non-linear scale for better UX: fine control at low values, coarser at high
const SLIDER_MARKS = [
  { value: 0, label: '100 KB' },
  { value: 25, label: '500 KB' },
  { value: 50, label: '2 MB' },
  { value: 75, label: '5 MB' },
  { value: 100, label: '20 MB' },
];

// Map slider position (0–100) → KB using exponential scale
function sliderToKB(pos: number): number {
  // 0 → 100 KB, 100 → 20480 KB (20 MB)
  const minLog = Math.log(100);
  const maxLog = Math.log(20480);
  return Math.round(Math.exp(minLog + (pos / 100) * (maxLog - minLog)));
}

// Map KB → slider position (0–100)
function kbToSlider(kb: number): number {
  const minLog = Math.log(100);
  const maxLog = Math.log(20480);
  const clamped = Math.max(100, Math.min(20480, kb));
  return ((Math.log(clamped) - minLog) / (maxLog - minLog)) * 100;
}

function formatKB(kb: number): string {
  if (kb < 1024) return `${kb} KB`;
  const mb = kb / 1024;
  return mb === Math.floor(mb) ? `${mb} MB` : `${mb.toFixed(1)} MB`;
}

export default function PdfCompressPage() {
  const { t } = useLingui();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mode, setMode] = useState<CompressMode>('level');
  const [level, setLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [lossy, setLossy] = useState(true);
  const [targetSizeKB, setTargetSizeKB] = useState(1024);

  const conversion = useConversion('/convert/pdf/compress');

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    const options: PDFCompressOptions = mode === 'level'
      ? { level, lossy }
      : { targetSize: targetSizeKB * 1024 };
    conversion.startConversion(file, options);
  }, [mode, level, lossy, targetSizeKB, conversion]);

  const handleRetry = useCallback(() => {
    conversion.reset();
    setSelectedFile(null);
  }, [conversion]);

  const isProcessing = ['uploading', 'queued', 'processing'].includes(conversion.status);

  return (
    <Box sx={{ maxWidth: 520, mx: 'auto', width: '100%', py: { xs: 3, md: 4 } }}>
      <SEO title={t`PDF Compress`} description={t`Reduce PDF file size with adjustable quality, lossy compression, or target file size. Free, no signup, short-lived processing.`} path="/compress/pdf" structuredData={buildToolSchema(t`PDF Compress`, t`Reduce PDF file size with adjustable quality, lossy compression, or target file size. Free, no signup, short-lived processing.`, '/compress/pdf')} />
      <Typography component="h1" level="h3" sx={{ mb: 1, fontWeight: 700, letterSpacing: '-0.02em' }}><Trans>PDF Compress</Trans></Typography>
      <Typography level="body-sm" sx={{ color: 'text.tertiary', mb: 4 }}><Trans>Reduce PDF file size with adjustable quality</Trans></Typography>

      <ToolDisclaimer toolId="pdf-compress" />

      <Box
        sx={{
          p: 2.5,
          mb: 3,
          borderRadius: 'lg',
          bgcolor: 'background.surface',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <FormControl sx={{ mb: 2.5 }}>
          <RadioGroup
            orientation="horizontal"
            value={mode}
            onChange={(e) => setMode(e.target.value as CompressMode)}
            sx={{ gap: 2 }}
          >
            <Sheet
              variant={mode === 'level' ? 'soft' : 'plain'}
              sx={{
                flex: 1,
                p: 1.5,
                borderRadius: 'md',
                border: '1px solid',
                borderColor: mode === 'level' ? 'primary.500' : 'divider',
                cursor: isProcessing ? 'default' : 'pointer',
                transition: 'all 0.15s',
              }}
            >
              <Radio
                value="level"
                label={t`Compression level`}
                overlay
                disabled={isProcessing}
                slotProps={{ label: { sx: { fontSize: '0.875rem', fontWeight: 600 } } }}
              />
              <Typography level="body-xs" sx={{ color: 'text.tertiary', mt: 0.5, ml: 3.5 }}><Trans>Choose preset quality</Trans></Typography>
            </Sheet>
            <Sheet
              variant={mode === 'targetSize' ? 'soft' : 'plain'}
              sx={{
                flex: 1,
                p: 1.5,
                borderRadius: 'md',
                border: '1px solid',
                borderColor: mode === 'targetSize' ? 'primary.500' : 'divider',
                cursor: isProcessing ? 'default' : 'pointer',
                transition: 'all 0.15s',
              }}
            >
              <Radio
                value="targetSize"
                label={t`Target size`}
                overlay
                disabled={isProcessing}
                slotProps={{ label: { sx: { fontSize: '0.875rem', fontWeight: 600 } } }}
              />
              <Typography level="body-xs" sx={{ color: 'text.tertiary', mt: 0.5, ml: 3.5 }}><Trans>Compress to a file size</Trans></Typography>
            </Sheet>
          </RadioGroup>
        </FormControl>

        {mode === 'level' ? (
          <>
            <FormControl sx={{ mb: 2.5 }}>
              <FormLabel><Trans>Compression level</Trans></FormLabel>
              <Select
                value={level}
                onChange={(_, value) => value && setLevel(value)}
                disabled={isProcessing}
              >
                <Option value="low">{t`Low (best quality)`}</Option>
                <Option value="medium">{t`Medium`}</Option>
                <Option value="high">{t`High (smallest size)`}</Option>
              </Select>
            </FormControl>

            <FormControl
              orientation="horizontal"
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Box>
                <FormLabel sx={{ mb: 0 }}><Trans>Lossy compression</Trans></FormLabel>
                <Typography level="body-xs" sx={{ color: 'text.tertiary' }}><Trans>Downsample images for smaller file size</Trans></Typography>
              </Box>
              <Switch
                checked={lossy}
                onChange={(e) => setLossy(e.target.checked)}
                disabled={isProcessing}
                size="sm"
              />
            </FormControl>
          </>
        ) : (
          <FormControl>
            <FormLabel><Trans>Target file size</Trans></FormLabel>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.5 }}>
              {TARGET_SIZE_PRESETS.map((preset) => (
                <Box
                  key={preset.value}
                  component="button"
                  onClick={() => !isProcessing && setTargetSizeKB(preset.value)}
                  sx={{
                    px: 2,
                    py: 0.75,
                    borderRadius: 'md',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    cursor: isProcessing ? 'default' : 'pointer',
                    border: '1px solid',
                    borderColor: targetSizeKB === preset.value ? 'primary.500' : 'divider',
                    bgcolor: targetSizeKB === preset.value ? 'primary.softBg' : 'transparent',
                    color: targetSizeKB === preset.value ? 'primary.plainColor' : 'text.secondary',
                    transition: 'all 0.15s',
                    outline: 'none',
                    '&:hover': isProcessing ? {} : {
                      borderColor: 'primary.400',
                      bgcolor: 'primary.softBg',
                    },
                  }}
                >
                  {preset.label}
                </Box>
              ))}
            </Box>
            <Box sx={{ mt: 2.5, px: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
                <Typography level="body-sm" sx={{ fontWeight: 600, color: 'primary.plainColor' }}>
                  {formatKB(targetSizeKB)}
                </Typography>
              </Box>
              <Slider
                value={kbToSlider(targetSizeKB)}
                onChange={(_, v) => setTargetSizeKB(sliderToKB(v as number))}
                min={0}
                max={100}
                step={0.5}
                disabled={isProcessing}
                size="sm"
                marks={SLIDER_MARKS}
                sx={{
                  '& .MuiSlider-markLabel': {
                    fontSize: '0.65rem',
                    color: 'text.tertiary',
                  },
                }}
              />
            </Box>
            <Typography level="body-xs" sx={{ color: 'text.tertiary', mt: 2 }}><Trans>Image DPI and quality will be adjusted automatically to meet the target.</Trans></Typography>
          </FormControl>
        )}
      </Box>

      {conversion.status === 'idle' ? (
        <FileDropZone
          onFileSelect={handleFileSelect}
          accept=".pdf,application/pdf"
          maxSize={40 * 1024 * 1024}
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
            previewUrl={conversion.previewUrl}
            onDownload={conversion.download}
            onRetry={handleRetry}
          />
        </Box>
      )}
      <ToolSEOContent
        howTo={{
          title: t`How to compress a PDF online`,
          steps: [
            t`Choose your compression mode — either a quality level preset or a specific target file size.`,
            t`Optionally enable lossy compression to downsample embedded images for smaller output.`,
            t`Upload your PDF file (up to 40 MB).`,
            t`Download the compressed PDF instantly.`,
          ],
        }}
        features={[
          { icon: <TuneOutlinedIcon />, title: t`Quality Presets`, description: t`Choose Low, Medium, or High compression to balance quality against file size.` },
          { icon: <AdjustOutlinedIcon />, title: t`Target File Size`, description: t`Set an exact target from 100 KB to 20 MB. DPI and quality adjust automatically.` },
          { icon: <PhotoSizeSelectLargeOutlinedIcon />, title: t`Lossy Compression`, description: t`Optionally downsample embedded images for significantly smaller output.` },
          { icon: <ArticleOutlinedIcon />, title: t`Structure Preserved`, description: t`Text, fonts, bookmarks, and hyperlinks remain intact after compression.` },
          { icon: <BoltOutlinedIcon />, title: t`Fast Processing`, description: t`Most PDFs compress in under 10 seconds, even large documents.` },
          { icon: <LockOutlinedIcon />, title: t`Privacy First`, description: t`Files are handled in an isolated worker and expire after processing.` },
        ]}
        faq={[
          { question: t`How much smaller will my PDF be?`, answer: t`It depends on the content. PDFs with high-resolution images typically compress 50–80%. Text-heavy documents with few images may only shrink 10–20%.` },
          { question: t`Does compression affect text quality?`, answer: t`No. Text and vector elements are losslessly compressed and remain perfectly sharp. Only embedded raster images are affected by lossy compression.` },
          { question: t`What is the difference between lossy and lossless compression?`, answer: t`Lossless compression reduces file size without any quality loss by optimizing internal PDF structures. Lossy compression additionally downsamples embedded images, achieving smaller sizes at the cost of some image detail.` },
          { question: t`Is there a file size limit?`, answer: t`The maximum upload size is 40 MB. For larger files, consider splitting the PDF first using the PDF Editor tool.` },
          { question: t`Can I compress a password-protected PDF?`, answer: t`No. You need to remove the password first using the PDF Password tool, then compress the unprotected file.` },
        ]}
        relatedTools={[
          { label: t`PDF Merge`, href: '/merge/pdf' },
          { label: t`PDF Editor`, href: '/edit/pdf' },
          { label: t`PDF Password`, href: '/convert/pdf-password' },
          { label: t`PDF Repair`, href: '/repair/pdf' },
          { label: t`Images to PDF`, href: '/merge/image-to-pdf' },
        ]}
      />
    </Box>
  );
}
