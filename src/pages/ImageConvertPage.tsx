import { useState, useCallback, useEffect, useRef } from 'react';
import { Box, Typography, Select, Option, FormControl, FormLabel, Input, Checkbox } from '@mui/joy';
import ReactCrop, { type PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';
import CropOutlinedIcon from '@mui/icons-material/CropOutlined';
import PhotoSizeSelectSmallOutlinedIcon from '@mui/icons-material/PhotoSizeSelectSmallOutlined';
import FavoriteOutlinedIcon from '@mui/icons-material/FavoriteOutlined';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import RotateLeftOutlinedIcon from '@mui/icons-material/RotateLeftOutlined';
import RotateRightOutlinedIcon from '@mui/icons-material/RotateRightOutlined';
import TextFieldsOutlinedIcon from '@mui/icons-material/TextFieldsOutlined';
import FileDropZone from '../components/FileDropZone';
import ConversionProgress from '../components/ConversionProgress';
import MultiFileResult from '../components/MultiFileResult';
import SEO, { buildToolSchema } from '../components/SEO';
import { useConversion } from '../hooks/useConversion';
import { useMultiFileConversion } from '../hooks/useMultiFileConversion';
import type { FileManifestEntry } from '../types/api';
import ToolDisclaimer from '../components/ToolDisclaimer';
import ToolSEOContent from '../components/ToolSEOContent';
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import { Trans, useLingui } from '@lingui/react/macro';

type Tab = 'convert' | 'crop' | 'resize' | 'watermark' | 'favicon';
type OutputFormat = 'jpg' | 'png' | 'webp' | 'tiff' | 'ico' | 'pdf';
type WatermarkPosition = 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'convert', label: 'Convert', icon: <SwapHorizOutlinedIcon sx={{ fontSize: 16 }} /> },
  { id: 'crop', label: 'Crop', icon: <CropOutlinedIcon sx={{ fontSize: 16 }} /> },
  { id: 'resize', label: 'Resize', icon: <PhotoSizeSelectSmallOutlinedIcon sx={{ fontSize: 16 }} /> },
  { id: 'watermark', label: 'Watermark', icon: <TextFieldsOutlinedIcon sx={{ fontSize: 16 }} /> },
  { id: 'favicon', label: 'Favicon', icon: <FavoriteOutlinedIcon sx={{ fontSize: 16 }} /> },
];

const chipSx = (active: boolean) => ({
  px: 2,
  py: 0.75,
  borderRadius: 'md',
  fontSize: '0.875rem',
  fontWeight: 600,
  cursor: 'pointer',
  border: '1px solid',
  borderColor: active ? 'primary.500' : 'divider',
  bgcolor: active ? 'primary.softBg' : 'transparent',
  color: active ? 'primary.plainColor' : 'text.secondary',
  transition: 'all 0.15s',
  outline: 'none',
  '&:hover': { borderColor: 'primary.400', bgcolor: 'primary.softBg' },
} as const);

function isSvgFile(file: File): boolean {
  return file.name.toLowerCase().endsWith('.svg') || file.type === 'image/svg+xml';
}

export default function ImageConvertPage() {
  const { t } = useLingui();
  const [tab, setTab] = useState<Tab>('convert');

  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [naturalSize, setNaturalSize] = useState<{ w: number; h: number } | null>(null);
  const [isSvg, setIsSvg] = useState(false);
  const imageUrlRef = useRef<string | null>(null);

  const [outputFormat, setOutputFormat] = useState<OutputFormat>('jpg');
  const [svgWidth, setSvgWidth] = useState<number | ''>('');

  const [crop, setCrop] = useState<PixelCrop | undefined>(undefined);
  const [completedCrop, setCompletedCrop] = useState<PixelCrop | undefined>(undefined);
  const [cropFormat, setCropFormat] = useState<OutputFormat>('jpg');
  const imgRef = useRef<HTMLImageElement | null>(null);

  const [resizeWidth, setResizeWidth] = useState<number | ''>('');
  const [resizeHeight, setResizeHeight] = useState<number | ''>('');
  const [lockAspect, setLockAspect] = useState(true);
  const [resizeFormat, setResizeFormat] = useState<OutputFormat>('jpg');

  const [watermarkText, setWatermarkText] = useState('');
  const [watermarkPosition, setWatermarkPosition] = useState<WatermarkPosition>('bottom-right');
  const [watermarkSize, setWatermarkSize] = useState<number>(24);
  const [watermarkColor, setWatermarkColor] = useState<'#ffffff' | '#000000'>('#ffffff');
  const [watermarkOpacity, setWatermarkOpacity] = useState<number>(50);
  const [watermarkFormat, setWatermarkFormat] = useState<OutputFormat>('png');

  // Shared across all tabs
  const [rotation, setRotation] = useState<0 | 90 | 180 | 270>(0);

  const conversion = useConversion('/convert/image');
  const faviconConversion = useMultiFileConversion('/convert/favicon');

  const conversionActive = conversion.status !== 'idle';
  const faviconActive = faviconConversion.status !== 'idle';
  const anyActive = conversionActive || faviconActive;
  const showEditor = file && imageUrl && !anyActive;

  useEffect(() => {
    return () => {
      if (imageUrlRef.current) URL.revokeObjectURL(imageUrlRef.current);
    };
  }, []);

  useEffect(() => {
    if (tab !== 'crop') {
      setCrop(undefined);
      setCompletedCrop(undefined);
    }
  }, [tab]);

  const handleFileSelect = useCallback((f: File) => {
    if (imageUrlRef.current) {
      URL.revokeObjectURL(imageUrlRef.current);
      imageUrlRef.current = null;
    }
    const url = URL.createObjectURL(f);
    imageUrlRef.current = url;
    setFile(f);
    setImageUrl(url);
    const svg = isSvgFile(f);
    setIsSvg(svg);
    if (svg) setTab('convert');

    const img = new Image();
    img.onload = () => setNaturalSize({ w: img.naturalWidth, h: img.naturalHeight });
    img.onerror = () => setImageUrl(null); // TIFF etc. can't be previewed by browsers
    img.src = url;
  }, []);

  const handleRemoveFile = useCallback(() => {
    if (imageUrlRef.current) {
      URL.revokeObjectURL(imageUrlRef.current);
      imageUrlRef.current = null;
    }
    setFile(null);
    setImageUrl(null);
    setNaturalSize(null);
    setIsSvg(false);
    setCrop(undefined);
    setCompletedCrop(undefined);
    setSvgWidth('');
    setResizeWidth('');
    setResizeHeight('');
    setWatermarkText('');
    setWatermarkPosition('bottom-right');
    setWatermarkSize(24);
    setWatermarkColor('#ffffff');
    setWatermarkOpacity(50);
    setWatermarkFormat('png');
    setRotation(0);
  }, []);

  const handleSubmit = useCallback(() => {
    if (!file) return;

    if (tab === 'convert') {
      if (isSvg) {
        const options: Record<string, number> = {};
        if (svgWidth) options.width = svgWidth;
        conversion.startConversion(file, options as never, '/convert/svg/png');
      } else {
        const options: Record<string, unknown> = { outputFormat };
        if (rotation) options.rotation = rotation;
        conversion.startConversion(file, options as never);
      }
    } else if (tab === 'crop') {
      const options: Record<string, unknown> = { outputFormat: cropFormat };
      if (rotation) options.rotation = rotation;
      if (completedCrop && completedCrop.width > 0 && completedCrop.height > 0 && imgRef.current) {
        // Scale from rendered image pixels to natural image pixels
        const scaleX = imgRef.current.naturalWidth / imgRef.current.width;
        const scaleY = imgRef.current.naturalHeight / imgRef.current.height;
        options.cropX = Math.round(completedCrop.x * scaleX);
        options.cropY = Math.round(completedCrop.y * scaleY);
        options.cropWidth = Math.round(completedCrop.width * scaleX);
        options.cropHeight = Math.round(completedCrop.height * scaleY);
      }
      conversion.startConversion(file, options as never);
    } else if (tab === 'resize') {
      const options: Record<string, unknown> = { outputFormat: resizeFormat, keepAspect: lockAspect };
      if (rotation) options.rotation = rotation;
      if (resizeWidth) options.resizeWidth = Number(resizeWidth);
      if (resizeHeight) options.resizeHeight = Number(resizeHeight);
      conversion.startConversion(file, options as never);
    } else if (tab === 'watermark') {
      const options: Record<string, unknown> = {
        outputFormat: watermarkFormat,
        watermarkText,
        watermarkPosition,
        watermarkSize,
        watermarkColor,
        watermarkOpacity,
      };
      if (rotation) options.rotation = rotation;
      conversion.startConversion(file, options as never);
    } else if (tab === 'favicon') {
      faviconConversion.startConversionWithOptions(file, {});
    }
  }, [file, tab, isSvg, svgWidth, outputFormat, rotation, cropFormat, completedCrop, resizeFormat, resizeWidth, resizeHeight, lockAspect, watermarkText, watermarkPosition, watermarkSize, watermarkColor, watermarkOpacity, watermarkFormat, conversion, faviconConversion]);

  const handleDownload = useCallback(() => {
    conversion.download();
    handleRemoveFile();
  }, [conversion, handleRemoveFile]);

  const handleRetry = useCallback(() => {
    conversion.reset();
    faviconConversion.reset();
    handleRemoveFile();
  }, [conversion, faviconConversion, handleRemoveFile]);

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    imgRef.current = e.currentTarget;
    const initialCrop = centerCrop(
      makeAspectCrop(
        { unit: '%', width: 80 },
        width / height,
        width,
        height,
      ),
      width,
      height,
    );
    // Convert to pixel crop for the state
    const pxCrop: PixelCrop = {
      unit: 'px',
      x: Math.round((initialCrop.x / 100) * width),
      y: Math.round((initialCrop.y / 100) * height),
      width: Math.round((initialCrop.width / 100) * width),
      height: Math.round((initialCrop.height / 100) * height),
    };
    setCrop(pxCrop);
    setCompletedCrop(pxCrop);
  }, []);

  const handleResizeWidth = useCallback((val: string) => {
    const w = val ? Number(val) : '' as const;
    setResizeWidth(w);
    if (lockAspect && w && naturalSize && naturalSize.h > 0) {
      setResizeHeight(Math.round(Number(w) * naturalSize.h / naturalSize.w));
    }
  }, [lockAspect, naturalSize]);

  const handleResizeHeight = useCallback((val: string) => {
    const h = val ? Number(val) : '' as const;
    setResizeHeight(h);
    if (lockAspect && h && naturalSize && naturalSize.w > 0) {
      setResizeWidth(Math.round(Number(h) * naturalSize.w / naturalSize.h));
    }
  }, [lockAspect, naturalSize]);

  const renderFaviconThumbnail = useCallback((entry: FileManifestEntry, url: string) => {
    if (!entry.type?.startsWith('image/')) return null;
    return (
      <Box
        component="img"
        src={url}
        alt={entry.name}
        loading="lazy"
        sx={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 'sm', flexShrink: 0, bgcolor: 'background.level2' }}
      />
    );
  }, []);

  // Determine if the current tab is SVG-incompatible
  const svgBlocked = isSvg && tab !== 'convert';

  return (
    <Box sx={{ maxWidth: 520, mx: 'auto', width: '100%', py: { xs: 3, md: 4 } }}>
      <SEO
        title={t`Image Tools`}
        description={t`Convert between HEIC, PNG, JPG, WebP, TIFF, BMP, SVG, ICO image formats. Crop, resize, and generate favicon packages. Free, no signup.`}
        path="/convert/image"
        structuredData={buildToolSchema(t`Image Tools`, t`Convert, crop, resize images and generate favicon packages.`, '/convert/image')}
      />
      <Typography component="h1" level="h3" sx={{ mb: 1, fontWeight: 700, letterSpacing: '-0.02em' }}><Trans>Image Tools</Trans></Typography>
      <Typography level="body-sm" sx={{ color: 'text.tertiary', mb: 3 }}><Trans>HEIC, PNG, JPG, WebP, TIFF, BMP, SVG, ICO</Trans></Typography>

      <ToolDisclaimer toolId="image-convert" />

      {!anyActive && (
        <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
          {TABS.map((t) => (
            <Box
              key={t.id}
              component="button"
              onClick={() => setTab(t.id)}
              sx={{
                ...chipSx(tab === t.id),
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.75,
              }}
            >
              {t.icon}
              {t.label}
            </Box>
          ))}
        </Box>
      )}

      {!file && !anyActive && (
        <FileDropZone
          onFileSelect={handleFileSelect}
          accept=".heic,.heif,.png,.jpg,.jpeg,.webp,.bmp,.tif,.tiff,.svg,image/*"
          maxSize={20 * 1024 * 1024}
          allowPaste
        />
      )}

      {showEditor && (
        <Box>
          {svgBlocked ? (
            <Box
              sx={{
                p: 3,
                mb: 2,
                borderRadius: 'lg',
                bgcolor: 'background.surface',
                border: '1px solid',
                borderColor: 'divider',
                textAlign: 'center',
              }}
            >
              <Typography level="body-sm" sx={{ color: 'text.tertiary' }}><Trans>SVG files need to be converted to PNG first.</Trans></Typography>
              <Box
                component="button"
                onClick={() => setTab('convert')}
                sx={{
                  ...chipSx(false),
                  mt: 1.5,
                  borderColor: 'primary.500',
                  color: 'primary.plainColor',
                }}
              >
                Go to Convert
              </Box>
            </Box>
          ) : (
            <>
              {tab === 'crop' ? (
                <Box
                  sx={{
                    mb: 2,
                    borderRadius: 'lg',
                    overflow: 'hidden',
                    bgcolor: 'neutral.900',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    '& .ReactCrop': { maxHeight: 400 },
                  }}
                >
                  <ReactCrop
                    crop={crop}
                    onChange={(c) => setCrop(c)}
                    onComplete={(c) => setCompletedCrop(c)}
                    keepSelection
                    ruleOfThirds
                  >
                    <Box
                      component="img"
                      src={imageUrl}
                      alt="Crop preview"
                      onLoad={onImageLoad}
                      sx={{ maxWidth: '100%', maxHeight: 400, display: 'block' }}
                    />
                  </ReactCrop>
                </Box>
              ) : (
                <Box
                  sx={{
                    mb: 2,
                    borderRadius: 'lg',
                    overflow: 'hidden',
                    bgcolor: 'neutral.900',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    maxHeight: 280,
                  }}
                >
                  {tab === 'resize' && naturalSize && (resizeWidth || resizeHeight) ? (() => {
                    // Compute the effective output dimensions
                    const targetW = resizeWidth ? Number(resizeWidth) : (lockAspect && resizeHeight ? Math.round(Number(resizeHeight) * naturalSize.w / naturalSize.h) : naturalSize.w);
                    const targetH = resizeHeight ? Number(resizeHeight) : (lockAspect && resizeWidth ? Math.round(Number(resizeWidth) * naturalSize.h / naturalSize.w) : naturalSize.h);
                    // Scale to fit the 280px container while preserving the target aspect ratio
                    const maxW = 480;
                    const maxH = 280;
                    const scale = Math.min(maxW / targetW, maxH / targetH, 1);
                    const displayW = Math.round(targetW * scale);
                    const displayH = Math.round(targetH * scale);
                    return (
                      <Box
                        component="img"
                        src={imageUrl}
                        alt="Resize preview"
                        sx={{
                          width: displayW,
                          height: displayH,
                          objectFit: 'fill',
                          transition: 'all 0.3s ease',
                          transform: rotation ? `rotate(${rotation}deg)` : undefined,
                        }}
                      />
                    );
                  })() : (
                    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                      <Box
                        component="img"
                        src={imageUrl}
                        alt="Preview"
                        sx={{
                          maxWidth: '100%',
                          maxHeight: 280,
                          objectFit: 'contain',
                          display: 'block',
                          transition: 'transform 0.3s ease',
                          transform: rotation ? `rotate(${rotation}deg)` : undefined,
                        }}
                      />
                      {tab === 'watermark' && watermarkText.trim() && (
                        <Typography
                          sx={{
                            position: 'absolute',
                            fontFamily: '"Liberation Sans", Arial, sans-serif',
                            fontSize: `${Math.max(10, watermarkSize * 0.5)}px`,
                            color: watermarkColor,
                            opacity: watermarkOpacity / 100,
                            pointerEvents: 'none',
                            whiteSpace: 'nowrap',
                            textShadow: watermarkColor === '#ffffff'
                              ? '0 1px 3px rgba(0,0,0,0.6)'
                              : '0 1px 3px rgba(255,255,255,0.6)',
                            ...(watermarkPosition === 'center' && {
                              top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                            }),
                            ...(watermarkPosition === 'top-left' && { top: 8, left: 8 }),
                            ...(watermarkPosition === 'top-right' && { top: 8, right: 8 }),
                            ...(watermarkPosition === 'bottom-left' && { bottom: 8, left: 8 }),
                            ...(watermarkPosition === 'bottom-right' && { bottom: 8, right: 8 }),
                          }}
                        >
                          {watermarkText}
                        </Typography>
                      )}
                    </Box>
                  )}
                </Box>
              )}

              {tab !== 'favicon' && (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 2 }}>
                  <Box
                    component="button"
                    onClick={() => setRotation(prev => ((prev - 90 + 360) % 360) as 0 | 90 | 180 | 270)}
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 0.5,
                      px: 1.5,
                      py: 0.75,
                      borderRadius: 'md',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      border: '1px solid',
                      borderColor: 'divider',
                      bgcolor: 'transparent',
                      color: 'text.secondary',
                      outline: 'none',
                      transition: 'all 0.15s',
                      '&:hover': { borderColor: 'neutral.500', color: 'text.primary', bgcolor: 'background.level1' },
                    }}
                  >
                    <RotateLeftOutlinedIcon sx={{ fontSize: 16 }} />
                    Left
                  </Box>
                  <Box
                    component="button"
                    onClick={() => setRotation(prev => ((prev + 90) % 360) as 0 | 90 | 180 | 270)}
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 0.5,
                      px: 1.5,
                      py: 0.75,
                      borderRadius: 'md',
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      border: '1px solid',
                      borderColor: 'divider',
                      bgcolor: 'transparent',
                      color: 'text.secondary',
                      outline: 'none',
                      transition: 'all 0.15s',
                      '&:hover': { borderColor: 'neutral.500', color: 'text.primary', bgcolor: 'background.level1' },
                    }}
                  >
                    <RotateRightOutlinedIcon sx={{ fontSize: 16 }} />
                    Right
                  </Box>
                  {rotation !== 0 && (
                    <Typography level="body-xs" sx={{ color: 'primary.plainColor', fontWeight: 600 }}>
                      {rotation}°
                    </Typography>
                  )}
                </Box>
              )}

              <Box
                sx={{
                  p: 2.5,
                  mb: 2,
                  borderRadius: 'lg',
                  bgcolor: 'background.surface',
                  border: '1px solid',
                  borderColor: 'divider',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2.5,
                }}
              >
                {tab === 'convert' && (
                  isSvg ? (
                    <>
                      <Typography level="body-sm" sx={{ color: 'text.secondary', fontWeight: 600 }}><Trans>SVG &rarr; PNG</Trans></Typography>
                      <FormControl>
                        <FormLabel><Trans>Output width (px)</Trans></FormLabel>
                        <Input
                          type="number"
                          placeholder={t`Auto (native size)`}
                          value={svgWidth}
                          onChange={(e) => setSvgWidth(e.target.value ? Number(e.target.value) : '')}
                          size="sm"
                          slotProps={{ input: { min: 1, max: 4096 } }}
                        />
                        <Typography level="body-xs" sx={{ color: 'text.tertiary', mt: 1 }}><Trans>Height scales proportionally. Max 4096px.</Trans></Typography>
                      </FormControl>
                    </>
                  ) : (
                    <FormControl>
                      <FormLabel><Trans>Output format</Trans></FormLabel>
                      <Select
                        value={outputFormat}
                        onChange={(_, value) => value && setOutputFormat(value)}
                      >
                        <Option value="jpg">{t`JPG`}</Option>
                        <Option value="png">{t`PNG`}</Option>
                        <Option value="webp">{t`WebP`}</Option>
                        <Option value="tiff">{t`TIFF`}</Option>
                        <Option value="pdf">{t`PDF`}</Option>
                        <Option value="ico">{t`ICO (favicon)`}</Option>
                      </Select>
                    </FormControl>
                  )
                )}

                {tab === 'crop' && (
                  <>
                    <FormControl>
                      <FormLabel><Trans>Output format</Trans></FormLabel>
                      <Select
                        value={cropFormat}
                        onChange={(_, value) => value && setCropFormat(value)}
                        size="sm"
                      >
                        <Option value="jpg">{t`JPG`}</Option>
                        <Option value="png">{t`PNG`}</Option>
                        <Option value="webp">{t`WebP`}</Option>
                      </Select>
                    </FormControl>

                    {completedCrop && completedCrop.width > 0 && completedCrop.height > 0 && imgRef.current && (
                      <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
                        Crop: {Math.round(completedCrop.width * imgRef.current.naturalWidth / imgRef.current.width)} x {Math.round(completedCrop.height * imgRef.current.naturalHeight / imgRef.current.height)} px
                        {naturalSize && <> (from {naturalSize.w} x {naturalSize.h})</>}
                      </Typography>
                    )}
                  </>
                )}

                {tab === 'resize' && (
                  <>
                    {naturalSize && (
                      <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
                        Current: {naturalSize.w} x {naturalSize.h} px
                      </Typography>
                    )}

                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                      <FormControl sx={{ minWidth: 0 }}>
                        <FormLabel><Trans>Width (px)</Trans></FormLabel>
                        <Input
                          type="number"
                          placeholder={naturalSize ? String(naturalSize.w) : 'Width'}
                          value={resizeWidth}
                          onChange={(e) => handleResizeWidth(e.target.value)}
                          size="sm"
                          slotProps={{ input: { min: 1, max: 9999 } }}
                        />
                      </FormControl>
                      <FormControl sx={{ minWidth: 0 }}>
                        <FormLabel><Trans>Height (px)</Trans></FormLabel>
                        <Input
                          type="number"
                          placeholder={naturalSize ? String(naturalSize.h) : 'Height'}
                          value={resizeHeight}
                          onChange={(e) => handleResizeHeight(e.target.value)}
                          size="sm"
                          slotProps={{ input: { min: 1, max: 9999 } }}
                        />
                      </FormControl>
                    </Box>

                    <Checkbox
                      checked={lockAspect}
                      onChange={(e) => setLockAspect(e.target.checked)}
                      size="sm"
                      label={t`Keep proportions`}
                    />

                    <FormControl>
                      <FormLabel><Trans>Output format</Trans></FormLabel>
                      <Select
                        value={resizeFormat}
                        onChange={(_, value) => value && setResizeFormat(value)}
                        size="sm"
                      >
                        <Option value="jpg">{t`JPG`}</Option>
                        <Option value="png">{t`PNG`}</Option>
                        <Option value="webp">{t`WebP`}</Option>
                        <Option value="tiff">{t`TIFF`}</Option>
                      </Select>
                    </FormControl>
                  </>
                )}

                {tab === 'watermark' && (
                  <>
                    <FormControl>
                      <FormLabel><Trans>Text</Trans></FormLabel>
                      <Input
                        placeholder={t`Your watermark text`}
                        value={watermarkText}
                        onChange={(e) => setWatermarkText(e.target.value.slice(0, 100))}
                        size="sm"
                      />
                    </FormControl>

                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                      <FormControl sx={{ minWidth: 0 }}>
                        <FormLabel><Trans>Position</Trans></FormLabel>
                        <Select
                          value={watermarkPosition}
                          onChange={(_, v) => v && setWatermarkPosition(v)}
                          size="sm"
                        >
                          <Option value="bottom-right">{t`Bottom right`}</Option>
                          <Option value="bottom-left">{t`Bottom left`}</Option>
                          <Option value="top-right">{t`Top right`}</Option>
                          <Option value="top-left">{t`Top left`}</Option>
                          <Option value="center">{t`Center`}</Option>
                        </Select>
                      </FormControl>
                      <FormControl sx={{ minWidth: 0 }}>
                        <FormLabel><Trans>Size (px)</Trans></FormLabel>
                        <Input
                          type="number"
                          value={watermarkSize}
                          onChange={(e) => setWatermarkSize(Math.max(12, Math.min(120, Number(e.target.value) || 24)))}
                          size="sm"
                          slotProps={{ input: { min: 12, max: 120 } }}
                        />
                      </FormControl>
                    </Box>

                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                      <FormControl sx={{ minWidth: 0 }}>
                        <FormLabel><Trans>Color</Trans></FormLabel>
                        <Select
                          value={watermarkColor}
                          onChange={(_, v) => v && setWatermarkColor(v)}
                          size="sm"
                        >
                          <Option value="#ffffff">{t`White`}</Option>
                          <Option value="#000000">{t`Black`}</Option>
                        </Select>
                      </FormControl>
                      <FormControl sx={{ minWidth: 0 }}>
                        <FormLabel><Trans>Opacity (%)</Trans></FormLabel>
                        <Input
                          type="number"
                          value={watermarkOpacity}
                          onChange={(e) => setWatermarkOpacity(Math.max(10, Math.min(100, Number(e.target.value) || 50)))}
                          size="sm"
                          slotProps={{ input: { min: 10, max: 100 } }}
                        />
                      </FormControl>
                    </Box>

                    <FormControl>
                      <FormLabel><Trans>Output format</Trans></FormLabel>
                      <Select
                        value={watermarkFormat}
                        onChange={(_, v) => v && setWatermarkFormat(v)}
                        size="sm"
                      >
                        <Option value="png">{t`PNG`}</Option>
                        <Option value="jpg">{t`JPG`}</Option>
                        <Option value="webp">{t`WebP`}</Option>
                        <Option value="tiff">{t`TIFF`}</Option>
                      </Select>
                    </FormControl>
                  </>
                )}

                {tab === 'favicon' && (
                  <>
                    <Typography level="body-sm" sx={{ fontWeight: 600 }}><Trans>Will generate:</Trans></Typography>
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: 0.5,
                      }}
                    >
                      {[
                        'favicon.ico (16, 32, 48)',
                        'favicon-16x16.png',
                        'favicon-32x32.png',
                        'favicon-48x48.png',
                        'apple-touch-icon (180)',
                        'android-chrome (192)',
                        'android-chrome (512)',
                      ].map((name) => (
                        <Typography key={name} level="body-xs" sx={{ color: 'text.secondary' }}>
                          {name}
                        </Typography>
                      ))}
                    </Box>
                    <Typography level="body-xs" sx={{ color: 'text.tertiary' }}><Trans>Downloaded as a ZIP with all sizes ready for deployment.</Trans></Typography>
                  </>
                )}
              </Box>

              <Box sx={{ display: 'flex', gap: 1.5 }}>
                <Box
                  component="button"
                  onClick={handleSubmit}
                  disabled={(tab === 'resize' && !resizeWidth && !resizeHeight) || (tab === 'watermark' && !watermarkText.trim())}
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1,
                    flex: 1,
                    py: 1.5,
                    borderRadius: '10px',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    letterSpacing: '0.01em',
                    cursor: ((tab === 'resize' && !resizeWidth && !resizeHeight) || (tab === 'watermark' && !watermarkText.trim())) ? 'default' : 'pointer',
                    border: 'none',
                    outline: 'none',
                    bgcolor: ((tab === 'resize' && !resizeWidth && !resizeHeight) || (tab === 'watermark' && !watermarkText.trim())) ? 'neutral.700' : 'primary.500',
                    color: 'white',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': ((tab === 'resize' && !resizeWidth && !resizeHeight) || (tab === 'watermark' && !watermarkText.trim())) ? {} : {
                      bgcolor: 'primary.600',
                      transform: 'translateY(-1px)',
                      boxShadow: '0 4px 16px rgba(37, 99, 235, 0.25)',
                    },
                    '&:active': { transform: 'translateY(0)' },
                  }}
                >
                  {tab === 'convert' && (isSvg ? 'Convert to PNG' : 'Convert')}
                  {tab === 'crop' && 'Crop & Convert'}
                  {tab === 'resize' && 'Resize & Convert'}
                  {tab === 'watermark' && 'Add Watermark'}
                  {tab === 'favicon' && 'Generate Favicons'}
                </Box>
                <Box
                  component="button"
                  onClick={handleRemoveFile}
                  sx={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    p: 1.5,
                    borderRadius: '10px',
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: 'divider',
                    outline: 'none',
                    bgcolor: 'transparent',
                    color: 'text.secondary',
                    transition: 'all 0.15s',
                    '&:hover': {
                      borderColor: 'neutral.500',
                      color: 'text.primary',
                      bgcolor: 'background.level1',
                    },
                  }}
                >
                  <CloseRoundedIcon sx={{ fontSize: 18 }} />
                </Box>
              </Box>

              {naturalSize && (
                <Typography level="body-xs" sx={{ color: 'text.tertiary', mt: 1.5, textAlign: 'center' }}>
                  {file.name} &mdash; {naturalSize.w} x {naturalSize.h} px
                </Typography>
              )}
            </>
          )}
        </Box>
      )}

      {conversionActive && (
        <Box>
          {file && (
            <Typography level="body-sm" sx={{ color: 'text.tertiary', mb: 2 }}>
              {file.name}
              {tab === 'convert' && (isSvg ? ' → PNG' : ` → ${outputFormat.toUpperCase()}`)}
              {tab === 'crop' && ` → ${cropFormat.toUpperCase()} (cropped)`}
              {tab === 'resize' && ` → ${resizeFormat.toUpperCase()} (resized)`}
              {tab === 'watermark' && ` → ${watermarkFormat.toUpperCase()} (watermarked)`}
            </Typography>
          )}
          <ConversionProgress
            status={conversion.status}
            position={conversion.position}
            error={conversion.error}
            inputSize={conversion.inputSize}
            outputSize={conversion.outputSize}
            previewUrl={conversion.previewUrl}
            onDownload={handleDownload}
            onRetry={handleRetry}
            showSizeComparison={false}
          />
        </Box>
      )}

      {faviconActive && (
        <Box>
          {file && (
            <Typography level="body-sm" sx={{ color: 'text.tertiary', mb: 2 }}>
              {file.name} → Favicon Package
            </Typography>
          )}
          <MultiFileResult
            status={faviconConversion.status}
            position={faviconConversion.position}
            error={faviconConversion.error}
            files={faviconConversion.files}
            zipDownloadUrl={faviconConversion.zipDownloadUrl}
            getFileUrl={faviconConversion.getFileUrl}
            onRetry={handleRetry}
            renderThumbnail={renderFaviconThumbnail}
          />
        </Box>
      )}

      <ToolSEOContent
        howTo={{
          title: t`How to convert images online`,
          steps: [
            t`Choose a mode — Convert, Crop, Resize, or Favicon.`,
            t`Upload your image. Supported formats include HEIC, PNG, JPG, WebP, TIFF, BMP, and SVG.`,
            t`Select your output format and adjust any settings like crop area or target dimensions.`,
            t`Click Convert and download the result instantly.`,
          ],
        }}
        features={[
          { icon: <ImageOutlinedIcon />, title: t`9 Formats`, description: t`Convert between HEIC, PNG, JPG, WebP, TIFF, BMP, SVG, ICO, and PDF.` },
          { icon: <CropOutlinedIcon />, title: t`Crop & Resize`, description: t`Built-in tools for precise cropping and resizing with aspect ratio lock.` },
          { icon: <FavoriteOutlinedIcon />, title: t`Favicon Package`, description: t`Generate all standard favicon sizes as a ready-to-deploy ZIP.` },
          { icon: <SwapHorizOutlinedIcon />, title: t`SVG to PNG`, description: t`Rasterize vector SVG files to PNG with configurable output width.` },
          { icon: <LockOutlinedIcon />, title: t`Private & Secure`, description: t`Files are processed in an isolated sandbox and deleted immediately after download.` },
          { icon: <BoltOutlinedIcon />, title: t`No Signup Required`, description: t`Start converting immediately. No account, no email, no ads.` },
        ]}
        faq={[
          { question: t`What image formats are supported?`, answer: t`FileMagic supports HEIC, HEIF, PNG, JPG/JPEG, WebP, BMP, TIFF, SVG, and ICO. You can convert between any combination of these formats.` },
          { question: t`Is there a file size limit?`, answer: t`The maximum file size is 20 MB per image. This covers virtually all standard photos and graphics.` },
          { question: t`Does converting images reduce quality?`, answer: t`Converting between lossless formats (PNG, TIFF, BMP) preserves full quality. Converting to lossy formats (JPG, WebP) applies compression. For the best quality, choose PNG or WebP.` },
          { question: t`Are my images stored on your servers?`, answer: t`No. Files are processed in isolated memory and automatically deleted as soon as you download the result. We never store, log, or share your files.` },
          { question: t`Can I convert SVG files?`, answer: t`Yes. SVG vector files are rasterized to PNG. You can optionally specify an output width — height scales proportionally to maintain the aspect ratio.` },
        ]}
        relatedTools={[
          { label: t`HEIC Convert`, href: '/convert/heic' },
          { label: t`Image Compress`, href: '/compress/image' },
          { label: t`OCR`, href: '/ocr' },
          { label: t`Images to PDF`, href: '/merge/image-to-pdf' },
          { label: t`Metadata Remove`, href: '/metadata/remove' },
        ]}
      />
    </Box>
  );
}
