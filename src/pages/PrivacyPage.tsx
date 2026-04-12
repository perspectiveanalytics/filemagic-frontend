import { Box, Typography } from '@mui/joy';
import { useLingui } from '@lingui/react';
import { useLingui as useLinguiMacro } from '@lingui/react/macro';
import SEO from '../components/SEO';
import ProtectedEmail from '../components/ProtectedEmail';

const linkSx = { color: 'primary.plainColor', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } } as const;

export default function PrivacyPage() {
  const { i18n } = useLingui();
  const { t } = useLinguiMacro();

  return (
    <Box sx={{ maxWidth: 560, mx: 'auto', width: '100%', py: { xs: 3, md: 4 } }}>
      <SEO title={t`Privacy Policy`} description={t`FileMagic privacy policy. Files never touch disk, no tracking, no cookies, no analytics.`} path="/privacy" />
      <Typography component="h1" level="h3" sx={{ mb: 1, fontWeight: 700, letterSpacing: '-0.02em' }}>
        {i18n.locale === 'fr' ? 'Politique de confidentialité' : 'Privacy policy'}
      </Typography>
      <Typography level="body-sm" sx={{ mb: 2, color: 'text.tertiary' }}>
        {i18n.locale === 'fr' ? 'Dernière mise à jour : 16 février 2026' : 'Last updated: February 16, 2026'}
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
      <Section title="Data controller">
        <P>
          FileMagic is operated by Perspective Analytics SAS, registered with
          the Saint-Nazaire Trade and Companies Register (RCS) under number
          988 270 757, with registered office at 2 rue du Général de Gaulle,
          44290 Guémené-Penfao, France. For any privacy-related inquiry,
          contact us at <ProtectedEmail />.
        </P>
        <P>
          In accordance with GDPR Art. 37, the company is not required to
          appoint a Data Protection Officer. You may nevertheless address any
          question regarding your personal data to the contact above.
        </P>
      </Section>

      <Section title="Data we collect">
        <P>
          FileMagic is designed to minimize data collection. We collect:
        </P>
        <Ul>
          <Li>
            <strong>Uploaded files</strong> — stored temporarily in volatile
            memory (RAM) only, never written to persistent disk. Deleted
            immediately after download or automatically after 10 minutes.
          </Li>
          <Li>
            <strong>IP addresses</strong> — used exclusively for rate limiting.
            Stored in memory only, not logged to any persistent storage.
          </Li>
          <Li>
            <strong>Basic usage metrics</strong> — conversion type,
            success/failure status, and processing duration. These metrics are
            anonymous and cannot be linked to any individual.
          </Li>
        </Ul>
      </Section>

      <Section title="Cookies and trackers">
        <P>
          FileMagic does not set any first-party cookies and does not use
          tracking pixels, analytics services, or any form of user tracking.
        </P>
        <P>
          However, our CDN provider Cloudflare may set strictly technical
          cookies (<strong>__cf_bm</strong>, <strong>cf_clearance</strong>)
          for security and bot-protection purposes. These cookies are exempt
          from consent under Art. 82 of the French Loi Informatique et
          Libertés as they are strictly necessary for the provision of the
          service. No advertising or tracking cookies are used.
        </P>
      </Section>

      <Section title="Data we do not collect">
        <P>
          We do not create user accounts. We do not log file names, file
          contents, or file metadata. We do not use any third-party analytics
          or advertising services.
        </P>
      </Section>

      <Section title="Legal basis for processing (GDPR Art. 6)">
        <P>
          We process data on the following legal bases:
        </P>
        <Ul>
          <Li>
            <strong>Performance of the service</strong> (Art. 6(1)(b)) —
            processing your uploaded files is necessary to provide the
            conversion service you requested.
          </Li>
          <Li>
            <strong>Legitimate interest</strong> (Art. 6(1)(f)) — rate
            limiting by IP address is necessary to protect the service from
            abuse and ensure availability for all users.
          </Li>
        </Ul>
        <P>
          We do not rely on consent as a legal basis for any processing.
          Should this change in the future, you will have the right to
          withdraw your consent at any time (Art. 7(3)).
        </P>
      </Section>

      <Section title="How files are processed">
        <P>
          All file processing occurs exclusively in volatile memory (RAM)
          using a tmpfs filesystem. Files are never written to persistent
          disk storage. Each conversion runs in an isolated sandbox with no
          network access. After processing, the result is available for a
          single download. Files are automatically deleted after download or
          after a maximum of 10 minutes, whichever comes first.
        </P>
        <P>
          Certain operations (certificate conversion, archive creation)
          accept an optional password you provide. Passwords are used
          transiently in memory for that specific operation and are never
          stored, logged, or transmitted to any third party.
        </P>
      </Section>

      <Section title="Data retention">
        <Ul>
          <Li>
            <strong>Uploaded and converted files</strong> — deleted
            immediately after download, or automatically after 10 minutes.
            Lost on server restart (volatile memory).
          </Li>
          <Li>
            <strong>IP-based rate limit data</strong> — held in memory only,
            lost on server restart.
          </Li>
          <Li>
            <strong>Usage metrics</strong> — anonymous, aggregated, retained
            for up to one year for operational monitoring purposes, then
            deleted.
          </Li>
        </Ul>
      </Section>

      <Section title="Data sharing and transfers">
        <P>
          We do not sell or share your data for marketing or advertising
          purposes. File processing happens exclusively on our own servers
          located in France.
        </P>
        <P>
          Our website is served through <strong>Cloudflare, Inc.</strong>{' '}
          (USA), which acts as a reverse proxy and CDN. As a result, HTTP
          request data (including IP addresses) transits through
          Cloudflare's network before reaching our servers.
        </P>
        <P>
          We also use <strong>Cloudflare Turnstile</strong>, a bot-detection
          service, to protect conversion endpoints from automated abuse.
          When you submit a file, your IP address and a verification token
          are sent to Cloudflare for validation. This processing is based
          on our legitimate interest (Art. 6(1)(f)) in preventing abuse.
        </P>
        <P>
          Cloudflare processes data as a sub-processor under a Data
          Processing Agreement, and is certified under the EU-US Data
          Privacy Framework. Standard Contractual Clauses (SCCs) approved
          by the European Commission are also in place. You may request a
          copy of the transfer safeguards by contacting <ProtectedEmail />.
          For details, see{' '}
          <A href="https://www.cloudflare.com/privacypolicy/">
            Cloudflare's privacy policy
          </A>
          .
        </P>
        <P>
          Apart from Cloudflare, no data is shared with or transferred to
          any other third party.
        </P>
        <P>
          The operator also runs{' '}
          <A href="https://profundis.io/">Profundis</A>, a separate search
          and indexing service. Files uploaded to FileMagic are never
          transmitted to, indexed by, or made accessible through Profundis
          or any other indexing service. The two services are entirely
          independent and share no user data.
        </P>
      </Section>

      <Section title="Automated decision-making">
        <P>
          No automated decision-making producing legal or similarly
          significant effects is carried out on the basis of your data
          (GDPR Art. 22).
        </P>
      </Section>

      <Section title="Your rights (GDPR)">
        <P>
          Under the General Data Protection Regulation, you have the right to:
        </P>
        <Ul>
          <Li>Access the personal data we hold about you (Art. 15)</Li>
          <Li>Rectify inaccurate personal data (Art. 16)</Li>
          <Li>Request erasure of your personal data (Art. 17)</Li>
          <Li>Restrict processing of your personal data (Art. 18)</Li>
          <Li>Data portability (Art. 20)</Li>
          <Li>Object to processing of your personal data (Art. 21)</Li>
          <Li>
            Withdraw consent at any time, where processing is based on
            consent (Art. 7(3))
          </Li>
          <Li>
            Lodge a complaint with a supervisory authority — in France, the
            CNIL (Commission Nationale de l'Informatique et des Libertés),{' '}
            <A href="https://www.cnil.fr">www.cnil.fr</A>
          </Li>
        </Ul>
        <P>
          We will respond to any rights request within one month of receipt
          (Art. 12(3)). In practice, because we do not collect persistent
          personal data, most of these rights are already satisfied by
          design. If you have any concern, contact <ProtectedEmail />.
        </P>
      </Section>

      <Section title="US state privacy laws">
        <P>
          We do not sell or share personal information as defined by the
          California Consumer Privacy Act / California Privacy Rights Act
          (CCPA/CPRA) or any other US state comprehensive privacy law. We
          do not meet the applicability thresholds for mandatory compliance
          under any US state privacy statute. Nevertheless, you may exercise
          rights similar to those listed above (access, deletion) by
          contacting <ProtectedEmail />.
        </P>
      </Section>

      <Section title="Children's privacy">
        <P>
          FileMagic does not knowingly collect personal data from children
          under 16. Since we do not create user accounts or collect
          identifying information, we have no means of determining the age
          of our users.
        </P>
      </Section>

      <Section title="Security">
        <P>
          Files are processed in isolated sandboxes with restricted system
          access and no network connectivity. All connections to FileMagic
          are encrypted via TLS. Our architecture is designed so that no
          persistent user data exists to be compromised.
        </P>
      </Section>

      <Section title="Data breach notification">
        <P>
          In the unlikely event of a personal data breach, we will notify
          the CNIL within 72 hours of becoming aware of it (GDPR Art. 33).
          If the breach is likely to result in a high risk to your rights
          and freedoms, we will also inform affected individuals without
          undue delay (Art. 34).
        </P>
      </Section>

      <Section title="Changes to this policy">
        <P>
          We may update this privacy policy from time to time. Changes will
          be posted on this page with an updated revision date. Continued
          use of the service after changes constitutes acceptance of the
          revised policy.
        </P>
      </Section>

      <Section title="Contact">
        <P>
          For any question regarding this privacy policy or to exercise your
          rights, contact us at <ProtectedEmail />.
        </P>
      </Section>
    </>
  );
}

// Français

function ContentFr() {
  return (
    <>
      <Section title="Responsable du traitement">
        <P>
          FileMagic est exploité par Perspective Analytics SAS, immatriculée
          au Registre du Commerce et des Sociétés de Saint-Nazaire sous le
          numéro 988 270 757, dont le siège social est situé au 2 rue du
          Général de Gaulle, 44290 Guémené-Penfao, France. Pour toute
          question relative à la protection de vos données, contactez-nous
          à l'adresse <ProtectedEmail />.
        </P>
        <P>
          Conformément à l'art. 37 du RGPD, la société n'est pas tenue de
          désigner de Délégué à la Protection des Données (DPO). Vous pouvez
          toutefois adresser toute question relative à vos données
          personnelles au contact ci-dessus.
        </P>
      </Section>

      <Section title="Données collectées">
        <P>
          FileMagic est conçu pour minimiser la collecte de données. Nous
          collectons :
        </P>
        <Ul>
          <Li>
            <strong>Fichiers téléversés</strong> — stockés temporairement en
            mémoire vive (RAM) uniquement, jamais écrits sur un support de
            stockage persistant. Supprimés immédiatement après le
            téléchargement ou automatiquement après 10 minutes.
          </Li>
          <Li>
            <strong>Adresses IP</strong> — utilisées exclusivement pour la
            limitation de débit. Stockées en mémoire uniquement, non
            enregistrées sur un support persistant.
          </Li>
          <Li>
            <strong>Métriques d'utilisation élémentaires</strong> — type de
            conversion, statut succès/échec et durée de traitement. Ces
            métriques sont anonymes et ne peuvent être reliées à aucun
            individu.
          </Li>
        </Ul>
      </Section>

      <Section title="Cookies et traceurs">
        <P>
          FileMagic ne dépose aucun cookie propriétaire et n'utilise aucun
          pixel de suivi, service d'analyse ou toute autre forme de traçage
          des utilisateurs.
        </P>
        <P>
          Toutefois, notre fournisseur CDN Cloudflare peut déposer des
          cookies strictement techniques (<strong>__cf_bm</strong>,{' '}
          <strong>cf_clearance</strong>) à des fins de sécurité et de
          protection contre les bots. Ces cookies sont exemptés de
          consentement au titre de l'art. 82 de la Loi Informatique et
          Libertés, car ils sont strictement nécessaires à la fourniture du
          service. Aucun cookie publicitaire ou de suivi n'est utilisé.
        </P>
      </Section>

      <Section title="Données non collectées">
        <P>
          Nous ne créons pas de comptes utilisateurs. Nous n'enregistrons pas
          les noms de fichiers, le contenu des fichiers ni les métadonnées
          des fichiers. Nous n'utilisons aucun service d'analyse ou de
          publicité tiers.
        </P>
      </Section>

      <Section title="Base légale du traitement (RGPD Art. 6)">
        <P>
          Nous traitons les données sur les bases légales suivantes :
        </P>
        <Ul>
          <Li>
            <strong>Exécution du service</strong> (Art. 6(1)(b)) — le
            traitement de vos fichiers téléversés est nécessaire à la
            fourniture du service de conversion que vous avez demandé.
          </Li>
          <Li>
            <strong>Intérêt légitime</strong> (Art. 6(1)(f)) — la limitation
            de débit par adresse IP est nécessaire pour protéger le service
            contre les abus et garantir sa disponibilité pour tous les
            utilisateurs.
          </Li>
        </Ul>
        <P>
          Nous ne nous fondons pas sur le consentement comme base légale pour
          nos traitements. Si cela devait changer, vous auriez le droit de
          retirer votre consentement à tout moment (Art. 7(3)).
        </P>
      </Section>

      <Section title="Traitement des fichiers">
        <P>
          Tout le traitement des fichiers s'effectue exclusivement en mémoire
          vive (RAM) via un système de fichiers tmpfs. Les fichiers ne sont
          jamais écrits sur un support de stockage persistant. Chaque
          conversion s'exécute dans un bac à sable isolé sans accès réseau.
          Après traitement, le résultat est disponible pour un seul
          téléchargement. Les fichiers sont automatiquement supprimés après
          le téléchargement ou après un maximum de 10 minutes, selon la
          première éventualité.
        </P>
        <P>
          Certaines opérations (conversion de certificats, création
          d'archives) acceptent un mot de passe optionnel que vous
          fournissez. Les mots de passe sont utilisés de manière transitoire
          en mémoire pour cette opération spécifique et ne sont jamais
          stockés, enregistrés dans les journaux ni transmis à un tiers.
        </P>
      </Section>

      <Section title="Conservation des données">
        <Ul>
          <Li>
            <strong>Fichiers téléversés et convertis</strong> — supprimés
            immédiatement après le téléchargement, ou automatiquement après
            10 minutes. Perdus au redémarrage du serveur (mémoire volatile).
          </Li>
          <Li>
            <strong>Données de limitation de débit par IP</strong> —
            conservées en mémoire uniquement, perdues au redémarrage du
            serveur.
          </Li>
          <Li>
            <strong>Métriques d'utilisation</strong> — anonymes, agrégées,
            conservées jusqu'à un an à des fins de surveillance
            opérationnelle, puis supprimées.
          </Li>
        </Ul>
      </Section>

      <Section title="Partage et transferts de données">
        <P>
          Nous ne vendons ni ne partageons vos données à des fins de
          marketing ou de publicité. Le traitement des fichiers s'effectue
          exclusivement sur nos propres serveurs situés en France.
        </P>
        <P>
          Notre site web est servi via <strong>Cloudflare, Inc.</strong>{' '}
          (États-Unis), qui agit en tant que proxy inverse et CDN. Par
          conséquent, les données de requête HTTP (y compris les adresses IP)
          transitent par le réseau de Cloudflare avant d'atteindre nos
          serveurs.
        </P>
        <P>
          Nous utilisons également <strong>Cloudflare Turnstile</strong>, un
          service de détection de bots, pour protéger les points d'accès de
          conversion contre les abus automatisés. Lorsque vous soumettez un
          fichier, votre adresse IP et un jeton de vérification sont envoyés
          à Cloudflare pour validation. Ce traitement est fondé sur notre
          intérêt légitime (Art. 6(1)(f)) à prévenir les abus.
        </P>
        <P>
          Cloudflare traite les données en tant que sous-traitant dans le
          cadre d'un contrat de traitement des données (DPA), et est certifié
          au titre du EU-US Data Privacy Framework. Des Clauses
          Contractuelles Types (CCT/SCC) approuvées par la Commission
          européenne sont également en place. Vous pouvez demander une copie
          des garanties de transfert en contactant <ProtectedEmail />.
          Pour plus de détails, consultez la{' '}
          <A href="https://www.cloudflare.com/privacypolicy/">
            politique de confidentialité de Cloudflare
          </A>
          .
        </P>
        <P>
          En dehors de Cloudflare, aucune donnée n'est partagée avec ou
          transférée à un quelconque tiers.
        </P>
        <P>
          L'opérateur exploite également{' '}
          <A href="https://profundis.io/">Profundis</A>, un service
          distinct de recherche et d'indexation. Les fichiers téléversés
          sur FileMagic ne sont jamais transmis, indexés ni rendus
          accessibles via Profundis ou tout autre service d'indexation.
          Les deux services sont entièrement indépendants et ne partagent
          aucune donnée utilisateur.
        </P>
      </Section>

      <Section title="Prise de décision automatisée">
        <P>
          Aucune décision automatisée produisant des effets juridiques ou
          des effets significatifs similaires n'est prise sur la base de vos
          données (RGPD Art. 22).
        </P>
      </Section>

      <Section title="Vos droits (RGPD)">
        <P>
          En vertu du Règlement Général sur la Protection des Données, vous
          disposez des droits suivants :
        </P>
        <Ul>
          <Li>Droit d'accès aux données personnelles que nous détenons vous concernant (Art. 15)</Li>
          <Li>Droit de rectification des données inexactes (Art. 16)</Li>
          <Li>Droit à l'effacement de vos données personnelles (Art. 17)</Li>
          <Li>Droit à la limitation du traitement (Art. 18)</Li>
          <Li>Droit à la portabilité des données (Art. 20)</Li>
          <Li>Droit d'opposition au traitement (Art. 21)</Li>
          <Li>
            Droit de retirer votre consentement à tout moment, lorsque le
            traitement est fondé sur le consentement (Art. 7(3))
          </Li>
          <Li>
            Droit d'introduire une réclamation auprès d'une autorité de
            contrôle — en France, la CNIL (Commission Nationale de
            l'Informatique et des Libertés),{' '}
            <A href="https://www.cnil.fr">www.cnil.fr</A>
          </Li>
        </Ul>
        <P>
          Nous répondrons à toute demande d'exercice de droits dans un délai
          d'un mois à compter de sa réception (Art. 12(3)). En pratique,
          dans la mesure où nous ne collectons pas de données personnelles
          persistantes, la plupart de ces droits sont déjà satisfaits par
          conception. Pour toute question, contactez <ProtectedEmail />.
        </P>
      </Section>

      <Section title="Lois américaines sur la vie privée">
        <P>
          Nous ne vendons ni ne partageons d'informations personnelles au
          sens du California Consumer Privacy Act / California Privacy Rights
          Act (CCPA/CPRA) ou de toute autre loi américaine globale sur la
          protection de la vie privée. Nous ne dépassons pas les seuils
          d'application obligatoire de ces législations. Néanmoins, vous
          pouvez exercer des droits similaires à ceux listés ci-dessus
          (accès, suppression) en contactant <ProtectedEmail />.
        </P>
      </Section>

      <Section title="Protection des mineurs">
        <P>
          FileMagic ne collecte pas sciemment de données personnelles
          concernant des enfants de moins de 16 ans. Dans la mesure où nous
          ne créons pas de comptes utilisateurs et ne collectons pas
          d'informations d'identification, nous n'avons aucun moyen de
          déterminer l'âge de nos utilisateurs.
        </P>
      </Section>

      <Section title="Sécurité">
        <P>
          Les fichiers sont traités dans des bacs à sable isolés avec un
          accès système restreint et aucune connectivité réseau. Toutes les
          connexions à FileMagic sont chiffrées via TLS. Notre architecture
          est conçue de sorte qu'aucune donnée utilisateur persistante
          n'existe et ne puisse être compromise.
        </P>
      </Section>

      <Section title="Notification de violation de données">
        <P>
          Dans le cas improbable d'une violation de données personnelles,
          nous notifierons la CNIL dans les 72 heures suivant la prise de
          connaissance de l'incident (RGPD Art. 33). Si la violation est
          susceptible d'engendrer un risque élevé pour vos droits et
          libertés, nous en informerons également les personnes concernées
          dans les meilleurs délais (Art. 34).
        </P>
      </Section>

      <Section title="Modifications de cette politique">
        <P>
          Nous pouvons mettre à jour cette politique de confidentialité de
          temps à autre. Les modifications seront publiées sur cette page
          avec une date de révision mise à jour. La poursuite de
          l'utilisation du service après les modifications vaut acceptation
          de la politique révisée.
        </P>
      </Section>

      <Section title="Contact">
        <P>
          Pour toute question relative à cette politique de confidentialité
          ou pour exercer vos droits, contactez-nous à l'adresse <ProtectedEmail />.
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

function Ul({ children }: { children: React.ReactNode }) {
  return (
    <Box component="ul" sx={{ m: 0, pl: 2.5, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
      {children}
    </Box>
  );
}

function Li({ children }: { children: React.ReactNode }) {
  return (
    <Typography component="li" level="body-md" sx={{ color: 'text.secondary' }}>
      {children}
    </Typography>
  );
}

function A({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Typography
      component="a"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      level="body-md"
      sx={linkSx}
    >
      {children}
    </Typography>
  );
}
