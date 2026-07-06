import { useCallback, useEffect, useState } from "react";

/**
 * Countdown for the "resend code" button. Call `start(seconds)` after a code is sent; `seconds`
 * ticks down to 0 and `active` gates the button.
 */
export function useResendCooldown() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (seconds <= 0) return;
    const id = setTimeout(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    return () => clearTimeout(id);
  }, [seconds]);

  const start = useCallback((s: number) => setSeconds(s), []);

  return { seconds, active: seconds > 0, start };
}
