import { Box, Typography } from '@mui/joy';
import { Trans } from '@lingui/react/macro';

const credits = [
  { name: 'Cloudflare', url: 'https://cloudflare.com' },
  { name: 'FFmpeg', url: 'https://ffmpeg.org' },
  { name: 'libvips', url: 'https://www.libvips.org' },
  { name: 'ImageMagick', url: 'https://imagemagick.org' },
  { name: 'Ghostscript', url: 'https://ghostscript.com' },
  { name: 'Tesseract', url: 'https://github.com/tesseract-ocr/tesseract' },
  { name: 'Pandoc', url: 'https://pandoc.org' },
  { name: 'ExifTool', url: 'https://exiftool.org' },
  { name: 'OpenSSL', url: 'https://openssl.org' },
  { name: 'Claude', url: 'https://claude.ai' },
  { name: 'QPDF', url: 'https://qpdf.sourceforge.io' },
  { name: 'Calibre', url: 'https://calibre-ebook.com' },
  { name: '7-Zip', url: 'https://7-zip.org' },
  { name: 'nsjail', url: 'https://nsjail.dev' },
];

export default function CreditsBanner({ position = 'top' }: { position?: 'top' | 'bottom' }) {
  return (
    <Box
      sx={{
        display: position === 'top'
          ? { xs: 'none', md: 'flex' }
          : { xs: 'flex', md: 'none' },
        alignItems: 'center',
        justifyContent: 'center',
        gap: 0.5,
        px: 2,
        py: position === 'bottom' ? 1.5 : 0.5,
        bgcolor: 'background.level1',
        ...(position === 'top'
          ? { borderBottom: '1px solid', borderColor: 'divider' }
          : { borderTop: '1px solid', borderColor: 'divider' }),
        minHeight: 28,
        flexWrap: 'wrap',
      }}
    >
      <Typography
        level="body-xs"
        sx={{ color: 'text.tertiary', fontSize: '0.675rem', letterSpacing: '0.01em' }}
      >
        <Trans>Special thanks to</Trans>
      </Typography>
      {credits.map((c, i) => (
        <Box key={c.name} sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
          <Typography
            component="a"
            href={c.url}
            target="_blank"
            rel="noopener noreferrer"
            level="body-xs"
            sx={{
              color: 'text.secondary',
              fontSize: '0.675rem',
              fontWeight: 500,
              textDecoration: 'none',
              transition: 'color 0.15s ease',
              '&:hover': { color: 'primary.plainColor' },
            }}
          >
            {c.name}
          </Typography>
          {i < credits.length - 1 && (
            <Typography level="body-xs" sx={{ color: 'text.tertiary', fontSize: '0.6rem', userSelect: 'none' }}>
              ·
            </Typography>
          )}
        </Box>
      ))}
    </Box>
  );
}
