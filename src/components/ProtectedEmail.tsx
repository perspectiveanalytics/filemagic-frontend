import { useState, useCallback } from 'react';
import { Box, CircularProgress } from '@mui/joy';
import { apiClient } from '../api/client';

export default function ProtectedEmail() {
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleReveal = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const result = await apiClient.revealEmail();
      setEmail(result);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  if (email) {
    return (
      <Box
        component="a"
        href={`mailto:${email}`}
        sx={{
          color: 'primary.plainColor',
          textDecoration: 'none',
          '&:hover': { textDecoration: 'underline' },
        }}
      >
        {email}
      </Box>
    );
  }

  if (loading) {
    return (
      <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75 }}>
        <CircularProgress size="sm" thickness={2} sx={{ '--CircularProgress-size': '14px' }} />
      </Box>
    );
  }

  return (
    <Box
      component="button"
      onClick={handleReveal}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        px: 1.25,
        py: 0.375,
        borderRadius: 'sm',
        fontSize: 'inherit',
        fontFamily: 'inherit',
        fontWeight: 600,
        cursor: 'pointer',
        border: '1px solid',
        borderColor: error ? 'danger.500' : 'primary.700',
        bgcolor: error ? 'rgba(239, 68, 68, 0.08)' : 'rgba(59, 130, 246, 0.08)',
        color: error ? 'danger.plainColor' : 'primary.plainColor',
        transition: 'all 0.15s',
        outline: 'none',
        verticalAlign: 'baseline',
        lineHeight: 'inherit',
        '&:hover': {
          borderColor: error ? 'danger.plainColor' : 'primary.500',
          bgcolor: error ? 'rgba(239, 68, 68, 0.12)' : 'rgba(59, 130, 246, 0.12)',
        },
      }}
    >
      {error ? 'retry' : 'show email'}
    </Box>
  );
}
