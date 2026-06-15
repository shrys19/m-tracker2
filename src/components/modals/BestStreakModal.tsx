import Modal from "../primitives/Modal";

type Props = {
  dates: string[];
  onClose: () => void;
};

export default function BestStreakModal({ dates, onClose }: Props) {
  return (
    <Modal onClose={onClose}>
      <h2 className="mb-2 text-2xl font-bold">🏆 Best Streak</h2>
      <p className="mb-6 text-zinc-400">{dates.length} consecutive days</p>

      <div className="space-y-2">
        {dates.map((date) => (
          <div key={date} className="rounded-xl bg-zinc-800 p-3">
            ✓ {new Date(date).toLocaleDateString()}
          </div>
        ))}
      </div>

      <button
        onClick={onClose}
        className="mt-6 w-full rounded-xl bg-blue-600 py-4 font-semibold"
      >
        Close
      </button>
    </Modal>
  );
}
