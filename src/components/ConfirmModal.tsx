import Modal from "./primitives/Modal";

type Props = {
  title: string;
  message: string;
  confirmLabel?: string;
  /** "danger" (default) = red confirm button. "primary" = blue. */
  variant?: "danger" | "primary";
  onConfirm: () => void;
  onCancel: () => void;
};

/**
 * Generic "are you sure?" dialog. Replaces the assorted `window.confirm()` calls
 * with something that matches the rest of the UI's styling.
 */
export default function ConfirmModal({
  title,
  message,
  confirmLabel = "Confirm",
  variant = "danger",
  onConfirm,
  onCancel,
}: Props) {
  const confirmClass = variant === "danger" ? "bg-red-600" : "bg-blue-600";

  return (
    <Modal onClose={onCancel} variant="snug">
      <h2 className="mb-2 text-xl font-bold">{title}</h2>
      <p className="mb-6 text-zinc-400">{message}</p>

      <button
        onClick={onConfirm}
        className={`mb-3 w-full rounded-xl py-4 font-semibold ${confirmClass}`}
      >
        {confirmLabel}
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
