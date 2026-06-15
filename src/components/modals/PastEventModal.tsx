import { useState } from "react";
import Modal from "../primitives/Modal";
import TagPicker from "../primitives/TagPicker";
import { datetimeLocalNow } from "../../lib/date";

type Props = {
  onSave: (params: { timestamp: string; description: string; tags: string[] }) => void;
  onCancel: () => void;
};

export default function PastEventModal({ onSave, onCancel }: Props) {
  // Parent conditionally mounts this component, so each open is a fresh mount
  // and these initializers give us a fresh form every time.
  const [datetime, setDatetime] = useState(datetimeLocalNow);
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  function handleSave() {
    onSave({
      timestamp: new Date(datetime).toISOString(),
      description,
      tags,
    });
  }

  return (
    <Modal onClose={onCancel}>
      <h2 className="mb-2 text-xl font-semibold">Add Past Event</h2>
      <p className="mb-4 text-zinc-400">Record something that happened earlier.</p>

      <label className="mb-2 block text-sm text-zinc-500">Date & Time</label>
      <input
        type="datetime-local"
        value={datetime}
        onChange={(e) => setDatetime(e.target.value)}
        className="mb-5 w-full rounded-xl border border-zinc-700 bg-zinc-800 p-3"
      />

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
        className="mb-3 w-full rounded-xl bg-blue-600 py-4 font-semibold"
      >
        Save Event
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
