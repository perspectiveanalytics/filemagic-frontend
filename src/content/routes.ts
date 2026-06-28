import { SITE, type Locale, canonicalPath } from './site';

export type ToolKey =
  | 'home'
  | 'image-convert'
  | 'heic-convert'
  | 'pdf-compress'
  | 'image-compress'
  | 'ocr'
  | 'metadata-remove'
  | 'pdf-merge'
  | 'image-to-pdf'
  | 'qr-code'
  | 'cert-inspect'
  | 'cert-convert'
  | 'archive-create'
  | 'password-generator'
  | 'yaml-json'
  | 'json-csv'
  | 'markdown-pdf'
  | 'audio-extract'
  | 'audio-convert'
  | 'video-compress'
  | 'mov-to-mp4'
  | 'video-to-gif'
  | 'pdf-password'
  | 'pdf-editor'
  | 'pdf-extract-images'
  | 'archive-decompress'
  | 'csv-excel'
  | 'ascii'
  | 'word-counter'
  | 'base64'
  | 'hash'
  | 'font-convert'
  | 'pdf-repair'
  | 'ebook-convert'
  | 'privacy'
  | 'terms'
  | 'legal'
  | 'security'
  | 'not-found';

export interface RouteCopy {
  title: string;
  navLabel: string;
  description: string;
  eyebrow?: string;
}

export interface RouteEntry {
  key: ToolKey;
  path: string;
  category: string;
  priority: number;
  keywords?: string;
  copy: Record<Locale, RouteCopy>;
}

const same = (title: string, description: string, navLabel = title): Record<Locale, RouteCopy> => ({
  en: { title, navLabel, description },
  fr: { title, navLabel, description },
});

const baseRoutes: RouteEntry[] = [
  {
    key: 'home',
    path: '/',
    category: 'FileMagic',
    priority: 1,
    copy: {
      en: {
        title: 'Free Private File Conversion',
        navLabel: 'Home',
        description:
          'Free, private file conversion tools. Compress PDFs and videos, convert images, generate QR codes, extract text with OCR, and more. No signup required.',
      },
      fr: {
        title: 'Conversion de fichiers gratuite et privée',
        navLabel: 'Accueil',
        description:
          'Des outils gratuits et privés pour compresser des PDF et vidéos, convertir des images, générer des QR codes, extraire du texte avec OCR, et plus encore. Sans inscription.',
      },
    },
  },
  {
    key: 'image-convert',
    path: '/convert/image',
    category: 'Image',
    priority: 0.8,
    copy: same(
      'Image Tools',
      'Convert HEIC, PNG, JPG, WebP, TIFF, BMP, and SVG images. Crop, resize, export PDF or ICO, and generate favicon packages. Free, no signup.',
    ),
  },
  {
    key: 'heic-convert',
    path: '/convert/heic',
    category: 'Image',
    priority: 0.8,
    copy: same(
      'HEIC Convert',
      'Convert Apple HEIC images to JPG, PNG, WebP, or TIFF for free. No signup, short-lived processing.',
    ),
  },
  {
    key: 'image-compress',
    path: '/compress/image',
    category: 'Image',
    priority: 0.8,
    copy: same(
      'Image Compress',
      'Compress JPG or PNG images to a target file size. Free, no signup, short-lived processing.',
    ),
  },
  {
    key: 'ocr',
    path: '/ocr',
    category: 'Image',
    priority: 0.8,
    copy: same(
      'OCR - Text Extraction',
      'Extract text from images and PDFs with OCR. Free, no signup, short-lived processing.',
      'OCR',
    ),
  },
  {
    key: 'metadata-remove',
    path: '/metadata/remove',
    category: 'Image',
    priority: 0.8,
    copy: same(
      'Metadata Inspector & Remover',
      'Inspect or strip EXIF, GPS, and other metadata from images and PDFs for privacy. Free, no signup, short-lived processing.',
      'Metadata',
    ),
  },
  {
    key: 'pdf-compress',
    path: '/compress/pdf',
    category: 'PDF',
    priority: 0.8,
    copy: same(
      'PDF Compress',
      'Reduce PDF file size with adjustable quality, lossy compression, or target file size. Free, no signup, short-lived processing.',
    ),
  },
  {
    key: 'pdf-editor',
    path: '/edit/pdf',
    category: 'PDF',
    priority: 0.8,
    copy: same(
      'PDF Editor',
      'Edit PDF pages: rotate, reorder, delete, extract, add watermarks, page numbers, and redact content. Free, private, no signup.',
    ),
  },
  {
    key: 'pdf-merge',
    path: '/merge/pdf',
    category: 'PDF',
    priority: 0.8,
    copy: same(
      'Merge PDFs',
      'Combine multiple PDF files and images into one PDF document for free. No signup, short-lived processing.',
    ),
  },
  {
    key: 'image-to-pdf',
    path: '/merge/image-to-pdf',
    category: 'PDF',
    priority: 0.8,
    copy: same(
      'Images to PDF',
      'Convert one or multiple images into a single PDF document for free. No signup, short-lived processing.',
    ),
  },
  {
    key: 'pdf-password',
    path: '/convert/pdf-password',
    category: 'PDF',
    priority: 0.7,
    copy: same('PDF Password', 'Add or remove PDF password protection for free.'),
  },
  {
    key: 'pdf-extract-images',
    path: '/convert/pdf-extract-images',
    category: 'PDF',
    priority: 0.7,
    copy: same('Extract Images from PDF', 'Extract up to 200 embedded images from a PDF file for free. Download individually or as ZIP.', 'Extract Images'),
  },
  {
    key: 'pdf-repair',
    path: '/repair/pdf',
    category: 'PDF',
    priority: 0.7,
    copy: same(
      'PDF Repair',
      'Repair corrupted or broken PDF files. Fix cross-reference errors, invalid objects and structural issues. Free, no signup.',
    ),
  },
  {
    key: 'markdown-pdf',
    path: '/convert/markdown-pdf',
    category: 'PDF',
    priority: 0.7,
    copy: same(
      'Markdown to PDF',
      'Convert Markdown files to formatted PDF for free. No signup, short-lived processing.',
    ),
  },
  {
    key: 'audio-extract',
    path: '/convert/audio-extract',
    category: 'Audio / Video',
    priority: 0.7,
    copy: same(
      'Extract Audio',
      'Extract audio track from video files for free. No signup, short-lived processing.',
    ),
  },
  {
    key: 'audio-convert',
    path: '/convert/audio',
    category: 'Audio / Video',
    priority: 0.7,
    copy: same(
      'Audio Convert',
      'Convert between MP3, WAV, FLAC and AAC for free. No signup, short-lived processing.',
    ),
  },
  {
    key: 'video-compress',
    path: '/compress/video',
    category: 'Audio / Video',
    priority: 0.7,
    copy: same('Video Compress', 'Compress MP4, MOV, MKV and AVI videos for free. Quality or target size mode.'),
  },
  {
    key: 'mov-to-mp4',
    path: '/convert/mov-to-mp4',
    category: 'Audio / Video',
    priority: 0.7,
    copy: same('MOV to MP4', 'Convert MOV videos to MP4 for free. No signup, short-lived processing.'),
  },
  {
    key: 'video-to-gif',
    path: '/convert/video-to-gif',
    category: 'Audio / Video',
    priority: 0.7,
    copy: same('Video to GIF', 'Convert video clips to animated GIFs for free. Preview and trim before converting.'),
  },
  {
    key: 'cert-inspect',
    path: '/inspect/certificate',
    category: 'Security',
    priority: 0.7,
    copy: same(
      'Certificate Inspector',
      'Inspect SSL/TLS certificates. View subject, issuer, validity, SANs, key usage, and trust status. Supports PEM, DER, P12, P7B formats.',
      'Cert Inspector',
    ),
  },
  {
    key: 'cert-convert',
    path: '/convert/certificate',
    category: 'Security',
    priority: 0.7,
    copy: same(
      'Certificate Converter',
      'Convert certificates between PEM, DER, P12/PFX, and P7B formats. Free, no signup required.',
      'Cert Convert',
    ),
  },
  {
    key: 'archive-create',
    path: '/archive/create',
    category: 'Security',
    priority: 0.7,
    copy: same(
      'Compress & Encrypt',
      'Compress files into ZIP, 7z, tar.gz, or tar.zst archives. Optional AES-256 encryption for ZIP and 7z. Free, no signup.',
      'Encrypt & Compress',
    ),
  },
  {
    key: 'archive-decompress',
    path: '/archive/decompress',
    category: 'Security',
    priority: 0.7,
    copy: same('Decompress Archive', 'Extract ZIP, RAR, 7Z, TAR archives for free. Supports password-protected archives.', 'Decompress'),
  },
  {
    key: 'password-generator',
    path: '/generate/password',
    category: 'Security',
    priority: 0.7,
    copy: same(
      'Password Generator',
      'Generate secure random passwords with QWERTY/AZERTY keyboard-safe option. Free, no signup, runs entirely in your browser.',
      'Password',
    ),
  },
  {
    key: 'qr-code',
    path: '/qrcode',
    category: 'Utilities',
    priority: 0.8,
    copy: same(
      'QR Code Generator',
      'Generate QR codes for URLs, text and WiFi networks. Customizable colors, shapes and error correction. Free, no signup.',
      'QR Code',
    ),
  },
  {
    key: 'yaml-json',
    path: '/convert/yaml',
    category: 'Utilities',
    priority: 0.7,
    copy: same(
      'YAML / JSON Converter',
      'Convert between YAML and JSON, format, minify, validate, sort keys, and visualize with a tree view. Detect type coercion issues. Free, runs in your browser.',
      'YAML / JSON',
    ),
  },
  {
    key: 'json-csv',
    path: '/convert/json-csv',
    category: 'Utilities',
    priority: 0.7,
    copy: same(
      'JSON / CSV Converter',
      'Convert between JSON arrays and CSV. Free, runs entirely in your browser. No data leaves your device.',
      'JSON / CSV',
    ),
  },
  {
    key: 'csv-excel',
    path: '/convert/csv-excel',
    category: 'Utilities',
    priority: 0.7,
    copy: same('CSV / Excel', 'Convert between CSV and Excel for free. 100% client-side, no upload.'),
  },
  {
    key: 'word-counter',
    path: '/tools/word-counter',
    category: 'Utilities',
    priority: 0.6,
    copy: same(
      'Word Counter',
      'Count words, characters, sentences and paragraphs. Estimate reading time. Free, no signup, runs entirely in your browser.',
    ),
  },
  {
    key: 'base64',
    path: '/tools/base64',
    category: 'Utilities',
    priority: 0.6,
    copy: same(
      'Base64 Encode / Decode',
      'Encode and decode Base64 text or files. Free, no signup, runs entirely in your browser.',
      'Base64',
    ),
  },
  {
    key: 'hash',
    path: '/tools/hash',
    category: 'Utilities',
    priority: 0.6,
    copy: same(
      'Hash Generator',
      'Compute MD5, SHA-1, SHA-256, SHA-384 and SHA-512 hashes for files and text. Free, no signup, runs entirely in your browser.',
    ),
  },
  {
    key: 'ascii',
    path: '/convert/ascii',
    category: 'Utilities',
    priority: 0.6,
    copy: same('ASCII Art', 'Convert images to ASCII art. Free, client-side, no upload needed.'),
  },
  {
    key: 'font-convert',
    path: '/convert/font',
    category: 'Utilities',
    priority: 0.7,
    copy: same('Font Converter', 'Convert fonts between TTF, OTF, WOFF and WOFF2 formats. Free, no signup required.', 'Font Convert'),
  },
  {
    key: 'ebook-convert',
    path: '/convert/ebook',
    category: 'Utilities',
    priority: 0.7,
    copy: same('Ebook Converter', 'Convert ebooks to EPUB, MOBI, AZW3, TXT, FB2, DOCX, or HTML. Free, no signup required.', 'Ebook Convert'),
  },
  {
    key: 'security',
    path: '/security',
    category: 'Company',
    priority: 0.5,
    copy: same(
      'Security',
      'How FileMagic reduces file exposure with short-lived processing, isolated workers, resource limits, and abuse protection.',
    ),
  },
  {
    key: 'privacy',
    path: '/privacy',
    category: 'Company',
    priority: 0.3,
    copy: same('Privacy Policy', 'FileMagic privacy policy. Files are processed transiently, with no ads, no tracking analytics, and no tracking cookies.', 'Privacy'),
  },
  {
    key: 'terms',
    path: '/terms',
    category: 'Company',
    priority: 0.3,
    copy: same('Terms of Service', 'FileMagic terms of service. Free file conversion with no signup required.', 'Terms'),
  },
  {
    key: 'legal',
    path: '/legal',
    category: 'Company',
    priority: 0.3,
    copy: same('Legal Notice', 'FileMagic legal notice (mentions légales). Publisher and hosting information.', 'Legal'),
  },
];

const frenchOverrides: Partial<Record<ToolKey, RouteCopy>> = {
  'image-convert': {
    title: 'Outils image',
    navLabel: 'Outils image',
    description:
      'Convertissez des images HEIC, PNG, JPG, WebP, TIFF, BMP et SVG. Recadrez, redimensionnez, exportez en PDF ou ICO, et générez des packs favicon. Gratuit, sans inscription.',
  },
  'heic-convert': {
    title: 'Convertisseur HEIC',
    navLabel: 'HEIC',
    description: 'Convertissez les images Apple HEIC en JPG, PNG, WebP ou TIFF gratuitement. Sans inscription, traitement transitoire.',
  },
  'image-compress': {
    title: 'Compression d’image',
    navLabel: 'Compression image',
    description: 'Compressez des images JPG ou PNG vers une taille cible. Gratuit, sans inscription, traitement transitoire.',
  },
  ocr: {
    title: 'OCR - extraction de texte',
    navLabel: 'OCR',
    description: 'Extrayez le texte d’images et de PDF avec OCR. Gratuit, sans inscription, traitement transitoire.',
  },
  'metadata-remove': {
    title: 'Inspecteur et suppression de métadonnées',
    navLabel: 'Métadonnées',
    description: 'Inspectez ou supprimez les métadonnées EXIF, GPS et autres d’images et de PDF pour protéger la confidentialité.',
  },
  'pdf-compress': {
    title: 'Compression PDF',
    navLabel: 'Compression PDF',
    description: 'Réduisez la taille de PDF avec qualité ajustable, compression avec perte ou taille cible. Gratuit, sans inscription.',
  },
  'pdf-editor': {
    title: 'Éditeur PDF',
    navLabel: 'Éditeur PDF',
    description: 'Modifiez les pages PDF : rotation, réorganisation, suppression, extraction, filigranes, numéros de page et masquage.',
  },
  'pdf-merge': {
    title: 'Fusionner des PDF',
    navLabel: 'Fusionner PDF',
    description: 'Combinez plusieurs fichiers PDF et images dans un seul document PDF gratuitement. Sans inscription, traitement transitoire.',
  },
  'image-to-pdf': {
    title: 'Images en PDF',
    navLabel: 'Images en PDF',
    description: 'Convertissez une ou plusieurs images en un seul document PDF gratuitement. Sans inscription, traitement transitoire.',
  },
  'pdf-password': {
    title: 'Mot de passe PDF',
    navLabel: 'Mot de passe PDF',
    description: 'Ajoutez ou supprimez la protection par mot de passe d’un PDF gratuitement.',
  },
  'pdf-extract-images': {
    title: 'Extraire les images d’un PDF',
    navLabel: 'Extraire images',
    description: 'Extrayez jusqu’à 200 images intégrées d’un fichier PDF gratuitement. Téléchargement individuel ou en ZIP.',
  },
  'pdf-repair': {
    title: 'Réparation PDF',
    navLabel: 'Réparation PDF',
    description: 'Réparez des fichiers PDF corrompus ou cassés. Corrigez les erreurs de références, objets invalides et problèmes de structure.',
  },
  'markdown-pdf': {
    title: 'Markdown en PDF',
    navLabel: 'Markdown en PDF',
    description: 'Convertissez des fichiers Markdown en PDF formaté gratuitement. Sans inscription, traitement transitoire.',
  },
  'audio-extract': {
    title: 'Extraire l’audio',
    navLabel: 'Extraire audio',
    description: 'Extrayez la piste audio de fichiers vidéo gratuitement. Sans inscription, traitement transitoire.',
  },
  'audio-convert': {
    title: 'Conversion audio',
    navLabel: 'Conversion audio',
    description: 'Convertissez entre MP3, WAV, FLAC et AAC gratuitement. Sans inscription, traitement transitoire.',
  },
  'video-compress': {
    title: 'Compression vidéo',
    navLabel: 'Compression vidéo',
    description: 'Compressez des vidéos MP4, MOV, MKV et AVI gratuitement. Mode qualité ou taille cible.',
  },
  'mov-to-mp4': {
    title: 'MOV en MP4',
    navLabel: 'MOV en MP4',
    description: 'Convertissez des vidéos MOV en MP4 gratuitement. Sans inscription, traitement transitoire.',
  },
  'video-to-gif': {
    title: 'Vidéo en GIF',
    navLabel: 'Vidéo en GIF',
    description: 'Convertissez des extraits vidéo en GIF animés. Prévisualisez et découpez avant la conversion.',
  },
  'cert-inspect': {
    title: 'Inspecteur de certificat',
    navLabel: 'Inspecteur cert.',
    description: 'Inspectez les certificats SSL/TLS : sujet, émetteur, validité, SAN, usages de clé et statut de confiance.',
  },
  'cert-convert': {
    title: 'Convertisseur de certificat',
    navLabel: 'Conversion cert.',
    description: 'Convertissez des certificats entre PEM, DER, P12/PFX et P7B. Gratuit, sans inscription.',
  },
  'archive-create': {
    title: 'Compresser et chiffrer',
    navLabel: 'Chiffrer archive',
    description: 'Compressez des fichiers en ZIP, 7z, tar.gz ou tar.zst. Chiffrement AES-256 optionnel pour ZIP et 7z.',
  },
  'archive-decompress': {
    title: 'Décompresser une archive',
    navLabel: 'Décompresser',
    description: 'Extrayez des archives ZIP, RAR, 7Z et TAR gratuitement. Prend en charge les archives protégées par mot de passe.',
  },
  'password-generator': {
    title: 'Générateur de mots de passe',
    navLabel: 'Mot de passe',
    description: 'Générez des mots de passe aléatoires sécurisés avec option compatible clavier QWERTY/AZERTY. Gratuit, dans le navigateur.',
  },
  'qr-code': {
    title: 'Générateur de QR code',
    navLabel: 'QR code',
    description: 'Générez des QR codes pour URL, texte et réseaux WiFi. Couleurs, formes et correction d’erreur configurables.',
  },
  'yaml-json': {
    title: 'Convertisseur YAML / JSON',
    navLabel: 'YAML / JSON',
    description: 'Convertissez entre YAML et JSON, formatez, minifiez, validez, triez les clés et visualisez en arbre.',
  },
  'json-csv': {
    title: 'Convertisseur JSON / CSV',
    navLabel: 'JSON / CSV',
    description: 'Convertissez entre tableaux JSON et CSV. Gratuit, entièrement dans votre navigateur. Aucune donnée ne quitte votre appareil.',
  },
  'csv-excel': {
    title: 'CSV / Excel',
    navLabel: 'CSV / Excel',
    description: 'Convertissez entre CSV et Excel gratuitement. 100 % côté client, sans envoi de fichier.',
  },
  'word-counter': {
    title: 'Compteur de mots',
    navLabel: 'Compteur de mots',
    description: 'Comptez mots, caractères, phrases et paragraphes. Estimez le temps de lecture. Gratuit, sans inscription.',
  },
  base64: {
    title: 'Encoder / décoder Base64',
    navLabel: 'Base64',
    description: 'Encodez et décodez du texte ou des fichiers Base64. Gratuit, sans inscription, entièrement dans votre navigateur.',
  },
  hash: {
    title: 'Générateur de hash',
    navLabel: 'Hash',
    description: 'Calculez des hash MD5, SHA-1, SHA-256, SHA-384 et SHA-512 pour fichiers et texte. Gratuit, dans le navigateur.',
  },
  ascii: {
    title: 'Art ASCII',
    navLabel: 'Art ASCII',
    description: 'Convertissez des images en art ASCII. Gratuit, côté client, sans envoi de fichier.',
  },
  'font-convert': {
    title: 'Convertisseur de polices',
    navLabel: 'Polices',
    description: 'Convertissez des polices entre TTF, OTF, WOFF et WOFF2. Gratuit, sans inscription.',
  },
  'ebook-convert': {
    title: 'Convertisseur d’ebooks',
    navLabel: 'Ebooks',
    description: 'Convertissez des ebooks vers EPUB, MOBI, AZW3, TXT, FB2, DOCX ou HTML. Gratuit, sans inscription.',
  },
  security: {
    title: 'Sécurité',
    navLabel: 'Sécurité',
    description: 'Comment FileMagic limite l’exposition des fichiers avec traitement transitoire, workers isolés, limites de ressources et protection anti-abus.',
  },
  privacy: {
    title: 'Politique de confidentialité',
    navLabel: 'Confidentialité',
    description: 'Politique de confidentialité de FileMagic. Fichiers traités de façon transitoire, sans publicité, analytics de suivi ni cookies de suivi.',
  },
  terms: {
    title: 'Conditions d’utilisation',
    navLabel: 'Conditions',
    description: 'Conditions d’utilisation de FileMagic. Conversion de fichiers gratuite, sans inscription.',
  },
  legal: {
    title: 'Mentions légales',
    navLabel: 'Mentions légales',
    description: 'Mentions légales de FileMagic. Informations sur l’éditeur et l’hébergement.',
  },
};

const routeKeywords: Partial<Record<ToolKey, string>> = {
  home: 'home accueil filemagic tools outils convert conversion private privé',
  'image-convert': 'jpg png webp bmp tiff ico favicon svg vector raster format transform convert crop resize aspect ratio dimensions image photo',
  'heic-convert': 'heif iphone apple photo image convert',
  'image-compress': 'jpg png resize quality reduce shrink crop aspect ratio dimensions compress image photo',
  ocr: 'text extract scan read recognize image pdf ocr texte scanner reconnaissance',
  'metadata-remove': 'exif gps strip privacy location inspect remove metadata données localisation',
  'pdf-compress': 'pdf reduce shrink smaller size optimize compress compression',
  'pdf-editor': 'pdf edit rotate reorder delete split extract watermark stamp page numbers redact redaction édition modifier pivoter supprimer filigrane',
  'pdf-merge': 'pdf combine join concatenate merge fusionner assembler images photos jpg png',
  'image-to-pdf': 'combine photos pictures document image pdf',
  'pdf-password': 'pdf password protect encrypt decrypt remove lock unlock mot de passe chiffrer déchiffrer',
  'pdf-extract-images': 'pdf images extract pictures photos extraire',
  'pdf-repair': 'pdf repair fix broken corrupted recover réparer corrompu',
  'markdown-pdf': 'md markdown convert document pdf',
  'audio-extract': 'video mp4 mkv avi mov audio extract mp3 wav flac extraire',
  'audio-convert': 'mp3 wav flac m4a aac audio convert format',
  'video-compress': 'mp4 mkv avi mov video compress reduce size quality vidéo compression',
  'mov-to-mp4': 'mov mp4 quicktime apple convert video',
  'video-to-gif': 'video gif animated clip convert trim animé',
  'cert-inspect': 'certificate ssl tls x509 pem der p12 pfx inspect view details certificat inspecter',
  'cert-convert': 'certificate ssl tls pem der p12 pfx p7b convert format certificat',
  'archive-create': 'zip 7z tar gz zst encrypt compress archive password chiffrer compresser',
  'archive-decompress': 'unzip extract rar 7z tar gz decompress unarchive décompresser extraire',
  'password-generator': 'password generator random secure qwerty azerty mot de passe générateur',
  'qr-code': 'qr qrcode barcode link url wifi wi-fi wireless network ssid generate code',
  'yaml-json': 'yaml json convert format validate tree coercion',
  'json-csv': 'json csv convert table data spreadsheet',
  'csv-excel': 'csv excel xlsx spreadsheet convert table',
  ascii: 'ascii art text image convert monochrome color character',
  'word-counter': 'count words characters sentences paragraphs reading time compteur mots caractères lecture',
  base64: 'base64 encode decode binary text encoder décoder',
  hash: 'hash checksum md5 sha1 sha256 sha512 digest verify empreinte',
  'font-convert': 'font ttf otf woff woff2 convert web typography police',
  'ebook-convert': 'ebook epub mobi azw3 kindle pdf fb2 convert livre numérique',
};

export const routes: RouteEntry[] = baseRoutes.map((route) => ({
  ...route,
  keywords: routeKeywords[route.key],
  copy: {
    ...route.copy,
    fr: frenchOverrides[route.key] ?? route.copy.fr,
  },
}));

export const routeByPath = new Map(routes.map((route) => [route.path, route]));
export const routeByKey = new Map(routes.map((route) => [route.key, route]));

export const navGroups = ['Image', 'PDF', 'Audio / Video', 'Security', 'Utilities'] as const;

export const browserOnlyToolKeys = new Set<ToolKey>([
  'password-generator',
  'yaml-json',
  'json-csv',
  'csv-excel',
  'ascii',
  'word-counter',
  'base64',
  'hash',
]);

export function isBrowserOnlyRoute(route: RouteEntry) {
  return browserOnlyToolKeys.has(route.key);
}

const categoryLabels: Record<Locale, Record<string, string>> = {
  en: {
    FileMagic: 'FileMagic',
    Image: 'Image',
    PDF: 'PDF',
    'Audio / Video': 'Audio / Video',
    Security: 'Security',
    Utilities: 'Utilities',
    Company: 'Company',
  },
  fr: {
    FileMagic: 'FileMagic',
    Image: 'Image',
    PDF: 'PDF',
    'Audio / Video': 'Audio / Vidéo',
    Security: 'Sécurité',
    Utilities: 'Utilitaires',
    Company: 'Société',
  },
};

export function categoryLabel(category: string, locale: Locale) {
  return categoryLabels[locale][category] ?? category;
}

export function routeSearchText(route: RouteEntry, locale: Locale) {
  const otherLocale = locale === 'fr' ? 'en' : 'fr';
  return [
    route.copy[locale].title,
    route.copy[locale].navLabel,
    route.copy[otherLocale].title,
    route.copy[otherLocale].navLabel,
    categoryLabel(route.category, locale),
    categoryLabel(route.category, otherLocale),
    route.category,
    route.key,
    route.path,
    route.keywords,
  ]
    .filter(Boolean)
    .join(' ');
}

export function routeSearchPrimary(route: RouteEntry, locale: Locale) {
  return [route.copy[locale].navLabel, route.copy[locale].title].filter(Boolean).join(' ');
}

export function getRoute(path: string) {
  return routeByPath.get(path);
}

export function pageTitle(route: RouteEntry, locale: Locale) {
  const title = route.copy[locale].title;
  return route.path === '/' ? `${SITE.name} - ${title}` : `${title} - ${SITE.name}`;
}

export function canonicalUrl(route: RouteEntry, locale: Locale) {
  return `${SITE.url}${canonicalPath(route.path, locale)}`;
}

export function webApplicationSchema(route: RouteEntry, locale: Locale) {
  const copy = route.copy[locale];

  if (route.path === '/') {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: SITE.name,
      url: canonicalUrl(route, locale),
      description: copy.description,
    };
  }

  if (route.category === 'Company') {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: `${copy.title} - ${SITE.name}`,
      url: canonicalUrl(route, locale),
      description: copy.description,
    };
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: `${SITE.name} - ${copy.title}`,
    url: canonicalUrl(route, locale),
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    description: copy.description,
  };
}
