import { useCallback, useState, useRef, useEffect } from 'react';
import { Box, Typography } from '@mui/joy';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import ContentPasteRoundedIcon from '@mui/icons-material/ContentPasteRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';

interface FileDropZoneProps {
  onFileSelect: (file: File) => void;
  accept: string;
  maxSize?: number;
  disabled?: boolean;
  /** Enable Ctrl+V / Cmd+V paste support for images from clipboard */
  allowPaste?: boolean;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/** Derive human-readable format names from the accept string */
function friendlyFormats(accept: string): string {
  const exts = accept
    .split(',')
    .map(t => t.trim())
    .filter(t => t.startsWith('.'))
    .map(t => t.slice(1).toUpperCase());
  // dedupe (e.g. .jpg and .jpeg both → JPG/JPEG)
  const unique = [...new Set(exts)];
  if (unique.length === 0) return '';
  if (unique.length === 1) return unique[0];
  return unique.slice(0, -1).join(', ') + ' or ' + unique[unique.length - 1];
}

/** Get the file extension display name */
function fileExtName(name: string): string {
  const ext = name.split('.').pop()?.toUpperCase();
  return ext ? `.${ext}` : 'this file type';
}

export default function FileDropZone({
  onFileSelect,
  accept,
  maxSize = 20 * 1024 * 1024,
  disabled = false,
  allowPaste = false,
}: FileDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const errorTimerRef = useRef<number | null>(null);

  // Auto-dismiss errors after 6 seconds
  const setErrorWithDismiss = useCallback((msg: string) => {
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    setError(msg);
    errorTimerRef.current = window.setTimeout(() => setError(null), 6000);
  }, []);

  useEffect(() => {
    return () => { if (errorTimerRef.current) clearTimeout(errorTimerRef.current); };
  }, []);

  const validateFile = useCallback((file: File): string | null => {
    if (file.size > maxSize) {
      return `${file.name} is ${formatSize(file.size)} — max is ${formatSize(maxSize)}`;
    }

    const acceptedTypes = accept.split(',').map(t => t.trim());
    const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
    const isAccepted = acceptedTypes.some(type => {
      if (type.startsWith('.')) return fileExt === type.toLowerCase();
      if (type.endsWith('/*')) return file.type.startsWith(type.replace('/*', '/'));
      return file.type === type;
    });

    if (!isAccepted) {
      const formats = friendlyFormats(accept);
      return formats
        ? `${fileExtName(file.name)} isn't supported — try ${formats}`
        : 'This file type isn\'t supported';
    }
    return null;
  }, [accept, maxSize]);

  const handleFile = useCallback((file: File) => {
    const validationError = validateFile(file);
    if (validationError) {
      setErrorWithDismiss(validationError);
      return;
    }
    setError(null);
    onFileSelect(file);
  }, [validateFile, onFileSelect, setErrorWithDismiss]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [disabled, handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleClick = useCallback(() => {
    if (disabled) return;
    inputRef.current?.click();
  }, [disabled]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  }, [handleFile]);

  // Listen for Ctrl+V / Cmd+V paste events with image data
  useEffect(() => {
    if (!allowPaste || disabled) return;
    const onPaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          e.preventDefault();
          const blob = item.getAsFile();
          if (blob) {
            // Give pasted images a readable name with extension
            const ext = blob.type.split('/')[1]?.replace('jpeg', 'jpg') || 'png';
            const file = new File([blob], `pasted-image.${ext}`, { type: blob.type });
            handleFile(file);
          }
          return;
        }
      }
    };
    document.addEventListener('paste', onPaste);
    return () => document.removeEventListener('paste', onPaste);
  }, [allowPaste, disabled, handleFile]);

  return (
    <Box
      onClick={handleClick}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      sx={{
        border: '2px dashed',
        borderColor: error
          ? 'danger.500'
          : isDragging
            ? 'primary.400'
            : 'neutral.outlinedBorder',
        borderRadius: 'lg',
        py: 7,
        px: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1.5,
        cursor: disabled ? 'not-allowed' : 'pointer',
        bgcolor: error
          ? 'rgba(220, 38, 38, 0.04)'
          : isDragging ? 'rgba(37, 99, 235, 0.06)' : 'transparent',
        transition: 'all 0.25s ease',
        opacity: disabled ? 0.5 : 1,
        ...(error ? {
          animation: 'shake 0.35s ease-in-out',
          '@keyframes shake': {
            '0%, 100%': { transform: 'translateX(0)' },
            '20%': { transform: 'translateX(-4px)' },
            '40%': { transform: 'translateX(4px)' },
            '60%': { transform: 'translateX(-3px)' },
            '80%': { transform: 'translateX(2px)' },
          },
        } : {}),
        '&:hover': disabled ? {} : {
          borderColor: error ? 'danger.400' : 'primary.600',
          bgcolor: error ? 'rgba(220, 38, 38, 0.04)' : 'rgba(37, 99, 235, 0.04)',
          '& .upload-icon': {
            transform: 'translateY(-2px)',
            color: error ? 'danger.400' : 'primary.400',
          },
        },
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        style={{ display: 'none' }}
      />
      <CloudUploadOutlinedIcon
        className="upload-icon"
        sx={{
          fontSize: 40,
          color: error ? 'danger.400' : isDragging ? 'primary.400' : 'text.tertiary',
          mb: 0.5,
          transition: 'all 0.25s ease',
        }}
      />
      <Typography level="body-md" sx={{ color: isDragging ? 'primary.softColor' : 'text.secondary', fontWeight: 500 }}>
        {isDragging ? 'Drop your file here' : 'Drop file here or click to browse'}
      </Typography>
      {allowPaste && (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, color: 'text.tertiary' }}>
          <ContentPasteRoundedIcon sx={{ fontSize: 14 }} />
          <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
            or paste from clipboard
          </Typography>
        </Box>
      )}
      <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
        Max {formatSize(maxSize)}
      </Typography>
      {error && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            mt: 0.5,
            px: 2,
            py: 1,
            borderRadius: 'sm',
            bgcolor: 'rgba(220, 38, 38, 0.08)',
          }}
        >
          <ErrorOutlineRoundedIcon sx={{ fontSize: 18, color: 'danger.500', flexShrink: 0 }} />
          <Typography level="body-sm" sx={{ color: 'danger.500' }}>
            {error}
          </Typography>
        </Box>
      )}
    </Box>
  );
}
