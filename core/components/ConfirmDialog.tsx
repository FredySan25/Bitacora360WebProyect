"use client";

import { useEffect, useId, useRef, useState } from "react";
import { dangerButtonClassName, outlineButtonClassName } from "./buttonStyles";

type ConfirmDialogProps = {
  title: string;
  message: string;
  confirmLabel: string;
  /** Resolves once the action finished; the parent is expected to unmount the dialog then. */
  onConfirm: () => Promise<unknown> | void;
  onCancel: () => void;
};

/**
 * Modal that asks before a destructive action. Render it only while the
 * question is open: it shows itself on mount. Escape and "Cancelar" cancel.
 */
export function ConfirmDialog({
  title,
  message,
  confirmLabel,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const titleId = useId();
  const messageId = useId();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [working, setWorking] = useState(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
    return () => dialog?.close();
  }, []);

  async function handleConfirm() {
    setWorking(true);
    try {
      await onConfirm();
    } finally {
      setWorking(false);
    }
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={messageId}
      // Escape fires "cancel"; the parent owns the open state, so it closes by unmounting
      onCancel={(e) => {
        e.preventDefault();
        if (!working) onCancel();
      }}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-sheet border-[1.5px] border-ink bg-paper-elevated p-6 text-ink backdrop:bg-ink/55"
    >
      <h2 id={titleId} className="font-display text-[1.75rem] leading-tight font-bold text-ink">
        {title}
      </h2>
      <p id={messageId} className="mt-3 text-[0.9375rem] text-ink">
        {message}
      </p>
      <div className="mt-6 flex flex-wrap justify-end gap-2">
        <button
          type="button"
          autoFocus
          onClick={onCancel}
          disabled={working}
          className={outlineButtonClassName}
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={working}
          aria-busy={working}
          className={dangerButtonClassName}
        >
          {confirmLabel}
        </button>
      </div>
    </dialog>
  );
}
