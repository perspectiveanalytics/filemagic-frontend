import { useEffect } from 'react';
import { Box, CircularProgress, Typography } from '@mui/joy';
import { useLingui } from '@lingui/react/macro';
import { Trans } from '@lingui/react/macro';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
import type { ConversionStatus } from '../types/api';
import { actionBtnBase } from '../styles/buttons';
import { useThanks } from '../hooks/useThanks';

interface ConversionProgressProps {
  status: ConversionStatus;
  position: number;
  error: string | null;
  inputSize: number | null;
  outputSize: number | null;
  previewUrl: string | null;
  onDownload: () => void;
  onRetry: () => void;
  showSizeComparison?: boolean;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function ConversionProgress({
  status,
  position,
  error,
  inputSize,
  outputSize,
  previewUrl,
  onDownload,
  onRetry,
  showSizeComparison = true,
}: ConversionProgressProps) {
  const { markUploaded } = useThanks();
  const { t } = useLingui();

  useEffect(() => {
    if (status === 'done') {
      markUploaded();
    }
  }, [status, markUploaded]);

  if (status === 'idle') {
    return null;
  }

  const saved = showSizeComparison && inputSize && outputSize && outputSize < inputSize
    ? Math.round((1 - outputSize / inputSize) * 100)
    : null;

  return (
    <Box
      role={status === 'error' ? 'alert' : 'status'}
      aria-live={status === 'error' ? 'assertive' : 'polite'}
      aria-busy={status === 'uploading' || status === 'queued' || status === 'processing'}
      sx={{
        p: 4,
        borderRadius: 'lg',
        bgcolor: 'background.surface',
        border: '1px solid',
        borderColor: status === 'done' ? 'primary.800' : status === 'error' ? 'danger.500' : 'divider',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2.5,
        transition: 'border-color 0.3s ease',
      }}
    >
      {(status === 'uploading' || status === 'queued' || status === 'processing') && (
        <>
          <CircularProgress size="md" thickness={3} color="primary" />
          <Typography level="body-md" sx={{ color: 'text.secondary' }}>
            {status === 'uploading' && t`Uploading...`}
            {status === 'queued' && t`Queue position: ${position}`}
            {status === 'processing' && t`Processing...`}
          </Typography>
        </>
      )}

      {status === 'done' && (
        <>
          {!previewUrl && (
            <Typography level="body-sm" sx={{ color: 'primary.plainColor', fontWeight: 600, letterSpacing: '0.02em' }}>
              <Trans>Ready</Trans>
            </Typography>
          )}

          {previewUrl && (
            <Box
              component="img"
              src={previewUrl}
              alt={t`Result preview`}
              sx={{
                maxWidth: '100%',
                maxHeight: 280,
                borderRadius: 'md',
                objectFit: 'contain',
              }}
            />
          )}

          {showSizeComparison && inputSize && outputSize ? (
            <Box sx={{ textAlign: 'center' }}>
              <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
                {formatBytes(inputSize)} &rarr; {formatBytes(outputSize)}
              </Typography>
              {saved !== null && saved > 0 && (
                <Typography level="body-xs" sx={{ color: 'success.plainColor', mt: 0.5, fontWeight: 600 }}>
                  {t`${saved}% smaller`}
                </Typography>
              )}
              {outputSize >= inputSize && (
                <Typography level="body-xs" sx={{ color: 'text.tertiary', mt: 0.5 }}>
                  <Trans>No size reduction</Trans>
                </Typography>
              )}
            </Box>
          ) : showSizeComparison && outputSize ? (
            <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
              {formatBytes(outputSize)}
            </Typography>
          ) : null}

          <Box sx={{ display: 'flex', gap: 1.5, mt: 0.5 }}>
            <Box
              component="button"
              onClick={onDownload}
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
                '&:active': {
                  transform: 'translateY(0)',
                  boxShadow: 'none',
                },
              }}
            >
              <DownloadRoundedIcon sx={{ fontSize: 18 }} />
              <Trans>Download</Trans>
            </Box>
            <Box
              component="button"
              onClick={onRetry}
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
                '&:active': {
                  transform: 'translateY(0)',
                },
              }}
            >
              <AddRoundedIcon sx={{ fontSize: 18 }} />
              <Trans>New</Trans>
            </Box>
          </Box>

        </>
      )}

      {status === 'error' && (
        <>
          <ErrorOutlineIcon sx={{ fontSize: 36, color: 'danger.500' }} />
          <Typography level="body-md" sx={{ color: 'danger.500', textAlign: 'center' }}>
            {error || t`Processing failed`}
          </Typography>
          <Box
            component="button"
            onClick={onRetry}
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
              '&:active': {
                transform: 'translateY(0)',
              },
            }}
          >
            <ReplayRoundedIcon sx={{ fontSize: 18 }} />
            <Trans>Try again</Trans>
          </Box>
        </>
      )}
    </Box>
  );
}
