import { useState, useCallback, useMemo } from 'react';
import { Box, Typography, Input, Chip, Sheet, Divider, IconButton, Tooltip, CircularProgress, Textarea } from '@mui/joy';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import FileDropZone from '../components/FileDropZone';
import SEO, { buildToolSchema } from '../components/SEO';
import { useInspection } from '../hooks/useInspection';
import type { CertificateInfo, CertSummary, SubjectInfo } from '../types/api';
import ToolDisclaimer from '../components/ToolDisclaimer';
import ToolSEOContent from '../components/ToolSEOContent';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import LanguageOutlinedIcon from '@mui/icons-material/LanguageOutlined';
import FingerprintOutlinedIcon from '@mui/icons-material/FingerprintOutlined';
import LinkOutlinedIcon from '@mui/icons-material/LinkOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { Trans, useLingui } from '@lingui/react/macro';

const CERT_ACCEPT = '.pem,.crt,.cer,.der,.p12,.pfx,.p7b,.p7c,.csr';

function needsPassword(filename: string): boolean {
  const lower = filename.toLowerCase();
  return lower.endsWith('.p12') || lower.endsWith('.pfx');
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function relativeTime(dateStr: string): string {
  const now = Date.now();
  const target = new Date(dateStr).getTime();
  const diff = target - now;
  const absDiff = Math.abs(diff);
  const days = Math.floor(absDiff / (1000 * 60 * 60 * 24));

  if (days < 1) return diff > 0 ? 'today' : 'today';
  if (days < 30) return `${days}d ${diff > 0 ? 'from now' : 'ago'}`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ${diff > 0 ? 'from now' : 'ago'}`;
  const years = Math.floor(days / 365);
  const remMonths = Math.floor((days % 365) / 30);
  if (remMonths > 0) return `${years}y ${remMonths}mo ${diff > 0 ? 'from now' : 'ago'}`;
  return `${years}y ${diff > 0 ? 'from now' : 'ago'}`;
}

// --- Copyable value with click-to-copy ---

function CopyableValue({ value, mono, label }: { value: string; mono?: boolean; label?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = value;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [value]);

  return (
    <Box
      onClick={handleCopy}
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 0.75,
        cursor: 'pointer',
        borderRadius: 'sm',
        px: 0.5,
        mx: -0.5,
        py: 0.25,
        transition: 'background-color 0.15s',
        '&:hover': { bgcolor: 'background.level1' },
        '&:hover .copy-icon': { opacity: 1 },
      }}
    >
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          level="body-xs"
          sx={{
            fontFamily: mono ? 'monospace' : undefined,
            wordBreak: 'break-all',
            lineHeight: 1.6,
            letterSpacing: mono ? '0.02em' : undefined,
          }}
        >
          {value}
        </Typography>
      </Box>
      <Tooltip title={copied ? 'Copied!' : `Copy ${label || 'value'}`} size="sm" placement="top">
        <Box
          className="copy-icon"
          sx={{
            flexShrink: 0,
            opacity: copied ? 1 : 0,
            transition: 'opacity 0.15s',
            color: copied ? 'success.500' : 'text.tertiary',
            mt: '1px',
            display: 'flex',
          }}
        >
          {copied ? (
            <CheckOutlinedIcon sx={{ fontSize: 13 }} />
          ) : (
            <ContentCopyOutlinedIcon sx={{ fontSize: 13 }} />
          )}
        </Box>
      </Tooltip>
    </Box>
  );
}

// --- Monospace code block (for fingerprints, serial) ---

function CodeBlock({ label, value }: { label: string; value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = value;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [value]);

  return (
    <Box sx={{ mb: 1.5, '&:last-child': { mb: 0 } }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
        <Typography level="body-xs" sx={{ color: 'text.tertiary', fontWeight: 500 }}>
          {label}
        </Typography>
        <Tooltip title={copied ? 'Copied!' : 'Copy'} size="sm">
          <IconButton
            size="sm"
            variant="plain"
            color={copied ? 'success' : 'neutral'}
            onClick={handleCopy}
            sx={{ '--IconButton-size': '24px' }}
          >
            {copied ? <CheckOutlinedIcon sx={{ fontSize: 13 }} /> : <ContentCopyOutlinedIcon sx={{ fontSize: 13 }} />}
          </IconButton>
        </Tooltip>
      </Box>
      <Box
        sx={{
          px: 1.5,
          py: 1,
          borderRadius: 'sm',
          bgcolor: 'background.level1',
          border: '1px solid',
          borderColor: 'divider',
          fontFamily: 'monospace',
          fontSize: '0.72rem',
          lineHeight: 1.7,
          wordBreak: 'break-all',
          letterSpacing: '0.03em',
          color: 'text.secondary',
          userSelect: 'all',
        }}
      >
        {value}
      </Box>
    </Box>
  );
}

function InfoRow({ label, children, minLabelWidth = 80 }: { label: string; children: React.ReactNode; minLabelWidth?: number }) {
  return (
    <Box sx={{ display: 'flex', gap: 1.5, py: 0.4 }}>
      <Typography level="body-xs" sx={{ color: 'text.tertiary', minWidth: minLabelWidth, flexShrink: 0, pt: '1px' }}>
        {label}
      </Typography>
      <Box sx={{ flex: 1, minWidth: 0 }}>{children}</Box>
    </Box>
  );
}

// --- Subject/Issuer display ---

function SubjectDisplay({ label, info }: { label: string; info: SubjectInfo }) {
  const dnParts: { key: string; value: string }[] = [];
  if (info.commonName) dnParts.push({ key: 'CN', value: info.commonName });
  if (info.organization?.length) dnParts.push({ key: 'O', value: info.organization.join(', ') });
  if (info.organizationalUnit?.length) dnParts.push({ key: 'OU', value: info.organizationalUnit.join(', ') });
  if (info.locality?.length) dnParts.push({ key: 'L', value: info.locality.join(', ') });
  if (info.province?.length) dnParts.push({ key: 'ST', value: info.province.join(', ') });
  if (info.country?.length) dnParts.push({ key: 'C', value: info.country.join(', ') });

  const dnString = dnParts.map((p) => `${p.key}=${p.value}`).join(', ');

  return (
    <InfoRow label={label}>
      {dnParts.length > 0 ? (
        <CopyableValue value={dnString} label={label.toLowerCase()} />
      ) : (
        <Typography level="body-xs" sx={{ color: 'text.tertiary' }}><Trans>N/A</Trans></Typography>
      )}
    </InfoRow>
  );
}

// --- Validity timeline ---

function ValidityTimeline({ notBefore, notAfter, isExpired }: { notBefore: string; notAfter: string; isExpired: boolean }) {
  const now = Date.now();
  const start = new Date(notBefore).getTime();
  const end = new Date(notAfter).getTime();
  const total = end - start;
  const elapsed = now - start;
  const progress = total > 0 ? Math.max(0, Math.min(100, (elapsed / total) * 100)) : 0;
  const notYetValid = now < start;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.75 }}>
        <Box>
          <Typography level="body-xs" sx={{ color: 'text.tertiary' }}><Trans>Not Before</Trans></Typography>
          <Typography level="body-xs" sx={{ fontWeight: 500 }}>{formatDate(notBefore)}</Typography>
        </Box>
        <Box sx={{ textAlign: 'right' }}>
          <Typography level="body-xs" sx={{ color: 'text.tertiary' }}><Trans>Not After</Trans></Typography>
          <Typography level="body-xs" sx={{ fontWeight: 500, color: isExpired ? 'danger.plainColor' : undefined }}>
            {formatDate(notAfter)}
          </Typography>
        </Box>
      </Box>
      <Box sx={{ height: 6, borderRadius: 3, bgcolor: 'background.level2', overflow: 'hidden', position: 'relative' }}>
        <Box
          sx={{
            height: '100%',
            width: `${progress}%`,
            bgcolor: isExpired ? 'danger.400' : notYetValid ? 'warning.400' : 'success.500',
            borderRadius: 3,
            transition: 'width 0.4s ease',
          }}
        />
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 0.75 }}>
        <Typography level="body-xs" sx={{ color: isExpired ? 'danger.plainColor' : 'text.tertiary' }}>
          {isExpired
            ? `Expired ${relativeTime(notAfter)}`
            : notYetValid
              ? `Not yet valid — starts ${relativeTime(notBefore)}`
              : `Expires ${relativeTime(notAfter)}`}
        </Typography>
      </Box>
    </Box>
  );
}

// --- Section wrapper ---

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Sheet
      variant="outlined"
      sx={{
        p: 2.5,
        borderRadius: 'lg',
        display: 'flex',
        flexDirection: 'column',
        gap: 0.5,
      }}
    >
      <Typography level="title-sm" sx={{ mb: 1, fontWeight: 600, fontSize: '0.82rem' }}>
        {title}
      </Typography>
      {children}
    </Sheet>
  );
}

// --- Chain card ---

function ChainCertCard({ cert, index, showConnector, isLast }: { cert: CertSummary; index: number; showConnector: boolean; isLast: boolean }) {
  const subjectLine = [
    cert.subject.commonName,
    cert.subject.organization?.join(', '),
  ].filter(Boolean).join(' — ');

  return (
    <Box sx={{ display: 'flex', gap: 1.5 }}>
      {showConnector && (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 20, flexShrink: 0, pt: 0.5 }}>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: cert.isExpired ? 'danger.400' : 'neutral.500',
              border: '2px solid',
              borderColor: cert.isExpired ? 'danger.300' : 'neutral.400',
              flexShrink: 0,
            }}
          />
          {!isLast && <Box sx={{ width: 1, flex: 1, bgcolor: 'divider' }} />}
        </Box>
      )}
      <Sheet
        variant="outlined"
        sx={{
          p: 2,
          borderRadius: 'md',
          flex: 1,
          mb: 1,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <Typography level="body-xs" sx={{ color: 'text.tertiary', fontWeight: 500 }}>
            #{index + 1}
          </Typography>
          {cert.isCA && <Chip size="sm" variant="soft" color="neutral" sx={{ fontSize: '0.65rem', height: 18 }}>CA</Chip>}
          {cert.isExpired && <Chip size="sm" variant="soft" color="danger" sx={{ fontSize: '0.65rem', height: 18 }}><Trans>Expired</Trans></Chip>}
        </Box>
        <Typography level="body-sm" sx={{ fontWeight: 500, mb: 0.25 }}>
          {subjectLine || 'Unknown'}
        </Typography>
        <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
          {formatDate(cert.notBefore)} — {formatDate(cert.notAfter)}
        </Typography>
      </Sheet>
    </Box>
  );
}

const CHAIN_PREVIEW_COUNT = 3;

function ChainSection({ chain }: { chain: CertSummary[] }) {
  const [expanded, setExpanded] = useState(false);
  const collapsible = chain.length > CHAIN_PREVIEW_COUNT;
  const visible = useMemo(
    () => (collapsible && !expanded ? chain.slice(0, CHAIN_PREVIEW_COUNT) : chain),
    [chain, collapsible, expanded],
  );
  const hiddenCount = chain.length - CHAIN_PREVIEW_COUNT;

  return (
    <Box>
      <Typography level="title-sm" sx={{ mb: 2, fontWeight: 600, fontSize: '0.82rem' }}>
        Certificate Chain ({chain.length} additional)
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        {visible.map((cert, i) => (
          <ChainCertCard key={i} cert={cert} index={i} showConnector={chain.length > 1} isLast={i === visible.length - 1} />
        ))}
      </Box>
      {collapsible && (
        <Box
          component="button"
          onClick={() => setExpanded((v) => !v)}
          sx={{
            mt: 0.5,
            ml: 4.5,
            px: 0,
            py: 0.5,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'primary.plainColor',
            fontSize: 'xs',
            fontWeight: 500,
            '&:hover': { textDecoration: 'underline' },
          }}
        >
          {expanded ? 'Show less' : `Show ${hiddenCount} more`}
        </Box>
      )}
    </Box>
  );
}

// --- Main certificate result ---

function CertResult({ result }: { result: CertificateInfo }) {
  const isCSR = result.format === 'CSR';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
        <Chip size="sm" variant="soft" color="neutral">{result.format}</Chip>
        {!isCSR && (
          result.isExpired ? (
            <Chip size="sm" variant="soft" color="danger"><Trans>Expired</Trans></Chip>
          ) : (
            <Chip size="sm" variant="soft" color="success"><Trans>Valid</Trans></Chip>
          )
        )}
        {result.isSelfSigned && <Chip size="sm" variant="soft" color="warning"><Trans>Self-Signed</Trans></Chip>}
        {result.isTrusted && <Chip size="sm" variant="soft" color="success"><Trans>Trusted</Trans></Chip>}
        {result.isCA && <Chip size="sm" variant="soft" color="neutral">CA</Chip>}
        {result.certCount > 1 && (
          <Chip size="sm" variant="soft" color="neutral">{result.certCount} certs</Chip>
        )}
      </Box>

      <Section title="Identity">
        <SubjectDisplay label="Subject" info={result.subject} />
        {!isCSR && <SubjectDisplay label="Issuer" info={result.issuer} />}
      </Section>

      {!isCSR && (
        <Section title="Validity">
          <ValidityTimeline notBefore={result.notBefore} notAfter={result.notAfter} isExpired={result.isExpired} />
        </Section>
      )}

      <Section title="Key Details">
        <InfoRow label="Algorithm">
          <Typography level="body-xs">{result.publicKeyAlgorithm} ({result.keySize} bit)</Typography>
        </InfoRow>
        <InfoRow label="Signature">
          <Typography level="body-xs">{result.signatureAlgorithm}</Typography>
        </InfoRow>
        {result.serialNumber && (
          <InfoRow label="Serial">
            <CopyableValue value={result.serialNumber} mono label="serial number" />
          </InfoRow>
        )}
      </Section>

      {result.sans && result.sans.length > 0 && (
        <Section title={`Subject Alternative Names (${result.sans.length})`}>
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {result.sans.map((san) => (
              <SanChip key={san} value={san} />
            ))}
          </Box>
        </Section>
      )}

      {((result.keyUsage && result.keyUsage.length > 0) || (result.extKeyUsage && result.extKeyUsage.length > 0)) && (
        <Section title="Key Usage">
          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
            {result.keyUsage?.map((u) => (
              <Chip key={u} size="sm" variant="soft" color="neutral">{u}</Chip>
            ))}
            {result.extKeyUsage?.map((u) => (
              <Chip key={u} size="sm" variant="soft" color="primary">{u}</Chip>
            ))}
          </Box>
        </Section>
      )}

      {result.fingerprints && (
        <Section title="Fingerprints">
          <CodeBlock label="SHA-256" value={result.fingerprints.sha256} />
          <CodeBlock label="SHA-1" value={result.fingerprints.sha1} />
        </Section>
      )}

      {result.chain && result.chain.length > 0 && (
        <Divider sx={{ my: 0.5 }} />
      )}
      {result.chain && result.chain.length > 0 && (
        <ChainSection chain={result.chain} />
      )}
    </Box>
  );
}

// --- SAN chip with copy ---

function SanChip({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = value;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [value]);

  return (
    <Tooltip title={copied ? 'Copied!' : 'Click to copy'} size="sm">
      <Chip
        size="sm"
        variant={copied ? 'soft' : 'outlined'}
        color={copied ? 'success' : 'neutral'}
        onClick={handleCopy}
        sx={{
          cursor: 'pointer',
          transition: 'all 0.15s',
          '&:hover': { bgcolor: 'background.level1' },
        }}
        endDecorator={
          copied ? (
            <CheckOutlinedIcon sx={{ fontSize: 11 }} />
          ) : (
            <ContentCopyOutlinedIcon sx={{ fontSize: 11, opacity: 0.5 }} />
          )
        }
      >
        {value}
      </Chip>
    </Tooltip>
  );
}

// --- Main page ---

export default function CertInspectPage() {
  const { t } = useLingui();
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [inputMode, setInputMode] = useState<'file' | 'paste'>('file');
  const [pemText, setPemText] = useState('');

  const inspection = useInspection('/inspect/certificate');

  const handleFileSelect = useCallback((file: File) => {
    if (needsPassword(file.name)) {
      setPendingFile(file);
    } else {
      inspection.inspect(file);
    }
  }, [inspection]);

  const handlePasswordSubmit = useCallback(() => {
    if (pendingFile) {
      inspection.inspect(pendingFile, password);
      setPendingFile(null);
      setPassword('');
    }
  }, [pendingFile, password, inspection]);

  const handlePasteSubmit = useCallback(() => {
    if (pemText.trim()) {
      inspection.inspectText(pemText.trim());
    }
  }, [pemText, inspection]);

  const handleRetry = useCallback(() => {
    inspection.reset();
    setPendingFile(null);
    setPassword('');
    setPemText('');
  }, [inspection]);

  return (
    <Box sx={{ maxWidth: 520, mx: 'auto', width: '100%', py: { xs: 3, md: 4 } }}>
      <SEO
        title={t`Certificate Inspector`}
        description={t`Inspect SSL/TLS certificates. View subject, issuer, validity, SANs, key usage, and trust status. Supports PEM, DER, P12, P7B formats.`}
        path="/inspect/certificate"
        structuredData={buildToolSchema(t`Certificate Inspector`, t`Inspect SSL/TLS certificates. View subject, issuer, validity, SANs, key usage, and trust status. Supports PEM, DER, P12, P7B formats.`, '/inspect/certificate')}
      />
      <Typography component="h1" level="h3" sx={{ mb: 1, fontWeight: 700, letterSpacing: '-0.02em' }}><Trans>Certificate Inspector</Trans></Typography>
      <Typography level="body-sm" sx={{ color: 'text.tertiary', mb: 4 }}><Trans>View details of SSL/TLS certificates</Trans></Typography>

      <ToolDisclaimer toolId="cert-inspect" />

      {pendingFile && (
        <Box
          sx={{
            p: 2.5,
            mb: 3,
            borderRadius: 'lg',
            bgcolor: 'background.surface',
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Typography level="body-sm" sx={{ mb: 1.5 }}>
            {pendingFile.name} requires a password
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Input
              type="password"
              placeholder={t`Enter password`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handlePasswordSubmit()}
              sx={{ flex: 1 }}
              size="sm"
            />
            <Box
              component="button"
              onClick={handlePasswordSubmit}
              sx={{
                px: 2,
                py: 1,
                borderRadius: 'md',
                bgcolor: 'primary.500',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                fontSize: 'sm',
                fontWeight: 500,
                '&:hover': { bgcolor: 'primary.600' },
              }}
            >
              Inspect
            </Box>
          </Box>
        </Box>
      )}

      {inspection.status === 'idle' && !pendingFile ? (
        <>
          <Box sx={{ display: 'flex', gap: 0.75, mb: 2 }}>
            <Chip
              size="sm"
              variant={inputMode === 'file' ? 'solid' : 'outlined'}
              color={inputMode === 'file' ? 'primary' : 'neutral'}
              onClick={() => setInputMode('file')}
              sx={{ cursor: 'pointer', fontWeight: 500 }}
            >
              Upload file
            </Chip>
            <Chip
              size="sm"
              variant={inputMode === 'paste' ? 'solid' : 'outlined'}
              color={inputMode === 'paste' ? 'primary' : 'neutral'}
              onClick={() => setInputMode('paste')}
              sx={{ cursor: 'pointer', fontWeight: 500 }}
            >
              Paste PEM
            </Chip>
          </Box>

          {inputMode === 'file' ? (
            <FileDropZone
              onFileSelect={handleFileSelect}
              accept={CERT_ACCEPT}
              maxSize={5 * 1024 * 1024}
            />
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Textarea
                placeholder={'-----BEGIN CERTIFICATE-----\nMIID...\n-----END CERTIFICATE-----'}
                value={pemText}
                onChange={(e) => setPemText(e.target.value)}
                minRows={6}
                maxRows={14}
                sx={{
                  fontFamily: 'monospace',
                  fontSize: '0.8rem',
                  lineHeight: 1.6,
                }}
              />
              <Box
                component="button"
                onClick={handlePasteSubmit}
                sx={{
                  alignSelf: 'flex-end',
                  px: 2.5,
                  py: 1,
                  borderRadius: 'md',
                  bgcolor: pemText.trim() ? 'primary.500' : 'neutral.200',
                  color: pemText.trim() ? 'white' : 'neutral.500',
                  border: 'none',
                  cursor: pemText.trim() ? 'pointer' : 'default',
                  fontSize: 'sm',
                  fontWeight: 600,
                  transition: 'all 0.15s',
                  '&:hover': pemText.trim() ? { bgcolor: 'primary.600' } : {},
                }}
              >
                Inspect
              </Box>
            </Box>
          )}
        </>
      ) : inspection.status === 'uploading' ? (
        <Box
          sx={{
            p: 4,
            borderRadius: 'lg',
            bgcolor: 'background.surface',
            border: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2.5,
          }}
        >
          <CircularProgress size="md" thickness={3} color="primary" />
          <Typography level="body-md" sx={{ color: 'text.secondary' }}><Trans>Analyzing certificate...</Trans></Typography>
        </Box>
      ) : inspection.status === 'error' ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography level="body-sm" sx={{ color: 'danger.plainColor', mb: 2 }}>
            {inspection.error}
          </Typography>
          <Box
            component="button"
            onClick={handleRetry}
            sx={{
              px: 3,
              py: 1,
              borderRadius: 'md',
              bgcolor: 'background.level1',
              color: 'text.primary',
              border: '1px solid',
              borderColor: 'divider',
              cursor: 'pointer',
              fontSize: 'sm',
              '&:hover': { bgcolor: 'background.level2' },
            }}
          >
            Try Again
          </Box>
        </Box>
      ) : inspection.result ? (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <Box
              component="button"
              onClick={handleRetry}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.75,
                px: 2.5,
                py: 1,
                borderRadius: '10px',
                bgcolor: 'transparent',
                color: 'text.secondary',
                border: '1px solid',
                borderColor: 'divider',
                cursor: 'pointer',
                fontSize: '0.825rem',
                fontWeight: 600,
                letterSpacing: '0.01em',
                outline: 'none',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
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
              <AddRoundedIcon sx={{ fontSize: 16 }} />
              Inspect another
            </Box>
          </Box>
          <CertResult result={inspection.result} />
        </Box>
      ) : null}
      <ToolSEOContent
        howTo={{
          title: t`How to inspect an SSL/TLS certificate`,
          steps: [
            t`Upload your certificate file (PEM, CRT, DER, P12, PFX, P7B, or CSR). Max 5 MB.`,
            t`If the file is a password-protected P12/PFX, enter the password when prompted.`,
            t`Review subject, issuer, validity dates, SANs, key usage, and fingerprints.`,
            t`Click any value to copy it to your clipboard.`,
          ],
        }}
        features={[
          { icon: <SecurityOutlinedIcon />, title: t`Full Certificate Details`, description: t`View subject, issuer, validity period, signature algorithm, key size, and serial number at a glance.` },
          { icon: <LanguageOutlinedIcon />, title: t`SAN Inspection`, description: t`List all Subject Alternative Names (DNS, IP, email) with one-click copy for each entry.` },
          { icon: <FingerprintOutlinedIcon />, title: t`Fingerprint Verification`, description: t`Display SHA-256 and SHA-1 fingerprints for easy certificate pinning and comparison.` },
          { icon: <LinkOutlinedIcon />, title: t`Chain Visualization`, description: t`See the full certificate chain with status badges for CA, expired, and self-signed certificates.` },
          { icon: <BoltOutlinedIcon />, title: t`Multiple Formats`, description: t`Supports PEM, CRT, DER, P12/PFX (with password), P7B, and CSR files.` },
          { icon: <LockOutlinedIcon />, title: t`Privacy First`, description: t`Certificates are analyzed in isolated memory and never stored. Data is deleted immediately after inspection.` },
        ]}
        faq={[
          { question: t`What certificate formats are supported?`, answer: t`PEM (.pem, .crt, .cer), DER (.der), PKCS#12 (.p12, .pfx), PKCS#7 (.p7b, .p7c), and Certificate Signing Requests (.csr).` },
          { question: t`Can I inspect a password-protected certificate?`, answer: t`Yes. P12 and PFX files that require a password will prompt you to enter it before analysis.` },
          { question: t`What is the file size limit?`, answer: t`The maximum upload size is 5 MB, which covers virtually all certificate files.` },
          { question: t`Does this tool validate the certificate chain?`, answer: t`It displays the chain and indicates whether each certificate is expired, a CA, or self-signed. Full trust-chain validation against system roots is also shown when available.` },
          { question: t`Is my certificate stored on the server?`, answer: t`No. The certificate is processed in memory and discarded immediately. Nothing is saved or logged.` },
        ]}
        relatedTools={[
          { label: t`Certificate Converter`, href: '/convert/certificate' },
          { label: t`Password Generator`, href: '/generate/password' },
          { label: t`PDF Compress`, href: '/compress/pdf' },
          { label: t`QR Code Generator`, href: '/qrcode' },
        ]}
      />
    </Box>
  );
}
