import { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Input,
  FormControl,
  FormLabel,
} from '@mui/joy';
import FileDropZone from '../components/FileDropZone';
import ConversionProgress from '../components/ConversionProgress';
import SEO, { buildToolSchema } from '../components/SEO';
import { useConversion } from '../hooks/useConversion';
import type { ImageCompressOptions } from '../types/api';
import ToolDisclaimer from '../components/ToolDisclaimer';
import ToolSEOContent from '../components/ToolSEOContent';
import CompressOutlinedIcon from '@mui/icons-material/CompressOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import SpeedOutlinedIcon from '@mui/icons-material/SpeedOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';

const TARGET_SIZE_PRESETS = [
  { label: '100 KB', value: 100 },
  { label: '250 KB', value: 250 },
  { label: '500 KB', value: 500 },
  { label: '1 MB', value: 1024 },
  { label: '2 MB', value: 2048 },
];

const presetBtnSx = (active: boolean) => ({
  px: 2,
  py: 0.75,
  borderRadius: 'md',
  fontSize: '0.875rem',
  fontWeight: 600,
  cursor: 'pointer',
  border: '1px solid',
  borderColor: active ? 'primary.500' : 'divider',
  bgcolor: active ? 'primary.softBg' : 'transparent',
  color: active ? 'primary.plainColor' : 'text.secondary',
  transition: 'all 0.15s',
  outline: 'none',
  '&:hover': { borderColor: 'primary.400', bgcolor: 'primary.softBg' },
} as const);

export default function ImageCompressPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [targetSizeKB, setTargetSizeKB] = useState(500);

  const conversion = useConversion('/convert/image/compress');

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    const options: ImageCompressOptions = {
      targetSize: targetSizeKB * 1024,
    };
    conversion.startConversion(file, options);
  }, [targetSizeKB, conversion]);

  const handleRetry = useCallback(() => {
    conversion.reset();
    setSelectedFile(null);
  }, [conversion]);

  return (
    <Box sx={{ maxWidth: 520, mx: 'auto', width: '100%', py: { xs: 3, md: 4 } }}>
      <SEO
        title="Image Compress"
        description="Compress JPG or PNG images to a target file size. Free, no signup, files processed in memory only."
        path="/compress/image"
        structuredData={buildToolSchema('Image Compress', 'Compress JPG or PNG images to a target file size.', '/compress/image')}
      />
      <Typography component="h1" level="h3" sx={{ mb: 1, fontWeight: 700, letterSpacing: '-0.02em' }}>
        Image Compress
      </Typography>
      <Typography level="body-sm" sx={{ color: 'text.tertiary', mb: 4 }}>
        Compress JPG or PNG images to a target file size
      </Typography>

      <ToolDisclaimer toolId="image-compress" />

      {conversion.status === 'idle' && (
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
          <FormControl>
            <FormLabel>Target file size</FormLabel>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 0.5 }}>
              {TARGET_SIZE_PRESETS.map((preset) => (
                <Box
                  key={preset.value}
                  component="button"
                  onClick={() => setTargetSizeKB(preset.value)}
                  sx={presetBtnSx(targetSizeKB === preset.value)}
                >
                  {preset.label}
                </Box>
              ))}
            </Box>
            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Input
                type="number"
                value={targetSizeKB}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  if (v > 0) setTargetSizeKB(v);
                }}
                size="sm"
                sx={{ width: 100 }}
                slotProps={{ input: { min: 10, max: 15360 } }}
              />
              <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
                KB
              </Typography>
            </Box>
            <Typography level="body-xs" sx={{ color: 'text.tertiary', mt: 1.5 }}>
              Quality will be adjusted automatically. For PNG, resolution may be reduced.
            </Typography>
          </FormControl>
        </Box>
      )}

      {conversion.status === 'idle' && (
        <FileDropZone
          onFileSelect={handleFileSelect}
          accept=".jpg,.jpeg,.png,image/jpeg,image/png"
          maxSize={20 * 1024 * 1024}
          allowPaste
        />
      )}

      {conversion.status !== 'idle' && (
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
          title: 'How to compress images online',
          steps: [
            'Choose a target file size using the presets or enter a custom value in KB.',
            'Upload your JPG or PNG image (up to 20 MB).',
            'The compression starts automatically and adjusts quality to meet your target size.',
            'Download the compressed image instantly.',
          ],
        }}
        features={[
          { icon: <CompressOutlinedIcon />, title: 'Target Size Control', description: 'Set an exact target file size from 10 KB to 15 MB. Quality adjusts automatically.' },
          { icon: <TuneOutlinedIcon />, title: 'Smart Presets', description: 'Quick presets for common sizes: 100 KB, 250 KB, 500 KB, 1 MB, and 2 MB.' },
          { icon: <ImageOutlinedIcon />, title: 'JPG & PNG Support', description: 'Compress both JPG and PNG images. For PNG, resolution may be reduced to meet the target.' },
          { icon: <SpeedOutlinedIcon />, title: 'Fast Processing', description: 'Server-side compression delivers results in seconds, even for large images.' },
          { icon: <LockOutlinedIcon />, title: 'Private & Secure', description: 'Files are processed in an isolated sandbox and deleted immediately after download.' },
          { icon: <BoltOutlinedIcon />, title: 'No Signup Required', description: 'Start compressing immediately. No account, no email, no ads.' },
        ]}
        faq={[
          { question: 'How does target size compression work?', answer: 'The compressor automatically adjusts image quality and, for PNG files, resolution to bring the output as close to your target size as possible without going over.' },
          { question: 'Will compression reduce image quality?', answer: 'Yes, compression involves a trade-off between file size and quality. Smaller targets require more aggressive compression. For best results, choose the largest target size that meets your requirements.' },
          { question: 'What image formats are supported?', answer: 'Image Compress supports JPG/JPEG and PNG files. For other formats, use the Image Convert tool first to convert to JPG or PNG.' },
          { question: 'Is there a file size limit?', answer: 'The maximum upload size is 20 MB per image. The minimum target size is 10 KB.' },
          { question: 'Are my images stored on your servers?', answer: 'No. Files are processed in isolated memory and automatically deleted as soon as you download the result. We never store, log, or share your files.' },
        ]}
        relatedTools={[
          { label: 'Image Convert', href: '/convert/image' },
          { label: 'HEIC Convert', href: '/convert/heic' },
          { label: 'PDF Compress', href: '/compress/pdf' },
          { label: 'Metadata Remove', href: '/metadata/remove' },
        ]}
      />
    </Box>
  );
}
