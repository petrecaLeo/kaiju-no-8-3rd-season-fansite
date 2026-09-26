import type { LocalImageProps } from 'astro:assets';

type DistributiveOmit<T, K extends PropertyKey> = T extends unknown ? Omit<T, K> : never;

export type CriticalImageProps = DistributiveOmit<
  LocalImageProps,
  'loading' | 'fetchpriority' | 'decoding'
>;
