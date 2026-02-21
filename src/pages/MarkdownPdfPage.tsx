import { useState, useCallback } from 'react';
import { Box, Typography, Textarea, Button, RadioGroup, Radio, Sheet } from '@mui/joy';
import UploadFileOutlinedIcon from '@mui/icons-material/UploadFileOutlined';
import EditNoteOutlinedIcon from '@mui/icons-material/EditNoteOutlined';
import PictureAsPdfOutlinedIcon from '@mui/icons-material/PictureAsPdfOutlined';
import FileDropZone from '../components/FileDropZone';
import ConversionProgress from '../components/ConversionProgress';
import SEO, { buildToolSchema } from '../components/SEO';
import { useConversion } from '../hooks/useConversion';
import ToolDisclaimer from '../components/ToolDisclaimer';
import ToolSEOContent from '../components/ToolSEOContent';
import TextFieldsOutlinedIcon from '@mui/icons-material/TextFieldsOutlined';
import ArticleOutlinedIcon from '@mui/icons-material/ArticleOutlined';
import CodeOutlinedIcon from '@mui/icons-material/CodeOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

export default function MarkdownPdfPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mode, setMode] = useState<'upload' | 'paste'>('upload');
  const [markdown, setMarkdown] = useState('');

  const conversion = useConversion('/convert/markdown/pdf');

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    conversion.startConversion(file, {});
  }, [conversion]);

  const handlePasteConvert = useCallback(() => {
    const text = markdown.trim();
    if (!text) return;
    const file = new File([text], 'document.md', { type: 'text/markdown' });
    setSelectedFile(file);
    conversion.startConversion(file, {});
  }, [markdown, conversion]);

  const handleRetry = useCallback(() => {
    conversion.reset();
    setSelectedFile(null);
  }, [conversion]);

  return (
    <Box sx={{ maxWidth: 520, mx: 'auto', width: '100%', py: { xs: 3, md: 4 } }}>
      <SEO title="Markdown to PDF" description="Convert Markdown files to formatted PDF for free. No signup, files processed in memory only." path="/convert/markdown/pdf" structuredData={buildToolSchema('Markdown to PDF', 'Convert Markdown files to formatted PDF for free. No signup, files processed in memory only.', '/convert/markdown/pdf')} />
      <Typography component="h1" level="h3" sx={{ mb: 1, fontWeight: 700, letterSpacing: '-0.02em' }}>
        Markdown to PDF
      </Typography>
      <Typography level="body-sm" sx={{ color: 'text.tertiary', mb: 4 }}>
        Convert Markdown files to formatted PDF
      </Typography>

      <ToolDisclaimer toolId="markdown-pdf" />

      {conversion.status === 'idle' ? (
        <Box>
          <RadioGroup
            orientation="horizontal"
            value={mode}
            onChange={(e) => setMode(e.target.value as 'upload' | 'paste')}
            sx={{ gap: 1.5, mb: 2.5 }}
          >
            <Sheet variant="outlined" sx={{ borderRadius: 'md', flex: 1, overflow: 'hidden' }}>
              <Radio
                value="upload"
                label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}><UploadFileOutlinedIcon sx={{ fontSize: 16 }} /> Upload file</Box>}
                overlay
                variant="soft"
                sx={{ p: 1.25, width: '100%' }}
              />
            </Sheet>
            <Sheet variant="outlined" sx={{ borderRadius: 'md', flex: 1, overflow: 'hidden' }}>
              <Radio
                value="paste"
                label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}><EditNoteOutlinedIcon sx={{ fontSize: 16 }} /> Paste markdown</Box>}
                overlay
                variant="soft"
                sx={{ p: 1.25, width: '100%' }}
              />
            </Sheet>
          </RadioGroup>

          {mode === 'upload' ? (
            <FileDropZone
              onFileSelect={handleFileSelect}
              accept=".md,.markdown,text/markdown"
              maxSize={5 * 1024 * 1024}
            />
          ) : (
            <Box>
              <Textarea
                placeholder="Paste or type your markdown here..."
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                minRows={10}
                maxRows={20}
                sx={{
                  fontFamily: 'monospace',
                  fontSize: 'sm',
                  bgcolor: 'background.level1',
                  '--Textarea-focusedThickness': '1px',
                }}
              />
              <Button
                size="lg"
                onClick={handlePasteConvert}
                disabled={!markdown.trim()}
                startDecorator={<PictureAsPdfOutlinedIcon />}
                sx={{ mt: 2, width: '100%' }}
              >
                Convert to PDF
              </Button>
            </Box>
          )}
        </Box>
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
          title: 'How to convert Markdown to PDF',
          steps: [
            'Choose between uploading a .md file or pasting markdown text directly.',
            'Upload your Markdown file (up to 5 MB) or paste your content into the editor.',
            'Click "Convert to PDF" (paste mode) or drop your file to start conversion automatically.',
            'Download the formatted PDF instantly.',
          ],
        }}
        features={[
          { icon: <TextFieldsOutlinedIcon />, title: 'Rich Formatting', description: 'Headings, bold, italic, lists, blockquotes, and links are all rendered with professional typography.' },
          { icon: <CodeOutlinedIcon />, title: 'Code Blocks', description: 'Syntax-highlighted code blocks and inline code are preserved with monospace formatting.' },
          { icon: <EditNoteOutlinedIcon />, title: 'Paste or Upload', description: 'Type or paste markdown directly in the browser, or upload an existing .md file.' },
          { icon: <ArticleOutlinedIcon />, title: 'Clean PDF Output', description: 'Generates properly paginated, print-ready PDF documents from your markdown source.' },
          { icon: <BoltOutlinedIcon />, title: 'Instant Conversion', description: 'Markdown files are converted to PDF in seconds, even for long documents.' },
          { icon: <LockOutlinedIcon />, title: 'Privacy First', description: 'Files are processed in isolated memory and deleted immediately after download.' },
        ]}
        faq={[
          { question: 'What Markdown features are supported?', answer: 'Standard Markdown syntax is fully supported, including headings, bold, italic, links, images, lists, blockquotes, code blocks, and horizontal rules.' },
          { question: 'Can I paste markdown instead of uploading a file?', answer: 'Yes. Switch to the "Paste markdown" tab to type or paste your content directly. The conversion works the same way.' },
          { question: 'What is the maximum file size?', answer: 'Uploaded Markdown files can be up to 5 MB. There is no character limit when pasting markdown directly.' },
          { question: 'Are images in my markdown included?', answer: 'Remote images referenced via URLs may be included depending on accessibility. For best results, use text-based markdown content.' },
        ]}
        relatedTools={[
          { label: 'PDF Compress', href: '/compress/pdf' },
          { label: 'PDF Editor', href: '/edit/pdf' },
          { label: 'PDF Merge', href: '/merge/pdf' },
          { label: 'PDF Password', href: '/convert/pdf-password' },
        ]}
      />
    </Box>
  );
}
