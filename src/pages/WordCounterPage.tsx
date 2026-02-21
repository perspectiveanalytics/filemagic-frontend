import { useState, useMemo } from 'react';
import { Box, Typography, Textarea } from '@mui/joy';
import SEO, { buildToolSchema } from '../components/SEO';
import ToolDisclaimer from '../components/ToolDisclaimer';
import ToolSEOContent from '../components/ToolSEOContent';
import FormatSizeOutlinedIcon from '@mui/icons-material/FormatSizeOutlined';
import TextFieldsOutlinedIcon from '@mui/icons-material/TextFieldsOutlined';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import ShortTextOutlinedIcon from '@mui/icons-material/ShortTextOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

function countStats(text: string) {
  const trimmed = text.trim();
  if (!trimmed) {
    return { words: 0, characters: text.length, charactersNoSpaces: 0, sentences: 0, paragraphs: 0, readingTime: '0 sec' };
  }

  const words = trimmed.split(/\s+/).filter(Boolean).length;
  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, '').length;
  const sentences = trimmed.split(/[.!?]+/).filter((s) => s.trim().length > 0).length;
  const paragraphs = trimmed.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length;

  const minutes = words / 200;
  let readingTime: string;
  if (minutes < 1) {
    readingTime = `${Math.max(1, Math.round(minutes * 60))} sec`;
  } else if (minutes < 60) {
    readingTime = `${Math.round(minutes)} min`;
  } else {
    const h = Math.floor(minutes / 60);
    const m = Math.round(minutes % 60);
    readingTime = `${h}h ${m}m`;
  }

  return { words, characters, charactersNoSpaces, sentences, paragraphs, readingTime };
}

const statCard = {
  p: 2,
  borderRadius: 'md',
  bgcolor: 'background.surface',
  border: '1px solid',
  borderColor: 'divider',
  textAlign: 'center' as const,
} as const;

export default function WordCounterPage() {
  const [text, setText] = useState('');
  const stats = useMemo(() => countStats(text), [text]);

  return (
    <Box sx={{ maxWidth: 520, mx: 'auto', width: '100%', py: { xs: 3, md: 4 } }}>
      <SEO
        title="Word Counter"
        description="Count words, characters, sentences and paragraphs. Estimate reading time. Free, no signup, runs entirely in your browser."
        path="/tools/word-counter"
        structuredData={buildToolSchema('Word Counter', 'Count words, characters, sentences and paragraphs. Estimate reading time.', '/tools/word-counter')}
      />
      <Typography component="h1" level="h3" sx={{ mb: 1, fontWeight: 700, letterSpacing: '-0.02em' }}>
        Word Counter
      </Typography>
      <Typography level="body-sm" sx={{ color: 'text.tertiary', mb: 4 }}>
        Count words, characters, sentences and estimate reading time
      </Typography>

      <ToolDisclaimer toolId="word-counter" />

      <Textarea
        placeholder="Type or paste your text here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        minRows={8}
        maxRows={20}
        sx={{
          mb: 3,
          fontFamily: 'inherit',
          fontSize: 'sm',
          bgcolor: 'background.surface',
          '--Textarea-focusedThickness': '1px',
        }}
      />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 1.5,
        }}
      >
        <Box sx={statCard}>
          <Typography level="h3" sx={{ fontWeight: 700, color: 'primary.plainColor' }}>
            {stats.words.toLocaleString()}
          </Typography>
          <Typography level="body-xs" sx={{ color: 'text.tertiary', mt: 0.5 }}>
            Words
          </Typography>
        </Box>
        <Box sx={statCard}>
          <Typography level="h3" sx={{ fontWeight: 700, color: 'primary.plainColor' }}>
            {stats.characters.toLocaleString()}
          </Typography>
          <Typography level="body-xs" sx={{ color: 'text.tertiary', mt: 0.5 }}>
            Characters
          </Typography>
        </Box>
        <Box sx={statCard}>
          <Typography level="h3" sx={{ fontWeight: 700, color: 'primary.plainColor' }}>
            {stats.charactersNoSpaces.toLocaleString()}
          </Typography>
          <Typography level="body-xs" sx={{ color: 'text.tertiary', mt: 0.5 }}>
            No spaces
          </Typography>
        </Box>
        <Box sx={statCard}>
          <Typography level="h3" sx={{ fontWeight: 700, color: 'primary.plainColor' }}>
            {stats.sentences.toLocaleString()}
          </Typography>
          <Typography level="body-xs" sx={{ color: 'text.tertiary', mt: 0.5 }}>
            Sentences
          </Typography>
        </Box>
        <Box sx={statCard}>
          <Typography level="h3" sx={{ fontWeight: 700, color: 'primary.plainColor' }}>
            {stats.paragraphs.toLocaleString()}
          </Typography>
          <Typography level="body-xs" sx={{ color: 'text.tertiary', mt: 0.5 }}>
            Paragraphs
          </Typography>
        </Box>
        <Box sx={statCard}>
          <Typography level="h3" sx={{ fontWeight: 700, color: 'primary.plainColor' }}>
            {stats.readingTime}
          </Typography>
          <Typography level="body-xs" sx={{ color: 'text.tertiary', mt: 0.5 }}>
            Reading time
          </Typography>
        </Box>
      </Box>

      <ToolSEOContent
        howTo={{
          title: 'How to count words and characters in your text',
          steps: [
            'Type or paste your text into the text area above.',
            'Word, character, sentence, and paragraph counts update instantly as you type.',
            'Check the estimated reading time based on an average of 200 words per minute.',
            'Use the character count (with and without spaces) for platforms with length limits.',
          ],
        }}
        features={[
          { icon: <FormatSizeOutlinedIcon />, title: 'Word Count', description: 'Accurately counts words by splitting on whitespace, handling multiple spaces and line breaks correctly.' },
          { icon: <TextFieldsOutlinedIcon />, title: 'Character Count', description: 'Displays total characters and characters excluding spaces, useful for social media and form limits.' },
          { icon: <ShortTextOutlinedIcon />, title: 'Sentence & Paragraph Count', description: 'Detects sentences by punctuation marks and paragraphs by blank lines for structural analysis.' },
          { icon: <TimerOutlinedIcon />, title: 'Reading Time Estimate', description: 'Calculates estimated reading time based on an average reading speed of 200 words per minute.' },
          { icon: <BoltOutlinedIcon />, title: 'Real-time Updates', description: 'All statistics update instantly as you type or paste text, with zero delay.' },
          { icon: <LockOutlinedIcon />, title: 'Runs in Your Browser', description: 'No data is sent to any server. Your text stays entirely in your browser.' },
        ]}
        faq={[
          { question: 'How is reading time calculated?', answer: 'Reading time is estimated at 200 words per minute, which is the average adult reading speed for English text. The result is shown in seconds for short texts and minutes for longer ones.' },
          { question: 'How are sentences counted?', answer: 'Sentences are detected by splitting on period, exclamation mark, and question mark characters. Abbreviations like "Dr." or "U.S." may cause slight overcounting.' },
          { question: 'Does it support languages other than English?', answer: 'Yes. The word counter works with any language that uses whitespace to separate words, including most European languages. For CJK languages without word boundaries, the character count is more useful.' },
          { question: 'Is there a text length limit?', answer: 'There is no hard limit. Since everything runs in your browser, performance stays fast for texts up to hundreds of thousands of characters.' },
        ]}
        relatedTools={[
          { label: 'Base64 Encode / Decode', href: '/tools/base64' },
          { label: 'Hash Generator', href: '/tools/hash' },
          { label: 'YAML / JSON Converter', href: '/convert/yaml' },
          { label: 'JSON / CSV Converter', href: '/convert/json-csv' },
        ]}
      />
    </Box>
  );
}
