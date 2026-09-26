import type { Locale } from '@/i18n/config';

import type {
  CodenameSentence,
  PremiseContent,
  Season,
  SeasonId,
  Stat,
  StatId,
  SynopsisContent,
} from './synopsis.types';

const CODENAME_PLACEHOLDER = '{codename}';

// Display order. The featured stat spans the full width; a rank is not worth rolling up to.
const STATS: readonly { id: StatId; rolls: boolean }[] = [
  { id: 'copies', rolls: true },
  { id: 'views', rolls: true },
  { id: 'comments', rolls: true },
  { id: 'chapters', rolls: true },
  { id: 'award', rolls: false },
];

const FEATURED_STAT: StatId = 'copies';

const SEASONS: readonly { id: SeasonId; upcoming: boolean }[] = [
  { id: 'first', upcoming: false },
  { id: 'second', upcoming: false },
  { id: 'third', upcoming: true },
];

export function splitCodenameSentence({ hunted, codename }: PremiseContent): CodenameSentence {
  const [before = '', after = ''] = hunted.split(CODENAME_PLACEHOLDER);
  return { before, codename, after };
}

export function getStats({ stats }: SynopsisContent, locale: Locale): Stat[] {
  const format = new Intl.NumberFormat(locale);

  return STATS.map(({ id, rolls }) => {
    const item = stats.items[id];
    return {
      id,
      ...item,
      formatted: format.format(item.value),
      rolls,
      featured: id === FEATURED_STAT,
    };
  });
}

export function getSeasons({ anime }: SynopsisContent): Season[] {
  return SEASONS.map(({ id, upcoming }) => ({ id, ...anime.seasons[id], upcoming }));
}
