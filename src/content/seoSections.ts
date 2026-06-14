import { canonicalPath, type Locale } from './site';
import { categoryLabel, isBrowserOnlyRoute, routes, type RouteEntry } from './routes';

export interface StaticSeoSection {
  howTo: {
    title: string;
    steps: string[];
  };
  features: Array<{
    title: string;
    description: string;
  }>;
  faq: Array<{
    question: string;
    answer: string;
  }>;
  relatedTools: Array<{
    label: string;
    href: string;
  }>;
}

const toolCategories = new Set(['Image', 'PDF', 'Audio / Video', 'Security', 'Utilities']);

function relatedRoutes(route: RouteEntry) {
  const sameCategory = routes
    .filter((item) => item.category === route.category && item.key !== route.key)
    .sort((a, b) => b.priority - a.priority);

  if (sameCategory.length >= 3) return sameCategory.slice(0, 5);

  return [
    ...sameCategory,
    ...routes
      .filter((item) => toolCategories.has(item.category) && item.key !== route.key && item.category !== route.category)
      .sort((a, b) => b.priority - a.priority),
  ].slice(0, 5);
}

function howToSteps(route: RouteEntry, locale: Locale) {
  const browserOnly = isBrowserOnlyRoute(route);
  const copy = route.copy[locale];

  if (locale === 'fr') {
    return browserOnly
      ? [
          `Ouvrez ${copy.title} et ajoutez le texte ou le fichier à traiter.`,
          'Ajustez les options utiles avant de lancer le calcul ou la conversion.',
          'Le traitement s’exécute dans votre navigateur, sans envoi vers FileMagic.',
          'Copiez ou téléchargez le résultat, puis fermez la page quand vous avez terminé.',
        ]
      : [
          `Ajoutez votre fichier dans ${copy.title} depuis la zone de dépôt ou le sélecteur.`,
          'Vérifiez les options de conversion, compression ou extraction disponibles.',
          'Lancez le traitement; le fichier est traité de façon transitoire pour cette opération.',
          'Téléchargez le résultat, puis revenez aux outils connexes si vous avez une autre étape.',
        ];
  }

  return browserOnly
    ? [
        `Open ${copy.title} and add the text or file you want to process.`,
        'Review the available options before running the calculation or conversion.',
        'Processing runs in your browser, without uploading the input to FileMagic.',
        'Copy or download the result, then close the page when you are done.',
      ]
    : [
        `Add your file to ${copy.title} from the drop zone or file picker.`,
        'Review the conversion, compression, or extraction options available for this tool.',
        'Start processing; the file is handled transiently for this operation.',
        'Download the result, then move to a related tool if your workflow has another step.',
      ];
}

function featureCopy(route: RouteEntry, locale: Locale) {
  const browserOnly = isBrowserOnlyRoute(route);
  const category = categoryLabel(route.category, locale);

  if (locale === 'fr') {
    return [
      {
        title: browserOnly ? 'Traitement local' : 'Traitement transitoire',
        description: browserOnly
          ? 'Les calculs s’exécutent côté navigateur lorsque l’outil le permet.'
          : 'Les fichiers sont traités uniquement pour produire le résultat demandé.',
      },
      {
        title: 'Sans compte',
        description: 'Aucune inscription n’est nécessaire pour utiliser les outils FileMagic.',
      },
      {
        title: `Flux ${category}`,
        description: `La page est reliée aux autres outils ${category} pour enchaîner les tâches sans repartir de zéro.`,
      },
    ];
  }

  return [
    {
      title: browserOnly ? 'Local processing' : 'Transient processing',
      description: browserOnly
        ? 'Work runs in the browser when the tool can complete the task locally.'
        : 'Files are processed only to produce the result requested for this job.',
    },
    {
      title: 'No account required',
      description: 'FileMagic tools are available without signup or a user workspace.',
    },
    {
      title: `${category} workflow`,
      description: `This page links to related ${category} tools so you can continue the task without hunting through the app.`,
    },
  ];
}

function faqCopy(route: RouteEntry, locale: Locale) {
  const browserOnly = isBrowserOnlyRoute(route);
  const copy = route.copy[locale];

  if (locale === 'fr') {
    return [
      {
        question: `${copy.title} est-il gratuit ?`,
        answer: 'Oui. L’outil est gratuit et ne demande pas de compte.',
      },
      {
        question: 'Mes fichiers sont-ils envoyés ?',
        answer: browserOnly
          ? 'Non. Pour cet outil, le traitement se fait dans votre navigateur.'
          : 'Les fichiers nécessaires au traitement sont envoyés uniquement pour cette opération et ne servent pas à créer un espace utilisateur.',
      },
      {
        question: 'Puis-je utiliser FileMagic sur mobile ?',
        answer: 'Oui, l’interface fonctionne dans les navigateurs modernes sur ordinateur, tablette et mobile.',
      },
    ];
  }

  return [
    {
      question: `Is ${copy.title} free?`,
      answer: 'Yes. The tool is free to use and does not require an account.',
    },
    {
      question: 'Are my files uploaded?',
      answer: browserOnly
        ? 'No. For this tool, processing happens in your browser.'
        : 'Files needed for processing are sent only for this operation and are not used to create a user workspace.',
    },
    {
      question: 'Can I use FileMagic on mobile?',
      answer: 'Yes. The interface works in modern browsers on desktop, tablet, and mobile devices.',
    },
  ];
}

export function staticSeoSection(route: RouteEntry, locale: Locale): StaticSeoSection | null {
  if (!toolCategories.has(route.category)) return null;

  const copy = route.copy[locale];

  return {
    howTo: {
      title: locale === 'fr' ? `Comment utiliser ${copy.title}` : `How to use ${copy.title}`,
      steps: howToSteps(route, locale),
    },
    features: featureCopy(route, locale),
    faq: faqCopy(route, locale),
    relatedTools: relatedRoutes(route).map((item) => ({
      label: item.copy[locale].navLabel,
      href: canonicalPath(item.path, locale),
    })),
  };
}
