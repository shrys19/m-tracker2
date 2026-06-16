import { useState } from "react";
import BottomSheet from "./primitives/BottomSheet";
import { STATUS_TAGS } from "../constants/tags";

type Props = {
  hasActiveSession: boolean;
  onLogEvent: (status: string) => void | Promise<void>;
  onAddPastEvent: () => void;
  onAddPastSession: () => void;
  onStartSession: () => void | Promise<void>;
};

/**
 * Bottom-right "+" button. Tapping it opens a bottom sheet of quick actions.
 * The "Start Session" option is hidden while a session is already active.
 */
export default function FloatingActionButton({
  hasActiveSession,
  onLogEvent,
  onAddPastEvent,
  onAddPastSession,
  onStartSession,
}: Props) {
  const [sheetOpen, setSheetOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setSheetOpen(true)}
        className="fixed bottom-32 right-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-4xl shadow-xl"
        aria-label="Quick actions"
      >
        +
      </button>

      {sheetOpen && (
        <BottomSheet onClose={() => setSheetOpen(false)}>
          <p className="mb-2 text-sm text-zinc-500">I did it — log as:</p>
          {STATUS_TAGS.map((status) => (
            <button
              key={status}
              onClick={async () => {
                await onLogEvent(status);
                setSheetOpen(false);
              }}
              className="mb-3 w-full rounded-xl bg-white py-4 font-semibold text-black"
            >
              {status}
            </button>
          ))}

          <button
            onClick={() => {
              setSheetOpen(false);
              onAddPastEvent();
            }}
            className="mb-3 w-full rounded-xl bg-zinc-800 py-4 font-semibold"
          >
            Add Past Event
          </button>

          <button
            onClick={() => {
              setSheetOpen(false);
              onAddPastSession();
            }}
            className="mb-3 w-full rounded-xl bg-zinc-800 py-4 font-semibold"
          >
            Add Past Session
          </button>

          {!hasActiveSession && (
            <button
              onClick={async () => {
                await onStartSession();
                setSheetOpen(false);
              }}
              className="mb-3 w-full rounded-xl bg-blue-600 py-4 font-semibold"
            >
              Start Session
            </button>
          )}

          <button
            onClick={() => setSheetOpen(false)}
            className="w-full rounded-xl border border-zinc-700 py-4"
          >
            Cancel
          </button>
        </BottomSheet>
      )}
    </>
  );
}
