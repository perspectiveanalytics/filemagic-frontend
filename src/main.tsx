import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { CssVarsProvider } from '@mui/joy/styles';
import CssBaseline from '@mui/joy/CssBaseline';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import theme from './theme';

import '@fontsource/inter/400.css';
import '@fontsource/inter/500.css';
import '@fontsource/inter/600.css';
import '@fontsource/inter/700.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HelmetProvider>
      <CssVarsProvider theme={theme} defaultMode="system" disableTransitionOnChange>
        <CssBaseline />
        <App />
      </CssVarsProvider>
    </HelmetProvider>
  </StrictMode>
);
