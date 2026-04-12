import { Box, Typography, Button } from '@mui/joy';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { Trans, useLingui } from '@lingui/react/macro';

export default function NotFoundPage() {
  const { t } = useLingui();
  return (
    <Box sx={{ maxWidth: 520, mx: 'auto', width: '100%', py: { xs: 6, md: 10 }, textAlign: 'center' }}>
      <SEO title={t`Page Not Found`} description={t`The page you're looking for doesn't exist.`} />
      <Typography component="h1" level="h2" sx={{ mb: 1.5, fontWeight: 700, letterSpacing: '-0.03em' }}><Trans>Page not found</Trans></Typography>
      <Typography level="body-lg" sx={{ color: 'text.secondary', mb: 4 }}><Trans>The page you're looking for doesn't exist or has been moved.</Trans></Typography>
      <Button component={Link} to="/" size="lg"><Trans>Back to home</Trans></Button>
    </Box>
  );
}
