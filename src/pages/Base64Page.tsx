import { useState, useCallback, useRef } from 'react';
import { Box, Typography, Textarea, IconButton, Tooltip, Sheet, Radio, RadioGroup, FormControl, Input } from '@mui/joy';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import SEO, { buildToolSchema } from '../components/SEO';
import ToolDisclaimer from '../components/ToolDisclaimer';
import ToolSEOContent from '../components/ToolSEOContent';
import EnhancedEncryptionOutlinedIcon from '@mui/icons-material/EnhancedEncryptionOutlined';
import TextFieldsOutlinedIcon from '@mui/icons-material/TextFieldsOutlined';
import AttachFileOutlinedIcon from '@mui/icons-material/AttachFileOutlined';
import SyncAltOutlinedIcon from '@mui/icons-material/SyncAltOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

type Mode = 'encode' | 'decode';

export default function Base64Page() {
  const [mode, setMode] = useState<Mode>('encode');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [ext, setExt] = useState('txt');
  const fileRef = useRef<HTMLInputElement>(null);

  const convert = useCallback(
    (text: string, dir: Mode) => {
      if (!text.trim()) {
        setOutput('');
        setError(null);
        return;
      }
      try {
        if (dir === 'encode') {
          // UTF-8 safe encode
          const bytes = new TextEncoder().encode(text);
          let binary = '';
          for (let i = 0; i < bytes.length; i++) {
            binary += String.fromCharCode(bytes[i]);
          }
          setOutput(btoa(binary));
        } else {
          // UTF-8 safe decode
          const binary = atob(text.trim());
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
          }
          setOutput(new TextDecoder().decode(bytes));
        }
        setError(null);
      } catch {
        setOutput('');
        setError(dir === 'encode' ? 'Failed to encode' : 'Invalid Base64 string');
      }
    },
    []
  );

  const handleInputChange = useCallback(
    (text: string) => {
      setInput(text);
      convert(text, mode);
    },
    [mode, convert]
  );

  const handleModeChange = useCallback(
    (newMode: Mode) => {
      setMode(newMode);
      setInput('');
      setOutput('');
      setError(null);
    },
    []
  );

  const handleCopy = useCallback(async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = output;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [output]);

  const handleDownload = useCallback(() => {
    if (!output) return;
    const sanitized = ext.replace(/[^a-zA-Z0-9]/g, '') || 'txt';
    const blob = new Blob([output], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `base64-output.${sanitized}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [output, ext]);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (file.size > 5 * 1024 * 1024) {
        setError('File too large (max 5 MB)');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1] || '';
        setInput(`[File: ${file.name}]`);
        setOutput(base64);
        setError(null);
        setMode('encode');
      };
      reader.readAsDataURL(file);
      // Reset input so re-selecting same file still fires
      e.target.value = '';
    },
    []
  );

  return (
    <Box sx={{ maxWidth: 520, mx: 'auto', width: '100%', py: { xs: 3, md: 4 } }}>
      <SEO
        title="Base64 Encode / Decode"
        description="Encode and decode Base64 text or files. Free, no signup, runs entirely in your browser."
        path="/tools/base64"
        structuredData={buildToolSchema('Base64 Encode / Decode', 'Encode and decode Base64 text or files.', '/tools/base64')}
      />
      <Typography component="h1" level="h3" sx={{ mb: 1, fontWeight: 700, letterSpacing: '-0.02em' }}>
        Base64
      </Typography>
      <Typography level="body-sm" sx={{ color: 'text.tertiary', mb: 4 }}>
        Encode or decode Base64 text and files
      </Typography>

      <ToolDisclaimer toolId="base64" />

      <Box
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 'lg',
          bgcolor: 'background.surface',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <FormControl>
          <RadioGroup
            orientation="horizontal"
            value={mode}
            onChange={(e) => handleModeChange(e.target.value as Mode)}
            sx={{ gap: 2 }}
          >
            <Sheet
              variant={mode === 'encode' ? 'soft' : 'plain'}
              sx={{
                flex: 1,
                p: 1.5,
                borderRadius: 'md',
                border: '1px solid',
                borderColor: mode === 'encode' ? 'primary.500' : 'divider',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              <Radio
                value="encode"
                label="Encode"
                overlay
                slotProps={{ label: { sx: { fontSize: '0.875rem', fontWeight: 600 } } }}
              />
              <Typography level="body-xs" sx={{ color: 'text.tertiary', mt: 0.5, ml: 3.5 }}>
                Text → Base64
              </Typography>
            </Sheet>
            <Sheet
              variant={mode === 'decode' ? 'soft' : 'plain'}
              sx={{
                flex: 1,
                p: 1.5,
                borderRadius: 'md',
                border: '1px solid',
                borderColor: mode === 'decode' ? 'primary.500' : 'divider',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              <Radio
                value="decode"
                label="Decode"
                overlay
                slotProps={{ label: { sx: { fontSize: '0.875rem', fontWeight: 600 } } }}
              />
              <Typography level="body-xs" sx={{ color: 'text.tertiary', mt: 0.5, ml: 3.5 }}>
                Base64 → Text
              </Typography>
            </Sheet>
          </RadioGroup>
        </FormControl>
      </Box>

      <Box sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography level="body-sm" sx={{ fontWeight: 600, color: 'text.secondary' }}>
            {mode === 'encode' ? 'Text' : 'Base64'}
          </Typography>
          {mode === 'encode' && (
            <>
              <input
                ref={fileRef}
                type="file"
                style={{ display: 'none' }}
                onChange={handleFileSelect}
              />
              <Box
                component="button"
                onClick={() => fileRef.current?.click()}
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.5,
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 'sm',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'transparent',
                  color: 'text.secondary',
                  fontFamily: 'inherit',
                  transition: 'all 0.15s',
                  '&:hover': { borderColor: 'neutral.500', color: 'text.primary' },
                }}
              >
                <UploadFileOutlinedIcon sx={{ fontSize: 14 }} />
                File
              </Box>
            </>
          )}
        </Box>
        <Textarea
          placeholder={mode === 'encode' ? 'Enter text to encode...' : 'Paste Base64 string...'}
          value={input}
          onChange={(e) => handleInputChange(e.target.value)}
          minRows={4}
          maxRows={10}
          sx={{
            fontFamily: mode === 'decode' ? 'monospace' : 'inherit',
            fontSize: 'sm',
            bgcolor: 'background.surface',
            '--Textarea-focusedThickness': '1px',
          }}
        />
      </Box>

      {error && (
        <Typography level="body-sm" sx={{ color: 'danger.plainColor', mb: 2 }}>
          {error}
        </Typography>
      )}

      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
          <Typography level="body-sm" sx={{ fontWeight: 600, color: 'text.secondary' }}>
            {mode === 'encode' ? 'Base64' : 'Text'}
          </Typography>
          {output && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
              <Input
                size="sm"
                value={ext}
                onChange={(e) => setExt(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                startDecorator={
                  <Typography level="body-xs" sx={{ color: 'text.tertiary', userSelect: 'none' }}>
                    .
                  </Typography>
                }
                sx={{
                  width: 80,
                  '--Input-minHeight': '28px',
                  '--Input-paddingInline': '6px',
                  fontSize: '0.75rem',
                  fontFamily: 'monospace',
                }}
              />
              <Tooltip title="Download" placement="top">
                <IconButton
                  size="sm"
                  variant="soft"
                  color="primary"
                  onClick={handleDownload}
                  sx={{ minWidth: 28, minHeight: 28 }}
                >
                  <FileDownloadOutlinedIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </Tooltip>
              <Tooltip title={copied ? 'Copied!' : 'Copy'} placement="top">
                <IconButton
                  size="sm"
                  variant="soft"
                  color={copied ? 'success' : 'neutral'}
                  onClick={handleCopy}
                  sx={{ minWidth: 28, minHeight: 28 }}
                >
                  {copied ? (
                    <CheckRoundedIcon sx={{ fontSize: 14 }} />
                  ) : (
                    <ContentCopyRoundedIcon sx={{ fontSize: 14 }} />
                  )}
                </IconButton>
              </Tooltip>
            </Box>
          )}
        </Box>
        <Textarea
          readOnly
          value={output}
          placeholder="Result will appear here..."
          minRows={4}
          maxRows={10}
          sx={{
            fontFamily: mode === 'encode' ? 'monospace' : 'inherit',
            fontSize: 'sm',
            bgcolor: 'background.level1',
            '--Textarea-focusedThickness': '0px',
          }}
        />
      </Box>

      <ToolSEOContent
        howTo={{
          title: 'How to encode or decode Base64',
          steps: [
            'Select Encode to convert text to Base64, or Decode to convert Base64 back to text.',
            'Type or paste your input in the text area.',
            'The result appears instantly in the output panel below.',
            'To encode a file, click the File button and select any file up to 5 MB.',
            'Click the copy button to copy the result to your clipboard.',
          ],
        }}
        features={[
          { icon: <EnhancedEncryptionOutlinedIcon />, title: 'Encode & Decode', description: 'Convert plain text to Base64 encoding or decode Base64 strings back to readable text.' },
          { icon: <TextFieldsOutlinedIcon />, title: 'UTF-8 Safe', description: 'Properly handles Unicode and multi-byte characters using TextEncoder/TextDecoder for accurate results.' },
          { icon: <AttachFileOutlinedIcon />, title: 'File Support', description: 'Encode any file (images, PDFs, documents) up to 5 MB directly to Base64 with one click.' },
          { icon: <SyncAltOutlinedIcon />, title: 'Instant Conversion', description: 'Results update in real time as you type. No need to click a convert button.' },
          { icon: <BoltOutlinedIcon />, title: 'Fast & Lightweight', description: 'Uses native browser APIs for encoding and decoding, delivering results in microseconds.' },
          { icon: <LockOutlinedIcon />, title: 'Runs in Your Browser', description: 'No data is sent to any server. All encoding and decoding happens locally in your browser.' },
        ]}
        faq={[
          { question: 'What is Base64 encoding?', answer: 'Base64 is a binary-to-text encoding scheme that represents binary data as ASCII characters. It is commonly used to embed images in HTML/CSS, transmit data in URLs, and encode email attachments.' },
          { question: 'Does Base64 encrypt my data?', answer: 'No. Base64 is an encoding, not encryption. Anyone can decode a Base64 string back to its original content. Do not use Base64 to protect sensitive information.' },
          { question: 'Why is the Base64 output larger than the input?', answer: 'Base64 encoding increases data size by approximately 33% because it represents every 3 bytes of input as 4 ASCII characters. This is a trade-off for compatibility with text-based systems.' },
          { question: 'Can I decode Base64 images?', answer: 'This tool decodes Base64 to text. For Base64-encoded images, the decoded output will be binary data that appears as garbled text. Use a data URI (data:image/png;base64,...) in an img tag instead.' },
          { question: 'Is there a size limit?', answer: 'Text input has no hard limit. File encoding supports files up to 5 MB. Since everything runs in your browser, very large inputs may briefly slow down the page.' },
        ]}
        relatedTools={[
          { label: 'Hash Generator', href: '/tools/hash' },
          { label: 'Word Counter', href: '/tools/word-counter' },
          { label: 'YAML / JSON Converter', href: '/convert/yaml' },
          { label: 'JSON / CSV Converter', href: '/convert/json-csv' },
        ]}
      />
    </Box>
  );
}
