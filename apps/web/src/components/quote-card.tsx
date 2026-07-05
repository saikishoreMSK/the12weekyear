"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

import { quoteOfTheDay } from "@/features/quote/quote-of-the-day";
import { toIsoDate } from "@/lib/date";

const DISMISS_KEY = "twy.quoteDismissed";

/** A dismissible "quote of the day" card. Hidden for the rest of the day once dismissed. */
export function QuoteCard() {
  const [visible, setVisible] = useState(false);
  const today = toIsoDate(new Date());
  const quote = quoteOfTheDay();

  // Render only after mount (avoids SSR/hydration date mismatch) and only if not dismissed today.
  useEffect(() => {
    setVisible(localStorage.getItem(DISMISS_KEY) !== today);
  }, [today]);

  if (!visible) return null;

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, today);
    setVisible(false);
  }

  return (
    <div className="bg-card relative mb-6 rounded-lg border p-4">
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss quote"
        className="text-muted-foreground hover:text-foreground absolute right-3 top-3"
      >
        <X className="size-4" />
      </button>
      <p className="pr-6 text-sm italic leading-relaxed">&ldquo;{quote.text}&rdquo;</p>
      <p className="text-muted-foreground mt-1.5 text-xs">— {quote.author}</p>
    </div>
  );
}
