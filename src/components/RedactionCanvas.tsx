import { useEffect, useRef, useState, useCallback } from 'react';
import { Box, Typography } from '@mui/joy';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import { actionBtnBase } from '../styles/buttons';

export interface RedactionRect {
  page: number;
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Props {
  file: File;
  pageIndex: number;
  rects: RedactionRect[];
  onRectsChange: (rects: RedactionRect[]) => void;
}

export default function RedactionCanvas({ file, pageIndex, rects, onRectsChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bgCanvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const [renderScale, setRenderScale] = useState(1);
  const [pageSize, setPageSize] = useState({ width: 1, height: 1 });
  const [drawing, setDrawing] = useState(false);
  const startRef = useRef<{ x: number; y: number } | null>(null);
  const [currentRect, setCurrentRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Render PDF page at high resolution
  useEffect(() => {
    let cancelled = false;
    setLoaded(false);
    (async () => {
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/build/pdf.worker.min.mjs',
        import.meta.url,
      ).toString();

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const page = await pdf.getPage(pageIndex + 1);

      const container = containerRef.current;
      if (!container || cancelled) return;
      const containerWidth = container.clientWidth;
      const vp = page.getViewport({ scale: 1 });
      const scale = Math.min(containerWidth / vp.width, 2);
      const scaledVp = page.getViewport({ scale });

      const bgCanvas = bgCanvasRef.current;
      if (!bgCanvas || cancelled) return;
      bgCanvas.width = scaledVp.width;
      bgCanvas.height = scaledVp.height;
      const ctx = bgCanvas.getContext('2d');
      if (!ctx) return;
      await page.render({ canvasContext: ctx, viewport: scaledVp, canvas: bgCanvas } as any).promise;

      const overlay = overlayCanvasRef.current;
      if (overlay) {
        overlay.width = scaledVp.width;
        overlay.height = scaledVp.height;
      }

      setRenderScale(scale);
      setPageSize({ width: vp.width, height: vp.height });
      setLoaded(true);
    })();
    return () => { cancelled = true; };
  }, [file, pageIndex]);

  // Draw overlay
  useEffect(() => {
    const canvas = overlayCanvasRef.current;
    if (!canvas || !loaded) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const pageRects = rects.filter(r => r.page === pageIndex);
    pageRects.forEach((r, i) => {
      ctx.fillStyle = selectedIdx === i ? 'rgba(220, 38, 38, 0.45)' : 'rgba(220, 38, 38, 0.3)';
      ctx.fillRect(r.x * renderScale, r.y * renderScale, r.w * renderScale, r.h * renderScale);
      ctx.strokeStyle = 'rgba(220, 38, 38, 0.8)';
      ctx.lineWidth = selectedIdx === i ? 2 : 1;
      ctx.strokeRect(r.x * renderScale, r.y * renderScale, r.w * renderScale, r.h * renderScale);
    });

    if (currentRect) {
      ctx.fillStyle = 'rgba(220, 38, 38, 0.2)';
      ctx.fillRect(currentRect.x * renderScale, currentRect.y * renderScale, currentRect.w * renderScale, currentRect.h * renderScale);
      ctx.strokeStyle = 'rgba(220, 38, 38, 0.9)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 3]);
      ctx.strokeRect(currentRect.x * renderScale, currentRect.y * renderScale, currentRect.w * renderScale, currentRect.h * renderScale);
      ctx.setLineDash([]);
    }
  }, [rects, pageIndex, renderScale, currentRect, selectedIdx, loaded]);

  const getPdfPoint = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = overlayCanvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return {
      x: ((clientX - rect.left) / rect.width) * pageSize.width,
      y: ((clientY - rect.top) / rect.height) * pageSize.height,
    };
  }, [pageSize]);

  const handleDown = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const pt = getPdfPoint(e);
    if (!pt) return;

    const pageRects = rects.filter(r => r.page === pageIndex);
    for (let i = pageRects.length - 1; i >= 0; i--) {
      const r = pageRects[i];
      if (pt.x >= r.x && pt.x <= r.x + r.w && pt.y >= r.y && pt.y <= r.y + r.h) {
        setSelectedIdx(i);
        return;
      }
    }

    setSelectedIdx(null);
    setDrawing(true);
    startRef.current = pt;
  }, [getPdfPoint, rects, pageIndex]);

  const handleMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!drawing || !startRef.current) return;
    const pt = getPdfPoint(e);
    if (!pt) return;
    setCurrentRect({
      x: Math.min(startRef.current.x, pt.x),
      y: Math.min(startRef.current.y, pt.y),
      w: Math.abs(pt.x - startRef.current.x),
      h: Math.abs(pt.y - startRef.current.y),
    });
  }, [drawing, getPdfPoint]);

  const handleUp = useCallback(() => {
    if (drawing && currentRect && currentRect.w > 5 && currentRect.h > 5) {
      onRectsChange([...rects, { page: pageIndex, ...currentRect }]);
    }
    setDrawing(false);
    startRef.current = null;
    setCurrentRect(null);
  }, [drawing, currentRect, rects, pageIndex, onRectsChange]);

  const deleteSelected = useCallback(() => {
    if (selectedIdx === null) return;
    const pageRects = rects.filter(r => r.page === pageIndex);
    const otherRects = rects.filter(r => r.page !== pageIndex);
    pageRects.splice(selectedIdx, 1);
    onRectsChange([...otherRects, ...pageRects]);
    setSelectedIdx(null);
  }, [selectedIdx, rects, pageIndex, onRectsChange]);

  const pageRectCount = rects.filter(r => r.page === pageIndex).length;

  return (
    <Box ref={containerRef} sx={{ position: 'relative', userSelect: 'none', touchAction: 'none' }}>
      <canvas ref={bgCanvasRef} style={{ display: 'block', width: '100%', height: 'auto' }} />
      <canvas
        ref={overlayCanvasRef}
        onMouseDown={handleDown}
        onMouseMove={handleMove}
        onMouseUp={handleUp}
        onMouseLeave={handleUp}
        onTouchStart={handleDown}
        onTouchMove={handleMove}
        onTouchEnd={handleUp}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          cursor: 'crosshair',
        }}
      />
      {selectedIdx !== null && (
        <Box
          component="button"
          onClick={deleteSelected}
          sx={{
            ...actionBtnBase,
            position: 'absolute',
            top: 8,
            right: 8,
            px: 1.5,
            py: 0.75,
            bgcolor: 'danger.500',
            color: 'white',
            fontSize: '0.8rem',
            zIndex: 2,
            '&:hover': { bgcolor: 'danger.600' },
          }}
        >
          <DeleteOutlineRoundedIcon sx={{ fontSize: 16 }} />
          Delete
        </Box>
      )}
      <Typography level="body-xs" sx={{ position: 'absolute', bottom: 8, left: 8, color: 'text.tertiary', bgcolor: 'rgba(0,0,0,0.6)', px: 1, py: 0.25, borderRadius: 'sm' }}>
        {pageRectCount > 0 ? `${pageRectCount} redaction${pageRectCount > 1 ? 's' : ''}` : 'Click and drag to redact'}
      </Typography>
    </Box>
  );
}
