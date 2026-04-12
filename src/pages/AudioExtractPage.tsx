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
import { Trans, useLingui } from '@lingui/react/macro';

export default function AudioExtractPage() {
  const { t } = useLingui();
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
      <SEO title={t`Extract Audio`} description={t`Extract audio track from video files for free. No signup, files processed in memory only.`} path="/convert/audio/extract" structuredData={buildToolSchema(t`Extract Audio`, t`Extract audio track from video files for free. No signup, files processed in memory only.`, '/convert/audio/extract')} />
      <Typography component="h1" level="h3" sx={{ mb: 1, fontWeight: 700, letterSpacing: '-0.02em' }}><Trans>Extract Audio</Trans></Typography>
      <Typography level="body-sm" sx={{ color: 'text.tertiary', mb: 4 }}><Trans>Extract audio track from video files</Trans></Typography>

      <ToolDisclaimer toolId="audio-extract" />

      <FormControl sx={{ mb: 3 }}>
        <FormLabel><Trans>Output format</Trans></FormLabel>
        <Select
          value={outputFormat}
          onChange={(_, value) => value && setOutputFormat(value)}
          disabled={isProcessing}
        >
          <Option value="mp3">{t`MP3`}</Option>
          <Option value="wav">{t`WAV`}</Option>
          <Option value="flac">{t`FLAC`}</Option>
          <Option value="aac">{t`AAC`}</Option>
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
          title: t`How to extract audio from video online`,
          steps: [
            t`Choose the output audio format — MP3, WAV, FLAC, or AAC.`,
            t`Upload your video file (up to 100 MB).`,
            t`The audio track is extracted automatically.`,
            t`Download the extracted audio file instantly.`,
          ],
        }}
        features={[
          { icon: <MovieOutlinedIcon />, title: t`Any Video Input`, description: t`Supports MP4, MKV, AVI, MOV, WebM, and other common video formats.` },
          { icon: <AudiotrackOutlinedIcon />, title: t`Flexible Output`, description: t`Extract audio as MP3, WAV, FLAC, or AAC depending on your needs.` },
          { icon: <MusicNoteOutlinedIcon />, title: t`Full Audio Track`, description: t`The entire audio stream is extracted — no clipping or trimming applied.` },
          { icon: <TuneOutlinedIcon />, title: t`Optimal Quality`, description: t`Audio is extracted at the best available quality from the source video.` },
          { icon: <BoltOutlinedIcon />, title: t`Fast Extraction`, description: t`Most videos are processed in seconds, even files up to 100 MB.` },
          { icon: <LockOutlinedIcon />, title: t`Privacy First`, description: t`Files are processed in isolated memory and deleted immediately after download.` },
        ]}
        faq={[
          { question: t`Which format should I extract audio to?`, answer: t`MP3 is the most compatible and works everywhere. WAV is best for editing in audio software. FLAC preserves full quality without compression. AAC is ideal for Apple devices and smaller file sizes.` },
          { question: t`Does extracting audio reduce quality?`, answer: t`When extracting to a lossy format like MP3 or AAC, the audio is re-encoded which may cause slight quality loss. For the best quality, extract to WAV or FLAC.` },
          { question: t`What is the maximum file size?`, answer: t`The maximum upload size is 100 MB. For larger video files, consider compressing the video first using the Video Compress tool.` },
          { question: t`Can I extract audio from a specific part of the video?`, answer: t`This tool extracts the full audio track. If you need a specific segment, extract the full track first and then trim it using an audio editor.` },
          { question: t`What if my video has no audio track?`, answer: t`If the video file contains no audio stream, the extraction will fail with an error. Make sure your video includes an audio track before uploading.` },
        ]}
        relatedTools={[
          { label: t`Audio Convert`, href: '/convert/audio' },
          { label: t`Video Compress`, href: '/compress/video' },
          { label: t`MOV to MP4`, href: '/convert/mov-to-mp4' },
          { label: t`Video to GIF`, href: '/convert/video-to-gif' },
        ]}
      />
    </Box>
  );
}
