import type { Dictionary } from '@/i18n/dictionary';

export type SynopsisContent = Dictionary['sections']['synopsis'];
export type PremiseContent = SynopsisContent['premise'];
export type OriginContent = SynopsisContent['origin'];
export type StatId = keyof SynopsisContent['stats']['items'];
export type SeasonId = keyof SynopsisContent['anime']['seasons'];

// The sentence that ends the premise, split around the codename so it can be set apart.
export interface CodenameSentence {
  before: string;
  codename: string;
  after: string;
}

export interface Stat {
  id: StatId;
  value: number;
  prefix: string;
  suffix: string;
  label: string;
  spoken: string;
  formatted: string;
  rolls: boolean;
  featured: boolean;
}

export interface Season {
  id: SeasonId;
  name: string;
  when: string;
  upcoming: boolean;
}
