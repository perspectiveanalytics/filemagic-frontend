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

type PasswordMode = 'protect' | 'remove';

export default function PdfPasswordPage() {
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
      <SEO title="PDF Password" description="Add or remove PDF password protection for free." path="/convert/pdf-password" structuredData={buildToolSchema('PDF Password', 'Protect or unlock PDF files.', '/convert/pdf-password')} />
      <Typography component="h1" level="h3" sx={{ mb: 1, fontWeight: 700, letterSpacing: '-0.02em' }}>
        PDF Password
      </Typography>
      <Typography level="body-sm" sx={{ color: 'text.tertiary', mb: 4 }}>
        Protect with password or remove password protection
      </Typography>

      <ToolDisclaimer toolId="pdf-password" />

      <FormControl sx={{ mb: 3 }}>
        <FormLabel>Mode</FormLabel>
        <RadioGroup
          orientation="horizontal"
          value={mode}
          onChange={(e) => setMode(e.target.value as PasswordMode)}
          sx={{ gap: 1.5 }}
        >
          <Sheet variant="outlined" sx={{ px: 2, py: 1, borderRadius: 'md' }}>
            <Radio value="protect" label="Protect" overlay disabled={isProcessing} />
          </Sheet>
          <Sheet variant="outlined" sx={{ px: 2, py: 1, borderRadius: 'md' }}>
            <Radio value="remove" label="Remove password" overlay disabled={isProcessing} />
          </Sheet>
        </RadioGroup>
      </FormControl>

      {mode === 'protect' && (
        <>
          <FormControl sx={{ mb: 2 }}>
            <FormLabel>User password (required)</FormLabel>
            <Input
              type="password"
              value={userPassword}
              onChange={(e) => setUserPassword(e.target.value)}
              placeholder="Password to open PDF"
              disabled={isProcessing}
            />
          </FormControl>
          <FormControl sx={{ mb: 3 }}>
            <FormLabel>Owner password (optional)</FormLabel>
            <Input
              type="password"
              value={ownerPassword}
              onChange={(e) => setOwnerPassword(e.target.value)}
              placeholder="Defaults to user password"
              disabled={isProcessing}
            />
          </FormControl>
        </>
      )}

      {mode === 'remove' && (
        <FormControl sx={{ mb: 3 }}>
          <FormLabel>Current password</FormLabel>
          <Input
            type="password"
            value={removePassword}
            onChange={(e) => setRemovePassword(e.target.value)}
            placeholder="Password to unlock the PDF"
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
            <Typography level="body-sm" sx={{ color: 'text.tertiary' }}>
              Enter a password above, then drop a PDF here
            </Typography>
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
          title: 'How to add or remove a PDF password',
          steps: [
            'Choose "Protect" to add a password or "Remove password" to unlock a PDF.',
            'Enter the required password (a new password for protection, or the current password for removal).',
            'Upload your PDF file (up to 30 MB).',
            'Download the password-protected or unlocked PDF instantly.',
          ],
        }}
        features={[
          { icon: <LockOutlinedIcon />, title: 'Password Protection', description: 'Encrypt your PDF with a user password so only authorized people can open it.' },
          { icon: <LockOpenOutlinedIcon />, title: 'Remove Password', description: 'Unlock a password-protected PDF by providing the current password.' },
          { icon: <AdminPanelSettingsOutlinedIcon />, title: 'Owner Password', description: 'Optionally set a separate owner password to control editing and printing permissions.' },
          { icon: <SecurityOutlinedIcon />, title: 'Strong Encryption', description: 'PDFs are encrypted using industry-standard AES encryption for robust security.' },
          { icon: <BoltOutlinedIcon />, title: 'Instant Processing', description: 'Password operations complete in seconds, regardless of document size.' },
          { icon: <VerifiedUserOutlinedIcon />, title: 'Privacy First', description: 'Files and passwords are processed in isolated memory and never stored on disk.' },
        ]}
        faq={[
          { question: 'What is the difference between user and owner passwords?', answer: 'The user password is required to open the PDF. The owner password (optional) controls permissions like printing and editing. If you only set a user password, it is used for both.' },
          { question: 'Can I remove a password if I forgot it?', answer: 'No. You must provide the correct current password to unlock the PDF. This tool cannot bypass or crack password protection.' },
          { question: 'What encryption standard is used?', answer: 'PDFs are protected with AES encryption, the same standard used by governments and financial institutions.' },
          { question: 'Is there a file size limit?', answer: 'The maximum upload size is 30 MB.' },
          { question: 'Will password protection change my PDF content?', answer: 'No. The content, formatting, and structure of your PDF remain completely unchanged. Only the encryption layer is added or removed.' },
        ]}
        relatedTools={[
          { label: 'PDF Compress', href: '/compress/pdf' },
          { label: 'PDF Editor', href: '/edit/pdf' },
          { label: 'PDF Merge', href: '/merge/pdf' },
          { label: 'PDF Repair', href: '/repair/pdf' },
        ]}
      />
    </Box>
  );
}
