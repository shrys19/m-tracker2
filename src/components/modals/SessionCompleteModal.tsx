import { useState } from "react";
import Modal from "../primitives/Modal";
import TagPicker from "../primitives/TagPicker";

type Props = {
  onSave: (description: string, tags: string[]) => void;
  onSkip: () => void;
};

export default function SessionCompleteModal({ onSave, onSkip }: Props) {
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  return (
    <Modal onClose={onSkip} disableBackdropClose>
      <h2 className="mb-2 text-xl font-semibold">Session Complete</h2>
      <p className="mb-4 text-zinc-400">Add notes and tags</p>

      <div className="mb-5">
        <p className="mb-2 text-sm text-zinc-500">Tags</p>
        <TagPicker value={tags} onChange={setTags} />
      </div>

      <textarea
        rows={4}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Notes, mood, trigger..."
        className="mb-4 w-full rounded-xl border border-zinc-700 bg-zinc-800 p-3 outline-none"
      />

      <button
        onClick={() => onSave(description, tags)}
        className="mb-3 w-full rounded-xl bg-blue-600 py-4 font-semibold"
      >
        Save
      </button>

      <button
        onClick={onSkip}
        className="w-full rounded-xl border border-zinc-700 py-4"
      >
        Skip
      </button>
    </Modal>
  );
}
