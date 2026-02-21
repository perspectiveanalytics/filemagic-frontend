import { type ReactNode } from 'react';
import { Box, Typography } from '@mui/joy';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useLang } from '../hooks/useLang';
import type { Lang } from '../hooks/useLang';

const DISCLAIMERS: Record<string, { en: string; fr: string }> = {
  'image-convert': {
    en: 'Conversion quality may vary depending on the source format. SVG rasterization is irreversible and loses vector scalability. Always keep a copy of your original file before converting.',
    fr: 'La qualité de conversion peut varier selon le format source. La rastérisation SVG est irréversible et perd la mise à l\'échelle vectorielle. Conservez toujours une copie de votre fichier original avant conversion.',
  },
  'heic-convert': {
    en: 'HEIC conversion may slightly alter color profiles or metadata. Always keep a copy of your original file before converting.',
    fr: 'La conversion HEIC peut légèrement altérer les profils couleur ou les métadonnées. Conservez toujours une copie de votre fichier original.',
  },
  'pdf-compress': {
    en: 'Compression reduces file size but may affect visual quality, especially for images and embedded fonts. Always keep a copy of your original PDF before compressing.',
    fr: 'La compression réduit la taille du fichier mais peut affecter la qualité visuelle, notamment pour les images et polices embarquées. Conservez toujours une copie de votre PDF original.',
  },
  'pdf-split': {
    en: 'Splitting may not preserve some interactive elements such as hyperlinks or form fields. Always keep a copy of your original PDF.',
    fr: 'Le découpage peut ne pas préserver certains éléments interactifs comme les liens hypertexte ou les champs de formulaire. Conservez toujours une copie de votre PDF original.',
  },
  'image-compress': {
    en: 'Compression is lossy and will reduce image quality. This process is irreversible on the output file. Always keep a copy of your original image.',
    fr: 'La compression est avec perte et réduira la qualité de l\'image. Ce processus est irréversible sur le fichier produit. Conservez toujours une copie de votre image originale.',
  },
  'ocr': {
    en: 'OCR accuracy depends on image quality, language, and font. Always verify the extracted text. This tool does not guarantee 100% accuracy.',
    fr: 'La précision de l\'OCR dépend de la qualité de l\'image, de la langue et de la police. Vérifiez toujours le texte extrait. Cet outil ne garantit pas une précision de 100%.',
  },
  'metadata-remove': {
    en: 'Metadata removal is permanent on the output file and cannot be undone. Always keep a copy of your original file if you may need the metadata later.',
    fr: 'La suppression des métadonnées est permanente sur le fichier produit et ne peut pas être annulée. Conservez toujours une copie de votre fichier original.',
  },
  'pdf-merge': {
    en: 'Merging may not preserve some interactive elements such as bookmarks, hyperlinks, or form fields. Always keep copies of your original PDFs.',
    fr: 'La fusion peut ne pas préserver certains éléments interactifs comme les signets, les liens hypertexte ou les champs de formulaire. Conservez toujours des copies de vos PDF originaux.',
  },
  'image-to-pdf': {
    en: 'Image resolution and aspect ratio may be adjusted to fit PDF pages. Always keep copies of your original images.',
    fr: 'La résolution et le rapport d\'aspect des images peuvent être ajustés pour s\'adapter aux pages PDF. Conservez toujours des copies de vos images originales.',
  },
  'qr-code': {
    en: 'Always test the generated QR code before distributing it. No guarantee is made regarding readability by all scanners.',
    fr: 'Testez toujours le QR code généré avant de le distribuer. Aucune garantie n\'est faite concernant la lisibilité par tous les scanners.',
  },
  'cert-inspect': {
    en: 'This tool displays certificate information for reference only. Do not rely on it for security audits or compliance decisions.',
    fr: 'Cet outil affiche les informations du certificat à titre indicatif uniquement. Ne vous y fiez pas pour des audits de sécurité ou des décisions de conformité.',
  },
  'cert-convert': {
    en: 'Always verify the converted certificate in your target system. Conversion errors may cause service disruptions. Keep a backup of your original certificate files.',
    fr: 'Vérifiez toujours le certificat converti dans votre système cible. Les erreurs de conversion peuvent causer des interruptions de service. Conservez une sauvegarde de vos fichiers de certificats originaux.',
  },
  'archive': {
    en: 'If you lose your password, the encrypted archive cannot be recovered. Always store your password securely and keep copies of your original files.',
    fr: 'Si vous perdez votre mot de passe, l\'archive chiffrée ne pourra pas être récupérée. Stockez toujours votre mot de passe en lieu sûr et conservez des copies de vos fichiers originaux.',
  },
  'yaml-json': {
    en: 'Conversion between YAML and JSON may alter formatting such as comments (not supported in JSON) or key ordering. Always keep a copy of your original file.',
    fr: 'La conversion entre YAML et JSON peut altérer le formatage comme les commentaires (non supportés en JSON) ou l\'ordre des clés. Conservez toujours une copie de votre fichier original.',
  },
  'audio-convert': {
    en: 'Audio conversion may slightly alter quality depending on the target format. Lossy formats (MP3, AAC) permanently reduce quality. Always keep a copy of your original file.',
    fr: 'La conversion audio peut légèrement altérer la qualité selon le format cible. Les formats avec perte (MP3, AAC) réduisent définitivement la qualité. Conservez toujours une copie de votre fichier original.',
  },
  'audio-extract': {
    en: 'Extracted audio quality depends on the source video. The original audio stream cannot be improved beyond its encoded quality. Always keep your original video file.',
    fr: 'La qualité de l\'audio extrait dépend de la vidéo source. Le flux audio original ne peut pas être amélioré au-delà de sa qualité encodée. Conservez toujours votre fichier vidéo original.',
  },
  'video-compress': {
    en: 'Video compression is lossy and will permanently reduce visual quality. Results may vary depending on the source video. Always keep a copy of your original file.',
    fr: 'La compression vidéo est avec perte et réduira définitivement la qualité visuelle. Les résultats peuvent varier selon la vidéo source. Conservez toujours une copie de votre fichier original.',
  },
  'video-to-gif': {
    en: 'GIF format has limited color depth (256 colors) and no audio. Large or long clips may produce very large files. Always keep your original video.',
    fr: 'Le format GIF a une profondeur de couleur limitée (256 couleurs) et pas de son. Les clips longs ou volumineux peuvent produire des fichiers très lourds. Conservez toujours votre vidéo originale.',
  },
  'mov-to-mp4': {
    en: 'Conversion re-encodes the video which may slightly alter quality. Always keep a copy of your original MOV file.',
    fr: 'La conversion ré-encode la vidéo, ce qui peut légèrement altérer la qualité. Conservez toujours une copie de votre fichier MOV original.',
  },
  'pdf-rotate': {
    en: 'Page operations may not preserve some interactive elements such as annotations or form fields. Always keep a copy of your original PDF.',
    fr: 'Les opérations sur les pages peuvent ne pas préserver certains éléments interactifs comme les annotations ou champs de formulaire. Conservez toujours une copie de votre PDF original.',
  },
  'pdf-password': {
    en: 'If you lose your password, the protected PDF cannot be recovered. PDF encryption strength depends on the reader software. Always store your password securely.',
    fr: 'Si vous perdez votre mot de passe, le PDF protégé ne pourra pas être récupéré. La force du chiffrement PDF dépend du logiciel lecteur. Stockez toujours votre mot de passe en lieu sûr.',
  },
  'pdf-extract-images': {
    en: 'Extracted images reflect the resolution and quality stored in the PDF. Some images may appear lower quality than expected. Always keep your original PDF.',
    fr: 'Les images extraites reflètent la résolution et la qualité stockées dans le PDF. Certaines images peuvent apparaître de qualité inférieure. Conservez toujours votre PDF original.',
  },
  'decompress': {
    en: 'Extracted files are provided as-is. Always scan extracted files with antivirus software before opening them. This tool does not verify file integrity or safety.',
    fr: 'Les fichiers extraits sont fournis tels quels. Analysez toujours les fichiers extraits avec un antivirus avant de les ouvrir. Cet outil ne vérifie pas l\'intégrité ni la sécurité des fichiers.',
  },
  'markdown-pdf': {
    en: 'PDF rendering may differ from your Markdown editor. Complex layouts, custom HTML, or external images may not be supported. Always preview the result.',
    fr: 'Le rendu PDF peut différer de votre éditeur Markdown. Les mises en page complexes, le HTML personnalisé ou les images externes peuvent ne pas être supportés. Vérifiez toujours le résultat.',
  },
  'csv-excel': {
    en: 'Conversion is performed entirely in your browser. Complex formatting, formulas, and multiple sheets may not be fully preserved. Always keep a copy of your original file.',
    fr: 'La conversion est effectuée entièrement dans votre navigateur. Le formatage complexe, les formules et les feuilles multiples peuvent ne pas être entièrement préservés. Conservez toujours une copie de votre fichier original.',
  },
  'json-csv': {
    en: 'Conversion is performed entirely in your browser. Nested JSON structures are flattened which may alter data representation. Always keep a copy of your original file.',
    fr: 'La conversion est effectuée entièrement dans votre navigateur. Les structures JSON imbriquées sont aplaties ce qui peut altérer la représentation des données. Conservez toujours une copie de votre fichier original.',
  },
  'base64': {
    en: 'Base64 encoding is not encryption — it provides no security. Do not use it to protect sensitive data. Encoded output is approximately 33% larger than the original.',
    fr: 'L\'encodage Base64 n\'est pas du chiffrement — il ne fournit aucune sécurité. Ne l\'utilisez pas pour protéger des données sensibles. Le résultat encodé est environ 33% plus volumineux que l\'original.',
  },
  'word-counter': {
    en: 'Word and character counts are approximate and may vary slightly from other tools depending on how whitespace and special characters are handled.',
    fr: 'Les comptages de mots et caractères sont approximatifs et peuvent varier légèrement par rapport à d\'autres outils selon le traitement des espaces et caractères spéciaux.',
  },
  'ascii': {
    en: 'Conversion is performed entirely in your browser — your image is never uploaded. Results depend on image contrast and resolution. For best results, use high-contrast images.',
    fr: 'La conversion est effectuée entièrement dans votre navigateur — votre image n\'est jamais envoyée. Les résultats dépendent du contraste et de la résolution de l\'image. Pour de meilleurs résultats, utilisez des images à fort contraste.',
  },
  'hash-generator': {
    en: 'All hashing is performed entirely in your browser — your files and text are never uploaded. MD5 and SHA-1 are considered cryptographically weak and should not be used for security purposes.',
    fr: 'Tout le hachage est effectué entièrement dans votre navigateur — vos fichiers et textes ne sont jamais envoyés. MD5 et SHA-1 sont considérés comme cryptographiquement faibles et ne doivent pas être utilisés à des fins de sécurité.',
  },
  'font-convert': {
    en: 'Conversion may alter glyph hinting or design details. Always test the converted font in your target environment and keep a backup of the original file.',
    fr: 'La conversion peut altérer le hinting des glyphes ou des détails de conception. Testez toujours la police convertie dans votre environnement cible et conservez une copie du fichier original.',
  },
  'pdf-editor': {
    en: 'Page operations may not preserve some interactive elements such as annotations, form fields, or JavaScript actions. Always keep a copy of your original PDF.',
    fr: 'Les opérations sur les pages peuvent ne pas préserver certains éléments interactifs comme les annotations, champs de formulaire ou actions JavaScript. Conservez toujours une copie de votre PDF original.',
  },
  'ebook-convert': {
    en: 'Conversion between ebook formats may alter formatting, images, or table of contents. Always keep a copy of your original file and verify the result.',
    fr: 'La conversion entre formats d\'ebook peut altérer le formatage, les images ou la table des matières. Conservez toujours une copie de votre fichier original et vérifiez le résultat.',
  },
  'pdf-repair': {
    en: 'Repair attempts to fix corrupted PDF structures but cannot guarantee full recovery. Some data may be lost. Always keep a copy of your original file.',
    fr: 'La réparation tente de corriger les structures PDF corrompues mais ne peut garantir une récupération complète. Certaines données peuvent être perdues. Conservez toujours une copie de votre fichier original.',
  },
  'password-generator': {
    en: 'Generated passwords are created entirely in your browser and are never sent to any server. Always store your passwords in a secure password manager.',
    fr: 'Les mots de passe générés sont créés entièrement dans votre navigateur et ne sont jamais envoyés à un serveur. Stockez toujours vos mots de passe dans un gestionnaire de mots de passe sécurisé.',
  },
};

const LANGS: Lang[] = ['en', 'fr'];

interface ToolDisclaimerProps {
  toolId: string;
  children?: ReactNode;
}

export default function ToolDisclaimer({ toolId, children }: ToolDisclaimerProps) {
  const [lang, setLang] = useLang();

  const disclaimer = DISCLAIMERS[toolId];
  if (!disclaimer && !children) return null;

  const text = children ?? disclaimer?.[lang];

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

      <Box
        role="radiogroup"
        aria-label="Disclaimer language"
        sx={{
          display: 'inline-flex',
          flexShrink: 0,
          borderRadius: '6px',
          bgcolor: 'background.level1',
          border: '1px solid',
          borderColor: 'divider',
          p: '2px',
          ml: 1,
        }}
      >
        {LANGS.map((l) => (
          <Box
            key={l}
            component="button"
            role="radio"
            aria-checked={lang === l}
            onClick={() => setLang(l)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              px: 0.75,
              py: 0.25,
              minWidth: 24,
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.625rem',
              fontFamily: 'inherit',
              fontWeight: lang === l ? 650 : 400,
              letterSpacing: '0.04em',
              color: lang === l ? '#fff' : 'var(--joy-palette-text-tertiary)',
              bgcolor: lang === l ? 'primary.600' : 'transparent',
              transition: 'all 0.15s ease',
              outline: 'none',
              '&:hover': {
                color: lang === l ? '#fff' : 'var(--joy-palette-text-secondary)',
              },
              '&:focus-visible': {
                outline: '2px solid',
                outlineColor: 'primary.400',
                outlineOffset: '1px',
              },
            }}
          >
            {l.toUpperCase()}
          </Box>
        ))}
      </Box>
    </Box>
  );
}
