import { useState } from "react";
import type { Session } from "../db/database";
import { formatDuration, formatRelativeDate } from "../lib/date";
import {
  getSessionDate,
  isCompletedSession,
  sessionDurationMs,
} from "../lib/sessions";
import TagPicker from "./primitives/TagPicker";
import TagBadges from "./primitives/TagBadges";

type Props = {
  item: Session;
  onDelete: (id: number) => void;
  onUpdate: (id: number, description: string, tags: string[]) => Promise<void>;
};

/**
 * One entry in the Dashboard's Activity feed.
 *
 * Local state covers only the inline-edit mode (textarea + tag pills + save/cancel).
 * Saving delegates to the parent's `onUpdate` (which talks to Dexie) and then
 * closes the edit row.
 */
export default function ActivityTimelineItem({ item, onDelete, onUpdate }: Props) {
  const [editing, setEditing] = useState(false);
  const [editDescription, setEditDescription] = useState("");
  const [editTags, setEditTags] = useState<string[]>([]);

  function beginEdit() {
    setEditDescription(item.description ?? "");
    setEditTags(item.tags ?? []);
    setEditing(true);
  }

  async function saveEdit() {
    if (item.id == null) return;
    await onUpdate(item.id, editDescription, editTags);
    setEditing(false);
  }

  const dateString = getSessionDate(item);
  const isSession = item.type === "session";

  return (
    <div className="flex gap-4">
      <div className="mt-2 h-3 w-3 rounded-full bg-zinc-500" />

      <div className="flex-1 border-b border-zinc-800 pb-4">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <p className="font-medium">{isSession ? "Session" : "I did it !!"}</p>

            {dateString && (
              <p className="mt-1 text-sm text-zinc-400">
                {formatRelativeDate(dateString)}
              </p>
            )}

            {isCompletedSession(item) && (
              <p className="mt-2 text-sm text-blue-300">
                {formatDuration(sessionDurationMs(item))} session
              </p>
            )}

            {editing ? (
              <>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                  className="mt-3 w-full rounded-xl border border-zinc-700 bg-zinc-800 p-3"
                />

                <div className="mt-3">
                  <TagPicker value={editTags} onChange={setEditTags} size="sm" />
                </div>

                <div className="mt-3 flex gap-2">
                  <button
                    onClick={saveEdit}
                    className="rounded-xl bg-blue-600 px-4 py-2 text-sm"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="rounded-xl border border-zinc-700 px-4 py-2 text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </>
            ) : (
              <>
                {item.description && (
                  <div className="mt-3 rounded-xl bg-zinc-800 p-3 text-sm text-zinc-300">
                    {item.description}
                  </div>
                )}

                <TagBadges tags={item.tags ?? []} />

                <button
                  onClick={beginEdit}
                  className="mt-3 text-sm text-blue-400"
                >
                  Edit
                </button>
              </>
            )}
          </div>

          <button
            onClick={() => item.id != null && onDelete(item.id)}
            className="ml-3 text-zinc-500 hover:text-red-400"
            aria-label="Delete entry"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
