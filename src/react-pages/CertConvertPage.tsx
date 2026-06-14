import { useState, useCallback } from 'react';
import { Box, Typography, FormControl, FormLabel, Select, Option, Input, Chip } from '@mui/joy';
import FileDropZone from '../components/FileDropZone';
import ConversionProgress from '../components/ConversionProgress';
import SEO, { buildToolSchema } from '../components/SEO';
import { useCertConversion } from '../hooks/useCertConversion';
import ToolDisclaimer from '../components/ToolDisclaimer';
import ToolSEOContent from '../components/ToolSEOContent';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import { Trans, useLingui } from '@lingui/react/macro';

const CERT_ACCEPT = '.pem,.crt,.cer,.der,.p12,.pfx,.p7b,.p7c';

const TARGET_FORMATS = [
  { value: 'pem', label: 'PEM (.pem)' },
  { value: 'der', label: 'DER (.der)' },
  { value: 'p12', label: 'PKCS#12 (.p12)' },
  { value: 'p7b', label: 'PKCS#7 (.p7b)' },
];

function needsOutputPassword(format: string): boolean {
  return format === 'p12';
}

export default function CertConvertPage() {
  const { t } = useLingui();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [targetFormat, setTargetFormat] = useState<string>('pem');
  const [password, setPassword] = useState('');
  const [outputPassword, setOutputPassword] = useState('');

  const conversion = useCertConversion('/convert/certificate');

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    conversion.startConversion(
      file,
      targetFormat,
      password || undefined,
      outputPassword || undefined
    );
  }, [targetFormat, password, outputPassword, conversion]);

  const handleRetry = useCallback(() => {
    conversion.reset();
    setSelectedFile(null);
  }, [conversion]);

  const isProcessing = ['uploading', 'queued', 'processing'].includes(conversion.status);
  const showInputPassword = true; // Always show — user may need it for P12/PFX
  const showOutputPassword = needsOutputPassword(targetFormat);

  return (
    <Box sx={{ maxWidth: 520, mx: 'auto', width: '100%', py: { xs: 3, md: 4 } }}>
      <SEO
        title={t`Certificate Converter`}
        description={t`Convert certificates between PEM, DER, P12/PFX, and P7B formats. Free, no signup required.`}
        path="/convert/certificate"
        structuredData={buildToolSchema(t`Certificate Converter`, t`Convert certificates between PEM, DER, P12/PFX, and P7B formats. Free, no signup required.`, '/convert/certificate')}
      />
      <Typography component="h1" level="h3" sx={{ mb: 1, fontWeight: 700, letterSpacing: '-0.02em' }}><Trans>Certificate Converter</Trans></Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Typography level="body-sm" sx={{ color: 'text.tertiary' }}><Trans>Convert between certificate formats</Trans></Typography>
        <Chip size="sm" variant="soft" color="warning" sx={{ fontSize: '0.65rem', fontWeight: 700 }}><Trans>Beta</Trans></Chip>
      </Box>
      <ToolDisclaimer toolId="cert-convert" />

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
          <FormLabel><Trans>Target format</Trans></FormLabel>
          <Select
            value={targetFormat}
            onChange={(_, val) => val && setTargetFormat(val)}
            disabled={isProcessing}
            size="sm"
          >
            {TARGET_FORMATS.map((f) => (
              <Option key={f.value} value={f.value}>{f.label}</Option>
            ))}
          </Select>
        </FormControl>

        {showInputPassword && (
          <FormControl>
            <FormLabel><Trans>Input password (for P12/PFX)</Trans></FormLabel>
            <Input
              type="password"
              placeholder={t`Leave empty if not encrypted`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isProcessing}
              size="sm"
            />
          </FormControl>
        )}

        {showOutputPassword && (
          <FormControl>
            <FormLabel><Trans>Output password</Trans></FormLabel>
            <Input
              type="password"
              placeholder={t`Password for output file`}
              value={outputPassword}
              onChange={(e) => setOutputPassword(e.target.value)}
              disabled={isProcessing}
              size="sm"
            />
            <Typography level="body-xs" sx={{ color: 'text.tertiary', mt: 0.5 }}><Trans>Required for P12 output</Trans></Typography>
          </FormControl>
        )}
      </Box>

      {conversion.status === 'idle' ? (
        <FileDropZone
          onFileSelect={handleFileSelect}
          accept={CERT_ACCEPT}
          maxSize={1 * 1024 * 1024}
        />
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
            previewUrl={null}
            onDownload={conversion.download}
            onRetry={handleRetry}
            showSizeComparison={false}
          />
        </Box>
      )}
      <ToolSEOContent
        howTo={{
          title: t`How to convert a certificate online`,
          steps: [
            t`Select the target format (PEM, DER, P12, or P7B).`,
            t`If your input file is a P12/PFX, enter the input password.`,
            t`If converting to P12, enter an output password to protect the new file.`,
            t`Upload your certificate file (up to 1 MB).`,
            t`Download the converted certificate instantly.`,
          ],
        }}
        features={[
          { icon: <SwapHorizOutlinedIcon />, title: t`Four Output Formats`, description: t`Convert to PEM, DER, PKCS#12 (.p12), or PKCS#7 (.p7b) with a single click.` },
          { icon: <SecurityOutlinedIcon />, title: t`Password-Protected Input`, description: t`Supports encrypted P12/PFX files — just provide the password before uploading.` },
          { icon: <LockOutlinedIcon />, title: t`Encrypted P12 Output`, description: t`Set a password when converting to PKCS#12 to keep your private key protected.` },
          { icon: <VerifiedUserOutlinedIcon />, title: t`Chain Preserved`, description: t`Intermediate and root certificates in the source file are carried over to the output.` },
          { icon: <BoltOutlinedIcon />, title: t`Instant Conversion`, description: t`Certificates convert in under a second — no waiting, no queue.` },
        ]}
        faq={[
          { question: t`What certificate formats can I convert between?`, answer: t`You can convert from PEM, CRT, CER, DER, P12/PFX, and P7B/P7C to any of the four target formats: PEM, DER, PKCS#12, and PKCS#7.` },
          { question: t`Do I need a password for P12/PFX files?`, answer: t`If the input P12/PFX is password-protected, you need to provide it. When converting to P12, you must set an output password to encrypt the new file.` },
          { question: t`Is the certificate chain included in the output?`, answer: t`Yes. All intermediate and root certificates present in the source file are included in the converted output.` },
          { question: t`What is the file size limit?`, answer: t`The maximum upload size is 1 MB, which is more than enough for certificate files.` },
        ]}
        relatedTools={[
          { label: t`Certificate Inspector`, href: '/inspect/certificate' },
          { label: t`Password Generator`, href: '/generate/password' },
          { label: t`PDF Compress`, href: '/compress/pdf' },
          { label: t`QR Code Generator`, href: '/qrcode' },
        ]}
      />
    </Box>
  );
}
