import { useState, useCallback } from 'react';
import { Box, Typography, RadioGroup, Radio, Sheet, Input, FormControl, FormLabel, Chip } from '@mui/joy';
import FileDropZone from '../components/FileDropZone';
import ConversionProgress from '../components/ConversionProgress';
import SEO, { buildToolSchema } from '../components/SEO';
import { useConversion } from '../hooks/useConversion';
import ToolDisclaimer from '../components/ToolDisclaimer';
import ToolSEOContent from '../components/ToolSEOContent';
import CompressOutlinedIcon from '@mui/icons-material/CompressOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import MovieOutlinedIcon from '@mui/icons-material/MovieOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import HighQualityOutlinedIcon from '@mui/icons-material/HighQualityOutlined';

type CompressMode = 'quality' | 'targetSize';

const QUALITY_PRESETS = [
  { label: 'High', value: 'high', desc: 'Best quality, larger file (CRF 18)' },
  { label: 'Medium', value: 'medium', desc: 'Balanced quality and size (CRF 23)' },
  { label: 'Low', value: 'low', desc: 'Smallest file, lower quality (CRF 28)' },
];

const SIZE_PRESETS = [
  { label: '5 MB', value: 5 },
  { label: '10 MB', value: 10 },
  { label: '25 MB', value: 25 },
  { label: '50 MB', value: 50 },
];

const presetBtnSx = (active: boolean, disabled: boolean) => ({
  px: 2,
  py: 0.75,
  borderRadius: 'md',
  fontSize: '0.8125rem',
  fontWeight: 600,
  cursor: disabled ? 'default' : 'pointer',
  border: '1px solid',
  borderColor: active ? 'primary.500' : 'divider',
  bgcolor: active ? 'primary.softBg' : 'transparent',
  color: active ? 'primary.plainColor' : 'text.secondary',
  transition: 'all 0.15s',
  outline: 'none',
  '&:hover': disabled ? {} : { borderColor: 'primary.400', bgcolor: 'primary.softBg' },
} as const);

export default function VideoCompressPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mode, setMode] = useState<CompressMode>('quality');
  const [quality, setQuality] = useState('medium');
  const [targetSizeMB, setTargetSizeMB] = useState(10);
  const [customSize, setCustomSize] = useState<number | ''>('');

  const conversion = useConversion('/convert/video/compress');

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    const options = mode === 'quality'
      ? { mode: 'quality' as const, quality }
      : { mode: 'targetSize' as const, targetSize: (customSize || targetSizeMB) * 1024 * 1024 };
    conversion.startConversion(file, options);
  }, [mode, quality, targetSizeMB, customSize, conversion]);

  const handleRetry = useCallback(() => {
    conversion.reset();
    setSelectedFile(null);
  }, [conversion]);

  const isProcessing = ['uploading', 'queued', 'processing'].includes(conversion.status);

  return (
    <Box sx={{ maxWidth: 520, mx: 'auto', width: '100%', py: { xs: 3, md: 4 } }}>
      <SEO title="Video Compress" description="Compress MP4, MOV, MKV and AVI videos for free. Quality or target size mode." path="/compress/video" structuredData={buildToolSchema('Video Compress', 'Compress videos with quality or target size mode.', '/compress/video')} />
      <Typography component="h1" level="h3" sx={{ mb: 1, fontWeight: 700, letterSpacing: '-0.02em' }}>
        Video Compress
      </Typography>
      <Typography level="body-sm" sx={{ color: 'text.tertiary', mb: 2 }}>
        Compress MP4, MOV, MKV and AVI videos
      </Typography>

      <ToolDisclaimer toolId="video-compress" />

      <Chip
        size="sm"
        variant="soft"
        color="warning"
        sx={{ mb: 3, fontWeight: 500, fontSize: '0.7rem' }}
      >
        Beta — works best with small files (under 50 MB)
      </Chip>

      <FormControl sx={{ mb: 3 }}>
        <FormLabel>Compression mode</FormLabel>
        <RadioGroup
          orientation="horizontal"
          value={mode}
          onChange={(e) => setMode(e.target.value as CompressMode)}
          sx={{ gap: 1.5 }}
        >
          <Sheet variant="outlined" sx={{ px: 2, py: 1, borderRadius: 'md' }}>
            <Radio value="quality" label="Quality" overlay disabled={isProcessing} />
          </Sheet>
          <Sheet variant="outlined" sx={{ px: 2, py: 1, borderRadius: 'md' }}>
            <Radio value="targetSize" label="Target Size" overlay disabled={isProcessing} />
          </Sheet>
        </RadioGroup>
      </FormControl>

      {mode === 'quality' && (() => {
        const activeIndex = QUALITY_PRESETS.findIndex(p => p.value === quality);
        const activePreset = QUALITY_PRESETS[activeIndex];
        return (
          <Box sx={{ mb: 3 }}>
            <Box
              sx={{
                position: 'relative',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                p: '3px',
                borderRadius: '10px',
                bgcolor: 'background.level1',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <Box
                sx={{
                  position: 'absolute',
                  top: '3px',
                  left: '3px',
                  width: 'calc((100% - 6px) / 3)',
                  height: 'calc(100% - 6px)',
                  borderRadius: '8px',
                  bgcolor: 'primary.softBg',
                  border: '1px solid',
                  borderColor: 'primary.400',
                  transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: `translateX(${activeIndex * 100}%)`,
                  zIndex: 0,
                }}
              />
              {QUALITY_PRESETS.map((preset) => {
                const isActive = quality === preset.value;
                return (
                  <Box
                    key={preset.value}
                    component="button"
                    onClick={() => !isProcessing && setQuality(preset.value)}
                    sx={{
                      position: 'relative',
                      zIndex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      py: 1,
                      px: 1.5,
                      border: 'none',
                      outline: 'none',
                      bgcolor: 'transparent',
                      borderRadius: '8px',
                      cursor: isProcessing ? 'default' : 'pointer',
                      transition: 'color 0.2s',
                      color: isActive ? 'primary.plainColor' : 'text.secondary',
                      fontWeight: isActive ? 700 : 500,
                      fontSize: '0.8125rem',
                      '&:hover': isProcessing ? {} : {
                        color: isActive ? 'primary.plainColor' : 'text.primary',
                      },
                    }}
                  >
                    {preset.label}
                  </Box>
                );
              })}
            </Box>
            <Typography
              level="body-xs"
              sx={{
                mt: 1,
                color: 'text.tertiary',
                textAlign: 'center',
                transition: 'opacity 0.2s',
              }}
            >
              {activePreset.desc}
            </Typography>
          </Box>
        );
      })()}

      {mode === 'targetSize' && (
        <>
          <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
            {SIZE_PRESETS.map((preset) => (
              <Box
                key={preset.value}
                component="button"
                onClick={() => { setTargetSizeMB(preset.value); setCustomSize(''); }}
                sx={presetBtnSx(targetSizeMB === preset.value && customSize === '', isProcessing)}
              >
                {preset.label}
              </Box>
            ))}
          </Box>
          <FormControl sx={{ mb: 3 }}>
            <FormLabel>Custom target size (MB)</FormLabel>
            <Input
              type="number"
              placeholder="e.g. 15"
              value={customSize}
              onChange={(e) => setCustomSize(e.target.value ? Number(e.target.value) : '')}
              slotProps={{ input: { min: 1, max: 200 } }}
              disabled={isProcessing}
            />
          </FormControl>
        </>
      )}

      {conversion.status === 'idle' ? (
        <FileDropZone
          onFileSelect={handleFileSelect}
          accept=".mp4,.mkv,.avi,.mov,.webm,video/*"
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
          />
        </Box>
      )}
      <ToolSEOContent
        howTo={{
          title: 'How to compress a video online',
          steps: [
            'Choose a compression mode — quality preset or target file size.',
            'For quality mode, select High, Medium, or Low. For target size, pick a preset or enter a custom size in MB.',
            'Upload your video file (up to 200 MB).',
            'Download the compressed video instantly.',
          ],
        }}
        features={[
          { icon: <CompressOutlinedIcon />, title: 'Dual Compression Modes', description: 'Choose between quality presets (CRF-based) or a specific target file size.' },
          { icon: <TuneOutlinedIcon />, title: 'Quality Control', description: 'Fine-tune output with High, Medium, or Low quality presets for different use cases.' },
          { icon: <MovieOutlinedIcon />, title: 'Multiple Formats', description: 'Supports MP4, MOV, MKV, AVI, and WebM video files.' },
          { icon: <HighQualityOutlinedIcon />, title: 'Smart Encoding', description: 'Uses H.264 encoding with optimized settings to maximize quality at the target size.' },
          { icon: <BoltOutlinedIcon />, title: 'Fast Processing', description: 'Videos are compressed quickly, even for files up to 200 MB.' },
          { icon: <LockOutlinedIcon />, title: 'Privacy First', description: 'Files are processed in isolated memory and deleted immediately after download.' },
        ]}
        faq={[
          { question: 'How much smaller will my video be?', answer: 'It depends on the source. Videos with high bitrates can often be reduced 50-80% with medium quality. Low-bitrate videos may see smaller reductions.' },
          { question: 'What is the difference between quality mode and target size mode?', answer: 'Quality mode uses CRF (Constant Rate Factor) to maintain consistent visual quality throughout the video. Target size mode adjusts the bitrate to fit the video into your specified file size.' },
          { question: 'Will compression affect video quality?', answer: 'Yes, some quality loss is expected. High quality mode preserves most detail. Medium is a good balance. Low prioritizes small file size over visual quality.' },
          { question: 'Is there a file size limit?', answer: 'The maximum upload size is 200 MB. This tool is currently in beta and works best with files under 50 MB.' },
          { question: 'What output format will I get?', answer: 'The output is always MP4 with H.264 video and AAC audio for maximum compatibility across devices and platforms.' },
        ]}
        relatedTools={[
          { label: 'MOV to MP4', href: '/convert/mov-to-mp4' },
          { label: 'Video to GIF', href: '/convert/video-to-gif' },
          { label: 'Extract Audio', href: '/convert/audio-extract' },
          { label: 'Audio Convert', href: '/convert/audio' },
        ]}
      />
    </Box>
  );
}
