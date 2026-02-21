import { useState, useCallback } from 'react';
import { Box, Typography, Input, FormControl, FormLabel } from '@mui/joy';
import FileDropZone from '../components/FileDropZone';
import MultiFileResult from '../components/MultiFileResult';
import SEO, { buildToolSchema } from '../components/SEO';
import { useMultiFileConversion } from '../hooks/useMultiFileConversion';
import ToolDisclaimer from '../components/ToolDisclaimer';
import ToolSEOContent from '../components/ToolSEOContent';
import FolderZipOutlinedIcon from '@mui/icons-material/FolderZipOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined';
import CloudDownloadOutlinedIcon from '@mui/icons-material/CloudDownloadOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';

export default function DecompressPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');

  const conversion = useMultiFileConversion('/archive/decompress');

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    conversion.startConversion(file, password || undefined);
  }, [password, conversion]);

  const handleRetry = useCallback(() => {
    conversion.reset();
    setSelectedFile(null);
  }, [conversion]);

  const isProcessing = ['uploading', 'queued', 'processing'].includes(conversion.status);

  return (
    <Box sx={{ maxWidth: 520, mx: 'auto', width: '100%', py: { xs: 3, md: 4 } }}>
      <SEO title="Decompress" description="Extract ZIP, RAR, 7Z, TAR archives for free. Supports password-protected archives." path="/archive/decompress" structuredData={buildToolSchema('Decompress Archive', 'Extract archives server-side.', '/archive/decompress')} />
      <Typography component="h1" level="h3" sx={{ mb: 1, fontWeight: 700, letterSpacing: '-0.02em' }}>
        Decompress Archive
      </Typography>
      <Typography level="body-sm" sx={{ color: 'text.tertiary', mb: 4 }}>
        Extract ZIP, RAR, 7Z, TAR.GZ, TAR.BZ2, TAR.XZ, TAR.ZST
      </Typography>

      <ToolDisclaimer toolId="decompress" />

      <FormControl sx={{ mb: 3 }}>
        <FormLabel>Password (optional)</FormLabel>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="For encrypted archives"
          disabled={isProcessing}
        />
      </FormControl>

      {conversion.status === 'idle' ? (
        <FileDropZone
          onFileSelect={handleFileSelect}
          accept=".zip,.rar,.7z,.tar.gz,.tgz,.tar.bz2,.tar.xz,.tar.zst"
          maxSize={50 * 1024 * 1024}
        />
      ) : (
        <Box>
          {selectedFile && (
            <Typography level="body-sm" sx={{ color: 'text.tertiary', mb: 2 }}>
              {selectedFile.name}
            </Typography>
          )}
          <MultiFileResult
            status={conversion.status}
            position={conversion.position}
            error={conversion.error}
            files={conversion.files}
            zipDownloadUrl={conversion.zipDownloadUrl}
            getFileUrl={conversion.getFileUrl}
            onRetry={handleRetry}
          />
        </Box>
      )}
      <ToolSEOContent
        howTo={{
          title: 'How to extract an archive online',
          steps: [
            'If the archive is password-protected, enter the password first.',
            'Upload your archive file (ZIP, RAR, 7Z, TAR.GZ, TAR.BZ2, TAR.XZ, or TAR.ZST). Max 50 MB.',
            'Browse the extracted files and download them individually or as a ZIP.',
          ],
        }}
        features={[
          { icon: <FolderZipOutlinedIcon />, title: 'Wide Format Support', description: 'Extract ZIP, RAR, 7Z, TAR.GZ, TAR.BZ2, TAR.XZ, and TAR.ZST archives.' },
          { icon: <LockOutlinedIcon />, title: 'Password Support', description: 'Decompress password-protected ZIP, RAR, and 7z archives by entering the password before upload.' },
          { icon: <CloudDownloadOutlinedIcon />, title: 'Individual Downloads', description: 'Download extracted files one by one or grab everything as a single ZIP.' },
          { icon: <LanguageOutlinedIcon />, title: 'No Software Needed', description: 'Extract archives directly in your browser — no desktop app or plugin required.' },
          { icon: <BoltOutlinedIcon />, title: 'Fast Extraction', description: 'Server-side processing extracts even large archives in seconds.' },
          { icon: <SecurityOutlinedIcon />, title: 'Privacy First', description: 'Files are processed in isolated memory and deleted immediately after download.' },
        ]}
        faq={[
          { question: 'What archive formats are supported?', answer: 'ZIP, RAR, 7Z, TAR.GZ (.tgz), TAR.BZ2, TAR.XZ, and TAR.ZST are all supported.' },
          { question: 'Can I extract password-protected archives?', answer: 'Yes. Enter the password in the optional password field before uploading the file.' },
          { question: 'What is the file size limit?', answer: 'The maximum upload size is 50 MB.' },
          { question: 'Can I download individual files from the archive?', answer: 'Yes. After extraction you can download files one at a time, or download all extracted files bundled as a single ZIP.' },
          { question: 'Are my files stored on the server?', answer: 'No. All files are processed in memory and deleted immediately after you download them.' },
        ]}
        relatedTools={[
          { label: 'Compress & Encrypt', href: '/archive/create' },
          { label: 'PDF Compress', href: '/compress/pdf' },
          { label: 'Password Generator', href: '/generate/password' },
          { label: 'Font Converter', href: '/convert/font' },
        ]}
      />
    </Box>
  );
}
