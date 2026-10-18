import React from 'react';
import { ShieldAlert, X, Settings } from 'lucide-react';
import { useSystem } from '../../context/SystemContext';

interface SecurityErrorDialogProps {
  isOpen: boolean;
  title?: string;
  message: string;
  fileId?: string;
  onClose: () => void;
}

export const SecurityErrorDialog: React.FC<SecurityErrorDialogProps> = ({
  isOpen,
  title = 'Ошибка доступа к файлу или папке',
  message,
  fileId,
  onClose,
}) => {
  const { openPropertiesDialog } = useSystem();

  if (!isOpen) return null;

  const handleOpenProperties = () => {
    onClose();
    if (fileId) {
      openPropertiesDialog(fileId);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 win-acrylic select-none animate-in fade-in zoom-in-95 duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 shadow-2xl overflow-hidden text-zinc-900 dark:text-zinc-100 font-sans"
      >
        {/* Title bar */}
        <div className="h-9 px-4 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60">
          <div className="flex items-center gap-2 text-xs font-medium text-red-600 dark:text-red-400">
            <ShieldAlert size={15} />
            <span>{title}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200"
          >
            <X size={14} />
          </button>
        </div>

        {/* Dialog Body */}
        <div className="p-6 flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 flex items-center justify-center shrink-0 border border-red-200 dark:border-red-900">
            <ShieldAlert size={26} />
          </div>
          <div className="flex-1 space-y-2">
            <h3 className="font-semibold text-sm leading-snug">{title}</h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
              {message}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="h-14 px-6 bg-zinc-50 dark:bg-zinc-950/50 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-2.5">
          {fileId && (
            <button
              onClick={handleOpenProperties}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-xs font-medium transition-colors"
            >
              <Settings size={13} />
              <span>Параметры безопасности</span>
            </button>
          )}
          <button
            onClick={onClose}
            className="px-5 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-medium text-xs transition-colors shadow-xs"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
