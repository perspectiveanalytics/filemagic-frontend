import { type ReactNode } from 'react';
import { Box, Typography } from '@mui/joy';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useLingui } from '@lingui/react/macro';

function useDisclaimers(): Record<string, string> {
  const { t } = useLingui();
  return {
    'image-convert': t`Conversion quality may vary depending on the source format. SVG rasterization is irreversible and loses vector scalability. Always keep a copy of your original file before converting.`,
    'heic-convert': t`HEIC conversion may slightly alter color profiles or metadata. Always keep a copy of your original file before converting.`,
    'pdf-compress': t`Compression reduces file size but may affect visual quality, especially for images and embedded fonts. Always keep a copy of your original PDF before compressing.`,
    'pdf-split': t`Splitting may not preserve some interactive elements such as hyperlinks or form fields. Always keep a copy of your original PDF.`,
    'image-compress': t`Compression is lossy and will reduce image quality. This process is irreversible on the output file. Always keep a copy of your original image.`,
    'ocr': t`OCR accuracy depends on image quality, language, and font. Always verify the extracted text. This tool does not guarantee 100% accuracy.`,
    'metadata-remove': t`Metadata removal is permanent on the output file and cannot be undone. Always keep a copy of your original file if you may need the metadata later.`,
    'pdf-merge': t`Merging may not preserve some interactive elements such as bookmarks, hyperlinks, or form fields. Always keep copies of your original PDFs.`,
    'image-to-pdf': t`Image resolution and aspect ratio may be adjusted to fit PDF pages. Always keep copies of your original images.`,
    'qr-code': t`Always test the generated QR code before distributing it. No guarantee is made regarding readability by all scanners.`,
    'cert-inspect': t`This tool displays certificate information for reference only. Do not rely on it for security audits or compliance decisions.`,
    'cert-convert': t`Always verify the converted certificate in your target system. Conversion errors may cause service disruptions. Keep a backup of your original certificate files.`,
    'archive': t`If you lose your password, the encrypted archive cannot be recovered. Always store your password securely and keep copies of your original files.`,
    'yaml-json': t`Conversion between YAML and JSON may alter formatting such as comments (not supported in JSON) or key ordering. Always keep a copy of your original file.`,
    'audio-convert': t`Audio conversion may slightly alter quality depending on the target format. Lossy formats (MP3, AAC) permanently reduce quality. Always keep a copy of your original file.`,
    'audio-extract': t`Extracted audio quality depends on the source video. The original audio stream cannot be improved beyond its encoded quality. Always keep your original video file.`,
    'video-compress': t`Video compression is lossy and will permanently reduce visual quality. Results may vary depending on the source video. Always keep a copy of your original file.`,
    'video-to-gif': t`GIF format has limited color depth (256 colors) and no audio. Large or long clips may produce very large files. Always keep your original video.`,
    'mov-to-mp4': t`Conversion re-encodes the video which may slightly alter quality. Always keep a copy of your original MOV file.`,
    'pdf-rotate': t`Page operations may not preserve some interactive elements such as annotations or form fields. Always keep a copy of your original PDF.`,
    'pdf-password': t`If you lose your password, the protected PDF cannot be recovered. PDF encryption strength depends on the reader software. Always store your password securely.`,
    'pdf-extract-images': t`Extracted images reflect the resolution and quality stored in the PDF. Some images may appear lower quality than expected. Always keep your original PDF.`,
    'decompress': t`Extracted files are provided as-is. Always scan extracted files with antivirus software before opening them. This tool does not verify file integrity or safety.`,
    'markdown-pdf': t`PDF rendering may differ from your Markdown editor. Complex layouts, custom HTML, or external images may not be supported. Always preview the result.`,
    'csv-excel': t`Conversion is performed entirely in your browser. Complex formatting, formulas, and multiple sheets may not be fully preserved. Always keep a copy of your original file.`,
    'json-csv': t`Conversion is performed entirely in your browser. Nested JSON structures are flattened which may alter data representation. Always keep a copy of your original file.`,
    'base64': t`Base64 encoding is not encryption — it provides no security. Do not use it to protect sensitive data. Encoded output is approximately 33% larger than the original.`,
    'word-counter': t`Word and character counts are approximate and may vary slightly from other tools depending on how whitespace and special characters are handled.`,
    'ascii': t`Conversion is performed entirely in your browser — your image is never uploaded. Results depend on image contrast and resolution. For best results, use high-contrast images.`,
    'hash-generator': t`All hashing is performed entirely in your browser — your files and text are never uploaded. MD5 and SHA-1 are considered cryptographically weak and should not be used for security purposes.`,
    'font-convert': t`Conversion may alter glyph hinting or design details. Always test the converted font in your target environment and keep a backup of the original file.`,
    'pdf-editor': t`Page operations may not preserve some interactive elements such as annotations, form fields, or JavaScript actions. Always keep a copy of your original PDF.`,
    'ebook-convert': t`Conversion between ebook formats may alter formatting, images, or table of contents. Always keep a copy of your original file and verify the result.`,
    'pdf-repair': t`Repair attempts to fix corrupted PDF structures but cannot guarantee full recovery. Some data may be lost. Always keep a copy of your original file.`,
    'password-generator': t`Generated passwords are created entirely in your browser and are never sent to any server. Always store your passwords in a secure password manager.`,
  };
}

interface ToolDisclaimerProps {
  toolId: string;
  children?: ReactNode;
}

export default function ToolDisclaimer({ toolId, children }: ToolDisclaimerProps) {
  const disclaimers = useDisclaimers();

  const disclaimer = disclaimers[toolId];
  if (!disclaimer && !children) return null;

  const text = children ?? disclaimer;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1,
        mb: 3,
        px: 1.5,
        py: 1,
        borderRadius: 'sm',
        bgcolor: 'background.level1',
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
      }}
    >
      <InfoOutlinedIcon
        sx={{
          fontSize: 14,
          mt: '1px',
          flexShrink: 0,
          color: 'text.tertiary',
        }}
      />

      <Typography
        level="body-xs"
        sx={{
          flex: 1,
          minWidth: 0,
          color: 'text.tertiary',
          lineHeight: 1.5,
          overflowWrap: 'break-word',
        }}
      >
        {text}
      </Typography>
    </Box>
  );
}
