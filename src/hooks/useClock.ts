import { useEffect, useState } from "react";

/**
 * Returns the current epoch ms, refreshed on the given interval.
 * Use for live-updating timers (e.g. the active session duration).
 */
export function useClock(intervalMs: number = 1000): number {
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    const handle = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(handle);
  }, [intervalMs]);

  return now;
}
