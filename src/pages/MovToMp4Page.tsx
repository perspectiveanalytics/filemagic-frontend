import { useState, useCallback } from 'react';
import { Box, Typography, Chip } from '@mui/joy';
import FileDropZone from '../components/FileDropZone';
import ConversionProgress from '../components/ConversionProgress';
import SEO, { buildToolSchema } from '../components/SEO';
import { useConversion } from '../hooks/useConversion';
import ToolDisclaimer from '../components/ToolDisclaimer';
import ToolSEOContent from '../components/ToolSEOContent';
import MovieOutlinedIcon from '@mui/icons-material/MovieOutlined';
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';
import DevicesOutlinedIcon from '@mui/icons-material/DevicesOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import HighQualityOutlinedIcon from '@mui/icons-material/HighQualityOutlined';

export default function MovToMp4Page() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const conversion = useConversion('/convert/video/mov-to-mp4');

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    conversion.startConversion(file, {});
  }, [conversion]);

  const handleRetry = useCallback(() => {
    conversion.reset();
    setSelectedFile(null);
  }, [conversion]);

  return (
    <Box sx={{ maxWidth: 520, mx: 'auto', width: '100%', py: { xs: 3, md: 4 } }}>
      <SEO title="MOV to MP4" description="Convert MOV videos to MP4 for free. No signup, files processed in memory only." path="/convert/mov-to-mp4" structuredData={buildToolSchema('MOV to MP4', 'Convert MOV to MP4 for free.', '/convert/mov-to-mp4')} />
      <Typography component="h1" level="h3" sx={{ mb: 1, fontWeight: 700, letterSpacing: '-0.02em' }}>
        MOV to MP4
      </Typography>
      <Typography level="body-sm" sx={{ color: 'text.tertiary', mb: 2 }}>
        Convert QuickTime MOV videos to MP4
      </Typography>

      <ToolDisclaimer toolId="mov-to-mp4" />

      <Chip
        size="sm"
        variant="soft"
        color="warning"
        sx={{ mb: 3, fontWeight: 500, fontSize: '0.7rem' }}
      >
        Beta — works best with small files (under 50 MB)
      </Chip>

      {conversion.status === 'idle' ? (
        <FileDropZone
          onFileSelect={handleFileSelect}
          accept=".mov,video/quicktime"
          maxSize={200 * 1024 * 1024}
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
          title: 'How to convert MOV to MP4 online',
          steps: [
            'Upload your MOV file (up to 200 MB).',
            'The conversion to MP4 starts automatically.',
            'Wait a moment while the video is re-encoded.',
            'Download the MP4 file instantly.',
          ],
        }}
        features={[
          { icon: <SwapHorizOutlinedIcon />, title: 'One-Click Conversion', description: 'No settings to configure — just upload your MOV file and get an MP4 back.' },
          { icon: <DevicesOutlinedIcon />, title: 'Universal Compatibility', description: 'MP4 is supported on virtually every device, browser, and platform.' },
          { icon: <HighQualityOutlinedIcon />, title: 'Quality Preserved', description: 'Video is re-encoded with H.264 at high quality to minimize visual loss.' },
          { icon: <MovieOutlinedIcon />, title: 'Audio Included', description: 'Both video and audio tracks are converted — nothing is stripped out.' },
          { icon: <BoltOutlinedIcon />, title: 'Fast Processing', description: 'Most MOV files convert in seconds, even files up to 200 MB.' },
          { icon: <LockOutlinedIcon />, title: 'Privacy First', description: 'Files are processed in isolated memory and deleted immediately after download.' },
        ]}
        faq={[
          { question: 'Why convert MOV to MP4?', answer: 'MOV is an Apple QuickTime format that may not play on all devices. MP4 is the most widely supported video format and works everywhere — Windows, Android, web browsers, and social media platforms.' },
          { question: 'Will converting lose quality?', answer: 'There is minimal quality loss. The video is re-encoded with H.264 at high quality settings to preserve as much detail as possible.' },
          { question: 'Is there a file size limit?', answer: 'The maximum upload size is 200 MB. This tool is currently in beta and works best with files under 50 MB.' },
          { question: 'Can I convert other video formats to MP4?', answer: 'This tool is specifically for MOV to MP4. For other formats, use the Video Compress tool which accepts MP4, MKV, AVI, MOV, and WebM.' },
        ]}
        relatedTools={[
          { label: 'Video Compress', href: '/compress/video' },
          { label: 'Video to GIF', href: '/convert/video-to-gif' },
          { label: 'Extract Audio', href: '/convert/audio-extract' },
          { label: 'Audio Convert', href: '/convert/audio' },
          { label: 'Image Convert', href: '/convert/image' },
        ]}
      />
    </Box>
  );
}
