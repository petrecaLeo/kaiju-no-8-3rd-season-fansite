import type { Locale } from './config';
import en from './dictionaries/en.json';
import ja from './dictionaries/ja.json';
import ptBR from './dictionaries/pt-BR.json';

export type Dictionary = typeof ptBR;

export interface LocalizedText {
  locale: Locale;
  text: string;
}

const DICTIONARIES = { 'pt-BR': ptBR, en, ja } satisfies Record<Locale, Dictionary>;

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale];
}

export function formatMessage(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (placeholder, key: string) =>
    String(values[key] ?? placeholder),
  );
}
