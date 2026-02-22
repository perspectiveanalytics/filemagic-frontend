import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { Box, Typography, CircularProgress, Chip, Input, Select, Option, Slider, Dropdown, Menu, MenuButton, MenuItem } from '@mui/joy';
import RotateRightRoundedIcon from '@mui/icons-material/RotateRightRounded';
import RotateLeftRoundedIcon from '@mui/icons-material/RotateLeftRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import SaveAltRoundedIcon from '@mui/icons-material/SaveAltRounded';
import DragIndicatorRoundedIcon from '@mui/icons-material/DragIndicatorRounded';
import SelectAllRoundedIcon from '@mui/icons-material/SelectAllRounded';
import DeselectRoundedIcon from '@mui/icons-material/DeselectRounded';
import FlipRoundedIcon from '@mui/icons-material/FlipRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ChevronLeftRoundedIcon from '@mui/icons-material/ChevronLeftRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';
import FileDropZone from '../components/FileDropZone';
import ConversionProgress from '../components/ConversionProgress';
import RedactionCanvas from '../components/RedactionCanvas';
import SEO, { buildToolSchema } from '../components/SEO';
import { useConversion } from '../hooks/useConversion';
import ToolDisclaimer from '../components/ToolDisclaimer';
import ToolSEOContent from '../components/ToolSEOContent';
import RotateRightOutlinedIcon from '@mui/icons-material/RotateRightOutlined';
import FormatListNumberedOutlinedIcon from '@mui/icons-material/FormatListNumberedOutlined';
import TextFieldsOutlinedIcon from '@mui/icons-material/TextFieldsOutlined';
import ContentCutOutlinedIcon from '@mui/icons-material/ContentCutOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { actionBtnBase } from '../styles/buttons';
import type { RedactionRect } from '../components/RedactionCanvas';

// ── Types ──

interface PageState {
  pageNum: number;
  dataUrl: string;
  rotation: number;
  selected: boolean;
}

interface WatermarkConfig {
  text: string;
  fontSize: number;
  color: string;
  opacity: number;
  rotation: number;
  position: string;
}

interface PageNumberConfig {
  format: string;
  position: string;
  fontSize: number;
  color: string;
  startFrom: number;
  margin: number;
}

type TabId = 'pages' | 'watermark' | 'numbers' | 'redact';
type PageMode = 'organize' | 'extract';

// ── Constants ──

const TABS: { id: TabId; label: string }[] = [
  { id: 'pages', label: 'Pages' },
  { id: 'watermark', label: 'Watermark' },
  { id: 'numbers', label: 'Numbers' },
  { id: 'redact', label: 'Redact' },
];

const WATERMARK_POSITIONS = [
  { value: 'center', label: 'Center' },
  { value: 'top-left', label: 'Top Left' },
  { value: 'top-center', label: 'Top Center' },
  { value: 'top-right', label: 'Top Right' },
  { value: 'bottom-left', label: 'Bottom Left' },
  { value: 'bottom-center', label: 'Bottom Center' },
  { value: 'bottom-right', label: 'Bottom Right' },
];

const PAGE_NUM_POSITIONS = [
  { value: 'bottom-center', label: 'Bottom Center' },
  { value: 'bottom-left', label: 'Bottom Left' },
  { value: 'bottom-right', label: 'Bottom Right' },
  { value: 'top-center', label: 'Top Center' },
  { value: 'top-left', label: 'Top Left' },
  { value: 'top-right', label: 'Top Right' },
];

const iconBtnSx = {
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  p: 0.5, borderRadius: 'sm', cursor: 'pointer', border: 'none', outline: 'none',
  bgcolor: 'transparent', color: 'text.secondary',
  '&:hover': { bgcolor: 'background.level2', color: 'text.primary' },
} as const;

const toolBtnSx = {
  ...actionBtnBase, px: 1.5, py: 0.75, fontSize: '0.8rem', fontWeight: 500,
  bgcolor: 'background.level1', color: 'text.primary',
  border: '1px solid', borderColor: 'divider',
  '&:hover': { bgcolor: 'background.level2' },
} as const;

const labelSx = { mb: 0.5, fontWeight: 600, color: 'text.secondary' } as const;

// ── Helpers ──

function hexToRgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  return [Math.round(r * 100) / 100, Math.round(g * 100) / 100, Math.round(b * 100) / 100];
}

function watermarkPreviewSx(position: string): Record<string, unknown> {
  const m = '8%';
  const base: Record<string, unknown> = { position: 'absolute', pointerEvents: 'none', whiteSpace: 'nowrap' };
  switch (position) {
    case 'top-left': return { ...base, top: m, left: m };
    case 'top-center': return { ...base, top: m, left: '50%', transform: 'translateX(-50%)' };
    case 'top-right': return { ...base, top: m, right: m };
    case 'bottom-left': return { ...base, bottom: m, left: m };
    case 'bottom-center': return { ...base, bottom: m, left: '50%', transform: 'translateX(-50%)' };
    case 'bottom-right': return { ...base, bottom: m, right: m };
    default: return { ...base, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
  }
}

// ── Main Component ──

export default function PdfEditorPage() {
  // State: file & loading
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pages, setPages] = useState<PageState[]>([]);
  const [originalPages, setOriginalPages] = useState<PageState[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>('pages');

  // Pages tab
  const [pageMode, setPageMode] = useState<PageMode>('organize');
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [dragOverSide, setDragOverSide] = useState<'before' | 'after'>('before');
  const lastClickedRef = useRef<number | null>(null);

  // Watermark
  const [watermark, setWatermark] = useState<WatermarkConfig | null>(null);

  // Page numbers
  const [pageNumbers, setPageNumbers] = useState<PageNumberConfig | null>(null);

  // Redactions
  const [redactions, setRedactions] = useState<RedactionRect[]>([]);
  const [redactModalPage, setRedactModalPage] = useState<number | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const conversion = useConversion('/convert/pdf/edit');

  // ── PDF Loading ──

  const loadPdf = useCallback(async (file: File) => {
    setLoading(true);
    try {
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/build/pdf.worker.min.mjs',
        import.meta.url,
      ).toString();

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const pageCount = Math.min(pdf.numPages, 200);

      const canvas = canvasRef.current || document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const result: PageState[] = [];
      for (let i = 1; i <= pageCount; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 0.3 });
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        await page.render({ canvasContext: ctx, viewport, canvas } as any).promise;
        result.push({ pageNum: i, dataUrl: canvas.toDataURL(), rotation: 0, selected: true });
      }

      setPages(result);
      setOriginalPages(result.map(p => ({ ...p })));
    } catch {
      setPages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    loadPdf(file);
  }, [loadPdf]);

  // ── Page Operations ──

  const rotatePage = useCallback((index: number, delta: number) => {
    setPages(prev => prev.map((p, i) =>
      i === index ? { ...p, rotation: (p.rotation + delta + 360) % 360 } : p
    ));
  }, []);

  const rotateAll = useCallback((delta: number) => {
    setPages(prev => prev.map(p => ({ ...p, rotation: (p.rotation + delta + 360) % 360 })));
  }, []);

  const deletePage = useCallback((index: number) => {
    setPages(prev => {
      const next = prev.filter((_, i) => i !== index);
      if (next.length === 0) {
        // All pages removed — reset to upload state
        setSelectedFile(null);
        setOriginalPages([]);
        setWatermark(null);
        setPageNumbers(null);
        setRedactions([]);
      }
      return next;
    });
  }, []);

  const resetAll = useCallback(() => {
    setPages(originalPages.map(p => ({ ...p })));
  }, [originalPages]);

  const downloadPageImage = useCallback((page: PageState) => {
    const a = document.createElement('a');
    a.href = page.dataUrl;
    a.download = `page-${page.pageNum}.png`;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }, []);

  const downloadPagePdf = useCallback(async (page: PageState) => {
    if (!selectedFile) return;
    const { PDFDocument } = await import('pdf-lib');
    const srcBytes = await selectedFile.arrayBuffer();
    const srcDoc = await PDFDocument.load(srcBytes);
    const newDoc = await PDFDocument.create();
    const [copied] = await newDoc.copyPages(srcDoc, [page.pageNum - 1]);
    if (page.rotation !== 0) copied.setRotation({ type: 'degrees', angle: page.rotation } as any);
    newDoc.addPage(copied);
    const pdfBytes = await newDoc.save();
    const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `page-${page.pageNum}.pdf`;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 500);
  }, [selectedFile]);

  // ── Selection (Extract mode) ──

  const handlePageClick = useCallback((index: number, shiftKey: boolean) => {
    setPages(prev => {
      const next = [...prev];
      if (shiftKey && lastClickedRef.current !== null) {
        const start = Math.min(lastClickedRef.current, index);
        const end = Math.max(lastClickedRef.current, index);
        const targetState = !prev[index].selected;
        for (let i = start; i <= end; i++) next[i] = { ...next[i], selected: targetState };
      } else {
        next[index] = { ...next[index], selected: !next[index].selected };
      }
      return next;
    });
    lastClickedRef.current = index;
  }, []);

  const selectAll = useCallback(() => setPages(p => p.map(pg => ({ ...pg, selected: true }))), []);
  const selectNone = useCallback(() => setPages(p => p.map(pg => ({ ...pg, selected: false }))), []);
  const invertSelection = useCallback(() => setPages(p => p.map(pg => ({ ...pg, selected: !pg.selected }))), []);

  // ── Drag & Drop ──

  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDragIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const rect = e.currentTarget.getBoundingClientRect();
    const side = (e.clientX - rect.left) < rect.width / 2 ? 'before' : 'after';
    setDragOverIndex(index);
    setDragOverSide(side);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (dragIndex !== null && dragIndex !== targetIndex) {
      const rect = e.currentTarget.getBoundingClientRect();
      const side = (e.clientX - rect.left) < rect.width / 2 ? 'before' : 'after';
      setPages(prev => {
        const next = [...prev];
        const [moved] = next.splice(dragIndex, 1);
        const insertAt = side === 'after'
          ? (targetIndex > dragIndex ? targetIndex : targetIndex + 1)
          : (targetIndex > dragIndex ? targetIndex - 1 : targetIndex);
        next.splice(insertAt, 0, moved);
        return next;
      });
    }
    setDragIndex(null);
    setDragOverIndex(null);
  }, [dragIndex]);

  const handleDragEnd = useCallback(() => { setDragIndex(null); setDragOverIndex(null); }, []);

  // ── hasChanges ──

  const hasChanges = useMemo(() => {
    if (pageMode === 'extract') {
      const selectedCount = pages.filter(p => p.selected).length;
      if (selectedCount > 0 && selectedCount < pages.length) return true;
    } else {
      if (pages.length !== originalPages.length) return true;
      if (pages.some((p, i) => p.pageNum !== originalPages[i]?.pageNum)) return true;
    }
    if (pages.some(p => p.rotation !== 0)) return true;
    if (watermark && watermark.text.trim()) return true;
    if (pageNumbers) return true;
    if (redactions.length > 0) return true;
    return false;
  }, [pages, originalPages, pageMode, watermark, pageNumbers, redactions]);

  // ── Apply ──

  const handleApply = useCallback(() => {
    if (!selectedFile || !hasChanges) return;
    const options: Record<string, unknown> = {};

    // Determine final page list
    let finalPages: PageState[];
    if (pageMode === 'extract') {
      finalPages = pages.filter(p => p.selected);
    } else {
      finalPages = pages;
    }

    // Pages (only if changed from original)
    const pageNums = finalPages.map(p => p.pageNum);
    const pagesChanged = pageNums.length !== originalPages.length ||
      pageNums.some((num, i) => num !== originalPages[i]?.pageNum);
    if (pagesChanged) {
      options.pages = pageNums;
    }

    // Rotations
    const rotations: Record<string, number> = {};
    finalPages.forEach((p, i) => {
      if (p.rotation !== 0) rotations[String(i + 1)] = p.rotation;
    });
    if (Object.keys(rotations).length > 0) options.rotations = rotations;

    // Watermark
    if (watermark && watermark.text.trim()) {
      const [r, g, b] = hexToRgb(watermark.color);
      options.watermark = {
        text: watermark.text.trim(),
        fontSize: watermark.fontSize,
        color: [r, g, b],
        opacity: watermark.opacity,
        rotation: watermark.rotation,
        position: watermark.position,
      };
    }

    // Page numbers
    if (pageNumbers) {
      const [r, g, b] = hexToRgb(pageNumbers.color);
      options.pageNumbers = {
        format: pageNumbers.format,
        position: pageNumbers.position,
        fontSize: pageNumbers.fontSize,
        color: [r, g, b],
        startFrom: pageNumbers.startFrom,
        margin: pageNumbers.margin,
      };
    }

    // Redactions
    if (redactions.length > 0) {
      options.redactions = redactions.map(r => ({
        page: r.page,
        rect: [r.x, r.y, r.w, r.h],
      }));
    }

    conversion.startConversion(selectedFile, options);
  }, [selectedFile, hasChanges, pages, originalPages, pageMode, watermark, pageNumbers, redactions, conversion]);

  const handleDownload = useCallback(() => {
    conversion.download();
    setSelectedFile(null);
    setPages([]);
    setOriginalPages([]);
    setWatermark(null);
    setPageNumbers(null);
    setRedactions([]);
  }, [conversion]);

  const handleRetry = useCallback(() => {
    conversion.reset();
    setSelectedFile(null);
    setPages([]);
    setOriginalPages([]);
    setWatermark(null);
    setPageNumbers(null);
    setRedactions([]);
  }, [conversion]);

  useEffect(() => { return () => { setPages([]); }; }, []);

  const isConverting = ['uploading', 'queued', 'processing', 'done', 'error'].includes(conversion.status);
  const selectedCount = pages.filter(p => p.selected).length;

  // ── Render ──

  return (
    <Box sx={{ maxWidth: 740, mx: 'auto', width: '100%', py: { xs: 3, md: 4 } }}>
      <SEO
        title="PDF Editor"
        description="Edit PDF pages: rotate, reorder, delete, extract, add watermarks, page numbers, and redact content. Free, private, no signup."
        path="/edit/pdf"
        structuredData={buildToolSchema('PDF Editor', 'Edit PDF pages with rotate, reorder, watermark, page numbers and redaction.', '/edit/pdf')}
      />
      <Typography component="h1" level="h3" sx={{ mb: 1, fontWeight: 700, letterSpacing: '-0.02em' }}>
        PDF Editor
      </Typography>
      <Typography level="body-sm" sx={{ color: 'text.tertiary', mb: 4 }}>
        Rotate, reorder, watermark, number pages, and redact — all in one tool
      </Typography>

      <ToolDisclaimer toolId="pdf-editor" />

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {!selectedFile && conversion.status === 'idle' && (
        <FileDropZone onFileSelect={handleFileSelect} accept=".pdf,application/pdf" maxSize={100 * 1024 * 1024} />
      )}

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress size="md" thickness={3} />
        </Box>
      )}

      {pages.length > 0 && !isConverting && (
        <>
          <Box
            component="button"
            onClick={handleApply}
            sx={{
              ...actionBtnBase,
              bgcolor: hasChanges ? 'primary.500' : 'neutral.400',
              color: 'white', width: '100%', mb: 3,
              pointerEvents: hasChanges ? 'auto' : 'none',
              opacity: hasChanges ? 1 : 0.5,
              '&:hover': hasChanges ? { bgcolor: 'primary.600', transform: 'translateY(-1px)', boxShadow: '0 4px 16px rgba(37, 99, 235, 0.25)' } : {},
            }}
          >
            Apply & Download
          </Box>

          <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
            {TABS.map(tab => (
              <Chip
                key={tab.id}
                variant={activeTab === tab.id ? 'solid' : 'outlined'}
                color={activeTab === tab.id ? 'primary' : 'neutral'}
                onClick={() => setActiveTab(tab.id)}
                sx={{ cursor: 'pointer', fontWeight: 600 }}
              >
                {tab.label}
                {tab.id === 'redact' && redactions.length > 0 && (
                  <Typography component="span" sx={{ ml: 0.5, fontSize: '0.7rem' }}>({redactions.length})</Typography>
                )}
              </Chip>
            ))}
            <Box
              component="button"
              onClick={handleRetry}
              sx={{
                ml: 'auto', display: 'flex', alignItems: 'center', gap: 0.5,
                border: 'none', bgcolor: 'transparent', cursor: 'pointer',
                color: 'text.tertiary', fontSize: '0.75rem', fontFamily: 'inherit',
                p: 0.5, borderRadius: 'sm',
                '&:hover': { color: 'text.secondary' },
              }}
            >
              <RestartAltRoundedIcon sx={{ fontSize: 15 }} />
              Start over
            </Box>
          </Box>

          {activeTab === 'pages' && (
            <>
              <Box sx={{ display: 'flex', gap: 0.75, mb: 2 }}>
                <Chip size="sm" variant={pageMode === 'organize' ? 'solid' : 'soft'} color={pageMode === 'organize' ? 'neutral' : 'neutral'} onClick={() => setPageMode('organize')} sx={{ cursor: 'pointer' }}>Organize</Chip>
                <Chip size="sm" variant={pageMode === 'extract' ? 'solid' : 'soft'} color={pageMode === 'extract' ? 'neutral' : 'neutral'} onClick={() => setPageMode('extract')} sx={{ cursor: 'pointer' }}>Extract</Chip>
              </Box>

              {pageMode === 'organize' ? (
                <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
                  <Box component="button" onClick={() => rotateAll(90)} sx={toolBtnSx}><RotateRightRoundedIcon sx={{ fontSize: 16 }} /> Rotate All CW</Box>
                  <Box component="button" onClick={() => rotateAll(-90)} sx={toolBtnSx}><RotateLeftRoundedIcon sx={{ fontSize: 16 }} /> Rotate All CCW</Box>
                  <Box component="button" onClick={resetAll} sx={toolBtnSx}><RestartAltRoundedIcon sx={{ fontSize: 16 }} /> Reset</Box>
                  <Typography level="body-xs" sx={{ color: 'text.tertiary', alignSelf: 'center', ml: 'auto' }}>
                    {pages.length} page{pages.length !== 1 ? 's' : ''}
                    {pages.length !== originalPages.length && ` (${originalPages.length - pages.length} removed)`}
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ display: 'flex', gap: 0.75, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
                  <Box component="button" onClick={selectAll} sx={toolBtnSx}><SelectAllRoundedIcon sx={{ fontSize: 15 }} /> All</Box>
                  <Box component="button" onClick={selectNone} sx={toolBtnSx}><DeselectRoundedIcon sx={{ fontSize: 15 }} /> None</Box>
                  <Box component="button" onClick={invertSelection} sx={toolBtnSx}><FlipRoundedIcon sx={{ fontSize: 15 }} /> Invert</Box>
                  <Typography level="body-xs" sx={{ color: 'text.tertiary', ml: 'auto' }}>
                    {selectedCount} / {pages.length} selected
                  </Typography>
                </Box>
              )}

              <Box sx={{
                display: 'grid',
                gridTemplateColumns: pageMode === 'organize'
                  ? { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)' }
                  : { xs: 'repeat(3, 1fr)', sm: 'repeat(4, 1fr)', md: 'repeat(5, 1fr)' },
                gap: pageMode === 'organize' ? 2 : 1.5,
                mb: 3,
              }}>
                {pages.map((page, index) => pageMode === 'organize' ? (
                  // ── Organize card ──
                  <Box
                    key={`${page.pageNum}-${index}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragLeave={() => setDragOverIndex(null)}
                    onDrop={(e) => handleDrop(e, index)}
                    onDragEnd={handleDragEnd}
                    sx={{
                      position: 'relative', bgcolor: 'background.level1', borderRadius: 'md',
                      border: '2px solid',
                      borderColor: page.rotation !== 0 ? 'primary.300' : 'divider',
                      overflow: 'visible', p: 1,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5,
                      opacity: dragIndex === index ? 0.4 : 1,
                      transition: 'border-color 0.15s, opacity 0.15s',
                      cursor: 'grab', '&:active': { cursor: 'grabbing' },
                      ...(dragOverIndex === index && dragIndex !== index && {
                        [`&::${dragOverSide === 'before' ? 'before' : 'after'}`]: {
                          content: '""',
                          position: 'absolute',
                          top: -4,
                          bottom: -4,
                          [dragOverSide === 'before' ? 'left' : 'right']: -7,
                          width: 3,
                          borderRadius: 2,
                          bgcolor: 'primary.500',
                        },
                      }),
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, width: '100%' }}>
                      <DragIndicatorRoundedIcon sx={{ fontSize: 14, color: 'text.tertiary' }} />
                      <Typography level="body-xs" sx={{ fontWeight: 600, color: 'text.secondary' }}>{page.pageNum}</Typography>
                      <Box component="button" onClick={(e: React.MouseEvent) => { e.stopPropagation(); deletePage(index); }}
                        sx={{ ...iconBtnSx, ml: 'auto', p: 0.25, '&:hover': { bgcolor: 'danger.softBg', color: 'danger.500' } }}>
                        <DeleteOutlineRoundedIcon sx={{ fontSize: 15 }} />
                      </Box>
                    </Box>
                    <Box component="img" src={page.dataUrl} alt={`Page ${page.pageNum}`}
                      sx={{ maxWidth: '100%', maxHeight: 180, objectFit: 'contain', transition: 'transform 0.3s ease', transform: `rotate(${page.rotation}deg)`, pointerEvents: 'none' }}
                    />
                    <Box sx={{ display: 'flex', gap: 0.25, alignItems: 'center' }}>
                      <Box component="button" onClick={(e: React.MouseEvent) => { e.stopPropagation(); rotatePage(index, -90); }} sx={iconBtnSx}><RotateLeftRoundedIcon sx={{ fontSize: 16 }} /></Box>
                      <Box component="button" onClick={(e: React.MouseEvent) => { e.stopPropagation(); rotatePage(index, 90); }} sx={iconBtnSx}><RotateRightRoundedIcon sx={{ fontSize: 16 }} /></Box>
                      <Dropdown>
                        <MenuButton slots={{ root: Box }} slotProps={{ root: { component: 'button', sx: iconBtnSx, title: 'Download page', onClick: (e: React.MouseEvent) => e.stopPropagation() } }}>
                          <SaveAltRoundedIcon sx={{ fontSize: 16 }} />
                        </MenuButton>
                        <Menu size="sm" placement="bottom-end" sx={{ minWidth: 120 }}>
                          <MenuItem onClick={(e) => { e.stopPropagation(); downloadPageImage(page); }}>PNG</MenuItem>
                          <MenuItem onClick={(e) => { e.stopPropagation(); downloadPagePdf(page); }}>PDF</MenuItem>
                        </Menu>
                      </Dropdown>
                    </Box>
                  </Box>
                ) : (
                  // ── Extract card ──
                  <Box
                    key={page.pageNum}
                    onClick={(e) => handlePageClick(index, e.shiftKey)}
                    sx={{
                      position: 'relative',
                      bgcolor: page.selected ? 'primary.softBg' : 'background.level1',
                      borderRadius: 'md', border: '2px solid',
                      borderColor: page.selected ? 'primary.500' : 'divider',
                      overflow: 'hidden', p: 0.75,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5,
                      cursor: 'pointer', transition: 'all 0.15s ease',
                      '&:hover': { borderColor: page.selected ? 'primary.600' : 'neutral.400', bgcolor: page.selected ? 'primary.softHoverBg' : 'background.level2' },
                    }}
                  >
                    {page.selected && (
                      <Box sx={{ position: 'absolute', top: 4, right: 4, zIndex: 1, bgcolor: 'primary.500', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CheckCircleRoundedIcon sx={{ fontSize: 18, color: 'white' }} />
                      </Box>
                    )}
                    <Box component="img" src={page.dataUrl} alt={`Page ${page.pageNum}`}
                      sx={{ maxWidth: '100%', maxHeight: 150, objectFit: 'contain', pointerEvents: 'none', opacity: page.selected ? 1 : 0.5, transition: 'opacity 0.15s' }}
                    />
                    <Typography level="body-xs" sx={{ fontWeight: page.selected ? 700 : 500, color: page.selected ? 'primary.plainColor' : 'text.secondary', fontSize: '0.7rem' }}>
                      {page.pageNum}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </>
          )}

          {activeTab === 'watermark' && (
            <Box>
              {!watermark ? (
                <Box component="button" onClick={() => setWatermark({ text: '', fontSize: 60, color: '#888888', opacity: 0.3, rotation: 45, position: 'center' })}
                  sx={{ ...actionBtnBase, bgcolor: 'background.level1', color: 'text.primary', border: '1px solid', borderColor: 'divider', width: '100%', '&:hover': { bgcolor: 'background.level2' } }}>
                  Add Watermark
                </Box>
              ) : (
                <>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                    <Typography level="body-xs" onClick={() => setWatermark(null)} sx={{ color: 'danger.plainColor', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 2 }}>Remove watermark</Typography>
                  </Box>

                  {pages[0] && watermark.text.trim() && (
                    <Box sx={{ position: 'relative', display: 'inline-block', mb: 3, borderRadius: 'md', overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
                      <Box component="img" src={pages[0].dataUrl} sx={{ display: 'block', maxHeight: 200, objectFit: 'contain' }} />
                      <Typography sx={{
                        ...watermarkPreviewSx(watermark.position),
                        color: watermark.color,
                        opacity: watermark.opacity,
                        fontSize: Math.max(8, watermark.fontSize * 0.18),
                        fontWeight: 700,
                        transform: `${(watermarkPreviewSx(watermark.position).transform as string) || ''} rotate(${-watermark.rotation}deg)`.trim(),
                      }}>
                        {watermark.text}
                      </Typography>
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    <Box>
                      <Typography level="body-xs" sx={labelSx}>Text</Typography>
                      <Input value={watermark.text} onChange={(e) => setWatermark(prev => prev ? { ...prev, text: e.target.value } : prev)} placeholder="DRAFT, CONFIDENTIAL..." size="sm" />
                    </Box>

                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                      <Box>
                        <Typography level="body-xs" sx={labelSx}>Position</Typography>
                        <Select value={watermark.position} onChange={(_, v) => setWatermark(prev => prev ? { ...prev, position: v as string } : prev)} size="sm">
                          {WATERMARK_POSITIONS.map(p => <Option key={p.value} value={p.value}>{p.label}</Option>)}
                        </Select>
                      </Box>
                      <Box>
                        <Typography level="body-xs" sx={labelSx}>Font Size ({watermark.fontSize})</Typography>
                        <Slider value={watermark.fontSize} onChange={(_, v) => setWatermark(prev => prev ? { ...prev, fontSize: v as number } : prev)} min={10} max={120} step={2} size="sm" />
                      </Box>
                    </Box>

                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                      <Box>
                        <Typography level="body-xs" sx={labelSx}>Color</Typography>
                        <Box component="input" type="color" value={watermark.color}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setWatermark(prev => prev ? { ...prev, color: e.target.value } : prev)}
                          sx={{ width: 40, height: 32, border: '2px solid', borderColor: 'divider', borderRadius: 'sm', cursor: 'pointer', p: 0 }}
                        />
                      </Box>
                      <Box>
                        <Typography level="body-xs" sx={labelSx}>Opacity ({watermark.opacity})</Typography>
                        <Slider value={watermark.opacity} onChange={(_, v) => setWatermark(prev => prev ? { ...prev, opacity: v as number } : prev)} min={0.1} max={1} step={0.05} size="sm" />
                      </Box>
                    </Box>

                    <Box>
                      <Typography level="body-xs" sx={labelSx}>Rotation ({watermark.rotation}°)</Typography>
                      <Slider value={watermark.rotation} onChange={(_, v) => setWatermark(prev => prev ? { ...prev, rotation: v as number } : prev)} min={-90} max={90} step={5} size="sm" />
                    </Box>
                  </Box>
                </>
              )}
            </Box>
          )}

          {activeTab === 'numbers' && (
            <Box>
              {!pageNumbers ? (
                <Box component="button" onClick={() => setPageNumbers({ format: '{n} / {total}', position: 'bottom-center', fontSize: 10, color: '#000000', startFrom: 1, margin: 30 })}
                  sx={{ ...actionBtnBase, bgcolor: 'background.level1', color: 'text.primary', border: '1px solid', borderColor: 'divider', width: '100%', '&:hover': { bgcolor: 'background.level2' } }}>
                  Add Page Numbers
                </Box>
              ) : (
                <>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                    <Typography level="body-xs" onClick={() => setPageNumbers(null)} sx={{ color: 'danger.plainColor', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: 2 }}>Remove page numbers</Typography>
                  </Box>

                  {pages[0] && (
                    <Box sx={{ position: 'relative', display: 'inline-block', mb: 3, borderRadius: 'md', overflow: 'hidden', border: '1px solid', borderColor: 'divider' }}>
                      <Box component="img" src={pages[0].dataUrl} sx={{ display: 'block', maxHeight: 200, objectFit: 'contain' }} />
                      <Typography sx={{
                        ...watermarkPreviewSx(pageNumbers.position),
                        color: pageNumbers.color,
                        fontSize: Math.max(7, pageNumbers.fontSize * 0.8),
                        fontWeight: 500,
                      }}>
                        {pageNumbers.format.replace('{n}', String(pageNumbers.startFrom)).replace('{total}', String(pages.length))}
                      </Typography>
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
                    <Box>
                      <Typography level="body-xs" sx={labelSx}>Format</Typography>
                      <Input value={pageNumbers.format} onChange={(e) => setPageNumbers(prev => prev ? { ...prev, format: e.target.value } : prev)} size="sm" />
                      <Typography level="body-xs" sx={{ color: 'text.tertiary', mt: 0.5 }}>Use {'{n}'} for page number, {'{total}'} for total pages</Typography>
                    </Box>

                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
                      <Box>
                        <Typography level="body-xs" sx={labelSx}>Position</Typography>
                        <Select value={pageNumbers.position} onChange={(_, v) => setPageNumbers(prev => prev ? { ...prev, position: v as string } : prev)} size="sm">
                          {PAGE_NUM_POSITIONS.map(p => <Option key={p.value} value={p.value}>{p.label}</Option>)}
                        </Select>
                      </Box>
                      <Box>
                        <Typography level="body-xs" sx={labelSx}>Font Size ({pageNumbers.fontSize})</Typography>
                        <Slider value={pageNumbers.fontSize} onChange={(_, v) => setPageNumbers(prev => prev ? { ...prev, fontSize: v as number } : prev)} min={6} max={24} step={1} size="sm" />
                      </Box>
                    </Box>

                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr 1fr' }, gap: 2 }}>
                      <Box>
                        <Typography level="body-xs" sx={labelSx}>Color</Typography>
                        <Box component="input" type="color" value={pageNumbers.color}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPageNumbers(prev => prev ? { ...prev, color: e.target.value } : prev)}
                          sx={{ width: 40, height: 32, border: '2px solid', borderColor: 'divider', borderRadius: 'sm', cursor: 'pointer', p: 0 }}
                        />
                      </Box>
                      <Box>
                        <Typography level="body-xs" sx={labelSx}>Start From</Typography>
                        <Input type="number" value={pageNumbers.startFrom} onChange={(e) => setPageNumbers(prev => prev ? { ...prev, startFrom: Math.max(1, Number(e.target.value) || 1) } : prev)} size="sm" slotProps={{ input: { min: 1 } }} />
                      </Box>
                      <Box>
                        <Typography level="body-xs" sx={labelSx}>Margin ({pageNumbers.margin})</Typography>
                        <Slider value={pageNumbers.margin} onChange={(_, v) => setPageNumbers(prev => prev ? { ...prev, margin: v as number } : prev)} min={10} max={60} step={5} size="sm" />
                      </Box>
                    </Box>
                  </Box>
                </>
              )}
            </Box>
          )}

          {activeTab === 'redact' && (
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, p: 2, borderRadius: 'md', bgcolor: 'warning.softBg', border: '1px solid', borderColor: 'warning.outlinedBorder', mb: 3 }}>
                <WarningAmberRoundedIcon sx={{ color: 'warning.plainColor', fontSize: 20, mt: 0.25 }} />
                <Typography level="body-sm" sx={{ color: 'warning.plainColor' }}>
                  Redacted content is permanently removed from the PDF and cannot be recovered.
                </Typography>
              </Box>

              <Box sx={{
                display: 'grid',
                gridTemplateColumns: { xs: 'repeat(3, 1fr)', sm: 'repeat(4, 1fr)', md: 'repeat(5, 1fr)' },
                gap: 1.5, mb: 3,
              }}>
                {pages.map((page, index) => {
                  const count = redactions.filter(r => r.page === index).length;
                  return (
                    <Box
                      key={page.pageNum}
                      onClick={() => setRedactModalPage(index)}
                      sx={{
                        position: 'relative', bgcolor: 'background.level1', borderRadius: 'md',
                        border: '2px solid', borderColor: count > 0 ? 'danger.400' : 'divider',
                        overflow: 'hidden', p: 0.75,
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5,
                        cursor: 'pointer', transition: 'all 0.15s ease',
                        '&:hover': { borderColor: count > 0 ? 'danger.500' : 'neutral.400', bgcolor: 'background.level2' },
                      }}
                    >
                      {count > 0 && (
                        <Box sx={{ position: 'absolute', top: 4, right: 4, zIndex: 1, bgcolor: 'danger.500', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Typography sx={{ fontSize: 11, fontWeight: 700, color: 'white', lineHeight: 1 }}>{count}</Typography>
                        </Box>
                      )}
                      <Box component="img" src={page.dataUrl} alt={`Page ${page.pageNum}`}
                        sx={{ maxWidth: '100%', maxHeight: 150, objectFit: 'contain', pointerEvents: 'none' }}
                      />
                      <Typography level="body-xs" sx={{ fontWeight: 500, color: 'text.secondary', fontSize: '0.7rem' }}>
                        {page.pageNum}
                      </Typography>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          )}
        </>
      )}

      {isConverting && (
        <Box>
          {selectedFile && (
            <Typography level="body-sm" sx={{ color: 'text.tertiary', mb: 2 }}>{selectedFile.name}</Typography>
          )}
          <ConversionProgress
            status={conversion.status} position={conversion.position}
            error={conversion.error} inputSize={conversion.inputSize}
            outputSize={conversion.outputSize} previewUrl={conversion.previewUrl}
            onDownload={handleDownload} onRetry={handleRetry}
            showSizeComparison={false}
          />
        </Box>
      )}

      <ToolSEOContent
        howTo={{
          title: 'How to edit a PDF online',
          steps: [
            'Upload your PDF file (up to 100 MB).',
            'Use the Pages tab to rotate, reorder, delete, or extract pages.',
            'Add a watermark, page numbers, or redact sensitive content using the other tabs.',
            'Click "Apply & Download" to save the edited PDF.',
          ],
        }}
        features={[
          { icon: <RotateRightOutlinedIcon />, title: 'Rotate & Reorder', description: 'Rotate pages individually or in bulk, and drag-and-drop to reorder them.' },
          { icon: <ContentCutOutlinedIcon />, title: 'Extract & Delete Pages', description: 'Select specific pages to extract into a new PDF, or remove unwanted pages.' },
          { icon: <TextFieldsOutlinedIcon />, title: 'Watermark', description: 'Add custom text watermarks with adjustable font size, color, opacity, position, and rotation.' },
          { icon: <FormatListNumberedOutlinedIcon />, title: 'Page Numbers', description: 'Insert page numbers with configurable format, position, font size, and starting number.' },
          { icon: <BoltOutlinedIcon />, title: 'Redact Content', description: 'Permanently remove sensitive content by drawing redaction rectangles over any area on any page.' },
          { icon: <LockOutlinedIcon />, title: 'Privacy First', description: 'Files are processed in isolated memory and deleted immediately after download.' },
        ]}
        faq={[
          { question: 'What is the maximum file size?', answer: 'You can upload PDF files up to 100 MB. The editor renders page thumbnails locally in your browser for fast interaction.' },
          { question: 'Can I undo changes?', answer: 'Yes. Use the Reset button on the Pages tab to restore the original page order and rotations. You can also start over at any time.' },
          { question: 'Is redacted content truly removed?', answer: 'Yes. Redacted areas are permanently removed from the PDF at the server level. The content cannot be recovered or revealed.' },
          { question: 'Can I add both watermarks and page numbers?', answer: 'Yes. All editing features can be combined in a single operation — rotate, reorder, watermark, page numbers, and redactions are applied together.' },
          { question: 'Does editing affect text quality?', answer: 'No. Pages are not re-rendered. Text, fonts, and vector graphics remain identical to the original.' },
        ]}
        relatedTools={[
          { label: 'PDF Compress', href: '/compress/pdf' },
          { label: 'PDF Merge', href: '/merge/pdf' },
          { label: 'PDF Password', href: '/convert/pdf-password' },
          { label: 'Extract Images', href: '/convert/pdf-extract-images' },
          { label: 'PDF Repair', href: '/repair/pdf' },
        ]}
      />
      {redactModalPage !== null && selectedFile && (
        <Box sx={{
          position: 'fixed', inset: 0, zIndex: 1300,
          bgcolor: 'rgba(0, 0, 0, 0.85)',
          display: 'flex', flexDirection: 'column',
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1.5, bgcolor: 'background.surface', borderBottom: '1px solid', borderColor: 'divider' }}>
            <Box component="button" onClick={() => setRedactModalPage(p => p !== null && p > 0 ? p - 1 : p)}
              sx={{ ...iconBtnSx, opacity: redactModalPage > 0 ? 1 : 0.3, pointerEvents: redactModalPage > 0 ? 'auto' : 'none' }}>
              <ChevronLeftRoundedIcon />
            </Box>
            <Typography level="body-sm" sx={{ fontWeight: 600, minWidth: 100, textAlign: 'center' }}>
              Page {redactModalPage + 1} / {pages.length}
            </Typography>
            <Box component="button" onClick={() => setRedactModalPage(p => p !== null && p < pages.length - 1 ? p + 1 : p)}
              sx={{ ...iconBtnSx, opacity: redactModalPage < pages.length - 1 ? 1 : 0.3, pointerEvents: redactModalPage < pages.length - 1 ? 'auto' : 'none' }}>
              <ChevronRightRoundedIcon />
            </Box>
            <Box sx={{ flex: 1 }} />
            <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
              Click and drag to draw redaction rectangles
            </Typography>
            <Box component="button" onClick={() => setRedactModalPage(null)} sx={iconBtnSx}>
              <CloseRoundedIcon />
            </Box>
          </Box>

          <Box sx={{ flex: 1, overflow: 'auto', display: 'flex', justifyContent: 'center', p: { xs: 1, sm: 3 } }}>
            <Box sx={{ maxWidth: 800, width: '100%' }}>
              <RedactionCanvas
                file={selectedFile}
                pageIndex={redactModalPage}
                rects={redactions}
                onRectsChange={setRedactions}
              />
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );
}
