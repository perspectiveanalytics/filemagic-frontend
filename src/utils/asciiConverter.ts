// Character ramps ordered from darkest to lightest (for dark-on-light)
const CHARSETS = {
  standard: ' .:-=+*#%@',
  detailed: " .'`^\",:;Il!i><~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$",
  blocks: ' ░▒▓█',
} as const;

export type CharsetKey = keyof typeof CHARSETS;
export const CHARSET_LABELS: Record<CharsetKey, string> = {
  standard: 'Standard',
  detailed: 'Detailed',
  blocks: 'Block',
};

export interface AsciiOptions {
  width: number;       // output columns (characters per line)
  charset: CharsetKey;
  invert: boolean;     // swap light/dark mapping
  brightness: number;  // -100 to 100
  contrast: number;    // -100 to 100
  color: boolean;      // produce colored HTML output
}

export const DEFAULT_OPTIONS: AsciiOptions = {
  width: 100,
  charset: 'standard',
  invert: false,
  brightness: 0,
  contrast: 0,
  color: false,
};

/** Apply brightness + contrast adjustments to a 0-255 value. */
function adjustValue(v: number, brightness: number, contrast: number): number {
  // Brightness: simple offset (-100..100 mapped to -255..255)
  v += (brightness / 100) * 128;
  // Contrast: scale around midpoint
  const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
  v = factor * (v - 128) + 128;
  return Math.max(0, Math.min(255, v));
}

/** Perceived luminance using rec.709 coefficients. */
function luminance(r: number, g: number, b: number): number {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Convert an image (via its ImageBitmap or HTMLImageElement) to ASCII art.
 * Returns plain text (monochrome) or HTML string (color mode).
 */
export function imageToAscii(
  img: HTMLImageElement | ImageBitmap,
  options: AsciiOptions,
): { text: string; html: string; rows: number; cols: number } {
  const chars = CHARSETS[options.charset];
  const cols = options.width;

  // Character cells are roughly twice as tall as wide in monospace fonts,
  // so we sample fewer rows to maintain aspect ratio.
  const aspectRatio = 0.5;
  const imgW = 'naturalWidth' in img ? img.naturalWidth : img.width;
  const imgH = 'naturalHeight' in img ? img.naturalHeight : img.height;
  const cellW = imgW / cols;
  const cellH = cellW / aspectRatio;
  const rows = Math.max(1, Math.round(imgH / cellH));

  // Draw to an offscreen canvas at the target resolution for fast sampling
  const canvas = document.createElement('canvas');
  canvas.width = cols;
  canvas.height = rows;
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0, cols, rows);
  const imageData = ctx.getImageData(0, 0, cols, rows);
  const data = imageData.data;

  const { brightness, contrast, invert, color } = options;
  const textLines: string[] = [];
  const htmlLines: string[] = [];

  for (let y = 0; y < rows; y++) {
    let textLine = '';
    let htmlLine = '';

    for (let x = 0; x < cols; x++) {
      const idx = (y * cols + x) * 4;
      let r = data[idx];
      let g = data[idx + 1];
      let b = data[idx + 2];

      // Apply brightness/contrast
      if (brightness !== 0 || contrast !== 0) {
        r = adjustValue(r, brightness, contrast);
        g = adjustValue(g, brightness, contrast);
        b = adjustValue(b, brightness, contrast);
      }

      let lum = luminance(r, g, b);
      if (invert) lum = 255 - lum;

      // Map luminance to character index
      const charIdx = Math.min(
        chars.length - 1,
        Math.floor((lum / 255) * chars.length),
      );
      const ch = chars[charIdx];
      textLine += ch;

      if (color) {
        // For color mode, use the adjusted pixel color
        const dr = invert ? 255 - Math.round(r) : Math.round(r);
        const dg = invert ? 255 - Math.round(g) : Math.round(g);
        const db = invert ? 255 - Math.round(b) : Math.round(b);
        const hex = `#${((1 << 24) + (dr << 16) + (dg << 8) + db).toString(16).slice(1)}`;
        // Use &nbsp; for space characters so they're visible in HTML
        const displayChar = ch === ' ' ? '\u00a0' : escapeHtml(ch);
        htmlLine += `<span style="color:${hex}">${displayChar}</span>`;
      }
    }

    textLines.push(textLine);
    if (color) htmlLines.push(htmlLine);
  }

  const text = textLines.join('\n');
  const html = color
    ? htmlLines.join('\n')
    : escapeHtml(text);

  return { text, html, rows, cols };
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Load a File into an HTMLImageElement. */
export function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    img.src = url;
  });
}
