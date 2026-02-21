import { useState, useCallback, useMemo } from 'react';
import {
  Box,
  Typography,
  RadioGroup,
  Radio,
  Sheet,
  FormControl,
} from '@mui/joy';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import FileDropZone from '../components/FileDropZone';
import ConversionProgress from '../components/ConversionProgress';
import SEO, { buildToolSchema } from '../components/SEO';
import { useConversion } from '../hooks/useConversion';
import ToolDisclaimer from '../components/ToolDisclaimer';
import ToolSEOContent from '../components/ToolSEOContent';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import SearchOutlinedIcon from '@mui/icons-material/SearchOutlined';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import { actionBtnBase } from '../styles/buttons';

type MetadataMode = 'remove' | 'inspect';

function formatMetadataValue(value: unknown): string {
  if (value === null || value === undefined) return '';
  if (Array.isArray(value)) return value.join(', ');
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}

function groupMetadata(metadata: Record<string, unknown>): Map<string, [string, string][]> {
  const groups = new Map<string, [string, string][]>();
  const entries = Object.entries(metadata).sort(([a], [b]) => a.localeCompare(b));

  for (const [key, value] of entries) {
    const colonIdx = key.indexOf(':');
    let group = 'Other';
    let field = key;
    if (colonIdx > 0) {
      group = key.substring(0, colonIdx);
      field = key.substring(colonIdx + 1);
    }
    if (!groups.has(group)) groups.set(group, []);
    groups.get(group)!.push([field, formatMetadataValue(value)]);
  }

  return groups;
}

function MetadataTable({ metadata }: { metadata: Record<string, unknown> }) {
  const groups = useMemo(() => groupMetadata(metadata), [metadata]);
  const totalFields = Object.keys(metadata).length;

  if (totalFields === 0) {
    return (
      <Typography level="body-sm" sx={{ color: 'text.tertiary', textAlign: 'center', py: 2 }}>
        No metadata found
      </Typography>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Typography level="body-xs" sx={{ color: 'text.tertiary', mb: 1.5 }}>
        {totalFields} metadata {totalFields === 1 ? 'field' : 'fields'}
      </Typography>
      <Box
        sx={{
          maxHeight: 360,
          overflowY: 'auto',
          borderRadius: 'md',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        {Array.from(groups.entries()).map(([group, fields], gi) => (
          <Box key={group}>
            <Box
              sx={{
                px: 1.5,
                py: 0.75,
                bgcolor: 'background.level1',
                borderBottom: '1px solid',
                borderColor: 'divider',
                ...(gi > 0 ? { borderTop: '1px solid', borderTopColor: 'divider' } : {}),
              }}
            >
              <Typography
                level="body-xs"
                sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.secondary' }}
              >
                {group}
              </Typography>
            </Box>
            {fields.map(([field, value], fi) => (
              <Box
                key={`${group}-${field}-${fi}`}
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '40% 1fr',
                  borderBottom: fi < fields.length - 1 ? '1px solid' : 'none',
                  borderColor: 'divider',
                  '&:hover': { bgcolor: 'background.level1' },
                  transition: 'background-color 0.1s',
                }}
              >
                <Box sx={{ px: 1.5, py: 0.75, minWidth: 0 }}>
                  <Typography
                    level="body-xs"
                    sx={{
                      fontWeight: 600,
                      color: 'text.secondary',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {field}
                  </Typography>
                </Box>
                <Box sx={{ px: 1.5, py: 0.75, minWidth: 0, borderLeft: '1px solid', borderColor: 'divider' }}>
                  <Typography
                    level="body-xs"
                    sx={{
                      fontFamily: 'monospace',
                      wordBreak: 'break-all',
                      color: 'text.primary',
                    }}
                  >
                    {value}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        ))}
      </Box>
    </Box>
  );
}

export default function MetadataRemovePage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mode, setMode] = useState<MetadataMode>('remove');

  const removeConversion = useConversion('/convert/metadata/remove');
  const inspectConversion = useConversion('/convert/metadata/inspect');

  const conversion = mode === 'remove' ? removeConversion : inspectConversion;

  const handleFileSelect = useCallback(
    (file: File) => {
      setSelectedFile(file);
      conversion.startConversion(file, {});
    },
    [conversion]
  );

  const handleRetry = useCallback(() => {
    conversion.reset();
    setSelectedFile(null);
  }, [conversion]);

  const handleDownload = useCallback(() => {
    removeConversion.download();
  }, [removeConversion]);

  const isProcessing = ['uploading', 'queued', 'processing'].includes(conversion.status);

  return (
    <Box sx={{ maxWidth: 520, mx: 'auto', width: '100%', py: { xs: 3, md: 4 } }}>
      <SEO
        title="Metadata Inspector & Remover"
        description="Inspect or strip EXIF, GPS, and other metadata from images and PDFs for privacy. Free, no signup, files processed in memory only."
        path="/metadata/remove"
        structuredData={buildToolSchema('Metadata Inspector & Remover', 'Inspect or strip EXIF, GPS, and other metadata from images and PDFs for privacy. Free, no signup, files processed in memory only.', '/metadata/remove')}
      />
      <Typography component="h1" level="h3" sx={{ mb: 1, fontWeight: 700, letterSpacing: '-0.02em' }}>
        Metadata
      </Typography>
      <Typography level="body-sm" sx={{ color: 'text.tertiary', mb: 4 }}>
        Inspect or strip EXIF, GPS and other metadata from images and PDFs
      </Typography>

      <ToolDisclaimer toolId="metadata-remove" />

      <Box
        sx={{
          p: 2.5,
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
            onChange={(e) => {
              if (!isProcessing) {
                setMode(e.target.value as MetadataMode);
              }
            }}
            sx={{ gap: 2 }}
          >
            <Sheet
              variant={mode === 'remove' ? 'soft' : 'plain'}
              sx={{
                flex: 1,
                p: 1.5,
                borderRadius: 'md',
                border: '1px solid',
                borderColor: mode === 'remove' ? 'primary.500' : 'divider',
                cursor: isProcessing ? 'default' : 'pointer',
                transition: 'all 0.15s',
              }}
            >
              <Radio
                value="remove"
                label="Remove"
                overlay
                disabled={isProcessing}
                slotProps={{ label: { sx: { fontSize: '0.875rem', fontWeight: 600 } } }}
              />
              <Typography level="body-xs" sx={{ color: 'text.tertiary', mt: 0.5, ml: 3.5 }}>
                Strip all metadata from file
              </Typography>
            </Sheet>
            <Sheet
              variant={mode === 'inspect' ? 'soft' : 'plain'}
              sx={{
                flex: 1,
                p: 1.5,
                borderRadius: 'md',
                border: '1px solid',
                borderColor: mode === 'inspect' ? 'primary.500' : 'divider',
                cursor: isProcessing ? 'default' : 'pointer',
                transition: 'all 0.15s',
              }}
            >
              <Radio
                value="inspect"
                label="Inspect"
                overlay
                disabled={isProcessing}
                slotProps={{ label: { sx: { fontSize: '0.875rem', fontWeight: 600 } } }}
              />
              <Typography level="body-xs" sx={{ color: 'text.tertiary', mt: 0.5, ml: 3.5 }}>
                View metadata without modifying
              </Typography>
            </Sheet>
          </RadioGroup>
        </FormControl>
      </Box>

      {conversion.status === 'idle' ? (
        <FileDropZone
          onFileSelect={handleFileSelect}
          accept=".jpg,.jpeg,.png,.heic,.heif,.webp,.pdf,image/*,application/pdf"
          maxSize={15 * 1024 * 1024}
          allowPaste
        />
      ) : conversion.status === 'done' ? (
        <Box
          sx={{
            p: 4,
            borderRadius: 'lg',
            bgcolor: 'background.surface',
            border: '1px solid',
            borderColor: 'primary.800',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2.5,
          }}
        >
          <CheckCircleOutlineIcon sx={{ fontSize: 36, color: 'success.500' }} />

          {selectedFile && (
            <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
              {selectedFile.name}
            </Typography>
          )}

          {mode === 'remove' && conversion.metadata && (
            <Box sx={{ width: '100%' }}>
              <Typography level="body-sm" sx={{ color: 'text.secondary', mb: 1, fontWeight: 600 }}>
                Removed metadata:
              </Typography>
              <MetadataTable metadata={conversion.metadata as Record<string, unknown>} />
            </Box>
          )}

          {mode === 'inspect' && conversion.metadata && (
            <MetadataTable metadata={conversion.metadata as Record<string, unknown>} />
          )}

          {mode === 'inspect' && !conversion.metadata && (
            <Typography level="body-sm" sx={{ color: 'text.tertiary' }}>
              No metadata found in this file.
            </Typography>
          )}

          <Box sx={{ display: 'flex', gap: 1.5, mt: 0.5 }}>
            {mode === 'remove' && (
              <Box
                component="button"
                onClick={handleDownload}
                sx={{
                  ...actionBtnBase,
                  bgcolor: 'primary.500',
                  color: 'white',
                  minWidth: 160,
                  '&:hover': {
                    bgcolor: 'primary.600',
                    transform: 'translateY(-1px)',
                    boxShadow: '0 4px 16px rgba(37, 99, 235, 0.25)',
                  },
                  '&:active': { transform: 'translateY(0)', boxShadow: 'none' },
                }}
              >
                <DownloadRoundedIcon sx={{ fontSize: 18 }} />
                Download
              </Box>
            )}
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
            onDownload={handleDownload}
            onRetry={handleRetry}
            showSizeComparison={false}
          />
        </Box>
      )}
      <ToolSEOContent
        howTo={{
          title: 'How to remove metadata from files online',
          steps: [
            'Choose a mode — Remove to strip all metadata, or Inspect to view metadata without modifying the file.',
            'Upload your image or PDF (up to 15 MB).',
            'Review the metadata found in your file.',
            'If using Remove mode, download the cleaned file with all metadata stripped.',
          ],
        }}
        features={[
          { icon: <VisibilityOffOutlinedIcon />, title: 'GPS & Location Removal', description: 'Strip GPS coordinates and location data embedded in photos to protect your privacy.' },
          { icon: <SearchOutlinedIcon />, title: 'Metadata Inspector', description: 'View all EXIF, IPTC, XMP, and other metadata fields before deciding to remove them.' },
          { icon: <SecurityOutlinedIcon />, title: 'Complete EXIF Stripping', description: 'Remove all metadata including camera info, timestamps, software details, and author data.' },
          { icon: <ImageOutlinedIcon />, title: 'Images & PDFs', description: 'Works with JPG, PNG, HEIC, WebP images and PDF documents.' },
          { icon: <LockOutlinedIcon />, title: 'Private & Secure', description: 'Files are processed in an isolated sandbox and deleted immediately after download.' },
          { icon: <BoltOutlinedIcon />, title: 'No Signup Required', description: 'Start removing metadata immediately. No account, no email, no ads.' },
        ]}
        faq={[
          { question: 'What metadata is removed?', answer: 'All embedded metadata is stripped, including EXIF data (camera model, settings, timestamps), GPS coordinates, IPTC captions, XMP data, ICC color profiles, and any other embedded metadata fields.' },
          { question: 'Why should I remove metadata from my photos?', answer: 'Photos often contain hidden data like GPS coordinates revealing where the photo was taken, your camera model, and timestamps. Removing metadata before sharing photos online protects your privacy and prevents location tracking.' },
          { question: 'Does removing metadata affect image quality?', answer: 'No. Metadata removal only strips the non-visual data embedded in the file. The actual image pixels remain completely untouched and the visual quality is identical.' },
          { question: 'What file formats are supported?', answer: 'The tool supports JPG/JPEG, PNG, HEIC/HEIF, WebP images and PDF documents. The maximum file size is 15 MB.' },
          { question: 'Are my files stored on your servers?', answer: 'No. Files are processed in isolated memory and automatically deleted as soon as you download the result. We never store, log, or share your files.' },
        ]}
        relatedTools={[
          { label: 'Image Convert', href: '/convert/image' },
          { label: 'Image Compress', href: '/compress/image' },
          { label: 'HEIC Convert', href: '/convert/heic' },
          { label: 'OCR', href: '/ocr' },
        ]}
      />
    </Box>
  );
}
