import React from 'react';
import { Shield, ShieldCheck, AlertTriangle } from 'lucide-react';
import { ElevationLevel } from '../../types/system';
import { PRINCIPALS } from '../../utils/security';
import { playSound } from '../../utils/sound';

interface UacDialogProps {
  isOpen: boolean;
  appName: string;
  elevationLevel: ElevationLevel;
  onConfirm: () => void;
  onCancel: () => void;
}

export const UacDialog: React.FC<UacDialogProps> = ({
  isOpen,
  appName,
  elevationLevel,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const levelName =
    elevationLevel === 'trustedinstaller'
      ? 'TrustedInstaller (Самые высокие права / Рекорд по правам)'
      : elevationLevel === 'system'
      ? 'СИСТЕМА (NT AUTHORITY\\SYSTEM)'
      : 'Администратор (Запуск с повышенными правами)';

  const levelColor =
    elevationLevel === 'trustedinstaller'
      ? 'text-amber-500'
      : elevationLevel === 'system'
      ? 'text-purple-500'
      : 'text-blue-500';

  const handleYes = () => {
    playSound('hardware', 0.6);
    onConfirm();
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onCancel();
        }
      }}
      className="fixed inset-0 z-[9999] bg-black/75 flex items-center justify-center p-4 win-acrylic select-none animate-in fade-in zoom-in-95 duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        className="w-full max-w-lg rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 shadow-2xl overflow-hidden text-zinc-900 dark:text-zinc-100 font-sans"
      >
        {/* Blue UAC Header Banner */}
        <div className="bg-[#0078d4] text-white p-5 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
            <ShieldCheck size={26} className="text-white fill-white/20" />
          </div>
          <div>
            <h2 className="text-base font-semibold">Контроль учетных записей (UAC)</h2>
            <p className="text-xs text-blue-100 mt-0.5">
              Разрешить этому приложению вносить изменения на вашем устройстве с повышенными привилегиями?
            </p>
          </div>
        </div>

        {/* Details Section */}
        <div className="p-6 space-y-4">
          <div>
            <div className="text-lg font-bold text-zinc-900 dark:text-zinc-50">{appName}</div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
              Проверенный издатель: <strong>Microsoft Windows Component Publisher</strong>
            </div>
          </div>

          {/* Elevation Level Box */}
          <div className="p-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 space-y-1">
            <div className="text-[11px] text-zinc-400">Запрашиваемый уровень прав:</div>
            <div className={`text-xs font-bold ${levelColor} flex items-center gap-1.5`}>
              <Shield size={14} />
              <span>{levelName}</span>
            </div>
            {elevationLevel === 'trustedinstaller' && (
              <div className="text-[10px] text-amber-600 dark:text-amber-400 pt-1 leading-snug">
                Внимание: Запуск с правами TrustedInstaller позволяет обходить все блокировки и изменять защищенные системные файлы.
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="h-16 px-6 bg-zinc-50 dark:bg-zinc-950/60 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-end gap-3">
          <button
            onClick={handleYes}
            className="w-28 py-2 rounded-lg bg-[#0078d4] hover:bg-blue-600 text-white font-semibold text-xs shadow-md transition-colors cursor-pointer"
          >
            Да
          </button>
          <button
            onClick={onCancel}
            className="w-28 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-xs font-medium transition-colors cursor-pointer"
          >
            Нет
          </button>
        </div>
      </div>
    </div>
  );
};
