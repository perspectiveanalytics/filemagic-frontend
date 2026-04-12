import { Box, Typography } from '@mui/joy';
import { useLingui } from '@lingui/react';
import { useLingui as useLinguiMacro } from '@lingui/react/macro';
import SEO from '../components/SEO';
import ProtectedEmail from '../components/ProtectedEmail';

const linkSx = { color: 'primary.plainColor', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } } as const;

export default function LegalPage() {
  const { i18n } = useLingui();
  const { t } = useLinguiMacro();

  return (
    <Box sx={{ maxWidth: 560, mx: 'auto', width: '100%', py: { xs: 3, md: 4 } }}>
      <SEO title={t`Legal Notice`} description={t`FileMagic legal notice (mentions légales). Publisher and hosting information.`} path="/legal" />
      <Typography component="h1" level="h3" sx={{ mb: 1, fontWeight: 700, letterSpacing: '-0.02em' }}>
        {i18n.locale === 'fr' ? 'Mentions légales' : 'Legal notice'}
      </Typography>
      <Typography level="body-sm" sx={{ mb: 2, color: 'text.tertiary' }}>
        {i18n.locale === 'fr'
          ? 'Conformément à la loi n°2004-575 du 21 juin 2004 (LCEN)'
          : 'In accordance with French law n°2004-575 (LCEN)'}
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
        {i18n.locale === 'fr' ? <ContentFr /> : <ContentEn />}
      </Box>
    </Box>
  );
}

// English

function ContentEn() {
  return (
    <>
      <Section title="Publisher">
        <P>
          Perspective Analytics SAS, share capital €210,000, registered with
          the Saint-Nazaire Trade and Companies Register (RCS) under number
          988 270 757.
        </P>
        <P>
          Registered office: 2 rue du Général de Gaulle, 44290
          Guémené-Penfao, France.
        </P>
        <P>Email: <ProtectedEmail /></P>
      </Section>

      <Section title="Hosting providers">
        <P>
          <strong>Cloudflare, Inc.</strong>
          <br />
          101 Townsend Street, San Francisco, CA 94107, United States
          <br />
          https://www.cloudflare.com
        </P>
        <P>
          <strong>OVHcloud SAS</strong>
          <br />
          2 rue Kellermann, 59100 Roubaix, France
          <br />
          https://www.ovhcloud.com
        </P>
      </Section>

      <Section title="Intellectual property">
        <P>
          The overall structure, design, and content of the FileMagic website
          are the exclusive property of the publisher, unless otherwise
          stated. Any reproduction, representation, modification, or
          adaptation of all or part of the site without the prior written
          consent of the publisher is strictly prohibited.
        </P>
      </Section>

      <Section title="Personal data">
        <P>
          For information on how we handle personal data, please refer to
          our{' '}
          <Typography component="a" href="/privacy" level="body-md" sx={linkSx}>
            Privacy policy
          </Typography>
          .
        </P>
      </Section>

      <Section title="Applicable law">
        <P>
          This website and its content are governed by French law. Any
          dispute related to the use of FileMagic shall fall under the
          exclusive jurisdiction of the competent French courts.
        </P>
      </Section>
    </>
  );
}

// Français

function ContentFr() {
  return (
    <>
      <Section title="Éditeur">
        <P>
          Perspective Analytics SAS, au capital social de 210 000 €,
          immatriculée au Registre du Commerce et des Sociétés de
          Saint-Nazaire sous le numéro 988 270 757.
        </P>
        <P>
          Siège social : 2 rue du Général de Gaulle, 44290 Guémené-Penfao,
          France.
        </P>
        <P>Email : <ProtectedEmail /></P>
      </Section>

      <Section title="Hébergeurs">
        <P>
          <strong>Cloudflare, Inc.</strong>
          <br />
          101 Townsend Street, San Francisco, CA 94107, États-Unis
          <br />
          https://www.cloudflare.com
        </P>
        <P>
          <strong>OVHcloud SAS</strong>
          <br />
          2 rue Kellermann, 59100 Roubaix, France
          <br />
          https://www.ovhcloud.com
        </P>
      </Section>

      <Section title="Propriété intellectuelle">
        <P>
          La structure générale, le design et le contenu du site FileMagic
          sont la propriété exclusive de l'éditeur, sauf mention contraire.
          Toute reproduction, représentation, modification ou adaptation de
          tout ou partie du site sans le consentement écrit préalable de
          l'éditeur est strictement interdite.
        </P>
      </Section>

      <Section title="Données personnelles">
        <P>
          Pour toute information sur le traitement de vos données
          personnelles, veuillez consulter notre{' '}
          <Typography component="a" href="/privacy" level="body-md" sx={linkSx}>
            Politique de confidentialité
          </Typography>
          .
        </P>
      </Section>

      <Section title="Droit applicable">
        <P>
          Ce site et son contenu sont régis par le droit français. Tout
          litige relatif à l'utilisation de FileMagic relèvera de la
          compétence exclusive des tribunaux français compétents.
        </P>
      </Section>
    </>
  );
}

// Shared components

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Box>
      <Typography level="title-sm" sx={{ mb: 1, color: 'text.primary' }}>
        {title}
      </Typography>
      {children}
    </Box>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <Typography level="body-md" sx={{ color: 'text.secondary', mb: 1 }}>
      {children}
    </Typography>
  );
}
