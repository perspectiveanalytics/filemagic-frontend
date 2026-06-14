import { CssVarsProvider } from '@mui/joy/styles';
import CssBaseline from '@mui/joy/CssBaseline';
import theme from '../theme';
import ProtectedEmail from './ProtectedEmail';

export default function ProtectedEmailIsland() {
  return (
    <CssVarsProvider
      theme={theme}
      defaultMode="dark"
      modeStorageKey="filemagic-joy-mode"
      colorSchemeStorageKey="filemagic-joy-color-scheme"
      disableTransitionOnChange
    >
      <CssBaseline />
      <ProtectedEmail />
    </CssVarsProvider>
  );
}
