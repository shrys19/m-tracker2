import type { ReactNode } from "react";

type Props = {
  onClose: () => void;
  children: ReactNode;
};

/**
 * Bottom-attached sheet with a darkened backdrop. Parent decides whether to
 * mount this — there is no `open` prop.
 */
export default function BottomSheet({ onClose, children }: Props) {
  return (
    <>
      <div className="fixed inset-0 bg-black/60" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 rounded-t-3xl border-t border-zinc-800 bg-zinc-900 p-6">
        {children}
      </div>
    </>
  );
}
