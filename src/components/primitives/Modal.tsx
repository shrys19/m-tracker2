import type { ReactNode } from "react";

type Props = {
  onClose: () => void;
  /** When true, the backdrop click does nothing. Use for "must answer" prompts. */
  disableBackdropClose?: boolean;
  /**
   * "center" (default) — fixed at vertical center, max-height with scroll.
   * "snug"             — fixed at vertical center, no max-height (for short modals).
   */
  variant?: "center" | "snug";
  children: ReactNode;
};

/**
 * Centered modal with a darkened backdrop. The parent decides whether the modal
 * exists at all (conditional render), so opening = mounting = fresh state.
 */
export default function Modal({
  onClose,
  disableBackdropClose,
  variant = "center",
  children,
}: Props) {
  const cardClass =
    variant === "center"
      ? "fixed left-4 right-4 top-1/2 z-50 max-h-[85vh] -translate-y-1/2 overflow-y-auto rounded-3xl border border-zinc-800 bg-zinc-900 p-6"
      : "fixed left-4 right-4 top-1/2 z-50 -translate-y-1/2 rounded-3xl border border-zinc-800 bg-zinc-900 p-6";

  return (
    <>
      <div
        className="fixed inset-0 bg-black/70"
        onClick={disableBackdropClose ? undefined : onClose}
      />
      <div className={cardClass}>{children}</div>
    </>
  );
}
