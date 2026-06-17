import { useRef, type TouchEvent } from "react";

type Options = {
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  /** Minimum horizontal travel (px) to count as a swipe. */
  threshold?: number;
};

type SwipeHandlers = {
  onTouchStart: (e: TouchEvent) => void;
  onTouchEnd: (e: TouchEvent) => void;
};

/**
 * Horizontal touch-swipe detection. Fires left/right only when the gesture is
 * horizontal-dominant and travels past `threshold`, so vertical scrolls and taps
 * (buttons, selects) are never hijacked. Does not call preventDefault — native
 * scrolling and tapping stay intact.
 */
export function useSwipe({
  onSwipeLeft,
  onSwipeRight,
  threshold = 50,
}: Options): SwipeHandlers {
  const start = useRef<{ x: number; y: number } | null>(null);

  return {
    onTouchStart: (e: TouchEvent) => {
      const t = e.touches[0];
      start.current = { x: t.clientX, y: t.clientY };
    },
    onTouchEnd: (e: TouchEvent) => {
      if (!start.current) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - start.current.x;
      const dy = t.clientY - start.current.y;
      start.current = null;

      if (Math.abs(dx) <= Math.abs(dy) || Math.abs(dx) < threshold) return;
      if (dx < 0) onSwipeLeft();
      else onSwipeRight();
    },
  };
}
