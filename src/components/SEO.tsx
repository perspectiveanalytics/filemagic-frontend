const BASE_URL = 'https://filemagic.app';

interface SEOProps {
  title?: string;
  description?: string;
  path?: string;
  type?: 'website' | 'article';
  structuredData?: Record<string, unknown>;
}

export default function SEO(_props: SEOProps) {
  return null;
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
