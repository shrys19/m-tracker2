import { useState } from "react";
import Modal from "../primitives/Modal";
import TagPicker from "../primitives/TagPicker";
import StatusPicker from "../primitives/StatusPicker";
import { withStatus } from "../../constants/tags";
import { datetimeLocalNow } from "../../lib/date";

type Props = {
  onSave: (params: {
    start: string;
    end: string;
    description: string;
    tags: string[];
  }) => void;
  onCancel: () => void;
};

export default function PastSessionModal({ onSave, onCancel }: Props) {
  const [startAt, setStartAt] = useState(datetimeLocalNow);
  const [endAt, setEndAt] = useState(datetimeLocalNow);
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);

  function handleSave() {
    if (!status) return;
    const start = new Date(startAt);
    const end = new Date(endAt);
    if (end <= start) {
      alert("End time must be after start time.");
      return;
    }
    onSave({
      start: start.toISOString(),
      end: end.toISOString(),
      description,
      tags: withStatus(status, tags),
    });
  }

  return (
    <Modal onClose={onCancel}>
      <h2 className="mb-2 text-xl font-semibold">Add Past Session</h2>
      <p className="mb-4 text-zinc-400">Record a session from a previous date.</p>

      <label className="mb-2 block text-sm text-zinc-500">Start Time</label>
      <input
        type="datetime-local"
        value={startAt}
        onChange={(e) => setStartAt(e.target.value)}
        className="mb-4 w-full rounded-xl border border-zinc-700 bg-zinc-800 p-3"
      />

      <label className="mb-2 block text-sm text-zinc-500">End Time</label>
      <input
        type="datetime-local"
        value={endAt}
        onChange={(e) => setEndAt(e.target.value)}
        className="mb-5 w-full rounded-xl border border-zinc-700 bg-zinc-800 p-3"
      />

      <div className="mb-5">
        <p className="mb-2 text-sm text-zinc-500">Status (required)</p>
        <StatusPicker value={status} onChange={setStatus} />
      </div>

      <div className="mb-5">
        <p className="mb-2 text-sm text-zinc-500">Tags</p>
        <TagPicker value={tags} onChange={setTags} />
      </div>

      <textarea
        rows={4}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Notes, mood, trigger..."
        className="mb-4 w-full rounded-xl border border-zinc-700 bg-zinc-800 p-3"
      />

      <button
        onClick={handleSave}
        disabled={!status}
        className="mb-3 w-full rounded-xl bg-blue-600 py-4 font-semibold disabled:opacity-40"
      >
        Save Session
      </button>

      <button
        onClick={onCancel}
        className="w-full rounded-xl border border-zinc-700 py-4"
      >
        Cancel
      </button>
    </Modal>
  );
}
