import { useClock } from "../hooks/useClock";
import { formatDuration } from "../lib/date";

type Props = {
  startTime: string; // ISO
  onEnd: () => void;
};

/**
 * The green "ACTIVE SESSION" card with a live-updating elapsed timer and the
 * red "End Session" button. Owns its own clock so callers don't have to.
 */
export default function ActiveSessionCard({ startTime, onEnd }: Props) {
  const now = useClock(1000);
  const elapsedMs = now - new Date(startTime).getTime();

  return (
    <div className="mb-6 rounded-3xl border border-green-700 bg-green-950 p-6">
      <p className="text-sm font-medium text-green-300">ACTIVE SESSION</p>

      <div className="mt-2 text-6xl font-bold tracking-tight">
        {formatDuration(elapsedMs)}
      </div>

      <button
        onClick={onEnd}
        className="mt-5 w-full rounded-2xl bg-red-600 py-4 font-semibold"
      >
        End Session
      </button>
    </div>
  );
}
