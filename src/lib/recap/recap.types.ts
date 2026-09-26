import type { Dictionary } from '@/i18n/dictionary';
import type { SuitNumber } from '@/lib/suits/suit-number';

export type RecapContent = Dictionary['sections']['recap'];

export type FrontId = keyof RecapContent['fronts']['list'];
export type NumbersId = keyof RecapContent['numbers']['list'];
export type WaveId = keyof RecapContent['attack']['waves'];

// Cyan for the Defense Force, red for the kaiju, the fighter's aura for their own power.
export type StatTone = 'human' | 'kaiju' | 'aura' | 'status';

export interface RecapStat {
  label: string;
  value: string;
  tone: StatTone;
  gauge?: number;
}

export interface NumbersEntry {
  id: NumbersId;
  suit: SuitNumber;
  holder: string;
  text: string;
  captured: boolean;
}

export interface RecapWave {
  id: WaveId;
  title: string;
  text: string;
  stat: RecapStat;
}

export interface RecapFront {
  id: FrontId;
  fighter: string;
  kaiju: string;
  kaijuNumber: string;
  text: string;
  suit: SuitNumber | undefined;
  stats: RecapStat[];
}
