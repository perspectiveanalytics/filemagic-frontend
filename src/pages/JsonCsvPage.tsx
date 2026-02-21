import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Sheet,
  Tooltip,
} from '@mui/joy';
import SEO, { buildToolSchema } from '../components/SEO';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined';
import { EditorView, keymap } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { basicSetup } from 'codemirror';
import { json as jsonLang } from '@codemirror/lang-json';
import { oneDark } from '@codemirror/theme-one-dark';
import { indentWithTab } from '@codemirror/commands';
import Papa from 'papaparse';
import ToolDisclaimer from '../components/ToolDisclaimer';
import ToolSEOContent from '../components/ToolSEOContent';
import TableChartOutlinedIcon from '@mui/icons-material/TableChartOutlined';
import DataObjectOutlinedIcon from '@mui/icons-material/DataObjectOutlined';
import SyncAltOutlinedIcon from '@mui/icons-material/SyncAltOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import TextFieldsOutlinedIcon from '@mui/icons-material/TextFieldsOutlined';

// ── Types ────────────────────────────────────────────────────────────────────

type Direction = 'json-to-csv' | 'csv-to-json';

// ── Constants ────────────────────────────────────────────────────────────────

const SAMPLE_JSON = `[
  { "name": "Alice", "age": 30, "city": "Paris" },
  { "name": "Bob", "age": 25, "city": "London" },
  { "name": "Charlie", "age": 35, "city": "Berlin" }
]
`;

const DEBOUNCE_MS = 300;

const cmTheme = EditorView.theme({
  '&': { fontSize: '13px' },
  '.cm-scroller': {
    fontFamily: '"SF Mono", "Fira Code", "Fira Mono", "Consolas", monospace',
  },
  '.cm-gutters': { border: 'none' },
}, { dark: true });

// ── Helpers ──────────────────────────────────────────────────────────────────

function setEditorContent(view: EditorView | null, content: string) {
  if (!view) return;
  const cur = view.state.doc.toString();
  if (cur === content) return;
  view.dispatch({ changes: { from: 0, to: cur.length, insert: content } });
}

// ── Sub-components ───────────────────────────────────────────────────────────

function CopyBtn({ getText }: { getText: () => string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Tooltip title={copied ? 'Copied!' : 'Copy'} size="sm">
      <IconButton
        size="sm"
        variant="plain"
        color="neutral"
        onClick={() => {
          navigator.clipboard.writeText(getText());
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
      >
        {copied
          ? <CheckOutlinedIcon sx={{ fontSize: 14, color: 'success.500' }} />
          : <ContentCopyOutlinedIcon sx={{ fontSize: 14 }} />}
      </IconButton>
    </Tooltip>
  );
}

// ── Main component ───────────────────────────────────────────────────────────

const toolBtn = {
  px: 1.5,
  py: 0.75,
  borderRadius: 'md',
  fontSize: '0.75rem',
  fontWeight: 600,
  cursor: 'pointer',
  border: '1px solid',
  borderColor: 'divider',
  bgcolor: 'transparent',
  color: 'text.secondary',
  transition: 'all 0.15s',
  outline: 'none',
  display: 'inline-flex',
  alignItems: 'center',
  gap: 0.5,
  '&:hover': {
    borderColor: 'neutral.500',
    color: 'text.primary',
    bgcolor: 'background.level1',
  },
} as const;

export default function JsonCsvPage() {
  const jsonContainerRef = useRef<HTMLDivElement>(null);
  const csvContainerRef = useRef<HTMLDivElement>(null);
  const jsonViewRef = useRef<EditorView | null>(null);
  const csvViewRef = useRef<EditorView | null>(null);
  const isConvertingRef = useRef(false);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [direction, setDirection] = useState<Direction>('json-to-csv');
  const [error, setError] = useState<string | null>(null);

  // ── Conversion logic ────────────────────────────────────────────────────

  const convertJsonToCsv = useCallback((text: string) => {
    if (isConvertingRef.current) return;
    isConvertingRef.current = true;

    if (!text.trim()) {
      setEditorContent(csvViewRef.current, '');
      setError(null);
      isConvertingRef.current = false;
      return;
    }

    try {
      const parsed: unknown = JSON.parse(text);

      if (!Array.isArray(parsed)) {
        setError('JSON must be an array of objects');
        isConvertingRef.current = false;
        return;
      }

      if (parsed.length > 0 && (typeof parsed[0] !== 'object' || parsed[0] === null)) {
        setError('JSON array must contain objects');
        isConvertingRef.current = false;
        return;
      }

      const csv = Papa.unparse(parsed);
      setEditorContent(csvViewRef.current, csv);
      setError(null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Invalid JSON');
    }

    isConvertingRef.current = false;
  }, []);

  const convertCsvToJson = useCallback((text: string) => {
    if (isConvertingRef.current) return;
    isConvertingRef.current = true;

    if (!text.trim()) {
      setEditorContent(jsonViewRef.current, '');
      setError(null);
      isConvertingRef.current = false;
      return;
    }

    try {
      const result = Papa.parse(text, { header: true, dynamicTyping: true });

      if (result.errors.length > 0) {
        const firstError = result.errors[0];
        setError(`Row ${(firstError.row ?? 0) + 1}: ${firstError.message}`);
      } else {
        setError(null);
      }

      const json = JSON.stringify(result.data, null, 2);
      setEditorContent(jsonViewRef.current, json);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Invalid CSV');
    }

    isConvertingRef.current = false;
  }, []);

  // ── Debounced change handlers ───────────────────────────────────────────

  const handleJsonChange = useCallback((text: string) => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      convertJsonToCsv(text);
    }, DEBOUNCE_MS);
  }, [convertJsonToCsv]);

  const handleCsvChange = useCallback((text: string) => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      convertCsvToJson(text);
    }, DEBOUNCE_MS);
  }, [convertCsvToJson]);

  // ── Editor setup ────────────────────────────────────────────────────────

  useEffect(() => {
    if (!jsonContainerRef.current || !csvContainerRef.current) return;

    const commonExtensions = [
      basicSetup,
      keymap.of([indentWithTab]),
      oneDark,
      cmTheme,
      EditorView.lineWrapping,
    ];

    const jv = new EditorView({
      state: EditorState.create({
        doc: '',
        extensions: [
          ...commonExtensions,
          jsonLang(),
          EditorView.updateListener.of((update) => {
            if (update.docChanged && !isConvertingRef.current) {
              handleJsonChange(update.state.doc.toString());
            }
          }),
        ],
      }),
      parent: jsonContainerRef.current,
    });

    const cv = new EditorView({
      state: EditorState.create({
        doc: '',
        extensions: [
          ...commonExtensions,
          EditorView.updateListener.of((update) => {
            if (update.docChanged && !isConvertingRef.current) {
              handleCsvChange(update.state.doc.toString());
            }
          }),
        ],
      }),
      parent: csvContainerRef.current,
    });

    jsonViewRef.current = jv;
    csvViewRef.current = cv;

    // Populate initial content
    isConvertingRef.current = true;
    jv.dispatch({ changes: { from: 0, to: 0, insert: SAMPLE_JSON } });
    try {
      const parsed = JSON.parse(SAMPLE_JSON);
      cv.dispatch({ changes: { from: 0, to: 0, insert: Papa.unparse(parsed) } });
    } catch { /* sample is always valid */ }
    isConvertingRef.current = false;

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      jv.destroy();
      cv.destroy();
      jsonViewRef.current = null;
      csvViewRef.current = null;
    };
  }, [handleJsonChange, handleCsvChange]);

  // ── Direction toggle handler ────────────────────────────────────────────

  const handleDirectionChange = useCallback((newDirection: Direction) => {
    setDirection(newDirection);
    setError(null);

    // Trigger conversion in the new direction from the source editor
    if (newDirection === 'json-to-csv') {
      const jsonText = jsonViewRef.current?.state.doc.toString() || '';
      if (jsonText.trim()) {
        convertJsonToCsv(jsonText);
      }
    } else {
      const csvText = csvViewRef.current?.state.doc.toString() || '';
      if (csvText.trim()) {
        convertCsvToJson(csvText);
      }
    }
  }, [convertJsonToCsv, convertCsvToJson]);

  // ── Clear handler ───────────────────────────────────────────────────────

  const handleClear = useCallback(() => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    isConvertingRef.current = true;
    setEditorContent(jsonViewRef.current, '');
    setEditorContent(csvViewRef.current, '');
    isConvertingRef.current = false;
    setError(null);
  }, []);

  const getJsonContent = useCallback(() => jsonViewRef.current?.state.doc.toString() || '', []);
  const getCsvContent = useCallback(() => csvViewRef.current?.state.doc.toString() || '', []);

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <Box sx={{ maxWidth: 960, mx: 'auto', width: '100%', py: { xs: 3, md: 4 } }}>
      <SEO
        title="JSON / CSV Converter"
        description="Convert between JSON arrays and CSV. Free, runs entirely in your browser. No data leaves your device."
        path="/convert/json-csv"
        structuredData={buildToolSchema(
          'JSON / CSV Converter',
          'Convert between JSON arrays and CSV. Free, runs entirely in your browser.',
          '/convert/json-csv',
        )}
      />

      <Typography component="h1" level="h3" sx={{ mb: 1, fontWeight: 700, letterSpacing: '-0.02em' }}>
        JSON &harr; CSV
      </Typography>
      <Typography level="body-sm" sx={{ color: 'text.tertiary', mb: 4 }}>
        Convert between JSON arrays and CSV
      </Typography>

      <ToolDisclaimer toolId="json-csv" />

      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <Box
          component="button"
          onClick={() => handleDirectionChange('json-to-csv')}
          sx={{
            ...toolBtn,
            borderColor: direction === 'json-to-csv' ? 'primary.500' : 'divider',
            color: direction === 'json-to-csv' ? 'primary.softColor' : 'text.secondary',
          }}
        >
          JSON &rarr; CSV
        </Box>
        <Box
          component="button"
          onClick={() => handleDirectionChange('csv-to-json')}
          sx={{
            ...toolBtn,
            borderColor: direction === 'csv-to-json' ? 'primary.500' : 'divider',
            color: direction === 'csv-to-json' ? 'primary.softColor' : 'text.secondary',
          }}
        >
          CSV &rarr; JSON
        </Box>
        <Box sx={{ flex: 1 }} />
        <Box component="button" onClick={handleClear} sx={{ ...toolBtn, color: 'text.tertiary' }}>
          Clear
        </Box>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' } }}>
        <Sheet variant="outlined" sx={{ flex: 1, borderRadius: 'lg', overflow: 'hidden', minWidth: 0 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 2,
              py: 1,
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography
              level="body-xs"
              sx={{ fontWeight: 700, color: 'text.tertiary', textTransform: 'uppercase', letterSpacing: '0.08em' }}
            >
              JSON
            </Typography>
            <CopyBtn getText={getJsonContent} />
          </Box>
          <Box
            ref={jsonContainerRef}
            sx={{
              height: { xs: 280, md: 400 },
              overflow: 'auto',
              '& .cm-editor': { height: '100%' },
              '& .cm-scroller': { overflow: 'auto' },
            }}
          />
        </Sheet>

        <Sheet variant="outlined" sx={{ flex: 1, borderRadius: 'lg', overflow: 'hidden', minWidth: 0 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 2,
              py: 1,
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography
              level="body-xs"
              sx={{ fontWeight: 700, color: 'text.tertiary', textTransform: 'uppercase', letterSpacing: '0.08em' }}
            >
              CSV
            </Typography>
            <CopyBtn getText={getCsvContent} />
          </Box>
          <Box
            ref={csvContainerRef}
            sx={{
              height: { xs: 280, md: 400 },
              overflow: 'auto',
              '& .cm-editor': { height: '100%' },
              '& .cm-scroller': { overflow: 'auto' },
            }}
          />
        </Sheet>
      </Box>

      {error && (
        <Box
          sx={{
            mt: 2,
            px: 2,
            py: 1.5,
            borderRadius: 'md',
            bgcolor: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid',
            borderColor: 'danger.plainColor',
          }}
        >
          <Typography
            level="body-xs"
            sx={{ color: 'danger.plainColor', fontFamily: 'monospace', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
          >
            {error}
          </Typography>
        </Box>
      )}

      <ToolSEOContent
        howTo={{
          title: 'How to convert between JSON and CSV',
          steps: [
            'Choose a direction: JSON to CSV or CSV to JSON using the toolbar buttons.',
            'Paste or type your JSON array in the left editor, or CSV data in the right editor.',
            'The converted output appears automatically in the other panel.',
            'Click the copy button on either panel to copy the result to your clipboard.',
            'Use the Clear button to start over with new data.',
          ],
        }}
        features={[
          { icon: <SyncAltOutlinedIcon />, title: 'Bi-directional Conversion', description: 'Convert JSON arrays to CSV or CSV back to JSON arrays of objects with automatic header detection.' },
          { icon: <DataObjectOutlinedIcon />, title: 'Smart Type Parsing', description: 'CSV to JSON conversion automatically detects numbers, booleans, and null values instead of treating everything as strings.' },
          { icon: <TableChartOutlinedIcon />, title: 'Header-based Mapping', description: 'CSV headers become JSON object keys. Nested objects are flattened into dot-notation columns.' },
          { icon: <TextFieldsOutlinedIcon />, title: 'Syntax-highlighted Editors', description: 'Full CodeMirror editor with JSON syntax highlighting, line numbers, and bracket matching.' },
          { icon: <BoltOutlinedIcon />, title: 'Instant Conversion', description: 'Results update in real time as you type with smart debouncing for smooth performance.' },
          { icon: <LockOutlinedIcon />, title: 'Runs in Your Browser', description: 'No data is sent to any server. All processing happens locally in your browser.' },
        ]}
        faq={[
          { question: 'What JSON structure is required for CSV conversion?', answer: 'The JSON input must be an array of objects (e.g. [{"name": "Alice", "age": 30}]). Each object becomes a row, and the keys become column headers.' },
          { question: 'How are nested JSON objects handled?', answer: 'Nested objects and arrays are serialized as JSON strings within the CSV cell. For deeply nested data, consider flattening your JSON first.' },
          { question: 'Does CSV to JSON preserve data types?', answer: 'Yes. Dynamic typing is enabled by default, so numeric strings become numbers, "true"/"false" become booleans, and empty cells become null.' },
          { question: 'Is there a row or file size limit?', answer: 'There is no hard limit since everything runs in your browser. However, very large datasets (tens of thousands of rows) may slow down the real-time preview.' },
        ]}
        relatedTools={[
          { label: 'CSV / Excel Converter', href: '/convert/csv-excel' },
          { label: 'YAML / JSON Converter', href: '/convert/yaml' },
          { label: 'Base64 Encode / Decode', href: '/tools/base64' },
          { label: 'Word Counter', href: '/tools/word-counter' },
        ]}
      />
    </Box>
  );
}
