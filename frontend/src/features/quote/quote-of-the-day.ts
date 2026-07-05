import { quotes, type Quote } from "./quotes";

/**
 * The quote for a given day — deterministic, so every user sees the same one on the same local
 * calendar date, and it cycles through the whole list one per day. Rolls over at local midnight.
 */
export function quoteOfTheDay(now: Date = new Date()): Quote {
  // Day number based on the local calendar date (stable regardless of time/timezone within the day).
  const daysSinceEpoch = Math.floor(
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86_400_000,
  );
  const index = ((daysSinceEpoch % quotes.length) + quotes.length) % quotes.length;
  return quotes[index];
}
