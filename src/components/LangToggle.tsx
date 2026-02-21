import { Box } from '@mui/joy';
import type { Lang } from '../hooks/useLang';

const LANGS: { value: Lang; label: string }[] = [
  { value: 'en', label: 'EN' },
  { value: 'fr', label: 'FR' },
];

export default function LangToggle({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  const activeIdx = LANGS.findIndex((l) => l.value === lang);

  return (
    <Box
      role="radiogroup"
      aria-label="Language"
      sx={{
        mb: 3,
        display: 'inline-flex',
        position: 'relative',
        borderRadius: '10px',
        bgcolor: 'background.level1',
        border: '1px solid',
        borderColor: 'divider',
        p: '3px',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: '3px',
          left: `calc(3px + ${activeIdx} * 50%)`,
          width: 'calc(50% - 3px)',
          height: 'calc(100% - 6px)',
          borderRadius: '7px',
          bgcolor: 'primary.600',
          boxShadow: '0 1px 4px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.08)',
          transition: 'left 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: 0,
        }}
      />

      {LANGS.map((l) => (
        <Box
          key={l.value}
          component="button"
          role="radio"
          aria-checked={lang === l.value}
          onClick={() => setLang(l.value)}
          sx={{
            position: 'relative',
            zIndex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            px: 2.5,
            py: 0.5,
            minWidth: 44,
            border: 'none',
            bgcolor: 'transparent',
            borderRadius: '7px',
            cursor: 'pointer',
            fontSize: '0.8rem',
            fontFamily: 'inherit',
            fontWeight: lang === l.value ? 650 : 450,
            letterSpacing: '0.04em',
            color: lang === l.value ? '#fff' : 'var(--joy-palette-text-tertiary)',
            transition: 'color 0.2s, font-weight 0.2s',
            outline: 'none',
            '&:hover': {
              color: lang === l.value ? '#fff' : 'var(--joy-palette-text-secondary)',
            },
            '&:focus-visible': {
              outline: '2px solid',
              outlineColor: 'primary.400',
              outlineOffset: '2px',
            },
          }}
        >
          {l.label}
        </Box>
      ))}
    </Box>
  );
}
