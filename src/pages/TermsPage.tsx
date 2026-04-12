import { Box, Typography } from '@mui/joy';
import { useLingui } from '@lingui/react';
import { useLingui as useLinguiMacro } from '@lingui/react/macro';
import SEO from '../components/SEO';
import ProtectedEmail from '../components/ProtectedEmail';

const linkSx = { color: 'primary.plainColor', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } } as const;

export default function TermsPage() {
  const { i18n } = useLingui();
  const { t } = useLinguiMacro();

  return (
    <Box sx={{ maxWidth: 560, mx: 'auto', width: '100%', py: { xs: 3, md: 4 } }}>
      <SEO title={t`Terms of Service`} description={t`FileMagic terms of service. Free file conversion with no signup required.`} path="/terms" />
      <Typography component="h1" level="h3" sx={{ mb: 1, fontWeight: 700, letterSpacing: '-0.02em' }}>
        {i18n.locale === 'fr' ? 'Conditions générales d\'utilisation' : 'Terms of service'}
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
      <Section title="1. Acceptance of terms">
        <P>
          By accessing or using FileMagic ("the Service"), you agree to be
          bound by these Terms of Service. If you do not agree, do not use
          the Service.
        </P>
      </Section>

      <Section title="2. Service description">
        <P>
          FileMagic is a free online file-processing service. Server-side
          features include image, audio, video, font, and ebook format
          conversion, PDF operations (compression, merge, password protection,
          repair, image extraction, editing), image compression and resizing,
          optical character recognition (OCR), metadata removal, SVG
          rasterization, markdown-to-PDF conversion, certificate conversion,
          and archive creation and decompression. Client-side tools — such as
          the password generator, CSV/Excel converter, hash generator, and
          YAML/JSON converter — run entirely in your browser and never send
          data to our servers. Files processed server-side are handled in
          volatile memory (RAM) only and are never stored on persistent disk.
        </P>
      </Section>

      <Section title="3. No account required">
        <P>
          The Service does not require registration or the creation of a user
          account. No personal information is required to use the Service.
        </P>
      </Section>

      <Section title="4. Privacy policy">
        <P>
          Your use of the Service is also governed by our{' '}
          <Typography component="a" href="/privacy" level="body-md" sx={linkSx}>
            Privacy Policy
          </Typography>
          , which describes how we handle (or rather, avoid handling) personal
          data. By using the Service, you acknowledge that you have read and
          understood the Privacy Policy.
        </P>
      </Section>

      <Section title="5. Free service and right of withdrawal">
        <P>
          The Service is provided entirely free of charge, without
          registration, subscription, or any form of payment. No commercial
          contract (contrat à distance) within the meaning of Articles L 221-1
          et seq. of the French Consumer Code is formed by your use of the
          Service. Accordingly, the statutory right of withdrawal (droit de
          rétractation) under Articles L 221-18 et seq. does not apply.
        </P>
      </Section>

      <Section title="6. Minimum age">
        <P>
          The Service is intended for users aged 16 or older. If you are
          under 16, you may only use the Service with the consent and
          supervision of a parent or legal guardian. We do not knowingly
          collect personal data from minors — for details, see the{' '}
          <Typography component="a" href="/privacy" level="body-md" sx={linkSx}>
            Privacy Policy
          </Typography>
          .
        </P>
      </Section>

      <Section title="7. Acceptable use">
        <P>You agree not to use the Service to:</P>
        <Ul>
          <Li>
            Upload, process, or distribute content that is illegal, harmful,
            threatening, abusive, defamatory, or otherwise objectionable under
            applicable law.
          </Li>
          <Li>
            Upload malware, viruses, or any malicious code.
          </Li>
          <Li>
            Process files that infringe on intellectual property rights,
            trade secrets, or other proprietary rights of any third party.
          </Li>
          <Li>
            Attempt to circumvent rate limits, security measures, or access
            controls.
          </Li>
          <Li>
            Use the Service in any automated manner that places an
            unreasonable load on our infrastructure (scraping, bulk
            processing, etc.).
          </Li>
          <Li>
            Reverse engineer, decompile, or attempt to extract the source
            code of the Service.
          </Li>
        </Ul>
      </Section>

      <Section title="8. Your responsibilities">
        <P>
          You are solely responsible for the files you upload and for
          ensuring that you have the legal right to process them. You
          represent and warrant that your use of the Service complies with
          all applicable laws and regulations.
        </P>
        <P>
          You must retain a copy of any file you upload. The Service is not
          a storage or backup solution. We are not responsible for any data
          loss resulting from your failure to keep copies of your files.
        </P>
        <P>
          We strongly recommend that you do not upload files containing
          sensitive personal data (medical records, financial documents,
          identity documents), trade secrets, or classified information.
          While our architecture is designed to minimize data exposure,
          no system can guarantee absolute security.
        </P>
      </Section>

      <Section title="9. Service limitations">
        <Ul>
          <Li>Maximum file size varies by tool (up to 350 MB), as indicated on each page.</Li>
          <Li>
            Files are available for a single download only and are
            automatically deleted after 10 minutes.
          </Li>
          <Li>Rate limits apply per IP address to ensure fair use.</Li>
          <Li>
            The processing queue has a limited capacity. Your request may be
            rejected if the queue is full.
          </Li>
        </Ul>
      </Section>

      <Section title="10. Intellectual property">
        <P>
          You retain all rights to the files you upload and the converted
          outputs. FileMagic does not claim any ownership or license over
          your content. We do not access, review, or use your files for any
          purpose other than performing the requested conversion.
        </P>
        <P>
          The FileMagic name, logo, and website design are the property of
          the Service operator. You may not use them without prior written
          consent.
        </P>
      </Section>

      <Section title="11. No reliance on output">
        <P>
          The Service provides automated file conversions on a best-effort
          basis. Conversion results, including but not limited to OCR text
          extraction and metadata removal, may be inaccurate, incomplete,
          or unsuitable for any particular purpose.
        </P>
        <P>
          You must not rely on conversion output for legal, medical,
          financial, regulatory, or any other critical purpose without
          independent verification. Metadata removal is performed on a
          best-effort basis and we do not guarantee that all metadata has
          been removed from a file.
        </P>
      </Section>

      <Section title="12. Disclaimer of warranties">
        <P>
          The Service is provided "as is" and "as available" without
          warranties of any kind, whether express, implied, or statutory,
          including but not limited to implied warranties of merchantability,
          fitness for a particular purpose, and non-infringement.
        </P>
        <P>
          We do not warrant that the Service will be uninterrupted,
          error-free, or secure, or that conversion results will be accurate,
          complete, or suitable for any particular purpose. You use the
          Service at your own risk.
        </P>
        <P>
          Nothing in these Terms excludes or limits any statutory consumer
          guarantees that cannot be excluded under applicable law, including
          the legal guarantee of conformity for digital content under
          Articles L 224-25-12 et seq. of the French Consumer Code.
        </P>
      </Section>

      <Section title="13. Limitation of liability">
        <P>
          To the maximum extent permitted by applicable law, the Service
          operator shall not be liable for any direct, indirect, incidental,
          special, consequential, or punitive damages, including but not
          limited to loss of data, loss of profits, business interruption,
          or any other damages arising out of or related to your use of or
          inability to use the Service, even if we have been advised of the
          possibility of such damages.
        </P>
        <P>
          The Service is provided free of charge. In any event, our
          aggregate liability to you for all claims arising out of or
          related to the Service shall not exceed the total amount you have
          paid to use the Service (i.e. zero).
        </P>
        <P>
          In particular, we accept no liability for:
        </P>
        <Ul>
          <Li>
            Loss or corruption of files during processing or transmission.
          </Li>
          <Li>
            Inaccurate, incomplete, or unusable conversion results,
            including OCR text extraction errors.
          </Li>
          <Li>
            Incomplete metadata removal from processed files.
          </Li>
          <Li>
            Temporary or permanent unavailability of the Service.
          </Li>
          <Li>
            Any consequences resulting from unauthorized access to files
            during the brief period they reside in memory.
          </Li>
          <Li>
            Failures, outages, or performance issues caused by third-party
            infrastructure providers (including CDN, network, and hosting
            providers).
          </Li>
          <Li>
            Any decision or action taken by you in reliance on conversion
            output.
          </Li>
        </Ul>
      </Section>

      <Section title="14. Indemnification">
        <P>
          You agree to indemnify, defend, and hold harmless the Service
          operator from and against any claims, liabilities, damages, losses,
          and expenses (including reasonable legal fees) arising out of or
          in any way connected with your use of the Service, your violation
          of these Terms, or your violation of any third-party rights.
        </P>
      </Section>

      <Section title="15. Force majeure">
        <P>
          The Service operator shall not be held liable for any failure or
          delay in performing its obligations where such failure or delay
          results from circumstances beyond its reasonable control,
          including but not limited to natural disasters, wars, terrorism,
          cyberattacks, distributed denial-of-service attacks, power
          outages, internet or telecommunications failures, government
          actions, pandemics, or failures of third-party service providers.
        </P>
      </Section>

      <Section title="16. Modification and termination">
        <P>
          We reserve the right to modify, suspend, or discontinue the
          Service, in whole or in part, at any time and without prior notice.
        </P>
        <P>
          We may update these Terms at any time. Users will be informed at
          least 30 days before the changes take effect. Continued use of the
          Service after the effective date constitutes acceptance of the
          revised Terms. If you do not agree with the changes, you must stop
          using the Service before the effective date.
        </P>
        <P>
          We reserve the right to block access to any user (by IP address or
          otherwise) who violates these Terms or who we reasonably believe is
          misusing the Service.
        </P>
      </Section>

      <Section title="17. Consumer mediation">
        <P>
          In accordance with Articles L 612-1 et seq. of the French Consumer
          Code, in the event of an unresolved dispute, consumers may refer
          the matter free of charge to the following mediator:
        </P>
        <P>
          Médiateur du e-commerce — Association des Médiateurs de Bretagne
          Ouest (AMBO) — 06 71 90 24 25 — mediation@ambo.bzh
        </P>
      </Section>

      <Section title="18. Severability">
        <P>
          If any provision of these Terms is found to be invalid or
          unenforceable by a court of competent jurisdiction, the remaining
          provisions shall continue in full force and effect.
        </P>
      </Section>

      <Section title="19. Governing law and jurisdiction">
        <P>
          These Terms are governed by and construed in accordance with the
          laws of France. Any dispute arising out of or in connection with
          these Terms or the use of the Service shall be subject to the
          exclusive jurisdiction of the competent courts of France.
        </P>
        <P>
          This clause does not apply to consumers within the European Union,
          who retain the right to bring proceedings in the courts of their
          domicile in accordance with Regulation (EU) No 1215/2012.
        </P>
      </Section>

      <Section title="20. Contact">
        <P>
          For any question regarding these Terms, contact us at{' '}
          <ProtectedEmail />.
        </P>
      </Section>
    </>
  );
}

// Français

function ContentFr() {
  return (
    <>
      <Section title="1. Acceptation des conditions">
        <P>
          En accédant ou en utilisant FileMagic (« le Service »), vous
          acceptez d'être lié par les présentes Conditions Générales
          d'Utilisation. Si vous n'acceptez pas, n'utilisez pas le Service.
        </P>
      </Section>

      <Section title="2. Description du service">
        <P>
          FileMagic est un service gratuit de traitement de fichiers en ligne.
          Les fonctionnalités côté serveur comprennent la conversion de formats
          d'images, audio, vidéo, polices et ebooks, les opérations PDF
          (compression, fusion, protection par mot de passe, réparation,
          extraction d'images, édition), la compression et le redimensionnement
          d'images, la reconnaissance optique de caractères (OCR), la
          suppression de métadonnées, la rastérisation SVG, la conversion
          markdown vers PDF, la conversion de certificats, et la création et
          décompression d'archives. Les outils côté client — tels que le
          générateur de mots de passe, le convertisseur CSV/Excel, le
          générateur de hash et le convertisseur YAML/JSON — s'exécutent
          entièrement dans votre navigateur et n'envoient aucune donnée à nos
          serveurs. Les fichiers traités côté serveur sont manipulés en mémoire
          vive (RAM) uniquement et ne sont jamais stockés sur un support
          persistant.
        </P>
      </Section>

      <Section title="3. Pas de compte requis">
        <P>
          Le Service ne nécessite ni inscription ni création de compte
          utilisateur. Aucune information personnelle n'est requise pour
          utiliser le Service.
        </P>
      </Section>

      <Section title="4. Politique de confidentialité">
        <P>
          Votre utilisation du Service est également régie par notre{' '}
          <Typography component="a" href="/privacy" level="body-md" sx={linkSx}>
            Politique de confidentialité
          </Typography>
          , qui décrit comment nous traitons (ou plutôt évitons de traiter)
          les données personnelles. En utilisant le Service, vous reconnaissez
          avoir lu et compris la Politique de confidentialité.
        </P>
      </Section>

      <Section title="5. Gratuité et droit de rétractation">
        <P>
          Le Service est fourni à titre entièrement gratuit, sans inscription,
          abonnement ni aucune forme de paiement. Aucun contrat à distance au
          sens des articles L 221-1 et suivants du Code de la consommation
          n'est conclu par votre utilisation du Service. En conséquence, le
          droit de rétractation prévu aux articles L 221-18 et suivants ne
          trouve pas à s'appliquer.
        </P>
      </Section>

      <Section title="6. Âge minimum">
        <P>
          Le Service est destiné aux utilisateurs âgés de 16 ans ou plus. Si
          vous avez moins de 16 ans, vous ne pouvez utiliser le Service
          qu'avec le consentement et sous la supervision d'un parent ou d'un
          représentant légal. Nous ne collectons pas sciemment de données
          personnelles de mineurs — pour plus de détails, consultez la{' '}
          <Typography component="a" href="/privacy" level="body-md" sx={linkSx}>
            Politique de confidentialité
          </Typography>
          .
        </P>
      </Section>

      <Section title="7. Utilisation acceptable">
        <P>Vous vous engagez à ne pas utiliser le Service pour :</P>
        <Ul>
          <Li>
            Téléverser, traiter ou diffuser du contenu illégal, nuisible,
            menaçant, abusif, diffamatoire ou autrement répréhensible au
            regard du droit applicable.
          </Li>
          <Li>
            Téléverser des logiciels malveillants, virus ou tout code
            malveillant.
          </Li>
          <Li>
            Traiter des fichiers portant atteinte aux droits de propriété
            intellectuelle, aux secrets commerciaux ou aux droits de
            propriété de tiers.
          </Li>
          <Li>
            Tenter de contourner les limites de débit, les mesures de
            sécurité ou les contrôles d'accès.
          </Li>
          <Li>
            Utiliser le Service de manière automatisée imposant une charge
            déraisonnable à notre infrastructure (scraping, traitement en
            masse, etc.).
          </Li>
          <Li>
            Procéder à de l'ingénierie inverse, décompiler ou tenter
            d'extraire le code source du Service.
          </Li>
        </Ul>
      </Section>

      <Section title="8. Vos responsabilités">
        <P>
          Vous êtes seul responsable des fichiers que vous téléversez et de
          vous assurer que vous disposez du droit légal de les traiter. Vous
          déclarez et garantissez que votre utilisation du Service est
          conforme à l'ensemble des lois et réglementations applicables.
        </P>
        <P>
          Vous devez conserver une copie de tout fichier que vous téléversez.
          Le Service n'est pas une solution de stockage ou de sauvegarde.
          Nous ne sommes pas responsables de toute perte de données résultant
          de votre défaut de conservation de copies de vos fichiers.
        </P>
        <P>
          Nous recommandons fortement de ne pas téléverser de fichiers
          contenant des données personnelles sensibles (dossiers médicaux,
          documents financiers, documents d'identité), des secrets
          commerciaux ou des informations classifiées. Bien que notre
          architecture soit conçue pour minimiser l'exposition des données,
          aucun système ne peut garantir une sécurité absolue.
        </P>
      </Section>

      <Section title="9. Limitations du service">
        <Ul>
          <Li>La taille maximale de fichier varie selon l'outil (jusqu'à 350 Mo), comme indiqué sur chaque page.</Li>
          <Li>
            Les fichiers sont disponibles pour un seul téléchargement et
            sont automatiquement supprimés après 10 minutes.
          </Li>
          <Li>
            Des limites de débit s'appliquent par adresse IP pour garantir
            une utilisation équitable.
          </Li>
          <Li>
            La file d'attente de traitement a une capacité limitée. Votre
            demande peut être rejetée si la file est pleine.
          </Li>
        </Ul>
      </Section>

      <Section title="10. Propriété intellectuelle">
        <P>
          Vous conservez tous les droits sur les fichiers que vous
          téléversez et les résultats convertis. FileMagic ne revendique
          aucun droit de propriété ni licence sur votre contenu. Nous
          n'accédons pas, n'examinons pas et n'utilisons pas vos fichiers à
          d'autres fins que l'exécution de la conversion demandée.
        </P>
        <P>
          Le nom FileMagic, le logo et le design du site sont la propriété
          de l'opérateur du Service. Vous ne pouvez pas les utiliser sans
          consentement écrit préalable.
        </P>
      </Section>

      <Section title="11. Absence de garantie sur les résultats">
        <P>
          Le Service fournit des conversions de fichiers automatisées sur la
          base du meilleur effort. Les résultats de conversion, y compris
          notamment l'extraction de texte par OCR et la suppression de
          métadonnées, peuvent être inexacts, incomplets ou inadaptés à un
          usage particulier.
        </P>
        <P>
          Vous ne devez pas vous fier aux résultats de conversion à des fins
          juridiques, médicales, financières, réglementaires ou toute autre
          fin critique sans vérification indépendante. La suppression des
          métadonnées est réalisée sur la base du meilleur effort et nous ne
          garantissons pas que toutes les métadonnées ont été supprimées d'un
          fichier.
        </P>
      </Section>

      <Section title="12. Exclusion de garanties">
        <P>
          Le Service est fourni « en l'état » et « selon disponibilité »
          sans garantie d'aucune sorte, qu'elle soit expresse, implicite ou
          légale, y compris mais sans s'y limiter les garanties implicites
          de qualité marchande, d'adéquation à un usage particulier et
          d'absence de contrefaçon.
        </P>
        <P>
          Nous ne garantissons pas que le Service sera ininterrompu, exempt
          d'erreurs ou sécurisé, ni que les résultats de conversion seront
          exacts, complets ou adaptés à un usage particulier. Vous utilisez
          le Service à vos propres risques.
        </P>
        <P>
          Rien dans les présentes Conditions n'exclut ni ne limite les
          garanties légales auxquelles le consommateur a droit en vertu du
          droit applicable, notamment la garantie légale de conformité pour
          les contenus numériques prévue aux articles L 224-25-12 et
          suivants du Code de la consommation.
        </P>
      </Section>

      <Section title="13. Limitation de responsabilité">
        <P>
          Dans toute la mesure permise par le droit applicable, l'opérateur
          du Service ne saurait être tenu responsable de tout dommage direct,
          indirect, accessoire, spécial, consécutif ou punitif, y compris
          mais sans s'y limiter la perte de données, la perte de bénéfices,
          l'interruption d'activité, ou tout autre dommage résultant de ou
          lié à votre utilisation ou votre incapacité à utiliser le Service,
          même si nous avons été informés de la possibilité de tels
          dommages.
        </P>
        <P>
          Le Service est fourni gratuitement. En tout état de cause, notre
          responsabilité totale envers vous pour l'ensemble des réclamations
          liées au Service ne saurait excéder le montant total que vous avez
          payé pour utiliser le Service (soit zéro).
        </P>
        <P>
          En particulier, nous n'acceptons aucune responsabilité pour :
        </P>
        <Ul>
          <Li>
            La perte ou la corruption de fichiers pendant le traitement ou
            la transmission.
          </Li>
          <Li>
            Les résultats de conversion inexacts, incomplets ou
            inutilisables, y compris les erreurs d'extraction de texte OCR.
          </Li>
          <Li>
            La suppression incomplète des métadonnées des fichiers traités.
          </Li>
          <Li>
            L'indisponibilité temporaire ou permanente du Service.
          </Li>
          <Li>
            Toute conséquence résultant d'un accès non autorisé aux fichiers
            pendant la brève période où ils résident en mémoire.
          </Li>
          <Li>
            Les pannes, interruptions ou problèmes de performance causés par
            des fournisseurs d'infrastructure tiers (y compris CDN, réseau
            et hébergeurs).
          </Li>
          <Li>
            Toute décision ou action prise par vous en vous fiant aux
            résultats de conversion.
          </Li>
        </Ul>
      </Section>

      <Section title="14. Indemnisation">
        <P>
          Vous acceptez d'indemniser, de défendre et de dégager de toute
          responsabilité l'opérateur du Service contre toute réclamation,
          responsabilité, dommage, perte et dépense (y compris les frais
          juridiques raisonnables) découlant de ou liés de quelque manière
          que ce soit à votre utilisation du Service, à votre violation des
          présentes Conditions ou à votre violation des droits de tiers.
        </P>
      </Section>

      <Section title="15. Force majeure">
        <P>
          L'opérateur du Service ne saurait être tenu responsable de tout
          manquement ou retard dans l'exécution de ses obligations lorsque ce
          manquement ou retard résulte de circonstances échappant à son
          contrôle raisonnable, y compris mais sans s'y limiter les
          catastrophes naturelles, guerres, terrorisme, cyberattaques,
          attaques par déni de service distribué, pannes de courant, pannes
          d'internet ou de télécommunications, mesures gouvernementales,
          pandémies ou défaillances de fournisseurs de services tiers.
        </P>
      </Section>

      <Section title="16. Modification et résiliation">
        <P>
          Nous nous réservons le droit de modifier, suspendre ou interrompre
          le Service, en tout ou en partie, à tout moment et sans préavis.
        </P>
        <P>
          Nous pouvons mettre à jour les présentes Conditions à tout moment.
          Les utilisateurs seront informés au moins 30 jours avant l'entrée
          en vigueur des modifications. La poursuite de l'utilisation du
          Service après la date d'entrée en vigueur vaut acceptation des
          Conditions révisées. En cas de refus, vous devez cesser d'utiliser
          le Service avant la date d'effet.
        </P>
        <P>
          Nous nous réservons le droit de bloquer l'accès à tout utilisateur
          (par adresse IP ou autrement) qui enfreint les présentes Conditions
          ou dont nous estimons raisonnablement qu'il abuse du Service.
        </P>
      </Section>

      <Section title="17. Médiation">
        <P>
          Conformément aux articles L 612-1 et suivants du Code de la
          consommation, en cas de litige non résolu, le consommateur peut
          saisir gratuitement le médiateur suivant :
        </P>
        <P>
          Médiateur du e-commerce — Association des Médiateurs de Bretagne
          Ouest (AMBO) — 06 71 90 24 25 — mediation@ambo.bzh
        </P>
      </Section>

      <Section title="18. Divisibilité">
        <P>
          Si une disposition des présentes Conditions est jugée invalide ou
          inapplicable par un tribunal compétent, les dispositions restantes
          continueront de s'appliquer pleinement.
        </P>
      </Section>

      <Section title="19. Droit applicable et juridiction">
        <P>
          Les présentes Conditions sont régies par et interprétées
          conformément au droit français. Tout litige découlant de ou lié aux
          présentes Conditions ou à l'utilisation du Service relèvera de la
          compétence exclusive des tribunaux français compétents.
        </P>
        <P>
          Cette clause ne s'applique pas aux consommateurs au sein de l'Union
          européenne, qui conservent le droit de saisir les juridictions de
          leur domicile conformément au Règlement (UE) n° 1215/2012.
        </P>
      </Section>

      <Section title="20. Contact">
        <P>
          Pour toute question relative aux présentes Conditions,
          contactez-nous à l'adresse <ProtectedEmail />.
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
