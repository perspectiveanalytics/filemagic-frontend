import { useState, useCallback } from 'react';
import { Box, Typography, RadioGroup, Radio, Sheet, Input, FormControl, FormLabel } from '@mui/joy';
import FileDropZone from '../components/FileDropZone';
import ConversionProgress from '../components/ConversionProgress';
import SEO, { buildToolSchema } from '../components/SEO';
import { useConversion } from '../hooks/useConversion';
import ToolDisclaimer from '../components/ToolDisclaimer';
import ToolSEOContent from '../components/ToolSEOContent';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import LockOpenOutlinedIcon from '@mui/icons-material/LockOpenOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import { Trans, useLingui } from '@lingui/react/macro';

type PasswordMode = 'protect' | 'remove';

export default function PdfPasswordPage() {
  const { t } = useLingui();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mode, setMode] = useState<PasswordMode>('protect');
  const [userPassword, setUserPassword] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');
  const [removePassword, setRemovePassword] = useState('');

  const conversion = useConversion('/convert/pdf/password');

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    const options = mode === 'protect'
      ? { mode: 'protect' as const, userPassword, ownerPassword: ownerPassword || undefined }
      : { mode: 'remove' as const, password: removePassword };
    conversion.startConversion(file, options);
  }, [mode, userPassword, ownerPassword, removePassword, conversion]);

  const handleRetry = useCallback(() => {
    conversion.reset();
    setSelectedFile(null);
  }, [conversion]);

  const isProcessing = ['uploading', 'queued', 'processing'].includes(conversion.status);
  const canSubmit = mode === 'protect' ? userPassword.length > 0 : removePassword.length > 0;

  return (
    <Box sx={{ maxWidth: 520, mx: 'auto', width: '100%', py: { xs: 3, md: 4 } }}>
      <SEO title={t`PDF Password`} description={t`Add or remove PDF password protection for free.`} path="/convert/pdf-password" structuredData={buildToolSchema(t`PDF Password`, t`Protect or unlock PDF files.`, '/convert/pdf-password')} />
      <Typography component="h1" level="h3" sx={{ mb: 1, fontWeight: 700, letterSpacing: '-0.02em' }}><Trans>PDF Password</Trans></Typography>
      <Typography level="body-sm" sx={{ color: 'text.tertiary', mb: 4 }}><Trans>Protect with password or remove password protection</Trans></Typography>

      <ToolDisclaimer toolId="pdf-password" />

      <FormControl sx={{ mb: 3 }}>
        <FormLabel><Trans>Mode</Trans></FormLabel>
        <RadioGroup
          orientation="horizontal"
          value={mode}
          onChange={(e) => setMode(e.target.value as PasswordMode)}
          sx={{ gap: 1.5 }}
        >
          <Sheet variant="outlined" sx={{ px: 2, py: 1, borderRadius: 'md' }}>
            <Radio value="protect" label={t`Protect`} overlay disabled={isProcessing} />
          </Sheet>
          <Sheet variant="outlined" sx={{ px: 2, py: 1, borderRadius: 'md' }}>
            <Radio value="remove" label={t`Remove password`} overlay disabled={isProcessing} />
          </Sheet>
        </RadioGroup>
      </FormControl>

      {mode === 'protect' && (
        <>
          <FormControl sx={{ mb: 2 }}>
            <FormLabel><Trans>User password (required)</Trans></FormLabel>
            <Input
              type="password"
              value={userPassword}
              onChange={(e) => setUserPassword(e.target.value)}
              placeholder={t`Password to open PDF`}
              disabled={isProcessing}
            />
          </FormControl>
          <FormControl sx={{ mb: 3 }}>
            <FormLabel><Trans>Owner password (optional)</Trans></FormLabel>
            <Input
              type="password"
              value={ownerPassword}
              onChange={(e) => setOwnerPassword(e.target.value)}
              placeholder={t`Defaults to user password`}
              disabled={isProcessing}
            />
          </FormControl>
        </>
      )}

      {mode === 'remove' && (
        <FormControl sx={{ mb: 3 }}>
          <FormLabel><Trans>Current password</Trans></FormLabel>
          <Input
            type="password"
            value={removePassword}
            onChange={(e) => setRemovePassword(e.target.value)}
            placeholder={t`Password to unlock the PDF`}
            disabled={isProcessing}
          />
        </FormControl>
      )}

      {conversion.status === 'idle' ? (
        canSubmit ? (
          <FileDropZone
            onFileSelect={handleFileSelect}
            accept=".pdf,application/pdf"
            maxSize={30 * 1024 * 1024}
          />
        ) : (
          <Box sx={{ p: 4, borderRadius: 'lg', border: '1px dashed', borderColor: 'divider', textAlign: 'center' }}>
            <Typography level="body-sm" sx={{ color: 'text.tertiary' }}><Trans>Enter a password above, then drop a PDF here</Trans></Typography>
          </Box>
        )
      ) : (
        <Box>
          {selectedFile && (
            <Typography level="body-sm" sx={{ color: 'text.tertiary', mb: 2 }}>
              {selectedFile.name}
            </Typography>
          )}
          <ConversionProgress
            status={conversion.status}
            position={conversion.position}
            error={conversion.error}
            inputSize={conversion.inputSize}
            outputSize={conversion.outputSize}
            previewUrl={conversion.previewUrl}
            onDownload={conversion.download}
            onRetry={handleRetry}
            showSizeComparison={false}
          />
        </Box>
      )}
      <ToolSEOContent
        howTo={{
          title: t`How to add or remove a PDF password`,
          steps: [
            t`Choose "Protect" to add a password or "Remove password" to unlock a PDF.`,
            t`Enter the required password (a new password for protection, or the current password for removal).`,
            t`Upload your PDF file (up to 30 MB).`,
            t`Download the password-protected or unlocked PDF instantly.`,
          ],
        }}
        features={[
          { icon: <LockOutlinedIcon />, title: t`Password Protection`, description: t`Encrypt your PDF with a user password so only authorized people can open it.` },
          { icon: <LockOpenOutlinedIcon />, title: t`Remove Password`, description: t`Unlock a password-protected PDF by providing the current password.` },
          { icon: <AdminPanelSettingsOutlinedIcon />, title: t`Owner Password`, description: t`Optionally set a separate owner password to control editing and printing permissions.` },
          { icon: <SecurityOutlinedIcon />, title: t`Strong Encryption`, description: t`PDFs are encrypted using industry-standard AES encryption for robust security.` },
          { icon: <BoltOutlinedIcon />, title: t`Instant Processing`, description: t`Password operations complete in seconds, regardless of document size.` },
          { icon: <VerifiedUserOutlinedIcon />, title: t`Privacy First`, description: t`Files and passwords are processed in isolated memory and never stored on disk.` },
        ]}
        faq={[
          { question: t`What is the difference between user and owner passwords?`, answer: t`The user password is required to open the PDF. The owner password (optional) controls permissions like printing and editing. If you only set a user password, it is used for both.` },
          { question: t`Can I remove a password if I forgot it?`, answer: t`No. You must provide the correct current password to unlock the PDF. This tool cannot bypass or crack password protection.` },
          { question: t`What encryption standard is used?`, answer: t`PDFs are protected with AES encryption, the same standard used by governments and financial institutions.` },
          { question: t`Is there a file size limit?`, answer: t`The maximum upload size is 30 MB.` },
          { question: t`Will password protection change my PDF content?`, answer: t`No. The content, formatting, and structure of your PDF remain completely unchanged. Only the encryption layer is added or removed.` },
        ]}
        relatedTools={[
          { label: t`PDF Compress`, href: '/compress/pdf' },
          { label: t`PDF Editor`, href: '/edit/pdf' },
          { label: t`PDF Merge`, href: '/merge/pdf' },
          { label: t`PDF Repair`, href: '/repair/pdf' },
        ]}
      />
    </Box>
  );
}
