import { useState, useCallback } from 'react';
import { Box, Typography, Button, FormControl, FormLabel, Select, Option, Input, Checkbox } from '@mui/joy';
import MultiFileDropZone from '../components/MultiFileDropZone';
import ConversionProgress from '../components/ConversionProgress';
import SEO, { buildToolSchema } from '../components/SEO';
import { useArchiveConversion } from '../hooks/useArchiveConversion';
import ToolDisclaimer from '../components/ToolDisclaimer';
import ToolSEOContent from '../components/ToolSEOContent';
import FolderZipOutlinedIcon from '@mui/icons-material/FolderZipOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import CloudUploadOutlinedIcon from '@mui/icons-material/CloudUploadOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import { Trans, useLingui } from '@lingui/react/macro';

const ARCHIVE_FORMATS = [
  { value: 'zip', label: 'ZIP', supportsEncryption: true },
  { value: '7z', label: '7z', supportsEncryption: true },
  { value: 'tar.gz', label: 'tar.gz (gzip)', supportsEncryption: false },
  { value: 'tar.zst', label: 'tar.zst (zstandard)', supportsEncryption: false },
];

export default function ArchivePage() {
  const { t } = useLingui();
  const [files, setFiles] = useState<File[]>([]);
  const [format, setFormat] = useState<string>('zip');
  const [encrypt, setEncrypt] = useState(false);
  const [password, setPassword] = useState('');

  const conversion = useArchiveConversion('/archive/create');

  const formatInfo = ARCHIVE_FORMATS.find((f) => f.value === format);
  const showEncryptOption = formatInfo?.supportsEncryption ?? false;
  const needsPassword = showEncryptOption && encrypt;
  const canSubmit = files.length >= 1 && (!needsPassword || password.length > 0);

  const handleCreate = useCallback(() => {
    if (!canSubmit) return;
    conversion.startConversion(files, format, needsPassword ? password : undefined);
  }, [files, format, password, needsPassword, canSubmit, conversion]);

  const handleDownload = useCallback(() => {
    conversion.download();
    setFiles([]);
  }, [conversion]);

  const handleRetry = useCallback(() => {
    conversion.reset();
    setFiles([]);
  }, [conversion]);

  const handleFormatChange = useCallback((_: unknown, val: string | null) => {
    if (!val) return;
    setFormat(val);
    const info = ARCHIVE_FORMATS.find((f) => f.value === val);
    if (!info?.supportsEncryption) {
      setEncrypt(false);
      setPassword('');
    }
  }, []);

  return (
    <Box sx={{ maxWidth: 520, mx: 'auto', width: '100%', py: { xs: 3, md: 4 } }}>
      <SEO
        title={t`Compress & Encrypt`}
        description={t`Compress files into ZIP, 7z, tar.gz, or tar.zst archives. Optional AES-256 encryption for ZIP and 7z. Free, no signup.`}
        path="/archive/create"
        structuredData={buildToolSchema(t`Compress & Encrypt`, t`Compress files into ZIP, 7z, tar.gz, or tar.zst archives. Optional AES-256 encryption for ZIP and 7z. Free, no signup.`, '/archive/create')}
      />
      <Typography component="h1" level="h3" sx={{ mb: 1, fontWeight: 700, letterSpacing: '-0.02em' }}><Trans>Compress & Encrypt</Trans></Typography>
      <Typography level="body-sm" sx={{ color: 'text.tertiary', mb: 4 }}><Trans>Create compressed or encrypted archives</Trans></Typography>

      <ToolDisclaimer toolId="archive" />

      {conversion.status === 'idle' ? (
        <>
          <Box
            sx={{
              p: 2.5,
              mb: 3,
              borderRadius: 'lg',
              bgcolor: 'background.surface',
              border: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <FormControl>
              <FormLabel><Trans>Archive format</Trans></FormLabel>
              <Select
                value={format}
                onChange={handleFormatChange}
                size="sm"
              >
                {ARCHIVE_FORMATS.map((f) => (
                  <Option key={f.value} value={f.value}>{f.label}</Option>
                ))}
              </Select>
            </FormControl>

            {showEncryptOption && (
              <Checkbox
                label={t`Encrypt with password (AES-256)`}
                checked={encrypt}
                onChange={(e) => {
                  setEncrypt(e.target.checked);
                  if (!e.target.checked) setPassword('');
                }}
                size="sm"
                sx={{ color: 'text.secondary' }}
              />
            )}

            {needsPassword && (
              <FormControl>
                <FormLabel><Trans>Password</Trans></FormLabel>
                <Input
                  type="password"
                  placeholder={t`Enter encryption password`}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  size="sm"
                  color={password.length > 0 && password.length < 4 ? 'warning' : undefined}
                />
              </FormControl>
            )}
          </Box>

          <MultiFileDropZone
            files={files}
            onFilesChange={setFiles}
            accept="*"
            maxSize={35 * 1024 * 1024}
            maxFiles={3}
          />

          {canSubmit && (
            <Button
              size="lg"
              onClick={handleCreate}
              sx={{ mt: 3, width: '100%' }}
            >
              Create {formatInfo?.label} archive ({files.length} {files.length === 1 ? 'file' : 'files'})
            </Button>
          )}
        </>
      ) : (
        <Box>
          <Typography level="body-sm" sx={{ color: 'text.tertiary', mb: 2 }}>
            Creating archive from {files.length} {files.length === 1 ? 'file' : 'files'}
          </Typography>
          <ConversionProgress
            status={conversion.status}
            position={conversion.position}
            error={conversion.error}
            inputSize={null}
            outputSize={conversion.outputSize}
            previewUrl={null}
            onDownload={handleDownload}
            onRetry={handleRetry}
          />
        </Box>
      )}
      <ToolSEOContent
        howTo={{
          title: t`How to create a compressed archive online`,
          steps: [
            t`Choose an archive format — ZIP, 7z, tar.gz, or tar.zst.`,
            t`Optionally enable AES-256 encryption and set a password (ZIP and 7z only).`,
            t`Add up to 3 files (max 35 MB each).`,
            t`Click "Create archive" and download the result.`,
          ],
        }}
        features={[
          { icon: <FolderZipOutlinedIcon />, title: t`Four Archive Formats`, description: t`Create ZIP, 7z, tar.gz (gzip), or tar.zst (Zstandard) archives depending on your needs.` },
          { icon: <LockOutlinedIcon />, title: t`AES-256 Encryption`, description: t`Protect ZIP and 7z archives with strong AES-256 password encryption.` },
          { icon: <TuneOutlinedIcon />, title: t`Flexible Options`, description: t`Pick the format that fits your use case — maximum compatibility (ZIP) or best compression (7z, zst).` },
          { icon: <CloudUploadOutlinedIcon />, title: t`Multi-File Support`, description: t`Bundle up to 3 files into a single archive in one step.` },
          { icon: <BoltOutlinedIcon />, title: t`Fast Processing`, description: t`Archives are created server-side in seconds, even for larger files.` },
          { icon: <SecurityOutlinedIcon />, title: t`Privacy First`, description: t`Files are processed in isolated memory and deleted immediately after download.` },
        ]}
        faq={[
          { question: t`What archive formats are available?`, answer: t`You can create ZIP, 7z, tar.gz (gzip compressed), and tar.zst (Zstandard compressed) archives.` },
          { question: t`Which formats support encryption?`, answer: t`ZIP and 7z support AES-256 password encryption. Tar-based formats (tar.gz, tar.zst) do not support built-in encryption.` },
          { question: t`What is the file size limit?`, answer: t`Each file can be up to 35 MB, and you can add up to 3 files per archive.` },
          { question: t`Which format has the best compression?`, answer: t`7z and tar.zst generally offer the best compression ratios. ZIP offers the widest compatibility across operating systems.` },
          { question: t`Are my files stored on the server?`, answer: t`No. Files are processed in memory and deleted immediately after the archive is downloaded.` },
        ]}
        relatedTools={[
          { label: t`Decompress Archive`, href: '/archive/decompress' },
          { label: t`PDF Compress`, href: '/compress/pdf' },
          { label: t`Password Generator`, href: '/generate/password' },
          { label: t`Certificate Inspector`, href: '/inspect/certificate' },
        ]}
      />
    </Box>
  );
}
