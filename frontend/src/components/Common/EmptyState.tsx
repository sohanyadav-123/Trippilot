import React from 'react';
import { LucideIcon, SearchX } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = SearchX,
  title,
  description,
  actionText,
  actionLabel,
  onAction,
}) => {
  const btnText = actionText || actionLabel;

  return (
    <div className="surface-card flex flex-col items-center justify-center p-12 text-center my-6 rounded-3xl border border-slate-200 shadow-sm bg-white">
      <div className="w-16 h-16 rounded-3xl bg-blue-50 flex items-center justify-center mb-4 text-blue-600 border border-blue-200 shadow-xs">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-1">{title}</h3>
      <p className="text-slate-500 max-w-md mb-6 text-xs">{description}</p>
      {btnText && onAction && (
        <button onClick={onAction} className="btn-primary text-xs !py-2.5 px-5 font-bold shadow-sm">
          {btnText}
        </button>
      )}
    </div>
  );
};
