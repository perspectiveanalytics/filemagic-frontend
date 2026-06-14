import { useState, useCallback } from 'react';
import { Box, Typography } from '@mui/joy';
import FileDropZone from '../components/FileDropZone';
import ConversionProgress from '../components/ConversionProgress';
import SEO, { buildToolSchema } from '../components/SEO';
import { useConversion } from '../hooks/useConversion';
import ToolDisclaimer from '../components/ToolDisclaimer';
import ToolSEOContent from '../components/ToolSEOContent';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import AutoFixHighOutlinedIcon from '@mui/icons-material/AutoFixHighOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import RestoreOutlinedIcon from '@mui/icons-material/RestoreOutlined';
import { Trans, useLingui } from '@lingui/react/macro';

export default function PdfRepairPage() {
  const { t } = useLingui();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const conversion = useConversion('/convert/pdf/repair');

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    conversion.startConversion(file, {});
  }, [conversion]);

  const handleRetry = useCallback(() => {
    conversion.reset();
    setSelectedFile(null);
  }, [conversion]);

  return (
    <Box sx={{ maxWidth: 520, mx: 'auto', width: '100%', py: { xs: 3, md: 4 } }}>
      <SEO
        title={t`PDF Repair`}
        description={t`Repair corrupted or broken PDF files. Fix cross-reference errors, invalid objects and structural issues. Free, no signup.`}
        path="/repair/pdf"
        structuredData={buildToolSchema(t`PDF Repair`, t`Repair corrupted or broken PDF files.`, '/repair/pdf')}
      />
      <Typography component="h1" level="h3" sx={{ mb: 1, fontWeight: 700, letterSpacing: '-0.02em' }}><Trans>PDF Repair</Trans></Typography>
      <Typography level="body-sm" sx={{ color: 'text.tertiary', mb: 4 }}><Trans>Fix corrupted or broken PDF files</Trans></Typography>

      <ToolDisclaimer toolId="pdf-repair" />

      {conversion.status === 'idle' ? (
        <FileDropZone
          onFileSelect={handleFileSelect}
          accept=".pdf,application/pdf"
          maxSize={20 * 1024 * 1024}
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
          title: t`How to repair a corrupted PDF`,
          steps: [
            t`Upload your corrupted or broken PDF file (up to 20 MB).`,
            t`The tool automatically analyzes and repairs structural issues.`,
            t`Download the repaired PDF once processing completes.`,
          ],
        }}
        features={[
          { icon: <BuildOutlinedIcon />, title: t`Cross-Reference Repair`, description: t`Fixes broken or missing cross-reference tables that prevent PDFs from opening.` },
          { icon: <AutoFixHighOutlinedIcon />, title: t`Object Recovery`, description: t`Recovers and rebuilds invalid or damaged PDF objects and streams.` },
          { icon: <DescriptionOutlinedIcon />, title: t`Structure Rebuild`, description: t`Reconstructs the internal page tree and document catalog for proper rendering.` },
          { icon: <RestoreOutlinedIcon />, title: t`Content Preservation`, description: t`Recovers as much content as possible — text, images, and annotations — from damaged files.` },
          { icon: <BoltOutlinedIcon />, title: t`Fast Processing`, description: t`Most PDFs are analyzed and repaired in seconds.` },
          { icon: <LockOutlinedIcon />, title: t`Privacy First`, description: t`Files are handled in an isolated worker and expire after processing.` },
        ]}
        faq={[
          { question: t`What types of PDF corruption can be repaired?`, answer: t`The tool fixes common issues like broken cross-reference tables, invalid objects, truncated files, and structural damage. It works best on files that were partially corrupted during transfer or saving.` },
          { question: t`Will all my content be recovered?`, answer: t`In most cases, yes. The tool recovers as much content as possible, but severely damaged files may have some irrecoverable data loss.` },
          { question: t`Can I repair a password-protected PDF?`, answer: t`The repair tool works on unprotected PDFs. If your file is password-protected, use the PDF Password tool to remove the password first.` },
          { question: t`What is the maximum file size?`, answer: t`You can upload PDF files up to 20 MB for repair.` },
          { question: t`My PDF opens but looks wrong — can this help?`, answer: t`Possibly. If the issue is structural (e.g., garbled text, missing pages), the repair tool may fix it. If the issue is with fonts or encoding, the result may vary.` },
        ]}
        relatedTools={[
          { label: t`PDF Compress`, href: '/compress/pdf' },
          { label: t`PDF Editor`, href: '/edit/pdf' },
          { label: t`PDF Password`, href: '/convert/pdf-password' },
          { label: t`PDF Merge`, href: '/merge/pdf' },
        ]}
      />
    </Box>
  );
}
