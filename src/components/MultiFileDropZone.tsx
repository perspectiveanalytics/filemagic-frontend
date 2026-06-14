import { useCallback, useState, useRef, useEffect, useId } from 'react';
import { Box, Typography, IconButton } from '@mui/joy';
import { useLingui } from '@lingui/react/macro';
import { Trans } from '@lingui/react/macro';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import InsertDriveFileOutlinedIcon from '@mui/icons-material/InsertDriveFileOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import CloseIcon from '@mui/icons-material/Close';

interface MultiFileDropZoneProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
  accept: string;
  maxSize?: number;
  maxFiles?: number;
  disabled?: boolean;
  allowPreview?: boolean;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function MultiFileDropZone({
  files,
  onFilesChange,
  accept,
  maxSize = 20 * 1024 * 1024,
  maxFiles = 20,
  disabled = false,
  allowPreview = false,
}: MultiFileDropZoneProps) {
  const { t } = useLingui();
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hintId = useId();
  const errorId = useId();

  const previewFile = previewIndex !== null ? files[previewIndex] : null;
  const isPdf = previewFile?.type === 'application/pdf';

  useEffect(() => {
    if (!previewFile) {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
      return;
    }
    const url = URL.createObjectURL(previewFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [previewFile]);

  const validateFile = useCallback((file: File): string | null => {
    if (file.size > maxSize) {
      const name = file.name;
      const max = Math.round(maxSize / 1024 / 1024);
      return t`"${name}" is too large. Maximum size is ${max}MB.`;
    }
    if (accept !== '*') {
      const acceptedTypes = accept.split(',').map(a => a.trim());
      const fileExt = '.' + file.name.split('.').pop()?.toLowerCase();
      const isAccepted = acceptedTypes.some(type => {
        if (type.startsWith('.')) return fileExt === type.toLowerCase();
        if (type.endsWith('/*')) return file.type.startsWith(type.replace('/*', '/'));
        return file.type === type;
      });
      if (!isAccepted) {
        const name = file.name;
        return t`"${name}" is not a supported file type.`;
      }
    }
    return null;
  }, [accept, maxSize, t]);

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    const combined = [...files];

    for (const file of fileArray) {
      if (combined.length >= maxFiles) {
        setError(t`Maximum ${maxFiles} files allowed.`);
        break;
      }
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        continue;
      }
      combined.push(file);
    }

    if (combined.length > files.length) {
      setError(null);
      onFilesChange(combined);
    }
  }, [files, maxFiles, validateFile, onFilesChange, t]);

  const removeFile = useCallback((index: number) => {
    const updated = files.filter((_, i) => i !== index);
    onFilesChange(updated);
    setError(null);
  }, [files, onFilesChange]);

  const moveFile = useCallback((index: number, direction: -1 | 1) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= files.length) return;
    const updated = [...files];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    onFilesChange(updated);
  }, [files, onFilesChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    addFiles(e.dataTransfer.files);
  }, [disabled, addFiles]);

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
    if (e.target.files) addFiles(e.target.files);
    e.target.value = '';
  }, [addFiles]);

  useEffect(() => {
    if (previewIndex === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setPreviewIndex(null);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [previewIndex]);

  return (
    <Box>
      <Box
        component="button"
        type="button"
        disabled={disabled}
        aria-describedby={error ? `${hintId} ${errorId}` : hintId}
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
          width: '100%',
          py: files.length > 0 ? 4 : 7,
          px: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1.5,
          cursor: disabled ? 'not-allowed' : 'pointer',
          font: 'inherit',
          bgcolor: isDragging ? 'rgba(37, 99, 235, 0.06)' : 'transparent',
          transition: 'all 0.25s ease',
          opacity: disabled ? 0.5 : 1,
          '&:focus-visible': {
            outline: '3px solid',
            outlineColor: 'primary.300',
            outlineOffset: 3,
          },
          '&:hover': disabled ? {} : {
            borderColor: 'primary.600',
            bgcolor: 'rgba(37, 99, 235, 0.04)',
            '& .upload-icon': {
              transform: 'translateY(-2px)',
              color: 'primary.400',
            },
          },
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept !== '*' ? accept : undefined}
          multiple
          onChange={handleInputChange}
          disabled={disabled}
          style={{ display: 'none' }}
        />
        <CloudUploadOutlinedIcon
          className="upload-icon"
          sx={{
            fontSize: 36,
            color: isDragging ? 'primary.400' : 'text.tertiary',
            mb: 0.5,
            transition: 'all 0.25s ease',
          }}
        />
        <Typography level="body-md" sx={{ color: isDragging ? 'primary.softColor' : 'text.secondary', fontWeight: 500 }}>
          {isDragging ? <Trans>Drop files here</Trans> : files.length > 0 ? <Trans>Drop more files or click to add</Trans> : <Trans>Drop files here or click to browse</Trans>}
        </Typography>
        <Typography id={hintId} level="body-xs" sx={{ color: 'text.tertiary' }}>
          {t`Max ${Math.round(maxSize / 1024 / 1024)}MB per file, up to ${maxFiles} files`}
        </Typography>
        {error && (
          <Typography id={errorId} role="alert" level="body-sm" sx={{ color: 'danger.500', mt: 0.5 }}>
            {error}
          </Typography>
        )}
      </Box>

      {files.length > 0 && (
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {files.map((file, index) => (
            <Box
              key={`${file.name}-${index}`}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                p: 1.5,
                borderRadius: 'md',
                bgcolor: 'background.surface',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <InsertDriveFileOutlinedIcon sx={{ fontSize: 20, color: 'text.tertiary', flexShrink: 0 }} />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography level="body-sm" noWrap sx={{ fontWeight: 500 }}>
                  {file.name}
                </Typography>
                <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
                  {formatBytes(file.size)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 0.25, flexShrink: 0 }}>
                {allowPreview && (
                  <IconButton
                    aria-label={t`Preview ${file.name}`}
                    size="sm"
                    variant="plain"
                    color="neutral"
                    onClick={(e) => { e.stopPropagation(); setPreviewIndex(index); }}
                    sx={{ minWidth: 28, minHeight: 28 }}
                  >
                    <VisibilityOutlinedIcon sx={{ fontSize: 18 }} />
                  </IconButton>
                )}
                <IconButton
                  aria-label={t`Move ${file.name} up`}
                  size="sm"
                  variant="plain"
                  color="neutral"
                  disabled={index === 0 || disabled}
                  onClick={(e) => { e.stopPropagation(); moveFile(index, -1); }}
                  sx={{ minWidth: 28, minHeight: 28 }}
                >
                  <KeyboardArrowUpIcon sx={{ fontSize: 18 }} />
                </IconButton>
                <IconButton
                  aria-label={t`Move ${file.name} down`}
                  size="sm"
                  variant="plain"
                  color="neutral"
                  disabled={index === files.length - 1 || disabled}
                  onClick={(e) => { e.stopPropagation(); moveFile(index, 1); }}
                  sx={{ minWidth: 28, minHeight: 28 }}
                >
                  <KeyboardArrowDownIcon sx={{ fontSize: 18 }} />
                </IconButton>
                <IconButton
                  aria-label={t`Remove ${file.name}`}
                  size="sm"
                  variant="plain"
                  color="danger"
                  disabled={disabled}
                  onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                  sx={{ minWidth: 28, minHeight: 28 }}
                >
                  <DeleteOutlineIcon sx={{ fontSize: 18 }} />
                </IconButton>
              </Box>
            </Box>
          ))}
          <Typography level="body-xs" sx={{ color: 'text.tertiary', mt: 0.5 }}>
            {t`${files.length} file(s) selected`}
          </Typography>
        </Box>
      )}

      {previewIndex !== null && previewUrl && (
        <Box
          role="dialog"
          aria-modal="true"
          aria-label={previewFile ? t`Preview ${previewFile.name}` : t`File preview`}
          tabIndex={-1}
          onClick={() => setPreviewIndex(null)}
          sx={{
            position: 'fixed',
            inset: 0,
            zIndex: 1300,
            bgcolor: 'rgba(0, 0, 0, 0.85)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2,
            py: 1.5,
            flexShrink: 0,
          }}>
            <Typography level="body-sm" sx={{ color: 'common.white', fontWeight: 500 }} noWrap>
              {previewFile?.name}
            </Typography>
            <IconButton
              aria-label={t`Close preview`}
              size="sm"
              variant="plain"
              onClick={() => setPreviewIndex(null)}
              sx={{ color: 'common.white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
          <Box
            onClick={(e) => e.stopPropagation()}
            sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'auto', p: 2 }}
          >
            {isPdf ? (
              <Box
                component="iframe"
                src={previewUrl}
                sx={{ width: '100%', height: '100%', border: 'none', borderRadius: 'md', bgcolor: 'white' }}
              />
            ) : (
              <Box
                component="img"
                src={previewUrl}
                alt={previewFile?.name}
                sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 'md' }}
              />
            )}
          </Box>
        </Box>
      )}
    </Box>
  );
}
