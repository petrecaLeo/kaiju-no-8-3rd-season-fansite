import { formatMessage } from '@/i18n/dictionary';

export interface SuitNumber {
  value: number;
  label: string;
}

// The label names the suit for screen readers ("Numbers 4"); SuitNumber.astro draws the code.
export function toSuitNumber(value: number, labelTemplate: string): SuitNumber {
  return { value, label: formatMessage(labelTemplate, { number: value }) };
}
