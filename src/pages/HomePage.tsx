import { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/joy';
import { Link } from 'react-router-dom';
import { apiClient } from '../api/client';
import SEO from '../components/SEO';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';
import MergeOutlinedIcon from '@mui/icons-material/MergeOutlined';
import PhotoSizeSelectLargeOutlinedIcon from '@mui/icons-material/PhotoSizeSelectLargeOutlined';
import VideoFileOutlinedIcon from '@mui/icons-material/VideoFileOutlined';
import DocumentScannerOutlinedIcon from '@mui/icons-material/DocumentScannerOutlined';
import EditNoteOutlinedIcon from '@mui/icons-material/EditNoteOutlined';
import QrCode2OutlinedIcon from '@mui/icons-material/QrCode2Outlined';
import FolderZipOutlinedIcon from '@mui/icons-material/FolderZipOutlined';
import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined';
import UnarchiveOutlinedIcon from '@mui/icons-material/UnarchiveOutlined';
import MovieFilterOutlinedIcon from '@mui/icons-material/MovieFilterOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import SpeedOutlinedIcon from '@mui/icons-material/SpeedOutlined';
import VolunteerActivismOutlinedIcon from '@mui/icons-material/VolunteerActivismOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import GitHubIcon from '@mui/icons-material/GitHub';

const tools = [
  {
    path: '/compress/pdf',
    title: 'PDF Compress',
    description: 'Shrink PDF file size without losing readability',
    icon: <PictureAsPdfOutlinedIcon />,
  },
  {
    path: '/edit/pdf',
    title: 'PDF Editor',
    description: 'Rotate, reorder, delete, split, watermark and redact pages',
    icon: <EditNoteOutlinedIcon />,
  },
  {
    path: '/convert/image',
    title: 'Image Tools',
    description: 'Convert, crop, resize images. Generate favicons.',
    icon: <SwapHorizOutlinedIcon />,
  },
  {
    path: '/merge/pdf',
    title: 'Merge PDFs',
    description: 'Combine multiple PDF files into one document',
    icon: <MergeOutlinedIcon />,
  },
  {
    path: '/compress/image',
    title: 'Image Compress',
    description: 'Reduce image size with crop, resize and quality control',
    icon: <PhotoSizeSelectLargeOutlinedIcon />,
  },
  {
    path: '/convert/heic',
    title: 'HEIC Convert',
    description: 'Convert iPhone HEIC photos to JPG, PNG or WebP',
    icon: <PhotoCameraOutlinedIcon />,
  },
  {
    path: '/compress/video',
    title: 'Video Compress',
    description: 'Reduce video file size by quality or target size',
    icon: <VideoFileOutlinedIcon />,
  },
  {
    path: '/ocr',
    title: 'OCR',
    description: 'Extract text from images and scanned documents',
    icon: <DocumentScannerOutlinedIcon />,
  },
  {
    path: '/qrcode',
    title: 'QR Code',
    description: 'Generate QR codes for URLs, WiFi, contacts and more',
    icon: <QrCode2OutlinedIcon />,
  },
  {
    path: '/archive/create',
    title: 'Encrypt & Compress',
    description: 'Create password-protected ZIP, 7z or tar archives',
    icon: <FolderZipOutlinedIcon />,
  },
  {
    path: '/archive/decompress',
    title: 'Decompress',
    description: 'Extract ZIP, RAR, 7z, tar and other archive formats',
    icon: <UnarchiveOutlinedIcon />,
  },
  {
    path: '/convert/mov-to-mp4',
    title: 'MOV to MP4',
    description: 'Convert Apple QuickTime videos to universal MP4',
    icon: <MovieFilterOutlinedIcon />,
  },
];

const features = [
  { icon: <VolunteerActivismOutlinedIcon sx={{ fontSize: 18 }} />, text: 'Always free, no account needed', color: 'primary.400' },
  { icon: <LockOutlinedIcon sx={{ fontSize: 18 }} />, text: 'Your files stay yours — never stored', color: 'success.500' },
  { icon: <SpeedOutlinedIcon sx={{ fontSize: 18 }} />, text: 'Instant results, everything in memory', color: 'warning.500' },
];

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'FileMagic',
  url: 'https://filemagic.app',
  applicationCategory: 'UtilitiesApplication',
  operatingSystem: 'Any',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
  description: 'Free, private file conversion tools. Compress PDFs and videos, convert images, extract text with OCR, generate QR codes, and more. No signup, no ads, files never touch disk.',
  featureList: [
    'PDF compression, merging, splitting, page rotation and reordering',
    'Image format conversion (HEIC, SVG, PNG, JPG, WebP, BMP, TIFF)',
    'Image compression, resizing and cropping',
    'Video compression, MOV to MP4, video to GIF',
    'Audio extraction and conversion',
    'OCR text extraction from images and scanned documents',
    'QR code generation for URLs, WiFi, contacts, email and more',
    'Encrypted archive creation (ZIP, 7z, tar.gz, tar.zst)',
    'Archive decompression (ZIP, RAR, 7z, tar)',
    'PDF password protection and removal',
    'SSL/TLS certificate inspection and format conversion',
    'Metadata removal for privacy (EXIF, GPS)',
    'Secure password generation',
    'Markdown to PDF conversion',
    'YAML/JSON and CSV/Excel conversion tools',
  ],
};

function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}k`;
  return n.toLocaleString();
}

export default function HomePage() {
  const [stats, setStats] = useState<{ filesProcessed: number; thanks: number } | null>(null);

  useEffect(() => {
    apiClient.getStats().then(setStats).catch(() => {});
  }, []);

  return (
    <Box sx={{ maxWidth: 640, mx: 'auto', width: '100%', py: { xs: 3, md: 5 } }}>
      <SEO
        title="Free Private File Conversion"
        path="/"
        description="Free, private file conversion tools. Compress PDFs and videos, convert images, generate QR codes, extract text with OCR, and more. No signup required."
        structuredData={structuredData}
      />
      <Box sx={{ mb: 5 }}>
        <Typography
          component="h1"
          level="h2"
          sx={{
            mb: 1.5,
            fontWeight: 700,
            letterSpacing: '-0.03em',
            fontSize: { xs: '1.75rem', md: '2rem' },
          }}
        >
          File tools that just work
        </Typography>
        <Typography level="body-md" sx={{ color: 'text.secondary', lineHeight: 1.8, mb: 3, maxWidth: 480 }}>
          Drop a file, pick a tool, get your result. No accounts to create, no ads, no data collected, no strings attached.
        </Typography>

        {stats && (stats.filesProcessed > 0 || stats.thanks > 0) && (
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 2,
              mb: 3,
              px: 2,
              py: 1,
              borderRadius: 'md',
              bgcolor: 'background.level1',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            {stats.filesProcessed > 0 && (
              <Typography level="body-xs" sx={{ color: 'text.secondary' }}>
                <Typography component="span" sx={{ fontWeight: 700, color: 'text.primary', fontVariantNumeric: 'tabular-nums' }}>
                  {formatCount(stats.filesProcessed)}
                </Typography>
                {' files processed'}
              </Typography>
            )}
            {stats.filesProcessed > 0 && stats.thanks > 0 && (
              <Typography level="body-xs" sx={{ color: 'text.tertiary', userSelect: 'none' }}>·</Typography>
            )}
            {stats.thanks > 0 && (
              <Typography level="body-xs" sx={{ color: 'text.secondary' }}>
                <Typography component="span" sx={{ fontWeight: 700, color: 'text.primary', fontVariantNumeric: 'tabular-nums' }}>
                  {formatCount(stats.thanks)}
                </Typography>
                {' thanks'}
              </Typography>
            )}
          </Box>
        )}

        <Box sx={{ display: 'flex', gap: 2.5, flexWrap: 'wrap' }}>
          {features.map((f) => (
            <Box
              key={f.text}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
              }}
            >
              <Box sx={{ color: f.color, display: 'flex', alignItems: 'center' }}>{f.icon}</Box>
              <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
                {f.text}
              </Typography>
            </Box>
          ))}
        </Box>

        <Box sx={{ display: 'flex', gap: 1.5, mt: 2.5, flexWrap: 'wrap' }}>
          <Box
            component={Link}
            to="/security"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.75,
              px: 1.5,
              py: 0.75,
              borderRadius: 'md',
              textDecoration: 'none',
              color: 'primary.plainColor',
              bgcolor: 'primary.softBg',
              transition: 'all 0.2s ease',
              '&:hover': {
                bgcolor: 'primary.softHoverBg',
                '& .security-arrow': {
                  transform: 'translateX(2px)',
                },
              },
            }}
          >
            <SecurityOutlinedIcon sx={{ fontSize: 15 }} />
            <Typography level="body-xs" sx={{ fontWeight: 600, color: 'inherit' }}>
              See how we protect your files
            </Typography>
            <ArrowForwardIcon className="security-arrow" sx={{ fontSize: 13, transition: 'transform 0.2s ease' }} />
          </Box>
          <Box
            component="a"
            href="https://github.com/perspectiveanalytics/filemagic-backend"
            target="_blank"
            rel="noopener noreferrer"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.75,
              px: 1.5,
              py: 0.75,
              borderRadius: 'md',
              textDecoration: 'none',
              color: 'text.secondary',
              bgcolor: 'background.level1',
              border: '1px solid',
              borderColor: 'divider',
              transition: 'all 0.2s ease',
              '&:hover': {
                borderColor: 'neutral.outlinedHoverBorder',
                color: 'text.primary',
                '& .github-arrow': {
                  transform: 'translateX(2px)',
                },
              },
            }}
          >
            <GitHubIcon sx={{ fontSize: 15 }} />
            <Typography level="body-xs" sx={{ fontWeight: 600, color: 'inherit' }}>
              Open source
            </Typography>
            <ArrowForwardIcon className="github-arrow" sx={{ fontSize: 13, transition: 'transform 0.2s ease' }} />
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
          gap: 2,
        }}
      >
        {tools.map((tool) => (
          <Box
            key={tool.path}
            component={Link}
            to={tool.path}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
              p: 2.5,
              borderRadius: 'lg',
              bgcolor: 'background.surface',
              border: '1px solid',
              borderColor: 'divider',
              textDecoration: 'none',
              color: 'inherit',
              transition: 'all 0.25s ease',
              '&:hover': {
                borderColor: 'primary.800',
                bgcolor: 'background.level1',
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 24px rgba(37, 99, 235, 0.08)',
                '& .tool-arrow': {
                  opacity: 1,
                  transform: 'translateX(3px)',
                },
                '& .tool-icon': {
                  color: 'primary.400',
                },
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box
                className="tool-icon"
                sx={{
                  color: 'text.tertiary',
                  transition: 'color 0.25s ease',
                  display: 'flex',
                }}
              >
                {tool.icon}
              </Box>
              <ArrowForwardIcon
                className="tool-arrow"
                sx={{
                  color: 'primary.400',
                  fontSize: 16,
                  opacity: 0,
                  transition: 'all 0.25s ease',
                }}
              />
            </Box>
            <Box>
              <Typography level="title-sm" sx={{ mb: 0.5, fontWeight: 600 }}>
                {tool.title}
              </Typography>
              <Typography level="body-xs" sx={{ color: 'text.tertiary', lineHeight: 1.5 }}>
                {tool.description}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>

      <Box sx={{ mt: 5, display: 'flex', gap: 1.5 }}>
        <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
          <Link to="/privacy" style={{ color: 'inherit' }}>Privacy</Link>
          {' · '}
          <Link to="/terms" style={{ color: 'inherit' }}>Terms</Link>
          {' · '}
          <Link to="/legal" style={{ color: 'inherit' }}>Legal</Link>
          {' · '}
          <a href="https://github.com/perspectiveanalytics/filemagic-backend" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>GitHub</a>
        </Typography>
      </Box>
    </Box>
  );
}
