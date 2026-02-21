import { useState, useCallback } from 'react';
import { Box, Typography, Select, Option, FormControl, FormLabel } from '@mui/joy';
import FileDropZone from '../components/FileDropZone';
import ConversionProgress from '../components/ConversionProgress';
import SEO, { buildToolSchema } from '../components/SEO';
import { useConversion } from '../hooks/useConversion';
import ToolDisclaimer from '../components/ToolDisclaimer';
import ToolSEOContent from '../components/ToolSEOContent';
import MusicNoteOutlinedIcon from '@mui/icons-material/MusicNoteOutlined';
import AudiotrackOutlinedIcon from '@mui/icons-material/AudiotrackOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import HighQualityOutlinedIcon from '@mui/icons-material/HighQualityOutlined';

export default function AudioConvertPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [outputFormat, setOutputFormat] = useState<'mp3' | 'wav' | 'flac' | 'aac'>('mp3');

  const conversion = useConversion('/convert/audio');

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    conversion.startConversion(file, { outputFormat });
  }, [outputFormat, conversion]);

  const handleRetry = useCallback(() => {
    conversion.reset();
    setSelectedFile(null);
  }, [conversion]);

  const isProcessing = ['uploading', 'queued', 'processing'].includes(conversion.status);

  return (
    <Box sx={{ maxWidth: 520, mx: 'auto', width: '100%', py: { xs: 3, md: 4 } }}>
      <SEO title="Audio Convert" description="Convert between MP3, WAV, FLAC and AAC for free. No signup, files processed in memory only." path="/convert/audio" structuredData={buildToolSchema('Audio Convert', 'Convert between MP3, WAV, FLAC and AAC for free. No signup, files processed in memory only.', '/convert/audio')} />
      <Typography component="h1" level="h3" sx={{ mb: 1, fontWeight: 700, letterSpacing: '-0.02em' }}>
        Audio Convert
      </Typography>
      <Typography level="body-sm" sx={{ color: 'text.tertiary', mb: 4 }}>
        Convert between MP3, WAV, FLAC and AAC
      </Typography>

      <ToolDisclaimer toolId="audio-convert" />

      <FormControl sx={{ mb: 3 }}>
        <FormLabel>Output format</FormLabel>
        <Select
          value={outputFormat}
          onChange={(_, value) => value && setOutputFormat(value)}
          disabled={isProcessing}
        >
          <Option value="mp3">MP3</Option>
          <Option value="wav">WAV</Option>
          <Option value="flac">FLAC</Option>
          <Option value="aac">AAC</Option>
        </Select>
      </FormControl>

      {conversion.status === 'idle' ? (
        <FileDropZone
          onFileSelect={handleFileSelect}
          accept=".mp3,.wav,.flac,.m4a,.aac,audio/*"
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
            previewUrl={conversion.previewUrl}
            onDownload={conversion.download}
            onRetry={handleRetry}
            showSizeComparison={false}
          />
        </Box>
      )}
      <ToolSEOContent
        howTo={{
          title: 'How to convert audio files online',
          steps: [
            'Select the output format you want — MP3, WAV, FLAC, or AAC.',
            'Upload your audio file (up to 50 MB).',
            'Wait a few seconds while the file is converted.',
            'Download the converted audio file instantly.',
          ],
        }}
        features={[
          { icon: <MusicNoteOutlinedIcon />, title: 'Multiple Formats', description: 'Convert between MP3, WAV, FLAC, and AAC with a single tool.' },
          { icon: <HighQualityOutlinedIcon />, title: 'High-Quality Output', description: 'Audio is transcoded at optimal bitrate and sample rate for the chosen format.' },
          { icon: <AudiotrackOutlinedIcon />, title: 'Any Audio Input', description: 'Accepts all common audio formats including M4A, OGG, WMA, and more.' },
          { icon: <TuneOutlinedIcon />, title: 'Simple Controls', description: 'Just pick your format and upload — no complicated settings to configure.' },
          { icon: <BoltOutlinedIcon />, title: 'Fast Processing', description: 'Most files convert in seconds, even large audio files up to 50 MB.' },
          { icon: <LockOutlinedIcon />, title: 'Privacy First', description: 'Files are processed in isolated memory and deleted immediately after download.' },
        ]}
        faq={[
          { question: 'Which audio format should I choose?', answer: 'MP3 is the most widely compatible format. WAV is uncompressed and best for editing. FLAC is lossless and great for archiving. AAC offers better quality than MP3 at the same file size.' },
          { question: 'Will converting audio reduce quality?', answer: 'Converting between lossy formats (MP3, AAC) may cause some quality loss. Converting to lossless (WAV, FLAC) preserves the current quality. For best results, start from the highest-quality source available.' },
          { question: 'What is the maximum file size?', answer: 'The maximum upload size is 50 MB. This is enough for most audio files — a typical MP3 song is 3-10 MB.' },
          { question: 'Can I convert video files to audio?', answer: 'This tool is for audio-to-audio conversion. To extract audio from a video file, use the Extract Audio tool instead.' },
        ]}
        relatedTools={[
          { label: 'Extract Audio', href: '/convert/audio-extract' },
          { label: 'Video Compress', href: '/compress/video' },
          { label: 'Video to GIF', href: '/convert/video-to-gif' },
          { label: 'Image Convert', href: '/convert/image' },
        ]}
      />
    </Box>
  );
}
