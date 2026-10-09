"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ghostButtonClassName } from "./buttonStyles";

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
      className="m-auto w-[calc(100%-2rem)] max-w-sm rounded-2xl border border-border bg-paper-elevated p-5 text-ink shadow-card backdrop:bg-ink/40"
    >
      <h2 id={titleId} className="font-display text-lg font-semibold text-ink">
        {title}
      </h2>
      <p id={messageId} className="mt-2 text-sm text-ink-muted">
        {message}
      </p>
      <div className="mt-5 flex flex-wrap justify-end gap-2">
        <button
          type="button"
          autoFocus
          onClick={onCancel}
          disabled={working}
          className={ghostButtonClassName}
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={working}
          aria-busy={working}
          className="inline-flex items-center gap-1.5 rounded-lg bg-danger px-3 py-1.5 text-sm font-medium text-paper-elevated transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {confirmLabel}
        </button>
      </div>
    </dialog>
  );
}
