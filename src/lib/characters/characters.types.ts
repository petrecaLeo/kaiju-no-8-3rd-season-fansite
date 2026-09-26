import type { Dictionary } from '@/i18n/dictionary';
import type { ResponsiveImage } from '@/lib/images/responsive-image';
import type { SuitNumber } from '@/lib/suits/suit-number';

export type CharactersContent = Dictionary['sections']['characters'];

export type CharacterId = keyof CharactersContent['list'];

export interface CharacterText {
  name: string;
  alias?: string;
  description: string;
  photoAlt: string;
}

export interface Character {
  id: CharacterId;
  name: string;
  alias: string | undefined;
  description: string;
  photoAlt: string;
  selectLabel: string;
  suit: SuitNumber | undefined;
  unknown: boolean;
  spotlightPhoto: ResponsiveImage;
  cardPhoto: ResponsiveImage;
}

export interface CharacterLineup {
  featured: Character;
  characters: Character[];
}
