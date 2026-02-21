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
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { EditorView, keymap } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { basicSetup } from 'codemirror';
import { json as jsonLang } from '@codemirror/lang-json';
import { yaml as yamlLang } from '@codemirror/lang-yaml';
import { oneDark } from '@codemirror/theme-one-dark';
import { indentWithTab } from '@codemirror/commands';
import yaml from 'js-yaml';
import ToolDisclaimer from '../components/ToolDisclaimer';
import ToolSEOContent from '../components/ToolSEOContent';
import CodeOutlinedIcon from '@mui/icons-material/CodeOutlined';
import DataObjectOutlinedIcon from '@mui/icons-material/DataObjectOutlined';
import AccountTreeOutlinedIcon from '@mui/icons-material/AccountTreeOutlined';
import SyncAltOutlinedIcon from '@mui/icons-material/SyncAltOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

// ── Types ────────────────────────────────────────────────────────────────────

interface CoercionWarning {
  line: number;
  raw: string;
  coercedTo: string;
}

// ── Constants ────────────────────────────────────────────────────────────────

const SAMPLE_YAML = `# Example configuration
server:
  host: localhost
  port: 8080
  debug: true

database:
  host: db.example.com
  port: 5432
  name: myapp

features:
  - authentication
  - logging
  - caching
`;

const BOOL_LIKE = new Set([
  'y', 'Y', 'yes', 'Yes', 'YES',
  'n', 'N', 'no', 'No', 'NO',
  'on', 'On', 'ON',
  'off', 'Off', 'OFF',
]);

const cmTheme = EditorView.theme({
  '&': { fontSize: '13px' },
  '.cm-scroller': {
    fontFamily: '"SF Mono", "Fira Code", "Fira Mono", "Consolas", monospace',
  },
  '.cm-gutters': { border: 'none' },
}, { dark: true });

// ── Helpers ──────────────────────────────────────────────────────────────────

function sortKeys(obj: unknown): unknown {
  if (Array.isArray(obj)) return obj.map(sortKeys);
  if (obj !== null && typeof obj === 'object' && !(obj instanceof Date)) {
    return Object.keys(obj as Record<string, unknown>)
      .sort()
      .reduce<Record<string, unknown>>((acc, k) => {
        acc[k] = sortKeys((obj as Record<string, unknown>)[k]);
        return acc;
      }, {});
  }
  return obj;
}

function detectCoercions(text: string): CoercionWarning[] {
  const warnings: CoercionWarning[] = [];
  const lines = text.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();
    if (!trimmed || trimmed.startsWith('#') || trimmed === '---' || trimmed === '...') continue;

    let rawValue: string | null = null;
    const kvMatch = trimmed.match(/^[^#]*?:\s+(.+)$/);
    if (kvMatch) {
      rawValue = kvMatch[1].trim();
    } else {
      const listMatch = trimmed.match(/^-\s+(.+)$/);
      if (listMatch) rawValue = listMatch[1].trim();
    }

    if (!rawValue || rawValue.startsWith('"') || rawValue.startsWith("'")) continue;

    // Strip inline comments
    const commentIdx = rawValue.indexOf(' #');
    if (commentIdx > 0) rawValue = rawValue.substring(0, commentIdx).trim();

    // Boolean coercion (yes/no/on/off/y/n — but not true/false which are obvious)
    if (BOOL_LIKE.has(rawValue)) {
      const truthy = ['y', 'Y', 'yes', 'Yes', 'YES', 'on', 'On', 'ON'].includes(rawValue);
      warnings.push({
        line: i + 1,
        raw: rawValue,
        coercedTo: truthy ? 'true (boolean)' : 'false (boolean)',
      });
    }

    // Date coercion (YYYY-MM-DD)
    if (/^\d{4}-\d{2}-\d{2}$/.test(rawValue)) {
      warnings.push({ line: i + 1, raw: rawValue, coercedTo: 'Date object' });
    }
  }

  return warnings;
}

function setEditorContent(view: EditorView | null, content: string) {
  if (!view) return;
  const cur = view.state.doc.toString();
  if (cur === content) return;
  view.dispatch({ changes: { from: 0, to: cur.length, insert: content } });
}

function parseYamlSafe(text: string): { data: unknown; docCount: number } | null {
  try {
    const docs = (yaml.loadAll(text) as unknown[]).filter((d) => d !== undefined);
    if (docs.length === 0) return { data: null, docCount: 0 };
    return { data: docs.length === 1 ? docs[0] : docs, docCount: docs.length };
  } catch {
    return null;
  }
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

function TreeNode({ name, value, path, depth }: {
  name: string;
  value: unknown;
  path: string;
  depth: number;
}) {
  const [expanded, setExpanded] = useState(depth < 2);
  const [copied, setCopied] = useState(false);

  const isObj = value !== null && typeof value === 'object';
  const isArr = Array.isArray(value);

  const valColor =
    typeof value === 'string' ? '#98c379'
    : typeof value === 'number' ? '#d19a66'
    : typeof value === 'boolean' ? '#c678dd'
    : value === null ? '#5c6370'
    : '#abb2bf';

  const displayVal = typeof value === 'string' ? `"${value}"` : String(value);

  const handleClick = useCallback(() => {
    if (isObj) {
      setExpanded((prev) => !prev);
    } else {
      navigator.clipboard.writeText(path);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    }
  }, [isObj, path]);

  return (
    <>
      <Box
        onClick={handleClick}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
          py: '3px',
          pl: `${depth * 20 + 8}px`,
          pr: 1,
          cursor: 'pointer',
          borderRadius: 'sm',
          fontFamily: '"SF Mono", "Fira Code", "Consolas", monospace',
          fontSize: '0.8rem',
          '&:hover': { bgcolor: 'rgba(255,255,255,0.04)' },
          userSelect: 'none',
        }}
      >
        <Box sx={{ width: 16, flexShrink: 0, color: '#5c6370', fontSize: '0.7rem' }}>
          {isObj ? (expanded ? '▾' : '▸') : ''}
        </Box>
        <Box component="span" sx={{ color: '#e06c75', fontWeight: 500 }}>{name}</Box>
        {isObj ? (
          <Box component="span" sx={{ color: '#5c6370', ml: 0.5 }}>
            {isArr ? `[${(value as unknown[]).length}]` : `{${Object.keys(value as Record<string, unknown>).length}}`}
          </Box>
        ) : (
          <>
            <Box component="span" sx={{ color: '#5c6370' }}>:</Box>
            <Box component="span" sx={{ color: valColor, ml: 0.5 }}>{displayVal}</Box>
          </>
        )}
        {copied && (
          <Box component="span" sx={{ color: 'success.500', ml: 'auto', fontSize: '0.7rem' }}>
            path copied
          </Box>
        )}
      </Box>
      {isObj && expanded && (
        isArr
          ? (value as unknown[]).map((item, i) => (
              <TreeNode key={i} name={String(i)} value={item} path={`${path}[${i}]`} depth={depth + 1} />
            ))
          : Object.entries(value as Record<string, unknown>).map(([k, v]) => (
              <TreeNode key={k} name={k} value={v} path={`${path}.${k}`} depth={depth + 1} />
            ))
      )}
    </>
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

export default function YamlJsonPage() {
  const yamlContainerRef = useRef<HTMLDivElement>(null);
  const jsonContainerRef = useRef<HTMLDivElement>(null);
  const yamlViewRef = useRef<EditorView | null>(null);
  const jsonViewRef = useRef<EditorView | null>(null);
  const isConvertingRef = useRef(false);
  const lastEditedRef = useRef<'yaml' | 'json'>('yaml');

  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<CoercionWarning[]>([]);
  const [parsedData, setParsedData] = useState<unknown>(null);
  const [showTree, setShowTree] = useState(false);
  const [multiDocCount, setMultiDocCount] = useState(0);

  // ── Conversion handlers ──────────────────────────────────────────────────

  const convertYamlToJson = useCallback((text: string) => {
    if (isConvertingRef.current) return;
    isConvertingRef.current = true;
    lastEditedRef.current = 'yaml';

    if (!text.trim()) {
      setEditorContent(jsonViewRef.current, '');
      setError(null);
      setParsedData(null);
      setWarnings([]);
      setMultiDocCount(0);
      isConvertingRef.current = false;
      return;
    }

    try {
      const docs = (yaml.loadAll(text) as unknown[]).filter((d) => d !== undefined);
      if (docs.length === 0) {
        setEditorContent(jsonViewRef.current, '');
        setError(null);
        setParsedData(null);
        setMultiDocCount(0);
      } else {
        const result = docs.length === 1 ? docs[0] : docs;
        setEditorContent(jsonViewRef.current, JSON.stringify(result, null, 2));
        setError(null);
        setParsedData(result);
        setMultiDocCount(docs.length > 1 ? docs.length : 0);
      }
      setWarnings(detectCoercions(text));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Invalid YAML');
    }

    isConvertingRef.current = false;
  }, []);

  const convertJsonToYaml = useCallback((text: string) => {
    if (isConvertingRef.current) return;
    isConvertingRef.current = true;
    lastEditedRef.current = 'json';

    if (!text.trim()) {
      setEditorContent(yamlViewRef.current, '');
      setError(null);
      setParsedData(null);
      setWarnings([]);
      setMultiDocCount(0);
      isConvertingRef.current = false;
      return;
    }

    try {
      const parsed: unknown = JSON.parse(text);
      setEditorContent(yamlViewRef.current, yaml.dump(parsed, { lineWidth: -1, noRefs: true }));
      setError(null);
      setParsedData(parsed);
      setMultiDocCount(0);
      setWarnings([]);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Invalid JSON');
    }

    isConvertingRef.current = false;
  }, []);

  // ── Editor setup ─────────────────────────────────────────────────────────

  useEffect(() => {
    if (!yamlContainerRef.current || !jsonContainerRef.current) return;

    const makeExtensions = (lang: ReturnType<typeof yamlLang>, onChange: (t: string) => void) => [
      basicSetup,
      lang,
      keymap.of([indentWithTab]),
      oneDark,
      cmTheme,
      EditorView.lineWrapping,
      EditorView.updateListener.of((update) => {
        if (update.docChanged && !isConvertingRef.current) {
          onChange(update.state.doc.toString());
        }
      }),
    ];

    const yv = new EditorView({
      state: EditorState.create({
        doc: '',
        extensions: makeExtensions(yamlLang(), convertYamlToJson),
      }),
      parent: yamlContainerRef.current,
    });

    const jv = new EditorView({
      state: EditorState.create({
        doc: '',
        extensions: makeExtensions(jsonLang(), convertJsonToYaml),
      }),
      parent: jsonContainerRef.current,
    });

    yamlViewRef.current = yv;
    jsonViewRef.current = jv;

    // Populate initial content without triggering conversion loops
    isConvertingRef.current = true;
    yv.dispatch({ changes: { from: 0, to: 0, insert: SAMPLE_YAML } });
    try {
      const parsed = yaml.load(SAMPLE_YAML);
      jv.dispatch({ changes: { from: 0, to: 0, insert: JSON.stringify(parsed, null, 2) } });
      setParsedData(parsed);
    } catch { /* sample is always valid */ }
    isConvertingRef.current = false;

    return () => {
      yv.destroy();
      jv.destroy();
      yamlViewRef.current = null;
      jsonViewRef.current = null;
    };
  }, [convertYamlToJson, convertJsonToYaml]);

  // ── Toolbar actions ──────────────────────────────────────────────────────

  const getCurrentData = useCallback((): unknown => {
    if (lastEditedRef.current === 'json') {
      return JSON.parse(jsonViewRef.current?.state.doc.toString() || '');
    }
    const parsed = parseYamlSafe(yamlViewRef.current?.state.doc.toString() || '');
    if (parsed) return parsed.data;
    // Fallback: try JSON side
    return JSON.parse(jsonViewRef.current?.state.doc.toString() || '');
  }, []);

  const handleFormat = useCallback(() => {
    try {
      const data = getCurrentData();
      if (data == null) return;
      isConvertingRef.current = true;
      setEditorContent(yamlViewRef.current, yaml.dump(data, { lineWidth: 80, noRefs: true }));
      setEditorContent(jsonViewRef.current, JSON.stringify(data, null, 2));
      isConvertingRef.current = false;
      setError(null);
      setParsedData(data);
    } catch (e: unknown) {
      isConvertingRef.current = false;
      setError(e instanceof Error ? e.message : 'Cannot format — fix syntax errors first');
    }
  }, [getCurrentData]);

  const handleMinify = useCallback(() => {
    try {
      const data = getCurrentData();
      if (data == null) return;
      isConvertingRef.current = true;
      setEditorContent(yamlViewRef.current, yaml.dump(data, { flowLevel: 1, lineWidth: -1, noRefs: true }));
      setEditorContent(jsonViewRef.current, JSON.stringify(data));
      isConvertingRef.current = false;
      setError(null);
    } catch (e: unknown) {
      isConvertingRef.current = false;
      setError(e instanceof Error ? e.message : 'Cannot minify — fix syntax errors first');
    }
  }, [getCurrentData]);

  const handleSort = useCallback(() => {
    try {
      const data = getCurrentData();
      if (data == null) return;
      const sorted = sortKeys(data);
      isConvertingRef.current = true;
      setEditorContent(yamlViewRef.current, yaml.dump(sorted, { lineWidth: -1, noRefs: true }));
      setEditorContent(jsonViewRef.current, JSON.stringify(sorted, null, 2));
      isConvertingRef.current = false;
      setError(null);
      setParsedData(sorted);
    } catch (e: unknown) {
      isConvertingRef.current = false;
      setError(e instanceof Error ? e.message : 'Cannot sort — fix syntax errors first');
    }
  }, [getCurrentData]);

  const handleClear = useCallback(() => {
    isConvertingRef.current = true;
    setEditorContent(yamlViewRef.current, '');
    setEditorContent(jsonViewRef.current, '');
    isConvertingRef.current = false;
    setError(null);
    setWarnings([]);
    setParsedData(null);
    setMultiDocCount(0);
  }, []);

  const getYamlContent = useCallback(() => yamlViewRef.current?.state.doc.toString() || '', []);
  const getJsonContent = useCallback(() => jsonViewRef.current?.state.doc.toString() || '', []);

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <Box sx={{ maxWidth: 960, mx: 'auto', width: '100%', py: { xs: 3, md: 4 } }}>
      <SEO
        title="YAML / JSON Converter"
        description="Convert between YAML and JSON, format, minify, validate, sort keys, and visualize with a tree view. Detect type coercion issues. Free, runs in your browser."
        path="/convert/yaml"
        structuredData={buildToolSchema(
          'YAML / JSON Converter',
          'Convert between YAML and JSON, format, minify, validate, sort keys, and visualize with a tree view. Detect type coercion issues.',
          '/convert/yaml',
        )}
      />

      <Typography component="h1" level="h3" sx={{ mb: 1, fontWeight: 700, letterSpacing: '-0.02em' }}>
        YAML &harr; JSON
      </Typography>
      <Typography level="body-sm" sx={{ color: 'text.tertiary', mb: 4 }}>
        Convert, format, and validate &mdash; everything runs in your browser
      </Typography>

      <ToolDisclaimer toolId="yaml-json" />

      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
        <Box component="button" onClick={handleFormat} sx={toolBtn}>
          Format
        </Box>
        <Box component="button" onClick={handleMinify} sx={toolBtn}>
          Minify
        </Box>
        <Box component="button" onClick={handleSort} sx={toolBtn}>
          Sort keys
        </Box>
        <Box
          component="button"
          onClick={() => setShowTree((prev) => !prev)}
          sx={{
            ...toolBtn,
            borderColor: showTree ? 'primary.500' : 'divider',
            color: showTree ? 'primary.softColor' : 'text.secondary',
          }}
        >
          Tree view
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
              YAML
            </Typography>
            <CopyBtn getText={getYamlContent} />
          </Box>
          <Box
            ref={yamlContainerRef}
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

      {multiDocCount > 1 && (
        <Box
          sx={{
            mt: 2,
            px: 2,
            py: 1,
            borderRadius: 'md',
            bgcolor: 'rgba(59, 130, 246, 0.06)',
            border: '1px solid',
            borderColor: 'primary.800',
            display: 'flex',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <InfoOutlinedIcon sx={{ fontSize: 14, color: 'primary.400' }} />
          <Typography level="body-xs" sx={{ color: 'primary.softColor' }}>
            {multiDocCount} YAML documents detected &mdash; merged into a JSON array
          </Typography>
        </Box>
      )}

      {warnings.length > 0 && (
        <Box
          sx={{
            mt: 2,
            px: 2,
            py: 1.5,
            borderRadius: 'md',
            bgcolor: 'rgba(245, 158, 11, 0.06)',
            border: '1px solid',
            borderColor: 'warning.700',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 1 }}>
            <WarningAmberOutlinedIcon sx={{ fontSize: 14, color: 'warning.500' }} />
            <Typography level="body-xs" sx={{ fontWeight: 600, color: 'warning.plainColor' }}>
              Type coercion detected
            </Typography>
          </Box>
          {warnings.map((w, i) => (
            <Typography key={i} level="body-xs" sx={{ color: 'text.tertiary', pl: 2.5 }}>
              Line {w.line}:{' '}
              <Box component="code" sx={{ color: 'warning.plainColor', bgcolor: 'rgba(245,158,11,0.08)', px: 0.5, borderRadius: '3px' }}>
                {w.raw}
              </Box>{' '}
              &rarr; {w.coercedTo} &mdash; quote it to keep as string
            </Typography>
          ))}
        </Box>
      )}

      {showTree && parsedData != null && (
        <Sheet variant="outlined" data-joy-color-scheme="dark" sx={{ mt: 2, borderRadius: 'lg', overflow: 'hidden' }}>
          <Box
            sx={{
              px: 2,
              py: 1,
              borderBottom: '1px solid',
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Typography
              level="body-xs"
              sx={{ fontWeight: 700, color: 'text.tertiary', textTransform: 'uppercase', letterSpacing: '0.08em' }}
            >
              Tree View
            </Typography>
            <Typography level="body-xs" sx={{ color: 'text.tertiary' }}>
              Click a value to copy its path
            </Typography>
          </Box>
          <Box sx={{ py: 1, maxHeight: 400, overflow: 'auto' }}>
            {typeof parsedData === 'object' ? (
              Array.isArray(parsedData)
                ? parsedData.map((item, i) => (
                    <TreeNode key={i} name={String(i)} value={item} path={`$[${i}]`} depth={0} />
                  ))
                : Object.entries(parsedData as Record<string, unknown>).map(([k, v]) => (
                    <TreeNode key={k} name={k} value={v} path={`$.${k}`} depth={0} />
                  ))
            ) : (
              <Box sx={{ px: 2, py: 1 }}>
                <Typography level="body-xs" sx={{ color: 'text.tertiary', fontFamily: 'monospace' }}>
                  {JSON.stringify(parsedData)}
                </Typography>
              </Box>
            )}
          </Box>
        </Sheet>
      )}
      <ToolSEOContent
        howTo={{
          title: 'How to convert between YAML and JSON',
          steps: [
            'Paste or type your YAML in the left editor, or JSON in the right editor.',
            'The opposite format updates automatically in real time.',
            'Use the toolbar to format, minify, or sort keys in both formats at once.',
            'Toggle the tree view to visually explore your data structure and copy JSON paths.',
            'Click the copy button on either panel to copy the result to your clipboard.',
          ],
        }}
        features={[
          { icon: <SyncAltOutlinedIcon />, title: 'Bi-directional Conversion', description: 'Edit either side and the other updates instantly. Works from YAML to JSON and JSON to YAML.' },
          { icon: <CodeOutlinedIcon />, title: 'Syntax Highlighting', description: 'Full CodeMirror editors with syntax highlighting, line numbers, and bracket matching for both formats.' },
          { icon: <AccountTreeOutlinedIcon />, title: 'Interactive Tree View', description: 'Visualize your data as a collapsible tree. Click any value to copy its JSON path.' },
          { icon: <DataObjectOutlinedIcon />, title: 'Format, Minify & Sort', description: 'One-click formatting, minification, and alphabetical key sorting across both editors.' },
          { icon: <BoltOutlinedIcon />, title: 'Multi-document Support', description: 'Handles YAML files with multiple documents separated by --- and merges them into a JSON array.' },
          { icon: <LockOutlinedIcon />, title: 'Runs in Your Browser', description: 'No data is sent to any server. Everything is processed locally in your browser.' },
        ]}
        faq={[
          { question: 'Does this tool support multi-document YAML?', answer: 'Yes. If your YAML contains multiple documents separated by ---, they are parsed individually and merged into a JSON array.' },
          { question: 'What are the type coercion warnings?', answer: 'YAML 1.1 silently converts values like "yes", "no", "on", "off", and date-like strings into booleans or Date objects. The converter detects these and warns you so you can quote them to keep them as strings.' },
          { question: 'Is there a size limit?', answer: 'There is no hard limit since everything runs in your browser, but very large files (over a few MB) may slow down the live conversion. For those cases, consider using a CLI tool.' },
          { question: 'Can I sort keys alphabetically?', answer: 'Yes. Click the "Sort keys" button in the toolbar to recursively sort all object keys in alphabetical order in both the YAML and JSON output.' },
        ]}
        relatedTools={[
          { label: 'JSON / CSV Converter', href: '/convert/json-csv' },
          { label: 'Base64 Encode / Decode', href: '/tools/base64' },
          { label: 'Hash Generator', href: '/tools/hash' },
          { label: 'Word Counter', href: '/tools/word-counter' },
        ]}
      />
    </Box>
  );
}
