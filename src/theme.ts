import { extendTheme } from '@mui/joy/styles';

const theme = extendTheme({
  colorSchemes: {
    light: {
      palette: {
        background: {
          body: '#F8FAFC',
          surface: '#FFFFFF',
          level1: '#F1F5F9',
          level2: '#E2E8F0',
          level3: '#CBD5E1',
        },
        primary: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
          plainColor: '#2563EB',
          plainHoverBg: '#EFF6FF',
          softBg: '#EFF6FF',
          softColor: '#1D4ED8',
          softHoverBg: '#DBEAFE',
          outlinedBorder: '#93C5FD',
          solidBg: '#2563EB',
          solidHoverBg: '#1D4ED8',
          solidActiveBg: '#1E40AF',
        },
        neutral: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
          plainColor: '#475569',
          plainHoverBg: '#F1F5F9',
          outlinedBorder: '#CBD5E1',
        },
        text: {
          primary: '#1E293B',
          secondary: '#475569',
          tertiary: '#64748B',
        },
        divider: '#E2E8F0',
        success: {
          500: '#16A34A',
          plainColor: '#15803D',
          solidBg: '#16A34A',
        },
        danger: {
          500: '#DC2626',
          plainColor: '#DC2626',
          solidBg: '#DC2626',
        },
        warning: {
          500: '#D97706',
          plainColor: '#B45309',
          solidBg: '#D97706',
        },
      },
    },
    dark: {
      palette: {
        background: {
          body: '#0B1120',
          surface: '#131C2E',
          level1: '#1A2540',
          level2: '#213050',
          level3: '#2A3D63',
        },
        primary: {
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          300: '#93C5FD',
          400: '#60A5FA',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8',
          800: '#1E40AF',
          900: '#1E3A8A',
          plainColor: '#60A5FA',
          softBg: '#1E3A8A',
          softColor: '#93C5FD',
          softHoverBg: '#1E40AF',
          outlinedBorder: '#1D4ED8',
          solidBg: '#2563EB',
          solidHoverBg: '#3B82F6',
          solidActiveBg: '#1D4ED8',
        },
        neutral: {
          50: '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
          plainColor: '#94A3B8',
          plainHoverBg: '#1E293B',
          outlinedBorder: '#334155',
        },
        text: {
          primary: '#F1F5F9',
          secondary: '#94A3B8',
          tertiary: '#64748B',
        },
        divider: '#1E293B',
        success: {
          500: '#22C55E',
          plainColor: '#22C55E',
          solidBg: '#22C55E',
        },
        danger: {
          500: '#F43F5E',
          plainColor: '#FB7185',
          solidBg: '#F43F5E',
        },
        warning: {
          500: '#F59E0B',
          plainColor: '#FBBF24',
          solidBg: '#F59E0B',
        },
      },
    },
  },
  fontFamily: {
    body: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    display: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  radius: {
    xs: '6px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
  },
  components: {
    JoyButton: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          borderRadius: '10px',
          transition: 'all 0.2s ease',
        },
      },
    },
    JoyCard: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          border: '1px solid var(--joy-palette-divider)',
        },
      },
    },
    JoySheet: {
      styleOverrides: {
        root: {
          backgroundColor: 'var(--joy-palette-background-surface)',
        },
      },
    },
    JoySelect: {
      styleOverrides: {
        root: {
          borderRadius: '10px',
        },
      },
    },
    JoyInput: {
      styleOverrides: {
        root: {
          borderRadius: '10px',
        },
      },
    },
  },
});

export default theme;
