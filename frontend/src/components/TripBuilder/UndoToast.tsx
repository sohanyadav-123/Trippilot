import React, { useEffect } from 'react';
import { Undo2, X, CheckCircle2 } from 'lucide-react';

interface UndoToastProps {
  message: string | null;
  onUndo: () => void;
  onDismiss: () => void;
  durationMs?: number;
}

export const UndoToast: React.FC<UndoToastProps> = ({
  message,
  onUndo,
  onDismiss,
  durationMs = 6000,
}) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, durationMs);
    return () => clearTimeout(timer);
  }, [message, onDismiss, durationMs]);

  if (!message) return null;

  return (
    <div className="fixed bottom-20 sm:bottom-6 left-1/2 transform -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-5 duration-200">
      <div className="bg-[#0B1220] text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3.5 max-w-md">
        <div className="w-2 h-2 rounded-full bg-[#C8A96B] animate-pulse flex-shrink-0" />
        <span className="text-xs font-medium text-slate-200 truncate">{message}</span>

        <div className="flex items-center gap-2 flex-shrink-0 ml-auto">
          <button
            type="button"
            onClick={() => {
              onUndo();
              onDismiss();
            }}
            className="px-3 py-1 rounded-xl bg-[#C8A96B] hover:bg-[#b89858] text-[#0B1220] text-xs font-bold transition-colors flex items-center gap-1 shadow-xs"
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span>Undo</span>
          </button>

          <button
            type="button"
            onClick={onDismiss}
            aria-label="Dismiss notification"
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
