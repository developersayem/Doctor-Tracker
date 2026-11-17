'use client';

import React from 'react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = true,
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/30 overflow-hidden p-6 space-y-4">
        <div className="flex items-start gap-3.5">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              isDestructive
                ? 'bg-error-container/40 text-error'
                : 'bg-primary/20 text-primary'
            }`}
          >
            <span className="material-symbols-outlined text-[24px]">
              {isDestructive ? 'warning' : 'help'}
            </span>
          </div>
          <div>
            <h3 className="font-headline text-base font-bold text-on-surface">
              {title}
            </h3>
            <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-surface-container">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 rounded-lg border border-outline-variant/50 text-xs font-semibold text-on-surface hover:bg-surface-container transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 rounded-lg text-white text-xs font-semibold flex items-center gap-2 shadow-sm transition-all disabled:opacity-60 ${
              isDestructive
                ? 'bg-error hover:bg-error/90'
                : 'bg-primary hover:bg-primary-container'
            }`}
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : null}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
