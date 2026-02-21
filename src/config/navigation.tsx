import type { ReactElement } from 'react';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';
import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import PhotoSizeSelectLargeOutlinedIcon from '@mui/icons-material/PhotoSizeSelectLargeOutlined';
import DocumentScannerOutlinedIcon from '@mui/icons-material/DocumentScannerOutlined';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import MergeOutlinedIcon from '@mui/icons-material/MergeOutlined';
import CollectionsOutlinedIcon from '@mui/icons-material/CollectionsOutlined';

import QrCode2OutlinedIcon from '@mui/icons-material/QrCode2Outlined';
import FindInPageOutlinedIcon from '@mui/icons-material/FindInPageOutlined';
import SyncAltOutlinedIcon from '@mui/icons-material/SyncAltOutlined';
import FolderZipOutlinedIcon from '@mui/icons-material/FolderZipOutlined';
import KeyOutlinedIcon from '@mui/icons-material/KeyOutlined';
import DataObjectOutlinedIcon from '@mui/icons-material/DataObjectOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import MusicNoteOutlinedIcon from '@mui/icons-material/MusicNoteOutlined';
import GraphicEqOutlinedIcon from '@mui/icons-material/GraphicEqOutlined';
import TextFieldsOutlinedIcon from '@mui/icons-material/TextFieldsOutlined';
import TableChartOutlinedIcon from '@mui/icons-material/TableChartOutlined';
import CodeOutlinedIcon from '@mui/icons-material/CodeOutlined';
import VideoFileOutlinedIcon from '@mui/icons-material/VideoFileOutlined';
import GifBoxOutlinedIcon from '@mui/icons-material/GifBoxOutlined';
import MovieFilterOutlinedIcon from '@mui/icons-material/MovieFilterOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import EditNoteOutlinedIcon from '@mui/icons-material/EditNoteOutlined';
import ImageSearchOutlinedIcon from '@mui/icons-material/ImageSearchOutlined';

import UnarchiveOutlinedIcon from '@mui/icons-material/UnarchiveOutlined';
import GridOnOutlinedIcon from '@mui/icons-material/GridOnOutlined';
import TerminalOutlinedIcon from '@mui/icons-material/TerminalOutlined';
import TagOutlinedIcon from '@mui/icons-material/TagOutlined';
import FontDownloadOutlinedIcon from '@mui/icons-material/FontDownloadOutlined';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import MenuBookOutlinedIcon from '@mui/icons-material/MenuBookOutlined';

export interface NavItem {
  path: string;
  label: string;
  icon: ReactElement;
  keywords: string;
}

export interface NavCategory {
  id: string;
  label: string;
  items: NavItem[];
}

export const homeItem: NavItem = {
  path: '/',
  label: 'Home',
  icon: <HomeOutlinedIcon fontSize="small" />,
  keywords: '',
};

// --- Shared items that appear in multiple categories ---

const imagesToPdf: NavItem = {
  path: '/merge/image-to-pdf',
  label: 'Images to PDF',
  icon: <CollectionsOutlinedIcon fontSize="small" />,
  keywords: 'combine photos pictures document',
};

// --- Categories ---

export const categories: NavCategory[] = [
  {
    id: 'image',
    label: 'Image',
    items: [
      { path: '/convert/image', label: 'Image Tools', icon: <SwapHorizOutlinedIcon fontSize="small" />, keywords: 'jpg png webp bmp tiff ico favicon svg vector raster format transform convert crop resize aspect ratio dimensions' },
      { path: '/convert/heic', label: 'HEIC Convert', icon: <PhotoCameraOutlinedIcon fontSize="small" />, keywords: 'heif iphone apple photo' },
      { path: '/compress/image', label: 'Image Compress', icon: <PhotoSizeSelectLargeOutlinedIcon fontSize="small" />, keywords: 'jpg png resize quality reduce shrink crop aspect ratio dimensions' },
      { path: '/ocr', label: 'OCR', icon: <DocumentScannerOutlinedIcon fontSize="small" />, keywords: 'text extract scan read recognize' },
      { path: '/metadata/remove', label: 'Metadata', icon: <VisibilityOffOutlinedIcon fontSize="small" />, keywords: 'exif gps strip privacy location inspect remove' },
      imagesToPdf,
    ],
  },
  {
    id: 'pdf',
    label: 'PDF',
    items: [
      { path: '/compress/pdf', label: 'PDF Compress', icon: <PictureAsPdfOutlinedIcon fontSize="small" />, keywords: 'reduce shrink smaller size optimize' },
      { path: '/edit/pdf', label: 'PDF Editor', icon: <EditNoteOutlinedIcon fontSize="small" />, keywords: 'pdf edit rotate reorder delete split extract watermark stamp page numbers redact redaction' },
      { path: '/merge/pdf', label: 'Merge PDFs', icon: <MergeOutlinedIcon fontSize="small" />, keywords: 'combine join concatenate images photos jpg png' },
      { path: '/convert/markdown-pdf', label: 'Markdown to PDF', icon: <DescriptionOutlinedIcon fontSize="small" />, keywords: 'md markdown convert document' },
      { path: '/convert/pdf-password', label: 'PDF Password', icon: <LockOutlinedIcon fontSize="small" />, keywords: 'pdf password protect encrypt decrypt remove lock unlock' },
      { path: '/convert/pdf-extract-images', label: 'Extract Images', icon: <ImageSearchOutlinedIcon fontSize="small" />, keywords: 'pdf images extract pictures photos' },
      { path: '/repair/pdf', label: 'PDF Repair', icon: <BuildOutlinedIcon fontSize="small" />, keywords: 'pdf repair fix broken corrupted recover' },
    ],
  },
  {
    id: 'audio-video',
    label: 'Audio / Video',
    items: [
      { path: '/convert/audio-extract', label: 'Extract Audio', icon: <MusicNoteOutlinedIcon fontSize="small" />, keywords: 'video mp4 mkv avi mov audio extract mp3 wav flac' },
      { path: '/convert/audio', label: 'Audio Convert', icon: <GraphicEqOutlinedIcon fontSize="small" />, keywords: 'mp3 wav flac m4a aac audio convert format' },
      { path: '/compress/video', label: 'Video Compress', icon: <VideoFileOutlinedIcon fontSize="small" />, keywords: 'mp4 mkv avi mov video compress reduce size quality' },
      { path: '/convert/mov-to-mp4', label: 'MOV to MP4', icon: <MovieFilterOutlinedIcon fontSize="small" />, keywords: 'mov mp4 quicktime apple convert' },
      { path: '/convert/video-to-gif', label: 'Video to GIF', icon: <GifBoxOutlinedIcon fontSize="small" />, keywords: 'video gif animated clip convert trim' },
    ],
  },
  {
    id: 'security',
    label: 'Security',
    items: [
      { path: '/inspect/certificate', label: 'Cert Inspector', icon: <FindInPageOutlinedIcon fontSize="small" />, keywords: 'certificate ssl tls x509 pem der p12 pfx inspect view details' },
      { path: '/convert/certificate', label: 'Cert Convert', icon: <SyncAltOutlinedIcon fontSize="small" />, keywords: 'certificate ssl tls pem der p12 pfx p7b convert format' },
      { path: '/archive/create', label: 'Encrypt & Compress', icon: <FolderZipOutlinedIcon fontSize="small" />, keywords: 'zip 7z tar gz zst encrypt compress archive password' },
      { path: '/archive/decompress', label: 'Decompress', icon: <UnarchiveOutlinedIcon fontSize="small" />, keywords: 'unzip extract rar 7z tar gz decompress unarchive' },
      { path: '/generate/password', label: 'Password', icon: <KeyOutlinedIcon fontSize="small" />, keywords: 'password generator random secure qwerty azerty' },
    ],
  },
  {
    id: 'utilities',
    label: 'Utilities',
    items: [
      { path: '/generate/qrcode', label: 'QR Code', icon: <QrCode2OutlinedIcon fontSize="small" />, keywords: 'qr barcode link url generate' },
      { path: '/convert/yaml', label: 'YAML / JSON', icon: <DataObjectOutlinedIcon fontSize="small" />, keywords: 'yaml json convert format validate tree coercion' },
      { path: '/tools/word-counter', label: 'Word Counter', icon: <TextFieldsOutlinedIcon fontSize="small" />, keywords: 'count words characters sentences paragraphs reading time' },
      { path: '/convert/json-csv', label: 'JSON / CSV', icon: <TableChartOutlinedIcon fontSize="small" />, keywords: 'json csv convert table data spreadsheet' },
      { path: '/tools/base64', label: 'Base64', icon: <CodeOutlinedIcon fontSize="small" />, keywords: 'base64 encode decode binary text' },
      { path: '/convert/csv-excel', label: 'CSV / Excel', icon: <GridOnOutlinedIcon fontSize="small" />, keywords: 'csv excel xlsx spreadsheet convert table' },
      { path: '/convert/ascii', label: 'ASCII Art', icon: <TerminalOutlinedIcon fontSize="small" />, keywords: 'ascii art text image convert monochrome color character' },
      { path: '/tools/hash', label: 'Hash Generator', icon: <TagOutlinedIcon fontSize="small" />, keywords: 'hash checksum md5 sha1 sha256 sha512 digest verify' },
      { path: '/convert/font', label: 'Font Convert', icon: <FontDownloadOutlinedIcon fontSize="small" />, keywords: 'font ttf otf woff woff2 convert web typography' },
      { path: '/convert/ebook', label: 'Ebook Convert', icon: <MenuBookOutlinedIcon fontSize="small" />, keywords: 'ebook epub mobi azw3 kindle pdf fb2 convert' },
    ],
  },
];

// Flat deduplicated list for search filtering
export const allItems: NavItem[] = (() => {
  const seen = new Set<string>();
  const items: NavItem[] = [homeItem];
  for (const cat of categories) {
    for (const item of cat.items) {
      if (!seen.has(item.path)) {
        seen.add(item.path);
        items.push(item);
      }
    }
  }
  return items;
})();
