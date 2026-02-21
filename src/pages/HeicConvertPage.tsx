import { useState, useCallback } from 'react';
import { Box, Typography, Select, Option, FormControl, FormLabel } from '@mui/joy';
import FileDropZone from '../components/FileDropZone';
import ConversionProgress from '../components/ConversionProgress';
import SEO, { buildToolSchema } from '../components/SEO';
import { useConversion } from '../hooks/useConversion';
import type { ImageConvertOptions } from '../types/api';
import ToolDisclaimer from '../components/ToolDisclaimer';
import ToolSEOContent from '../components/ToolSEOContent';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import SpeedOutlinedIcon from '@mui/icons-material/SpeedOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import HighQualityOutlinedIcon from '@mui/icons-material/HighQualityOutlined';
import DevicesOutlinedIcon from '@mui/icons-material/DevicesOutlined';

export default function HeicConvertPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [outputFormat, setOutputFormat] = useState<'jpg' | 'png' | 'webp' | 'tiff'>('jpg');

  const conversion = useConversion('/convert/image');

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    const options: ImageConvertOptions = { outputFormat };
    conversion.startConversion(file, options);
  }, [outputFormat, conversion]);

  const handleRetry = useCallback(() => {
    conversion.reset();
    setSelectedFile(null);
  }, [conversion]);

  const isProcessing = ['uploading', 'queued', 'processing'].includes(conversion.status);

  return (
    <Box sx={{ maxWidth: 520, mx: 'auto', width: '100%', py: { xs: 3, md: 4 } }}>
      <SEO title="HEIC Convert" description="Convert Apple HEIC images to JPG, PNG, WebP, or TIFF for free. No signup, files processed in memory only." path="/convert/heic" structuredData={buildToolSchema('HEIC Convert', 'Convert Apple HEIC images to JPG, PNG, WebP, or TIFF for free.', '/convert/heic')} />
      <Typography component="h1" level="h3" sx={{ mb: 1, fontWeight: 700, letterSpacing: '-0.02em' }}>
        HEIC Convert
      </Typography>
      <Typography level="body-sm" sx={{ color: 'text.tertiary', mb: 4 }}>
        Convert Apple HEIC images to JPG, PNG, WebP, or TIFF
      </Typography>

      <ToolDisclaimer toolId="heic-convert" />

      <FormControl sx={{ mb: 3 }}>
        <FormLabel>Output format</FormLabel>
        <Select
          value={outputFormat}
          onChange={(_, value) => value && setOutputFormat(value)}
          disabled={isProcessing}
        >
          <Option value="jpg">JPG</Option>
          <Option value="png">PNG</Option>
          <Option value="webp">WebP</Option>
          <Option value="tiff">TIFF</Option>
        </Select>
      </FormControl>

      {conversion.status === 'idle' ? (
        <FileDropZone
          onFileSelect={handleFileSelect}
          accept=".heic,.heif"
          maxSize={20 * 1024 * 1024}
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
            showSizeComparison={false}
          />
        </Box>
      )}
      <ToolSEOContent
        howTo={{
          title: 'How to convert HEIC images online',
          steps: [
            'Select your desired output format — JPG, PNG, WebP, or TIFF.',
            'Upload your HEIC or HEIF file (up to 20 MB).',
            'The conversion starts automatically once the file is uploaded.',
            'Download your converted image instantly.',
          ],
        }}
        features={[
          { icon: <ImageOutlinedIcon />, title: 'Multiple Output Formats', description: 'Convert HEIC/HEIF to JPG, PNG, WebP, or TIFF to suit any workflow.' },
          { icon: <HighQualityOutlinedIcon />, title: 'High Quality Output', description: 'Preserves image quality during conversion with minimal loss.' },
          { icon: <SpeedOutlinedIcon />, title: 'Fast Conversion', description: 'Server-side processing converts your HEIC files in seconds.' },
          { icon: <DevicesOutlinedIcon />, title: 'Cross-Platform Compatibility', description: 'Convert Apple HEIC photos so they open on Windows, Android, and any device.' },
          { icon: <LockOutlinedIcon />, title: 'Private & Secure', description: 'Files are processed in an isolated sandbox and deleted immediately after download.' },
          { icon: <BoltOutlinedIcon />, title: 'No Signup Required', description: 'Start converting immediately. No account, no email, no ads.' },
        ]}
        faq={[
          { question: 'What is the HEIC format?', answer: 'HEIC (High Efficiency Image Container) is the default photo format on Apple devices since iOS 11. It offers better compression than JPG while maintaining similar quality, but is not universally supported on non-Apple platforms.' },
          { question: 'Why can\'t I open HEIC files on my computer?', answer: 'Windows and many other platforms do not natively support HEIC. Converting to JPG or PNG makes the images compatible with virtually all devices, browsers, and applications.' },
          { question: 'Which output format should I choose?', answer: 'Choose JPG for the smallest file size and widest compatibility. Choose PNG for lossless quality with transparency support. Choose WebP for a modern format with excellent compression. Choose TIFF for professional or print workflows.' },
          { question: 'Is there a file size limit?', answer: 'The maximum file size is 20 MB per image, which covers virtually all photos taken on iPhones and iPads.' },
          { question: 'Are my images stored on your servers?', answer: 'No. Files are processed in isolated memory and automatically deleted as soon as you download the result. We never store, log, or share your files.' },
        ]}
        relatedTools={[
          { label: 'Image Convert', href: '/convert/image' },
          { label: 'Image Compress', href: '/compress/image' },
          { label: 'Images to PDF', href: '/merge/image-to-pdf' },
          { label: 'Metadata Remove', href: '/metadata/remove' },
        ]}
      />
    </Box>
  );
}
