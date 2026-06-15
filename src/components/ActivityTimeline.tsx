import type { Session } from "../db/database";
import ActivityTimelineItem from "./ActivityTimelineItem";

type Props = {
  sessions: Session[];
  onDelete: (id: number) => void;
  onUpdate: (id: number, description: string, tags: string[]) => Promise<void>;
};

/**
 * Vertically scrolling list of sessions and quick events, newest first.
 * Renders an empty-state message when no entries exist.
 */
export default function ActivityTimeline({ sessions, onDelete, onUpdate }: Props) {
  return (
    <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
      <h2 className="mb-6 text-xl font-semibold">Activity</h2>

      {sessions.length === 0 ? (
        <p className="text-zinc-500">No activity yet.</p>
      ) : (
        <div className="space-y-5">
          {sessions.map((item) => (
            <ActivityTimelineItem
              key={item.id}
              item={item}
              onDelete={onDelete}
              onUpdate={onUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
}
