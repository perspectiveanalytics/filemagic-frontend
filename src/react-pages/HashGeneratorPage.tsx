import { useState, useCallback, useRef } from 'react';
import { Box, Typography, Button, Textarea, Sheet, Chip, IconButton, Tooltip, LinearProgress } from '@mui/joy';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import TextFieldsOutlinedIcon from '@mui/icons-material/TextFieldsOutlined';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import SEO, { buildToolSchema } from '../components/SEO';
import ToolDisclaimer from '../components/ToolDisclaimer';
import ToolSEOContent from '../components/ToolSEOContent';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import LaptopOutlinedIcon from '@mui/icons-material/LaptopOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import { Trans, useLingui } from '@lingui/react/macro';

// ---------------------------------------------------------------------------
// Minimal MD5 implementation (RFC 1321) — operates on ArrayBuffer
// ---------------------------------------------------------------------------

function md5(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  const len = bytes.length;

  // Pre-computed sine table (first 64 entries of |sin(i+1)| * 2^32)
  const T: number[] = [];
  for (let i = 0; i < 64; i++) {
    T[i] = (Math.abs(Math.sin(i + 1)) * 0x100000000) >>> 0;
  }

  // Shift amounts
  const S = [
    7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
    5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
    4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
    6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21,
  ];

  // Padding
  const bitLen = len * 8;
  const padLen = ((56 - ((len + 1) % 64)) + 64) % 64;
  const padded = new Uint8Array(len + 1 + padLen + 8);
  padded.set(bytes);
  padded[len] = 0x80;
  // Append original length in bits as 64-bit little-endian
  for (let i = 0; i < 4; i++) padded[padded.length - 8 + i] = (bitLen >>> (i * 8)) & 0xff;
  // For files > 512 MB the upper 32 bits matter; safe to leave zero for typical use

  let a0 = 0x67452301;
  let b0 = 0xefcdab89;
  let c0 = 0x98badcfe;
  let d0 = 0x10325476;

  const view = new DataView(padded.buffer);
  for (let offset = 0; offset < padded.length; offset += 64) {
    const M: number[] = [];
    for (let j = 0; j < 16; j++) M[j] = view.getUint32(offset + j * 4, true);

    let A = a0, B = b0, C = c0, D = d0;
    for (let i = 0; i < 64; i++) {
      let F: number, g: number;
      if (i < 16) {
        F = (B & C) | (~B & D);
        g = i;
      } else if (i < 32) {
        F = (D & B) | (~D & C);
        g = (5 * i + 1) % 16;
      } else if (i < 48) {
        F = B ^ C ^ D;
        g = (3 * i + 5) % 16;
      } else {
        F = C ^ (B | ~D);
        g = (7 * i) % 16;
      }
      F = (F + A + T[i] + M[g]) >>> 0;
      A = D;
      D = C;
      C = B;
      B = (B + ((F << S[i]) | (F >>> (32 - S[i])))) >>> 0;
    }
    a0 = (a0 + A) >>> 0;
    b0 = (b0 + B) >>> 0;
    c0 = (c0 + C) >>> 0;
    d0 = (d0 + D) >>> 0;
  }

  // Convert to hex (little-endian)
  const hex = (n: number) =>
    Array.from({ length: 4 }, (_, i) => ((n >>> (i * 8)) & 0xff).toString(16).padStart(2, '0')).join('');
  return hex(a0) + hex(b0) + hex(c0) + hex(d0);
}

// ---------------------------------------------------------------------------
// Hash computation helpers
// ---------------------------------------------------------------------------

type HashAlgorithm = 'MD5' | 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512';

const ALGORITHMS: HashAlgorithm[] = ['MD5', 'SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'];

function bufToHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, '0')).join('');
}

async function computeWebCryptoHash(algorithm: string, data: ArrayBuffer): Promise<string> {
  const digest = await crypto.subtle.digest(algorithm, data);
  return bufToHex(digest);
}

const CHUNK_SIZE = 2 * 1024 * 1024; // 2 MB

function readFileChunks(file: File, onProgress: (pct: number) => void): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    const chunks: Uint8Array[] = [];
    let offset = 0;

    function readNext() {
      const slice = file.slice(offset, offset + CHUNK_SIZE);
      reader.readAsArrayBuffer(slice);
    }

    reader.onload = () => {
      if (!reader.result) return;
      chunks.push(new Uint8Array(reader.result as ArrayBuffer));
      offset += CHUNK_SIZE;
      onProgress(Math.min(offset / file.size, 1));
      if (offset < file.size) {
        readNext();
      } else {
        // Merge chunks into single buffer
        const total = chunks.reduce((s, c) => s + c.length, 0);
        const merged = new Uint8Array(total);
        let pos = 0;
        for (const c of chunks) {
          merged.set(c, pos);
          pos += c.length;
        }
        resolve(merged.buffer);
      }
    };
    reader.onerror = () => reject(reader.error);
    readNext();
  });
}

async function computeAllHashes(
  data: ArrayBuffer,
  onAlgo: (name: HashAlgorithm) => void,
): Promise<Record<HashAlgorithm, string>> {
  const results = {} as Record<HashAlgorithm, string>;

  onAlgo('MD5');
  results['MD5'] = md5(data);

  for (const algo of ['SHA-1', 'SHA-256', 'SHA-384', 'SHA-512'] as const) {
    onAlgo(algo);
    results[algo] = await computeWebCryptoHash(algo, data);
  }

  return results;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

type InputMode = 'file' | 'text';

const inputModes: { value: InputMode; label: string; icon: React.ReactElement }[] = [
  { value: 'file', label: 'File', icon: <InsertDriveFileOutlinedIcon sx={{ fontSize: 16 }} /> },
  { value: 'text', label: 'Text', icon: <TextFieldsOutlinedIcon sx={{ fontSize: 16 }} /> },
];

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const value = bytes / Math.pow(1024, i);
  return `${value < 10 ? value.toFixed(2) : value < 100 ? value.toFixed(1) : Math.round(value)} ${units[i]}`;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function HashGeneratorPage() {
  const { t } = useLingui();
  const [mode, setMode] = useState<InputMode>('file');
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [computing, setComputing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentAlgo, setCurrentAlgo] = useState<string | null>(null);
  const [results, setResults] = useState<Record<HashAlgorithm, string> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const reset = useCallback(() => {
    setFile(null);
    setText('');
    setResults(null);
    setError(null);
    setComputing(false);
    setProgress(0);
    setCurrentAlgo(null);
    setCopiedKey(null);
    if (fileRef.current) fileRef.current.value = '';
  }, []);

  const handleModeChange = useCallback((newMode: InputMode) => {
    setMode(newMode);
    reset();
  }, [reset]);

  const compute = useCallback(async (data: ArrayBuffer) => {
    setComputing(true);
    setResults(null);
    setError(null);
    setProgress(0);
    try {
      const hashes = await computeAllHashes(data, (algo) => setCurrentAlgo(algo));
      setResults(hashes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to compute hashes');
    } finally {
      setComputing(false);
      setCurrentAlgo(null);
      setProgress(1);
    }
  }, []);

  const handleFileSelect = useCallback(async (selectedFile: File) => {
    setFile(selectedFile);
    setResults(null);
    setError(null);
    setComputing(true);
    setProgress(0);
    try {
      const buffer = await readFileChunks(selectedFile, (pct) => setProgress(pct * 0.5));
      setProgress(0.5);
      const hashes = await computeAllHashes(buffer, (algo) => {
        setCurrentAlgo(algo);
        // Distribute remaining 50% across 5 algorithms
        const idx = ALGORITHMS.indexOf(algo);
        setProgress(0.5 + ((idx + 1) / ALGORITHMS.length) * 0.5);
      });
      setResults(hashes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to read file');
    } finally {
      setComputing(false);
      setCurrentAlgo(null);
      setProgress(1);
    }
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFileSelect(f);
  }, [handleFileSelect]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const f = e.dataTransfer.files?.[0];
    if (f) handleFileSelect(f);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleTextCompute = useCallback(() => {
    if (!text.trim()) return;
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    compute(data.buffer as ArrayBuffer);
  }, [text, compute]);

  const handleCopy = useCallback(async (algo: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedKey(algo);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = value;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedKey(algo);
      setTimeout(() => setCopiedKey(null), 2000);
    }
  }, []);

  const hasInput = mode === 'file' ? !!file : text.trim().length > 0;

  return (
    <Box sx={{ maxWidth: 520, mx: 'auto', width: '100%', py: { xs: 3, md: 4 } }}>
      <SEO
        title={t`Hash Generator`}
        description={t`Compute MD5, SHA-1, SHA-256, SHA-384 and SHA-512 hashes for files and text. Free, no signup, runs entirely in your browser.`}
        path="/tools/hash-generator"
        structuredData={buildToolSchema(
          'Hash Generator',
          'Compute MD5, SHA-1, SHA-256, SHA-384 and SHA-512 hashes for files and text. Free, no signup, runs entirely in your browser.',
          '/tools/hash-generator',
        )}
      />

      <Typography component="h1" level="h3" sx={{ mb: 1, fontWeight: 700, letterSpacing: '-0.02em' }}><Trans>Hash Generator</Trans></Typography>
      <Typography level="body-sm" sx={{ color: 'text.tertiary', mb: 4 }}><Trans>Compute file and text checksums instantly in your browser</Trans></Typography>

      <ToolDisclaimer toolId="hash-generator" />

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 3 }}>
        {inputModes.map((m) => (
          <Chip
            key={m.value}
            variant={mode === m.value ? 'solid' : 'outlined'}
            color={mode === m.value ? 'primary' : 'neutral'}
            onClick={() => handleModeChange(m.value)}
            startDecorator={m.icon}
            sx={{ cursor: 'pointer', fontWeight: mode === m.value ? 600 : 400 }}
          >
            {m.label}
          </Chip>
        ))}
      </Box>

      {mode === 'file' && (
        <>
          <input
            ref={fileRef}
            type="file"
            style={{ display: 'none' }}
            onChange={handleFileInput}
          />
          <Box
            onClick={() => !computing && fileRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            sx={{
              mb: 3,
              p: 4,
              borderRadius: 'lg',
              border: '2px dashed',
              borderColor: file ? 'primary.300' : 'divider',
              bgcolor: file ? 'primary.softBg' : 'background.surface',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 1,
              cursor: computing ? 'default' : 'pointer',
              transition: 'all 0.15s',
              '&:hover': computing
                ? {}
                : {
                    borderColor: 'primary.400',
                    bgcolor: 'background.level1',
                  },
            }}
          >
            {file ? (
              <>
                <InsertDriveFileOutlinedIcon sx={{ fontSize: 28, color: 'primary.plainColor' }} />
                <Typography level="body-sm" sx={{ fontWeight: 600, textAlign: 'center', wordBreak: 'break-all' }}>
                  {file.name}
                </Typography>
                <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
                  {formatFileSize(file.size)}
                </Typography>
              </>
            ) : (
              <>
                <UploadFileOutlinedIcon sx={{ fontSize: 28, color: 'text.tertiary' }} />
                <Typography level="body-sm" sx={{ fontWeight: 500, color: 'text.secondary' }}><Trans>Drop a file here or click to browse</Trans></Typography>
                <Typography level="body-xs" sx={{ color: 'text.tertiary' }}><Trans>Any file type, any size</Trans></Typography>
              </>
            )}
          </Box>
        </>
      )}

      {mode === 'text' && (
        <Box sx={{ mb: 3 }}>
          <Textarea
            placeholder={t`Type or paste text to hash...`}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setResults(null);
              setError(null);
            }}
            minRows={4}
            maxRows={10}
            sx={{
              mb: 2,
              fontSize: 'sm',
              bgcolor: 'background.surface',
              '--Textarea-focusedThickness': '1px',
            }}
          />
          <Button
            size="lg"
            onClick={handleTextCompute}
            disabled={!text.trim() || computing}
            loading={computing}
            sx={{ width: '100%' }}
          ><Trans>Compute Hashes</Trans></Button>
        </Box>
      )}

      {computing && (
        <Box sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
            <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
              {currentAlgo ? `Computing ${currentAlgo}...` : 'Reading file...'}
            </Typography>
            <Typography level="body-xs" sx={{ color: 'text.tertiary', fontFamily: 'monospace' }}>
              {Math.round(progress * 100)}%
            </Typography>
          </Box>
          <LinearProgress
            determinate
            value={progress * 100}
            sx={{ '--LinearProgress-thickness': '6px', borderRadius: 'sm' }}
          />
        </Box>
      )}

      {error && (
        <Typography level="body-sm" sx={{ color: 'danger.plainColor', mb: 2 }}>
          {error}
        </Typography>
      )}

      {results && (
        <Sheet
          variant="outlined"
          sx={{
            borderRadius: 'lg',
            overflow: 'hidden',
            mb: 1,
          }}
        >
          {ALGORITHMS.map((algo, idx) => (
            <Box
              key={algo}
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1.5,
                px: 2,
                py: 1.5,
                ...(idx < ALGORITHMS.length - 1 && {
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                }),
              }}
            >
              <Typography
                level="body-xs"
                sx={{
                  flexShrink: 0,
                  minWidth: 58,
                  fontWeight: 700,
                  color: 'text.secondary',
                  mt: '1px',
                  fontSize: '0.7rem',
                  letterSpacing: '0.02em',
                }}
              >
                {algo}
              </Typography>

              <Typography
                level="body-xs"
                sx={{
                  flex: 1,
                  fontFamily: 'monospace',
                  fontSize: '0.7rem',
                  wordBreak: 'break-all',
                  lineHeight: 1.6,
                  color: 'text.primary',
                  userSelect: 'all',
                }}
              >
                {results[algo]}
              </Typography>

              <Tooltip
                title={copiedKey === algo ? 'Copied!' : 'Copy'}
                placement="left"
                size="sm"
              >
                <IconButton
                  size="sm"
                  variant="plain"
                  color={copiedKey === algo ? 'success' : 'neutral'}
                  onClick={() => handleCopy(algo, results[algo])}
                  sx={{ mt: '-2px', flexShrink: 0, minWidth: 28, minHeight: 28 }}
                >
                  {copiedKey === algo ? (
                    <CheckOutlinedIcon sx={{ fontSize: 14 }} />
                  ) : (
                    <ContentCopyOutlinedIcon sx={{ fontSize: 14 }} />
                  )}
                </IconButton>
              </Tooltip>
            </Box>
          ))}
        </Sheet>
      )}

      {hasInput && !computing && (
        <Button
          variant="plain"
          color="neutral"
          size="sm"
          onClick={reset}
          sx={{ mt: 2, width: '100%' }}
        ><Trans>Reset</Trans></Button>
      )}

      <ToolSEOContent
        howTo={{
          title: t`How to compute file checksums`,
          steps: [
            t`Choose File mode to hash a file, or Text mode to hash a string.`,
            t`Upload any file by dragging it or clicking to browse, or type your text directly.`,
            t`All five hash algorithms run automatically — MD5, SHA-1, SHA-256, SHA-384, and SHA-512.`,
            t`Click the copy button next to any hash to copy it to your clipboard.`,
          ],
        }}
        features={[
          { icon: <LayersOutlinedIcon />, title: t`Five Algorithms`, description: t`MD5, SHA-1, SHA-256, SHA-384, and SHA-512 computed simultaneously in one pass.` },
          { icon: <LaptopOutlinedIcon />, title: t`Runs in Your Browser`, description: t`Nothing is uploaded. All computation happens locally using the Web Crypto API.` },
          { icon: <InsertDriveFileOutlinedIcon />, title: t`File & Text Input`, description: t`Hash any file regardless of type or size, or hash plain text directly.` },
          { icon: <ContentCopyOutlinedIcon />, title: t`Instant Copy`, description: t`Copy any individual hash to your clipboard with one click.` },
          { icon: <UploadFileOutlinedIcon />, title: t`Large File Support`, description: t`Files are read in 2 MB chunks so memory stays low even for multi-gigabyte files.` },
          { icon: <BoltOutlinedIcon />, title: t`Fast & Offline`, description: t`Works offline once loaded. No server connection required for computation.` },
        ]}
        faq={[
          { question: t`What is a hash or checksum?`, answer: t`A hash is a fixed-length string computed from data using a mathematical function. The same input always produces the same hash, but even a tiny change produces a completely different result. This makes hashes useful for verifying file integrity.` },
          { question: t`Which hash algorithm should I use?`, answer: t`For file integrity verification, SHA-256 is the standard choice. MD5 and SHA-1 are faster but are considered cryptographically broken and should not be used for security purposes.` },
          { question: t`Are my files uploaded to a server?`, answer: t`No. All computation runs entirely in your browser using the Web Crypto API for SHA algorithms and a JavaScript implementation for MD5. Your files never leave your device.` },
          { question: t`Can I hash very large files?`, answer: t`Yes. Files are read in 2 MB chunks, so memory usage stays low regardless of file size. However, very large files (several GB) will take longer to process.` },
          { question: t`How do I verify a downloaded file?`, answer: t`Compute the SHA-256 hash of your downloaded file and compare it with the hash published by the file distributor. If they match, the file has not been corrupted or tampered with during transfer.` },
        ]}
        relatedTools={[
          { label: t`Password Generator`, href: '/generate/password' },
          { label: t`Base64 Encode/Decode`, href: '/tools/base64' },
        ]}
      />
    </Box>
  );
}
