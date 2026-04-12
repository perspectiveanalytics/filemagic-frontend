import { useState, useEffect } from 'react';
import { Box, Typography } from '@mui/joy';
import { Trans } from '@lingui/react/macro';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';

function isMaintenanceWindow(): boolean {
  const now = new Date();
  const h = now.getUTCHours();
  const m = now.getUTCMinutes();
  return h === 5 && m < 20;
}

export default function MaintenanceBanner() {
  const [visible, setVisible] = useState(isMaintenanceWindow);

  useEffect(() => {
    const id = setInterval(() => setVisible(isMaintenanceWindow()), 30_000);
    return () => clearInterval(id);
  }, []);

  if (!visible) return null;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1,
        px: 2,
        py: 1,
        bgcolor: 'warning.800',
        borderBottom: '1px solid',
        borderColor: 'warning.700',
      }}
    >
      <BuildOutlinedIcon sx={{ fontSize: 16, color: 'warning.300' }} />
      <Typography level="body-xs" sx={{ color: 'warning.200', fontWeight: 500 }}>
        <Trans>Scheduled maintenance in progress — service may be briefly unavailable</Trans>
      </Typography>
    </Box>
  );
}
