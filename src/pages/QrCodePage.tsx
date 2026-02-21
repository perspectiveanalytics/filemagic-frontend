import { useState, useCallback, useMemo } from 'react';
import {
  Box, Typography, Textarea, Button, Input, Select, Option, Checkbox,
  Chip, FormControl, FormLabel, Accordion, AccordionSummary, AccordionDetails,
} from '@mui/joy';
import SEO, { buildToolSchema } from '../components/SEO';
import ConversionProgress from '../components/ConversionProgress';
import { useTextConversion } from '../hooks/useTextConversion';
import LinkOutlinedIcon from '@mui/icons-material/LinkOutlined';
import WifiOutlinedIcon from '@mui/icons-material/WifiOutlined';
import TuneOutlinedIcon from '@mui/icons-material/TuneOutlined';
import ToolDisclaimer from '../components/ToolDisclaimer';
import ToolSEOContent from '../components/ToolSEOContent';
import QrCodeOutlinedIcon from '@mui/icons-material/QrCodeOutlined';
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';

type QrType = 'text' | 'wifi';

const qrTypes: { value: QrType; label: string; icon: React.ReactElement }[] = [
  { value: 'text', label: 'URL / Text', icon: <LinkOutlinedIcon sx={{ fontSize: 16 }} /> },
  { value: 'wifi', label: 'WiFi', icon: <WifiOutlinedIcon sx={{ fontSize: 16 }} /> },
];

// Escape special characters in WiFi QR strings
function escapeWifi(s: string): string {
  return s.replace(/([\\;,:"'])/g, '\\$1');
}

function buildQrText(type: QrType, fields: Record<string, string>): string {
  switch (type) {
    case 'text':
      return fields.text?.trim() || '';
    case 'wifi': {
      const enc = fields.encryption || 'WPA';
      const ssid = escapeWifi(fields.ssid?.trim() || '');
      const pass = escapeWifi(fields.password?.trim() || '');
      const hidden = fields.hidden === 'true' ? 'H:true;' : '';
      return `WIFI:T:${enc};S:${ssid};P:${pass};${hidden};`;
    }
  }
}

function isFormValid(type: QrType, fields: Record<string, string>): boolean {
  switch (type) {
    case 'text': return (fields.text?.trim().length || 0) > 0;
    case 'wifi': return (fields.ssid?.trim().length || 0) > 0;
  }
}

const inputSx = { fontSize: 'sm', '--Input-focusedThickness': '1px' };

export default function QrCodePage() {
  const [qrType, setQrType] = useState<QrType>('text');
  const [fields, setFields] = useState<Record<string, string>>({});
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#FFFFFF');
  const [errorCorrection, setErrorCorrection] = useState('M');
  const [size, setSize] = useState(512);
  const [dotShape, setDotShape] = useState('square');
  const [eyeShape, setEyeShape] = useState('square');

  const conversion = useTextConversion('/generate/qrcode');

  const setField = useCallback((key: string, value: string) => {
    setFields(prev => ({ ...prev, [key]: value }));
  }, []);

  const qrText = useMemo(() => buildQrText(qrType, fields), [qrType, fields]);
  const valid = isFormValid(qrType, fields) && qrText.length <= 4096;

  const handleGenerate = useCallback(() => {
    if (!valid) return;
    const options: Record<string, unknown> = { size };
    if (fgColor !== '#000000') options.fgColor = fgColor;
    if (bgColor !== '#FFFFFF') options.bgColor = bgColor;
    if (errorCorrection !== 'M') options.errorCorrection = errorCorrection;
    if (dotShape !== 'square') options.dotShape = dotShape;
    if (eyeShape !== 'square') options.eyeShape = eyeShape;
    conversion.generate(qrText, options);
  }, [valid, qrText, fgColor, bgColor, errorCorrection, size, dotShape, eyeShape, conversion]);

  const handleRetry = useCallback(() => {
    conversion.reset();
  }, [conversion]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && valid && qrType === 'text') {
      e.preventDefault();
      handleGenerate();
    }
  }, [valid, qrType, handleGenerate]);

  return (
    <Box sx={{ maxWidth: 520, mx: 'auto', width: '100%', py: { xs: 3, md: 4 } }}>
      <SEO
        title="QR Code Generator"
        description="Generate QR codes for URLs, text and WiFi networks. Customizable colors, shapes and error correction. Free, no signup."
        path="/generate/qrcode"
        structuredData={buildToolSchema('QR Code Generator', 'Generate QR codes for URLs, text and WiFi networks. Customizable colors, shapes and error correction. Free, no signup.', '/generate/qrcode')}
      />
      <Typography component="h1" level="h3" sx={{ mb: 1, fontWeight: 700, letterSpacing: '-0.02em' }}>
        QR Code Generator
      </Typography>
      <Typography level="body-sm" sx={{ color: 'text.tertiary', mb: 4 }}>
        Generate QR codes for URLs, text and WiFi networks
      </Typography>

      <ToolDisclaimer toolId="qr-code" />

      {conversion.status === 'idle' ? (
        <>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, mb: 3 }}>
            {qrTypes.map((t) => (
              <Chip
                key={t.value}
                variant={qrType === t.value ? 'solid' : 'outlined'}
                color={qrType === t.value ? 'primary' : 'neutral'}
                onClick={() => { setQrType(t.value); setFields({}); }}
                startDecorator={t.icon}
                sx={{ cursor: 'pointer', fontWeight: qrType === t.value ? 600 : 400 }}
              >
                {t.label}
              </Chip>
            ))}
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 2.5 }}>
            {qrType === 'text' && (
              <Textarea
                placeholder="Enter a URL or text..."
                value={fields.text || ''}
                onChange={(e) => setField('text', e.target.value)}
                onKeyDown={handleKeyDown}
                minRows={3}
                maxRows={6}
                sx={{ fontSize: 'sm' }}
              />
            )}

            {qrType === 'wifi' && (
              <>
                <FormControl>
                  <FormLabel sx={{ fontSize: 'xs' }}>Network name (SSID)</FormLabel>
                  <Input value={fields.ssid || ''} onChange={(e) => setField('ssid', e.target.value)} sx={inputSx} />
                </FormControl>
                <FormControl>
                  <FormLabel sx={{ fontSize: 'xs' }}>Password</FormLabel>
                  <Input value={fields.password || ''} onChange={(e) => setField('password', e.target.value)} sx={inputSx} />
                </FormControl>
                <FormControl>
                  <FormLabel sx={{ fontSize: 'xs' }}>Encryption</FormLabel>
                  <Select value={fields.encryption || 'WPA'} onChange={(_, v) => v && setField('encryption', v)} size="sm">
                    <Option value="WPA">WPA / WPA2 / WPA3</Option>
                    <Option value="WEP">WEP</Option>
                    <Option value="nopass">None (open)</Option>
                  </Select>
                </FormControl>
                <Checkbox
                  size="sm"
                  label="Hidden network"
                  checked={fields.hidden === 'true'}
                  onChange={(e) => setField('hidden', e.target.checked ? 'true' : 'false')}
                />
              </>
            )}
          </Box>

          <Accordion
            sx={{
              mb: 2.5,
              bgcolor: 'background.surface',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 'lg',
              overflow: 'hidden',
              '&::before': { display: 'none' },
              boxShadow: 'xs',
            }}
          >
            <AccordionSummary
              sx={{
                fontSize: 'sm',
                fontWeight: 600,
                minHeight: 44,
                px: 2.5,
                '&:hover': { bgcolor: 'background.level1' },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <TuneOutlinedIcon sx={{ fontSize: 16, color: 'text.tertiary' }} />
                Customize
              </Box>
            </AccordionSummary>
            <AccordionDetails sx={{ p: 0 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Box sx={{ px: 2.5, pt: 1.5, pb: 2 }}>
                  <Typography
                    level="body-xs"
                    sx={{
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      color: 'text.tertiary',
                      fontSize: '0.65rem',
                      mb: 1.5,
                    }}
                  >
                    Colors
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1.5 }}>
                    <Box
                      sx={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        p: 1.25,
                        borderRadius: 'md',
                        bgcolor: 'background.level1',
                        border: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <input
                        type="color"
                        value={fgColor}
                        onChange={(e) => setFgColor(e.target.value)}
                        style={{
                          width: 28,
                          height: 28,
                          border: 'none',
                          cursor: 'pointer',
                          borderRadius: 6,
                          padding: 0,
                          flexShrink: 0,
                        }}
                      />
                      <Box>
                        <Typography level="body-xs" sx={{ fontWeight: 600, color: 'text.secondary', lineHeight: 1.2 }}>
                          Foreground
                        </Typography>
                        <Typography level="body-xs" sx={{ fontFamily: 'monospace', color: 'text.tertiary', fontSize: '0.65rem' }}>
                          {fgColor}
                        </Typography>
                      </Box>
                    </Box>
                    <Box
                      sx={{
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        p: 1.25,
                        borderRadius: 'md',
                        bgcolor: 'background.level1',
                        border: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <input
                        type="color"
                        value={bgColor}
                        onChange={(e) => setBgColor(e.target.value)}
                        style={{
                          width: 28,
                          height: 28,
                          border: 'none',
                          cursor: 'pointer',
                          borderRadius: 6,
                          padding: 0,
                          flexShrink: 0,
                        }}
                      />
                      <Box>
                        <Typography level="body-xs" sx={{ fontWeight: 600, color: 'text.secondary', lineHeight: 1.2 }}>
                          Background
                        </Typography>
                        <Typography level="body-xs" sx={{ fontFamily: 'monospace', color: 'text.tertiary', fontSize: '0.65rem' }}>
                          {bgColor}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </Box>

                <Box sx={{ mx: 2.5, borderTop: '1px solid', borderColor: 'divider' }} />

                <Box sx={{ px: 2.5, pt: 2, pb: 2 }}>
                  <Typography
                    level="body-xs"
                    sx={{
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      color: 'text.tertiary',
                      fontSize: '0.65rem',
                      mb: 1.5,
                    }}
                  >
                    Code
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <FormControl sx={{ flex: 1 }}>
                      <FormLabel sx={{ fontSize: 'xs' }}>Error correction</FormLabel>
                      <Select value={errorCorrection} onChange={(_, v) => v && setErrorCorrection(v)} size="sm">
                        <Option value="L">Low (7%)</Option>
                        <Option value="M">Medium (15%)</Option>
                        <Option value="Q">Quartile (25%)</Option>
                        <Option value="H">High (30%)</Option>
                      </Select>
                    </FormControl>
                    <FormControl sx={{ flex: 1 }}>
                      <FormLabel sx={{ fontSize: 'xs' }}>Size (px)</FormLabel>
                      <Select value={String(size)} onChange={(_, v) => v && setSize(Number(v))} size="sm">
                        <Option value="256">256</Option>
                        <Option value="512">512</Option>
                        <Option value="1024">1024</Option>
                        <Option value="2048">2048</Option>
                      </Select>
                    </FormControl>
                  </Box>
                </Box>

                <Box sx={{ mx: 2.5, borderTop: '1px solid', borderColor: 'divider' }} />

                <Box sx={{ px: 2.5, pt: 2, pb: 2.5 }}>
                  <Typography
                    level="body-xs"
                    sx={{
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      color: 'text.tertiary',
                      fontSize: '0.65rem',
                      mb: 1.5,
                    }}
                  >
                    Style
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <FormControl sx={{ flex: 1 }}>
                      <FormLabel sx={{ fontSize: 'xs' }}>Dot shape</FormLabel>
                      <Select value={dotShape} onChange={(_, v) => v && setDotShape(v)} size="sm">
                        <Option value="square">Square</Option>
                        <Option value="circle">Circle</Option>
                        <Option value="liquid">Liquid</Option>
                      </Select>
                    </FormControl>
                    <FormControl sx={{ flex: 1 }}>
                      <FormLabel sx={{ fontSize: 'xs' }}>Eye shape</FormLabel>
                      <Select value={eyeShape} onChange={(_, v) => v && setEyeShape(v)} size="sm">
                        <Option value="square">Square</Option>
                        <Option value="rounded">Rounded</Option>
                      </Select>
                    </FormControl>
                  </Box>
                </Box>
              </Box>
            </AccordionDetails>
          </Accordion>

          {qrType === 'text' && (
            <Typography level="body-xs" sx={{ color: 'text.tertiary', mb: 1.5 }}>
              {(fields.text?.trim().length || 0).toLocaleString()} / 4,096 characters
            </Typography>
          )}

          <Button
            size="lg"
            onClick={handleGenerate}
            disabled={!valid}
            sx={{ width: '100%' }}
          >
            Generate QR Code
          </Button>
        </>
      ) : (
        <Box>
          <Typography level="body-sm" noWrap sx={{ color: 'text.tertiary', mb: 2 }}>
            {qrText.length <= 80 ? qrText : qrText.slice(0, 80) + '...'}
          </Typography>
          <ConversionProgress
            status={conversion.status}
            position={conversion.position}
            error={conversion.error}
            inputSize={null}
            outputSize={null}
            previewUrl={conversion.previewUrl}
            onDownload={conversion.download}
            onRetry={handleRetry}
            showSizeComparison={false}
          />
        </Box>
      )}
      <ToolSEOContent
        howTo={{
          title: 'How to generate a QR code online',
          steps: [
            'Choose the QR type — URL/Text or WiFi credentials.',
            'Enter your content (text, URL, or WiFi network details).',
            'Optionally customize colors, dot/eye shapes, error correction, and size.',
            'Click "Generate QR Code" and download the PNG image.',
          ],
        }}
        features={[
          { icon: <QrCodeOutlinedIcon />, title: 'URL, Text & WiFi', description: 'Generate QR codes for plain text, URLs, or WiFi network credentials with SSID, password, and encryption type.' },
          { icon: <PaletteOutlinedIcon />, title: 'Custom Colors & Styles', description: 'Set foreground and background colors, choose dot shapes (square, circle, liquid), and eye shapes (square, rounded).' },
          { icon: <SettingsOutlinedIcon />, title: 'Error Correction Levels', description: 'Select Low (7%), Medium (15%), Quartile (25%), or High (30%) error correction to balance density and resilience.' },
          { icon: <BoltOutlinedIcon />, title: 'High-Resolution Output', description: 'Generate QR codes up to 2048 x 2048 pixels, suitable for print and large displays.' },
          { icon: <SecurityOutlinedIcon />, title: 'Privacy First', description: 'QR codes are generated server-side in isolated memory and deleted immediately after download.' },
        ]}
        faq={[
          { question: 'What can I encode in a QR code?', answer: 'You can encode any text or URL (up to 4,096 characters) or WiFi network credentials including SSID, password, encryption type, and hidden network flag.' },
          { question: 'What image format is the output?', answer: 'QR codes are generated as PNG images. You can choose sizes from 256 to 2,048 pixels.' },
          { question: 'What does error correction do?', answer: 'Error correction allows the QR code to remain scannable even if part of it is damaged or obscured. Higher levels add more redundancy but increase code density.' },
          { question: 'Can I customize the appearance?', answer: 'Yes. You can change foreground/background colors, dot shape (square, circle, liquid), and eye shape (square, rounded).' },
        ]}
        relatedTools={[
          { label: 'Password Generator', href: '/generate/password' },
          { label: 'PDF Compress', href: '/compress/pdf' },
          { label: 'Certificate Inspector', href: '/inspect/certificate' },
          { label: 'Ebook Converter', href: '/convert/ebook' },
        ]}
      />
    </Box>
  );
}
