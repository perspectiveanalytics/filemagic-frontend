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
import { Trans, useLingui } from '@lingui/react/macro';

export default function AudioConvertPage() {
  const { t } = useLingui();
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
      <SEO title={t`Audio Convert`} description={t`Convert between MP3, WAV, FLAC and AAC for free. No signup, files processed in memory only.`} path="/convert/audio" structuredData={buildToolSchema(t`Audio Convert`, t`Convert between MP3, WAV, FLAC and AAC for free. No signup, files processed in memory only.`, '/convert/audio')} />
      <Typography component="h1" level="h3" sx={{ mb: 1, fontWeight: 700, letterSpacing: '-0.02em' }}><Trans>Audio Convert</Trans></Typography>
      <Typography level="body-sm" sx={{ color: 'text.tertiary', mb: 4 }}><Trans>Convert between MP3, WAV, FLAC and AAC</Trans></Typography>

      <ToolDisclaimer toolId="audio-convert" />

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
          title: t`How to convert audio files online`,
          steps: [
            t`Select the output format you want — MP3, WAV, FLAC, or AAC.`,
            t`Upload your audio file (up to 50 MB).`,
            t`Wait a few seconds while the file is converted.`,
            t`Download the converted audio file instantly.`,
          ],
        }}
        features={[
          { icon: <MusicNoteOutlinedIcon />, title: t`Multiple Formats`, description: t`Convert between MP3, WAV, FLAC, and AAC with a single tool.` },
          { icon: <HighQualityOutlinedIcon />, title: t`High-Quality Output`, description: t`Audio is transcoded at optimal bitrate and sample rate for the chosen format.` },
          { icon: <AudiotrackOutlinedIcon />, title: t`Any Audio Input`, description: t`Accepts all common audio formats including M4A, OGG, WMA, and more.` },
          { icon: <TuneOutlinedIcon />, title: t`Simple Controls`, description: t`Just pick your format and upload — no complicated settings to configure.` },
          { icon: <BoltOutlinedIcon />, title: t`Fast Processing`, description: t`Most files convert in seconds, even large audio files up to 50 MB.` },
          { icon: <LockOutlinedIcon />, title: t`Privacy First`, description: t`Files are processed in isolated memory and deleted immediately after download.` },
        ]}
        faq={[
          { question: t`Which audio format should I choose?`, answer: t`MP3 is the most widely compatible format. WAV is uncompressed and best for editing. FLAC is lossless and great for archiving. AAC offers better quality than MP3 at the same file size.` },
          { question: t`Will converting audio reduce quality?`, answer: t`Converting between lossy formats (MP3, AAC) may cause some quality loss. Converting to lossless (WAV, FLAC) preserves the current quality. For best results, start from the highest-quality source available.` },
          { question: t`What is the maximum file size?`, answer: t`The maximum upload size is 50 MB. This is enough for most audio files — a typical MP3 song is 3-10 MB.` },
          { question: t`Can I convert video files to audio?`, answer: t`This tool is for audio-to-audio conversion. To extract audio from a video file, use the Extract Audio tool instead.` },
        ]}
        relatedTools={[
          { label: t`Extract Audio`, href: '/convert/audio-extract' },
          { label: t`Video Compress`, href: '/compress/video' },
          { label: t`Video to GIF`, href: '/convert/video-to-gif' },
          { label: t`Image Convert`, href: '/convert/image' },
        ]}
      />
    </Box>
  );
}
