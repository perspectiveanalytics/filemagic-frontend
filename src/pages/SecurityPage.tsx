import { type ReactNode } from 'react';
import { Box, Typography } from '@mui/joy';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { Trans, useLingui } from '@lingui/react/macro';

import MemoryOutlinedIcon from '@mui/icons-material/MemoryOutlined';
import LanOutlinedIcon from '@mui/icons-material/LanOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import GppGoodOutlinedIcon from '@mui/icons-material/GppGoodOutlined';
import WifiOffOutlinedIcon from '@mui/icons-material/WifiOffOutlined';
import DeleteSweepOutlinedIcon from '@mui/icons-material/DeleteSweepOutlined';
import HttpsOutlinedIcon from '@mui/icons-material/HttpsOutlined';

export default function SecurityPage() {
  const { t } = useLingui();

  return (
    <Box sx={{ maxWidth: 620, mx: 'auto', width: '100%', py: { xs: 3, md: 4 } }}>
      <SEO
        title={t`Security`}
        description={t`How FileMagic protects your files: in-memory processing, nsjail sandboxing, seccomp filtering, network isolation.`}
        path="/security"
      />

      <Typography component="h1" level="h3" sx={{ mb: 1, fontWeight: 700, letterSpacing: '-0.02em' }}>
        <Trans>Security</Trans>
      </Typography>
      <Typography level="body-sm" sx={{ mb: 2, color: 'text.tertiary' }}>
        <Trans>How FileMagic protects your files at every step.</Trans>
      </Typography>

      <Typography level="body-md" sx={{ color: 'text.secondary', mb: 4 }}>
        <Trans>FileMagic is built around a zero-trust architecture where your files are never written to disk, every conversion runs in a locked-down sandbox, and data is destroyed the moment you download it. Here's how it works.</Trans>
      </Typography>

      <SectionTitle><Trans>File lifecycle</Trans></SectionTitle>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0, mb: 4 }}>
        {[
          { label: t`Upload`, desc: t`Your file is sent over TLS and stored in volatile memory (RAM). It never touches a physical disk.` },
          { label: t`Queue`, desc: t`The job enters a rate-limited queue. Your IP is held in memory for abuse prevention — never logged to disk.` },
          { label: t`Processing`, desc: t`The file is processed inside an isolated nsjail sandbox with no network access and restricted syscalls.` },
          { label: t`Result ready`, desc: t`The converted file is held in RAM. A single-use download link is generated.` },
          { label: t`Cleanup`, desc: t`After download — or after 10 minutes maximum — both files are permanently erased from memory.` },
        ].map((step, i) => (
          <Box key={i} sx={{ display: 'flex', gap: 2 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  bgcolor: 'primary.softBg',
                  color: 'primary.plainColor',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}
              >
                {i + 1}
              </Box>
              {i < 4 && (
                <Box sx={{ width: 2, flex: 1, minHeight: 20, bgcolor: 'divider' }} />
              )}
            </Box>
            <Box sx={{ pb: 2.5 }}>
              <Typography level="title-sm" sx={{ mb: 0.25 }}>{step.label}</Typography>
              <Typography level="body-sm" sx={{ color: 'text.tertiary' }}>{step.desc}</Typography>
            </Box>
          </Box>
        ))}
      </Box>

      <SectionTitle><Trans>Security layers</Trans></SectionTitle>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
        {[
          {
            icon: <MemoryOutlinedIcon sx={{ fontSize: 20 }} />,
            color: 'rgba(37, 99, 235, 0.08)',
            iconColor: 'var(--joy-palette-primary-plainColor)',
            title: t`In-memory processing (tmpfs)`,
            desc: t`All files are stored on a tmpfs filesystem — a RAM-backed virtual disk. Nothing is ever written to persistent storage. Data is lost on power loss or reboot, by design.`,
          },
          {
            icon: <LanOutlinedIcon sx={{ fontSize: 20 }} />,
            color: 'rgba(37, 99, 235, 0.08)',
            iconColor: 'var(--joy-palette-primary-plainColor)',
            title: t`Namespace isolation (nsjail)`,
            desc: t`Each conversion runs inside nsjail with full Linux namespace isolation: separate PID, mount, network, IPC, UTS, user, and cgroup namespaces. The process sees an isolated filesystem with read-only system mounts.`,
          },
          {
            icon: <ShieldOutlinedIcon sx={{ fontSize: 20 }} />,
            color: 'rgba(37, 99, 235, 0.08)',
            iconColor: 'var(--joy-palette-primary-plainColor)',
            title: t`Syscall filtering (seccomp)`,
            desc: t`Every sandbox has a seccomp-bpf policy that uses a default-deny (KILL) approach. Only the specific system calls needed by that converter are allowed — typically 40–70 out of 300+. Dangerous calls like mount, chroot, bpf, and kexec are always blocked.`,
          },
          {
            icon: <TimerOutlinedIcon sx={{ fontSize: 20 }} />,
            color: 'rgba(37, 99, 235, 0.08)',
            iconColor: 'var(--joy-palette-primary-plainColor)',
            title: t`Resource limits`,
            desc: t`Each job has strict cgroup and rlimit constraints: bounded memory (256 MB–4 GB depending on tool), CPU time (30–300 s), output file size, and process count. A runaway conversion cannot exhaust server resources.`,
          },
          {
            icon: <WifiOffOutlinedIcon sx={{ fontSize: 20 }} />,
            color: 'rgba(37, 99, 235, 0.08)',
            iconColor: 'var(--joy-palette-primary-plainColor)',
            title: t`Network isolation`,
            desc: t`Sandboxes run with clone_newnet and no loopback interface. Even if a converter were compromised, it has zero network access — no DNS, no HTTP, no exfiltration path.`,
          },
          {
            icon: <DeleteSweepOutlinedIcon sx={{ fontSize: 20 }} />,
            color: 'rgba(37, 99, 235, 0.08)',
            iconColor: 'var(--joy-palette-primary-plainColor)',
            title: t`Automatic cleanup`,
            desc: t`Files are deleted from memory immediately after download. Any unclaimed file is garbage-collected after 10 minutes. There is no archive, no backup, no way to recover a file once it's gone.`,
          },
          {
            icon: <HttpsOutlinedIcon sx={{ fontSize: 20 }} />,
            color: 'rgba(37, 99, 235, 0.08)',
            iconColor: 'var(--joy-palette-primary-plainColor)',
            title: t`Transport encryption`,
            desc: t`All traffic is encrypted end-to-end via TLS through Cloudflare. Passwords you provide for operations (archive encryption, PDF protection) are used transiently in memory and never stored or logged.`,
          },
        ].map((layer, i) => (
          <Box
            key={i}
            sx={{
              display: 'flex',
              gap: 2,
              p: 2,
              borderRadius: 'lg',
              bgcolor: 'background.surface',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 'md',
                bgcolor: layer.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                color: layer.iconColor,
              }}
            >
              {layer.icon}
            </Box>
            <Box sx={{ minWidth: 0 }}>
              <Typography level="title-sm" sx={{ mb: 0.5 }}>{layer.title}</Typography>
              <Typography level="body-sm" sx={{ color: 'text.tertiary', lineHeight: 1.6 }}>
                {layer.desc}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>

      <SectionTitle><Trans>What this means for you</Trans></SectionTitle>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          gap: 1.5,
          mb: 4,
        }}
      >
        {[
          t`Files never touch disk`,
          t`No logs of your data`,
          t`Isolated per-job sandboxes`,
          t`Deleted after download`,
          t`No network in converters`,
          t`No accounts or tracking`,
        ].map((point, i) => (
          <Box
            key={i}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.25,
              p: 1.5,
              borderRadius: 'md',
              bgcolor: 'background.level1',
            }}
          >
            <GppGoodOutlinedIcon sx={{ fontSize: 18, color: 'success.plainColor', flexShrink: 0 }} />
            <Typography level="body-sm" sx={{ color: 'text.secondary', fontWeight: 500 }}>
              {point}
            </Typography>
          </Box>
        ))}
      </Box>

      <Box
        sx={{
          p: 2,
          borderRadius: 'lg',
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.surface',
        }}
      >
        <Typography level="body-sm" sx={{ color: 'text.tertiary' }}>
          <Trans>For details on data collection, retention, and your rights under GDPR, see our</Trans>{' '}
          <Typography
            component={Link}
            to="/privacy"
            level="body-sm"
            sx={{ color: 'primary.plainColor', textDecoration: 'none', fontWeight: 500, '&:hover': { textDecoration: 'underline' } }}
          >
            <Trans>privacy policy</Trans>
          </Typography>
          .
        </Typography>
      </Box>
    </Box>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return (
    <Typography level="title-md" sx={{ mb: 2, fontWeight: 700, letterSpacing: '-0.01em' }}>
      {children}
    </Typography>
  );
}

