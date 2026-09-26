import secondSeasonArt from '@/assets/images/2ndSeason/background.webp';
import { formatMessage } from '@/i18n/dictionary';
import { type ResponsiveImage, responsiveImage } from '@/lib/images/responsive-image';
import { formatDesignation } from '@/lib/suits/designation';
import { toSuitNumber } from '@/lib/suits/suit-number';

import type {
  FrontId,
  NumbersEntry,
  NumbersId,
  RecapContent,
  RecapFront,
  RecapStat,
  RecapWave,
} from './recap.types';

interface NumbersData {
  id: NumbersId;
  suit: number;
  captured?: boolean;
}

interface FrontData {
  id: FrontId;
  kaiju: number;
  suit?: number;
  power?: number;
}

// Only what the anime has shown up to the season 2 finale (episode 23).
const FORTITUDE = (9).toFixed(1);
const FIRST_WAVE_DISTANCE_KM = 20;

const NUMBERS_DATA: readonly NumbersData[] = [
  { id: 'narumi', suit: 1 },
  { id: 'isao', suit: 2, captured: true },
  { id: 'kikoru', suit: 4 },
  { id: 'reno', suit: 6 },
  { id: 'hoshina', suit: 10 },
];

// Shinonome's front comes last: her fight leads straight into the finale.
const FRONT_DATA: readonly FrontData[] = [
  { id: 'kikoru', kaiju: 15, suit: 4, power: 84 },
  { id: 'narumi', kaiju: 11, suit: 1 },
  { id: 'hoshina', kaiju: 12, suit: 10 },
  { id: 'mina', kaiju: 14 },
  { id: 'shinonome', kaiju: 13, power: 73 },
];

// Keep in sync with RecapCover.css.
const COVER_WIDTHS = [480, 720, 960, 1280, 1600, 2000];
const COVER_SIZES = '(min-width: 76rem) 72rem, calc(95vw - 1rem)';

export function getCoverImage(): ResponsiveImage {
  return responsiveImage(secondSeasonArt, COVER_WIDTHS, COVER_SIZES);
}

export function getNumbersRegistry(content: RecapContent['numbers']): NumbersEntry[] {
  return NUMBERS_DATA.map(({ id, suit, captured = false }) => ({
    id,
    suit: toSuitNumber(suit, content.suitLabel),
    holder: content.list[id].holder,
    text: content.list[id].text,
    captured,
  }));
}

export function getWaves(content: RecapContent['attack']): RecapWave[] {
  const { first, second } = content.waves;
  const distance = formatMessage(content.distance, { value: FIRST_WAVE_DISTANCE_KM });

  return [
    { id: 'first', ...first, stat: { label: first.statLabel, value: distance, tone: 'human' } },
    { id: 'second', ...second, stat: { label: second.statLabel, value: FORTITUDE, tone: 'kaiju' } },
  ];
}

function frontStats(data: FrontData, content: RecapContent['fronts']): RecapStat[] {
  const stats: RecapStat[] = [{ label: content.fortitude, value: FORTITUDE, tone: 'kaiju' }];
  if (data.power !== undefined) {
    const value = formatMessage(content.percent, { value: data.power });
    stats.push({ label: content.power, value, tone: 'aura', gauge: data.power });
  }
  stats.push({ label: content.statusLabel, value: content.status, tone: 'status' });
  return stats;
}

export function getFronts(content: RecapContent['fronts'], suitLabel: string): RecapFront[] {
  return FRONT_DATA.map((data) => {
    const text = content.list[data.id];
    return {
      id: data.id,
      fighter: text.fighter,
      kaiju: formatMessage(content.kaijuName, { number: data.kaiju }),
      kaijuNumber: formatDesignation(data.kaiju),
      text: text.text,
      suit: data.suit === undefined ? undefined : toSuitNumber(data.suit, suitLabel),
      stats: frontStats(data, content),
    };
  });
}
