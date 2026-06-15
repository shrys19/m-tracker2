import { useState } from "react";
import { hashPin } from "../utils/security";

type Props = {
  correctHash: string;
  onUnlock: () => void;
};

export default function PinLock({ correctHash, onUnlock }: Props) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  async function unlock() {
    const enteredHash = await hashPin(pin);
    if (enteredHash === correctHash) {
      onUnlock();
      return;
    }
    setError(true);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-6 text-zinc-100">
      <div className="w-full max-w-sm rounded-3xl bg-zinc-900 p-6">
        <h1 className="mb-2 text-3xl font-bold">M Tracker</h1>
        <p className="mb-6 text-zinc-400">Enter PIN</p>

        <input
          type="password"
          inputMode="numeric"
          maxLength={6}
          value={pin}
          onChange={(e) => {
            setPin(e.target.value);
            if (error) setError(false);
          }}
          className="mb-4 w-full rounded-xl border border-zinc-700 bg-zinc-800 p-4"
        />

        {error && <p className="mb-4 text-red-400">Incorrect PIN</p>}

        <button
          onClick={unlock}
          className="w-full rounded-xl bg-blue-600 py-4 font-semibold"
        >
          Unlock
        </button>
      </div>
    </div>
  );
}
