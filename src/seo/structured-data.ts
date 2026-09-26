import { LOCALES, type Locale } from '@/i18n/config';
import { type Dictionary, getDictionary } from '@/i18n/dictionary';

const SCHEMA_CONTEXT = 'https://schema.org';
const PRODUCTION_COMPANY = 'Production I.G';

interface StructuredDataInput {
  locale: Locale;
  meta: Dictionary['meta'];
  canonicalUrl: string;
}

// The page describes a fan site: the WebSite is *about* the series, and nothing here names the
// rights holders as publisher or links to official properties.
function buildWebSite({ locale, meta, canonicalUrl }: StructuredDataInput) {
  const otherSeriesNames = LOCALES.map((other) => getDictionary(other).meta.siteName).filter(
    (name, index, names) => name !== meta.siteName && names.indexOf(name) === index,
  );

  return {
    '@context': SCHEMA_CONTEXT,
    '@type': 'WebSite',
    name: meta.fanSiteName,
    description: meta.description,
    url: canonicalUrl,
    inLanguage: locale,
    about: {
      '@type': 'TVSeries',
      name: meta.siteName,
      alternateName: otherSeriesNames,
      creator: { '@type': 'Person', name: meta.seriesCreator },
      productionCompany: { '@type': 'Organization', name: PRODUCTION_COMPANY },
    },
  };
}

// JSON.stringify leaves "<" alone, so "</script>" inside a value would close the tag early.
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replaceAll('<', String.raw`<`);
}

export function buildStructuredData(input: StructuredDataInput): string {
  return serializeJsonLd(buildWebSite(input));
}
