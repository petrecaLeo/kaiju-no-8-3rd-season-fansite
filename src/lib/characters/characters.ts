import type { ImageMetadata } from 'astro';

import hoshina from '@/assets/images/characters/hoshina.webp';
import kafka from '@/assets/images/characters/kafka.webp';
import kaiju9 from '@/assets/images/characters/kaiju9.webp';
import kikoru from '@/assets/images/characters/kikoru.webp';
import mina from '@/assets/images/characters/mina.webp';
import narumi from '@/assets/images/characters/narumi.webp';
import reno from '@/assets/images/characters/reno.webp';
import { formatMessage } from '@/i18n/dictionary';
import { responsiveImage } from '@/lib/images/responsive-image';
import { toSuitNumber } from '@/lib/suits/suit-number';

import type {
  Character,
  CharacterId,
  CharacterLineup,
  CharactersContent,
  CharacterText,
} from './characters.types';

interface CharacterArt {
  id: CharacterId;
  photo: ImageMetadata;
  suitNumber?: number;
  unknown?: boolean;
}

// Roster order. The featured character starts in the spotlight; the others fill the carousel.
const CHARACTER_ART: readonly CharacterArt[] = [
  { id: 'kafka', photo: kafka },
  { id: 'mina', photo: mina },
  { id: 'hoshina', photo: hoshina, suitNumber: 10 },
  { id: 'kikoru', photo: kikoru, suitNumber: 4 },
  { id: 'reno', photo: reno, suitNumber: 6 },
  { id: 'narumi', photo: narumi, suitNumber: 1 },
  { id: 'kaiju9', photo: kaiju9, unknown: true },
];

export const FEATURED_CHARACTER: CharacterId = 'kafka';

// Keep in sync with CharacterSpotlight.css, CharacterRoster.css and the 56em landscape breakpoint
// in Characters.css. Wide screens cap the spotlight like the CSS does: 80% of the height left by
// the padding, 36rem, and half the layout (50vw stands in for 50cqi).
const SPOTLIGHT_SIZES =
  '(orientation: landscape) and (min-width: 56em) min(calc(80vh - 6.4rem), 36rem, 50vw), calc(100vw - 2rem)';
const CARD_SIZES =
  '(orientation: landscape) and (min-width: 56em) 10rem, (min-width: 32.5em) 13rem, 40vw';

const SPOTLIGHT_WIDTHS = [400, 600, 800, 1000, 1200, 1600];
const CARD_WIDTHS = [160, 240, 320, 400, 520];

function toCharacter(art: CharacterArt, content: CharactersContent): Character {
  const text: CharacterText = content.list[art.id];

  return {
    id: art.id,
    name: text.name,
    alias: text.alias,
    description: text.description,
    photoAlt: text.photoAlt,
    selectLabel: formatMessage(content.showCharacter, { name: text.name }),
    suit:
      art.suitNumber === undefined ? undefined : toSuitNumber(art.suitNumber, content.suitLabel),
    unknown: art.unknown ?? false,
    spotlightPhoto: responsiveImage(art.photo, SPOTLIGHT_WIDTHS, SPOTLIGHT_SIZES),
    cardPhoto: responsiveImage(art.photo, CARD_WIDTHS, CARD_SIZES),
  };
}

export function getCharacterLineup(content: CharactersContent): CharacterLineup {
  const characters = CHARACTER_ART.map((art) => toCharacter(art, content));
  const featured = characters.find(({ id }) => id === FEATURED_CHARACTER);
  if (!featured) throw new Error(`Unknown featured character: ${FEATURED_CHARACTER}`);

  return { featured, characters };
}
