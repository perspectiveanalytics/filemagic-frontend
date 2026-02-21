import { Box, CircularProgress, Typography } from '@mui/joy';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import ZoomInRoundedIcon from '@mui/icons-material/ZoomInRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
import FolderZipRoundedIcon from '@mui/icons-material/FolderZipRounded';
import InsertDriveFileRoundedIcon from '@mui/icons-material/InsertDriveFileRounded';
import type { ConversionStatus, FileManifestEntry } from '../types/api';
import { actionBtnBase } from '../styles/buttons';

interface MultiFileResultProps {
  status: ConversionStatus;
  position: number;
  error: string | null;
  files: FileManifestEntry[];
  zipDownloadUrl: string | null;
  getFileUrl: (index: number) => string;
  onRetry: () => void;
  renderThumbnail?: (file: FileManifestEntry, url: string) => React.ReactNode;
  onFilePreview?: (file: FileManifestEntry, url: string) => void;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function MultiFileResult({
  status,
  position,
  error,
  files,
  zipDownloadUrl,
  getFileUrl,
  onRetry,
  renderThumbnail,
  onFilePreview,
}: MultiFileResultProps) {
  if (status === 'idle') {
    return null;
  }

  return (
    <Box
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
            {status === 'uploading' && 'Uploading...'}
            {status === 'queued' && `Queue position: ${position}`}
            {status === 'processing' && 'Processing...'}
          </Typography>
        </>
      )}

      {status === 'done' && (
        <>
          <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
            {files.length} file{files.length !== 1 ? 's' : ''} ready
          </Typography>

          <Box
            component="a"
            href={zipDownloadUrl || '#'}
            sx={{
              ...actionBtnBase,
              textDecoration: 'none',
              bgcolor: 'primary.500',
              color: 'white',
              minWidth: 200,
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
            <FolderZipRoundedIcon sx={{ fontSize: 18 }} />
            Download All as ZIP
          </Box>

          <Box
            sx={{
              width: '100%',
              maxHeight: 400,
              overflow: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: 0.5,
            }}
          >
            {files.map((file) => {
              const url = getFileUrl(file.index);
              return (
                <Box
                  key={file.index}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    p: 1.5,
                    borderRadius: 'md',
                    bgcolor: 'background.level1',
                    '&:hover': { bgcolor: 'background.level2' },
                  }}
                >
                  {renderThumbnail ? (
                    renderThumbnail(file, url)
                  ) : (
                    <InsertDriveFileRoundedIcon sx={{ fontSize: 20, color: 'text.tertiary', flexShrink: 0 }} />
                  )}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography level="body-sm" noWrap sx={{ fontWeight: 500 }}>
                      {file.name}
                    </Typography>
                    <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
                      {formatBytes(file.size)}
                    </Typography>
                  </Box>
                  {onFilePreview && (
                    <Box
                      component="button"
                      onClick={() => onFilePreview(file, url)}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        p: 0.75,
                        borderRadius: 'sm',
                        color: 'text.secondary',
                        cursor: 'pointer',
                        flexShrink: 0,
                        border: 'none',
                        bgcolor: 'transparent',
                        '&:hover': { color: 'primary.500', bgcolor: 'background.surface' },
                      }}
                    >
                      <ZoomInRoundedIcon sx={{ fontSize: 18 }} />
                    </Box>
                  )}
                  <Box
                    component="a"
                    href={url}
                    download={file.name}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      p: 0.75,
                      borderRadius: 'sm',
                      color: 'text.secondary',
                      cursor: 'pointer',
                      flexShrink: 0,
                      textDecoration: 'none',
                      '&:hover': { color: 'primary.500', bgcolor: 'background.surface' },
                    }}
                  >
                    <DownloadRoundedIcon sx={{ fontSize: 18 }} />
                  </Box>
                </Box>
              );
            })}
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
            New
          </Box>
        </>
      )}

      {status === 'error' && (
        <>
          <ErrorOutlineIcon sx={{ fontSize: 36, color: 'danger.500' }} />
          <Typography level="body-md" sx={{ color: 'danger.500', textAlign: 'center' }}>
            {error || 'Processing failed'}
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
            Try again
          </Box>
        </>
      )}
    </Box>
  );
}
