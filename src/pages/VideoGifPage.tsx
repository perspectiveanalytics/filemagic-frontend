import { useState, useCallback, useRef, useEffect } from 'react';
import { Box, Typography, Slider, Select, Option, FormControl, FormLabel, IconButton } from '@mui/joy';
import FileDropZone from '../components/FileDropZone';
import ConversionProgress from '../components/ConversionProgress';
import SEO, { buildToolSchema } from '../components/SEO';
import { useConversion } from '../hooks/useConversion';
import ToolDisclaimer from '../components/ToolDisclaimer';
import ToolSEOContent from '../components/ToolSEOContent';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import GifOutlinedIcon from '@mui/icons-material/GifOutlined';
import ContentCutOutlinedIcon from '@mui/icons-material/ContentCutOutlined';
import SpeedOutlinedIcon from '@mui/icons-material/SpeedOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { actionBtnBase } from '../styles/buttons';

const FPS_OPTIONS = [5, 8, 10, 12, 15];
const WIDTH_OPTIONS = [160, 240, 320, 480, 640];

const SPEED_PRESETS = [
  { label: '0.5x', value: 0.5 },
  { label: '0.75x', value: 0.75 },
  { label: '1x', value: 1 },
  { label: '1.5x', value: 1.5 },
  { label: '2x', value: 2 },
];

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  if (m > 0) return `${m}:${sec.toFixed(1).padStart(4, '0')}`;
  return `${sec.toFixed(1)}s`;
}

export default function VideoGifPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoDuration, setVideoDuration] = useState(0);
  const [clipRange, setClipRange] = useState<[number, number]>([0, 5]);
  const [speed, setSpeed] = useState(1);
  const [fps, setFps] = useState(10);
  const [maxWidth, setMaxWidth] = useState(320);

  const videoRef = useRef<HTMLVideoElement>(null);
  const conversion = useConversion('/convert/video/gif');

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setVideoUrl(url);
    setClipRange([0, 5]);
  }, []);

  const clipDuration = clipRange[1] - clipRange[0];

  const handleConvert = useCallback(() => {
    if (!selectedFile) return;
    conversion.startConversion(selectedFile, {
      startTime: clipRange[0],
      duration: clipDuration,
      fps,
      maxWidth,
      speed,
    });
  }, [selectedFile, clipRange, clipDuration, fps, maxWidth, speed, conversion]);

  const handleDownload = useCallback(() => {
    conversion.download();
    setSelectedFile(null);
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setVideoUrl(null);
    setVideoDuration(0);
    setClipRange([0, 5]);
    setSpeed(1);
  }, [conversion, videoUrl]);

  const handleRetry = useCallback(() => {
    conversion.reset();
    setSelectedFile(null);
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setVideoUrl(null);
    setVideoDuration(0);
    setClipRange([0, 5]);
    setSpeed(1);
  }, [conversion, videoUrl]);

  const handleClose = useCallback(() => {
    setSelectedFile(null);
    if (videoUrl) URL.revokeObjectURL(videoUrl);
    setVideoUrl(null);
    setVideoDuration(0);
    setClipRange([0, 5]);
    setSpeed(1);
    setFps(10);
    setMaxWidth(320);
  }, [videoUrl]);

  const handleLoadedMetadata = useCallback(() => {
    if (videoRef.current) {
      const dur = videoRef.current.duration;
      setVideoDuration(dur);
      setClipRange([0, Math.min(5, dur)]);
    }
  }, []);

  const handleRangeChange = useCallback((_: Event, value: number | number[]) => {
    if (!Array.isArray(value)) return;
    let [start, end] = value;
    // Enforce max 15s clip
    if (end - start > 15) {
      end = start + 15;
    }
    // Enforce min 1s clip
    if (end - start < 1) {
      end = start + 1;
    }
    setClipRange([start, Math.min(end, videoDuration)]);
  }, [videoDuration]);

  useEffect(() => {
    if (videoRef.current && conversion.status === 'idle') {
      videoRef.current.currentTime = clipRange[0];
    }
  }, [clipRange, conversion.status]);

  useEffect(() => {
    return () => {
      if (videoUrl) URL.revokeObjectURL(videoUrl);
    };
  }, [videoUrl]);

  const isConverting = ['uploading', 'queued', 'processing', 'done', 'error'].includes(conversion.status);
  const activeSpeedIndex = SPEED_PRESETS.findIndex(p => p.value === speed);
  const gifDuration = clipDuration / speed;

  return (
    <Box sx={{ maxWidth: 520, mx: 'auto', width: '100%', py: { xs: 3, md: 4 } }}>
      <SEO title="Video to GIF" description="Convert video clips to animated GIFs for free. Preview and trim before converting." path="/convert/video-to-gif" structuredData={buildToolSchema('Video to GIF', 'Convert videos to GIF with preview.', '/convert/video-to-gif')} />
      <Typography component="h1" level="h3" sx={{ mb: 1, fontWeight: 700, letterSpacing: '-0.02em' }}>
        Video to GIF
      </Typography>
      <Typography level="body-sm" sx={{ color: 'text.tertiary', mb: 4 }}>
        Convert a video clip to an animated GIF
      </Typography>

      <ToolDisclaimer toolId="video-to-gif" />

      {!selectedFile && conversion.status === 'idle' && (
        <FileDropZone
          onFileSelect={handleFileSelect}
          accept=".mp4,.mkv,.avi,.mov,.webm,video/*"
          maxSize={30 * 1024 * 1024}
        />
      )}

      {selectedFile && videoUrl && !isConverting && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography level="body-sm" sx={{ color: 'text.tertiary', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {selectedFile.name}
            </Typography>
            <IconButton
              size="sm"
              variant="plain"
              color="neutral"
              onClick={handleClose}
              aria-label="Close"
              sx={{ flexShrink: 0, ml: 1 }}
            >
              <CloseOutlinedIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
          <Box
            component="video"
            ref={videoRef}
            src={videoUrl}
            controls
            onLoadedMetadata={handleLoadedMetadata}
            sx={{
              width: '100%',
              maxHeight: 300,
              borderRadius: 'md',
              bgcolor: 'black',
            }}
          />

          {videoDuration > 0 && (
            <>
              <FormControl>
                <FormLabel>
                  Clip: {formatTime(clipRange[0])} — {formatTime(clipRange[1])}
                  <Typography component="span" level="body-xs" sx={{ color: 'text.tertiary', ml: 1 }}>
                    ({clipDuration.toFixed(1)}s)
                  </Typography>
                </FormLabel>
                <Slider
                  value={clipRange}
                  onChange={handleRangeChange}
                  min={0}
                  max={videoDuration}
                  step={0.1}
                  disableSwap
                  sx={{
                    '& .MuiSlider-track': {
                      bgcolor: 'primary.400',
                    },
                  }}
                />
              </FormControl>

              <FormControl>
                <FormLabel>
                  Speed
                  <Typography component="span" level="body-xs" sx={{ color: 'text.tertiary', ml: 1 }}>
                    (GIF duration: ~{gifDuration.toFixed(1)}s)
                  </Typography>
                </FormLabel>
                <Box
                  sx={{
                    position: 'relative',
                    display: 'grid',
                    gridTemplateColumns: `repeat(${SPEED_PRESETS.length}, 1fr)`,
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
                      width: `calc((100% - 6px) / ${SPEED_PRESETS.length})`,
                      height: 'calc(100% - 6px)',
                      borderRadius: '8px',
                      bgcolor: 'primary.softBg',
                      border: '1px solid',
                      borderColor: 'primary.400',
                      transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                      transform: `translateX(${activeSpeedIndex * 100}%)`,
                      zIndex: 0,
                    }}
                  />
                  {SPEED_PRESETS.map((preset) => {
                    const isActive = speed === preset.value;
                    return (
                      <Box
                        key={preset.value}
                        component="button"
                        onClick={() => setSpeed(preset.value)}
                        sx={{
                          position: 'relative',
                          zIndex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          py: 0.75,
                          px: 1,
                          border: 'none',
                          outline: 'none',
                          bgcolor: 'transparent',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          transition: 'color 0.2s',
                          color: isActive ? 'primary.plainColor' : 'text.secondary',
                          fontWeight: isActive ? 700 : 500,
                          fontSize: '0.8125rem',
                          '&:hover': {
                            color: isActive ? 'primary.plainColor' : 'text.primary',
                          },
                        }}
                      >
                        {preset.label}
                      </Box>
                    );
                  })}
                </Box>
              </FormControl>

              <Box sx={{ display: 'flex', gap: 2 }}>
                <FormControl sx={{ flex: 1 }}>
                  <FormLabel>FPS</FormLabel>
                  <Select value={fps} onChange={(_, v) => v && setFps(v)}>
                    {FPS_OPTIONS.map((f) => (
                      <Option key={f} value={f}>{f} fps</Option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl sx={{ flex: 1 }}>
                  <FormLabel>Width</FormLabel>
                  <Select value={maxWidth} onChange={(_, v) => v && setMaxWidth(v)}>
                    {WIDTH_OPTIONS.map((w) => (
                      <Option key={w} value={w}>{w}px</Option>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <Box
                component="button"
                onClick={handleConvert}
                sx={{
                  ...actionBtnBase,
                  bgcolor: 'primary.500',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'primary.600',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 16px rgba(37, 99, 235, 0.25)',
                  },
                  '&:active': {
                    transform: 'translateY(0)',
                    boxShadow: 'none',
                  },
                }}
              >
                Convert to GIF
              </Box>
            </>
          )}
        </Box>
      )}

      {isConverting && (
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
            onDownload={handleDownload}
            onRetry={handleRetry}
            showSizeComparison={false}
          />
        </Box>
      )}
      <ToolSEOContent
        howTo={{
          title: 'How to convert a video to GIF online',
          steps: [
            'Upload your video file (up to 30 MB).',
            'Use the clip slider to select the segment you want (up to 15 seconds).',
            'Adjust speed, FPS, and width to fine-tune your GIF.',
            'Click "Convert to GIF" and download the result.',
          ],
        }}
        features={[
          { icon: <GifOutlinedIcon />, title: 'Animated GIF Output', description: 'Convert any video clip into a looping animated GIF ready to share.' },
          { icon: <ContentCutOutlinedIcon />, title: 'Trim & Clip', description: 'Select exactly which part of the video to convert with a visual range slider.' },
          { icon: <SpeedOutlinedIcon />, title: 'Speed Control', description: 'Speed up or slow down from 0.5x to 2x for the perfect effect.' },
          { icon: <TuneOutlinedIcon />, title: 'FPS & Width Settings', description: 'Control frame rate (5-15 fps) and output width (160-640px) to balance quality and file size.' },
          { icon: <BoltOutlinedIcon />, title: 'Fast Conversion', description: 'GIFs are generated quickly, even from large video files up to 30 MB.' },
          { icon: <LockOutlinedIcon />, title: 'Privacy First', description: 'Files are processed in isolated memory and deleted immediately after download.' },
        ]}
        faq={[
          { question: 'What is the maximum clip length?', answer: 'You can select a clip up to 15 seconds long. Shorter clips produce smaller, more shareable GIFs.' },
          { question: 'How can I reduce the GIF file size?', answer: 'Lower the width (e.g., 240px instead of 480px), reduce the FPS (e.g., 8 instead of 15), or shorten the clip duration. All three factors directly impact file size.' },
          { question: 'Which video formats are supported?', answer: 'MP4, MKV, AVI, MOV, and WebM are all supported. Most common video formats will work.' },
          { question: 'Can I preview the clip before converting?', answer: 'Yes. After uploading, a video player lets you preview your file. The clip range slider shows exactly which segment will be converted.' },
          { question: 'Is there a file size limit?', answer: 'The maximum upload size is 30 MB. The output GIF size depends on your clip length, FPS, and width settings.' },
        ]}
        relatedTools={[
          { label: 'Video Compress', href: '/compress/video' },
          { label: 'MOV to MP4', href: '/convert/mov-to-mp4' },
          { label: 'Extract Audio', href: '/convert/audio-extract' },
          { label: 'Audio Convert', href: '/convert/audio' },
          { label: 'Image Convert', href: '/convert/image' },
        ]}
      />
    </Box>
  );
}
