import { useState } from "react";
import Modal from "../primitives/Modal";

type Props = {
  onSave: (pin: string) => void;
  onCancel: () => void;
};

const MIN_LEN = 4;
const MAX_LEN = 6;

export default function PinSetupModal({ onSave, onCancel }: Props) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSave() {
    const trimmed = pin.trim();
    if (trimmed.length < MIN_LEN || trimmed.length > MAX_LEN) {
      setError(`PIN must be ${MIN_LEN}-${MAX_LEN} digits.`);
      return;
    }
    if (!/^\d+$/.test(trimmed)) {
      setError("PIN must contain digits only.");
      return;
    }
    onSave(trimmed);
  }

  return (
    <Modal onClose={onCancel} variant="snug">
      <h2 className="mb-2 text-xl font-semibold">Set PIN</h2>
      <p className="mb-4 text-zinc-400">Choose a {MIN_LEN}–{MAX_LEN} digit PIN.</p>

      <input
        type="password"
        inputMode="numeric"
        maxLength={MAX_LEN}
        value={pin}
        onChange={(e) => {
          setPin(e.target.value);
          if (error) setError(null);
        }}
        className="mb-3 w-full rounded-xl border border-zinc-700 bg-zinc-800 p-4 outline-none"
        autoFocus
      />

      {error && <p className="mb-3 text-sm text-red-400">{error}</p>}

      <button
        onClick={handleSave}
        className="mb-3 w-full rounded-xl bg-blue-600 py-4 font-semibold"
      >
        Save PIN
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
