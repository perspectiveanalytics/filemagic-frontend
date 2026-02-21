import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import {
  Box, Typography, Slider, FormControl, FormLabel, IconButton, Tooltip, Chip,
} from '@mui/joy';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import InvertColorsOutlinedIcon from '@mui/icons-material/InvertColorsOutlined';
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';
import FileDropZone from '../components/FileDropZone';
import SEO, { buildToolSchema } from '../components/SEO';
import ToolDisclaimer from '../components/ToolDisclaimer';
import ToolSEOContent from '../components/ToolSEOContent';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import TextFieldsOutlinedIcon from '@mui/icons-material/TextFieldsOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import ColorLensOutlinedIcon from '@mui/icons-material/ColorLensOutlined';
import { actionBtnBase } from '../styles/buttons';
import {
  imageToAscii, loadImage,
  DEFAULT_OPTIONS,
  CHARSET_LABELS,
  type AsciiOptions, type CharsetKey,
} from '../utils/asciiConverter';

export default function AsciiPage() {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [fileName, setFileName] = useState('');
  const [copied, setCopied] = useState(false);

  const [width, setWidth] = useState(DEFAULT_OPTIONS.width);
  const [charset, setCharset] = useState<CharsetKey>(DEFAULT_OPTIONS.charset);
  const [invert, setInvert] = useState(DEFAULT_OPTIONS.invert);
  const [brightness, setBrightness] = useState(DEFAULT_OPTIONS.brightness);
  const [contrast, setContrast] = useState(DEFAULT_OPTIONS.contrast);
  const [color, setColor] = useState(DEFAULT_OPTIONS.color);

  const preRef = useRef<HTMLPreElement>(null);

  const options: AsciiOptions = useMemo(() => ({
    width, charset, invert, brightness, contrast, color,
  }), [width, charset, invert, brightness, contrast, color]);

  // Convert whenever image or options change
  const result = useMemo(() => {
    if (!image) return null;
    return imageToAscii(image, options);
  }, [image, options]);

  // Auto-scale font size so output fits container
  const [fontSize, setFontSize] = useState(6);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!result || !containerRef.current) return;
    const containerWidth = containerRef.current.clientWidth - 24; // account for padding
    // Each character is ~0.6em wide in monospace
    const charWidth = 0.6;
    const idealSize = containerWidth / (result.cols * charWidth);
    setFontSize(Math.max(2, Math.min(14, idealSize)));
  }, [result]);

  const handleFileSelect = useCallback(async (file: File) => {
    try {
      const img = await loadImage(file);
      setImage(img);
      setFileName(file.name);
    } catch {
      // loadImage failure — silently ignore
    }
  }, []);

  const handleReset = useCallback(() => {
    setImage(null);
    setFileName('');
    setCopied(false);
  }, []);

  const handleCopy = useCallback(async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = result.text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [result]);

  const handleDownload = useCallback(() => {
    if (!result) return;
    const blob = new Blob([result.text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const base = fileName.replace(/\.[^.]+$/, '') || 'ascii';
    a.download = `${base}-ascii.txt`;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 500);
  }, [result, fileName]);

  const charsetKeys = Object.keys(CHARSET_LABELS) as CharsetKey[];

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', width: '100%', py: { xs: 3, md: 4 } }}>
      <SEO
        title="ASCII Art"
        description="Convert images to ASCII art. Free, client-side, no upload needed."
        path="/convert/ascii"
        structuredData={buildToolSchema('ASCII Art Converter', 'Convert any image to ASCII art with adjustable width, character sets, colors and more.', '/convert/ascii')}
      />

      <Box sx={{ maxWidth: 520, mx: 'auto', width: '100%' }}>
        <Typography component="h1" level="h3" sx={{ mb: 1, fontWeight: 700, letterSpacing: '-0.02em' }}>
          ASCII Art
        </Typography>
        <Typography level="body-sm" sx={{ color: 'text.tertiary', mb: 2 }}>
          Convert images to ASCII text art
        </Typography>

        <ToolDisclaimer toolId="ascii" />

        <Chip
          size="sm"
          variant="soft"
          color="success"
          sx={{ mb: 3, fontWeight: 500, fontSize: '0.7rem' }}
        >
          100% client-side — your image never leaves your browser
        </Chip>
      </Box>

      {!image ? (
        <Box sx={{ maxWidth: 520, mx: 'auto', width: '100%' }}>
          <FileDropZone
            onFileSelect={handleFileSelect}
            accept=".jpg,.jpeg,.png,.webp,.bmp,.gif,.svg,image/*"
            maxSize={20 * 1024 * 1024}
            allowPaste
          />
        </Box>
      ) : (
        <>
          <Box sx={{
            maxWidth: 520, mx: 'auto', width: '100%',
            display: 'flex', flexDirection: 'column', gap: 2, mb: 3,
          }}>
            {fileName && (
              <Typography level="body-sm" sx={{ color: 'text.tertiary' }}>
                {fileName}
              </Typography>
            )}

            <FormControl>
              <FormLabel sx={{ fontSize: '0.8rem' }}>Width: {width} chars</FormLabel>
              <Slider
                value={width}
                onChange={(_, v) => setWidth(v as number)}
                min={20}
                max={200}
                step={1}
                valueLabelDisplay="auto"
                sx={{ py: 1 }}
              />
            </FormControl>

            <FormControl>
              <FormLabel sx={{ fontSize: '0.8rem' }}>Character set</FormLabel>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {charsetKeys.map((key) => (
                  <Chip
                    key={key}
                    variant={charset === key ? 'solid' : 'outlined'}
                    color={charset === key ? 'primary' : 'neutral'}
                    size="sm"
                    onClick={() => setCharset(key)}
                    sx={{ cursor: 'pointer', fontWeight: charset === key ? 600 : 400 }}
                  >
                    {CHARSET_LABELS[key]}
                  </Chip>
                ))}
              </Box>
            </FormControl>

            <Box sx={{ display: 'flex', gap: 1 }}>
              <Chip
                variant={invert ? 'solid' : 'outlined'}
                color={invert ? 'primary' : 'neutral'}
                size="sm"
                startDecorator={<InvertColorsOutlinedIcon sx={{ fontSize: 16 }} />}
                onClick={() => setInvert(!invert)}
                sx={{ cursor: 'pointer', fontWeight: invert ? 600 : 400 }}
              >
                Invert
              </Chip>
              <Chip
                variant={color ? 'solid' : 'outlined'}
                color={color ? 'primary' : 'neutral'}
                size="sm"
                startDecorator={<PaletteOutlinedIcon sx={{ fontSize: 16 }} />}
                onClick={() => setColor(!color)}
                sx={{ cursor: 'pointer', fontWeight: color ? 600 : 400 }}
              >
                Color
              </Chip>
            </Box>

            <Box sx={{ display: 'flex', gap: 2 }}>
              <FormControl sx={{ flex: 1 }}>
                <FormLabel sx={{ fontSize: '0.8rem' }}>Brightness: {brightness}</FormLabel>
                <Slider
                  value={brightness}
                  onChange={(_, v) => setBrightness(v as number)}
                  min={-100}
                  max={100}
                  step={1}
                  sx={{ py: 1 }}
                />
              </FormControl>
              <FormControl sx={{ flex: 1 }}>
                <FormLabel sx={{ fontSize: '0.8rem' }}>Contrast: {contrast}</FormLabel>
                <Slider
                  value={contrast}
                  onChange={(_, v) => setContrast(v as number)}
                  min={-100}
                  max={100}
                  step={1}
                  sx={{ py: 1 }}
                />
              </FormControl>
            </Box>
          </Box>

          {result && (
            <Box>
              <Box
                ref={containerRef}
                sx={{
                  position: 'relative',
                  borderRadius: 'lg',
                  bgcolor: color ? (invert ? 'neutral.900' : '#fff') : 'background.surface',
                  border: '1px solid',
                  borderColor: 'primary.800',
                  overflow: 'hidden',
                }}
              >
                <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}>
                  <Tooltip title={copied ? 'Copied!' : 'Copy text'} placement="left">
                    <IconButton
                      size="sm"
                      variant="soft"
                      color={copied ? 'success' : 'neutral'}
                      onClick={handleCopy}
                      sx={{
                        bgcolor: copied ? 'success.softBg' : 'background.level2',
                        '&:hover': { bgcolor: copied ? 'success.softBg' : 'background.level3' },
                      }}
                    >
                      {copied ? (
                        <CheckRoundedIcon sx={{ fontSize: 16 }} />
                      ) : (
                        <ContentCopyRoundedIcon sx={{ fontSize: 16 }} />
                      )}
                    </IconButton>
                  </Tooltip>
                </Box>

                <Box
                  sx={{
                    p: 1.5,
                    pr: 5,
                    maxHeight: 500,
                    overflow: 'auto',
                    '&::-webkit-scrollbar': { width: 6, height: 6 },
                    '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
                    '&::-webkit-scrollbar-thumb': {
                      bgcolor: 'neutral.600',
                      borderRadius: 3,
                    },
                  }}
                >
                  <pre
                    ref={preRef}
                    style={{
                      margin: 0,
                      fontFamily: '"Courier New", Courier, monospace',
                      fontSize: `${fontSize}px`,
                      lineHeight: 1.1,
                      whiteSpace: 'pre',
                      letterSpacing: '0.05em',
                    }}
                    {...(color
                      ? { dangerouslySetInnerHTML: { __html: result.html } }
                      : { children: result.text }
                    )}
                  />
                </Box>

                <Box sx={{
                  position: 'absolute', bottom: 8, right: 8,
                  px: 1, py: 0.25, borderRadius: 'sm',
                  bgcolor: 'rgba(0,0,0,0.5)',
                  color: '#fff',
                  fontSize: '0.65rem',
                  fontFamily: 'monospace',
                }}>
                  {result.cols}×{result.rows}
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 1.5, mt: 2.5, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Box
                  component="button"
                  onClick={handleCopy}
                  sx={{
                    ...actionBtnBase,
                    bgcolor: 'primary.500',
                    color: 'white',
                    '&:hover': {
                      bgcolor: 'primary.600',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 16px rgba(37, 99, 235, 0.25)',
                    },
                    '&:active': { transform: 'translateY(0)', boxShadow: 'none' },
                  }}
                >
                  {copied ? (
                    <CheckRoundedIcon sx={{ fontSize: 18 }} />
                  ) : (
                    <ContentCopyRoundedIcon sx={{ fontSize: 18 }} />
                  )}
                  {copied ? 'Copied!' : 'Copy'}
                </Box>
                <Box
                  component="button"
                  onClick={handleDownload}
                  sx={{
                    ...actionBtnBase,
                    bgcolor: 'transparent',
                    color: 'text.secondary',
                    border: '1px solid',
                    borderColor: 'divider',
                    '&:hover': {
                      borderColor: 'neutral.500',
                      color: 'text.primary',
                      bgcolor: 'background.level1',
                      transform: 'translateY(-1px)',
                    },
                    '&:active': { transform: 'translateY(0)' },
                  }}
                >
                  <DownloadRoundedIcon sx={{ fontSize: 18 }} />
                  Download .txt
                </Box>
                <Box
                  component="button"
                  onClick={handleReset}
                  sx={{
                    ...actionBtnBase,
                    bgcolor: 'transparent',
                    color: 'text.secondary',
                    border: '1px solid',
                    borderColor: 'divider',
                    '&:hover': {
                      borderColor: 'neutral.500',
                      color: 'text.primary',
                      bgcolor: 'background.level1',
                      transform: 'translateY(-1px)',
                    },
                    '&:active': { transform: 'translateY(0)' },
                  }}
                >
                  <AddRoundedIcon sx={{ fontSize: 18 }} />
                  New
                </Box>
              </Box>
            </Box>
          )}
        </>
      )}

      <Box sx={{ maxWidth: 520, mx: 'auto', width: '100%' }}>
        <ToolSEOContent
          howTo={{
            title: 'How to convert an image to ASCII art',
            steps: [
              'Upload an image by dragging it onto the drop zone, clicking to browse, or pasting from your clipboard.',
              'Adjust the output width, character set, brightness, and contrast to fine-tune the result.',
              'Toggle color mode to preserve the original image colors in the ASCII output.',
              'Copy the ASCII art to your clipboard or download it as a .txt file.',
            ],
          }}
          features={[
            { icon: <ImageOutlinedIcon />, title: 'Multiple Image Formats', description: 'Supports JPEG, PNG, WebP, BMP, GIF, and SVG. Upload files up to 20 MB or paste from clipboard.' },
            { icon: <TuneOutlinedIcon />, title: 'Fine-grained Controls', description: 'Adjust width, brightness, contrast, and choose from multiple character sets for the perfect output.' },
            { icon: <ColorLensOutlinedIcon />, title: 'Color Mode', description: 'Preserve original image colors in the ASCII output with HTML color spans for rich terminal or web display.' },
            { icon: <TextFieldsOutlinedIcon />, title: 'Multiple Character Sets', description: 'Choose between standard, detailed, block, and minimal character sets to match your preferred style.' },
            { icon: <BoltOutlinedIcon />, title: 'Real-time Preview', description: 'See the ASCII art update instantly as you adjust settings. No waiting, no re-uploading.' },
            { icon: <LockOutlinedIcon />, title: '100% Client-side', description: 'Your image never leaves your browser. All conversion happens locally using the Canvas API.' },
          ]}
          faq={[
            { question: 'What image formats are supported?', answer: 'JPEG, PNG, WebP, BMP, GIF, and SVG are all supported. You can also paste images directly from your clipboard.' },
            { question: 'How does the width setting work?', answer: 'The width controls how many characters wide the output will be (20 to 200). The height is calculated automatically to preserve the aspect ratio of your image.' },
            { question: 'What is the difference between the character sets?', answer: 'Standard uses common ASCII characters for good all-around results. Detailed uses more characters for finer gradation. Block uses Unicode block elements for denser output. Minimal uses only a few characters for a cleaner look.' },
            { question: 'Can I use the colored output in a terminal?', answer: 'The color mode generates HTML spans with inline colors, which works in web pages. For terminal use, copy the plain text version (with color mode off) instead.' },
            { question: 'Is there a file size limit?', answer: 'The maximum upload size is 20 MB. Very high-resolution images are scaled down internally for performance.' },
          ]}
          relatedTools={[
            { label: 'Image Compress', href: '/compress/image' },
            { label: 'Image Converter', href: '/convert/image' },
            { label: 'PDF Compress', href: '/compress/pdf' },
            { label: 'Base64 Encode / Decode', href: '/tools/base64' },
          ]}
        />
      </Box>
    </Box>
  );
}
