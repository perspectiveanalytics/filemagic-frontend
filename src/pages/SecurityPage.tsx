import { type ReactNode } from 'react';
import { Box, Typography } from '@mui/joy';
import { Link } from 'react-router-dom';
import LangToggle from '../components/LangToggle';
import SEO from '../components/SEO';
import { useLang } from '../hooks/useLang';

import MemoryOutlinedIcon from '@mui/icons-material/MemoryOutlined';
import LanOutlinedIcon from '@mui/icons-material/LanOutlined';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import TimerOutlinedIcon from '@mui/icons-material/TimerOutlined';
import GppGoodOutlinedIcon from '@mui/icons-material/GppGoodOutlined';
import WifiOffOutlinedIcon from '@mui/icons-material/WifiOffOutlined';
import DeleteSweepOutlinedIcon from '@mui/icons-material/DeleteSweepOutlined';
import HttpsOutlinedIcon from '@mui/icons-material/HttpsOutlined';

export default function SecurityPage() {
  const [lang, setLang] = useLang();
  const t = lang === 'fr' ? fr : en;

  return (
    <Box sx={{ maxWidth: 620, mx: 'auto', width: '100%', py: { xs: 3, md: 4 } }}>
      <SEO
        title={lang === 'fr' ? 'Sécurité' : 'Security'}
        description={lang === 'fr'
          ? 'Comment FileMagic protège vos fichiers : traitement en mémoire, sandbox nsjail, filtrage seccomp, isolation réseau.'
          : 'How FileMagic protects your files: in-memory processing, nsjail sandboxing, seccomp filtering, network isolation.'}
        path="/security"
      />

      <Typography component="h1" level="h3" sx={{ mb: 1, fontWeight: 700, letterSpacing: '-0.02em' }}>
        {t.title}
      </Typography>
      <Typography level="body-sm" sx={{ mb: 2, color: 'text.tertiary' }}>
        {t.subtitle}
      </Typography>
      <LangToggle lang={lang} setLang={setLang} />

      <Typography level="body-md" sx={{ color: 'text.secondary', mb: 4 }}>
        {t.intro}
      </Typography>

      <SectionTitle>{t.lifecycleTitle}</SectionTitle>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0, mb: 4 }}>
        {t.lifecycleSteps.map((step, i) => (
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
              {i < t.lifecycleSteps.length - 1 && (
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

      <SectionTitle>{t.layersTitle}</SectionTitle>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 4 }}>
        {t.layers.map((layer, i) => (
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

      <SectionTitle>{t.summaryTitle}</SectionTitle>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          gap: 1.5,
          mb: 4,
        }}
      >
        {t.summaryPoints.map((point, i) => (
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
          {t.privacyLinkPrefix}{' '}
          <Typography
            component={Link}
            to="/privacy"
            level="body-sm"
            sx={{ color: 'primary.plainColor', textDecoration: 'none', fontWeight: 500, '&:hover': { textDecoration: 'underline' } }}
          >
            {t.privacyLinkText}
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

interface Layer {
  icon: ReactNode;
  color: string;
  iconColor: string;
  title: string;
  desc: string;
}

interface Content {
  title: string;
  subtitle: string;
  intro: string;
  lifecycleTitle: string;
  lifecycleSteps: { label: string; desc: string }[];
  layersTitle: string;
  layers: Layer[];
  summaryTitle: string;
  summaryPoints: string[];
  privacyLinkPrefix: string;
  privacyLinkText: string;
}

const en: Content = {
  title: 'Security',
  subtitle: 'How FileMagic protects your files at every step.',
  intro: 'FileMagic is built around a zero-trust architecture where your files are never written to disk, every conversion runs in a locked-down sandbox, and data is destroyed the moment you download it. Here\'s how it works.',
  lifecycleTitle: 'File lifecycle',
  lifecycleSteps: [
    { label: 'Upload', desc: 'Your file is sent over TLS and stored in volatile memory (RAM). It never touches a physical disk.' },
    { label: 'Queue', desc: 'The job enters a rate-limited queue. Your IP is held in memory for abuse prevention — never logged to disk.' },
    { label: 'Processing', desc: 'The file is processed inside an isolated nsjail sandbox with no network access and restricted syscalls.' },
    { label: 'Result ready', desc: 'The converted file is held in RAM. A single-use download link is generated.' },
    { label: 'Cleanup', desc: 'After download — or after 10 minutes maximum — both files are permanently erased from memory.' },
  ],
  layersTitle: 'Security layers',
  layers: [
    {
      icon: <MemoryOutlinedIcon sx={{ fontSize: 20 }} />,
      color: 'rgba(37, 99, 235, 0.08)',
      iconColor: 'var(--joy-palette-primary-plainColor)',
      title: 'In-memory processing (tmpfs)',
      desc: 'All files are stored on a tmpfs filesystem — a RAM-backed virtual disk. Nothing is ever written to persistent storage. Data is lost on power loss or reboot, by design.',
    },
    {
      icon: <LanOutlinedIcon sx={{ fontSize: 20 }} />,
      color: 'rgba(37, 99, 235, 0.08)',
      iconColor: 'var(--joy-palette-primary-plainColor)',
      title: 'Namespace isolation (nsjail)',
      desc: 'Each conversion runs inside nsjail with full Linux namespace isolation: separate PID, mount, network, IPC, UTS, user, and cgroup namespaces. The process sees an isolated filesystem with read-only system mounts.',
    },
    {
      icon: <ShieldOutlinedIcon sx={{ fontSize: 20 }} />,
      color: 'rgba(37, 99, 235, 0.08)',
      iconColor: 'var(--joy-palette-primary-plainColor)',
      title: 'Syscall filtering (seccomp)',
      desc: 'Every sandbox has a seccomp-bpf policy that uses a default-deny (KILL) approach. Only the specific system calls needed by that converter are allowed — typically 40–70 out of 300+. Dangerous calls like mount, chroot, bpf, and kexec are always blocked.',
    },
    {
      icon: <TimerOutlinedIcon sx={{ fontSize: 20 }} />,
      color: 'rgba(37, 99, 235, 0.08)',
      iconColor: 'var(--joy-palette-primary-plainColor)',
      title: 'Resource limits',
      desc: 'Each job has strict cgroup and rlimit constraints: bounded memory (256 MB–4 GB depending on tool), CPU time (30–300 s), output file size, and process count. A runaway conversion cannot exhaust server resources.',
    },
    {
      icon: <WifiOffOutlinedIcon sx={{ fontSize: 20 }} />,
      color: 'rgba(37, 99, 235, 0.08)',
      iconColor: 'var(--joy-palette-primary-plainColor)',
      title: 'Network isolation',
      desc: 'Sandboxes run with clone_newnet and no loopback interface. Even if a converter were compromised, it has zero network access — no DNS, no HTTP, no exfiltration path.',
    },
    {
      icon: <DeleteSweepOutlinedIcon sx={{ fontSize: 20 }} />,
      color: 'rgba(37, 99, 235, 0.08)',
      iconColor: 'var(--joy-palette-primary-plainColor)',
      title: 'Automatic cleanup',
      desc: 'Files are deleted from memory immediately after download. Any unclaimed file is garbage-collected after 10 minutes. There is no archive, no backup, no way to recover a file once it\'s gone.',
    },
    {
      icon: <HttpsOutlinedIcon sx={{ fontSize: 20 }} />,
      color: 'rgba(37, 99, 235, 0.08)',
      iconColor: 'var(--joy-palette-primary-plainColor)',
      title: 'Transport encryption',
      desc: 'All traffic is encrypted end-to-end via TLS through Cloudflare. Passwords you provide for operations (archive encryption, PDF protection) are used transiently in memory and never stored or logged.',
    },
  ],
  summaryTitle: 'What this means for you',
  summaryPoints: [
    'Files never touch disk',
    'No logs of your data',
    'Isolated per-job sandboxes',
    'Deleted after download',
    'No network in converters',
    'No accounts or tracking',
  ],
  privacyLinkPrefix: 'For details on data collection, retention, and your rights under GDPR, see our',
  privacyLinkText: 'privacy policy',
};

const fr: Content = {
  title: 'Sécurité',
  subtitle: 'Comment FileMagic protège vos fichiers à chaque étape.',
  intro: 'FileMagic est construit autour d\'une architecture zéro confiance : vos fichiers ne sont jamais écrits sur disque, chaque conversion s\'exécute dans un bac à sable verrouillé, et les données sont détruites dès que vous récupérez le résultat. Voici comment ça fonctionne.',
  lifecycleTitle: 'Cycle de vie du fichier',
  lifecycleSteps: [
    { label: 'Téléversement', desc: 'Votre fichier est envoyé via TLS et stocké en mémoire vive (RAM). Il ne touche jamais un disque physique.' },
    { label: 'File d\'attente', desc: 'La tâche entre dans une file d\'attente à débit limité. Votre IP est conservée en mémoire pour prévenir les abus — jamais enregistrée sur disque.' },
    { label: 'Traitement', desc: 'Le fichier est traité dans un bac à sable nsjail isolé, sans accès réseau et avec des appels système restreints.' },
    { label: 'Résultat prêt', desc: 'Le fichier converti est conservé en RAM. Un lien de téléchargement à usage unique est généré.' },
    { label: 'Nettoyage', desc: 'Après le téléchargement — ou après 10 minutes maximum — les deux fichiers sont définitivement effacés de la mémoire.' },
  ],
  layersTitle: 'Couches de sécurité',
  layers: [
    {
      icon: <MemoryOutlinedIcon sx={{ fontSize: 20 }} />,
      color: 'rgba(37, 99, 235, 0.08)',
      iconColor: 'var(--joy-palette-primary-plainColor)',
      title: 'Traitement en mémoire (tmpfs)',
      desc: 'Tous les fichiers sont stockés sur un système de fichiers tmpfs — un disque virtuel en RAM. Rien n\'est jamais écrit sur un support de stockage persistant. Les données sont perdues en cas de coupure ou de redémarrage, par conception.',
    },
    {
      icon: <LanOutlinedIcon sx={{ fontSize: 20 }} />,
      color: 'rgba(37, 99, 235, 0.08)',
      iconColor: 'var(--joy-palette-primary-plainColor)',
      title: 'Isolation par espaces de noms (nsjail)',
      desc: 'Chaque conversion s\'exécute dans nsjail avec une isolation complète des espaces de noms Linux : PID, montage, réseau, IPC, UTS, utilisateur et cgroup séparés. Le processus voit un système de fichiers isolé avec des montages système en lecture seule.',
    },
    {
      icon: <ShieldOutlinedIcon sx={{ fontSize: 20 }} />,
      color: 'rgba(37, 99, 235, 0.08)',
      iconColor: 'var(--joy-palette-primary-plainColor)',
      title: 'Filtrage des appels système (seccomp)',
      desc: 'Chaque bac à sable dispose d\'une politique seccomp-bpf utilisant une approche par défaut de refus (KILL). Seuls les appels système spécifiques nécessaires à ce convertisseur sont autorisés — généralement 40 à 70 sur plus de 300. Les appels dangereux comme mount, chroot, bpf et kexec sont toujours bloqués.',
    },
    {
      icon: <TimerOutlinedIcon sx={{ fontSize: 20 }} />,
      color: 'rgba(37, 99, 235, 0.08)',
      iconColor: 'var(--joy-palette-primary-plainColor)',
      title: 'Limites de ressources',
      desc: 'Chaque tâche a des contraintes strictes de cgroup et rlimit : mémoire bornée (256 Mo à 4 Go selon l\'outil), temps CPU (30 à 300 s), taille du fichier de sortie et nombre de processus. Une conversion incontrôlée ne peut pas épuiser les ressources du serveur.',
    },
    {
      icon: <WifiOffOutlinedIcon sx={{ fontSize: 20 }} />,
      color: 'rgba(37, 99, 235, 0.08)',
      iconColor: 'var(--joy-palette-primary-plainColor)',
      title: 'Isolation réseau',
      desc: 'Les bacs à sable s\'exécutent avec clone_newnet et sans interface loopback. Même si un convertisseur était compromis, il n\'aurait aucun accès réseau — pas de DNS, pas de HTTP, aucun chemin d\'exfiltration.',
    },
    {
      icon: <DeleteSweepOutlinedIcon sx={{ fontSize: 20 }} />,
      color: 'rgba(37, 99, 235, 0.08)',
      iconColor: 'var(--joy-palette-primary-plainColor)',
      title: 'Nettoyage automatique',
      desc: 'Les fichiers sont supprimés de la mémoire immédiatement après le téléchargement. Tout fichier non récupéré est automatiquement effacé après 10 minutes. Il n\'y a pas d\'archive, pas de sauvegarde, aucun moyen de récupérer un fichier une fois supprimé.',
    },
    {
      icon: <HttpsOutlinedIcon sx={{ fontSize: 20 }} />,
      color: 'rgba(37, 99, 235, 0.08)',
      iconColor: 'var(--joy-palette-primary-plainColor)',
      title: 'Chiffrement du transport',
      desc: 'Tout le trafic est chiffré de bout en bout via TLS à travers Cloudflare. Les mots de passe que vous fournissez pour les opérations (chiffrement d\'archive, protection PDF) sont utilisés de manière transitoire en mémoire et ne sont jamais stockés ni enregistrés.',
    },
  ],
  summaryTitle: 'Ce que cela signifie pour vous',
  summaryPoints: [
    'Fichiers jamais écrits sur disque',
    'Aucun journal de vos données',
    'Bac à sable isolé par tâche',
    'Supprimé après téléchargement',
    'Pas de réseau dans les convertisseurs',
    'Pas de compte ni de traçage',
  ],
  privacyLinkPrefix: 'Pour les détails sur la collecte de données, la conservation et vos droits au titre du RGPD, consultez notre',
  privacyLinkText: 'politique de confidentialité',
};
