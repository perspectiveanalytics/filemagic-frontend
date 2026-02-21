import { useState, useCallback } from 'react';
import { Box, Typography, Select, Option, FormControl, FormLabel } from '@mui/joy';
import FileDropZone from '../components/FileDropZone';
import ConversionProgress from '../components/ConversionProgress';
import SEO, { buildToolSchema } from '../components/SEO';
import { useConversion } from '../hooks/useConversion';
import ToolDisclaimer from '../components/ToolDisclaimer';
import ToolSEOContent from '../components/ToolSEOContent';
import MovieOutlinedIcon from '@mui/icons-material/MovieOutlined';
import AudiotrackOutlinedIcon from '@mui/icons-material/AudiotrackOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import MusicNoteOutlinedIcon from '@mui/icons-material/MusicNoteOutlined';

export default function AudioExtractPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [outputFormat, setOutputFormat] = useState<'mp3' | 'wav' | 'flac' | 'aac'>('mp3');

  const conversion = useConversion('/convert/audio/extract');

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
      <SEO title="Extract Audio" description="Extract audio track from video files for free. No signup, files processed in memory only." path="/convert/audio/extract" structuredData={buildToolSchema('Extract Audio', 'Extract audio track from video files for free. No signup, files processed in memory only.', '/convert/audio/extract')} />
      <Typography component="h1" level="h3" sx={{ mb: 1, fontWeight: 700, letterSpacing: '-0.02em' }}>
        Extract Audio
      </Typography>
      <Typography level="body-sm" sx={{ color: 'text.tertiary', mb: 4 }}>
        Extract audio track from video files
      </Typography>

      <ToolDisclaimer toolId="audio-extract" />

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
          accept=".mp4,.mkv,.avi,.mov,.webm,video/*"
          maxSize={100 * 1024 * 1024}
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
          title: 'How to extract audio from video online',
          steps: [
            'Choose the output audio format — MP3, WAV, FLAC, or AAC.',
            'Upload your video file (up to 100 MB).',
            'The audio track is extracted automatically.',
            'Download the extracted audio file instantly.',
          ],
        }}
        features={[
          { icon: <MovieOutlinedIcon />, title: 'Any Video Input', description: 'Supports MP4, MKV, AVI, MOV, WebM, and other common video formats.' },
          { icon: <AudiotrackOutlinedIcon />, title: 'Flexible Output', description: 'Extract audio as MP3, WAV, FLAC, or AAC depending on your needs.' },
          { icon: <MusicNoteOutlinedIcon />, title: 'Full Audio Track', description: 'The entire audio stream is extracted — no clipping or trimming applied.' },
          { icon: <TuneOutlinedIcon />, title: 'Optimal Quality', description: 'Audio is extracted at the best available quality from the source video.' },
          { icon: <BoltOutlinedIcon />, title: 'Fast Extraction', description: 'Most videos are processed in seconds, even files up to 100 MB.' },
          { icon: <LockOutlinedIcon />, title: 'Privacy First', description: 'Files are processed in isolated memory and deleted immediately after download.' },
        ]}
        faq={[
          { question: 'Which format should I extract audio to?', answer: 'MP3 is the most compatible and works everywhere. WAV is best for editing in audio software. FLAC preserves full quality without compression. AAC is ideal for Apple devices and smaller file sizes.' },
          { question: 'Does extracting audio reduce quality?', answer: 'When extracting to a lossy format like MP3 or AAC, the audio is re-encoded which may cause slight quality loss. For the best quality, extract to WAV or FLAC.' },
          { question: 'What is the maximum file size?', answer: 'The maximum upload size is 100 MB. For larger video files, consider compressing the video first using the Video Compress tool.' },
          { question: 'Can I extract audio from a specific part of the video?', answer: 'This tool extracts the full audio track. If you need a specific segment, extract the full track first and then trim it using an audio editor.' },
          { question: 'What if my video has no audio track?', answer: 'If the video file contains no audio stream, the extraction will fail with an error. Make sure your video includes an audio track before uploading.' },
        ]}
        relatedTools={[
          { label: 'Audio Convert', href: '/convert/audio' },
          { label: 'Video Compress', href: '/compress/video' },
          { label: 'MOV to MP4', href: '/convert/mov-to-mp4' },
          { label: 'Video to GIF', href: '/convert/video-to-gif' },
        ]}
      />
    </Box>
  );
}
