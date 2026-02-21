import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'FileMagic';
const BASE_URL = 'https://filemagic.app';
const DEFAULT_OG_IMAGE = `${BASE_URL}/og-image.png`;

interface SEOProps {
  title?: string;
  description?: string;
  path?: string;
  type?: 'website' | 'article';
  structuredData?: Record<string, unknown>;
}

export default function SEO({
  title,
  description = 'Free, private file conversion tools. No signup, no ads. Files never touch disk.',
  path = '/',
  type = 'website',
  structuredData,
}: SEOProps) {
  const fullTitle = title ? `${title} - ${SITE_NAME}` : `${SITE_NAME} - Free Private File Conversion`;
  const url = `${BASE_URL}${path}`;

  const breadcrumbsLd = path !== '/' && title ? {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: `${BASE_URL}/` },
      { '@type': 'ListItem', position: 2, name: title },
    ],
  } : null;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large" />
      <link rel="canonical" href={url} />

      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:image" content={DEFAULT_OG_IMAGE} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={fullTitle} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={DEFAULT_OG_IMAGE} />

      {breadcrumbsLd && (
        <script type="application/ld+json">{JSON.stringify(breadcrumbsLd)}</script>
      )}

      {structuredData && (
        <script type="application/ld+json">{JSON.stringify(structuredData)}</script>
      )}
    </Helmet>
  );
}

export function buildToolSchema(name: string, description: string, path: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: `FileMagic - ${name}`,
    url: `${BASE_URL}${path}`,
    applicationCategory: 'UtilitiesApplication',
    operatingSystem: 'Any',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    description,
  };
}
