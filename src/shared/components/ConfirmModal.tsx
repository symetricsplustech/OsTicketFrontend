import React, { useState } from 'react';
import { X } from 'lucide-react';

interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm?: () => void;
  variant?: 'info' | 'warning' | 'danger';
}

export default function ConfirmModal({ open, onClose, title, message, confirmLabel = 'OK', onConfirm, variant = 'info' }: ConfirmModalProps) {
  const [confirming, setConfirming] = useState(false);

  if (!open) return null;

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      await onConfirm?.();
    } finally {
      setConfirming(false);
      onClose();
    }
  };

  const borderColor = variant === 'danger' ? 'border-red-500' : variant === 'warning' ? 'border-yellow-500' : 'border-brand-500';
  const iconColor = variant === 'danger' ? 'text-red-500' : variant === 'warning' ? 'text-yellow-500' : 'text-brand-500';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className={`bg-white rounded-xl border-2 ${borderColor} p-6 max-w-md w-full mx-4 shadow-xl`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
        </div>
        <p className="text-sm text-gray-600 mb-5 whitespace-pre-line">{message}</p>
        <div className="flex justify-end">
          <button onClick={handleConfirm} disabled={confirming}
            className={`px-4 py-2 rounded-lg text-sm font-medium text-white ${variant === 'danger' ? 'bg-red-600 hover:bg-red-700' : variant === 'warning' ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-brand-600 hover:bg-brand-700'} disabled:opacity-50`}>
            {confirming ? '...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}