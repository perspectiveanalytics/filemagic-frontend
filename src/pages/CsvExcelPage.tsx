import { useState, useCallback, useRef } from 'react';
import { Box, Typography, RadioGroup, Radio, Sheet, FormControl, FormLabel } from '@mui/joy';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import FileDropZone from '../components/FileDropZone';
import SEO, { buildToolSchema } from '../components/SEO';
import ToolDisclaimer from '../components/ToolDisclaimer';
import ToolSEOContent from '../components/ToolSEOContent';
import TableChartOutlinedIcon from '@mui/icons-material/TableChartOutlined';
import GridOnOutlinedIcon from '@mui/icons-material/GridOnOutlined';
import SyncAltOutlinedIcon from '@mui/icons-material/SyncAltOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import CloudOffOutlinedIcon from '@mui/icons-material/CloudOffOutlined';
import { actionBtnBase } from '../styles/buttons';

type ConvertMode = 'csv-to-excel' | 'excel-to-csv';
type PageStatus = 'idle' | 'processing' | 'done' | 'error';

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function reloadOnStaleChunk(): never {
  const key = 'chunk-reload';
  if (!sessionStorage.getItem(key)) {
    sessionStorage.setItem(key, '1');
    window.location.reload();
  }
  throw new Error('Failed to load module. Please refresh the page.');
}

export default function CsvExcelPage() {
  const [mode, setMode] = useState<ConvertMode>('csv-to-excel');
  const [status, setStatus] = useState<PageStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [resultName, setResultName] = useState('');
  const [resultSize, setResultSize] = useState(0);
  const blobRef = useRef<Blob | null>(null);

  const handleFileSelect = useCallback(async (file: File) => {
    setStatus('processing');
    setError(null);

    try {
      if (mode === 'csv-to-excel') {
        const [Papa, { default: writeXlsxFile }] = await Promise.all([
          import('papaparse').catch(() => reloadOnStaleChunk()),
          import('write-excel-file').catch(() => reloadOnStaleChunk()),
        ]);

        const text = await file.text();
        const parsed = Papa.default.parse(text, { header: true, skipEmptyLines: true });
        const rows = parsed.data as Record<string, unknown>[];
        const headers = parsed.meta.fields || Object.keys(rows[0] || {});

        type XlsxCell = { value: string | number | null; fontWeight?: 'bold' };
        const headerRow: XlsxCell[] = headers.map(h => ({ value: h, fontWeight: 'bold' as const }));
        const dataRows: XlsxCell[][] = rows.map(row =>
          headers.map(h => {
            const v = row[h];
            if (v == null || v === '') return { value: null };
            const n = Number(v);
            if (!isNaN(n) && String(v).trim() !== '') return { value: n };
            return { value: String(v) };
          })
        );

        const blob: Blob = await writeXlsxFile([headerRow, ...dataRows] as any, {
          sheet: 'Sheet1',
        });

        const baseName = file.name.replace(/\.[^.]+$/, '');
        blobRef.current = blob;
        setResultName(`${baseName}.xlsx`);
        setResultSize(blob.size);
        setStatus('done');
      } else {
        const readXlsxFile = await import('read-excel-file').catch(() => reloadOnStaleChunk());

        const rows = await readXlsxFile.default(file);
        const csv = rows.map(row =>
          row.map(cell => {
            if (cell == null) return '';
            const s = String(cell);
            if (s.includes(',') || s.includes('"') || s.includes('\n')) {
              return `"${s.replace(/"/g, '""')}"`;
            }
            return s;
          }).join(',')
        ).join('\n');

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const baseName = file.name.replace(/\.[^.]+$/, '');
        blobRef.current = blob;
        setResultName(`${baseName}.csv`);
        setResultSize(blob.size);
        setStatus('done');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conversion failed');
      setStatus('error');
    }
  }, [mode]);

  const handleDownload = useCallback(() => {
    if (!blobRef.current) return;
    const url = URL.createObjectURL(blobRef.current);
    const a = document.createElement('a');
    a.href = url;
    a.download = resultName;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 500);
  }, [resultName]);

  const handleReset = useCallback(() => {
    setStatus('idle');
    setError(null);
    blobRef.current = null;
    setResultName('');
    setResultSize(0);
  }, []);

  const accept = mode === 'csv-to-excel'
    ? '.csv,text/csv'
    : '.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel';

  return (
    <Box sx={{ maxWidth: 520, mx: 'auto', width: '100%', py: { xs: 3, md: 4 } }}>
      <SEO title="CSV / Excel" description="Convert between CSV and Excel for free. 100% client-side, no upload." path="/convert/csv-excel" structuredData={buildToolSchema('CSV / Excel', 'Convert CSV to Excel and back.', '/convert/csv-excel')} />
      <Typography component="h1" level="h3" sx={{ mb: 1, fontWeight: 700, letterSpacing: '-0.02em' }}>
        CSV / Excel
      </Typography>
      <Typography level="body-sm" sx={{ color: 'text.tertiary', mb: 4 }}>
        Convert between CSV and Excel — 100% client-side
      </Typography>

      <ToolDisclaimer toolId="csv-excel" />

      <FormControl sx={{ mb: 3 }}>
        <FormLabel>Direction</FormLabel>
        <RadioGroup
          orientation="horizontal"
          value={mode}
          onChange={(e) => { setMode(e.target.value as ConvertMode); handleReset(); }}
          sx={{ gap: 1.5 }}
        >
          <Sheet variant="outlined" sx={{ px: 2, py: 1, borderRadius: 'md' }}>
            <Radio value="csv-to-excel" label="CSV → Excel" overlay disabled={status === 'processing'} />
          </Sheet>
          <Sheet variant="outlined" sx={{ px: 2, py: 1, borderRadius: 'md' }}>
            <Radio value="excel-to-csv" label="Excel → CSV" overlay disabled={status === 'processing'} />
          </Sheet>
        </RadioGroup>
      </FormControl>

      {status === 'idle' && (
        <FileDropZone
          onFileSelect={handleFileSelect}
          accept={accept}
          maxSize={10 * 1024 * 1024}
        />
      )}

      {status === 'processing' && (
        <Box sx={{ p: 4, borderRadius: 'lg', bgcolor: 'background.surface', border: '1px solid', borderColor: 'divider', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Typography level="body-md" sx={{ color: 'text.secondary' }}>
            Converting...
          </Typography>
        </Box>
      )}

      {status === 'done' && (
        <Box sx={{ p: 4, borderRadius: 'lg', bgcolor: 'background.surface', border: '1px solid', borderColor: 'primary.800', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <CheckCircleOutlineIcon sx={{ fontSize: 36, color: 'success.500' }} />
          <Typography level="body-sm" sx={{ color: 'text.secondary' }}>
            {resultName} — {formatBytes(resultSize)}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Box component="button" onClick={handleDownload} sx={{ ...actionBtnBase, bgcolor: 'primary.500', color: 'white', minWidth: 160, '&:hover': { bgcolor: 'primary.600', transform: 'translateY(-1px)', boxShadow: '0 4px 16px rgba(37, 99, 235, 0.25)' }, '&:active': { transform: 'translateY(0)', boxShadow: 'none' } }}>
              <DownloadRoundedIcon sx={{ fontSize: 18 }} />
              Download
            </Box>
            <Box component="button" onClick={handleReset} sx={{ ...actionBtnBase, bgcolor: 'transparent', color: 'text.secondary', border: '1px solid', borderColor: 'divider', '&:hover': { borderColor: 'neutral.500', color: 'text.primary', bgcolor: 'background.level1', transform: 'translateY(-1px)' }, '&:active': { transform: 'translateY(0)' } }}>
              <AddRoundedIcon sx={{ fontSize: 18 }} />
              New
            </Box>
          </Box>
        </Box>
      )}

      {status === 'error' && (
        <Box sx={{ p: 4, borderRadius: 'lg', bgcolor: 'background.surface', border: '1px solid', borderColor: 'danger.plainColor', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <Typography level="body-md" sx={{ color: 'danger.plainColor' }}>
            {error || 'Conversion failed'}
          </Typography>
          <Box component="button" onClick={handleReset} sx={{ ...actionBtnBase, bgcolor: 'transparent', color: 'text.secondary', border: '1px solid', borderColor: 'divider', '&:hover': { borderColor: 'neutral.500', color: 'text.primary', bgcolor: 'background.level1' } }}>
            Try again
          </Box>
        </Box>
      )}
      <ToolSEOContent
        howTo={{
          title: 'How to convert between CSV and Excel',
          steps: [
            'Select the conversion direction: CSV to Excel or Excel to CSV.',
            'Upload your file by dragging it onto the drop zone or clicking to browse.',
            'The conversion runs instantly in your browser.',
            'Download the converted file with one click.',
          ],
        }}
        features={[
          { icon: <SyncAltOutlinedIcon />, title: 'Bi-directional Conversion', description: 'Convert CSV files to Excel (.xlsx) or Excel spreadsheets back to CSV with a single click.' },
          { icon: <TableChartOutlinedIcon />, title: 'Header Preservation', description: 'Column headers and data types are preserved accurately during conversion in both directions.' },
          { icon: <GridOnOutlinedIcon />, title: 'Full Excel Support', description: 'Supports both .xlsx and .xls Excel formats with proper sheet structure and cell formatting.' },
          { icon: <CloudOffOutlinedIcon />, title: '100% Client-side', description: 'Files never leave your device. All processing happens locally in your browser using WebAssembly.' },
          { icon: <BoltOutlinedIcon />, title: 'Instant Processing', description: 'Conversion happens in milliseconds, even for large spreadsheets with thousands of rows.' },
          { icon: <LockOutlinedIcon />, title: 'Privacy First', description: 'No file uploads, no server processing, no data collection. Your spreadsheets stay on your machine.' },
        ]}
        faq={[
          { question: 'What Excel formats are supported?', answer: 'Both modern .xlsx (Excel 2007+) and legacy .xls formats are supported for input. Output is always in the modern .xlsx format.' },
          { question: 'Is there a file size limit?', answer: 'The maximum upload size is 10 MB. Since everything runs in your browser, very large files may take a moment to process.' },
          { question: 'Are formulas preserved when converting Excel to CSV?', answer: 'No. CSV is a plain text format, so only the computed cell values are exported. Formulas, styling, and charts are not included in the CSV output.' },
          { question: 'Does it handle multiple sheets?', answer: 'When converting Excel to CSV, only the first sheet is exported. For multi-sheet workbooks, you may need to convert each sheet separately.' },
          { question: 'Can I convert TSV (tab-separated) files?', answer: 'Currently only comma-separated CSV is supported. For TSV files, consider replacing tabs with commas first, or use the JSON/CSV converter as an intermediate step.' },
        ]}
        relatedTools={[
          { label: 'JSON / CSV Converter', href: '/convert/json-csv' },
          { label: 'YAML / JSON Converter', href: '/convert/yaml' },
          { label: 'PDF Compress', href: '/compress/pdf' },
          { label: 'Word Counter', href: '/tools/word-counter' },
        ]}
      />
    </Box>
  );
}
