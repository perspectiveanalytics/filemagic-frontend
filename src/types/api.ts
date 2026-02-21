export interface SubmitResponse {
  jobId: string;
  position: number;
  estimatedWait: number;
}

export interface JobStatusResponse {
  jobId: string;
  status: 'queued' | 'processing' | 'done' | 'error';
  position: number;
  downloadUrl?: string;
  error?: string;
  inputSize?: number;
  outputSize?: number;
  metadata?: Record<string, unknown>;
}

export interface ApiError {
  error: string;
  code: 'VALIDATION_ERROR' | 'QUEUE_FULL' | 'FILE_TOO_LARGE' | 'CONVERSION_FAILED' | 'RATE_LIMITED' | 'NOT_FOUND' | 'INTERNAL_ERROR';
}

export interface ImageConvertOptions {
  outputFormat: 'jpg' | 'png' | 'webp' | 'tiff' | 'ico' | 'pdf';
  rotation?: 90 | 180 | 270;
  cropX?: number;
  cropY?: number;
  cropWidth?: number;
  cropHeight?: number;
  resizeWidth?: number;
  resizeHeight?: number;
}

export interface AudioExtractOptions {
  outputFormat: 'mp3' | 'wav' | 'flac' | 'aac';
}

export interface AudioConvertOptions {
  outputFormat: 'mp3' | 'wav' | 'flac' | 'aac';
}

export interface PDFCompressOptions {
  level?: 'low' | 'medium' | 'high';
  lossy?: boolean;
  targetSize?: number;
}

export interface ImageCompressOptions {
  quality?: number;
  targetSize?: number;
  maxWidth?: number;
  maxHeight?: number;
  cropX?: number;
  cropY?: number;
  cropWidth?: number;
  cropHeight?: number;
  resizeWidth?: number;
  resizeHeight?: number;
}

export interface OCROptions {
  languages: string[];
}

export type MetadataRemoveOptions = Record<string, never>;

export type PDFMergeOptions = Record<string, never>;

export type ImageToPDFOptions = Record<string, never>;

export interface PDFSplitOptions {
  pageList: string;
}

export interface QRCodeOptions {
  size?: number;
}

export interface CertConvertOptions {
  targetFormat: 'pem' | 'der' | 'p12' | 'p7b';
  password?: string;
  outputPassword?: string;
}

export interface ArchiveOptions {
  format: 'zip' | '7z' | 'tar.gz' | 'tar.zst';
  password?: string;
}

export interface VideoCompressOptions {
  mode: 'quality' | 'targetSize';
  quality?: 'low' | 'medium' | 'high';
  targetSize?: number;
}

export interface VideoToGifOptions {
  startTime: number;
  duration: number;
  fps: number;
  maxWidth: number;
  speed?: number;
}

export interface PdfPasswordOptions {
  mode: 'protect' | 'remove';
  userPassword?: string;
  ownerPassword?: string;
  password?: string;
}

export interface PdfRotateOptions {
  pages?: number[];
  rotations?: Record<string, number>;
}

export interface FontConvertOptions {
  targetFormat: 'ttf' | 'otf' | 'woff' | 'woff2';
}

export interface EbookConvertOptions {
  targetFormat: 'epub' | 'mobi' | 'azw3' | 'txt' | 'fb2' | 'docx' | 'htmlz';
}

export interface PdfRepairOptions {
  [key: string]: never;
}

export interface FileManifestEntry {
  name: string;
  size: number;
  index: number;
  type?: string;
}

export type ConversionOptions = ImageConvertOptions | PDFCompressOptions | PDFSplitOptions | ImageCompressOptions | OCROptions | MetadataRemoveOptions | PDFMergeOptions | ImageToPDFOptions | QRCodeOptions | CertConvertOptions | ArchiveOptions | AudioExtractOptions | AudioConvertOptions | VideoCompressOptions | VideoToGifOptions | PdfPasswordOptions | PdfRotateOptions | FontConvertOptions | EbookConvertOptions | PdfRepairOptions;

export type ConversionStatus = 'idle' | 'uploading' | 'queued' | 'processing' | 'done' | 'error';

// Certificate Inspector types
export interface SubjectInfo {
  commonName?: string;
  organization?: string[];
  organizationalUnit?: string[];
  country?: string[];
  province?: string[];
  locality?: string[];
}

export interface CertFingerprints {
  sha256: string;
  sha1: string;
}

export interface CertSummary {
  subject: SubjectInfo;
  issuer: SubjectInfo;
  serialNumber: string;
  notBefore: string;
  notAfter: string;
  isExpired: boolean;
  isCA: boolean;
}

export interface CertificateInfo {
  subject: SubjectInfo;
  issuer: SubjectInfo;
  serialNumber: string;
  notBefore: string;
  notAfter: string;
  isExpired: boolean;
  signatureAlgorithm: string;
  publicKeyAlgorithm: string;
  keySize: number;
  sans?: string[];
  isCA: boolean;
  isSelfSigned: boolean;
  isTrusted: boolean;
  keyUsage?: string[];
  extKeyUsage?: string[];
  fingerprints: CertFingerprints;
  format: string;
  certCount: number;
  chain?: CertSummary[];
}
