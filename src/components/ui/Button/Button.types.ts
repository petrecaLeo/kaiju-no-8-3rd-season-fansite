import type { HTMLAttributes } from 'astro/types';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonStyle {
  variant?: ButtonVariant;
  size?: ButtonSize;
  iconOnly?: boolean;
  // Opens the link in a new tab and appends this note (visually hidden) and an external-link icon.
  newTabLabel?: string | undefined;
}

// With href the button renders an <a>; without it, a <button type="button">.
export type ButtonProps =
  | (ButtonStyle & Omit<HTMLAttributes<'a'>, 'type'> & { href: string })
  | (ButtonStyle & HTMLAttributes<'button'> & { href?: undefined });
