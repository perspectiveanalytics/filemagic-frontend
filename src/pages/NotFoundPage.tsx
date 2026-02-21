import { Box, Typography, Button } from '@mui/joy';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

export default function NotFoundPage() {
  return (
    <Box sx={{ maxWidth: 520, mx: 'auto', width: '100%', py: { xs: 6, md: 10 }, textAlign: 'center' }}>
      <SEO title="Page Not Found" description="The page you're looking for doesn't exist." />
      <Typography component="h1" level="h2" sx={{ mb: 1.5, fontWeight: 700, letterSpacing: '-0.03em' }}>
        Page not found
      </Typography>
      <Typography level="body-lg" sx={{ color: 'text.secondary', mb: 4 }}>
        The page you're looking for doesn't exist or has been moved.
      </Typography>
      <Button component={Link} to="/" size="lg">
        Back to home
      </Button>
    </Box>
  );
}
