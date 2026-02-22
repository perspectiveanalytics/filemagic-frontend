import { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Select,
  Option,
  FormControl,
  FormLabel,
  CircularProgress,
  IconButton,
  Tooltip,
  Chip,
} from '@mui/joy';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import FileDropZone from '../components/FileDropZone';
import SEO, { buildToolSchema } from '../components/SEO';
import { useConversion } from '../hooks/useConversion';
import type { OCROptions } from '../types/api';
import ToolDisclaimer from '../components/ToolDisclaimer';
import ToolSEOContent from '../components/ToolSEOContent';
import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import { actionBtnBase } from '../styles/buttons';

const AVAILABLE_LANGUAGES = [
  { value: 'eng', label: 'English' },
  { value: 'fra', label: 'French' },
  { value: 'deu', label: 'German' },
  { value: 'spa', label: 'Spanish' },
  { value: 'ita', label: 'Italian' },
  { value: 'por', label: 'Portuguese' },
  { value: 'nld', label: 'Dutch' },
  { value: 'rus', label: 'Russian' },
  { value: 'ara', label: 'Arabic' },
  { value: 'chi_sim', label: 'Chinese (Simplified)' },
  { value: 'chi_tra', label: 'Chinese (Traditional)' },
  { value: 'jpn', label: 'Japanese' },
  { value: 'kor', label: 'Korean' },
];

export default function OcrPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [language, setLanguage] = useState('eng');
  const [copied, setCopied] = useState(false);

  const conversion = useConversion('/convert/ocr');

  const handleFileSelect = useCallback(
    (file: File) => {
      setSelectedFile(file);
      const options: OCROptions = { languages: [language] };
      conversion.startConversion(file, options);
    },
    [language, conversion]
  );

  const handleRetry = useCallback(() => {
    conversion.reset();
    setSelectedFile(null);
    setCopied(false);
  }, [conversion]);

  const handleDownload = useCallback(() => {
    conversion.download();
    setSelectedFile(null);
    setCopied(false);
  }, [conversion]);

  const handleCopy = useCallback(async () => {
    if (!conversion.textContent) return;
    try {
      await navigator.clipboard.writeText(conversion.textContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = conversion.textContent;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [conversion.textContent]);

  const handleLanguageChange = useCallback(
    (_: unknown, value: string | null) => {
      if (value) {
        setLanguage(value);
      }
    },
    []
  );

  const isProcessing = ['uploading', 'queued', 'processing'].includes(
    conversion.status
  );

  return (
    <Box sx={{ maxWidth: 520, mx: 'auto', width: '100%', py: { xs: 3, md: 4 } }}>
      <SEO title="OCR - Text Extraction" description="Extract text from images and PDFs with OCR. Free, no signup, files processed in memory only." path="/ocr" structuredData={buildToolSchema('OCR - Text Extraction', 'Extract text from images and PDFs with OCR. Free, no signup, files processed in memory only.', '/ocr')} />
      <Typography component="h1" level="h3" sx={{ mb: 1, fontWeight: 700, letterSpacing: '-0.02em' }}>
        OCR - Text Extraction
      </Typography>
      <Typography level="body-sm" sx={{ color: 'text.tertiary', mb: 2 }}>
        Extract text from images and PDFs
      </Typography>

      <ToolDisclaimer toolId="ocr" />

      <Chip
        size="sm"
        variant="soft"
        color="warning"
        sx={{ mb: 3, fontWeight: 500, fontSize: '0.65rem', whiteSpace: 'normal', textAlign: 'left', height: 'auto', py: 0.5, px: 1.5 }}
      >
        Beta — detection accuracy may vary depending on image quality and language
      </Chip>

      <FormControl sx={{ mb: 3 }}>
        <FormLabel>Language</FormLabel>
        <Select
          value={language}
          onChange={handleLanguageChange}
          disabled={isProcessing}
        >
          {AVAILABLE_LANGUAGES.map((lang) => (
            <Option key={lang.value} value={lang.value}>
              {lang.label}
            </Option>
          ))}
        </Select>
      </FormControl>

      {conversion.status === 'idle' ? (
        <FileDropZone
          onFileSelect={handleFileSelect}
          accept=".jpg,.jpeg,.png,.heic,.heif,.webp,.bmp,.pdf,image/*,application/pdf"
          maxSize={5 * 1024 * 1024}
          allowPaste
        />
      ) : isProcessing ? (
        <Box
          sx={{
            p: 4,
            borderRadius: 'lg',
            bgcolor: 'background.surface',
            border: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2.5,
          }}
        >
          {selectedFile && (
            <Typography level="body-sm" sx={{ color: 'text.tertiary' }}>
              {selectedFile.name}
            </Typography>
          )}
          <CircularProgress size="md" thickness={3} color="primary" />
          <Typography level="body-md" sx={{ color: 'text.secondary' }}>
            {conversion.status === 'uploading' && 'Uploading...'}
            {conversion.status === 'queued' && `Queue position: ${conversion.position}`}
            {conversion.status === 'processing' && 'Extracting text...'}
          </Typography>
        </Box>
      ) : conversion.status === 'done' ? (
        <Box>
          {selectedFile && (
            <Typography level="body-sm" sx={{ color: 'text.tertiary', mb: 2 }}>
              {selectedFile.name}
            </Typography>
          )}

          <Box
            sx={{
              position: 'relative',
              borderRadius: 'lg',
              bgcolor: 'background.surface',
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
                p: 2.5,
                pr: 5,
                maxHeight: 360,
                overflow: 'auto',
                '&::-webkit-scrollbar': { width: 6 },
                '&::-webkit-scrollbar-track': { bgcolor: 'transparent' },
                '&::-webkit-scrollbar-thumb': {
                  bgcolor: 'neutral.600',
                  borderRadius: 3,
                },
              }}
            >
              {conversion.textContent !== null ? (
                <Typography
                  level="body-sm"
                  sx={{
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    fontFamily: 'monospace',
                    fontSize: '0.8125rem',
                    lineHeight: 1.7,
                    color: 'text.primary',
                  }}
                >
                  {conversion.textContent.trim() || '(No text detected)'}
                </Typography>
              ) : (
                <Typography level="body-sm" sx={{ color: 'text.tertiary', fontStyle: 'italic' }}>
                  Loading text...
                </Typography>
              )}
            </Box>
          </Box>

          <Box sx={{ display: 'flex', gap: 1.5, mt: 2.5, justifyContent: 'center' }}>
            <Box
              component="button"
              onClick={handleDownload}
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
              <DownloadRoundedIcon sx={{ fontSize: 18 }} />
              Download .txt
            </Box>
            <Box
              component="button"
              onClick={handleRetry}
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
      ) : conversion.status === 'error' ? (
        <Box
          sx={{
            p: 4,
            borderRadius: 'lg',
            bgcolor: 'background.surface',
            border: '1px solid',
            borderColor: 'danger.plainColor',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2.5,
          }}
        >
          <ErrorOutlineIcon sx={{ fontSize: 36, color: 'danger.plainColor' }} />
          <Typography level="body-md" sx={{ color: 'danger.plainColor', textAlign: 'center' }}>
            {conversion.error || 'Text extraction failed'}
          </Typography>
          <Box
            component="button"
            onClick={handleRetry}
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
            <ReplayRoundedIcon sx={{ fontSize: 18 }} />
            Try again
          </Box>
        </Box>
      ) : null}
      <ToolSEOContent
        howTo={{
          title: 'How to extract text from images online',
          steps: [
            'Select the language of the text in your image or PDF.',
            'Upload your file (up to 5 MB). You can also paste an image from your clipboard.',
            'Wait for the OCR engine to extract the text.',
            'Copy the extracted text to your clipboard or download it as a .txt file.',
          ],
        }}
        features={[
          { icon: <LanguageOutlinedIcon />, title: '13 Languages', description: 'Supports English, French, German, Spanish, Italian, Portuguese, Dutch, Russian, Arabic, Chinese, Japanese, and Korean.' },
          { icon: <ImageOutlinedIcon />, title: 'Multiple Image Formats', description: 'Extract text from JPG, PNG, HEIC, WebP, and BMP images.' },
          { icon: <PictureAsPdfOutlinedIcon />, title: 'PDF Support', description: 'Extract text from scanned PDFs where the text is not selectable.' },
          { icon: <ContentCopyOutlinedIcon />, title: 'Copy & Download', description: 'Copy extracted text to your clipboard with one click or download as a .txt file.' },
          { icon: <LockOutlinedIcon />, title: 'Private & Secure', description: 'Files are processed in an isolated sandbox and deleted immediately after extraction.' },
          { icon: <BoltOutlinedIcon />, title: 'No Signup Required', description: 'Start extracting text immediately. No account, no email, no ads.' },
        ]}
        faq={[
          { question: 'What languages does the OCR support?', answer: 'The OCR engine supports 13 languages: English, French, German, Spanish, Italian, Portuguese, Dutch, Russian, Arabic, Chinese (Simplified and Traditional), Japanese, and Korean. Select the correct language before uploading for best results.' },
          { question: 'How accurate is the text extraction?', answer: 'Accuracy depends on image quality, font clarity, and contrast. Clean, high-resolution images with standard fonts produce the best results. Handwritten text, low-resolution images, or unusual fonts may reduce accuracy.' },
          { question: 'What is the file size limit?', answer: 'The maximum file size is 5 MB. For larger files, consider compressing or cropping the image first using the Image Compress or Image Convert tools.' },
          { question: 'Can I extract text from a scanned PDF?', answer: 'Yes. Upload the PDF and the OCR engine will analyze the scanned pages and extract any readable text.' },
          { question: 'Are my files stored on your servers?', answer: 'No. Files are processed in isolated memory and automatically deleted as soon as extraction is complete. We never store, log, or share your files.' },
        ]}
        relatedTools={[
          { label: 'Image Convert', href: '/convert/image' },
          { label: 'Image Compress', href: '/compress/image' },
          { label: 'Metadata Remove', href: '/metadata/remove' },
          { label: 'Images to PDF', href: '/merge/image-to-pdf' },
        ]}
      />
    </Box>
  );
}
