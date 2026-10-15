"use client";

import React, { useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = "Konfirmasi",
  cancelLabel = "Batal",
  isDestructive = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onCancel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-md p-6 rounded-2xl border border-[var(--border-subtle)] bg-[var(--surface)] shadow-2xl text-[var(--text-primary)] animate-in zoom-in-95 duration-200">
        <button
          onClick={onCancel}
          aria-label="Tutup"
          className="absolute top-4 right-4 p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-elevated)] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4">
          <div
            className={`p-3 rounded-xl shrink-0 ${
              isDestructive
                ? "bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400"
                : "bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-400"
            }`}
          >
            <AlertTriangle className="w-6 h-6" />
          </div>

          <div className="flex-1 pr-6">
            <h3 id="confirm-dialog-title" className="text-base font-semibold">
              {title}
            </h3>
            <p className="mt-2 text-sm text-[var(--text-secondary)] leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-[var(--border-subtle)]">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-strong)] transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={`px-4 py-2 text-sm font-medium rounded-xl text-white shadow-xs transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isDestructive
                ? "bg-rose-600 hover:bg-rose-700 focus:ring-rose-500"
                : "bg-[var(--brand)] hover:bg-[var(--brand-hover)] focus:ring-[var(--brand)]"
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
