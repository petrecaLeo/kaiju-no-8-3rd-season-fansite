// The code stencilled on kaiju and on the Numbers suits: only the number, always two digits
// (8 → "08", 10 → "10"). Every badge and numeral goes through here; running text such as
// "Kaiju Nº8" or "Numbers 10" keeps the plain number.
export function formatDesignation(value: number): string {
  return String(value).padStart(2, '0');
}

// Kafka's kaiju number, stencilled on the synopsis reticle and the footer sign-off.
export const KAFKA_KAIJU_NUMBER = 8;
